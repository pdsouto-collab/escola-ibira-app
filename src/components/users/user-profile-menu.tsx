"use client";

import React, { useState } from "react";
import { toast } from "sonner";
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
import { Settings, LogOut, User as UserIcon, Lock, Camera } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

// Helper to crop to a sharp 1:1 center square and optimize resolution
const processProfileAvatar = (dataUrl: string, size = 512): Promise<string> => {
    return new Promise((resolve) => {
        const img = new window.Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                resolve(dataUrl);
                return;
            }

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";

            const minDim = Math.min(img.width, img.height);
            const startX = (img.width - minDim) / 2;
            const startY = (img.height - minDim) / 2;

            ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);
            resolve(canvas.toDataURL("image/jpeg", 0.90));
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
    });
};

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
        avatar: "",
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
                avatar: currentUser.avatar || "",
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
                avatar: formData.avatar,
            });

            // Forçar atualização da sessão no NextAuth
            await update({
                name: fullName,
                email: formData.email,
                phone: formData.phone,
                avatar: formData.avatar,
            });

            toast.success("Perfil atualizado com sucesso!");
            setIsProfileOpen(false);
        } catch (error) {
            console.error("Erro ao atualizar perfil", error);
            toast.error("Erro ao atualizar perfil.");
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handlePasswordSave = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("As novas senhas não coincidem.");
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
            toast.success("Senha atualizada com sucesso! Você será deslogado para sua segurança.");
            setTimeout(() => signOut({ callbackUrl: "/login" }), 3000);
        } catch (error: any) {
            console.error("Erro ao atualizar senha", error);
            const message = error.message || "Erro ao atualizar senha.";
            toast.error(
                message.includes("401") ? "Senha atual incorreta." :
                    message.includes("400") ? "A senha atual é obrigatória." :
                        "Erro ao atualizar senha."
            );
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (ev) => {
                const raw = ev.target?.result as string;
                if (raw) {
                    const processed = await processProfileAvatar(raw, 512);
                    setFormData(prev => ({ ...prev, avatar: processed }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    if (!currentUser) return null;

    const userInitial = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U";

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Avatar className="h-10 w-10 border-2 border-white/80 shadow-sm cursor-pointer hover:ring-2 hover:ring-emerald-500 hover:scale-105 transition-all bg-slate-100">
                        <AvatarImage 
                            src={currentUser.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + encodeURIComponent(currentUser.name || 'user')} 
                            className="object-cover object-center w-full h-full"
                        />
                        <AvatarFallback className="bg-emerald-600 text-white font-bold text-sm">{currentUser.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
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
                            Atualize as informações básicas e a foto do seu perfil.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center space-y-3 mb-2 mt-2">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <Avatar className="w-24 h-24 border-4 border-white shadow-md bg-slate-100 ring-2 ring-slate-200">
                                <AvatarImage 
                                    src={formData.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + encodeURIComponent(currentUser.name || 'user')} 
                                    className="object-cover object-center w-full h-full"
                                />
                                <AvatarFallback className="bg-emerald-600 text-white font-bold text-2xl">{currentUser.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="h-6 w-6 mb-0.5" />
                                <span className="text-[10px] font-semibold">Alterar</span>
                            </div>
                            <div className="absolute bottom-0 right-0 p-1.5 bg-[#E89F67] text-white rounded-full border-2 border-white shadow-xs">
                                <Camera className="h-3.5 w-3.5" />
                            </div>
                        </div>

                        <input 
                            ref={fileInputRef}
                            type="file" 
                            accept="image/*" 
                            className="hidden"
                            onChange={handleFileChange} 
                        />
                        <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Camera className="h-3.5 w-3.5 text-slate-500" />
                            Carregar nova foto
                        </Button>
                    </div>
                    <div className="grid gap-4 py-2">
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
