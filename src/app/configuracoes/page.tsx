
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Bell, Moon, User } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-800">Configurações</h1>
                <p className="text-slate-500">Gerencie suas preferências e configurações da conta.</p>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-slate-500" />
                            <CardTitle>Perfil</CardTitle>
                        </div>
                        <CardDescription>Suas informações pessoais.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Nome</label>
                            <Input defaultValue="João da Silva" />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input defaultValue="joao.silva@escola.com" />
                        </div>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                        <Button>Salvar Alterações</Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-slate-500" />
                            <CardTitle>Notificações</CardTitle>
                        </div>
                        <CardDescription>Como você deseja ser notificado.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium">Notificações por Email</label>
                                <p className="text-xs text-slate-500">Receba atualizações diárias sobre seus alunos.</p>
                            </div>
                            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium">Notificações Push</label>
                                <p className="text-xs text-slate-500">Alertas em tempo real no dispositivo.</p>
                            </div>
                            <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Moon className="h-5 w-5 text-slate-500" />
                            <CardTitle>Aparência</CardTitle>
                        </div>
                        <CardDescription>Personalize a interface do sistema.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium">Modo Escuro</label>
                                <p className="text-xs text-slate-500">Alternar entre tema claro e escuro.</p>
                            </div>
                            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
