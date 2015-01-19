/*globals getHHMM, posts, populateUsersList, MsgControl, nl2br, websocket, userDiv, userCounterDiv */


/**
 *  Populate the users and user counter divs.
 */
 var populateUsersList = function(users) {
    var i;
    userDiv.innerHTML = '';    // Clear the user list field.

    var myTable= '<table id="userTable">';
    myTable+= '<thead> <th>Name</th><th>ID</th><th><input type="checkbox" id="selectall"/></th> </thead><tbody>';
    for ( i = 0; i < users.length; i ++ ) {
      if (users[i]) {
        myTable+= '<tr id="' + users[i].id + '">';
        myTable+= '<td>' + users[i].name + '</td>';
        myTable+= '<td>' + i + '</td>';
        myTable+= '<td><input id="' + users[i].id + '" class="checkboxes" type="checkbox" name="check[]"></td>';
        myTable+= '</tr>';
      }
    }
    myTable+= '</tbody></table>';

    userDiv.innerHTML = myTable;
};



/**
 * Generate hours and minutes time-log.
 */
var getHHMM = function() {
    var dateRaw = new Date();
    var now = dateRaw.toLocaleTimeString('en-US', { hour12: false });
    return now.substring(0, now.length-3);
};

/**
 * Convert UTC time to local HHMM.
 */
var convertUtcToLocalHHMM = function(timestamp) {
    var utc = new Date(timestamp);
    var time = utc.toLocaleTimeString('en-US', { hour12: false });
    return time.substring(0, time.length-3);
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
      newPost.innerHTML = getHHMM() + ' ' + msg.name + ': ' + msg.message;
      if ( !msg.name ) {
        newPost.innerHTML = msg.message;
      }

      posts.appendChild(newPost);
      posts.scrollTop = newPost.offsetTop;
  },

  addHistoryToOutput: function(msg) {
      this.msgCount++;
      var newPost = document.createElement('div');
      if (this.msgCount % 2 !== 0) {
          newPost.className = 'odd';
      }
      newPost.innerHTML = convertUtcToLocalHHMM(msg.time) + ' ' + msg.name + ': ' + msg.message;
      posts.appendChild(newPost);
      posts.scrollTop = newPost.offsetTop;
  },

  is_system_msg: function(msg) {

    if ( msg.lead === 'stat' ) {
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
    // userName is added by server to prevent client in-session namechanging.
    var messageObject = {
      sender: this.user,
      senderID: "",
      message: formatedMessage,
    };
    var portable = JSON.stringify(messageObject);
    return portable;
  },

    // EXPERIMENTING HERE
  newPrivateMsg: function(msg, reciever) {
    var formatedMessage = nl2br(msg);
    // userName is added by server to prevent client in-session namechanging.
    var messageObject = {
      sender: this.user,
      senderID: "",
      message: formatedMessage,
      reciever: reciever,
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
