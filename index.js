const express = require("express");
const {WebSocketServer, EventEmitter} = require("ws");
const PORT = process.env.PORT ?? 3000;
const app = express();

app.use("/", express.static(__dirname));
app.get("/", function (request, response) {
  response.sendFile(__dirname + "/index.html");
});

const server = app.listen(PORT, ()=>{
  console.log("[express]: Server started on port '" + PORT + "'.");
});

const socketServer = new WebSocketServer({ server });

/** @type {Map<string, SocketUser>} */
const connections = new Map();

class SocketUser{
  /** @type {string} */
  name = null;
  /** @type {string} */
  image = null;
  points = 0;
  /**
   * @param {WebSocket} socket
   * @param {string} id
   * @param {string} name
   */
  constructor(socket, id){
    this.socket = socket;
    this.id = id;
  }
  static generateId(){
    let id = Date.now().toString(36) + "_";
    let count = 0;
    for(let key of connections.keys())
      if(key.includes(id))
        count++;
    return id + count;
  }
};

/** @param {string | {}} data */
function broadcast(data){
  connections.forEach(({socket}) => socket.send(JSON.stringify(data)));
}

socketServer.on("connection", (socket, request)=>{
  const id = SocketUser.generateId();

  connections.set(id, new SocketUser(socket, id));
  socket.send(JSON.stringify({
    event: "init",
    data: { id }
  }));

  socket.on("open", ()=>{
    console.log("[socket]: open.");
  });
  socket.on("close", ()=>{
    connections.delete(id);
    broadcast({
      event: "user-disconnect",
      data: { id }
    });
    console.log("[socket]: close.");
  });
  socket.on("message", (rawData, isBinary)=>{
    /** @type {{event: string, data: {}}} */
    const {event, data} = JSON.parse(rawData.toString());
    if(event === "init"){
      const user = connections.get(data.id);
      user.name = data.name;
      user.image = data.image;
      broadcast({ event: "user-connect", data });
    }else
      broadcast({ event, data });
    console.log("[socket]: " + event + ".");
  });

});

socketServer.on("listening", ()=>{
  console.log("[socket]: Server connection successful.");
});