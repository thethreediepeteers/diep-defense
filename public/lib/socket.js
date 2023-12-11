import { protocol, entities, socket } from "./global.js";

const initSocket = () => {
    let socket;

    if (window.location == "http://localhost:3001/") {
        socket = new WebSocket("ws://localhost:3001");
    } 
    else {
        socket = new WebSocket("wss://spurious-ninth-play.glitch.me");
    }
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
            window.myIndex = m[0];
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
                let k = 0;
                while (k < entities.length) {
                    const entityIndex = entities[k].index;
                    if (!m.includes(entityIndex)) {
                        entities.splice(k, 1);
                    }
                    else {
                        k++;
                    }
                }
            }
            window.me = entities[entities.findIndex((e) => e.index == window.myIndex)];
            break;

        default:
            console.log("Unknown packet recieved:", m);
            break;
    }
}

export { initSocket };