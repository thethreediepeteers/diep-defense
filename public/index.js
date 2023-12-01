import protocol from "./lib/fasttalk.js";
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const initSocket = () => {
    const socket = new WebSocket("ws://localhost:3001/");
    socket.binaryType = "arraybuffer";
    socket.onopen = () => {
        console.log("Connected to server.");
    }
    socket.onmessage = (message) => {
        const m = protocol.decode(message.data);
        switch (m.shift()) {
            case "a":
                console.log(m);
                break;
        }
    }
    socket.onclose = () => {
        console.log("Disconnected.");
    }
    return socket;
}

initSocket();