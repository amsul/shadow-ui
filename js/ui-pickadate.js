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
        navDisabled: 'nav--disabled',

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
        var intoDateAttr = pickadate.intoDateAttr

        pickadate._super()

        // Set the initial “today”.
        attrs.today = intoDateAttr(new Date())

        // Set the initial limit dates.
        if ( attrs.min ) {
            attrs.min = intoDateAttr(attrs.min)
        }
        if ( attrs.max ) {
            attrs.max = intoDateAttr(attrs.max)
        }

        // Set the initial value.
        if ( attrs.value ) {
            attrs.select = pickadate.parse(attrs.value)
        }

        // Set the initial select.
        if ( attrs.select ) {
            attrs.select = intoDateAttr(attrs.select)
            attrs.highlight = intoDateAttr(attrs.select)
            attrs.value = pickadate.format(attrs.select)
        }

        // Set the initial highlight.
        if ( attrs.highlight ) {
            attrs.highlight = intoDateAttr(attrs.highlight)
        }
        else {
            attrs.highlight = intoDateAttr(attrs.today)
        }

        // Set the initial view.
        if ( attrs.view ) {
            attrs.view = intoDateAttr([attrs.view[0], attrs.view[1], 1])
        }
        else {
            attrs.view = intoDateAttr([attrs.highlight[0], attrs.highlight[1], 1])
        }

        // Whenever the select is assigned, format it accordingly.
        pickadate.on('assign:select.' + pickadate.id, function(event) {
            event.value = intoDateAttr(event.value)
        })

        // Whenever the highlight is assigned, format it accordingly.
        pickadate.on('assign:highlight.' + pickadate.id, function(event) {
            var value = intoDateAttr(event.value)
            value = pickadate.nextEnabledDate(value)
            event.value = value
        })

        // Whenever the view is assigned, the date should be the month’s first.
        pickadate.on('assign:view.' + pickadate.id, function(event) {
            var value = event.value
            event.value = intoDateAttr([value[0], value[1], 1])
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

        // Whenever the min is updated, the highlight should be updated.
        pickadate.on('set:min.' + pickadate.id, function(event) {
            attrs.highlight = attrs.highlight
        })

        // Whenever the max is updated, the highlight should be updated.
        pickadate.on('set:max.' + pickadate.id, function(event) {
            attrs.highlight = attrs.highlight
        })

        // Whenever the format is updated, the value should be re-formatted.
        pickadate.on('set:format.' + pickadate.id, function(event) {
            if ( attrs.select ) {
                attrs.value = pickadate.format(attrs.select)
            }
        })

        return pickadate
    }, //setup


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
    },


    /**
     * Compares two dates in various ways.
     */
    compare: function(one, comparison, two) {

        var args = arguments

        if ( args.length < 3 ) {
            two = args[1]
        }

        if ( one == null || two == null ) {
            return false
        }

        var toTime = function(array) {
            return new Date(array[0], array[1], array[2]).getTime()
        }

        if ( Array.isArray(one) ) {
            one = toTime(one)
        }

        if ( Array.isArray(two) ) {
            two = toTime(two)
        }

        // Compare the first as greater than the other.
        if ( comparison == 'greater' ) {
            return one > two
        }

        // Compare the first as lesser than the other.
        if ( comparison == 'lesser' ) {
            return one < two
        }

        // Compare the dates as equal.
        return one === two
    },


    /**
     * Convert a date representation into a valid date array.
     */
    intoDateAttr: function(value) {
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


    /**
     * Checks if a date is disabled and then returns the next enabled one.
     */
    nextEnabledDate: function(value) {
        var pickadate = this
        var attrs = pickadate.attrs
        if ( pickadate.compare(attrs.min, 'greater', value) ) {
            value = attrs.min.slice(0)
        }
        else if ( pickadate.compare(attrs.max, 'lesser', value) ) {
            value = attrs.max.slice(0)
        }
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

        var updateNavNode = function(navNode, value) {
            var isDisabled
            if ( value ) {
                isDisabled = value[0] === attrs.view[0] &&
                    value[1] === attrs.view[1]
            }
            if ( isDisabled ) {
                navNode.classList.add(classes.navDisabled)
                navNode.disabled = true
            }
            else if ( navNode.disabled ) {
                navNode.classList.remove(classes.navDisabled)
                navNode.disabled = false
            }
        }

        updateNavNode(navPrev, attrs.min)
        updateNavNode(navNext, attrs.max)

        // Bind updating the highlight when the nav is clicked.
        $([navPrev, navNext]).on('click', function(event) {
            var highlight = attrs.highlight.slice(0)
            highlight[1] += event.target == navPrev ? -1 : 1
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

            if ( year !== previousYear || month !== previousMonth ) {
                updateNavNode(navPrev, attrs.min)
                updateNavNode(navNext, attrs.max)
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
        var compare = pickadate.compare

        var date = new Date(year, month, day)
        var dateTime = date.getTime()

        var isDisabled = compare(attrs.min, 'greater', dateTime) ||
            compare(attrs.max, 'lesser', dateTime)

        var dayNode = el({
            klass: classes.day +
                (compare(attrs.select, dateTime) ? ' ' + classes.selected : '') +
                (compare(attrs.highlight, dateTime) ? ' ' + classes.highlighted : '') +
                (compare(attrs.today, dateTime) ? ' ' + classes.today : '') +
                (isDisabled ? ' ' + classes.disabled : ''),
            attrs: {
                role: 'button',
                title: pickadate.format([
                    date.getFullYear(),
                    date.getMonth(),
                    date.getDate()
                ])
            }
        }, date.getDate())

        if ( !isDisabled ) {
            dayNode.setAttribute('data-pick', dateTime)
        }

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
    } //template

}) //shadow('pickadate')


}));