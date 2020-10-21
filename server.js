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

    Move = (direction) => {
        switch(direction) {
            case "w": {
                this.y -= this.speed
                break;
            };
            case "a": {
                this.x -= this.speed
                break;
            };
            case "s": {
                this.y += this.speed
                break;
            };
            case "d": {
                this.x += this.speed
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
            if (PlayerList[i].id === myPlayer.id){
                PlayerList[i].Move(message.split(' ')[1]);
            }
        }
    }

}