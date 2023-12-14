import { tanks } from '../defs/entities.js';

let mockupData = [];
let mockupIndex = 0;
global.tanks = {};


function generateMockupData() {
    for (const key in tanks) {
        const tank = tanks[key];
        let data = {
            index: mockupIndex++,
            shape: 0,
            guns: [],
            turrets: [],
            color: "#00b1de"
        };
        if (tank.SHAPE) data.shape = tank.SHAPE;
        if (tank.WEAPONS) {
            if (tank.WEAPONS.guns) {
                for (let gun of tank.WEAPONS.guns) {
                    let gunData = {
                        width: gun.POSITION[0] * 3,
                        height: gun.POSITION[1] * 3,
                        aspect: gun.POSITION[2],
                        xOffset: gun.POSITION[3],
                        yOffset: gun.POSITION[4],
                        angle: gun.POSITION[5]
                    };
                    data.guns.push(gunData)
                }
            }
        }
        tanks[key].index = data.index;
        global.tanks[key] = tanks[key];
        mockupData.push(data);
    }
}

generateMockupData();

const mockupJson = JSON.stringify(mockupData);

export { mockupJson }