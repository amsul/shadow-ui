(function() { 'use strict';


/**
 * Construct an input object.
 */
shadow('input', {

    formats: null,
    attrs: {
        value: null,
        allowMultiple: null,
        allowRange: null,
        format: null,
        formatMultiple: '{, |, }', // <before first>{<before middle>|<before last>}<after last>
        formatRange: '{ - }' // <before from>{<before to>}<after to>
    },

    $input: null,


    /**
     * Create an input object.
     */
    create: function(options) {

        // Construct the shadow input.
        var input = this._super(options)

        // Setup the formatting attributes based on the options.
        setupFormattingAttributes(input, options)

        // Make sure we have a valid source element.
        if ( input.$el[0].nodeName != 'INPUT' ) {
            throw new TypeError('To create a shadow input, ' +
                'the `$el` must be an input element.')
        }

        // If a format is expected, the must be formatters available.
        if ( input.attrs.format && !input.formats ) {
            throw new TypeError('The `formats` hash map is required.')
        }

        // When there are formats, prepare it to be format-able.
        if ( input.formats ) {

            // Make sure the element has a format for the value.
            if ( !input.attrs.format ) {
                throw new TypeError('The `format` attribute is required.')
            }

            // Prevent adding/removing more formats.
            Object.seal(input.formats)
        }

        // Set the input element.
        shadow._.define(input, '$input', input.$el)

        // When the attribute value is set, update
        // the element value after formatting.
        input.on('set:value.' + input.id, function(event) {
            input.$input[0].value = input.convertAttrToValue(event.value)
        })

        // When the element value is set, update
        // the attribute value after parsing.
        input.$input.on('input.' + input.id, function() {
            input.attrs.value = input.convertValueToAttr(this.value)
        })

        // Set the starting value.
        if ( input.attrs.value ) {
            input.attrs.value = input.attrs.value
        }
        else {
            input.$input.triggerHandler('input.' + input.id)
        }

        // Return the new input object.
        return input
    }, //create


    /**
     * Convert an attribute value into a formatted string.
     */
    convertAttrToValue: function(value) {

        var input = this

        var formatValueUnit = function(valueUnit) {

            var formatsHash = input.formats

            if ( !formatsHash ) {
                return typeof valueUnit == 'object' ?
                    JSON.stringify(valueUnit) : valueUnit
            }

            return toFormattingArray(input.attrs.format, formatsHash).
                map(function(chunk) {
                    return chunk.f ?
                        formatsHash[chunk.f](valueUnit) :
                        chunk
                }).
                join('')
        }

        // If multiple values are allowed, setup the combo formatter.
        if ( input.attrs.allowMultiple === true ) {
            return formatMultipleUnits(
                formatValueUnit,
                input.attrs.formatMultiple,
                input.attrs.formatRange,
                value
            )
        }

        // If range values are allowed, setup the range formatter.
        if ( input.attrs.allowRange === true ) {
            return formatRangeUnits(
                formatValueUnit,
                input.attrs.formatRange,
                value
            )
        }

        // Otherwise just format it as a single unit.
        return formatValueUnit(value)
    },


    /**
     * Convert a formatted string into a parsed attribute value.
     */
    convertValueToAttr: function(value) {

        if ( typeof value != 'string' ) {
            throw new TypeError('An input expects it’s ' +
                'element value to be a string.')
        }

        var input = this
        var parseValueUnit = function(valueUnit) {

            // If there are formats, decorate the value unit as needed.
            if ( input.formats ) {

                // Create a parsed hash from the string value.
                var parsedHash = input.convertValueToParsedHash(valueUnit)

                // Convert the hash into an attribute value.
                valueUnit = input.convertParsedHashToAttr(parsedHash)
            }

            // Try to evaluate it as JSON.
            try {
                valueUnit = JSON.parse(valueUnit)
            } catch (e) {}

            return valueUnit
        }

        // If multiple values are allowed, setup the combo parser.
        if ( input.attrs.allowMultiple === true ) {
            return parseMultipleUnits(
                parseValueUnit,
                input.attrs.formatMultiple,
                input.attrs.formatRange,
                value
            )
        }

        // If range values are allowed, setup the range parser.
        if ( input.attrs.allowRange === true ) {
            return parseRangeUnits(
                parseValueUnit,
                input.attrs.formatRange,
                value
            )
        }

        // Otherwise just parse it as a single unit.
        return parseValueUnit(value)
    },


    /**
     * Convert a formatted string into a parsed hash.
     */
    convertValueToParsedHash: function(value) {

        var input = this
        var formatsHash = input.formats
        var parsedHash = {}

        // If there are formats, parse the value.
        if ( formatsHash ) {
            toFormattingArray(input.attrs.format, formatsHash).
                forEach(function(chunk) {
                    if ( chunk.f ) {
                        var chunkValue = formatsHash[chunk.f](value, true)
                        if ( !value.match(new RegExp('^' + chunkValue)) ) {
                            throw new SyntaxError('The value parsed by the ' +
                                '`' + chunk.f + '` formatting rule did not ' +
                                'match the value being parsed.\n' +
                                'Value being parsed: “' + value + '”.\n' +
                                'Rule parsed value: “' + chunkValue + '”.');
                        }
                        value = value.slice(chunkValue.length)
                        parsedHash[chunk.f] = chunkValue
                    }
                    else {
                        value = value.replace(new RegExp('^' + chunk), '')
                    }
                })
        }

        return parsedHash
    },


    /**
     * Convert a formatting hash into an attribute value.
     */
    convertParsedHashToAttr: function(value) {
        return value
    }

}) //shadow('input')


/**
 * Set up the input’s formatting attributes based on the options.
 */
function setupFormattingAttributes(input, options) {
    if ( !options.attrs.allowMultiple ) {
        input.attrs.formatMultiple = null
    }
    if ( !options.attrs.allowRange ) {
        input.attrs.formatRange = null
    }
}


/**
 * Format multiple units of value.
 */
function formatMultipleUnits(formatter, formatMultiple, formatRange, value) {

    if ( !Array.isArray(value) ) {
        throw new TypeError('An input with multiple values ' +
            'expects it’s attribute value to be a collection.')
    }

    var matchCombo = formatMultiple.match(/(.*)\{(.*?)\|(.*?)\}(.*)/)
    var beforeFirst = matchCombo[1]
    var beforeMiddle = matchCombo[2]
    var beforeLast = matchCombo[3]
    var afterLast = matchCombo[4]

    value = value.map(function(unit, index) {
        var before = index === 0 ? beforeFirst :
            index === value.length - 1 ? beforeLast :
            beforeMiddle
        var after = index === value.length - 1 ? afterLast : ''
        if ( formatRange && Array.isArray(unit) ) {
            unit = formatRangeUnits(formatter, formatRange, unit)
        }
        else {
            unit = formatter(unit)
        }
        return before + unit + after
    })

    return value.join('')
}


/**
 * Format a range’s units.
 */
function formatRangeUnits(formatter, format, rangeUnit) {

    var matchRange = format.match(/(.*)\{(.*?)\}(.*)/)
    var beforeLower = matchRange[1]
    var beforeUpper = matchRange[2]
    var afterUpper = matchRange[3]

    rangeUnit = rangeUnit.map(function(subItem, subIndex) {
        var subBefore = subIndex === 0 ? beforeLower : beforeUpper
        var subAfter = subIndex === rangeUnit.length - 1 ? afterUpper : ''
        return subBefore + formatter(subItem) + subAfter
    })

    return rangeUnit.join('')
}


/**
 * Parse multiple units of value.
 */
function parseMultipleUnits(parser, formatMultiple, formatRange, value) {

    var values = []

    // If there’s no value, stop right here.
    if ( !value ) {
        return values
    }

    var addToCollection = function(string, stringBefore, stringAfter) {
        var originalString = string
        string = sliceUptoUnit(string, stringBefore)
        var unit = sliceUnit(string, stringAfter)
        if ( unit ) {
            string = string.replace(unit, '')
            if ( formatRange ) {
                unit = parseRangeUnits(parser, formatRange, unit)
            }
            if ( typeof unit == 'string' ) {
                unit = parser(unit)
            }
            values.push(unit)
            return string
        }
        return originalString
    }

    var matchCombo = formatMultiple.match(/(.*)\{(.*?)\|(.*?)\}(.*)/)
    var regStrBeforeFirst = matchCombo[1]
    var regStrBeforeMiddle = matchCombo[2]
    var regStrBeforeLast = matchCombo[3]
    var regStrAfterLast = matchCombo[4]

    var safety = 100

    value = addToCollection(value, regStrBeforeFirst, regStrBeforeMiddle)

    while ( safety && value ) {
        if ( !--safety ) {
            throw 'Fell into an infinite loop..'
        }
        var originalValue = value
        value = addToCollection(value, regStrBeforeMiddle, regStrBeforeMiddle)
        if ( value === originalValue ) {
            value = addToCollection(value, regStrBeforeMiddle, regStrBeforeLast)
        }
        if ( value === originalValue ) {
            value = addToCollection(value, regStrBeforeLast, regStrAfterLast)
            break
        }
    }

    value = addToCollection(value, regStrBeforeLast, regStrAfterLast)

    return values
}


/**
 * Parse a range’s units.
 */
function parseRangeUnits(parser, format, value) {

    var range = []

    // If there’s no value, stop right here.
    if ( !value ) {
        return range
    }

    var addToCollection = function(rangeUnit) {
        var originalvalueUnit = rangeUnit
        rangeUnit = parser(rangeUnit)
        range.push(rangeUnit)
        if ( typeof rangeUnit == 'string' ) originalvalueUnit = rangeUnit
        value = value.replace(originalvalueUnit, '')
    }

    var matchRange = format.match(/(.*)\{(.*?)\}(.*)/)
    var regStrBeforeStart = matchRange[1]
    var regStrBeforeEnd = matchRange[2]
    var regStrAfterEnd = matchRange[3]

    value = sliceUptoUnit(value, regStrBeforeStart)

    var valueUnit = sliceUnit(value, regStrBeforeEnd)

    // If there’s no unit value, stop right here.
    if ( !valueUnit ) {
        return value
    }

    addToCollection(valueUnit)

    value = sliceUptoUnit(value, regStrBeforeEnd)
    valueUnit = sliceUnit(value, regStrAfterEnd)

    if ( valueUnit ) {
        addToCollection(valueUnit)
    }

    return range
}


/**
 * Escape any regular expression special characters.
 */
function escapeRegString(string) {
    return string.replace(/[\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
}


/**
 * Slice a string up to a string marked as a starting point.
 */
function sliceUptoUnit(string, beforeString) {
    var valueMatch = string.match(new RegExp('^' + escapeRegString(beforeString)))
    if ( valueMatch ) {
        string = string.replace(valueMatch[0], '')
    }
    return string
}


/**
 * Slice a string up to a string marked as the ending point.
 */
function sliceUnit(string, afterString) {
    var valueMatch = string.match(new RegExp('(.*?)' + (escapeRegString(afterString) || '$')))
    return valueMatch && valueMatch[1]
}


/**
 * Convert a formatting string into a formatting array.
 */
function toFormattingArray(formattingString, formatsHash) {

    // Define a format’s matching regular expression.
    var formatsRegex = new RegExp(

            // Match any [escaped] characters.
            '(\\[[^\\[]*\\])' +

            // Match any formatting characters.
            '|(' + Object.keys(formatsHash).
                sort(function(a,b) { return b > a ? 1 : -1 }).
                join('|') + ')' +

            // Match all other characters.
            '|(.)',
        'g')

    return (formattingString || '').
        split(formatsRegex).
        reduce(function(array, chunk) {
            if ( chunk ) {
                if ( chunk in formatsHash ) {
                    array.push({ f: chunk })
                }
                else if ( chunk.match(/^\[.*]$/) ) {
                    array.push( chunk.replace(/^\[(.*)]$/, '$1') )
                }
                else {
                    var lastItem = array[array.length - 1]
                    if ( typeof lastItem == 'string' ) {
                        array[array.length - 1] = lastItem + chunk
                    }
                    else {
                        array.push(chunk)
                    }
                }
            }
            return array
        }, [])
}


})();
