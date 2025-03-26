import { ActionError, defineAction } from "astro:actions";
import type { Comment as CommentType, ImageBackEnd as Image } from "@/interfaces";
import { z } from "astro:schema";

import { Album, db, eq, Photo, Comment, count } from 'astro:db'
import { v4 as UUID } from 'uuid';
import { verifySession } from "@/assets/scripts/verifySession";

const ImageUrlSchema = z.array(
    z.string().url({
        message: "Invalid image URL",
    })
);

export const addMemory = defineAction({
    accept: 'json',
    input: z.object({
        title: z.string(),
        description: z.string().optional(),
        imageUrls: ImageUrlSchema,
        imgDescription: z.array(z.string()),
    }),
    handler: async ({ title, description, imageUrls, imgDescription }, { cookies }) => {
        try {
            const sessionCookie = cookies.get("__session")?.value;
            const user = await verifySession(sessionCookie ?? '');
            const userExists = !!user;

            if (!userExists) {
                throw new ActionError({
                    code: "UNAUTHORIZED",
                    message: "user not unauthorized, plase login",
                });
            }

            if (!title || !imageUrls || !imgDescription) {
                return {
                    ok: false,
                    status: 400,
                    body: {
                        message: "Missing fields",
                    },
                };
            }
            const queries: any = [];

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

            // Modified to use URLs directly instead of uploading files
            const imagesData: Image[] = imageUrls.map((url, index) => {
                return {
                    id: UUID(),
                    url: url,
                    alt: `imagen correspondiente al album memorys de la ruta Travel-2025, del usuario ${user.displayName}`,
                    type: 'image/' + url.split(".").reverse()[0],
                    description: imgDescription[index],
                    albumId: newAlbumData.id,
                }
            });

            imagesData.forEach((image) => {
                queries.push(db.insert(Photo).values(image));
            });

            await db.batch(queries);

            // Get user data for response
            const userData = {
                imgUrl: user.photoURL || '',
                name: user.displayName || '',
                id: user.uid
            };

            return {
                ok: true,
                status: 200,
                body: {
                    message: "Memory added successfully",
                    albumData: { ...newAlbumData, photos: imagesData, comments: 0, user: userData },
                },
            };
        } catch (error) {
            console.error(error);
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
    handler: async ({ albumId, comment }, { cookies }) => {
        try {
            const album = await db.select().from(Album).where(eq(Album.id, albumId)).limit(1);

            if (!album.length) {
                throw new ActionError({
                    code: "NOT_FOUND",
                    message: "Album not found",
                });
            }

            // Updated user verification to use session cookie
            const sessionCookie = cookies.get("__session")?.value;
            const user = await verifySession(sessionCookie ?? '');
            const userExists = !!user;

            if (!userExists) {
                throw new ActionError({
                    code: "UNAUTHORIZED",
                    message: "user not unauthorized, plase login",
                })
            }

            const newComment: CommentType = {
                id: UUID(),
                userId: user.uid,
                albumId,
                content: comment,
                createdAt: new Date(),
            };

            const arrow = await db.insert(Comment).values(newComment);
            const commentCount = await db.select({ value: count() }).from(Comment).where(eq(Comment.albumId, albumId));
            const commentCountValue = commentCount[0].value;

            if (arrow.rowsAffected === 0) {
                throw new ActionError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Error adding comment",
                });
            }

            return {
                ok: true,
                status: 200,
                body: {
                    message: "Comment added successfully",
                    commentData: newComment,
                    commentCount: commentCountValue,
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
                throw new ActionError({
                    code: "NOT_FOUND",
                    message: "Album not found",
                });
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