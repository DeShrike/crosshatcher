class Vector2 {
   x: number;
   y: number;
   constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
   }
   length(): number {
      return Math.sqrt(this.x * this.x + this.y * this.y);
   }
   normalize(): Vector2 {
      const l = this.length();
      if (l == 0) return new Vector2(0, 0);
      return new Vector2(this.x / l, this.y / l);
   }
   scale(value: number): Vector2 {
      return new Vector2(this.x * value, this.y * value);
   }
   add(other: Vector2): Vector2 {
      return new Vector2(this.x + other.x, this.y + other.y);
   }
   sub(other: Vector2): Vector2 {
      return new Vector2(this.x - other.x, this.y - other.y);
   }
   div(other: Vector2): Vector2 {
      return new Vector2(this.x / other.x, this.y / other.y);
   }
   mul(other: Vector2): Vector2 {
      return new Vector2(this.x * other.x, this.y * other.y);
   }
   distanceTo(other: Vector2): number {
      return other.sub(this).length();
   }
   
   array(): [number, number] {
      return [this.x, this.y];
   }
}

export default Vector2;
