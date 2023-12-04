import { initSocket } from "./socket.js";

const my = { me: { x: 0, y: 0 } };
const entities = [];
const arena = { width: 0, height: 0 };
const socket = initSocket();

export { protocol } from "./fasttalk.js";
export { render } from "./canvas.js";
export { entities, arena, my };
export { socket };