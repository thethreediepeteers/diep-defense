import { Entity, Client } from "../global";
const loop = setInterval(function () {
    const startTime = performance.now();
    for (const entity of Entity.instances.values()) entity.tick();
    for (const client of Client.instances.values()) client.sendBuks();
    const totalTime = performance.now() - startTime;
    if (totalTime > 20) {
        console.log(`Lagspike detected. Most recent tick operation took ${totalTime.toFixed(0)}ms.`);
        console.log(`Total clients: ${Client.instances.size}`);
        console.log(`Total players: ${Entity.instances.size}`);
    }
}, 1000 / 30);

export { loop };