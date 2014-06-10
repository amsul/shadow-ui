(function(factory) {

    // Register as an anonymous module.
    if ( typeof define == 'function' && define.amd )
        define(['shadow', 'jquery'], factory)

    // Or using browser globals.
    else factory(shadow, jQuery)

}(function(shadow, $) { 'use strict';


/**
 * Construct a data field object.
 */
shadow('data-field', {

    $input: null,

    attrs: {
        select: null,
        value: null,
        hiddenInput: null,
        allowMultiple: null,
        allowRange: null,
        format: null,
        formatMultiple: null,
        formatRange: null
    },
    formats: null,

    classNames: {
        input: 'input',
    },


    /**
     * Setup the attrs before everything gets sealed
     * and before getters and setters are made.
     */
    setup: function() {

        var dataField = this
        var attrs = dataField.attrs

        // If a format is expected, there must be formatters available.
        if ( attrs.format && !dataField.formats ) {
            throw new TypeError('The `formats` hash map is required.')
        }

        if ( attrs.allowMultiple && !attrs.formatMultiple ) {
            attrs.formatMultiple = '{, |, }' // <before first>{<before middle>|<before last>}<after last>
        }

        if ( attrs.allowRange && !attrs.formatRange ) {
            attrs.formatRange = '{ - }' // <before from>{<before to>}<after to>
        }

        // Set the starting select.
        if ( attrs.value ) {
            var selection = dataField.parse(attrs.value)
            if ( selection ) {
                attrs.select = selection
            }
        }

        // Set the starting value.
        else if ( attrs.select ) {
            attrs.value = dataField.format(attrs.select)
        }

        // Bind updating the value when select is set.
        dataField.on('set:select.' + dataField.id, function(event) {
            var value = event.value
            attrs.value = value ? dataField.format(value) : ''
        })

    },


    /**
     * Create a data field object.
     */
    create: function(options) {

        // Create the shadow object.
        var dataField = this._super(options)
        var attrs = dataField.attrs

        // When there are formats, make sure it is format-able.
        if ( dataField.formats ) {
            if ( !attrs.format ) {
                throw new TypeError('The `format` attribute is required.')
            }
            Object.seal(dataField.formats)
        }

        // Set the data field input.
        if ( !dataField.$input ) {
            if ( dataField.$el[0].nodeName == 'INPUT' ) {
                shadow._.define(dataField, '$input', dataField.$el)
            }
            else if ( attrs.hiddenInput ) {
                shadow._.define(dataField, '$input', $('<input type=hidden>'))
                dataField.$el.after(dataField.$input)
            }
        }

        if ( dataField.$input ) {

            // Make sure we have a valid input element.
            if ( dataField.$input[0].nodeName != 'INPUT' ) {
                throw new TypeError('To create a shadow input, ' +
                    'the `$el` must be an input element.')
            }

            dataField.$input.addClass(dataField.classNames.input)

            // Set the starting element value.
            if ( attrs.value ) {
                dataField.$input.val(attrs.value)
            }

            // Set the starting select.
            var value = dataField.$input.val()
            if ( !attrs.value && value ) {
                attrs.select = dataField.parse(value)
            }

            // Bind updating the element’s value when value is set.
            dataField.on('set:value.' + dataField.id, function(event) {
                dataField.$input[0].value = event.value
            })

        }

        // Whenever the format is updated, the value should be re-formatted.
        dataField.on('set:format.' + dataField.id + ' set:formatRange.' + dataField.id, function() {
            if ( attrs.select ) {
                attrs.value = dataField.format(attrs.select)
            }
        })

        // Return the new data field object.
        return dataField
    }, //create


    /**
     * Convert a value into a formatted string.
     */
    format: function(value) {

        var dataField = this
        var formatsHash = dataField.formats

        var formatValueUnit = function(valueUnit) {

            if ( formatsHash ) {
                return toFormattingArray(dataField.attrs.format, formatsHash).
                    map(function(chunk) {
                        return chunk.f ?
                            formatsHash[chunk.f].call(dataField, valueUnit) :
                            chunk
                    }).
                    join('')
            }

            return typeof valueUnit == 'object' ?
                    JSON.stringify(valueUnit) : '' + valueUnit
        }

        // If multiple values are allowed, setup the combo formatter.
        if ( dataField.attrs.allowMultiple === true ) {
            return formatMultipleUnits(
                formatValueUnit,
                dataField.attrs.formatMultiple,
                dataField.attrs.formatRange,
                value
            )
        }

        // If range values are allowed, setup the range formatter.
        if ( dataField.attrs.allowRange === true ) {
            return formatRangeUnits(
                formatValueUnit,
                dataField.attrs.formatRange,
                value
            )
        }

        // Otherwise just format it as a single unit.
        return formatValueUnit(value)
    }, //format


    // /**
    //  * Convert a parsed unit hash into a formatted string.
    //  */
    // formatUnit: function(unitHash) {
    //     return unitHash
    // },


    /**
     * Convert a formatted string into a parsed value.
     */
    parse: function(string) {

        if ( typeof string != 'string' ) {
            throw new TypeError('The parser expects a string.')
        }

        if ( !string ) {
            return null
        }

        var dataField = this
        var parseValueUnit = function(valueUnit) {

            // If there are formats, decorate the unit as needed.
            if ( dataField.formats ) {

                // Create a parsed unit hash from the string.
                var parsedHash = dataField.parseUnit(valueUnit)

                // Convert the unit hash into a value unit.
                valueUnit = /*dataField.formatUnit(*/parsedHash/*)*/
            }

            // Try to evaluate it as JSON.
            try {
                valueUnit = JSON.parse(valueUnit)
            } catch (e) {}

            return valueUnit
        }

        // If multiple values are allowed, setup the combo parser.
        if ( dataField.attrs.allowMultiple === true ) {
            return parseMultipleUnits(
                parseValueUnit,
                dataField.attrs.formatMultiple,
                dataField.attrs.formatRange,
                string
            )
        }

        // If range values are allowed, setup the range parser.
        if ( dataField.attrs.allowRange === true ) {
            return parseRangeUnits(
                parseValueUnit,
                dataField.attrs.formatRange,
                string
            )
        }

        // Otherwise just parse it as a single unit.
        return parseValueUnit(string)
    }, //parse


    /**
     * Convert a formatted unit string into a parsed unit hash.
     */
    parseUnit: function(stringUnit) {

        var dataField = this
        var formatsHash = dataField.formats
        var parsedHash = {}

        // If there are formats, parse the unit.
        if ( formatsHash ) {
            toFormattingArray(dataField.attrs.format, formatsHash).
                forEach(function(chunk) {
                    if ( chunk.f ) {
                        var chunkValue = formatsHash[chunk.f].call(dataField, stringUnit, true)
                        if ( !stringUnit.match(new RegExp('^' + chunkValue)) ) {
                            throw new SyntaxError('The value parsed by the ' +
                                '`' + chunk.f + '` formatting rule did not ' +
                                'match the value being parsed.\n' +
                                'Value being parsed: “' + stringUnit + '”.\n' +
                                'Value parsed by rule: “' + chunkValue + '”.');
                        }
                        stringUnit = stringUnit.slice(chunkValue.length)
                        parsedHash[chunk.f] = chunkValue
                    }
                    else {
                        stringUnit = stringUnit.replace(new RegExp('^' + chunk), '')
                    }
                })
        }

        return parsedHash
    }, //parseUnit


    /**
     * Get a data field’s attribute with certain options.
     */
    get: function(name, options) {

        var dataField = this
        var value = dataField._super(name)

        options = options || {}

        if ( options.format ) {
            value = dataField.format(value)
        }

        return value
    } //get

}) //shadow('data-field')


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


}));
