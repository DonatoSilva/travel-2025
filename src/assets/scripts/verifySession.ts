import { getAuth } from "firebase-admin/auth";
import type { UserRecord } from "firebase-admin/auth";
import { app } from "@/firebase/configServer";

export const verifySession = async (sessionCookie: string) => {
    const auth = getAuth(app!);

    try {
        if (!sessionCookie) {
            return null;
        }

        const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
        const user = await auth.getUser(decodedToken.uid);

        if (!user) {
            return null;
        }

        return user;
    } catch (error) {
        throw new Error("Invalid session cookie");
    }
}