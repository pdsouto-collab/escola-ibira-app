export interface SchoolClass {
    id: string;
    name: string;
    description?: string;
    teacherId?: string; // ID of the assigned teacher
    assistantId?: string; // ID of the assigned pedagogical assistant
}
