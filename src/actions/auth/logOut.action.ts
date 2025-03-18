
import { defineAction } from "astro:actions";
import { signOut } from "firebase/auth";
import { firebase } from "src/firebase/config";


export const logOut = defineAction({
    handler: async (_, context) => {
        try {
            const auth = firebase.auth;

            if (!auth.currentUser) {
                return
            }

            await signOut(auth);

            return { ok: true };
        } catch (error) {
            throw error;
        }
    },
})