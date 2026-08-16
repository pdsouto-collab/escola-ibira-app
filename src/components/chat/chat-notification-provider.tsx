"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { ContactUser } from "@/types/contact-user";

interface ChatNotificationContextType {
    unreadCount: number;
    contacts: ContactUser[];
    refreshContacts: () => Promise<void>;
}

const ChatNotificationContext = createContext<ChatNotificationContextType>({
    unreadCount: 0,
    contacts: [],
    refreshContacts: async () => {}
});

export const useChatNotifications = () => useContext(ChatNotificationContext);

// Audio synthesis for soft WhatsApp-style notification chime
function playNotificationSound() {
    try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        const audioCtx = new AudioContextClass();

        const now = audioCtx.currentTime;
        // Tone 1: 587.33 Hz (D5)
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(587.33, now);
        gain1.gain.setValueAtTime(0.12, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.start(now);
        osc1.stop(now + 0.18);

        // Tone 2: 880 Hz (A5)
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(880, now + 0.08);
        gain2.gain.setValueAtTime(0.15, now + 0.08);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start(now + 0.08);
        osc2.stop(now + 0.35);
    } catch (e) {
        // AudioContext may be blocked before first user gesture
    }
}

export function ChatNotificationProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const [contacts, setContacts] = useState<ContactUser[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);

    const prevContactsMapRef = useRef<{ [contactId: string]: { unread: number; lastTime: string | null } }>({});
    const isFirstLoadRef = useRef<boolean>(true);

    // Request browser notification permissions on mount
    useEffect(() => {
        if (typeof window !== "undefined" && "Notification" in window) {
            if (Notification.permission === "default") {
                Notification.requestPermission().catch(() => {});
            }
        }
    }, []);

    const fetchContactsAndNotify = useCallback(async () => {
        if (!session?.user?.id) return;

        try {
            const res = await fetch("/api/users/contacts");
            if (!res.ok) return;

            const data: ContactUser[] = await res.json();
            setContacts(data);

            const totalUnread = data.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
            setUnreadCount(totalUnread);

            // Check if there are new incoming unread messages
            if (!isFirstLoadRef.current) {
                for (const contact of data) {
                    const prev = prevContactsMapRef.current[contact.id];
                    const currentUnread = contact.unreadCount || 0;
                    const prevUnread = prev ? prev.unread : 0;

                    // New message arrived for this user or group
                    if (currentUnread > prevUnread && contact.lastMessage && !contact.lastMessage.startsWith("Você:")) {
                        // 1. Play chime
                        playNotificationSound();

                        // 2. Trigger native OS / Browser Notification (like WhatsApp Web)
                        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
                            try {
                                const n = new Notification(`Escola Trilha Ibirá • ${contact.name}`, {
                                    body: contact.lastMessage,
                                    icon: "/logo-ibira.png",
                                    badge: "/logo-ibira.png",
                                    tag: `chat-${contact.id}`,
                                });
                                n.onclick = () => {
                                    window.focus();
                                    window.location.href = "/conversas";
                                };
                            } catch (e) {
                                console.warn("Failed to fire browser notification", e);
                            }
                        }

                        // 3. Trigger In-App Toast Banner
                        toast(`💬 Nova mensagem: ${contact.name}`, {
                            description: contact.lastMessage,
                            action: {
                                label: "Abrir",
                                onClick: () => {
                                    window.location.href = "/conversas";
                                }
                            },
                            duration: 6000
                        });
                    }
                }
            }

            // Update ref
            const newMap: { [id: string]: { unread: number; lastTime: string | null } } = {};
            data.forEach(c => {
                newMap[c.id] = { unread: c.unreadCount || 0, lastTime: c.lastMessageTime };
            });
            prevContactsMapRef.current = newMap;
            isFirstLoadRef.current = false;
        } catch (error) {
            // Silently fail on polling
        }
    }, [session?.user?.id]);

    useEffect(() => {
        fetchContactsAndNotify();
        const interval = setInterval(fetchContactsAndNotify, 4000);
        return () => clearInterval(interval);
    }, [fetchContactsAndNotify]);

    return (
        <ChatNotificationContext.Provider value={{ unreadCount, contacts, refreshContacts: fetchContactsAndNotify }}>
            {children}
        </ChatNotificationContext.Provider>
    );
}
