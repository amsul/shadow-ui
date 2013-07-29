

var $DOM = $( '#qunit-fixture' )
var $NODE_DIV = $( '<div/>' )
var setUpThePicker = function( extension, options ) {
    $.fn.pick.extend( extension )
    var $clone = $NODE_DIV.clone().pick( extension.name, options )
    $DOM.html( $clone )
    return $clone.pick( extension.name, 'picker' )
}
var tearDownThePicker = function() {
    this.picker.stop()
    $DOM.empty()
    ;delete Pick._.EXTENSIONS[ this.extension.name ]
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
module( 'API minimal', {
    setup: function() {
        this.extension = {
            name: 'pick--basic',
            content: '<div>This is the most basic form of a pick extension.</div>'
        }
        this.picker = setUpThePicker( this.extension )
    },
    teardown: tearDownThePicker
})

test( 'Extension', function() {

    // Confirm the picker instance has the extension.
    deepEqual( this.picker.extension, this.extension, 'Check: instance extension' )

    // Confirm it also stored appropriately.
    deepEqual( Pick._.EXTENSIONS[ 'pick--basic' ], this.extension, 'Check: collected extension' )
})

test( 'Start and stop with extension data', function() {

    var picker = this.picker
    var $host = picker.$host

    // Confirm the data exists.
    ok( $host.data( 'pick.pick--basic' ), 'Exists: pick data' )

    // Confirm the picker started.
    strictEqual( picker.is( 'started' ), true, 'Check: started' )

    // Destroy a pick extension on the element.
    ok( picker.stop(), 'Trigger: stop' )
    strictEqual( $host.data( 'pick.pick--basic' ), undefined, 'Destroy: pick data' )

    // Confirm the picker stopped.
    strictEqual( picker.is( 'started' ), false, 'Check: stopped' )

    // Re-create a pick extension on the element.
    ok( picker.start(), 'Trigger: start' )
    ok( $host.data( 'pick.pick--basic' ), 'Exists: pick data' )

    // Confirm the picker started again.
    strictEqual( picker.is( 'started' ), true, 'Check: started' )
})

test( 'Open, close, focus, and blur', function() {

    var picker = this.picker
    var $host = picker.$host

    // Confirm the starting state.
    strictEqual( picker.is( 'opened' ), false, 'Check: closed' )
    strictEqual( picker.is( 'focused' ), false, 'Check: unfocused' )

    // Click to open it.
    ok( $host.click(), 'Open: node click' )
    strictEqual( picker.is( 'opened' ), true, 'Check: opened' )
    strictEqual( picker.is( 'focused' ), true, 'Check: focused' )

    // Click to close it.
    ok( $DOM.click(), 'Close: doc click' )
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
 * Check the dict-based api.
 */
module( 'API dict', {
    setup: function() {
        this.extension = {
            name: 'pick--dict',
            content: function() {
                var to_select = ~~(Math.random()*1000),
                    to_highlight = ~~(Math.random()*1000)
                return '<div class="content">' +
                    'Select: <u>' + this.picker.get('select') + '</u><br>' +
                    'Highlight: <u>' + this.picker.get('highlight') + '</u><hr>' +
                    '<button id="select" data-pick="select:' + to_select + '">Set select to ' + to_select + '</button>' +
                    '<button id="highlight" data-pick="highlight:' + to_highlight + '">Set highlight to ' + to_highlight + '</button>' +
                '</div>'
            }
        }
        this.picker = setUpThePicker( this.extension )
    },
    teardown: tearDownThePicker
})

test( 'Get and set', function() {

    var picker = this.picker

    strictEqual( picker.get( 'select' ), 0, 'Check: default selection' )
    strictEqual( picker.get( 'highlight' ), 0, 'Check: default highlight' )

    var $highlight = picker.$root.find( '#highlight' )
    ok( $highlight.click(), 'Click: highlight button' )
    notStrictEqual( picker.get( 'highlight' ), 0, 'Check: highlight changed' )
    strictEqual( picker.get( 'select' ), 0, 'Check: select unchanged' )

    var $select = picker.$root.find( '#select' )
    ok( $select.click(), 'Click: select button' )
    notStrictEqual( picker.get( 'select' ), 0, 'Check: select changed' )
    strictEqual( picker.get( 'select' ), picker.get( 'highlight' ), 'Check: highlight updated' )
})






/**
 * Check the formats-based api.
 */
module( 'API formats', {
    setup: function() {
        this.extension = {
            name: 'pick--dict-formatter',
            formats: {
                lol: 'Laugh Out Loud!',
                c: function( value ) {
                    var string = '' + value
                    for ( var i = value + 1; i < value + 5; i += 1 ) {
                        string += i
                    }
                    return string
                }
            }
        }
        this.picker = setUpThePicker( this.extension )
    },
    teardown: tearDownThePicker
})

test( 'Get and set with formats', function() {

    var picker = this.picker

    strictEqual( picker.get( 'select', 'lol [That’s kinda funny, lol].' ), 'Laugh Out Loud! That’s kinda funny, lol.', 'Check: abbreviation expansion' )
    strictEqual( picker.get( 'select', 'c [Let’s count up to c what happens].' ), '01234 Let’s count up to c what happens.', 'Check: value expansion' )

    ok( picker.set( 'select', 9 ), 'Change: selection value' )
    strictEqual( picker.get( 'select', 'c [Let’s count up to c what happens].' ), '910111213 Let’s count up to c what happens.', 'Check: updated value epansion' )
})






/**
 * Check the custom dict api.
 */
module( 'API custom dict', {
    setup: function() {
        this.extension = {
            name: 'pick--dict-custom',
            dict: {
                sup: 'not much',
                highlight: 400
            },
            cascades: {
                select: false,
                sup: 'highlight'
            }
        }
        this.picker = setUpThePicker( this.extension )
    },
    teardown: tearDownThePicker
})

test( 'Get and set with dict and cascades', function() {

    var picker = this.picker

    strictEqual( picker.get( 'sup' ), 'not much', 'Check: custom value' )

    strictEqual( picker.get( 'select' ), 0, 'Check: default value' )
    strictEqual( picker.get( 'highlight' ), 400, 'Check: default override' )

    ok( picker.set( 'select', 50 ), 'Change: default value' )

    strictEqual( picker.get( 'select' ), 50, 'Check: default updated' )
    strictEqual( picker.get( 'highlight' ), 400, 'Check: cascade override' )

    ok( picker.set( 'sup', 'just chillin’' ), 'Change: custom value' )

    strictEqual( picker.get( 'sup' ), 'just chillin’', 'Check: custom value updated' )
    strictEqual( picker.get( 'highlight' ), 'just chillin’', 'Check: custom cascade to default' )
})






/**
 * Check the custom get/set methods api.
 */
module( 'API custom get/set methods', {
    setup: function() {
        this.extension = {
            name: 'pick--get-set-custom',
            get: function( thing, options ) {
                var value = this.dict[ thing ]
                return options === true ? value : String.fromCharCode( 65 + value )
            },
            set: function( thing, value/*, options*/ ) {
                value = value.charCodeAt(0) - 65
                this.dict[ thing ] = value
                return value
            }
        }
        this.picker = setUpThePicker( this.extension )
    },
    teardown: tearDownThePicker
})

test( 'Get and set with custom methods', function() {

    var picker = this.picker

    strictEqual( picker.get( 'highlight' ), 'A', 'Check: custom get' )
    strictEqual( picker.get( 'highlight', true ), 0, 'Check: custom get with options' )

    ok( picker.set( 'highlight', 'K' ), 'Change: custom set for value' )

    strictEqual( picker.get( 'highlight' ), 'K', 'Check: value updated' )
    strictEqual( picker.get( 'highlight', true ), 10, 'Check: stored value updated' )
})





/**
 * Check the default key methods api.
 */
module( 'API keys', {
    setup: function() {
        this.extension = {
            name: 'pick--keys',
            keys: {
                65: function( /*event*/ ) {
                    ++this.dict.highlight
                }
            }
        }
        this.picker = setUpThePicker( this.extension )
    },
    teardown: tearDownThePicker
})

test( 'Default bindings', function() {

    var picker = this.picker

    ok( picker.$host.focus(), 'Focus: picker node' )

    strictEqual( picker.is( 'opened' ), true, 'Check: opened' )
    strictEqual( picker.is( 'focused' ), true, 'Check: focused' )
})

test( 'Custom bindings', function() {

    var picker = this.picker

    ok( picker.$host.focus(), 'Focus: picker node' )

    ok( picker.$host.trigger( $.Event( 'keydown', { keyCode: 65 } ) ), 'Trigger: keydown event' )
    strictEqual( picker.get( 'highlight' ), 1, 'Check: fired custom binding' )
})





/**
 * Check the input elements api.
 */
module( 'API inputs', {
    setup: function() {
        this.extension = {
            name: 'pick--input',
            formats: {
                dd: function( value ) {
                    return '0' + value
                },
                ddd: function( value ) {
                    return '00' + value
                }
            },
            init: function( formatValueHash ) {
                if ( 'dd' in formatValueHash ) this.dict.select = ~~formatValueHash.dd
                if ( 'ddd' in formatValueHash ) this.dict.select = ~~formatValueHash.ddd
            },
            defaults: {
                format: 'dd',
                formatHidden: 'ddd',
                inputName: 'value_input',
                inputNameHidden: 'value_input_hidden',
                value: '06'
            }
        }
        this.picker = setUpThePicker( this.extension )
    },
    teardown: tearDownThePicker
})

test( 'Values', function() {

    var picker = this.picker

    strictEqual( picker.get( 'select' ), 6, 'Check: select updated' )
    strictEqual( picker.get( 'value' ), '06', 'Check: input value' )
    strictEqual( picker.get( 'valueHidden' ), '006', 'Check: hidden input value' )

    ok( picker.set( 'select', 9 ), 'Change: select updated' )

    strictEqual( picker.get( 'select' ), 9, 'Check: select updated' )
    strictEqual( picker.get( 'value' ), '09', 'Check: input value' )
    strictEqual( picker.get( 'valueHidden' ), '009', 'Check: hidden input value' )
})

test( 'Names', function() {

    var picker = this.picker

    strictEqual( picker.$input[0].name, 'value_input', 'Check: input name' )
    strictEqual( picker._hidden.name, 'value_input_hidden', 'Check: hidden input name' )
})





/**
 * Check the basic events.
 */
module( 'API events', {
    setup: function() {
        var mod = this
        mod.has = {}
        this.extension = {
            name: 'pick--loudmouth',
            content: '<div>This extension says exactly what it’s doing.</div>',
            onStart: function() {
                mod.has.started = true
            },
            onRender: function() {
                mod.has.rendered = true
            },
            onStop: function() {
                mod.has.stopped = true
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
            onStop: function() {
                mod.has.opts_stopped = true
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
        this.picker = setUpThePicker( this.extension, this.options )
    },
    teardown: tearDownThePicker
})

test( 'As defaults', 8, function() {

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

    picker.stop()
    strictEqual( mod.has.stopped, true, 'Check: `onStop`' )
})

test( 'As options', 8, function() {

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

    picker.stop()
    strictEqual( mod.has.opts_stopped, true, 'Check: `onStop`' )
})

test( 'As multiple bindings', 8, function() {

    var picker = this.picker

    // Register the events.
    picker.
        on( 'start', function() {
            ok( true, 'Check: `on(‘start’)`' )
        }).
        on( 'render', function() {
            ok( true, 'Check: `on(‘render’)`' )
        }).
        on( 'stop', function() {
            ok( true, 'Check: `on(‘stop’)`' )
        }).
        on( 'open', function() {
            ok( true, 'Check: `on(‘open’)`' )
        }).
        on( 'close', function() {
            ok( true, 'Check: `on(‘close’)`' )
        }).
        on( 'blur', function() {
            ok( true, 'Check: `on(‘blur’)`' )
        }).
        on( 'focus', function() {
            ok( true, 'Check: `on(‘focus’)`' )
        }).
        on( 'set', function() {
            ok( true, 'Check: `on(‘set’)`' )
        })


    // Trigger the events.
    picker.
        trigger( 'start' ).
        trigger( 'open' ).
        trigger( 'close' ).
        trigger( 'render' ).
        trigger( 'set' ).
        trigger( 'blur' ).
        trigger( 'focus' )
})

test( 'As a single binding', 8, function() {

    var picker = this.picker

    // Register the events.
    picker.on({
        start: function() {
            ok( true, 'Check: `on(‘start’)`' )
        },
        render: function() {
            ok( true, 'Check: `on(‘render’)`' )
        },
        stop: function() {
            ok( true, 'Check: `on(‘stop’)`' )
        },
        open: function() {
            ok( true, 'Check: `on(‘open’)`' )
        },
        close: function() {
            ok( true, 'Check: `on(‘close’)`' )
        },
        blur: function() {
            ok( true, 'Check: `on(‘blur’)`' )
        },
        focus: function() {
            ok( true, 'Check: `on(‘focus’)`' )
        },
        set: function() {
            ok( true, 'Check: `on(‘set’)`' )
        }
    })


    // Trigger the events.
    picker.
        trigger( 'start' ).
        trigger( 'open' ).
        trigger( 'close' ).
        trigger( 'render' ).
        trigger( 'set' ).
        trigger( 'blur' ).
        trigger( 'focus' )
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





