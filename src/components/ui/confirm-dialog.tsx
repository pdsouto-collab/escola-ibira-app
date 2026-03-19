"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    onConfirm: () => void | Promise<void>;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive";
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    onConfirm,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    variant = "destructive",
}: ConfirmDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onConfirm();
            onOpenChange(false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!isLoading) onOpenChange(v); }}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${variant === 'destructive' ? 'bg-red-100' : 'bg-blue-100'}`}>
                            <AlertTriangle className={`h-5 w-5 ${variant === 'destructive' ? 'text-red-600' : 'text-blue-600'}`} />
                        </div>
                        <DialogTitle>{title}</DialogTitle>
                    </div>
                    <DialogDescription className="pt-3">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isLoading}>
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === "destructive" ? "destructive" : "default"}
                        onClick={handleConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Aguarde...
                            </>
                        ) : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
