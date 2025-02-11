import express from "express";
import { createServer } from "node:http";

import { Server } from "socket.io";
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectToSocket } from "../src/controller/sockectManager.js";

import cors from "cors";
import userRoutes from "../src/routes/user.route.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);


app.set("port", (process.env.PORT || 8000))
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);

app.get("/", (req, res) => {
  return res.json({
    Hello: "World",
  });
});

const start = async () => {
  const connectionDb = await mongoose.connect(process.env.MONGO_URL);
  console.log(`MONGO Connected to ${connectionDb.connection.host}`);
  server.listen(app.get("port"), () => {
  console.log(`Server running on port ${app.get("port")}`);
  });
};

start();
