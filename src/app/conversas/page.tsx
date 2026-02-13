"use client";

import { useState, useRef, useEffect } from "react";
import { mockContacts, mockMessages, Contact, Message } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Send, MoveLeft } from "lucide-react";

export default function ChatPage() {
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [messages, setMessages] = useState<Message[]>(mockMessages);
    const [inputText, setInputText] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Filter contacts based on search
    const filteredContacts = mockContacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.studentName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter messages for selected contact
    const activeMessages = messages.filter(m => m.contactId === selectedContact?.id);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [activeMessages, selectedContact]);

    const handleSendMessage = () => {
        if (!inputText.trim() || !selectedContact) return;

        const newMessage: Message = {
            id: `new-${Date.now()}`,
            contactId: selectedContact.id,
            sender: "me",
            content: inputText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages([...messages, newMessage]);
        setInputText("");
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSendMessage();
    };

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col md:flex-row gap-4">
            {/* Contacts Sidebar */}
            <Card className={`${selectedContact ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-col overflow-hidden border-r-0 md:border-r`}>
                <div className="p-4 border-b space-y-4">
                    <h1 className="text-2xl font-bold text-slate-800">Conversas</h1>
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
                                    <Avatar className="h-12 w-12 border">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.name}`} />
                                        <AvatarFallback>{contact.name.substring(0, 2).toUpperCase()}</AvatarFallback>
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
                                    <p className="text-sm text-slate-500 truncate mb-0.5">
                                        <span className="font-medium text-primary/80">({contact.role} de {contact.studentName.split(" ")[0]})</span>
                                    </p>
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
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedContact.name}`} />
                                    <AvatarFallback>{selectedContact.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="font-bold text-slate-800 leading-tight">{selectedContact.name}</h2>
                                    <p className="text-xs text-slate-500">{selectedContact.role} de {selectedContact.studentName}</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages List */}
                        <ScrollArea className="flex-1 p-4 bg-slate-100">
                            <div className="space-y-4 max-w-3xl mx-auto flex flex-col">
                                {activeMessages.map(msg => (
                                    <div
                                        key={msg.id}
                                        className={`flex flex-col max-w-[80%] ${msg.sender === 'me' ? 'self-end items-end' : 'self-start items-start'}`}
                                    >
                                        <div
                                            className={`px-4 py-2 rounded-2xl shadow-sm text-sm ${msg.sender === 'me'
                                                ? 'bg-primary text-white rounded-tr-none'
                                                : 'bg-white text-slate-800 rounded-tl-none border'
                                                }`}
                                        >
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
