describe('shadow.Pickadate', function() {

    it('is an instance of the shadow picker', function() {
        expect(shadow.Picker.is('classOf', shadow.Pickadate)).toBe(true)
        expect(shadow.Pickadate.is('instanceOf', shadow.Picker)).toBe(true)
    })


    describe('.setup()', function() {

        var pickadate = shadow.Pickadate.create({
            $el: $('<div />')
        })

        var today = new Date()
        today = [today.getFullYear(), today.getMonth(), today.getDate()]

        it('sets up the date today', function() {
            expect(pickadate.attrs.today).toEqual(today)
        })

        it('sets up the highlight based on today', function() {
            expect(pickadate.attrs.highlight).toEqual(today)
        })

        it('sets up the view based on the highlight', function() {
            var view = [today[0], today[1], 1]
            expect(pickadate.attrs.view).toEqual(view)
        })

        it('binds updates to the view to the correct date', function() {
            var pickadate = shadow.Pickadate.create({
                $el: $('<div />')
            })
            pickadate.attrs.view = [2014, 3, 20]
            expect(pickadate.attrs.view[2]).toBe(1)
        })

        it('binds updates to the highlight to cascade to update the view', function() {
            var pickadate = shadow.Pickadate.create({
                $el: $('<div />')
            })
            var view = [2013, 3, 1]
            expect(pickadate.attrs.view).not.toEqual(view)
            pickadate.attrs.highlight = [2013, 3, 20]
            expect(pickadate.attrs.view).toEqual(view)
        })

        it('binds updates to the select to cascade to update the highlight', function() {
            var pickadate = shadow.Pickadate.create({
                $el: $('<div />')
            })
            var date = [2013, 3, 20]
            expect(pickadate.attrs.highlight).not.toEqual(date)
            pickadate.attrs.select = date
            expect(pickadate.attrs.highlight).toEqual(date)
        })

        it('binds updates to the select to cascade to update the value', function() {
            var pickadate = shadow.Pickadate.create({
                $el: $('<div />')
            })
            var date = [2013, 3, 20]
            expect(pickadate.attrs.value).toBe(null)
            pickadate.attrs.select = date
            expect(pickadate.attrs.value).toEqual('20 April, 2013')
            pickadate.attrs.select = null
            expect(pickadate.attrs.value).toBe('')
        })
    })


    describe('.createHeader()', function() {

        var pickadate = shadow.Pickadate.create({
            $el: $('<div />')
        })
        var attrs = pickadate.attrs
        var classes = pickadate.classNames

        it('creates a header container element with a month and year label', function() {
            var header = pickadate.createHeader(2014, 3)
            expect(header.innerText).toMatch(/April/)
            expect(header.innerText).toMatch(/2014/)
            var buttons = header.querySelectorAll('button')
            expect(buttons.length).toBe(2)
        })

        it('binds click events to the nav buttons to update the highlight', function() {

            var currentHighlight = attrs.highlight
            var classPrev = '.' + classes.navPrev.split(' ').join('.')
            var classNext = '.' + classes.navNext.split(' ').join('.')

            pickadate.$el.find(classPrev).trigger('click')
            currentHighlight[1] -= 1
            expect(attrs.highlight).toEqual(currentHighlight)

            pickadate.$el.find(classPrev).trigger('click')
            currentHighlight[1] -= 1
            expect(attrs.highlight).toEqual(currentHighlight)

            pickadate.$el.find(classNext).trigger('click')
            currentHighlight[1] += 1
            expect(attrs.highlight).toEqual(currentHighlight)

            pickadate.$el.find(classNext).trigger('click')
            currentHighlight[1] += 1
            expect(attrs.highlight).toEqual(currentHighlight)
        })

        it('binds updates to the highlight to update the month and year labels', function() {
            var getMonthAndYear = function() {
                return pickadate.$el.find('.' + classes.month).text() +
                    ' ' + pickadate.$el.find('.' + classes.year).text()
            }
            expect(getMonthAndYear()).not.toBe('April 2013')
            pickadate.attrs.highlight = [2013, 3, 20]
            expect(getMonthAndYear()).toBe('April 2013')
        })
    })


    describe('.createHeaderYear()', function() {

        it('creates a year label, given a year', function() {
            var pickadate = shadow.Pickadate.create({
                $el: $('<div />')
            })
            var headerYear = pickadate.createHeaderYear(2013)
            expect(headerYear.innerText).toBe('2013')
        })
    })


    describe('.createHeaderMonth()', function() {

        it('creates a month label, given a month', function() {
            var pickadate = shadow.Pickadate.create({
                $el: $('<div />')
            })
            var headerMonth = pickadate.createHeaderMonth(3)
            expect(headerMonth.innerText).toBe('April')
        })
    })


    describe('.createFooter()', function() {

        var pickadate = shadow.Pickadate.create({
            $el: $('<div />')
        })
        var attrs = pickadate.attrs
        var classes = pickadate.classNames

        it('creates a footer container element with a “today” and “clear” button', function() {
            var footer = pickadate.createFooter()
            var buttons = footer.querySelectorAll('button')
            expect(buttons.length).toBe(2)
        })

        it('binds click events to the today button to update the selection', function() {
            var classToday = '.' + classes.buttonToday.split(' ').join('.')
            var $today = pickadate.$el.find(classToday)
            expect(attrs.select).not.toEqual(attrs.today)
            $today.trigger('click')
            expect(attrs.select).toEqual(attrs.today)
        })

        it('binds click events to the clear button to remove the selection', function() {
            var classClear = '.' + classes.buttonClear.split(' ').join('.')
            var $clear = pickadate.$el.find(classClear)
            expect(attrs.select).toEqual(attrs.today)
            $clear.trigger('click')
            expect(attrs.select).toBe(null)
        })
    })


    describe('.createDay()', function() {

        var pickadate = shadow.Pickadate.create({
            $el: $('<div />')
        })
        var attrs = pickadate.attrs
        var classes = pickadate.classNames

        it('creates a container for a day, given a year, month, and day', function() {
            var dayNode = pickadate.createDay(2013, 3, 20)
            expect(dayNode.innerText).toBe('20')
            var date = new Date(2013, 3, 20)
            expect(dayNode.innerHTML).toMatch(new RegExp(date.getTime()))
        })

        it('adds the today class if the day is today', function() {

            var dayNode = pickadate.createDay(2013, 3, 20)
            expect(dayNode.querySelector('.' + classes.today)).toBe(null)

            var today = attrs.today
            dayNode = pickadate.createDay(today[0], today[1], today[2])
            expect(dayNode.querySelector('.' + classes.today)).not.toBe(null)
        })

        it('adds the highlighted class if the day is highlighted', function() {

            var dayNode = pickadate.createDay(2013, 3, 20)
            expect(dayNode.querySelector('.' + classes.highlighted)).toBe(null)

            attrs.highlight = [2013, 3, 20]
            dayNode = pickadate.createDay(2013, 3, 20)
            expect(dayNode.querySelector('.' + classes.highlighted)).not.toBe(null)
        })

        it('adds the selected class if the day is selected', function() {

            var dayNode = pickadate.createDay(2013, 3, 20)
            expect(dayNode.querySelector('.' + classes.selected)).toBe(null)

            attrs.select = new Date(2013, 3, 20)
            dayNode = pickadate.createDay(2013, 3, 20)
            expect(dayNode.querySelector('.' + classes.selected)).not.toBe(null)
        })
    })


    describe('.createWeek()', function() {

        it('creates a container for a week, given a year, month, and week', function() {
            var pickadate = shadow.Pickadate.create({
                $el: $('<div />')
            })
            var week = pickadate.createWeek(2013, 2, 2)
            expect(week.innerText).toBe([10, 11, 12, 13, 14, 15, 16].join(''))
            week = pickadate.createWeek(2013, 2, 0)
            expect(week.innerText).toBe([24, 25, 26, 27, 28, 1, 2].join(''))
            week = pickadate.createWeek(2013, 2, 5)
            expect(week.innerText).toBe([31, 1, 2, 3, 4, 5, 6].join(''))
        })
    })


    describe('.createMonth()', function() {

        it('creates a container for a month, given a year and month', function() {
            var pickadate = shadow.Pickadate.create({
                $el: $('<div />')
            })
            var month = pickadate.createMonth(2013, 3)
            expect(month.nodeName).toBe('#document-fragment')
            expect(month.childNodes.length).toBe(6)
            expect(month.textContent).toBe([
                [31, 1, 2, 3, 4, 5, 6].join(''),
                [7, 8, 9, 10, 11, 12, 13].join(''),
                [14, 15, 16, 17, 18, 19, 20].join(''),
                [21, 22, 23, 24, 25, 26, 27].join(''),
                [28, 29, 30, 1, 2, 3, 4].join(''),
                [5, 6, 7, 8, 9, 10, 11].join('')
            ].join(''))
        })
    })


    describe('.createGrid()', function() {

        it('creates a grid container', function() {
            var pickadate = shadow.Pickadate.create({
                $el: $('<div />')
            })
            var grid = pickadate.createGrid()
            expect(grid.className).toBe(pickadate.classNames.grid)
        })
    })


    describe('.createGridHead()', function() {

        it('creates a grid head container with the weekdays', function() {
            var pickadate = shadow.Pickadate.create({
                $el: $('<div />')
            })
            var gridHead = pickadate.createGridHead()
            expect(gridHead.innerText).toBe(
                ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].join('')
            )
        })
    })


    describe('.createGridBody()', function() {

        it('creates a grid body container with the month, given a year and month', function() {
            var pickadate = shadow.Pickadate.create({
                $el: $('<div />')
            })
            var gridBody = pickadate.createGridBody(2013, 3)
            expect(gridBody.nodeName).toBe('TBODY')
            expect(gridBody.childNodes.length).toBe(6)
            expect(gridBody.textContent).toBe([
                [31, 1, 2, 3, 4, 5, 6].join(''),
                [7, 8, 9, 10, 11, 12, 13].join(''),
                [14, 15, 16, 17, 18, 19, 20].join(''),
                [21, 22, 23, 24, 25, 26, 27].join(''),
                [28, 29, 30, 1, 2, 3, 4].join(''),
                [5, 6, 7, 8, 9, 10, 11].join('')
            ].join(''))
        })
    })


    describe('.template()', function() {

        it('builds out the pickadate’s template', function() {
            var $div = $('<div />')
            expect($div.html()).toBe('')
            shadow.Pickadate.create({
                $el: $div
            })
            expect($div.innerText).not.toBe('')
        })

        it('binds updates to the highlight to re-template the grid body', function() {
            var pickadate = shadow.Pickadate.create({
                $el: $('<div />')
            })
            var $gridBody = pickadate.$el.find('tbody')
            var gridChildren = $gridBody.children().toArray()
            pickadate.attrs.highlight = [2013, 3, 20]
            expect($gridBody.children().toArray()).not.toEqual(gridChildren)
        })

        it('binds a “clearing” update to the select to remove any selections', function() {
            var pickadate = shadow.Pickadate.create({
                $el: $('<div />')
            })
            var $gridBody = pickadate.$el.find('tbody')
            pickadate.attrs.select = new Date(2013, 3, 20)
            var $selected = $gridBody.find('.' + pickadate.classNames.selected)
            expect($selected.length).toBe(1)
            pickadate.attrs.select = null
            $selected = $gridBody.find('.' + pickadate.classNames.selected)
            expect($selected.length).toBe(0)
        })

        it('binds click events to the days to update the select', function() {
            var pickadate = shadow.Pickadate.create({
                $el: $('<div />')
            })
            pickadate.attrs.highlight = [2013, 3, 20]
            var $day = pickadate.$el.find('.' + pickadate.classNames.highlighted)
            expect(pickadate.attrs.select).toBe(null)
            $day.trigger('click')
            expect(pickadate.attrs.select).toEqual(pickadate.attrs.highlight)
        })

    })


    describe('.parse()', function() {
        it('parses dates')
    })


    describe('.attrs', function() {

        describe('.min', function() {
            it('to do')
        })

        describe('.max', function() {
            it('to do')
        })

        describe('.today', function() {

            it('determines the date today', function() {
                var pickadate = shadow.Pickadate.create({
                    $el: $('<div />')
                })
                var today = pickadate.attrs.today
                var $today = pickadate.$el.find('.' + pickadate.classNames.today)
                expect($today.text()).toBe('' + today[2])
            })
        })

        describe('.view', function() {

            it('determines the month in view', function() {

                var pickadate = shadow.Pickadate.create({
                    $el: $('<div />'),
                    attrs: {
                        view: [2013, 2, 4]
                    }
                })
                var attrs = pickadate.attrs
                var classes = pickadate.classNames

                expect(attrs.view).toEqual([2013, 2, 1])
                var $month = pickadate.$el.find('.' + classes.month)
                expect($month.text()).toBe('March')
                var $year = pickadate.$el.find('.' + classes.year)
                expect($year.text()).toBe('2013')
            })

            it('can be updated after creation', function() {

                var pickadate = shadow.Pickadate.create({
                    $el: $('<div />')
                })
                var attrs = pickadate.attrs
                var dict = pickadate.dict
                var classes = pickadate.classNames

                var view = new Date()
                view = [view.getFullYear(), view.getMonth(), 1]
                expect(attrs.view).toEqual(view)
                var $month = pickadate.$el.find('.' + classes.month)
                expect($month.text()).toBe(dict.monthsFull[view[1]])
                var $year = pickadate.$el.find('.' + classes.year)
                expect($year.text()).toBe('' + view[0])
            })
        })

        describe('.highlight', function() {

            it('determines the date highlighted and the month in view', function() {

                var pickadate = shadow.Pickadate.create({
                    $el: $('<div />'),
                    attrs: {
                        highlight: [2013, 2, 4]
                    }
                })
                var attrs = pickadate.attrs
                var classes = pickadate.classNames

                var highlight = pickadate.attrs.highlight
                var $highlight = pickadate.$el.find('.' + classes.highlighted)
                expect($highlight.text()).toBe('' + highlight[2])

                expect(attrs.highlight).toEqual([2013, 2, 4])
                expect(attrs.view).toEqual([2013, 2, 1])
                var $month = pickadate.$el.find('.' + classes.month)
                expect($month.text()).toBe('March')
                var $year = pickadate.$el.find('.' + classes.year)
                expect($year.text()).toBe('2013')
            })

            it('can be updated after creation', function() {

                var pickadate = shadow.Pickadate.create({
                    $el: $('<div />')
                })
                var attrs = pickadate.attrs
                var classes = pickadate.classNames

                attrs.highlight = [2013, 2, 4]

                var $highlight = pickadate.$el.find('.' + classes.highlighted)
                expect($highlight.text()).toBe('4')
                var $month = pickadate.$el.find('.' + classes.month)
                expect($month.text()).toBe('March')
                var $year = pickadate.$el.find('.' + classes.year)
                expect($year.text()).toBe('2013')
            })
        })

        describe('.select', function() {

            it('determines the date selected, the date highlighted, and the month in view', function() {

                var pickadate = shadow.Pickadate.create({
                    $el: $('<div />'),
                    attrs: {
                        select: [2013, 2, 4]
                    }
                })
                var attrs = pickadate.attrs
                var classes = pickadate.classNames

                var $select = pickadate.$el.find('.' + pickadate.classNames.selected)
                expect($select.text()).toBe('4')
                var $highlight = pickadate.$el.find('.' + pickadate.classNames.highlighted)
                expect($highlight.text()).toBe('4')

                expect(attrs.select).toEqual([2013, 2, 4])
                expect(attrs.highlight).toEqual([2013, 2, 4])
                expect(attrs.view).toEqual([2013, 2, 1])
                expect(attrs.value).toBe('4 March, 2013')
                var $month = pickadate.$el.find('.' + classes.month)
                expect($month.text()).toBe('March')
                var $year = pickadate.$el.find('.' + classes.year)
                expect($year.text()).toBe('2013')
            })

            it('can be updated after creation', function() {

                var pickadate = shadow.Pickadate.create({
                    $el: $('<div />')
                })
                var attrs = pickadate.attrs
                var classes = pickadate.classNames

                attrs.select = [2013, 2, 4]

                var $select = pickadate.$el.find('.' + pickadate.classNames.selected)
                expect($select.text()).toBe('4')
                var $highlight = pickadate.$el.find('.' + pickadate.classNames.highlighted)
                expect($highlight.text()).toBe('4')
                var $month = pickadate.$el.find('.' + classes.month)
                expect($month.text()).toBe('March')
                var $year = pickadate.$el.find('.' + classes.year)
                expect($year.text()).toBe('2013')
            })
        })

        describe('.value', function() {

            it('determines the element’s value, the date selected, the date highlighted, and the month in view', function() {

                var pickadate = shadow.Pickadate.create({
                    $el: $('<div />'),
                    attrs: {
                        value: '4 March, 2013'
                    }
                })
                var attrs = pickadate.attrs

                expect(attrs.value).toBe('4 March, 2013')
                expect(attrs.select).toEqual([2013, 2, 4])
                expect(attrs.highlight).toEqual([2013, 2, 4])
                expect(attrs.view).toEqual([2013, 2, 1])
            })

            it('can only be declared at the time of creation', function() {

                var pickadate = shadow.Pickadate.create({
                    $el: $('<div />')
                })
                var attrs = pickadate.attrs

                expect(attrs.value).toBe(null)
                expect(attrs.select).toBe(null)

                attrs.value = '4 March, 2013'

                expect(attrs.value).toBe('4 March, 2013')
                expect(attrs.select).not.toEqual([2013, 2, 4])
                expect(attrs.highlight).not.toEqual([2013, 2, 4])
                expect(attrs.view).not.toEqual([2013, 2, 1])
            })
        })

        describe('.format', function() {

            it('is used to format the value', function() {
                var pickadate = shadow.Pickadate.create({
                    $el: $('<div />'),
                    attrs: {
                        select: [2012, 7, 14],
                        format: 'yyyy-mm-dd'
                    }
                })
                var attrs = pickadate.attrs
                expect(attrs.value).toBe('2012-08-14')
                attrs.format = 'dddd, d mmm, yyyy'
                expect(attrs.value).toBe('Tuesday, 14 Aug, 2012')
            })

            it('is used to parse the value', function() {
                var pickadate = shadow.Pickadate.create({
                    $el: $('<div />'),
                    attrs: {
                        value: '2013-05-02',
                        format: 'yyyy-mm-dd'
                    }
                })
                var attrs = pickadate.attrs
                expect(attrs.select).toEqual([2013, 4, 2])
            })
        })

    })


    describe('.formats', function() {

        describe('.d()', function() {
            var pickadate = shadow.Pickadate.create({
                $el: $('<div />'),
                attrs: {
                    format: 'd mmmm, yyyy'
                }
            })
            it('formats a date array value into the date', function() {
                expect(pickadate.formats.d([2014, 2, 5])).toEqual(5)
                expect(pickadate.formats.d([2012, 10, 23])).toEqual(23)
            })
            it('parses a date by slicing out the date unit', function() {
                var parsed = pickadate.formats.d('4 August, 1988', true)
                expect(parsed).toBe('4')
                parsed = pickadate.formats.d('14 August, 1988', true)
                expect(parsed).toBe('14')
            })
        })

        describe('.dd()', function() {
            var pickadate = shadow.Pickadate.create({
                $el: $('<div />'),
                attrs: {
                    format: 'dd mmmm, yyyy'
                }
            })
            it('formats a date array value into the date with a leading zero', function() {
                expect(pickadate.formats.dd([2014, 2, 5])).toEqual('05')
                expect(pickadate.formats.dd([2012, 10, 23])).toEqual('23')
            })
            it('parses a date with a leading zero by slicing out the date unit', function() {
                var parsed = pickadate.formats.d('04 August, 1988', true)
                expect(parsed).toBe('04')
                parsed = pickadate.formats.dd('14 August, 1988', true)
                expect(parsed).toBe('14')
            })
        })

        describe('.ddd()', function() {
            var pickadate = shadow.Pickadate.create({
                $el: $('<div />'),
                attrs: {
                    format: 'ddd, d mmmm, yyyy'
                }
            })
            it('formats a date array value into the short weekday', function() {
                expect(pickadate.formats.ddd.call(pickadate, [2014, 2, 5])).toEqual('Wed')
                expect(pickadate.formats.ddd.call(pickadate, [2012, 10, 23])).toEqual('Fri')
            })
            it('parses a short weekday by slicing out the weekday unit', function() {
                var parsed = pickadate.formats.ddd('Tue, 6 May, 2014', true)
                expect(parsed).toBe('Tue')
            })
        })

        describe('.dddd()', function() {
            var pickadate = shadow.Pickadate.create({
                $el: $('<div />'),
                attrs: {
                    format: 'dddd, d mmmm, yyyy'
                }
            })
            it('formats a date array value into the full weekday', function() {
                expect(pickadate.formats.dddd.call(pickadate, [2014, 2, 5])).toEqual('Wednesday')
                expect(pickadate.formats.dddd.call(pickadate, [2012, 10, 23])).toEqual('Friday')
            })
            it('parses a full weekday by slicing out the weekday unit', function() {
                var parsed = pickadate.formats.ddd('Tuesday, 6 May, 2014', true)
                expect(parsed).toBe('Tuesday')
            })
        })

        describe('.m()', function() {
            var pickadate = shadow.Pickadate.create({
                $el: $('<div />'),
                attrs: {
                    format: 'm-d-yyyy'
                }
            })
            it('formats a date array value into the month', function() {
                expect(pickadate.formats.m([2014, 2, 5])).toEqual(3)
                expect(pickadate.formats.m([2012, 10, 23])).toEqual(11)
            })
            it('parses a month by slicing out the month unit', function() {
                var parsed = pickadate.formats.m('4-20-2014', true)
                expect(parsed).toBe('4')
                parsed = pickadate.formats.m('10-20-2014', true)
                expect(parsed).toBe('10')
            })
        })

        describe('.mm()', function() {
            var pickadate = shadow.Pickadate.create({
                $el: $('<div />'),
                attrs: {
                    format: 'mm-d-yyyy'
                }
            })
            it('formats a date array value into the month with a leading zero', function() {
                expect(pickadate.formats.mm([2014, 2, 5])).toEqual('03')
                expect(pickadate.formats.mm([2012, 10, 23])).toEqual('11')
            })
            it('parses a month with a leading zero by slicing out the month unit', function() {
                var parsed = pickadate.formats.mm('04-20-2014', true)
                expect(parsed).toBe('04')
                parsed = pickadate.formats.mm('10-20-2014', true)
                expect(parsed).toBe('10')
            })
        })

        describe('.mmm()', function() {
            var pickadate = shadow.Pickadate.create({
                $el: $('<div />'),
                attrs: {
                    format: 'mmm-d-yyyy'
                }
            })
            it('formats a date array value into the short month name', function() {
                expect(pickadate.formats.mmm.call(pickadate, [2014, 2, 5])).toEqual('Mar')
                expect(pickadate.formats.mmm.call(pickadate, [2012, 10, 23])).toEqual('Nov')
            })
            it('parses a short month name by slicing out the month unit', function() {
                var parsed = pickadate.formats.mmm('Apr-20-2014', true)
                expect(parsed).toBe('Apr')
                parsed = pickadate.formats.mmm('Oct-20-2014', true)
                expect(parsed).toBe('Oct')
            })
        })

        describe('.mmmm()', function() {
            var pickadate = shadow.Pickadate.create({
                $el: $('<div />'),
                attrs: {
                    format: 'mmmm-d-yyyy'
                }
            })
            it('formats a date array value into the full month name', function() {
                expect(pickadate.formats.mmmm.call(pickadate, [2014, 2, 5])).toEqual('March')
                expect(pickadate.formats.mmmm.call(pickadate, [2012, 10, 23])).toEqual('November')
            })
            it('parses a full month name by slicing out the month unit', function() {
                var parsed = pickadate.formats.mmmm('April-20-2014', true)
                expect(parsed).toBe('April')
                parsed = pickadate.formats.mmmm('October-20-2014', true)
                expect(parsed).toBe('October')
            })
        })

        describe('.yyyy()', function() {
            var pickadate = shadow.Pickadate.create({
                $el: $('<div />'),
                attrs: {
                    format: 'yyyy-mm-dd'
                }
            })
            it('formats a date array value into the year', function() {
                expect(pickadate.formats.yyyy([2014, 2, 5])).toEqual(2014)
                expect(pickadate.formats.yyyy([2012, 10, 23])).toEqual(2012)
            })
            it('parses a year by slicing out the year unit', function() {
                var parsed = pickadate.formats.yyyy('2014-04-20', true)
                expect(parsed).toBe('2014')
                parsed = pickadate.formats.yyyy('2010-12-04', true)
                expect(parsed).toBe('2010')
            })
        })

    })

})
