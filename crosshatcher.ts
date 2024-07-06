import { TProgressCallback } from "./types.js";
import Vector2 from "./vector2.js";
import Rect from "./rect.js";

class Crosshatcher {
   private linespacing: number = 0;
   private layers: number = 0;
   private callback: TProgressCallback | null = null;

   private drawingWidth: number = 0;
   private drawingHeight: number = 0;

   private imageWidth: number = 0;
   private imageHeight: number = 0;
   private pixels: Uint8ClampedArray | null = null;
   
   // origin on screen
   private osx: number = 0;
   private osy: number = 0;
   private radius: number = 0;

   constructor() {
   }

   isZero(v: number): boolean {
      return v > -1e-5 && v < 1e-5;
   }

   rotate_point(p: Vector2, c: Vector2, angle: number): Vector2 {
      const x = p.x;
      const y = p.y;
      const cx = c.x;
      const cy = c.y;
      const rx = (x - cx) * Math.cos(angle) - (y - cy) * Math.sin(angle);
      const ry = (x - cx) * Math.sin(angle) + (y - cy) * Math.cos(angle);
      return new Vector2(rx + cx, ry + cy);
   }

   hypot(p1: Vector2, p2: Vector2): number {
      return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) +
                       (p1.y - p2.y) * (p1.y - p2.y));
   }

   clipT(num: number, denom: number, tE: number, tL: number): [boolean, number, number] {
      if (this.isZero(denom)) {
         return [num < 0.0, tE, tL];
      }

      let t = num / denom;
      if (denom > 0.0) {
         if (t > tL) {
            return [false, tE, tL];
         }
         if (t > tE) {
            tE = t;
         }
      }
      else {
         if (t < tE) {
            return [false, tE, tL];
         }
         if (t < tL) {
            tL = t;
         }
      }

      return [true, tE, tL];
   }

   sampleImage(mx: number, my: number): number {
      if (this.pixels === null) {
         return 127;
      }
      
      const mmx = Math.floor(mx / this.drawingWidth * this.imageWidth);
      const mmy = Math.floor(my / this.drawingHeight * this.imageHeight);

      const ix: number = (mmx * 4) + (mmy * this.imageWidth * 4);
      if (ix >= this.pixels.length) {
         //console.log("Out of bounds", ix, this.pixels.length);
         return 127;
      }
      
      const r = this.pixels[ix] / 255;
      const g = this.pixels[ix + 1] / 255;
      const b = this.pixels[ix + 2] / 255;
      return Math.floor((0.2126 * r + 0.7152 * g + 0.0722 * b) * 255);
   }

   doLine(threshold: number, p1: Vector2, p2: Vector2): void {
      const d = this.hypot(p1, p2);
      const seglen = this.linespacing;
      const nsegs = Math.floor(d / seglen);
      if (nsegs == 0) {
         return;
      }

      let pendown = 0;
      let startx = p1.x;
      let starty = p1.y;

      let dx = (p2.x - p1.x) / nsegs;
      let dy = (p2.y - p1.y) / nsegs;
      for (let i = 0; i < nsegs - 1; ++i) {
         let x1 = p1.x + dx * i;
         let y1 = p1.y + dy * i;
         let x2 = p1.x + dx * (i + 1);
         let y2 = p1.y + dy * (i + 1);
         let mx = Math.floor(((x2 - x1) / 2.0) + x1);
         let my = Math.floor(((y2 - y1) / 2.0) + y1);

         let s = this.sampleImage(mx, my);

         if (s <= threshold) {
            if (pendown != 1) {
               pendown = 1;
               //myfile.write(f"start line {x1} {y1}")
               startx = x1;
               starty = y1;
            }
            else {
               if (pendown == 1 && i == nsegs - 2) {
                  //myfile.write(f"end line {x2} {y2}\n")
                  //svgfile.write(f"M {startx} {starty} L {x2} {y2}")
                  //pygame.draw.line(screen, black, (startx, starty), (x1, y1), 1);
                  if (this.callback !== null) {
                     this.callback(new Vector2(startx, starty), new Vector2(x1, y1));
                  }
                  pendown = 0;
               }
            }
         }
         else {
            if (pendown == 1) {
               pendown = 0;
               //myfile.write(f"end line {x2} {y2}\n")
               //svgfile.write(f"M {startx} {starty} L {mx} {my}")
               //pygame.draw.line(screen, black, (startx, starty), (mx, my), 1);
               if (this.callback !== null) {
                  this.callback(new Vector2(startx, starty), new Vector2(mx, my));
               }
            }
         }
      }
   }

   clipLine(left: number, top: number, right: number, bottom: number, 
            p1: Vector2, p2: Vector2): [boolean, Rect] {
      let clip = new Rect(left, top, right, bottom);
      let dx = p2.x - p1.x;
      let dy = p2.y - p1.y;
      if (this.isZero(dx) && this.isZero(dy) && clip.pointInside(...p1.array())) {
         return [true, new Rect(...p1.array(), ...p2.array())];
      }

      let tE = 0;
      let tL = 1;
      let cr = this.clipT(clip.x1 - p1.x, dx, tE, tL);
      tE = cr[1];
      tL = cr[2];
      if (cr[0]) {
         cr = this.clipT(p1.x - clip.x2, -dx, tE, tL);
         tE = cr[1];
         tL = cr[2];
         if (cr[0]) {
            cr = this.clipT(clip.y1 - p1.y, dy, tE, tL);
            tE = cr[1];
            tL = cr[2];
            if (cr[0]) {
               cr = this.clipT(p1.y - clip.y2, -dy, tE, tL);
               tE = cr[1];
               tL = cr[2];
               if (cr[0]) {
                  if (tL < 1) {
                     p2.x = p1.x + tL * dx;
                     p2.y = p1.y + tL * dy;
                  }

                  if (tE > 0) {
                     p1.x = p1.x + tE * dx;
                     p1.y = p1.y + tE * dy;
                  }

                  return [true, new Rect(...p1.array(), ...p2.array())];
               }
            }
         }
      }

      return [false, new Rect(...p1.array(), ...p2.array())];
   }

   doLayer(layer: number, threshold: number, angle: number): void {
      const count = Math.floor((this.radius * 2.0) / this.linespacing);
      const cx = this.drawingWidth / 2.0;
      ///      + random.randint(10, 500);
      const cy = this.drawingHeight / 2.0;
      ///     + random.randint(10, 500);

      for (let i = Math.floor(-count / 2); i < Math.floor(count / 2); i++)
      {
         let x1 = cx + (i * this.linespacing);
         let y1 = cy - this.radius * 2;
         let x2 = x1;
         let y2 = cy + this.radius * 2;
         let p1 = this.rotate_point(new Vector2(x1, y1), new Vector2(cx, cy), angle);
         let p2 = this.rotate_point(new Vector2(x2, y2), new Vector2(cx, cy), angle);

         const c = this.clipLine(0, 0, this.drawingWidth, this.drawingHeight, p1, p2);
         const success: boolean = c[0];
         const r = c[1];
         if (success == false) {
            continue;
         }

         p1 = new Vector2(r.x1, r.y1)
         p2 = new Vector2(r.x2, r.y2)
         this.doLine(threshold, p1, p2);
      }
   }

   generate(lineWidth: number, layers: number,
            drawingWidth: number, drawingHeight: number,
            imageWidth: number, imageHeight: number,
            pixels: Uint8ClampedArray,
            callback: TProgressCallback): void {
      this.linespacing = lineWidth;
      this.layers = layers;
      this.callback = callback;
      this.drawingWidth = drawingWidth;
      this.drawingHeight = drawingHeight;
      this.imageWidth = imageWidth;
      this.imageHeight = imageHeight;
      this.pixels = pixels;

      this.radius = Math.sqrt(2.0) * (1.1 * drawingHeight);

      console.log("Image:", this.imageWidth, this.imageHeight);
      console.log("Drawing:", this.drawingWidth, this.drawingHeight);

      if (drawingWidth > drawingHeight) {
         this.radius = Math.sqrt(2.0) * (1.1 * drawingWidth);
      }

      for (let i = 1; i <= this.layers; i++) {
         this.doLayer(i, i * 256 / this.layers, i * 127 * Math.PI / 180.0);
      }
   }
}

export default Crosshatcher;
