
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



var Constructor = (function() {

    var
        // Keep a track of the instances created.
        instances = {},

        // Construct and record an instance.
        Instance = function( klasses, content ) {
            var id = new Date().getTime()
            instances[ id ] = {
                id: 'P' + id,
                is: {
                    started: false,
                    opened: false,
                    focused: false
                },
                keys: {},
                methods: {},
                dict: {
                    values: {
                        select: 0,
                        highlight: 0
                    },
                    get: function( item, options ) {
                        var picker = this,
                            instance = picker.i()
                        return instance.dict.values[ item ]
                    },
                    set: function( item, value, options ) {
                        var picker = this,
                            instance = picker.i()
                        instance.dict.values[ item ] = value
                        if ( instance.dict.cascades && instance.dict.cascades[ item ] ) {
                            picker.set( instance.dict.cascades[ item ], value, options )
                        }
                        return value
                    }
                },
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
        if ( $element[0].nodeName == 'INPUT' || $element[0].nodeName == 'TEXTAREA' ) throw 'ComposerError: Cannot create a picker out of a form field..'

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
            if ( instance.is.started ) return P


            // Update the `started` state.
            instance.is.started = true


            // Attach the default extension and settings events.
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


            // Prepare the root element.
            picker.$root.

                // Any click or mousedown within the root shouldn’t bubble up.
                on( 'click mousedown', function( event ) { event.stopPropagation() }).

                // Maintain focus on `document.activeElement` when things are getting picked.
                on( 'mousedown', '[data-pick]', function( event ) { event.preventDefault() }).

                // When something within the root is picked, set the value and close.
                on( 'click', '[data-pick]', function() {
                    picker.set( 'select', $(this).data('pick') ).close()
                }).

                // When something within the root is focused, stop from bubbling
                // to the doc and remove the “focused” state from the root.
                on( 'focusin', function( event ) {
                    event.stopPropagation()
                    picker.$root.removeClass( picker.klasses.focused )
                })


            // Prepare the host element.
            picker.$node.

                // Open the picker with focus on a click within.
                on( 'click.' + instance.id, function() { picker.open( true ) }).

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


            // Trigger any queued “start” and “render” events.
            return picker.trigger( 'start' ).trigger( 'render' )
        }, //start

        render: function() {

            var picker = this,
                instance = picker.i()

            picker.$root.html( instance.template.innerHTML )

            // Trigger any queued “render” events.
            return picker.trigger( 'render' )
        },



        /**
         * Deconstruct the extension.
         */
        stop: function() {

            var picker = this,
                instance = picker.i()

            // If it’s already stopped, do nothing.
            if ( !instance.is.started ) return picker

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

            // Update the `started` state.
            instance.is.started = false

            // Trigger any queued “stop” event methods.
            picker.trigger( 'stop' )

            // Then reset all instance methods.
            instance.methods = {}

            return picker
        }, //stop



        /**
         * Open the picker.
         */
        open: function( giveFocus ) {

            var picker = this,
                instance = picker.i()

            // If it’s already open, do nothing.
            if ( instance.is.opened ) return picker

            // Update the `opened` state.
            instance.is.opened = true

            // Add the “opened” class to the picker root.
            picker.$root.addClass( picker.klasses.opened )

            // Bind events to the doc element.
            $document.

                // If the target of a click or focus event is not the element, close the picker.
                // * Don’t worry about clicks or focusins on the root because those don’t bubble up.
                //   Also, for Firefox, a click on an `option` element bubbles up directly
                //   to the doc. So make sure the target wasn't the doc.
                on( 'click.' + instance.id + ' focusin.' + instance.id, function( event ) {
                    if ( event.target != picker.$node[0] && event.target != document ) picker.close()
                })/*.

                // If a mousedown has reach the doc, close the picker.
                on( 'mousedown.' + instance.id, function() { picker.close() } )*/

            // Give the picker focus if needed.
            if ( giveFocus ) picker.focus()

            // Trigger any queued “open” events.
            return picker.trigger( 'open' )
        }, //open



        /**
         * Close the picker.
         */
        close: function( maintainFocus ) {

            var picker = this,
                instance = picker.i()

            // If it’s already closed, do nothing.
            if ( !instance.is.opened ) return picker

            // Update the `opened` state.
            instance.is.opened = false

            // Remove the “opened” class from the picker root.
            picker.$root.removeClass( picker.klasses.opened )

            // Remove the picker focus if needed.
            if ( maintainFocus !== true ) picker.blur()

            // Trigger any queued “close” events.
            return picker.trigger( 'close' )
        }, //close



        /**
         * Focus the picker.
         */
        focus: function() {

            var picker = this,
                instance = picker.i()

            // If it’s already focused, do nothing.
            if ( instance.is.focused ) return picker

            // Update the `focused` state.
            instance.is.focused = true

            // Add the “active” class to the element.
            picker.$node.addClass( picker.klasses.active )

            // Add the “focused” class to the picker root.
            picker.$root.addClass( picker.klasses.focused )

            // Bind the keyboard events.
            $document.on( 'keydown.' + instance.id, function( event ) {

                var target = event.target,
                    keycode = event.keyCode,
                    keycodeAction = instance.keys[ keycode ]

                // On escape, close the picker and maintain focus.
                if ( keycode == 27 ) picker.close( true )

                // Check if the picker is active and there is a recorded key action.
                else if ( instance.is.focused && keycodeAction ) {

                    // Prevent the default action to stop page movement.
                    event.preventDefault()

                    // Trigger the key action.
                    if ( keycodeAction ) Pick._.trigger( instance.keys.go, picker, [ keycodeAction ] )
                }

                // If the target is within the root and “enter” is pressed,
                // prevent the default action and trigger a click on the target instead.
                else if ( picker.$root.find( target ).length && keycode == 13 ) {
                    event.preventDefault()
                    target.click()
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
                instance = picker.i()

            // If it’s already not focused, do nothing.
            if ( !instance.is.focused ) return picker

            // Update the `focused` state.
            instance.is.focused = false

            // Remove the “active” class from the element.
            picker.$node.removeClass( picker.klasses.active )

            // Remove the “focused” class from the picker root.
            picker.$root.removeClass( picker.klasses.focused )

            // Unbind the keyboard events.
            $document.off( '.' + instance.id )

            // Trigger any queued “blur” events.
            return picker.trigger( 'blur' )
        }, //blur



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
                methodList.forEach( function( method ) {
                    Pick._.trigger( method, picker, [ data ] )
                })
            }
            return picker
        },



        /**
         * Get a state of the picker or extension.
         */
        is: function( thing ) {

            var picker = this,
                instance = picker.i()

            // Return the instance’s state of the thing.
            return instance.is[ thing ]
        },



        /**
         * Get something from the picker or extension.
         */
        get: function( thing, options ) {

            var picker = this,
                instance = picker.i()

            // Get the thing using options from the instance `dict`.
            return Pick._.trigger( instance.dict.get, picker, [ thing, options ] )
        }, //get



        /**
         * Set something to the picker or extension.
         */
        set: function( thing, value, options ) {

            var picker = this,
                instance = picker.i(),

                thingItem, thingValue, thingDefined,
                thingIsObject = $.isPlainObject( thing ),
                thingObject = thingIsObject ? thing : {}


            if ( thing ) {

                // If the thing isn’t an object, make it one.
                if ( !thingIsObject ) thingObject[ thing ] = value

                // Go through the things of items to set if the diction exists.
                for ( thingItem in thingObject ) if ( thingItem in instance.dict.values ) {

                    // Grab the value of the thing.
                    thingValue = thingObject[ thingItem ]

                    // Set the definition of the relevant extension item.
                    thingDefined = Pick._.trigger( instance.dict.set, picker, [ thingItem, thingValue, options ] )

                    // Trigger any queued “set” events and pass the event.
                    picker.trigger( 'set', $.Event( thingItem + 'ed', { data: thingObject }) )
                } //endfor
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

    // ...

    var P = ExtensionInstance.prototype = {
        // ...

        /**
         * Set something.
         */
        set: function( thing, value, options ) {
            // ....

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

            // ...
        } //set

    } //ExtensionInstance.prototype

    // ...

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
        throw 'ExtensionError: To create a picker extension, the component needs a name.'
    }

    // Make sure this component doesn’t already exist.
    if ( Pick._.EXTENSIONS[ component.name ] ) {
        throw 'ExtensionError: A picker extension by this name has already been defined.'
    }

    // Make sure there is content to be inserted.
    if ( !component.content ) {
        throw 'ExtensionError: The extension needs some content to insert.'
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
        throw 'ExtensionError: No extension found by the name of “' + name + '”.'
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



