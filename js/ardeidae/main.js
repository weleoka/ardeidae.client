/*globals WebSocket, MsgControl, websocket: true, wsSystem: true, wsLogin: true, createBot, generateStatus, MessageController, ConnectionController, setLoggedOffProperties*/

/**
 * Place your JS-code here.
 */


//$(document).ready( function () {
//  'use strict';


var broadcast_protocol = 'broadcast-protocol';
var system_protocol = 'system-protocol';
var MsgControl = new MessageController();


/**
 * Add eventhandler to server select dropdown list and connection properties.
 */
$('#dropDown').on('change', function() {
  $('#serverUrl').prop('value', $(this).prop('value'));
});

// Make sure the user connects when hitting enter on adress or username field.
$('#serverUrl').on('keypress', function(event) {
    if (event.keyCode === 13) {
      $('#connect').trigger('click');
      event.preventDefault();
    }
});

$('#userName').on('keypress', function(event) {
    if (event.keyCode === 13) {
      $('#connect').trigger('click');
      event.preventDefault();
    }
});

var websocket,
      wsSystem,
      wsLogin;

/**
 * Event handler to create the websocket connection when someone clicks the button #connect
 * Also contains websocket callback functions onopen, onmessage, onclose.
 */
$('#connect').on('click', function (event) {

    var url = $('#serverUrl').prop('value');
    var userName = $('#userName').prop('value');
    var password = $('#password').prop('value');
    $('#send').off('click');  // Take away the send buttons eventhandler.

    if (userName === '' || userName === null) {
        generateStatus('7', 'A username is required.');
        return;
    }
    MsgControl.user = userName;

    if ( websocket ) {
      websocket.close();
      wsSystem.close();
    }

    if ( password ) {     // get special protocols for protected server.
      console.log('Starting login protocol. PASWORD IS PSSWD IS:' + password);
      wsLogin = new WebSocket( url, 'login-protocol' );
      // loginInstance( , url, userName, password );
    }
    if ( !password ) {    // default protocols for open server.
      console.log('Connecting to server without login protocol: ');
      console.log( url + ' With username: ' + userName + ' and protocol: '+ broadcast_protocol);
      generateStatus('1');
      websocket = new WebSocket( url, broadcast_protocol );
      wsSystem = new WebSocket( url, system_protocol );
    }



/**
 * Add eventhandler to send button
 */
$('#send').on('click', function (event) {
  var content = $('#message').prop('value');
  var reciever = [];

  $('input.checkboxes').each( function() {  // check if message private and which recievers.
         if($(this).prop('checked')) {
                  reciever.push($(this).prop('id'));
         }
  });

  if ( !websocket || websocket.readyState === 3) {
    console.log('The websocket is not connected to a server.');
    generateStatus('6');
  } else {
    console.log(reciever);
    if ( reciever.length === 0 ) {
      console.log("Sending message: " + content);
      websocket.send(
              MsgControl.newMsg( content )
      );
      generateStatus('3');
    } else {
      console.log("Sending private message: " + content);
      websocket.send(
              MsgControl.newPrivateMsg( content, reciever )
      );
      generateStatus('8');
    }

    $('#message').prop('value', '');       // blank out the message input field after sending message.
  }

  event.preventDefault();
});



/**
 * Add eventhandler to disconnect button
 */
$('#disconnect').on('click', function (event) {
  if( !websocket || websocket.readyState === 3 ) {
    console.log('The websocket is not connected to a server.');
    generateStatus('6');
  } else {
    wsSystem.close();
    wsSystem = null;
    websocket.close();
    websocket = null;
  }
  $('#send').off('click');
  event.preventDefault();
});


if ( wsLogin ) {
    wsLogin.onopen = function() {
      var pswd = $('#password').prop('value');
      console.log('The wsLogin connection is now open.');
      if ( pswd ) {
        console.log( 'Connecting to: ' + url + ' With username: ' + userName + ' and password: ' + pswd);
        wsLogin.send(   // Give name and Password to server.
                MsgControl.newSystemLoginMsg( pswd )
        );
      }
    };

    wsLogin.onmessage = function(event) {
      var msg = JSON.parse(event.data);
      if ( msg.lead === 'success' ) {
        $('#password').prop('value', null);
        broadcast_protocol = msg.broadcast_protocol;
        system_protocol = msg.system_protocol;

        generateStatus('7', msg.message);
        $('#connect').trigger('click');
      } else {
        generateStatus('7', msg.message);
      }
    };

    wsLogin.onclose = function() {
      console.log('The wsLogin connection is now closed.');
    };
  }
 // }



  /**
   * Websocket broadcast handlers.
   */
 // function systemInstance ( wsSystem ) {
 //   this.wsSystem = wsSystem;

if ( wsSystem ) {
    wsSystem.onopen = function() {
      console.log('The wsSystem connection is now open.');
      this.send( MsgControl.newSystemInitMsg() );  // Give name to server.
    };
    wsSystem.onmessage = function(event) {
      console.log('Receiving system message: ' + event.data + ' From: ' + event.origin);
      var msg = JSON.parse(event.data);
      if ( !MsgControl.is_system_msg(msg) ) {
          if ( msg.message ) {
            console.log('Message from server: ' + msg.message);
          }
          console.log('error in message from server.');
      }
    };
    wsSystem.onclose = function() {
      console.log('The wsSystem connection is now closed.');
    };
}
 // }


  /**
   * Websocket broadcast handlers.
   */
// function broadcastInstance ( websocket ) {
//    this.websocket = websocket;
if ( websocket ) {
    websocket.onopen = function() {
      console.log('The websocket connection is now open.');
      generateStatus('2');
    };

    websocket.onmessage = function(event) {
      var msg = JSON.parse(event.data);
      if ( !msg.time ) {
        if ( !MsgControl.is_own_msg(msg) ) {    // prevent own message being counted as recieved message.
          generateStatus('4');
        }
          MsgControl.addToOutput(msg);
      }
      if ( msg.time ) {
          MsgControl.addHistoryToOutput(msg);   // publish the history message in client.
      }
    };

    websocket.onclose = function() {
      console.log('The websocket connection is now closed.');
      generateStatus('5');
    };
  }
  event.preventDefault();
}); // Closing tags for CONNECT ON CLICK EVENTHANDLER.



/**
 * Add eventhandler to BOT button
 */
$('#botButton').on('click', function (event) {
  console.log('BOTTED');
  createBot();
  event.preventDefault();
});


/**
 * Add eventhandler to stylesheet button
 */
$('#stylesheetButton').on('click', function (event) {
  var current = $('#activeCss').prop('href');
  var filename = current.slice((current.length -13), current.length );
  if (filename == 'css/style.css' ) {
    $('#activeCss').prop('href', 'css/styledark.css');
  } else {
    $('#activeCss').prop('href', 'css/style.css');
  }
  event.preventDefault();
});
/**
 * Add eventhandler to message input field to trigger send button on enter,
 * or newline break if shift + enter.
 */
$('#message').on('keypress', function(event) {
    if (event.keyCode === 13 && !event.shiftKey) {
      $('#send').trigger('click');
      event.preventDefault();
    }
});



$('#selectAll').on('click', function() {  //on click
    if ($(this).prop('checked') ) { // check select status
        $('.checkboxes').each(function() { //loop through each checkbox
            $(this).prop('checked', true);  //select all checkboxes with class "checkboxes"
        });
    } else {
        $('.checkboxes').each(function() { //loop through each checkbox
            $(this).prop('checked', false); //deselect all checkboxes with class "checkboxes"
        });
    }
});



setLoggedOffProperties();



console.log('Everything is ready.');

//});