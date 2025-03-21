import { ActionError, defineAction } from "astro:actions";
import type { Comment as CommentType, ImageBackEnd as Image } from "@/interfaces";
import { z } from "astro:schema";
import { imgUp } from "@/utils/ImageUp";

import { Album, db, eq, Photo, User, Comment } from 'astro:db'
import { v4 as UUID } from 'uuid';
import { firebase } from "@/firebase/config";
import { chunkImage } from "@/utils/chunkImage";

// Define max file size: 4.5MB
const MAX_FILE_SIZE = 3 * 1024 * 1024;

// Define valid types 
const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

// Add file upload action with size validation
export const uploadImage = defineAction({
    accept: 'form',
    input: z.object({
        chunk: z.instanceof(ArrayBuffer).refine((data) => data.byteLength <= MAX_FILE_SIZE, {
            message: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`
        }),
        filename: z.string().nonempty(),
        type: z.string(),
        chunkIndex: z.number(),
        totalChunks: z.number(),
    }),
    handler: async ({ chunk, filename, type, chunkIndex, totalChunks }) => {
        try {
            const user = firebase.auth.currentUser;
            const userExists = !!user

            if (!userExists) {
                throw new ActionError({ code: 'UNAUTHORIZED', message: 'user unauthorized' });
            }

            if (!validTypes.includes(type)) {
                throw new ActionError({ code: 'BAD_REQUEST', message: 'Invalid file type' });
            }

            const chunksImage = await chunkImage.saveChunk(chunk, filename, chunkIndex, totalChunks);

            if (!chunksImage) {
                throw new Error("Failed to upload image");
            }

            if (chunksImage === 202) {
                return {
                    ok: true,
                    status: 200,
                    body: {
                        message: `chunk-${chunkIndex} uploaded successfully`,
                    },
                };
            }

            const combinedBuffer = await chunkImage.mergeChunks(filename);

            if (!combinedBuffer) {
                throw new Error("Failed to merge image chunks");
            }

            const typeImage = type

            const blob = new Blob([combinedBuffer], { type: typeImage });

            const image = new File([blob], filename, { type: typeImage });

            const imageUrl = await imgUp.update('', image);

            if (!imageUrl) {
                return {
                    ok: false,
                    status: 500,
                    body: {
                        message: "Failed to upload image",
                    },
                };
            }

            return {
                ok: true,
                status: 200,
                body: {
                    message: "Image uploaded successfully",
                    imageUrl,
                },
            };
        } catch (error) {
            console.error("Error uploading image:", error);
            return {
                ok: false,
                status: 500,
                body: {
                    message: "Error uploading image",
                    error: error instanceof Error ? error.message : String(error),
                },
            };
        }
    },
});

const ImageUrlSchema = z.array(
    z.string().url({
        message: "Invalid image URL",
    })
);

export const addMemory = defineAction({
    accept: 'json', // Changed from 'form' to 'json'
    input: z.object({
        title: z.string(),
        description: z.string().optional(),
        imageUrls: ImageUrlSchema, // Changed from images to imageUrls
        imgDescription: z.array(z.string()),
    }),
    handler: async ({ title, description, imageUrls, imgDescription }) => {
        try {
            const user = firebase.auth.currentUser;
            const userExists = !!user

            if (!userExists) {
                return {
                    ok: false,
                    status: 401,
                    body: {
                        message: "Unauthorized",
                    },
                };
            }

            const userData = {
                imgUrl: user.photoURL || '',
                name: user.displayName || '',
                id: user.uid
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

            const userInDB = await db.select().from(User).where(eq(User.id, user.uid));

            if (userInDB.length === 0) {
                queries.push(db.insert(User).values([userData]));
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
            const userExists = !!user

            if (!userExists) {
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