// @ts-check
import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';

import vercel from '@astrojs/vercel';

import db from '@astrojs/db';

// https://astro.build/config
export default defineConfig({
  integrations: [db(), tailwind()],
  output: 'server',
  adapter: vercel(),
});