/* global it, describe, beforeEach */

'use strict';

const vips = require('../../');

describe('GObject', function () {
  beforeEach(function () {
    if ('gc' in global) {
      console.log('gc-ing');
      global.gc();
    }
  });

  it('Can make a GObject', function () {
    var go = vips.vipsOperationNew('black');
    var x = new vips.GObject(go);
    x.objectRef();
    x.objectUnref();
  });
});
