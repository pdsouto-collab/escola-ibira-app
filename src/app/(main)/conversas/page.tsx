"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { mockContacts, Contact, ChatMessage } from "@/lib/data";
import { useAppStore } from "@/lib/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Send, MoveLeft, Users, Plus, Settings, Camera } from "lucide-react";

export default function ChatPage() {
    const { messages, sendMessage } = useAppStore();
    const [contacts, setContacts] = useState<Contact[]>(mockContacts);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [inputText, setInputText] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

    // Edit Group States
    const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
    const [editGroupName, setEditGroupName] = useState("");
    const [editSelectedParticipants, setEditSelectedParticipants] = useState<string[]>([]);
    const [editGroupPhoto, setEditGroupPhoto] = useState<string | undefined>(undefined);
    const editFileInputRef = useRef<HTMLInputElement>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Filter contacts based on search
    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.studentName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter messages for selected contact
    const activeMessages = useMemo(() => selectedContact ? messages.filter(m =>
        (m.senderId === selectedContact.id && m.receiverId === "me") ||
        (m.senderId === "me" && m.receiverId === selectedContact.id)
    ) : [], [selectedContact, messages]);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [activeMessages, selectedContact]);

    const handleSendMessage = () => {
        if (!inputText.trim() || !selectedContact) return;

        const newMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            senderId: "me",
            receiverId: selectedContact.id,
            content: inputText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: true
        };

        sendMessage(newMessage);
        setInputText("");
    };

    const handleCreateGroup = () => {
        if (!newGroupName.trim() || selectedParticipants.length === 0) return;

        const newGroup: Contact = {
            id: `group-${Date.now()}`,
            name: newGroupName,
            role: "Grupo",
            studentName: "Diversos",
            studentId: "varios",
            isGroup: true,
            participantIds: selectedParticipants,
            unreadCount: 0,
            lastMessage: "Grupo criado.",
            lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setContacts([newGroup, ...contacts]);
        setNewGroupName("");
        setSelectedParticipants([]);
        setIsCreateGroupOpen(false);
        setSelectedContact(newGroup);
    };

    const handleOpenEditGroup = () => {
        if (!selectedContact || !selectedContact.isGroup) return;
        setEditGroupName(selectedContact.name);
        setEditSelectedParticipants(selectedContact.participantIds || []);
        setEditGroupPhoto(selectedContact.avatarUrl);
        setIsEditGroupOpen(true);
    };

    const handleEditGroupImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const MAX_DIMENSION = 200; // Small size for avatar
                    if (width > height && width > MAX_DIMENSION) {
                        height *= MAX_DIMENSION / width;
                        width = MAX_DIMENSION;
                    } else if (height > MAX_DIMENSION) {
                        width *= MAX_DIMENSION / height;
                        height = MAX_DIMENSION;
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    setEditGroupPhoto(canvas.toDataURL('image/jpeg', 0.8));
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveGroupEdit = () => {
        if (!selectedContact || !editGroupName.trim() || editSelectedParticipants.length === 0) return;

        const updatedContacts = contacts.map(c => {
            if (c.id === selectedContact.id) {
                return {
                    ...c,
                    name: editGroupName,
                    participantIds: editSelectedParticipants,
                    avatarUrl: editGroupPhoto
                };
            }
            return c;
        });

        setContacts(updatedContacts);
        setSelectedContact(updatedContacts.find(c => c.id === selectedContact.id) || null);
        setIsEditGroupOpen(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSendMessage();
    };

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col md:flex-row gap-4">
            {/* Contacts Sidebar */}
            <Card className={`${selectedContact ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-col overflow-hidden border-r-0 md:border-r`}>
                <div className="p-4 border-b space-y-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-slate-800">Conversas</h1>
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
                                        <Label>Participantes</Label>
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
                                                        <Label htmlFor={`chk-${contact.id}`} className="text-sm cursor-pointer font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                            {contact.name} ({contact.role} de {contact.studentName.split(' ')[0]})
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsCreateGroupOpen(false)}>Cancelar</Button>
                                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleCreateGroup} disabled={!newGroupName.trim() || selectedParticipants.length === 0}>
                                        Criar Grupo
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Buscar responsável ou aluno..."
                            className="pl-9 bg-slate-50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    <div className="flex flex-col">
                        {filteredContacts.map(contact => (
                            <button
                                key={contact.id}
                                onClick={() => setSelectedContact(contact)}
                                className={`flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-left border-b last:border-0 ${selectedContact?.id === contact.id ? 'bg-slate-100' : ''}`}
                            >
                                <div className="relative">
                                    <Avatar className={`h-12 w-12 border ${contact.isGroup && !contact.avatarUrl ? 'bg-indigo-50 flex items-center justify-center' : ''}`}>
                                        {contact.isGroup && !contact.avatarUrl ? (
                                            <Users className="h-6 w-6 text-indigo-500" />
                                        ) : (
                                            <>
                                                <AvatarImage src={contact.avatarUrl ? contact.avatarUrl : `https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.name}`} />
                                                <AvatarFallback>{contact.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </>
                                        )}
                                    </Avatar>
                                    {contact.unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white font-bold">
                                            {contact.unreadCount}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className="font-semibold text-slate-800 truncate">{contact.name}</span>
                                        <span className="text-xs text-slate-400 whitespace-nowrap">{contact.lastMessageTime}</span>
                                    </div>
                                    {contact.isGroup ? (
                                        <p className="text-sm text-slate-500 truncate mb-0.5">
                                            <span className="font-medium text-indigo-500/80">Grupo da Turma</span>
                                        </p>
                                    ) : (
                                        <p className="text-sm text-slate-500 truncate mb-0.5">
                                            <span className="font-medium text-primary/80">({contact.role} de {contact.studentName.split(" ")[0]})</span>
                                        </p>
                                    )}
                                    <p className="text-sm text-slate-400 truncate">
                                        {contact.lastMessage}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </Card>

            {/* Chat Area */}
            <Card className={`${!selectedContact ? 'hidden md:flex' : 'flex'} flex-1 flex-col overflow-hidden bg-slate-50/50`}>
                {selectedContact ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b bg-white flex items-center justify-between shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedContact(null)}>
                                    <MoveLeft className="w-5 h-5" />
                                </Button>
                                <Avatar className={`h-10 w-10 ${selectedContact.isGroup && !selectedContact.avatarUrl ? 'bg-indigo-50 flex flex-col items-center justify-center' : ''}`}>
                                    {selectedContact.isGroup && !selectedContact.avatarUrl ? (
                                        <Users className="h-5 w-5 text-indigo-500" />
                                    ) : (
                                        <>
                                            <AvatarImage src={selectedContact.avatarUrl ? selectedContact.avatarUrl : `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedContact.name}`} />
                                            <AvatarFallback>{selectedContact.name.substring(0, 2)}</AvatarFallback>
                                        </>
                                    )}
                                </Avatar>
                                <div>
                                    <h2 className="font-bold text-slate-800 leading-tight">{selectedContact.name}</h2>
                                    <p className="text-xs text-slate-500">{selectedContact.isGroup ? 'Grupo de Pais e Professores' : `${selectedContact.role} de ${selectedContact.studentName}`}</p>
                                </div>
                            </div>

                            {/* Group Settings / Edit */}
                            {selectedContact.isGroup && (
                                <Dialog open={isEditGroupOpen} onOpenChange={setIsEditGroupOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={handleOpenEditGroup}>
                                            <Settings className="w-5 h-5 text-slate-500" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Configurações do Grupo</DialogTitle>
                                            <DialogDescription>
                                                Altere o nome, atualize a foto ou gerencie os participantes.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">

                                            {/* Photo Upload Area */}
                                            <div className="flex flex-col items-center gap-3">
                                                <Avatar className="h-20 w-20 border-2 cursor-pointer relative group" onClick={() => editFileInputRef.current?.click()}>
                                                    {editGroupPhoto ? (
                                                        <AvatarImage src={editGroupPhoto} />
                                                    ) : (
                                                        <div className="w-full h-full bg-indigo-50 flex items-center justify-center">
                                                            <Users className="h-8 w-8 text-indigo-500" />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Camera className="w-6 h-6 text-white" />
                                                    </div>
                                                </Avatar>
                                                <input
                                                    type="file"
                                                    ref={editFileInputRef}
                                                    onChange={handleEditGroupImageChange}
                                                    accept="image/*"
                                                    className="hidden"
                                                />
                                                <span className="text-xs text-slate-500 font-medium">Trocar Foto do Grupo</span>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="edit-group-name">Nome do Grupo</Label>
                                                <Input
                                                    id="edit-group-name"
                                                    value={editGroupName}
                                                    onChange={(e) => setEditGroupName(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Participantes ({editSelectedParticipants.length})</Label>
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
                                                                <Label htmlFor={`edit-chk-${contact.id}`} className="text-sm cursor-pointer font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                                    {contact.name} ({contact.role} de {contact.studentName.split(' ')[0]})
                                                                </Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </ScrollArea>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsEditGroupOpen(false)}>Cancelar</Button>
                                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleSaveGroupEdit} disabled={!editGroupName.trim() || editSelectedParticipants.length === 0}>
                                                Salvar Alterações
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>

                        {/* Messages List */}
                        <ScrollArea className="flex-1 p-4 bg-slate-100">
                            <div className="space-y-4 max-w-3xl mx-auto flex flex-col">
                                {activeMessages.map(msg => (
                                    <div
                                        key={msg.id}
                                        className={`flex flex-col max-w-[80%] ${msg.senderId === 'me' ? 'self-end items-end' : 'self-start items-start'}`}
                                    >
                                        <div
                                            className={`max-w-full px-4 py-2 rounded-2xl shadow-sm text-sm ${msg.senderId === 'me'
                                                ? 'bg-primary text-white rounded-tr-none'
                                                : 'bg-white text-slate-800 rounded-tl-none border'
                                                }`}
                                        >
                                            {selectedContact.isGroup && msg.senderId !== 'me' && msg.senderName && (
                                                <div className="font-bold text-xs text-indigo-500 mb-0.5">{msg.senderName}</div>
                                            )}
                                            {msg.content}
                                        </div>
                                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                                            {msg.timestamp}
                                        </span>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t">
                            <div className="flex gap-2 max-w-3xl mx-auto">
                                <Input
                                    className="flex-1 bg-slate-50 focus-visible:ring-primary"
                                    placeholder="Digite sua mensagem..."
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                />
                                <Button onClick={handleSendMessage} className="bg-primary hover:bg-primary/90 text-white rounded-full w-10 h-10 p-0 flex items-center justify-center">
                                    <Send className="w-5 h-5 ml-0.5" />
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
                        <p className="max-w-xs mx-auto mt-2">Selecione um contato ao lado para iniciar uma conversa com os responsáveis.</p>
                    </div>
                )}
            </Card>
        </div>
    );
}
