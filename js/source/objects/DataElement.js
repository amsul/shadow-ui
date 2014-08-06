
/**
 * Construct a data element object.
 */
shadow.Element.extend({

    name: 'DataElement',

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

        var dataElement = this
        var attrs = dataElement.attrs

        // If a format is expected, there must be formats available for parsing/formatting.
        if ( attrs.format && !dataElement.formats ) {
            throw new TypeError('The `formats` hash map is required.')
        }

        if ( attrs.allowMultiple && !attrs.formatMultiple ) {
            attrs.formatMultiple = '{, |, }' // <before first>{<before middle>|<before last>}<after last>
        }

        if ( attrs.allowRange && !attrs.formatRange ) {
            attrs.formatRange = '{ - }' // <before from>{<before to>}<after to>
        }

        // Bind updating the formats when a range or multiple values are allowed.
        dataElement.on('assign:allowMultiple.' + dataElement.id, function(event) {
            if ( event.value ) {
                if ( !attrs.formatMultiple ) {
                    attrs.formatMultiple = '{, |, }'
                }
                if ( attrs.select && !attrs.allowRange ) {
                    attrs.select = [attrs.select]
                }
            }
            else {
                if ( attrs.select && !attrs.allowRange ) {
                    attrs.select = attrs.select[attrs.select.length - 1]
                }
            }
        })
        dataElement.on('assign:allowRange.' + dataElement.id, function(event) {
            if ( event.value ) {
                if ( !attrs.formatRange ) {
                    attrs.formatRange = '{ - }'
                }
                if ( attrs.select && !attrs.allowMultiple ) {
                    attrs.select = [attrs.select]
                }
            }
            else {
                if ( attrs.select && !attrs.allowMultiple ) {
                    attrs.select = attrs.select[attrs.select.length - 1]
                }
            }
        })

        // Bind updating the value when select is set.
        dataElement.on('set:select.' + dataElement.id, function(event) {
            var value = event.value
            attrs.value = value ? dataElement.format(value) : ''
        })

        // Bind updating the value when the format is updated.
        dataElement.on('set:format.' + dataElement.id + ' set:formatRange.' + dataElement.id + ' set:formatMultiple.' + dataElement.id, function() {
            if ( attrs.select ) {
                attrs.value = dataElement.format(attrs.select)
            }
        })

    },


    /**
     * Create a data element object.
     */
    create: function(options) {

        // Create the shadow object.
        var dataElement = this._super(options)
        var attrs = dataElement.attrs

        // When there are formats, make sure it is format-able.
        if ( dataElement.formats ) {
            if ( !attrs.format ) {
                throw new TypeError('The `format` attribute is required.')
            }
            Object.seal(dataElement.formats)
        }

        // Set the data element input.
        if ( !dataElement.$input ) {
            if ( dataElement.$el[0].nodeName == 'INPUT' ) {
                shadow._.define(dataElement, '$input', dataElement.$el)
            }
            else if ( attrs.hiddenInput ) {
                shadow._.define(dataElement, '$input', $('<input type=hidden>'))
                dataElement.$el.after(dataElement.$input)
            }
        }

        if ( dataElement.$input ) {

            // Make sure we have a valid input element.
            if ( dataElement.$input[0].nodeName != 'INPUT' ) {
                throw new TypeError('To create a shadow input, ' +
                    'the `$el` must be an input element.')
            }

            dataElement.$input.addClass(dataElement.classNames.input)

            // Set the starting element value.
            if ( attrs.value ) {
                dataElement.$input.val(attrs.value)
            }

            // Set the starting select.
            var value = dataElement.$input.val()
            if ( !attrs.value && value ) {
                attrs.select = dataElement.parse(value)
            }

            // Bind updating the element’s value when value is set.
            dataElement.on('set:value.' + dataElement.id, function(event) {
                dataElement.$input[0].value = event.value
            })

        }

        // Set the starting select.
        if ( attrs.value ) {
            var selection = dataElement.parse(attrs.value)
            if ( selection ) {
                attrs.select = selection
            }
        }

        // Set the starting value.
        else if ( attrs.select ) {
            attrs.value = dataElement.format(attrs.select)
        }

        // Return the new data element object.
        return dataElement
    }, //create


    /**
     * Convert a value into a formatted string.
     */
    format: function(value, options) {

        var dataElement = this
        var formatsHash = dataElement.formats
        var attrs = dataElement.attrs

        var formatValueUnit = function(valueUnit) {

            if ( formatsHash ) {
                return toFormattingArray(attrs.format, formatsHash).
                    map(function(chunk) {
                        return chunk.f ?
                            formatsHash[chunk.f].call(dataElement, valueUnit) :
                            chunk
                    }).
                    join('')
            }

            return typeof valueUnit == 'object' ?
                    JSON.stringify(valueUnit) : '' + valueUnit
        }

        // If multiple values are allowed, setup the combo formatter.
        if ( attrs.allowMultiple === true ) {
            return formatMultipleUnits(
                formatValueUnit,
                attrs.formatMultiple,
                attrs.formatRange,
                value
            )
        }

        // If range values are allowed, setup the range formatter.
        if ( attrs.allowRange === true ) {
            return formatRangeUnits(
                formatValueUnit,
                attrs.formatRange,
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

        var dataElement = this
        var attrs = dataElement.attrs
        var parseValueUnit = function(valueUnit) {

            // If there are formats, decorate the unit as needed.
            if ( dataElement.formats ) {

                // Create a parsed unit hash from the string.
                var parsedHash = dataElement.parseUnit(valueUnit)

                // Convert the unit hash into a value unit.
                valueUnit = /*dataElement.formatUnit(*/parsedHash/*)*/
            }

            // Try to evaluate it as JSON.
            try {
                valueUnit = JSON.parse(valueUnit)
            } catch (e) {}

            return valueUnit
        }

        // If multiple values are allowed, setup the combo parser.
        if ( attrs.allowMultiple === true ) {
            return parseMultipleUnits(
                parseValueUnit,
                attrs.formatMultiple,
                attrs.formatRange,
                string
            )
        }

        // If range values are allowed, setup the range parser.
        if ( attrs.allowRange === true ) {
            return parseRangeUnits(
                parseValueUnit,
                attrs.formatRange,
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

        var dataElement = this
        var formatsHash = dataElement.formats
        var parsedHash = {}

        // If there are formats, parse the unit.
        if ( formatsHash ) {
            toFormattingArray(dataElement.attrs.format, formatsHash).
                forEach(function(chunk) {
                    if ( chunk.f ) {
                        var chunkValue = formatsHash[chunk.f].call(dataElement, stringUnit, true)
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
                        var regex = new RegExp('^' + chunk)
                        if ( !stringUnit.match(regex) ) {
                            throw new SyntaxError('The formatting unit “' + chunk + '” ' +
                                'did not match in the string “' + stringUnit + '”.')
                        }
                        stringUnit = stringUnit.replace(regex, '')
                    }
                })
        }

        return parsedHash
    }, //parseUnit


    /**
     * Get a data element’s attribute with certain options.
     */
    get: function(name, options) {

        var dataElement = this
        var value = dataElement._super(name)

        options = options || {}

        if ( options.format ) {
            value = dataElement.format(value, options)
        }

        return value
    } //get

}) //shadow('data-element')


/**
 * Format multiple units of value.
 */
function formatMultipleUnits(formatter, formatMultiple, formatRange, value) {

    if ( !Array.isArray(value) ) {
        throw new TypeError('A data element with multiple values ' +
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
        var originalValueUnit = rangeUnit
        rangeUnit = parser(rangeUnit)
        range.push(rangeUnit)
        if ( typeof rangeUnit == 'string' ) originalValueUnit = rangeUnit
        value = value.replace(originalValueUnit, '')
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

