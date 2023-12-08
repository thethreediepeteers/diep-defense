import { initSocket } from "./socket.js";

const entities = [];
const arena = { width: 0, height: 0 };
const socket = initSocket();

export { protocol } from "./fasttalk.js";
export { update } from "./canvas.js";
export { entities, arena };
export { socket };