import type { User as UserType, AlbumPreView, Album as AlbumType, AlbumView, Comment as CommentType } from "@/interfaces";
import { z } from "astro:schema";
import { ActionError, defineAction } from "astro:actions";
import { Album, Comment, User, db, eq, count, Photo } from "astro:db";

import { v2 as cloudinary } from 'cloudinary';
import getServerSecretSignal from "@/utils/cloudinary/getServerSecretSignal";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, getSecret } from 'astro:env/server';
import { firebase } from "@/firebase/config";


// Define valid types 
const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
// Define the schema for the array of image URLs


export const getServerSecretSignature = defineAction({
    accept: 'json',
    input: z.object(
        {
            type: z.string().refine(
                (value) => validTypes.includes(value),
                {
                    message: "Invalid file type",
                }
            ),
            folder: z.string().optional().default(''),
        }
    ),
    handler: async ({ folder }) => {

        cloudinary.config({
            cloud_name: CLOUDINARY_CLOUD_NAME,
            api_key: CLOUDINARY_API_KEY.toString(),
            api_secret: getSecret('CLOUDINARY_API_SECRET'),
        })

        const user = firebase.auth.currentUser;
        const userExists = !!user

        if (!userExists) {
            throw new ActionError({
                code: "UNAUTHORIZED",
                message: "user not unauthorized, plase login",
            });
        }

        const userData = {
            imgUrl: user.photoURL || '',
            name: user.displayName || '',
            id: user.uid
        }

        const userInDB = await db.select().from(User).where(eq(User.id, user.uid));

        if (userInDB.length === 0) {
            const res = await db.insert(User).values(userData);

            if (res.rowsAffected === 0) {
                throw new ActionError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Error adding user",
                });
            }
        }

        return getServerSecretSignal(cloudinary, CLOUDINARY_API_KEY.toString(), getSecret('CLOUDINARY_API_SECRET') ?? '', folder);
    },
});

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