import { protocol, player, entities } from "./global.js";

const initSocket = () => {
    const socket = new WebSocket("ws://localhost:3001/");
    socket.binaryType = "arraybuffer";
    socket.onopen = () => {
        console.log("Connected to server.");
    }
    socket.onmessage = (message) => handleMessage(message);
    socket.talk = (...message) => {
        if (socket.readyState) {
            socket.send(protocol.encode(message));
        }
    }
    socket.onclose = () => {
        console.log("Disconnected.");
    }
    return socket;
}

function handleMessage(message) {
    const m = protocol.decode(message.data);
    if (!m) return;
    switch (m.shift()) {
        case 0:
            player.myIndex = m[0];
            player.x = m[1];
            player.y = m[2];
            break;

        case 1:
            let i = 0;
            while (i < m.length) {
                const entity = { index: m[i++], x: m[i++], y: m[i++] };
                const existingIndex = entities.findIndex((e) => e.index === entity.index);
                if (existingIndex !== -1) {
                    entities[existingIndex] = entity;
                } 
                else {
                    entities.push(entity);
                }
            }
            break;

        default:
            console.log("Unknown packet recieved:", m);
            break;
    }
}

export { initSocket };