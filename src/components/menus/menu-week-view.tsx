"use client";

import { useState } from "react";
import { format, addDays, startOfWeek, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAppStore } from "@/lib/store";
import { Menu, MenuItem } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Utensils, Edit, Copy, ChevronLeft, ChevronRight, Apple } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export function MenuWeekView() {
    const { menus, addMenu, updateMenu, removeMenu, currentUser } = useAppStore();
    const isNutritionist = currentUser?.role === "nutritionist" || currentUser?.role === "admin";

    const [currentDate, setCurrentDate] = useState(new Date());
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday

    const [isEditing, setIsEditing] = useState(false);
    const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
    const [editDate, setEditDate] = useState<Date | null>(null);

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
        if (menu) {
            setEditingMenu(JSON.parse(JSON.stringify(menu))); // deep copy
        } else {
            setEditingMenu({
                id: `menu-${Date.now()}`,
                date: format(date, "yyyy-MM-dd"),
                items: [
                    { time: "09:30", title: "Lanche da Manhã", description: "" },
                    { time: "11:30", title: "Almoço", description: "" },
                    { time: "15:00", title: "Lanche da Tarde", description: "" }
                ]
            });
        }
        setIsEditing(true);
    };

    const handleSave = () => {
        if (!editingMenu) return;

        const dateStr = editingMenu.date;
        const existing = menus.find(m => m.date === dateStr);

        if (existing) {
            updateMenu(existing.id, editingMenu);
        } else {
            addMenu(editingMenu);
        }
        setIsEditing(false);
    };

    const handleCopyPreviousWeek = () => {
        if (!isNutritionist) return;
        const previousWeekStart = addDays(weekStart, -7);

        for (let i = 0; i < 5; i++) { // Monday to Friday
            const sourceDate = addDays(previousWeekStart, i);
            const targetDate = addDays(weekStart, i);

            const sourceMenu = getMenuForDate(sourceDate);
            if (sourceMenu) {
                const targetDateStr = format(targetDate, "yyyy-MM-dd");
                const existingTarget = getMenuForDate(targetDate);
                const newMenu: Menu = {
                    ...sourceMenu,
                    id: existingTarget ? existingTarget.id : `menu-${Date.now()}-${i}`,
                    date: targetDateStr
                };

                if (existingTarget) {
                    updateMenu(existingTarget.id, newMenu);
                } else {
                    addMenu(newMenu);
                }
            }
        }
    };

    const handleClearDay = () => {
        if (!editingMenu || !editingMenu.id) return;
        const confirmClear = window.confirm("Tem certeza que deseja apagar o cardápio deste dia?");
        if (confirmClear) {
            removeMenu(editingMenu.id);
            setIsEditing(false);
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

                {isNutritionist && (
                    <Button variant="outline" onClick={handleCopyPreviousWeek} className="flex items-center gap-2">
                        <Copy className="h-4 w-4" />
                        Copiar da semana anterior
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white" onClick={() => handleEdit(menu, day)}>
                                        <Edit className="h-4 w-4 text-slate-400" />
                                    </Button>
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
                                                <p className="text-slate-700 leading-snug">{item.description}</p>
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

            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Utensils className="h-5 w-5 text-green-500" />
                            Editar Cardápio do Dia
                        </DialogTitle>
                        <p className="text-sm text-slate-500 capitalize">{editDate ? format(editDate, "EEEE, dd 'de' MMMM", { locale: ptBR }) : ''}</p>
                    </DialogHeader>

                    {editingMenu && (
                        <div className="space-y-6 py-4">
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
                                        <div className="w-24">
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

                    <DialogFooter className="flex items-center sm:justify-between">
                        <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleClearDay}>Apagar Dia</Button>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
                            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">Salvar Cardápio</Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
