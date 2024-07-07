import Vector2 from "./vector2.js";
import Crosshatcher from "./crosshatcher.js";
import { TProgressCallback } from "./types.js";

class Main {
   private thecanvas: HTMLCanvasElement | null = null;
   private ctx: CanvasRenderingContext2D | null = null;

   private layersLabel: HTMLElement | null = null;
   private spacingLabel: HTMLElement | null = null;
   private linecountLabel: HTMLElement | null = null;

   private linespacing: number = 10;
   private layers: number = 5;

   private lines: [Vector2, Vector2][] = [];

   private boundProgress: (p1: Vector2, p2: Vector2) => void;
   private boundDrawFrame: (timestamp: number) => void;

   private boundHandleFileInput: (this: HTMLElement, ev: Event) => any;
   private boundHandleMouseEvent: (this: HTMLElement, ev: MouseEvent) => any;
   private boundHandleWheelEvent: (this: HTMLElement, ev: WheelEvent) => any;
   private boundHandleResizeEvent: (this: HTMLElement, ev: Event) => any;

   private boundHandleGenerateButton: (this: HTMLElement, ev: Event) => any;
   private boundHandleExportButton: (this: HTMLElement, ev: Event) => any;

   private thumbWidth: number = 150;
   private pixels: Uint8ClampedArray | null = null;
   private imageWidth: number = 0;
   private imageHeight: number = 0;
   private imageName: string = "";
   private drawingWidth: number = 0;
   private drawingHeight: number = 0;

   private scaleFactor: number = 1;
   private translateAmount: Vector2 = new Vector2(0, 0);
   private fullTranslateAmount: Vector2 = new Vector2(0, 0);

   private mouseDown: boolean = false;
   private mouseDownPos: Vector2 = new Vector2(0, 0);
   
   constructor() {
      console.log("Crosshatching");
      this.thecanvas = document.getElementById("canvas") as (HTMLCanvasElement | null);
      if (this.thecanvas === null)
      {
         throw new Error("No canvas element with id 'canvas'.");
      }

      this.boundHandleFileInput = this.handleFileInput.bind(this);
      this.boundHandleMouseEvent = this.handleMouseEvent.bind(this);
      this.boundHandleWheelEvent = this.handleWheelEvent.bind(this);
      this.boundHandleResizeEvent = this.handleResizeEvent.bind(this);
      this.boundHandleGenerateButton = this.handleGenerateButton.bind(this);
      this.boundHandleExportButton = this.handleExportButton.bind(this);
      this.boundProgress = this.progress.bind(this);
      this.boundDrawFrame = this.drawFrame.bind(this);

      this.pixels = null;

      this.setSize(this.thecanvas);

      this.ctx = this.thecanvas.getContext("2d");
      if (this.ctx === null) {
         throw new Error("2D context not available.");
      }

      this.ctx.fillStyle = "#181818";
      this.ctx.fillRect(0, 0, this.thecanvas.width, this.thecanvas.height);
   }

   debounce(func: any, wait: number, immediate: boolean) {
       let timeout: number | undefined;
       return () => {
           const context = this, args = arguments;
           const later = function() {
               timeout = undefined;
               if (!immediate) func.apply(context, args);
           };
           const callNow = immediate && !timeout;
           clearTimeout(timeout);
           timeout = setTimeout(later, wait);
           if (callNow) func.apply(context, args);
       };
   }

   fillCircle(center: Vector2, radius: number) {
      this.ctx?.beginPath();
      this.ctx?.arc(...center.array(), radius, 0, 2 * Math.PI);
      this.ctx?.fill();
   }

   strokeLine(p1: Vector2, p2: Vector2) {
      this.ctx?.beginPath();
      this.ctx?.moveTo(...p1.array());
      this.ctx?.lineTo(...p2.array());
      this.ctx?.stroke();
   }

   setLabels() {
      this.layersLabel!.innerHTML = `${this.layers}`;
      this.spacingLabel!.innerHTML = `${this.linespacing}`;
      if (this.lines === null || this.lines.length === 0) {
         this.linecountLabel!.innerHTML = "";
      }
      else {
         this.linecountLabel!.innerHTML = `${this.lines.length} lines`;
      }
   }

   drawImagePreview() {
      var img = <HTMLImageElement>document.getElementById("theimage");
      let pwidth = this.thumbWidth;
      let pheight = img.height * (pwidth / img.width);
      this.ctx?.drawImage(img, 0, 0, img.width, img.height, 0, 0, pwidth, pheight)
   }

   drawFrame(timeStamp: number) {
      this.draw();
   }

   draw() {
      if (this.ctx === null) {
         return;
      }

      const tl = new Vector2(0, 0);
      const tr = new Vector2(this.drawingWidth, 0);
      const bl = new Vector2(0, this.drawingHeight);
      const br = new Vector2(this.drawingWidth, this.drawingHeight);

      this.ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset Scale

      this.ctx.fillStyle = "#181818";
      this.ctx.fillRect(0, 0, this.thecanvas!.width, this.thecanvas!.height);

      this.ctx.translate(...this.translateAmount.add(this.fullTranslateAmount).array());
      this.ctx.scale(this.scaleFactor, this.scaleFactor);

      this.ctx.fillStyle = "#FFFFFF";
      this.ctx.fillRect(...tl.array(), this.drawingWidth, this.drawingHeight);

      /*this.ctx.fillStyle = "red";
      this.fillCircle(tl, 10);
      this.ctx.fillStyle = "green";
      this.fillCircle(tr, 10);
      this.fillCircle(bl, 10);
      this.fillCircle(br, 10);
      
      this.ctx.strokeStyle = "white";
      this.strokeLine(tl, br);
      this.strokeLine(tr, bl);*/
      
      this.ctx.strokeStyle = "black";
      for (let line of this.lines) {
         this.strokeLine(line[0], line[1]);
      }
      
      this.ctx.save();
      this.ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset Scale
      this.drawImagePreview();
      this.ctx.restore();
   }

   progress(p1: Vector2, p2: Vector2): void {
      this.lines.push([p1, p2]);
   }

   handleGenerateButton(ev: Event): any {
      ev.preventDefault();

      if (this.pixels === null || this.pixels.length === 0) {
         return;
      }

      this.lines = [];
      const ch = new Crosshatcher();
      ch.generate(this.linespacing, this.layers,
                  this.drawingWidth, this.drawingHeight,
                  this.imageWidth, this.imageHeight,
                  this.pixels,
                  this.boundProgress);
      this.setLabels();
      window.requestAnimationFrame(this.boundDrawFrame);
   }

   downloadURI(data: string, name: string): void {
      var link = document.createElement("a");
      link.download = name;
      link.type = "text/plain";
      var blob = new Blob([data]);
      link.href = URL.createObjectURL(blob);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
   }

   handleExportButton(ev: Event): any {
      ev.preventDefault();
      if (this.lines === null || this.lines.length === 0) {
         return;
      }

      let svg: string = "";

      svg += `<svg height="${this.drawingHeight}" width="${this.drawingWidth}" style="background-color:#ffffff00" version="1.1" xmlns="http://www.w3.org/2000/svg">\n`;
      svg += "<path d=\"";

      for (let line of this.lines) {
         svg += ` M ${line[0].x} ${line[0].y} L ${line[1].x} ${line[1].y}`;
      }

      svg += "Z \" \nstyle=\"fill:none;stroke:black;stroke-width:1\"/>\n";
      svg += "</svg>\n";

      this.downloadURI(svg, this.imageName + ".svg");
   }

   handleLoadButton(ev: Event) {
      ev.preventDefault();
      alert("load");
   }

   handleFileInput(e: any) {
      if (e.target.files && e.target.files[0]) {
         // console.log(e.target.files[0].name);
         var img = <HTMLImageElement>document.getElementById("theimage");
         img.onload = () => {

            let tempcanvas = document.createElement("canvas");
            if (!tempcanvas)
            {
               throw new Error("Could not create temporary canvas.");
            }
            
            let tempcontext = tempcanvas.getContext("2d");
            if (!tempcontext)
            {
               throw new Error("Could not get 2D context from temporary canvas.");
            }

            // console.log("img", img.width, img.height);
            tempcanvas.width = img.width;
            tempcanvas.height = img.height;
            tempcontext.clearRect(0, 0, img.width, img.height);
            tempcontext.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height)

            try {
               const imgData = tempcontext.getImageData(0, 0, img.width, img.height);
               this.pixels = imgData.data;
               this.imageWidth = img.width;
               this.imageHeight = img.height;
               this.imageName = e.target.files[0].name;
               this.initProject();
            } catch(e){
               this.pixels = null;
               throw e;
            }

            tempcontext = null;
            //tempcanvas = null;
            URL.revokeObjectURL(img.src);  // no longer needed, free memory
         }

         img.src = URL.createObjectURL(e.target.files[0]); // set src to blob url
      }
   }

   handleChangeLayers(delta: number) {
      this.layers += delta;

      if (this.layers < 1) {
         this.layers = 1;
      }

      if (this.layers > 20) {
         this.layers = 20;
      }

      this.setLabels();
   }

   handleChangeSpacing(delta: number) {
      this.linespacing += delta;

      if (this.linespacing < 1) {
         this.linespacing = 1;
      }

      if (this.linespacing > 50) {
         this.linespacing = 50;
      }

      this.setLabels();
   }

   screenToWorld(v: Vector2): Vector2 {
      return v.sub(this.fullTranslateAmount).scale(1 / this.scaleFactor)
   }

   handleResizeEvent(e: Event) {
      if (this.thecanvas !== null) {
         this.setSize(this.thecanvas);
      }

      this.draw();
   }

   changeScale(delta: number) {
      const zoomFactor = 0.001;
      this.scaleFactor *= Math.exp(delta * zoomFactor);
   }

   handleWheelEvent(e: WheelEvent) {
      if (e.type === "wheel") {

         const x = this.drawingWidth / 2;
         const y = this.drawingHeight / 2;

         const oldScale = this.scaleFactor;
         this.changeScale(-e.deltaY);

         const xOrg = e.offsetX / oldScale;
         const xNew = xOrg * this.scaleFactor;
         const xDiff = e.offsetX - xNew;

         const yOrg = e.offsetY / oldScale;
         const yNew = yOrg * this.scaleFactor;
         const yDiff = e.offsetY - yNew;

         this.fullTranslateAmount.x += xDiff;
         this.fullTranslateAmount.y += yDiff;

         this.draw();
      }
   }

   handleMouseEvent(e: MouseEvent) {
      if (e.type === "mouseup") {
         this.mouseDown = false;
         this.fullTranslateAmount = this.fullTranslateAmount.add(this.translateAmount);
         this.translateAmount = new Vector2(0, 0);
      }
      else if (e.type === "mousedown") {
         this.mouseDownPos = new Vector2(e.offsetX, e.offsetY);
         this.mouseDown = true;
         if (this.ctx !== null) {
            this.ctx.fillStyle = "blue";
         }
         
         this.fillCircle(this.screenToWorld(this.mouseDownPos), 10);
      }
      else if (e.type === "mousemove") {
         if (this.mouseDown) {
            const newPos = new Vector2(e.offsetX, e.offsetY);
            this.translateAmount = newPos.sub(this.mouseDownPos);
            this.draw();
         }
      }
   }

   convertToLum() {
      if (this.pixels === null) {
         return;
      }

      for (let y = 0; y < this.imageHeight; ++y) {
         for (let x = 0; x < this.imageWidth; ++x) {
            const ix: number = (x * 4) + (y * this.imageWidth * 4);
            const r = this.pixels[ix] / 255;
            const g = this.pixels[ix + 1] / 255;
            const b = this.pixels[ix + 2] / 255;

            const w = Math.floor((0.2126 * r + 0.7152 * g + 0.0722 * b) * 255);
            this.pixels[ix] = w;
            this.pixels[ix + 1] = w;
            this.pixels[ix + 2] = w;
         }
      }

   }

   initProject() {
      if (this.ctx == null) {
         return;
      }

      console.log(`New Project: ${this.imageName}: ${this.imageWidth}x${this.imageHeight}`);
      this.drawingWidth = 1000;
      this.drawingHeight = Math.ceil(this.imageHeight * (this.drawingWidth / this.imageWidth));

      this.fullTranslateAmount = new Vector2(this.thumbWidth, 0);
      this.translateAmount = new Vector2(0, 0);
      this.scaleFactor = 1;
      const cw: number = this.ctx.canvas.width;
      const ch: number = this.ctx.canvas.height;

      let sf1: number = 1;
      let sf2: number = 1;
      if (this.drawingWidth > cw) {
         sf1 = cw / this.drawingWidth;
      }

      if (this.drawingHeight > ch) {
         sf2 = ch / this.drawingHeight;
      }

      this.scaleFactor = Math.min(sf1, sf2);
      this.ctx.lineWidth = 1;
      this.lines = [];

      this.convertToLum();
      this.draw();
      this.setLabels();
   }

   init() {
      const exportButton = <HTMLElement>document.getElementById("exportButton");
      exportButton?.addEventListener("click", this.boundHandleExportButton);

      //const loadButton = <HTMLElement>document.getElementById("loadButton");
      //loadButton?.addEventListener("click", this.boundHandleLoadButton);

      const generateButton = <HTMLElement>document.getElementById("generateButton");
      generateButton?.addEventListener("click", this.boundHandleGenerateButton);

      this.layersLabel = <HTMLElement>document.getElementById("layersLabel");
      this.spacingLabel = <HTMLElement>document.getElementById("spacingLabel");
      this.linecountLabel = <HTMLElement>document.getElementById("linecountLabel");

      const fileinput = <HTMLElement>document.querySelector('input[type="file"]');
      fileinput?.addEventListener('change', this.boundHandleFileInput);

      const decLayersButton = <HTMLElement>document.getElementById("decLayersButton");
      const incLayersButton = <HTMLElement>document.getElementById("incLayersButton");
      const decSpacingButton = <HTMLElement>document.getElementById("decSpacingButton");
      const incSpacingButton = <HTMLElement>document.getElementById("incSpacingButton");

      if (!decLayersButton || !incLayersButton || !decSpacingButton || !incSpacingButton) {
         throw new Error("Buttons not found.");
      }

      decLayersButton.addEventListener("click", (e: Event) => { this.handleChangeLayers(-1); });
      incLayersButton.addEventListener("click", (e: Event) => { this.handleChangeLayers(1); });
      decSpacingButton.addEventListener("click", (e: Event) => { this.handleChangeSpacing(-1); });
      incSpacingButton.addEventListener("click", (e: Event) => { this.handleChangeSpacing(1); });

      this.thecanvas?.addEventListener("mousedown", this.boundHandleMouseEvent);
      this.thecanvas?.addEventListener("mouseup", this.boundHandleMouseEvent);
      this.thecanvas?.addEventListener("mousemove", this.boundHandleMouseEvent);
      this.thecanvas?.addEventListener("wheel", this.boundHandleWheelEvent);

      window.addEventListener("resize", this.debounce(this.boundHandleResizeEvent, 1000, false), false);
      this.setLabels();
   }

   setSize(canvas: HTMLCanvasElement) {
      const container = <HTMLElement>document.getElementById("container");
      const header = <HTMLElement>document.getElementById("header");
      const body = <HTMLElement>document.getElementById("body");
      const footer = <HTMLElement>document.getElementById("footer");

      if (!container || !header || !body || !footer) {
         throw new Error("Missing element 'container', 'header', 'footer' or 'body'.");
      }

      canvas.height = container.offsetHeight - (header.offsetHeight + footer.offsetHeight + 10);
      canvas.width = container.offsetWidth - 10;
   }
}

(() => {
   const c = new Main();
   c.init();
})();

