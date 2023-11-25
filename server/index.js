import { Server as httpServer } from "http";
import { WebSocketServer } from "ws";
import { existsSync, statSync, readFileSync } from "fs";
import { parse } from "url";

class QuadTree {

}

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Entity {
    static instances = new Map();
    static index = 0;
    constructor(x, y) {
        this.index = Entity.index++;
        this.position = new Vector(x, y);
        this.velocity = new Vector(0, 0);
    }

    destroy() {
        Entity.instances.delete(this.index);
    }

    tick() {
        this.velocity.x *= 0.9;
        this.velocity.y *= 0.9;
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Client {
    static instances = new Map();
    static index = 0;
    constructor(socket, address) {
        this.index = Client.index++;
        this.socket = socket;
        this.address = address;
        socket.binaryType = "arraybuffer";
        socket.onmessage = event => this.messageEvent(event);
        socket.onclose = () => this.closeEvent();
        socket.onopen = () => this.openEvent();
        Client.instances.set(this.index, this);
        console.log(`Socket ${this.index} connected from ${address}.`);
    }

    messageEvent(event) {

    }

    closeEvent() {
        Client.instances.delete(this.index);
        console.log(`Socket ${this.index} disconnected.`);
    }

    openEvent() {

    }

    kick(reason = "") {
        this.socket.terminate();
        console.log(`Socket ${this.index} kicked for "${reason}"`);
    }

    tick() {

    }
}

class Server {
    static directory = "./public";
    static port = null;
    static getMethods = new Map();
    static httpServer = new httpServer((request, response) => this.requestEvent(request, response));
    static wsServer = new WebSocketServer({ server: this.httpServer }).on("connection", (socket, request) => this.connectionEvent(socket, request));

    static requestEvent(request, response) {
        if (request.url === undefined) {
            response.writeHead(404, this.responseHeaders);
            response.end("404");
            return;
        }
        const path = parse(request.url).pathname?.replace(/\/+$/, "") ?? "/";
        if (this.getMethods.has(path)) {
            this.getMethods.get(path)(request, response);
            return;
        }
        if (this.directory === null) {
            response.writeHead(404, this.responseHeaders);
            response.end("404");
            return;
        }
        const filePath = `${this.directory}${path === "" ? "/index.html" : path}`;
        if (!existsSync(filePath)) {
            response.writeHead(404, this.responseHeaders);
            response.end("404");
            return;
        }
        if (statSync(filePath).isDirectory()) {
            response.writeHead(404, this.responseHeaders);
            response.end("404");
            return;
        }
        response.writeHead(200, { "Access-Control-Allow-Origin": "*" });
        response.end(readFileSync(filePath));
    }

    static connectionEvent(socket, request) {
        const address = request.socket.remoteAddress ?? "-1";
        let connections = 1;
        for (const client of Client.instances.values()) {
            if (client.address === address) connections++;
        }
        if (connections > 2) {
            console.log(`Socket from ${address} terminated early for reaching the IP limit.`);
            socket.terminate();
            return;
        }
        const client = new Client(socket, address);
    }

    static listen(port = null) {
        this.port = port;
        this.httpServer.listen(port, function () {
            console.log(`Server listening on port ${port}.`);
        })
    }
}

Server.listen(process.env.PORT ?? 3001);

setInterval(function () {
    const startTime = performance.now();
    for (const entity of Entity.instances.values()) entity.tick();
    for (const client of Client.instances.values()) client.tick();
    const totalTime = performance.now() - startTime;
    if (totalTime > 20) {
        console.log(`Lagspike detected. Most recent tick operation took ${totalTime.toFixed(0)}ms.`);
        console.log(`Total clients: ${Client.instances.size()}`);
        console.log(`Total players: ${Entity.instances.size()}`);
    }
}, 1000 / 30);