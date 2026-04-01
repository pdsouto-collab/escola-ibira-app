export type Mood = "happy" | "neutral" | "sad" | "tired" | "excited";
export type MealAmount = "all" | "most" | "some" | "none";

export interface MealRecord {
    breakfast: MealAmount;
    lunch: MealAmount;
    snack: MealAmount;
}

export interface NapRecord {
    start: string;
    end: string;
    didNotNap?: boolean;
}

export interface DailyLog {
    id: string;
    studentId: string;
    date: string;
    mood: Mood;
    meals: MealRecord;
    nap: NapRecord;
    activities: string[];
    notes: string;
    missingItems?: string;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}
