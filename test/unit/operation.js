/* global it, describe, beforeEach */

'use strict';

const assert = require('assert');

const vips = require('../../');

describe('Operation', function () {
  beforeEach(function () {
    if ('gc' in global) {
      console.log('gc-ing');
      global.gc();
    }
  });

  it('Can make a Operation', function () {
    vips.Operation.newFromName('black');
  });

  it('Throws an exception for unknown operation', function () {
    assert.throws(function () {
      vips.Operation.newFromName('banana');
    });
  });

  it('Can get an operation\'s args', function () {
    var op = vips.Operation.newFromName('black');
    var args = op.getArgs();
    assert.strictEqual(args.length, 4);
    assert.strictEqual(args[0][0], 'out');
    assert.strictEqual(args[0][1], 35);
  });

  it('Can get an operation\'s flags', function () {
    var op = vips.Operation.newFromName('black');
    var flags = op.getFlags();
    assert.strictEqual(flags, 0);
  });

  it('Throws an exception for unknown operation', function () {
    assert.throws(function () {
      vips.call('banana');
    });
  });

  it('Needs at least one arg', function () {
    assert.throws(function () {
      vips.call();
    });
  });

  it('call("black", 10, 10) does not fail', function () {
    vips.call('black', 10, 10);
  });

  it('Throws an exception for too many args', function () {
    assert.throws(function () {
      vips.call('black', 10, 10, 20);
    });
  });

  it('Throws an exception for too few args', function () {
    assert.throws(function () {
      vips.call('black', 20);
    });
  });

  it('Allows final hash arg', function () {
    vips.call('black', 10, 10, {});
  });

  it('Final hash arg can have options', function () {
    vips.call('black', 10, 10, {bands: 2});
  });

  it('Throws an exception for unknown option', function () {
    assert.throws(function () {
      vips.call('black', 10, 10, {banana: 2});
    });
  });
});
