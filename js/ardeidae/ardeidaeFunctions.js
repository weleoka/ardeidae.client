/*globals XMLHttpRequest, XDomainRequest, setLoggedOffProperties */



/**
 *  Generate hours and minutes time-log.
 */
var getHHMM = function() {
    var dateRaw = new Date();
    var now = dateRaw.toLocaleTimeString('en-US', { hour12: false });
    return now.substring(0, now.length-3);
};



/**
 *  Basic filter for maintaining linebreaks etc.
 */
var nl2br = function (str) {
    var breakTag = '<br>';      // (is_xhtml || is_xhtml === 'undefined') ? '<br />' :
    return (str + ' ').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
};





// The server will store the linebreaks as a visible \n due to JSON not escaping without \\n.
