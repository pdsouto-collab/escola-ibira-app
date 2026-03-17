"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Bell, Moon, User, Lock, Save, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { updateUser as updateUserService } from "@/services/user.service";

export default function SettingsPage() {
    const { data: session, update } = useSession();
    const currentUser = session?.user as any;

    // Profile State
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    // Password State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Preferences State
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    // Feedback State
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [profileMessage, setProfileMessage] = useState("");
    const [passwordMessage, setPasswordMessage] = useState("");

    // Sync form with session
    useEffect(() => {
        if (currentUser) {
            console.log("SettingsPage - Usuário Atual:", currentUser);
            setName(currentUser.name || "");
            setEmail(currentUser.email || "");
            setPhone(currentUser.phone || "");
        }
    }, [currentUser]);

    const handleSaveProfile = async () => {
        if (!currentUser) return;
        setIsSavingProfile(true);
        setProfileMessage("");

        try {
            await updateUserService(currentUser.id, { name, email, phone });
            // Forçar atualização da sessão no NextAuth
            await update({
                name,
                email,
                phone,
            });
            setProfileMessage("Perfil atualizado com sucesso!");
            setTimeout(() => setProfileMessage(""), 3000);
        } catch (error) {
            console.error("Erro ao atualizar perfil:", error);
            setProfileMessage("Erro ao atualizar perfil.");
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            setPasswordMessage("As senhas não coincidem.");
            return;
        }
        if (newPassword.length < 6) {
            setPasswordMessage("A senha deve ter pelo menos 6 caracteres.");
            return;
        }

        setIsSavingPassword(true);
        setPasswordMessage("");

        try {
            await updateUserService(currentUser.id, {
                currentPassword,
                password: newPassword
            });
            setPasswordMessage("Senha redefinida com sucesso! Redirecionando...");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setTimeout(() => signOut({ callbackUrl: "/login" }), 2000);
        } catch (error: any) {
            console.error("Erro ao redefinir senha:", error);
            const message = error.message || "";
            // Agora que o service inclui o status, podemos detectar o 401
            if (message.includes("401")) {
                setPasswordMessage("A senha atual digitada está incorreta.");
            } else {
                setPasswordMessage("Ocorreu um erro ao tentar redefinir sua senha. Verifique os dados e tente novamente.");
            }
        } finally {
            setIsSavingPassword(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-800">Pessoais e Configurações</h1>
                <p className="text-slate-500">Gerencie suas informações pessoais e preferências do sistema.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Profile Card */}
                <Card className="md:col-span-2 border-slate-200/60 shadow-sm">
                    <CardHeader className="bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Informações Pessoais</CardTitle>
                                <CardDescription>Atualize seu nome, email e outros dados de contato.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Nome Completo</label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ex: Maria Carolina Santos"
                                    className="focus-visible:ring-[#2E798A]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Email</label>
                                <Input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email@escolaibira.com.br"
                                    className="focus-visible:ring-[#2E798A]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Telefone para Contato</label>
                                <Input
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="(11) 99999-9999"
                                    className="focus-visible:ring-[#2E798A]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Cargo / Função</label>
                                <Input
                                    value={currentUser?.role === 'teacher' ? 'Docente' : currentUser?.role === 'guardian' ? 'Responsável' : 'Administrador'}
                                    disabled
                                    className="bg-slate-50 text-slate-500 italic"
                                />
                            </div>
                        </div>
                        {profileMessage && (
                            <div className={`mt-4 p-3 rounded-lg text-sm flex items-center gap-2 ${profileMessage.includes("sucesso") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                                {profileMessage.includes("sucesso") && <CheckCircle2 className="w-4 h-4" />}
                                {profileMessage}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="border-t bg-slate-50/30 px-6 py-4 flex justify-end">
                        <Button
                            onClick={handleSaveProfile}
                            disabled={isSavingProfile}
                            className="bg-[#2E798A] hover:bg-[#256372] gap-2"
                        >
                            {isSavingProfile ? "Salvando..." : <><Save className="w-4 h-4" /> Salvar Perfil</>}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Password Reset Card */}
                <Card className="border-slate-200/60 shadow-sm">
                    <CardHeader className="bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Lock className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Redefinir Senha</CardTitle>
                                <CardDescription>Altere sua senha de acesso periodicamente.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Senha Atual</label>
                            <Input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="focus-visible:ring-[#E89F67]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Nova Senha</label>
                            <Input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="focus-visible:ring-[#E89F67]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Confirmar Nova Senha</label>
                            <Input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="focus-visible:ring-[#E89F67]"
                            />
                        </div>
                        {passwordMessage && (
                            <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${passwordMessage.includes("sucesso") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                                {passwordMessage.includes("sucesso") && <CheckCircle2 className="w-4 h-4" />}
                                {passwordMessage}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="border-t bg-slate-50/30 px-6 py-4 flex justify-end">
                        <Button
                            onClick={handleResetPassword}
                            disabled={isSavingPassword || !newPassword}
                            className="bg-[#E89F67] hover:bg-[#d68a54] gap-2"
                        >
                            {isSavingPassword ? "Alterando..." : "Alterar Senha"}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Notifications & System Card */}
                <Card className="border-slate-200/60 shadow-sm">
                    <CardHeader className="bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Bell className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Preferências</CardTitle>
                                <CardDescription>Configure como você interage com o sistema.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-semibold">Alertas de Diário</label>
                                <p className="text-xs text-slate-500">Notificações sobre atualizações das crianças.</p>
                            </div>
                            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-semibold">Comunicados Gerais</label>
                                <p className="text-xs text-slate-500">Eventos e avisos importantes da escola.</p>
                            </div>
                            <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                        </div>

                        <div className="border-t pt-6 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-slate-100 rounded">
                                    <Moon className="h-4 w-4 text-slate-600" />
                                </div>
                                <label className="text-sm font-semibold">Modo Noturno</label>
                            </div>
                            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
