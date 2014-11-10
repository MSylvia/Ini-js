# Ini-js

Ini-js is an [INI file](http://en.wikipedia.org/wiki/INI_file) parser which (loosely) follows the git-config flavor. It should work in most JavaScript environments, but is developed and optimized for TideSDK and web browsers.

This repository was forked from [drslump/Ini-js](https://github.com/drslump/Ini-js) 14 October 2014.

## Supported Syntax

The supported syntax is available at the [git-config man page](https://www.kernel.org/pub/software/scm/git/docs/git-config.html), with some exceptions:

* Ini-js does not support `prop = "foo" bar "baz"` syntax, nor multivalued variables generally. Existing variables declared with a new value will be overwriten.
* Ini-js does not support the deprecated `[section.subsection]` subsection declaration syntax, only `[section "subsection"]`.
* Ini-js *does* support variables declared outside of a section. These variables are considered to be in a `null` section, and must appear before any and all sections (when parsed; they can, however, be added programatically at any point).
 * Because of this, no section name may be identical to a variable outside of a section. Sections added with the name of an existing `null`-section variable will overwrite the existing variable, and vice versa.
* All numbers, not only integers, will be returned with the `number` type. This includes numbers defined as strings (unless encapsulated in "double quotes"), expontential-notation numbers (`8e50`), hexadecimal integers (`0xFF`), and signed numbers (`-10`, `+10.5`), but does *not* include `NaN` or `Infinity`, which are returned as strings.
* `0` and `1` will be considered numbers by the program. As normal in JavaScript, these will be truthy and falsey when evaluated in a conditional; however, this also means that a `0` meant to represent an integer will return `false` if not properly checked—the same as either a boolean value or a non-existent property (which will return the falsey `null`). As such, care should be taken when checking the value or existence of variables.
* While the escape sequence `\b` will be properly parsed to a backspace character, backspace characters will *not* be escaped to `\b` when being added to an Ini object or output to a string.
* Per the git-config spec, `"` and `\` must be escaped as `\"` and `\\` respectively, and lines containing the comment-markers `;` or `#` must be wrapped in double quotes. When building programmatically, you *may* escape `"` yourself; however, it will be automatically escaped when `Ini.toString()` is called if left unescaped. Similarily, linrd containing comment-markers will be automatically encapsulated in double quotes. As with all JavaScript, however, a backslash *must* be escaped as `\\`, as the JavaScript parser will otherwise assume an attempt to escape the subsequent character.

It is important to note that the above syntax indicates only the supported *parsing* syntax. **The syntax of an INI file created by calling `Ini.toString()` is guaranteed to be parsable, but may not be identical to the syntax of the file originally provided.** Notably, the following discrepancies may occur between a parsed or created line and the way it is presented when converted to a string:

* Comments will always be declared with a `;` even if they were originally declared with a `#`.
* The boolean values `false` and `off` will be converted to `no` by `Ini.toString()`, while `true` and `on`, as well as variables specified without a value, will be converted to `yes`.
* All variables and section names (but not section labels) will be converted to lowercase. As they are case-insensitive, however, you may access them in their original capitalizations.

### Additional notes

* Per the git-config spec, `null` is not a valid value. A variable with a value declared as `null` will have that value as a string. Variables created programmatically with a value of `null` will be `true`, unless it is passed as a string.
* Sections declared multiple times will not be overwritten, but will be counted as a single section per the git-config spec. However, they will be merged into a single section if the Ini object is later converted back to a string.
 * Existing sections which are re-declared with `Ini.section()`, however, *will* overwrite the existing section. Because of this, it is recommended to set variables with `Ini.property()` if you are unsure whether the section already exists, as this will utilize a section if it exists, or create one if it does not.
 * An end-of-line comment on a re-declared section header will be discarded.
* Comments which are declared under a section header will be considered to be part of that section. As such, comments which annotate sections may lose meaning if they are declared before the section header if variables are later added to the section preceding it, either programmatically or through re-declared section headers.
* Arrays and objects passed as values will have `.toString()` called on them before being parsed, as neither are valid types under the git-config spec. By default, `Array.toString()` is equivalent to `Array.join()` and `Object.toString()` returns `[object Object]`.


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
