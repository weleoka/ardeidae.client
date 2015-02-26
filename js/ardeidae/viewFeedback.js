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