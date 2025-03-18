
import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { browserLocalPersistence, GoogleAuthProvider, setPersistence, signInWithCredential } from "firebase/auth";
import { firebase } from "src/firebase/config";


export const login = defineAction({
    accept: 'json',
    input: z.any(),
    handler: async (credentials) => {
        try {
            const credential = GoogleAuthProvider.credentialFromResult(credentials);

            if (!credential) {
                throw new Error('Invalid credential');
            }

            const auth = firebase.auth;

            await setPersistence(auth, browserLocalPersistence)
                .then(
                    async () => {
                        return await signInWithCredential(firebase.auth, credential);
                    }
                )

            return { ok: true };
        } catch (error) {
            throw error;
        }
    },
})