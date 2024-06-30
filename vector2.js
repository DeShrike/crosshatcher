class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    normalize() {
        const l = this.length();
        if (l == 0)
            return new Vector2(0, 0);
        return new Vector2(this.x / l, this.y / l);
    }
    scale(value) {
        return new Vector2(this.x * value, this.y * value);
    }
    add(other) {
        return new Vector2(this.x + other.x, this.y + other.y);
    }
    sub(other) {
        return new Vector2(this.x - other.x, this.y - other.y);
    }
    div(other) {
        return new Vector2(this.x / other.x, this.y / other.y);
    }
    mul(other) {
        return new Vector2(this.x * other.x, this.y * other.y);
    }
    distanceTo(other) {
        return other.sub(this).length();
    }
    array() {
        return [this.x, this.y];
    }
}
export default Vector2;
