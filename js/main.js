/*globals WebSocket, MsgControl, createBot, generateStatus, MessageController, setLoggedOffProperties*/

/**
 * Place your JS-code here.
 */
$(document).ready(function(){
  'use strict';

var websocket,
      wsSystem;

var MsgControl = new MessageController();


/**
 * Add eventhandler to server select dropdown list and connection properties.
 */
$('#dropDown').on('change', function() {
  console.log('change');
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



/**
 * Event handler to create the websocket connection when someone clicks the button #connect
 * Also contains websocket callback functions onopen, onmessage, onclose.
 */
$('#connect').on('click', function (event) {
    var url = $('#serverUrl').prop('value');
    var userName = $('#userName').prop('value');
    if (userName === '' || userName === null) {
        generateStatus('7', 'A username is required.');
        return;
    }
    if (websocket) {
      websocket.close();
      websocket = null;
    }
    MsgControl.user = userName;
    console.log( 'Connecting to: ' + url + ' With username: ' + MsgControl.user);
    websocket = new WebSocket( url, 'broadcast-protocol' );
    wsSystem = new WebSocket( url, 'system-protocol' );
    generateStatus('1');



/**
 * Websocket broadcast handlers.
 */
  websocket.onopen = function() {
    console.log('The websocket is now open.');
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
    console.log('The websocket is now closed.');
    generateStatus('5');
  };



/**
 * Websocket system handlers.
 */
  wsSystem.onopen = function() {
    console.log('The  wsSystem is now open.');
    wsSystem.send( MsgControl.newSystemInitMsg() );  // Give name to server.
  };
  wsSystem.onmessage = function(event) {
    console.log('Receiving system message: ' + event.data + ' From: ' + event.origin);
    var msg = JSON.parse(event.data);
    if ( !MsgControl.is_system_msg(msg) ) {
        console.log('error in system message');
    }
  };
  wsSystem.onclose = function() {
    console.log('The wsSystem is now closed.');
  };
  event.preventDefault();
});



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

  if(!websocket || websocket.readyState === 3) {
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
      generateStatus('3');
    }

    $('#message').prop('value', '');       // blank out the message input field after sending message.
  }

  event.preventDefault();
});



/**
 * Add eventhandler to BOT button
 */
$('#botButton').on('click', function (event) {
  createBot();
  event.preventDefault();
});



/**
 * Add eventhandler to disconnect button
 */
 $('#disconnect').on('click', function (event) {
  if(!websocket || websocket.readyState === 3) {
    console.log('The websocket is not connected to a server.');
    generateStatus('6');
  } else {
    websocket.close();
    wsSystem.close();
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

});