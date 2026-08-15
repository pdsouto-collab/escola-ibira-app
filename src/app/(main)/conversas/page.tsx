"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Send, MoveLeft, Users, Plus, RefreshCw, Loader2, Check, CheckCheck, Info, Edit, Trash2, LogOut, Shield } from "lucide-react";
import { toast } from "sonner";
import { ContactUser } from "@/types/contact-user";
import { ChatMessage } from "@/types/chat-message";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function ChatPage() {
    const { data: session } = useSession();
    const currentUserId = session?.user?.id;

    const [contacts, setContacts] = useState<ContactUser[]>([]);
    const [selectedContact, setSelectedContact] = useState<ContactUser | null>(null);
    const [inputText, setInputText] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    
    // Estado de Criação de Grupo
    const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);

    // Estado de Detalhes e Edição de Grupo
    const [isGroupDetailsOpen, setIsGroupDetailsOpen] = useState(false);
    const [groupDetails, setGroupDetails] = useState<any>(null);
    const [isLoadingGroupDetails, setIsLoadingGroupDetails] = useState(false);
    const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
    const [editGroupName, setEditGroupName] = useState("");
    const [editSelectedParticipants, setEditSelectedParticipants] = useState<string[]>([]);
    const [isSavingGroupEdit, setIsSavingGroupEdit] = useState(false);

    // Confirmação de exclusão / saída
    const [isConfirmDeleteGroupOpen, setIsConfirmDeleteGroupOpen] = useState(false);
    const [isConfirmLeaveGroupOpen, setIsConfirmLeaveGroupOpen] = useState(false);

    // UI Estado
    const [isLoadingContacts, setIsLoadingContacts] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSending, setIsSending] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const lastMessageIdRef = useRef<string | null>(null);

    // Buscar contatos
    const fetchContacts = async (showLoadingState = false) => {
        if (showLoadingState) setIsLoadingContacts(true);
        try {
            const res = await fetch("/api/users/contacts");
            if (res.ok) {
                const data = await res.json();
                setContacts(data);
            }
        } catch (error) {
            console.error("Error fetching contacts:", error);
            toast.error("Erro ao carregar contatos");
        } finally {
            setIsLoadingContacts(false);
        }
    };

    // Carregamento inicial de contatos
    useEffect(() => {
        fetchContacts(true);
        
        // Configura polling de contatos para checar mensagens recentes / contagem não-lida
        const intervalId = setInterval(() => fetchContacts(false), 5000);
        return () => clearInterval(intervalId);
    }, []);

    // Busca Mensagens ao abrir contato, e varre periodicamente (polling)
    useEffect(() => {
        lastMessageIdRef.current = null;
        if (!selectedContact) {
            setMessages([]);
            return;
        }

        const fetchMessages = async (showLoadingState = false) => {
            if (showLoadingState) setIsLoadingMessages(true);
            try {
                const queryParam = selectedContact.isGroup 
                    ? `groupId=${selectedContact.id}` 
                    : `contactId=${selectedContact.id}`;
                
                const res = await fetch(`/api/chat?${queryParam}`);
                if (res.ok) {
                    const data = await res.json();
                    
                    setMessages(prev => {
                        if (JSON.stringify(prev) === JSON.stringify(data)) {
                            return prev;
                        }
                        return data;
                    });
                    
                    fetchContacts(); 
                }
            } catch (error) {
                console.error("Error fetching messages:", error);
            } finally {
                if (showLoadingState) setIsLoadingMessages(false);
            }
        };

        fetchMessages(true);

        const intervalId = setInterval(() => fetchMessages(false), 3000);
        return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedContact]);

    // Rola magicamente o histórico pra baixo quando entram novas mensagens
    useEffect(() => {
        if (messages.length === 0) return;
        
        const lastMessage = messages[messages.length - 1];
        
        if (lastMessageIdRef.current !== lastMessage.id) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
            lastMessageIdRef.current = lastMessage.id;
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputText.trim() || !selectedContact || isSending) return;

        setIsSending(true);
        const currentText = inputText.trim();
        setInputText("");
        
        const tempId = `temp-${Date.now()}`;
        const newMsg: ChatMessage = {
            id: tempId,
            senderId: "me-optimistic",
            receiverId: selectedContact.isGroup ? undefined : selectedContact.id,
            groupId: selectedContact.isGroup ? selectedContact.id : undefined,
            content: currentText,
            read: false,
            isMe: true,
            createdAt: new Date().toISOString(),
            sender: {
                id: "me-optimistic",
                name: session?.user?.name || "Você",
                avatar: session?.user?.image || null,
                role: session?.user?.role || "Usuário"
            }
        };
        setMessages(prev => [...prev, newMsg]);

        try {
            const bodyPayload = selectedContact.isGroup 
                ? { groupId: selectedContact.id, content: currentText }
                : { receiverId: selectedContact.id, content: currentText };

            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyPayload)
            });

            if (!res.ok) {
                throw new Error("Failed to send message");
            }
            
            const createdMsg = await res.json();
            setMessages(prev => prev.map(m => m.id === tempId ? createdMsg : m));
            fetchContacts();
            
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Erro ao enviar mensagem");
            setMessages(prev => prev.filter(m => m.id !== tempId));
            setInputText(currentText);
        } finally {
            setIsSending(false);
        }
    };
    
    // Fluxo de Criação de Grupo
    const handleCreateGroup = async () => {
        if (!newGroupName.trim() || selectedParticipants.length === 0) return;

        setIsCreatingGroup(true);
        try {
            const res = await fetch("/api/chat/groups", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newGroupName,
                    participantIds: selectedParticipants
                })
            });

            if (!res.ok) {
                throw new Error("Erro ao criar grupo");
            }

            const newGroup = await res.json();
            
            toast.success("Grupo criado com sucesso!");
            setNewGroupName("");
            setSelectedParticipants([]);
            setIsCreateGroupOpen(false);
            
            await fetchContacts();
            
            setSelectedContact({
                id: newGroup.id,
                name: newGroup.name,
                role: "Grupo",
                avatar: newGroup.avatar,
                isGroup: true,
                participantIds: newGroup.participants.map((p:any) => p.id),
                lastMessage: "Grupo criado.",
                lastMessageTime: newGroup.createdAt,
                unreadCount: 0
            });
            
        } catch (error) {
            console.error(error);
            toast.error("Falha ao criar o grupo");
        } finally {
            setIsCreatingGroup(false);
        }
    };

    // Buscar detalhes do grupo
    const fetchGroupDetails = async (groupId: string) => {
        setIsLoadingGroupDetails(true);
        try {
            const res = await fetch(`/api/chat/groups/${groupId}`);
            if (res.ok) {
                const data = await res.json();
                setGroupDetails(data);
                setEditGroupName(data.name);
                setEditSelectedParticipants(data.participants.map((p: any) => p.id));
            } else {
                toast.error("Não foi possível carregar os detalhes do grupo.");
            }
        } catch (error) {
            console.error("Error fetching group details:", error);
            toast.error("Erro ao buscar detalhes do grupo.");
        } finally {
            setIsLoadingGroupDetails(false);
        }
    };

    const handleOpenGroupDetails = () => {
        if (!selectedContact || !selectedContact.isGroup) return;
        fetchGroupDetails(selectedContact.id);
        setIsGroupDetailsOpen(true);
    };

    const handleOpenEditGroup = () => {
        setIsGroupDetailsOpen(false);
        setIsEditGroupOpen(true);
    };

    const handleSaveGroupEdit = async () => {
        if (!selectedContact || !editGroupName.trim() || editSelectedParticipants.length === 0) return;

        setIsSavingGroupEdit(true);
        try {
            const res = await fetch(`/api/chat/groups/${selectedContact.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: editGroupName.trim(),
                    participantIds: editSelectedParticipants
                })
            });

            if (!res.ok) {
                throw new Error("Falha ao atualizar grupo");
            }

            const updated = await res.json();
            toast.success("Grupo atualizado com sucesso!");
            setIsEditGroupOpen(false);
            
            setSelectedContact(prev => prev ? { ...prev, name: updated.name } : null);
            await fetchContacts();
            fetchGroupDetails(selectedContact.id);
        } catch (error) {
            console.error("Error saving group:", error);
            toast.error("Erro ao salvar alterações do grupo");
        } finally {
            setIsSavingGroupEdit(false);
        }
    };

    const confirmDeleteGroup = async () => {
        if (!selectedContact) return;

        try {
            const res = await fetch(`/api/chat/groups/${selectedContact.id}`, {
                method: "DELETE"
            });

            if (!res.ok) {
                throw new Error("Falha ao excluir grupo");
            }

            toast.success("Grupo excluído com sucesso");
            setIsConfirmDeleteGroupOpen(false);
            setIsGroupDetailsOpen(false);
            setSelectedContact(null);
            await fetchContacts();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao excluir grupo");
        }
    };

    const confirmLeaveGroup = async () => {
        if (!selectedContact) return;

        try {
            const res = await fetch(`/api/chat/groups/${selectedContact.id}/leave`, {
                method: "POST"
            });

            if (!res.ok) {
                throw new Error("Falha ao sair do grupo");
            }

            toast.success("Você saiu do grupo");
            setIsConfirmLeaveGroupOpen(false);
            setIsGroupDetailsOpen(false);
            setSelectedContact(null);
            await fetchContacts();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao sair do grupo");
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatTimestamp = (dateString: string | null) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col md:flex-row gap-4">
            {/* Barra Lateral de Contatos */}
            <Card className={`${selectedContact ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-col overflow-hidden border-r-0 md:border-r`}>
                <div className="p-4 border-b space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-slate-800">Conversas</h1>
                            {contacts.reduce((acc, c) => acc + (c.unreadCount || 0), 0) > 0 && (
                                <span className="bg-emerald-500 text-white text-xs font-extrabold px-2 py-0.5 rounded-full">
                                    {contacts.reduce((acc, c) => acc + (c.unreadCount || 0), 0)}
                                </span>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700 hover:bg-slate-100" title="Atualizar Contatos" onClick={() => fetchContacts(true)}>
                                <RefreshCw className={`w-4 h-4 ${isLoadingContacts ? 'animate-spin' : ''}`} />
                            </Button>
                            <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 bg-indigo-50/50" title="Novo Grupo">
                                        <Plus className="w-5 h-5" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Criar Novo Grupo</DialogTitle>
                                        <DialogDescription>
                                            Selecione os contatos e dê um nome ao novo grupo.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="group-name">Nome do Grupo</Label>
                                            <Input
                                                id="group-name"
                                                placeholder="Ex: Pais - Jardim II"
                                                value={newGroupName}
                                                onChange={(e) => setNewGroupName(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Participantes ({selectedParticipants.length} selecionados)</Label>
                                            <ScrollArea className="h-48 rounded-md border p-2 bg-slate-50">
                                                <div className="space-y-2">
                                                    {contacts.filter(c => !c.isGroup).map((contact) => (
                                                        <div key={contact.id} className="flex items-center space-x-2 py-1">
                                                            <Checkbox
                                                                id={`chk-${contact.id}`}
                                                                checked={selectedParticipants.includes(contact.id)}
                                                                onCheckedChange={(checked) => {
                                                                    if (checked) {
                                                                        setSelectedParticipants([...selectedParticipants, contact.id]);
                                                                    } else {
                                                                        setSelectedParticipants(selectedParticipants.filter(id => id !== contact.id));
                                                                    }
                                                                }}
                                                            />
                                                            <Label htmlFor={`chk-${contact.id}`} className="text-sm cursor-pointer font-medium leading-none capitalize">
                                                                {contact.name} ({contact.role})
                                                            </Label>
                                                        </div>
                                                    ))}
                                                    {contacts.filter(c => !c.isGroup).length === 0 && (
                                                        <p className="text-xs text-slate-400 p-2">Nenhum usuário disponível.</p>
                                                    )}
                                                </div>
                                            </ScrollArea>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsCreateGroupOpen(false)} disabled={isCreatingGroup}>Cancelar</Button>
                                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleCreateGroup} disabled={!newGroupName.trim() || selectedParticipants.length === 0 || isCreatingGroup}>
                                            {isCreatingGroup ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Criando...
                                                </>
                                            ) : (
                                                "Criar Grupo"
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Buscar usuário/grupo..."
                            className="pl-9 bg-slate-50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    <div className="flex flex-col">
                        {isLoadingContacts ? (
                            <div className="p-8 text-center text-slate-400 text-sm">Carregando contatos...</div>
                        ) : filteredContacts.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm">Nenhum contato encontrado.</div>
                        ) : filteredContacts.map(contact => (
                            <button
                                key={contact.id}
                                onClick={() => setSelectedContact(contact)}
                                className={`flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-left border-b last:border-0 ${selectedContact?.id === contact.id ? 'bg-slate-100' : ''}`}
                            >
                                <div className="relative">
                                    <Avatar className={`h-12 w-12 border ${contact.isGroup && !contact.avatar ? 'bg-indigo-50 flex flex-col items-center justify-center' : ''}`}>
                                        {contact.isGroup && !contact.avatar ? (
                                            <Users className="h-6 w-6 text-indigo-500" />
                                        ) : (
                                            <>
                                                <AvatarImage src={contact.avatar ? contact.avatar : (contact.isGroup ? '' : `https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.name}`)} />
                                                <AvatarFallback>{contact.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </>
                                        )}
                                    </Avatar>
                                    {contact.unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white font-bold animate-pulse">
                                            {contact.unreadCount}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className="font-semibold text-slate-800 truncate">{contact.name}</span>
                                        <span className="text-xs text-slate-400 whitespace-nowrap">{formatTimestamp(contact.lastMessageTime)}</span>
                                    </div>
                                    <p className="text-sm text-slate-500 truncate mb-0.5">
                                        <span className={`font-medium capitalize ${contact.isGroup ? 'text-indigo-500' : 'text-primary/80'}`}>{contact.role}</span>
                                    </p>
                                    <p className={`text-sm truncate ${contact.unreadCount > 0 ? 'text-slate-800 font-semibold' : 'text-slate-400'}`}>
                                        {contact.lastMessage}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </Card>

            {/* Área de Chat */}
            <Card className={`${!selectedContact ? 'hidden md:flex' : 'flex'} flex-1 flex-col overflow-hidden bg-slate-50/50`}>
                {selectedContact ? (
                    <>
                        {/* Cabeçalho do Chat */}
                        <div className="p-4 border-b bg-white flex items-center justify-between shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedContact(null)}>
                                    <MoveLeft className="w-5 h-5" />
                                </Button>
                                <Avatar className={`h-10 w-10 ${selectedContact.isGroup && !selectedContact.avatar ? 'bg-indigo-50 flex flex-col items-center justify-center' : ''}`}>
                                    {selectedContact.isGroup && !selectedContact.avatar ? (
                                        <Users className="h-5 w-5 text-indigo-500" />
                                    ) : (
                                        <>
                                            <AvatarImage src={selectedContact.avatar ? selectedContact.avatar : (selectedContact.isGroup ? '' : `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedContact.name}`)} />
                                            <AvatarFallback>{selectedContact.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </>
                                    )}
                                </Avatar>
                                <div>
                                    <h2 className="font-bold text-slate-800 leading-tight">{selectedContact.name}</h2>
                                    <p className="text-xs text-slate-500 capitalize">{selectedContact.role}</p>
                                </div>
                            </div>

                            {/* Botão de Detalhes do Grupo */}
                            {selectedContact.isGroup && (
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleOpenGroupDetails}
                                        className="text-xs bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 flex items-center gap-1.5 font-semibold"
                                    >
                                        <Users className="w-3.5 h-3.5" />
                                        Participantes & Opções
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Lista de Mensagens */}
                        <ScrollArea className="flex-1 p-4 bg-slate-100">
                            {isLoadingMessages ? (
                                <div className="flex items-center justify-center h-full">
                                    <span className="text-slate-400 text-sm">Carregando mensagens...</span>
                                </div>
                            ) : (
                                <div className="space-y-4 max-w-3xl mx-auto flex flex-col">
                                    {messages.length === 0 ? (
                                        <div className="text-center my-8 text-slate-400 text-sm">
                                            Envie uma mensagem para iniciar a conversa!
                                        </div>
                                    ) : (
                                        messages.map(msg => {
                                            const isMe = msg.isMe ?? msg.senderId === "me-optimistic";
                                            const isRead = msg.read || (msg.readBy && msg.readBy.length > 0);

                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={`flex flex-col max-w-[80%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
                                                >
                                                    <div
                                                        className={`max-w-full px-4 py-2 ${selectedContact.isGroup && !isMe ? 'pt-1.5' : ''} rounded-2xl shadow-sm text-sm ${isMe
                                                            ? 'bg-emerald-600 text-white rounded-tr-none'
                                                            : 'bg-white text-slate-800 rounded-tl-none border'
                                                        }`}
                                                    >
                                                        {selectedContact.isGroup && !isMe && msg.sender?.name && (
                                                            <div className="font-bold text-[11px] text-indigo-600 mb-0.5 mt-0 leading-tight">{msg.sender.name}</div>
                                                        )}
                                                        <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                                                    </div>
                                                    <div className="flex items-center gap-1 mt-1 px-1">
                                                        <span className="text-[10px] text-slate-400">
                                                            {formatTimestamp(msg.createdAt)}
                                                        </span>
                                                        {isMe && (
                                                            isRead ? (
                                                                <CheckCheck className="w-3.5 h-3.5 text-emerald-500" title="Mensagem Lida" />
                                                            ) : (
                                                                <Check className="w-3.5 h-3.5 text-slate-400" title="Mensagem Enviada / Recebida" />
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </ScrollArea>

                        {/* Área de Entrada (Input) */}
                        <div className="p-4 bg-white border-t">
                            <div className="flex gap-2 max-w-3xl mx-auto">
                                <Input
                                    className="flex-1 bg-slate-50 focus-visible:ring-emerald-500"
                                    placeholder="Digite sua mensagem..."
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                />
                                <Button onClick={handleSendMessage} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full w-10 h-10 p-0 flex items-center justify-center shadow-sm" disabled={!inputText.trim() || isSending}>
                                    {isSending ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5 ml-0.5" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center h-full">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Send className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-600">Suas Conversas</h3>
                        <p className="max-w-xs mx-auto mt-2 text-sm">Selecione um contato ou grupo ao lado para iniciar uma conversa.</p>
                    </div>
                )}
            </Card>

            {/* Modal de Detalhes do Grupo (Ver Participantes, Editar, Excluir, Sair) */}
            <Dialog open={isGroupDetailsOpen} onOpenChange={setIsGroupDetailsOpen}>
                <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="p-5 border-b bg-indigo-50/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-2xl">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold text-slate-800">
                                    {groupDetails?.name || selectedContact?.name}
                                </DialogTitle>
                                <DialogDescription className="text-xs text-slate-500">
                                    Grupo de Conversa • {groupDetails?.participants?.length || 0} participantes
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Participantes do Grupo
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleOpenEditGroup}
                                className="text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50 gap-1.5 h-8"
                            >
                                <Edit className="w-3.5 h-3.5" />
                                Editar Grupo
                            </Button>
                        </div>

                        {isLoadingGroupDetails ? (
                            <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Carregando participantes...
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {groupDetails?.participants?.map((participant: any) => (
                                    <div key={participant.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2.5">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={participant.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.name}`} />
                                                <AvatarFallback>{participant.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-xs font-bold text-slate-800">{participant.name}</p>
                                                <p className="text-[10px] text-slate-400">{participant.email || participant.role}</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full capitalize">
                                            {participant.role}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="p-4 border-t bg-slate-50 flex flex-row items-center justify-between gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsConfirmLeaveGroupOpen(true)}
                            className="text-amber-600 hover:bg-amber-50 gap-1.5 text-xs"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            Sair do Grupo
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setIsConfirmDeleteGroupOpen(true)}
                            className="gap-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Excluir Grupo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Editar Grupo */}
            <Dialog open={isEditGroupOpen} onOpenChange={setIsEditGroupOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Edit className="w-5 h-5 text-indigo-600" />
                            Editar Grupo
                        </DialogTitle>
                        <DialogDescription>
                            Altere o nome do grupo e adicione ou remova participantes.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-group-name">Nome do Grupo</Label>
                            <Input
                                id="edit-group-name"
                                value={editGroupName}
                                onChange={(e) => setEditGroupName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Participantes ({editSelectedParticipants.length} selecionados)</Label>
                            <ScrollArea className="h-48 rounded-md border p-2 bg-slate-50">
                                <div className="space-y-2">
                                    {contacts.filter(c => !c.isGroup).map((contact) => (
                                        <div key={contact.id} className="flex items-center space-x-2 py-1">
                                            <Checkbox
                                                id={`edit-chk-${contact.id}`}
                                                checked={editSelectedParticipants.includes(contact.id)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setEditSelectedParticipants([...editSelectedParticipants, contact.id]);
                                                    } else {
                                                        setEditSelectedParticipants(editSelectedParticipants.filter(id => id !== contact.id));
                                                    }
                                                }}
                                            />
                                            <Label htmlFor={`edit-chk-${contact.id}`} className="text-sm cursor-pointer font-medium leading-none capitalize">
                                                {contact.name} ({contact.role})
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditGroupOpen(false)} disabled={isSavingGroupEdit}>
                            Cancelar
                        </Button>
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            onClick={handleSaveGroupEdit}
                            disabled={!editGroupName.trim() || editSelectedParticipants.length === 0 || isSavingGroupEdit}
                        >
                            {isSavingGroupEdit ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                "Salvar Alterações"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirm Dialogs */}
            <ConfirmDialog
                open={isConfirmDeleteGroupOpen}
                onOpenChange={setIsConfirmDeleteGroupOpen}
                title="Excluir Grupo"
                description="Tem certeza que deseja excluir este grupo permanentemente? Todas as mensagens serão apagadas para todos os membros."
                onConfirm={confirmDeleteGroup}
            />

            <ConfirmDialog
                open={isConfirmLeaveGroupOpen}
                onOpenChange={setIsConfirmLeaveGroupOpen}
                title="Sair do Grupo"
                description="Deseja realmente sair deste grupo? Você deixará de receber novas mensagens."
                onConfirm={confirmLeaveGroup}
            />
        </div>
    );
}
