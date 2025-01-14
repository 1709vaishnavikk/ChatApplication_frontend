import React, { useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { over } from 'stompjs';

let stompClient = null;

const ChatRoom = () => {
  const [publicChats, setPublicChats] = useState([]);
  const [privateChats, setPrivateChats] = useState(new Map());
  const [tab, setTab] = useState("CHATROOM");
  const [userData, setUserData] = useState({
    username: "",
    recievername: "",
    connected: false,
    message: "",
  });

  useEffect(() => {
    // Sync usernames across tabs
    const storedUsers = JSON.parse(localStorage.getItem('activeUsers')) || [];
    if (storedUsers.length > 0) {
      storedUsers.forEach(user => {
        privateChats.set(user, []);
      });
      setPrivateChats(new Map(privateChats));
    }
  }, []);

  const handleUserName = (event) => {
    setUserData({ ...userData, username: event.target.value });
  };

  const handleMessage = (event) => {
    setUserData({ ...userData, message: event.target.value });
  };

  const registerUser = () => {
    let Sock = new SockJS("http://localhost:8080/ws");
    stompClient = over(Sock);
    stompClient.connect({}, onConnected, onError);
  };

  const onConnected = () => {
    setUserData({ ...userData, connected: true });
    stompClient.subscribe("/chatroom/public", onPublicMessageRecieve);
    stompClient.subscribe(`/user/${userData.username}/private`, onPrivateMessageRecieve);
    userJoin();

    // Add user to privateChats and activeUsers
    privateChats.set(userData.username, []);
    setPrivateChats(new Map(privateChats));

    const activeUsers = JSON.parse(localStorage.getItem('activeUsers')) || [];
    if (!activeUsers.includes(userData.username)) {
      activeUsers.push(userData.username);
      localStorage.setItem('activeUsers', JSON.stringify(activeUsers));
    }
  };

  const userJoin = () => {
    let chatMessage = {
      senderName: userData.username,
      status: "JOIN",
    };
    stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
  };

  const onPublicMessageRecieve = (payload) => {
    let payloadData = JSON.parse(payload.body);
    switch (payloadData.status) {
      case "JOIN":
        if (!privateChats.get(payloadData.senderName)) {
          privateChats.set(payloadData.senderName, []);
          setPrivateChats(new Map(privateChats));
        }
        break;
      case "MESSAGE":
        setPublicChats(prevChats => [...prevChats, payloadData]);
        break;
      default:
        break;
    }
  };

  const onPrivateMessageRecieve = (payload) => {
    let payloadData = JSON.parse(payload.body);
    if (privateChats.get(payloadData.senderName)) {
      privateChats.get(payloadData.senderName).push(payloadData);
      setPrivateChats(new Map(privateChats));
    } else {
      let list = [];
      list.push(payloadData);
      privateChats.set(payloadData.senderName, list);
      setPrivateChats(new Map(privateChats));
    }
  };

  const onError = (err) => {
    console.error("WebSocket error: ", err);
  };

  const sendPublicMessage = () => {
    if (stompClient) {
      let chatMessage = {
        senderName: userData.username,
        message: userData.message,
        status: "MESSAGE",
      };
      stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
      setUserData({ ...userData, message: "" });
    }
  };

  const sendPrivateMessage = () => {
    if (stompClient) {
      let chatMessage = {
        senderName: userData.username,
        recieverName: tab,
        message: userData.message,
        status: "MESSAGE",
      };
      if (privateChats.get(tab)) {
        privateChats.get(tab).push(chatMessage);
        setPrivateChats(new Map(privateChats));
      }
      stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
      setUserData({ ...userData, message: "" });
    }
  };

  return (
    <div className="container">
      {userData.connected ? (
        <div className="chat-box">
          <div className="member-list">
            <ul>
              <li
                onClick={() => setTab("CHATROOM")}
                className={`message ${tab === "CHATROOM" && "active"}`}
              >
                ChatRoom
              </li>
              {[...privateChats.keys()].map((name, index) => (
                <li
                  onClick={() => setTab(name)}
                  className={`message ${tab === name && "active"}`}
                  key={index}
                >
                  {name}
                </li>
              ))}
            </ul>
          </div>
          <div className="chat-content">
            <ul className="chat-messages">
              {(tab === "CHATROOM" ? publicChats : privateChats.get(tab) || []).map(
                (chat, index) => (
                  <li className="message" key={index}>
                    {chat.senderName !== userData.username && (
                      <div className="avatar">{chat.senderName}</div>
                    )}
                    <div className="message-data">{chat.message}</div>
                    {chat.senderName === userData.username && (
                      <div className="avatar-self">{chat.senderName}</div>
                    )}
                  </li>
                )
              )}
            </ul>
            <div className="send-message">
              <input
                type="text"
                className="input-message"
                placeholder={`Enter message for ${tab}`}
                value={userData.message}
                onChange={handleMessage}
              />
              <button
                type="button"
                className="send-button"
                onClick={tab === "CHATROOM" ? sendPublicMessage : sendPrivateMessage}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="register">
          <input
            id="user-name"
            placeholder="Enter username"
            value={userData.username}
            onChange={handleUserName}
          />
          <button type="button" onClick={registerUser}>
            Register
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
