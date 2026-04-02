export interface PostInteraction {
    id: string;
    postId: string;
    userId: string;
    userName: string;
    userRole?: string;
    type: "like" | "comment";
    content?: string;
    createdAt: string;
}
