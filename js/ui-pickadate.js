
(function( $ ) { 'use strict';


// The constants.
var WEEKS_IN_CAL = 6,
    DAYS_IN_WEEK = 7

// The shadow date constructor.
function ShadowDate( date ) {
    this.year = date.getFullYear()
    this.month = date.getMonth()
    this.date = date.getDate()
    this.day = date.getDay()
    this.time = date.getTime()
    this.obj = date
}

// Lead numbers less than 10 with a zero.
function leadZero( number ) {
    return number > 9 ? number : '0' + number
}


// Create the shadow extension.
shadow.extend({
    name: 'input-date',
    alias: 'pickadate',
    prefix: 'ui-modal',

    dict: {
        select: [],
        highlight: [],
        today: null,
        view: null,
        min: -Infinity,
        max: Infinity
    },

    queue: {
        today: 'now create',
        select: 'create',
        highlight: 'navigate create',
        view: 'create viewset'
    },

    cascades: {
        // select: 'highlight', //(optional)
        highlight: 'view'
    },

    klasses: {
        root: [ '', '--pickadate' ]
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

        // The format to show on the `input` element.
        format: 'd mmmm, yyyy',

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

    formats: {
        d: function( value/*, isParsing*/ ) {
            return value && value[0].date
        },
        dd: function( value/*, isParsing*/ ) {
            return value && leadZero( value[0].date )
        },
        ddd: function( value/*, isParsing*/ ) {

            // Get the selected weekday from the “short” list.
            return value && this.ui.settings.weekdaysShort[ value[0].day ]
        },
        dddd: function( value/*, isParsing*/ ) {

            // Get the selected weekday from the “full” list..
            return value && this.ui.settings.weekdaysFull[ value[0].day ]
        },
        m: function( value/*, isParsing*/ ) {

            // Get the selected month with 0index compensation.
            return value && value[0].month + 1
        },
        mm: function( value/*, isParsing*/ ) {

            // Get the selected month with 0index and leading zero.
            return value && leadZero( value[0].month + 1 )
        },
        mmm: function( value/*, isParsing*/ ) {

            // Get the selected month from the “short” list.
            return value && this.ui.settings.monthsShort[ value[0].month ]
        },
        mmmm: function( value/*, isParsing*/ ) {

            // Get the selected month from the “full” list.
            return value && this.ui.settings.monthsFull[ value[0].month ]
        },
        yy: function( value/*, isParsing*/ ) {

            // Get the selected year by removing the first 2 digits.
            return value && ( '' + value[0].year ).slice( 2 )
        },
        yyyy: function( value/*, isParsing*/ ) {

            // Get the selected year.
            return value && value[0].year
        }
    }, //formats

    init: function() {

        var today,
            component = this,
            ui = component.ui

        if ( component.ui.settings.type == 'dropdown' ) {
            component.prefix = 'ui-drop'
        }

        // Make sure we are dealing with a text type element.
        ui.$source[0].type = 'text'

        // Set the starting values.
        today = ui.set( 'today', component.now() )
        ui.set( 'select', today )

        // Bind the ui events.
        ui.on({

            // When something is set, render the UI if needed.
            set: function( event ) {
                if ( event.item == 'select' || ( event.item == 'highlight' && event.options == 'nav' ) ) {
                    ui.render()
                }
                if ( event.options == 'close' ) {
                    ui.close( true )
                }
            }
        })

    }, //init


    /**
     * Create the template for the face of the extension.
     */
    template: function() {

        var component = this,
            ui = component.ui,

            settings = ui.settings,

            dateView = ui.get('view'),
            dateToday = ui.get('today'),
            dateSelected = ui.get('select')[0],
            dateHighlighted = ui.get('highlight')[0],

            // Create the next/prev month buttons.
            labelNav = function( next ) {
                return shadow._.node({
                    el: 'button',
                    content: ' ',
                    attrs: {
                        'data-action': 'highlight:' + (next ? 1 : -1) + ':nav'
                    },
                    klass: settings.klasses[ next ? 'navNext' : 'navPrev' ]

                    // // If the focused month is outside the range, disabled the button.
                    // ( next && viewsetObject.year >= maxLimitObject.year && viewsetObject.month >= maxLimitObject.month ) ||
                    // ( !next && viewsetObject.year <= minLimitObject.year && viewsetObject.month <= minLimitObject.month ) ?
                    // ' ' + settings.klass.navDisabled : ''
                })
            },

            // Create the month label.
            labelMonth = shadow._.node({
                content: settings.monthsFull[ dateView.month ],
                klass: settings.klasses.month
            }),

            // Create the year label.
            labelYear = shadow._.node({
                content: dateView.year,
                klass: settings.klasses.year
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
                                klass: settings.klasses.weekdays
                            })
                        }).join('')
                    }
                })
            }), //tableHead

            // Create the table body as a matrix of dates (7x6).
            tableBody = shadow._.node({
                el: 'tbody',
                content: function() {

                    var rows = [],

                        // If the first day is Monday, shift by 1. If the first day
                        // of the month is Sunday, shift the date back a week.
                        shiftWeekday = settings.firstDay ? dateView.day === 0 ? -6 : 1 : 0,

                        createNodeDate = function ( dayOfCalendar ) {
                            var loopedDate = component.create([ dateView.year, dateView.month, dayOfCalendar ])
                            return '<td>' + shadow._.node({
                                el: 'button',
                                content: loopedDate.date,
                                attrs: {
                                    'data-action': 'select:' + loopedDate.time + ':close',
                                    'tabindex': -1
                                },
                                klass: [

                                    // The default “day” class.
                                    settings.klasses.day,

                                    // Add the `infocus` or `outfocus` classes based on month in view.
                                    dateView.month === loopedDate.month ? settings.klasses.infocus : settings.klasses.outfocus,

                                    // Add the `today` class if needed.
                                    dateToday.time === loopedDate.time ? settings.klasses.now : '',

                                    // Add the `selected` class if something's selected and the time matches.
                                    dateSelected && dateSelected.time === loopedDate.time ? settings.klasses.selected : '',

                                    // Add the `highlighted` class if something's highlighted and the time matches.
                                    dateHighlighted && dateHighlighted.time === loopedDate.time ? settings.klasses.highlighted : '',

                                    // Add the `disabled` class if something's disabled and the object matches.
                                    // disabledCollection && calendar.disabled( targetDate ) ||
                                    // targetDate.pick < minLimitObject.pick ||
                                    // targetDate.pick > maxLimitObject.pick ?
                                    //     settings.klass.disabled :
                                    //     ''
                                ]
                            }) + '</td>'
                        }


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
                    'data-action': 'select:' + dateToday.time
                },
                klass: settings.klasses.buttonToday
            }),

            // Create the “clear” button.
            buttonClear = shadow._.node({
                el: 'button',
                content: 'Clear',
                attrs: {
                    'data-action': 'clear'
                },
                klass: settings.klasses.buttonClear
            })


        // Return the composed the calendar.
        return shadow._.node({
            klass: settings.klasses.face,
            content: [
                shadow._.node({
                    content: [ labelNav(), labelNav(1), labelMonth, labelYear ],
                    klass: settings.klasses.header
                }),
                shadow._.node({
                    el: 'table',
                    content: [ tableHead, tableBody ],
                    klass: settings.klasses.table
                }),
                shadow._.node({
                    content: [ buttonToday, buttonClear ],
                    klass: settings.klasses.footer
                })
            ]
        })
    }, //template


    /**
     * Get the date today or relative to today.
     */
    now: function( value, options ) {

        // Ignore the value and create a new date.
        value = new Date()

        // If it’s relative to today, make the shift.
        if ( options && options.rel ) value.setDate( value.getDate() + options.rel )

        // Return the normalized date.
        return this.normalize( value, options )
    },


    /**
     * Normalize a date by setting the hours to midnight.
     */
    normalize: function( date ) {
        date.setHours(0,0,0,0)
        return date
    },


    /**
     * Navigate a highlight change with month changes if needed.
     */
    navigate: function( value, options ) {

        // Only do stuff if it was a “navigating” highlight change.
        if ( options == 'nav' ) {

            var dateView = this.ui.get('view'),
                dateHighlighted = this.ui.get('highlight'),
                targetDateObject = new Date( dateView.year, dateView.month + value, 1 ),
                targetYear = targetDateObject.getFullYear(),
                targetMonth = targetDateObject.getMonth(),
                targetDate = dateHighlighted[0].date

            // Make sure the date exists. If the target month doesn’t have enough
            // days, keep decreasing the date until we reach the month’s last date.
            while ( shadow._.isDate( targetDateObject ) && new Date( targetYear, targetMonth, targetDate ).getMonth() !== targetMonth ) {
                targetDate -= 1
            }

            // Construct the final value.
            value = [ targetYear, targetMonth, targetDate ]
        }

        // Return the composed value.
        return value
    },


    /**
     * Create a viewset date for navigation.
     */
    viewset: function( value/*, options*/ ) {
        return this.create([ value.year, value.month, 1 ])
    },


    /**
     * Create a shadow date object.
     */
    create: function( value/*, options*/ ) {

        // If it’s already a shadow date, we’re all done.
        if ( value instanceof ShadowDate ) return value

        // If it’s a number or date object, make a normalized date.
        if ( shadow._.isInteger( value ) || shadow._.isDate( value ) ) {
            value = this.normalize( new Date( value ) )
        }

        // If it’s an array, convert it into a date and make sure
        // that it’s a valid date – otherwise default to today.
        else if ( $.isArray( value ) ) {
            value = new Date( value[0], value[1], value[2] )
            value = shadow._.isDate( value ) ? value : this.now()
        }

        // If it’s a literal true or any other case, set it to now.
        else /*if ( value === true )*/ {
            value = this.now()
        }

        // Return a new a shadow date instance.
        return new ShadowDate( value )
    }
})




// /**
//  * The date picker constructor
//  */
// function DatePicker( picker, settings ) {

//     var calendar = this,
//         elementValue = picker.$node[ 0 ].value,
//         elementDataValue = picker.$node.data( 'value' ),
//         valueString = elementDataValue || elementValue,
//         formatString = elementDataValue ? settings.formatSubmit : settings.format

//     calendar.settings = settings

//     // The queue of methods that will be used to build item objects.
//     calendar.queue = {
//         min: 'measure create',
//         max: 'measure create',
//         now: 'now create',
//         select: 'parse create validate',
//         highlight: 'navigate create validate',
//         view: 'create validate viewset',
//         disable: 'flipItem',
//         enable: 'flipItem'
//     }

//     // The component's item object.
//     calendar.item = {}

//     calendar.item.disable = ( settings.disable || [] ).slice( 0 )
//     calendar.item.enable = -(function( collectionDisabled ) {
//         return collectionDisabled[ 0 ] === true ? collectionDisabled.shift() : -1
//     })( calendar.item.disable )

//     calendar.
//         set( 'min', settings.min ).
//         set( 'max', settings.max ).

//         // Setting the `select` also sets the `highlight` and `view`.
//         set( 'select',

//             // Use the value provided or default to selecting “today”.
//             valueString || calendar.item.now,
//             {
//                 // Use the appropriate format.
//                 format: formatString,

//                 // Set user-provided month data as true when there is a
//                 // “mm” or “m” used in the relative format string.
//                 data: (function( formatArray ) {
//                     return valueString && ( formatArray.indexOf( 'mm' ) > -1 || formatArray.indexOf( 'm' ) > -1 )
//                 })( calendar.formats.toArray( formatString ) )
//             }
//         )


//     // The keycode to movement mapping.
//     calendar.key = {
//         40: 7, // Down
//         38: -7, // Up
//         39: 1, // Right
//         37: -1, // Left
//         go: function( timeChange ) {
//             calendar.set( 'highlight', [ calendar.item.highlight.year, calendar.item.highlight.month, calendar.item.highlight.date + timeChange ], { interval: timeChange } )
//             this.render()
//         }
//     }


//     // Bind some picker events.
//     picker.
//         on( 'render', function() {
//             picker.$root.find( '.' + settings.klass.selectMonth ).on( 'change', function() {
//                 picker.set( 'highlight', [ picker.get( 'view' ).year, this.value, picker.get( 'highlight' ).date ] )
//                 picker.$root.find( '.' + settings.klass.selectMonth ).focus()
//             })
//             picker.$root.find( '.' + settings.klass.selectYear ).on( 'change', function() {
//                 picker.set( 'highlight', [ this.value, picker.get( 'view' ).month, picker.get( 'highlight' ).date ] )
//                 picker.$root.find( '.' + settings.klass.selectYear ).focus()
//             })
//         }).
//         on( 'open', function() {
//             picker.$root.find( 'button, select' ).attr( 'disabled', false )
//         }).
//         on( 'close', function() {
//             picker.$root.find( 'button, select' ).attr( 'disabled', true )
//         })

// } //DatePicker


// /**
//  * Set a datepicker item object.
//  */
// DatePicker.prototype.set = function( type, value, options ) {

//     var calendar = this

//     // Go through the queue of methods, and invoke the function. Update this
//     // as the time unit, and set the final resultant as this item type.
//     // * In the case of `enable`, keep the queue but set `disable` instead.
//     //   And in the case of `flip`, keep the queue but set `enable` instead.
//     calendar.item[ ( type == 'enable' ? 'disable' : type == 'flip' ? 'enable' : type ) ] = calendar.queue[ type ].split( ' ' ).map( function( method ) {
//         return value = calendar[ method ]( type, value, options )
//     }).pop()

//     // Check if we need to cascade through more updates.
//     if ( ( type == 'flip' || type == 'min' || type == 'max' || type == 'disable' || type == 'enable' ) && calendar.item.select && calendar.item.highlight ) {
//         calendar.
//             set( 'select', calendar.item.select, options ).
//             set( 'highlight', calendar.item.highlight, options )
//     }

//     return calendar
// } //DatePicker.prototype.set


// /**
//  * Create a picker date object.
//  */
// DatePicker.prototype.create = function( type, value, options ) {

//     var isInfiniteValue,
//         calendar = this


//     // If it’s infinity, update the value.
//     if ( value == -Infinity || value == Infinity ) {
//         isInfiniteValue = value
//     }


//     // Return the compiled object.
//     return {
//         year: isInfiniteValue || value.getFullYear(),
//         month: isInfiniteValue || value.getMonth(),
//         date: isInfiniteValue || value.getDate(),
//         day: isInfiniteValue || value.getDay(),
//         obj: isInfiniteValue || value,
//         pick: isInfiniteValue || value.getTime()
//     }
// } //DatePicker.prototype.create


// /**
//  * Measure the range of dates.
//  */
// DatePicker.prototype.measure = function( type, value/*, options*/ ) {

//     var calendar = this

//     // If it's anything false-y, remove the limits.
//     if ( !value ) {
//         value = type == 'min' ? -Infinity : Infinity
//     }

//     // If it's an integer, get a date relative to today.
//     else if ( Picker._.isInteger( value ) ) {
//         value = calendar.now( type, value, { rel: value } )
//     }

//     return value
// } ///DatePicker.prototype.measure


// /**
//  * Validate a date as enabled and shift if needed.
//  */
// DatePicker.prototype.validate = function( type, dateObject, options ) {

//     var calendar = this,

//         // Keep a reference to the original date.
//         originalDateObject = dateObject,

//         // Make sure we have an interval.
//         interval = options && options.interval ? options.interval : 1,

//         // Check if the calendar enabled dates are inverted.
//         isInverted = calendar.item.enable === -1,

//         // Check if we have any enabled dates after/before now.
//         hasEnabledBeforeTarget, hasEnabledAfterTarget,

//         // The min & max limits.
//         minLimitObject = calendar.item.min,
//         maxLimitObject = calendar.item.max,

//         // Check if we’ve reached the limit during shifting.
//         reachedMin, reachedMax,

//         // Check if the calendar is inverted and at least one weekday is enabled.
//         hasEnabledWeekdays = isInverted && calendar.item.disable.filter( function( value ) {

//             // If there’s a date, check where it is relative to the target.
//             if ( Array.isArray( value ) ) {
//                 var dateTime = calendar.create( value ).pick
//                 if ( dateTime < dateObject.pick ) hasEnabledBeforeTarget = true
//                 else if ( dateTime > dateObject.pick ) hasEnabledAfterTarget = true
//             }

//             // Return only integers for enabled weekdays.
//             return Picker._.isInteger( value )
//         }).length



//     // Cases to validate for:
//     // [1] Not inverted and date disabled.
//     // [2] Inverted and some dates enabled.
//     // [3] Out of range.
//     //
//     // Cases to **not** validate for:
//     // • Navigating months.
//     // • Not inverted and date enabled.
//     // • Inverted and all dates disabled.
//     // • ..and anything else.
//     if ( !options.nav ) if (
//         /* 1 */ ( !isInverted && calendar.disabled( dateObject ) ) ||
//         /* 2 */ ( isInverted && calendar.disabled( dateObject ) && ( hasEnabledWeekdays || hasEnabledBeforeTarget || hasEnabledAfterTarget ) ) ||
//         /* 3 */ ( dateObject.pick <= minLimitObject.pick || dateObject.pick >= maxLimitObject.pick )
//     ) {


//         // When inverted, flip the direction if there aren’t any enabled weekdays
//         // and there are no enabled dates in the direction of the interval.
//         if ( isInverted && !hasEnabledWeekdays && ( ( !hasEnabledAfterTarget && interval > 0 ) || ( !hasEnabledBeforeTarget && interval < 0 ) ) ) {
//             interval *= -1
//         }


//         // Keep looping until we reach an enabled date.
//         while ( calendar.disabled( dateObject ) ) {


//             // If we’ve looped into the next/prev month, return to the original date and flatten the interval.
//             if ( Math.abs( interval ) > 1 && ( dateObject.month < originalDateObject.month || dateObject.month > originalDateObject.month ) ) {
//                 dateObject = originalDateObject
//                 interval = Math.abs( interval ) / interval
//             }


//             // If we’ve reached the min/max limit, reverse the direction and flatten the interval.
//             if ( dateObject.pick <= minLimitObject.pick ) {
//                 reachedMin = true
//                 interval = 1
//             }
//             else if ( dateObject.pick >= maxLimitObject.pick ) {
//                 reachedMax = true
//                 interval = -1
//             }


//             // If we’ve reached both limits, just break out of the loop.
//             if ( reachedMin && reachedMax ) {
//                 break
//             }


//             // Finally, create the shifted date using the interval and keep looping.
//             dateObject = calendar.create([ dateObject.year, dateObject.month, dateObject.date + interval ])
//         }

//     } //endif


//     // Return the date object settled on.
//     return dateObject
// } //DatePicker.prototype.validate


// /**
//  * Check if an object is disabled.
//  */
// DatePicker.prototype.disabled = function( dateObject ) {

//     var calendar = this,

//         // Filter through the disabled dates to check if this is one.
//         isDisabledDate = calendar.item.disable.filter( function( dateToDisable ) {

//             // If the date is a number, match the weekday with 0index and `firstDay` check.
//             if ( Picker._.isInteger( dateToDisable ) ) {
//                 return dateObject.day === ( calendar.settings.firstDay ? dateToDisable : dateToDisable - 1 ) % 7
//             }

//             // If it's an array, create the object and match the exact date.
//             if ( Array.isArray( dateToDisable ) ) {
//                 return dateObject.pick === calendar.create( dateToDisable ).pick
//             }
//         }).length


//     // It’s disabled beyond the min/max limits. If within the limits, check the
//     // calendar “enabled” flag is flipped and respectively flip the condition.
//     return dateObject.pick < calendar.item.min.pick ||
//         dateObject.pick > calendar.item.max.pick ||
//         calendar.item.enable === -1 ? !isDisabledDate : isDisabledDate
// } //DatePicker.prototype.disabled


// /**
//  * Various formats to display the object in.
//  */
// DatePicker.prototype.formats = (function() {

//     // Return the length of the first word in a collection.
//     function getWordLengthFromCollection( string, collection, dateObject ) {

//         // Grab the first word from the string.
//         var word = string.match( /\w+/ )[ 0 ]

//         // If there's no month index, add it to the date object
//         if ( !dateObject.mm && !dateObject.m ) {
//             dateObject.m = collection.indexOf( word )
//         }

//         // Return the length of the word.
//         return word.length
//     }

//     // Get the length of the first word in a string.
//     function getFirstWordLength( string ) {
//         return string.match( /\w+/ )[ 0 ].length
//     }

// })() //DatePicker.prototype.formats


// /**
//  * Flip an item as enabled or disabled.
//  */
// DatePicker.prototype.flipItem = function( type, value/*, options*/ ) {

//     var calendar = this,
//         collection = calendar.item.disable,
//         isInverted = calendar.item.enable === -1

//     // Flip the enabled and disabled dates.
//     if ( value == 'flip' ) {
//         calendar.item.enable = isInverted ? 1 : -1
//     }

//     // Check if we have to add/remove from collection.
//     else if ( !isInverted && type == 'enable' || isInverted && type == 'disable' ) {
//         collection = calendar.removeDisabled( collection, value )
//     }
//     else if ( !isInverted && type == 'disable' || isInverted && type == 'enable' ) {
//         collection = calendar.addDisabled( collection, value )
//     }

//     return collection
// } //DatePicker.prototype.flipItem


// /**
//  * Add an item to the disabled collection.
//  */
// DatePicker.prototype.addDisabled = function( collection, item ) {
//     var calendar = this
//     item.map( function( timeUnit ) {
//         if ( !calendar.filterDisabled( collection, timeUnit ).length ) {
//             collection.push( timeUnit )
//         }
//     })
//     return collection
// } //DatePicker.prototype.addDisabled


// /**
//  * Remove an item from the disabled collection.
//  */
// DatePicker.prototype.removeDisabled = function( collection, item ) {
//     var calendar = this
//     item.map( function( timeUnit ) {
//         collection = calendar.filterDisabled( collection, timeUnit, 1 )
//     })
//     return collection
// } //DatePicker.prototype.removeDisabled


// /**
//  * Filter through the disabled collection to find a time unit.
//  */
// DatePicker.prototype.filterDisabled = function( collection, timeUnit, isRemoving ) {
//     var timeIsArray = Array.isArray( timeUnit )
//     return collection.filter( function( disabledTimeUnit ) {
//         var isMatch = !timeIsArray && timeUnit === disabledTimeUnit ||
//             timeIsArray && Array.isArray( disabledTimeUnit ) && timeUnit.toString() === disabledTimeUnit.toString()
//         return isRemoving ? !isMatch : isMatch
//     })
// } //DatePicker.prototype.filterDisabled


// /**
//  * Create a string for the nodes in the picker.
//  */
// DatePicker.prototype.nodes = function( isOpen ) {

//     var
//         calendar = this,
//         settings = calendar.settings,
//         nowObject = calendar.item.now,
//         viewsetObject = calendar.item.view,
//         disabledCollection = calendar.item.disable,
//         minLimitObject = calendar.item.min,
//         maxLimitObject = calendar.item.max,


//         // Create the month label.
//         createMonthLabel = function( monthsCollection ) {

//             // If there are months to select, add a dropdown menu.
//             if ( settings.selectMonths ) {

//                 return Picker._.node( 'select', Picker._.group({
//                     min: 0,
//                     max: 11,
//                     i: 1,
//                     node: 'option',
//                     item: function( loopedMonth ) {

//                         return [

//                             // The looped month and no classes.
//                             monthsCollection[ loopedMonth ], 0,

//                             // Set the value and selected index.
//                             'value=' + loopedMonth +
//                             ( viewsetObject.month == loopedMonth ? ' selected' : '' ) +
//                             (
//                                 (
//                                     ( viewsetObject.year == minLimitObject.year && loopedMonth < minLimitObject.month ) ||
//                                     ( viewsetObject.year == maxLimitObject.year && loopedMonth > maxLimitObject.month )
//                                 ) ?
//                                 ' disabled' : ''
//                             )
//                         ]
//                     }
//                 }), settings.klass.selectMonth, isOpen ? '' : 'disabled' )
//             }

//             // If there's a need for a month selector
//             return Picker._.node( 'div', monthsCollection[ viewsetObject.month ], settings.klass.month )
//         }, //createMonthLabel


//         // Create the year label.
//         createYearLabel = function() {

//             var focusedYear = viewsetObject.year,

//             // If years selector is set to a literal "true", set it to 5. Otherwise
//             // divide in half to get half before and half after focused year.
//             numberYears = settings.selectYears === true ? 5 : ~~( settings.selectYears / 2 )

//             // If there are years to select, add a dropdown menu.
//             if ( numberYears ) {

//                 var
//                     minYear = minLimitObject.year,
//                     maxYear = maxLimitObject.year,
//                     lowestYear = focusedYear - numberYears,
//                     highestYear = focusedYear + numberYears

//                 // If the min year is greater than the lowest year, increase the highest year
//                 // by the difference and set the lowest year to the min year.
//                 if ( minYear > lowestYear ) {
//                     highestYear += minYear - lowestYear
//                     lowestYear = minYear
//                 }

//                 // If the max year is less than the highest year, decrease the lowest year
//                 // by the lower of the two: available and needed years. Then set the
//                 // highest year to the max year.
//                 if ( maxYear < highestYear ) {

//                     var availableYears = lowestYear - minYear,
//                         neededYears = highestYear - maxYear

//                     lowestYear -= availableYears > neededYears ? neededYears : availableYears
//                     highestYear = maxYear
//                 }

//                 return Picker._.node( 'select', Picker._.group({
//                     min: lowestYear,
//                     max: highestYear,
//                     i: 1,
//                     node: 'option',
//                     item: function( loopedYear ) {
//                         return [

//                             // The looped year and no classes.
//                             loopedYear, 0,

//                             // Set the value and selected index.
//                             'value=' + loopedYear + ( focusedYear == loopedYear ? ' selected' : '' )
//                         ]
//                     }
//                 }), settings.klass.selectYear, isOpen ? '' : 'disabled' )
//             }

//             // Otherwise just return the year focused
//             return Picker._.node( 'div', focusedYear, settings.klass.year )
//         } //createYearLabel


//     // Create and return the entire calendar.
//     return Picker._.node(
//         'div',
//         createMonthLabel( settings.showMonthsShort ? settings.monthsShort : settings.monthsFull ) +
//         createYearLabel(),
//     ) +

//     Picker._.node(
//         'div',
//         Picker._.node( 'button', settings.today, isOpen ? '' : ' disabled' ) +
//         Picker._.node( 'button', settings.clear, isOpen ? '' : ' disabled' ),
//     ) //endreturn
// } //DatePicker.prototype.nodes

})( jQuery );

