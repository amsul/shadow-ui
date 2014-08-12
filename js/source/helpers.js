
var _ = shadow._ = {


    /**
     * A no-op.
     */
    noop: function() {},


    /**
     * Define an enumerable property on an object.
     */
    define: function(object, item, value) {
        Object.defineProperty(object, item, {
            enumerable: true,
            value: value
        })
    },


    /**
     * Convert to camel-cased text.
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
        return wordChunks.join('')
    },


    /**
     * Convert to pascal-cased text.
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
                return '-' + word.toLowerCase()
            }
            newWord = true
            return (index ? '-' : '') + word[0].toLowerCase() + word.slice(1)
        })
        return wordChunks.join('')
    },


    /**
     * Check what the type of a thing is.
     */
    isTypeOf: function(thing, type) {
        var thingType = {}.toString.call(thing).
            slice(8, -1).
            toLowerCase()
        return type ? type === thingType : thingType
    },


    /**
     * Define aria attributes on an element.
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
