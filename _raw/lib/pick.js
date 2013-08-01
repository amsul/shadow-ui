
/*!
 * {%= pkg.title %} v{%= pkg.version %}, {%= grunt.template.today("yyyy/mm/dd") %}
 * By {%= pkg.author.name %}, {%= pkg.author.url %}
 * Hosted on {%= pkg.homepage %}
 * Licensed under {%= pkg.licenses[0].type %}
 */

/*jshint
    debug: true,
    devel: true,
    browser: true,
    asi: true,
    eqnull: true
 */

(function ( root, $, factory ) {

    var picker = {},
        doc = root.document

    // Pass picker through the factory.
    factory( picker, $, $( doc ), 'webkitCreateShadowRoot' in doc.body )

    // Setup the exports for Node module pattern, AMD, and basic <script> includes.
    if ( typeof module == 'object' && typeof module.exports == 'object' )
        module.exports = picker
    else if ( typeof define == 'function' && define.amd )
        define( picker )
    else root.Pick = picker

}( this, jQuery, function( Pick, $, $document, hasShadowRoot ) {

'use strict';


/**
 * Link up the package info.
 */
Pick.VERSION = '{%= pkg.version %}'



/**
 * Keep a track of the instances created.
 */
var INSTANCES = {}


/**
 * Build and record a picker instance.
 */
function createInstance( picker, extension ) {

    if ( !( picker instanceof Pick.Compose ) ) throw 'Need a picker composition to create an instance.'

    var id = 'P' + new Date().getTime(),

        regexFormats = new RegExp(

            // Match any [escaped] characters.
            '(\\[[^\\[]*\\])|(' +

            // Match any formatting characters.
            ( extension.formats ?
                Object.keys( extension.formats ).
                    sort(function(a,b) { return b.length > a.length ? 1 : -1 }).
                    join('|') + '|' :
                ''
            ) +

            // Match all other characters.
            '.)', 'g' ),

        instance = INSTANCES[ id ] = {
            name: id,
            id: id,
            picker: picker,
            content: '',
            shadow: null,
            init: null,
            is: {
                started: false,
                opened: false,
                focused: false
            },
            keys: {

                // Close the picker on “escape”.
                27: function() { picker.close( true ) },

                // If the target is within the root and “enter” is pressed,
                // prevent the default action and trigger a click on the target instead.
                13: function( event ) {
                    var target = event.target
                    if ( picker.$root.find( target ).length ) {
                        event.preventDefault()
                        target.click()
                    }
                },

                // Any of the arrow keys should open the picker.
                37: function() { picker.open() },
                38: function() { picker.open() },
                39: function() { picker.open() },
                40: function() { picker.open() }
            },
            bindings: {},
            dict: {
                select: 0,
                highlight: 0
            },
            cascades: {
                select: 'highlight'
            },
            formats: null,
            get: function( thing, options ) {
                var value = instance.dict[ thing ]
                options = typeof options == 'string' ? { format: options } : options
                if ( options && options.format && instance.formats ) {
                    return instance.toFormatString( options.format, value )
                }
                return value
            },
            set: function( thing, value, options ) {
                instance.dict[ thing ] = typeof value == 'string' && value.match( /^\d+$/ ) ? ~~value : value
                if ( instance.cascades[ thing ] ) {
                    picker.set( instance.cascades[ thing ], value, options )
                }
                return value
            },
            toFormatArray: function( string ) {
                if ( !instance.formats ) throw 'The picker extension needs a `formats` option.'
                return ( string || '' ).split( regexFormats ).reduce( function( array, value ) {
                    if ( value ) array.push(
                        value in instance.formats ? { f: value } :
                        value.match( /^\[.*]$/ ) ? value.replace( /^\[(.*)]$/, '$1' ) :
                        value
                    )
                    return array
                }, [] )
            },
            toFormatString: function( format, value ) {
                return instance.toFormatArray( format ).map( function( formatting ) {
                    return Pick._.trigger( formatting.f ? instance.formats[ formatting.f ] : formatting, instance, [ value ] )
                }).join( '' )
            },
            toFormatHash: function( format, value ) {
                var object = {}
                instance.toFormatArray( format ).forEach( function( formatting ) {
                    var formattingLength = formatting.f ? Pick._.trigger( instance.formats[ formatting.f ], instance, [ value, true ] ) : formatting.length
                    if ( formatting.f ) {
                        object[ formatting.f ] = value.substr( 0, formattingLength )
                    }
                    value = value.substr( formattingLength )
                })
                return object
            }
        } //instance

    // Extend the instance with the extension.
    return $.extend( true, instance, extension )
} //createInstance


/**
 * Create the template for a picker instance.
 */
function createTemplate( picker ) {

    var classNames = picker.klasses

    // Create the wrapped holder.
    return Pick._.node({
        klass: classNames.holder,
        content: [

            // Create the pointer node.
            Pick._.node({ klass: classNames.pointer }),

            // Create the picker frame.
            Pick._.node({
                klass: classNames.frame,

                // Create the content wrapper.
                content: Pick._.node({
                    klass: classNames.wrap,

                    // Create a box node.
                    content: Pick._.node({
                        klass: classNames.box,

                        // Attach the extension content.
                        content: Pick._.trigger( picker.extension.content, getInstance( picker ) )
                    })
                })
            })
        ]
    })
} //createTemplate


/**
 * Get the instance of a picker by ID.
 */
function getInstance( picker ) {
    return INSTANCES[ picker.i() ]
}



/**
 * The constructor that composes a pick extension.
 */
Pick.Compose = function( $element, extension, options ) {

    var instance, picker = this

    // Make sure we have a usable element.
    if ( $element[0].nodeName == 'INPUT' || $element[0].nodeName == 'TEXTAREA' ) throw 'Cannot create a picker out of a form field.'

    // Merge the defaults and options passed.
    picker.settings = $.extend( true, {}, extension.defaults, options )

    // Merge the default classes with the settings and then prefix them.
    picker.klasses = Pick._.prefix( extension.prefix, $.extend( {}, Pick._.klasses(), picker.settings.klass ) )

    // Link up the host.
    picker.$host = $element

    // Keep a reference to the extension and options.
    picker.extension = extension
    picker.options = options

    // Create an instance using the picker and extension.
    instance = createInstance( picker, extension )

    // Create a method to get the instance info.
    picker.i = function() { return instance.id }

    // Start up the picker.
    picker.start()
}



/**
 * The extension composer prototype.
 */
Pick.Compose.prototype = {

    constructor: Pick.Compose,


    /**
     * Construct the extension.
     */
    start: function() {

        var template,
            picker = this,
            instance = getInstance( picker )


        // If it’s already started, do nothing.
        if ( instance.is.started ) return P


        // Update the `started` state.
        instance.is.started = true


        // Register the default extension and settings events.
        picker.on({
            start: picker.extension.onStart,
            render: picker.extension.onRender,
            stop: picker.extension.onStop,
            open: picker.extension.onOpen,
            close: picker.extension.onClose,
            focus: picker.extension.onFocus,
            blur: picker.extension.onBlur,
            set: picker.extension.onSet
        }).on({
            start: picker.settings.onStart,
            render: picker.settings.onRender,
            stop: picker.settings.onStop,
            open: picker.settings.onOpen,
            close: picker.settings.onClose,
            focus: picker.settings.onFocus,
            blur: picker.settings.onBlur,
            set: picker.settings.onSet
        })


        // If there’s a formatting, prepare the input element.
        if ( picker.settings.format ) {

            // Find the input within the host.
            picker.$input = picker.$host.find( 'input' ).first().addClass( picker.klasses.input )

            // Adjust the host for the input.
            picker.$host.

                // The host should act as a “label” wrapper for the input.
                on( 'click.' + instance.id, function( event ) {
                    event.preventDefault()
                    picker.$input.trigger( 'focus' )
                }).

                // Listen for changes to update the input value.
                on( 'change.' + instance.id, function() {
                    picker.$input[0].value = picker.get( 'select', { format: picker.settings.format } )
                })
        }

        // Otherwise make the host “tab-able”.
        else picker.$host[0].tabIndex = 0


        // If there’s a hidden formatting, prepare the hidden input.
        if ( picker.settings.formatHidden ) {

            // If there’s a format for the hidden input, create it
            // with the name of the original input and a suffix.
            picker._hidden = $( '<input ' +
                'name="' + ( picker.$input ? picker.$input[0].name : '' ) + ( picker.settings.suffixHidden || '_formatted' ) + '"' +
                'type=hidden>'
            )[0]

            // Adjust the host for the hidden input.
            picker.$host.

                // Append the hidden input to the host.
                append( picker._hidden ).

                // Listen for changes to update the hidden value.
                on( 'change.' + instance.id, function() {
                    picker._hidden.value = picker.get( 'select', { format: picker.settings.formatHidden } )
                })
        }


        // Trigger the instance’s `init` method before creating the root.
        // If there’s the need, parse the starting value into a format-value hash.
        Pick._.trigger( instance.init, instance, [
            instance.formats && picker.$input ?
                instance.toFormatHash( picker.settings.format, picker.$input[0].value ) :
                null
        ])


        // Create and insert the root template into the dom.
        template = Pick._.node({ klass: picker.klasses.root, content: createTemplate( picker ) })
        if ( hasShadowRoot ) {
            instance.shadow = picker.$host[0].webkitCreateShadowRoot()
            instance.shadow.applyAuthorStyles = true
            instance.shadow.innerHTML = Pick._.node({ el: 'content' }) + template
            picker.$root = $( instance.shadow.childNodes[1] )
        }
        else {
            picker.$root = $( template )
            picker.$host.append( picker.$root )
        }


        // Prepare the root element.
        picker.$root.

            // When something within the root is focused, open the picker.
            on( 'focusin', function() { picker.open( true ) } ).

            // When things are getting picked, any click events within the
            // root shouldn’t bubble up, forms shouldn’t be submitted,
            // and focus should be maintained on the `document.activeElement`.
            on( 'click mousedown', '[data-pick]', function( event ) {
                event.stopPropagation()
                event.preventDefault()
            }).

            // When “enter” is pressed on a pick-able thing, trigger a click instead.
            on( 'keydown', '[data-pick]', function( event ) {
                if ( event.keyCode == 13 ) {
                    event.preventDefault()
                    this.click()
                }
            }).

            // When something within the root is picked, set the thing.
            on( 'click', '[data-pick]', function() {

                // Match a “thing” selection formatted as `<name>:<value>`
                var match = $( this ).data( 'pick' ).match( /\s*(.+)\s*:\s*(.+)\s*/ )

                // If there’s a match, set it.
                if ( match ) picker.set( match[1], match[2] )
            })


        // Prepare the host element.
        picker.$host.

            // Open the picker with focus on a click or focus within.
            on( 'click.' + instance.id + ' focusin.' + instance.id, function() {
                picker.open( true )
            }).

            // Prevent focus out of the host from bubbling up
            // so that a loss of focus within doesn’t close the picker.
            on( 'focusout.' + instance.id, function( event ) {
                event.stopPropagation()
            }).

            // Add the “host” class.
            addClass( picker.klasses.host ).

            // Store the extension data.
            data( 'pick.' + picker.extension.name, picker ).

            // And finally, trigger the handler for a change event
            // to update any input or hidden input element values.
            triggerHandler( 'change.' + instance.id )


        // Trigger any queued “start” and “render” events.
        return picker.trigger( 'start' ).trigger( 'render' )
    }, //start



    /**
     * Render a new template into the root.
     */
    render: function() {

        var picker = this

        // Create and insert the template.
        picker.$root[0].innerHTML = createTemplate( picker )

        // Trigger any queued “render” events.
        return picker.trigger( 'render' )
    },



    /**
     * Deconstruct the extension.
     */
    stop: function() {

        var picker = this,
            instance = getInstance( picker )

        // If it’s already stopped, do nothing.
        if ( !instance.is.started ) return picker

        // Update the `started` state.
        instance.is.started = false

        // Close the picker.
        picker.close()

        // Clean up the input element.
        if ( picker.$input ) {
            picker.$input.removeClass( picker.klasses.input )
        }

        // Remove the hidden input.
        if ( picker._hidden ) {
            picker._hidden.parentNode.removeChild( picker._hidden )
        }

        // Remove the extension template content.
        if ( hasShadowRoot ) picker.$host.after( picker.$host.clone() ).remove()
        else picker.$root.remove()

        // Remove the “host” class, unbind the events, and remove the stored data.
        picker.$host.removeClass( picker.klasses.host ).off( '.' + instance.id ).removeData( 'pick.' + picker.extension.name )

        // Trigger any queued “stop” event callbacks.
        picker.trigger( 'stop' )

        // Then reset all instance bindings.
        instance.bindings = {}

        return picker
    }, //stop



    /**
     * Open the picker.
     */
    open: function( giveFocus ) {

        var picker = this,
            instance = getInstance( picker )

        // Give the picker focus if needed.
        if ( giveFocus === true ) picker.focus()

        // If it’s already open, do nothing.
        if ( instance.is.opened ) return picker

        // Update the `opened` state.
        instance.is.opened = true

        // Add the “opened” class to the picker root.
        picker.$root.addClass( picker.klasses.rootOpened )

        // Bind events to the doc element.
        $document.

            // When a click or focus event is not on the host, input, or root, close the picker.
            // * Note: for Firefox, a click on an `option` element bubbles up directly
            //   to the doc. So make sure the target wasn't the doc.
            on( 'click.' + instance.id + ' focusin.' + instance.id + ' focusout.' + instance.id, function( event ) {
                var target = event.target
                if (
                    picker.$host[0] != target &&
                    ( !picker.$input || picker.$input[0] != target ) &&
                    !picker.$root.find( target ).length &&
                    $document[0] != target
                ) picker.close()
            })

        // Trigger any queued “open” events.
        return picker.trigger( 'open' )
    }, //open



    /**
     * Close the picker.
     */
    close: function( maintainFocus ) {

        var picker = this,
            instance = getInstance( picker )

        // If it’s already closed, do nothing.
        if ( !instance.is.opened ) return picker

        // If we need to keep focus, do so before changing states.
        if ( maintainFocus === true ) {
            if ( picker.$input ) picker.$input.trigger( 'focus' )
            else picker.$host.trigger( 'focus' )
        }
        else picker.blur()

        // Update the `opened` state.
        instance.is.opened = false

        // Remove the “opened” class from the picker root.
        picker.$root.removeClass( picker.klasses.rootOpened )

        // Trigger any queued “close” events.
        return picker.trigger( 'close' )
    }, //close



    /**
     * Focus the picker.
     */
    focus: function() {

        var picker = this,
            instance = getInstance( picker )

        // If it’s already focused, do nothing.
        if ( instance.is.focused ) return picker

        // Update the `focused` state.
        instance.is.focused = true

        // Add the “active” class to the host and then trigger
        // the click or focus handler to pass focus to the host or input.
        picker.$host.addClass( picker.klasses.hostActive ).trigger( picker.$input ? 'click' : 'focus' )

        // Add the “focused” class to the picker root.
        picker.$root.addClass( picker.klasses.rootActive )

        // Bind the keyboard events.
        $document.on( 'keydown.' + instance.id, function( event ) {

            var keyAction = instance.keys[ event.keyCode ]

            // Check if the picker is focused and there is a key action.
            if ( instance.is.focused && keyAction ) {

                // Prevent the default action to stop page movement.
                event.preventDefault()

                // Trigger the key action within scope of the instance.
                Pick._.trigger( keyAction, instance, [ event ] )
            }
        })

        // Trigger any queued “focus” events.
        return picker.trigger( 'focus' )
    }, //focus



    /**
     * Blur the picker.
     */
    blur: function() {

        var picker = this,
            instance = getInstance( picker )

        // If it’s already not focused, do nothing.
        if ( !instance.is.focused ) return picker

        // Update the `focused` state.
        instance.is.focused = false

        // Remove the “active” class from the host.
        picker.$host.removeClass( picker.klasses.hostActive )

        // Remove the “focused” class from the picker root.
        picker.$root.removeClass( picker.klasses.rootActive )

        // Unbind the keyboard events.
        $document.off( '.' + instance.id )

        // Trigger any queued “blur” events.
        return picker.trigger( 'blur' )
    }, //blur



    /**
     * Attach callbacks to events.
     */
    on: function( thing, callback ) {

        var thingName, thingMethod,
            thingIsObject = $.isPlainObject( thing ),
            thingObject = thingIsObject ? thing : {},
            picker = this,
            instance = getInstance( picker )

        if ( thing ) {

            // If the thing isn’t an object, make it one.
            if ( !thingIsObject ) {
                thingObject[ thing ] = callback
            }

            // Go through the things to bind to.
            for ( thingName in thingObject ) {

                // Grab the callback of the thing.
                thingMethod = thingObject[ thingName ]

                // Make sure the thing’s binding collection exists.
                if ( !instance.bindings[ thingName ] ) instance.bindings[ thingName ] = []

                // Add the callback to the relative binding collection.
                instance.bindings[ thingName ].push( thingMethod )
            }
        }

        return picker
    }, //on



    /**
     * Fire off any instance bindings by name.
     */
    trigger: function( name, data ) {
        var picker = this,
            methodList = getInstance( picker ).bindings[ name ]
        if ( methodList ) {
            methodList.forEach( function( callback ) {
                Pick._.trigger( callback, picker, [ data ] )
            })
        }
        return picker
    },



    /**
     * Check a state of the picker instance.
     */
    is: function( thing ) {

        var picker = this,
            instance = getInstance( picker )

        // Return the instance’s state of the thing.
        return instance.is[ thing ]
    },



    /**
     * Get something from the picker or extension.
     */
    get: function( thing, options ) {

        var picker = this,
            instance = getInstance( picker )

        // Check if the value is requested, get the input’s value.
        return thing == 'value' ? picker.$input && picker.$input[0].value :

            // If the hidden value is requested, get the hidden input’s value.
            thing == 'valueHidden' ? picker._hidden && picker._hidden.value :

            // If the active element is requested, check the shadow or the root.
            thing == 'activeElement' ? instance.shadow ?
                instance.shadow[ thing ] :
                picker.$root.find( $document[0][ thing ] )[0] :

            // Otherwise get the thing using the options within scope of the instance.
            Pick._.trigger( instance.get, instance, [ thing, options ] )
    }, //get



    /**
     * Set something to the picker or extension.
     */
    set: function( thing, value, options ) {

        var picker = this,
            instance = getInstance( picker ),

            thingItem, thingValue, thingDefined,
            thingIsObject = $.isPlainObject( thing ),
            thingObject = thingIsObject ? thing : {}


        if ( thing ) {

            // If the thing isn’t an object, make it one.
            if ( !thingIsObject ) thingObject[ thing ] = value

            // Go through the things of items to set with the corresponding diction.
            for ( thingItem in thingObject ) if ( thingItem in instance.dict ) {

                // Grab the value of the thing.
                thingValue = thingObject[ thingItem ]

                // Set the definition of the relevant instance item.
                thingDefined = Pick._.trigger( instance.set, instance, [ thingItem, thingValue, options ] )

                // Check to update the input value and broadcast a change.
                if ( thingItem == 'select' || thingItem == 'clear' ) {
                    picker.$host.trigger( 'change', [ thingItem, thingValue ] )
                }

                // Trigger any queued “set” events and pass the event.
                picker.trigger( 'set', $.Event( 'set:' + thingItem, { data: thingObject }) )
            } //endfor
        }

        return picker
    } //set

} //Pick.Compose.prototype



/**
 * Picker helper methods.
 */
Pick._ = {


    /**
     * Keep a storage of the extensions.
     */
    EXTENSIONS: {},


    /**
     * Create the extension classes with a prefix.
     */
    klasses: function() {
        return {

            host: '-host',
            hostActive: '-host--active',

            input: '-host__input',

            root: '',
            rootOpened: '--opened',
            rootActive: '--active',

            holder: 'holder',

            pointer: 'pointer',

            frame: 'frame',
            wrap: 'wrap',

            box: 'box'
        }
    }, //klasses


    /**
     * Prefix a single class or an object of classes.
     */
    prefix: function( prefix, klasses ) {
        var bemPrefixify = function( klass ) {
            return klass ? prefix + ( klass.match( /^-/ ) ? '' : '__' ) + klass : prefix
        }
        prefix = prefix || 'picker'
        if ( $.isPlainObject( klasses ) ) {
            for ( var klass in klasses ) {
                klasses[ klass ] = bemPrefixify( klasses[ klass ] )
            }
            return klasses
        }
        return bemPrefixify( klasses )
    }, //prefix


    /**
     * Create a dom node.
     */
    node: function( options ) {

        // Make sure we have usable options.
        if ( !$.isPlainObject( options ) ) options = {}

        var element = options.el || 'div',
            content = options.content,
            klasses = options.klass,
            attrsObj = $.isPlainObject( options.attrs ) ? options.attrs : {},
            attributes = '', attr

        // Create a string out of the content.
        content = $.isArray( content ) ? content.join('') : content || ''

        // Attach the classes to the attributes object.
        if ( klasses ) attrsObj['class'] = typeof klasses == 'string' ? klasses : klasses.join(' ')

        // Concatenate the attributes together.
        for ( attr in attrsObj ) attributes += ' ' + attr + '="' + attrsObj[attr] + '"'

        // Return the composed element.
        return '<' + element + attributes + '>' + content + '</' + element + '>'
    },


    /**
     * Create a loop to be iterated over.
     */
    loop: function( range, iterator ) {

        var result = '',
            min = Pick._.trigger( range.min, range ),
            max = Pick._.trigger( range.max, range ),
            i = Pick._.trigger( range.i, range ) || 1

        // Loop from the `min` to `max` while incrementing by `i` and
        // trigger the iterator while appending to the result.
        while ( min <= max ) {
            result += Pick._.trigger( iterator, range, [ min ] ) || ''
            min += i
        }

        // Return the concatenated result string.
        return result
    }, //loop


    /**
     * Trigger a function otherwise return the value.
     */
    trigger: function( callback, scope, args ) {
        return typeof callback == 'function' ? callback.apply( scope, args || [] ) : callback
    },


    /**
     * If the second character is a digit, length is 2 otherwise 1.
     */
    digits: function( string ) {
        return ( /\d/ ).test( string[ 1 ] ) ? 2 : 1
    },


    /**
     * Lead numbers below 10 with a zero.
     */
    lead: function( number ) {
        return ( number < 10 ? '0': '' ) + number
    },


    /**
     * Tell if something is a certain type.
     */
    isType: function( value, type ) {
        return {}.toString.call( value ).indexOf( type ) > -1
    },


    /**
     * Tell if something is a date object.
     */
    isDate: function( value ) {
        return this.isType( value, 'Date' )
    },


    /**
     * Tell if something is an integer.
     */
    isInteger: function( value ) {
        return this.isType( value, 'Number' ) && value % 1 === 0
    }
} //Pick._



/**
 * Create a picker extension.
 */
Pick.extend = function( component ) {

    // Make sure we have a usable component.
    if ( !component || !component.name ) {
        throw 'To create a picker extension, the component needs a name.'
    }

    // Make sure this component doesn’t already exist.
    if ( Pick._.EXTENSIONS[ component.name ] ) {
        throw 'A picker extension by this name has already been defined.'
    }

    // Store the component extension by name.
    Pick._.EXTENSIONS[ component.name ] = component

    // If there’s an alias, create the shorthand link.
    if ( component.alias ) {
        $.fn[ component.alias ] = function( options, action ) {
            return this.pick( component.name, options, action )
        }
    }
} //Pick.extend



/**
 * Extend jQuery.
 */
$.fn.pick = function( name, options, action ) {

    var
        // Grab the extension by name.
        extension = Pick._.EXTENSIONS[ name ],

        // Grab the component data.
        componentData = this.data( 'pick.' + name )


    // Check if an extension was found.
    if ( !extension ) {
        throw 'No extension found by the name of “' + name + '”.'
    }

    // If the picker is requested, return the component data.
    if ( options == 'picker' ) {
        return componentData
    }

    // If the component data exists and `options` is a string, carry out the action.
    if ( componentData && typeof options == 'string' ) {
        Pick._.trigger( componentData[ options ], componentData, [ action ] )
        return this
    }

    // Otherwise go through each matched element and compose new extensions.
    return this.each( function() {
        var $this = $( this )
        if ( !$this.data( 'pick.' + name ) ) {
            new Pick.Compose( $this, extension, options )
        }
    })
}

$.fn.pick.extend = Pick.extend

}));



