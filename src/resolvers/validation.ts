import { ObjectId } from "mongo";
import { z, ZodError, ZodType } from "zod";

const parse = (zod: ZodType) => (data: any) => {
  const x = zod.safeParse(data);
  if (!x.success) {
    throw formatValidationError(x.error);
  }
  return x.data;
};

export const formatValidationError = (err: ZodError): Error => {
  const f: any = err.format();
  let s = f._errors.join("\n");
  for (const k in f) {
    if (k === "_errors") {
      continue;
    }
    if (f[k]._errors.length > 0) {
      if (s !== "") {
        s += "\n";
      }
      s += `Field ${k}: ` + f[k]._errors.join(", ");
    }
  }
  return new Error(s);
}

export const usernameParser = z
  .string({ required_error: "El nombre de usuario es obligatorio" })
  .regex(
    /^[a-zA-Z0-9]{4,}$/,
    {
      message: "El nombre de usuario debe contener al menos 4 caracteres," +
        " incluyendo mayúsculas, minúsculas y números",
    },
  );

export const passwordParser = z
  .string({ required_error: "La contraseña es obligatoria" })
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
    {
      message:
        "La contraseña debe contener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números",
    },
  );

const langParser = z
  .string({ required_error: "No se encontró el idioma" });

export const pageParser = z
  .number()
  .positive({ message: "La página debe ser positiva" });

export const perPageParser = z
  .number()
  .gte(10, {
    message:
      "Elementos por página deben ser mayor o igual a 10 y menor o igual a 200",
  })
  .lte(200, {
    message:
      "Elementos por página deben ser mayor o igual a 10 y menor o igual a 200",
  });

export const objectIdParser = z
  .string()
  .refine((v) => {
    try {
      new ObjectId(v);
      return true;
    } catch {
      return false;
    }
  }, { message: "Formato de ID inválido" });

export const sendMessage = parse(z
  .object({
    userreceiver: objectIdParser,
    content: z.string().min(1, {
      message: "El contenido del mensaje no puede estar vacío",
    }),
  }));

export const login = parse(z.object({
  usernameParser,
  passwordParser,
}));

export const createUser = parse(z.object({
  username: usernameParser,
  password: passwordParser,
}));

export const getMessages = parse(z.object({
  page: pageParser,
  perPage: perPageParser,
}));

export const lang = parse(langParser);
