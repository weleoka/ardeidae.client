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
function createCorsRequest(method, url) {
    $.ajax({
      type: method,
      url: url,
      contentType: "application/json",
      data: JSON.stringify({
            name: "Tricia",
            age: 37
      }),
      dataType: "text",
      success: function(data){
        console.log(data);
        console.log('Ajax request returned successfully.');
      },
      error: function(textStatus, errorThrown){ // jqXHR
        console.log(textStatus);
        console.log('Ajax request failed: ' + textStatus + ', ' + errorThrown);
      }
    });
}


// The server will store the linebreaks as a visible \n due to JSON not escaping without \\n.
