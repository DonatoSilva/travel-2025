import type { User as UserType, AlbumPreView, Album as AlbumType, AlbumView, Comment as CommentType } from "@/interfaces";
import { z } from "astro:schema";
import { defineAction } from "astro:actions";
import { Album, Comment, User, db, eq, count, Photo } from "astro:db";

export const getAlbums = defineAction({
    accept: "json",
    input: z.object({}),
    handler: async ({ },) => {
        try {
            const albumsCardData: AlbumPreView[] = []

            const albumsData = await db.select().from(Album).all();

            for (const album of albumsData) {
                const countComments: number = await db
                    .select({ count: count(Comment.id) })
                    .from(Comment)
                    .where(eq(Comment.albumId, album.id))
                    .then((result) => result[0].count);

                const user: UserType = await db.select().from(User).where(eq(User.id, album.userId)).then((result) => result[0]) as UserType;
                const photos = await db.select().from(Photo).where(eq(Photo.albumId, album.id)).all()

                const albumCardData: AlbumPreView = {
                    id: album.id,
                    user: {
                        id: user.id,
                        name: user.name,
                        imgUrl: user.imgUrl,
                    },
                    description: album.description,
                    likes: album.likes ?? 0,
                    comments: countComments,
                    share: album.share ?? 0,
                    photos: photos,
                    createdAt: album.createdAt,
                }

                albumsCardData.push(albumCardData);
            }

            return albumsCardData.reverse();
        } catch (error) {
            throw error;
        }
    },
})

//obtener album por id
export const getAlbumForID = defineAction({
    accept: "json",
    input: z.object({
        id: z.string(),
    }),
    handler: async ({ id }) => {
        try {
            const album = await db.select().from(Album).where(eq(Album.id, id)).then((result) => result[0]) as AlbumType;

            if (!album) {
                return null;
            }

            const user = await db.select().from(User).where(eq(User.id, album.userId)).then((result) => result[0]) as UserType;
            const photos = await db.select().from(Photo).where(eq(Photo.albumId, album.id)).all();
            const comments = await (await db.select().from(Comment).where(eq(Comment.albumId, album.id))).reverse();

            const albumData: AlbumView = {
                id: album.id,
                user: {
                    id: user.id,
                    name: user.name,
                    imgUrl: user.imgUrl,
                },
                title: album.title,
                description: album.description,
                likes: album.likes,
                share: album.share,
                photos: photos,
                comments: comments,
                createdAt: album.createdAt,
            }

            return albumData;
        } catch (error) {
            throw error;
        }
    },
})