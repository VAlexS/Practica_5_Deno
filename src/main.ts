import { Server } from "std/http/server.ts";
import { GraphQLHTTP } from "gql";
import { makeExecutableSchema } from "graphql_tools";
import { Query } from "./resolvers/query.ts";
import { Mutation } from "./resolvers/mutation.ts";
import { typeDefs } from "./schema.ts";
import { Context, createContext } from "./types.ts";
import messageResolver from "./resolvers/message.ts";

const resolvers = {
  Query,
  Mutation,
  Message: messageResolver,
};

const port = Number(Deno.env.get("PORT"));

const s = new Server({
  handler: async (req) => {
    const { pathname } = new URL(req.url);

    return pathname === "/graphql"
      ? await GraphQLHTTP<Request, Context>({
        schema: makeExecutableSchema({ resolvers, typeDefs }),
        graphiql: true,
        context: async (req: Request) => {
          return await createContext(
            req,
            req.headers.get("auth"),
            req.headers.get("lang"),
          );
        },
      })(req)
      : new Response("Not Found", { status: 404 });
  },
  port: port,
});

s.listenAndServe();

console.log(`Server running on: http://localhost:${port}/graphql`);
