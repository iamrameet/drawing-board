/// <reference path="../library/listener.js"/>
/// <reference path="../library/dom.js"/>
/// <reference path="../scripts/drawing-board.js"/>
/// <reference path="../scripts/socket.js"/>

"use strict";

function createPlayer(id, name){
  return DOM.create("div", {
    id,
    class: "player",
    children: [
      DOM.create("div", { class: "rank", text: "1" }),
      DOM.create("div", {
        class: "info",
        children: [
          DOM.create("div", { class: "name", text: name }),
          DOM.create("div", { class: "points", text: "0" })
        ]
      }),
      DOM.create("div", {
        class: "avatar",
        children: [
          DOM.create("img", { src: "https://i.pravatar.cc/64?id=" + id })
        ]
      })
    ]
  });
}

/**
 * selected = selectElement(selected, toBeSelected);
 * @param {HTMLElement | null} selected
 * @param {HTMLElement} toBeSelected
 */
function selectElement(selected, toBeSelected){
  if(selected)
    selected.toggleAttribute("active", false);
  toBeSelected.toggleAttribute("active", true);
  return toBeSelected;
}

function main(){
  /** @type {HTMLCanvasElement} */
  const canvas = DOM.id("canvas");
  /** @type {HTMLDivElement} */
  const colors = DOM.id("colors");
  /** @type {HTMLDivElement} */
  const brushes = DOM.id("brushes");
  /** @type {HTMLDivElement} */
  const players = DOM.id("players");

  //#region SocketClient
  const socketClient = new SocketClient({
    name: "Nitish"
  });

  socketClient.on("user-connect", function(info){
    players.appendChild(createPlayer(info.id, info.name));
  });
  socketClient.on("user-disconnect", function(info){
    DOM.id(info.id)?.remove();
  });
  socketClient.on("user-message", function(message){
    console.log(message);
  });

  socketClient.init();
  //#endregion

  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;
  const board = new DrawingBoard(canvas);

  const hslColors = [
    "hsl(0 0% 0%)",
    ...Color.createHSLColors(10, .5),
    "hsl(0 0% 100%)",
    ...Color.createHSLColors(10, .35)
  ];

  /** @type {HTMLElement} */
  let selectedColor = null;
  hslColors.forEach(color => {
    colors.appendChild(DOM.create("div", {
      class: "color"
    }, {
      backgroundColor: color
    },{
      click(event){
        board.brushColor = color;
        selectedColor = selectElement(selectedColor, event.currentTarget);
      }
    }));
  });
  selectedColor = selectElement(selectedColor, colors.children[1]);

  /** @type {HTMLElement} */
  let selectedBrush = null;
  [1, 2, 4, 8, 16, 32, 64, 128].forEach(size => {
    brushes.appendChild(DOM.create("div", {
      class: "brush",
      text: size
      // children: [
      //   DOM.create("div", {/* no attribute */}, {
      //     width: size + "px",
      //     height: size + "px"
      //   })
      // ]
    }, {/* no style */} ,{
      click(event){
        board.brushSize = size;
        selectedBrush = selectElement(selectedBrush, event.currentTarget);
      }
    }));
  });
  selectedBrush = selectElement(selectedBrush, brushes.children[1]);
}

addEventListener("load", main);