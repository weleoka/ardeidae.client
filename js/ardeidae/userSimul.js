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



