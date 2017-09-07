'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const vips = require('../../');

describe('VipsOperation', function () {
    it('Can make a VipsOperation', function () {
        var op = new vips.VipsOperation('black');
    });

    it('Throws an exception for unknown operation', function () {
        assert.throws(function () {
            new vips.VipsOperation('banana');
        });
    });

});
