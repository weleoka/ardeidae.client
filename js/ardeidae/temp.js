
function ConnectionController() {
  // MsgControl = MsgControl;
  this.wsLogin = null;
  this.websocket = null;
  this.wsSystem = null;
  this.url = null;
}
ConnectionController.prototype = {

  login: function( url, userName, password ) {
      var wsLogin = new WebSocket( url, 'login-protocol' );

  /**
   * Websocket login handlers.
   */
    wsLogin.onopen = function() {
      console.log('The wsLogin connection is now open.');
      if ( password ) {
        console.log( 'Connecting to: ' + url + ' With username: ' + userName + ' and password: ' + password);
        wsLogin.send(   // Give name and Password to server.
                MsgControl.newSystemLoginMsg( password )
        );
      }
    };

    wsLogin.onmessage = function(event) {
      var msg = JSON.parse(event.data);
      if ( msg.lead === 'success' ) {
        var params = { url: url,
                          broadcast: msg.broadcast_protocol,
                          system: msg.system_protocol
        };
        CnctControl.connect( params  );
        generateStatus('7', msg.message);
      } else {
        generateStatus('7', msg.message);
      }
    };

    wsLogin.onclose = function() {
      console.log('The wsLogin connection is now closed.');
    };
  },



  connect: function ( params ) {
      generateStatus('1');
      websocket = new WebSocket( params.url, params.broadcast );
      wsSystem = new WebSocket( params.url, params.system );
      this.websocket = websocket;
      this.wsSystem = wsSystem;


  /**
   * Websocket broadcast handlers.
   */
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



  /**
   * Websocket system handlers.
   */
    wsSystem.onopen = function() {
      console.log('The wsSystem connection is now open.');
      wsSystem.send( MsgControl.newSystemInitMsg() );  // Give name to server.
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
  },

  closeAllConnections: function () {
    this.websocket.close();
    this.wsSystem.close();
  },
 };
