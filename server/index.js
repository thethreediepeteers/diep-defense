import { Server as httpServer } from "http";
import { WebSocketServer } from "ws";
import { existsSync, statSync, readFileSync } from "fs";
import { parse } from "url";

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class AABB {
    constructor(centerX, centerY, halfWidth, halfHeight) {
        this.center = new Vector(centerX, centerY);
        this.halfWidth = halfWidth;
        this.halfHeight = halfHeight;
    }

    containsPoint(point) {
        const inX = (point.x >= this.center.x - this.halfWidth && point.x <= this.center.x + this.halfWidth)
        const inY = (point.y >= this.center.y - this.halfHeight && point.y <= this.center.y + this.halfHeight)

        return inX && inY;
    }

    intersects(other) {
        const inX = this.center.x + this.halfWidth < other.center.x - other.halfWidth ||
            this.center.x - this.halfWidth > other.center.x + other.halfWidth;
        const inY = this.center.y + this.halfHeight < other.center.y - other.halfHeight ||
            this.center.y - this.halfHeight > other.center.y + other.halfHeight;

        return !(inX || inY);
    }
}

class QuadTree {
    constructor(bounds, maxPoints = 10) {
        this.bounds = bounds;
        this.maxPoints = maxPoints;
        this.points = [];
        this.nodes = [];
    }

    insert(point) {
        if (!this.bounds.containsPoint(point)) return false;

        if (this.points.length < this.maxPoints && !this.nodes.length) {
            this.points.push(point);
            return true;
        }

        if (!this.nodes.length) {
            this.split();
        }

        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].insert(point)) return true;
        } 
    }

    split() {
        const { x, y } = this.bounds.center;
        const w = this.bounds.halfWidth / 2;
        const h = this.bounds.halfHeight / 2;
        
        this.nodes[0] = new QuadTree(new AABB(x + w, y - h, w, h));
        this.nodes[1] = new QuadTree(new AABB(x - w, y - h, w, h));
        this.nodes[2] = new QuadTree(new AABB(x - w, y + h, w, h));
        this.nodes[3] = new QuadTree(new AABB(x + w, y + h, w, h));
    }

    query(range) {
        const output = [];

        if (!this.bounds.intersects(range)) return output;

        for (let i = 0; i < this.points.length; i++){
            if (range.containsPoint(this.points[i])) output.push(this.points[i]);
        }

        if (!this.nodes.length) return output;

        for (let i = 0; i < this.nodes.length; i++) {
            output.push(...this.nodes[i].query(range));
        }

        return output;
    }
}

class Entity {
    static instances = new Map();
    static index = 0;
    constructor(x, y, width, height) {
        this.index = Entity.index++;
        Entity.instances.set(this.index, this);

        this.position = new Vector(x, y);
        this.size = new Vector(width, height);
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

    getAABB() {
        return new AABB(this.position.x, this.position.y, this.size.x / 2, this.size.y / 2);
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
        response.writeHead(200, { "Access-Control-Allow-Origin": "*", "Content-Type": this.getContentType(filePath) });
        response.end(readFileSync(filePath));
    }

    static getContentType(filePath) {
        const ext = filePath.split(".").pop();
        switch (ext) {
            case "html":
                return "text/html";

            case "css":
                return "text/css";

            case "js":
                return "application/javascript";

            case "ico":
                return "image/x-icon";

            default:
                return "text/plain";
        }
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