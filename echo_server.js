/*globals */
var port = 1337;

// Require the modules we need
var http = require('http');
var WebSocketServer = require('websocket').server;
/*    var WebSocketClient = require('websocket').client;
    var WebSocketFrame  = require('websocket').frame;
    var WebSocketRouter = require('websocket').router;
*/
var UsrControl = require('ardeidae').usrControl;
var MsgControl = require('ardeidae').msgControl;
var Broadcaster = require('ardeidae').broadcaster;
var LogKeeper = require('ardeidae').logKeeper;


/**
 * Function to test the origin of incoming connection.
 */
 function originIsAllowed(origin) {
  if(origin === 'http://dbwebb.se' || origin === 'http://localhost:8080' || origin === 'http://192.168.1.36:8080') {
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
 * Check if it's a system message and handle it accordingly.
 */
function is_system_msg(userId, msg) {
  var lead = msg.substring(0, 4),
        userName = msg.substring(5, msg.length);
   // console.log('LEADvar: ' + lead);
   // console.log('USERvar: ' + userName);
   // console.log('Length of users array = ' + UserList.length);
  if ( lead === 'init' ) {
     console.log('SYS:init recieved... writing new Name to user on online list at index: ' + userId );
     UsrControl.setNameAtIndex(userName, userId);

     var broadcastMessage = userName + ' has entered the zone.';
     Broadcaster.broadcastServerRegularInfo( broadcastMessage );
     LogKeeper.saveRegularMessage('server', 'server', 'server', broadcastMessage);

     var broadcastData = UsrControl.getStats();
     Broadcaster.broadcastServerSystemInfo( broadcastData );
     LogKeeper.saveSystemMessage('server', 'server', 'server', broadcastData);

     // UsrControl.printUserListArray();  // Output curent users in console.
     return true;
  }
  if ( lead === 'exit' ) {
    return true;
  }
  if ( lead === 'stat' ) {
    console.log('SYS:stat recieved.');
    Broadcaster.broadcastServerSystemInfo( UsrControl.getStats() );
    return true;
  }
  if ( lead === 'hist' ) {
    console.log('SYS.hist recieved.');
    Broadcaster.broadcastServerSystemInfo( UsrControl.getHistory() );
    return true;
  }
 }



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
var wsServer = new WebSocketServer({  httpServer: httpServer,  autoAcceptConnections: false });

// Start up all things Ardeidae.
var UsrControl = new UsrControl();
var UsgControl = new MsgControl();
var Broadcaster = new Broadcaster();
var LogKeeper = new LogKeeper();



 /**
 * Accept connection under the broadcast-protocol
 *
 */
function acceptConnectionAsBroadcast(request) {
  var connection = request.accept('broadcast-protocol', request.origin);
  // Give current connection an ID based on number of online users.
  connection.broadcastId = UsrControl.getArrayLength();
  // Log the connection to broadcast array.
  Broadcaster.addPeer(connection);
  console.log((new Date()) + ' Broadcast connection accepted from ' + request.origin + ' id = ' + connection.broadcastId);
  UsrControl.addNewUser( connection.broadcastId, request.origin );

  // Send the new user the latest posts.
  connection.sendUTF( '---> Welcome to the Ardeidae server. (displaying latest 7 messages)' );
  var log = LogKeeper.retrieveRegularMessage(7),
        j;
  for ( j = 0; j < log.length; j++ ) {
      connection.sendUTF( log[j] );
  }

/*
 * Callback on message.
 */
  connection.on('message', function(message) {
        var msg,
              peerID = connection.broadcastId,
              peerName = UsrControl.findNameByIndex(peerID),
              peerOrigin = connection.remoteAddress,
              processedMessage;
        if (message.type === 'utf8') {
            msg = JSON.parse(message.utf8Data);
            LogKeeper.saveRegularMessage( peerID, peerName, peerOrigin,  msg.message );
            // Combine the server-logged name and the recieved message before broadcast.
            processedMessage = htmlEntities( peerName + ': ' + msg.message );
            if ( !msg.reciever ) {
              Broadcaster.broadcastPeerRegularInfo( processedMessage );
              console.log('Received regular utf8 message: (START)' + processedMessage + '(END)');
            }
            if ( msg.reciever ) {
              var arr = msg.reciever;
              // add the senders ID to reciever list.
              arr.push(peerID);
              Broadcaster.broadcastPeerPrivateInfo( processedMessage, arr );
            }
        }
        else if (message.type === 'binary') {
            msg = message.binaryData;
            console.log('Received Binary Message of ' + msg.length + ' bytes');
            LogKeeper.saveRegularMessage( peerID, peerName, peerOrigin,  msg );
            connection.sendBytes( msg );
        }
  });

/*
 * Callback when connection closes.
 */
  connection.on('close', function(reasonCode, description) {
    var feedback = UsrControl.findNameByIndex(connection.broadcastId) + ' has left the zone.';
    UsrControl.removeByIndex (connection.broadcastId);
    Broadcaster.removePeer(connection.broadcastId);
    Broadcaster.broadcastServerRegularInfo( feedback );
    Broadcaster.broadcastServerSystemInfo( UsrControl.getStats() );
    console.log((new Date())
                      + ' Peer ' + connection.remoteAddress
                      + ' Broadcastid = ' + connection.broadcastId
                      + ' disconnected. Because: ' + reasonCode
                      + ' Description: ' + description);
  });
  return true;
}



/**
 * Accept connection under the system-protocol
 *
 */
function acceptConnectionAsSystem(request) {
  var sysConnection = request.accept('system-protocol', request.origin);
  // Account for the initial user created on the formation of broadcast connection.
  sysConnection.broadcastId = UsrControl.getArrayLength() -1;
   // Log the connection to server broadcasts array.
  Broadcaster.addSystemPeer(sysConnection);
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
    Broadcaster.removeSystemPeer(sysConnection.broadcastId);
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
    // acceptConnectionAsSystem(request, null);
    console.log('Subprotocol not supported');
    request.reject(404, 'Subprotocol not supported');
  }
});