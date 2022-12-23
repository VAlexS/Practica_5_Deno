import { create, Header, Payload, verify } from "jwt";
import { User } from "../types.ts";

type UserPayload = {
  _id: string;
};

const encoder = new TextEncoder();

const generateKey = async (secretKey: string): Promise<CryptoKey> => {
  const keyBuf = encoder.encode(secretKey);
  return await crypto.subtle.importKey(
    "raw",
    keyBuf,
    { name: "HMAC", hash: "SHA-256" },
    true,
    ["sign", "verify"],
  );
};

export const createJWT = async (
  payload: UserPayload,
  secretKey: string,
): Promise<string> => {
  const header: Header = {
    alg: "HS256",
  };

  const key = await generateKey(secretKey);

  return create(header, payload, key);
};

export const verifyJWT = async (
  token: string,
  secretKey: string,
): Promise<UserPayload> => {
  try {
    const key = await generateKey(secretKey);
    const v = await verify(token, key) as UserPayload;
    return v;
  } catch (error) {
    return error.message;
  }
};
