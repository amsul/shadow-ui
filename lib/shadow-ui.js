
/*!
 * Shadow UI v0.4.0, 2013/08/11
 * By Amsul, http://amsul.ca
 * Hosted on http://amsul.github.io/shadow-ui.js
 * Licensed under MIT
 */

(function ( root, $, factory ) {

    var shadow = {},
        doc = root.document

    // Pass the shadow object through the factory.
    factory( shadow, $, $( doc ), 'webkitCreateShadowRoot' in doc.body )

    // Setup the exports for Node module pattern, AMD, and basic <script> includes.
    if ( typeof module == 'object' && typeof module.exports == 'object' )
        module.exports = shadow
    else if ( typeof define == 'function' && define.amd )
        define( shadow )
    else root.shadow = shadow

}( this, jQuery, function( shadow, $, $document, hasShadowRoot ) {

'use strict';


/**
 * Link up the package info.
 */
shadow.VERSION = '0.4.0'



/**
 * The constructor that composes a shadow ui extension.
 */
shadow.UI = function( $element, extension, options ) {

    var ui = this,
        nodeName = $element[0].nodeName,
        valueHidden = $element.attr( 'data-value' )

    // Link up the source element.
    ui.$source = $element

    // Link up the host or input.
    if ( nodeName.match( /INPUT|TEXTAREA/ ) ) ui.$input = $element
    else ui.$host = $element

    // Link up (as reference) the extension and options passed.
    ui.r = {
        extension: extension,
        options: options
    }

    // Create an instance using the ui and extension.
    ui.i = createInstance( ui, extension )

    // Create settings by merging the defaults and options passed.
    ui.settings = $.extend( true, {}, ui.i.defaults, options )

    // Create class names by merging the prefixed defaults with the settings.
    ui.klasses = shadow._.prefix( ui.i.prefix, $.extend( {}, shadow._.klasses(), ui.settings.klass ) )

    // Before starting, trigger the instance’s `init` method.
    // If there’s the need, parse the input value into a format-value hash.
    shadow._.trigger( ui.i.init, ui.i, [
        ui.i.formats ?
            ui.i.toFormatHash( valueHidden ? ui.settings.formatHidden : ui.settings.format, valueHidden || $element[0].value ) :
            null
    ])

    // Start up the ui with the starting value.
    ui.start( valueHidden )
}



/**
 * The extension composer prototype.
 */
shadow.UI.prototype = {

    constructor: shadow.UI,


    /**
     * Construct the extension.
     */
    start: function( valueHidden ) {

        var template,
            ui = this,
            instance = ui.i


        // If it’s already started, do nothing.
        if ( instance.is.started ) return ui


        // Update the `started` state.
        instance.is.started = true


        // If there’s an input element, create a host.
        if ( ui.$input ) {

            // Create a host element to hold the ui root and bind
            // the default click and focus events to open the ui.
            ui.$host = $( '<div/>' ).on( 'click focusin', ui.open.bind( ui, true ) )

            // Add the “input” class and insert the host.
            ui.$input.addClass( ui.klasses.input ).after( ui.$host )

            // Listen for changes to update the input value.
            ui.$source.on( 'change.' + instance.id, function() {
                ui.$input[0].value = ui.get( 'select', { format: ui.settings.format } )
            })
        }

        // If there isn’t an input, make the host “tab-able”.
        else ui.$host[0].tabIndex = 0


        // Add the “host” class to the element.
        ui.$host.addClass( ui.klasses.host )


        // If there’s a hidden formatting, prepare the hidden input.
        if ( ui.settings.formatHidden ) {

            // If there’s a format for the hidden input, create it
            // with the name of the original input and a suffix.
            ui._hidden = $( '<input ' +
                'value="' + ( valueHidden || ui.get( 'select', { format: ui.settings.formatHidden } ) ) + '"' +
                'name="' + ( ui.$input ? ui.$input[0].name : '' ) + ( ui.settings.suffixHidden || '_formatted' ) + '"' +
                'type=hidden>'
            )[0]

            // Add the hidden input after the source and
            // listen for changes to update the hidden value.
            ui.$source.after( ui._hidden ).on( 'change.' + instance.id, function() {
                ui._hidden.value = ui.get( 'select', { format: ui.settings.formatHidden } )
            })
        }


        // Prepare the source element.
        ui.$source.

            // Open the ui with focus on a click or focus within.
            on( 'click.' + instance.id + ' focusin.' + instance.id, ui.open.bind( ui, true ) ).

            // Prevent focus out of the host from bubbling up
            // so that a loss of focus within doesn’t close the ui.
            on( 'focusout.' + instance.id, function( event ) {
                event.stopPropagation()
            }).

            // Store the extension data.
            data( 'shadow', ui )


        // Create and insert the root template into the host.
        template = shadow._.node({ klass: ui.klasses.root, content: createTemplate( ui ) })
        if ( hasShadowRoot ) {
            instance.shadow = ui.$host[0].webkitCreateShadowRoot()
            instance.shadow.applyAuthorStyles = true
            instance.shadow.innerHTML = shadow._.node({ el: 'content' }) + template
            ui.$root = $( instance.shadow.childNodes[1] )
        }
        else {
            ui.$root = $( template )
            ui.$host.append( ui.$root )
        }


        // Prepare the root element.
        ui.$root.

            // When something within the root is focused, open the ui.
            on( 'focusin', ui.open.bind( ui, true ) ).

            // When “enter” is pressed on a pick-able thing, trigger a click instead.
            on( 'keydown', '[data-pick]', function( event ) {
                if ( event.keyCode == 13 ) {
                    event.preventDefault()
                    this.click()
                }
            }).

            // When things are getting picked, any click events within the
            // root shouldn’t bubble up, forms shouldn’t be submitted,
            // and focus should be maintained on the `document.activeElement`.
            on( 'click mousedown', '[data-pick]', function( event ) {
                event.stopPropagation()
                event.preventDefault()
            }).

            // When something within the root is picked, set the thing.
            on( 'click', '[data-pick]', function() {

                // Match a “thing” selection formatted as `<name>:<value>`
                var match = $( this ).data( 'pick' ).match( /\s*(.+)\s*:\s*(.+)\s*/ )

                // If there’s a match, set it.
                if ( match ) ui.set( match[1], match[2] )
            }).

            // If a click reaches the root itself, stop bubbling and close it.
            on( 'click', function( event ) {
                if ( this == event.target ) {
                    event.stopPropagation()
                    ui.close( true )
                }
            })


        // Once all is composed, trigger the instance’s `ready` method.
        shadow._.trigger( instance.ready, instance )


        // Register the default settings events.
        ui.on({
            start: ui.settings.onStart,
            render: ui.settings.onRender,
            stop: ui.settings.onStop,
            open: ui.settings.onOpen,
            close: ui.settings.onClose,
            focus: ui.settings.onFocus,
            blur: ui.settings.onBlur,
            set: ui.settings.onSet
        })


        // Trigger any queued “start” and “render” events.
        return ui.trigger( 'start' ).trigger( 'render' )
    }, //start



    /**
     * Render a new template into the root.
     */
    render: function() {

        var ui = this

        // Create and insert the template.
        ui.$root[0].innerHTML = createTemplate( ui )

        // Trigger any queued “render” events.
        return ui.trigger( 'render' )
    },



    /**
     * Deconstruct the extension.
     */
    stop: function() {

        var ui = this,
            instance = ui.i

        // If it’s already stopped, do nothing.
        if ( !instance.is.started ) return ui

        // Update the `started` state.
        instance.is.started = false

        // Close the ui.
        ui.close()

        // Check if an input element was used.
        if ( ui.$input ) {

            // Clean up the input element.
            ui.$input.removeClass( ui.klasses.input )

            // Remove the generated host.
            ui.$host.remove()
        }

        else {

            // Remove the “host” class and the tabindex.
            ui.$host.removeClass( ui.klasses.host ).removeAttr( 'tabindex' )

            // Remove the root template content.
            if ( hasShadowRoot ) ui.$host.after( ui.$host.clone() ).remove()
            else ui.$root.remove()
        }

        // Remove the hidden input.
        if ( ui._hidden ) {
            ui._hidden.parentNode.removeChild( ui._hidden )
        }

        // Unbind the events, and remove the stored data
        ui.$source.off( '.' + instance.id ).removeData( 'shadow' )

        // Trigger any queued “stop” event callbacks.
        ui.trigger( 'stop' )

        // Then reset all instance bindings.
        instance.bindings = {}

        return ui
    }, //stop



    /**
     * Open the ui.
     */
    open: function( giveFocus ) {

        var ui = this,
            instance = ui.i

        // Give the ui focus if needed.
        if ( giveFocus === true ) ui.focus()

        // If it’s already open, do nothing.
        if ( instance.is.opened ) return ui

        // Update the `opened` state.
        instance.is.opened = true

        // Add the “opened” class to the ui root.
        ui.$root.addClass( ui.klasses.rootOpened )

        // Bind events to the doc element.
        $document.

            // When a click or focus event is not on the host, input, or root, close the ui.
            // * Note: for Firefox, a click on an `option` element bubbles up directly
            //   to the doc. So make sure the target wasn't the doc.
            on( 'click.' + instance.id + ' focusin.' + instance.id + ' focusout.' + instance.id, function( event ) {
                var target = event.target
                if (
                    ui.$host[0] != target &&
                    ( !ui.$input || ui.$input[0] != target ) &&
                    !ui.$host.find( target ).length &&
                    !ui.$root.find( target ).length &&
                    $document[0] != target
                ) ui.close()
            })

        // Trigger any queued “open” events.
        return ui.trigger( 'open' )
    }, //open



    /**
     * Close the ui.
     */
    close: function( maintainFocus ) {

        var ui = this,
            instance = ui.i

        // If we need to keep focus, do so before changing states.
        if ( maintainFocus === true ) ui.$source.trigger( 'focus' )
        else ui.blur()

        // If it’s already closed, do nothing.
        if ( !instance.is.opened ) return ui

        // Update the `opened` state.
        instance.is.opened = false

        // Remove the “opened” class from the ui root.
        ui.$root.removeClass( ui.klasses.rootOpened )

        // Trigger any queued “close” events.
        return ui.trigger( 'close' )
    }, //close



    /**
     * Focus the ui.
     */
    focus: function() {

        var ui = this,
            instance = ui.i

        // If it’s already focused, do nothing.
        if ( instance.is.focused ) return ui

        // Update the `focused` state.
        instance.is.focused = true

        // Pass focus to the source element if nothing within is focused.
        if ( !ui.get( 'activeElement' ) ) ui.$source.trigger( 'focus' )

        // Add the “active” class to the host.
        ui.$host.addClass( ui.klasses.hostActive )

        // Add the “focused” class to the ui root.
        ui.$root.addClass( ui.klasses.rootActive )

        // Bind the keyboard events.
        $document.on( 'keydown.' + instance.id, function( event ) {

            var keyAction = instance.keys[ event.keyCode ]

            // Check if the ui is focused and there is a key action.
            if ( instance.is.focused && keyAction ) {

                // Prevent the default action to stop page movement.
                event.preventDefault()

                // Trigger the key action within scope of the instance.
                shadow._.trigger( keyAction, instance, [ event ] )
            }
        })

        // Trigger any queued “focus” events.
        return ui.trigger( 'focus' )
    }, //focus



    /**
     * Blur the ui.
     */
    blur: function() {

        var ui = this,
            instance = ui.i

        // If it’s already not focused, do nothing.
        if ( !instance.is.focused ) return ui

        // Update the `focused` state.
        instance.is.focused = false

        // Remove the “active” class from the host.
        ui.$host.removeClass( ui.klasses.hostActive )

        // Remove the “focused” class from the ui root.
        ui.$root.removeClass( ui.klasses.rootActive )

        // Unbind the keyboard events.
        $document.off( '.' + instance.id )

        // Trigger any queued “blur” events.
        return ui.trigger( 'blur' )
    }, //blur



    /**
     * Attach callbacks to events.
     */
    on: function( thing, callback ) {

        var thingName, thingMethod,
            thingIsObject = $.isPlainObject( thing ),
            thingObject = thingIsObject ? thing : {},
            ui = this,
            instance = ui.i

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

        return ui
    }, //on



    /**
     * Fire off any instance bindings by name.
     */
    trigger: function( name, data ) {
        var ui = this,
            methodList = ui.i.bindings[ name ]
        if ( methodList ) {
            methodList.map( function( callback ) {
                shadow._.trigger( callback, ui, [ data ] )
            })
        }
        return ui
    },



    /**
     * Check a state of the ui instance.
     */
    is: function( thing ) {

        var ui = this,
            instance = ui.i

        // Return the instance’s state of the thing.
        return instance.is[ thing ]
    },



    /**
     * Get something from the ui or extension.
     */
    get: function( thing, options ) {

        var ui = this,
            instance = ui.i

        // Check if the value is requested, get the input’s value.
        return thing == 'value' ? ui.$input && ui.$input[0].value :

            // If the hidden value is requested, get the hidden input’s value.
            thing == 'valueHidden' ? ui._hidden && ui._hidden.value :

            // If the active element is requested, check the shadow or the root.
            thing == 'activeElement' ? instance.shadow ?
                instance.shadow[ thing ] :
                ui.$root.find( $document[0][ thing ] )[0] :

            // Otherwise get the thing using the options within scope of the instance.
            shadow._.trigger( instance.get, instance, [ thing, options ] )
    }, //get



    /**
     * Set something within the ui or extension.
     */
    set: function( thing, value, options ) {

        var ui = this,
            instance = ui.i,

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
                thingDefined = shadow._.trigger( instance.set, instance, [ thingItem, thingValue, options ] )

                // Check to update the input value and broadcast a change.
                if ( thingItem == 'select' || thingItem == 'clear' ) {
                    ui.$source.trigger( 'change', [ thingItem, thingValue ] )
                }

                // Trigger any queued “set” events and pass the event.
                ui.trigger( 'set', $.Event( 'set:' + thingItem, { data: thingObject }) )
            } //endfor
        }

        return ui
    }, //set


    /**
     * Add something within the ui or extension.
     */
    add: function( thing, value/*, options*/ ) {

        var ui = this,
            thingDefined = ui.get( thing )

        // Add the value to the collection if the thing doesn’t have the value.
        if ( $.isArray( thingDefined ) && thingDefined.indexOf( value ) < 0 ) {
            thingDefined.push( value )
        }

        return ui
    }, //add


    /**
     * Remove something within the ui or extension.
     */
    remove: function( thing, value/*, options*/ ) {

        var ui = this,
            thingIndex,
            thingDefined = ui.get( thing )

        // Find the index of the value and remove it from the collection.
        if ( $.isArray( thingDefined ) ) {
            thingIndex = thingDefined.indexOf( value )
            if ( thingIndex > -1 ) thingDefined.splice( thingIndex, 1 )
        }

        return ui
    } //remove

} //shadow.UI.prototype



/**
 * Shadow helper methods.
 */
shadow._ = {

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
        prefix = prefix || ''
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
            index = shadow._.trigger( range.min, range ),
            terminal = shadow._.trigger( range.max, range ),
            jump = shadow._.trigger( range.i, range ) || 1

        // Loop from `index` to `terminal` while incrementing by `jump`.
        // Trigger the iterator callback and append it to the result.
        while ( index <= terminal ) {
            result += shadow._.trigger( iterator, range, [ index ] ) || ''
            index += jump
        }

        // Return the concatenated result string.
        return result
    }, //loop


    /**
     * Trigger a function otherwise return the value.
     */
    trigger: function( callback, scope, args ) {
        return $.isFunction( callback ) ? callback.apply( scope, args || [] ) : callback
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
} //shadow._



/**
 * Keep a tracks of the extensions.
 */
shadow.EXTENSIONS = {
    ui: true // reserved.
}


/**
 * Create a ui extension.
 */
shadow.extend = function( extension ) {

    // Make sure we have a usable extension.
    if ( !extension || !extension.name ) {
        throw 'To create a shadow, the extension needs a name.'
    }

    // Make sure this extension doesn’t already exist.
    if ( shadow.EXTENSIONS[ extension.name ] ) {
        throw 'The name “' + extension.name + '” is already reserved by a shadow extension.'
    }
    if ( shadow.EXTENSIONS[ extension.alias ] || $.fn[ extension.alias ] ) {
        throw 'The alias “' + extension.alias + '” is already reserved by a shadow extension or jQuery method.'
    }

    // Store the extension extension by name.
    shadow.EXTENSIONS[ extension.name ] = extension

    // If there’s an alias, create the shorthand link.
    if ( extension.alias ) {

        // Reserve the alias name.
        if ( extension.alias != extension.name ) shadow.EXTENSIONS[ extension.alias ] = extension.name

        // Extend jQuery with the alias.
        $.fn[ extension.alias ] = function() {

            // If the first argument is a string, carry out the action with
            // all the arguments. Otherwise construct a shadow extension
            // using the name and the first argument as options.
            return this.shadow.apply( this, typeof arguments[0] == 'string' ? arguments : [ extension.name, arguments[0] ] )
        }
    }
} //shadow.extend



/**
 * Keep a track of the instances created.
 */
var INSTANCES = {}


/**
 * Build and record a shadow instance.
 */
function createInstance( ui, extension ) {

    if ( !( ui instanceof shadow.UI ) ) throw 'Need a Shadow UI composition to create an instance.'

    var id = 'P' + Math.floor( Math.random() * 1e9 ),

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
            id: id,
            ui: ui,
            name: '',
            content: '',
            alias: null,
            prefix: 'ui-drop',
            shadow: null,
            init: null,
            ready: null,
            is: {
                started: false,
                opened: false,
                focused: false
            },
            keys: {

                // If the target is within the root and “enter” is pressed,
                // prevent the default action and trigger a click instead.
                13: function( event ) {
                    var target = event.target
                    if ( ui.$root.find( target ).length ) {
                        event.preventDefault()
                        target.click()
                    }
                },

                // Any of the arrow keys should open the ui.
                37: ui.open.bind( ui ),
                38: ui.open.bind( ui ),
                39: ui.open.bind( ui ),
                40: ui.open.bind( ui ),

                // Close the ui on “escape”.
                27: ui.close.bind( ui, true )
            },
            defaults: {},
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
                    ui.set( instance.cascades[ thing ], value, options )
                }
                return value
            },
            toFormatArray: function( string ) {
                if ( !instance.formats ) throw 'The shadow extension needs a `formats` option.'
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
                    return shadow._.trigger( formatting.f ? instance.formats[ formatting.f ] : formatting, instance, [ value ] )
                }).join( '' )
            },
            toFormatHash: function( format, value ) {
                var object = {}
                value = value || ''
                instance.toFormatArray( format ).map( function( formatting ) {
                    var formattingLength = formatting.f ? shadow._.trigger( instance.formats[ formatting.f ], instance, [ value, true ] ) : formatting.length
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
 * Create the template for a shadow instance.
 */
function createTemplate( ui ) {

    var classNames = ui.klasses

    // Create the pointer node.
    return shadow._.node({ klass: classNames.pointer }) +

        // Create the wrapped holder.
        shadow._.node({
            klass: classNames.holder,

            // Create the ui frame.
            content: shadow._.node({
                klass: classNames.frame,

                // Create the content wrapper.
                content: shadow._.node({
                    klass: classNames.wrap,

                    // Create a box node.
                    content: shadow._.node({
                        klass: classNames.box,

                        // Attach the extension content.
                        content: shadow._.trigger( ui.i.content, ui.i )
                    })
                })
            })
        })
} //createTemplate



/**
 * Extend jQuery.
 */
$.fn.shadow = function( name, options ) {

    var returnValue,

        // Grab the extension data.
        extension = this.data( 'shadow' )


    // If the ui is needed, return the extension data.
    if ( name == 'ui' ) return extension


    // If the node already has an extension, carry out the action.
    if ( extension ) {

        // Trigger the `name` action and pass all arguments (except `name`).
        returnValue = shadow._.trigger( extension[ name ], extension, [].slice.apply( arguments, [1] ) )

        // If the ui is returned, allow for jQuery chaining.
        // Otherwise return the value from the ui’s method.
        return returnValue instanceof shadow.UI ? this : returnValue
    }


    // Otherwise grab the extension by name from the collection.
    extension = shadow.EXTENSIONS[ name ]

    // Confirm an extension was found.
    if ( !extension ) throw 'No extension found by the name of “' + name + '”.'

    // Go through each matched element and compose extensions.
    return this.each( function() {
        var $this = $( this )
        if ( !$this.data( 'shadow' ) ) {
            new shadow.UI( $this, extension, options )
        }
    })
}

$.fn.shadow.extend = shadow.extend

}));



