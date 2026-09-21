import { ProjectType } from "@/types/project-type";

export const getProjectTypes = async (): Promise<ProjectType[]> => {
    const response = await fetch('/api/project-types');
    if (!response.ok) {
        throw new Error('Failed to fetch project types');
    }
    return response.json();
};

export const createProjectType = async (data: Omit<ProjectType, 'createdAt' | 'updatedAt'>): Promise<ProjectType> => {
    const response = await fetch('/api/project-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Failed to create project type');
    }
    return response.json();
};

export const updateProjectType = async (id: string, data: Partial<ProjectType>): Promise<ProjectType> => {
    const response = await fetch(`/api/project-types/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Failed to update project type');
    }
    return response.json();
};

export const deleteProjectType = async (id: string): Promise<void> => {
    const response = await fetch(`/api/project-types/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete project type');
    }
};
