import { entities, my, socket } from "./global.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function drawGrid(x, y, cellSize = 32) {
    ctx.beginPath();
    for (let i = (canvas.width / 2 - x) % cellSize; i < canvas.width; i += cellSize) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
    }

    for (let j = (canvas.height / 2 - y) % cellSize; j < canvas.height; j += cellSize) {
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
    }
    ctx.closePath();

    ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
    ctx.lineWidth = 1.5;

    ctx.stroke();
}

function drawEntities() {
    for (let i = 0; i < entities.length; i++) {
        const instance = entities[i];
        let x = entities[i].x,
            y = entities[i].y;
        x -= 25;
        y -= 25;
        let color = "#000000";
        if (my.index === instance.index) {
            color = "#ff0011";
        }
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 50, 50);
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    const { me } = my;
    drawGrid(me.x + canvas.width / 2, me.y + canvas.height / 2);
    ctx.translate(-me.x + canvas.width / 2, -me.y + canvas.height / 2);

    drawEntities();
    // Draw other game objects here.
    ctx.restore();

    requestAnimationFrame(render);
}

document.addEventListener("keydown", (event) => {
    switch (event.code) {
        case "KeyW":
            socket.talk(0, 0, 1);
            break;

        case "KeyS":
            socket.talk(0, 1, 1);
            break;

        case "KeyD":
            socket.talk(0, 2, 1);
            break;

        case "KeyA":
            socket.talk(0, 3, 1);
            break;
    }
})

document.addEventListener("keyup", (event) => {
    switch (event.code) {
        case "KeyW":
            socket.talk(0, 0);
            break;

        case "KeyS":
            socket.talk(0, 1);
            break;

        case "KeyD":
            socket.talk(0, 2);
            break;

        case "KeyA":
            socket.talk(0, 3);
            break;
    }
})

export { render };