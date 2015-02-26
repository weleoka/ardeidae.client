/*globals getHHMM, posts, convertUtcToLocalHHMM, populateUsersList, MsgControl, nl2br, websocket, userDiv, userCounterDiv */
/**
 *  Handling of messages from server.
 */
var MessageController = function() {
  this.posts = $('#posts');
  this.user = null;
  this.msgCount = null;
};
MessageController.prototype = {

  addToOutput: function(msg) {
    this.msgCount++;
      var newPost = document.createElement('div');

      if (this.msgCount % 2 !== 0) {
          newPost.className = 'odd';
      }
      // For example private messages.
      if ( msg.attributes ) {
        newPost.className += ' ' + msg.attributes;
      }
      newPost.innerHTML = getHHMM() + ' ' + msg.name + ': ' + nl2br(msg.message);
      if ( !msg.name ) {
        newPost.innerHTML = nl2br(msg.message);
      }

      this.posts.append(newPost);
      this.posts.scrollTop(newPost.offsetTop);
  },

  addHistoryToOutput: function(msg) {
      this.msgCount++;
      var newPost = document.createElement('div');
      if (this.msgCount % 2 !== 0) {
          newPost.className = 'odd';
      }
      newPost.innerHTML = convertUtcToLocalHHMM(msg.time) + ' ' + msg.name + ': ' + msg.message;
      this.posts.append(newPost);
      this.posts.scrollTop(newPost.offsetTop);
  },

  is_system_msg: function(msg) {
    if ( msg.lead === 'stat' ) {
      $('#userCounter').html( msg.activeUsers + ' online' );
      populateUsersList( msg.info );
      console.log('Stats recieved');   // index 0 is usercount.
      return true;
    }
    return false;
  },

  is_own_msg: function(msg) {
      if ( msg.name == this.user ) {
        return true;
      }
    return false;
  },

  newMsg: function(msg) {
    var formatedMessage = msg;
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

  newSystemLoginMsg: function (pswd) {
    var values = {
      lead: "pswd",
      acronym: this.user,
      password: pswd,
    };
    var portable = JSON.stringify(values);
    return portable;
  },

  newSystemCreateUserMsg: function (details) {
    var values = {
      lead: "rgstr",
      newUserDetails: details,
    };
    var portable = JSON.stringify(values);
    return portable;
  },

  newSystemInitMsg: function() {
    var values = {
      lead: "init",
      name: this.user,
    };
    var portable = JSON.stringify(values);
    return portable;
  },
};
