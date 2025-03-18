import { defineDb, defineTable, column, } from 'astro:db';
const Subscription = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    email: column.text({ unique: true }),
    createdAt: column.date(),
  },
});

const Album = defineTable({
  columns: {
    id: column.text({ unique: true, primaryKey: true }),
    userId: column.text({ references: () => User.columns.id }),
    title: column.text(),
    description: column.text(),
    likes: column.number({ optional: true, default: 0 }),
    share: column.number({ optional: true, default: 0 }),
    createdAt: column.date({ default: new Date() }),
  },
})

const Like = defineTable({
  columns: {
    id: column.text({ unique: true, primaryKey: true }),
    userId: column.text({ references: () => User.columns.id }),
    albumId: column.text({ references: () => Album.columns.id }),
  },
})

const Photo = defineTable({
  columns: {
    id: column.text({ unique: true, primaryKey: true }),
    url: column.text(),
    alt: column.text(),
    type: column.text(),
    description: column.text(),
    albumId: column.text({ references: () => Album.columns.id }),
  },
})

const User = defineTable({
  columns: {
    id: column.text({ unique: true, primaryKey: true }),
    imgUrl: column.text(),
    name: column.text(),
  },
})

const Comment = defineTable({
  columns: {
    id: column.text({ unique: true, primaryKey: true }),
    userId: column.text({ references: () => User.columns.id }),
    albumId: column.text({ references: () => Album.columns.id }),
    content: column.text(),
    createdAt: column.date(),
  },
})

// https://astro.build/db/config
export default defineDb({
  tables: {
    Subscription,
    Album,
    Like,
    Photo,
    Comment,
    User,
  },
});
