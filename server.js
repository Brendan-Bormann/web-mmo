const express = require('express');
const WebServer = express();

WebServer.use(express.static('public'));

WebServer.listen(3000, () => {
    console.log("Server listening on port 3000.");
});

const WebSocket = require("ws");

const Server = new WebSocket.Server({ port: 6969 });
Server.on('connection', socket => {

    console.log(`[CLIENT]: connected`);

    let myPlayer = new Player();

    PlayerList.push(myPlayer);

    socket.send(`id ${myPlayer.id}`);

    socket.on('message', message => {
        MessageHandler(socket, message, myPlayer);
    });

    socket.on('close', (event) => {
        console.log(`[CLIENT]: disconnected`);

        let newPlayerList = [];

        for (let i = 0; i < PlayerList.length; i++) {
            if (PlayerList[i].id !== myPlayer.id) {
                newPlayerList.push(PlayerList[i]);
            }
        }

        PlayerList = newPlayerList;
    });
});

Server.on('listening', () => {
    console.log("Server listening on port 6969.");
});


let PlayerList = [];
let incID = 0;

class Player {
    id = incID++;
    x = 0;
    y = 0;

    speed = 5;

    up = false;
    down = false;
    left = false;
    right = false;

    SetInput = (key, status) => {
        switch (key) {
            case "p": {
                console.log(`Position (${this.x}, ${this.y})`);
                break;
            };
            case "w": {
                if (status === "down") this.up = true;
                if (status === "up") this.up = false;
                break;
            };
            case "a": {
                if (status === "down") this.left = true;
                if (status === "up") this.left = false;
                break;
            };
            case "s": {
                if (status === "down") this.down = true;
                if (status === "up") this.down = false;
                break;
            };
            case "d": {
                if (status === "down") this.right = true;
                if (status === "up") this.right = false;
                break;
            };
        }
    }
}

function MessageHandler(socket, incMessage, myPlayer) {

    let message = incMessage;

    if (message === "update") {
        socket.send(`update ${JSON.stringify(PlayerList)}`);
        return
    }

    if (message.split(' ')[0] === "input") {

        for (let i = 0; i < PlayerList.length; i++) {
            if (PlayerList[i].id === myPlayer.id) {
                PlayerList[i].SetInput(message.split(' ')[1], message.split(' ')[2]);
            }
        }
    }
}

function EventLoop() {
    let gravity = 1;

    PlayerList.forEach(player => {

        // move players
        if (player.up) player.y -= player.speed;
        if (player.down) player.y += player.speed;
        if (player.left) player.x -= player.speed;
        if (player.right) player.x += player.speed;
    });
}

setInterval(EventLoop, 10);
