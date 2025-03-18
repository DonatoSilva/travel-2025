
import type { User } from "./user";
import type { ImageBackEnd as Image } from "./image";
import type { Comment } from "./comment";

export interface AlbumPreView {
    id: string,
    user: User;
    description: string,
    likes: number,
    comments: number,
    share: number,
    photos: Image[];
    createdAt: Date,
}

export interface Album {
    id: string,
    userId: string,
    title: string,
    description: string,
    likes: number,
    share: number,
    photos: Image[],
    createdAt: Date,
}

export interface AlbumView {
    id: string,
    user: User,
    title: string,
    description: string,
    likes: number,
    share: number,
    photos: Image[],
    comments: Comment[],
    createdAt: Date,
}