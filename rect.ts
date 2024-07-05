class Rect {
   x1: number;
   y1: number;
   x2: number;
   y2: number;

   constructor(x1: number, y1: number, x2: number, y2: number) {
      this.x1 = x1;
      this.y1 = y1;
      this.x2 = x2;
      this.y2 = y2;
   }

   pointInside(x: number, y: number): boolean {
      return x >= this.x1 && x <= this.x2 && y >= this.y2 && y <= this.y2;
   }
   
   array(): [number, number, number, number] {
      return [this.x1, this.y1, this.x2, this.y2];
   }
}

export default Rect;
