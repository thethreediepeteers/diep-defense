const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const initSocket = () => {
    const socket = new WebSocket("ws://localhost:3001/");
    return socket;
}

initSocket();