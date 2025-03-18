import { defineAction } from "astro:actions";
import { db, Subscription } from 'astro:db';
import { z } from "astro:schema";

export const add = defineAction({
    accept: 'json',
    input: z.object({
        email: z.string().email()
    }),
    handler: async ({ email }, context) => {
        try {
            const createdAt = new Date();
            const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!regexEmail.test(email)) {
                throw ({
                    message: "Email-No-Valido",
                    status: "error",
                    error: {}
                });
            }

            await db.insert(Subscription).values({ email, createdAt }).catch((e) => {
                throw e;
            })

            return { message: "Creación correcta", ok: true }
        } catch (error) {
            throw error;
        }
    },

})