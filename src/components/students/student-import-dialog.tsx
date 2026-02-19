import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, AlertCircle, Check, FileText } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Student } from "@/lib/data"; // Fix import source
import { ScrollArea } from "@/components/ui/scroll-area";
// import { useToast } from "@/components/ui/use-toast"; // Comment out unused toast for now or implement if needed

interface StudentImportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onImport: (students: Student[]) => void;
}

export function StudentImportDialog({ open, onOpenChange, onImport }: StudentImportDialogProps) {
    const { classes } = useAppStore();
    // const { toast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [parsedStudents, setParsedStudents] = useState<Partial<Student>[]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            if (lines.length < 2) return; // Header + 1 row

            // Simple CSV parser (doesn't handle quoted newlines, but enough for Google Forms export usually)
            const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

            const students: Partial<Student>[] = [];

            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                // Handle basic CSV splitting, respecting quotes if possible or just simple split for now
                // Google forms usually quotes fields only if they contain commas
                // A regex split is safer: 
                const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
                // Fallback to simple split if regex fails or for simple cases (matches most basic CSVs)
                const row = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));

                if (row.length < 3) continue; // Skip invalid rows

                const student: any = {
                    id: Math.random().toString(36).substr(2, 9),
                    active: true,
                    enrollmentDate: new Date().toISOString().split('T')[0],
                    attendance: 0
                };

                // Map Headers to Fields
                // "Nome do Aluno", "Data de Nascimento", "Turma"
                headers.forEach((header, index) => {
                    const value = row[index];
                    const h = header.toLowerCase();

                    if (h.includes("nome do aluno") || h.includes("nome completo")) {
                        student.name = value;
                    } else if (h.includes("nascimento")) {
                        student.dateOfBirth = value; // Ideally format to YYYY-MM-DD
                    } else if (h.includes("turma")) {
                        // Find class ID by name
                        const matchedClass = classes.find(c => c.name.toLowerCase() === value.toLowerCase());
                        student.classId = matchedClass ? matchedClass.id : "";
                        student.classNameRaw = value; // Store for preview if no match
                    } else if (h.includes("responsável") && !h.includes("contato")) {
                        student.guardianName = value;
                    } else if (h.includes("contato")) {
                        student.guardianContact = value;
                    } else if (h.includes("restrições") || h.includes("alergia")) {
                        student.allergies = value;
                    }
                });

                if (student.name) {
                    students.push(student as Student);
                }
            }

            setParsedStudents(students);
            setPreviewOpen(true);
        };
        reader.readAsText(file);
    };

    const handleConfirmImport = () => {
        // Filter out invalid students if necessary, or just import all valid ones
        const validStudents = parsedStudents.filter(s => s.name && s.classId) as Student[];

        if (validStudents.length === 0) {
            alert("Nenhum aluno válido encontrado para importar. Verifique se as turmas correspondem.");
            return;
        }

        onImport(validStudents);
        setFile(null);
        setParsedStudents([]);
        setPreviewOpen(false);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Importar Alunos via CSV</DialogTitle>
                    <DialogDescription>
                        Importe uma planilha do Google Forms ou Excel (formato .csv).
                        As colunas esperadas são: Nome do Aluno, Data de Nascimento, Turma, Nome do Responsável.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {!file ? (
                        <div
                            className="border-2 border-dashed border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="bg-primary/10 p-4 rounded-full mb-4">
                                <Upload className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-1">Clique para selecionar o arquivo</h3>
                            <p className="text-sm text-slate-500">Suporta arquivos .CSV</p>
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
                                                <TableHead>Nome</TableHead>
                                                <TableHead>Turma Detectada</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {parsedStudents.map((student, i) => (
                                                <TableRow key={i}>
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
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleConfirmImport} disabled={!file || parsedStudents.length === 0}>
                        Importar Alunos
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
