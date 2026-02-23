import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";

import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { expressMiddleware } from "@as-integrations/express5";

import typeDefs from "./graphql/typeDefs.js";
import resolvers from "./graphql/resolvers.js";
import { connectDB } from "./config/db.js";
import { initCloudinary } from "./config/cloudinary.js";
import { getUserFromAuthHeader } from "./middleware/auth.js";

await connectDB();
initCloudinary();

const app = express();
const httpServer = http.createServer(app);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
});

await server.start();

// Increase JSON limit if you're sending base64 photos in JSON
app.use(
  "/graphql",
  cors(),
  express.json({ limit: "10mb" }),
  expressMiddleware(server, {
    context: async ({ req }) => {
      const user = getUserFromAuthHeader(req.headers.authorization);
      return { user };
    }
  })
);

const PORT = process.env.PORT || 4000;

await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
console.log(`🚀 GraphQL ready at http://localhost:${PORT}/graphql`);