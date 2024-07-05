import { TProgressCallback } from "./types.js";
import Vector2 from "./vector2.js";

class Crosshatcher {
   private linespacing: number = 0;
   private layers: number = 0;
   private callback: TProgressCallback | null = null;

   constructor() {
   }

   generate(lineWidth: number, layers: number, callback: TProgressCallback) {
      this.linespacing = lineWidth;
      this.layers = layers;
      this.callback = callback;
      
      
   }

}

export default Crosshatcher;
