
import { defineAction } from "astro:actions";


export const logOut = defineAction({
    handler: async (_, { cookies }) => {
        try {
            const sessionCookie = cookies.get("__session")?.value;

            if (!sessionCookie) {
                return;
            }

            cookies.delete("__session", {
                path: "/",
                httpOnly: true,
                secure: true,
            })

            return { ok: true };
        } catch (error) {
            throw error;
        }
    },
})