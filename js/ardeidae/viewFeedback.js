/*globals getHHMM, generateStatus, handler_clickServerListItem */

// main page elements.
var id_createConnection = $('#createConnection'),
      id_createMessage = $('#createMessage'),
      id_posts = $('#posts'),
      id_welcome = $('#welcome'),
      id_hubList = $('#hubList');

// User information divs.
var id_userCounter = $('#userCounter'),
      id_userList = $('#userList'),
      id_userTable = $('#userTable'),
      id_serverMetaData = $('#serverMetaData');



/**
 *  Populate the users and user counter divs.
 */
 var populateUsersList = function(users) {
    var i,
          tableRow = '',
          usersLength = users.length;
    for ( i = 0; i < usersLength; i ++ ) {
      if (users[i]) {
        tableRow+= '<tr id="' + users[i].id + '">';
        tableRow+= '<td>' + users[i].name + '</td>';
        tableRow+= '<td>' + i + '</td>';
        tableRow+= '<td><input id="' + users[i].id + '" class="checkboxes" type="checkbox"></td>';
        tableRow+= '</tr>';
      }
    }
    var tBody = id_userTable.find('tbody:last');
    tBody.html('');
    tBody.append(tableRow);
};



/**
 *  Display all the servers online from the hub.
 */
var populateServerList = function (list) {
    var listLength = list.length;
    var i, serverObj, wsUrl, serverItemContents, counter = 0;
    var id_hubListTable = $('#hubListTable');

    var oddChecker = function (count) {
      if ( count % 2 !== 0 ) {
          return 'serverItem odd';
      }
      return 'serverItem';
    };

    id_welcome.addClass('hidden');
    id_hubList.removeClass('hidden');
    id_hubListTable.html(' ');

    for ( i = 0; i < listLength; i++ ) {
      counter++;
      serverObj = list[i];
      list[i].uptime =  Math.floor(serverObj.uptime / 60000 );
      wsUrl =  'ws://' + serverObj.domain + ':' + serverObj.port;
      serverItemContents = '<div class="' + oddChecker(counter) + '" data_server="' + wsUrl + '">'
        + '- ' + serverObj.name + ' - '
        + ' ' + serverObj.domain + '</div>';

      $('<div/>', {
      }).html(serverItemContents)
          .appendTo(id_hubListTable)
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

      id_serverMetaData.removeClass('hidden')
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

    $('#connectInputs').removeClass('hidden');
    $('#connectbuttonbox').removeClass('hidden');

// Display the server meta data in sidebar:
         //                                                           id_userList.addClass('hidden');
    showServerDataInSidebar(currentServer);

// Set the controlls according to server status.
    setServerModeSpecifics(currentServer);
};



/**
 *  Route the serverlist from AJAX request to relevant function.
 *  This function also tests the object for validity.
 */
var serverListRouter = function (li) {
// Request returns a string output to user.
    if ( li !== null && typeof li === 'string' ) {
      generateStatus('7', li);
    }

// Request returns object(s)
    if ( li !== null && typeof li === 'object' ) {
      if ( li.hasOwnProperty('length') ) {
        if ( li.length === 1 ) {
          generateStatus('7', 'Recieved server status.');

          if ( !li[0].hasOwnProperty('name') ) {
            generateStatus('7', 'Server status invalid.');
          } else {
            setSelectedServer( li[0] );
            // populateServerList( li );
          }
        }
        if ( li.length > 1 ) {
          generateStatus('7', 'Refreshed server list.');
          populateServerList( li );
        }
      }
    }
};



/**
 *  Set viewing properties LOGGED OFF.
 */
var setLoggedOffProperties = function () {

    // Header elements.
    $('#status').html('No connection.');
    $('#disconnect').addClass('hidden');          // hide disconnect button

    // Page elements.
    id_welcome.removeClass('hidden');
    id_createMessage.addClass('hidden');
    id_createConnection.removeClass('hidden');
    id_posts.html ('');

    // Sidebar elements.
    id_userCounter.addClass('hidden');
    id_userList.addClass('hidden');
    id_userTable.addClass('hidden');
    id_serverMetaData.addClass('hidden');

    // Inputs
    $('eMail').addClass('hidden');
    $('eMail').prop('value', null);
    $('#message').prop('value', '');                 // Clear message input field.

    // $('input#serverUrl').prop('value', 'ws://');
    $('#connectInputs').addClass('hidden');
    $('#connectbuttonbox').addClass('hidden');
    $('#password').addClass('hidden');
    $('#registerButton').addClass('hidden');
    // serverURL.disabled='disabled'; // Delete this part if you want the URL input box enabled
};



/**
 *  Set viewing properties for LOGGED ON.
 */
var setLoggedOnProperties = function() {

    // Header elements.
    var user = $('#userName').prop('value');
    $('#status').html('Your know as: ' + user + ' ');
    $('#disconnect').removeClass('hidden');

    // Page elements.
    id_createMessage.removeClass('hidden');
    id_createConnection.addClass('hidden');
    id_welcome.addClass('hidden');
    id_hubList.addClass('hidden');

    // Sidebar elements.
    id_userCounter.removeClass('hidden');
    id_userList.removeClass('hidden');
    id_serverMetaData.addClass('hidden');
    id_userTable.removeClass('hidden');
    $('#selectAll').removeClass('Hidden')
        .prop('checked', false);

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