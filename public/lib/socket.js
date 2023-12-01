const initSocket = () => {
    const socket = new WebSocket("ws://localhost:3001/");
    socket.binaryType = "arraybuffer";
    socket.onopen = () => {
        console.log("Connected to server.");
    }
    socket.onmessage = (message) => {
        const m = protocol.decode(message.data);
        handleMessage(m);
    }
    socket.onclose = () => {
        console.log("Disconnected.");
    }
    return socket;
}

function handleMessage(message) {
    if (!m) return;
    switch (m.shift()) {
        default:
            console.log("Unknown packet recieved");
            break;
    }
}

export { initSocket };