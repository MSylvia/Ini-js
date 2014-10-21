# Ini-js

Ini-js is an [INI file](http://en.wikipedia.org/wiki/INI_file) parser which (loosely) follows the git-config flavor. It should work on most JavaScript environments, but is developed and optimized for TideSDK and web browsers.

This repository was forked from [drslump/Ini-js](https://github.com/drslump/Ini-js) 14 October 2014.

## Supported Syntax

The supported syntax is available at the [git-config man page](http://linux.die.net/man/1/git-config), with some exceptions:

* Ini-js does not support `prop = "foo" bar "baz"` syntax, nor multivalued variables generally. Existing variables declared with a new value will be overwriten.
* Ini-js does not support git-config's `[section.subsection]` subsection declaration syntax, only `[section "subsection"]`.
* Ini-js *does* support variables declared outside of a section. These variables are considered to be in a `null` section, and must appear before any and all sections (when parsed; they can, however, be added programatically at any point).
 * Because of this, no section name may be identical to a variable outside of a section. Sections added with the name of an existing `null`-section variable will overwrite the existing variable, and vice versa.
* Sections declared multiple times will not be overwritten, but will be counted as a single section per the git-config spec. However, they will be merged into a single section if the Ini object is later converted back to a string.
 * Existing sections which are re-declared with `Ini.section()`, however, *will* overwrite the existing section. Because of this, it is recommended to set variables with `Ini.property()` if you are unsure whether the section already exists, as this will utilize a section if it exists, or create one if it does not.
* Comments which are declared under a section header will be considered to be part of that section. As such, comments which annotate sections may lose meaning if they are declared before the section header if variables are later added to the section preceding it, either programmatically or through re-declared section headers.
* `0` and `1` will be considered integers by the program. These will still evaluate as truthy and falsey when checked using `==`; however, this also means that a `0` meant to represent an integer will return `false` if not properly checked—the same as either a boolean value or a non-existant property (which will return the falsey `null`). As such, care should be taken when checking the value or existence of variables.

It is important to note that the above syntax indicates only the supported *parsing* syntax. **The syntax of an INI file created by calling `Ini.toString()` is guaranteed to be parsable, but may not be identical to the syntax of the file originally provided.** Notably, while variables with comments following them will be parsed properly, the comment will be stripped and will not be retained if the Ini object is later converted back to a string. Furthermore, the boolean values `false` and `off` will be converted to `no` by `Ini.toString()`, while `true` and `on`, as well as variables specified without a value, will be converted to `yes`.

### Additional notes

* End-of-line comments cannot be created programmatically, only full-line comments.
* In compliance with the git-config spec, only strings, integers, and booleans are allowed as value types. Values declared as `null`, or created programmatically with `null` declared as a string, will be strings. Values created programmatically with `null` declared *as null* will be `true`. Numbers other than integers will be strings.


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
