/*globals WebSocket, MsgControl, CnctControl, createBot, generateStatus, MessageController, ConnectionController, setLoggedOffProperties*/

/**
 * Place your JS-code here.
 */


//$(document).ready( function () {
//  'use strict';

var MsgControl = new MessageController();
var CnctControl = new ConnectionController();

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
    var password = $('#password').prop('value');

    if (userName === '' || userName === null) {
        generateStatus('7', 'A username is required.');
        return;
    }
    MsgControl.user = userName;

    if ( CnctControl.websocket ) {
      CnctControl.close();
    }

    if ( password ) {     // get special protocols for protected server.
      console.log('Starting login protocol.');
      CnctControl.login( url, userName, password );

    }
    if ( !password ) {    // default protocols for open server.
      console.log('Connecting to server without login protocol: ');
      console.log( url + ' With username: ' + MsgControl.user);
      var params = { url: url,
                           broadcast: 'broadcast-protocol',
                           system: 'sytem-protocol'};
      CnctControl.connect( params );
    }
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

  if ( !CnctControl.websocket || CnctControl.websocket.readyState === 3) {
    console.log('The websocket is not connected to a server.');
    generateStatus('6');
  } else {
    console.log(reciever);
    if ( reciever.length === 0 ) {
      console.log("Sending message: " + content);
      CnctControl.websocket.send(
              MsgControl.newMsg( content )
      );
      generateStatus('3');
    } else {
      console.log("Sending private message: " + content);
      CnctControl.websocket.send(
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
  if(!CnctControl.websocket || CnctControl.websocket.readyState === 3) {
    console.log('The websocket is not connected to a server.');
    generateStatus('6');
  } else {
    CnctControl.close();
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