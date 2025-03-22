import { defineAction } from "astro:actions";
import { z } from "astro:schema";

// check if email is invited
const invitations = [
    {
        name: "Jesus Donato Silva Figueroa",
        email: "figueroajesus2015@gmail.com",
    },
    {
        name: "Angelica Muñoz Hernandez",
        email: "gelitta.01@gmail.com",
    },
    {
        name: "Esteban David Reyes Chaparro",
        email: "estebandavidreyes@gmail.com",
    },
    {
        name: "Angie Calorina Delgado Rondón",
        email: "carolinarondon756@gmail.com",
    },
];

export const isInvited = defineAction({
    accept: 'json',
    input: z.object({
        $email: z.string().email()
    }),
    handler: async ({ $email }, context) => {
        try {
            const emailArray = invitations.map(invited => invited.email);

            if (!emailArray.includes($email)) {
                return { message: 'email is not invited', isInvited: false, status: 404 }
            }

            return { message: 'email is invited', isInvited: true, status: 202 }

        } catch (error) {
            throw error;
        }
    },
})

export const get = defineAction({
    handler: async (_, context) => {
        try {
            return { message: 'invited', invitations, status: 202 }
        } catch (error) {
            throw error;
        }
    },
})