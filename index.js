"use strict";
function draw(ctx) {
}
function handleExportButton(ev) {
    ev.preventDefault();
    alert("export");
}
function handleLoadButton(ev) {
    ev.preventDefault();
    alert("load");
}
function init(ctx) {
    const exportButton = document.getElementById("exportbutton");
    exportButton === null || exportButton === void 0 ? void 0 : exportButton.addEventListener("click", handleExportButton);
    const loadButton = document.getElementById("loadbutton");
    loadButton === null || loadButton === void 0 ? void 0 : loadButton.addEventListener("click", handleLoadButton);
}
function setSize(canvas) {
    const container = document.getElementById("container");
    const header = document.getElementById("header");
    const body = document.getElementById("body");
    const footer = document.getElementById("footer");
    if (!container || !header && !body && !footer) {
        throw new Error("Missing element 'container', 'header', 'footer' or 'body'.");
    }
    canvas.height = container.offsetHeight - (header.offsetHeight + footer.offsetHeight + 10);
    canvas.width = container.offsetWidth - 10;
    console.log(canvas.width, canvas.height);
}
function main() {
    console.log("Crosshatching");
    const game = document.getElementById("canvas");
    if (game === null) {
        throw new Error("No canvas element with id 'canvas'.");
    }
    setSize(game);
    const ctx = game.getContext("2d");
    if (ctx === null) {
        throw new Error("2D context not available.");
    }
    ctx.fillStyle = "#181818";
    ctx.fillRect(0, 0, game.width, game.height);
    init(ctx);
    draw(ctx);
}
(() => { main(); })();
