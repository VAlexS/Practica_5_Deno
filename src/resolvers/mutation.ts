import * as lodash from "lodash";
import { MessagesCollection, UsersCollection } from "../db/db.ts";
import { Context, Message, User } from "../types.ts";
import * as bcrypt from "bcrypt";
import { createJWT } from "../lib/jwt.ts";
import * as validator from "./validation.ts";
import { InsertDocument, ObjectId } from "mongo";
import { MessageSchema, toMessage } from "../db/schema.ts";
import { AuthError } from "./error.ts";

export const Mutation = {
  createUser: async (
    _: unknown,
    rawArgs: Partial<{
      username: string;
      password: string;
    }>,
    ctx: any
  ): Promise<User> => {
    const args = validator.createUser(rawArgs);
    const lang = validator.lang(ctx.lang);

    const userExist = await UsersCollection.findOne(
      lodash.pick(rawArgs, "username")
    );
    if (userExist) {
      throw new Error("El usuario ya existe en la base de datos");
    }

    const passwordHash = await bcrypt.hash(args.password);
    const now = new Date();

    const _id = await UsersCollection.insertOne({
      username: args.username,
      password: passwordHash,
      createdAt: now,
      lang,
    });

    //devuelvo el usuario creado
    return {
      _id: _id.toString(),
      username: args.username,
      password: passwordHash,
      createdAt: now,
      lang,
    };
  },
  login: async (
    _: unknown,
    rawArgs: { username: string; password: string },
    _ctx: Context
  ): Promise<string> => {
    const args = validator.login(rawArgs);

    const user = await UsersCollection.findOne(lodash.pick(args, "username"));
    if (!user) {
      throw new Error("El usuario no existe en la base de datos");
    }

    const passwordCorrect = await bcrypt.compare(args.password, user.password);
    if (!passwordCorrect) {
      throw new Error("La contraseña no es correcta");
    }

    const token = createJWT(
      { _id: user._id.toString() },
      Deno.env.get("JWT_SECRET")!
    );

    return token;
  },
  deleteUser: async (
    _: unknown,
    _args: unknown,
    ctx: Context
  ): Promise<User> => {
    if (ctx.user === undefined) {
      throw new AuthError();
    }
    const user: User = ctx.user;
    const userExist = await UsersCollection.findOne({
      _id: new ObjectId(user._id),
    });
    if (!userExist) {
      throw new Error("El usuario no existe en la base de datos");
    }

    await UsersCollection.deleteOne({ _id: userExist._id });

    return (({ _id, ...rest }) => {
      return {
        _id: _id.toString(),
        ...rest,
      };
    })(userExist);
  },
  sendMessage: async (
    _: unknown,
    argsRaw: {
      content: string;
      userreceiver: string;
    },
    ctx: Context
  ): Promise<Message> => {
    const { content, userreceiver } = validator.sendMessage(argsRaw);
    if (ctx.user === undefined) {
      throw new AuthError();
    }
    const user: User = ctx.user;
    const lang = validator.lang(ctx.lang);

    const receiver = await UsersCollection.findOne({
      _id: new ObjectId(userreceiver),
    });
    if (!receiver) {
      throw new Error("No se ha encontrado al destinatario");
    }

    if (lang !== user.lang) {
      throw new Error(
        "El idioma de la petición y la base de datos no coinciden"
      );
    }

    const message: InsertDocument<MessageSchema> = {
      content,
      createdAt: new Date(),
      userreceiver: receiver._id,
      usersender: new ObjectId(user._id),
    };

    const _id = await MessagesCollection.insertOne(message);
    return toMessage(message as MessageSchema);
  },
};
