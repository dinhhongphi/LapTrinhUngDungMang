$(function () {
    "use strict";
    var content = $('#content');
    var input = $('#input');
    var status = $('#status');

    //color assigned by the server
    var myColor = false;
    //name sent to the server
    var myName = false;

    //if user is running mozilla then use it's built-in websocket
    window.WebSocket == window.WebSocket || window.MozWebSocket;

    if (!window.WebSocket) {
        content.html($('<p>', { text: 'Sorry, but your browser doesn\'t support websocket' }));
        input.hide();
        $('span').hide();
        return;
    };

    var connection = new WebSocket('ws://192.168.1.14:1337');

    connection.onopen = function () {
        //first we want users to enter their names
        input.removeAttr('disabled');
        status.text('Choose name:');
    };

    connection.onerror = function (err) {
        content.html($('<p>', {
            text: 'Sorry, but there\'s some problem with your '
            + 'connection or the server is down.'
        }));
    };

    connection.onmessage = function (message) {
        try {
            var json = JSON.parse(message.data);
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
        }

        if (json.type === 'color') {
            myColor = json.data;
            status.text(myName + ': ').css('color', myColor);
            input.removeAttr('disabled').focus();
        } else if (json.type === 'history') {
            for (var i = 0; i < json.data.length; i++) {
                addMessage(json.data[i].author, json.data[i].text,
                    json.data[i].color, new Date(json.data[i].time));
            }
            input.focus();
        } else if (json.type === 'message') {
            input.removeAttr('disabled'); //let user write another message
            addMessage(json.data.author, json.data.text, json.data.color, new Date(json.data.time));
            input.focus();
        } else {
            console.log('Hmm..., I\'ve never seen JSON like this: ', json);
        }
    }

    /*
        send message when user presses Enter key
    */
    input.keydown(function (e) {
        if (e.keyCode === 13) {
            var msg = $(this).val();
            if (!msg) {
                return;
            }

            //send the message as an ordinary text
            connection.send(msg);
            $(this).val('');

            //disable the input field to make the user wait until server 
            //sends back response
            input.attr('disabled', 'disabled');

            if (myName === false) {
                myName = msg;
            }
        }
    });

    function addMessage(author, message, color, dt) {
        content.prepend('<p><span style="color:' + color + '">' + author + '</span> @ ' +
            + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
            + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
            + ': ' + message + '</p>');
    }
});