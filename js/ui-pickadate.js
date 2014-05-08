(function(factory) {

    // Register as an anonymous module.
    if ( typeof define == 'function' && define.amd )
        define(['shadow','jquery'], factory)

    // Or using browser globals.
    else factory(shadow, jQuery)

}(function(shadow, $) { 'use strict';


var _ = shadow._
var el = _.el
var leadZero = function(number) {
    return (number > 9 ? '' : '0') + number
}


/**
 * Construct a pickadate object.
 */
shadow('pickadate', {

    extend: 'picker',

    attrs: {

        // The min/max range.
        min: null,
        max: null,

        // The date today.
        today: null,

        // The 1st date of the month in view.
        view: null,

        // The highlighted date that acts as a visual cue of focus.
        highlight: null,

        // The selected date that mirrors the value.
        select: null,

        // The default formatting to use.
        format: 'd mmmm, yyyy'
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

    formats: {
        d: function(value, isParsing) {
            if ( isParsing ) {
                value = value.match(/^\d{1,2}/)
                return value && value[0]
            }
            return value[2]
        },
        dd: function(value, isParsing) {
            if ( isParsing ) {
                value = value.match(/^\d{1,2}/)
                return value && value[0]
            }
            return leadZero(value[2])
        },
        ddd: function(value, isParsing) {
            if ( isParsing ) {
                value = value.match(/^\w+/)
                return value && value[0]
            }
            var day = new Date(value[0], value[1], value[2])
            return this.dict.weekdaysShort[day.getDay()]
        },
        dddd: function(value, isParsing) {
            if ( isParsing ) {
                value = value.match(/^\w+/)
                return value && value[0]
            }
            var day = new Date(value[0], value[1], value[2])
            return this.dict.weekdaysFull[day.getDay()]
        },
        m: function(value, isParsing) {
            if ( isParsing ) {
                value = value.match(/^\d{1,2}/)
                return value && value[0]
            }
            return value[1] + 1
        },
        mm: function(value, isParsing) {
            if ( isParsing ) {
                value = value.match(/^\d{1,2}/)
                return value && value[0]
            }
            return leadZero(value[1] + 1)
        },
        mmm: function(value, isParsing) {
            if ( isParsing ) {
                value = value.match(/^\w+/)
                return value && value[0]
            }
            return this.dict.monthsShort[value[1]]
        },
        mmmm: function(value, isParsing) {
            if ( isParsing ) {
                value = value.match(/^\w+/)
                return value && value[0]
            }
            return this.dict.monthsFull[value[1]]
        },
        yyyy: function(value, isParsing) {
            if ( isParsing ) {
                value = value.match(/^\d{4}/)
                return value && value[0]
            }
            return value[0]
        }
    },


    /**
     * Setup the attrs before everything gets sealed
     * and before getters and setters are made.
     */
    setup: function() {

        var pickadate = this
        var attrs = pickadate.attrs
        var convertDate = pickadate.convertDate

        pickadate._super()

        // Set the initial “today”.
        attrs.today = convertDate(new Date())

        // Set the initial minimum date.
        if ( attrs.min ) {
            console.log(attrs.min);
        }

        // Set the initial value.
        if ( attrs.value ) {
            attrs.select = pickadate.parse(attrs.value)
        }

        // Set the initial select.
        if ( attrs.select ) {
            attrs.select = convertDate(attrs.select)
            attrs.highlight = convertDate(attrs.select)
            attrs.value = pickadate.format(attrs.select)
        }

        // Set the initial highlight.
        if ( attrs.highlight ) {
            attrs.highlight = convertDate(attrs.highlight)
        }
        else {
            attrs.highlight = convertDate(attrs.today)
        }

        // Set the initial view.
        if ( attrs.view ) {
            attrs.view = convertDate([attrs.view[0], attrs.view[1], 1])
        }
        else {
            attrs.view = convertDate([attrs.highlight[0], attrs.highlight[1], 1])
        }

        // Whenever the select is assigned, format it accordingly.
        pickadate.on('assign:select.' + pickadate.id, function(event) {
            event.value = convertDate(event.value)
        })

        // Whenever the highlight is assigned, format it accordingly.
        pickadate.on('assign:highlight.' + pickadate.id, function(event) {
            event.value = convertDate(event.value)
        })

        // Whenever the view is assigned, the date should be the month’s first.
        pickadate.on('assign:view.' + pickadate.id, function(event) {
            var value = event.value
            event.value = convertDate([value[0], value[1], 1])
        })

        // Whenever the highlight is updated, the view should be updated.
        pickadate.on('set:highlight.' + pickadate.id, function(event) {
            attrs.view = event.value
        })

        // Whenever the select is updated, the highlight should be updated.
        pickadate.on('set:select.' + pickadate.id, function(event) {
            var value = event.value
            if ( value ) {
                attrs.highlight = value
                attrs.value = pickadate.format(value)
            }
            else {
                attrs.value = ''
            }
        })

        // Whenever the format is updated, the value should be re-formatted.
        pickadate.on('set:format.' + pickadate.id, function(event) {
            if ( attrs.select ) {
                attrs.value = pickadate.format(attrs.select)
            }
        })

        return pickadate
    },


    /**
     * Convert a value representative of a date into a valid date array.
     */
    convertDate: function(value) {
        if ( !value ) {
            return value
        }
        if ( Array.isArray(value) ) {
            value = new Date(value[0], value[1], value[2])
        }
        if ( _.isTypeOf(value, 'date') ) {
            value = [value.getFullYear(), value.getMonth(), value.getDate()]
        }
        Object.freeze(value)
        return value
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
            var highlight = attrs.highlight.slice(0)
            highlight[1] += target == navPrev ? -1 : 1
            attrs.highlight = highlight
        })

        // Bind updating the year and month labels.
        pickadate.on('set:highlight.' + pickadate.id, function(event) {

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
            attrs.select = attrs.today
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
                title: pickadate.format([
                    date.getFullYear(),
                    date.getMonth(),
                    date.getDate()
                ]),
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
        var view = attrs.view

        // Create the header.
        var header = pickadate.createHeader(view[0], view[1])
        contentFrag.appendChild(header)

        // Create the grid.
        var grid = pickadate.createGrid()
        contentFrag.appendChild(grid)

        // Create the grid’s head.
        grid.appendChild(pickadate.createGridHead())

        // Create the grid’s body.
        var gridBody = pickadate.createGridBody(view[0], view[1])
        grid.appendChild(gridBody)

        // Create the footer.
        contentFrag.appendChild(pickadate.createFooter())

        // Bind updating the grid’s body.
        pickadate.on('set:highlight.' + pickadate.id, function(event) {
            var value = event.value
            $gridBody.empty().append(pickadate.createMonth(value[0], value[1]))
        })

        // Bind updating the selected day.
        pickadate.on('set:select.' + pickadate.id, function(event) {
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
    }, //template


    /**
     * Parse a date into it’s attribute format.
     */
    parse: function(string) {
        var pickadate = this
        var value = pickadate._super(string)
        var month
        if ( 'mmmm' in value ) {
            month = pickadate.dict.monthsFull.indexOf(value.mmmm)
        }
        else if ( 'mmm' in value ) {
            month = pickadate.dict.monthsShort.indexOf(value.mmm)
        }
        return [
            ~~value.yyyy,
            month !== undefined ? month :
                ~~('mm' in value ? value.mm : value.m) - 1,
            ~~('dd' in value ? value.dd : value.d)
        ]
    }

}) //shadow('pickadate')


}));