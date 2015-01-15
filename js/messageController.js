/*globals getHHMM, posts, populateUsersList, MsgControl, nl2br, websocket, userDiv, userCounterDiv */


/**
 *  Populate the users and user counter divs.
 */
 var populateUsersList = function(other) {
    var i;
    var userArray = other.split(',');
     // other.replace(/ /g,'<br>');
    // other.split(/ /g).join('<br>');
    
    userDiv.innerHTML = '';    // Clear the user list field.
    userCounterDiv.innerHTML = userArray[0] + ' online';

    var myTable= '<table id="userTable">';
    myTable+= '<thead> <th>Name</th>              <th>Extension</th> </thead><tbody>';
    for ( i = 1; i < userArray.length; i ++ ) {     // start with index 1. index 0 is usercount.
      myTable+= '<tr> <td>' + userArray[i] + '</td>      <td>' + i + '</td> </tr>';
    }
    myTable+= '</tbody></table>';

    userDiv.innerHTML = myTable;
};



/**
 * Handling of messages from server.
 */
function MessageController() {
  this.user = null;
  this.msgCount = null;
}
MessageController.prototype = {
  addToOutput: function(msg) {
    this.msgCount++;
      var newPost = document.createElement('div');
      if (this.msgCount % 2 !== 0) {
          newPost.className = 'odd';
      }
      newPost.innerHTML = getHHMM() + ' ' + msg;
      posts.appendChild(newPost);
      posts.scrollTop = newPost.offsetTop;
  },

  is_system_msg: function(msg) {
    var lead = msg.substring(0, 4),
          other = msg.substring(5, msg.length);
          // console.log('LEADvar: ' + lead);
          // console.log('OTHERvar: ' + other);
    if ( lead === 'stat' ) {
      populateUsersList(other);
      console.log('Stats recieved');   // index 0 is usercount.
      return true;
    }
    return false;
  },

  is_own_msg: function(msg) {
    var name = null;
    name = msg.split(':', 1);
    if ( name ) {
      console.log('FOUND A NAME in message content: ' + name);
      if ( name == MsgControl.user ) {
        return true;
      }
    }
    return false;
  },

  msgSend: function(msg) {
    var formatedMessage = nl2br(msg);

    var messageObject = {
      sender: this.user,
      senderID: "",
      message: formatedMessage,
      recievers: ""
    };

  var portable = JSON.stringify(messageObject);
  console.log(portable);

    websocket.send(portable);
  },
};
