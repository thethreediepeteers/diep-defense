import { Entity, protocol, arena, quad, AABB } from "../global";

export class Client extends Entity {
    static instances = new Map();

    constructor(socket, address) {
        super(Math.random() * arena.width, Math.random() * arena.height, 50, 50);
        this.socket = socket;
        this.address = address;
        Client.instances.set(this.index, this);
        socket.binaryType = "arraybuffer";
        socket.onmessage = message => this.messageEvent(message);
        socket.onclose = () => this.closeEvent();
        socket.talk = () => this.talk();
        console.log(`Socket ${this.index} connected from ${address}.`);
    }

    messageEvent(message) {
        const m = protocol.decode(message.buffer);
        switch (m.shift()) {
            case 0:
                const mod = m[1] ? 1 : 0;
                switch (m[0]) {
                    case 0:
                        this.movement.up = mod;
                        break;
                    case 1:
                        this.movement.down = mod;
                        break;
                    case 2:
                        this.movement.right = mod;
                        break;
                    case 3:
                        this.movement.left = mod;
                        break;
                }
                break;
        }
    }

    closeEvent() {
        Client.instances.delete(this.index);
        this.destroy();
        console.log(`Socket ${this.index} disconnected.`);
    }

    kick(reason = "") {
        this.socket.terminate();
        console.log(`Socket ${this.index} kicked for "${reason}"`);
    }

    talk(message) {
        if (this.socket.readyState) {
            this.socket.send(protocol.encode(message));
        }
    }

    sendBuks() {
        const message = [1];
        for (const entity of Entity.instances.values()) {
            message.push(entity.index, entity.position.x, entity.position.y);
        }
        this.talk(message);
    }
}