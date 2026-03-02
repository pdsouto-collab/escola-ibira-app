"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole } from "@/lib/data";

export default function SignupPage() {
    const router = useRouter();
    const { setCurrentUser } = useAppStore(); // In a real app we would add the user to DB here

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<UserRole>("guardian");

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();

        // Mock signup: Create user object and log them in
        const newUser = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            email,
            role,
            avatar: "https://github.com/shadcn.png", // Default avatar
            status: "active" as const
        };

        setCurrentUser(newUser);
        router.push("/");
    };

    return (
        <div className="space-y-6">
            <div className="text-center flex flex-col items-center">
                <div className="w-32 h-32 mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/escola-ibira-app/images/opcao2_v5_transparent_final.png"
                        alt="Trilha Ibirá"
                        className="w-full h-full object-contain"
                    />
                </div>
                <h1 className="text-3xl font-bold text-[#1e293b]">Trilha Ibirá</h1>
                <p className="text-slate-500 mt-2">Crie sua conta para acessar a plataforma.</p>
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
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="role">Eu sou:</Label>
                    <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
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
                    />
                </div>

                <Button type="submit" className="w-full bg-[#2E798A] hover:bg-[#256372]">
                    Criar Conta
                </Button>
            </form>

            <div className="text-center text-sm text-slate-500">
                <p>
                    Já tem uma conta?{" "}
                    <a href="/escola-ibira-app/login" className="text-[#E89F67] hover:underline font-medium">
                        Faça login
                    </a>
                </p>
            </div>
        </div>
    );
}
