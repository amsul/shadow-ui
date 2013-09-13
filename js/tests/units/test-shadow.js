

var $DOM = $( '#qunit-fixture' )
var $NODE_DIV = $( '<div/>' )
var $NODE_INPUT = $( '<input>' )
var tearDownTheUI = function() {
    this.ui.stop()
    $DOM.empty()
    ;delete shadow.ELEMENTS[ this.ui.i.name ]
}


/**
 * The core functionality.
 */
module( 'Core' )

test( 'Globals', function() {
    ok( $.isFunction( shadow ), 'Function: shadow extend' )
    ok( $.isFunction( shadow.create ), 'Function: shadow create' )
    ok( $.isFunction( $.fn.shadow ), 'Method: manipulate shadow with jQuery' )
})






/**
 * The component api.
 */
module( 'Setup', {
    setup: function() {
        var $node = $NODE_DIV.clone().attr('data-ui', 'component').appendTo( $DOM )
        this.extension = shadow( 'component' )
        this.ui = $node.shadow()
    },
    teardown: tearDownTheUI
})

test( 'Generic', function() {

    var ui = this.ui

    deepEqual( shadow.ELEMENTS[ ui.i.name ], this.extension, 'Stored extension' )
    deepEqual( ui.$host, ui.$source, 'Host `div` is the source element' )
})

module( 'Setup', {
    setup: function() {
        var $node = $NODE_INPUT.clone().attr('data-ui', 'component').appendTo( $DOM )
        this.extension = shadow( 'component' )
        this.ui = $node.shadow()
    },
    teardown: tearDownTheUI
})

test( 'Input', function() {

    var ui = this.ui

    deepEqual( ui.$input, ui.$source, 'Bound `input` is the source element' )
    ok( ui.$host && ui.$host[0], 'Generated host element' )
})

module( 'Setup', {
    setup: function() {
        var $node = $NODE_INPUT.clone().attr('data-ui', 'component').appendTo( $DOM )
        this.extension = shadow( 'component', {
            alias: 'aliasComponent'
        })
        this.ui = $node.aliasComponent()
    },
    teardown: tearDownTheUI
})

test( 'Aliased', function() {

    var ui = this.ui

    strictEqual( shadow.ELEMENTS[ ui.i.alias ], ui.i.name, 'Referenced alias' )
    ok( $.fn[ ui.i.alias ], 'jQuery aliased extension' )
})

module( 'Setup', {
    setup: function() {
        var $node = $NODE_INPUT.clone().attr('data-ui', 'component').appendTo( $DOM )
        this.extension = shadow( 'component', {
            prefix: 'prefix-ftw'
        })
        this.ui = $node.shadow()
    },
    teardown: tearDownTheUI
})

test( 'Prefixed', function() {

    var ui = this.ui

    ok( ui.$root[0].className.match( /^prefix-ftw$/ ), 'Root element' )
    ok( ui.$source[0].className.match( /^prefix-ftw-/ ), 'Source element' )
})






/**
 * The component methods.
 */
module( 'Methods', {
    setup: function() {
        var $node = $NODE_DIV.clone().attr('data-ui', 'component').appendTo( $DOM )
        this.extension = shadow( 'component', {
            template: '<button></button>',
            dict: {
                options: [{id:1},{id:2},{id:3},{id:4}],
                options_alt: [{id:1},{id:2},{id:3},{id:4}],
                collection: [],
                selection: 0,
                from_value: 10,
                to_value: 30
            },
            find: {
                options: function( item ) {
                    return this.id === item.id
                },
                options_alt: function( item ) {
                    return this.id === item.id
                }
            },
            create: {
                options_alt: function( value ) {
                    return { id: value }
                }
            },
            formats: {
                lol: 'Laugh Out Loud!',
                c: function( value/*, isParsing*/ ) {
                    var string = '' + value
                    for ( var i = value + 1; i < value + 5; i += 1 ) {
                        string += i
                    }
                    return string
                }
            },
            cascades: {
                from_value: 'to_value'
            }
        })
        this.ui = $node.shadow()
    },
    teardown: tearDownTheUI
})

test( 'Start and stop', function() {

    var ui = this.ui

    deepEqual( ui.$source.data('shadow'), this.ui, 'Stored' )
    strictEqual( ui.is('started'), true, 'Started' )
    strictEqual( ui.is('opened'), false, 'Closed' )
    strictEqual( ui.is('focused'), false, 'Blurred' )
    strictEqual( ui.is('captured'), false, 'Released' )

    ui.stop()

    strictEqual( ui.$source.data('shadow'), undefined, 'Destroyed' )
    strictEqual( ui.is('started'), false, 'Stopped' )
    strictEqual( ui.is('opened'), false, 'Closed' )
    strictEqual( ui.is('focused'), false, 'Blurred' )
    strictEqual( ui.is('captured'), false, 'Released' )
})

test( 'Render', function() {

    var ui = this.ui

    ui.$root.append('<button/>')
    ui.$root.find('.' + ui.klasses.box).append('<button/>')

    strictEqual( ui.$root.find('button').length, 3, 'Added buttons' )

    ui.render()

    strictEqual( ui.$root.find('button').length, 2, 'Re-rendered box' )

    ui.render( true )

    strictEqual( ui.$root.find('button').length, 1, 'Re-rendered root' )
})

test( 'Open and close', function() {

    var ui = this.ui

    ui.open()

    strictEqual( ui.is('started'), true, 'Started' )
    strictEqual( ui.is('opened'), true, 'Opened' )
    strictEqual( ui.is('focused'), false, 'Blurred' )
    strictEqual( ui.is('captured'), false, 'Released' )

    ui.close()

    strictEqual( ui.is('started'), true, 'Started' )
    strictEqual( ui.is('opened'), false, 'Closed' )
    strictEqual( ui.is('focused'), false, 'Blurred' )
    strictEqual( ui.is('captured'), false, 'Released' )
})

test( 'Open and close with focus', function() {

    var ui = this.ui

    ui.open( true )

    strictEqual( ui.is('started'), true, 'Started' )
    strictEqual( ui.is('opened'), true, 'Opened' )
    strictEqual( ui.is('focused'), true, 'Focused' )
    strictEqual( ui.is('captured'), true, 'Captured' )

    ui.close( true )

    strictEqual( ui.is('started'), true, 'Started' )
    strictEqual( ui.is('opened'), false, 'Closed' )
    strictEqual( ui.is('focused'), true, 'Focused' )
    strictEqual( ui.is('captured'), true, 'Captured' )
})

test( 'Open and close on click', function() {

    var ui = this.ui

    ui.$source.click()

    strictEqual( ui.is('started'), true, 'Started' )
    strictEqual( ui.is('opened'), true, 'Opened' )
    strictEqual( ui.is('focused'), true, 'Focused' )
    strictEqual( ui.is('captured'), true, 'Captured' )

    $DOM.click()

    strictEqual( ui.is('started'), true, 'Started' )
    strictEqual( ui.is('opened'), false, 'Closed' )
    strictEqual( ui.is('focused'), false, 'Blurred' )
    strictEqual( ui.is('captured'), false, 'Released' )
})

test( 'Open and close on focus/blur', function() {

    var ui = this.ui

    ui.$source.focus()

    strictEqual( ui.is('started'), true, 'Started' )
    strictEqual( ui.is('opened'), true, 'Opened' )
    strictEqual( ui.is('focused'), true, 'Focused' )
    strictEqual( ui.is('captured'), true, 'Captured' )

    ui.$source.blur()

    strictEqual( ui.is('started'), true, 'Started' )
    strictEqual( ui.is('opened'), false, 'Closed' )
    strictEqual( ui.is('focused'), false, 'Blurred' )
    strictEqual( ui.is('captured'), false, 'Released' )

    ui.$root.find('button').focus()

    strictEqual( ui.is('started'), true, 'Started' )
    strictEqual( ui.is('opened'), true, 'Opened' )
    strictEqual( ui.is('focused'), true, 'Focused' )
    strictEqual( ui.is('captured'), false, 'Captured' )
})

test( 'Focus and blur', function() {

    var ui = this.ui

    ui.focus()

    strictEqual( ui.is('started'), true, 'Started' )
    strictEqual( ui.is('opened'), true, 'Opened' )
    strictEqual( ui.is('focused'), true, 'Focused' )
    strictEqual( ui.is('captured'), true, 'Captured' )

    ui.blur()

    strictEqual( ui.is('started'), true, 'Started' )
    strictEqual( ui.is('opened'), true, 'Opened' )
    strictEqual( ui.is('focused'), false, 'Blurred' )
    strictEqual( ui.is('captured'), true, 'Captured' )
})

test( 'Capture and release', function() {

    var ui = this.ui

    ui.capture()

    strictEqual( ui.is('started'), true, 'Started' )
    strictEqual( ui.is('opened'), false, 'Closed' )
    strictEqual( ui.is('focused'), false, 'Blurred' )
    strictEqual( ui.is('captured'), true, 'Captured' )

    ui.release()

    strictEqual( ui.is('started'), true, 'Started' )
    strictEqual( ui.is('opened'), false, 'Closed' )
    strictEqual( ui.is('focused'), false, 'Blurred' )
    strictEqual( ui.is('captured'), false, 'Released' )
})

test( 'Get and set', function() {

    var ui = this.ui

    deepEqual( ui.get('collection'), [], 'Get: collection' )

    ui.set( 'collection', 3 )
    deepEqual( ui.get('collection'), [3], 'Set: collection' )

    ui.set( 'collection', 5 )
    deepEqual( ui.get('collection'), [5], 'Set: collection' )

    deepEqual( ui.get('selection'), 0, 'Get: selection' )

    ui.set( 'selection', 3 )
    deepEqual( ui.get('selection'), 3, 'Set: selection' )

    var button = ui.$root.find('button')[0]
    button.focus()

    deepEqual( ui.get('activeElement'), button, 'Get: active element' )
})

test( 'Get and set with formats', function() {

    var ui = this.ui

    strictEqual( ui.get('selection', 'c [c c c].'), '01234 c c c.', 'Get: value expansion' )
    strictEqual( ui.get('selection', 'lol [lol lol lol]'), 'Laugh Out Loud! lol lol lol', 'Get: abbreviation expansion' )

    ui.set( 'selection', 9 )

    strictEqual( ui.get('selection', 'c [c c c].'), '910111213 c c c.', 'Get: updated value expansion' )

    // can’t `set` with formats yet..
})

test( 'Get and set with cascades', function() {

    var ui = this.ui

    strictEqual( ui.get('from_value'), 10, 'Get: starting “from” value' )
    strictEqual( ui.get('to_value'), 30, 'Get: starting “to” value' )

    ui.set( 'from_value', 100 )

    strictEqual( ui.get('from_value'), 100, 'Get: updated “from” value' )
    strictEqual( ui.get('to_value'), 100, 'Get: mirrored “to” value' )
})

test( 'Add and remove', function() {

    var ui = this.ui

    ui.add( 'collection', 3 ).add( 'collection', 3, 4, 5, 6, 7 )

    deepEqual( ui.get( 'collection' ), [3,4,5,6,7], 'Added to collection' )

    ui.remove( 'collection', 3 ).remove( 'collection', 2, 5, 6 )

    deepEqual( ui.get( 'collection' ), [4,7], 'Removed from collection' )
})

test( 'Add and remove with finders', function() {

    var ui = this.ui

    ui.add( 'options', {id:3}, {id:5} )

    deepEqual( ui.get( 'options' ), [{id:1},{id:2},{id:3},{id:4},{id:5}], 'Added to options' )

    ui.remove( 'options', {id:2}, {id:1} )

    deepEqual( ui.get( 'options' ), [{id:3},{id:4},{id:5}], 'Removed from options' )
})

test( 'Add and remove with creators', function() {

    var ui = this.ui

    ui.add( 'options_alt', 3, 5 )

    deepEqual( ui.get( 'options_alt' ), [{id:1},{id:2},{id:3},{id:4},{id:5}], 'Added to options' )

    ui.remove( 'options_alt', 2, 1 )

    deepEqual( ui.get( 'options_alt' ), [{id:3},{id:4},{id:5}], 'Removed from options' )
})

test( 'On and trigger with one', 1, function() {

    var ui = this.ui

    ui.on( 'rainbow', ok )
    ui.trigger( 'rainbow' )
})

test( 'On and trigger with multiple', 3, function() {

    var ui = this.ui

    ui.on({
        double_rainbow: ok,
        triple_rainbow: ok,
        all_the_way: ok
    })

    ui.
        trigger( 'double_rainbow' ).
        trigger( 'triple_rainbow' ).
        trigger( 'all_the_way' )
})






/**
 * The instance events api.
 */
module( 'Events', {
    events: function( type ) {
        var mod = this
        mod[type] = {}
        return {
            onStart: function() {
                mod[type].started = true
            },
            onRender: function() {
                mod[type].rendered = true
            },
            onStop: function() {
                mod[type].stopped = true
            },
            onOpen: function() {
                mod[type].opened = true
            },
            onClose: function() {
                mod[type].closed = true
            },
            onFocus: function() {
                mod[type].focused = true
            },
            onBlur: function() {
                mod[type].blurred = true
            },
            onCapture: function() {
                mod[type].captured = true
            },
            onRelease: function() {
                mod[type].released = true
            },
            onSet: function() {
                mod[type].selected = true
            }
        }
    },
    create: function( options ) {
        var $node = $NODE_DIV.clone().attr('data-ui', 'component').appendTo( $DOM )
        var mod = this
        mod.extension = shadow( 'component', {
            init: function() {
                mod.initialized = true
            },
            defaults: options || this.events( 'as_defaults' )
        })
        this.ui = $node.shadow()
    },
    teardown: tearDownTheUI
})

test( 'Initialization', 1, function() {

    var mod = this

    mod.create()

    ok( mod.initialized, '`init`' )
})

test( 'As defaults', 10, function() {

    var mod = this

    mod.create()

    ok( mod.as_defaults.started, '`onStart`' )
    ok( mod.as_defaults.rendered, '`onRender`' )

    var ui = this.ui

    ui.open()

    ok( mod.as_defaults.opened, '`onOpen`' )

    ui.close()

    ok( mod.as_defaults.closed, '`onClose`' )

    ui.focus()

    ok( mod.as_defaults.focused, '`onFocus`' )

    ui.blur()

    ok( mod.as_defaults.blurred, '`onBlur`' )

    ui.capture()

    ok( mod.as_defaults.captured, '`onCapture`' )

    ui.release()

    ok( mod.as_defaults.released, '`onRelease`' )

    ui.set( 'select' )

    ok( mod.as_defaults.selected, '`onSet`' )

    ui.stop()

    ok( mod.as_defaults.stopped, '`onStop`' )
})

test( 'As options', 10, function() {

    var mod = this

    mod.create( mod.events( 'as_options' ) )

    ok( mod.as_options.started, '`onStart`' )
    ok( mod.as_options.rendered, '`onRender`' )

    var ui = this.ui

    ui.open()

    ok( mod.as_options.opened, '`onOpen`' )

    ui.close()

    ok( mod.as_options.closed, '`onClose`' )

    ui.focus()

    ok( mod.as_options.focused, '`onFocus`' )

    ui.blur()

    ok( mod.as_options.blurred, '`onBlur`' )

    ui.capture()

    ok( mod.as_options.captured, '`onCapture`' )

    ui.release()

    ok( mod.as_options.released, '`onRelease`' )

    ui.set( 'select' )

    ok( mod.as_options.selected, '`onSet`' )

    ui.stop()

    ok( mod.as_options.stopped, '`onStop`' )
})





/**
 * The instance keyboard events.
 */
module( 'Keyboard events', {
    setup: function() {
        var $node = $NODE_DIV.clone().attr('data-ui', 'component').appendTo( $DOM )
        var mod = this
        mod.extension = shadow( 'component', {
            keys: {
                65: function( /*event*/ ) {
                    mod.keyedEvent = true
                }
            }
        })
        this.ui = $node.shadow()
        this.ui.close( true )
    },
    teardown: tearDownTheUI
})

test( 'Captured bindings', function() {

    var ui = this.ui

    ui.$source.trigger( $.Event( 'keydown', { keyCode: 37 } ) )

    ok( ui.is('opened'), 'Arrow key to open' )

    ui.$source.trigger( $.Event( 'keydown', { keyCode: 27 } ) )

    ok( !ui.is('opened'), 'Escape to close' )

    ui.$source.trigger( $.Event( 'keydown', { keyCode: 65 } ) )

    ok( this.keyedEvent, 'Custom binding' )
})





/**
 * The instance formattings.
 */
module( 'Formats', {
    setup: function() {
        var $node = $NODE_INPUT.clone().attr({ 'data-ui': 'component', value: '06', name: 'value_input' }).appendTo( $DOM )
        this.extension = shadow( 'component', {
            formats: {
                dd: function( value/*, isParsing*/ ) {
                    return '0' + value
                },
                ddd: function( value/*, isParsing*/ ) {
                    return '00' + value
                }
            },
            defaults: {
                format: 'dd',
                formatHidden: 'ddd'
            },
            init: function( formatValueHash ) {
                if ( 'dd' in formatValueHash ) this.ui.set( 'select', ~~formatValueHash.dd )
                if ( 'ddd' in formatValueHash ) this.ui.set( 'select', ~~formatValueHash.ddd )
            }
        })
        this.ui = $node.shadow()
    },
    teardown: tearDownTheUI
})

test( 'Source as `input`', function() {

    var ui = this.ui

    strictEqual( ui._hidden.name, ui.$input[0].name + '_formatted', 'Suffixed hidden name' )

    strictEqual( ui.get( 'select' ), 6, 'Parsed input value' )
    strictEqual( ui.get( 'valueHidden' ), '006', 'Mirrored hidden value' )

    ui.set( 'select', 9 )

    strictEqual( ui.get( 'value' ), '09', 'Updated input value' )
    strictEqual( ui.get( 'valueHidden' ), '009', 'Mirrored hidden value' )
})

module( 'Formats', {
    setup: function() {
        var $node = $NODE_DIV.clone().attr({ 'data-ui': 'component', 'data-value': '006' }).appendTo( $DOM )
        this.extension = shadow( 'component', {
            formats: {
                ddd: function( value, isParsing ) {
                    return isParsing ? value.length : '00' + value
                }
            },
            defaults: {
                formatHidden: 'ddd',
                nameHidden: 'hidden_element',
                suffixHidden: ''
            },
            init: function( formatValueHash ) {
                if ( 'ddd' in formatValueHash ) this.ui.set( 'select', ~~formatValueHash.ddd )
            }
        })
        this.ui = $node.shadow()
    },
    teardown: tearDownTheUI
})

test( 'Source as `div`', function() {

    var ui = this.ui

    strictEqual( ui._hidden.name, ui.i.defaults.nameHidden + ui.i.defaults.suffixHidden, 'Full hidden name' )

    strictEqual( ui.get( 'select' ), 6, 'Parsed data value' )
    strictEqual( ui.get( 'valueHidden' ), '006', 'Mirrored hidden value' )

    ui.set( 'select', 9 )

    strictEqual( ui.get( 'valueHidden' ), '009', 'Updated hidden value' )
})



