import { Server as httpServer } from "http";
import { WebSocketServer } from "ws";
import { existsSync, statSync, createReadStream } from "fs";
import { parse } from "url";
import { Client } from "../global.js";
import { mockupJson } from "./mockups.js";

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
        let resString = "";
        switch(request.url) {
            case "/lib/mockups.json":
                resString = mockupJson;
                break;
            
            default:
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
                return createReadStream(filePath).pipe(response);    
        }

        response.writeHead(200);
        response.end(resString);
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
        const address = request.headers['x-forwarded-for']?.slice(0, 13) ?? (request.socket.remoteAddress ?? "-1");
        let connections = 1;
        for (const client of Client.instances.values()) {
            if (client.address === address) connections++;
        }
        if (connections > 2) {
            console.log(`Socket terminated early for reaching the IP limit.`);
            socket.terminate();
            return;
        }
        const client = new Client(socket, address);
        console.log(`Socket ${client.index} connected.`);
        const message = [0, client.index];
        client.talk(message);
    }

    static listen(port = null) {
        this.port = port;
        this.httpServer.listen(port, function () {
            console.log(`Server listening on port ${port}.`);
        })
    }
}

export { Server };