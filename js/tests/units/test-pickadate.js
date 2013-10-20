

var $DOM = $( '#qunit-fixture' )
var $NODE_DIV = $( '<div/>' )
var $NODE_INPUT = $( '<input>' )
var tearDownTheUI = function() {
    this.ui.stop()
    $DOM.empty()
}


/**
 * The extension setup.
 */

module( 'Pickadate setup', {
    setup: function() {
        var $node = $NODE_DIV.clone().appendTo( $DOM )
        shadow.create( 'pickadate', $node[0] )
        this.ui = $node.pickadate()
    },
    teardown: tearDownTheUI
})

test( 'First weekday', function() {

    var ui = this.ui

    strictEqual( ui.$root.find( '.' + ui.klasses.weekdays ).first().text(), ui.settings.weekdaysShort[0], 'Sunday' )

    ui.stop()
    ui = ui.$source.pickadate({ firstDay: 1 })

    strictEqual( ui.$root.find( '.' + ui.klasses.weekdays ).first().text(), ui.settings.weekdaysShort[1], 'Monday' )

    ui.set( 'select', [2013, 8, 14] )

    strictEqual( ui.$root.find('td').first().text(), '26', 'Months starting on Sunday shift back a week' )
})

test( 'Date formats', function() {

    var ui = this.ui,
        today = new Date(),
        leadZero = function( number ) {
            return ( number < 10 ? '0' : '' ) + number
        },
        formats = {
            d: function() {
                return '' + today.getDate()
            },
            dd: function() {
                return leadZero( today.getDate() )
            },
            ddd: function() {
                return ui.settings.weekdaysShort[ today.getDay() ]
            },
            dddd: function() {
                return ui.settings.weekdaysFull[ today.getDay() ]
            },
            m: function() {
                return '' + ( today.getMonth() + 1 )
            },
            mm: function() {
                return leadZero( ( today.getMonth() + 1 ) )
            },
            mmm: function() {
                return ui.settings.monthsShort[ today.getMonth() ]
            },
            mmmm: function() {
                return ui.settings.monthsFull[ today.getMonth() ]
            },
            yy: function() {
                return ( '' + today.getFullYear() ).slice(2)
            },
            yyyy: function() {
                return '' + today.getFullYear()
            }
        }

    today.setHours(0,0,0,0)

    Object.keys( formats ).forEach( function( format ) {
        var expect = formats[ format ]()
        deepEqual( ui.get( 'today', format ), expect, '`' + format + '`: ' + expect )
    })
})

test( 'Starting `dict`', function() {

    var ui = this.ui

    var today = ui.get('today')
    deepEqual( today.time, new Date().setHours(0,0,0,0), 'Today' )
    deepEqual( ui.get('highlight'), today, 'Highlight selected' )

    var selections = ui.get('select')
    deepEqual( selections, [], 'Select “today”' )

    var view = ui.get('view')
    deepEqual( [view.year, view.month, view.date], [today.year, today.month, 1], 'View' )

    strictEqual( ui.get('min').time, -Infinity, 'Min limit' )
    strictEqual( ui.get('max').time, Infinity, 'Max limit' )

    var disabled = ui.get('disable')
    deepEqual( disabled, [], 'Disabled' )

    var flipDisabled = ui.get('flipDisabled')
    deepEqual( flipDisabled, 0, 'Disabled flipped' )
})

module( 'Pickadate setup', {
    setup: function() {
        this.$node = $NODE_INPUT.clone()
    },
    teardown: tearDownTheUI
})

test( 'Value', function() {

    var $node = this.$node.val('14 August, 2013').appendTo( $DOM )
    shadow.create( 'pickadate', $node[0] )
    this.ui = $node.pickadate()
    var ui = this.ui

    var today = ui.get('today')
    deepEqual( today.time, new Date().setHours(0,0,0,0), 'Today' )

    var highlight = ui.get('highlight')
    deepEqual( [highlight.year,highlight.month,highlight.date], [2013,7,14], 'Highlight' )

    var selected = ui.get('select')[0]
    deepEqual( [selected.year,selected.month,selected.date], [2013,7,14], 'Select' )

    var view = ui.get('view')
    deepEqual( [view.year,view.month,view.date], [2013,7,1], 'View' )
})

test( 'Range value', function() {

    var $node = this.$node.val('10 August, 2013 - 14 August, 2013').appendTo( $DOM )
    shadow.create( 'pickadate', $node[0] )
    this.ui = $node.pickadate()
    var ui = this.ui

    var selected = ui.get('select')[0]
    deepEqual( [selected.from.year, selected.from.month, selected.from.date], [2013,7,10], 'Select range “from”' )
    deepEqual( [selected.to.year, selected.to.month, selected.to.date], [2013,7,14], 'Select range “to”' )
})

test( 'Multiple values (first & last)', function() {

    var $node = this.$node.val('10 August, 2013, and 23 August, 2013').appendTo( $DOM )
    shadow.create( 'pickadate', $node[0] )
    this.ui = $node.pickadate()
    var ui = this.ui

    var selected = ui.get('select').map( function( dateObject ) {
        return [dateObject.year, dateObject.month, dateObject.date]
    })
    deepEqual( selected, [[2013,7,10], [2013,7,23]], 'Select two values' )
})

test( 'Multiple values (first, middle, & last)', function() {

    var $node = this.$node.val('10 August, 2013, 12 August, 2013, and 23 August, 2013').appendTo( $DOM )
    shadow.create( 'pickadate', $node[0] )
    this.ui = $node.pickadate()
    var ui = this.ui

    var selected = ui.get('select').map( function( dateObject ) {
        return [dateObject.year, dateObject.month, dateObject.date]
    })
    deepEqual( selected, [[2013,7,10], [2013,7,12], [2013,7,23]], 'Select three values' )
})

test( 'Multiple values (first, several middles, & last)', function() {

    var $node = this.$node.val('10 August, 2013, 12 August, 2013, 14 August, 2013, 15 August, 2013, and 23 August, 2013').appendTo( $DOM )
    shadow.create( 'pickadate', $node[0] )
    this.ui = $node.pickadate()
    var ui = this.ui

    var selected = ui.get('select').map( function( dateObject ) {
        return [dateObject.year, dateObject.month, dateObject.date]
    })
    deepEqual( selected, [[2013,7,10], [2013,7,12], [2013,7,14], [2013,7,15], [2013,7,23]], 'Select more than three values' )
})

test( 'Multiple values (with ranges)', function() {

    var $node = this.$node.val('10 August, 2013, 12 August, 2013 - 14 August, 2013, 15 August, 2013, and 23 August, 2013').appendTo( $DOM )
    shadow.create( 'pickadate', $node[0] )
    this.ui = $node.pickadate()
    var ui = this.ui

    var selected = ui.get('select').map( function( dateObject ) {
        if ( dateObject instanceof shadow.Range ) {
            return [
                [dateObject.from.year, dateObject.from.month, dateObject.from.date],
                [dateObject.to.year, dateObject.to.month, dateObject.to.date]
            ]
        }
        return [dateObject.year, dateObject.month, dateObject.date]
    })
    deepEqual( selected, [[2013,7,10], [[2013,7,12],[2013,7,14]], [2013,7,15], [2013,7,23]], 'Select ranges and values' )
})

module( 'Pickadate setup', {
    setup: function() {
        this.$node = $NODE_INPUT.clone()
    },
    teardown: tearDownTheUI
})

test( 'Hidden value', function() {

    var $node = this.$node.attr('data-value', '2013-08-14').appendTo( $DOM )
    shadow.create( 'pickadate', $node[0], {
        hasHidden: true,
        formatHidden: 'yyyy-mm-dd'
    })
    this.ui = $node.pickadate()
    var ui = this.ui

    strictEqual( ui.get('valueHidden'), '2013-08-14', 'Hidden value' )

    var highlight = ui.get('highlight')
    deepEqual( [highlight.year,highlight.month,highlight.date], [2013,7,14], 'Highlight' )

    var selected = ui.get('select')[0]
    deepEqual( [selected.year,selected.month,selected.date], [2013,7,14], 'Select' )

    var view = ui.get('view')
    deepEqual( [view.year,view.month,view.date], [2013,7,1], 'View' )
})

test( 'Hidden range value', function() {

    var $node = this.$node.attr('data-value', '2013-08-10 - 2013-08-14').appendTo( $DOM )
    shadow.create( 'pickadate', $node[0], {
        formatHidden: 'yyyy-mm-dd'
    })
    this.ui = $node.pickadate()
    var ui = this.ui

    var selected = ui.get('select')[0]
    deepEqual( [selected.from.year, selected.from.month, selected.from.date], [2013,7,10], 'Select range “from”' )
    deepEqual( [selected.to.year, selected.to.month, selected.to.date], [2013,7,14], 'Select range “to”' )
})

test( 'Hidden multiple values (first & last)', function() {

    var $node = this.$node.attr('data-value', '2013-08-10, and 2013-08-23').appendTo( $DOM )
    shadow.create( 'pickadate', $node[0], {
        formatHidden: 'yyyy-mm-dd'
    })
    this.ui = $node.pickadate()
    var ui = this.ui

    var selected = ui.get('select').map( function( dateObject ) {
        return [dateObject.year, dateObject.month, dateObject.date]
    })
    deepEqual( selected, [[2013,7,10], [2013,7,23]], 'Select two values' )
})

test( 'Hidden multiple values (first, middle, & last)', function() {

    var $node = this.$node.attr('data-value', '2013-08-10, 2013-08-12, and 2013-08-23').appendTo( $DOM )
    shadow.create( 'pickadate', $node[0], {
        formatHidden: 'yyyy-mm-dd'
    })
    this.ui = $node.pickadate()
    var ui = this.ui

    var selected = ui.get('select').map( function( dateObject ) {
        return [dateObject.year, dateObject.month, dateObject.date]
    })
    deepEqual( selected, [[2013,7,10], [2013,7,12], [2013,7,23]], 'Select three values' )
})

test( 'Hidden multiple values (first, several middles, & last)', function() {

    var $node = this.$node.attr('data-value', '2013-08-10, 2013-08-12, 2013-08-14, 2013-08-15, and 2013-08-23').appendTo( $DOM )
    shadow.create( 'pickadate', $node[0], {
        formatHidden: 'yyyy-mm-dd'
    })
    this.ui = $node.pickadate()
    var ui = this.ui

    var selected = ui.get('select').map( function( dateObject ) {
        return [dateObject.year, dateObject.month, dateObject.date]
    })
    deepEqual( selected, [[2013,7,10], [2013,7,12], [2013,7,14], [2013,7,15], [2013,7,23]], 'Select more than three values' )
})

test( 'Hidden multiple values (with ranges)', function() {

    var $node = this.$node.attr('data-value', '2013-08-10, 2013-08-12 - 2013-08-14, 2013-08-15, and 2013-08-23').appendTo( $DOM )
    shadow.create( 'pickadate', $node[0], {
        formatHidden: 'yyyy-mm-dd'
    })
    this.ui = $node.pickadate()
    var ui = this.ui

    var selected = ui.get('select').map( function( dateObject ) {
        if ( dateObject instanceof shadow.Range ) {
            return [
                [dateObject.from.year, dateObject.from.month, dateObject.from.date],
                [dateObject.to.year, dateObject.to.month, dateObject.to.date]
            ]
        }
        return [dateObject.year, dateObject.month, dateObject.date]
    })
    deepEqual( selected, [[2013,7,10], [[2013,7,12],[2013,7,14]], [2013,7,15], [2013,7,23]], 'Select ranges and values' )
})






/**
 * The component api.
 */
module( 'Pickadate methods', {
    setup: function() {
        var $node = $NODE_DIV.clone().appendTo( $DOM )
        shadow.create( 'pickadate', $node[0] )
        this.ui = $node.pickadate()
    },
    teardown: tearDownTheUI
})

test( 'Set `select`', function() {

    var ui = this.ui

    var dateArray = [2012,11,21]
    ui.set( 'select', dateArray )

    var pickObject = ui.get( 'select' )[0]
    deepEqual( [pickObject.year, pickObject.month, pickObject.date], dateArray, 'Using an array' )

    var dateObject = new Date( dateArray[0], dateArray[1], dateArray[2] + 40 )
    ui.set( 'select', dateObject )

    pickObject = ui.get( 'select' )[0]
    deepEqual( pickObject.obj, dateObject, 'Using a date object' )

    var dateTime = dateObject.setDate( dateObject.getDate() + 40 )
    ui.set( 'select', dateTime )

    pickObject = ui.get( 'select' )[0]
    deepEqual( pickObject.time, dateTime, 'Using a number' )
})

test( 'Set beyond limits', function() {

    var ui = this.ui

    var minArray = [2012,11,21]
    ui.set( 'min', minArray )

    var maxArray = [2013,11,21]
    ui.set( 'max', maxArray )

    ui.set( 'select', [2010,11,21] )

    var selected = ui.get('select')[0]
    deepEqual( [selected.year,selected.month,selected.date], minArray, 'Select beyond min' )

    var highlight = ui.get('highlight')
    deepEqual( [highlight.year,highlight.month,highlight.date], minArray, 'Highlight beyond min' )

    var view = ui.get('view')
    deepEqual( [view.year,view.month,view.date], [minArray[0],minArray[1],1], 'View beyond min' )
})

test( 'Set `highlight`', function() {

    var ui = this.ui

    var dateArray = [2012,11,21]
    ui.set( 'highlight', dateArray )

    var pickObject = ui.get( 'highlight' )
    deepEqual( [pickObject.year, pickObject.month, pickObject.date], dateArray, 'Using an array' )

    var dateObject = new Date( dateArray[0], dateArray[1], dateArray[2] + 40 )
    ui.set( 'highlight', dateObject )

    pickObject = ui.get( 'highlight' )
    deepEqual( pickObject.obj, dateObject, 'Using a date object' )

    var dateTime = dateObject.setDate( dateObject.getDate() + 40 )
    ui.set( 'highlight', dateTime )

    pickObject = ui.get( 'highlight' )
    deepEqual( pickObject.time, dateTime, 'Using a number' )
})

test( 'Set `view`', function() {

    var ui = this.ui

    var dateArray = [2012,11,21]
    ui.set( 'view', dateArray )

    var pickObject = ui.get( 'view' )
    deepEqual( [pickObject.year, pickObject.month, pickObject.date], [dateArray[0], dateArray[1], 1], 'Using an array' )

    var dateObject = new Date( dateArray[0], dateArray[1], dateArray[2] + 40 )
    ui.set( 'view', dateObject )

    pickObject = ui.get( 'view' )
    dateObject.setDate(1)
    deepEqual( pickObject.obj, dateObject, 'Using a date object' )

    dateObject.setDate( dateObject.getDate() + 40 )
    var dateTime = dateObject.setDate(1)
    ui.set( 'view', dateTime )

    pickObject = ui.get( 'view' )
    deepEqual( pickObject.time, dateTime, 'Using a number' )
})

test( 'Set `min`', function() {

    var ui = this.ui

    var dateArray = [2012,11,21]
    ui.set( 'min', dateArray )

    var pickObject = ui.get( 'min' )
    deepEqual( [pickObject.year, pickObject.month, pickObject.date], dateArray, 'Using an array' )

    var dateObject = new Date( dateArray[0], dateArray[1], dateArray[2] + 40 )
    ui.set( 'min', dateObject )

    pickObject = ui.get( 'min' )
    deepEqual( pickObject.obj, dateObject, 'Using a date object' )

    var today = ui.get( 'today' )
    ui.set( 'min', true )

    pickObject = ui.get( 'min' )
    deepEqual( pickObject, today, 'Using `true`' )

    ui.set( 'min', false )

    pickObject = ui.get( 'min' )
    deepEqual( pickObject.time, -Infinity, 'Using `false`' )

    ui.set( 'min', -5 )

    pickObject = ui.get( 'min' )
    deepEqual( pickObject.time, new Date( today.year, today.month, today.date - 5 ).getTime(), 'Using a negative number' )

    ui.set( 'min', 5 )

    pickObject = ui.get( 'min' )
    deepEqual( pickObject.time, new Date( today.year, today.month, today.date + 5 ).getTime(), 'Using a positive number' )
})

test( 'Set `max`', function() {

    var ui = this.ui

    var dateArray = [2012,11,21]
    ui.set( 'max', dateArray )

    var pickObject = ui.get( 'max' )
    deepEqual( [pickObject.year, pickObject.month, pickObject.date], dateArray, 'Using an array' )

    var dateObject = new Date( dateArray[0], dateArray[1], dateArray[2] + 40 )
    ui.set( 'max', dateObject )

    pickObject = ui.get( 'max' )
    deepEqual( pickObject.obj, dateObject, 'Using a date object' )

    var today = ui.get( 'today' )
    ui.set( 'max', true )

    pickObject = ui.get( 'max' )
    deepEqual( pickObject, today, 'Using `true`' )

    ui.set( 'max', false )

    pickObject = ui.get( 'max' )
    deepEqual( pickObject.time, Infinity, 'Using `false`' )

    ui.set( 'max', -5 )

    pickObject = ui.get( 'max' )
    deepEqual( pickObject.time, new Date( today.year, today.month, today.date - 5 ).getTime(), 'Using a negative number' )

    ui.set( 'max', 5 )

    pickObject = ui.get( 'max' )
    deepEqual( pickObject.time, new Date( today.year, today.month, today.date + 5 ).getTime(), 'Using a positive number' )
})

test( 'Set `disable`', function() {

    var ui = this.ui

    var disableArray = [true,4,5,[2013,11,21],new Date(2013,5,4)]
    ui.set( 'disable', disableArray )

    pickArray = ui.get( 'disable' )
    deepEqual( pickArray, disableArray, 'Using an array' )

    ui.set( 'disable', false )

    pickArray = ui.get( 'disable' )
    deepEqual( pickArray, [], 'Using `false`' )

    ui.set( 'disable', 5 )

    pickArray = ui.get( 'disable' )
    deepEqual( pickArray, [5], 'Using a number' )

    ui.set( 'disable', 'flip' )

    pickArray = ui.get( 'disable' )
    deepEqual( pickArray, [5], 'Using a “flip”' )
})

test( 'Is `disabled`', function() {

    var ui = this.ui

    ui.add( 'disable', [[2013,3,3], 4, new Date(2013,6,6)] )

    ok( ui.is('disabled', [2013,3,3]), 'Date as array, match array' )
    ok( ui.is('disabled', [2013,6,6]), 'Date as date object, match array' )
    ok( ui.is('disabled', new Date(2013,3,3)), 'Date as array, match date object' )
    ok( ui.is('disabled', new Date(2013,6,6)), 'Date as date object, match date object' )
    ok( ui.is('disabled', 4), 'Weekday as number' )
    ok( !ui.is('disabled', [2013,1,1]), 'Enabled date' )

    ui.set( 'disable', 'flip' )

    ok( !ui.is('disabled', [2013,3,3]), 'Date as array, match array' )
    ok( !ui.is('disabled', [2013,6,6]), 'Date as date object, match array' )
    ok( !ui.is('disabled', new Date(2013,3,3)), 'Date as array, match date object' )
    ok( !ui.is('disabled', new Date(2013,6,6)), 'Date as date object, match date object' )
    ok( !ui.is('disabled', 4), 'Weekday as number' )
    ok( ui.is('disabled', [2013,1,1]), 'Disabled date' )
})






/**
 * The keyboard events.
 */
module( 'Pickadate keyboard events', {
    setup: function() {
        var $node = $NODE_INPUT.clone().appendTo( $DOM )
        shadow.create( 'pickadate', $node[0] )
        this.ui = $node.pickadate()
    },
    teardown: tearDownTheUI
})

test( 'Highlight', function() {

    var ui = this.ui
    var $node = ui.$source
    var highlight

    ui.open(true)

    // Down
    for ( var i = 0; i < 5; i += 1 ) {
        highlight = ui.get('highlight')
        $node.trigger({ type: 'keydown', keyCode: 40 })
        deepEqual( new Date( highlight.year, highlight.month, highlight.date + 7 ), ui.get('highlight').obj )
    }

    // Up
    for ( var j = 0; j < 5; j += 1 ) {
        highlight = ui.get('highlight')
        $node.trigger({ type: 'keydown', keyCode: 38 })
        deepEqual( new Date( highlight.year, highlight.month, highlight.date - 7 ), ui.get('highlight').obj )
    }

    // Left
    for ( var k = 0; k < 5; k += 1 ) {
        highlight = ui.get('highlight')
        $node.trigger({ type: 'keydown', keyCode: 37 })
        deepEqual( new Date( highlight.year, highlight.month, highlight.date - 1 ), ui.get('highlight').obj )
    }

    // Right
    for ( var l = 0; l < 5; l += 1 ) {
        highlight = ui.get('highlight')
        $node.trigger({ type: 'keydown', keyCode: 39 })
        deepEqual( new Date( highlight.year, highlight.month, highlight.date + 1 ), ui.get('highlight').obj )
    }
})

test( 'Select and value', function() {

    var ui = this.ui
    var $node = ui.$source

    var highlight = ui.get('highlight')

    $node.trigger({ type: 'keydown', keyCode: 13 })
    strictEqual( ui.get('value'), '', 'No value when closed' )

    ui.open(true)
    $node.trigger({ type: 'keydown', keyCode: 13 })
    strictEqual( highlight.date + ' ' + ui.settings.monthsFull[ highlight.month ] + ', ' + highlight.year, ui.get('value'), 'Value highlighted when open' )

    $node.trigger({ type: 'keydown', keyCode: 40 })
    highlight = ui.get('highlight')
    $node.trigger({ type: 'keydown', keyCode: 13 })
    deepEqual( ui.get('select')[0], highlight, 'Highlight selected' )
})






/**
 * The template creation.
 */
module( 'Pickadate template', {
    setup: function() {
        var $node = $NODE_INPUT.clone().appendTo( $DOM )
        shadow.create( 'pickadate', $node[0] )
        this.ui = $node.pickadate()
    },
    teardown: tearDownTheUI
})

test( 'Buttons', function() {

    var ui = this.ui

    ui.$root.find( '.' + ui.settings.klasses.buttonToday ).click()
    strictEqual( ui.get('value'), ui.get('today', ui.settings.format), 'Today' )

    ui.$root.find( '.' + ui.settings.klasses.buttonClear ).click()
    strictEqual( ui.get('value'), '', 'Clear' )

    ui.$root.find( '.' + ui.settings.klasses.navNext ).click()
    var highlight = ui.get('highlight')
    var today = ui.get('today')
    deepEqual( [highlight.year, highlight.month, highlight.date], [today.year, today.month + 1, today.date], 'Navigate next' )

    ui.$root.find( '.' + ui.settings.klasses.navPrev ).click()
    highlight = ui.get('highlight')
    deepEqual( [highlight.year, highlight.month, highlight.date], [today.year, today.month, today.date], 'Navigate previous' )

    ui.$root.find( '.' + ui.settings.klasses.infocus ).eq(20).click()
    var selected = ui.get('select')[0]
    deepEqual( [selected.year, selected.month, selected.date], [today.year, today.month, 21], 'Select date' )
    strictEqual( ui.get('value'), ui.get('select', '21 mmmm, yyyy'), 'Select date' )
})



