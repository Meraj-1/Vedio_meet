import express from "express";
import {createServer} from "node:http";
import { Server} from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const server = createServer(app);
const io = new Server(server);

app.set("port", (process.env.PORT || 8080))


app.get("/", (req,res)=> {
    return res.json({"Hello": "World"
    })
})

const start = async () => {
    const connectionDb = await mongoose.connect(process.env.MONGO_URL)
    server.listen(app.get("port"), ()=> {
    console.log(`Server running on port ${app.get("port")}`)}
)}

start();