export interface PortfolioEntry {
    id: string;
    studentId: string;
    date: string;       // Will probably map to DateTime or String
    title: string;
    description: string;
    imageUrl?: string;
    images?: string[];
    tags: string[];
}
