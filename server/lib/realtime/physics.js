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

        for (let i = 0; i < this.points.length; i++) {
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

export { QuadTree, Entity };