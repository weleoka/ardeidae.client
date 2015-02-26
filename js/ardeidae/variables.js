/**
 *  Place your JS-code here.
 */
 // $(document).ready( function () {
 // 'use strict';

var VariablesController = function() {

this.broadcast_protocol = null;
this.system_protocol = null;
};

VariablesController.prototype = {

  setBcProtocol: function (protocol) {
      this.broadcast_protocol = protocol;
  },

  setSysProtocol: function (protocol) {
      this.system_protocol = protocol;
  },

  getBcProtocol: function () {
    return this.broadcast_protocol;
  },

  getSysProtocol: function () {
    return this.system_protocol;
  },

  resetProtocols: function () {
      this.broadcast_protocol = 'broadcast-protocol';
      this.system_protocol = 'system-protocol';
  },
};