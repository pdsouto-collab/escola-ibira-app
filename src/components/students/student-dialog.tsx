"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { Student } from "@/types/student";
import { StudentGuardian } from "@/types/student-guardian";
import { StudentEmergencyContact } from "@/types/student-emergency-contact";
import { StudentFinancialResponsible } from "@/types/student-financial-responsible";
import { StudentHealth } from "@/types/student-health";
import { StudentDocuments } from "@/types/student-documents";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { SchoolClass } from "@/types/school-class";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Upload, AlertCircle, Check, FileText, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface StudentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    student?: Student | null;
    classes: SchoolClass[];
    onSave: (student: Student) => void;
}

const emptyStudent: Omit<Student, "id"> = {
    name: "",
    age: 0,
    dateOfBirth: "",
    status: "presente",
    parentName: "",
    classId: "",
    guardians: [{ name: "", kinship: "", phone: "" }],
    emergencyContacts: [{ name: "", kinship: "", phone: "" }],
    financialResponsible: { name: "", phone: "", cpf: "", address: "", email: "" },
    health: {
        hasChronicIssue: false, hasAllergy: false, hasDietaryRestriction: false, hasHealthInsurance: false
    }
};

export function StudentDialog({ open, onOpenChange, student, classes, onSave }: StudentDialogProps) {
    const [formData, setFormData] = useState<Partial<Student>>(student ? { ...student } : emptyStudent);
    const [activeTab, setActiveTab] = useState("manual");

    // Import State
    const [file, setFile] = useState<File | null>(null);
    const [parsedStudents, setParsedStudents] = useState<Partial<Student>[]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (student) {
            setFormData({ ...student });
        } else {
            setFormData(JSON.parse(JSON.stringify(emptyStudent))); // Deep copy
        }
        setFile(null);
        setParsedStudents([]);
        setSelectedIndices(new Set());
        setPreviewOpen(false);
    }, [student, open]);

    // --- Manual Entry Helpers ---

    const updateGuardian = (index: number, field: keyof StudentGuardian, value: string) => {
        const newGuardians = [...(formData.guardians || [])];
        if (!newGuardians[index]) newGuardians[index] = { name: "", kinship: "", phone: "" };
        newGuardians[index] = { ...newGuardians[index], [field]: value };
        setFormData({ ...formData, guardians: newGuardians });
    };

    const updateFinancial = (field: keyof StudentFinancialResponsible, value: string) => {
        setFormData({ ...formData, financialResponsible: { ...formData.financialResponsible, [field]: value } as StudentFinancialResponsible });
    };

    const updateHealth = (field: keyof StudentHealth, value: any) => {
        setFormData({ ...formData, health: { ...formData.health, [field]: value } as StudentHealth });
    };

    const updateEmergency = (index: number, field: keyof StudentEmergencyContact, value: string) => {
        const newContacts = [...(formData.emergencyContacts || [])];
        if (!newContacts[index]) newContacts[index] = { name: "", kinship: "", phone: "" };
        newContacts[index] = { ...newContacts[index], [field]: value };
        setFormData({ ...formData, emergencyContacts: newContacts });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Calculate age from DOB if present
        let age = formData.age || 0;
        if (formData.dateOfBirth) {
            const birthDate = new Date(formData.dateOfBirth);
            const difference = Date.now() - birthDate.getTime();
            const ageDate = new Date(difference);
            age = Math.abs(ageDate.getUTCFullYear() - 1970);
        }

        onSave({
            id: student?.id || crypto.randomUUID(),
            ...formData,
            age,
            parentName: formData.guardians?.[0]?.name || formData.parentName || "Responsável"
        } as Student);
        onOpenChange(false);
    };

    // --- Import Logic ---

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            parseCSV(e.target.files[0]);
        }
    };

    const parseCSV = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            if (!text) return;

            const rows = parseCSVString(text);
            if (rows.length < 2) return;

            // Helper to normalize headers for comparison (remove accents, lowercase)
            const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            const rawHeaders = rows[0];
            const headers = rawHeaders.map(h => normalize(h.trim().replace(/^"|"$/g, '')));

            const students: Partial<Student>[] = [];

            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                if (row.length < 5) continue; // Skip empty/too short rows

                const newStudent: any = {
                    id: crypto.randomUUID(),
                    status: 'presente',
                    active: true,
                    guardians: [],
                    health: {},
                    financialResponsible: {},
                    emergencyContacts: []
                };

                // Temporary variables
                let g1: Partial<StudentGuardian> = { kinship: "Responsável" };
                let g2: Partial<StudentGuardian> = { kinship: "Responsável" };
                let fin: any = {};
                let em1: Partial<StudentEmergencyContact> = {};
                let em2: Partial<StudentEmergencyContact> = {};

                const getValue = (idx: number) => (row[idx] || "").trim();

                // 1. STUDENT
                newStudent.name = getValue(1);
                const dob = getValue(2);
                if (dob) {
                    if (dob.includes('/')) {
                        const [d, m, y] = dob.split('/');
                        newStudent.dateOfBirth = `${y}-${m}-${d}`;
                    } else {
                        newStudent.dateOfBirth = dob;
                    }
                }
                newStudent.document = getValue(3);

                const className = getValue(4);
                if (className) {
                    const matchedClass = classes.find(c =>
                        className.toLowerCase().includes(c.name.toLowerCase()) ||
                        c.name.toLowerCase().includes(className.toLowerCase())
                    );
                    if (matchedClass) {
                        newStudent.classId = matchedClass.id;
                    }
                    newStudent.classNameRaw = className;
                }
                newStudent.period = getValue(5).toLowerCase().includes('matutino') ? 'matutino' : 'integral';

                // 2. GUARDIAN 1
                const g1Name = getValue(6);
                if (g1Name) {
                    g1.name = g1Name;
                    g1.cpf = getValue(7);
                    g1.kinship = getValue(8) || "Responsável";
                    g1.phone = getValue(9);
                    g1.address = getValue(10);
                    g1.email = getValue(11);
                }

                // 3. GUARDIAN 2
                const g2Name = getValue(12);
                if (g2Name) {
                    g2.name = g2Name;
                    g2.cpf = getValue(13);
                    g2.kinship = getValue(14) || "Responsável";
                    g2.phone = getValue(15);
                    g2.address = getValue(16);
                    g2.email = getValue(17);
                }

                // 4. FINANCIAL
                const finName = getValue(18);
                if (finName) {
                    fin.name = finName;
                    fin.phone = getValue(19);
                    fin.cpf = getValue(20);
                    // Fix typo in header value assumption by setting it regardless
                    fin.address = getValue(21);
                    fin.email = getValue(22);
                }

                // 5. HEALTH
                newStudent.health.hasChronicIssue = getValue(23).toLowerCase().includes('sim');
                newStudent.health.chronicIssueDetail = getValue(24);

                newStudent.health.hasAllergy = getValue(25).toLowerCase().includes('sim');
                newStudent.health.allergyDetail = getValue(26);

                newStudent.health.hasDietaryRestriction = getValue(27).toLowerCase().includes('sim');
                newStudent.health.dietaryRestrictionDetail = getValue(28);

                newStudent.health.emergencyAction = getValue(29);
                newStudent.health.feverProcedure = getValue(30);
                newStudent.health.pediatricianName = getValue(31);
                newStudent.health.pediatricianPhone = getValue(32);

                newStudent.health.hasHealthInsurance = getValue(33).toLowerCase().includes('sim');
                newStudent.health.healthInsuranceDetail = getValue(34);
                newStudent.health.otherInfo = getValue(35);

                // 6. EMERGENCY 1
                const em1Name = getValue(36);
                if (em1Name) {
                    em1.name = em1Name;
                    em1.kinship = getValue(37);
                    em1.phone = getValue(38);
                }

                // 7. EMERGENCY 2
                const em2Name = getValue(39);
                if (em2Name) {
                    em2.name = em2Name;
                    em2.kinship = getValue(40);
                    em2.phone = getValue(41);
                }

                // 8. HOSPITAL
                newStudent.hospitalPreference = getValue(42);
                newStudent.hospitalAddress = getValue(43);

                // Post-processing
                if (g1.name) newStudent.guardians.push(g1);
                if (g2.name) newStudent.guardians.push(g2);
                if (g1.name) newStudent.parentName = g1.name;

                if (fin.name) newStudent.financialResponsible = fin;
                if (em1.name) newStudent.emergencyContacts.push(em1);
                if (em2.name) newStudent.emergencyContacts.push(em2);

                if (newStudent.name && newStudent.name.length > 2) {
                    students.push(newStudent);
                }
            }

            setParsedStudents(students);
            // Select all valid students by default
            const validIndices = students.map((_, i) => i).filter(i => students[i].name && students[i].classId);
            setSelectedIndices(new Set(validIndices));
            setPreviewOpen(true);
        };
        reader.readAsText(file);
    };

    const toggleSelection = (index: number) => {
        const newSelected = new Set(selectedIndices);
        if (newSelected.has(index)) {
            newSelected.delete(index);
        } else {
            newSelected.add(index);
        }
        setSelectedIndices(newSelected);
    };

    const toggleAll = () => {
        if (selectedIndices.size === parsedStudents.length) {
            setSelectedIndices(new Set());
        } else {
            setSelectedIndices(new Set(parsedStudents.map((_, i) => i)));
        }
    };

    const handleConfirmImport = () => {
        const studentsToImport = parsedStudents.filter((_, i) => selectedIndices.has(i)) as Student[];

        if (studentsToImport.length === 0) {
            toast.error("Nenhum aluno selecionado.");
            return;
        }

        studentsToImport.forEach(s => onSave(s));

        onOpenChange(false);
        setFile(null);
        setParsedStudents([]);
        setSelectedIndices(new Set());
        toast.success(`${studentsToImport.length} alunos importados!`);
    };


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{student ? "Editar Aluno" : "Adicionar Novo Aluno"}</DialogTitle>
                    <DialogDescription>
                        {student ? "Edite os dados do aluno." : "Escolha entre entrada manual ou importação."}
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="manual">Entrada Manual</TabsTrigger>
                        <TabsTrigger value="import">Importar Planilha</TabsTrigger>
                    </TabsList>

                    {/* --- MANUAL FORM --- */}
                    <TabsContent value="manual" className="space-y-6 py-4">
                        <form id="manual-form" onSubmit={handleSubmit} className="space-y-8">

                            {/* 1. Dados da Criança */}
                            <div className="space-y-4 border-b pb-6">
                                <h3 className="text-lg font-medium text-slate-900">1. Dados da Criança</h3>
                                <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-6">
                                    {/* Photo Upload */}
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center">
                                            {formData.photo ? (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img
                                                    src={formData.photo}
                                                    alt="Foto do aluno"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <Users className="h-10 w-10 text-slate-400" />
                                            )}
                                        </div>
                                        <div className="flex flex-col items-center w-full">
                                            <Label htmlFor="photo-upload" className="cursor-pointer text-xs text-primary font-medium hover:underline">
                                                Alterar foto
                                            </Label>
                                            <Input
                                                id="photo-upload"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setFormData({ ...formData, photo: reader.result as string });
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Basic Info Fields */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2 col-span-2">
                                            <Label>Nome Completo</Label>
                                            <Input value={formData.name || ""} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Data de Nascimento</Label>
                                            <Input type="date" value={formData.dateOfBirth || ""} onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Documento (CPF/RG/Certidão)</Label>
                                            <Input value={formData.document || ""} onChange={e => setFormData({ ...formData, document: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Turma</Label>
                                            <Select value={formData.classId} onValueChange={v => setFormData({ ...formData, classId: v })}>
                                                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                                <SelectContent>
                                                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Período</Label>
                                            <Select value={formData.period} onValueChange={(v: any) => setFormData({ ...formData, period: v })}>
                                                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="integral">Integral (08h30 - 15h30)</SelectItem>
                                                    <SelectItem value="matutino">Matutino (08h30 - 12h30)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Responsáveis */}
                            <div className="space-y-4 border-b pb-6">
                                <h3 className="text-lg font-medium text-slate-900">2. Dados dos Responsáveis</h3>
                                {/* Responsável 1 */}
                                <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                                    <h4 className="font-medium text-sm text-slate-700">Responsável 1 (Principal)</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="col-span-2 space-y-1"><Label className="text-xs">Nome</Label><Input value={formData.guardians?.[0]?.name || ""} onChange={e => updateGuardian(0, 'name', e.target.value)} /></div>
                                        <div className="space-y-1"><Label className="text-xs">CPF</Label><Input value={formData.guardians?.[0]?.cpf || ""} onChange={e => updateGuardian(0, 'cpf', e.target.value)} /></div>
                                        <div className="space-y-1"><Label className="text-xs">Parentesco</Label><Input value={formData.guardians?.[0]?.kinship || ""} onChange={e => updateGuardian(0, 'kinship', e.target.value)} /></div>
                                        <div className="space-y-1"><Label className="text-xs">Telefone</Label><Input value={formData.guardians?.[0]?.phone || ""} onChange={e => updateGuardian(0, 'phone', e.target.value)} /></div>
                                        <div className="space-y-1"><Label className="text-xs">Email</Label><Input value={formData.guardians?.[0]?.email || ""} onChange={e => updateGuardian(0, 'email', e.target.value)} /></div>
                                        <div className="col-span-2 space-y-1"><Label className="text-xs">Endereço Residencial</Label><Input value={formData.guardians?.[0]?.address || ""} onChange={e => updateGuardian(0, 'address', e.target.value)} /></div>
                                    </div>
                                </div>
                                {/* Responsável 2 */}
                                <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                                    <h4 className="font-medium text-sm text-slate-700">Responsável 2</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="col-span-2 space-y-1"><Label className="text-xs">Nome</Label><Input value={formData.guardians?.[1]?.name || ""} onChange={e => updateGuardian(1, 'name', e.target.value)} /></div>
                                        <div className="space-y-1"><Label className="text-xs">CPF</Label><Input value={formData.guardians?.[1]?.cpf || ""} onChange={e => updateGuardian(1, 'cpf', e.target.value)} /></div>
                                        <div className="space-y-1"><Label className="text-xs">Parentesco</Label><Input value={formData.guardians?.[1]?.kinship || ""} onChange={e => updateGuardian(1, 'kinship', e.target.value)} /></div>
                                        <div className="space-y-1"><Label className="text-xs">Telefone</Label><Input value={formData.guardians?.[1]?.phone || ""} onChange={e => updateGuardian(1, 'phone', e.target.value)} /></div>
                                        <div className="space-y-1"><Label className="text-xs">Email</Label><Input value={formData.guardians?.[1]?.email || ""} onChange={e => updateGuardian(1, 'email', e.target.value)} /></div>
                                        <div className="col-span-2 space-y-1"><Label className="text-xs">Endereço Residencial</Label><Input value={formData.guardians?.[1]?.address || ""} onChange={e => updateGuardian(1, 'address', e.target.value)} /></div>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Financeiro */}
                            <div className="space-y-4 border-b pb-6">
                                <h3 className="text-lg font-medium text-slate-900">3. Responsável Financeiro</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 space-y-1"><Label className="text-xs">Nome</Label><Input value={formData.financialResponsible?.name || ""} onChange={e => updateFinancial('name', e.target.value)} /></div>
                                    <div className="space-y-1"><Label className="text-xs">Telefone</Label><Input value={formData.financialResponsible?.phone || ""} onChange={e => updateFinancial('phone', e.target.value)} /></div>
                                    <div className="space-y-1"><Label className="text-xs">CPF</Label><Input value={formData.financialResponsible?.cpf || ""} onChange={e => updateFinancial('cpf', e.target.value)} /></div>
                                    <div className="col-span-2 space-y-1"><Label className="text-xs">Endereço Residencial</Label><Input value={formData.financialResponsible?.address || ""} onChange={e => updateFinancial('address', e.target.value)} /></div>
                                    <div className="col-span-2 space-y-1"><Label className="text-xs">E-mail</Label><Input value={formData.financialResponsible?.email || ""} onChange={e => updateFinancial('email', e.target.value)} /></div>
                                </div>
                            </div>

                            {/* 4. Saúde */}
                            <div className="space-y-4 border-b pb-6">
                                <h3 className="text-lg font-medium text-slate-900">4. Dados de Saúde</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label>Apresenta algum problema de saúde crônico?</Label>
                                        <Switch checked={formData.health?.hasChronicIssue} onCheckedChange={v => updateHealth('hasChronicIssue', v)} />
                                    </div>
                                    {formData.health?.hasChronicIssue && (
                                        <div className="ml-4 space-y-2"><Label className="text-xs text-slate-500">Qual?</Label><Input value={formData.health?.chronicIssueDetail || ""} onChange={e => updateHealth('chronicIssueDetail', e.target.value)} /></div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <Label>Tem alguma alergia?</Label>
                                        <Switch checked={formData.health?.hasAllergy} onCheckedChange={v => updateHealth('hasAllergy', v)} />
                                    </div>
                                    {formData.health?.hasAllergy && (
                                        <div className="ml-4 space-y-2"><Label className="text-xs text-slate-500">Qual?</Label><Input value={formData.health?.allergyDetail || ""} onChange={e => updateHealth('allergyDetail', e.target.value)} /></div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <Label>Tem alguma restrição alimentar?</Label>
                                        <Switch checked={formData.health?.hasDietaryRestriction} onCheckedChange={v => updateHealth('hasDietaryRestriction', v)} />
                                    </div>
                                    {formData.health?.hasDietaryRestriction && (
                                        <div className="ml-4 space-y-2"><Label className="text-xs text-slate-500">Qual?</Label><Input value={formData.health?.dietaryRestrictionDetail || ""} onChange={e => updateHealth('dietaryRestrictionDetail', e.target.value)} /></div>
                                    )}

                                    <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
                                        <Label className="text-sm">Em caso de manifestação alérgica, que atitude devemos tomar?</Label>
                                        <Textarea value={formData.health?.emergencyAction || ""} onChange={e => updateHealth('emergencyAction', e.target.value)} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm">Em caso de febre, até a família chegar, qual procedimento deverá ser tomado?</Label>
                                        <Textarea value={formData.health?.feverProcedure || ""} onChange={e => updateHealth('feverProcedure', e.target.value)} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div className="space-y-1"><Label className="text-xs">Nome do Pediatra</Label><Input value={formData.health?.pediatricianName || ""} onChange={e => updateHealth('pediatricianName', e.target.value)} /></div>
                                        <div className="space-y-1"><Label className="text-xs">Telefone do Pediatra</Label><Input value={formData.health?.pediatricianPhone || ""} onChange={e => updateHealth('pediatricianPhone', e.target.value)} /></div>
                                    </div>

                                    <div className="flex items-center justify-between mt-4 border-t border-slate-100 pt-4">
                                        <Label>A família possui plano de saúde?</Label>
                                        <Switch checked={formData.health?.hasHealthInsurance} onCheckedChange={v => updateHealth('hasHealthInsurance', v)} />
                                    </div>
                                    {formData.health?.hasHealthInsurance && (
                                        <div className="space-y-2 ml-4"><Label className="text-xs text-slate-500">Qual?</Label><Input value={formData.health?.healthInsuranceDetail || ""} onChange={e => updateHealth('healthInsuranceDetail', e.target.value)} /></div>
                                    )}

                                    <div className="space-y-2 mt-4">
                                        <Label className="text-sm">Outras informações relevantes?</Label>
                                        <Textarea value={formData.health?.otherInfo || ""} onChange={e => updateHealth('otherInfo', e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            {/* 5. Emergências */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium text-slate-900">5. Emergências</h3>

                                <div className="space-y-4">
                                    <Label className="font-semibold text-slate-700">Em caso de emergência e ausência dos pais, quem deve ser contatado?</Label>

                                    <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                                        <h4 className="font-medium text-sm text-slate-700">Contato 1</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="col-span-2 space-y-1"><Label className="text-xs">Nome</Label><Input value={formData.emergencyContacts?.[0]?.name || ""} onChange={e => updateEmergency(0, 'name', e.target.value)} /></div>
                                            <div className="space-y-1"><Label className="text-xs">Parentesco</Label><Input value={formData.emergencyContacts?.[0]?.kinship || ""} onChange={e => updateEmergency(0, 'kinship', e.target.value)} /></div>
                                            <div className="space-y-1"><Label className="text-xs">Telefone</Label><Input value={formData.emergencyContacts?.[0]?.phone || ""} onChange={e => updateEmergency(0, 'phone', e.target.value)} /></div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                                        <h4 className="font-medium text-sm text-slate-700">Contato 2</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="col-span-2 space-y-1"><Label className="text-xs">Nome</Label><Input value={formData.emergencyContacts?.[1]?.name || ""} onChange={e => updateEmergency(1, 'name', e.target.value)} /></div>
                                            <div className="space-y-1"><Label className="text-xs">Parentesco</Label><Input value={formData.emergencyContacts?.[1]?.kinship || ""} onChange={e => updateEmergency(1, 'kinship', e.target.value)} /></div>
                                            <div className="space-y-1"><Label className="text-xs">Telefone</Label><Input value={formData.emergencyContacts?.[1]?.phone || ""} onChange={e => updateEmergency(1, 'phone', e.target.value)} /></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label className="font-semibold text-slate-700">Em caso de emergência, o aluno deverá ser removido para qual hospital?</Label>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="space-y-1"><Label className="text-xs">Nome do Hospital de Preferência</Label><Input value={formData.hospitalPreference || ""} onChange={e => setFormData({ ...formData, hospitalPreference: e.target.value })} /></div>
                                        <div className="space-y-1"><Label className="text-xs">Endereço do Hospital</Label><Input value={formData.hospitalAddress || ""} onChange={e => setFormData({ ...formData, hospitalAddress: e.target.value })} /></div>
                                    </div>
                                </div>
                            </div>

                        </form>
                    </TabsContent>

                    {/* --- IMPORT FORM --- */}
                    <TabsContent value="import" className="space-y-6 py-4">
                        {!file ? (
                            <div
                                className="border-2 border-dashed border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="bg-primary/10 p-4 rounded-full mb-4">
                                    <Upload className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-1">Clique para selecionar o arquivo</h3>
                                <p className="text-sm text-slate-500">Suporta arquivos .CSV do Google Forms</p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-green-100 p-2 rounded-lg">
                                            <FileText className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">{file.name}</p>
                                            <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setFile(null)}>Trocar arquivo</Button>
                                </div>

                                <div className="rounded-md border">
                                    <div className="bg-slate-50 px-4 py-2 border-b flex justify-between items-center">
                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pré-visualização ({parsedStudents.length} alunos)</span>
                                    </div>
                                    <ScrollArea className="h-[300px]">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[50px]">
                                                        <Checkbox
                                                            checked={parsedStudents.length > 0 && selectedIndices.size === parsedStudents.length}
                                                            onCheckedChange={toggleAll}
                                                        />
                                                    </TableHead>
                                                    <TableHead>Nome</TableHead>
                                                    <TableHead>Turma Detectada</TableHead>
                                                    <TableHead>Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {parsedStudents.map((student, i) => (
                                                    <TableRow key={i} className={selectedIndices.has(i) ? "bg-slate-50" : ""}>
                                                        <TableCell>
                                                            <Checkbox
                                                                checked={selectedIndices.has(i)}
                                                                onCheckedChange={() => toggleSelection(i)}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="font-medium">{student.name}</TableCell>
                                                        <TableCell>
                                                            {student.classId ? (
                                                                <span className="flex items-center gap-2 text-green-600">
                                                                    <Check className="w-3 h-3" />
                                                                    {classes.find(c => c.id === student.classId)?.name}
                                                                </span>
                                                            ) : (
                                                                <span className="flex items-center gap-2 text-amber-500">
                                                                    <AlertCircle className="w-3 h-3" />
                                                                    {/* @ts-ignore */}
                                                                    {student.classNameRaw || "Não identificada"}
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {student.classId ? (
                                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Pronto</span>
                                                            ) : (
                                                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Turma não encontrada</span>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </ScrollArea>
                                </div>
                                <Button onClick={handleConfirmImport} disabled={selectedIndices.size === 0} className="w-full">
                                    Confirmar Importação de {selectedIndices.size} Alunos
                                </Button>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                <DialogFooter className="mt-6">
                    {activeTab === "manual" && (
                        <>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                            <Button type="submit" form="manual-form">Salvar Aluno</Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function parseCSVString(text: string): string[][] {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let insideQuotes = false;

    // Normalize line endings
    const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    for (let i = 0; i < normalizedText.length; i++) {
        const char = normalizedText[i];
        const nextChar = normalizedText[i + 1];

        if (char === '"') {
            if (insideQuotes && nextChar === '"') {
                currentField += '"';
                i++;
            } else {
                insideQuotes = !insideQuotes;
            }
        } else if (char === ',' && !insideQuotes) {
            currentRow.push(currentField);
            currentField = '';
        } else if (char === '\n' && !insideQuotes) {
            currentRow.push(currentField);
            rows.push(currentRow);
            currentRow = [];
            currentField = '';
        } else {
            currentField += char;
        }
    }

    if (currentField || currentRow.length > 0) {
        currentRow.push(currentField);
        rows.push(currentRow);
    }

    return rows;
}
