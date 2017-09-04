'use strict';

console.log('hello from unit/init.js');

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const vips = require('../../');

describe('Init', function () {
    it('Can make a GValue', function () {
        var gv = new vips.gvalue.GValue()
    });

    it('Can set/get a bool GValue', function () {
        var gv = new vips.gvalue.GValue()
        gv.init(vips.gvalue.GTYPE.gbool);
        gv.set(true);
        assert.strictEqual(gv.get(), true);
    });

});
