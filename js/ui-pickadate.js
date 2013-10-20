
(function( $ ) { 'use strict';


// The constants.
var WEEKS_IN_CAL = 6,
    DAYS_IN_WEEK = 7


// Create the shadow extension.
shadow( 'pickadate', {

    alias: 'pickadate',
    prefix: 'ui-modal',

    dict: {
        select: [],
        highlight: null,
        disable: [],
        flipDisabled: 0,
        today: null,
        view: null,
        min: null,
        max: null
    },

    match: {
        disable: function( dictItem, value ) {
            if ( shadow._.isInteger( dictItem ) ) {
                return dictItem === value
            }
            return createShadowDate( dictItem ).time === createShadowDate( value ).time
        },
        select: function( dictItem, value ) {

            // If the value to match is a range, make sure it doesn’t overlap
            // with other ranges or contain a selected dict item.
            if ( value instanceof shadow.Range ) {
                if ( dictItem instanceof shadow.Range ) {
                    return dictItem.lower.time === value.lower.time && dictItem.upper.time === value.upper.time
                }
                return
            }

            // If the stored item is a range, find the value within.
            if ( dictItem instanceof shadow.Range ) {
                return value.time >= dictItem.lower.time && value.time <= dictItem.upper.time
            }

            // If the stored item is an integer, do a direct match.
            if ( shadow._.isInteger( dictItem ) ) {
                return dictItem === value
            }

            // For everything else try to match the time.
            return createShadowDate( dictItem ).time === createShadowDate( value ).time
        }
    },

    create: {
        disable: function( value/*, options*/ ) {

            var ui = this.ui

            // Flip the enabled and disabled dates.
            if ( value == 'flip' ) {
                ui.set('flipDisabled')
                value = ui.get('disable')
            }

            // If it’s a collection, just set the collection.
            else if ( $.isArray( value ) ) {
                value = value
            }

            // If it’s a literal false, remove any disabled dates.
            else if ( value === false ) {
                value = []
            }

            // If it’s an integer, don’t change anything.
            else if ( shadow._.isInteger( value ) ) {
                value = value
            }

            return value
        },
        flipDisabled: function( value ) {
            return value === 0 || value === 1 ?
                value :
                this.ui.get('flipDisabled') ? 0 : 1
        },
        select: function( value, options ) {

            var ui = this.ui

            // If it’s a literal false, remove all selections with a `null`.
            if ( value === false ) return null

            // Create a shadow date from the value being set (except for ranges).
            if ( !( value instanceof shadow.Range ) ) {
                value = createShadowDate( value )
                value = validateShadowDate( value, options, ui )
            }

            // If we’re settings a range, create the range object.
            if ( options.range ) {

                var highlight = ui.get('highlight')
                value = new shadow.Range( highlight, value, highlight.time > value.time )

                // If the range is being added, make sure no other
                // dates or ranges overlap with this new range.
                if ( options.type == 'add' ) {
                    ui.get('select').forEach( function( selectedValue ) {
                        if (
                            selectedValue instanceof shadow.Range &&
                            selectedValue.lower.time >= value.lower.time &&
                            selectedValue.upper.time <= value.upper.time
                        ) {
                            ui.remove('select', selectedValue)
                        }
                        else if (
                            selectedValue instanceof ShadowDate &&
                            selectedValue.time >= value.lower.time &&
                            selectedValue.time <= value.upper.time
                        ) {
                            ui.remove('select', selectedValue)
                        }
                    })
                }
            }

            // Return the final composed value.
            return value
        },
        highlight: function( value, options ) {

            // Navigate the highlight change if needed.
            if ( options.nav ) {
                value = navigateShadowDate( value, this.ui.get('view'), this.ui.get('highlight') )
            }

            // If it’s a relative move, shift the date.
            else if ( options.relative ) {
                var highlight = this.ui.get('highlight')
                value = [ highlight.year, highlight.month, highlight.date + value ]
            }

            value = createShadowDate( value )
            value = validateShadowDate( value, options, this.ui )
            return value
        },
        view: function( value, options ) {
            value = createShadowDate( value, options )
            value = validateShadowDate( value, options, this.ui )
            return viewsetShadowDate( value )
        },
        today: function( value, options ) {
            value = relativeShadowDate( value, options )
            return createShadowDate( value )
        },
        min: function( value/*, options*/ ) {

            // If it's anything false-y, remove the limits.
            if ( !value ) {
                value = -Infinity
            }

            // If it's an integer, get a date relative to today.
            else if ( shadow._.isInteger( value ) ) {
                value = relativeShadowDate( value, { rel: value } )
            }

            return createShadowDate( value )
        },
        max: function( value/*, options*/ ) {

            // If it's anything false-y, remove the limits.
            if ( !value ) {
                value = Infinity
            }

            // If it's an integer, get a date relative to today.
            else if ( shadow._.isInteger( value ) ) {
                value = relativeShadowDate( value, { rel: value } )
            }

            return createShadowDate( value )
        }
    },

    klasses: {
        root: [ '', '--pickadate' ]
    },

    keys: {

        // Enter.
        13: function( event ) {
            var ui = this.ui
            if ( ui.is( 'opened' ) ) {
                ui.$root.find('.' + ui.klasses.highlighted ).trigger( $.Event('click', {
                    metaKey: event.metaKey,
                    shiftKey: event.shiftKey
                }) )
            }
        },

        // Left.
        37: function() {
            this.ui.set( 'highlight', -1, 'relative' )
        },

        // Up.
        38: function() {
            this.ui.set( 'highlight', -7, 'relative' )
        },

        // Right.
        39: function() {
            this.ui.set( 'highlight', 1, 'relative' )
        },

        // Down.
        40: function() {
            this.ui.set( 'highlight', 7, 'relative' )
        }
    },

    defaults: {

        // Months and weekdays.
        monthsFull: [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ],
        monthsShort: [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ],
        weekdaysFull: [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ],
        weekdaysShort: [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ],

        // Today and clear.
        today: 'Today',
        clear: 'Clear',

        // The formats.
        format: 'd mmmm, yyyy',
        formatHidden: 'yyyy-mm-dd',

        // The min/max range.
        min: -Infinity,
        max: Infinity,

        // Classes.
        klasses: shadow._.prefix( 'pickadate', {

            face: '',

            table: 'table',

            header: 'header',

            navPrev: 'nav--prev',
            navNext: 'nav--next',
            navDisabled: 'nav--disabled',

            month: 'month',
            year: 'year',

            selectMonth: 'select--month',
            selectYear: 'select--year',

            weekdays: 'weekday',

            day: 'day',
            disabled: 'day--disabled',
            selected: 'day--selected',
            highlighted: 'day--highlighted',
            now: 'day--today',
            infocus: 'day--infocus',
            outfocus: 'day--outfocus',

            footer: 'footer',

            buttonClear: 'button--clear',
            buttonToday: 'button--today'
        })
    },

    is: {

        // Check if a date is disabled.
        disabled: function( dateObject ) {

            var asInteger = shadow._.isInteger( dateObject )

            dateObject = asInteger ? dateObject : createShadowDate( dateObject )

            var ui = this.ui,

                // Filter through the disabled dates to check if this is one.
                isDisabledDate = !!ui.get('disable').filter( function( dateDisabled ) {

                    // If it’s an integer, match it directly.
                    if ( asInteger ) {
                        return dateObject === dateDisabled
                    }

                    // Match the weekday with 0index and `firstDay` check.
                    if ( shadow._.isInteger( dateDisabled ) ) {
                        return dateObject.day === ( ui.settings.firstDay ? dateDisabled : dateDisabled - 1 ) % 7
                    }

                    // Otherwise create the object and match the exact time.
                    return dateObject.time === createShadowDate( dateDisabled ).time
                }).length

            // It’s disabled beyond the min/max limits. If within the limits, check if
            // the “enabled” flag is flipped and respectively flip the condition.
            return dateObject.time < ui.get('min').time ||
                dateObject.time > ui.get('max').time ||
                ui.get('flipDisabled') ? !isDisabledDate : isDisabledDate
        }
    },

    formats: {
        d: function( value, isParsing ) {
            if ( isParsing ) {
                var match = value.match( /^\d+/ )
                return match ? match[0].length : 0
            }
            return value && value.date
        },
        dd: function( value, isParsing ) {
            return isParsing ? 2 : value && leadZero( value.date )
        },
        ddd: function( value, isParsing ) {
            if ( isParsing ) {
                var match = value.match( /^\w+/ )
                return match ? match[0].length : 0
            }
            return value && this.ui.settings.weekdaysShort[ value.day ]
        },
        dddd: function( value, isParsing ) {
            if ( isParsing ) {
                var match = value.match( /^\w+/ )
                return match ? match[0].length : 0
            }
            return value && this.ui.settings.weekdaysFull[ value.day ]
        },
        m: function( value, isParsing ) {
            if ( isParsing ) {
                var match = value.match( /^\d+/ )
                return match ? match[0].length : 0
            }
            return value && value.month + 1
        },
        mm: function( value, isParsing ) {
            return isParsing ? 2 : value && leadZero( value.month + 1 )
        },
        mmm: function( value, isParsing ) {
            if ( isParsing ) {
                var match = value.match( /^\w+/ )
                return match ? match[0].length : 0
            }
            return value && this.ui.settings.monthsShort[ value.month ]
        },
        mmmm: function( value, isParsing ) {
            if ( isParsing ) {
                var match = value.match( /^\w+/ )
                return match ? match[0].length : 0
            }
            return value && this.ui.settings.monthsFull[ value.month ]
        },
        yy: function( value, isParsing ) {
            return isParsing ? 2 : value && ( '' + value.year ).slice( 2 )
        },
        yyyy: function( value, isParsing ) {
            return isParsing ? 4 : value && value.year
        }
    }, //formats

    bindings: {

        // When the values are cleared, update the `select`.
        'set.clear': [function() {
            this.set( 'select', false )
        }],

        // When the `select` is set, update the `highlight`.
        'set.select': [function( event ) {
            var ui = this,
                value = event.value
            if ( value ) ui.set( 'highlight', value instanceof shadow.Range ? value.from : value )
            else ui.render()
        }],

        // When the `highlight` is set, update the `view` and render a new ui.
        'set.highlight': [function( event ) {
            var ui = this
            ui.set( 'view', event.value )
            if ( ui.is('started') ) ui.render()
        }],

        // When a selection is added, update the `highlight` to the last selection.
        'add.select': [function( event ) {
            var value = event.value.slice(0).pop()
            this.set( 'highlight', value instanceof shadow.Range ? value.from : value )
        }],

        // Whenever the ui is rendered, bind stuff to the new elements.
        render: [function() {
            var ui = this
            ui.$root.find( '.' + ui.settings.klasses.selectMonth ).on( 'change', function() {
                ui.set( 'highlight', [ ui.get('view').year, this.value, ui.get('highlight').date ] )
            })
            ui.$root.find( '.' + ui.settings.klasses.selectYear ).on( 'change', function() {
                ui.set( 'highlight', [ this.value, ui.get('view').month, ui.get('highlight').date ] )
            })
        }]
    }, //bindings

    init: function( formatValueHashes, isHiddenValue ) {

        var component = this,
            ui = component.ui,
            settings = ui.settings,
            disabledCollection = ( settings.disable || [] ).slice(0),
            createDateArray = function( dateHash ) {

                var startValue = [
                    dateHash.yyyy || dateHash.yy,
                    dateHash.mm || dateHash.m,
                    dateHash.dd || dateHash.d
                ]

                // Make sure we have a starting month.
                if ( startValue[1] == null ) {
                    startValue[1] = ( dateHash.mmmm ? settings.monthsFull : settings.monthsShort ).
                        indexOf( dateHash.mmmm || dateHash.mmm )
                }

                // If we have a hidden value parsing, compensate for month 0index.
                if ( isHiddenValue ) {
                    startValue[1] -= 1
                }

                // Make sure we have usable date units.
                startValue = startValue.filter( function( item ) {
                    return item >= 0 && item !== ''
                })

                return startValue
            },
            selectedDates = formatValueHashes.map( function( hash ) {
                if ( hash instanceof shadow.Range ) {
                    return new shadow.Range(
                        createShadowDate( createDateArray( hash.from ) ),
                        createShadowDate( createDateArray( hash.to ) )
                    )
                }
                return createShadowDate( createDateArray( hash ) )
            })


        // Set the theme based on the type.
        if ( settings.type == 'dropdown' ) {
            component.prefix = 'ui-drop'
        }


        // Make sure we are dealing with a text type element.
        ui.$source[0].type = 'text'


        // Finally, set the starting values. Starting with the min & max *first*.
        ui.set({ min: settings.min, max: settings.max }).set({
            today: relativeShadowDate(),
            flipDisabled: disabledCollection[0] === true ? +disabledCollection.shift() : 0,
            disable: disabledCollection
        })
        if ( selectedDates.length ) ui.add( 'select', selectedDates )
        else ui.set( 'highlight', relativeShadowDate() )

    }, //init

    template: function() {

        var component = this,
            ui = component.ui,

            settings = ui.settings,

            dateMin = ui.get('min'),
            dateMax = ui.get('max'),
            dateView = ui.get('view'),
            dateToday = ui.get('today'),
            dateHighlighted = ui.get('highlight'),

            // Create the next/prev month buttons.
            createLabelNav = function( next ) {
                return shadow._.node({
                    el: 'button',
                    attrs: {
                        'data-action': 'set:highlight:' + (next ? 1 : -1) + ':nav'
                    },
                    klass: [ ui.klasses[ next ? 'navNext' : 'navPrev' ] ],
                    content: function() {

                        // If the focused month is outside the range, disable the button.
                        if (
                            ( next && dateView.year >= dateMax.year && dateView.month >= dateMax.month ) ||
                            ( !next && dateView.year <= dateMin.year && dateView.month <= dateMin.month )
                        ) {
                            this.klass.push( settings.klasses.navDisabled )
                            this.attrs.disabled = ''
                        }

                        // Just return empty content.
                        return ' '
                    }
                })
            },

            // Create the month label.
            labelMonth = shadow._.node({
                klass: ui.klasses.month,
                content: function() {

                    var monthsCollection = settings.showMonthsShort ? settings.monthsShort : settings.monthsFull

                    if ( settings.selectMonths ) {

                        this.el = 'select'
                        this.klass = ui.klasses.selectMonth

                        return monthsCollection.map( function( month, monthIndex ) {

                            var attrs = { value: monthIndex }

                            if ( dateView.month === monthIndex ) attrs.selected = ''

                            if (
                                ( dateView.year === dateMin.year && monthIndex < dateMin.month ) ||
                                ( dateView.year === dateMax.year && monthIndex > dateMax.month )
                            ) attrs.disabled = 'disabled'

                            return shadow._.node({
                                el: 'option',
                                content: month,
                                attrs: attrs
                            })
                        })
                    }

                    return monthsCollection[ dateView.month ]
                }
            }),

            // Create the year label.
            labelYear = shadow._.node({
                klass: ui.klasses.year,
                content: function() {

                    var focusedYear = dateView.year,

                        // If years selector is set to a literal "true", set it to 5. Otherwise
                        // divide in half to get half before and half after focused year.
                        numberYears = settings.selectYears === true ? 5 : ~~( settings.selectYears / 2 )


                    // Show a select menu if needed.
                    if ( numberYears ) {

                        this.el = 'select'
                        this.klass = ui.klasses.selectYear

                        var minYear = dateMin.year,
                            maxYear = dateMax.year,
                            lowestYear = focusedYear - numberYears,
                            highestYear = focusedYear + numberYears

                        // If the min year is greater than the lowest year, increase the highest year
                        // by the difference and set the lowest year to the min year.
                        if ( minYear > lowestYear ) {
                            highestYear += minYear - lowestYear
                            lowestYear = minYear
                        }

                        // If the max year is less than the highest year, decrease the lowest year
                        // by the lower of the two: available and needed years. Then set the
                        // highest year to the max year.
                        if ( maxYear < highestYear ) {

                            var availableYears = lowestYear - minYear,
                                neededYears = highestYear - maxYear

                            lowestYear -= availableYears > neededYears ? neededYears : availableYears
                            highestYear = maxYear
                        }


                        // Create an array (the size of the difference in years) to map through
                        // and set all the content by increasing lowest year up to the highest.
                        return Array.
                            apply( null, new Array( highestYear - lowestYear + 1 ) ).
                            map( function() {
                                var attrs = {}
                                if ( lowestYear === focusedYear ) attrs.selected = ''
                                return shadow._.node({
                                    el: 'option',
                                    content: lowestYear++, // Increment *after* setting the content.
                                    attrs: attrs
                                })
                            }).
                            join('')
                    }

                    // Otherwise just use the focused year.
                    return focusedYear
                }
            }),

            // Create the table head with the weekdays.
            tableHead = shadow._.node({
                el: 'thead',
                content: shadow._.node({
                    el: 'tr',
                    content: function() {

                        // Copy the relative weekdays collection.
                        var weekdays = ( settings.showWeekdaysFull ? settings.weekdaysFull : settings.weekdaysShort ).slice(0,7)

                        // If the first day should be Monday, move Sunday to the end.
                        if ( settings.firstDay ) {
                            weekdays.push( weekdays.shift() )
                        }

                        // Create a node for each weekday.
                        return weekdays.map( function( weekday ) {
                            return shadow._.node({
                                el: 'th',
                                content: weekday,
                                klass: ui.klasses.weekdays
                            })
                        }).join('')
                    }
                })
            }), //tableHead

            createNodeDate = function( dayOfCalendar ) {
                var loopedDate = createShadowDate([ dateView.year, dateView.month, dayOfCalendar ])
                return '<td>' + shadow._.node({
                    el: 'button',
                    content: function() {

                        // Add the `disabled` state if the looped date is disabled or outside the range.
                        if ( ui.is( 'disabled', loopedDate ) ) {
                            this.klass.push( ui.klasses.disabled )
                            this.attrs.disabled = ''
                        }

                        // Return the looped date as the content.
                        return loopedDate.date
                    },
                    attrs: {
                        'data-action': 'set:select:' + loopedDate.time,
                        'data-action-meta': 'add:select:' + loopedDate.time,
                        'data-action-shift': 'set:select:' + loopedDate.time + ':range',
                        'data-action-shift-meta': 'add:select:' + loopedDate.time + ':range',
                        'tabindex': -1
                    },
                    klass: [

                        // The default “day” class.
                        ui.klasses.day,

                        // Add the `infocus` or `outfocus` classes based on month in view.
                        dateView.month === loopedDate.month ? ui.klasses.infocus : ui.klasses.outfocus,

                        // Add the `today` class if needed.
                        dateToday.time === loopedDate.time ? ui.klasses.now : '',

                        // Add the `selected` class if something's selected and the time matches.
                        ui.within( 'select', loopedDate ) > -1 ? ui.klasses.selected : '',

                        // Add the `highlighted` class if something's highlighted and the time matches.
                        dateHighlighted.time === loopedDate.time ? ui.klasses.highlighted : ''
                    ]
                }) + '</td>'
            },

            // Create the table body as a matrix of dates (7x6).
            tableBody = shadow._.node({
                el: 'tbody',
                content: function() {

                    var rows = [],

                        // If the first day is Monday, shift by 1. If the first day
                        // of the month is Sunday, shift the date back a week.
                        shiftWeekday = settings.firstDay ? dateView.day === 0 ? -6 : 1 : 0

                    // Go through the weeks and days to fill up the collection.
                    for ( var countWeek = 0; countWeek < WEEKS_IN_CAL; countWeek += 1 ) {

                        // Create a collection for this week’s days.
                        rows[ countWeek ] = []

                        // Go through the days in this week to fill up the collection.
                        for ( var countWeekday = 1; countWeekday <= DAYS_IN_WEEK; countWeekday += 1 ) {

                            // Calculate the days up to this week.
                            var countDay = countWeek * DAYS_IN_WEEK + countWeekday - ( dateView.day - shiftWeekday )

                            // Create the day cells and add it to the collection.
                            rows[ countWeek ].push( createNodeDate( countDay ) )
                        }

                        // Create the week row and update the collection.
                        rows[ countWeek ] = shadow._.node({
                            el: 'tr',
                            content: rows[ countWeek ]
                        })
                    }

                    return rows.join('')
                }
            }), //tableBody

            // Create the “today” button.
            buttonToday = shadow._.node({
                el: 'button',
                content: 'Today',
                attrs: {
                    'data-action': 'set:select:' + dateToday.time
                },
                klass: ui.klasses.buttonToday
            }),

            // Create the “clear” button.
            buttonClear = shadow._.node({
                el: 'button',
                content: 'Clear',
                attrs: {
                    'data-action': 'set:clear'
                },
                klass: ui.klasses.buttonClear
            })


        // Return the composed the calendar.
        return shadow._.node({
            klass: ui.klasses.face,
            content: [
                shadow._.node({
                    content: [ labelMonth, labelYear, createLabelNav(), createLabelNav(1) ],
                    klass: ui.klasses.header
                }),
                shadow._.node({
                    el: 'table',
                    content: [ tableHead, tableBody ],
                    klass: ui.klasses.table
                }),
                shadow._.node({
                    content: [ buttonToday, buttonClear ],
                    klass: ui.klasses.footer
                })
            ]
        })
    } //template

}) //shadow.extend


// The shadow date constructor.
function ShadowDate( year, month, date, day, time, obj ) {
    this.year = year
    this.month = month
    this.date = date
    this.day = day
    this.time = time
    this.obj = obj
}

// Create a shadow date object.
function createShadowDate( value ) {

    var isInfiniteValue

    // If it’s already a shadow date, we’re all done.
    if ( value instanceof ShadowDate ) return value

    // If it’s a number or date object, make a normalized date.
    if ( shadow._.isInteger( value ) || shadow._.isDate( value ) ) {
        value = normalizeShadowDate( new Date( value ) )
    }

    // If it’s an array, convert it into a date and make sure
    // that it’s a valid date – otherwise default to today.
    else if ( $.isArray( value ) ) {
        value = new Date( value[0], value[1], value[2] )
        value = shadow._.isDate( value ) ? value : relativeShadowDate()
    }

    // If it’s infinity, silently pass through.
    else if ( value == -Infinity || value == Infinity ) {
        isInfiniteValue = value
    }

    // If it’s a literal true or any other case, set it to now.
    else /*if ( value === true )*/ {
        value = relativeShadowDate()
    }

    // Return a new a shadow date instance.
    return new ShadowDate(
        isInfiniteValue || value.getFullYear(),
        isInfiniteValue || value.getMonth(),
        isInfiniteValue || value.getDate(),
        isInfiniteValue || value.getDay(),
        isInfiniteValue || value.getTime(),
        isInfiniteValue || value
    )
}

// Normalize a date by setting the hours to midnight.
function normalizeShadowDate( value ) {
    value.setHours(0,0,0,0)
    return value
}

// Navigate a highlight change with month changes if needed.
function navigateShadowDate( value, dateView, dateHighlighted ) {

    var targetDateObject = new Date( dateView.year, dateView.month + value, 1 ),
        targetYear = targetDateObject.getFullYear(),
        targetMonth = targetDateObject.getMonth(),
        targetDate = dateHighlighted.date

    // Make sure the date exists. If the target month doesn’t have enough
    // days, keep decreasing the date until we reach the month’s last date.
    while (
        shadow._.isDate( targetDateObject ) &&
        new Date( targetYear, targetMonth, targetDate ).getMonth() !== targetMonth
    ) {
        targetDate -= 1
    }

    // Construct the final value.
    return [ targetYear, targetMonth, targetDate ]
}

// Create a viewset date for navigation.
function viewsetShadowDate( value/*, options*/ ) {
    return createShadowDate([ value.year, value.month, 1 ])
}

// Get the date today or relative to today.
function relativeShadowDate( value, options ) {

    // Ignore the value and create a new date.
    value = new Date()

    // If it’s relative to today, make the shift.
    if ( options && options.rel ) value.setDate( value.getDate() + options.rel )

    // Return the normalized date.
    return normalizeShadowDate( value, options )
}

// Validate a date as enabled and shift if needed.
function validateShadowDate( dateObject, options, ui ) {

    var
        // Make sure we have an interval.
        interval = options && options.interval ? options.interval : 1,

        // Check if the calendar enabled dates are inverted.
        isInverted = ui.get('flipDisabled') === 1,

        // Check if we have any enabled dates after/before now.
        hasEnabledBeforeTarget, hasEnabledAfterTarget,

        // Keep a reference to the original date.
        dateOriginal = dateObject,

        // The min & max limits.
        dateMin = ui.get('min'),
        dateMax = ui.get('max'),

        // Check if we’ve reached the limit during shifting.
        reachedMin, reachedMax,

        // Check if the calendar is inverted and at least one weekday is enabled.
        hasEnabledWeekdays = isInverted && ui.get('disable').filter( function( value ) {

            // If there’s a date, check where it is relative to the target.
            if ( Array.isArray( value ) ) {
                var dateTime = createShadowDate( value ).time
                if ( dateTime < value.time ) hasEnabledBeforeTarget = true
                else if ( dateTime > value.time ) hasEnabledAfterTarget = true
            }

            // Return only integers for enabled weekdays.
            return shadow._.isInteger( value )
        }).length


    // Cases to validate for:
    // [1] Not inverted and date disabled.
    // [2] Inverted and some dates enabled.
    // [3] Out of range.
    //
    // Cases to **not** validate for:
    // • Navigating months.
    // • Not inverted and date enabled.
    // • Inverted and all dates disabled.
    // • ..and anything else.
    if ( options != 'nav' ) if (
        /* 1 */ ( !isInverted && ui.is( 'disabled', dateObject ) ) ||
        /* 2 */ ( isInverted && ui.is( 'disabled', dateObject ) && ( hasEnabledWeekdays || hasEnabledBeforeTarget || hasEnabledAfterTarget ) ) ||
        /* 3 */ ( dateObject.time <= dateMin.time || dateObject.time >= dateMax.time )
    ) {


        // When inverted, flip the direction if there aren’t any enabled weekdays
        // and there are no enabled dates in the direction of the interval.
        if ( isInverted && !hasEnabledWeekdays && ( ( !hasEnabledAfterTarget && interval > 0 ) || ( !hasEnabledBeforeTarget && interval < 0 ) ) ) {
            interval *= -1
        }


        // Keep looping until we reach an enabled date.
        while ( ui.is( 'disabled', dateObject ) ) {


            // If we’ve looped into the next/prev month, return to the original date and flatten the interval.
            if ( Math.abs( interval ) > 1 && ( dateObject.month < dateOriginal.month || dateObject.month > dateOriginal.month ) ) {
                dateObject = dateOriginal
                interval = Math.abs( interval ) / interval
            }


            // If we’ve reached the min/max limit, reverse the direction and flatten the interval.
            if ( dateObject.time <= dateMin.time ) {
                reachedMin = true
                interval = 1
            }
            else if ( dateObject.time >= dateMax.time ) {
                reachedMax = true
                interval = -1
            }


            // If we’ve reached both limits, just break out of the loop.
            if ( reachedMin && reachedMax ) {
                break
            }


            // Finally, create the shifted date using the interval and keep looping.
            dateObject = createShadowDate([ dateObject.year, dateObject.month, dateObject.date + interval ])
        }

    } //endif

    // Return the date object settled on.
    return dateObject
}

// Lead numbers less than 10 with a zero.
function leadZero( number ) {
    return number > 9 ? number : '0' + number
}

})( jQuery );

