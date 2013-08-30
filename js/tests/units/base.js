

var $DOM = $( '#qunit-fixture' )
var $NODE_DIV = $( '<div/>' )
var $NODE_INPUT = $( '<input>' )
var tearDownTheUI = function() {
    this.ui.stop()
    $DOM.empty()
    ;delete shadow.EXTENSIONS[ this.ui.i.name ]
}


/**
 * The core functionality.
 */
module( 'Core' )

test( 'Globals', function() {
    ok( shadow, 'Object: shadow' )
    ok( $.isFunction( shadow.extend ), 'Method: Extend shadow' )
    deepEqual( $.fn.shadow.extend, shadow.extend, 'Method: Extend shadow with jQuery' )
    ok( $.isFunction( $.fn.shadow ), 'Method: Create shadow extension' )
})






/**
 * The component api.
 */
module( 'Component', {
    setup: function() {
        this.extension = {
            name: 'component'
        }
        shadow.extend( this.extension )
        var $node = $NODE_DIV.clone().appendTo( $DOM )
        this.ui = $node.shadow( 'component' ).shadow( 'ui' )
    },
    teardown: tearDownTheUI
})

test( 'Generic', function() {

    var ui = this.ui

    deepEqual( shadow.EXTENSIONS[ this.extension.name ], this.extension, 'Stored extension' )
    deepEqual( ui.r.extension, this.extension, 'Referenced extension' )
    deepEqual( ui.$host, ui.$source, 'Host `div` is the source element' )
})

module( 'Component', {
    setup: function() {
        this.extension = {
            name: 'component'
        }
        shadow.extend( this.extension )
        var $node = $NODE_INPUT.clone().appendTo( $DOM )
        this.ui = $node.shadow( 'component' ).shadow( 'ui' )
    },
    teardown: tearDownTheUI
})

test( 'Input', function() {

    var ui = this.ui

    deepEqual( ui.$input, ui.$source, 'Bound `input` is the source element' )
    ok( ui.$host && ui.$host[0], 'Generated host element' )
})

module( 'Component', {
    setup: function() {
        this.extension = {
            name: 'component',
            alias: 'aliasComponent'
        }
        shadow.extend( this.extension )
        var $node = $NODE_INPUT.clone().appendTo( $DOM )
        this.ui = $node.aliasComponent().aliasComponent( 'ui' )
    },
    teardown: tearDownTheUI
})

test( 'Aliased', function() {

    var ui = this.ui

    strictEqual( shadow.EXTENSIONS[ ui.i.alias ], ui.i.name, 'Referenced alias' )
})

module( 'Component', {
    setup: function() {
        this.extension = {
            name: 'component',
            prefix: 'prefix-ftw'
        }
        shadow.extend( this.extension )
        var $node = $NODE_INPUT.clone().appendTo( $DOM )
        this.ui = $node.shadow( 'component' ).shadow( 'ui' )
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
        this.extension = {
            name: 'component',
            template: '<button></button>',
            dict: {
                collection: [],
                selection: 0,
                from_value: 10,
                to_value: 30
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
        }
        shadow.extend( this.extension )
        var $node = $NODE_DIV.clone().appendTo( $DOM )
        this.ui = $node.shadow( 'component' ).shadow( 'ui' )
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
    deepEqual( ui.get('selection'), 0, 'Get: selection' )

    ui.set( 'collection', 3 )

    deepEqual( ui.get('collection'), [3], 'Set: collection' )

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

    ui.add( 'collection', 3 ).add( 'collection', [3,4,5] )

    deepEqual( ui.get( 'collection' ), [3,4,5], 'Added to collection' )

    ui.remove( 'collection', 3 )

    deepEqual( ui.get( 'collection' ), [4,5], 'Removed from collection' )
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
        var $node = $NODE_DIV.clone().appendTo( $DOM )
        this.ui = $node.shadow( 'component', options ).shadow( 'ui' )
    },
    setup: function() {
        var mod = this
        this.extension = {
            name: 'component',
            init: function() {
                mod.initialized = true
            },
            defaults: this.events( 'as_defaults' )
        }
        shadow.extend( this.extension )
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
        var mod = this
        this.extension = {
            name: 'component',
            keys: {
                65: function( /*event*/ ) {
                    mod.keyedEvent = true
                }
            }
        }
        shadow.extend( this.extension )
        var $node = $NODE_DIV.clone().appendTo( $DOM )
        this.ui = $node.shadow( 'component' ).shadow( 'ui' )
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
        this.extension = {
            name: 'component',
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
        }
        shadow.extend( this.extension )
        var $node = $NODE_INPUT.clone().attr({ value: '06', name: 'value_input' }).appendTo( $DOM )
        this.ui = $node.shadow( 'component' ).shadow( 'ui' )
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
        this.extension = {
            name: 'component',
            formats: {
                ddd: function( value/*, isParsing*/ ) {
                    return '00' + value
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
        }
        shadow.extend( this.extension )
        var $node = $NODE_DIV.clone().attr({ 'data-value': '006' }).appendTo( $DOM )
        this.ui = $node.shadow( 'component' ).shadow( 'ui' )
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



