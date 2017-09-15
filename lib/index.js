'use strict';

var ffi = require('ffi');

// TODO: Windows needs libvips-42
var libvips = ffi.Library('libvips', {
  vips_init: ['int', ['string']],
  vips_version: ['int', ['int']]
});

var ret = libvips.vips_init('banana');
if (ret !== 0) {
  throw new Error('unable to init libvips');
}

var vips = {
  major: libvips.vips_version(0),
  minor: libvips.vips_version(1)

};

vips.atLeastLibvips = function (requiredMajor, requiredMinor) {
  return vips.major > requiredMajor ||
        (vips.major === requiredMajor && vips.minor >= requiredMinor);
};

if (!vips.atLeastLibvips(8, 2)) {
  throw new Error('need libvips 8.2 or newer, but found ' +
        vips.major + '.' + vips.minor);
}

[
  'error',
  'gvalue',
  'gobject',
  'vipsobject',
  'operation',
  'image',
  'interpolate',
  'autogen'
].forEach(function (name) {
  require('./' + name)(vips);
});

module.exports = vips;
