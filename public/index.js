import * as global from "./lib/global.js";
const { initSocket, render } = global;

const socket = initSocket();
render();