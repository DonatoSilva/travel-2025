
import { defineAction } from "astro:actions";
import { db, User, eq } from "astro:db";
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


            if (!auth || !auth.currentUser) {
                throw new Error('Invalid auth')
            }


            const user = auth.currentUser;
            const userData = {
                imgUrl: user.photoURL || '',
                name: user.displayName || '',
                id: user.uid
            }

            const userInDB = await db.select().from(User).where(eq(User.id, user.uid));

            if (userInDB.length === 0) {
                await db.insert(User).values(userData);
            }

            return { ok: true };
        } catch (error) {
            throw error;
        }
    },
})