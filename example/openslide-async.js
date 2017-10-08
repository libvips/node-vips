#!/usr/bin/env node

'use strict';

var vips = require('..');

// get a rect from a level
// autocrop trims off pixels outside the image bounds
vips.Image.openslideload(process.argv[2], {
  level: 2,
  autocrop: true,
  async: (err, image) => {
    if (err) {
      throw err;
    }

    console.log('level size:', image.width, 'x', image.height);

    // try 'vipsheader -a somefile.svs' at the command-line to see all the
    // metadata fields you can get
    console.log('associated images are:', image.get('slide-associated-images'));

    // crop is left, top, width, height in pixels
    // images are RGBA with premultiplication taken out
    image.crop(100, 100, 1000, 1000).writeToFile('x.png', {async: (err) => {
      if (err) {
        throw err;
      }
    }});
  }
});

// extract an associated image
vips.Image.openslideload(process.argv[2], {
  associated: 'label',
  async: (err, image) => {
    if (err) {
      throw err;
    }

    image.writeToFile('label.png', {async: (err) => {
      if (err) {
        throw err;
      }
    }});
  }
});
