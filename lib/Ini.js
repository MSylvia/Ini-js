// Ini-js v2.0
//
// INI file parser supporting modified git-config syntax.
//
// Licensed under the MIT License
// Copyright 2012-14 Iván -DrSlump- Montes <drslump@pollinimini.net>
// with portions copyright 2014 Anyasia Lightbringer

(function(exports){

    /**
     * @constructor
     * @param {String} contents INI file contents to parse (optional)
     */
    function Ini(contents){
        this.sect = new Ini.Section(null);
        contents && this.parse(contents);
    }

    /**
     * Obtain the value of a property
     *
     * @param {String} key The key to get, format: [sect[:label].]property
     * @returns {Mixed}
     */
    Ini.prototype.get = function(key){
        var v, parts = key.split('.');

        key = parts.shift();
        v = this.sect.get(key);

        if (parts.length && v instanceof Ini.Section) {
            key = parts.join('.');
            v = v.get(key);
        }

        return v;
    };

    /**
     * Parse INI file contents
     *
     * @param {String} contents INI file contents
     */
    Ini.prototype.parse = function(contents) {
        var i, ln, m, key, val, sect, s, t, lab, prop = '',
            lines = contents.split(/\r\n|\r|\n/);

        sect = this.sect;
        for (i=0; i<lines.length; i++) {
            // First we trim the line
            ln = lines[i].replace(/^\s+/,'').replace(/\s+$/,'');
            
            // Detect section header
            // Moved section to first so malformed section checking can go after it
            if (ln.charAt(0) === '[') {
                m = /^\[([^"]+)("\s*(.*)")?\](\s*(#|;)(.*))?$/.exec(ln);
                if(m && m[0].length) {
                    lab = m[3] ? m[3].replace(/\\\\/g, '\\').replace(/\\"/g, '"') : null;
                    s = lab ? m[1] + ':' + lab : m[1];  // if the section already exists,
                    t = this.get(s);                    // resume using rather than overwrite it
                    sect = t instanceof Ini.Section ? t : this.section(m[1], lab || null, m[6] || null);
                } else {
                    sect = false;    // section is malformed
                }
                continue;
            }
            
            // Skip properties declared under malformed or invalid sections
            if(sect === false) {
                continue;
            }

            // Register empty lines
            if (ln.length === 0) {
                sect.line();
                continue;
            }

            // Detect whole line comments
            if (ln.charAt(0) === '#' || ln.charAt(0) === ';') {
                sect.comment(ln.substr(1).replace(/^\s+/,''));
                continue;
            }

            // Check if this line is continued on the next
            if (ln.charAt(ln.length-1) === '\\') {
                prop += ln.substr(0, ln.length-1);
                continue;
            }

            // Property
            prop = prop.length > 0 ? prop + ' ' + ln : ln;

            // Match property
            // NOTE: Does not support: prop = "foo" bar "baz"
            m = /^([^=]+?)(=\s*(".*"|[^;#]*))?(\s*(#|;)(.*))?$/.exec(prop);
            if (m && m[0].length) {
                key = m[1];
                if (m[3] && m[3].length) {
                    val = m[3];
                    
                   if (typeof val === 'string') {
                        val = val.replace(/\\\\/g, '\\')
                            .replace(/\\"/g, '"')
                            .replace(/\\n/g, '\n')
                            .replace(/\\t/g, '\t')
                            .replace(/\\b/g, '\b');
                    }

                } else if (m[2]) {
                    val = '';
                } else {
                    val = true;
                }

                sect.property(key, val, m[6] || null);
            }

            prop = '';
        }
    };

    /**
     * Convert Ini object to JavaScript/JSON object
     * 
     * @returns {Object}
     */
    Ini.prototype.toObject = function(){
        return this.sect.toObject();
    };

    /**
     * Output an Ini object as an INI file
     *
     * @returns {String}
     */
    Ini.prototype.toString = function(){
        return this.sect.toString().replace(/\n$/,''); // Remove trailing newline
    };
    
    /**
     * Creates an empty Ini.Section object with the given name and label,
     * or overwrites an existing one
     *
     * @param {String} name The section name
     * @param {String} label The section label, for creating subsections (optional)
     * @param {String} comment A comment to appear after the section header declaration (optional)
     * @returns {Mixed}
     *     On success, {Ini.Section}
     *     On failure, {Boolean} false
     */
    Ini.prototype.section = function(name, label, comment){
        if(name.indexOf(':') !== -1 && (!label || !comment)) {
            name = name.split(':');
            if(label && !comment) {
                comment = label;
            }
            label = name.pop();
            name = name.join(':');
        }
        name = name.toString().toLowerCase().replace(/^\s+|\s+$/g, ''); // trim, cast, and de-case name
        if(label) {
            label = label.toString().replace(/^\s+|\s+$/g, ''); // trim the label and cast as string
        }
        if(!/^[A-Za-z0-9.-]+$/.test(name)) {
            return false;
        }
        var section = new Ini.Section(name, label, comment);
        var s = label ? name + ':' + label : name;
        if(this.sect.get(s) !== null) {
            this.sect.items[this.sect.get(s, true)] = section;            
        } else {
            this.sect.add(section);
        }
        return section;
    };
    
    /**
     * Adds a full-line comment to an Ini object
     *
     * @param {String} text The comment text. A comment marker will be automatically
     *                      prepended when output to a string
     * @returns {Ini.Comment}
     */
    Ini.prototype.comment = function(text){
        return this.sect.comment(text);
    };

    /**
     * Adds a blank line to an Ini object
     *
     * @returns {Ini.EmptyLine}
     */
    Ini.prototype.line = function(){
        return this.sect.line();
    };
    
    /**
     * Creates an Ini.Property object with the given name and value,
     * or overwrites an existing one
     *
     * @param {String} name The property name
     * @param {Mixed} value The property value (optional)
     * @param {String} comment A comment to appear after the property declaration (optional)
     * @returns {Mixed}
     *     On success, {Ini.Property}
     *     On failure, {Boolean} false
     */
    Ini.prototype.property = function(name, value, comment){
        var s, parts = name.split('.');
        name = parts.pop();
        if(parts.length) {
            parts = parts.join('.');
            s = this.get(parts) || this.section(parts);
            return s.property(name, value, comment);
        } else {        
            return this.sect.property(name, value, comment);
        }
    };
    
    /**
     * Removes a property from an Ini object
     *
     * @param {String} prop The property to remove, format: [sect[:label].]property
     * @returns {Boolean} true on success, false on failure
     */
    Ini.prototype.remove = function(prop){
        var parts = prop.split('.');
        prop = parts.pop();
        if(parts.length) {
            parts = this.get(parts.join('.'));
            if(parts !== null) {
                return parts.remove(prop);
            } else {
                return false;
            }
        } else {        
            return this.sect.remove(prop);
        }
    };

    // Static properties
    
    /**
     * Parse INI file contents
     *
     * @param {String} contents INI file contents
     * @returns {Ini}
     */
    Ini.parse = function(contents){
        return new Ini(contents);
    };

    // Internal objects

    /**
     * @constructor
     * See documentation for Ini.prototype.section
     */
    Ini.Section = function(name, label, comment){
        this.key = this.name = name;
        this.label = label || null;
        this.items = [];

        if (label) {
            this.key += ':' + label;
        }
        
        if(comment) {
            this.comm = comment.replace(/^\s+|\s+$/g, '');
        }
    };

    /**
     * Add an item to a section's items array
     * 
     * @param {Mixed} item The item to add (internal)
     */
    Ini.Section.prototype.add = function(item){
        this.items.push(item);
    };
    
    /**
     * Obtain the value of a property, or the index at which a property exists within its parent array
     *
     * @param {String} key The key to get
     * @param {Boolean} returnIndex Whether to return the index of the property (true), or its value (false)
     *                              (optional; defaults to false) (internal)
     * @returns {Mixed}
     */
    Ini.Section.prototype.get = function(key, returnIndex){
        var i, itm, v, keySects;
        
        // Variables are case-insensitive
        // Section labels are not
        keySects = key.split(':');
        key = keySects[0].toLowerCase();
        if(keySects[1]) {
            keySects = keySects[1].split('.');
            key += ':' + keySects[0];
            if(keySects[1]) {
                key += '.' + keySects[1].toLowerCase();
            }
        }

        // Loop in reverse order so that duplicated keys are overriden
        i = this.items.length;
        while (i--) {
            itm = this.items[i];
            if (typeof itm.key !== 'undefined' && key === itm.key) {
                v = returnIndex ? i : itm;
                if (v instanceof Ini.Property) {
                    v = v.value;
                    if (typeof v === 'string' && v.charAt(0) === '"' && v.charAt(v.length-1) === '"') {
                        v = v.substr(1, v.length-2);
                    }
                }
                return v;
            }
        }

        return null;
    };
    
    /**
     * See documentation for Ini.prototype.comment
     */
    Ini.Section.prototype.comment = function(text){
        var comment = new Ini.Comment(text);
        this.add(comment);
        return comment;
    };
    
    /**
     * See documentation for Ini.prototype.line
     */
    Ini.Section.prototype.line = function(){
        var line = new Ini.EmptyLine();
        this.add(line);
        return line;
    };
    
    /**
     * See documentation for Ini.prototype.property
     */
    Ini.Section.prototype.property = function(name, value, comment){
        if(typeof value === 'string') {
            value = value.replace(/^\s+|\s+$/g, '');    // Trim value
        }
        name = name.toString().toLowerCase().replace(/^\s+|\s+$/g, ''); // trim, cast, and de-case name
        if(!/^[A-Za-z][A-Za-z0-9-]*$/.test(name)) {
            return false;
        }
        var prop = new Ini.Property(name, value, comment);
        if(this.get(name) !== null) {
            this.items[this.get(name, true)] = prop;            
        } else {
            this.add(prop);
        }
        return prop;
    };
    
    /**
     * See documentation for Ini.prototype.remove
     */
    Ini.Section.prototype.remove = function(prop) {
        if(this.get(prop) !== null) {
            this.items.splice(this.get(prop, true),1);
            return true;
        }
        return false;
    };
    
    /**
     * See documentation for Ini.prototype.toObject
     */
    Ini.Section.prototype.toObject = function(){
        var i, o = {}, items = this.items;

        for (i = 0; i < items.length; i++) {
            if (items[i] instanceof Ini.Section) {
                o[items[i].key] = items[i].toObject();
            }
            if (items[i] instanceof Ini.Property) {
                o[items[i].key] = items[i].value;
            }
        }
        return o;
    };
    
    /**
     * See documentation for Ini.prototype.toString
     */
    Ini.Section.prototype.toString = function(){
        var s = '',
            t = ''; // Ensure sectionless properties are added first!
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i] instanceof Ini.Section) {
                if (this.items[i].name !== null) {
                    s += '[' + this.items[i].name;
                    s += this.items[i].label !== null ? ' "' + this.items[i].label
                        .replace(/\\(?!("|\\))/g, '\\\\')
                        .replace(/\\?"/g, '\\"') + '"' : '';
                    s += ']';
                    s += this.items[i].comm ? ' ; ' + this.items[i].comm : '';
                    s += '\n';
                }
                s += this.items[i];
            } else {
                t += this.items[i] + '\n';
            }
        }
        return t + s;
    };

    /**
     * @constructor
     * See documentation for Ini.prototype.comment
     */
    Ini.Comment = function(text){
        this.text = text;
    };
    
    /**
     * See documentation for Ini.prototype.toString
     */
    Ini.Comment.prototype.toString = function(){
        return '; ' + this.text;
    };

    /**
     * @constructor
     * See documentation for Ini.prototype.line
     */
    Ini.EmptyLine = function(){
    };
    
    /**
     * See documentation for Ini.prototype.toString
     */
    Ini.EmptyLine.prototype.toString = function(){
        return '';
    };
    
    /**
     * @constructor
     * See documentation for Ini.prototype.property
     */
    Ini.Property = function(name, value, comment){
        this.key = this.name = name;
        if(typeof value === 'undefined' || value === null || (typeof value === 'string' && /^(yes|on|true)$/i.test(value))) {
            this.value = true;
        } else if (typeof value === 'string' && /^(no|off|false)$/i.test(value)) {
            this.value = false;
        } else if(!Array.isArray(value) && value - parseFloat(value) >= 0) {
            this.value = parseFloat(value);
        } else {
            value = value.toString();
            if ((-1 !== value.indexOf('#') || -1 !== value.indexOf(';')) && !(value.charAt(0) === '"' && value.charAt(value.length-1) === '"')) {
                value = '"' + value + '"';
            }
            this.value = value;
        }
        if(comment) {
            this.comment = comment.replace(/^\s+|\s+$/g, '');
        }
    };
    
    /**
     * See documentation for Ini.prototype.toString
     */
    Ini.Property.prototype.toString = function(){
        var val;
        if (this.value === false) {
            val = 'no';
        } else if (this.value === true) {
            val = 'yes';
        } else if(this.value !== null) { // Hopefully, anything that would result in null would already be
            val = this.value;            // assigned 'yes', but I'm leaving here regardless just in case
            if(typeof val === 'string') {
                val = val.replace(/\\(?!(b|n|t|"|\\|\n))/g, '\\\\')
                        .replace(/\\?"/g, '\\"')
                        .replace(/\\?\n/g, '\\\n')
                        .replace(/\t/g, '\\t');
                if (val.substr(0,2) === '\\"' && val.substr(val.length-2) === '\\"') {
                    val = '"' + val.substr(2,val.length-4) + '"'; // De-escape bounding quotes, if present
                }
            }
        }
        if(this.comment) {
            val += ' ; ' + this.comment;
        }
        return this.name + ' = ' + val;
    };

    // Export the class into the global namespace or for CommonJs
    exports.Ini = Ini;

})(typeof exports !== "undefined" ? exports : this);
