const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const router = require("./router.js");
const mongodb = require("./mongodb/mongodb.connect");
const Chat = require("./models/Chat");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./users.js");

const app = express();
const server = http.createServer(app);
mongodb.connect();
app.use(express.json());
const io = socketio(server); // instance of socket io

io.on("connection", (socket) => {
  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });
    if (error) return callback(error);
    socket.emit("message", {
      user: "admin",
      text: `${user.name}, Welcome to the room ${user.room}`,
    });
    // broadcast will send a message to everyone in the room except u
    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name}, has joined` });
    socket.join(user.room); //join method adds a user to the room (join is an in-built method of socket)
    // io.to(user.room).emit("roomData", {
    //   room: user.room,
    //   users: getUsersInRoom(user.room),
    // });
    callback();
  });

  socket.on("sendMessage", async (message, callback) => {
    const user = getUser(socket.id);
    // const newChat = new Chat({
    //   groupName: user.room,
    //   messages: [],
    // });
    try {
      // Query for getting the channel's data
      // const saveChat = await newChat.save();
      const deafultData = {
        groupName: user.room,
        messages: [],
      };
      const chatData = await Chat.findOneAndUpdate(
        { groupName: user.room },
        deafultData,
        {
          upsert: true,
        }
      );
      const messageClone = chatData ? [...chatData.messages] : [];
      messageClone.push({
        id: Math.random(),
        user: user.name,
        text: message,
        createdAt: new Date(),
      });
      await Chat.updateOne(
        { groupName: user.room },
        { $set: { messages: messageClone } }
      );
      //io.to sends messages to the room
      io.to(user.room).emit("message", { user: user.name, text: message });
      callback();
    } catch (err) {
      console.log(err);
    }
  });

  //To disconnect
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", {
        user: "admin",
        text: `${user.name} has left`,
      });
      // io.to(user.room).emit("roomData", {
      //   room: user.room,
      //   users: getUsersInRoom(user.room),
      // });
    }
  });
});

app.use(router);

server.listen(3002, () => {
  console.log("Server listening on 3002...");
});
