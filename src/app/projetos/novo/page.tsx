"use client";

import { useState } from "react";

import { BNCCSelector } from "@/components/bncc/bncc-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, ChevronRight, ChevronLeft, Save } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function NewProjectWizard() {
    const [currentStep, setCurrentStep] = useState(1);

    // Mock State for Form Data
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        classes: [] as string[],
        bnccSkills: [] as string[],
        schedule: ""
    });

    const steps = [
        { id: 1, label: "Detalhes" },
        { id: 2, label: "Aplicação do projeto" },
        { id: 3, label: "Habilidades e conteúdos" },
        { id: 4, label: "Planejamento de encontros" }
    ];

    const nextStep = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Wizard Header */}
            <div className="bg-white border-b px-8 py-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-8">
                    {steps.map((step, index) => {
                        const isCompleted = step.id < currentStep;
                        const isActive = step.id === currentStep;

                        return (
                            <div key={step.id} className={cn("flex items-center gap-2 text-sm font-medium",
                                isActive ? "text-slate-900 border-b-2 border-slate-900 pb-4 mb-[-17px]" :
                                    isCompleted ? "text-green-600" : "text-slate-400"
                            )}>
                                {isCompleted ? <Check className="w-4 h-4" /> : <span>{step.id}.</span>}
                                {step.label}
                            </div>
                        );
                    })}
                </div>
                <div className="flex gap-2">
                    <Link href="/projetos">
                        <Button variant="ghost">Cancelar</Button>
                    </Link>
                </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border p-8 min-h-[500px]">

                    {/* Step 1: Detalhes */}
                    {currentStep === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-2xl font-bold text-slate-800">Detalhes do Projeto</h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Nome do Projeto</label>
                                    <Input
                                        placeholder="Ex: Explorando o Sistema Solar"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Descrição</label>
                                    <Textarea
                                        placeholder="Descreva o objetivo e a metodologia do projeto..."
                                        className="h-32"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Aplicação */}
                    {currentStep === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-2xl font-bold text-slate-800">Aplicação do Projeto</h2>
                            <p className="text-slate-500">Selecione as turmas que participarão deste projeto.</p>
                            <div className="grid grid-cols-2 gap-4">
                                {["Turma A - Manhã", "Turma B - Tarde", "Turma C - Integral", "Berçário I"].map((turma) => (
                                    <div key={turma} className="flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-slate-50">
                                        <Checkbox id={turma} />
                                        <label
                                            htmlFor={turma}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer w-full"
                                        >
                                            {turma}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: BNCC (Integrated) */}
                    {currentStep === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 h-full">
                            {/* Reuse the BNCCSelector component here */}
                            <BNCCSelector />
                        </div>
                    )}

                    {/* Step 4: Planejamento */}
                    {currentStep === 4 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-2xl font-bold text-slate-800">Planejamento de Encontros</h2>
                            <p className="text-slate-500">Defina o cronograma prévio das atividades.</p>
                            <div className="border rounded-xl p-6 bg-slate-50 text-center">
                                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 mb-4">Módulo de calendário em desenvolvimento...</p>
                                <Textarea
                                    placeholder="Digite o cronograma manualmente por enquanto..."
                                    className="bg-white min-h-[200px]"
                                />
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Footer Controls */}
            <div className="bg-white border-t px-8 py-4 flex justify-between items-center flex-shrink-0">
                <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="gap-2"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                </Button>

                {currentStep < 4 ? (
                    <Button onClick={nextStep} className="gap-2 px-8">
                        Próximo
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                ) : (
                    <Link href="/projetos">
                        <Button className="gap-2 px-8 bg-green-600 hover:bg-green-700">
                            <Save className="w-4 h-4" />
                            Finalizar Projeto
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    );
}

function Calendar(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M8 2v4" />
            <path d="M16 2v4" />
            <rect width="18" height="18" x="3" y="4" rx="2" />
            <path d="M3 10h18" />
        </svg>
    )
}
