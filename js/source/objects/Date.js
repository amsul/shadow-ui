
/**
 * Construct a shadow date object.
 *
 * @class shadow.Date
 * @extends shadow.Object
 * @static
 */
shadow.Object.extend({

    name: 'Date',


    /**
     * The value of the date represented as an array.
     *
     * @example
     *
     * ```javascript
     * var date = shadow.Date.create(new Date(2013, 3, 20))
     * date.value
     * // returns [2013, 3, 20]
     * ```
     *
     * @attribute value
     * @type {Array}
     * @default null
     * @readOnly
     */
    value: null,


    /**
     * The year of the shadow date object.
     *
     * @attribute year
     * @type {Number}
     * @default null
     * @readOnly
     */
    year: null,


    /**
     * The month of the shadow date object.
     *
     * @attribute month
     * @type {Number}
     * @default null
     * @readOnly
     */
    month: null,


    /**
     * The date of the shadow date object.
     *
     * @attribute date
     * @type {Number}
     * @default null
     * @readOnly
     */
    date: null,


    /**
     * A flag to set the date to the first of the month upon creation.
     *
     * @example
     *
     * ```javascript
     * var date = shadow.Date.create([2013, 3, 20], {
     *     setToTheFirst: true
     * })
     * date.value
     * // returns [2013, 3, 1]
     * ```
     *
     * @attribute setToTheFirst
     * @type {Boolean}
     * @default false
     */
    setToTheFirst: false,


    /**
     * Create an instance of a shadow date.
     *
     * @method create
     * @param {Array|String|Number|Date|shadow.Date} value The value of the date to create.
     * @param {Object} options Options for the date’s prototype.
     * @return {shadow.Date} An instance of the shadow date.
     * @static
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
     * Extend the shadow date.
     *
     * @method extend
     * @param {Object} options Options to extend the date’s prototype.
     * @return {shadow.Date} An extension of the shadow date class.
     * @static
     */


    /**
     * Compare the shadow date’s value with another date.
     *
     * @method compare
     * @param {String} [comparison] A “scope” to compare within.
     * @param {Array|String|Number|Date|shadow.Date} date The value of the date to compare against.
     * @return {Boolean}
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
     *
     * @method compareRange
     * @param {String} [comparison] A “scope” to compare within.
     * @param {Array} range The range to compare against.
     * @return {Boolean}
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
     * Simplify comparison of dates.
     *
     * @example
     *
     * ```javascript
     * shadow.Date.create([2013, 3, 20]) > shadow.Date.create([2014, 8, 14])
     * // returns false
     *
     * shadow.Date.create([2013, 3, 20]) < shadow.Date.create([2014, 8, 14])
     * // returns true
     * ```
     *
     * @method valueOf
     * @return {Number} The time of the date to make comparisons easier.
     */
    valueOf: function() {
        return this.time
    },


    /**
     * Simplify stringification of the shadow date.
     *
     * @example
     *
     * ```javascript
     * var date = shadow.Date.create([2013, 3, 20])
     * JSON.stringify(date)
     * // returns "[2013,3,20]"
     * ```
     *
     * @method toJSON
     * @return {Array} The value of the date.
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

