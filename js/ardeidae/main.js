/*globals WebSocket, MsgControl, VariablesController, FunctionController, MessageController, ConnectionController,
websocket: true, wsSystem: true, wsLogin: true, createBot,
generateStatus, setLoggedOffProperties, setLoggedOnProperties,
createCorsRequest, processServerData,
MutationObserver */

/**
 *  Place your JS-code here.
 */
 $(document).ready( function () {
 'use strict';

var MsgControl = new MessageController();
var ArdeiVars = new VariablesController();
// var ArdeiFunc = new FunctionController();
var CurrentServer = null;

var websocket,
      wsSystem,
      wsLogin;


/**
 *  Callback function to process CORS data
 */
var processServerData = function (data) {
      var dataa = JSON.parse(data);
      setLoggedOffProperties(dataa);
};



/**
 *  Make an Anax request... CORS support enabled, browser compliance mode.
 */
var createCorsRequest = function (method, url, callback) {
  // Change from ws:// to http:// in url.
    var httpUrl = 'http://' + url.slice(5, url.length);

    $.ajax({
      type: method,
      url: httpUrl,
      contentType: 'application/json',
      data: JSON.stringify({
            name: 'clientName',
            age: 37
      }),
      dataType: 'text',
      success: function(data){
        callback(data);
      },
      error: function(textStatus, errorThrown){ // jqXHR
        console.log(textStatus);
        console.log('Ajax request failed: ' + textStatus + ', ' + errorThrown);
      }
    });
};



/**
 *  Add eventhandler to server select dropdown list and connection properties.
 */
$('#dropDown').on('change', function() {
    ArdeiVars.resetProtocols();
    var wsUrl = $(this).prop('value');
// Update the textbox with the dropDown list url.
    $('input#serverUrl').prop('value', wsUrl);
// This is to get server meta data.
    createCorsRequest('POST', wsUrl, processServerData);
});


// Make sure the user connects when hitting enter on adress, username or password field.
$('body').on('keypress', 'input#serverUrl', function(event) {
    if (event.keyCode === 13) {
      $('#connectionHandler').trigger('custom');
      event.preventDefault();
    }
});

$('body').on('keypress', 'input#userName', function(event) {
    if (event.keyCode === 13) {
      $('#connectionHandler').trigger('custom');
      event.preventDefault();
    }
});

$('body').on('keypress', 'input#password', function(event) {
    if (event.keyCode === 13) {
      $('#connectionHandler').trigger('custom');
      event.preventDefault();
    }
});



/**
 *  Add eventhandler to Register, login, and connect buttons
 */
$('body').on('click', 'button#registerButton', function (event) {
    $('#connectionHandler').trigger( 'custom', 'registerConnect' );
    event.preventDefault();
});

$('body').on('click', 'button#connectButton', function (event) {
    $('#connectionHandler').trigger( 'custom' );
    event.preventDefault();
});



/**
 *  Custom event handler to create the websocket connection.
 *  Also contains websocket callback functions onopen, onmessage, onclose.
 */
$('#connectionHandler').on('custom', function ( event, arg1 ) {
    if ( !arg1 ) { arg1 = $('#connectButton').prop('value'); }
    console.log('Connection controller argument is: ' + arg1);
    var url = $('input#serverUrl').prop('value');
    var userName = $('#userName').prop('value');
    var password = $('#password').prop('value');
    var eMail = $('#eMail').prop('value');
    var newUserDetails = {name: userName,
                                       email: eMail,
                                       password: password };
    MsgControl.user = userName;

// Take away eventhandlers from html elements.
    $('#send').off('click');
    $('#disconnect').off('click');
    // $('#registerConnect').off('click');

// Check if websocket is already established, close if true.
    if ( websocket ) {
    //  wsLogin.close();
      websocket.close();
      wsSystem.close();
    }

// User name is required for all actions.
    if (userName === '' || userName === null) {
        generateStatus('7', 'A username is required.');
        return;
    }

// register new user.
    if ( arg1 === 'registerConnect' ) {
      if ( password && eMail ) {
        wsLogin = new WebSocket( url, 'login-protocol' );
      } else {
        generateStatus('7', 'Please fill in eMail and password fields');
        $('<input />', {
            id: 'eMail',
            class: 'textInputField',
            type: 'email',
            placeholder: 'email address'
        }).appendTo('#connectInputs');
        // $('#eMail').removeClass('hidden');
      }

// login with user.
    } else if ( arg1 === 'privateConnect' ) {
      if ( password ) {
        wsLogin = new WebSocket( url, 'login-protocol' );
      } else {
        generateStatus('7', 'Password required.');
      }
    }

// open server connect.
    else if ( arg1 === 'publicConnect' ) {    // default protocols for open server.
      console.log('Connecting to: ' + url + ' With username: ' + userName + ' and with default protocols.');
      generateStatus('1');

      websocket = new WebSocket( url, ArdeiVars.getBcProtocol() );
      websocket.onerror = function () { console.log('Failed to connect'); };

      wsSystem = new WebSocket( url, ArdeiVars.getSysProtocol() );
      wsSystem.onerror = function () { console.log('Failed to connect'); };
    } else {
      console.log('no recognised parameter passed to connection handler.');
    }



  /**
   *  wsLogin handlers.
   */
if ( wsLogin ) {
    wsLogin.onopen = function () {
        console.log('The wsLogin connection is now open.');
        console.log( 'Connecting to: ' + url + ' With username: ' + userName);

        if ( arg1 === 'registerConnect' ) {
          console.log('Starting login protocol to register new user.');
          this.send(   // Give new user details to server.
                  MsgControl.newSystemCreateUserMsg( newUserDetails )
          );
        } else if ( arg1 === 'privateConnect' ) {     // get special protocols for protected server.
          console.log('Starting users protocol to login.');
          if (password === '' || password === null) {
              generateStatus('7', 'A password is required.');
          }
          this.send(   // Give name and Password to server.
                  MsgControl.newSystemLoginMsg( password )
          );
        } else {
          console.log('Login protocol started un-neccessarily.');
          this.close();
        }
    };
    wsLogin.onmessage = function(event) {
      var msg = JSON.parse(event.data);
// Login successful.
      if ( msg.lead === 'success' ) {
        $('#password').prop('value', null);

// Update connection protocols with servers protocol key.
        ArdeiVars.setBcProtocol( msg.broadcast_protocol );
        ArdeiVars.setSysProtocol( msg.system_protocol );
        generateStatus('7', msg.message);

// Trigger the connect handler as publicConnect now we have the protocols.
        $('#connectionHandler').trigger('custom', 'publicConnect');

// New user successfully inserted to db.
      } else if ( msg.lead === 'userSaved' ) {
        // $('#password').prop('value', null);
        $('input#eMail').remove(); // Trying to remove eMAil field from DOM after user created.... no luck
        generateStatus('7', msg.message);
        // $('#connectionHandler').trigger('custom', 'privateConnect');

// Server general message.
      } else {
        generateStatus('7', msg.message);
      }
    };
    wsLogin.onclose = function() {
      console.log('The wsLogin connection is now closed.');
    };
}



  /**
   * wsSystem handlers.
   */
if ( wsSystem ) {
    wsSystem.onopen = function() {
      console.log('The wsSystem connection is now open.');
      generateStatus('2');
      setLoggedOnProperties();
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
      generateStatus('5');
      ArdeiVars.resetProtocols();
      setLoggedOffProperties();
    };
}



  /**
   * Broadcast handlers.
   */
if ( websocket ) {
    websocket.onopen = function() {
      console.log('The websocket connection is now open.');
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
    };
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
    // generateStatus('6');
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




setLoggedOffProperties(CurrentServer);



console.log('Everything is ready.');

});