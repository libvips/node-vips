#!/usr/bin/env node

'use strict';

var vips = require('..');

var width = 500;
var height = 500;

console.log('making pattern ...');

// allocate array
var array = [];
for (let j = 0; j < 3; j++) {
  let y = new Array(height);
  for (let i = 0; i < height; i++) {
    y[i] = new Array(width);
  }
  array[j] = y;
}

// fill with a pattern
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    for (let b = 0; b < 3; b++) {
      array[b][y][x] = ((b + 1) * (x + y)) % 255;
    }
  }
}

console.log('starting image build ...');

var start = process.hrtime();

// make a vips image from each band, join the bands to make an RGB image
var bands = [];
for (let b = 0; b < 3; b++) {
  bands[b] = vips.Image.newFromArray(array[b]);
}
var image = bands[0].bandjoin([bands[1], bands[2]]);

// that will be a float image: cast to uchar (8 bit) ready for save
image = image.cast('uchar');

// save as a GIF using libMagick
console.log('writing to ' + process.argv[2] + ' ...');
image.magicksave(process.argv[2], {format: 'GIF'});

var time = process.hrtime(start);

console.log('took ' + (time[0] * 1000 + time[1] / 1000000) + 'ms');
