"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const { authService } = await import("@/services/auth.service");
            const res = await authService.login({ email, password });

            if (res?.ok) {
                router.push("/");
            }
        } catch (err: any) {
            setError(err.message || "Email ou senha incorretos.");
        } finally {
            setIsLoading(false);
        }
    };

    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

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
                <p className="text-slate-500">Bem-vindo de volta! Faça login para continuar.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
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
                    <Label htmlFor="password">Senha</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button type="submit" disabled={isLoading} className="w-full bg-[#E89F67] hover:bg-[#D48A54]">
                    {isLoading ? "Entrando..." : "Entrar"}

                </Button>
            </form>

            <div className="text-center text-sm text-slate-500">
                <p>
                    Não tem uma conta?{" "}
                    <a href={`${basePath}/cadastro`} className="text-[#2E798A] hover:underline font-medium">
                        Cadastre-se
                    </a>
                </p>
                <div className="mt-4 text-xs bg-slate-50 p-2 rounded">
                    <p className="font-semibold">Credenciais de teste (Senha '123'):</p>
                    <p>ana.diretora@escolaibira.com.br</p>
                    <p>admin@escolaibira.com.br</p>
                    <p>claudia.prof@escolaibira.com.br</p>
                    <p>juliana.nutri@escolaibira.com.br</p>
                    <p>mariana.mae@email.com</p>
                </div>
            </div>
        </div>
    );
}
