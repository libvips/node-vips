#!/usr/bin/env node

'use strict';

/*
 * Thumbnail many images, either from a file source or memory buffer.
 *
 * It runs in a fairly steady 1gb of ram for me. Watching the output, you see
 * stuff like:
 *
 * file processing /data/john/pics/sample/7350.jpg
 * (2896 vips objects known to node-vips)
 * file processing /data/john/pics/sample/7351.jpg
 * (6 vips objects known to node-vips)
 * file processing /data/john/pics/sample/7352.jpg
 * (11 vips objects known to node-vips)
 * file processing /data/john/pics/sample/7353.jpg
 * (16 vips objects known to node-vips)
 *
 * So when around 3000 vips objects are alive, the node gc runs and they all get
 * flushed.
 *
 * If you want it to run in less ram than that, you'll need to expose the gc and
 * trigger it manually every so often.
 */

var fs = require('fs');
var async = require('async');
var vips = require('..');

function thumbnail (filename, thumbnailWidth, callback) {
  var data = fs.readFileSync(filename);

  var thumb = vips.Image.thumbnailBuffer(data, thumbnailWidth, {crop: 'centre'});

  thumb.writeToBuffer('.jpg', {async: callback});
}

var tasks = async.map(process.argv.slice(2), (filename, callback) => {
  console.log('processing' + filename + ', nObjects = ' + vips.nObjects);
  thumbnail(filename, 500, callback);
});

async.parallelLimit(tasks, 10, function (err, result) {
  if (err) {
    throw new Error(err);
  }

  console.log('result.width = ' + result.width);
});
