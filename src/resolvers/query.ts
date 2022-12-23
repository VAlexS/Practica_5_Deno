import { ObjectId } from "mongo";
import { MessagesCollection } from "../db/db.ts";
import { toMessage } from "../db/schema.ts";
import { Context, Message, User } from "../types.ts";
import { AuthError } from "./error.ts";
import * as validator from "./validation.ts";

export const Query = {
  getMessages: async (
    _: unknown,
    argsRaw: {
      page: number;
      perPage: number;
    },
    ctx: Context,
  ): Promise<Message[]> => {
    const args = validator.getMessages(argsRaw);
    if (ctx.user === undefined) {
      throw new AuthError();
    }

    const user: User = ctx.user;

    const messages = await MessagesCollection.find(
      {
        $or: [
          { usersender: new ObjectId(user._id) },
          { userreceiver: new ObjectId(user._id) },
        ],
      },
      {
        limit: args.perPage,
        skip: (args.page - 1) * args.perPage,
      },
    ).toArray();

    return messages.map((m) => toMessage(m));
  },
};
