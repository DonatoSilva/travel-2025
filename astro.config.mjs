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
      FIREBASE_API_KEY: envField.string({ context: 'client', access: 'public' }),
      FIREBASE_AUTH_DOMAIN: envField.string({ context: 'client', access: 'public' }),
      FIREBASE_PROJECT_ID: envField.string({ context: 'client', access: 'public' }),
      FIREBASE_STORAGE_BUCKET: envField.string({ context: 'client', access: 'public' }),
      FIREBASE_MESSAGING_SENDER_ID: envField.string({ context: 'client', access: 'public' }),
      FIREBASE_APP_ID: envField.string({ context: 'client', access: 'public' }),
      CLOUDINARY_CLOUD_NAME: envField.string({ context: 'server', access: 'public' }),
      CLOUDINARY_API_KEY: envField.number({ context: 'server', access: 'public' }),
      CLOUDINARY_API_SECRET: envField.string({ context: 'server', access: 'secret' }),
    }
  }
});