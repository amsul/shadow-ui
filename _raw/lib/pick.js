
/*!
 * {%= pkg.title %} v{%= pkg.version %}, {%= grunt.template.today("yyyy/mm/dd") %}
 * By {%= pkg.author.name %}, {%= pkg.author.url %}
 * Hosted on {%= pkg.homepage %}
 * Licensed under {%= pkg.licenses[0].type %}
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

    if ( !( picker instanceof PickExtension ) ) throw 'Need a picker composition to create an instance.'

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
            picker: picker,
            name: '',
            content: '',
            alias: null,
            prefix: 'pick-drop',
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
                    if ( picker.$root.find( target ).length ) {
                        event.preventDefault()
                        target.click()
                    }
                },

                // Any of the arrow keys should open the picker.
                37: picker.open.bind( picker ),
                38: picker.open.bind( picker ),
                39: picker.open.bind( picker ),
                40: picker.open.bind( picker ),

                // Close the picker on “escape”.
                27: picker.close.bind( picker, true )
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
                value = value || ''
                instance.toFormatArray( format ).map( function( formatting ) {
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

    // Create the pointer node.
    return Pick._.node({ klass: classNames.pointer }) +

        // Create the wrapped holder.
        Pick._.node({
            klass: classNames.holder,

            // Create the picker frame.
            content: Pick._.node({
                klass: classNames.frame,

                // Create the content wrapper.
                content: Pick._.node({
                    klass: classNames.wrap,

                    // Create a box node.
                    content: Pick._.node({
                        klass: classNames.box,

                        // Attach the extension content.
                        content: Pick._.trigger( picker.i.content, picker.i )
                    })
                })
            })
        })
} //createTemplate



/**
 * The constructor that composes a pick extension.
 */
function PickExtension( $element, extension, options ) {

    var picker = this,
        nodeName = $element[0].nodeName

    // Link up the source element.
    picker.$source = $element

    // Link up the host or input.
    if ( nodeName.match( /INPUT|TEXTAREA/ ) ) picker.$input = $element
    else picker.$host = $element

    // Link up (as reference) the extension and options passed.
    picker.r = {
        extension: extension,
        options: options
    }

    // Create an instance using the picker and extension.
    picker.i = createInstance( picker, extension )

    // Create settings by merging the defaults and options passed.
    picker.settings = $.extend( true, {}, picker.i.defaults, options )

    // Create class names by merging the prefixed defaults with the settings.
    picker.klasses = Pick._.prefix( picker.i.prefix, $.extend( {}, Pick._.klasses(), picker.settings.klass ) )

    // Start up the picker.
    picker.start()
}



/**
 * The extension composer prototype.
 */
PickExtension.prototype = {

    constructor: PickExtension,


    /**
     * Construct the extension.
     */
    start: function() {

        var template,
            picker = this,
            instance = picker.i,
            valueHidden = picker.$source.attr( 'data-value' )


        // If it’s already started, do nothing.
        if ( instance.is.started ) return picker


        // Before starting, trigger the instance’s `init` method.
        // If there’s the need, parse the input value into a format-value hash.
        Pick._.trigger( picker.i.init, picker.i, [
            picker.i.formats ?
                picker.i.toFormatHash( valueHidden ? picker.settings.formatHidden : picker.settings.format, valueHidden || picker.$source[0].value ) :
                null
        ])


        // Update the `started` state.
        instance.is.started = true


        // Register the default settings events.
        picker.on({
            start: picker.settings.onStart,
            render: picker.settings.onRender,
            stop: picker.settings.onStop,
            open: picker.settings.onOpen,
            close: picker.settings.onClose,
            focus: picker.settings.onFocus,
            blur: picker.settings.onBlur,
            set: picker.settings.onSet
        })


        // If there’s an input element, create a host.
        if ( picker.$input ) {

            // Create a host element to hold the picker root and bind
            // the default click and focus events to open the picker.
            picker.$host = $( '<div/>' ).on( 'click focusin', picker.open.bind( picker, true ) )

            // Add the “input” class and insert the host.
            picker.$input.addClass( picker.klasses.input ).after( picker.$host )

            // Listen for changes to update the input value.
            picker.$source.on( 'change.' + instance.id, function() {
                picker.$input[0].value = picker.get( 'select', { format: picker.settings.format } )
            })
        }

        // If there isn’t an input, make the host “tab-able”.
        else picker.$host[0].tabIndex = 0


        // Add the “host” class to the element.
        picker.$host.addClass( picker.klasses.host )


        // If there’s a hidden formatting, prepare the hidden input.
        if ( picker.settings.formatHidden ) {

            // If there’s a format for the hidden input, create it
            // with the name of the original input and a suffix.
            picker._hidden = $( '<input ' +
                'value="' + ( valueHidden || picker.get( 'select', { format: picker.settings.formatHidden } ) ) + '"' +
                'name="' + ( picker.$input ? picker.$input[0].name : '' ) + ( picker.settings.suffixHidden || '_formatted' ) + '"' +
                'type=hidden>'
            )[0]

            // Add the hidden input after the source and
            // listen for changes to update the hidden value.
            picker.$source.after( picker._hidden ).on( 'change.' + instance.id, function() {
                picker._hidden.value = picker.get( 'select', { format: picker.settings.formatHidden } )
            })
        }


        // Prepare the source element.
        picker.$source.

            // Open the picker with focus on a click or focus within.
            on( 'click.' + instance.id + ' focusin.' + instance.id, picker.open.bind( picker, true ) ).

            // Prevent focus out of the host from bubbling up
            // so that a loss of focus within doesn’t close the picker.
            on( 'focusout.' + instance.id, function( event ) {
                event.stopPropagation()
            }).

            // Store the extension data.
            data( 'pick', picker )


        // Create and insert the root template into the host.
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
            on( 'focusin', picker.open.bind( picker, true ) ).

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
                if ( match ) picker.set( match[1], match[2] )
            }).

            // If a click reaches the root itself, stop bubbling and close it.
            on( 'click', function( event ) {
                if ( this == event.target ) {
                    event.stopPropagation()
                    picker.close( true )
                }
            })


        // Trigger any queued “render” events.
        picker.trigger( 'render' )


        // Trigger the instance `ready` method after the host and root are prepared.
        Pick._.trigger( instance.ready, instance )


        // Trigger any queued “start” events.
        return picker.trigger( 'start' )
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
            instance = picker.i

        // If it’s already stopped, do nothing.
        if ( !instance.is.started ) return picker

        // Update the `started` state.
        instance.is.started = false

        // Close the picker.
        picker.close()

        // Check if an input element was used.
        if ( picker.$input ) {

            // Clean up the input element.
            picker.$input.removeClass( picker.klasses.input )

            // Remove the generated host.
            picker.$host.remove()
        }

        else {

            // Remove the “host” class and the tabindex.
            picker.$host.removeClass( picker.klasses.host ).removeAttr( 'tabindex' )

            // Remove the root template content.
            if ( hasShadowRoot ) picker.$host.after( picker.$host.clone() ).remove()
            else picker.$root.remove()
        }

        // Remove the hidden input.
        if ( picker._hidden ) {
            picker._hidden.parentNode.removeChild( picker._hidden )
        }

        // Unbind the events, and remove the stored data
        picker.$source.off( '.' + instance.id ).removeData( 'pick' )

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
            instance = picker.i

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
                    !picker.$host.find( target ).length &&
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
            instance = picker.i

        // If we need to keep focus, do so before changing states.
        if ( maintainFocus === true ) picker.$source.trigger( 'focus' )
        else picker.blur()

        // If it’s already closed, do nothing.
        if ( !instance.is.opened ) return picker

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
            instance = picker.i

        // If it’s already focused, do nothing.
        if ( instance.is.focused ) return picker

        // Update the `focused` state.
        instance.is.focused = true

        // Pass focus to the source element if nothing within is focused.
        if ( !picker.get( 'activeElement' ) ) picker.$source.trigger( 'focus' )

        // Add the “active” class to the host.
        picker.$host.addClass( picker.klasses.hostActive )

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
            instance = picker.i

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
            instance = picker.i

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
            methodList = picker.i.bindings[ name ]
        if ( methodList ) {
            methodList.map( function( callback ) {
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
            instance = picker.i

        // Return the instance’s state of the thing.
        return instance.is[ thing ]
    },



    /**
     * Get something from the picker or extension.
     */
    get: function( thing, options ) {

        var picker = this,
            instance = picker.i

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
     * Set something within the picker or extension.
     */
    set: function( thing, value, options ) {

        var picker = this,
            instance = picker.i,

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
                    picker.$source.trigger( 'change', [ thingItem, thingValue ] )
                }

                // Trigger any queued “set” events and pass the event.
                picker.trigger( 'set', $.Event( 'set:' + thingItem, { data: thingObject }) )
            } //endfor
        }

        return picker
    }, //set


    /**
     * Add something within the picker or extension.
     */
    add: function( thing, value/*, options*/ ) {

        var picker = this,
            thingDefined = picker.get( thing )

        // Add the value to the collection if the thing doesn’t have the value.
        if ( $.isArray( thingDefined ) && thingDefined.indexOf( value ) < 0 ) {
            thingDefined.push( value )
        }

        return picker
    }, //add


    /**
     * Remove something within the picker or extension.
     */
    remove: function( thing, value/*, options*/ ) {

        var picker = this,
            thingIndex,
            thingDefined = picker.get( thing )

        // Find the index of the value and remove it from the collection.
        if ( $.isArray( thingDefined ) ) {
            thingIndex = thingDefined.indexOf( value )
            if ( thingIndex > -1 ) thingDefined.splice( thingIndex, 1 )
        }

        return picker
    } //remove

} //PickExtension.prototype



/**
 * PickExtension helper methods.
 */
Pick._ = {


    /**
     * Keep a storage of the extensions.
     */
    EXTENSIONS: {

        // Reserved name.
        picker: true
    },


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
            index = Pick._.trigger( range.min, range ),
            terminal = Pick._.trigger( range.max, range ),
            jump = Pick._.trigger( range.i, range ) || 1

        // Loop from `index` to `terminal` while incrementing by `jump`.
        // Trigger the iterator callback and append it to the result.
        while ( index <= terminal ) {
            result += Pick._.trigger( iterator, range, [ index ] ) || ''
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
} //Pick._



/**
 * Create a picker extension.
 */
Pick.extend = function( extension ) {

    // Make sure we have a usable extension.
    if ( !extension || !extension.name ) {
        throw 'To create a picker, the extension needs a name.'
    }

    // Make sure this extension doesn’t already exist.
    if ( Pick._.EXTENSIONS[ extension.name ] ) {
        throw 'The name “' + extension.name + '” is already reserved by a picker extension.'
    }
    if ( Pick._.EXTENSIONS[ extension.alias ] || $.fn[ extension.alias ] ) {
        throw 'The alias “' + extension.alias + '” is already reserved by a picker extension or jQuery method.'
    }

    // Store the extension extension by name.
    Pick._.EXTENSIONS[ extension.name ] = extension

    // If there’s an alias, create the shorthand link.
    if ( extension.alias ) {

        // Reserve the alias name.
        if ( extension.alias != extension.name ) Pick._.EXTENSIONS[ extension.alias ] = extension.name

        // Extend jQuery with the alias.
        $.fn[ extension.alias ] = function() {

            // If the first argument is a string, carry out the action with
            // all the arguments. Otherwise construct a picker extension
            // using the name and the first argument as options.
            return this.pick.apply( this, typeof arguments[0] == 'string' ? arguments : [ extension.name, arguments[0] ] )
        }
    }
} //Pick.extend



/**
 * Extend jQuery.
 */
$.fn.pick = function( name, options ) {

    var returnValue,

        // Grab the extension data.
        extension = this.data( 'pick' )


    // If the picker is needed, return the extension data.
    if ( name == 'picker' ) return extension


    // If the node already has an extension, carry out the action.
    if ( extension ) {

        // Trigger the `name` action and pass all arguments (except `name`).
        returnValue = Pick._.trigger( extension[ name ], extension, [].slice.apply( arguments, [1] ) )

        // If the picker is returned, allow for jQuery chaining.
        // Otherwise return the value from the picker’s method.
        return returnValue instanceof PickExtension ? this : returnValue
    }


    // Otherwise grab the extension by name from the collection.
    extension = Pick._.EXTENSIONS[ name ]

    // Confirm an extension was found.
    if ( !extension ) throw 'No extension found by the name of “' + name + '”.'

    // Go through each matched element and compose extensions.
    return this.each( function() {
        var $this = $( this )
        if ( !$this.data( 'pick' ) ) {
            new PickExtension( $this, extension, options )
        }
    })
}

$.fn.pick.extend = Pick.extend

}));



