/* global it, describe, beforeEach */

'use strict';

const assert = require('assert');
const vips = require('../../');

describe('Relational operators', function () {
  beforeEach(function () {
    if ('gc' in global) {
      console.log('gc-ing');
      global.gc();
    }
  });

  it('.more works with scalar, vector and image arguments', function () {
    var image = vips.Image.black(2, 1).add(10);
    var image2;

    image2 = image.more(9);
    assert.strictEqual(image2.width, 2);
    assert.strictEqual(image2.height, 1);
    assert.strictEqual(image2.format, 'uchar');
    assert.deepEqual(image2.getpoint(0, 0), [255]);
    image2 = image.more(10);
    assert.deepEqual(image2.getpoint(0, 0), [0]);

    image = vips.Image.black(2, 1).add([10, 20]);
    image2 = image.more([5, 30]);
    assert.strictEqual(image2.width, 2);
    assert.strictEqual(image2.height, 1);
    assert.strictEqual(image2.format, 'uchar');
    assert.deepEqual(image2.getpoint(0, 0), [255, 0]);

    image = vips.Image.black(2, 1).add(10);
    image2 = image.more(image.add(20));
    assert.strictEqual(image2.width, 2);
    assert.strictEqual(image2.height, 1);
    assert.strictEqual(image2.format, 'uchar');
    assert.deepEqual(image2.getpoint(0, 0), [0]);
  });

    // no need to test the others so carefully, we've got call_enum done now

  it('.less works', function () {
    var image = vips.Image.black(2, 1).add([10, 11, 12]);
    var image2 = image.less([9, 11, 13]);
    assert.deepEqual(image2.getpoint(0, 0), [0, 0, 255]);
  });

  it('.moreeq works', function () {
    var image = vips.Image.black(2, 1).add([10, 11, 12]);
    var image2 = image.moreeq([9, 11, 13]);
    assert.deepEqual(image2.getpoint(0, 0), [255, 255, 0]);
  });

  it('.lesseq works', function () {
    var image = vips.Image.black(2, 1).add([10, 11, 12]);
    var image2 = image.lesseq([9, 11, 13]);
    assert.deepEqual(image2.getpoint(0, 0), [0, 255, 255]);
  });

  it('.equal works', function () {
    var image = vips.Image.black(2, 1).add([10, 11, 12]);
    var image2 = image.equal([9, 11, 13]);
    assert.deepEqual(image2.getpoint(0, 0), [0, 255, 0]);
  });

  it('.noteq works', function () {
    var image = vips.Image.black(2, 1).add([10, 11, 12]);
    var image2 = image.noteq([9, 11, 13]);
    assert.deepEqual(image2.getpoint(0, 0), [255, 0, 255]);
  });
});
