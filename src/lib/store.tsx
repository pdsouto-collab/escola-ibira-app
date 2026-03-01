"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
    mockStudents, Student,
    mockSchedule, ScheduleItem,
    mockDailyLogs, DailyLog,
    mockRecursiveDataSkills, MosaicNode,
    Task, MuralEvent, Project, ChatMessage,
    mockMessages,
    mockClasses, SchoolClass,
    User, mockUsers,
    LibraryItem, mockLibraryItems,
    KnowledgeNode, mockSkillsTree, mockContentsTree,
    FinalProductType, mockFinalProductTypes,
    Assessment, mockAssessments, Menu, mockMenus,
    PortfolioEntry, mockPortfolio,
    Invoice, mockInvoices
} from "@/lib/data";

interface AppState {
    students: Student[];
    classes: SchoolClass[];
    schedule: ScheduleItem[];
    dailyLogs: DailyLog[];
    tasks: Task[];
    muralEvents: MuralEvent[];
    projects: Project[];
    messages: ChatMessage[];
    mosaicData: MosaicNode[];
    currentUser: User | null;
    users: User[];
    libraryItems: LibraryItem[];
    bnccProgress: Record<string, { status: "not-started" | "in-progress" | "achieved"; evidenceCount: number }>;
    skillsTree: KnowledgeNode[];
    contentsTree: KnowledgeNode[];
    finalProductTypes: FinalProductType[];
    assessments: Assessment[];
    menus: Menu[];
    portfolioEntries: PortfolioEntry[];
    invoices: Invoice[];
}

interface AppContextType extends AppState {
    // Actions
    addStudent: (student: Student) => void;
    updateStudent: (id: string, updates: Partial<Student>) => void;
    removeStudent: (id: string) => void;

    addClass: (schoolClass: SchoolClass) => void;
    updateClass: (id: string, updates: Partial<SchoolClass>) => void;
    removeClass: (id: string) => void;

    toggleTask: (id: string) => void;
    addTask: (task: Task) => void;
    removeTask: (id: string) => void;

    addMuralEvent: (event: MuralEvent) => void;
    updateMuralEvent: (id: string, updates: Partial<MuralEvent>) => void;
    removeMuralEvent: (id: string) => void;
    addCommentToEvent: (eventId: string, comment: string) => void;

    updateSchedule: (items: ScheduleItem[]) => void;

    addProject: (project: Project) => void;
    updateProject: (id: string, updates: Partial<Project>) => void;
    removeProject: (id: string) => void;

    sendMessage: (msg: ChatMessage) => void;

    updateMosaicNode: (nodeId: string, status: "not-started" | "in-progress" | "achieved") => void;
    replaceMosaicData: (newData: MosaicNode[]) => void;

    resetData: () => void;
    setCurrentUser: (user: User) => void;

    // User Management
    addUser: (user: User) => void;
    updateUser: (id: string, updates: Partial<User>) => void;
    removeUser: (id: string) => void;

    // BNCC Progress
    bnccProgress: Record<string, { status: "not-started" | "in-progress" | "achieved"; evidenceCount: number }>;
    updateBNCCStatus: (skillCode: string, status: "not-started" | "in-progress" | "achieved") => void;

    // Library
    addLibraryItem: (item: LibraryItem) => void;
    updateLibraryItem: (id: string, updates: Partial<LibraryItem>) => void;
    removeLibraryItem: (id: string) => void;
    renameSubGroup: (oldName: string, newName: string) => void;
    deleteSubGroup: (name: string) => void;

    // Knowledge Trees
    addKnowledgeNode: (treeType: "skill" | "content", parentId: string | null, node: KnowledgeNode) => void;
    updateKnowledgeNode: (treeType: "skill" | "content", id: string, updates: Partial<KnowledgeNode>) => void;
    removeKnowledgeNode: (treeType: "skill" | "content", id: string) => void;
    duplicateKnowledgeNode: (treeType: "skill" | "content", id: string) => void;

    // Final Product Types
    addFinalProductType: (type: FinalProductType) => void;
    updateFinalProductType: (id: string, updates: Partial<FinalProductType>) => void;
    removeFinalProductType: (id: string) => void;

    // Daily Logs
    addDailyLog: (log: DailyLog) => void;
    updateDailyLog: (id: string, updates: Partial<DailyLog>) => void;
    removeDailyLog: (id: string) => void;
    // Menus
    addMenu: (menu: Menu) => void;
    updateMenu: (id: string, updates: Partial<Menu>) => void;
    removeMenu: (id: string) => void;

    // Portfolio
    addPortfolioEntry: (entry: PortfolioEntry) => void;
    updatePortfolioEntry: (id: string, updates: Partial<PortfolioEntry>) => void;
    removePortfolioEntry: (id: string) => void;

    // Assessments
    addAssessment: (assessment: Assessment) => void;
    updateAssessment: (id: string, updates: Partial<Assessment>) => void;
    removeAssessment: (id: string) => void;

    // Finance / Invoices
    addInvoice: (invoice: Invoice) => void;
    updateInvoice: (id: string, updates: Partial<Invoice>) => void;
    removeInvoice: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Mock Data
const initialTasks: Task[] = [
    { id: "t1", title: "Finalizar relatórios bimestrais", completed: false, dueDate: "2024-03-01", priority: "high" },
    { id: "t2", title: "Preparar reunião de pais", completed: true, dueDate: "2024-02-20", priority: "medium" },
    { id: "t3", title: "Comprar materiais de arte", completed: false, dueDate: "2024-02-25", priority: "low" },
];

const initialMuralEvents: MuralEvent[] = [
    {
        id: "e1",
        title: "Festa da Primavera",
        description: "Vamos celebrar a chegada da primavera com muita música e dança!",
        date: "2024-09-22T14:00:00",
        author: "Coordenação",
        type: "event",
        location: "Pátio Central",
        image: "/escola-ibira-app/images/festa-primavera.svg",
        comments: [],
        likes: 12
    },
    {
        id: "e2",
        title: "Reunião Pedagógica",
        description: "Alinhamento das pautas do próximo semestre.",
        date: "2024-08-15",
        author: "Direção",
        type: "notice",
        comments: [
            { id: "c1", author: "Ana Pereira", text: "Confirmada!", date: "2024-08-10" }
        ],
        likes: 5
    }
];

const initialProjects: Project[] = [
    {
        id: "p1",
        title: "Horta Comunitária",
        description: "Projeto de cultivo de hortaliças com as crianças do Jardim II.",
        guidingQuestion: "Como as plantas nascem e crescem do feijão à nossa mesa?",
        status: "active",
        startDate: "2024-02-01",
        students: ["1", "3", "5"],
        tags: ["Natureza", "Alimentação Saudável"],
        bnccSkillIds: ["EF02CI04", "EF03CI07", "EF01GE01", "sk-micro-1"],
        contentIds: [],
        imageUrl: "https://images.unsplash.com/photo-1592424001844-04149e8eb3f3?auto=format&fit=crop&q=80&w=600&h=300"
    },
    {
        id: "p2",
        title: "Música do Nosso Corpo",
        description: "Exploração de sons e ritmos utilizando o próprio corpo como instrumento.",
        guidingQuestion: "Quantos sons diferentes o nosso corpo consegue fazer?",
        status: "planning",
        startDate: "2024-04-10",
        students: ["2", "4"],
        tags: ["Artes", "Música", "Corpo e Movimento"],
        bnccSkillIds: ["EF03CI01"],
        contentIds: [],
        imageUrl: "https://images.unsplash.com/photo-1549420042-79fc7341fc7a?auto=format&fit=crop&q=80&w=600&h=300"
    },
    {
        id: "p3",
        title: "Pequenos Construtores",
        description: "Construção de maquetes e circuitos para desenvolver noções espaciais e motoras.",
        guidingQuestion: "Como construir uma cidade onde todos os brinquedos possam morar juntos?",
        status: "completed",
        startDate: "2023-10-01",
        endDate: "2023-12-15",
        students: ["1", "2", "3", "4", "5", "6"],
        tags: ["Geometria", "Socialização", "Matemática"],
        bnccSkillIds: ["EF01MA01", "EF03MA13"],
        contentIds: [],
        imageUrl: "https://images.unsplash.com/photo-1512314889357-e157c22f938d?auto=format&fit=crop&q=80&w=600&h=300"
    }
];

const initialMessages: ChatMessage[] = mockMessages.map(m => ({
    id: m.id,
    senderId: m.sender === "me" ? "me" : m.contactId,
    receiverId: m.sender === "me" ? m.contactId : "me",
    content: m.content,
    timestamp: m.timestamp,
    read: true
}));

export function AppProvider({ children }: { children: React.ReactNode }) {
    // Initialize state from LocalStorage or Default
    const [students, setStudents] = useState<Student[]>(mockStudents);
    const [classes, setClasses] = useState<SchoolClass[]>(mockClasses);
    const [schedule, setSchedule] = useState<ScheduleItem[]>(mockSchedule);
    const [dailyLogs, setDailyLogs] = useState<DailyLog[]>(mockDailyLogs);
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [muralEvents, setMuralEvents] = useState<MuralEvent[]>(initialMuralEvents);
    const [projects, setProjects] = useState<Project[]>(initialProjects);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [mosaicData, setMosaicData] = useState<MosaicNode[]>(mockRecursiveDataSkills);
    const [users, setUsers] = useState<User[]>(mockUsers);
    const [currentUser, setCurrentUser] = useState<User | null>(mockUsers[1]); // Default to Teacher (Cláudia) for dev
    const [libraryItems, setLibraryItems] = useState<LibraryItem[]>(mockLibraryItems);
    const [bnccProgress, setBnccProgress] = useState<Record<string, { status: "not-started" | "in-progress" | "achieved"; evidenceCount: number }>>({});
    const [skillsTree, setSkillsTree] = useState<KnowledgeNode[]>(mockSkillsTree);
    const [contentsTree, setContentsTree] = useState<KnowledgeNode[]>(mockContentsTree);
    const [finalProductTypes, setFinalProductTypes] = useState<FinalProductType[]>(mockFinalProductTypes);
    const [assessments, setAssessments] = useState<Assessment[]>(mockAssessments);
    const [menus, setMenus] = useState<Menu[]>(mockMenus);
    const [portfolioEntries, setPortfolioEntries] = useState<PortfolioEntry[]>(mockPortfolio);
    const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);

    const [isLoaded, setIsLoaded] = useState(false);

    // Load from LocalStorage on mount
    useEffect(() => {
        const CURRENT_VERSION = "1.5"; // Increment this to force updates
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
            // Migration Logic:
            // 1. Force update projects to include new fields (like bnccSkillIds in "Horta Comunitária")
            setProjects(initialProjects);

            // 2. Force update library items to include grades
            setLibraryItems(mockLibraryItems);

            // 3. Force update trees to include new class mappings
            setSkillsTree(mockSkillsTree);
            setContentsTree(mockContentsTree);

            load("bnccProgress", setBnccProgress, {});

            // 4. Update version
            localStorage.setItem("app_version", CURRENT_VERSION);
        } else {
            // Normal Load
            load("students", setStudents, mockStudents);
            load("classes", setClasses, mockClasses);
            load("schedule", setSchedule, mockSchedule);
            load("dailyLogs", setDailyLogs, mockDailyLogs);
            load("tasks", setTasks, initialTasks);
            load("muralEvents", setMuralEvents, initialMuralEvents);
            load("projects", setProjects, initialProjects);
            load("messages", setMessages, initialMessages);
            load("mosaicData", setMosaicData, mockRecursiveDataSkills);
            load("libraryItems", setLibraryItems, mockLibraryItems);
            load("bnccProgress", setBnccProgress, {});
            load("skillsTree", setSkillsTree, mockSkillsTree);
            load("contentsTree", setContentsTree, mockContentsTree);
            load("menus", setMenus, mockMenus);
            load("portfolioEntries", setPortfolioEntries, mockPortfolio);
            load("assessments", setAssessments, mockAssessments);
            load("invoices", setInvoices, mockInvoices);
        }

        setIsLoaded(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Save to LocalStorage on change
    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem("app_students", JSON.stringify(students));
        localStorage.setItem("app_classes", JSON.stringify(classes));
        localStorage.setItem("app_schedule", JSON.stringify(schedule));
        localStorage.setItem("app_dailyLogs", JSON.stringify(dailyLogs));
        localStorage.setItem("app_tasks", JSON.stringify(tasks));
        localStorage.setItem("app_muralEvents", JSON.stringify(muralEvents));
        localStorage.setItem("app_projects", JSON.stringify(projects));
        localStorage.setItem("app_messages", JSON.stringify(messages));
        localStorage.setItem("app_mosaicData", JSON.stringify(mosaicData));
        localStorage.setItem("app_libraryItems", JSON.stringify(libraryItems));
        localStorage.setItem("app_bnccProgress", JSON.stringify(bnccProgress));
        localStorage.setItem("app_skillsTree", JSON.stringify(skillsTree));
        localStorage.setItem("app_contentsTree", JSON.stringify(contentsTree));
        localStorage.setItem("app_menus", JSON.stringify(menus));
        localStorage.setItem("app_portfolioEntries", JSON.stringify(portfolioEntries));
        localStorage.setItem("app_assessments", JSON.stringify(assessments));
        localStorage.setItem("app_invoices", JSON.stringify(invoices));
    }, [students, classes, schedule, dailyLogs, tasks, muralEvents, projects, messages, mosaicData, libraryItems, bnccProgress, skillsTree, contentsTree, menus, portfolioEntries, assessments, invoices, isLoaded]);

    // Actions
    const addStudent = (student: Student) => setStudents(prev => [...prev, student]);
    const updateStudent = (id: string, updates: Partial<Student>) => {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    };
    const removeStudent = (id: string) => setStudents(prev => prev.filter(s => s.id !== id));

    const addClass = (schoolClass: SchoolClass) => setClasses(prev => [...prev, schoolClass]);
    const updateClass = (id: string, updates: Partial<SchoolClass>) => {
        setClasses(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    };
    const removeClass = (id: string) => setClasses(prev => prev.filter(c => c.id !== id));

    const toggleTask = (id: string) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };
    const addTask = (task: Task) => setTasks(prev => [...prev, task]);
    const removeTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

    const addMuralEvent = (event: MuralEvent) => setMuralEvents(prev => [event, ...prev]);
    const updateMuralEvent = (id: string, updates: Partial<MuralEvent>) => {
        setMuralEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    };
    const removeMuralEvent = (id: string) => setMuralEvents(prev => prev.filter(e => e.id !== id));

    const addCommentToEvent = (eventId: string, commentText: string) => {
        setMuralEvents(prev => prev.map(e => {
            if (e.id === eventId) {
                const newComment = {
                    id: Math.random().toString(36).substr(2, 9),
                    author: currentUser?.name || "Usuário",
                    text: commentText,
                    date: new Date().toISOString()
                };
                return { ...e, comments: [...e.comments, newComment] };
            }
            return e;
        }));
    };

    const updateSchedule = (items: ScheduleItem[]) => setSchedule(items);

    const addProject = (project: Project) => setProjects(prev => [...prev, project]);
    const updateProject = (id: string, updates: Partial<Project>) => {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    };
    const removeProject = (id: string) => {
        // 1. Identify skills in this project
        const projectToRemove = projects.find(p => p.id === id);
        if (!projectToRemove) return;

        const skillsInProject = projectToRemove.bnccSkillIds || [];

        // 2. Filter out project from list
        const updatedProjects = projects.filter(p => p.id !== id);
        setProjects(updatedProjects);

        // 3. Check for orphaned skills and reset "in-progress" status
        // We need to check if these skills exist in any of the REMAINING projects
        // If not, and if their status is "in-progress", we reset to "not-started".
        // We do NOT reset "achieved" status.

        setBnccProgress(prev => {
            const newProgress = { ...prev };
            let hasChanges = false;

            skillsInProject.forEach(skillCode => {
                // If current status is not in-progress, skip (preserve achieved or not-started)
                if (newProgress[skillCode]?.status !== "in-progress") return;

                // Check if this skill is used in any OTHER active project
                const isUsedElsewhere = updatedProjects.some(p =>
                    p.status === "active" && p.bnccSkillIds?.includes(skillCode)
                );

                if (!isUsedElsewhere) {
                    // Reset to not-started (effectively removing the key or setting status)
                    // We'll keep the object but status "not-started"
                    newProgress[skillCode] = {
                        ...newProgress[skillCode],
                        status: "not-started"
                    };
                    hasChanges = true;
                }
            });

            return hasChanges ? newProgress : prev;
        });
    };

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

    const addLibraryItem = (item: LibraryItem) => setLibraryItems(prev => [...prev, item]);
    const updateLibraryItem = (id: string, updates: Partial<LibraryItem>) => setLibraryItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    const removeLibraryItem = (id: string) => setLibraryItems(prev => prev.filter(i => i.id !== id));

    const renameSubGroup = (oldName: string, newName: string) => {
        setLibraryItems(prev => prev.map(item => item.subGroup === oldName ? { ...item, subGroup: newName } : item));
    };

    const deleteSubGroup = (name: string) => {
        setLibraryItems(prev => prev.map(item => {
            if (item.subGroup === name) {
                if (item.isBNCC) {
                    return { ...item, subGroup: "BNCC Sem Grupo" };
                }
                return null;
            }
            return item;
        }).filter(Boolean) as LibraryItem[]);
    };

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
                // If it was nested, findAndClone already updated the tree, but we need to insert the clone next to original?
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

    return (
        <AppContext.Provider value={{
            students, classes, schedule, dailyLogs, tasks, muralEvents, projects, messages, currentUser,
            addStudent, updateStudent, removeStudent, addClass, updateClass, removeClass, toggleTask, addTask, removeTask,
            addMuralEvent, updateMuralEvent, removeMuralEvent, addCommentToEvent,
            updateSchedule, addProject, updateProject, removeProject, sendMessage, resetData,
            mosaicData, updateMosaicNode, replaceMosaicData,
            users, setCurrentUser,
            addUser: (user) => setUsers(prev => [...prev, user]),
            updateUser: (id, updates) => setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u)),
            removeUser: (id) => setUsers(prev => prev.filter(u => u.id !== id)),
            bnccProgress, updateBNCCStatus,
            libraryItems, addLibraryItem, updateLibraryItem, removeLibraryItem,
            renameSubGroup, deleteSubGroup,
            skillsTree, contentsTree, addKnowledgeNode, updateKnowledgeNode, removeKnowledgeNode, duplicateKnowledgeNode,
            finalProductTypes,
            addFinalProductType: (type) => setFinalProductTypes(prev => [...prev, type]),
            updateFinalProductType: (id, updates) => setFinalProductTypes(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t)),
            removeFinalProductType: (id) => setFinalProductTypes(prev => prev.filter(t => t.id !== id)),
            addDailyLog: (log) => setDailyLogs(prev => [...prev, log]),
            updateDailyLog: (id, updates) => setDailyLogs(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l)),
            removeDailyLog: (id) => setDailyLogs(prev => prev.filter(l => l.id !== id)),

            menus,
            addMenu: (menu) => setMenus(prev => [...prev, menu]),
            updateMenu: (id, updates) => setMenus(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m)),
            removeMenu: (id) => setMenus(prev => prev.filter(m => m.id !== id)),

            portfolioEntries,
            addPortfolioEntry: (entry) => setPortfolioEntries(prev => [...prev, entry]),
            updatePortfolioEntry: (id, updates) => setPortfolioEntries(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p)),
            removePortfolioEntry: (id) => setPortfolioEntries(prev => prev.filter(p => p.id !== id)),

            assessments,
            addAssessment: (a) => setAssessments(prev => [...prev, a]),
            updateAssessment: (id, updates) => setAssessments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a)),
            removeAssessment: (id) => setAssessments(prev => prev.filter(a => a.id !== id)),

            invoices,
            addInvoice: (inv) => setInvoices(prev => [...prev, inv]),
            updateInvoice: (id, updates) => setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...updates } : inv)),
            removeInvoice: (id) => setInvoices(prev => prev.filter(inv => inv.id !== id)),
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
