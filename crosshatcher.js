class Crosshatcher {
    constructor() {
        this.linespacing = 0;
        this.layers = 0;
        this.callback = null;
    }
    generate(lineWidth, layers, callback) {
        this.linespacing = lineWidth;
        this.layers = layers;
        this.callback = callback;
    }
}
export default Crosshatcher;
