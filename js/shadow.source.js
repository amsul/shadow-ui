
/*!
 * {%= pkg.title %} v{%= pkg.version %}, {%= grunt.template.today("yyyy/mm/dd") %}
 * By {%= pkg.author.name %}, {%= pkg.author.url %}
 * Hosted on {%= pkg.homepage %}
 * Licensed under {%= pkg.licenses[0].type %}
 */

(function ( root, factory ) {

    // Setup the exports for Node module pattern...
    if ( typeof module == 'object' && typeof module.exports == 'object' )
        module.exports = factory( require('jquery') )

    // ...AMD...
    else if ( typeof define == 'function' && define.amd )
        define( ['jquery'] )

    // ...and basic <script> includes.
    else root.shadow = factory( jQuery )

}( this, function( $ ) {

'use strict';



var

/**
 * Create some shorthands.
 */
$document = $( document ),
hasShadowRoot = 'webkitCreateShadowRoot' in document.documentElement,


/**
 * Create the shadow object.
 */
shadow = {
    VERSION: '{%= pkg.version %}'
}



/**
 * The constructor that composes a shadow ui component.
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

    // Right after creating one, trigger the `init` method.
    // If there’s the need, parse the input value into a format-value hash.
    shadow._.trigger( ui.i.init, ui.i, [
        ui.i.formats ?
            ui.i.toFormatHash( valueHidden ? ui.settings.formatHidden : ui.settings.format, valueHidden || $element[0].value ) :
            null
    ])

    // Create the class names by merging the settings into the prefixed defaults.
    ui.klasses = $.extend( shadow._.prefix( ui.i.prefix, $.extend( {}, ui.i.klasses ) ), ui.settings.klasses )

    // Start up the ui with the starting value.
    ui.start( valueHidden )
}



/**
 * The extension composer prototype.
 */
shadow.UI.prototype = {

    constructor: shadow.UI,


    /**
     * Start up the component.
     */
    start: function( valueHidden ) {

        var template,
            ui = this,
            instance = ui.i,
            settings = ui.settings


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
            ui.$source.on( 'change.' + instance.id, function( event, thingChanged ) {
                ui.$input[0].value = thingChanged == 'clear' ? '' : ui.get( 'select', { format: settings.format } )
            })
        }

        // If there isn’t an input, make the host “tab-able”.
        else ui.$host[0].tabIndex = 0


        // Add the “host” class to the element.
        ui.$host.addClass( ui.klasses.host )


        // If there’s a hidden formatting, prepare the hidden input.
        if ( settings.formatHidden ) {

            // If there’s a format for the hidden input, create it
            // with the name of the original input and a suffix.
            ui._hidden = $( '<input ' +
                'value="' + ( valueHidden || ui.get( 'select', { format: settings.formatHidden } ) ) + '" ' +
                'name="' +
                    ( settings.nameHidden || ( ui.$input ? ui.$input[0].name : '' ) ) +
                    ( settings.suffixHidden || '' ) +
                '" ' +
                'type=hidden>'
            )[0]

            // Add the hidden input after the source and
            // listen for changes to update the hidden value.
            ui.$source.after( ui._hidden ).on( 'change.' + instance.id, function( event, thingChanged ) {
                ui._hidden.value = thingChanged == 'clear' ? '' :  ui.get( 'select', { format: settings.formatHidden } )
            })
        }


        // Prepare the source element.
        ui.$source.

            // When the source is focused, capture the ui.
            on( 'focus', ui.capture.bind( ui ) ).

            // When the source is blurred, close and release the ui.
            // * A blur within the root doesn’t bubble up.
            on( 'blur', function() {
                ui.close().release( ui )
            }).

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
        template = shadow._.node({ klass: ui.klasses.root, content: createTemplate( ui, true ) })
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

            // When something within the root is focused, open and release the ui.
            on( 'focusin DOMFocusIn', function() {
                ui.open( true ).release()
            }).

            // When the source element is focused into again, capture the ui.
            on( 'blur DOMFocusOut', function( event ) {
                if ( event.relatedTarget == ui.$source[0] ) {
                    event.stopPropagation()
                    ui.capture()
                }
            }).

            // When “enter” is pressed on an action-able thing, trigger a click instead.
            on( 'keydown', '[data-action]', function( event ) {
                if ( event.keyCode == 13 ) {
                    event.preventDefault()
                    this.click()
                }
            }).

            // When actions are getting triggered, any click events within the
            // root shouldn’t bubble up, forms shouldn’t be submitted,
            // and focus should be maintained on the `document.activeElement`.
            on( 'click mousedown', '[data-action]', function( event ) {
                event.stopPropagation()
                event.preventDefault()
            }).

            // When something within the root is clicked, set the thing.
            on( 'click', '[data-action]', function() {

                // Match an “action” selection formatted as `<thing>:<value>:<option>`
                var match = $( this ).data( 'action' ).split( ':' ).map( function( item ) {
                    return item.match( /^-?\d+$/ ) ? +item : item
                })

                // If there’s a match, set it.
                if ( match.length ) ui.set( match[0], match[1], match[2] )
            }).

            // If a click reaches the root itself, stop bubbling and close it.
            on( 'click', function( event ) {
                if ( this == event.target ) {
                    event.stopPropagation()
                    ui.close( true )
                }
            })


        // Register the default settings events.
        ui.on({
            start: settings.onStart,
            render: settings.onRender,
            stop: settings.onStop,
            open: settings.onOpen,
            close: settings.onClose,
            focus: settings.onFocus,
            blur: settings.onBlur,
            capture: settings.onCapture,
            release: settings.onRelease,
            set: settings.onSet
        })


        // Trigger any queued “start” and “render” events.
        return ui.trigger( 'start' ).trigger( 'render' )
    }, //start



    /**
     * Render a new template into the `root` or `box`.
     */
    render: function( intoRoot ) {

        var ui = this,
            $node = intoRoot ? ui.$root : ui.$root.find( '.' + ui.klasses.box ),
            activeElement = ui.get( 'activeElement' ),
            activeElementClassName = activeElement && activeElement.className

        // Create and insert the template.
        $node[0].innerHTML = createTemplate( ui, intoRoot )

        // If there was an active element within the shadow,
        // try to focus back on it. Otherwise re-focus the ui.
        if ( activeElementClassName ) {
            activeElement = ui.$root.find( '.' + activeElementClassName )
            if ( activeElement ) activeElement[0].focus()
            else ui.focus()
        }

        // Trigger any queued “render” events.
        return ui.trigger( 'render' )
    }, //render



    /**
     * Stop the component.
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
     * Open the component.
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

            // When a click or focus event is not on the host, input, or root, close and release the ui.
            // * Note: for Firefox, a click on an `option` element bubbles up directly
            //   to the doc. So make sure the target wasn't the doc.
            on( 'click.' + instance.id + ' focusin.' + instance.id + ' focusout.' + instance.id, function( event ) {
                var target = event.target
                if (
                    ui.$host[0] != target &&
                    ( !ui.$input || ui.$input[0] != target ) &&
                    !$.contains( ui.$host[0], target ) &&
                    !$.contains( ui.$root[0], target ) &&
                    $document[0] != target
                ) ui.close().release()
            })

        // Trigger any queued “open” events.
        return ui.trigger( 'open' )
    }, //open



    /**
     * Close the component.
     */
    close: function( maintainFocus ) {

        var ui = this,
            instance = ui.i

        // If we need to keep focus, do so before changing states.
        if ( maintainFocus === true ) ui.focus()
        else ui.blur()

        // If it’s already closed, do nothing.
        if ( !instance.is.opened ) return ui

        // Update the `opened` state.
        instance.is.opened = false

        // If something within is focused while closing, focus back onto the source.
        if ( ui.get( 'activeElement' ) ) ui.$source[0].focus()

        // Remove the “opened” class from the ui root.
        ui.$root.removeClass( ui.klasses.rootOpened )

        // Trigger any queued “close” events.
        return ui.trigger( 'close' )
    }, //close



    /**
     * Focus the component.
     */
    focus: function() {

        var ui = this,
            instance = ui.i

        // If nothing within is focused, pass focus to the source element.
        // * Trigger the focus on the actual element because jQuery 1.9+ has
        //   blur/focus bindings that cause an infinite loop when already focused.
        if ( !ui.get( 'activeElement' ) ) ui.$source[0].focus()

        // If it’s already focused, do nothing.
        if ( instance.is.focused ) return ui

        // Update the `focused` state.
        instance.is.focused = true

        // Add the “focused” class to the ui root.
        ui.$root.addClass( ui.klasses.rootFocused )

        // Trigger any queued “focus” events.
        return ui.trigger( 'focus' )
    }, //focus



    /**
     * Blur the component.
     */
    blur: function() {

        var ui = this,
            instance = ui.i

        // If it’s already not focused, do nothing.
        if ( !instance.is.focused ) return ui

        // Update the `focused` state.
        instance.is.focused = false

        // Remove the “focused” class from the ui root.
        ui.$root.removeClass( ui.klasses.rootFocused )

        // Trigger any queued “blur” events.
        return ui.trigger( 'blur' )
    }, //blur



    /**
     * Capture the component events.
     */
    capture: function() {

        var ui = this,
            instance = ui.i

        // If it’s already captured, do nothing.
        if ( instance.is.captured ) return ui

        // Update the `captured` state.
        instance.is.captured = true

        // Add the “captured” class to the root.
        ui.$root.addClass( ui.klasses.rootCaptured )

        // Bind the keyboard events.
        $document.on( 'keydown.' + instance.id, function( event ) {

            var keyAction = instance.keys[ event.keyCode ]

            // Check if the ui is focused and there is a key action.
            if ( instance.is.focused && keyAction ) {

                // If it’s not opened, prevent the default action.
                if ( !instance.is.opened ) {
                    event.preventDefault()
                }

                // Trigger the key action within scope of the instance.
                shadow._.trigger( keyAction, instance, [ event ] )
            }
        })

        // Trigger any queued “capture” events.
        return ui.trigger( 'capture' )
    }, //capture



    /**
     * Release the component events.
     */
    release: function() {

        var ui = this,
            instance = ui.i

        // If it’s already not captured, do nothing.
        if ( !instance.is.captured ) return ui

        // Update the `captured` state.
        instance.is.captured = false

        // Remove the “captured” class from the root.
        ui.$root.removeClass( ui.klasses.rootCaptured )

        // Unbind the keyboard events.
        $document.off( '.' + instance.id )

        // Trigger any queued “release” events.
        return ui.trigger( 'release' )
    }, //release



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
    trigger: function( name, options ) {
        var ui = this,
            methodList = ui.i.bindings[ name ]
        if ( methodList ) {
            methodList.map( function( callback ) {
                shadow._.trigger( callback, ui, [ $.Event( name, options ) ] )
            })
        }
        return ui
    },



    /**
     * Check a state of the component.
     */
    is: function( thing ) {

        var ui = this,
            instance = ui.i

        // Return the instance’s state of the thing.
        return instance.is[ thing ]
    },



    /**
     * Get something from the component extension.
     */
    get: function( thing, options ) {

        var ui = this,
            instance = ui.i

        // Make sure we have usable options.
        options = typeof options == 'string' ? { format: options } : options || {}

        // Check if the value is requested, get the input’s value.
        return thing == 'value' ? ui.$input && ui.$input[0].value :

            // If the hidden value is requested, get the hidden input’s value.
            thing == 'valueHidden' ? ui._hidden && ui._hidden.value :

            // If the active element is requested, check the shadow or the root.
            thing == 'activeElement' ? instance.shadow ?
                instance.shadow[ thing ] :
                ui.$root.find( $document[0][ thing ] )[0] :

            // Otherwise fetch it from the instance dict.
            thing in instance.dict && typeof options.format == 'string' && instance.formats ?
                instance.toFormatString( options.format, instance.dict[ thing ] ) :
                instance.dict[ thing ]
    }, //get



    /**
     * Set something within the component extension.
     */
    set: function( thing, value, options ) {

        var ui = this,
            instance = ui.i,

            thingItem, thingValue,
            thingIsObject = $.isPlainObject( thing ),
            thingObject = thingIsObject ? thing : {}

        if ( thing ) {

            // If the thing isn’t an object, make it one.
            if ( !thingIsObject ) thingObject[ thing ] = value

            // Go through the things of items to set with the corresponding diction.
            for ( thingItem in thingObject ) if ( thingItem in instance.dict || thingItem == 'clear' ) {

                // Grab the value of the thing.
                thingValue = thingObject[ thingItem ]

                // Check if the thing has a queue.
                if ( instance.queue[ thingItem ] ) {

                    // Update the value by triggering the queued methods.
                    /*jshint loopfunc: true */
                    instance.queue[ thingItem ].split(' ').map( function( method ) {
                        thingValue = shadow._.trigger( instance[ method ], instance, [ thingValue, options ] )
                    })
                    /*jshint loopfunc: false */
                }

                // Update the diction with the final value.
                if ( $.isArray( instance.dict[ thingItem ] ) ) {
                    instance.dict[ thingItem ] = $.isArray( thingValue ) ? thingValue : [ thingValue ]
                }
                else instance.dict[ thingItem ] = thingValue

                // Check if it’s a “changing” update and broadcast a change.
                if ( thingItem == 'select' || thingItem == 'clear' ) {
                    ui.$source.trigger( 'change', [ thingItem, thingValue ] )
                }

                // Trigger any queued “set” events and pass the data.
                ui.trigger( 'set', { item: thingItem, value: thingValue, options: options } )

                // If there’s any cascades, set those things as well.
                if ( instance.cascades[ thingItem ] ) {
                    ui.set( instance.cascades[ thingItem ], thingValue, options )
                }
            } //endfor
        }

        return ui
    }, //set


    /**
     * Add something within the component extension.
     */
    add: function( thing, value/*, options*/ ) {

        var ui = this,
            instance = ui.i,
            thingCollection = instance.dict[ thing ]

        // Only add something if it’s an array.
        if ( $.isArray( thingCollection ) ) {

            // Add each value item not within the collection.
            ( $.isArray( value ) ? value : [value] ).forEach( function( item ) {
                if ( thingCollection.indexOf( item ) < 0 ) thingCollection.push( item )
            })

            // Check if it’s a “changing” update and broadcast a change.
            if ( thing == 'select' ) {
                ui.$source.trigger( 'change', [ thing, thingCollection ] )
            }

            // Trigger any queued “add” events and pass the data.
            ui.trigger( 'add', { item: thingCollection } )
        }

        return ui
    }, //add


    /**
     * Remove something within the component extension.
     */
    remove: function( thing, value/*, options*/ ) {

        var ui = this,
            instance = ui.i,
            thingCollection = instance.dict[ thing ]

        // Only remove something if it’s an array.
        if ( $.isArray( thingCollection ) ) {

            // Find the index of the value and remove it from the collection.
            var thingIndex = thingCollection.indexOf( value )
            if ( thingIndex > -1 ) thingCollection.splice( thingIndex, 1 )

            // Check if it’s a “changing” update and broadcast a change.
            if ( thing == 'select' ) {
                ui.$source.trigger( 'change', [ thing, thingCollection ] )
            }

            // Trigger any queued “remove” events and pass the data.
            ui.trigger( 'remove', { item: thingCollection } )
        }

        return ui
    } //remove

} //shadow.UI.prototype



/**
 * Shadow helper methods.
 */
shadow._ = {

    /**
     * Prefix a single class or an object of classes.
     */
    prefix: function( prefix, klasses ) {
        var bemPrefixify = function( klass ) {
                return klass ?
                        klass.match( /^ / ) ? klass.replace( /^ /, '' ) :
                        prefix + ( klass.match( /^-/ ) ? '' : '__' ) + klass :
                    prefix
            }
        prefix = prefix || ''
        if ( $.isPlainObject( klasses ) ) {
            for ( var index in klasses ) {
                var klass = klasses[ index ]
                klass = $.isArray( klass ) ? klass : [ klass ]
                klasses[ index ] = klass.map( bemPrefixify ).join(' ')
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

        var content = shadow._.trigger( options.content, options ),
            element = options.el || 'div',
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

    return extension
} //shadow.extend


/**
 * Build and record a shadow instance.
 */
function createInstance( ui, extension ) {

    if ( !( ui instanceof shadow.UI ) ) throw 'Need a Shadow UI composition to create an instance.'

    var regexFormats = new RegExp(

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

        instance = $.extend( true, {
            id: 'S' + Math.floor( Math.random() * 1e9 ),
            ui: ui,
            name: null,
            template: null,
            alias: null,
            prefix: 'ui-drop',
            shadow: null,
            init: null,
            is: {
                started: false,
                opened: false,
                focused: false,
                captured: false
            },
            keys: {

                // If the target is within the root and “enter” is pressed,
                // prevent the default action and trigger a click instead.
                13: function( event ) {
                    var target = event.target
                    if ( $.contains( ui.$root[0], target ) ) {
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
            klasses: {

                host: '-host',

                input: '-input',

                root: '',
                rootOpened: '--opened',
                rootFocused: '--focused',
                rootCaptured: '--captured',

                holder: 'holder',

                pointer: 'pointer',

                frame: 'frame',
                wrap: 'wrap',

                box: 'box'
            },
            defaults: {
                format: null,
                formatHidden: null,
                nameHidden: null,
                suffixHidden: '_formatted',
                klasses: null
            },
            bindings: {},
            dict: {
                select: 0,
                highlight: 0
            },
            queue: {},
            cascades: {
                select: 'highlight'
            },
            formats: null,
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
        }, extension ) //instance


    // Return the instance.
    return instance
} //createInstance



/**
 * Create the template for a shadow instance.
 */
function createTemplate( ui, asFullTemplate ) {

    var componentTemplate = shadow._.trigger( ui.i.template, ui.i )

    // If just the face of the component is needed, return that.
    return !asFullTemplate ? componentTemplate :

        // Create the pointer node.
        shadow._.node({ klass: ui.klasses.pointer }) +

        // Create the wrapped holder.
        shadow._.node({
            klass: ui.klasses.holder,

            // Create the ui frame.
            content: shadow._.node({
                klass: ui.klasses.frame,

                // Create the content wrapper.
                content: shadow._.node({
                    klass: ui.klasses.wrap,

                    // Create a box node.
                    content: shadow._.node({
                        klass: ui.klasses.box,

                        // Attach the component template.
                        content: componentTemplate
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



/**
 * Export the shadow object.
 */
return shadow

}));



