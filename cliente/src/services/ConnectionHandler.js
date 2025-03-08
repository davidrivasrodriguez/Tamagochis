import { io } from "../../node_modules/socket.io-client/dist/socket.io.esm.min.js";

export const ConnectionHandler = {
    connected: false,
    socket: null,
    url: null,
    controller: null,
    playerName: null,

        init: (url, controller, onConnectedCallBack, onDisconnectedCallBack) => {
        ConnectionHandler.controller = controller;
        ConnectionHandler.playerName = `Player${Math.floor(Math.random() * 1000)}`;
    
        let { socket } = ConnectionHandler;
        socket = io(url);
        ConnectionHandler.socket = socket;
        socket.on("connect", () => {
            socket.emit("register", { name: ConnectionHandler.playerName, type: "PLAYER" });
        });
    
        socket.on("connectionStatus", (data) => {
            ConnectionHandler.connected = true;
            ConnectionHandler.controller.gameService.setState('PLAYING');
            onConnectedCallBack();
        });
    

        socket.on("message", (payload) => {
            console.log("Message received:", payload);
            if (payload.type && payload.content) {
                if (payload.type === "NEW_PLAYER") {
                    ConnectionHandler.controller.gameService.do({
                        type: "NEW_PLAYER",
                        content: payload.content
                    });
                } else if (payload.type === "BOARD") {
                    ConnectionHandler.controller.gameService.do({
                        type: "BOARD",
                        content: payload.content
                    });
                } else if (payload.type === "UPDATE_POSITIONS") { 
                    ConnectionHandler.controller.gameService.do({
                        type: "UPDATE_POSITIONS",
                        content: payload.content
                    });
                    console.log("UPDATE_POSITIONS", payload.content);
                }
            } else {
                console.error("Invalid message format:", payload);
            }
        });
    
        socket.on("disconnect", () => {
            ConnectionHandler.connected = false;
            onDisconnectedCallBack();
        });
    }
}