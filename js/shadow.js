
/*!
 * Shadow UI v0.5.0, 2013/09/13
 * By Amsul, http://amsul.ca
 * Hosted on http://amsul.github.io/shadow-ui
 * Licensed under MIT
 */

(function ( root, factory ) {

    // Setup the exports for Node module pattern...
    if ( typeof module == 'object' && typeof module.exports == 'object' )
        module.exports = factory( require('jquery') )

    // ...AMD...
    else if ( typeof define == 'function' && define.amd )
        define( ['jquery'] )

    // ...and basic `script` includes.
    else root.shadow = factory( jQuery )

}( this, function( $ ) { 'use strict';



/**
 * Create some shorthands.
 */
var $document = $( document ),
    hasShadowRoot = 'webkitCreateShadowRoot' in document.documentElement



/**
 * Create a shadow element.
 */
function shadow( elementName, elementOptions ) {


    // Make sure we have an element name.
    if ( !elementName ) throw 'To create a shadow, the element needs a name.'

    // Make sure this element doesn’t already exist.
    if ( shadow.ELEMENTS[ elementName ] ) throw 'The name “' + elementName + '” is already reserved by a shadow element.'


    // Make sure we have usable options.
    elementOptions = $.isPlainObject( elementOptions ) ? elementOptions : {}


    // If there’s an alias, create the shorthand link.
    if ( elementOptions.alias ) {

        // Make sure we aren’t overriding anything.
        if ( shadow.ELEMENTS[ elementOptions.alias ] || $.fn[ elementOptions.alias ] ) {
            throw 'The alias “' + elementOptions.alias + '” is already reserved by a shadow element or jQuery method.'
        }

        // Reserve the alias name.
        if ( elementOptions.alias != elementName ) {
            shadow.ELEMENTS[ elementOptions.alias ] = elementName
        }

        // Extend jQuery with the alias.
        $.fn[ elementOptions.alias ] = function( options ) {
            return this.shadow( options, elementName )
        }
    }


    // Store the element by name.
    shadow.ELEMENTS[ elementName ] = $.extend( true, {}, shadow.DEFAULTS, elementOptions, {
        name: elementName,
        formatsExpression: elementOptions.formats ?

            new RegExp(

                // Match any [escaped] characters.
                '(\\[[^\\[]*\\])|(' +

                // Match any formatting characters.
                Object.keys( elementOptions.formats ).
                    sort(function(a,b) { return b > a ? 1 : -1 }).
                    join('|') + '|' +

                // Match all other characters.
                '.)', 'g' ) :

            null
    })


    // Find any of these nodes and create the shadow element.
    $( '[data-ui=' + elementName + ']' ).toArray().forEach( shadow.create.bind( null, elementName ) )


    // Return the shadow element.
    return shadow.ELEMENTS[ elementName ]
} //shadow



/**
 * Attach the version number.
 */
shadow.VERSION = '0.5.0'



/**
 * Keep a tracks of the elements.
 */
shadow.ELEMENTS = {
    ui: true // reserved.
}



/**
 * Set the element defaults.
 */
shadow.DEFAULTS = {

    name: null,
    template: null,
    alias: null,
    prefix: 'ui-drop',

    init: null,
    bindings: {},

    is: {
        started: false,
        opened: false,
        focused: false,
        captured: false
    },

    keys: {},

    formats: null,

    dict: {
        select: 0,
        highlight: 0
    },
    cascades: {
        select: 'highlight'
    },
    find: {},
    create: {},

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

    toFormatArray: function( string ) {
        var instance = this
        if ( !instance.formats ) throw 'The shadow extension needs a `formats` option.'
        return ( string || '' ).split( instance.formatsExpression ).reduce( function( array, value ) {
            if ( value ) array.push(
                value in instance.formats ? { f: value } :
                value.match( /^\[.*]$/ ) ? value.replace( /^\[(.*)]$/, '$1' ) :
                value
            )
            return array
        }, [] )
    },
    toFormatString: function( format, value ) {
        var instance = this
        return instance.toFormatArray( format ).map( function( formatting ) {
            return shadow._.trigger( formatting.f ? instance.formats[ formatting.f ] : formatting, instance, [ value ] )
        }).join( '' )
    },
    toFormatHash: function( format, value ) {
        var instance = this,
            object = {}
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
} //shadow.DEFAULTS



/**
 * The wrapper that creates a new shadow element.
 */
shadow.create = function( elementName, sourceNode, options ) {
    return new ShadowElement( sourceNode, shadow.ELEMENTS[ elementName ], $.isPlainObject( options ) ? options : {} )
}



/**
 * The constructor that composes a shadow ui component.
 */
function ShadowElement( sourceNode, shadowElement, options ) {

    var ui = this,
        $element = $( sourceNode ),
        elementData = $element.data()

    // If it’s already a shadow element, do nothing.
    if ( elementData.shadow instanceof ShadowElement ) return

    // Go through the data and update the options.
    for ( var prop in elementData ) {
        if ( prop.match(/^ui./) ) {
            options[ prop[2].toLowerCase() + prop.replace(/^ui./, '' ) ] = elementData[ prop ]
        }
    }

    // Check if there’s a value that shouldn’t be parsed by jQuery.
    options.valueHidden = $element.attr('data-value') || options.valueHidden

    // Link up the source element.
    ui.$source = $element

    // Link up the host or input.
    if ( sourceNode.nodeName.match( /INPUT|TEXTAREA/ ) ) ui.$input = $element
    else ui.$host = $element

    // Link up the instance using the ui and shadow element.
    ui.i = $.extend( true, {}, shadowElement, {
        id: sourceNode.id || 'ui-' + shadowElement.name + '-' + Math.floor( Math.random() * 1e11 ),
        ui: ui,
        shadow: null
    })

    // Create settings by merging the defaults and options passed.
    ui.settings = $.extend( true, {}, ui.i.defaults, options )

    // Right after creating one, trigger the `init` method.
    // If there’s the need, parse the input value into a format-value hash.
    shadow._.trigger( ui.i.init, ui.i, ui.i.formats ? [
        ui.i.toFormatHash(
            options.valueHidden ?
                ui.settings.formatHidden :
                ui.settings.format,
            options.valueHidden || sourceNode.value
        ),
        !!options.valueHidden
    ] : null )

    // Create the class names by merging the settings into the prefixed defaults.
    ui.klasses = $.extend( shadow._.prefix( ui.i.prefix, $.extend( {}, ui.i.klasses ) ), ui.settings.klasses )

    // Start up the ui with the starting value.
    ui.start( options.valueHidden )
}



/**
 * The extension composer prototype.
 */
ShadowElement.prototype = {

    constructor: ShadowElement,


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
            ui.$input.addClass( ui.klasses.input ).after( ui.$host ).on( 'focus', ui.capture.bind( ui ) )

            // Listen for changes to update the input value.
            ui.$source.on( 'change.' + instance.id, function( event, thingChanged ) {
                ui.$input[0].value = thingChanged == 'clear' ? '' : ui.get( 'select', { format: settings.format } )
            })
        }

        // If there isn’t an input, make the host “tab-able”.
        else {

            ui.$host.

                // Add the tabindex attribute.
                attr( 'tabindex', 0 ).

                // When the source is focused, capture the ui.
                on( 'focus', ui.capture.bind( ui ) ).

                // When the source is blurred, close and release the ui.
                // * A blur within the root doesn’t bubble up.
                on( 'blur', function() {
                    ui.close().release()
                })
        }


        // Add the “host” class to the element.
        ui.$host.addClass( ui.klasses.host )


        // If there’s a hidden formatting, prepare the hidden input.
        if ( settings.formatHidden ) {

            // If there’s a format for the hidden input, create it
            // with the name of the original input and a suffix.
            ui._hidden = $( '<input ' +
                'value="' +
                    ( valueHidden || ( ui.$input && ui.$input.val() ?
                        ui.get('select', { format: settings.formatHidden }) :
                        '' )
                    ) +
                '" ' +
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
        template = shadow._.node({
            klass: ui.klasses.root,
            content: createFullTemplate( shadow._.trigger( ui.i.template, ui.i ), ui.klasses )
        })
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
    render: function( isFullRender ) {

        var ui = this,
            $node = isFullRender ? ui.$root : ui.$root.find( '.' + ui.klasses.box ),
            activeElement = ui.get( 'activeElement' ),
            activeElementClassName = activeElement && activeElement.className,
            templateContent = shadow._.trigger( ui.i.template, ui.i )

        // Create and insert the template.
        $node[0].innerHTML = isFullRender ? createFullTemplate( templateContent, ui.klasses ) : templateContent

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

            var keyCode = event.keyCode,
                keyAction = instance.keys[ keyCode ]

            // Check if the ui is focused and there is a key action.
            if ( instance.is.focused ) {

                // If it’s not opened, prevent the default action.
                if ( !instance.is.opened ) {
                    event.preventDefault()
                }

                // Trigger the key action if there is one.
                if ( keyAction ) {
                    shadow._.trigger( keyAction, instance, [ event ] )
                }

                // Any of the arrow keys should open the ui.
                if ( [37,38,39,40].indexOf( keyCode ) > -1 ) {
                    ui.open()
                }

                // Close the ui on “escape”.
                else if ( keyCode == 27 ) {
                    ui.close( true )
                }

                // If the target is within the root and “enter” is pressed,
                // prevent the default action and trigger a click instead.
                else if ( keyCode == 13 ) {
                    var target = event.target
                    if ( $.contains( ui.$root[0], target ) ) {
                        event.preventDefault()
                        target.click()
                    }
                }
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
        $document.off( 'keydown.' + instance.id )

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
    is: function( thing, value ) {

        var ui = this,
            instance = ui.i

        // Return the instance’s state of the thing.
        return shadow._.trigger( instance.is[ thing ], instance, [ value ] )
    },



    /**
     * Check if a value is within a thing’s collection.
     */
    within: function( thing, value ) {

        var ui = this,
            instance = ui.i,
            thingCollection = instance.dict[ thing ],
            found = -1

        // Go through and try to find the first matching value.
        if ( $.isArray( thingCollection ) ) for ( var i = 0; i < thingCollection.length; i += 1 ) {
            if (
                instance.find[thing] ?
                    shadow._.trigger( instance.find[thing], value, [ thingCollection[i] ] ) :
                    thingCollection[i] === value
            ) {
                found = i
                break
            }
        }

        // Return whatever index is found.
        return found
    }, //within



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

                // Update the value by triggering any create methods.
                if ( instance.create[ thingItem ] ) {
                    thingValue = shadow._.trigger( instance.create[ thingItem ], instance, [ thingValue, options ] )
                }

                // Update the diction with the final value.
                if ( $.isArray( instance.dict[ thingItem ] ) ) {
                    instance.dict[ thingItem ] = $.isArray( thingValue ) ? thingValue : thingValue != null ? [ thingValue ] : []
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
    add: function( thing/*, ...*/ ) {

        var ui = this,
            instance = ui.i,
            thingCollection = instance.dict[ thing ]

        // Only add something if it’s an array.
        if ( $.isArray( thingCollection ) ) {

            // Add each value not within the collection.
            [].slice.apply( arguments, [1] ).forEach( function( value ) {

                // Update the value by triggering any create methods.
                if ( instance.create[ thing ] ) {
                    value = shadow._.trigger( instance.create[ thing ], instance, [ value ] )
                }

                // If the value isn’t found within the collection, add it.
                if ( value != null && ui.within( thing, value ) === -1 ) {
                    thingCollection.push( value )
                }
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
    remove: function( thing/*, ...*/ ) {

        var ui = this,
            instance = ui.i,
            thingCollection = instance.dict[ thing ]

        // Only remove something if it’s an array.
        if ( $.isArray( thingCollection ) ) {

            // Find the index of the value and remove it from the collection.
            [].slice.apply( arguments, [1] ).forEach( function( value ) {

                // Update the value by triggering any create methods.
                if ( instance.create[ thing ] ) {
                    value = shadow._.trigger( instance.create[ thing ], instance, [ value ] )
                }

                // If the value is found within the collection, remove it.
                var index = ui.within( thing, value )
                if ( index > -1 ) thingCollection.splice( index, 1 )
            })

            // Check if it’s a “changing” update and broadcast a change.
            if ( thing == 'select' ) {
                ui.$source.trigger( 'change', [ thing, thingCollection ] )
            }

            // Trigger any queued “remove” events and pass the data.
            ui.trigger( 'remove', { item: thingCollection } )
        }

        return ui
    } //remove

} //ShadowElement.prototype



/**
 * Create the template for a shadow instance.
 */
function createFullTemplate( templateContent, klasses ) {

    // Create the pointer node.
    return shadow._.node({ klass: klasses.pointer }) +

        // Create the wrapped holder.
        shadow._.node({
            klass: klasses.holder,

            // Create the ui frame.
            content: shadow._.node({
                klass: klasses.frame,

                // Create the content wrapper.
                content: shadow._.node({
                    klass: klasses.wrap,

                    // Create a box node.
                    content: shadow._.node({
                        klass: klasses.box,

                        // Attach the component template.
                        content: templateContent
                    })
                })
            })
        })
} //createFullTemplate



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
 * Extend jQuery.
 */
$.fn.shadow = function( option, name ) {

    var returnValue,
        shadowElement = this.data( 'shadow' )

    // If there’s no shadow element, create one.
    if ( !shadowElement ) returnValue = shadow.create( name, this[0], option )

    // If there’s no option, return the shadow element data.
    else if ( !option ) returnValue = shadowElement

    // Trigger the `option` and pass all arguments (except `option`).
    else returnValue = shadow._.trigger( shadowElement[ option ], shadowElement, [].slice.apply( arguments, [1] ) )

    // If the ui is returned, allow for jQuery chaining.
    // Otherwise return the value from the ui’s method.
    return returnValue
}



/**
 * Export the shadow object.
 */
return shadow

}));



