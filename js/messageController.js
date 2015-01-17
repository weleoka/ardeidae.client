/*globals getHHMM, posts, populateUsersList, MsgControl, nl2br, websocket, userDiv, userCounterDiv */


/**
 *  Populate the users and user counter divs.
 */
 var populateUsersList = function(users) {
    var i;
    userDiv.innerHTML = '';    // Clear the user list field.

    var myTable= '<table id="userTable">';
    myTable+= '<thead> <th>Name</th>              <th>Extension</th> </thead><tbody>';
    for ( i = 0; i < users.length; i ++ ) {
      if (users[i]) {
        myTable+= '<tr id=' + users[i].id + '> <td>' + users[i].name + '</td>      <td>' + i + '</td> </tr>';
      }
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
      newPost.innerHTML = getHHMM() + ' ' + msg.message;
      posts.appendChild(newPost);
      posts.scrollTop = newPost.offsetTop;
  },

  is_system_msg: function(msg) {
    msg = JSON.parse(msg);
    var lead = msg.lead;

    if ( lead === 'stat' ) {
      userCounterDiv.innerHTML = msg.activeUsers + ' online';
      populateUsersList( msg.info );
      console.log('Stats recieved');   // index 0 is usercount.
      return true;
    }
    return false;
  },

  is_own_msg: function(msg) {
      if ( msg.name == MsgControl.user ) {
        return true;
      }
    return false;
  },

// EXPERIMENTING HERE
  newMsg: function(msg) {
    var formatedMessage = nl2br(msg);
    var arr = [2, 3];
    var messageObject = {
      sender: this.user,
      senderID: "",
      message: formatedMessage,
      reciever: arr,
      attributes: "private"
    };
    var portable = JSON.stringify(messageObject);
    return portable;
  },

  newSystemInitMsg: function() {
    var values = {
      lead: "init",
      name: this.user,
    };
    var portable = JSON.stringify(values);
    return portable;
  }
};
