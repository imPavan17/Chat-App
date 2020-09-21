import React from "react";

export default function Message({ message: { user, text }, name }) {
  let isSentByCurrentUser = false;
  const trimmedName = name.trim().toLowerCase();

  if (user === trimmedName) {
    isSentByCurrentUser = true;
  }
  return isSentByCurrentUser ? (
    <div style={{ textAlign: "right" }}>
      <p>{trimmedName}</p>
      <div>
        <p>{text}</p>
      </div>
    </div>
  ) : (
    <div>
      <p>{text}</p>
      <div>
        <p>{user}</p>
      </div>
    </div>
  );
}
