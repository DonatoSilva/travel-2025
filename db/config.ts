import { defineDb, defineTable, column } from 'astro:db';

const Subscription = defineTable({
  columns: {
    id: column.number({primaryKey: true}),
    email: column.text(),
    createdAt: column.date(),
  },
});

// https://astro.build/db/config
export default defineDb({
  tables: {
    Subscription,
  },
});
