(function(factory) {

    // Register as an anonymous module.
    if ( typeof define == 'function' && define.amd )
        define(['shadow','jquery'], factory)

    // Or using browser globals.
    else factory(shadow, jQuery)

}(function(shadow, $) { 'use strict';


var _ = shadow._
var el = _.el


/**
 * Construct a pickadate object.
 */
shadow('pickadate', {

    extend: 'picker',

    attrs: {

        // The min/max range.
        min: -Infinity,
        max: Infinity,

        // The date today.
        today: null,

        // The 1st date of the month in view.
        view: null,

        // The highlighted date that acts as a visual cue of focus.
        highlight: null,

        // The selected date that mirrors the value.
        select: null
    },

    dict: {

        // Month nav labels.
        monthPrev: 'Previous month',
        monthNext: 'Next month',

        // Today and clear labels.
        today: 'Today',
        clear: 'Clear',

        // The months.
        monthsFull: ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'],
        monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

        // The weekdays.
        weekdaysFull: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday',
            'Friday', 'Saturday'],
        weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    },

    classNames: {

        host: ' --pickadate',

        header: 'header',
        month: 'month',
        year: 'year',
        selectMonth: 'select select--month',
        selectYear: 'select select--year',
        navPrev: 'nav nav--prev',
        navNext: 'nav nav--next',
        navDisabled: 'nav nav--disabled',

        grid: 'grid',
        weekday: 'weekday',
        day: 'day',
        disabled: 'day--disabled',
        selected: 'day--selected',
        highlighted: 'day--highlighted',
        today: 'day--today',
        infocus: 'day--infocus',
        outfocus: 'day--outfocus',

        footer: 'footer',
        buttonToday: 'button button--today',
        buttonClear: 'button button--clear',
    },


    /**
     * Setup the attrs before everything gets sealed
     * and before getters and setters are made.
     */
    setup: function() {

        var pickadate = this
        var attrs = pickadate.attrs

        pickadate._super()

        // Set the initial “today”.
        var today = new Date()
        attrs.today = [today.getFullYear(), today.getMonth(), today.getDate()]

        // Set the initial select.
        if ( attrs.select ) {
            console.log(attrs.select);
        }

        // Set the initial highlight.
        if ( !attrs.highlight ) {
            attrs.highlight = attrs.today.slice(0)
        }

        // Set the initial view.
        if ( !attrs.view ) {
            attrs.view = attrs.highlight.slice(0)
            attrs.view[2] = 1
        }

        // Whenever the select is set, format it accordingly.
        pickadate.on('set:select.' + pickadate.id, function(event) {
            var value = event.value
            if ( _.isTypeOf(value, 'date') ) {
                event.value = [value.getFullYear(), value.getMonth(), value.getDate()]
            }
        })

        // Whenever the view is set, the date should be the month’s first.
        pickadate.on('set:view.' + pickadate.id, function(event) {
            var value = event.value
            event.value = [value[0], value[1], 1]
        })

        // Whenever the highlight is updated, the view should be updated.
        pickadate.on('updated:highlight.' + pickadate.id, function(event) {
            attrs.view = event.value.slice(0)
        })

        // Whenever the select is updated, the highlight should be updated.
        pickadate.on('updated:select.' + pickadate.id, function(event) {
            var value = event.value
            if ( value ) {
                attrs.highlight = value.slice(0)
                attrs.value = JSON.stringify(value)
            }
            else {
                attrs.value = ''
            }
        })

        return pickadate
    },

    createHeader: function(year, month) {

        var pickadate = this
        var attrs = pickadate.attrs
        var dict = pickadate.dict
        var classes = pickadate.classNames

        var navPrev = el({
            name: 'button',
            klass: classes.navPrev,
            attrs: { type: 'button', title: dict.monthPrev }
        })
        var navNext = el({
            name: 'button',
            klass: classes.navNext,
            attrs: { type: 'button', title: dict.monthNext }
        })

        var yearLabel = pickadate.createHeaderYear(year)
        var monthLabel = pickadate.createHeaderMonth(month)

        var header = el({ name: 'header', klass: classes.header },
            [monthLabel, yearLabel, navPrev, navNext])

        // Bind updating the highlight when the nav is clicked.
        $([navPrev, navNext]).on('click', function(event) {
            var target = event.target
            var highlight = attrs.highlight
            highlight[1] += target == navPrev ? -1 : 1
            attrs.highlight = highlight
        })

        // Bind updating the year and month labels.
        pickadate.on('updated:highlight.' + pickadate.id, function(event) {

            var value = event.value
            var year = value[0]
            var month = value[1]

            var previousValue = event.previousValue
            var previousYear = previousValue[0]
            var previousMonth = previousValue[1]

            if ( year !== previousYear ) {
                var newYearLabel = pickadate.createHeaderYear(year)
                header.replaceChild(newYearLabel, yearLabel)
                yearLabel = newYearLabel
            }

            if ( month !== previousMonth ) {
                var newMonthLabel = pickadate.createHeaderMonth(month)
                header.replaceChild(newMonthLabel, monthLabel)
                monthLabel = newMonthLabel
            }
        })

        return header
    },

    createHeaderYear: function(year) {
        return el(this.classNames.year, year)
    },

    createHeaderMonth: function(month) {
        var dict = this.dict
        var classes = this.classNames
        return el(classes.month, dict.monthsFull[month])
    },

    createFooter: function() {
        var pickadate = this
        var classes = pickadate.classNames
        var dict = pickadate.dict
        var attrs = pickadate.attrs
        var todayNode = el({
            name: 'button',
            klass: classes.buttonToday,
            attrs: { type: 'button' }
        }, dict.today)
        $(todayNode).on('click', function() {
            attrs.select = attrs.today.slice(0)
        })
        var clearNode = el({
            name: 'button',
            klass: classes.buttonClear,
            attrs: { type: 'button' }
        }, dict.clear)
        $(clearNode).on('click', function() {
            attrs.select = null
        })
        return el({ name: 'footer', klass: classes.footer }, [todayNode, clearNode ])
    },

    createDay: function(year, month, day) {

        var pickadate = this
        var classes = pickadate.classNames
        var attrs = pickadate.attrs

        var selected = attrs.select
        if ( selected ) {
            selected = new Date(selected[0], selected[1], selected[2]).getTime()
        }

        var highlighted = attrs.highlight
        if ( highlighted ) {
            highlighted = new Date(highlighted[0], highlighted[1], highlighted[2]).getTime()
        }

        var today = attrs.today
        if ( today ) {
            today = new Date(today[0], today[1], today[2]).getTime()
        }

        var date = new Date(year, month, day)
        var dateTime = date.getTime()

        var dayNode = el({
            klass: classes.day +
                (selected === dateTime ? ' ' + classes.selected : '') +
                (highlighted === dateTime ? ' ' + classes.highlighted : '') +
                (today === dateTime ? ' ' + classes.today : ''),
            attrs: {
                role: 'button',
                title: date,
                'data-pick': dateTime
            }
        }, date.getDate())

        return el({ name: 'td' }, dayNode)
    },

    createWeek: function(year, month, week) {
        var pickadate = this
        var offset = new Date(year, month, 1).getDay()
        var days = []
        for ( var i = 1; i <= 7; i++ ) {
            var day = (week * 7) + i - offset
            days.push(pickadate.createDay(year, month, day))
        }
        return el({ name: 'tr' }, days)
    },

    createMonth: function(year, month) {
        var frag = document.createDocumentFragment()
        for ( var i = 0; i <= 5; i++ ) {
            frag.appendChild(this.createWeek(year, month, i))
        }
        return frag
    },

    createGrid: function() {
        var pickadate = this
        var classes = pickadate.classNames
        return el({
            name: 'table',
            klass: classes.grid,
            attrs: {
                tabindex: 0
            }
        })
    },

    createGridHead: function() {
        var pickadate = this
        var dict = pickadate.dict
        return el({ name: 'thead' },
            dict.weekdaysShort.map(function(weekday, index) {
                return el({
                    name: 'th',
                    attrs: {
                        title: dict.weekdaysFull[index]
                    }
                }, weekday)
            })
        )
    },

    createGridBody: function(year, month) {
        return el({ name: 'tbody' }, this.createMonth(year, month))
    },


    /**
     * Build out the templating for the pickadate.
     */
    template: function() {

        var pickadate = this

        // Take out the original content.
        var contentFrag = pickadate.content

        var classes = pickadate.classNames
        var attrs = pickadate.attrs
        var today = attrs.today

        // Create the header.
        var header = pickadate.createHeader(today[0], today[1])
        contentFrag.appendChild(header)

        // Create the grid.
        var grid = pickadate.createGrid()
        contentFrag.appendChild(grid)

        // Create the grid’s head.
        grid.appendChild(pickadate.createGridHead())

        // Create the grid’s body.
        var gridBody = pickadate.createGridBody(today[0], today[1])
        grid.appendChild(gridBody)

        // Create the footer.
        contentFrag.appendChild(pickadate.createFooter())

        // Bind updating the grid’s body.
        pickadate.on('updated:highlight.' + pickadate.id, function(event) {
            var value = event.value
            $gridBody.empty().append(pickadate.createMonth(value[0], value[1]))
        })

        // Bind updating the selected day.
        pickadate.on('updated:select.' + pickadate.id, function(event) {
            if ( !event.value ) {
                $gridBody.find('.' + classes.selected).
                    removeClass(classes.selected)
            }
        })

        // Bind updating the selected value when clicked.
        var $gridBody = $(gridBody).on('click', '[data-pick]', function(event) {
            var target = event.target
            var value = $(target).data('pick')
            attrs.select = new Date(value)
        })

        // Create and return the fragment.
        return pickadate._super()
    } //template

}) //shadow('pickadate')


}));