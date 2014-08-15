
/**
 * Utility methods to simplify and share common functionality.
 *
 * @class shadow._
 * @static
 */
var _ = shadow._ = {


    /**
     * A no-op.
     *
     * @method noop
     * @static
     */
    noop: function() {},


    /**
     * Define an enumerable property on an object.
     *
     * @method define
     * @param {Object} object The object to receive the property definition.
     * @param {String} prop The property to define.
     * @param {String|Boolean|Number|Array|Object|Function} value The value of the definition.
     * @static
     */
    define: function(object, prop, value) {
        Object.defineProperty(object, prop, {
            enumerable: true,
            value: value
        })
    },


    /**
     * Convert to camel-cased text.
     *
     * ```javascript
     * shadow._.caseCamel('howdy-there stranger')
     * // returns 'howdyThere stranger'
     *
     * shadow._.caseCamel('HowdyThere-stranger')
     * // returns 'howdyThereStranger'
     * ```
     *
     * @method caseCamel
     * @param {String} words A string of words delimited by dashes, underscores, and case changes.
     * @return {String} The camelized string of words.
     * @static
     */
    caseCamel: function(words) {
        var newWord = true
        var wordChunks = words.split(/(?=[A-Z])|-|_/).map(function(word, index) {
            if ( !word ) {
                return ''
            }
            if ( word.length === 1 ) {
                if ( !newWord ) {
                    return word.toLowerCase()
                }
                newWord = false
                return word
            }
            newWord = true
            return (index ? word[0].toUpperCase() : word[0].toLowerCase() ) +
                word.slice(1)
        })
        var firstWord = wordChunks[0]
        if ( wordChunks.length > 1 && firstWord[0].match(/[A-Z]/) ) {
            wordChunks[0] = firstWord[0].toLowerCase() + firstWord.slice(1)
        }
        return wordChunks.join('')
    },


    /**
     * Convert to pascal-cased text.
     *
     * ```javascript
     * shadow._.casePascal('howdy-there stranger')
     * // returns 'HowdyThere stranger'
     *
     * shadow._.casePascal('HowdyThere-stranger')
     * // returns 'HowdyThereStranger'
     * ```
     *
     * @method casePascal
     * @param {String} words A string of words delimited by dashes, underscores, and case changes.
     * @return {String} The pascalized string of words.
     * @static
     */
    casePascal: function(words) {
        var newWord = true
        var wordChunks = words.split(/(?=[A-Z])|-|_/).map(function(word) {
            if ( !word ) {
                return ''
            }
            if ( word.length === 1 ) {
                if ( !newWord ) {
                    return word.toLowerCase()
                }
                newWord = false
                return word
            }
            newWord = true
            return word[0].toUpperCase() + word.slice(1)
        })
        return wordChunks.join('')
    },


    /**
     * Convert to dash-cased text.
     *
     * ```javascript
     * shadow._.caseDash('howdy-there stranger')
     * // returns 'howdy-there stranger'
     *
     * shadow._.caseDash('HowdyThere-stranger')
     * // returns 'howdy-there-stranger'
     * ```
     *
     * @method caseDash
     * @param {String} words A string of words delimited by dashes, underscores, and case changes.
     * @return {String} The dasherized string of words.
     * @static
     */
    caseDash: function(words) {
        var newWord = true
        var wordChunks = words.split(/(?=[A-Z])|-|_/).map(function(word, index) {
            if ( !word ) {
                return ''
            }
            if ( word.length === 1 ) {
                if ( !newWord ) {
                    return word.toLowerCase()
                }
                newWord = false
                return (index ? '-' : '') + word.toLowerCase()
            }
            newWord = true
            return (index ? '-' : '') + word[0].toLowerCase() + word.slice(1)
        })
        return wordChunks.join('')
    },


    /**
     * Check what the internal type of a value is.
     *
     * ```javascript
     * shadow._.isTypeOf(new Date)
     * // returns 'date'
     *
     * shadow._.isTypeof(new Date, 'date')
     * // returns true
     * ```
     *
     * @method isTypeOf
     * @param value The value whose type is being checked.
     * @param {String} [type] A type to compare against.
     * @return {String|Boolean} If a `type` is passed, a boolean is returned. Otherwise the type is returned.
     * @static
     */
    isTypeOf: function(value, type) {
        var valueType = {}.toString.call(value).
            slice(8, -1).
            toLowerCase()
        return type ? type === valueType : valueType
    },


    /**
     * Define aria attributes on an element.
     *
     * Given the following element:
     *
     * ```html
     * <div id="elem"></div>
     * ```
     *
     * ...and applying the following snippet:
     *
     * ```javascript
     * var el = document.getElementById('elem')
     * shadow._.aria(el, 'role', 'button')
     * shadow._.aria(el, 'controls', 'widget')
     * ```
     *
     * ...the element becomes:
     *
     * ```html
     * <div id="elem" role="button" aria-controls="widget"></div>
     * ```
     *
     * @method aria
     * @param {HTMLElement} element The HTML element whose attribute should be set.
     * @param {String} attribute The name of the aria attribute to set (minus the `aria-` part of the name).
     * @param {String|Boolean} value The value to set the attribute to.
     * @static
     */
    /**
     * An alternate way to set multiple aria attributes on an element.
     *
     * Given the following element:
     *
     * ```html
     * <div id="elem"></div>
     * ```
     *
     * And applying the following snippet:
     *
     * ```javascript
     * var el = document.getElementById('elem')
     * shadow._.aria(el, {
     *     role: 'button',
     *     controls: 'widget'
     * })
     * ```
     *
     * The element becomes:
     *
     * ```html
     * <div id="elem" role="button" aria-controls="widget"></div>
     * ```
     *
     * @method aria
     * @param {HTMLElement} element The HTML element whose attribute should be set.
     * @param {Hash} attributes A hash mapping of attribute names (minus the `aria-` part) to values.
     * @static
     */
    aria: function(element, attribute, value) {
        if ( $.isPlainObject(attribute) ) {
            for ( var key in attribute ) {
                ariaSet(element, key, attribute[key])
            }
        }
        else {
            ariaSet(element, attribute, value)
        }
    },


    /**
     * Create an element node with optional children.
     *
     * @method el
     * @param {String|Hash} [options] Options to customize the creation. If it’s a string, the value is used as the class name.
     * @param {String} options.name The tag name for the element.
     * @param {String} options.klass The class name for the element.
     * @param {Hash} options.attrs A hash mapping of attributes for the element.
     * @param {Node|HTMLElement|DocumentFragment|Array} [childEls] The children to append to the element.
     * @return {HTMLElement} The newly created element.
     * @static
     */
    el: function(options, childEls) {
        var className
        var attributes
        var elName = 'div'
        if ( options ) {
            if ( typeof options == 'string' ) {
                className = options
            }
            else {
                if ( options.name ) {
                    elName = options.name
                }
                if ( options.klass ) {
                    className = options.klass
                }
                if ( options.attrs ) {
                    attributes = options.attrs
                }
            }
        }
        else if ( !(childEls instanceof Node) ) {
            return document.createTextNode(childEls)
        }
        var el = document.createElement(elName)
        if ( className ) {
            el.className = className
        }
        if ( attributes ) for ( var attrName in attributes ) {
            el.setAttribute(attrName, attributes[attrName])
        }
        if ( childEls != null ) {
            if ( !Array.isArray(childEls) ) {
                childEls = [childEls]
            }
            childEls.forEach(function(childEl) {
                if ( !(childEl instanceof Node) ) {
                    childEl = document.createTextNode(childEl)
                }
                el.appendChild(childEl)
            })
        }
        return el
    },


    /**
     * Get the index of a unit within a collection.
     *
     * @method indexIn
     * @param {Array} collection A collection of values with the same type.
     * @param {String|Boolean|Number|Array|Object} unit The unit to find.
     * @param {Function} [comparator] A function to use for the comparison of units.
     * @return {Number} The index the unit was found at. `-1` if it wasn’t found.
     * @static
     */
    indexIn: function(collection, unit, comparator) {
        if ( !Array.isArray(collection) ) {
            throw new TypeError('The collection to search in must be an array.')
        }
        comparator = comparator || function(unit, loopedUnit) { return loopedUnit === unit }
        for ( var i = 0; i < collection.length; i++ ) {
            var loopedUnit = collection[i]
            if ( comparator(unit, loopedUnit) ) {
                return i
            }
        }
        return -1
    },


    /**
     * Check if a unit is within a collection.
     *
     * @method isWithin
     * @param {Array} collection A collection of values with the same type.
     * @param {String|Boolean|Number|Array|Object} unit The unit to find.
     * @param {Function} [comparator] A function to use for the comparison of units.
     * @return {Boolean}
     * @static
     */
    isWithin: function(collection, unit, comparator) {
        return this.indexIn(collection, unit, comparator) > -1
    }

}


function ariaSet(element, attribute, value) {
    element.setAttribute(
        (attribute == 'role' ? '' : 'aria-') + attribute,
        value
    )
}
