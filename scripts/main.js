/// <reference path="E:/library/dom.js"/>

class Color{
  static white = "#fff";
  static black = "#000";
}

class DrawingBoard{

  #brush = {
    size: 2,
    color: Color.black
  };

  /** @type {{x: number, y: number}[]} */
  #points = [];
  /** @type {{x: number, y: number}[][]} */
  #paths = [];
  #lastPath = 0;

  /** @param {HTMLCanvasElement} canvasELement */
  constructor(canvasELement){
    this.canvas = canvasELement;
    this.context = canvasELement.getContext("2d");

    const mousemove = this.#onmousemove.bind(this);
    DOM.event(this.canvas, {
      mousedown: event => {
        this.context.strokeStyle = this.#brush.color;
        this.context.lineWidth = this.#brush.size;
        this.context.beginPath();
        this.context.moveTo(event.offsetX, event.offsetY);
        this.addPoint(event.offsetX, event.offsetY);
        DOM.event(this.canvas, { mousemove });
      },
      mouseup: event => {
        DOM.eventRemove(this.canvas, { mousemove });
        this.#paths.push(this.#points.splice(0));
        this.#lastPath++;
        this.context.closePath();
      }
    });

    window.addEventListener("keyup", event => {
      if(event.ctrlKey){
        switch(event.key){
          case "z": this.undoLast();
            break;
          case "y": this.redoLast();
            break;
        }
      }
    });
  }

  clear(){
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /** @param {MouseEvent} */
  #onmousemove({offsetX, offsetY}){
    const lastPoint = this.getLastPoint();
    if(lastPoint){
      if(lastPoint.x !== offsetX || lastPoint.y !== offsetY)
        this.addPoint(offsetX, offsetY);
    }else
      this.addPoint(offsetX, offsetY);
    this.context.lineTo(offsetX, offsetY);
    this.context.stroke();
    // this.context.fillRect(offsetX - 5, offsetY - 5, 10, 10);
  }

  addPoint(x, y){
    this.#points.push({x, y});
    // console.log(this.#points.length)
  }

  getLastPoint(){
    if(this.#points.length === 0)
      return null;
    return this.#points[this.#points.length - 1];
  }

  drawPaths(){
    this.context.strokeStyle = this.#brush.color;
    this.context.lineWidth = this.#brush.size;
    this.context.beginPath();
    for(let p = 0; p < this.#lastPath; p++){
      const path = this.#paths[p];
      this.context.moveTo(path[0].x, path[0].y);
      for(let i = 1; i < path.length; i++)
        this.context.lineTo(path[i].x, path[i].y);
    }
    this.context.stroke();
    this.context.closePath();
  }

  undoLast(){
    if(this.#lastPath > 0){
      this.clear();
      this.#lastPath--;
      this.drawPaths();
    }
  }
  redoLast(){
    if(this.#lastPath < this.#paths.length){
      this.clear();
      this.#lastPath++;
      this.drawPaths();
    }
  }
}

function main(){
  const canvas = DOM.id("canvas");
  const board = new DrawingBoard(canvas);
}

addEventListener("load", main);