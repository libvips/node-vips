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

});
