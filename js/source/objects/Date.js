
/**
 * Construct a date object.
 */
shadow.Object.extend({

    name: 'Date',

    value: null,
    year: null,
    month: null,
    date: null,

    setToTheFirst: false,


    /**
     * Create a date object.
     */
    create: function(value, options) {

        if ( !value ) {
            return this._super(options)
        }

        if ( value === true ) {
            value = new Date()
        }
        else if ( _.isTypeOf(value, 'object') && this.isPrototypeOf(value) ) {
            value = value.value
        }

        var shadowDate = this._super(options)

        value = toDate(value, shadowDate.setToTheFirst)

        var year = value.getFullYear()
        var month = value.getMonth()
        var date = value.getDate()
        var time = value.getTime()

        _.define(shadowDate, 'value', [year, month, date])
        _.define(shadowDate, 'decade', getDecade(year))
        _.define(shadowDate, 'year', year)
        _.define(shadowDate, 'month', month)
        _.define(shadowDate, 'date', date)
        _.define(shadowDate, 'time', time)

        return shadowDate
    },


    /**
     * Compare the date’s value in various ways.
     */
    compare: function(comparison, date) {

        if ( arguments.length < 2 ) {
            date = comparison
            comparison = ''
        }

        comparison = comparison || 'time'


        if ( !this.value || !date ) {
            return false
        }

        if ( !shadow.Date.isClassOf(date) ) {
            date = shadow.Date.create(date)
        }

        var one = this
        var two = date

        if ( comparison.match(/^decade ?/) ) {
            one = one.decade.start
            two = two.decade.start
        }
        else if ( comparison.match(/^year ?/) ) {
            one = one.year
            two = two.year
        }
        else if ( comparison.match(/^month ?/) ) {
            one = new Date(one.year, one.month, 1).getTime()
            two = new Date(two.year, two.month, 1).getTime()
        }
        else if ( comparison.match(/^date ?/) ) {
            one = new Date(one.year, one.month, one.date).getTime()
            two = new Date(two.year, two.month, two.date).getTime()
        }
        else {
            one = one.time
            two = two.time
        }

        if ( comparison.match(/ ?greater equal$/) ) {
            return one >= two
        }
        if ( comparison.match(/ ?lesser equal$/) ) {
            return one <= two
        }
        if ( comparison.match(/ ?greater$/) ) {
            return one > two
        }
        if ( comparison.match(/ ?lesser$/) ) {
            return one < two
        }
        return one === two
    },


    /**
     * Compare a date with a range in various ways.
     */
    compareRange: function(comparison, range) {

        if ( arguments.length < 2 ) {
            range = comparison
            comparison = ''
        }

        var shadowDate = this

        if ( !range.length || !shadowDate.value ) {
            return false
        }

        comparison = comparison || 'date'

        if ( range.length === 1 ) {
            return shadowDate.compare(comparison, range[0])
        }

        if ( range.length > 2 ) {
            throw new Error('A range cannot have more than 2 dates.')
        }

        var lowerBound = range[0]
        var upperBound = range[1]

        return shadowDate.compare(comparison + ' greater equal', lowerBound) &&
            shadowDate.compare(comparison + ' lesser equal', upperBound)

    },


    /**
     * Simplify comparison.
     */
    valueOf: function() {
        return this.time
    },


    /**
     * Simplify stringification.
     */
    toJSON: function() {
        return this.value
    }

})


/**
 * Convert a date representation into a date.
 */
function toDate(val, setToTheFirst) {
    if ( Array.isArray(val) ) {
        val = new Date(val[0], val[1], val[2])
    }
    if ( !_.isTypeOf(val, 'date') ) {
        val = new Date(val)
    }
    if ( setToTheFirst ) {
        val.setDate(1)
    }
    val.setHours(0, 0, 0, 0)
    return val
}


/**
 * Get the decade a year belongs to.
 */
function getDecade(year) {
    var offset = year % 10
    year -= offset
    return Object.freeze({
        start: year,
        end: year + (10 - 1),
        toString: function() {
            return this.start + ' - ' + this.end
        }
    })
}

