describe('shadow.Date', function() {

    it('is an instance of the shadow object', function() {
        expect(shadow.Object.isClassOf(shadow.Date)).toBe(true)
        expect(shadow.Date.isInstanceOf(shadow.Object)).toBe(true)
    })


    describe('.create()', function() {

        var date1 = shadow.Date.create([2014, 3, 20])
        var date2 = shadow.Date.create([1969, 9, 13])

        it('sets the value', function() {
            expect(date1.value).toEqual([2014, 3, 20])
            expect(date2.value).toEqual([1969, 9, 13])
        })

        it('sets the decade', function() {
            expect(date1.decade.start).toBe(2010)
            expect(date1.decade.end).toBe(2019)
            expect('' + date1.decade).toBe('2010 - 2019')
            expect(date2.decade.start).toBe(1960)
            expect(date2.decade.end).toBe(1969)
            expect('' + date2.decade).toBe('1960 - 1969')
        })

        it('sets the year', function() {
            expect(date1.year).toBe(2014)
            expect(date2.year).toBe(1969)
        })

        it('sets the month', function() {
            expect(date1.month).toBe(3)
            expect(date2.month).toBe(9)
        })

        it('sets the date', function() {
            expect(date1.date).toBe(20)
            expect(date2.date).toBe(13)
        })

        it('sets the day')

        it('sets the time', function() {
            var date = new Date(2014, 3, 20)
            date.setUTCHours(0,0,0,0)
            expect(date1.time).toBe(date.getTime())
            date = new Date(1969, 9, 13)
            date.setUTCHours(0,0,0,0)
            expect(date2.time).toBe(date.getTime())
        })

        it('sets the timezone offset')

        it('can set the date to the first of the month', function() {
            var dateObj = shadow.Date.create([2013, 4, 19], { setToTheFirst: true })
            expect(dateObj.year).toBe(2013)
            expect(dateObj.month).toBe(4)
            expect(dateObj.date).toBe(1)
        })

        it('creates a shadow date from an array', function() {
            var dateObj = shadow.Date.create([2020, 2, 20])
            expect(dateObj.value).toEqual([2020, 2, 20])
        })

        it('creates a shadow date from a date object', function() {
            var dateObj = shadow.Date.create(new Date(2020, 2, 20))
            expect(dateObj.value).toEqual([2020, 2, 20])
        })

        it('creates a shadow date from a unix timestamp', function() {
            var dateObj = shadow.Date.create(new Date(2020, 2, 20).getTime())
            expect(dateObj.value).toEqual([2020, 2, 20])
        })

        it('creates a shadow date from an iso 8601 timestamp', function() {
            var dateObj = shadow.Date.create('2014-08-05T05:36:59.595Z')
            expect(dateObj.value).toEqual([2014, 7, 05])
        })
    })


    describe('.compare()', function() {

        it('compares a date’s value with another', function() {
            var equality
            equality = shadow.Date.create(new Date(2014, 4, 4)).compare(new Date(2014, 4, 4))
            expect(equality).toBe(true)
            equality = shadow.Date.create(new Date(2013, 4, 4)).compare(new Date(2014, 4, 4))
            expect(equality).toBe(false)
            equality = shadow.Date.create([2014, 4, 4]).compare([2014, 4, 4])
            expect(equality).toBe(true)
            equality = shadow.Date.create([2013, 4, 4]).compare([2014, 4, 4])
            expect(equality).toBe(false)
            var dateTime = new Date(2014, 4, 4).getTime()
            equality = shadow.Date.create([2014, 4, 4]).compare(dateTime)
            expect(equality).toBe(true)
            dateTime = new Date(2014, 4, 5).getTime()
            equality = shadow.Date.create([2013, 4, 4]).compare(dateTime)
            expect(equality).toBe(false)
        })

        it('compares a date’s value as greater than another', function() {
            var equality
            equality = shadow.Date.create([2014, 4, 4]).compare('greater', new Date(2014, 4, 1))
            expect(equality).toBe(true)
            equality = shadow.Date.create([2013, 4, 4]).compare('greater', new Date(2014, 4, 14))
            expect(equality).toBe(false)
            equality = shadow.Date.create([2014, 4, 4]).compare('greater', [2014, 4, 1])
            expect(equality).toBe(true)
            equality = shadow.Date.create([2013, 4, 4]).compare('greater', [2014, 4, 14])
            expect(equality).toBe(false)
            var dateTime = new Date(2014, 4, 3).getTime()
            equality = shadow.Date.create([2014, 4, 4]).compare('greater', dateTime)
            expect(equality).toBe(true)
            dateTime = new Date(2014, 4, 5).getTime()
            equality = shadow.Date.create([2013, 4, 4]).compare('greater', 1400040000000)
            expect(equality).toBe(false)
        })

        it('compares a date’s value as lesser than another', function() {
            var equality
            equality = shadow.Date.create([2014, 4, 4]).compare('lesser', new Date(2014, 4, 1))
            expect(equality).toBe(false)
            equality = shadow.Date.create([2013, 4, 4]).compare('lesser', new Date(2014, 4, 14))
            expect(equality).toBe(true)
            equality = shadow.Date.create([2014, 4, 4]).compare('lesser', [2014, 4, 1])
            expect(equality).toBe(false)
            equality = shadow.Date.create([2013, 4, 4]).compare('lesser', [2014, 4, 14])
            expect(equality).toBe(true)
            var dateTime = new Date(2013, 4, 2).getTime()
            equality = shadow.Date.create([2014, 4, 4]).compare('lesser', dateTime)
            expect(equality).toBe(false)
            dateTime = new Date(2014, 4, 3).getTime()
            equality = shadow.Date.create([2013, 4, 4]).compare('lesser', dateTime)
            expect(equality).toBe(true)
        })

        it('compares a date’s month as equal to another’s', function() {
            var equality
            equality = shadow.Date.create([2014, 4, 4]).compare('month', new Date(2014, 4, 25))
            expect(equality).toBe(true)
            equality = shadow.Date.create([2014, 4, 4]).compare('month', new Date(2018, 4, 25))
            expect(equality).toBe(false)
            equality = shadow.Date.create([2014, 4, 4]).compare('month', [2014, 4, 25])
            expect(equality).toBe(true)
            equality = shadow.Date.create([2014, 4, 4]).compare('month', [2018, 4, 25])
            expect(equality).toBe(false)
            var dateTime = new Date(2014, 4, 4).getTime()
            equality = shadow.Date.create([2014, 4, 4]).compare('month', dateTime)
            expect(equality).toBe(true)
            dateTime = new Date(2014, 5, 4).getTime()
            equality = shadow.Date.create([2014, 4, 4]).compare('month', dateTime)
            expect(equality).toBe(false)
        })

        it('compares a date’s month as greater than another’s', function() {
            var equality
            equality = shadow.Date.create([2018, 2, 4]).compare('month greater', new Date(2014, 4, 25))
            expect(equality).toBe(true)
            equality = shadow.Date.create([2014, 4, 4]).compare('month greater', new Date(2018, 2, 25))
            expect(equality).toBe(false)
            equality = shadow.Date.create([2018, 2, 4]).compare('month greater', [2014, 4, 25])
            expect(equality).toBe(true)
            equality = shadow.Date.create([2014, 4, 4]).compare('month greater', [2018, 2, 25])
            expect(equality).toBe(false)
            var dateTime = new Date(2014, 4, 4).getTime()
            equality = shadow.Date.create([2018, 2, 4]).compare('month greater', dateTime)
            expect(equality).toBe(true)
            dateTime = new Date(2014, 4, 4).getTime()
            equality = shadow.Date.create([2014, 4, 4]).compare('month greater', dateTime)
            expect(equality).toBe(false)
        })

        it('compares a date’s month as lesser than another’s', function() {
            var equality
            equality = shadow.Date.create([2018, 2, 4]).compare('month lesser', new Date(2014, 4, 25))
            expect(equality).toBe(false)
            equality = shadow.Date.create([2014, 4, 4]).compare('month lesser', new Date(2018, 2, 25))
            expect(equality).toBe(true)
            equality = shadow.Date.create([2018, 2, 4]).compare('month lesser', [2014, 4, 25])
            expect(equality).toBe(false)
            equality = shadow.Date.create([2014, 4, 4]).compare('month lesser', [2018, 2, 25])
            expect(equality).toBe(true)
            var dateTime = new Date(2014, 4, 3).getTime()
            equality = shadow.Date.create([2018, 2, 4]).compare('month lesser', dateTime)
            expect(equality).toBe(false)
            dateTime = new Date(2018, 6, 4).getTime()
            equality = shadow.Date.create([2014, 4, 4]).compare('month lesser', dateTime)
            expect(equality).toBe(true)
        })

        it('compares two dates with equal years', function() {
            var equality
            equality = shadow.Date.create([2014, 2, 4]).compare('year', new Date(2014, 4, 25))
            expect(equality).toBe(true)
            equality = shadow.Date.create([2014, 2, 4]).compare('year', new Date(2018, 4, 25))
            expect(equality).toBe(false)
            equality = shadow.Date.create([2014, 2, 4]).compare('year', [2014, 4, 25])
            expect(equality).toBe(true)
            equality = shadow.Date.create([2014, 2, 4]).compare('year', [2018, 4, 25])
            expect(equality).toBe(false)
            var dateTime = new Date(2014, 1, 5).getTime()
            equality = shadow.Date.create([2014, 2, 4]).compare('year', dateTime)
            expect(equality).toBe(true)
            dateTime = new Date(2013, 4, 4).getTime()
            equality = shadow.Date.create([2014, 4, 4]).compare('year', dateTime)
            expect(equality).toBe(false)
        })

        it('compares two dates with the first’s year being greater', function() {
            var equality
            equality = shadow.Date.create([2018, 2, 4]).compare('year greater', new Date(2014, 4, 25))
            expect(equality).toBe(true)
            equality = shadow.Date.create([2014, 4, 4]).compare('year greater', new Date(2018, 2, 25))
            expect(equality).toBe(false)
            equality = shadow.Date.create([2018, 2, 4]).compare('year greater', [2014, 4, 25])
            expect(equality).toBe(true)
            equality = shadow.Date.create([2014, 4, 4]).compare('year greater', [2018, 2, 25])
            expect(equality).toBe(false)
            var dateTime = new Date(2014, 2, 4).getTime()
            equality = shadow.Date.create([2018, 2, 4]).compare('year greater', dateTime)
            expect(equality).toBe(true)
            dateTime = new Date(2014, 4, 4).getTime()
            equality = shadow.Date.create([2014, 4, 4]).compare('year greater', dateTime)
            expect(equality).toBe(false)
        })

        it('compares two dates with the first’s year being lesser', function() {
            var equality
            equality = shadow.Date.create([2018, 2, 4]).compare('year lesser', new Date(2014, 4, 25))
            expect(equality).toBe(false)
            equality = shadow.Date.create([2014, 4, 4]).compare('year lesser', new Date(2018, 2, 25))
            expect(equality).toBe(true)
            equality = shadow.Date.create([2018, 2, 4]).compare('year lesser', [2014, 4, 25])
            expect(equality).toBe(false)
            equality = shadow.Date.create([2014, 4, 4]).compare('year lesser', [2018, 2, 25])
            expect(equality).toBe(true)
            var dateTime = new Date(2014, 2, 4).getTime()
            equality = shadow.Date.create([2018, 2, 4]).compare('year lesser', dateTime)
            expect(equality).toBe(false)
            dateTime = new Date(2018, 4, 4).getTime()
            equality = shadow.Date.create([2014, 4, 4]).compare('year lesser', dateTime)
            expect(equality).toBe(true)
        })

        it('compares two dates with equal decades', function() {
            var equality
            equality = shadow.Date.create([2014, 2, 4]).compare('decade', new Date(2018, 4, 25))
            expect(equality).toBe(true)
            equality = shadow.Date.create([2014, 2, 4]).compare('decade', new Date(2008, 4, 25))
            expect(equality).toBe(false)
            equality = shadow.Date.create([2014, 2, 4]).compare('decade', [2018, 4, 25])
            expect(equality).toBe(true)
            equality = shadow.Date.create([2014, 2, 4]).compare('decade', [2008, 4, 25])
            expect(equality).toBe(false)
            equality = shadow.Date.create([2014, 2, 4]).compare('decade', 1527220800000)
            expect(equality).toBe(true)
            equality = shadow.Date.create([2014, 4, 4]).compare('decade', 1211688000000)
            expect(equality).toBe(false)
        })

        it('compares two dates with the first’s decade being greater', function() {
            var equality
            equality = shadow.Date.create([2018, 2, 4]).compare('decade greater', new Date(2004, 4, 25))
            expect(equality).toBe(true)
            equality = shadow.Date.create([2014, 4, 4]).compare('decade greater', new Date(2018, 2, 25))
            expect(equality).toBe(false)
            equality = shadow.Date.create([2018, 2, 4]).compare('decade greater', [2004, 4, 25])
            expect(equality).toBe(true)
            equality = shadow.Date.create([2018, 4, 4]).compare('decade greater', [2014, 2, 25])
            expect(equality).toBe(false)
            var dateTime = new Date(2004, 2, 4).getTime()
            equality = shadow.Date.create([2018, 2, 4]).compare('decade greater', dateTime)
            expect(equality).toBe(true)
            dateTime = new Date(2018, 4, 4).getTime()
            equality = shadow.Date.create([2014, 4, 4]).compare('decade greater', dateTime)
            expect(equality).toBe(false)
        })

        it('compares two dates with the first’s decade being lesser', function() {
            var equality
            equality = shadow.Date.create([2018, 2, 4]).compare('decade lesser', new Date(2004, 4, 25))
            expect(equality).toBe(false)
            equality = shadow.Date.create([2004, 4, 4]).compare('decade lesser', new Date(2018, 2, 25))
            expect(equality).toBe(true)
            equality = shadow.Date.create([2018, 2, 4]).compare('decade lesser', [2004, 4, 25])
            expect(equality).toBe(false)
            equality = shadow.Date.create([2008, 4, 4]).compare('decade lesser', [2014, 2, 25])
            expect(equality).toBe(true)
            var dateTime = new Date(2014, 2, 4).getTime()
            equality = shadow.Date.create([2018, 2, 4]).compare('decade lesser', dateTime)
            expect(equality).toBe(false)
            dateTime = new Date(2014, 4, 4).getTime()
            equality = shadow.Date.create([2004, 4, 4]).compare('decade lesser', dateTime)
            expect(equality).toBe(true)
        })
    })


    describe('.compareRange()', function() {

        var date = shadow.Date.create([2014, 3, 20])

        it('compares a date as contained within a range', function() {
            expect(date.compareRange([[2013, 2, 4], [2015, 5, 10]])).toBe(true)
            expect(date.compareRange([[2015, 2, 4], [2015, 5, 10]])).toBe(false)
        })

        it('compares a date’s month as contained within a range', function() {
            expect(date.compareRange('month', [[2014, 3, 21], [2015, 5, 10]])).toBe(true)
            expect(date.compareRange('month', [[2013, 3, 21], [2014, 3, 7]])).toBe(true)
            expect(date.compareRange('month', [[2014, 4, 21], [2015, 5, 10]])).toBe(false)
        })

        it('compares a date’s year as contained within a range', function() {
            expect(date.compareRange('year', [[2014, 6, 22], [2015, 5, 10]])).toBe(true)
            expect(date.compareRange('year', [[2012, 6, 22], [2014, 1, 10]])).toBe(true)
            expect(date.compareRange('year', [[2015, 6, 21], [2017, 5, 10]])).toBe(false)
        })

        it('compares a date’s decade as contained within a range', function() {
            expect(date.compareRange('decade', [[2009, 6, 22], [2012, 5, 10]])).toBe(true)
            expect(date.compareRange('decade', [[2019, 6, 22], [2022, 1, 10]])).toBe(true)
            expect(date.compareRange('decade', [[2008, 6, 21], [2009, 5, 10]])).toBe(false)
        })
    })


    describe('.valueOf()', function() {

        it('returns the time of the date', function() {
            var date = new Date(2013, 3, 20)
            date.setUTCHours(0,0,0,0)
            var shadowDate = shadow.Date.create([2013, 3, 20])
            expect(shadowDate.valueOf()).toBe(date.getTime())
            expect(shadowDate.time).toBe(date.getTime())
        })

        it('allows for easy comparison of dates', function() {

            var one = shadow.Date.create([2014, 3, 20])
            var two = shadow.Date.create([2013, 3, 20])
            expect(one > two).toBe(true)

            one = shadow.Date.create([2012, 3, 20])
            two = shadow.Date.create([2013, 3, 20])
            expect(one > two).toBe(false)

            one = shadow.Date.create([2013, 3, 20])
            two = shadow.Date.create([2013, 3, 20])
            expect(Number(one) === Number(two)).toBe(true)

            one = shadow.Date.create([2013, 3, 19])
            two = shadow.Date.create([2013, 3, 20])
            expect(Number(one) === Number(two)).toBe(false)
        })
    })


    describe('.toJSON()', function() {

        var date = new Date(2013, 3, 20)
        var dateArray = [date.getFullYear(), date.getMonth(), date.getDate()]
        var shadowDate = shadow.Date.create([2013, 3, 20])

        it('returns the value of the date', function() {
            expect(shadowDate.toJSON()).toEqual(dateArray)
            expect(shadowDate.value).toEqual(dateArray)
        })

        it('allows for easy stringification of a date', function() {
            var dateString = JSON.stringify(dateArray)
            expect(JSON.stringify(shadowDate)).toEqual(dateString)
            expect(JSON.stringify(shadowDate.value)).toEqual(dateString)
        })
    })

})
