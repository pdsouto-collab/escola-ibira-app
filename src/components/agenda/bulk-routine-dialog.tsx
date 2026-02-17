import { useState } from "react";
import { format, eachDayOfInterval, isSameDay } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Plus, Trash2, Edit, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScheduleItem } from "@/lib/data";
import { useAppStore } from "@/lib/store";

interface BulkRoutineDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultClassId?: string;
}

const WEEKDAYS = [
    { id: 1, label: "Seg" },
    { id: 2, label: "Ter" },
    { id: 3, label: "Qua" },
    { id: 4, label: "Qui" },
    { id: 5, label: "Sex" },
    { id: 6, label: "Sáb" },
    { id: 0, label: "Dom" },
];

const ITEM_TYPES = [
    { value: "activity", label: "Atividade" },
    { value: "meal", label: "Refeição" },
    { value: "care", label: "Cuidado/Sono" },
];

export function BulkRoutineDialog({ open, onOpenChange, defaultClassId }: BulkRoutineDialogProps) {
    const { schedule, updateSchedule } = useAppStore();

    const [activeTab, setActiveTab] = useState("create");
    const [classId, setClassId] = useState<string>(defaultClassId || "");
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri default
    const [isProcessing, setIsProcessing] = useState(false);

    // Create Tab State
    const [templateItems, setTemplateItems] = useState<Omit<ScheduleItem, "id" | "date" | "classId">[]>([
        { time: "08:00", endTime: "09:00", title: "Chegada", type: "care", description: "" }
    ]);

    // Edit/Delete Match Criteria
    const [matchTitle, setMatchTitle] = useState("");
    const [matchTime, setMatchTime] = useState("");

    // Edit New Values
    const [newTime, setNewTime] = useState("");
    const [newEndTime, setNewEndTime] = useState("");
    const [newTitle, setNewTitle] = useState("");
    const [newType, setNewType] = useState<"activity" | "meal" | "care" | "">("");
    const [newDescription, setNewDescription] = useState("");

    const handleAddTemplateItem = () => {
        setTemplateItems([...templateItems, { time: "09:00", endTime: "10:00", title: "", type: "activity", description: "" }]);
    };

    const handleRemoveTemplateItem = (index: number) => {
        setTemplateItems(templateItems.filter((_, i) => i !== index));
    };

    const handleUpdateTemplateItem = (index: number, field: keyof ScheduleItem, value: any) => {
        const newItems = [...templateItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setTemplateItems(newItems);
    };

    const toggleWeekday = (dayId: number) => {
        setSelectedWeekdays(prev =>
            prev.includes(dayId)
                ? prev.filter(d => d !== dayId)
                : [...prev, dayId]
        );
    };

    const getTargetItems = () => {
        if (!classId || !startDate || !endDate) return [];

        const interval = eachDayOfInterval({ start: startDate, end: endDate });

        return schedule.filter(item => {
            if (item.classId !== classId) return false;

            const itemDate = new Date(item.date + "T12:00:00");
            const isInDateRange = interval.some(date => isSameDay(date, itemDate));
            if (!isInDateRange) return false;

            const dayOfWeek = itemDate.getDay();
            if (!selectedWeekdays.includes(dayOfWeek)) return false;

            if (matchTitle && !item.title.toLowerCase().includes(matchTitle.toLowerCase())) return false;
            if (matchTime && item.time !== matchTime) return false;

            return true;
        });
    };

    const handleCreate = async () => {
        if (!classId || !startDate || !endDate || templateItems.length === 0) return;
        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 500));

        const interval = eachDayOfInterval({ start: startDate, end: endDate });
        const newItems: ScheduleItem[] = [];

        interval.forEach(date => {
            const dayOfWeek = date.getDay();
            if (selectedWeekdays.includes(dayOfWeek)) {
                const dateStr = format(date, "yyyy-MM-dd");
                templateItems.forEach(template => {
                    newItems.push({
                        ...template,
                        id: Math.random().toString(36).substr(2, 9),
                        date: dateStr,
                        classId: classId
                    });
                });
            }
        });

        updateSchedule([...schedule, ...newItems]);
        handleClose();
    };

    const handleEdit = async () => {
        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 500));

        const targets = getTargetItems();
        const targetIds = new Set(targets.map(t => t.id));

        const updatedSchedule = schedule.map(item => {
            if (targetIds.has(item.id)) {
                return {
                    ...item,
                    time: newTime || item.time,
                    endTime: newEndTime || item.endTime,
                    title: newTitle || item.title,
                    type: newType || item.type,
                    description: newDescription || item.description
                };
            }
            return item;
        });

        updateSchedule(updatedSchedule);
        handleClose();
    };

    const handleDelete = async () => {
        if (!confirm("Tem certeza que deseja excluir os itens selecionados? Esta ação não pode ser desfeita.")) return;

        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 500));

        const targets = getTargetItems();
        const targetIds = new Set(targets.map(t => t.id));

        const updatedSchedule = schedule.filter(item => !targetIds.has(item.id));
        updateSchedule(updatedSchedule);
        handleClose();
    };

    const handleClose = () => {
        setIsProcessing(false);
        onOpenChange(false);
        setStartDate(undefined);
        setEndDate(undefined);
        setMatchTitle("");
        setMatchTime("");
        setNewTime("");
        setNewEndTime("");
        setNewTitle("");
        setNewType("");
        setNewDescription("");
    };

    const previewCount = getTargetItems().length;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Gerenciamento de Rotina em Massa</DialogTitle>
                    <DialogDescription>
                        Crie, edite ou remova itens da rotina para múltiplas datas.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="create">Criar</TabsTrigger>
                        <TabsTrigger value="edit">Editar</TabsTrigger>
                        <TabsTrigger value="delete">Excluir</TabsTrigger>
                    </TabsList>

                    <div className="grid gap-6 py-4">
                        {/* Common Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border">
                            <div className="grid gap-2">
                                <Label>Turma</Label>
                                <Select value={classId} onValueChange={setClassId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a turma" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="jardim-i">Jardim I</SelectItem>
                                        <SelectItem value="jardim-ii">Jardim II</SelectItem>
                                        <SelectItem value="maternal-i">Maternal I</SelectItem>
                                        <SelectItem value="maternal-ii">Maternal II</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Período</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="date"
                                        value={startDate ? format(startDate, "yyyy-MM-dd") : ""}
                                        onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value + "T12:00:00") : undefined)}
                                    />
                                    <Input
                                        type="date"
                                        value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
                                        onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value + "T12:00:00") : undefined)}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2 md:col-span-2">
                                <Label>Dias da Semana</Label>
                                <div className="flex flex-wrap gap-2">
                                    {WEEKDAYS.map(day => (
                                        <div key={day.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`day-${day.id}`}
                                                checked={selectedWeekdays.includes(day.id)}
                                                onCheckedChange={() => toggleWeekday(day.id)}
                                            />
                                            <label htmlFor={`day-${day.id}`} className="text-sm cursor-pointer select-none">
                                                {day.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <TabsContent value="create" className="space-y-4">
                            <div className="space-y-4 border-t pt-4">
                                <div className="flex items-center justify-between">
                                    <Label>Itens da Rotina Padrão</Label>
                                    <Button size="sm" variant="outline" onClick={handleAddTemplateItem}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Adicionar Item
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {templateItems.map((item, index) => (
                                        <div key={index} className="flex gap-2 items-start bg-slate-50 p-3 rounded-md border">
                                            <div className="grid gap-2 flex-1">
                                                <div className="flex gap-2">
                                                    <Input
                                                        type="time"
                                                        value={item.time}
                                                        onChange={(e) => handleUpdateTemplateItem(index, 'time', e.target.value)}
                                                        className="w-24"
                                                    />
                                                    <Input
                                                        type="time"
                                                        value={item.endTime || ""}
                                                        onChange={(e) => handleUpdateTemplateItem(index, 'endTime', e.target.value)}
                                                        className="w-24"
                                                    />
                                                    <Select
                                                        value={item.type}
                                                        onValueChange={(value) => handleUpdateTemplateItem(index, 'type', value)}
                                                    >
                                                        <SelectTrigger className="w-32">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {ITEM_TYPES.map(t => (
                                                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Input
                                                        value={item.title}
                                                        onChange={(e) => handleUpdateTemplateItem(index, 'title', e.target.value)}
                                                        placeholder="Título"
                                                        className="flex-1"
                                                    />
                                                </div>
                                                <Input
                                                    value={item.description || ""}
                                                    onChange={(e) => handleUpdateTemplateItem(index, 'description', e.target.value)}
                                                    placeholder="Descrição (opcional)"
                                                />
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-slate-400 hover:text-red-500"
                                                onClick={() => handleRemoveTemplateItem(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                                <Button onClick={handleCreate} disabled={isProcessing || !classId || !startDate || !endDate}>
                                    {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Gerar Rotinas
                                </Button>
                            </DialogFooter>
                        </TabsContent>

                        <TabsContent value="edit" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                                <div>
                                    <Label className="mb-2 block">1. Filtrar Itens Específicos (Opcional)</Label>
                                    <div className="space-y-2 bg-yellow-50 p-3 rounded-md border border-yellow-100">
                                        <div className="grid gap-2">
                                            <Label>Título contém:</Label>
                                            <Input
                                                value={matchTitle}
                                                onChange={(e) => setMatchTitle(e.target.value)}
                                                placeholder="Ex: Lanche"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Horário exato:</Label>
                                            <Input
                                                type="time"
                                                value={matchTime}
                                                onChange={(e) => setMatchTime(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <Label className="mb-2 block">2. Novos Valores (Preencha para alterar)</Label>
                                    <div className="space-y-2 bg-blue-50 p-3 rounded-md border border-blue-100">
                                        <div className="flex gap-2">
                                            <Input
                                                type="time"
                                                value={newTime}
                                                onChange={(e) => setNewTime(e.target.value)}
                                                className="w-24"
                                                placeholder="Início"
                                            />
                                            <Input
                                                type="time"
                                                value={newEndTime}
                                                onChange={(e) => setNewEndTime(e.target.value)}
                                                className="w-24"
                                                placeholder="Fim"
                                            />
                                            <Select value={newType} onValueChange={(v: any) => setNewType(v)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Tipo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ITEM_TYPES.map(t => (
                                                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Input
                                            value={newTitle}
                                            onChange={(e) => setNewTitle(e.target.value)}
                                            placeholder="Novo Título"
                                        />
                                        <Input
                                            value={newDescription}
                                            onChange={(e) => setNewDescription(e.target.value)}
                                            placeholder="Nova Descrição"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-100 p-3 rounded-md text-sm text-center text-slate-600">
                                {previewCount > 0
                                    ? <span>{previewCount} item(s) serão atualizados.</span>
                                    : <span>Nenhum item encontrado com os filtros atuais.</span>
                                }
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                                <Button onClick={handleEdit} disabled={isProcessing || previewCount === 0} className="bg-blue-600 hover:bg-blue-700">
                                    {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Atualizar Itens
                                </Button>
                            </DialogFooter>
                        </TabsContent>

                        <TabsContent value="delete" className="space-y-4">
                            <div className="grid gap-4 border-t pt-4">
                                <Label className="mb-2 block">Filtrar Itens para Exclusão (Opcional)</Label>
                                <div className="space-y-2 bg-red-50 p-3 rounded-md border border-red-100">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Título contém:</Label>
                                            <Input
                                                value={matchTitle}
                                                onChange={(e) => setMatchTitle(e.target.value)}
                                                placeholder="Ex: Lanche"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Horário exato:</Label>
                                            <Input
                                                type="time"
                                                value={matchTime}
                                                onChange={(e) => setMatchTime(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-100 p-3 rounded-md text-sm text-center text-slate-600">
                                    {previewCount > 0
                                        ? <span className="text-red-600 font-medium">{previewCount} item(s) serão excluídos permanentemente.</span>
                                        : <span>Nenhum item encontrado com os filtros atuais.</span>
                                    }
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                                <Button onClick={handleDelete} disabled={isProcessing || previewCount === 0} variant="destructive">
                                    {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Excluir Itens
                                </Button>
                            </DialogFooter>
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
