import { entities, player, socket } from "./global.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < entities.length; i++) {  
        ctx.fillRect(entities[i].x, entities[i].y, 50, 50);
    }

    requestAnimationFrame(render);
}

document.addEventListener("keydown", (event) => {
    switch(event.code) {
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
    switch(event.code) {
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