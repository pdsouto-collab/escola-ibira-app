"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Edit2, Check, X, Loader2 } from "lucide-react";
import { ProjectType } from "@/types/project-type";
import { getProjectTypes, createProjectType, updateProjectType, deleteProjectType } from "@/services/project-type.service";
import { toast } from "sonner";

export function ProjectTypesEditor() {
    const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newItemName, setNewItemName] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const types = await getProjectTypes();
            setProjectTypes(types);
        } catch (error) {
            toast.error("Erro ao carregar tipos de projeto");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdd = async () => {
        if (isSaving) return;

        if (!newItemName.trim()) {
            toast.warning("Por favor, digite o nome do tipo de projeto antes de adicionar.");
            return;
        }

        setIsSaving(true);

        const newId = newItemName.trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/[\s-]+/g, "_");

        try {
            const newType = await createProjectType({ id: newId, name: newItemName.trim() });
            setProjectTypes(prev => [...prev, newType].sort((a, b) => a.name.localeCompare(b.name)));
            setNewItemName("");
            toast.success("Adicionado com sucesso");
        } catch (error) {
            toast.error("Erro ao adicionar");
        } finally {
            setIsSaving(false);
        }
    };

    const startEditing = (id: string, currentName: string) => {
        setEditingId(id);
        setEditName(currentName);
    };

    const saveEdit = async () => {
        if (!editingId || !editName.trim() || isSaving) return;
        setIsSaving(true);
        try {
            const updated = await updateProjectType(editingId, { name: editName.trim() });
            setProjectTypes(prev => prev.map(t => t.id === editingId ? updated : t).sort((a, b) => a.name.localeCompare(b.name)));
            cancelEdit();
            toast.success("Atualizado com sucesso");
        } catch (error) {
            toast.error("Erro ao atualizar");
        } finally {
            setIsSaving(false);
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName("");
    };

    const handleDelete = async (id: string) => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            await deleteProjectType(id);
            setProjectTypes(prev => prev.filter(t => t.id !== id));
            toast.success("Removido com sucesso");
        } catch (error) {
            toast.error("Erro ao remover");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-slate-800">Tipos de Projeto</h2>
                <p className="text-sm text-slate-500 mt-1">
                    Gerencie a lista de tipos (ex: Projeto, Oficina) que os professores podem selecionar ao criar um novo projeto.
                </p>
            </div>

            <div className="flex gap-3">
                <Input
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Ex: Oficina"
                    className="max-w-md"
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
                    disabled={isSaving}
                />
                <Button onClick={handleAdd} className="gap-2" disabled={isSaving}>
                    <Plus className="w-4 h-4" />
                    Adicionar
                </Button>
            </div>

            <div className="bg-white border rounded-lg divide-y max-w-2xl">
                {projectTypes.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 italic">Nenhum tipo de projeto cadastrado.</div>
                ) : (
                    projectTypes.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                            {editingId === item.id ? (
                                <div className="flex items-center gap-3 flex-1">
                                    <Input
                                        autoFocus
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }}
                                        className="h-8 max-w-sm"
                                        disabled={isSaving}
                                    />
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={saveEdit} disabled={isSaving}>
                                        <Check className="w-4 h-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100" onClick={cancelEdit} disabled={isSaving}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <span className="text-slate-700 font-medium">{item.name}</span>
                                    <div className="flex items-center gap-1">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50" onClick={() => startEditing(item.id, item.name)} disabled={isSaving}>
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(item.id)} disabled={isSaving}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
