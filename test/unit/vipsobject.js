/* global it, describe, beforeEach */

'use strict';

const assert = require('assert');

const vips = require('../../');

describe('VipsObject', function () {
  beforeEach(function () {
    if ('gc' in global) {
      console.log('gc-ing');
      global.gc();
    }
  });

  it('Can make a VipsObject', function () {
    var vo = vips.vipsOperationNew('black');
    var x = new vips.VipsObject(vo);
    x.get('width');
  });

  it('Throws an exception for get of unknown property', function () {
    var vo = vips.vipsOperationNew('black');
    var vipsObject = new vips.VipsObject(vo);
    assert.throws(function () {
      vipsObject.get('banana');
    });
  });

  it('Can get a property', function () {
    var vo = vips.vipsOperationNew('black');
    var vipsObject = new vips.VipsObject(vo);
    var name = vipsObject.get('nickname');
    // nickname is '' until build
    assert.strictEqual(name, '');
  });

  it('Can set a property', function () {
    var vo = vips.vipsOperationNew('black');
    var vipsObject = new vips.VipsObject(vo);
    vipsObject.set('nickname', 'banana');
    var name = vipsObject.get('nickname');
    assert.strictEqual(name, 'banana');
  });

  it('Can set from string', function () {
    var vo = vips.vipsOperationNew('black');
    var vipsObject = new vips.VipsObject(vo);
    vipsObject.setFromString('nickname = banana');
    var name = vipsObject.get('nickname');
    assert.strictEqual(name, 'banana');
  });
});
