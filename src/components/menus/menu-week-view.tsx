"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { format, addDays, startOfWeek, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Menu } from "@/types/menu";
import { menuService } from "@/services/menu.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Utensils, Edit, Copy, ChevronLeft, ChevronRight, Apple, MoreVertical, Calendar, Printer, FileText, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSession } from "next-auth/react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { MenuPrintDialog, DEFAULT_GUIDELINES, MenuGuidelinesData } from "./menu-print-dialog";
import { MenuGuidelinesCard } from "./menu-guidelines-card";


export function MenuWeekView() {
    const { data: session } = useSession();
    const currentUser = session?.user as any;
    const isNutritionist = currentUser?.role === "nutritionist" || currentUser?.role === "admin" || currentUser?.role === "director";

    const [menus, setMenus] = useState<Menu[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [guidelines, setGuidelines] = useState<MenuGuidelinesData>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("menu_nutritional_guidelines");
            if (saved) {
                try { return JSON.parse(saved); } catch (e) {}
            }
        }
        return DEFAULT_GUIDELINES;
    });
    const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);

    const handleUpdateGuidelines = (newG: MenuGuidelinesData) => {
        setGuidelines(newG);
        if (typeof window !== "undefined") {
            localStorage.setItem("menu_nutritional_guidelines", JSON.stringify(newG));
        }
    };

    const loadMenus = async () => {
        try {
            setIsLoading(true);
            const data = await menuService.getMenus();
            setMenus(data);
        } catch (error) {
            toast.error("Erro ao carregar cardápios");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadMenus();
    }, []);

    const [currentDate, setCurrentDate] = useState(new Date());
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday

    const [isEditing, setIsEditing] = useState(false);
    const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
    const [originalMenuSnapshot, setOriginalMenuSnapshot] = useState<string>("");
    const [isConfirmUnsavedOpen, setIsConfirmUnsavedOpen] = useState(false);
    const [editDate, setEditDate] = useState<Date | null>(null);
    const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

    const navigateWeek = (direction: "prev" | "next") => {
        setCurrentDate(addDays(currentDate, direction === "next" ? 7 : -7));
    };

    const getMenuForDate = (date: Date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        return menus.find(m => m.date === dateStr);
    };

    const handleEdit = (menu: Menu | undefined, date: Date) => {
        if (!isNutritionist) return;
        setEditDate(date);
        let initialObj: Menu;
        if (menu) {
            initialObj = JSON.parse(JSON.stringify(menu)); // deep copy
        } else {
            initialObj = {
                id: `menu-${Date.now()}`,
                date: format(date, "yyyy-MM-dd"),
                items: [
                    { time: "09:30", title: "Lanche da Manhã", description: "" },
                    { time: "11:30", title: "Almoço", description: "" },
                    { time: "15:00", title: "Lanche da Tarde", description: "" }
                ]
            };
        }
        setEditingMenu(initialObj);
        setOriginalMenuSnapshot(JSON.stringify(initialObj));
        setIsEditing(true);
    };

    const hasUnsavedChanges = Boolean(
        editingMenu && originalMenuSnapshot && JSON.stringify(editingMenu) !== originalMenuSnapshot
    );

    const handleRequestCloseEdit = () => {
        if (hasUnsavedChanges) {
            setIsConfirmUnsavedOpen(true);
        } else {
            setIsEditing(false);
        }
    };

    const handleSave = async () => {
        if (!editingMenu) return;

        const dateStr = editingMenu.date;
        const existing = menus.find(m => m.date === dateStr);
        const toastId = toast.loading("Salvando cardápio...");

        try {
            if (existing) {
                await menuService.updateMenu(existing.id, editingMenu);
            } else {
                await menuService.createMenu(editingMenu);
            }
            toast.success("Cardápio salvo com sucesso", { id: toastId });
            await loadMenus();
            setIsEditing(false);
        } catch (error) {
            toast.error("Erro ao salvar cardápio", { id: toastId });
        }
    };

    const handleCopyPreviousWeek = async () => {
        if (!isNutritionist) return;
        const previousWeekStart = addDays(weekStart, -7);
        const toastId = toast.loading("Copiando cardápios...");

        try {
            for (let i = 0; i < 5; i++) { // Monday to Friday
                const sourceDate = addDays(previousWeekStart, i);
                const targetDate = addDays(weekStart, i);

                const sourceMenu = getMenuForDate(sourceDate);
                if (sourceMenu) {
                    const targetDateStr = format(targetDate, "yyyy-MM-dd");
                    const existingTarget = getMenuForDate(targetDate);
                    const newMenu: Partial<Menu> = {
                        date: targetDateStr,
                        items: sourceMenu.items
                    };

                    if (existingTarget) {
                        await menuService.updateMenu(existingTarget.id, newMenu);
                    } else {
                        await menuService.createMenu(newMenu);
                    }
                }
            }
            toast.success("Cardápios copiados com sucesso", { id: toastId });
            await loadMenus();
        } catch (error) {
            toast.error("Erro ao copiar cardápios", { id: toastId });
        }
    };

    const handleClearDay = () => {
        if (!editingMenu || !editingMenu.id) return;
        setIsConfirmClearOpen(true);
    };

    const confirmClearAction = async () => {
        if (editingMenu && editingMenu.id) {
            const toastId = toast.loading("Removendo cardápio...");
            try {
                await menuService.deleteMenu(editingMenu.id);
                toast.success("Cardápio removido com sucesso", { id: toastId });
                await loadMenus();
                setIsEditing(false);
                setIsConfirmClearOpen(false);
            } catch (error) {
                toast.error("Erro ao remover cardápio", { id: toastId });
            }
        }
    };

    const handleCopyFromDate = async (targetDate: Date, offsetDays: number) => {
        const sourceDate = addDays(targetDate, offsetDays);
        const sourceMenu = getMenuForDate(sourceDate);
        if (!sourceMenu) {
            toast.error(`Nenhum cardápio encontrado no dia ${format(sourceDate, "dd/MM")}`);
            return;
        }

        const targetDateStr = format(targetDate, "yyyy-MM-dd");
        const existingTarget = getMenuForDate(targetDate);
        const toastId = toast.loading("Copiando cardápio...");

        const newMenu: Partial<Menu> = {
            date: targetDateStr,
            items: sourceMenu.items
        };

        try {
            if (existingTarget) {
                await menuService.updateMenu(existingTarget.id, newMenu);
            } else {
                await menuService.createMenu(newMenu);
            }
            toast.success("Cardápio copiado com sucesso", { id: toastId });
            await loadMenus();
        } catch (error) {
            toast.error("Erro ao copiar cardápio", { id: toastId });
        }
    };

    // Render 5 days
    const weekDays = Array.from({ length: 5 }).map((_, i) => addDays(weekStart, i));

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigateWeek("prev")}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-xl font-bold flex items-center gap-2 min-w-[200px] justify-center text-slate-700">
                        <Utensils className="h-5 w-5 text-green-500" />
                        Semana: {format(weekStart, "dd/MM")} a {format(addDays(weekStart, 4), "dd/MM")}
                    </h2>
                    <Button variant="outline" size="icon" onClick={() => navigateWeek("next")}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setIsPrintDialogOpen(true)}
                        className="bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-200 gap-2 shadow-xs font-semibold text-xs h-9"
                    >
                        <Printer className="h-4 w-4 text-emerald-600" />
                        Visualizar / Imprimir PDF (A4)
                    </Button>
                    {isNutritionist && (
                        <Button variant="outline" onClick={handleCopyPreviousWeek} className="flex items-center gap-2 text-xs h-9">
                            <Copy className="h-4 w-4" />
                            Copiar da semana anterior
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 opacity-100 transition-opacity" style={{ opacity: isLoading ? 0.6 : 1 }}>
                {weekDays.map(day => {
                    const menu = getMenuForDate(day);
                    const isToday = isSameDay(day, new Date());

                    return (
                        <Card key={day.toISOString()} className={`flex flex-col h-full ${isToday ? 'border-primary shadow-md' : 'border-slate-200'}`}>
                            <CardHeader className={`p-4 pb-2 border-b flex flex-row items-center justify-between ${isToday ? 'bg-primary/5' : 'bg-slate-50'}`}>
                                <div>
                                    <div className="text-sm font-bold uppercase tracking-wider text-slate-500">
                                        {format(day, "EEEE", { locale: ptBR })}
                                    </div>
                                    <div className={`text-2xl font-black ${isToday ? 'text-primary' : 'text-slate-700'}`}>
                                        {format(day, "dd")}
                                    </div>
                                </div>
                                {isNutritionist && (
                                    <div className="flex gap-1">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white" title="Mais Opções">
                                                    <MoreVertical className="h-4 w-4 text-slate-400" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleCopyFromDate(day, -7)} className="cursor-pointer">
                                                    Copiar semana passada
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleCopyFromDate(day, -1)} className="cursor-pointer">
                                                    Copiar dia anterior
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleCopyFromDate(day, 1)} className="cursor-pointer">
                                                    Copiar dia seguinte
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white" onClick={() => handleEdit(menu, day)} title="Editar Cardápio">
                                            <Edit className="h-4 w-4 text-slate-400" />
                                        </Button>
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="p-4 flex-1">
                                {menu ? (
                                    <div className="space-y-4">
                                        {menu.items.map((item, i) => (
                                            <div key={i} className="text-sm">
                                                <Badge variant="outline" className="mb-1 text-[10px] font-bold tracking-wider text-slate-400 border-slate-200">
                                                    {item.time} - {item.title}
                                                </Badge>
                                                <p className="text-slate-700 leading-relaxed whitespace-pre-line break-words">{item.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 py-8">
                                        <Apple className="h-8 w-8 mb-2 opacity-20" />
                                        <p className="text-xs font-medium uppercase tracking-wider text-center">Nenhum cardápio<br />cadastrado</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Dialog open={isEditing} onOpenChange={(open) => { if (!open) handleRequestCloseEdit(); }}>
                <DialogContent
                    onPointerDownOutside={(e) => {
                        if (hasUnsavedChanges) {
                            e.preventDefault();
                            setIsConfirmUnsavedOpen(true);
                        }
                    }}
                    onEscapeKeyDown={(e) => {
                        if (hasUnsavedChanges) {
                            e.preventDefault();
                            setIsConfirmUnsavedOpen(true);
                        }
                    }}
                    className="max-w-md max-h-[90vh] flex flex-col p-0 overflow-hidden"
                >
                    <DialogHeader className="p-6 pb-2 border-b">
                        <DialogTitle className="flex items-center gap-2">
                            <Utensils className="h-5 w-5 text-green-500" />
                            Editar Cardápio do Dia
                        </DialogTitle>
                        <p className="text-sm text-slate-500 capitalize">{editDate ? format(editDate, "EEEE, dd 'de' MMMM", { locale: ptBR }) : ''}</p>
                    </DialogHeader>

                    {editingMenu && (
                        <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-6">
                            {editingMenu.items.map((item, index) => (
                                <div key={index} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <Label className="text-xs font-bold text-slate-500 uppercase">Refeição</Label>
                                            <Input
                                                value={item.title}
                                                onChange={e => {
                                                    const newItems = [...editingMenu.items];
                                                    newItems[index].title = e.target.value;
                                                    setEditingMenu({ ...editingMenu, items: newItems });
                                                }}
                                                className="bg-white font-medium"
                                            />
                                        </div>
                                        <div className="w-32">
                                            <Label className="text-xs font-bold text-slate-500 uppercase">Horário</Label>
                                            <Input
                                                type="time"
                                                value={item.time}
                                                onChange={e => {
                                                    const newItems = [...editingMenu.items];
                                                    newItems[index].time = e.target.value;
                                                    setEditingMenu({ ...editingMenu, items: newItems });
                                                }}
                                                className="bg-white"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Descrição do Cardápio</Label>
                                        <Textarea
                                            value={item.description}
                                            onChange={e => {
                                                const newItems = [...editingMenu.items];
                                                newItems[index].description = e.target.value;
                                                setEditingMenu({ ...editingMenu, items: newItems });
                                            }}
                                            placeholder="Ex: Arroz, feijão, frango assado e salada..."
                                            className="bg-white resize-none h-20"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <DialogFooter className="p-4 border-t bg-slate-50 flex items-center sm:justify-between">
                        <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleClearDay}>Apagar Dia</Button>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleRequestCloseEdit}>Cancelar</Button>
                            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">Salvar Cardápio</Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Pop-up de Confirmação para Salvar Alterações Não Salvas */}
            <Dialog open={isConfirmUnsavedOpen} onOpenChange={setIsConfirmUnsavedOpen}>
                <DialogContent className="max-w-md p-6">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-amber-600 text-base font-bold">
                            <AlertTriangle className="h-5 w-5" />
                            Deseja salvar as alterações?
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed py-2">
                        Você estava preenchendo o cardápio. Para não perder os dados digitados, escolha se deseja salvar antes de sair ou descartar o texto.
                    </p>
                    <DialogFooter className="gap-2 sm:gap-2 flex-col sm:flex-row justify-end pt-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-600 text-xs"
                            onClick={() => setIsConfirmUnsavedOpen(false)}
                        >
                            Continuar Editando
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
                            onClick={() => {
                                setIsConfirmUnsavedOpen(false);
                                setIsEditing(false);
                            }}
                        >
                            Descartar
                        </Button>
                        <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                            onClick={async () => {
                                setIsConfirmUnsavedOpen(false);
                                await handleSave();
                            }}
                        >
                            Salvar Cardápio
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={isConfirmClearOpen}
                onOpenChange={setIsConfirmClearOpen}
                title="Limpar Cardápio"
                description="Tem certeza que deseja apagar o cardápio deste dia? Esta ação não pode ser desfeita."
                onConfirm={confirmClearAction}
            />

            {/* Pontos Importantes e Diretrizes Nutricionais */}
            <MenuGuidelinesCard
                guidelines={guidelines}
                onUpdateGuidelines={handleUpdateGuidelines}
                canEdit={isNutritionist}
            />

            {/* Modal de Impressão e Exportação em PDF A4 */}
            <MenuPrintDialog
                open={isPrintDialogOpen}
                onOpenChange={setIsPrintDialogOpen}
                menus={menus}
                initialDate={currentDate}
                guidelines={guidelines}
            />
        </div>
    );
}
