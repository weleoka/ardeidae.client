/*globals getHHMM, posts, populateUsersList, MsgControl, nl2br, websocket */


/**
 *  Populate the users and user counter divs.
 */
 var populateUsersList = function(other) {
    var userListItem, i;
    var userArray = other.split(',');
     // other.replace(/ /g,'<br>');
    // other.split(/ /g).join('<br>');
    userDiv.innerHTML = '';    // Clear the user list field.
    userCounterDiv.innerHTML = userArray[0] + ' online';

    var myTable= '<table id="userTable">';
    myTable+= '<thead> <th>Name</th>              <th>Extension</th> </thead><tbody>';
    for ( i = 1; i < userArray.length; i ++ ) {     // start with index 1. index 0 is usercount.


    myTable+= '<tr> <td>' + userArray[i] + '</td>      <td>' + i + '</td> </tr>';



/*      userTableRow = document.createElement('tr');
      userTableRow.innerHTML = userArray[i];
      userTableRow.className = 'userTableItem';
      userTable.appendChild(userListItem);

*/

/*  // Insert a row in the table at row index 0
  var newRow   = userTable.insertRow(0);

  // Insert a cell in the row at index 0
  var newCell  = newRow.insertCell(0);

  // Append a text node to the cell
  var newText  = document.createTextNode('New top row');
  newCell.appendChild(newText);

// Call addRow() with the ID of a table
addRow('userTable');
*/
      userListItem = document.createElement('p');
      userListItem.innerHTML = userArray[i];
      userListItem.className = 'userListItem';
      userDiv.appendChild(userListItem);
    }
    myTable+= '</tbody></table>';
    // $('userTable').append(myTable);

    userDiv.innerHTML = myTable;
    // posts.scrollTop = newPost.offsetTop;
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
    websocket.send(this.user + ': ' + formatedMessage);
  },
};
