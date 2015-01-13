/*globals User, UserList, UsrControl, Message, MessageLog, broadcastTo, serverInfoBroadcastTo, wsServer*/
var port = 1337;
var broadcastTo = [];                 // List of users to be broadcasted to
var serverInfoBroadcastTo = [];   // List of enteties recieving server messages.


/**
 * Arrays for storing online users and saving messages.
 */
var UserList = [];
var MessageLog = [];            // Log for users messages
var ServerMessageLog = [];  // Log for server messages.



// Require the modules we need
var http = require('http');
var WebSocketServer = require('websocket').server;
/*    var WebSocketClient = require('websocket').client;
    var WebSocketFrame  = require('websocket').frame;
    var WebSocketRouter = require('websocket').router;
*/



/**
 * Function to test the origin of incoming connection.
 */
 function originIsAllowed(origin) {
  if(origin === 'http://dbwebb.se' || origin === 'http://localhost:8080') {
    return true;
  }
  return false;
}


/**
 * Avoid injections
 *
 */
function htmlEntities(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}


/**
 * Function to output all the user in UsersList array.
 */
function printUserListArray () {
      console.log('No. of Online users: ' + UsrControl.ActiveUsers + ', Length of UserList array: ' + UserList.length);
    var i;
    for ( i = 0; i < UserList.length; i++ ) {
      if ( UserList[i] ) {
        console.log('ID: ' + UserList[i].id + ', at index: ' + i  + ', from: ' + UserList[i].origin + ', created: ' + UserList[i].time + ', name: ' + UserList[i].name);
      }
    }
}


/**
 * Function to broadcast information from server to client system.
 */
function broadcastServerSystemInfo(msg) {
  ServerMessageLog.push( new Message( 'server', msg ) );
  var i, clients = 0;
  for( i = 0; i < serverInfoBroadcastTo.length; i++ ) {
    if(serverInfoBroadcastTo[i]) {
      clients++;
      serverInfoBroadcastTo[i].sendUTF( msg );
    }
  }
  console.log('Broadcasted Server message to ' + clients + ' clients: ' + msg);
}


/**
 * Functionto broadcast information from server to client UI.
 */
function broadcastServerRegularInfo(msg) {
  MessageLog.push( new Message( 'server', msg ) );
  var i, clients = 0;
  for( i = 0; i < broadcastTo.length; i++ ) {
    if( broadcastTo[i] ) {
      clients++;
      broadcastTo[i].sendUTF( msg );
    }
  }
  console.log('Broadcasted regular server info message to ' + clients + ' clients: ' + msg);
}

/**
 * Check if it's a system message and handle it accordingly.
 */
function is_system_msg(userId, msg) {
  var lead = msg.substring(0, 4),
        userName = msg.substring(5, msg.length);
   // console.log('LEADvar: ' + lead);
   // console.log('USERvar: ' + userName);
   // console.log('Length of users array = ' + UserList.length);
  if ( lead === 'init' ) {
    console.log('Ititalisation message recieved... writing new Name to user on online list at index: ' + userId );
     UserList[userId].name = userName;
     broadcastServerRegularInfo(userName + ' has entered the zone.');
     UsrControl.broadcastStats();
     printUserListArray();
     return true;
  }
  if ( lead === 'exit' ) {
    return true;
  }
  if ( lead === 'stat' ) {
    console.log('Check status message recieved.');
    UsrControl.broadcastStats();
    return true;
  }
  if ( lead === 'hist' ) {
    console.log('Retrieve message history message recieved.');
    UsrControl.broadcastHistory();
    return true;
  }
 }




/**
 * Message object
 */
function Message(userId, message) {
  this.time = Date.now();
  this.userId = userId;
  this.userName = UserList[userId] !== undefined ? UserList[userId].name : 'server';
  // this.userName = UserList[userId].name || 'server';
  this.userName = UserList[userId] !== undefined ? UserList[userId].origin : 'server';
  // this.origin = UserList[userId].origin;
  this.message = message;
}


/**
 * User object
 */
function User(id, origin) {
  this.time = Date.now();
  this.id = id;
  this.origin = origin || 'remote user';
  this.name = 'no-name';
}



/**
 * User Controller object
 */
function UserController() {
  this.ActiveUsers = null;
}
UserController.prototype = {
  usersToString: function() {
      var i, string = '';
      for( i = 0; i < UserList.length; i++ ) {
        if (UserList[i]) {
          string += ',' + UserList[i].name;
        }
      }
      return string;
  },
  broadcastStats: function() {
    broadcastServerSystemInfo( 'stat,' + this.ActiveUsers + UsrControl.usersToString() );
  },

  userCountUp: function() {
    this.ActiveUsers++;
  },

  userCountDown: function() {
    this.ActiveUsers--;
  },

  addNewUser: function(ID, remoteAddress) {
    this.userCountUp();
    var newUserId = ID;
    console.log(Date.now() + ': Creating new user with id: ' + newUserId + ' From origin: ' + remoteAddress);
    UserList.push( new User(newUserId, remoteAddress) );

  },

  removeByIndex: function(index) {
      // broadcastServerInfo(userName + ' has entered the zone.');
      broadcastServerRegularInfo(UserList[index].name + ' has left the zone.' ); // Tells everyone that user is gone.
      UserList[index] = null;
      this.userCountDown();
      printUserListArray();
      this.broadcastStats();
  },

  findIndexByName: function(name) {
    var i;
    for( i = 0; i < UserList.length; i++ ) {
        if ( UserList[i].name === name ) {
          return i;
        }
    }
  },

  findNameByIndex: function (index) {
    return UserList[index].name;
  },

  findIndexByRemoteAddress: function(address) {
    var i;
    for( i = 0; i < UserList.length; i++ ) {
      console.log('Searching db for remote addresses, found: ' + UserList[i].origin + ' at index: ' + i);
        if ( UserList[i].origin === address ) {
          return i;
        }
    }
  },
};



/**
 * Create objects and get started.
 */
 // Create a http server with a callback handling all requests
var httpServer = http.createServer(function(request, response) {
  console.log((new Date()) + ' Received request for ' + request.url);
  response.writeHead(200, {'Content-type': 'text/plain'});
  response.end('Hello world. This is a node.js HTTP server. You can also use websocket.\n');
});

// Setup the http-server to listen to a port
httpServer.listen(port, function() {
  console.log((new Date()) + ' HTTP server is listening on port ' + port);
});

// Create an object for the websocket
// https://github.com/Worlize/WebSocket-Node/wiki/Documentation
var wsServer = new WebSocketServer({
  httpServer: httpServer,
  autoAcceptConnections: false
});

// Start up the user controller.
var UsrControl = new UserController();



 /**
 * Accept connection under the broadcast-protocol
 *
 */
function acceptConnectionAsBroadcast(request) {
  var connection = request.accept('broadcast-protocol', request.origin);
  connection.broadcastId = UserList.length;   // Give current connection an ID based on number of online users.
  broadcastTo.push(connection);                   // Log the connection to broadcast array.
  console.log((new Date()) + ' Broadcast connection accepted from ' + request.origin + ' id = ' + connection.broadcastId);
  UsrControl.addNewUser( connection.broadcastId, request.origin );
  // Send the new user the latest posts.
  connection.sendUTF( '---> Welcome to the Ardeidae server. (displaying latest 7 messages)' );
  var j;
  for ( j = MessageLog.length - 7; j < MessageLog.length; j++ ) {
    if ( MessageLog[j] ) {
      connection.sendUTF( MessageLog[j].message );
    }
  }

/*
 * Callback on message.
 */
  connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received regular utf8 message: (START)' + message.utf8Data + '(END) ...commiting to log.');
            MessageLog.push( new Message( connection.broadcastId, message.utf8Data ) );
            var i, clients = 0;
            for( i = 0; i < broadcastTo.length; i++ ) {
              if( broadcastTo[i] ) {
                clients++;
                broadcastTo[i].sendUTF( htmlEntities( message.utf8Data ) );
              }
            }
            console.log('Broadcasted message to ' + clients + ' clients: ' + message.utf8Data);
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            MessageLog.push(message.binaryData);
            connection.sendBytes(message.binaryData);
        }
  });

/*
 * Callback when connection closes.
 */
  connection.on('close', function(reasonCode, description) {
    UsrControl.removeByIndex (connection.broadcastId);
    console.log((new Date())
                      + ' Peer ' + connection.remoteAddress
                      + ' Broadcastid = ' + connection.broadcastId
                      + ' disconnected. Because: ' + reasonCode
                      + ' Description: ' + description);
     // wsServer.broadcast('system: we lost the connection to one of our users... but I cant say who. :(');
     broadcastTo[connection.broadcastId] = null;  // set the connection to null... Array length shows server popularity.
  });
  return true;
}



/**
 * Accept connection under the system-protocol
 *
 */
function acceptConnectionAsSystem(request) {
  var sysConnection = request.accept('system-protocol', request.origin);
  sysConnection.broadcastId = UserList.length - 1;      // Account for the initial user created on the formation of broadcast connection.
  serverInfoBroadcastTo.push(sysConnection);            // Log the connection to server broadcasts array.
  console.log((new Date()) + ' system connection accepted from ' + request.origin + ' id = ' + sysConnection.broadcastId);

  // Callback to handle each message from the client
  sysConnection.on('message', function(message) {
      console.log('Recieved system message: ' + message.utf8Data + '... passing to handler.');
      is_system_msg( sysConnection.broadcastId, message.utf8Data );
  });

  // Callback when client closes the connection
  sysConnection.on('close', function(reasonCode, description) {
    console.log((new Date())
                      + ' Peer ' + sysConnection.remoteAddress
                      + ' Broadcastid = ' + sysConnection.broadcastId
                      + ' disconnected. Because: ' + reasonCode
                      + ' Description: ' + description);
    serverInfoBroadcastTo[sysConnection.broadcastId] = null;  // set the connection to null... Array length shows server popularity.
  });
  return true;
}



/**
 *  Request handling route to different accept scenarios.
 *
 */
wsServer.on('request', function(request) {
  var i, status = null;

  if (!originIsAllowed(request.origin)) {
    // Make sure we only accept requests from an allowed origin
    request.reject();
    console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
    return;
  }

  // Loop through protocols. Accept by highest order first.
  for ( i = 0; i < request.requestedProtocols.length; i++ ) {
    if( request.requestedProtocols[i] === 'broadcast-protocol' ) {
      status = acceptConnectionAsBroadcast(request);
    } else if( request.requestedProtocols[i] === 'system-protocol' ) {
      status = acceptConnectionAsSystem(request);
    }
  }

  // Unsupported protocol.
  if(!status) {
    acceptConnectionAsSystem(request, null);
    //console.log('Subprotocol not supported');
    //request.reject(404, 'Subprotocol not supported');
  }
});


/*socket.onopen = onOpen;
socket.onclose = onClose;
socket.onerror = onError;
socket.onmessage = onMessage;*/
