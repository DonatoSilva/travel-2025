import { defineMiddleware } from "astro:middleware"
import { firebase } from "./firebase/config";
const urlsRedirect = [
    "/album",
    "/album/"
]

export const onRequest = defineMiddleware(
    async ({ url, locals, redirect }, next) => {
        const user = firebase.auth.currentUser;
        const userExists = !!user;

        locals.userExists = userExists;

        if (urlsRedirect.includes(url.pathname)) {
            return redirect("/")
        }

        return next();
    }
)