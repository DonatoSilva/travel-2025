import type { ServiceAccount } from "firebase-admin";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getSecret } from "astro:env/server";
import { FIREBASE_PROJECT_ID } from "astro:env/client";

const activeApps = getApps();
const serviceAccount = {
    type: "service_account",
    project_id: FIREBASE_PROJECT_ID, // Changed from FIREBASE_APP_ID to FIREBASE_PROJECT_ID
    private_key_id: getSecret('FIREBASE_PRIVATE_KEY_ID'),
    private_key: getSecret('FIREBASE_PRIVATE_KEY'),
    client_email: getSecret('FIREBASE_CLIENT_EMAIL'),
    client_id: getSecret('FIREBASE_CLIENT_ID'),
    auth_uri: getSecret('FIREBASE_AUTH_URI'),
    token_uri: getSecret('FIREBASE_TOKEN_URI'),
    auth_provider_x509_cert_url: getSecret('FIREBASE_AUTH_PROVIDER_X509_CERT_URL'),
    client_x509_cert_url: getSecret('FIREBASE_CLIENT_X509_CERT_URL'),
};

// Add this configuration to match the client app ID
const initApp = () => {
    if (!getApps().length) {
        initializeApp({
            credential: cert(serviceAccount as ServiceAccount),
            projectId: process.env.FIREBASE_PROJECT_ID,
        });
    }
}

export const app = activeApps.length === 0 ? initApp() : activeApps[0];