const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { MongoClient } = require('mongodb');
require("dotenv").config({ path: "./config.env" });

app.use(cors());

const server = http.createServer(app);

const uri = process.env.ATLAS_URI;

async function run() {
    try {
        const client = new MongoClient(uri);
        await client.connect();
        const db = client.db('ChikChatDB');

        const io = new Server(server, {
            cors: {
                origin: "http://localhost:5173",
                methods: ['GET', 'POST'],
            },
        });

        io.on("connection", async (socket) => {
            console.log(`User connected: ${socket.id}`);

            socket.on("joinRoom", (data) => {
                socket.join(data);
                console.log(`User with ID : ${socket.id} Joined Room ${data}`);
            });

            socket.on("send_message", async (data) => {
    
                await saveMessageToMongo(db, data);
               
              
                
                io.to(data.room).emit("receive_message", data);
            });

            socket.on("disconnect", () => {
                console.log("User has Disconnected", socket.id)
            });
        });

        server.listen(5172, () => {
            console.log("Server listening on 5172");
        });
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}




async function saveMessageToMongo(db, data) {
    try {
        // Check if the chat collection already exists, if not create it
        const collectionName = `chat_${data.room}`;
        const collection = db.collection(collectionName);
       
        await collection.insertOne({
            author: data.author,
            message: data.message,
            time: new Date().toISOString() 
        });
        console.log("Message saved to MongoDB:", data);
    } catch (error) {
        console.error("Error saving message to MongoDB:", error);
    }
}

run().catch(console.error);





































456546

