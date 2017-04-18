'use strict';

process.title = 'node-chat';

var webSocketServerPort = 1337;
var express = require('express');

var webSocketServer = require('websocket').server;
//var http = require('http');

//latest 100 messages
var history = [];
//list of currently connected clients (users)
var clients = [];

function htmlEntitites(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&lt;').replace(/"/g, '&quot;');
}

//Array with some colors
var colors = ['red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange'];
//random order
colors.sort(function (a, b) { return Math.random() > 0.5; });

/**
* Http server
*/
var app = express();
app.use(express.static('.'));
var server = app.listen(webSocketServerPort,"192.168.1.14", function () {
    console.log('server is started');
});

/*
* Websocket server
*/
var wsServer = new webSocketServer({
    // WebSocket server is tied to a HTTP server. WebSocket request is just
    // an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
    httpServer: server
});

wsServer.on('request', function (request) {
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');
    var connection = request.accept(null, request.origin);
    var index = clients.push(connection) - 1;
    var userName = false;
    var userColor = false;

    console.log((new Date()) + ' Connection accepted.');

    if (history.length > 0) {
        connection.sendUTF(JSON.stringify({ type: 'history', data: history }));
    }

    //user send some message
    connection.on('message', function (message) {
        if (message.type === 'utf8') {//accept only text
            if (userName === false) { //first message sent by user is their name
                //remember user name
                userName = htmlEntitites(message.utf8Data);
                //get random color and send it back to user
                userColor = colors.shift();
                connection.sendUTF(JSON.stringify({ type: 'color', data: userColor }));
                console.log((new Date()) + ' User is known as : ' + userName + ' with ' + userColor + ' color.');
            } else { //log and broadcast the message
                console.log((new Date()) + ' Received Message from ' + userName + ': ' + message.utf8Data);

                //keep history of all sent message
                var obj = {
                    time: (new Date()).getTime(),
                    text: htmlEntitites(message.utf8Data),
                    author: userName,
                    color: userColor
                };
                history.push(obj);
                history = history.slice(-100);

                //broadcast message to all connected clients
                var json = JSON.stringify({ type: 'message', data: obj });
                for (var i = 0; i < clients.length; i++) {
                    clients[i].sendUTF(json);
                }
            }
        }
    });
    //user disconnected
    connection.on('close', function (connection) {
        if (userName !== false && userColor !== false) {
            console.log((new Date()) + " Peer "
                + connection.remoteAddress + " disconnected.");
            // remove user from the list of connected clients
            clients.splice(index, 1);
            // push back user's color to be reused by another user
            colors.push(userColor);
        }
    });
});



