import { Entity, protocol, arena, quad, AABB } from "../global.js";
import { mockupJson } from '../setup/mockups.js';


export class Client extends Entity {
    static instances = new Map();

    constructor(socket, address) {
        super(0, 0, 50, 50);
        this.socket = socket;
        this.address = address;
        Client.instances.set(this.index, this);
        socket.binaryType = "arraybuffer";
        socket.onmessage = message => this.messageEvent(message);
        socket.onclose = () => this.closeEvent();
        socket.talk = () => this.talk();
        this.define(global.tanks.testEntity);
        setInterval(() => {
            this.angle += 20;
        }, 50)
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
        const nearby = quad.query(new AABB(this.position.x, this.position.y, 500, 500));
        message.push(this.index, this.position.x, this.position.y, this.angle, this.mockupIndex, this.alpha);
        for (let i = 0; i < nearby.length; i++) {
            const entity = Entity.instances.get(nearby[i].index);
            message.push(entity.index, entity.position.x, entity.position.y, entity.angle, entity.mockupIndex, entity.alpha);
        }
        this.talk(message);
    }
}