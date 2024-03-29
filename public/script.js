const statusText = document.getElementById("connection-status");

let socket;

let playerID = null;

let PlayerList = [];

function connect() {
    if (socket !== undefined) return;

    let localhost = '127.0.0.1';
    let ip = '24.9.96.176';

    socket = new WebSocket(`ws://${ip}:6969`);

    let updateCycle;

    socket.onopen = event => {
        statusText.innerHTML = 'Connected';
        console.log('Connected to websocket.');

        updateCycle = setInterval(() => {
            socket.send("update");
        }, 25);
    }

    socket.onmessage = event => {
        let message = event.data;

        if (message.split(' ')[0] === "id") {
            playerID = message.split(' ')[1];
        }

        if (message.split(' ')[0] === "update") {
            PlayerList = JSON.parse(message.split(' ')[1]);
        }
    }

    socket.onclose = event => {

        clearInterval(updateCycle);

        PlayerList = [];

        if (event.wasClean) {
            console.warn(`Websocket closed cleanly.`);
        } else {
            console.warn(`Websocket closed messy-ly.`);
        }

        statusText.innerHTML = 'Disconnected';
    }
}

function disconnect() {
    if (socket !== undefined) {
        socket.close();
        socket = undefined;
    }
}

let keysDown = [];

document.addEventListener("keydown", (event) => {
    if (socket !== undefined) {
        if (keysDown.includes(event.key)) return;

        keysDown.push(event.key);

        socket.send(`input ${event.key} down`);
    }
});

document.addEventListener("keyup", (event) => {
    if (socket !== undefined) {

        keysDown.remove(event.key);

        socket.send(`input ${event.key} up`);
    }
});


Array.prototype.remove = function () {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};



let app = new PIXI.Application({
    width: 800,         // default: 800
    height: 600,        // default: 600
    antialias: true,    // default: false
    transparent: false, // default: false
    resolution: 1       // default: 1
});

app.renderer.backgroundColor = 0x061639;
app.renderer.resize(1600, 900);

let gameArea = document.getElementById("gameArea");
gameArea.appendChild(app.view);

PIXI.loader
    .add([
        "./assets/sword.png",
        "./assets/white-sprite.png"
    ])
    .load(setup);

let playerObjects = [];

function setup() {

    PlayerList.forEach(player => {

        let playerGameObject = new PIXI.Sprite(PIXI.loader.resources["./assets/white-sprite.png"].texture);

        playerGameObject.id = player.id;

        playerGameObject.position.set(player.x, player.y)

        app.stage.addChild(playerGameObject);

        playerObjects.push(playerGameObject);
    });

    app.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta) {

    for (let i = 0; i < PlayerList.length; i++) {

        if (playerObjects[i] === undefined) {
            let playerGameObject = new PIXI.Sprite(PIXI.loader.resources["./assets/white-sprite.png"].texture);

            playerGameObject.id = PlayerList[i].id;

            playerGameObject.position.set(PlayerList[i].x, PlayerList[i].y)

            app.stage.addChild(playerGameObject);

            playerObjects.push(playerGameObject);
        } else {
            playerObjects[i].position.x = PlayerList[i].x;
            playerObjects[i].position.y = PlayerList[i].y;
        }
    }

}