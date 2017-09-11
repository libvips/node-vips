'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const vips = require('../../');

describe('Operation', function () {
    beforeEach(function () {
        if ('gc' in global) {
            console.log("gc-ing");
            global.gc();
        }
    });

    it('Can make a Operation', function () {
        var op = vips.Operation.new_from_name('black');
    });

    it('Throws an exception for unknown operation', function () {
        assert.throws(function () {
            vips.Operation.new_from_name('banana');
        });
    });

    it('Can get an operation\'s args', function () {
        var op = vips.Operation.new_from_name('black');
        var args = op.get_args();
        assert.strictEqual(args.length, 4);
        assert.strictEqual(args[0][0], 'out');
        assert.strictEqual(args[0][1], 35);
    });

    it('Can get an operation\'s flags', function () {
        var op = vips.Operation.new_from_name('black');
        var flags = op.get_flags();
        assert.strictEqual(flags, 0);
    });

    it('call throws an exception for unknown operation', function () {
        assert.throws(function () {
            vips.call('banana');
        });
    });

    it('call needs at least one arg', function () {
        assert.throws(function () {
            vips.call();
        });
    });

    it('call("black", 10, 10) does not fail', function () {
        var image = vips.call('black', 10, 10);
    });

    it('call throws an exception for too many args', function () {
        assert.throws(function () {
            var image = vips.call('black', 10, 10, 20);
        });
    });

    it('call throws an exception for too few args', function () {
        assert.throws(function () {
            var image = vips.call('black', 20);
        });
    });

    it('call allows final hash arg', function () {
        var image = vips.call('black', 10, 10, {});
    });

    it('final hash arg can have options', function () {
        var image = vips.call('black', 10, 10, {bands: 2});
    });

    it('call throws an exception for unknown option', function () {
        assert.throws(function () {
            var image = vips.call('black', 10, 10, {banana: 2});
        });
    });

});
