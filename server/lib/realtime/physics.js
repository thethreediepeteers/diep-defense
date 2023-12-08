import { arena } from "../global.js";

class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(other) {
        this.x += other.x;
        this.y += other.y;
    }

    subtract(other) {
        this.x -= other.x;
        this.y -= other.y;
    }

    multiply(other) {
        this.x *= other.x;
        this.y *= other.y;
    }

    divide(other) {
        this.x /= other.x;
        this.y /= other.y;
    }
}

class AABB { // box for collision and stuff
    constructor(centerX, centerY, halfWidth, halfHeight, index) {
        this.index = index;
        this.center = new Vector(centerX, centerY);
        this.halfWidth = halfWidth;
        this.halfHeight = halfHeight;
    }

    containsPoint(point) { // checks if the box contains a point
        const inX = (point.x >= this.center.x - this.halfWidth && point.x <= this.center.x + this.halfWidth)
        const inY = (point.y >= this.center.y - this.halfHeight && point.y <= this.center.y + this.halfHeight)

        return inX && inY;
    }

    intersects(other) { // checks if a box intersects with antother box
        const inX = this.center.x + this.halfWidth < other.center.x - other.halfWidth ||
            this.center.x - this.halfWidth > other.center.x + other.halfWidth;
        const inY = this.center.y + this.halfHeight < other.center.y - other.halfHeight ||
            this.center.y - this.halfHeight > other.center.y + other.halfHeight;

        return !(inX || inY);
    }
}

class QuadTree { // faster collision grid    https://en.wikipedia.org/wiki/Quadtree/
    constructor(bounds, maxObjects = 10) {
        this.bounds = bounds;
        this.maxObjects = maxObjects;
        this.objects = [];
        this.nodes = [];
    }

    insert(object) { // adds a new object to the collision grid
        if (!this.bounds.intersects(object)) return false;

        if (this.objects.length < this.maxObjects && !this.nodes.length) {
            this.objects.push(object);
            return true;
        }

        if (!this.nodes.length) {
            this.split();
        }

        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].insert(object)) return true;
        }
    }

    split() { // splits the collision grid into 4 nodes (topleft, topright, bottomleft, bottomright)
        const { x, y } = this.bounds.center;
        const w = this.bounds.halfWidth / 2;
        const h = this.bounds.halfHeight / 2;

        this.nodes[0] = new QuadTree(new AABB(x + w, y - h, w, h));
        this.nodes[1] = new QuadTree(new AABB(x - w, y - h, w, h));
        this.nodes[2] = new QuadTree(new AABB(x - w, y + h, w, h));
        this.nodes[3] = new QuadTree(new AABB(x + w, y + h, w, h));
    }

    query(range) { // returns all objects in the specified range (range is AABB)
        const output = [];

        if (!this.bounds.intersects(range)) return output;

        for (let i = 0; i < this.objects.length; i++) {
            if (range.intersects(this.objects[i])) {
                if (range.index !== this.objects[i].index) output.push(this.objects[i]);
            }
        }

        if (!this.nodes.length) return output;

        for (let i = 0; i < this.nodes.length; i++) {
            output.push(...this.nodes[i].query(range));
        }

        return output;
    }

    clear() { // clears all objects from tree
        this.objects = [];

        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].clear();
        }

        this.nodes = [];
    }
}

const quad = new QuadTree(new AABB(0, 0, 1000, 1000), 5);

export { quad, Vector, AABB };