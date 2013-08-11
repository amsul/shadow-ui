

var $DOM = $( '#qunit-fixture' )
var $NODE_DIV = $( '<div/>' )
var $NODE_INPUT = $( '<input>' )
var tearDownTheUI = function() {
    this.ui.stop()
    $DOM.empty()
    ;delete shadow.EXTENSIONS[ this.ui.i.name ]
}


/**
 * Check the existence.
 */
module( 'Core' )

test( 'Globals', function() {
    ok( shadow, 'Object: shadow' )
    ok( $.isFunction( shadow.extend ), 'Method: Extend shadow' )
    deepEqual( $.fn.shadow.extend, shadow.extend, 'Method: Extend shadow with jQuery' )
    ok( $.isFunction( $.fn.shadow ), 'Method: Create shadow extension' )
})






/**
 * Check the most basic api.
 */
module( 'API `div` minimal', {
    setup: function() {
        this.extension = {
            name: 'shadow--basic',
            content: '<div>This is the most basic form of a shadow extension.</div>'
        }
        shadow.extend( this.extension )
        var $clone = $NODE_DIV.clone().appendTo( $DOM )
        this.ui = $clone.shadow( 'shadow--basic' ).shadow( 'ui' )
    },
    teardown: tearDownTheUI
})

test( 'Extension', function() {

    // Confirm the shadow instance has the extension.
    deepEqual( this.ui.r.extension, this.extension, 'Check: instance extension' )

    // Confirm it also stored appropriately.
    deepEqual( shadow.EXTENSIONS[ 'shadow--basic' ], this.extension, 'Check: collected extension' )

    // Confirm the host is the source.
    deepEqual( this.ui.$host, this.ui.$source, 'Check: host `div` is the source element' )
})

test( 'Start and stop with extension data', function() {

    var ui = this.ui
    var $host = ui.$host

    // Confirm the data exists.
    ok( $host.data( 'shadow' ) instanceof shadow.UI, 'Exists: shadow data' )

    // Confirm the ui started.
    strictEqual( ui.is( 'started' ), true, 'Check: started' )

    // Destroy a shadow extension on the element.
    ok( ui.stop(), 'Trigger: stop' )
    strictEqual( $host.data( 'shadow' ), undefined, 'Destroy: shadow data' )

    // Confirm the ui stopped.
    strictEqual( ui.is( 'started' ), false, 'Check: stopped' )

    // Re-create a shadow extension on the element.
    ok( ui.start(), 'Trigger: start' )
    ok( $host.data( 'shadow' ) instanceof shadow.UI, 'Exists: shadow data' )

    // Confirm the ui started again.
    strictEqual( ui.is( 'started' ), true, 'Check: started' )
})

test( 'Open, close, focus, and blur', function() {

    var ui = this.ui
    var $host = ui.$host

    // Confirm the starting state.
    strictEqual( ui.is( 'opened' ), false, 'Check: closed' )
    strictEqual( ui.is( 'focused' ), false, 'Check: unfocused' )

    // Click to open it.
    ok( $host.click(), 'Open: node click' )
    strictEqual( ui.is( 'opened' ), true, 'Check: opened' )
    strictEqual( ui.is( 'focused' ), true, 'Check: focused' )

    // Click to close it.
    ok( $DOM.click(), 'Close: doc click' )
    strictEqual( ui.is( 'opened' ), false, 'Check: closed' )
    strictEqual( ui.is( 'focused' ), false, 'Check: unfocused' )

    // Open the ui and confirm the change.
    ok( ui.open(), 'Trigger: open' )
    strictEqual( ui.is( 'opened' ), true, 'Check: opened' )
    strictEqual( ui.is( 'focused' ), false, 'Check: unfocused' )

    // Close the ui and confirm the change.
    ok( ui.close(), 'Trigger: close' )
    strictEqual( ui.is( 'opened' ), false, 'Check: closed' )
    strictEqual( ui.is( 'focused' ), false, 'Check: unfocused' )

    // Open the ui with focus and confirm the change.
    ok( ui.open( true ), 'Trigger: open with focus' )
    strictEqual( ui.is( 'opened' ), true, 'Check: opened' )
    strictEqual( ui.is( 'focused' ), true, 'Check: focused' )

    // Close the ui with focus and confirm the change.
    ok( ui.close( true ), 'Trigger: close with focus' )
    strictEqual( ui.is( 'opened' ), false, 'Check: closed' )
    strictEqual( ui.is( 'focused' ), true, 'Check: focused' )
})






/**
 * Check the most basic `input` api.
 */
module( 'API `input` minimal', {
    setup: function() {
        this.extension = {
            name: 'shadow--basic-input',
            content: '<div>This is the most basic form of an `input` shadow extension.</div>'
        }
        shadow.extend( this.extension )
        var $clone = $NODE_INPUT.clone().appendTo( $DOM )
        this.ui = $clone.shadow( 'shadow--basic-input' ).shadow( 'ui' )
    },
    teardown: tearDownTheUI
})

test( 'Extension', function() {

    // Confirm the shadow instance has the extension.
    deepEqual( this.ui.r.extension, this.extension, 'Check: instance extension' )

    // Confirm it also stored appropriately.
    deepEqual( shadow.EXTENSIONS[ 'shadow--basic-input' ], this.extension, 'Check: collected extension' )

    // Confirm the `input` is the source.
    deepEqual( this.ui.$input, this.ui.$source, 'Check: `input` is the source element' )
})

test( 'Start and stop with extension data', function() {

    var ui = this.ui
    var $input = ui.$input

    // Confirm the data exists.
    ok( $input.data( 'shadow' ) instanceof shadow.UI, 'Exists: shadow data' )

    // Confirm the ui started.
    strictEqual( ui.is( 'started' ), true, 'Check: started' )

    // Destroy a shadow extension on the element.
    ok( ui.stop(), 'Trigger: stop' )
    strictEqual( $input.data( 'shadow' ), undefined, 'Destroy: shadow data' )

    // Confirm the ui stopped.
    strictEqual( ui.is( 'started' ), false, 'Check: stopped' )

    // Re-create a shadow extension on the element.
    ok( ui.start(), 'Trigger: start' )
    ok( $input.data( 'shadow' ) instanceof shadow.UI, 'Exists: shadow data' )

    // Confirm the ui started again.
    strictEqual( ui.is( 'started' ), true, 'Check: started' )
})

test( 'Open, close, focus, and blur', function() {

    var ui = this.ui
    var $input = ui.$input

    // Confirm the starting state.
    strictEqual( ui.is( 'opened' ), false, 'Check: closed' )
    strictEqual( ui.is( 'focused' ), false, 'Check: unfocused' )

    // Click to open it.
    ok( $input.click(), 'Open: node click' )
    strictEqual( ui.is( 'opened' ), true, 'Check: opened' )
    strictEqual( ui.is( 'focused' ), true, 'Check: focused' )

    // Click to close it.
    ok( $DOM.click(), 'Close: doc click' )
    strictEqual( ui.is( 'opened' ), false, 'Check: closed' )
    strictEqual( ui.is( 'focused' ), false, 'Check: unfocused' )

    // Open the ui and confirm the change.
    ok( ui.open(), 'Trigger: open' )
    strictEqual( ui.is( 'opened' ), true, 'Check: opened' )
    strictEqual( ui.is( 'focused' ), false, 'Check: unfocused' )

    // Close the ui and confirm the change.
    ok( ui.close(), 'Trigger: close' )
    strictEqual( ui.is( 'opened' ), false, 'Check: closed' )
    strictEqual( ui.is( 'focused' ), false, 'Check: unfocused' )

    // Open the ui with focus and confirm the change.
    ok( ui.open( true ), 'Trigger: open with focus' )
    strictEqual( ui.is( 'opened' ), true, 'Check: opened' )
    strictEqual( ui.is( 'focused' ), true, 'Check: focused' )

    // Close the ui with focus and confirm the change.
    ok( ui.close( true ), 'Trigger: close with focus' )
    strictEqual( ui.is( 'opened' ), false, 'Check: closed' )
    strictEqual( ui.is( 'focused' ), true, 'Check: focused' )
})






/**
 * Check the alias name api.
 */
module( 'API alias', {
    setup: function() {
        shadow.extend({
            name: 'shadow--alias',
            alias: 'shadowAliased'
        })
        var $clone = $NODE_DIV.clone().appendTo( $DOM )
        this.ui = $clone.shadowAliased().shadowAliased( 'ui' )
    },
    teardown: tearDownTheUI
})

test( 'Alias extension', function() {
    var ui = this.ui
    strictEqual( shadow.EXTENSIONS[ ui.i.alias ], ui.i.name, 'Check: extension alias linked' )
})






/**
 * Check the class name prefixing api.
 */
module( 'API prefix', {
    setup: function() {
        shadow.extend({
            name: 'shadow--prefix',
            prefix: 'prefix-ftw'
        })
        var $clone = $NODE_DIV.clone().appendTo( $DOM )
        this.ui = $clone.shadow( 'shadow--prefix' ).shadow( 'ui' )
    },
    teardown: tearDownTheUI
})

test( 'Prefix class names', function() {
    var ui = this.ui
    ok( ui.$root[0].className.match( /^prefix-ftw$/ ), 'Check: prefix root element' )
    ok( ui.$host[0].className.match( /^prefix-ftw-/ ), 'Check: prefix host element' )
})






/**
 * Check the dict-based api.
 */
module( 'API dict', {
    setup: function() {
        shadow.extend({
            name: 'shadow--dict',
            content: function() {
                var to_select = ~~(Math.random()*1000),
                    to_highlight = ~~(Math.random()*1000)
                return '<div class="content">' +
                    'Select: <u>' + this.ui.get('select') + '</u><br>' +
                    'Highlight: <u>' + this.ui.get('highlight') + '</u><hr>' +
                    '<button id="select" data-pick="select:' + to_select + '">Set select to ' + to_select + '</button>' +
                    '<button id="highlight" data-pick="highlight:' + to_highlight + '">Set highlight to ' + to_highlight + '</button>' +
                '</div>'
            }
        })
        var $clone = $NODE_DIV.clone().appendTo( $DOM )
        this.ui = $clone.shadow( 'shadow--dict' ).shadow( 'ui' )
    },
    teardown: tearDownTheUI
})

test( 'Get and set', function() {

    var ui = this.ui

    strictEqual( ui.get( 'select' ), 0, 'Check: default selection' )
    strictEqual( ui.get( 'highlight' ), 0, 'Check: default highlight' )

    var $highlight = ui.$root.find( '#highlight' )
    ok( $highlight.click(), 'Click: highlight button' )
    notStrictEqual( ui.get( 'highlight' ), 0, 'Check: highlight changed' )
    strictEqual( ui.get( 'select' ), 0, 'Check: select unchanged' )

    var $select = ui.$root.find( '#select' )
    ok( $select.click(), 'Click: select button' )
    notStrictEqual( ui.get( 'select' ), 0, 'Check: select changed' )
    strictEqual( ui.get( 'select' ), ui.get( 'highlight' ), 'Check: highlight updated' )
})






/**
 * Check the formats-based api.
 */
module( 'API formats', {
    setup: function() {
        shadow.extend({
            name: 'shadow--dict-formatter',
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
        })
        var $clone = $NODE_DIV.clone().appendTo( $DOM )
        this.ui = $clone.shadow( 'shadow--dict-formatter' ).shadow( 'ui' )
    },
    teardown: tearDownTheUI
})

test( 'Get and set with formats', function() {

    var ui = this.ui

    strictEqual( ui.get( 'select', 'lol [That’s kinda funny, lol].' ), 'Laugh Out Loud! That’s kinda funny, lol.', 'Check: abbreviation expansion' )
    strictEqual( ui.get( 'select', 'c [Let’s count up to c what happens].' ), '01234 Let’s count up to c what happens.', 'Check: value expansion' )

    ok( ui.set( 'select', 9 ), 'Change: selection value' )
    strictEqual( ui.get( 'select', 'c [Let’s count up to c what happens].' ), '910111213 Let’s count up to c what happens.', 'Check: updated value epansion' )
})






/**
 * Check the custom dict api.
 */
module( 'API custom dict', {
    setup: function() {
        shadow.extend({
            name: 'shadow--dict-custom',
            dict: {
                sup: 'not much',
                highlight: 400,
                lucky_ones: [ 0, 3, 4, 5, 10 ]
            },
            cascades: {
                select: false,
                sup: 'highlight'
            }
        })
        var $clone = $NODE_DIV.clone().appendTo( $DOM )
        this.ui = $clone.shadow( 'shadow--dict-custom' ).shadow( 'ui' )
    },
    teardown: tearDownTheUI
})

test( 'Get and set with dict and cascades', function() {

    var ui = this.ui

    strictEqual( ui.get( 'sup' ), 'not much', 'Check: custom value' )

    strictEqual( ui.get( 'select' ), 0, 'Check: default value' )
    strictEqual( ui.get( 'highlight' ), 400, 'Check: default override' )

    ok( ui.set( 'select', 50 ), 'Change: default value' )

    strictEqual( ui.get( 'select' ), 50, 'Check: default updated' )
    strictEqual( ui.get( 'highlight' ), 400, 'Check: cascade override' )

    ok( ui.set( 'sup', 'just chillin’' ), 'Change: custom value' )

    strictEqual( ui.get( 'sup' ), 'just chillin’', 'Check: custom value updated' )
    strictEqual( ui.get( 'highlight' ), 'just chillin’', 'Check: custom cascade to default' )
})

test( 'Add and remove with dict collections', function() {

    var ui = this.ui

    deepEqual( ui.get( 'lucky_ones' ), [ 0, 3, 4, 5, 10 ], 'Check: initial value' )

    ok( ui.add( 'lucky_ones', 2 ), 'Change: updated collection' )

    deepEqual( ui.get( 'lucky_ones' ), [ 0, 3, 4, 5, 10, 2 ], 'Check: added new item' )

    ok( ui.remove( 'lucky_ones', 3 ), 'Change: updated collection' )

    deepEqual( ui.get( 'lucky_ones' ), [ 0, 4, 5, 10, 2 ], 'Check: removed item' )
})






/**
 * Check the custom get/set methods api.
 */
module( 'API custom get/set methods', {
    setup: function() {
        shadow.extend({
            name: 'shadow--get-set-custom',
            get: function( thing, options ) {
                var value = this.dict[ thing ]
                return options === true ? value : String.fromCharCode( 65 + value )
            },
            set: function( thing, value/*, options*/ ) {
                value = value.charCodeAt(0) - 65
                this.dict[ thing ] = value
                return value
            }
        })
        var $clone = $NODE_DIV.clone().appendTo( $DOM )
        this.ui = $clone.shadow( 'shadow--get-set-custom' ).shadow( 'ui' )
    },
    teardown: tearDownTheUI
})

test( 'Get and set with custom methods', function() {

    var ui = this.ui

    strictEqual( ui.get( 'highlight' ), 'A', 'Check: custom get' )
    strictEqual( ui.get( 'highlight', true ), 0, 'Check: custom get with options' )

    ok( ui.set( 'highlight', 'K' ), 'Change: custom set for value' )

    strictEqual( ui.get( 'highlight' ), 'K', 'Check: value updated' )
    strictEqual( ui.get( 'highlight', true ), 10, 'Check: stored value updated' )
})





/**
 * Check the default key methods api.
 */
module( 'API keys', {
    setup: function() {
        shadow.extend({
            name: 'shadow--keys',
            keys: {
                65: function( /*event*/ ) {
                    ++this.dict.highlight
                }
            }
        })
        var $clone = $NODE_DIV.clone().appendTo( $DOM )
        this.ui = $clone.shadow( 'shadow--keys' ).shadow( 'ui' )
    },
    teardown: tearDownTheUI
})

test( 'Default bindings', function() {

    var ui = this.ui

    ok( ui.$host.focus(), 'Focus: shadow host node' )

    strictEqual( ui.is( 'opened' ), true, 'Check: opened' )
    strictEqual( ui.is( 'focused' ), true, 'Check: focused' )
})

test( 'Custom bindings', function() {

    var ui = this.ui

    ok( ui.$host.focus(), 'Focus: shadow host node' )

    ok( ui.$host.trigger( $.Event( 'keydown', { keyCode: 65 } ) ), 'Trigger: keydown event' )
    strictEqual( ui.get( 'highlight' ), 1, 'Check: fired custom binding' )
})





/**
 * Check the input elements api.
 */
module( 'API inputs', {
    setup: function() {
        shadow.extend({
            name: 'shadow--input',
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
                suffixHidden: '_hidden'
            }
        })
        var $clone = $NODE_INPUT.clone().attr({  value: '06', name: 'value_input' }).appendTo( $DOM )
        this.ui = $clone.shadow( 'shadow--input' ).shadow( 'ui' )
    },
    teardown: tearDownTheUI
})

test( 'Values', function() {

    var ui = this.ui

    strictEqual( ui.get( 'select' ), 6, 'Check: select updated' )
    strictEqual( ui.get( 'value' ), '06', 'Check: input value' )
    strictEqual( ui.get( 'valueHidden' ), '006', 'Check: hidden input value' )

    ok( ui.set( 'select', 9 ), 'Change: select updated' )

    strictEqual( ui.get( 'select' ), 9, 'Check: select updated' )
    strictEqual( ui.get( 'value' ), '09', 'Check: input value' )
    strictEqual( ui.get( 'valueHidden' ), '009', 'Check: hidden input value' )
})

test( 'Names', function() {

    var ui = this.ui

    strictEqual( ui.$input[0].name, 'value_input', 'Check: input name' )
    strictEqual( ui._hidden.name, 'value_input_hidden', 'Check: hidden input name' )
})





/**
 * Check the basic events.
 */
module( 'API events', {
    setup: function() {
        var mod = this
        mod.has = {}
        shadow.extend({
            name: 'shadow--loudmouth',
            content: '<div>This extension says exactly what it’s doing.</div>',
            init: function() {
                mod.has.initialized = true
            },
            ready: function() {
                mod.has.readied = true
            }
        })
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
        var $clone = $NODE_DIV.clone().appendTo( $DOM )
        this.ui = $clone.shadow( 'shadow--loudmouth', this.options ).shadow( 'ui' )
    },
    teardown: tearDownTheUI
})

test( 'Instance events', 2, function() {

    var mod = this

    strictEqual( mod.has.initialized, true, 'Check: `init`' )
    strictEqual( mod.has.readied, true, 'Check: `ready`' )
})

test( 'Extension options', 8, function() {

    var mod = this
    var ui = this.ui

    strictEqual( mod.has.opts_started, true, 'Check: `onStart`' )
    strictEqual( mod.has.opts_rendered, true, 'Check: `onRender`' )

    ui.open()
    strictEqual( mod.has.opts_opened, true, 'Check: `onOpen`' )

    ui.close()
    strictEqual( mod.has.opts_closed, true, 'Check: `onClose`' )

    ui.focus()
    strictEqual( mod.has.opts_focused, true, 'Check: `onFocus`' )

    ui.blur()
    strictEqual( mod.has.opts_blurred, true, 'Check: `onBlur`' )

    ui.set( 'select' )
    strictEqual( mod.has.opts_selected, true, 'Check: `onSet`' )

    ui.stop()
    strictEqual( mod.has.opts_stopped, true, 'Check: `onStop`' )
})

test( 'Extension multiple bindings', 8, function() {

    var ui = this.ui

    // Register the events.
    ui.
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
    ui.
        trigger( 'start' ).
        trigger( 'open' ).
        trigger( 'close' ).
        trigger( 'render' ).
        trigger( 'set' ).
        trigger( 'blur' ).
        trigger( 'focus' )
})

test( 'Extension single bindings', 8, function() {

    var ui = this.ui

    // Register the events.
    ui.on({
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
    ui.
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





