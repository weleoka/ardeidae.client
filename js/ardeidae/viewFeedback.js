/*globals getHHMM, MsgControl, status:true, disconnect, connectArticle:true,
messageArticle:true, outputDiv, posts, userCounterDiv:true, content, userDiv, url */

    // main page elements.
    var connectArticle = $('#createConnection'),
          messageArticle = $('#createMessage');

   // User information divs
    var userCounterDiv = $('#userCounter'),
          userDiv = $('#userList'),
          userTable = $('#userTable');

    var checkAll = $('#checkAll');

    var status = $('#status'),
          disconnect = $('#disconnect');


/**
 * Set viewing properties for JS-enabled browser LOGGED OFF.
 */
var setLoggedOffProperties = function(currentServer) {

    console.log(currentServer);
    $('#status').html('No connection.');
    messageArticle.addClass('hidden');
    connectArticle.removeClass('hidden');
    disconnect.addClass('hidden');  // hide disconnect button
    $('#message').prop('value', '');         // Clear message input field.
    $('#posts').html ('');
    userCounterDiv.addClass('hidden');
    userTable.addClass('hidden');
    checkAll.prop('checked', false);
      //  serverURL.disabled='disabled'; // Delete this part if you want the URL input box enabled

    // Settings depending on server meta data:
    if ( currentServer === null ) {
      // $('#').addClass('hidden');
      $('#connectInputs').addClass('hidden');
      $('#connectbuttonbox').addClass('hidden');

    } else if (currentServer !== null ) {
      $('#connectInputs').removeClass('hidden');
      $('#connectbuttonbox').removeClass('hidden');

      if ( currentServer.hasOwnProperty('privateMode') ) {

        if ( currentServer.privateMode ) {
          $('#connectButton').prop('value', 'privateConnect' );
          $('#password').removeClass('hidden');
          // $('#loginButton').removeClass('hidden');
          $('#registerButton').removeClass('hidden');

        } else {
          $('#connectButton').prop('value', 'publicConnect');
          $('#password').addClass('hidden');
          // $('#loginButton').addClass('hidden');
          $('#registerButton').addClass('hidden');
        }
      }
    }

};
/*
      $('#userName').addClass('hidden');
      $('#password').addClass('hidden');
      $('#eMail').addClass('hidden');
               <input id='serverUrl' class='textInputField' type="text" value='ws://dbwebb.se:1337'>
                 <input id='userName' class='textInputField' type="text" placeholder="username"><br>
                  <select id="dropDown" class='smallButton'></select>
                 <input id='password' class='textInputField' type="text" placeholder="password (if required)">
                 <input id='eMail' class='textInputField' type="text" placeholder="email">
              </form>
              <div id='connectbuttonbox'>
                  <button id='connectButton' class='smallButton'>Connect</button>
                  <button id='loginButton' class='smallButton'>Login</button>
                  <button id='registerButton' class='smallButton'>Register</button>
*/



/**
 * Set viewing properties for JS-enabled browser LOGGED ON.
 */
var setLoggedOnProperties = function(user) {
    $('#status').html('Your know as: ' + user + ' ');
    messageArticle.removeClass('hidden');
    userCounterDiv.removeClass('hidden');

    disconnect.removeClass('hidden');
    connectArticle.addClass('hidden');

    userTable.removeClass('hidden');
    checkAll.prop('checked', false);
};



/**
 * Function to give user feedback and modify layout depending on connection status.
 * 1: connecting, 2: success, 3: send, 4: recieve, 5:disconnect, 6:error, 7:custom.
 */
var generateStatus = function(type, custom) {
  var url = $('#serverUrl').prop('value');
  var user = $('#userName').prop('value');
  var outputDiv = $('#output');
  var output_user = document.createElement('p');
  switch (type) {
    case "1":
      output_user.innerHTML = getHHMM() + ': Connecting to:\n' + url + '...';
      break;
    case "2":
      setLoggedOnProperties(user);
      output_user.innerHTML = getHHMM() + ': Established websocket.';
      break;
    case "3":
      output_user.innerHTML = getHHMM() + ': Sent message.';
      break;
    case "4":
      output_user.innerHTML = getHHMM() + ': Recieved message.';
      break;
    case "5":
      setLoggedOffProperties();
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


