/**
 * Created by paul.watkinson on 18/08/2016.
 */

'use strict';

const STYLES = { };
const CODES = {
    'reset':         [ 0,  0],

    'bold':          [ 1, 22],
    'dim':           [ 2, 22],
    'italic':        [ 3, 23],
    'underline':     [ 4, 24],
    'inverse':       [ 7, 27],
    'hidden':        [ 8, 28],
    'strikethrough': [ 9, 29],

    'black':         [30, 39],
    'red':           [31, 39],
    'green':         [32, 39],
    'yellow':        [33, 39],
    'blue':          [34, 39],
    'magenta':       [35, 39],
    'cyan':          [36, 39],
    'white':         [37, 39],
    'gray':          [90, 39],
    'grey':          [90, 39],

    'bgBlack':       [40, 49],
    'bgRed':         [41, 49],
    'bgGreen':       [42, 49],
    'bgYellow':      [43, 49],
    'bgBlue':        [44, 49],
    'bgMagenta':     [45, 49],
    'bgCyan':        [46, 49],
    'bgWhite':       [47, 49]
};

let isEnabled = false;

/**
 * @constructor Colours
 */
var Colours = function() {
    if (this instanceof Colours) {
        throw Error('Colours should not be instantiated!');
    }
};

Object.defineProperties(Colours.prototype, {
    /**
     * Enables colouring of strings.
     */
    'enable': {
        'value': function() {
            isEnabled = true;
        }
    },

    /**
     * Disables colouring of strings.
     */
    'disable': {
        'value': function() {
            isEnabled = false;
        }
    },

    /**
     * Checks if a given stream is valid for using colour
     */
    'isValid': {
        'value': function(stream) {
            return !!stream.isTTY;
        }
    },

    /**
     * Returns the length, minus all the escape characters added from colouring,
     * giving you the visible length of the string.
     *
     * @returns {Number}
     */
    'visibleLength': {
        'get': (function() {
            const regex = /\u001b\[[0-9]+m/g;
            return function(str) {
                if (regex.test(str)) {
                    return str.replace(regex, '').length;
                }

                return str.length;
            };
        }())
    }
});

Object.defineProperties(String.prototype, {
    /**
     * Returns the length, minus all the escape characters added from colouring,
     * giving you the visible length of the string.
     *
     * @returns {Number}
     */
    'visibleLength': {
        'get': (function() {
            const regex = /\u001b\[[0-9]+m/g;
            return function() {
                if (regex.test(this)) {
                    return this.replace(regex, '').length;
                }

                return this.length;
            };
        }())
    }
});

for (let key in CODES) {
    if (!CODES.hasOwnProperty(key)) {
        continue;
    }

    let value = CODES[key];
    STYLES[key] = {
        'open': `\u001b[${value[0]}m`,
        'close': `\u001b[${value[1]}m`
    };

    if (String.prototype[key] == null) {
        const style = STYLES[key];

        Object.defineProperty(Colours.prototype, key, {
            /**
             * Returns a colour formatted string
             *
             * @param {String} str The string to format with colour
             * @returns {String}
             */
            'value': function(str) {
                if (!isEnabled) {
                    return str;
                }

                return style.open + str + style.close;
            }
        });

        Object.defineProperty(String.prototype, key, {
            /**
             * @returns {String} The string, surrounded in the required colour markers
             */
            'get': function() {
                if (!isEnabled) {
                    return this;
                }

                return style.open + this + style.close;
            }
        });
    }
}

module.exports = Colours;
