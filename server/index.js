import * as global from "./lib/global";
const { Server } = global;

Server.listen(process.env.PORT ?? 3001);