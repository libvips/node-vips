#!/usr/bin/env node

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
var vips = require('..');

// benchmark thumbnail via a memory buffer
function viaMemory (filename, thumbnailWidth) {
  var data = fs.readFileSync(filename);

  var thumb = vips.Image.thumbnail_buffer(data, thumbnailWidth,
        {crop: 'centre'});

  return thumb.writeToBuffer('.jpg');
}

/*
// benchmark thumbnail via files
function viaFiles (filename, thumbnailWidth) {
  var thumb = vips.Image.thumbnail(filename, thumbnailWidth, {crop: 'centre'});

  return thumb.writeToBuffer('.jpg');
}
 */

for (var i = 2; i < process.argv.length; i++) {
  var filename = process.argv[i];

  console.log('processing' + filename + ', n_object = ' + vips.n_objects);
  viaMemory(filename, 500);
  // var thumb = viaFiles(filename, 500)
}
