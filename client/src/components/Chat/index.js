import React, { useState, useEffect } from "react";
import queryString from "query-string";
import io from "socket.io-client";
import Message from "../Message";

let socket;

export default function Chat({ location, history }) {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const endpoint = "localhost:3002";

  useEffect(() => {
    const { name, room } = queryString.parse(location.search);
    socket = io(endpoint);

    setName(name);
    setRoom(room);

    socket.emit("join", { name, room }, (error) => {
      if (error) {
        alert(error);
        history.push("/");
      }
    }); // used to send events

    return () => {
      socket.emit("disconnect");
      socket.off(); // removes current instance
    };
  }, [endpoint, location.search, history]);

  useEffect(() => {
    socket.on("message", (message) => {
      setMessages([...messages, message]);
    });
  }, [messages]);

  //function for sending messages
  const sendMessage = (e) => {
    e.preventDefault();
    if (message) {
      socket.emit("sendMessage", message, () => {
        setMessage("");
      });
    }
  };

  // console.log(message, messages);
  return (
    <div>
      <h1>Chat - {room}</h1>
      <a href="/">Close</a>
      <br />
      <div>
        {messages &&
          messages.map((message, index) => {
            return (
              <div key={index}>
                <Message message={message} name={name} />
              </div>
            );
          })}
      </div>
      <br />
      <input
        type="text"
        value={message}
        placeholder="Type a message"
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => (e.key === "Enter" ? sendMessage(e) : null)}
      />
      <button onClick={(e) => sendMessage(e)}>Send</button>

      <br />
    </div>
  );
}
