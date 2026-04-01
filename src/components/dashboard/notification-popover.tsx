"use client";

import React, { useState, useEffect } from "react";
import { AppNotification } from "@/types/notification";
import { NotificationService } from "@/services/notification.service";
import { Bell, Info, AlertTriangle, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export function NotificationPopover() {
    const { data: session } = useSession();
    const currentUser = session?.user as any;
    const [open, setOpen] = useState(false);
    
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadNotifications = async () => {
        if (!currentUser?.id) return;
        setIsLoading(true);
        try {
            const data = await NotificationService.getNotifications(currentUser.id);
            setNotifications(data);
        } catch (error) {
            console.error(error);
            toast.error("Ocorreu um erro ao carregar as notificações.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser?.id) {
            loadNotifications();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser?.id]);

    useEffect(() => {
        if (open && currentUser?.id) {
            loadNotifications();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const markNotificationAsRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        try {
            await NotificationService.markAsRead(id);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao marcar notificação como lida.");
            // Revert on failure
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: false } : n));
        }
    };

    const markAllNotificationsAsRead = async () => {
        if (!currentUser?.id) return;
        
        // Optimistic update
        const originalStatus = [...notifications];
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        
        try {
            await NotificationService.markAllAsRead(currentUser.id);
            toast.success("Todas as notificações foram marcadas como lidas.");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao marcar notificações como lidas.");
            setNotifications(originalStatus);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const getIcon = (type: string) => {
        switch (type) {
            case "warning": return <AlertTriangle className="w-4 h-4 text-orange-500" />;
            case "success": return <CheckCircle className="w-4 h-4 text-emerald-500" />;
            case "alert": return <XCircle className="w-4 h-4 text-red-500" />;
            default: return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className="relative p-2 rounded-full bg-slate-900/5 hover:bg-slate-900/10 transition-colors">
                    <Bell className="w-5 h-5 text-slate-700" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-lg">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                        Notificações
                        {unreadCount > 0 && (
                            <Badge variant="secondary" className="bg-[#2E798A] text-white hover:bg-[#2E798A]/90">
                                {unreadCount} nova{unreadCount > 1 ? "s" : ""}
                            </Badge>
                        )}
                    </h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-[10px] h-7 px-2 text-slate-500 hover:text-[#2E798A]"
                            onClick={() => markAllNotificationsAsRead()}
                            disabled={isLoading}
                        >
                            Marcar lidas
                        </Button>
                    )}
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                    {isLoading ? (
                         <div className="p-12 text-center flex flex-col items-center justify-center">
                            <Loader2 className="w-6 h-6 text-slate-300 animate-spin mb-3" />
                            <p className="text-sm text-slate-500">Carregando...</p>
                        </div>
                    ) : notifications.length > 0 ? (
                        <div className="divide-y divide-slate-50">
                            {notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={cn(
                                        "p-4 hover:bg-slate-50 transition-colors cursor-pointer group relative",
                                        !n.isRead && "bg-blue-50/30"
                                    )}
                                    onClick={() => markNotificationAsRead(n.id)}
                                >
                                    <div className="flex gap-3">
                                        <div className="mt-1">
                                            {getIcon(n.type)}
                                        </div>
                                        <div className="flex-1">
                                            <p className={cn(
                                                "text-xs font-semibold text-slate-800 mb-0.5",
                                                !n.isRead && "pr-4"
                                            )}>
                                                {n.title}
                                            </p>
                                            <p className="text-[11px] text-slate-500 leading-normal mb-1">
                                                {n.message}
                                            </p>
                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                                <Clock className="w-3 h-3" />
                                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ptBR })}
                                            </div>
                                        </div>
                                    </div>
                                    {!n.isRead && (
                                        <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Bell className="w-6 h-6 text-slate-300" />
                            </div>
                            <p className="text-sm text-slate-500">Nenhuma notificação por aqui.</p>
                        </div>
                    )}
                </div>
                <div className="p-2 border-t border-slate-100 bg-slate-50/50 rounded-b-lg">
                    <Button variant="ghost" size="sm" className="w-full text-[11px] text-slate-500 hover:text-[#2E798A]">
                        Ver todas as notificações
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
