'use strict';

var msgpack = require('msgpack5');

module.exports = function createPacker(packer) {
  packer = packer || 'msgpack';

  switch (packer) {
    case 'json':
      return jsonFormat();
    case 'msgpack':
    default:
      return msgpackFormat();
  }
};

function msgpackFormat() {
  var packer = msgpack({forceFloat64: true});
  packer.register(1, Date, encodeDate, decodeDate);
  return packer;
}

function encodeDate(obj) {
  return new Buffer(obj.toISOString(), 'utf8');
}

function decodeDate(buf) {
  return new Date(buf.toString('utf8'));
}

function jsonFormat() {
  var packer = {
    encode: function(value) {
      return JSON.stringify (value);
    },

    decode: function(value) {
      return JSON.parse(value, function(k, v) {
        if (v && v.type && v.type === 'Buffer') {
          return new Buffer(v.data);
        }

        // eslint-disable-next-line
        var reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;
        if (reISO.exec(v)) {
          return new Date(v);
        }

        return v;
      });
    },
  };
  return packer;
}
