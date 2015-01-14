/*globals window, WebSocket, MsgControl*/

/**
 * Place your JS-code here.
 */
$(document).ready(function()
{
  'use strict';

var url = document.getElementById('url'),                         // url input field

    connect = document.getElementById('connect'),           // connect button
    disconnect = document.getElementById('disconnect'),   // disconnect button
    send = document.getElementById('send'),                     // send button

    selectedServer = document.myform.selectServer,         // select dropdown list
    serverURL = document.myform.serverURL,                   // return element for dropdown list
    userName = document.myform.userName,                    // user name input

    // main page elements.
    connectArticle = document.getElementById('createConnection'),
    messageArticle = document.getElementById('createMessage'),

    // User information divs
    userCounterDiv = document.getElementById('userCounter'),
    usersDiv = document.getElementById('userlist'),

    // Chat divs
    posts = document.getElementById('posts'),                   // Posts in chat
    content = document.getElementById('message'),           // message content

    // user feedback and status modifications
    status = document.getElementById('status'),
    outputDiv = document.getElementById('output'),

    websocket,
    wsSystem;



/**
 * Generate hours and minutes time-log.
 */
var getHHMM = function() {
    var dateRaw = new Date();
    var now = dateRaw.toLocaleTimeString('en-US', { hour12: false });
    return now.substring(0, now.length-3);
};



/**
 * Basic filter for maintaining linebreaks etc.
 */
var nl2br = function (str) {
    var breakTag = '<br>';      // (is_xhtml || is_xhtml === 'undefined') ? '<br />' :
    return (str + ' ').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
};



/**
 * Set viewing properties for JS-enabled browser LOGGED OFF.
 */
var setLoggedOffProperties = function() {
    disconnect.className = 'hidden';  // hide disconnect button
    messageArticle.className ='hidden'; // hide message
    connectArticle.className ='mainPageContainer';
    content.value = '';                         // Clear message input field.
    posts.innerHTML = '---> Welcome to the Websocket chat.';
    userCounterDiv.innerHTML = '...';
    usersDiv.innerHTML = 'Login to chat.';
    status.innerHTML = 'No connection.';
      //  serverURL.disabled='disabled'; // Delete this part if you want the URL input box enabled
};



/**
 * Set viewing properties for JS-enabled browser LOGGED ON.
 */
var setLoggedOnProperties = function() {
    status.innerHTML = 'Your know as: ' + MsgControl.user + ' ';
    status.appendChild(disconnect);
    disconnect.className ='exitButton';
    connectArticle.className ='hidden';
    messageArticle.className ='mainPageContainer';
};



/**
 *  Populate the users and user counter divs.
 */
 var populateUsersList = function(other) {
    var userListItem, i;
    var userArray = other.split(',');
     // other.replace(/ /g,'<br>');
    // other.split(/ /g).join('<br>');
    usersDiv.innerHTML = '';    // Clear the user list field.
    userCounterDiv.innerHTML = userArray[0] + ' online';
    for ( i = 1; i < userArray.length; i ++ ) {     // start with index 1. index 0 is usercount.
      userListItem = document.createElement('p');
      userListItem.innerHTML = userArray[i];
      userListItem.className = 'userListItem';
      usersDiv.appendChild(userListItem);
    }
    // posts.scrollTop = newPost.offsetTop;
};



/**
 * Function to give user feedback and modify layout depending on connection status.
 * 1: connecting, 2: success, 3: send, 4: recieve, 5:disconnect, 6:error, 7:custom.
 */
var generateStatus = function(type, custom) {
  var output_user = document.createElement('p');
  switch (type) {
    case "1":
      output_user.innerHTML = getHHMM() + ': Connecting to: ' + url.value + '...';
      break;
    case "2":
      setLoggedOnProperties();
      output_user.innerHTML = getHHMM() + ': Established websocket.';
      break;
    case "3":
      content.value = '';       // blank out the message input field after sending message.
      output_user.innerHTML = getHHMM() + ': Sent message.';
      break;
    case "4":
      output_user.innerHTML = getHHMM() + ': Recieved message.';
      break;
    case "5":
      setLoggedOffProperties();
      output_user.innerHTML = getHHMM() + ': Closed connection to:\n' + url.value;
      break;
    case "6":
      output_user.innerHTML = getHHMM() + ': An error occured..';
      break;
    case "7":
        output_user.innerHTML = getHHMM() + ': ' + custom;
      break;
    default:
      output_user.innerHTML = getHHMM() + ': feedback error.';
  }
  outputDiv.appendChild(output_user);
  outputDiv.scrollTop = output_user.offsetTop;
};



/**
 * Handling of messages from server.
 */
function MessageController() {
  this.user = null;
  this.msgCount = null;
}
MessageController.prototype = {
  addToOutput: function(msg) {
    this.msgCount++;
      var newPost = document.createElement('div');
      if (this.msgCount % 2 !== 0) {
          newPost.className = 'odd';
      }
      newPost.innerHTML = getHHMM() + ' ' + msg;
      posts.appendChild(newPost);
      posts.scrollTop = newPost.offsetTop;
  },

  is_system_msg: function(msg) {
    var lead = msg.substring(0, 4),
          other = msg.substring(5, msg.length);
          // console.log('LEADvar: ' + lead);
          // console.log('OTHERvar: ' + other);
    if ( lead === 'stat' ) {
      populateUsersList(other);
      console.log('Stats recieved');   // index 0 is usercount.
      return true;
    }
    return false;
  },

  is_own_msg: function(msg) {
    var name = null;
    name = msg.split(':', 1);
    if ( name ) {
      console.log('FOUND A NAME in message content: ' + name);
      if ( name == MsgControl.user ) {
        return true;
      }
    }
    return false;
  },

  msgSend: function(msg) {
    var formatedMessage = nl2br(msg);
    websocket.send(this.user + ': ' + formatedMessage);
  },
};



var MsgControl = new MessageController();


/**
 * Add eventhandler to server select dropdown list and connection properties.
 */
selectedServer.onchange = function() {
  serverURL.value = selectedServer.value;
};

// Make sure the user connects when hitting enter on adress field.
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
connect.addEventListener('click', function(event) {
    posts.innerHTML = '';
    usersDiv.innerHTML = '';
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
    wsSystem = new WebSocket(url.value, 'system-protocol');
    generateStatus('1');



/**
 * Websocket broadcast handlers.
 */
  websocket.onopen = function() {
    console.log('The websocket is now open.');
    generateStatus('2');
  };

  // message recieved
  websocket.onmessage = function(event) {
    console.log('Receiving message: ' + event.data + ' From: ' + event.origin);
    if ( !MsgControl.is_own_msg(event.data) ) {
      generateStatus('4');
    }
    MsgControl.addToOutput(event.data);   // publish the message in client.
  };

  // Eventhandler when the websocket is closed.
  websocket.onclose = function() {
    console.log('The websocket is now closed.');
    generateStatus('5');
  };



/**
 * Websocket system handlers.
 */
  wsSystem.onopen = function() {
    console.log('The  wsSystem is now open.');
    wsSystem.send('init ' + MsgControl.user);  // Give name to server.
  };
  wsSystem.onmessage = function(event) {
    console.log('Receiving system message: ' + event.data + ' From: ' + event.origin);
    if (!MsgControl.is_system_msg(event.data)) {
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
send.addEventListener('click', function(event) {
  if(!websocket || websocket.readyState === 3) {
    console.log('The websocket is not connected to a server.');
    generateStatus('6');
  } else {
    console.log("Sending message: " + content.value);
    MsgControl.msgSend(content.value);
    generateStatus('3');
  }
  event.preventDefault();
});



/**
 * Add eventhandler to disconnect button
 */
disconnect.addEventListener('click', function(event) {
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
content.addEventListener('keypress', function(event) {
    if (event.keyCode === 13 && !event.shiftKey) {
      send.click();
      event.preventDefault();
    }
    if (event.keyCode === 13 && event.shiftKey) {   // Insert linebreak
      console.log('content.value');
    }
});

setLoggedOffProperties();



console.log('Everything is ready.');
});