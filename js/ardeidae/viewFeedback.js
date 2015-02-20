/*globals getHHMM, generateStatus, oddChecker, handler_selectAServer, handler_clickServerListItem */

// main page elements.
var connectArticle = $('#createConnection'),
      messageArticle = $('#createMessage');

// User information divs.
var userCounterDiv = $('#userCounter'),
      userDiv = $('#userList'),
      userTable = $('#userTable'),
      serverMetaDataDiv = $('#serverMetaData');


/**
 *  Check if serverListItem is odd or even and assign classname.
 */
var oddChecker = function (count) {
      if ( count % 2 !== 0 ) {
          return 'odd';
      }
      return;
};



/**
 *  Display all the servers online from the hub.
 */
var populateServerList = function (list) {
    var i, serverObj, wsUrl, serverItemContents, counter = 0;
    var hubListTable = $('#hubListTable');

    hubListTable.html(' ');

    for ( i = 0; i < list.length; i++ ) {
      counter++;
      serverObj = list[i];
      list[i].uptime =  Math.floor(serverObj.uptime / 60000 );
      wsUrl =  'ws://' + serverObj.domain + ':' + serverObj.port;
      serverItemContents = '<div class="serverItem" data_server="' + wsUrl + '">' + serverObj.name  + ' uptime: ' + serverObj.uptime + '</div>';

      $('<div/>', {
          class: oddChecker(counter),
      }).html(serverItemContents)
          .appendTo('#hubListTable')
          .on('click', handler_clickServerListItem);
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
      $('#dropDown').prop('value', 'default');
      $('input#serverUrl').prop('value', 'ws://');
      // $('#dropDown').trigger('change');

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
        var metaData = '<h3>Server Info</h3>'
            + '<br><h4>' + currentServer.name + '</h4>'
            + '<br> Online users: ' + currentServer.onlineUsers
            + '<br> Private mode: ' + currentServer.privateMode
            + '<br> Domain: ' + currentServer.domain
            + '<br> Port: ' + currentServer.port
            + '<br> Version: ' + currentServer.version;

        userDiv.addClass('hidden');
        serverMetaDataDiv.removeClass('hidden')
        .html(metaData);

/*                         {id: this.serverId,
                    name: this.serverCallsign,
                    version: this.serverVersion,
                    privateMode: this.serverMode,
                    onlineUsers: this.onlineUsers,
                    historicalUsers: this.historicalUsers,
                    domain: this.domain,
                    port: this.port });
    return JSON.stringify(obj);*/



// Set the controlls according to server status.
        if ( currentServer.hasOwnProperty('privateMode') ) {
// Server private mode: true.
          if ( currentServer.privateMode ) {
            $('#connectButton').prop('value', 'privateConnect' );
            $('#password').removeClass('hidden');
            // $('#loginButton').removeClass('hidden');
            $('#registerButton').removeClass('hidden');
// Server private mode: false.
          } else {
            $('#connectButton').prop('value', 'publicConnect');
            $('#password').addClass('hidden');
            // $('#loginButton').addClass('hidden');
            $('#registerButton').addClass('hidden');
          }
        }
      }
    }
};



/**
 *  Set viewing properties for JS-enabled browser LOGGED OFF.
 */
var setLoggedOffProperties = function (serverList) {
    var eMail = $('eMail');

    console.log(serverList);

    $('#status').html('No connection.');
    messageArticle.addClass('hidden');
    connectArticle.removeClass('hidden');
    $('#disconnect').addClass('hidden');          // hide disconnect button
    $('#message').prop('value', '');         // Clear message input field.
    $('#posts').html ('');                         // Clear chat message field.
    userCounterDiv.addClass('hidden');
    userTable.addClass('hidden');
    eMail.addClass('hidden');
    eMail.prop('value', null);
    serverMetaDataDiv.addClass('hidden');
    $('#connectInputs').addClass('hidden');

    userDiv.removeClass('hidden');
    serverMetaDataDiv.addClass('hidden');
    // serverURL.disabled='disabled'; // Delete this part if you want the URL input box enabled
    // console.log(serverList);

    // If the AJAX returns nothing the serverList will be an error message.
    if ( serverList !== null && typeof serverList === 'string' ) {
      generateStatus('7', serverList);
    }

    if ( serverList !== null && typeof serverList === 'object' ) {
      if ( serverList.hasOwnProperty('length') ) {
        if ( serverList.length === 1 ) {
          generateStatus('7', 'Recieved server status.');
          setSelectedServer( serverList[0] );
        }
        if ( serverList.length > 1 ) {
          generateStatus('7', 'Refreshed server list.');
          populateServerList( serverList );
        }
      }
    }
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