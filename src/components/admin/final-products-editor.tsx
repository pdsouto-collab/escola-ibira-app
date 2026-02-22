"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";

export function FinalProductsEditor() {
    const { finalProductTypes, addFinalProductType, updateFinalProductType, removeFinalProductType } = useAppStore();
    const [newItemName, setNewItemName] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");

    const handleAdd = () => {
        if (!newItemName.trim()) return;
        const newId = `product-${Date.now()}`;
        addFinalProductType({ id: newId, name: newItemName.trim() });
        setNewItemName("");
    };

    const startEditing = (id: string, currentName: string) => {
        setEditingId(id);
        setEditName(currentName);
    };

    const saveEdit = () => {
        if (editingId && editName.trim()) {
            updateFinalProductType(editingId, { name: editName.trim() });
        }
        cancelEdit();
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName("");
    };

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
                />
                <Button onClick={handleAdd} className="gap-2">
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
                                    />
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={saveEdit}>
                                        <Check className="w-4 h-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-slate-600" onClick={cancelEdit}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <span className="font-medium text-slate-800">{item.name}</span>
                                    <div className="flex gap-1">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-indigo-600" onClick={() => startEditing(item.id, item.name)}>
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-rose-600" onClick={() => removeFinalProductType(item.id)}>
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
