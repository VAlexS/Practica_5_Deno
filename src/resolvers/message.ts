import { UsersCollection } from "../db/db.ts";
import { toUser } from "../db/schema.ts";
import { Message, User } from "../types.ts";
import {ObjectId} from "mongo";

const messageResolver = {
    userreceiver: async (m: Message): Promise<User> => {
        const receiver = await UsersCollection.findOne({_id: new ObjectId(m.userreceiver)})
        if (!receiver) {
            throw new Error("Destinatario no encontrado")
        }
        return toUser(receiver)
    },

    usersender: async (m: Message): Promise<User> => {
        const sender = await UsersCollection.findOne({_id: new ObjectId(m.usersender)})
        if (!sender) {
            throw new Error("Remitente no encontrado")
        }
        return toUser(sender)
    },
};

export default messageResolver