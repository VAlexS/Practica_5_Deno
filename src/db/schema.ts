import { User, Message } from "../types.ts";
import { ObjectId } from "mongo";

export type UserSchema = Omit<User, "_id"> & {
  _id: ObjectId;
};

export function toUser({_id, ...rest }: UserSchema): User {
  return {
    ...rest,
    _id: _id.toString(),
  }
}


export type MessageSchema = Omit<Message, "_id" | "usersender" | "userreceiver"> & {
  _id: ObjectId;
  usersender: ObjectId;
  userreceiver: ObjectId;
};

export function toMessage({_id, userreceiver, usersender, ...rest}: MessageSchema): Message {
  return {
    ...rest,
    _id: _id.toString(),
    userreceiver: userreceiver.toString(),
    usersender: usersender.toString(),
  }
}
