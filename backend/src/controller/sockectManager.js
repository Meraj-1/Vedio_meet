// import mongoose from "mongoose";
// import { Server } from "socket.io";

// const { connection, disconnect } = mongoose;

// let connections = {};
// let message = {};
// let timeOnline = {};

// export const connectToSocket = (server) => {
//   const io = new Server(server, {
//     cors: {
//       origin: "*",
//       methods: ["GET", "POST"],
//       allowedHeaders: ["*"],
//       credentials: true,
//     },
//   });

//   io.on("connection", (socket) => {
//     socket.on("join-call", (path) => {
//       if (!connections[path]) {
//         connections[path] = [];
//       }
//       connections[path].push(socket.id);
//       timeOnline[socket.id] = new Date();

//       connections[path].forEach((clientId) => {
//         io.to(clientId).emit("user-joined", socket.id, connections[path]);
//       });
//     });

//     socket.on("signal", (toId, message) => {
//       io.to(toId).emit("signal", socket.id, message);
//     });

//     socket.on("chat-message", (data, sender) => {
//       let matchingRoom = Object.keys(connections).find((room) =>
//         connections[room].includes(socket.id)
//       );

//       if (matchingRoom) {
//         if (!message[matchingRoom]) {
//           message[matchingRoom] = [];
//         }
//         message[matchingRoom].push({
//           sender,
//           data,
//           "socket-id-sender": socket.id,
//         });

//         console.log("message:", sender, data);

//         connections[matchingRoom].forEach((clientId) => {
//           io.to(clientId).emit("chat-message", data, sender, socket.id);
//         });
//       }
//     });

//     socket.on("disconnect", () => {
//       let key = Object.keys(connections).find((room) =>
//         connections[room].includes(socket.id)
//       );

//       if (key) {
//         connections[key].forEach((clientId) => {
//           io.to(clientId).emit("user-left", socket.id);
//         });

//         connections[key] = connections[key].filter((id) => id !== socket.id);

//         if (connections[key].length === 0) {
//           delete connections[key];
//         }
//       }
//     });
//   });

//   return io;
// };
import { Server } from "socket.io"


let connections = {}
let messages = {}
let timeOnline = {}

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });


    io.on("connection", (socket) => {

        console.log("SOMETHING CONNECTED")

        socket.on("join-call", (path) => {

            if (connections[path] === undefined) {
                connections[path] = []
            }
            connections[path].push(socket.id)

            timeOnline[socket.id] = new Date();

            // connections[path].forEach(elem => {
            //     io.to(elem)
            // })

            for (let a = 0; a < connections[path].length; a++) {
                io.to(connections[path][a]).emit("user-joined", socket.id, connections[path])
            }

            if (messages[path] !== undefined) {
                for (let a = 0; a < messages[path].length; ++a) {
                    io.to(socket.id).emit("chat-message", messages[path][a]['data'],
                        messages[path][a]['sender'], messages[path][a]['socket-id-sender'])
                }
            }

        })

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        })

        socket.on("chat-message", (data, sender) => {

            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {


                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }

                    return [room, isFound];

                }, ['', false]);

            if (found === true) {
                if (messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = []
                }

                messages[matchingRoom].push({ 'sender': sender, "data": data, "socket-id-sender": socket.id })
                console.log("message", matchingRoom, ":", sender, data)

                connections[matchingRoom].forEach((elem) => {
                    io.to(elem).emit("chat-message", data, sender, socket.id)
                })
            }

        })

        socket.on("disconnect", () => {

            var diffTime = Math.abs(timeOnline[socket.id] - new Date())

            var key

            for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {

                for (let a = 0; a < v.length; ++a) {
                    if (v[a] === socket.id) {
                        key = k

                        for (let a = 0; a < connections[key].length; ++a) {
                            io.to(connections[key][a]).emit('user-left', socket.id)
                        }

                        var index = connections[key].indexOf(socket.id)

                        connections[key].splice(index, 1)


                        if (connections[key].length === 0) {
                            delete connections[key]
                        }
                    }
                }

            }


        })


    })


    return io;
}
