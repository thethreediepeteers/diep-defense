import { initSocket } from "./socket.js";

const player = { myIndex: 0, x: 0, y: 0 };
const entities = [];
const arena = { width: 0, height: 0 };
const socket = initSocket();

export { protocol } from "./fasttalk.js";
export { render } from "./canvas.js";
export { entities, player, arena };
export { socket };