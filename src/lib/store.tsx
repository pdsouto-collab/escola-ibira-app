"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
    mockStudents, Student,
    mockSchedule, ScheduleItem,
    mockDailyLogs, DailyLog,
    mockRecursiveDataSkills, MosaicNode,
    Task, MuralEvent, Project, ChatMessage,
    mockMessages,
    mockClasses, SchoolClass // Import mockClasses
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
    currentUser: { name: string; role: string; avatar: string };
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
    addCommentToEvent: (eventId: string, comment: string) => void;

    updateSchedule: (items: ScheduleItem[]) => void;

    addProject: (project: Project) => void;
    updateProject: (id: string, updates: Partial<Project>) => void;

    sendMessage: (msg: ChatMessage) => void;

    updateMosaicNode: (nodeId: string, status: "not-started" | "in-progress" | "achieved") => void;
    replaceMosaicData: (newData: MosaicNode[]) => void;

    resetData: () => void;
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
        status: "active",
        startDate: "2024-02-01",
        students: ["1", "3", "5"],
        tags: ["Natureza", "Alimentação Saudável"]
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

    const currentUser = { name: "Ana Pereira", role: "Professor", avatar: "https://github.com/shadcn.png" };

    const [isLoaded, setIsLoaded] = useState(false);

    // Load from LocalStorage on mount
    useEffect(() => {
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

        load("students", setStudents, mockStudents);
        load("classes", setClasses, mockClasses);
        load("schedule", setSchedule, mockSchedule);
        load("dailyLogs", setDailyLogs, mockDailyLogs);
        load("tasks", setTasks, initialTasks);
        load("muralEvents", setMuralEvents, initialMuralEvents);
        load("projects", setProjects, initialProjects);
        load("messages", setMessages, initialMessages);
        load("mosaicData", setMosaicData, mockRecursiveDataSkills);

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
    }, [students, classes, schedule, dailyLogs, tasks, muralEvents, projects, messages, mosaicData, isLoaded]);

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
    const addCommentToEvent = (eventId: string, commentText: string) => {
        setMuralEvents(prev => prev.map(e => {
            if (e.id === eventId) {
                const newComment = {
                    id: Math.random().toString(36).substr(2, 9),
                    author: currentUser.name,
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

    const resetData = () => {
        // eslint-disable-next-line no-restricted-globals
        if (confirm("Isso apagará todos os dados locais e restaurará o padrão. Continuar?")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    const replaceMosaicData = (newData: MosaicNode[]) => setMosaicData(newData);

    return (
        <AppContext.Provider value={{
            students, classes, schedule, dailyLogs, tasks, muralEvents, projects, messages, currentUser,
            addStudent, updateStudent, removeStudent, addClass, updateClass, removeClass, toggleTask, addTask, removeTask, addMuralEvent, addCommentToEvent,
            updateSchedule, addProject, updateProject, sendMessage, resetData,
            mosaicData, updateMosaicNode, replaceMosaicData
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
