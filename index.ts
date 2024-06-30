import Vector2 from "./vector2.js";

class Crosshatch {
   private thecanvas: HTMLCanvasElement | null = null;
   private ctx: CanvasRenderingContext2D | null = null;

   private layersLabel: HTMLElement | null = null;
   private spacingLabel: HTMLElement | null = null;

   private linespacing: number = 20;
   private layers: number = 5;

   private boundHandleFileInput: (this: HTMLElement, ev: Event) => any;

   private pixels: Uint8ClampedArray | null = null;
   private imageWidth: number = 0;
   private imageHeight: number = 0;
   private imageName: string = "";
   private drawingWidth: number = 0;
   private drawingHeight: number = 0;
   private scaleFactor: number = 1;
   
   constructor() {
      console.log("Crosshatching");
      this.thecanvas = document.getElementById("canvas") as (HTMLCanvasElement | null);
      if (this.thecanvas === null)
      {
         throw new Error("No canvas element with id 'canvas'.");
      }
      
      this.boundHandleFileInput = this.handleFileInput.bind(this);
      
      this.pixels = null;

      this.setSize(this.thecanvas);

      this.ctx = this.thecanvas.getContext("2d");
      if (this.ctx === null)
      {
         throw new Error("2D context not available.");
      }

      this.ctx.fillStyle = "#181818";
      this.ctx.fillRect(0, 0, this.thecanvas.width, this.thecanvas.height);
   }

   fillCircle(center: Vector2, radius: number)
   {
      this.ctx?.beginPath();
      this.ctx?.arc(...center.array(), radius, 0, 2 * Math.PI);
      this.ctx?.fill();
   }

   strokeLine(p1: Vector2, p2: Vector2)
   {
      this.ctx?.beginPath();
      this.ctx?.moveTo(...p1.array());
      this.ctx?.lineTo(...p2.array());
      this.ctx?.stroke();
   }

   setLabels() {
      this.layersLabel!.innerHTML = `${this.layers}`;
      this.spacingLabel!.innerHTML = `${this.linespacing}`;
   }

   drawImagePreview() {
      var img = <HTMLImageElement>document.getElementById("theimage");
      let pwidth = 160;
      let pheight = img.height * (pwidth / img.width);
      this.ctx?.drawImage(img, 0, 0, img.width, img.height, 0, 0, pwidth, pheight)
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
      this.drawImagePreview();

      this.ctx.scale(this.scaleFactor, this.scaleFactor);

      this.ctx.fillStyle = "red";
      this.fillCircle(tl, 10);
      this.ctx.fillStyle = "green";
      this.fillCircle(tr, 10);
      this.fillCircle(bl, 10);
      this.fillCircle(br, 10);
      
      this.ctx.strokeStyle = "white";
      this.strokeLine(tl, br);
      this.strokeLine(tr, bl);
   }

   handleExportButton(this: HTMLElement, ev: MouseEvent): any {
      ev.preventDefault();
      alert("export");
   }

   handleLoadButton(this: HTMLElement, ev: Event) {
      ev.preventDefault();
      alert("load");
   }

   handleFileInput(e: any)
   {
      if (e.target.files && e.target.files[0]) {
         console.log(e.target.files[0].name);
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
      this.setLabels();
   }

   handleChangeSpacing(delta: number) {
      this.linespacing += delta;
      this.setLabels();
   }

   initProject() {
      if (this.ctx == null) {
         return;
      }

      console.log(`New Project: ${this.imageName}: ${this.imageWidth}x${this.imageHeight}`);
      this.drawingWidth = 1000;
      this.drawingHeight = Math.ceil(this.imageHeight * (this.drawingWidth / this.imageWidth));
      console.log(`Drawing ${this.drawingWidth}x${this.drawingHeight}`);

      this.scaleFactor = 1;
      const cw: number = this.ctx.canvas.width;
      const ch: number = this.ctx.canvas.height;

      let sf1: number = 1;
      let sf2: number = 1;
      if (this.drawingWidth > cw)
      {
         sf1 = cw / this.drawingWidth;
      }

      if (this.drawingHeight > ch)
      {
         sf2 = ch / this.drawingHeight;
      }

      console.log(`SF1: ${sf1}   SF2: ${sf2}`);

      this.scaleFactor = Math.min(sf1, sf2);
      this.ctx.lineWidth = 1;

      this.draw();
   }

   init() {
      const exportButton = <HTMLElement>document.getElementById("exportButton");
      exportButton?.addEventListener("click", this.handleExportButton);

      //const loadButton = <HTMLElement>document.getElementById("loadButton");
      //loadButton?.addEventListener("click", this.handleLoadButton);

      this.layersLabel = <HTMLElement>document.getElementById("layersLabel");
      this.spacingLabel = <HTMLElement>document.getElementById("spacingLabel");

      const fileinput = <HTMLElement>document.querySelector('input[type="file"]');
      fileinput?.addEventListener('change', this.boundHandleFileInput);

      const decLayersButton = <HTMLElement>document.getElementById("decLayersButton");
      const incLayersButton = <HTMLElement>document.getElementById("incLayersButton");
      const decSpacingButton = <HTMLElement>document.getElementById("decSpacingButton");
      const incSpacingButton = <HTMLElement>document.getElementById("incSpacingButton");

      if (!decLayersButton || !incLayersButton || !decSpacingButton || !incSpacingButton)
      {
         throw new Error("Buttons not found.");
      }

      decLayersButton.addEventListener("click", (e: Event) => { this.handleChangeLayers(-1); });
      incLayersButton.addEventListener("click", (e: Event) => { this.handleChangeLayers(1); });
      decSpacingButton.addEventListener("click", (e: Event) => { this.handleChangeSpacing(-1); });
      incSpacingButton.addEventListener("click", (e: Event) => { this.handleChangeSpacing(1); });
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

      console.log(`Canvas: ${canvas.width}x${canvas .height}`);
   }

   run() {
      this.setLabels();
      console.log(this.pixels);
      
      
      this.draw();
   }
}

(() => { 
   const c = new Crosshatch();
   c.init();
})();

