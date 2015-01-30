/*globals XMLHttpRequest, XDomainRequest */


/**
 * Generate hours and minutes time-log.
 */
var getHHMM = function() {
    var dateRaw = new Date();
    var now = dateRaw.toLocaleTimeString('en-US', { hour12: false });
    return now.substring(0, now.length-3);
};



/**
 * Basic filter for maintaining linebreaks etc.
 */
var nl2br = function (str) {
    var breakTag = '<br>';      // (is_xhtml || is_xhtml === 'undefined') ? '<br />' :
    return (str + ' ').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
};


// Create the XHR object, browser compliance testing.
function createCorsRequest(method, url, callback) {
  // Change from ws:// to http:// in url.
    var httpUrl = 'http://' + url.slice(5, url.length);
    
    $.ajax({
      type: method,
      url: httpUrl,
      contentType: 'application/json',
      data: JSON.stringify({
            name: 'clientName',
            age: 37
      }),
      dataType: 'text',
      success: function(data){
        callback(data);
      },
      error: function(textStatus, errorThrown){ // jqXHR
        console.log(textStatus);
        console.log('Ajax request failed: ' + textStatus + ', ' + errorThrown);
      }
    });
}


// The server will store the linebreaks as a visible \n due to JSON not escaping without \\n.
