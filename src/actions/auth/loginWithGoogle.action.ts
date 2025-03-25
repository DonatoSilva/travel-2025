import { app } from "@/firebase/configServer";
import { getAuth } from "firebase-admin/auth";
import { defineAction } from "astro:actions";
import { db, User, eq } from "astro:db";
import { z } from "astro:schema";
import type { App } from "firebase-admin/app";


export const login = defineAction({
    accept: "json",
    input: z.object({ idToken: z.string() }),
    handler: async ({ idToken }, { cookies }) => {
        try {
            const auth = getAuth(app as App);

            const decodedToken = await auth.verifyIdToken(idToken);
            const userId = decodedToken.uid;

            const userInDB = await db.select().from(User).where(eq(User.id, userId));

            if (userInDB.length === 0) {
                await db.insert(User).values({
                    id: userId,
                    name: decodedToken.name || "",
                    imgUrl: decodedToken.picture || "",
                });
            }

            // 🔥 Crear cookie de sesión
            const sessionCookie = await auth.createSessionCookie(idToken, {
                expiresIn: 60 * 60 * 24 * 5 * 1000,
            });

            cookies.set("__session", sessionCookie, {
                path: "/",
                httpOnly: true,
                secure: true,
            });

            return { ok: true };
        } catch (error) {
            console.error(error);
            throw new Error("Error de autenticación");
        }
    },
});