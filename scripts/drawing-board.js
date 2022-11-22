class Color{
  static white = "#fff";
  static black = "#000";
  /**
   * @param {number} count
   * @param {number} light
   */
  static createHSLColors(count, light = .5){
    const step = Math.floor(360 / count);
    const colors = [];
    for(let hue = 0; hue < 360; hue += step)
      colors.push("hsl(" + hue + " 100% " + light * 100 + "%)");
    return colors;
  }
};

class Point{
  /**
   * @param {number} x
   * @param {number} y
   */
  constructor(x, y){
    this.x = x;
    this.y = y;
  }
};

class ExtendedPath2D extends Path2D{
  /**
   * @param {string} color
   * @param {number} size
   */
  constructor(color, size){
    super();
    this.color = color;
    this.size = size;
  }
}

/**
 * @template T
 * @extends {Array<T>}
*/
class ExtendedArray extends Array{
  pointer = 0;
  constructor(){
    super();
  }
  get last(){
    if(this.length === 0)
      return null;
    return this[this.length - 1];
  }
  removeAll(){
    this.pointer = 0;
    return this.splice(0);
  }
};

class DrawingBoard{

  #brush = {
    size: 1,
    color: Color.black
  };
  /** @type {ExtendedArray<ExtendedPath2D>} */
  #paths2D = new ExtendedArray();

  /** @param {HTMLCanvasElement} canvasELement */
  constructor(canvasELement){
    this.canvas = canvasELement;
    this.context = canvasELement.getContext("2d");
    this.context.lineCap = "round";
    this.context.lineJoin = "round";

    const mousemove = this.#onmousemove.bind(this);
    const mouseup = event => {
      DOM.eventRemove(this.canvas, { mousemove });
      this.context.stroke(this.#paths2D.last);
    };

    DOM.event(this.canvas, {
      mousedown: event => {
        this.context.strokeStyle = this.#brush.color;
        this.context.lineWidth = this.#brush.size;
        this.#paths2D.splice(this.#paths2D.pointer);
        this.#paths2D.pointer = this.#paths2D.push(new ExtendedPath2D(this.#brush.color, this.#brush.size));
        this.#paths2D.last.moveTo(event.offsetX, event.offsetY);
        this.#paths2D.last.lineTo(event.offsetX, event.offsetY);
        this.context.stroke(this.#paths2D.last);
        DOM.event(this.canvas, { mousemove });
      }
    });

    DOM.event(window, {
      mouseup,
      blur: mouseup,
      keyup: event => {
        event.preventDefault();
        if(event.ctrlKey){
          switch(event.key){
            case "z": this.undoLast(); break;
            case "y": this.redoLast(); break;
            case "s":
              this.save();
              break;
            case "l": this.load(); break;
          }
        }
      }
    });

  }

  /** @param {string} color */
  set brushColor(color){
    this.#brush.color = color;
  }
  /** @param {number} size */
  set brushSize(size){
    if(size > 0)
      this.#brush.size = size;
  }

  clear(){
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /** @param {MouseEvent} */
  #onmousemove({offsetX, offsetY}){
    this.#paths2D.last.lineTo(offsetX, offsetY);
    this.context.stroke(this.#paths2D.last);
  }

  drawPaths(){
    for(let p = 0; p < this.#paths2D.pointer; p++){
      const path = this.#paths2D[p];
      this.context.strokeStyle = path.color;
      this.context.lineWidth = path.size;
      this.context.stroke(path);
    }
  }

  undoLast(){
    if(this.#paths2D.pointer > 0){
      this.clear();
      this.#paths2D.pointer--;
      this.drawPaths();
    }
  }
  redoLast(){
    if(this.#paths2D.pointer < this.#paths2D.length){
      this.clear();
      this.#paths2D.pointer++;
      this.drawPaths();
    }
  }

  save(){
    localStorage.setItem("data", this.canvas.toDataURL());
  }
  load(){
    const data = localStorage.getItem("data");
    if(data){
      const image = new Image();
      image.src = data;
      image.onload = () => this.context.drawImage(image, 0, 0);
    }
  }
};