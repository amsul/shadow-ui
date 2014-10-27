
/**
 * Construct a shadow date object.
 *
 * @static
 * @class shadow.Date
 * @extends shadow.Object
 */
shadow.Object.extend({

    name: 'Date',


    /**
     * The value of the date represented as an array.
     *
     * ```javascript
     * var date = shadow.Date.create(new Date(2013, 3, 20))
     * date.value
     * // returns [2013, 3, 20]
     * ```
     *
     * @readOnly
     * @property value
     * @type {Array}
     * @default null
     */
    value: null,


    /**
     * The year of the shadow date object.
     *
     * @readOnly
     * @property year
     * @type {Number}
     * @default null
     */
    year: null,


    /**
     * The month of the shadow date object.
     *
     * @readOnly
     * @property month
     * @type {Number}
     * @default null
     */
    month: null,


    /**
     * The date of the shadow date object.
     *
     * @readOnly
     * @property date
     * @type {Number}
     * @default null
     */
    date: null,


    /**
     * A flag to set the date to the first of the month upon creation.
     *
     * ```javascript
     * shadow.Date.create([2013, 3, 20], {
     *     setToTheFirst: true
     * })
     * // returns { year: 2013, month: 3, date: 1, ... }
     * ```
     *
     * @writeOnce
     * @property setToTheFirst
     * @type {Boolean}
     * @default false
     */
    setToTheFirst: false,


    /**
     * Create an instance of a shadow date by passing a date value representation.
     *
     * @example
     *
     * The value as an array:
     *
     * ```javascript
     * shadow.Date.create([2014, 3, 20])
     * // returns { year: 2014, month: 3, date: 20, ... }
     * ```
     *
     * The value as a JavaScript date object:
     *
     * ```javascript
     * shadow.Date.create(new Date(2014, 3, 20))
     * // returns { year: 2014, month: 3, date: 20, ... }
     * ```
     *
     * The value as a UNIX time stamp:
     *
     * ```javascript
     * shadow.Date.create(1397966400000)
     * // returns { year: 2014, month: 3, date: 20, ... }
     * ```
     *
     * The value as an ISO string:
     *
     * ```javascript
     * shadow.Date.create('2014-04-20T16:20:00.000Z')
     * // returns { year: 2014, month: 3, date: 20, ... }
     * ```
     *
     * @static
     * @method create
     * @param {Array|String|Number|Date|shadow.Date} value The value of the date to create.
     * @param {Object} [options] Options for the date’s prototype.
     * @return {shadow.Date} An instance of the shadow date.
     */
    create: function(value, options) {

        if ( !value ) {
            return this._super()
        }

        if ( value === true ) {
            value = new Date()
        }
        else if ( _.isTypeOf(value, 'object') && this.isPrototypeOf(value) ) {
            value = value.value
        }

        var shadowDate = this._super(options)

        value = toDate(value, shadowDate.setToTheFirst)

        var year = value.getUTCFullYear()
        var month = value.getUTCMonth()
        var date = value.getUTCDate()
        var day = value.getUTCDay()
        var time = value.getTime()
        var offset = value.getTimezoneOffset() * 60 * 1000

        _.define(shadowDate, 'value', [year, month, date])
        _.define(shadowDate, 'decade', getDecade(year))
        _.define(shadowDate, 'year', year)
        _.define(shadowDate, 'month', month)
        _.define(shadowDate, 'date', date)
        _.define(shadowDate, 'day', day)
        _.define(shadowDate, 'time', time)
        _.define(shadowDate, 'offset', offset)

        return shadowDate
    },


    /**
     * Compare the shadow date’s value with another date.
     *
     * @example
     *
     * Given the following two dates:
     *
     * ```javascript
     * var one = shadow.Date.create([2013, 3, 20])
     * var two = new Date(2014, 3, 20)
     * ```
     *
     * ...we can compare them in various ways (all the following conditions resolve to `true`):
     *
     * ```javascript
     * // Compare the two for equality
     * one.compare(two) == false
     *
     * // Compare the first as being greater than the second
     * one.compare('greater', two) == false
     *
     * // Compare the first as being lesser than the second
     * one.compare('lesser', two) == true
     * ```
     *
     * ...or we can scope the comparison to time units:
     *
     * ```javascript
     * // Compare the months
     * one.compare('month', two) == false
     * one.compare('month greater', two) == false
     * one.compare('month lesser', two) == true
     *
     * // Compare the years
     * one.compare('year', two) == false
     * one.compare('year greater', two) == false
     * one.compare('year lesser', two) == true
     *
     * // Compare the decade
     * one.compare('decade', two) == true
     * one.compare('decade greater', two) == false
     * one.compare('decade lesser', two) == false
     * ```
     *
     * @method compare
     * @param {String} [comparison='time'] A comparison scope. Valid values are:
     *
     * - `date`
     * - `date greater`
     * - `date lesser`
     * - `date greater equal`
     * - `date lesser equal`
     * - `month`
     * - `month greater`
     * - `month lesser`
     * - `month greater equal`
     * - `month lesser equal`
     * - `year`
     * - `year greater`
     * - `year lesser`
     * - `year greater equal`
     * - `year lesser equal`
     * - `decade`
     * - `decade greater`
     * - `decade lesser`
     * - `decade greater equal`
     * - `decade lesser equal`
     *
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
     * Compare a date with a range to see if it falls within the bounds
     * of the range in various different comparison scopes.
     *
     * @example
     *
     * Given the following date and range:
     *
     * ```javascript
     * var date = shadow.Date.create([2014, 3, 20])
     * var range = [new Date(2014, 4, 27), [2015, 2, 4]]
     * ```
     *
     * ...we can compare them in various ways (all the following conditions resolve to `true`):
     *
     * ```javascript
     * date.compareRange(range) == false
     * date.compareRange('month', range) == false
     * date.compareRange('year', range) == true
     * date.compareRange('decade', range) == true
     * ```
     *
     * @method compareRange
     * @param {String} [comparison='date'] A comparison scope. Valid values are:
     *
     * - `date`
     * - `month`
     * - `year`
     * - `decade`
     *
     * @param {Array} range The range to compare against.
     * @return {Boolean}
     */
    compareRange: function(comparison, range) {

        if ( arguments.length < 2 ) {
            range = comparison
            comparison = ''
        }

        if ( !Array.isArray(range) ) {
            throw new Error('A range must be an array.')
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
     * Get the date’s time value.
     *
     * @example
     *
     * ```javascript
     * shadow.Date.create([2013, 3, 20]).valueOf()
     * // returns 1366430400000
     * ```
     *
     * This allows for easy comparison of dates.
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
     * @return {Number} The time of the date.
     */
    valueOf: function() {
        return this.time
    },


    /**
     * Simplify stringification of the shadow date.
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
    else {
        val = new Date(val)
    }
    if ( setToTheFirst ) {
        val.setDate(1)
    }
    var date = new Date()
    date.setUTCFullYear(val.getFullYear())
    date.setUTCMonth(val.getMonth())
    date.setUTCDate(val.getDate())
    date.setUTCHours(val.getTimezoneOffset() / 60, val.getTimezoneOffset() % 60, 0, 0)
    return date
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

