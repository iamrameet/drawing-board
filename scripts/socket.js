/// <reference path="socket.d.ts"/>
/// <reference path="../library/listener.js"/>

class SocketClient{
  /** @type {WebSocket} */
  #socketClient;
  /** @type {String} */
  #id = null;
  #user = { name: null, image: null };
  listener = new Listeners(["user-connect", "user-disconnect", "user-message"]);
  /** @param {UserInfo} userInfo */
  constructor(userInfo){
    this.#user.name = userInfo.name;
    this.#user.image = userInfo.image;
  }
  init(){
    this.#socketClient = new WebSocket("ws://" + location.host);
    this.#socketClient.onopen = this.#onopen;
    this.#socketClient.onclose = this.#onclose;
    this.#socketClient.onmessage = this.#onmessage.bind(this);
    this.#socketClient.onerror = this.#onerror;
  }

  get id(){
    return this.#id;
  }

  /**
   * @param {keyof SocketClientEventType} eventType
   * @param {{}} data */
  message(eventType, data){
    if(this.#socketClient.readyState === WebSocket.OPEN)
      this.#socketClient.send(JSON.stringify({ event: eventType, data }));
  }
  /**
   * @template {keyof SocketClientEventType} T
   * @param {T} eventType
   * @param {SocketClientEventType[T]} action */
  on(eventType, action){
    this.listener.on(eventType, action);
  }

  /** @param {Event} event */
  #onopen(event){
    console.log("[socket]: opened.");
  }
  #onclose(){
    console.log("[socket]: closed.");
  }
  /** @param {MessageEvent} event */
  #onmessage(event){
    /** @type {{event: keyof SocketClientEventType, data: {}}} */
    const response = JSON.parse(event.data);
    if(response.event === "init"){
      this.#id = response.data.id;
      this.message("init", {
        id: this.#id,
        name: this.#user.name,
        image: this.#user.image
      });
    }else{
      this.listener.trigger(response.event, response.data);
      console.log("[socket]: message: \"" + response.event + "\".");
    }
  }
  /** @param {Event} event */
  #onerror(event){
    console.log("[socket]: error: ", event);
  }
};