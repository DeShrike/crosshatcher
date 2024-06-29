"use strict";
class Crosshatch {
    constructor() {
        this.thecanvas = null;
        this.ctx = null;
        this.layersLabel = null;
        this.spacingLabel = null;
        this.linespacing = 20;
        this.layers = 5;
        this.pixels = null;
        console.log("Crosshatching");
        this.thecanvas = document.getElementById("canvas");
        if (this.thecanvas === null) {
            throw new Error("No canvas element with id 'canvas'.");
        }
        this.boundHandleFileInput = this.handleFileInput.bind(this);
        this.pixels = null;
        this.setSize(this.thecanvas);
        this.ctx = this.thecanvas.getContext("2d");
        if (this.ctx === null) {
            throw new Error("2D context not available.");
        }
        this.ctx.fillStyle = "#181818";
        this.ctx.fillRect(0, 0, this.thecanvas.width, this.thecanvas.height);
    }
    setLabels() {
        this.layersLabel.innerHTML = `${this.layers}`;
        this.spacingLabel.innerHTML = `${this.linespacing}`;
    }
    drawImagePreview() {
        var _a;
        var img = document.getElementById("theimage");
        let pwidth = 160;
        let pheight = img.height * (pwidth / img.width);
        (_a = this.ctx) === null || _a === void 0 ? void 0 : _a.drawImage(img, 0, 0, img.width, img.height, 0, 0, pwidth, pheight);
    }
    draw() {
        var _a;
        (_a = this.ctx) === null || _a === void 0 ? void 0 : _a.fillRect(0, 0, this.thecanvas.width, this.thecanvas.height);
        this.drawImagePreview();
    }
    handleExportButton(ev) {
        ev.preventDefault();
        alert("export");
    }
    handleLoadButton(ev) {
        ev.preventDefault();
        alert("load");
    }
    handleFileInput(e) {
        if (e.target.files && e.target.files[0]) {
            console.log(e.target.files[0].name);
            var img = document.getElementById("theimage");
            img.onload = () => {
                let tempcanvas = document.createElement("canvas");
                if (!tempcanvas) {
                    throw new Error("Could not create temporary canvas.");
                }
                let tempcontext = tempcanvas.getContext("2d");
                if (!tempcontext) {
                    throw new Error("Could not get 2D context from temporary canvas.");
                }
                // console.log("img", img.width, img.height);
                tempcanvas.width = img.width;
                tempcanvas.height = img.height;
                tempcontext.clearRect(0, 0, img.width, img.height);
                tempcontext.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
                try {
                    const imgData = tempcontext.getImageData(0, 0, img.width, img.height);
                    this.pixels = imgData.data;
                    this.run();
                }
                catch (e) {
                    this.pixels = null;
                    throw e;
                }
                tempcontext = null;
                //tempcanvas = null;
                URL.revokeObjectURL(img.src); // no longer needed, free memory
            };
            img.src = URL.createObjectURL(e.target.files[0]); // set src to blob url
        }
    }
    handleChangeLayers(delta) {
        this.layers += delta;
        this.setLabels();
    }
    handleChangeSpacing(delta) {
        this.linespacing += delta;
        this.setLabels();
    }
    init() {
        const exportButton = document.getElementById("exportButton");
        exportButton === null || exportButton === void 0 ? void 0 : exportButton.addEventListener("click", this.handleExportButton);
        //const loadButton = <HTMLElement>document.getElementById("loadButton");
        //loadButton?.addEventListener("click", this.handleLoadButton);
        this.layersLabel = document.getElementById("layersLabel");
        this.spacingLabel = document.getElementById("spacingLabel");
        const fileinput = document.querySelector('input[type="file"]');
        fileinput === null || fileinput === void 0 ? void 0 : fileinput.addEventListener('change', this.boundHandleFileInput);
        const decLayersButton = document.getElementById("decLayersButton");
        const incLayersButton = document.getElementById("incLayersButton");
        const decSpacingButton = document.getElementById("decSpacingButton");
        const incSpacingButton = document.getElementById("incSpacingButton");
        if (!decLayersButton || !incLayersButton || !decSpacingButton || !incSpacingButton) {
            throw new Error("Buttons not found.");
        }
        decLayersButton.addEventListener("click", (e) => { this.handleChangeLayers(-1); });
        incLayersButton.addEventListener("click", (e) => { this.handleChangeLayers(1); });
        decSpacingButton.addEventListener("click", (e) => { this.handleChangeSpacing(-1); });
        incSpacingButton.addEventListener("click", (e) => { this.handleChangeSpacing(1); });
    }
    setSize(canvas) {
        const container = document.getElementById("container");
        const header = document.getElementById("header");
        const body = document.getElementById("body");
        const footer = document.getElementById("footer");
        if (!container || !header || !body || !footer) {
            throw new Error("Missing element 'container', 'header', 'footer' or 'body'.");
        }
        canvas.height = container.offsetHeight - (header.offsetHeight + footer.offsetHeight + 10);
        canvas.width = container.offsetWidth - 10;
        console.log(canvas.width, canvas.height);
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
/*


<div id="sfcu85jrwhsw3pz7w3bxlbaumrz4m4mc44h"></div>
<script type="text/javascript" src="https://counter8.optistats.ovh/private/counter.js?c=u85jrwhsw3pz7w3bxlbaumrz4m4mc44h&down=async" async></script>
<br>
<a href="https://www.freecounterstat.com">free counter</a>
<noscript>
<a href="https://www.freecounterstat.com" title="free counter"><img src="https://counter8.optistats.ovh/private/freecounterstat.php?c=u85jrwhsw3pz7w3bxlbaumrz4m4mc44h" border="0" title="free counter" alt="free counter"></a>
</noscript>

No java:
<a href="https://www.freecounterstat.com" title="free counter"><img src="https://counter8.optistats.ovh/private/freecounterstat.php?c=u85jrwhsw3pz7w3bxlbaumrz4m4mc44h" border="0" title="free counter" alt="free counter"></a>





*/ 
