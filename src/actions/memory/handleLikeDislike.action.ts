import { defineAction } from "astro:actions";
import { db, eq, User, Like, and, Album } from "astro:db";
import { v4 as UUID } from 'uuid';
import { z } from "astro:schema";
import { verifySession } from "@scripts/verifySession";

import type { User as UserType } from "@/interfaces"
import type { Like as LikeType } from "@/interfaces/memory/likes";

export const handleLikeDislike = defineAction({
    accept: 'json',
    input: z.object({
        albumId: z.string(),
    }),
    handler: async ({ albumId }, { cookies }) => {
        try {
            // Use session cookie instead of client-side Firebase auth
            const sessionCookie = cookies.get("__session")?.value;
            const user = await verifySession(sessionCookie ?? '');

            if (!user) {
                throw new Error('User not authenticated');
            }

            const existUser = await db.select().from(User).where(eq(User.id, user.uid));

            // Rest of the function remains the same
            const albumData = await db.select().from(Album).where(eq(Album.id, albumId)).limit(1);
            const currentLikes = albumData[0].likes ?? 0;

            if (existUser.length === 0) {
                const newUser: UserType = {
                    id: user.uid,
                    imgUrl: user.photoURL ?? '',
                    name: user.displayName ?? '',
                }

                await db.insert(User).values(newUser);
            }

            const getLike = await db.select().from(Like).where(and(eq(Like.userId, user.uid), eq(Like.albumId, albumId)))
            let isLiked = !!getLike.length;

            let newValueLikes = 0;

            if (isLiked) {
                newValueLikes = currentLikes - 1;
                await db.delete(Like).where(and(eq(Like.userId, user.uid), eq(Like.albumId, albumId)));

            } else {
                newValueLikes = currentLikes + 1;

                const newLike: LikeType = {
                    id: UUID(),
                    userId: user.uid,
                    albumId,
                }

                await db.insert(Like).values(newLike);
            }

            await db.update(Album).set({ likes: newValueLikes }).where(eq(Album.id, albumId));

            return {
                success: true,
                message: isLiked ? 'Disliked' : 'Liked',
                statusLike: !isLiked,
                likes: isLiked ? currentLikes - 1 : currentLikes + 1,
            };
        } catch (error) {
            throw error;
        }
    },
})