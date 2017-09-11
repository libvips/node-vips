# Experimental node.js binding for libvips built on ffi

# Status

It's sort-of working, it can run stuff like this:

```javascript
vips = require('vips');

var image = vips.Image.new_from_file('k2.jpg');

var image = vips.Image.new_from_file('k2.jpg', {shrink: 2});

var pixel = Image.black(1, 1).add(value).cast(this.format);
var image = pixel.embed(0, 0, this.width, this.height,
    {extend: 'copy'});
image = image.copy({
    interpretation: this.interpretation,
    xres: this.xres,
    yres: this.yres,
    xoffset: this.xoffset,
    yoffset: this.yoffset
});
```

With no leaks or memory errors. It has a set of 60 or so unit tests which all
pass. 

There's still a lot missing. 

# See also

This is based (mostly) on lua-vips, since Lua and JS are rather similar:

https://github.com/jcupitt/lua-vips

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

and paste output into lib/autogen.js
