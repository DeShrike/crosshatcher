import Vector2 from "./vector2.js";
class Main {
    constructor() {
        this.thecanvas = null;
        this.ctx = null;
        this.layersLabel = null;
        this.spacingLabel = null;
        this.linespacing = 20;
        this.layers = 5;
        this.thumbWidth = 150;
        this.pixels = null;
        this.imageWidth = 0;
        this.imageHeight = 0;
        this.imageName = "";
        this.drawingWidth = 0;
        this.drawingHeight = 0;
        this.scaleFactor = 1;
        this.translateAmount = new Vector2(0, 0);
        this.fullTranslateAmount = new Vector2(0, 0);
        this.mouseDown = false;
        this.mouseDownPos = new Vector2(0, 0);
        console.log("Crosshatching");
        this.thecanvas = document.getElementById("canvas");
        if (this.thecanvas === null) {
            throw new Error("No canvas element with id 'canvas'.");
        }
        this.boundHandleFileInput = this.handleFileInput.bind(this);
        this.boundHandleMouseEvent = this.handleMouseEvent.bind(this);
        this.boundHandleWheelEvent = this.handleWheelEvent.bind(this);
        this.boundHandleResizeEvent = this.handleResizeEvent.bind(this);
        this.pixels = null;
        this.setSize(this.thecanvas);
        this.ctx = this.thecanvas.getContext("2d");
        if (this.ctx === null) {
            throw new Error("2D context not available.");
        }
        this.ctx.fillStyle = "#181818";
        this.ctx.fillRect(0, 0, this.thecanvas.width, this.thecanvas.height);
    }
    debounce(func, wait, immediate) {
        let timeout;
        return () => {
            const context = this, args = arguments;
            const later = function () {
                timeout = undefined;
                if (!immediate)
                    func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow)
                func.apply(context, args);
        };
    }
    fillCircle(center, radius) {
        var _a, _b, _c;
        (_a = this.ctx) === null || _a === void 0 ? void 0 : _a.beginPath();
        (_b = this.ctx) === null || _b === void 0 ? void 0 : _b.arc(...center.array(), radius, 0, 2 * Math.PI);
        (_c = this.ctx) === null || _c === void 0 ? void 0 : _c.fill();
    }
    strokeLine(p1, p2) {
        var _a, _b, _c, _d;
        (_a = this.ctx) === null || _a === void 0 ? void 0 : _a.beginPath();
        (_b = this.ctx) === null || _b === void 0 ? void 0 : _b.moveTo(...p1.array());
        (_c = this.ctx) === null || _c === void 0 ? void 0 : _c.lineTo(...p2.array());
        (_d = this.ctx) === null || _d === void 0 ? void 0 : _d.stroke();
    }
    setLabels() {
        this.layersLabel.innerHTML = `${this.layers}`;
        this.spacingLabel.innerHTML = `${this.linespacing}`;
    }
    drawImagePreview() {
        var _a;
        var img = document.getElementById("theimage");
        let pwidth = this.thumbWidth;
        let pheight = img.height * (pwidth / img.width);
        (_a = this.ctx) === null || _a === void 0 ? void 0 : _a.drawImage(img, 0, 0, img.width, img.height, 0, 0, pwidth, pheight);
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
        this.ctx.fillRect(0, 0, this.thecanvas.width, this.thecanvas.height);
        this.drawImagePreview();
        this.ctx.translate(...this.translateAmount.add(this.fullTranslateAmount).array());
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
    handleGenerateButton(ev) {
        ev.preventDefault();
        alert("generate");
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
                    this.imageWidth = img.width;
                    this.imageHeight = img.height;
                    this.imageName = e.target.files[0].name;
                    this.initProject();
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
    screenToWorld(v) {
        return v.sub(this.fullTranslateAmount).scale(1 / this.scaleFactor);
    }
    handleResizeEvent(e) {
        console.log("Resize");
        if (this.thecanvas !== null) {
            this.setSize(this.thecanvas);
        }
        this.draw();
    }
    changeScale(delta) {
        const zoomFactor = 0.001;
        this.scaleFactor *= Math.exp(delta * zoomFactor);
    }
    handleWheelEvent(e) {
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
    handleMouseEvent(e) {
        if (e.type === "mouseup") {
            this.mouseDown = false;
            this.fullTranslateAmount = this.fullTranslateAmount.add(this.translateAmount);
            this.translateAmount = new Vector2(0, 0);
        }
        else if (e.type === "mousedown") {
            this.mouseDownPos = new Vector2(e.offsetX, e.offsetY);
            this.mouseDown = true;
            // console.log(this.mouseDownPos);
            if (this.ctx !== null) {
                this.ctx.fillStyle = "blue";
            }
            this.fillCircle(this.screenToWorld(this.mouseDownPos), 10);
        }
        else if (e.type === "mousemove") {
            if (this.mouseDown) {
                const newPos = new Vector2(e.offsetX, e.offsetY);
                this.translateAmount = newPos.sub(this.mouseDownPos);
                //this.mouseDownPos = newPos;
                this.draw();
            }
        }
    }
    initProject() {
        if (this.ctx == null) {
            return;
        }
        // console.log(`New Project: ${this.imageName}: ${this.imageWidth}x${this.imageHeight}`);
        this.drawingWidth = 1000;
        this.drawingHeight = Math.ceil(this.imageHeight * (this.drawingWidth / this.imageWidth));
        // console.log(`Drawing ${this.drawingWidth}x${this.drawingHeight}`);
        this.fullTranslateAmount = new Vector2(0, 0);
        this.translateAmount = new Vector2(0, 0);
        this.scaleFactor = 1;
        const cw = this.ctx.canvas.width;
        const ch = this.ctx.canvas.height;
        let sf1 = 1;
        let sf2 = 1;
        if (this.drawingWidth > cw) {
            sf1 = cw / this.drawingWidth;
        }
        if (this.drawingHeight > ch) {
            sf2 = ch / this.drawingHeight;
        }
        // console.log(`SF1: ${sf1}   SF2: ${sf2}`);
        this.scaleFactor = Math.min(sf1, sf2);
        this.ctx.lineWidth = 1;
        this.draw();
    }
    init() {
        var _a, _b, _c, _d;
        const exportButton = document.getElementById("exportButton");
        exportButton === null || exportButton === void 0 ? void 0 : exportButton.addEventListener("click", this.handleExportButton);
        //const loadButton = <HTMLElement>document.getElementById("loadButton");
        //loadButton?.addEventListener("click", this.handleLoadButton);
        const generateButton = document.getElementById("generateButton");
        generateButton === null || generateButton === void 0 ? void 0 : generateButton.addEventListener("click", this.handleGenerateButton);
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
        (_a = this.thecanvas) === null || _a === void 0 ? void 0 : _a.addEventListener("mousedown", this.boundHandleMouseEvent);
        (_b = this.thecanvas) === null || _b === void 0 ? void 0 : _b.addEventListener("mouseup", this.boundHandleMouseEvent);
        (_c = this.thecanvas) === null || _c === void 0 ? void 0 : _c.addEventListener("mousemove", this.boundHandleMouseEvent);
        (_d = this.thecanvas) === null || _d === void 0 ? void 0 : _d.addEventListener("wheel", this.boundHandleWheelEvent);
        window.addEventListener("resize", this.debounce(this.boundHandleResizeEvent, 1000, false), false);
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
        // console.log(`Canvas: ${canvas.width}x${canvas .height}`);
    }
    run() {
        this.setLabels();
        console.log(this.pixels);
        this.draw();
    }
}
(() => {
    const c = new Main();
    c.init();
})();
