

var $DOM = $( '#qunit-fixture' )
var $NODE_DIV = $( '<div/>' )
var setUpTheWall = function( extension, options ) {
    $.fn.pick.extend( extension )
    var $clone = $NODE_DIV.clone().pick( extension.name, options )
    $DOM.html( $clone )
    return $clone.pick( extension.name, 'picker' )
}
var tearDownTheWall = function() {
    delete Pick._.EXTENSIONS[ this.extension.name ]
    $DOM.empty()
}


/**
 * Check the existence.
 */
module( 'Core' )

test( 'Globals', function() {
    ok( Pick, 'Object: Pick' )
    ok( $.isFunction( Pick.extend ), 'Method: Extend picker' )
    deepEqual( $.fn.pick.extend, Pick.extend, 'Method: Extend picker with jQuery' )
    ok( $.isFunction( $.fn.pick ), 'Method: Create picker extension' )
})






/**
 * Check the most basic api.
 */
module( 'Minimal API', {
    setup: function() {
        this.extension = {
            name: 'dropper',
            content: '<div>This is the most basic form of a pick extension.</div>'
        }
        this.picker = setUpTheWall( this.extension )
    },
    teardown: tearDownTheWall
})

test( 'Extension', function() {

    // Confirm it extended appropriately.
    deepEqual( Pick._.EXTENSIONS.dropper, this.extension, 'Extend: pick dropper' )
})

test( 'Start and stop with extension data', function() {

    var picker = this.picker
    var $node = picker.$node

    // Confirm the dropper data exists.
    ok( $node.data( 'pick.dropper' ), 'Exists: pick dropper data' )

    // Confirm the picker started.
    strictEqual( picker.is( 'started' ), true, 'Check: started' )

    // Destroy a pick extension on the element.
    ok( picker.stop(), 'Trigger: stop' )
    strictEqual( $node.data( 'pick.dropper' ), undefined, 'Destroy: pick dropper data' )

    // Confirm the picker stopped.
    strictEqual( picker.is( 'started' ), false, 'Check: stopped' )

    // Re-create a pick extension on the element.
    ok( picker.start(), 'Trigger: start' )
    ok( $node.data( 'pick.dropper' ), 'Exists: pick dropper data' )

    // Confirm the picker started again.
    strictEqual( picker.is( 'started' ), true, 'Check: started' )
})

test( 'Open and close', function() {

    var picker = this.picker
    var $node = picker.$node

    // Confirm the starting state.
    strictEqual( picker.is( 'opened' ), false, 'Check: closed' )
    strictEqual( picker.is( 'focused' ), false, 'Check: unfocused' )

    // Click to open it.
    ok( $node.trigger( 'click' ), 'Open: node click' )
    strictEqual( picker.is( 'opened' ), true, 'Check: opened' )
    strictEqual( picker.is( 'focused' ), true, 'Check: focused' )

    // Click to close it.
    ok( $DOM.trigger( 'click' ), 'Close: doc click' )
    strictEqual( picker.is( 'opened' ), false, 'Check: closed' )
    strictEqual( picker.is( 'focused' ), false, 'Check: unfocused' )

    // Open the picker and confirm the change.
    ok( picker.open(), 'Trigger: open' )
    strictEqual( picker.is( 'opened' ), true, 'Check: opened' )
    strictEqual( picker.is( 'focused' ), false, 'Check: unfocused' )

    // Close the picker and confirm the change.
    ok( picker.close(), 'Trigger: close' )
    strictEqual( picker.is( 'opened' ), false, 'Check: closed' )
    strictEqual( picker.is( 'focused' ), false, 'Check: unfocused' )

    // Open the picker with focus and confirm the change.
    ok( picker.open( true ), 'Trigger: open with focus' )
    strictEqual( picker.is( 'opened' ), true, 'Check: opened' )
    strictEqual( picker.is( 'focused' ), true, 'Check: focused' )

    // Close the picker with focus and confirm the change.
    ok( picker.close( true ), 'Trigger: close with focus' )
    strictEqual( picker.is( 'opened' ), false, 'Check: closed' )
    strictEqual( picker.is( 'focused' ), true, 'Check: focused' )
})






/**
 * Check the basic events.
 */
module( 'Base API events', {
    setup: function() {
        var mod = this
        mod.has = {}
        this.extension = {
            name: 'loudmouth',
            content: '<div>This extension says exactly what it’s doing.</div>',
            onStart: function() {
                mod.has.started = true
            },
            onRender: function() {
                mod.has.rendered = true
            },
            onOpen: function() {
                mod.has.opened = true
            },
            onClose: function() {
                mod.has.closed = true
            },
            onFocus: function() {
                mod.has.focused = true
            },
            onBlur: function() {
                mod.has.blurred = true
            },
            onSet: function( event ) {
                mod.has.selected = !!event
            }
        }
        this.options = {
            onStart: function() {
                mod.has.opts_started = true
            },
            onRender: function() {
                mod.has.opts_rendered = true
            },
            onOpen: function() {
                mod.has.opts_opened = true
            },
            onClose: function() {
                mod.has.opts_closed = true
            },
            onFocus: function() {
                mod.has.opts_focused = true
            },
            onBlur: function() {
                mod.has.opts_blurred = true
            },
            onSet: function( event ) {
                mod.has.opts_selected = !!event
            }
        }
        this.picker = setUpTheWall( this.extension, this.options )
    },
    teardown: tearDownTheWall
})

test( 'Extension events as defaults', function() {

    var mod = this
    var picker = this.picker

    strictEqual( mod.has.started, true, 'Check: `onStart`' )
    strictEqual( mod.has.rendered, true, 'Check: `onRender`' )

    picker.open()
    strictEqual( mod.has.opened, true, 'Check: `onOpen`' )

    picker.close()
    strictEqual( mod.has.closed, true, 'Check: `onClose`' )

    picker.focus()
    strictEqual( mod.has.focused, true, 'Check: `onFocus`' )

    picker.blur()
    strictEqual( mod.has.blurred, true, 'Check: `onBlur`' )

    picker.set( 'select' )
    strictEqual( mod.has.selected, true, 'Check: `onSet`' )
})

test( 'Extension events as options', function() {

    var mod = this
    var picker = this.picker

    strictEqual( mod.has.opts_started, true, 'Check: `onStart`' )
    strictEqual( mod.has.opts_rendered, true, 'Check: `onRender`' )

    picker.open()
    strictEqual( mod.has.opts_opened, true, 'Check: `onOpen`' )

    picker.close()
    strictEqual( mod.has.opts_closed, true, 'Check: `onClose`' )

    picker.focus()
    strictEqual( mod.has.opts_focused, true, 'Check: `onFocus`' )

    picker.blur()
    strictEqual( mod.has.opts_blurred, true, 'Check: `onBlur`' )

    picker.set( 'select' )
    strictEqual( mod.has.opts_selected, true, 'Check: `onSet`' )
})



// /* ==========================================================================
//    Base picker tests
//    ========================================================================== */


// test( 'Picker states', function() {

//     var picker = this.picker

//     picker.$root.find( 'button' )[0].focus()
//     ok( picker.get( 'open' ) === true, 'Remains open with focus within' )

//     picker.$root.click()
//     ok( picker.get( 'open' ) === true, 'Remains open with click within' )

// })


// module( 'Formatting setup', {
//     setup: function() {
//         $DOM.append( $INPUT.clone().attr( 'name', 'picker' ) )
//         var $input = $DOM.find( 'input' ).pickadate({
//             formatSubmit: 'yyyy/mm/dd'
//         })
//         this.picker = $input.pickadate( 'picker' )
//     },
//     teardown: function() {
//         this.picker.stop()
//         $DOM.empty()
//     }
// })

// test( 'Hidden suffix', function() {
//     var picker = this.picker
//     strictEqual( picker.$node[0].name + '_submit', picker._hidden.name, 'Correct hidden element `name` suffix' )
// })






// module( 'Base events', {
//     setup: function() {
//     },
//     teardown: function() {
//         this.picker.stop()
//         $DOM.empty()
//     }
// })

// test( 'As individual methods', 6, function() {

//     var picker = this.picker

//     // Register the events
//     picker.
//         on( 'open', function() {
//             ok( true, 'Opened' )
//         }).
//         on( 'close', function() {
//             ok( true, 'Closed' )
//         }).
//         on( 'render', function() {
//             ok( true, 'Rendered' )
//         }).
//         on( 'set', function() {
//             ok( true, 'Set' )
//         }).
//         on( 'stop', function() {
//             ok( true, 'Stopped' )
//         }).
//         on( 'start', function() {
//             ok( true, 'Started' )
//         })

//     picker.
//         trigger( 'start' ).
//         trigger( 'open' ).
//         trigger( 'render' ).
//         trigger( 'set' )
// })

// test( 'As multiple methods', 6, function() {

//     var picker = this.picker

//     // Register the events
//     picker.on({
//         open: function() {
//             ok( true, 'Opened' )
//         },
//         close: function() {
//             ok( true, 'Closed' )
//         },
//         render: function() {
//             ok( true, 'Rendered' )
//         },
//         set: function() {
//             ok( true, 'Set' )
//         },
//         stop: function() {
//             ok( true, 'Stopped' )
//         },
//         start: function() {
//             ok( true, 'Started' )
//         }
//     })

//     picker.
//         trigger( 'start' ).
//         trigger( 'open' ).
//         trigger( 'render' ).
//         trigger( 'set' )
// })

// test( 'Open/close alternate focus', function() {

//     var picker = this.picker,
//         klasses = Picker.klasses()

//     picker.open( false )
//     ok( !picker.get( 'open' ) && picker.$node[0].className === klasses.input + ' ' + klasses.active && picker.$root[0].className === klasses.picker + ' ' + klasses.opened && document.activeElement !== picker.$node[0], 'Opened without focus' )

//     picker.close( true )
//     ok( !picker.get( 'open' ) && picker.$node[0].className === klasses.input && picker.$root[0].className === klasses.picker && document.activeElement === picker.$node[0], 'Closed with focus' )
// })






// module( 'Base mouse events', {
//     setup: function() {
//         $DOM.append( $INPUT.clone() )
//         var $input = $DOM.find( 'input' ).pickadate()
//         this.picker = $input.pickadate( 'picker' )
//     },
//     teardown: function() {
//         this.picker.stop()
//         $DOM.empty()
//     }
// })

// test( 'Open and close', function() {

//     var picker = this.picker

//     picker.$node.click()
//     ok( picker.get( 'open' ) === true, 'Opened with click in' )

//     $( 'body' ).click()
//     ok( picker.get( 'open' ) === false, 'Closed with click out' )
// })






// module( 'Base keyboard events', {
//     setup: function() {
//         $DOM.append( $INPUT.clone() )
//         var $input = $DOM.find( 'input' ).pickadate()
//         this.picker = $input.pickadate( 'picker' )
//     },
//     teardown: function() {
//         this.picker.stop()
//         $DOM.empty()
//     }
// })

// test( 'Open and close', function() {

//     var picker = this.picker

//     picker.$node.focus()
//     ok( picker.get( 'open' ) === true, 'Opened with key in' )

//     picker.$node.blur()
//     $DOM.focusin()
//     ok( picker.get( 'open' ) === false, 'Closed with key out' )

//     picker.$node.trigger({ type: 'keydown', keyCode: 40 })
//     ok( picker.get( 'open' ) === true, 'Opened after arrow “down”' )

//     picker.$node.trigger({ type: 'keydown', keyCode: 27 })
//     ok( picker.get( 'open' ) === false, 'Closed after “escape”' )

//     picker.$node.trigger({ type: 'keydown', keyCode: 38 })
//     ok( picker.get( 'open' ) === true, 'Opened after arrow “up”' )

//     picker.$node.trigger({ type: 'keydown', keyCode: 8 })
//     ok( picker.get( 'open' ) === false, 'Closed after “backspace”' )

//     picker.$node.trigger({ type: 'keydown', keyCode: 37 })
//     ok( picker.get( 'open' ) === true, 'Opened after arrow “left”' )

//     picker.$node.trigger({ type: 'keydown', keyCode: 46 })
//     ok( picker.get( 'open' ) === false, 'Closed after “alt. backspace”' )

//     picker.$node.trigger({ type: 'keydown', keyCode: 39 })
//     ok( picker.get( 'open' ) === true, 'Opened after arrow “right”' )
// })

// test( 'Set and clear', function() {

//     var picker = this.picker

//     picker.open()
//     picker.$node.trigger({ type: 'keydown', keyCode: 13 })
//     strictEqual( picker.get( 'value' ), picker.get( 'select', $.fn.pickadate.defaults.format ), 'Set value as default selection after “enter”' )

//     picker.$node.trigger({ type: 'keydown', keyCode: 8 })
//     strictEqual( picker.get( 'value' ), '', 'Clear input value after “backspace”' )
// })





