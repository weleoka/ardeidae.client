/*globals getHHMM, generateStatus */

// main page elements.
var connectArticle = $('#createConnection'),
      messageArticle = $('#createMessage');

// User information divs.
var userCounterDiv = $('#userCounter'),
      userDiv = $('#userList'),
      userTable = $('#userTable');



/**
 *  Set viewing properties for JS-enabled browser LOGGED OFF.
 */
var setLoggedOffProperties = function (currentServer) {
    var eMail = $('eMail');

    $('#status').html('No connection.');
    messageArticle.addClass('hidden');
    connectArticle.removeClass('hidden');
    $('#disconnect').addClass('hidden');          // hide disconnect button
    $('#message').prop('value', '');         // Clear message input field.
    $('#posts').html ('');                         // Clear chat message field.
    userCounterDiv.addClass('hidden');
    userTable.addClass('hidden');
    $('#checkAll').prop('checked', false);        // Uncheck private messaging checkbox.
    eMail.addClass('hidden');
    eMail.prop('value', null);
    // serverURL.disabled='disabled'; // Delete this part if you want the URL input box enabled

    // Settings depending on server meta data:
    if ( !currentServer ) {
      // Reset to no selected server defaults
      $('#dropDown').prop('value', 'default');
      $('input#serverUrl').prop('value', 'ws://');
      // $('#dropDown').trigger('change');

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
        generateStatus('7', 'Recieved server status.');
        $('#connectInputs').removeClass('hidden');
        $('#connectbuttonbox').removeClass('hidden');

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
 *  Set viewing properties for JS-enabled browser LOGGED ON.
 */
var setLoggedOnProperties = function() {
    var user = $('#userName').prop('value');
    $('#status').html('Your know as: ' + user + ' ');
    messageArticle.removeClass('hidden');
    userCounterDiv.removeClass('hidden');

    $('#disconnect').removeClass('hidden');
    connectArticle.addClass('hidden');

    userTable.removeClass('hidden');
    $('#checkAll').prop('checked', false);
};



/**
 *  Function to give user feedback and modify layout depending on connection status.
 *  1: connecting, 2: success, 3: send, 4: recieve, 5:disconnect, 6:error, 7:custom.
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


