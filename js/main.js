/*globals window, WebSocket, MsgControl, createBot, generateStatus, MessageController, setLoggedOffProperties*/

/**
 * Place your JS-code here.
 */


var url = document.getElementById('url'),                         // url input field

    connect = document.getElementById('connect'),           // connect button
    disconnect = document.getElementById('disconnect'),   // disconnect button
    send = document.getElementById('send'),                     // send button

    selectedServer = document.myform.selectServer,         // select dropdown list
    serverURL = document.myform.serverURL,                   // return element for dropdown list
    userName = document.myform.userName,                    // user name input

    // Chat divs
    posts = document.getElementById('posts'),                   // Posts in chat
    content = document.getElementById('message'),           // message content

    botButton = document.getElementById('botButton'),

    websocket,
    wsSystem;


var MsgControl = new MessageController();


/**
 * Add eventhandler to server select dropdown list and connection properties.
 */
selectedServer.onchange = function() {
  serverURL.value = selectedServer.value;
};

// Make sure the user connects when hitting enter on adress or username field.
serverURL.addEventListener('keypress', function(event) {
    if (event.keyCode === 13) {
      connect.click();
      event.preventDefault();
    }
});
userName.addEventListener('keypress', function(event) {
    if (event.keyCode === 13) {
      connect.click();
      event.preventDefault();
    }
});



/**
 * Event handler to create the websocket connection when someone clicks the button #connect
 * Also contains websocket callback functions onopen, onmessage, onclose.
 */
$('#connect').on('click', function (event) {
    posts.innerHTML = '';
    // userDiv.innerHTML = '';
    if (userName.value === '' || userName.value === null) {
        generateStatus('7', 'A username is required.');
        return;
    }
    if (websocket) {
      websocket.close();
      websocket = null;
    }
    MsgControl.user = userName.value;
    console.log( 'Connecting to: ' + url.value + ' With username: ' + MsgControl.user);
    websocket = new WebSocket( url.value, 'broadcast-protocol' );
    wsSystem = new WebSocket( url.value, 'system-protocol' );
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
    // console.log(msg);
    var isOwn = MsgControl.is_own_msg(msg);
    if ( !msg.time ) {
      // prevent own message being counted as recieved message.
      if ( !isOwn ) {
        generateStatus('4');
        MsgControl.addToOutput(msg);
      }
      if ( isOwn ) {
        MsgControl.addToOutput(msg);
      }
    }
    if ( msg.time ) {
        // publish the history message in client.
        MsgControl.addHistoryToOutput(msg);
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
  var reciever = [];
  $('input.checkboxes').each( function() {
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
      console.log("Sending message: " + content.value);
      websocket.send( MsgControl.newMsg(content.value) );
      generateStatus('3');
    } else {
      console.log("Sending private message: " + content.value);
      websocket.send( MsgControl.newPrivateMsg(content.value, reciever) );
      generateStatus('3');
    }
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
 * or newine break if shift + enter.
 */
$('#content').on('keypress', function(event) {
    if (event.keyCode === 13 && !event.shiftKey) {
      send.click();
      event.preventDefault();
    }
    if (event.keyCode === 13 && event.shiftKey) {   // Insert linebreak
      console.log('content.value');
    }
});






    $('#selectall').click(function() {  //on click
        if(this.checked) { // check select status
            $('.checkboxes').each(function() { //loop through each checkbox
                this.checked = true;  //select all checkboxes with class "checkbox1"
            });
        }else{
            $('.checkboxes').each(function() { //loop through each checkbox
                this.checked = false; //deselect all checkboxes with class "checkbox1"
            });
        }
    });



setLoggedOffProperties();



console.log('Everything is ready.');

