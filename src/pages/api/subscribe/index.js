import { db, Subscription } from 'astro:db'

export const POST = async ({ request, redirect }) => {
    const req = await request.json()
    const { email } = req
    const createdAt = new Date()

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regexEmail.test(email)) {
        return new Response("Invalid email", { status: 400, statusText: "Servidor: Correo invalido algo que no debeia pasar 😥, ingrese un email valido" })
    }

    await db.insert(Subscription).values({ email, createdAt }).catch(() => {
        return new Response("Error", { status: 500, statusText: "Servidor: Error al guardar el email 😥, intente de nuevo" })
    })

    return new Response("Success", { status: 200 })
}