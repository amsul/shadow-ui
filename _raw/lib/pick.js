
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

(function ( root, doc, picker, $, factory ) {

    // Create the picker factory.
    factory( picker, $, $( doc ), 'webkitCreateShadowRoot' in doc.body )

    // Setup the exports for Node module pattern, AMD, and basic <script> includes.
    if ( typeof module == 'object' && typeof module.exports == 'object' )
        module.exports = picker
    else if ( typeof define == 'function' && define.amd )
        define( picker )
    else
        root.Pick = picker

}( this, document, {}, jQuery, function( Pick, $, $document, hasShadowRoot ) {



var Constructor = (function() {

    var
        // Keep a track of the instances created.
        instances = {},

        // Construct and record an instance.
        Instance = function( klasses, content ) {
            var id = new Date().getTime()
            instances[ id ] = {
                id: 'P' + id,
                start: false,
                open: false,
                keys: {},
                methods: {},
                template: ( function( el ) {
                    el.innerHTML = createTemplate( klasses, content )
                    return el.children[0]
                })( document.createElement( 'div' ) )
            }
            return instances[ id ]
        },

        createTemplate = function( classNames, extensionContent ) {

            // Create the template root.
            return Pick._.node({
                klass: classNames.picker,

                // Create a wrapped holder.
                content: Pick._.node({
                    klass: classNames.holder,
                    content: [

                        // Create the pointer node.
                        Pick._.node({
                            klass: classNames.pointer
                        }),

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
                                    content: extensionContent
                                })
                            })
                        })
                    ]
                })
            })
        } //createTemplate




    /**
     * The composer that creates a pick extension.
     */
    function PickComposer( $element, extension, options ) {

        var instance, picker = this

        // Make sure we have a usable element.
        if ( $element[0].nodeName == 'INPUT' || $element[0].nodeName == 'TEXTAREA' ) throw 'Cannot create a picker out of a form field..'

        // Link up the composition.
        picker.$node = $element
        picker.extension = extension
        picker.options = options

        // Merge the defaults and options passed.
        picker.settings = $.extend( true, {}, extension.defaults, options )

        // Merge the default classes with the settings and then prefix them.
        picker.klasses = Pick._.prefix( extension.prefix, $.extend( {}, Pick._.klasses(), picker.settings.klass ) )

        // Initialize the instance with an extension.
        instance = new Instance( picker.klasses, Pick._.trigger( picker.extension.content, picker ) )

        // Create a method to retrieve the instance.
        picker.i = function() { return instance }

        // Start up the picker.
        picker.start()
    }


    /**
     * The extension prototype.
     */
    PickComposer.prototype = {

        constructor: PickComposer,


        /**
         * Construct the extension.
         */
        start: function() {

            var picker = this,
                instance = picker.i()


            // If it’s already started, do nothing.
            if ( instance.start ) return P


            // Set it as started.
            instance.start = true


            // If there’s a format for the hidden input element, create the element
            // using the name of the original input and a suffix. Otherwise set it to undefined.
            picker._hidden = picker.settings.formatSubmit ? '<span>need to do this...</span>' : undefined


            // Create and insert the template into the dom.
            if ( hasShadowRoot ) {
                var host = picker.$node[0].webkitCreateShadowRoot()
                host.applyAuthorStyles = true
                host.innerHTML = Pick._.node({ el: 'content' }) + instance.template.outerHTML
                picker.$root = $( picker.$node[0].webkitShadowRoot.childNodes[1] )
            }
            else {
                picker.$root = $( instance.template )
                picker.$node.append( picker.$root )
            }


            // Prepare the host element.
            picker.$node.

                // Open up the picker on click.
                on( 'click.' + instance.id, function( event ) {
                    event.stopPropagation()
                    picker.open( true )
                }).

                // Update the hidden value with the correct format.
                on( 'change.' + instance.id, function() {
                    if ( picker._hidden ) {
                        console.log( 'need to update the hidden value with formatting' )
                    }
                }).

                // Add the “element” class.
                addClass( picker.klasses.element ).

                // Store the extension data.
                data( 'pick.' + picker.extension.name, picker )


            // Attach the default extension and settings events.
            picker.on({
                start: picker.extension.onStart,
                render: picker.extension.onRender,
                stop: picker.extension.onStop,
                open: picker.extension.onOpen,
                close: picker.extension.onClose,
                set: picker.extension.onSet
            }).on({
                start: picker.settings.onStart,
                render: picker.settings.onRender,
                stop: picker.settings.onStop,
                open: picker.settings.onOpen,
                close: picker.settings.onClose,
                set: picker.settings.onSet
            })


            // Trigger any queued “start” and “render” events.
            return picker.trigger( 'start' ).trigger( 'render' )
        }, //start



        /**
         * Deconstruct the extension.
         */
        stop: function() {

            var picker = this,
                instance = picker.i()

            // If it’s already stopped, do nothing.
            if ( !instance.start ) return picker

            // Close the picker.
            picker.close()

            // Remove the hidden field.
            if ( picker._hidden ) {
                console.log( 'need to remove hidden field..' )
                // picker._hidden.parentNode.removeChild( picker._hidden )
            }

            // Remove the extension template content.
            if ( hasShadowRoot ) {
                picker.$node.after( picker.$node.clone() ).remove()
            }
            else {
                instance.template.remove()
            }

            // Remove the “element” class, unbind the events, and remove the stored data.
            picker.$node.removeClass( picker.klasses.element ).off( '.' + instance.id ).removeData( 'pick.' + picker.extension.name )

            // Update the `start` state.
            instance.start = false

            // Trigger the queued “stop” event methods.
            picker.trigger( 'stop' )

            // Then reset all instance methods.
            instance.methods = {}

            return picker
        }, //stop



        /**
         * Open the picker.
         */
        open: function() {

            var picker = this,
                instance = picker.i()

            // If it’s already open, do nothing.
            if ( instance.open ) return picker

            // Set it as open.
            instance.open = true

            // Add the “opened” class to the picker root.
            picker.$root.addClass( picker.klasses.opened )

            // Trigger the queued “open” events.
            return picker.trigger( 'open' )
        }, //open



        /**
         * Close the picker.
         */
        close: function() {

            var picker = this,
                instance = picker.i()

            // If it’s already closed, do nothing.
            if ( !instance.open ) return picker

            // Set it as closed.
            instance.open = false

            // Remove the “opened” class from the picker root.
            picker.$root.removeClass( picker.klasses.opened )

            // Trigger the queued “close” events.
            return picker.trigger( 'close' )
        }, //close



        /**
         * Attach callbacks to events.
         */
        on: function( thing, method ) {

            var thingName, thingMethod,
                thingIsObject = $.isPlainObject( thing ),
                thingObject = thingIsObject ? thing : {},
                picker = this,
                instance = picker.i()

            if ( thing ) {

                // If the thing isn’t an object, make it one.
                if ( !thingIsObject ) {
                    thingObject[ thing ] = method
                }

                // Go through the things to bind to.
                for ( thingName in thingObject ) {

                    // Grab the method of the thing.
                    thingMethod = thingObject[ thingName ]

                    // Make sure the thing methods collection exists.
                    if ( !instance.methods[ thingName ] ) instance.methods[ thingName ] = []

                    // Add the method to the relative method collection.
                    instance.methods[ thingName ].push( thingMethod )
                }
            }

            return picker
        }, //on



        /**
         * Fire off any instance methods by name.
         */
        trigger: function( name, data ) {
            var picker = this,
                methodList = picker.i().methods[ name ]
            if ( methodList ) {
                methodList.map( function( method ) {
                    Pick._.trigger( method, picker, [ data ] )
                })
            }
            return picker
        }


    } //PickComposer.prototype


    return PickComposer
})();






/**
 * The composer that creates a new extension picker.
 */
Pick.Compose = function( ELEMENT, EXTENSION, OPTIONS ) {


    var
        // The state of the extension.
        STATE = {
            id: Math.abs( ~~( Math.random() * 1e9 ) )
        },


        // Merge the defaults and options passed.
        SETTINGS = $.extend( true, {}, EXTENSION.defaults, OPTIONS ),


        // Merge the default classes with the settings and then prefix them.
        CLASSES = Pick._.prefix( EXTENSION.prefix, $.extend( {}, Pick._.klasses(), SETTINGS.klass ) ),


        // Check which type of element we’re binding to.
        IS_INPUT = ELEMENT.nodeName == 'INPUT',


        // Wrap the element into a jQuery object.
        $ELEMENT = $( ELEMENT ),


        // The picker extension instance.
        ExtensionInstance = function() {
            EXTENSION.keys = EXTENSION.keys || {}
            Pick._.trigger( EXTENSION.init, P, [ P ] )
        },


        // The extension prototype.
        P = ExtensionInstance.prototype = {

            constructor: ExtensionInstance,

            $node: $ELEMENT,

            extension: EXTENSION,

            settings: SETTINGS,

            klass: CLASSES,


            /**
             * Initialize the extension.
             */
            start: function() {


                // If it’s already started, do nothing.
                if ( STATE.start ) return P


                // Set up the starting states.
                STATE.methods = {}
                STATE.start = true
                STATE.open = false


                // Create the picker root with a new wrapped holder and bind the events.
                P.$root = $(
                    Pick._.node( 'div', createWrappedExtension(), CLASSES.picker + ( SETTINGS.align ?
                        ' ' + Pick._.prefix( EXTENSION.prefix, '--' + SETTINGS.align ) :
                        '' )
                    ) ).

                    // Any click or mouseup within the root shouldn’t bubble up.
                    on( 'click mouseup', function( event ) {
                        event.stopPropagation()
                    }).

                    // When something within the root is focused, stop from bubbling
                    // to the doc and remove the “focused” state from the root.
                    on( 'focusin', function( event ) {
                        P.$root.removeClass( CLASSES.focused )
                        event.stopPropagation()
                    }).

                    // Maintain focus when things are getting picked.
                    on( 'mousedown', '[data-pick]', function( event ) {
                        event.stopPropagation()
                        event.preventDefault()
                    }).

                    // When something within the root is picked, set the value.
                    on( 'click', '[data-pick]', function( event ) {
                        P.set( 'select', $( this ).data( 'pick' ) ).close()
                    })


                // If there’s a format for the hidden input element, create the element
                // using the name of the original input plus suffix. Otherwise set it to undefined.
                P._hidden = SETTINGS.formatSubmit ? '<span>need to do this...</span>' : undefined


                // If it’s an input element, prep it.
                if ( IS_INPUT ) {

                    // Confirm the focus state.
                    ELEMENT.autofocus = ELEMENT == document.activeElement

                    // Store the original type.
                    STATE.type = ELEMENT.type

                    // Remove any user-agent stylings.
                    ELEMENT.type = 'text'

                    // Make it readonly for two reasons:
                    // 1) prevent virtual keyboard from popping up,
                    // 2) only be “picked” values should be allowed.
                    ELEMENT.readOnly = true


                    $ELEMENT.

                        // On focus/click, open the picker and adjust the root “focused” state.
                        on( 'focus.P' + STATE.id + ' click.P' + STATE.id, focusToOpen ).

                        // Handle keyboard event based on the picker being opened or not.
                        on( 'keydown.P' + STATE.id, function( event ) {

                            var keycode = event.keyCode,

                                // Check if one of the delete keys was pressed.
                                isKeycodeDelete = /^(8|46)$/.test( keycode )

                            // For some reason IE clears the input value on “escape”.
                            if ( keycode == 27 ) {
                                P.close()
                                return false
                            }

                            // Check if `space` or `delete` was pressed or the picker is closed with a key movement.
                            if ( keycode == 32 || isKeycodeDelete || !STATE.open && EXTENSION.keys[ keycode ] ) {

                                // Prevent it from moving the page and bubbling to doc.
                                event.preventDefault()
                                event.stopPropagation()

                                // If `delete` was pressed, clear the values and close the picker.
                                // Otherwise open the picker.
                                if ( isKeycodeDelete ) { P.clear().close() }
                                else { P.open( true ) }
                            }
                        })
                }

                else {

                    $ELEMENT.
                        on( 'click.P' + STATE.id, function( event ) {
                            event.stopPropagation()
                            P.open( true )
                        })
                }


                $ELEMENT.

                    // If the value changes, update the hidden input with the correct format.
                    on( 'change.P' + STATE.id, function() {
                        if ( P._hidden ) {
                            console.log( 'need to update the hidden value with formatting' )
                            // P._hidden.value = ELEMENT.value ? PickerConstructor._.trigger( EXTENSION.formats.asString, P.component, [ SETTINGS.formatSubmit, EXTENSION.item.select ] ) : ''
                        }
                    }).

                    // Add the “element” class.
                    addClass( CLASSES.element ).

                    // Store the picker data by the extension name.
                    data( 'pick.' + EXTENSION.name, P )

                    // Insert the root and hidden input based on the type of element.
                    [ IS_INPUT ? 'after' : 'append' ]( P.$root, P._hidden )


                // Bind the default extension and settings events.
                P.on({
                    start: EXTENSION.onStart,
                    render: EXTENSION.onRender,
                    stop: EXTENSION.onStop,
                    open: EXTENSION.onOpen,
                    close: EXTENSION.onClose,
                    set: EXTENSION.onSet
                }).on({
                    start: SETTINGS.onStart,
                    render: SETTINGS.onRender,
                    stop: SETTINGS.onStop,
                    open: SETTINGS.onOpen,
                    close: SETTINGS.onClose,
                    set: SETTINGS.onSet
                })


                // If the element has autofocus, open the picker.
                if ( ELEMENT.autofocus ) {
                    P.open( true )
                }


                // Trigger queued the “start” and “render” events.
                return P.trigger( 'start' ).trigger( 'render' )
            }, //start



            /**
             * Destroy everything.
             */
            stop: function() {

                // If it’s already stopped, do nothing.
                if ( !STATE.start ) return P

                // Then close the picker.
                P.close()

                // Remove the hidden field.
                if ( P._hidden ) {
                    P._hidden.parentNode.removeChild( P._hidden )
                }

                // Remove the root.
                P.$root.remove()

                // Remove the “element” class, unbind the events, and remove the stored data.
                $ELEMENT.removeClass( CLASSES.element ).off( '.P' + STATE.id ).removeData( EXTENSION.name )

                // Restore the input element state.
                if ( IS_INPUT ) {
                    ELEMENT.type = STATE.type
                    ELEMENT.readOnly = false
                }

                // Update the `start` state.
                STATE.start = false

                // Trigger the queued “stop” events.
                P.trigger( 'stop' )

                // Reset the extension state methods.
                STATE.methods = {}

                return P
            }, //stop



            /*
             * Open up the picker.
             */
            open: function( makeActive ) {


                // If it’s not open, update the state.
                if ( !STATE.open ) {

                    // Set it as open.
                    STATE.open = true

                    // Add the “opened” class to the picker root.
                    P.$root.addClass( CLASSES.opened )
                }


                // Check if we need to make the picker active and bind events to close.
                if ( makeActive === true && !STATE.active ) {

                    // Set it as activated.
                    STATE.active = true

                    // Add the “active” class to the element.
                    $ELEMENT.addClass( CLASSES.active )

                    // If it’s an input, pass focus to the element’s jQuery object.
                    // if ( IS_INPUT ) $ELEMENT.focus()

                    // Add the “focused” class to the picker root.
                    P.$root.addClass( CLASSES.focused )

                    // Bind the document events.
                    $document.
                        on( 'click.P' + STATE.id + ' focusin.P' + STATE.id, function( event ) {

                            // If the target of the event is not the element, close the picker.
                            // * Don’t worry about clicks or focusins on the root because those don’t bubble up.
                            //   Also, for Firefox, a click on an `option` element bubbles up directly
                            //   to the doc. So make sure the target wasn't the doc.
                            if ( event.target != ELEMENT && event.target != document ) P.close()

                        }).
                        on( 'mouseup.P' + STATE.id, P.close ).
                        on( 'keydown.P' + STATE.id, function( event ) {

                            var
                                // Get the keycode.
                                keycode = event.keyCode,

                                // Translate that to an extension keycode action.
                                keycodeAction = EXTENSION.keys[ keycode ],

                                // Grab the target.
                                target = event.target


                            // On escape, close the picker and give focus.
                            if ( keycode == 27 ) {
                                P.close( true )
                            }


                            // Check if the picker is active and there is a recorded key action.
                            else if ( STATE.active && keycodeAction ) {

                                // Prevent the default action to stop page movement.
                                event.preventDefault()

                                // Trigger the key action.
                                if ( keycodeAction ) {
                                    Pick._.trigger( EXTENSION.keys.go, P, [ keycodeAction ] )
                                }
                            }


                            // If the target is within the root and “enter” is pressed,
                            // prevent the default action and trigger a click on the target instead.
                            else if ( P.$root.find( target ).length && keycode == 13 ) {
                                event.preventDefault()
                                target.click()
                            }
                        })
                }

                // Trigger the queued “open” events.
                return P.trigger( 'open' )
            }, //open



            /**
             * Close the picker.
             */
            close: function( giveFocus ) {


                // If we need to give focus, do it before changing states.
                if ( giveFocus === true ) {
                    // ....ah yes! It would’ve been incomplete without a crazy workaround for IE :|
                    // The focus is triggered *after* the close has completed - causing it
                    // to open again. So unbind and rebind the event at the next tick.
                    $ELEMENT.off( 'focus.P' + STATE.id ).focus()
                    setTimeout( function() {
                        $ELEMENT.on( 'focus.P' + STATE.id, focusToOpen )
                    }, 0 )
                }


                // If it’s open, update the state.
                if ( STATE.open ) {

                    // Set it as closed.
                    STATE.open = false

                    // Remove the “opened” class from the picker root.
                    P.$root.removeClass( CLASSES.opened )
                }


                // Check if we need to de-active the picker.
                if ( STATE.active ) {

                    // Set it as de-activated.
                    STATE.active = false

                    // Remove the “active” class.
                    $ELEMENT.removeClass( CLASSES.active )

                    // Remove the “focused” class from the picker root.
                    P.$root.removeClass( CLASSES.focused )

                    // Unbind the document events.
                    $document.off( '.P' + STATE.id )
                }

                // Trigger the queued “close” events.
                return P.trigger( 'close' )
            }, //close



            /**
             * Render a new picker within the root
             */
            render: function() {

                // Insert a new component holder in the root.
                P.$root.html( createWrappedExtension() )

                // Trigger the queued “render” events.
                return P.trigger( 'render' )
            }, //render



            /**
             * Bind events on the things.
             */
            on: function( thing, method ) {

                var thingName, thingMethod,
                    thingIsObject = Pick._.isObject( thing ),
                    thingObject = thingIsObject ? thing : {}

                if ( thing ) {

                    // If the thing isn’t an object, make it one.
                    if ( !thingIsObject ) {
                        thingObject[ thing ] = method
                    }

                    // Go through the things to bind to.
                    for ( thingName in thingObject ) {

                        // Grab the method of the thing.
                        thingMethod = thingObject[ thingName ]

                        // Make sure the thing methods collection exists.
                        STATE.methods[ thingName ] = STATE.methods[ thingName ] || []

                        // Add the method to the relative method collection.
                        STATE.methods[ thingName ].push( thingMethod )
                    }
                }

                return P
            }, //on



            /**
             * Fire off method events.
             */
            trigger: function( name, data ) {
                var methodList = STATE.methods[ name ]
                if ( methodList ) {
                    methodList.map( function( method ) {
                        Pick._.trigger( method, P, [ data ] )
                    })
                }
                return P
            }, //trigger



            /**
             * Get something.
             */
            get: function( thing, options ) {

                // Make sure there’s something to get.
                thing = thing || 'value'

                // If the value is requested, return it based on the element type.
                return thing == 'value' ? IS_INPUT ? ELEMENT.value : $ELEMENT.attr( 'data-value' ) :

                    // First check if a picker state exists.
                    STATE[ thing ] != null ? STATE[ thing ] :

                    // Otherwise get the formatted or basic `thing` diction value.
                    Pick._.trigger( EXTENSION.dict.get, P, [ thing, options ] ) || EXTENSION.dict.values[ thing ]
            }, //get



            /**
             * Set something.
             */
            set: function( thing, value, options ) {

                var thingItem, thingValue, thingDefined,
                    thingIsObject = Pick._.isObject( thing ),
                    thingObject = thingIsObject ? thing : {}


                if ( thing ) {

                    // If the thing isn’t an object, make it one.
                    if ( !thingIsObject ) {
                        thingObject[ thing ] = value
                    }

                    // Go through the things of items to set.
                    for ( thingItem in thingObject ) {

                        // Grab the value of the thing.
                        thingValue = thingObject[ thingItem ]

                        // Check if the diction exists.
                        if ( thingItem in EXTENSION.dict.values ) {

                            // Check if there’s a custom set method.
                            thingDefined = EXTENSION.dict.set ?

                                // Set the definition of the relevant extension item.
                                Pick._.trigger( EXTENSION.dict.set, P, [ thingItem, thingValue, options ] ) :

                                // Otherwise directly set the item diction value and cascade through changes.
                                (function() {
                                    EXTENSION.dict.values[ thingItem ] = thingValue
                                    if ( EXTENSION.dict.cascades && EXTENSION.dict.cascades[ thingItem ] ) {
                                        P.set( EXTENSION.dict.cascades[ thingItem ], thingValue, options )
                                    }
                                    return thingValue
                                })()

                            // Check if a change in value is needed.
                            if ( thingItem == 'select' || thingItem == 'highlight' || thingItem == 'clear' ) {

                                // Update the relevant element attribute and broadcast a change.
                                if ( thingItem != 'highlight' ) {
                                    $ELEMENT.
                                        attr(
                                            IS_INPUT ? 'value' : 'data-value',
                                            thingItem == 'clear' ? '' : thingDefined
                                        ).
                                        trigger( 'change' )
                                }

                                // Render a new picker to reflect these updates.
                                P.render()
                            }
                        }

                    } //endfor
                }


                // Trigger queued “set” events and pass the `thingObject`.
                return P.trigger( 'set', thingObject )
            } //set

        } //ExtensionInstance.prototype



    /**
     * Wrap the extension content together.
     */
    function createWrappedExtension() {

        // Create a picker wrapper holder.
        return Pick._.node( 'div',

            Pick._.node( 'div', '', CLASSES.pointer/*, (function( alignment, measurement ) {
                    return 'style="' + alignment + ':' + ( measurement ) + 'px;"'
                })( SETTINGS.align, Math.ceil( ELEMENT.clientWidth / 2 ) - 10 )*/
            ) +

            // Create a picker wrapper node.
            Pick._.node( 'div',

                // Create a picker frame.
                Pick._.node( 'div',

                    // Create a picker box node.
                    Pick._.node( 'div',

                        // Insert the component’s content.
                        Pick._.trigger( EXTENSION.content, P ),

                        // The picker box class.
                        CLASSES.box
                    ),

                    // Picker wrap class.
                    CLASSES.wrap
                ),

                // Picker frame class.
                CLASSES.frame
            ),

            // Picker holder class.
            CLASSES.holder
        ) //endreturn
    } //createWrappedExtension


    // Separated for IE
    function focusToOpen( event ) {

        // Stop the event from propagating to the doc.
        event.stopPropagation()

        // If it’s a focus event, add the “focused” class to the root.
        if ( event.type == 'focus' ) P.$root.addClass( CLASSES.focused )

        // And then finally open the picker.
        P.open( true )
    }


    // Return a new extension instance.
    return new ExtensionInstance().start()
} //Pick.Compose




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
            picker: '',
            opened: '--opened',
            focused: '--focused',

            element: '-element',
            active: '-element--active',

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
            return ( klass ? prefix + ( klass.match( /^-/ ) ? '' : '__' ) + klass : prefix )
        }
        prefix = prefix || 'picker'
        if ( $.isPlainObject( klasses ) ) {
            for ( var klass in klasses ) {
                className = klasses[ klass ]
                klasses[ klass ] = bemPrefixify( className )
            }
            return klasses
        }
        return bemPrefixify( klasses )
    }, //prefix


    /**
     * Create a dom node.
     */
    node: function( options ) {

        var element = options.el || 'div',
            content = options.content,
            klasses = options.klass,
            attributes = options.attrs

        // Add the content.
        content = $.isArray( content ) ? content.join( '' ) : content

        // Set the classname.
        if ( klasses ) klasses = ' class="' + ( $.isArray( klasses ) ? klasses.join( ' ' ) : klasses ) + '"'

        // Return the element.
        return '<' + element + (klasses||'') + '>' + (content||'') + '</' + element + '>'
    },


    /**
     * Create a range to be iterated over.
     */
    range: function( rangeObject ) {

        var
            // Create the range list string.
            rangeList = '',

            // The counter starts from the `min`.
            counter = Pick._.trigger( rangeObject.min, rangeObject )


        // Loop from the `min` to `max` while incrementing by `i` and
        // trigger the `item` function to append the result to the list.
        for ( ; counter <= Pick._.trigger( rangeObject.max, rangeObject, [ counter ] ); counter += rangeObject.i || 1 ) {
            rangeList += Pick._.trigger( rangeObject.item, rangeObject, [ counter ] )
        }


        // Return the compiled range list string.
        return rangeList
    }, //range


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
        throw 'ComponentError: To create a picker extension, the component needs a name.'
    }

    // Make sure this component doesn’t already exist.
    if ( Pick._.EXTENSIONS[ component.name ] ) {
        throw 'ComponentError: A picker extension by this name has already been defined.'
    }

    // Make sure there is content to be inserted.
    if ( !component.content ) {
        throw 'ComponentError: The extension needs some content to insert.'
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
        throw 'ComponentError: No extension found by the name of “' + name + '”.'
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
            // new Pick.Compose( this, extension, options )
            new Constructor( $this, extension, options )
        }
    })
}

$.fn.pick.extend = Pick.extend

}));



