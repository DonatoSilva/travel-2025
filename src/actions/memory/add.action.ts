import { defineAction } from "astro:actions";
import type { AlbumPreView, Comment as CommentType, ImageBackEnd as Image } from "@/interfaces";
import { z } from "astro:schema";

import { Album, db, eq, Photo, User, Comment } from 'astro:db'
import { v4 as UUID } from 'uuid';
import { firebase } from "@/firebase/config";
import { imgUp } from "@/utils/ImageUp";
// Esquema para la interfaz "Image"
// accept=".jpg,.jpeg,.png,.webp"
const ACCEPTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
];

// 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ImageSchema = z.array(
    z.instanceof(File)
        .refine((file) => {
            return ACCEPTED_IMAGE_TYPES.includes(file.type);
        }, {
            message: "Invalid image type",
        })
        .refine((file) => {
            return file.size <= MAX_FILE_SIZE;
        }, {
            message: "Invalid image size",
        })
);

export const addMemory = defineAction({
    accept: 'form',
    input: z.object({
        title: z.string(),
        description: z.string().optional(),
        images: ImageSchema,
        imgDescription: z.array(z.string()),
    }),
    handler: async ({ title, description, images, imgDescription }) => {
        const user = firebase.auth.currentUser;

        if (!user) {
            return {
                ok: false,
                status: 401,
                body: {
                    message: "Unauthorized",
                },
            };
        }

        if (!title || !images || !imgDescription) {
            return {
                ok: false,
                status: 400,
                body: {
                    message: "Missing fields",
                },
            };
        }

        try {
            const queries: any = [];

            const userInDB = await db.select().from(User).where(eq(User.id, user.uid));

            if (userInDB.length === 0) {
                queries.push(db.insert(User).values([{
                    imgUrl: user.photoURL || '',
                    name: user.displayName || '',
                    id: user.uid
                }]));
            }

            const newAlbumData = {
                id: UUID(),
                userId: user.uid,
                title,
                description: description ?? '',
                likes: 0,
                share: 0,
                createdAt: new Date(),
            };

            queries.push(db.insert(Album).values(newAlbumData));

            const imagesData: Image[] = await Promise.all(
                images.map(async (image, index) => {
                    const url = await imgUp.update('', image);

                    return {
                        id: UUID(),
                        url: url,
                        alt: `imagen correspondiente al album memorys de la ruta Travel-2025, del usuario ${user.displayName}`,
                        type: image.type,
                        description: imgDescription[index],
                        albumId: newAlbumData.id,
                    }
                })
            );

            imagesData.forEach((image) => {
                queries.push(db.insert(Photo).values(image));
            });

            await db.batch(queries);

            return {
                ok: true,
                status: 200,
                body: {
                    message: "Memory added successfully",
                },
            };
        } catch (error) {
            throw error;
        }
    },
})

/// agregar un commentario a la base de datos Comment
export const addComment = defineAction({
    accept: 'json',
    input: z.object({
        albumId: z.string(),
        comment: z.string(),
    }),
    handler: async ({ albumId, comment }) => {
        try {
            const album = await db.select().from(Album).where(eq(Album.id, albumId)).limit(1);
            if (!album.length) {
                return {
                    ok: false,
                    status: 404,
                    body: {
                        message: "Album not found",
                    },
                };
            }

            const user = firebase.auth.currentUser;
            if (!user) {
                return {
                    ok: false,
                    status: 401,
                    body: {
                        message: "Unauthorized",
                    },
                };
            }

            const userInDB = await db.select().from(User).where(eq(User.id, user.uid));

            if (!userInDB.length) {
                const newUser = {
                    imgUrl: user.photoURL || '',
                    name: user.displayName || '',
                    id: user.uid
                }

                await db.insert(User).values(newUser);
            }

            const newComment: CommentType = {
                id: UUID(),
                userId: user.uid,
                albumId,
                content: comment,
                createdAt: new Date(),
            };

            const arrow = await db.insert(Comment).values(newComment);

            if (arrow.rowsAffected === 0) {
                return {
                    ok: false,
                    status: 500,
                    body: {
                        message: "Error adding comment",
                    },
                };
            }

            return {
                ok: true,
                status: 200,
                body: {
                    message: "Comment added successfully",
                    commentData: newComment,
                },
            };
        } catch (error) {
            throw error;
        }
    }
})

/// aumentar el contador de compartidos en la base de datos
export const addShare = defineAction({
    accept: 'json',
    input: z.object({
        albumId: z.string(),
    }),
    handler: async ({ albumId }) => {
        try {
            const album = await db.select().from(Album).where(eq(Album.id, albumId)).limit(1);

            if (!album.length) {
                return {
                    ok: false,
                    status: 404,
                    body: {
                        message: "Album not found",
                        newShare: 0,
                    },
                };
            }

            const currentShare = album[0].share ?? 0;
            const newShare = currentShare + 1;

            await db.update(Album).set({
                share: newShare,
            }).where(eq(Album.id, albumId));

            return {
                ok: true,
                status: 200,
                body: {
                    message: "Share added successfully",
                    newShare: newShare,
                },
            };
        } catch (error) {
            throw error;
        }
    }
})