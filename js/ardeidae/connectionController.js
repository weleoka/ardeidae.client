/*globals WebSocket, MsgControl,  CnctControl, websocket: true, wsSystem: true, generateStatus */
/**
 * Handling of connections server.
 */
  /**
   * Websocket login handlers.
   */
 // function loginInstance ( wsLogin, url, userName, password ) {
//    this.wsLogin = wsLogin;



 function closeAllConnections () {
      wsSystem.close();
      websocket.close();
    }