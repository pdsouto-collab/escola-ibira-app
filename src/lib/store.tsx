"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
    mockStudents, Student,
    mockSchedule, ScheduleItem,
    mockDailyLogs, DailyLog,
    mockRecursiveDataSkills, MosaicNode,
    Task, MuralEvent, Project, ChatMessage,
    mockMessages,
    mockClasses, SchoolClass, // Import mockClasses
    User, mockUsers, // Import User types
    LibraryItem, mockLibraryItems // Import new library items
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
        bnccSkillIds: ["EF02CI04", "EF03CI07", "EF01GE01"],
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

    const [isLoaded, setIsLoaded] = useState(false);

    // Load from LocalStorage on mount
    useEffect(() => {
        const CURRENT_VERSION = "1.1"; // Increment this to force updates
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

            // 2. Load other data as usual (or reset if needed, but here we just want to fix projects)
            load("students", setStudents, mockStudents);
            load("classes", setClasses, mockClasses);
            load("schedule", setSchedule, mockSchedule);
            load("dailyLogs", setDailyLogs, mockDailyLogs);
            load("tasks", setTasks, initialTasks);
            load("muralEvents", setMuralEvents, initialMuralEvents);
            load("messages", setMessages, initialMessages);
            load("mosaicData", setMosaicData, mockRecursiveDataSkills);
            load("libraryItems", setLibraryItems, mockLibraryItems);
            load("bnccProgress", setBnccProgress, {});

            // 3. Update version
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
    }, [students, classes, schedule, dailyLogs, tasks, muralEvents, projects, messages, mosaicData, libraryItems, bnccProgress, isLoaded]);

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
            libraryItems, addLibraryItem, updateLibraryItem, removeLibraryItem
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
