"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole } from "@/types/user-role";
import { signIn } from "next-auth/react";

export default function SignupPage() {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<UserRole>("guardian");

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { authService } = await import("@/services/auth.service");
            await authService.register({ email, name, password, role });
            
            // Auto sign in after registration
            const loginResult = await authService.login({ email, password });
            
            if (loginResult?.ok) {
                router.push("/");
            } else {
                router.push("/login");
            }
        } catch (error: any) {
            console.error("Erro no cadastro", error);
            toast.error(error.message || "Ocorreu um erro ao tentar criar sua conta.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center flex flex-col items-center">
                <div className="w-48 h-48 mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={`${basePath}/images/opcao2_v5_transparent_final.png`}
                        alt="Trilha Ibirá"
                        className="w-full h-full object-contain"
                    />
                </div>
                <p className="text-slate-500">Crie sua conta para acessar a plataforma.</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                        id="name"
                        placeholder="Seu nome"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="role">Eu sou:</Label>
                    <Select value={role} onValueChange={(v) => setRole(v as UserRole)} disabled={isLoading}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="guardian">Responsável (Pai/Mãe)</SelectItem>
                            <SelectItem value="teacher">Professor(a)</SelectItem>
                            <SelectItem value="director">Diretora Pedagógica</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Mínimo 8 caracteres"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>

                <Button type="submit" className="w-full bg-[#2E798A] hover:bg-[#256372]" disabled={isLoading}>
                    {isLoading ? "Criando conta..." : "Criar Conta"}
                </Button>
            </form>

            <div className="text-center text-sm text-slate-500">
                <p>
                    Já tem uma conta?{" "}
                    <a href={`${basePath}/login`} className="text-[#E89F67] hover:underline font-medium">
                        Faça login
                    </a>
                </p>
            </div>
        </div>
    );
}
