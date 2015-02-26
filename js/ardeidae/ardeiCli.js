

/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js from "req.txt" begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


/* Last merge : Thu Feb 26 22:36:50 CET 2015  */

/* Merging order :

- variables.js
- functions.js
- messageController.js
- viewFeedback.js
- userSimul.js
- main.js

*/


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: variables.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


/**
 *  Place your JS-code here.
 */
 $(document).ready( function () {
 'use strict';

var VariablesController = function() {

this.broadcast_protocol = null;
this.system_protocol = null;
};

VariablesController.prototype = {

  setBcProtocol: function (protocol) {
      this.broadcast_protocol = protocol;
  },

  setSysProtocol: function (protocol) {
      this.system_protocol = protocol;
  },

  getBcProtocol: function () {
    return this.broadcast_protocol;
  },

  getSysProtocol: function () {
    return this.system_protocol;
  },

  resetProtocols: function () {
      this.broadcast_protocol = 'broadcast-protocol';
      this.system_protocol = 'system-protocol';
  },
};

/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: functions.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


/*globals XMLHttpRequest, XDomainRequest, setLoggedOffProperties */
/**
 *  Generate hours and minutes time-log.
 */
var getHHMM = function() {
    var dateRaw = new Date();
    var now = dateRaw.toLocaleTimeString('en-US', { hour12: false });
    return now.substring(0, now.length-3);
};



/**
 * Convert UTC time to local HHMM.
 */
var convertUtcToLocalHHMM = function(timestamp) {
    var utc = new Date(timestamp);
    var time = utc.toLocaleTimeString('en-US', { hour12: false });
    return time.substring(0, time.length-3);
};



/**
 *  Basic filter for maintaining linebreaks etc.
 */
var nl2br = function (str) {
    var breakTag = '<br>';      // (is_xhtml || is_xhtml === 'undefined') ? '<br />' :
    return (str + ' ').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
};

/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: messageController.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


/*globals getHHMM, posts, convertUtcToLocalHHMM, populateUsersList, MsgControl, nl2br, websocket, userDiv, userCounterDiv */
/**
 *  Handling of messages from server.
 */
var MessageController = function() {
  this.posts = $('#posts');
  this.user = null;
  this.msgCount = null;
};
MessageController.prototype = {

  addToOutput: function(msg) {
    this.msgCount++;
      var newPost = document.createElement('div');

      if (this.msgCount % 2 !== 0) {
          newPost.className = 'odd';
      }
      // For example private messages.
      if ( msg.attributes ) {
        newPost.className += ' ' + msg.attributes;
      }
      newPost.innerHTML = getHHMM() + ' ' + msg.name + ': ' + nl2br(msg.message);
      if ( !msg.name ) {
        newPost.innerHTML = nl2br(msg.message);
      }

      this.posts.append(newPost);
      this.posts.scrollTop(newPost.offsetTop);
  },

  addHistoryToOutput: function(msg) {
      this.msgCount++;
      var newPost = document.createElement('div');
      if (this.msgCount % 2 !== 0) {
          newPost.className = 'odd';
      }
      newPost.innerHTML = convertUtcToLocalHHMM(msg.time) + ' ' + msg.name + ': ' + msg.message;
      this.posts.append(newPost);
      this.posts.scrollTop(newPost.offsetTop);
  },

  is_system_msg: function(msg) {
    if ( msg.lead === 'stat' ) {
      $('#userCounter').html( msg.activeUsers + ' online' );
      populateUsersList( msg.info );
      console.log('Stats recieved');   // index 0 is usercount.
      return true;
    }
    return false;
  },

  is_own_msg: function(msg) {
      if ( msg.name == this.user ) {
        return true;
      }
    return false;
  },

  newMsg: function(msg) {
    var formatedMessage = msg;
    // userName is added by server to prevent client in-session namechanging.
    var messageObject = {
      sender: this.user,
      senderID: "",
      message: formatedMessage,
    };
    var portable = JSON.stringify(messageObject);
    return portable;
  },

    // EXPERIMENTING HERE
  newPrivateMsg: function(msg, reciever) {
    var formatedMessage = nl2br(msg);
    // userName is added by server to prevent client in-session namechanging.
    var messageObject = {
      sender: this.user,
      senderID: "",
      message: formatedMessage,
      reciever: reciever,
      attributes: "private"
    };
    var portable = JSON.stringify(messageObject);
    return portable;
  },

  newSystemLoginMsg: function (pswd) {
    var values = {
      lead: "pswd",
      acronym: this.user,
      password: pswd,
    };
    var portable = JSON.stringify(values);
    return portable;
  },

  newSystemCreateUserMsg: function (details) {
    var values = {
      lead: "rgstr",
      newUserDetails: details,
    };
    var portable = JSON.stringify(values);
    return portable;
  },

  newSystemInitMsg: function() {
    var values = {
      lead: "init",
      name: this.user,
    };
    var portable = JSON.stringify(values);
    return portable;
  },
};


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: viewFeedback.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


/*globals getHHMM, generateStatus, handler_clickServerListItem */

// main page elements.
var connectArticle = $('#createConnection'),
      messageArticle = $('#createMessage');

// User information divs.
var userCounterDiv = $('#userCounter'),
      userDiv = $('#userList'),
      userTable = $('#userTable'),
      serverMetaDataDiv = $('#serverMetaData');



/**
 *  Populate the users and user counter divs.
 */
 var populateUsersList = function(users) {
    var i,
          tableRow = '';
    for ( i = 0; i < users.length; i ++ ) {
      if (users[i]) {
        tableRow+= '<tr id="' + users[i].id + '">';
        tableRow+= '<td>' + users[i].name + '</td>';
        tableRow+= '<td>' + i + '</td>';
        tableRow+= '<td><input id="' + users[i].id + '" class="checkboxes" type="checkbox"></td>';
        tableRow+= '</tr>';
      }
    }
    var tBody = $('#userTable').find('tbody:last');
    tBody.html('');
    tBody.append(tableRow);
};



/**
 *  Route the serverlist from AJAX request to relevant function.
 */
var serverListRouter = function (li) {
    if ( li !== null && typeof li === 'string' ) {
      generateStatus('7', li);
    }

    if ( li !== null && typeof li === 'object' ) {
      if ( li.hasOwnProperty('length') ) {
        if ( li.length === 1 ) {
          generateStatus('7', 'Recieved server status.');
          setSelectedServer( li[0] );
          // populateServerList( li );
        }
        if ( li.length > 1 ) {
          generateStatus('7', 'Refreshed server list.');
          populateServerList( li );
        }
      }
    }
};



/**
 *  Display all the servers online from the hub.
 */
var populateServerList = function (list) {
    var i, serverObj, wsUrl, serverItemContents, counter = 0;
    var hubListTable = $('#hubListTable');
    var oddChecker = function (count) {
      if ( count % 2 !== 0 ) {
          return 'serverItem odd';
      }
      return 'serverItem';
    };

    hubListTable.html(' ');

    for ( i = 0; i < list.length; i++ ) {
      counter++;
      serverObj = list[i];
      list[i].uptime =  Math.floor(serverObj.uptime / 60000 );
      wsUrl =  'ws://' + serverObj.domain + ':' + serverObj.port;
      serverItemContents = '<div class="' + oddChecker(counter) + '" data_server="' + wsUrl + '">'
        + '- ' + serverObj.name + ' - '
        + ' ' + serverObj.domain + '</div>';

      $('<div/>', {
      }).html(serverItemContents)
          .appendTo('#hubListTable')
          .on('click', handler_clickServerListItem);
    }
};



/**
 *  Display the selected server in sidebar.
 */
var showServerDataInSidebar = function (currentServerInfo) {
      var metaData = '<h3>Server Info</h3>'
          + '<br><h4>' + currentServerInfo.name + '</h4>'
          + '<br> Online users: ' + currentServerInfo.onlineUsers
          + '<br> Private mode: ' + currentServerInfo.privateMode
          + '<br> Domain: ' + currentServerInfo.domain
          + '<br> Port: ' + currentServerInfo.port
          + '<br> Version: ' + currentServerInfo.version;

      serverMetaDataDiv.removeClass('hidden')
      .html(metaData);
};



/**
 *  Set viewing properties specific to server mode.
 */
var setServerModeSpecifics = function (cS) {
    if ( cS.hasOwnProperty('privateMode') ) {
// Server private mode: true.
      if ( cS.privateMode ) {
        $('#connectButton').prop('value', 'privateConnect' );
        $('#password').removeClass('hidden');
        // $('#loginButton').removeClass('hidden');
        $('#registerButton').removeClass('hidden');
// Server private mode: false.
      } else {
        $('#connectButton').prop('value', 'publicConnect');
      }
    }
};



/**
 *  Set client to specific server.
 */
var setSelectedServer = function (currentServer) {
  console.log(currentServer);

    // Settings depending on server meta data:
    if ( !currentServer ) {
      console.log("CURENT SERVER IS NOT SET!!!");
      // Reset to no selected server defaults

      $('input#serverUrl').prop('value', 'ws://');

      // Make sure the controlls are hidden.
      $('#connectInputs').addClass('hidden');
      $('#connectbuttonbox').addClass('hidden');

    } else if ( currentServer ) {
// Server did not respond to Ajax.
      if ( currentServer === 'noServerInfo' ) {
        generateStatus('7', 'Selected server not responding.');
        $('#connectInputs').addClass('hidden');
        $('#connectbuttonbox').addClass('hidden');
// Server responded to ajax.
      } else {
        $('#connectInputs').removeClass('hidden');
        $('#connectbuttonbox').removeClass('hidden');

// Display the server meta data in sidebar:
        userDiv.addClass('hidden');
        showServerDataInSidebar(currentServer);

// Set the controlls according to server status.
        setServerModeSpecifics(currentServer);
      }
    }
};



/**
 *  Set viewing properties for JS-enabled browser LOGGED OFF.
 */
var setLoggedOffProperties = function (serverList) {
    var eMail = $('eMail');

    console.log(serverList);

    // $('input#serverUrl').prop('value', '');
    $('#status').html('No connection.');
    messageArticle.addClass('hidden');
    connectArticle.removeClass('hidden');
    $('#disconnect').addClass('hidden');          // hide disconnect button
    $('#message').prop('value', '');                 // Clear message input field.
    $('#posts').html ('');                                 // Clear chat message field.
    userCounterDiv.addClass('hidden');
    userTable.addClass('hidden');
    eMail.addClass('hidden');
    eMail.prop('value', null);
    $('#connectInputs').addClass('hidden');
    $('#password').addClass('hidden');
    // $('#loginButton').addClass('hidden');
    $('#registerButton').addClass('hidden');

    userDiv.removeClass('hidden');
    serverMetaDataDiv.addClass('hidden');
    // serverURL.disabled='disabled'; // Delete this part if you want the URL input box enabled

    serverListRouter(serverList);
};



/**
 *  Set viewing properties for LOGGED ON.
 */
var setLoggedOnProperties = function() {
    var user = $('#userName').prop('value');
    $('#status').html('Your know as: ' + user + ' ');
    messageArticle.removeClass('hidden');
    userCounterDiv.removeClass('hidden');
    userDiv.removeClass('hidden');

    $('#disconnect').removeClass('hidden');
    connectArticle.addClass('hidden');

    userDiv.removeClass('hidden');
    serverMetaDataDiv.addClass('hidden');

    userTable.removeClass('hidden');
    $('#selectAll').removeClass('Hidden')
    .prop('checked', false);

    $('#welcome').removeClass('hidden');
    $('#hubList').addClass('hidden');
};



/**
 *  Function to give user feedback.
 *  1: connecting, 2: success, 3: send, 4: recieve, 5:disconnect, 6:error, 7:custom, 8:private message.
 */
var generateStatus = function(type, custom) {
  var url = $('#serverUrl').prop('value');
  var outputDiv = $('#output');
  var output_user = document.createElement('p');
  switch (type) {
    case "1":
      output_user.innerHTML = getHHMM() + ': Connecting to:\n' + url + '...';
      break;
    case "2":
      output_user.innerHTML = getHHMM() + ': Established websocket.';
      break;
    case "3":
      output_user.innerHTML = getHHMM() + ': Sent message.';
      break;
    case "4":
      output_user.innerHTML = getHHMM() + ': Recieved message.';
      break;
    case "5":
      output_user.innerHTML = getHHMM() + ': Closed connection to:\n' + url;
      break;
    case "6":
      output_user.innerHTML = getHHMM() + ': An error occured..';
      break;
    case "7":
        output_user.innerHTML = getHHMM() + ': ' + custom;
      break;
    case "8":
      output_user.innerHTML = getHHMM() + ': Sent private message.';
      break;
    default:
      output_user.innerHTML = getHHMM() + ': feedback error.';
  }
  outputDiv.append(output_user);
  outputDiv.scrollTop(output_user.offsetTop);
};

/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: userSimul.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


/*globals WebSocket */

var botName,
      botID,
      botWebsocket,
      botWsSystem,
      botCounter = 0,
      numberOfBots = 5;

var createBot = function (url) {
    botID = botCounter;
    botName = 'Delta' + botID;
    console.log( 'Connecting to: ' + url + ' With username: ' + botName);
    botWebsocket = new WebSocket( url, 'broadcast-protocol' );
    botWsSystem = new WebSocket( url, 'system-protocol' );

    console.log('Bot ' + botName + ', with ID ' + botID + ' is online.');

    botCounter++;

// Give server the botName
var newBotSystemInit = function() {
    var values = {
      lead: "init",
      name: botName,
    };
    var portable = JSON.stringify(values);
    return portable;
  };


 /**
 * Websocket broadcast handlers.
 */
  botWebsocket.onopen = function() {
    console.log('The botWebsocket is now open.');
  };

  // message recieved
  botWebsocket.onmessage = function(event) {
    console.log('Receiving message: ' + event.data + ' From: ' + event.origin);
  };

  // Eventhandler when the botWebsocket is closed.
  botWebsocket.onclose = function() {
    console.log('The botWebsocket is now closed.');
  };



/**
 * Websocket system handlers.
 */
  botWsSystem.onopen = function() {
    console.log('The botWsSystem is now open.');
    botWsSystem.send( newBotSystemInit() );  // Give name to server.
  };
  botWsSystem.onmessage = function(event) {
    console.log('Receiving system message: ' + event.data + ' From: ' + event.origin);
  };
  botWsSystem.onclose = function() {
    console.log('The botWsSystem is now closed.');
  };


};


console.log('BotFactory is ready.');





/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: main.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


/*globals WebSocket,
MsgControl, VariablesController, FunctionController, MessageController, ConnectionController,
websocket: true, wsSystem: true, wsLogin: true,
generateStatus, setLoggedOffProperties, setLoggedOnProperties,
createCorsRequest, createBot */

var MsgControl = new MessageController();
var ArdeiVars = new VariablesController();
// var ArdeiFunc = new FunctionController();
var CurrentServer = null;

var websocket,
      wsSystem,
      wsLogin;



/**
 *  Make an Anax request... CORS support enabled, browser compliance mode.
 *  Deprecation Notice:
 *  The jqXHR.success(), jqXHR.error(), and jqXHR.complete() callbacks are deprecated as of jQuery 1.8.
 *  To prepare your code for their eventual removal,
 *  use jqXHR.done(), jqXHR.fail(), and jqXHR.always() instead.
 */
var createCorsRequest = function (method, url, callback) {
  // Change from ws:// to http:// in url.
  var httpUrl = 'http://' + url.slice(5, url.length);

  $.ajax({
      type: method,
      url: httpUrl,
      timeout: 10000, // 10 seconds.
      contentType: 'application/json',
      data: JSON.stringify({ nothing: 'nothing'}),
      dataType: 'text',
      dataFilter: function (data, type) {
          if ( type === 'text' )
          {
              var data_parsed = JSON.parse(data);
              return data_parsed;
          }
      },
      success: function (data) {
          callback (data);
      },
      error: function(jqXHR, textStatus) { // jqXHR
        var humanReadable;
        if (jqXHR.status === 0) {
            humanReadable = 'Not connected. Verify Network.';
            console.log(humanReadable);
        } else if (jqXHR.status === 404) {
            humanReadable = 'Requested page not found. [404]';
            console.log(humanReadable);
        } else if (jqXHR.status === 500) {
            humanReadable = 'Internal Server Error [500].';
            console.log(humanReadable);
        } else if (textStatus === 'parsererror') {
            humanReadable = 'Requested JSON parse failed.';
            console.log(humanReadable);
        } else if (textStatus === 'timeout') {
            humanReadable = 'Time out error.';
            console.log(humanReadable);
        } else if (textStatus === 'abort') {
            humanReadable = 'Ajax request aborted.';
            console.log(humanReadable);
        } else {
            humanReadable = 'Uncaught Error.n' + jqXHR.responseText;
            console.log(humanReadable);
        }
        callback(humanReadable);
    },
  });

};



/**
 *  Eventhandler for the url field. Triggered by enter and from clicking server listItem.
 */
 var handler_selectAServer = function( event ) {
 if (event.keyCode === 13) {
    var url = $('input#serverUrl').prop('value');
    var serverDomainUrl = url.slice(5, url.length).split(':');
// This is to get server meta data.
    generateStatus('7', 'waiting for server at ' + serverDomainUrl[0] + '<br>timeout is: 10sec.');
    createCorsRequest( 'GET', url, setLoggedOffProperties );
    if ( event.hasOwnProperty('preventDefault') ) {
      event.preventDefault();
    }
  }
};



/**
 *  Eventhandler for serverListItem. Bound in populateServerList(), triggered by click.
 */
var handler_clickServerListItem = function (event) {
    console.log("clicked on a serverItem");
    var retrieved = event.target.getAttribute('data_server'); // $(this).prop('data_server');

    // Update the textbox with the selected server url.
    $('input#serverUrl').prop('value', retrieved);

    // Triggering an event handler the right way
    var rocker = {keyCode: 13}; // simulate the keycode 13.
    handler_selectAServer(rocker); // instead of $( "input#serverUrl" ).trigger( "keypress" )
};



/**
 *  Eventhandler for server refresh button and hubList.
 */
 $('#refreshButton0').on('click', function() {
    createCorsRequest( 'GET', 'ws://localhost:8121', setLoggedOffProperties );
    $('#welcome').addClass('hidden');
    $('#hubList').removeClass('hidden');
    ArdeiVars.resetProtocols();
    // setEventhandlers();
});
$('#refreshButton1').on('click', function() {
    createCorsRequest( 'GET', 'ws://nodejs1.student.bth.se:8121', setLoggedOffProperties );
    $('#welcome').addClass('hidden');
    $('#hubList').removeClass('hidden');
    ArdeiVars.resetProtocols();
    // setEventhandlers();
});
$('#refreshButton2').on('click', function() {
    createCorsRequest( 'GET', 'ws://nodejs2.student.bth.se:8121', setLoggedOffProperties );
    $('#welcome').addClass('hidden');
    $('#hubList').removeClass('hidden');
    ArdeiVars.resetProtocols();
    // setEventhandlers();
});


// Hitting enter on address field.
$('body').on('keypress', 'input#serverUrl', handler_selectAServer);


/**
 *  Eventhandlers so user connects when hitting enter on username or password field.
 */
$('body').on('keypress', 'input#userName', function(event) {
    if (event.keyCode === 13) {
      var connectionType = $('#connectButton').prop('value');
      $.event.trigger( 'newConnection', connectionType );
      event.preventDefault();
    }
});
$('body').on('keypress', 'input#password', function(event) {
    if (event.keyCode === 13) {
      $.event.trigger('newConnection', 'privateConnect');
      event.preventDefault();
    }
});



/**
 *  Add eventhandler to Register, and connect buttons
 */
$('body').on('click', 'button#registerButton', function (event) {
    $.event.trigger( 'newConnection', 'registerConnect' );
    event.preventDefault();
});

$('body').on('click', 'button#connectButton', function (event) {
    var connectionType = $('#connectButton').prop('value');
    $.event.trigger( 'newConnection', connectionType );
    event.preventDefault();
});



/**
 *  Custom event handler to create the websocket connection.
 *  Also contains websocket callback functions onopen, onmessage, onclose.
 */
$(document).on('newConnection', function ( event, arg1 ) {
    if ( !arg1 ) { arg1 = 'publicConnect'; }
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
    $('#botButton').off('click');
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
        $.event.trigger('newConnection', 'publicConnect');

// New user successfully inserted to db.
      } else if ( msg.lead === 'userSaved' ) {
        $('input#eMail').remove(); // remove eMail input DOM element.
        generateStatus('7', msg.message);
        // $('#connectionHandler').trigger('newConnection', 'privateConnect'); // Autologin after register???

// Server custom message.
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



/**
 * Add eventhandler to BOT button
 */
$('#botButton').on('click', function (event) {
  console.log('BOTTED');
  createBot(url);
  event.preventDefault();
});



  event.preventDefault();
}); // Closing tags for newConnection EVENTHANDLER.



/**
 *  Add eventhandler to stylesheet button
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
 *  Add eventhandler to message input field to trigger send button on enter,
 *  or newline break if shift + enter.
 */
$('#message').on('keypress', function(event) {
    if (event.keyCode === 13 && !event.shiftKey) {
      $('#send').trigger('click');
      event.preventDefault();
    }
});



/**
 *  Add eventhandler to private message checkbox select all.
 */
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


// init.
setLoggedOffProperties(CurrentServer);

console.log('Everything is ready.');

});