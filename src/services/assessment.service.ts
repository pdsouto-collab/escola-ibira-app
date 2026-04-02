import { Assessment } from '@/types/assessment';

export const AssessmentService = {
    async getAll(params?: { studentId?: string; projectId?: string }): Promise<Assessment[]> {
        const queryParams = new URLSearchParams();
        if (params?.studentId) queryParams.append('studentId', params.studentId);
        if (params?.projectId) queryParams.append('projectId', params.projectId);

        const url = `/api/assessments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch assessments');
        return response.json();
    },

    async getById(id: string): Promise<Assessment> {
        const response = await fetch(`/api/assessments/${id}`);
        if (!response.ok) throw new Error('Failed to fetch assessment');
        return response.json();
    },

    async create(data: Partial<Assessment>): Promise<Assessment> {
        const response = await fetch('/api/assessments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create assessment');
        return response.json();
    },

    async update(id: string, data: Partial<Assessment>): Promise<Assessment> {
        const response = await fetch(`/api/assessments/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update assessment');
        return response.json();
    },

    async delete(id: string): Promise<void> {
        const response = await fetch(`/api/assessments/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete assessment');
    }
};
