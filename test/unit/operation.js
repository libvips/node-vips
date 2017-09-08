'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const vips = require('../../');

describe('Operation', function () {
    it('Can make a Operation', function () {
        var op = new vips.Operation('black');
    });

    it('Throws an exception for unknown operation', function () {
        assert.throws(function () {
            new vips.Operation('banana');
        });
    });

    it('Can get an operation\'s args', function () {
        var op = new vips.Operation('black');
        var args = op.get_args();
        assert.strictEqual(args.length, 4);
        assert.strictEqual(args[0][0], 'out');
        assert.strictEqual(args[0][1], 35);
    });

});
