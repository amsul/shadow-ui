
var _ = shadow._ = {


    // /**
    //  * Create a blueprint constructor function.
    //  */
    // createBlueprint: function(constructor) {

    //     var blueprint = function() {
    //             var property,
    //                 prototype = this
    //             constructor.apply(prototype, arguments)
    //             blueprint.clones.unshift(prototype)
    //             for (property in blueprint) {
    //                 if (property !== 'clones' &&
    //                     hasOwnProperty.call(blueprint, property)) {
    //                         prototype[property] = blueprint[property]
    //                 }
    //             }
    //         }

    //     blueprint.clones = []

    //     return blueprint
    // },


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
    }

}


function ariaSet(element, attribute, value) {
    element.setAttribute(
        (attribute == 'role' ? '' : 'aria-') + attribute,
        value
    )
}
