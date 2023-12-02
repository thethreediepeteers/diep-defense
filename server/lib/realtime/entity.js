import { Vector, AABB, quad } from "../global.js";

class Entity { // entity class
    static instances = new Map();
    static index = 0;
    constructor(x, y, width, height) {
        this.index = Entity.index++;
        Entity.instances.set(this.index, this);

        this.position = new Vector(x, y);
        this.size = new Vector(width, height);
        this.velocity = new Vector(0, 0);
        this.movement = { up: 0, down: 0, left: 0, right: 0 };
    }

    destroy() {
        Entity.instances.delete(this.index);
    }

    tick() {
        this.velocity.add({
            x: -this.movement.left + this.movement.right,
            y: -this.movement.up + this.movement.down
        });
        this.velocity.multiply({ x: 0.9, y: 0.9 })
        this.position.add(this.velocity);
    }

    getAABB() { // returns a new AABB for collision and stuff
        return new AABB(this.position.x, this.position.y, this.size.x / 2, this.size.y / 2);
    }
}

export { Entity };