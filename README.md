# Ini-js

Ini-js is an [INI file](http://en.wikipedia.org/wiki/INI_file) parser which (loosely) follows the git-config flavor. It should work on most JavaScript environments, but is developed and optimized for TideSDK and web browsers.

This repository was forked from [drslump/Ini-js](https://github.com/drslump/Ini-js) 14 October 2014.

## Supported Syntax

The supported syntax is available at the [git-config man page](http://linux.die.net/man/1/git-config), with some exceptions:

* Ini-js does not support `prop = "foo" bar "baz"` syntax.
* Ini-js does not support git-config's `[section.subsection]` subsection declaration syntax, only `[section "subsection"]`.
* Ini-js does not support multivalued variables: existing properties declared with a new value will be overridden.
* Ini-js *does* support variables declared outside of a section. These variables are considered to be in a `null` section, and must appear before any and all sections (when parsed; they can, however, be added programatically at any point).
* * Because of this, no section name may be identical to a variable outside of a section. Sections added with the name of an existing `null`-section variable will override the existing variable, and vice versa.


## Example

    // Create a new parser 
    var ini = new Ini();

    ini.parse([
        'prop = value',
        '[sect]',
        'foo = bar',
        'baz = yes',
        '[sect "label"]',
        'foo = "bar"',
        'baz = off'
    ].join('\n'));

    ini.get('prop');           // value
    ini.get('sect.foo');       // bar
    ini.get('sect:label.baz'); // false

    ini.toObject();            // {prop: value, sect: { foo: bar, baz: true } ...}
    ini.toString();            // Generates back the ini file
    
    // You can also modify or build an INI file programatically
    var sect = ini.section('newsect', 'mylabel');
    sect.comment('My comment');
    sect.property('foo', 'bar');


## License

Ini-js is licensed under the MIT License.

    Copyright © 2012 Iván -DrSlump- Montes
    with portions copyright © 2014 Anyasia Lightbringer

    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    'Software'), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
    IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
    CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
    TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
    SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
