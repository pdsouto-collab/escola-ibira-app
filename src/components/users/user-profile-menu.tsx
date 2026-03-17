"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { updateUser as updateUserService } from "@/services/user.service";
import { Settings, LogOut, User as UserIcon, Lock } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export function UserProfileMenu() {
    const { data: session, update } = useSession();
    const currentUser = session?.user as any;
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isPasswordOpen, setIsPasswordOpen] = useState(false);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    // Profile Form State
    const [formData, setFormData] = useState({
        name: "",
        lastName: "",
        email: "",
        phone: "",
    });

    // Populate form data when currentUser is available
    React.useEffect(() => {
        if (currentUser) {
            //console.log("UserProfileMenu - Usuário Atual:", currentUser);
            setFormData({
                name: currentUser.name?.split(" ")[0] || "",
                lastName: currentUser.name?.split(" ").slice(1).join(" ") || "",
                email: currentUser.email || "",
                phone: currentUser.phone || "",
            });
        }
    }, [currentUser]);

    // Password Form State
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleProfileSave = async () => {
        if (!currentUser) return;
        const fullName = `${formData.name} ${formData.lastName}`.trim();
        setIsUpdatingProfile(true);

        try {
            await updateUserService(currentUser.id, {
                name: fullName,
                email: formData.email,
                phone: formData.phone,
            });

            // Forçar atualização da sessão no NextAuth
            await update({
                name: fullName,
                email: formData.email,
                phone: formData.phone,
            });

            setIsProfileOpen(false);
        } catch (error) {
            console.error("Erro ao atualizar perfil", error);
            alert("Erro ao atualizar perfil.");
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handlePasswordSave = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("As novas senhas não coincidem.");
            return;
        }

        setIsUpdatingPassword(true);
        try {
            await updateUserService(currentUser.id, {
                currentPassword: passwordData.currentPassword,
                password: passwordData.newPassword
            });
            setIsPasswordOpen(false);
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            alert("Senha atualizada com sucesso! Você será deslogado para sua segurança.");
            signOut({ callbackUrl: "/login" });
        } catch (error: any) {
            console.error("Erro ao atualizar senha", error);
            const message = error.message || "Erro ao atualizar senha.";
            alert(message.includes("401") ? "Senha atual incorreta." : "Erro ao atualizar senha.");
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    if (!currentUser) return null;

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Avatar className="border-2 border-white cursor-pointer hover:ring-2 hover:ring-emerald-500 transition-all">
                        <AvatarImage src={currentUser.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + currentUser.name} />
                        <AvatarFallback>{currentUser.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                            <p className="text-xs leading-none text-slate-500">{currentUser.email}</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => setIsProfileOpen(true)} className="cursor-pointer">
                            <UserIcon className="mr-2 h-4 w-4" />
                            <span>Meu Perfil</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setIsPasswordOpen(true)} className="cursor-pointer">
                            <Lock className="mr-2 h-4 w-4" />
                            <span>Redefinir Senha</span>
                        </DropdownMenuItem>
                        {/* Outros possíveis atalhos no futuro */}
                        <DropdownMenuItem className="cursor-pointer">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Configurações</span>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sair</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Dialog */}
            <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Editar Perfil</DialogTitle>
                        <DialogDescription>
                            Atualize as informações básicas do seu usuário. Clique em salvar quando terminar.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Sobrenome</Label>
                                <Input
                                    id="lastName"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefone</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsProfileOpen(false)} disabled={isUpdatingProfile}>Cancelar</Button>
                        <Button onClick={handleProfileSave} className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isUpdatingProfile}>
                            {isUpdatingProfile ? "Salvando..." : "Salvar alterações"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Change Password Dialog */}
            <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Redefinir Senha</DialogTitle>
                        <DialogDescription>
                            Insira sua senha atual e a nova senha para atualizar seu acesso.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="current">Senha Atual</Label>
                            <Input
                                id="current"
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new">Nova Senha</Label>
                            <Input
                                id="new"
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm">Confirmar Nova Senha</Label>
                            <Input
                                id="confirm"
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPasswordOpen(false)} disabled={isUpdatingPassword}>Cancelar</Button>
                        <Button onClick={handlePasswordSave} className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isUpdatingPassword}>
                            {isUpdatingPassword ? "Atualizando..." : "Atualizar Senha"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
