export interface AssessmentAttachment {
    id: string;
    type: "photo" | "document" | "audio" | string;
    url: string;         // base64 data URL ou link
    name?: string;
    capturedAt: string;  // ISO date
}
