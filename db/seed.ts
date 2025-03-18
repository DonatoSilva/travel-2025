import { db, Subscription } from "astro:db";

export default async function seed() {
    await db.insert(Subscription).values([
        { email: 'figueroajesus2015@hotmail.com', createdAt: new Date() },
    ])

    console.log('Seeding database...');
}