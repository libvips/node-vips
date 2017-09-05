'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const vips = require('../../');

describe('GValue', function () {
    it('Can make a GValue', function () {
        var gv = new vips.GValue()
    });

    it('Can set/get a bool GValue', function () {
        var gv = new vips.GValue()
        gv.init(vips.GTYPES.gbool);
        gv.set(true);
        assert.strictEqual(gv.get(), true);
    });

    it('Can set/get a int GValue', function () {
        var gv = new vips.GValue()
        gv.init(vips.GTYPES.gint);
        gv.set(12);
        assert.strictEqual(gv.get(), 12);
    });

    it('Can set/get a double GValue', function () {
        var gv = new vips.GValue()
        gv.init(vips.GTYPES.gdouble);
        gv.set(3.1415);
        assert.strictEqual(gv.get(), 3.1415);
    });

    it('Can set/get a string GValue', function () {
        var gv = new vips.GValue()
        gv.init(vips.GTYPES.gstr);
        gv.set("hello world");
        assert.strictEqual(gv.get(), "hello world");
    });

    it('Can set/get a utf-8 string GValue', function () {
        var gv = new vips.GValue()
        gv.init(vips.GTYPES.gstr);
        gv.set("йцук");
        assert.strictEqual(gv.get(), "йцук");
    });

    it('Can set/get an array of int GValue', function () {
        var gv = new vips.GValue()
        gv.init(vips.GTYPES.array_int);
        gv.set([1, 2, 3]);
        assert.deepEqual(gv.get(), [1, 2, 3]);
    });

    it('Can set/get an array of double GValue', function () {
        var gv = new vips.GValue()
        gv.init(vips.GTYPES.array_double);
        gv.set([1.1, 2.1, 3.1]);
        assert.deepEqual(gv.get(), [1.1, 2.1, 3.1]);
    });

});
