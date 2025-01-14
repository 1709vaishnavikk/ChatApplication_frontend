# ChatApplication_frontend

## Overview
This is the frontend for the ChatApp. It allows users to join a chat room, send and receive public and private messages in real-time. The application uses WebSockets for real-time communication.

## Prerequisites
- Node.js (version 14 or later)
- npm (for dependency management)
- React (frontend framework)
- WebSocket server running on `http://localhost:8080`

## Setup
1. **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd chatapp-frontend
    ```

2. **Install dependencies:**
    ```bash
    npm install
    ```

3. **Run the frontend:**
    ```bash
    npm start
    ```
    The frontend will be available at `http://localhost:3003`.

4. **Ensure WebSocket server is running:**
    The WebSocket server should be running at `http://localhost:8080/ws` for real-time messaging functionality.

## Features
- **Public Chat Room**: Send and receive messages in the public chat room.
- **Private Messaging**: Send and receive private messages with other active users.
- **User Registration**: Register a username to start chatting.

## Functionality
- **User Registration**: Upon entering a username and clicking "Register", the user is connected to the WebSocket server.
- **Public Messages**: Messages can be sent to the public chat room. All users in the chat room will see these messages.
- **Private Messages**: Users can click on a username to start a private chat and send private messages.

## Troubleshooting
- Ensure that the WebSocket server is running and accessible at `http://localhost:8080/ws`.
- If the frontend does not load or displays errors, check the browser console for details on WebSocket connection issues.
- If users cannot send or receive messages, check the WebSocket server logs for any errors.

## Notes
- This app uses the **SockJS** library to establish WebSocket connections and **STOMP** protocol for message handling.

