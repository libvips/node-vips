#!/usr/bin/env node

var fs = require('fs');
var vips = require('..');

// benchmark thumbnail via a memory buffer
function via_memory(filename, thumbnail_width) {
    console.log('memory processing', filename);

    var data = fs.readFileSync(filename);
    var thumb = vips.Image.thumbnail_buffer(data, thumbnail_width, 
        {crop: 'centre'});

    return thumb.write_to_buffer('.jpg');
}

// benchmark thumbnail via files
function via_files(filename, thumbnail_width) {
    console.log('file processing', filename);

    var thumb = vips.Image.thumbnail(filename, thumbnail_width, 
        {crop: 'centre'})

    return thumb.write_to_buffer('.jpg');
}

// disable the libvips operation cache .. it won't help for huge batch runs like
// this
vips.cache_set_max(0);

for (var i = 2; i < process.argv.length; i++) {
    // var thumb = via_memory(process.argv[i], 500)
    var thumb = via_files(process.argv[i], 500)
}

