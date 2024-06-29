

function draw(ctx: CanvasRenderingContext2D)
{
}

function handleExportButton(this: HTMLElement, ev: Event)
{
   ev.preventDefault();
   alert("export");
}

function handleLoadButton(this: HTMLElement, ev: Event)
{
   ev.preventDefault();
   alert("load");
}

function init(ctx: CanvasRenderingContext2D)
{
   const exportButton = document.getElementById("exportbutton");
   exportButton?.addEventListener("click", handleExportButton);

   const loadButton = document.getElementById("loadbutton");
   loadButton?.addEventListener("click", handleLoadButton);
}

function setSize(canvas: HTMLCanvasElement)
{
   const container = <HTMLElement>document.getElementById("container");
   const header = <HTMLElement>document.getElementById("header");
   const body = <HTMLElement>document.getElementById("body");
   const footer = <HTMLElement>document.getElementById("footer");
   if (!container || !header && !body && !footer) {
      throw new Error("Missing element 'container', 'header', 'footer' or 'body'.");
   }
   
   canvas.height = container.offsetHeight - (header.offsetHeight + footer.offsetHeight + 10);
   canvas.width = container.offsetWidth - 10;

   console.log(canvas.width, canvas .height);
}

function main()
{
   console.log("Crosshatching");
   const game = document.getElementById("canvas") as (HTMLCanvasElement | null);
   if (game === null)
   {
      throw new Error("No canvas element with id 'canvas'.");
   }

   setSize(game);

   const ctx = game.getContext("2d");
   if (ctx === null)
   {
      throw new Error("2D context not available.");
   }

   ctx.fillStyle = "#181818";
   ctx.fillRect(0, 0, game.width, game.height);

   init(ctx);
   draw(ctx);
}

(() => { main(); })();
