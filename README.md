# Experimental node.js binding for libvips built on ffi

# Status

It's mostly complete, it seems stable, and it passes the tests suite with no
errors or leaks. 

# Example

```javascript
var vips = require('vips');

var image = vips.Image.new_from_file(process.argv[2]);
image = image.crop(100, 100, image.width - 200, image.height - 200);

image = image.reduce(1.0 / 0.9, 1.0 / 0.9, {kernel: 'linear'});

var mask = vips.Image.new_from_array(
    [[-1,  -1, -1], 
     [-1,  16, -1], 
     [-1,  -1, -1]], 8);
image = image.conv(mask, {precision: 'integer'});

image.write_to_file(process.argv[3]);
```

# References

https://github.com/node-ffi/node-ffi

https://github.com/TooTallNate/ref

https://github.com/TooTallNate/ref-array

https://github.com/TooTallNate/ref-struct

https://github.com/TooTallNate/weak

https://github.com/node-ffi/node-ffi/wiki/Node-FFI-Tutorial

# Actions

Install everything

	npm install 

Run the unit tests experimentally

	npm run-script unit

Run a single test with the GC enabled

	./node_modules/.bin/mocha --expose-gc test/unit/image.js 

Regenerate convenience wrappers

	vips = require('vips')
	vips.generate_wrappers()

and copy output to `lib/autogen.js`.
