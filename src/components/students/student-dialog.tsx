"use client";

import { useEffect, useState, useRef } from "react";
import { Student, Guardian, EmergencyContact } from "@/lib/data";
import { useAppStore } from "@/lib/store";
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
import { SchoolClass } from "@/lib/data";
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

export function StudentDialog({ open, onOpenChange, student, onSave }: StudentDialogProps) {
    const { classes, addStudent } = useAppStore();
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

    const updateGuardian = (index: number, field: keyof Guardian, value: string) => {
        const newGuardians = [...(formData.guardians || [])];
        if (!newGuardians[index]) newGuardians[index] = { name: "", kinship: "", phone: "" };
        newGuardians[index] = { ...newGuardians[index], [field]: value };
        setFormData({ ...formData, guardians: newGuardians });
    };

    const updateFinancial = (field: string, value: string) => {
        setFormData({ ...formData, financialResponsible: { ...formData.financialResponsible, [field]: value } as any });
    };

    const updateHealth = (field: string, value: any) => {
        setFormData({ ...formData, health: { ...formData.health, [field]: value } as any });
    };

    const updateEmergency = (index: number, field: keyof EmergencyContact, value: string) => {
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
            const lines = text.split('\n');
            if (lines.length < 2) return;

            const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
            const students: Partial<Student>[] = [];

            for (let i = 1; i < lines.length; i++) {
                const line = lines[i]; // Don't trim yet to preserve empty fields if separated by commas
                if (!line.trim()) continue;

                // Basic CSV split
                const row = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                if (row.length < 3) continue;

                const newStudent: any = {
                    id: crypto.randomUUID(),
                    status: 'presente',
                    active: true,
                    guardians: [],
                    health: {},
                    financialResponsible: {},
                    emergencyContacts: []
                };

                let guardianName = "";
                let guardianPhone = "";

                headers.forEach((header, index) => {
                    const value = row[index];
                    const h = header.toLowerCase();

                    if (h.includes("nome da criança") || h.includes("nome do aluno")) newStudent.name = value;
                    else if (h.includes("nascimento")) newStudent.dateOfBirth = value; // Needs formatting if not YYYY-MM-DD
                    else if (h.includes("turma")) {
                        const matchedClass = classes.find(c => c.name.toLowerCase() === value.toLowerCase());
                        newStudent.classId = matchedClass ? matchedClass.id : "";
                        newStudent.classNameRaw = value;
                    }
                    // Guardian 1
                    else if (h.includes("responsável 1") && h.includes("nome")) guardianName = value;
                    else if (h.includes("responsável 1") && h.includes("telefone")) guardianPhone = value;

                    // Health
                    else if (h.includes("alergia") && h.includes("sim")) newStudent.health.hasAllergy = value.toLowerCase() === 'sim';
                    else if (h.includes("qual alergia")) newStudent.health.allergyDetail = value;
                });

                if (guardianName) {
                    newStudent.guardians.push({ name: guardianName, phone: guardianPhone, kinship: "Responsável" });
                    newStudent.parentName = guardianName;
                }

                if (newStudent.name) students.push(newStudent);
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
            alert("Nenhum aluno selecionado.");
            return;
        }

        studentsToImport.forEach(s => addStudent(s));

        onOpenChange(false);
        setFile(null);
        setParsedStudents([]);
        setSelectedIndices(new Set());
        alert(`${studentsToImport.length} alunos importados!`);
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
                                            <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Data de Nascimento</Label>
                                            <Input type="date" value={formData.dateOfBirth} onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Documento (CPF/RG/Certidão)</Label>
                                            <Input value={formData.document} onChange={e => setFormData({ ...formData, document: e.target.value })} />
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
                                        <Input placeholder="Nome" value={formData.guardians?.[0]?.name} onChange={e => updateGuardian(0, 'name', e.target.value)} />
                                        <Input placeholder="Parentesco" value={formData.guardians?.[0]?.kinship} onChange={e => updateGuardian(0, 'kinship', e.target.value)} />
                                        <Input placeholder="Telefone" value={formData.guardians?.[0]?.phone} onChange={e => updateGuardian(0, 'phone', e.target.value)} />
                                        <Input placeholder="CPF" value={formData.guardians?.[0]?.cpf} onChange={e => updateGuardian(0, 'cpf', e.target.value)} />
                                        <Input placeholder="Email" className="col-span-2" value={formData.guardians?.[0]?.email} onChange={e => updateGuardian(0, 'email', e.target.value)} />
                                    </div>
                                </div>
                                {/* Responsável 2 */}
                                <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                                    <h4 className="font-medium text-sm text-slate-700">Responsável 2</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Input placeholder="Nome" value={formData.guardians?.[1]?.name} onChange={e => updateGuardian(1, 'name', e.target.value)} />
                                        <Input placeholder="Parentesco" value={formData.guardians?.[1]?.kinship} onChange={e => updateGuardian(1, 'kinship', e.target.value)} />
                                        <Input placeholder="Telefone" value={formData.guardians?.[1]?.phone} onChange={e => updateGuardian(1, 'phone', e.target.value)} />
                                        <Input placeholder="Email" className="col-span-2" value={formData.guardians?.[1]?.email} onChange={e => updateGuardian(1, 'email', e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            {/* 3. Financeiro */}
                            <div className="space-y-4 border-b pb-6">
                                <h3 className="text-lg font-medium text-slate-900">3. Responsável Financeiro</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input placeholder="Nome" value={formData.financialResponsible?.name} onChange={e => updateFinancial('name', e.target.value)} />
                                    <Input placeholder="CPF" value={formData.financialResponsible?.cpf} onChange={e => updateFinancial('cpf', e.target.value)} />
                                    <Input placeholder="Telefone" value={formData.financialResponsible?.phone} onChange={e => updateFinancial('phone', e.target.value)} />
                                    <Input placeholder="Endereço" value={formData.financialResponsible?.address} onChange={e => updateFinancial('address', e.target.value)} />
                                </div>
                            </div>

                            {/* 4. Saúde */}
                            <div className="space-y-4 border-b pb-6">
                                <h3 className="text-lg font-medium text-slate-900">4. Dados de Saúde</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label>Possui problema de saúde crônico?</Label>
                                        <Switch checked={formData.health?.hasChronicIssue} onCheckedChange={v => updateHealth('hasChronicIssue', v)} />
                                    </div>
                                    {formData.health?.hasChronicIssue && (
                                        <Input placeholder="Qual?" value={formData.health?.chronicIssueDetail} onChange={e => updateHealth('chronicIssueDetail', e.target.value)} />
                                    )}

                                    <div className="flex items-center justify-between">
                                        <Label>Possui alergia?</Label>
                                        <Switch checked={formData.health?.hasAllergy} onCheckedChange={v => updateHealth('hasAllergy', v)} />
                                    </div>
                                    {formData.health?.hasAllergy && (
                                        <div className="space-y-2">
                                            <Input placeholder="Qual alergia?" value={formData.health?.allergyDetail} onChange={e => updateHealth('allergyDetail', e.target.value)} />
                                            <Textarea placeholder="Em caso de manifestação, o que fazer?" value={formData.health?.emergencyAction} onChange={e => updateHealth('emergencyAction', e.target.value)} />
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <Label>Restrição Alimentar?</Label>
                                        <Switch checked={formData.health?.hasDietaryRestriction} onCheckedChange={v => updateHealth('hasDietaryRestriction', v)} />
                                    </div>
                                    {formData.health?.hasDietaryRestriction && (
                                        <Input placeholder="Qual?" value={formData.health?.dietaryRestrictionDetail} onChange={e => updateHealth('dietaryRestrictionDetail', e.target.value)} />
                                    )}

                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <Input placeholder="Nome do Pediatra" value={formData.health?.pediatricianName} onChange={e => updateHealth('pediatricianName', e.target.value)} />
                                        <Input placeholder="Tel. Pediatra" value={formData.health?.pediatricianPhone} onChange={e => updateHealth('pediatricianPhone', e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            {/* 5. Emergências */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-slate-900">5. Emergências</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 space-y-2">
                                        <Label>Hospital de Preferência</Label>
                                        <Input value={formData.hospitalPreference} onChange={e => setFormData({ ...formData, hospitalPreference: e.target.value })} />
                                    </div>
                                    <div className="col-span-2"><Label>Contatos de Emergência (além dos pais)</Label></div>
                                    <Input placeholder="Nome Contato 1" value={formData.emergencyContacts?.[0]?.name} onChange={e => updateEmergency(0, 'name', e.target.value)} />
                                    <Input placeholder="Telefone Contato 1" value={formData.emergencyContacts?.[0]?.phone} onChange={e => updateEmergency(0, 'phone', e.target.value)} />
                                    <Input placeholder="Nome Contato 2" value={formData.emergencyContacts?.[1]?.name} onChange={e => updateEmergency(1, 'name', e.target.value)} />
                                    <Input placeholder="Telefone Contato 2" value={formData.emergencyContacts?.[1]?.phone} onChange={e => updateEmergency(1, 'phone', e.target.value)} />
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
