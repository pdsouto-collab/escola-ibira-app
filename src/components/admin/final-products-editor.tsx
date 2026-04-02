"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Edit2, Check, X, Loader2 } from "lucide-react";
import { FinalProductType } from "@/types/final-product-type";
import { getFinalProductTypes, createFinalProductType, updateFinalProductType, deleteFinalProductType } from "@/services/final-product-type.service";
import { toast } from "sonner";

export function FinalProductsEditor() {
    const [finalProductTypes, setFinalProductTypes] = useState<FinalProductType[]>([]);
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
            const types = await getFinalProductTypes();
            setFinalProductTypes(types);
        } catch (error) {
            toast.error("Erro ao carregar tipos de produtos finais");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdd = async () => {
        if (isSaving) return;

        if (!newItemName.trim()) {
            toast.warning("Por favor, digite o nome do produto final antes de adicionar.");
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
            const newType = await createFinalProductType({ id: newId, name: newItemName.trim() });
            setFinalProductTypes(prev => [...prev, newType]);
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
            const updated = await updateFinalProductType(editingId, { name: editName.trim() });
            setFinalProductTypes(prev => prev.map(t => t.id === editingId ? updated : t));
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
            await deleteFinalProductType(id);
            setFinalProductTypes(prev => prev.filter(t => t.id !== id));
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
                <h2 className="text-xl font-bold text-slate-800">Tipos de Produto Final</h2>
                <p className="text-sm text-slate-500 mt-1">
                    Gerencie a lista de produtos finais que os professores podem selecionar ao criar um novo projeto.
                </p>
            </div>

            <div className="flex gap-3">
                <Input
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Ex: Exposição de Arte"
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
                {finalProductTypes.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 italic">Nenhum produto final cadastrado.</div>
                ) : (
                    finalProductTypes.map(item => (
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
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-slate-600" onClick={cancelEdit} disabled={isSaving}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <span className="font-medium text-slate-800">{item.name}</span>
                                    <div className="flex gap-1">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-indigo-600" onClick={() => startEditing(item.id, item.name)} disabled={isSaving}>
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-rose-600" onClick={() => handleDelete(item.id)} disabled={isSaving}>
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
