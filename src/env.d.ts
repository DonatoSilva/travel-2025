interface ImportMetaEnv {
    readonly FIREBASE_API_KEY: string;
    readonly FIREBASE_AUTH_DOMAIN: string;
    readonly FIREBASE_PROJECT_ID: string;
    readonly FIREBASE_STORAGE_BUCKET: string;
    readonly FIREBASE_MESSAGING_SENDER_ID: string;
    readonly FIREBASE_APP_ID: string;

    readonly CLOUDINARY_CLOUD_NAME: string;
    readonly CLOUDINARY_API_KEY: number;
    readonly CLOUDINARY_API_SECRET: string;
}

declare namespace App {
    interface Locals {
        userExists: boolean;
    }
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}