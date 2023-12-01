import { Server as httpServer } from "http";
import { WebSocketServer } from "ws";
import { existsSync, statSync, readFileSync } from "fs";
import { parse } from "url";
import { protocol } from "../global";

export class Client {
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
        socket.talk = () => this.talk();
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

    talk(...message) {
        if (this.socket.readyState) {
            this.socket.send(protocol.encode(message));
        }
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

export { Server };