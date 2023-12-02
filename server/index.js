import * as global from "./lib/global.js";
const { Server } = global;

Server.listen(process.env.PORT ?? 3001);