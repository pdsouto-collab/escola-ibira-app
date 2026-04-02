"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

import {
    mockRecursiveDataSkills, MosaicNode,
    ChatMessage,
    mockMessages,
    KnowledgeNode, mockSkillsTree, mockContentsTree,
    Assessment, mockAssessments, Menu, mockMenus,
    ClassBoardPost, mockClassBoardPosts, PostInteraction, mockPostInteractions
} from "@/lib/data";

interface AppState {
    messages: ChatMessage[];
    mosaicData: MosaicNode[];
    bnccProgress: Record<string, { status: "not-started" | "in-progress" | "achieved"; evidenceCount: number }>;
    skillsTree: KnowledgeNode[];
    contentsTree: KnowledgeNode[];
    assessments: Assessment[];
    menus: Menu[];
    classBoardPosts: ClassBoardPost[];
    postInteractions: PostInteraction[];
}

interface AppContextType extends AppState {

    sendMessage: (msg: ChatMessage) => void;

    updateMosaicNode: (nodeId: string, status: "not-started" | "in-progress" | "achieved") => void;
    replaceMosaicData: (newData: MosaicNode[]) => void;

    resetData: () => void;

    // BNCC Progress
    bnccProgress: Record<string, { status: "not-started" | "in-progress" | "achieved"; evidenceCount: number }>;
    updateBNCCStatus: (skillCode: string, status: "not-started" | "in-progress" | "achieved") => void;

    // Knowledge Trees
    addKnowledgeNode: (treeType: "skill" | "content", parentId: string | null, node: KnowledgeNode) => void;
    updateKnowledgeNode: (treeType: "skill" | "content", id: string, updates: Partial<KnowledgeNode>) => void;
    removeKnowledgeNode: (treeType: "skill" | "content", id: string) => void;
    duplicateKnowledgeNode: (treeType: "skill" | "content", id: string) => void;

    // Menus
    addMenu: (menu: Menu) => void;
    updateMenu: (id: string, updates: Partial<Menu>) => void;
    removeMenu: (id: string) => void;

    // Assessments
    addAssessment: (assessment: Assessment) => void;
    updateAssessment: (id: string, updates: Partial<Assessment>) => void;
    removeAssessment: (id: string) => void;

    // Class Board
    addClassBoardPost: (post: ClassBoardPost) => void;
    addPostInteraction: (interaction: PostInteraction) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);


const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";




const initialMessages: ChatMessage[] = mockMessages.map(m => ({
    id: m.id,
    senderId: m.sender === "me" ? "me" : m.contactId,
    receiverId: m.sender === "me" ? m.contactId : "me",
    content: m.content,
    timestamp: m.timestamp,
    read: true,
    senderName: m.senderName
}));

export function AppProvider({ children }: { children: React.ReactNode }) {
    // Initialize state from LocalStorage or Default
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [mosaicData, setMosaicData] = useState<MosaicNode[]>(mockRecursiveDataSkills);
    const [bnccProgress, setBnccProgress] = useState<Record<string, { status: "not-started" | "in-progress" | "achieved"; evidenceCount: number }>>({});
    const [skillsTree, setSkillsTree] = useState<KnowledgeNode[]>(mockSkillsTree);
    const [contentsTree, setContentsTree] = useState<KnowledgeNode[]>(mockContentsTree);
    const [assessments, setAssessments] = useState<Assessment[]>(mockAssessments);
    const [menus, setMenus] = useState<Menu[]>(mockMenus);
    const [classBoardPosts, setClassBoardPosts] = useState<ClassBoardPost[]>(mockClassBoardPosts);
    const [postInteractions, setPostInteractions] = useState<PostInteraction[]>(mockPostInteractions);

    const [isLoaded, setIsLoaded] = useState(false);

    // Load from LocalStorage on mount
    useEffect(() => {
        const CURRENT_VERSION = "3.1"; // Increment this to force updates
        const storedVersion = localStorage.getItem("app_version");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const load = (key: string, setter: React.Dispatch<React.SetStateAction<any>>, defaultVal: any) => {
            const saved = localStorage.getItem(`app_${key}`);
            if (saved) {
                try {
                    setter(JSON.parse(saved));
                } catch (e) {
                    console.error(`Failed to parse ${key}`, e);
                    setter(defaultVal);
                }
            } else {
                setter(defaultVal);
            }
        };

        if (storedVersion !== CURRENT_VERSION) {
            console.log("Migrating data to version", CURRENT_VERSION);
            // Migration Logic: Force Reset of critical data to sync with new tree structure
            setSkillsTree(mockSkillsTree);
            setContentsTree(mockContentsTree);
            setAssessments(mockAssessments);
            setClassBoardPosts(mockClassBoardPosts);
            setPostInteractions(mockPostInteractions);

            load("bnccProgress", setBnccProgress, {});

            // Update version
            localStorage.setItem("app_version", CURRENT_VERSION);
        } else {
            // Normal Load
            load("messages", setMessages, initialMessages);
            load("mosaicData", setMosaicData, mockRecursiveDataSkills);
            load("bnccProgress", setBnccProgress, {});
            load("skillsTree", setSkillsTree, mockSkillsTree);
            load("contentsTree", setContentsTree, mockContentsTree);
            load("menus", setMenus, mockMenus);
            load("assessments", setAssessments, mockAssessments);
            load("classBoardPosts", setClassBoardPosts, mockClassBoardPosts);
            load("postInteractions", setPostInteractions, mockPostInteractions);
        }


        setIsLoaded(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Save to LocalStorage on change
    useEffect(() => {
        if (!isLoaded) return;
        try {
            localStorage.setItem("app_messages", JSON.stringify(messages));
            localStorage.setItem("app_mosaicData", JSON.stringify(mosaicData));
            localStorage.setItem("app_bnccProgress", JSON.stringify(bnccProgress));
            localStorage.setItem("app_skillsTree", JSON.stringify(skillsTree));
            localStorage.setItem("app_contentsTree", JSON.stringify(contentsTree));
            localStorage.setItem("app_menus", JSON.stringify(menus));
            localStorage.setItem("app_assessments", JSON.stringify(assessments));
            localStorage.setItem("app_classBoardPosts", JSON.stringify(classBoardPosts));
            localStorage.setItem("app_postInteractions", JSON.stringify(postInteractions));
        } catch (error) {
            console.error("Erro ao salvar no cache local. O limite de armazenamento pode ter sido atingido.", error);
        }
    }, [messages, mosaicData, bnccProgress, skillsTree, contentsTree, menus, assessments, classBoardPosts, postInteractions, isLoaded]);



    const sendMessage = (msg: ChatMessage) => setMessages(prev => [...prev, msg]);

    const updateMosaicNode = (nodeId: string, status: "not-started" | "in-progress" | "achieved") => {
        const updateRecursive = (nodes: MosaicNode[]): MosaicNode[] => {
            return nodes.map(node => {
                if (node.id === nodeId) {
                    return { ...node, status };
                }
                if (node.children) {
                    return { ...node, children: updateRecursive(node.children) };
                }
                return node;
            });
        };
        setMosaicData(prev => updateRecursive(prev));
    };

    const updateBNCCStatus = (skillCode: string, status: "not-started" | "in-progress" | "achieved") => {
        setBnccProgress(prev => ({
            ...prev,
            [skillCode]: {
                status,
                evidenceCount: (prev[skillCode]?.evidenceCount || 0) + (status === "achieved" ? 1 : 0) // Simple increment logic
            }
        }));
    };

    const resetData = () => {

        if (confirm("Isso apagará todos os dados locais e restaurará o padrão. Continuar?")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    const replaceMosaicData = (newData: MosaicNode[]) => setMosaicData(newData);

    const addKnowledgeNode = (treeType: "skill" | "content", parentId: string | null, node: KnowledgeNode) => {
        const updater = (prev: KnowledgeNode[]): KnowledgeNode[] => {
            if (!parentId) return [...prev, node];

            const addRecursive = (nodes: KnowledgeNode[]): KnowledgeNode[] => {
                return nodes.map(n => {
                    if (n.id === parentId) {
                        return { ...n, children: [...(n.children || []), node] };
                    }
                    if (n.children && n.children.length > 0) {
                        return { ...n, children: addRecursive(n.children) };
                    }
                    return n;
                });
            };
            return addRecursive(prev);
        };

        if (treeType === "skill") setSkillsTree(updater);
        else setContentsTree(updater);
    };

    const updateKnowledgeNode = (treeType: "skill" | "content", id: string, updates: Partial<KnowledgeNode>) => {
        const updater = (prev: KnowledgeNode[]): KnowledgeNode[] => {
            const updateRecursive = (nodes: KnowledgeNode[]): KnowledgeNode[] => {
                return nodes.map(n => {
                    if (n.id === id) {
                        return { ...n, ...updates };
                    }
                    if (n.children && n.children.length > 0) {
                        return { ...n, children: updateRecursive(n.children) };
                    }
                    return n;
                });
            };
            return updateRecursive(prev);
        };

        if (treeType === "skill") setSkillsTree(updater);
        else setContentsTree(updater);
    };

    const removeKnowledgeNode = (treeType: "skill" | "content", id: string) => {
        const updater = (prev: KnowledgeNode[]): KnowledgeNode[] => {
            const removeRecursive = (nodes: KnowledgeNode[]): KnowledgeNode[] => {
                return nodes.filter(n => n.id !== id).map(n => {
                    if (n.children && n.children.length > 0) {
                        return { ...n, children: removeRecursive(n.children) };
                    }
                    return n;
                });
            };
            return removeRecursive(prev);
        };

        if (treeType === "skill") setSkillsTree(updater);
        else setContentsTree(updater);
    };

    const duplicateKnowledgeNode = (treeType: "skill" | "content", id: string) => {
        const updater = (prev: KnowledgeNode[]): KnowledgeNode[] => {
            const findAndClone = (nodes: KnowledgeNode[]): { cloned: KnowledgeNode | null; newNodes: KnowledgeNode[] } => {
                let found: KnowledgeNode | null = null;
                const updated = nodes.map(n => {
                    if (n.id === id) {
                        const cloneNode = (node: KnowledgeNode): KnowledgeNode => {
                            const newId = `node-${Math.random().toString(36).substr(2, 9)}`;
                            return {
                                ...node,
                                id: newId,
                                children: node.children ? node.children.map(cloneNode) : []
                            };
                        };
                        found = cloneNode(n);
                        found.name = `${found.name} (Cópia)`;
                        return n;
                    }
                    if (n.children && n.children.length > 0) {
                        const { cloned, newNodes } = findAndClone(n.children);
                        if (cloned) {
                            found = cloned;
                            return { ...n, children: newNodes };
                        }
                    }
                    return n;
                });

                return { cloned: found, newNodes: updated };
            };

            const { cloned, newNodes } = findAndClone(prev);
            if (cloned) {
                // If it was a root node, add it to the list
                if (prev.some(n => n.id === id)) {
                    return [...newNodes, cloned];
                }
                // The current findAndClone doesn't insert next to original for nested nodes well.
                // Let's refine: duplication usually happens at the same level.

                const insertClone = (nodes: KnowledgeNode[]): KnowledgeNode[] => {
                    const idx = nodes.findIndex(n => n.id === id);
                    if (idx !== -1) {
                        const cloneNode = (node: KnowledgeNode): KnowledgeNode => {
                            const newId = `node-${Math.random().toString(36).substr(2, 9)}`;
                            return {
                                ...node,
                                id: newId,
                                children: node.children ? node.children.map(cloneNode) : []
                            };
                        };
                        const clonedNode = cloneNode(nodes[idx]);
                        clonedNode.name = `${clonedNode.name} (Cópia)`;
                        const result = [...nodes];
                        result.splice(idx + 1, 0, clonedNode);
                        return result;
                    }
                    return nodes.map(n => n.children ? { ...n, children: insertClone(n.children) } : n);
                };
                return insertClone(prev);
            }
            return prev;
        };

        if (treeType === "skill") setSkillsTree(updater);
        else setContentsTree(updater);
    };

    const addClassBoardPost = (post: ClassBoardPost) => setClassBoardPosts(prev => [post, ...prev]);
    const addPostInteraction = (interaction: PostInteraction) => setPostInteractions(prev => [...prev, interaction]);

    return (
        <AppContext.Provider value={{
            messages,
            sendMessage, resetData,
            mosaicData, updateMosaicNode, replaceMosaicData,
            bnccProgress, updateBNCCStatus,
            skillsTree, contentsTree, addKnowledgeNode, updateKnowledgeNode, removeKnowledgeNode, duplicateKnowledgeNode,

            menus,
            addMenu: (menu) => setMenus(prev => [...prev, menu]),
            updateMenu: (id, updates) => setMenus(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m)),
            removeMenu: (id) => setMenus(prev => prev.filter(m => m.id !== id)),

            assessments,
            addAssessment: (a) => setAssessments(prev => [...prev, a]),
            updateAssessment: (id, updates) => setAssessments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a)),
            removeAssessment: (id) => setAssessments(prev => prev.filter(a => a.id !== id)),

            classBoardPosts,
            postInteractions,
            addClassBoardPost,
            addPostInteraction
        }}>
            {children}
        </AppContext.Provider>
    );
}

export const useAppStore = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("useAppStore must be used within an AppProvider");
    return context;
};
