import { entities } from "./global.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function offsetHex(hex) {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);

    const clamp = (value, min, max) => {
        return Math.min(Math.max(value, min), max);
    }

    const newR = clamp(r - 50, 0, 255);
    const newG = clamp(g - 50, 0, 255);
    const newB = clamp(b - 50, 0, 255);

    const toHex = (comp) => {
        const hex = comp.toString(16);
        return hex.length === 1 ? `0${hex}` : hex;
    }

    const newHex = `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;

    return newHex;
}

function drawEntity(x, y, color = "#00b1de", angle, alpha = 1, size, mockupIndex) {

  
    drawShape(x, y, size || 35, angle, window.mockups[mockupIndex].shape, color || window.mockups[mockupIndex].color, alpha);
}

function drawShape(x, y, r, angle, sides, color, strokeColor, alpha) {
    let add = 0;
    if (sides === 4) angle += Math.PI / 4;

    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;

    ctx.beginPath();

    if (sides === 0) {
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }
    else {
        for (let i = 0; i < sides; i++) {
            const vertexAngle = angle + (i * (Math.PI * 2)) / sides;
            const x1 = x + r * Math.cos(vertexAngle);
            const y1 = y + r * Math.sin(vertexAngle);
            if (i === 0) {
                ctx.moveTo(x1, y1);
            } else {
                ctx.lineTo(x1, y1);
            }
        }
    }
    ctx.closePath();
    ctx.fill();
    ctx.save();
    ctx.lineWidth = 9;
    ctx.strokeStyle = strokeColor || offsetHex(color);
    ctx.clip();
    ctx.stroke();
    ctx.restore();
}    

function clearCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

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
        let x = instance.x,
            y = instance.y;
        let color = "#f14e54";
        let strokeColor = "#a02c2c"
        if (window.myIndex === instance.index) {
            color = "#00b1de";
            strokeColor = "#0083a8";
        }
        drawEntity(x, y, color, instance.angle, instance.alpha, instance.size, instance.mockupIndex)
        //drawShape(x, y, 35, 0, 0, color);
    }
}

function render() {
    const me = window.me;
    if (!me) return;
    clearCanvas();
    ctx.fillStyle = "#e6e3e3";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    drawGrid(me.x + canvas.width / 2, me.y + canvas.height / 2);
    ctx.translate(-me.x + canvas.width / 2, -me.y + canvas.height / 2);

    drawEntities();
    // Draw other game objects here
    // You got mail: add stroke style. -tav
    ctx.restore();
}

function update() {
    render();

    requestAnimationFrame(update);
}

document.addEventListener("keydown", (event) => {
    const socket = window.socket;
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
    const socket = window.socket;
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

export { update };