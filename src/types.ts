import { ObjectId } from "mongo";
import { UsersCollection } from "./db/db.ts";
import { toUser } from "./db/schema.ts";
import { verifyJWT } from "./lib/jwt.ts";
export type User = {
  _id: string;
  username: string;
  password: string;
  createdAt: Date;
  lang: string;
};

export type Message = {
  _id: string;
  content: string;
  createdAt: Date;
  usersender: string;
  userreceiver: string;
};

export type Context = {
  request: Request;
  user?: User;
  lang?: string;
};

export async function createContext(
  request: Request,
  auth: string | null,
  lang: string | null,
): Promise<Context> {
  let user: User | undefined = undefined;

  if (auth !== null && auth !== "") {
    const { _id } = await verifyJWT(auth, Deno.env.get("JWT_SECRET")!);
    const userDocument = await UsersCollection.findOne({
      _id: new ObjectId(_id),
    });
    if (userDocument !== undefined) {
      user = toUser(userDocument);
    }
  }

  return {
    user,
    request,
    lang: lang ? lang : undefined,
  };
}
