#!/usr/bin/env node

'use strict';

// regenerate the wrapper
// run with something like
//
// node-vips/example (master)$ ./gen-wrapper.js > x
// node-vips/example (master)$ mv x ../lib/autogen.js

var vips = require('..');

vips.generateWrappers();
