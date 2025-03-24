// @ts-check
import { defineConfig, envField } from 'astro/config';

import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

import db from '@astrojs/db';

// https://astro.build/config
export default defineConfig({
  integrations: [db(), tailwind(), react()],
  output: 'server',
  adapter: vercel(),
  env: {
    schema: {
      /// Firebase Client SDK
      FIREBASE_API_KEY: envField.string({ context: 'client', access: 'public' }),
      FIREBASE_AUTH_DOMAIN: envField.string({ context: 'client', access: 'public' }),
      FIREBASE_PROJECT_ID: envField.string({ context: 'client', access: 'public' }),
      FIREBASE_STORAGE_BUCKET: envField.string({ context: 'client', access: 'public' }),
      FIREBASE_MESSAGING_SENDER_ID: envField.string({ context: 'client', access: 'public' }),
      FIREBASE_APP_ID: envField.string({ context: 'client', access: 'public' }),

      /// Firebase Admin SDK
      FIREBASE_PRIVATE_KEY_ID: envField.string({ context: 'server', access: 'secret' }),
      FIREBASE_PRIVATE_KEY: envField.string({ context: 'server', access: 'secret' }),
      FIREBASE_CLIENT_EMAIL: envField.string({ context: 'server', access: 'secret' }),
      FIREBASE_CLIENT_ID: envField.string({ context: 'server', access: 'secret' }),
      FIREBASE_AUTH_URI: envField.string({ context: 'server', access: 'secret' }),
      FIREBASE_TOKEN_URI: envField.string({ context: 'server', access: 'secret' }),
      FIREBASE_AUTH_PROVIDER_X509_CERT_URL: envField.string({ context: 'server', access: 'secret' }),
      FIREBASE_CLIENT_X509_CERT_URL: envField.string({ context: 'server', access: 'secret' }),
      FIREBASE_UNIVERSE_DOMAIN: envField.string({ context: 'server', access: 'secret' }),

      /// Cloudinary
      CLOUDINARY_CLOUD_NAME: envField.string({ context: 'server', access: 'public' }),
      CLOUDINARY_API_KEY: envField.number({ context: 'server', access: 'public' }),
      CLOUDINARY_API_SECRET: envField.string({ context: 'server', access: 'secret' }),
    }
  }
});