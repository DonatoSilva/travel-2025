import { defineMiddleware } from "astro:middleware"
import { getAuth } from "firebase-admin/auth";
import { app } from "./firebase/configServer";
const urlsRedirect = [
    "/album",
    "/album/"
]

export const onRequest = defineMiddleware(
    async ({ url, locals, redirect, cookies }, next) => {
        const auth = getAuth(app)
        const sessionCookie = cookies.get("__session")?.value;

        locals.user = null;
        locals.isAuthenticated = false;

        if (urlsRedirect.includes(url.pathname)) {
            return redirect("/")
        }

        if (!sessionCookie) return next();

        const sessionCache = locals.sessionCache || (locals.sessionCache = new Map());

        if (sessionCache.has(sessionCookie)) {
            locals.user = sessionCache.get(sessionCookie);
            locals.isAuthenticated = true;
            return next();
        }

        const decodedToken = await auth.verifySessionCookie(sessionCookie, true)
            .catch((error) => {
                console.log(error)
            });

        const user = await auth.getUser(decodedToken.uid);
        sessionCache.set(sessionCookie, user);

        if (decodedToken) {
            locals.user = user;
            locals.isAuthenticated = true;
        }

        return next();
    }
)