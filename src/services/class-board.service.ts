import { ClassBoardPost } from "@/types/class-board-post";
import { PostInteraction } from "@/types/post-interaction";

export async function getClassBoardPosts(classId?: string): Promise<(ClassBoardPost & { interactions: PostInteraction[] })[]> {
    try {
        const url = classId ? `/api/class-board?classId=${classId}` : `/api/class-board`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch class board posts");
        return res.json();
    } catch (error) {
        console.error("Error fetching class board posts:", error);
        return [];
    }
}

export async function createClassBoardPost(data: Partial<ClassBoardPost>): Promise<ClassBoardPost | null> {
    try {
        const res = await fetch("/api/class-board", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error("Failed to create class board post");
        return res.json();
    } catch (error) {
        console.error("Error creating class board post:", error);
        return null;
    }
}

export async function createPostInteraction(postId: string, data: Partial<PostInteraction>): Promise<PostInteraction | null> {
    try {
        const res = await fetch(`/api/class-board/${postId}/interactions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error("Failed to create post interaction");
        return res.json();
    } catch (error) {
        console.error("Error creating post interaction:", error);
        return null;
    }
}

export async function deletePostInteraction(interactionId: string): Promise<boolean> {
    try {
        const res = await fetch(`/api/class-board/interactions/${interactionId}`, {
            method: "DELETE"
        });
        if (!res.ok) throw new Error("Failed to delete post interaction");
        return true;
    } catch (error) {
        console.error("Error deleting post interaction:", error);
        return false;
    }
}

export async function deleteClassBoardPost(postId: string): Promise<boolean> {
    try {
        const res = await fetch(`/api/class-board/${postId}`, {
            method: "DELETE"
        });
        if (!res.ok) throw new Error("Failed to delete post");
        return true;
    } catch (error) {
        console.error("Error deleting post:", error);
        return false;
    }
}

export async function updateClassBoardPost(postId: string, data: Partial<ClassBoardPost>): Promise<ClassBoardPost | null> {
    try {
        const res = await fetch(`/api/class-board/${postId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error("Failed to update post");
        return res.json();
    } catch (error) {
        console.error("Error updating post:", error);
        return null;
    }
}
