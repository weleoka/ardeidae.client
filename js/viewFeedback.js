/*globals getHHMM, MsgControl, status:true, disconnect, connectArticle:true,
messageArticle:true, outputDiv, posts, userCounterDiv:true, content, userDiv, url */

    // main page elements.
    var connectArticle = document.getElementById('createConnection'),
    messageArticle = document.getElementById('createMessage');

   // User information divs
    var userCounterDiv = document.getElementById('userCounter'),
    userDiv = document.getElementById('userlist'),
    userTable = document.getElementById('userTable');

    var outputDiv = document.getElementById('output');

/**
 * Set viewing properties for JS-enabled browser LOGGED OFF.
 */
var setLoggedOffProperties = function() {
    var status = document.getElementById('status');
    disconnect.className = 'hidden';  // hide disconnect button
    messageArticle.className ='hidden'; // hide message
    connectArticle.className ='mainPageContainer';
    content.value = '';                         // Clear message input field.
    posts.innerHTML = '---> Welcome to the Websocket chat.';
    userCounterDiv.innerHTML = '...';
    userDiv.innerHTML = 'Login to chat.';
    status.innerHTML = 'No connection.';
      //  serverURL.disabled='disabled'; // Delete this part if you want the URL input box enabled
};


/**
 * Set viewing properties for JS-enabled browser LOGGED ON.
 */
var setLoggedOnProperties = function() {
      // user feedback and status modifications
    var status = document.getElementById('status');
    status.innerHTML = 'Your know as: ' + MsgControl.user + ' ';
    status.appendChild(disconnect);
    disconnect.className ='exitButton';
    connectArticle.className ='hidden';
    messageArticle.className ='mainPageContainer';
};



/**
 * Function to give user feedback and modify layout depending on connection status.
 * 1: connecting, 2: success, 3: send, 4: recieve, 5:disconnect, 6:error, 7:custom.
 */
var generateStatus = function(type, custom) {
  var output_user = document.createElement('p');
  switch (type) {
    case "1":
      output_user.innerHTML = getHHMM() + ': Connecting to: ' + url.value + '...';
      break;
    case "2":
      setLoggedOnProperties();
      output_user.innerHTML = getHHMM() + ': Established websocket.';
      break;
    case "3":
      content.value = '';       // blank out the message input field after sending message.
      output_user.innerHTML = getHHMM() + ': Sent message.';
      break;
    case "4":
      output_user.innerHTML = getHHMM() + ': Recieved message.';
      break;
    case "5":
      setLoggedOffProperties();
      output_user.innerHTML = getHHMM() + ': Closed connection to:\n' + url.value;
      break;
    case "6":
      output_user.innerHTML = getHHMM() + ': An error occured..';
      break;
    case "7":
        output_user.innerHTML = getHHMM() + ': ' + custom;
      break;
    default:
      output_user.innerHTML = getHHMM() + ': feedback error.';
  }
  outputDiv.appendChild(output_user);
  outputDiv.scrollTop = output_user.offsetTop;
};


