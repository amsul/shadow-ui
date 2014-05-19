describe('shadow.DataField', function() {

    it('is an instance of the shadow element', function() {
        expect(shadow.Element.is('classOf', shadow.DataField)).toBe(true)
        expect(shadow.DataField.is('instanceOf', shadow.Element)).toBe(true)
    })


    describe('.create()', function() {

        it('creates shadow data field elements', function() {
            var dataField = shadow.DataField.create({
                $el: $('<div />')
            })
            expect(dataField.id).toMatch(/^dataField/)
            expect(dataField.$el.data('ui')).toBe('data-field')
        })

        it('must have an input element if one is specified in the options', function() {
            function fail() {
                shadow.DataField.create({
                    $el: $('<div />'),
                    $input: $('<div />')
                })
            }
            expect(fail).toThrowError()
            function pass() {
                shadow.DataField.create({
                    $el: $('<div />'),
                    $input: $('<input />')
                })
            }
            expect(pass).not.toThrowError()
        })
    })


    describe('.format()', function() {

        it('formats an attribute value into a formatted string value', function() {
            var dataFieldNoFormat = shadow.DataField.create({
                $el: $('<div />')
            })
            expect(dataFieldNoFormat.format('something')).toBe('something')
            var dataFieldFormat = shadow.DataField.create({
                $el: $('<div />'),
                attrs: { format: 'text: Y' },
                formats: {
                    Y: function(val) {
                        return Array(4).join(val)
                    }
                }
            })
            expect(dataFieldFormat.format('cool')).toBe('text: coolcoolcool')
        })

        it('formats an attribute value with multiple units into a formatted string value', function() {
            var dataField = shadow.DataField.create({
                $el: $('<div />'),
                attrs: {
                    allowMultiple: true
                }
            })
            var value = [ 4, 20, 316, 6969 ]
            var formattedValue = dataField.format(value)
            expect(formattedValue).toBe('4, 20, 316, 6969')
        })

        it('expects an attribute value with multiple units to be an array', function() {
            function fail() {
                var dataField = shadow.DataField.create({
                    $el: $('<div />'),
                    attrs: {
                        allowMultiple: true
                    }
                })
                dataField.format('something')
            }
            expect(fail).toThrowError()
        })

        it('formats an attribute value with a range unit into a formatted string value', function() {
            var dataField = shadow.DataField.create({
                $el: $('<div />'),
                attrs: {
                    allowRange: true
                }
            })
            var value = [10, 15]
            var formattedValue = dataField.format(value)
            expect(formattedValue).toBe('10 - 15')
        })

        it('expects an attribute value with a range unit to be an array', function() {
            function fail() {
                var dataField = shadow.DataField.create({
                    $el: $('<div />'),
                    attrs: {
                        allowRange: true
                    }
                })
                dataField.format('something')
            }
            expect(fail).toThrowError()
        })

        it('formats an attribute value with multiple units and range units into a formatted string value', function() {
            var dataField = shadow.DataField.create({
                $el: $('<div />'),
                attrs: {
                    allowMultiple: true,
                    allowRange: true
                }
            })
            var value = [ 1, [10, 15], 20, [25, 50] ]
            var formattedValue = dataField.format(value)
            expect(formattedValue).toBe('1, 10 - 15, 20, 25 - 50')
        })
    })


    describe('.formatUnit()', function() {

        it('does no formatting by default', function() {
            var dataField = shadow.DataField.create({
                $el: $('<div />')
            })
            var attr = dataField.formatUnit({ something: true })
            expect(attr).toEqual({ something: true })
        })

        it('can be changed to manipulate the attribute value to set', function() {
            var dataField = shadow.DataField.create({
                $el: $('<div />'),
                attrs: {
                    format: 'YMCA'
                },
                formats: {},
                formatUnit: function(unitHash) {
                    hash = unitHash
                    unitHash = [
                        'Y:' + unitHash.Y,
                        'M:' + unitHash.M,
                        'C:' + unitHash.C,
                        'A:' + unitHash.A
                    ].join(' ')
                    return this._super(unitHash)
                }
            })
            var formattedUnit = dataField.formatUnit({
                Y: 'why',
                M: 'em',
                C: 'see',
                A: 'ay'
            })
            expect(formattedUnit).toBe('Y:why M:em C:see A:ay')
        })
    })


    describe('.parse()', function() {

        it('expects the formatted value to be a string', function() {
            function fail() {
                var dataField = shadow.DataField.create({
                    $el: $('<div />')
                })
                dataField.parse(['something'])
            }
            expect(fail).toThrowError()
        })

        it('parses a formatted string value into an attribute value', function() {
            var dataFieldNoFormat = shadow.DataField.create({
                $el: $('<div />')
            })
            expect(dataFieldNoFormat.parse('something')).toBe('something')
            var dataFieldFormat = shadow.DataField.create({
                $el: $('<div />'),
                attrs: { format: 'text: YM' },
                formats: {
                    Y: function(val, isParsing) {
                        if ( isParsing ) {
                            return val.substr(0, 7)
                        }
                        return val.Y
                    },
                    M: function(val, isParsing) {
                        if ( isParsing ) {
                            return val.substr(0, 4)
                        }
                        return val.M
                    }
                }
            })
            var attr = dataFieldFormat.parse('text: awesomeness')
            expect(attr).toEqual({ Y: 'awesome', M: 'ness' })
        })

        it('parses a formatted string value with multiple units into an attribute value', function() {
            var dataField = shadow.DataField.create({
                $el: $('<div />'),
                attrs: {
                    allowMultiple: true
                }
            })
            var value = '4, 20, 316, 6969'
            var parsedValue = dataField.parse(value)
            expect(parsedValue).toEqual([ 4, 20, 316, 6969 ])
        })

        it('parses a formatted string value with a range unit into an attribute value', function() {
            var dataField = shadow.DataField.create({
                $el: $('<div />'),
                attrs: {
                    allowRange: true
                }
            })
            var value = '10 - 15'
            var parsedValue = dataField.parse(value)
            expect(parsedValue).toEqual([ 10, 15 ])
        })

        it('parses a formatted string value with multiple units and range units into an attribute value', function() {
            var dataField = shadow.DataField.create({
                $el: $('<div />'),
                attrs: {
                    allowMultiple: true,
                    allowRange: true
                }
            })
            var value = '1, 10 - 15, 20, 25 - 50'
            var parsedValue = dataField.parse(value)
            expect(parsedValue).toEqual([ 1, [10, 15], 20, [25, 50] ])
        })
    })


    describe('.parseUnit()', function() {
        var dataFieldFormat = shadow.DataField.create({
            $el: $('<div />'),
            attrs: { format: 'Y' },
            formats: {
                Y: function(value, isParsing) {
                    if ( isParsing ) {
                        return value
                    }
                    return Array(4).join(value)
                }
            }
        })
        it('parses a formatted unit string value into a unit hash value mapping', function() {
            var parsedHashValue = dataFieldFormat.parseUnit('value')
            expect(parsedHashValue).toEqual({ Y: 'value' })
        })
        var dataFieldNoFormat = shadow.DataField.create({
            $el: $('<div />')
        })
        it('returns an empty hash when there are no formatting options', function() {
            var parsedHashValue = dataFieldNoFormat.parseUnit('value')
            expect(parsedHashValue).toEqual({})
        })
    })


    describe('.get()', function() {

        var dataField = shadow.DataField.create({
            $el: $('<div />'),
            attrs: {
                format: 'value: Y',
                something: true,
                anotherThing: 'awesome'
            },
            formats: {
                Y: function(val) {
                    return val
                }
            }
        })

        it('returns the value of an attribute of the shadow element', function() {
            expect(dataField.get('something')).toBe(true)
            expect(dataField.get('anotherThing')).toBe('awesome')
            expect(dataField.get('nonExistent')).toBe(undefined)
        })

        it('can get a formatted value', function() {

            var value = dataField.get('something', { format: true })
            expect(value).toBe('value: true')

            value = dataField.get('anotherThing', { format: true })
            expect(value).toBe('value: awesome')
        })
    })


    describe('.attrs', function() {

        describe('.value', function() {

            it('is the value behind the data field’s input value', function() {

                var dataFieldNoValue = shadow.DataField.create({
                    $el: $('<input />')
                })
                expect(dataFieldNoValue.attrs.value).toBe('')
                expect(dataFieldNoValue.$input.val()).toBe('')

                var dataFieldValue = shadow.DataField.create({
                    $el: $('<input value="something" />')
                })
                expect(dataFieldValue.attrs.value).toBe('something')
                expect(dataFieldValue.$input.val()).toBe('something')
            })

            var dataFieldSimple = shadow.DataField.create({
                $el: $('<input />')
            })

            it('mirrors the value from the attrs to the element', function() {
                dataFieldSimple.attrs.value = 'hah'
                expect(dataFieldSimple.$input.val()).toBe('hah')
                dataFieldSimple.attrs.value = 4
                expect(dataFieldSimple.$input.val()).toBe('4')
                dataFieldSimple.attrs.value = [4,20]
                expect(dataFieldSimple.$input.val()).toBe('[4,20]')
                dataFieldSimple.attrs.value = { very: 'cool' }
                expect(dataFieldSimple.$input.val()).toBe('{"very":"cool"}')
            })

            it('mirrors the value from the element to the attrs', function() {
                dataFieldSimple.$input.val('awesome').trigger('input')
                expect(dataFieldSimple.attrs.value).toBe('awesome')
                dataFieldSimple.$input.val('4').trigger('input')
                expect(dataFieldSimple.attrs.value).toBe(4)
                dataFieldSimple.$input.val('[4,20]').trigger('input')
                expect(dataFieldSimple.attrs.value).toEqual([4,20])
                dataFieldSimple.$input.val('{"very":"cool"}').trigger('input')
                expect(dataFieldSimple.attrs.value).toEqual({ very: 'cool' })
            })
        })


        describe('.submitValue', function() {

            it('creates a hidden input for non-inputs', function() {
                var dataField = shadow.DataField.create({
                    $el: $('<div />'),
                    attrs: {
                        submitValue: true
                    }
                })
                expect(dataField.$input && dataField.$input[0].nodeName).toBe('INPUT')
            })

            it('ensures there’s an input element to submit the value', function() {
                var dataFieldAutoHidden = shadow.DataField.create({
                    $el: $('<div />'),
                    attrs: {
                        submitValue: true
                    }
                })
                var inputEl = dataFieldAutoHidden.$input && dataFieldAutoHidden.$input[0]
                expect(inputEl.nodeName).toBe('INPUT')
                expect(inputEl.type).toBe('hidden')
            })
        })


        describe('.format', function() {

            it('is required when there are formats', function() {
                function fail() {
                    shadow.DataField.create({
                        $el: $('<div />'),
                        formats: {
                            Y: function() {}
                        }
                    })
                }
                expect(fail).toThrowError()
            })

            it('is used to format the value from the attrs to the element', function() {
                var dataField = shadow.DataField.create({
                    $el: $('<div />'),
                    attrs: {
                        format: 'it is: Y yeah'
                    },
                    formats: {
                        Y: function(val) {
                            return val
                        }
                    }
                })
                var formattedValue = dataField.format('something')
                expect(formattedValue).toBe('it is: something yeah')
            })

            var romans = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' }

            it('is used to format individual units of value', function() {
                var dataField = shadow.DataField.create({
                    $el: $('<div />'),
                    attrs: {
                        format: 'roman',
                        allowMultiple: true
                    },
                    formats: {
                        roman: function(value) {
                            return romans[value]
                        }
                    }
                })
                var formattedValue = dataField.format([ 4 ])
                expect(formattedValue).toBe('IV')
            })

            it('is used to parse individual units of value', function() {
                var dataField = shadow.DataField.create({
                    $el: $('<div />'),
                    attrs: {
                        format: 'value: roman',
                        allowMultiple: true
                    },
                    formats: {
                        roman: function(value, isParsing) {
                            if ( isParsing ) {
                                for ( var numeral in romans ) {
                                    if ( value === romans[numeral] ) {
                                        return value
                                    }
                                }
                                return
                            }
                            return romans[value]
                        }
                    }
                })
                var parsedValue = dataField.parseUnit('value: III')
                expect(parsedValue).toEqual({ roman: 'III' })
            })

            it('is used to format individual units of value within a range', function() {
                var dataField = shadow.DataField.create({
                    $el: $('<div />'),
                    attrs: {
                        format: 'value: roman',
                        allowRange: true
                    },
                    formats: {
                        roman: function(value) {
                            return romans[value]
                        }
                    }
                })
                var formattedValue = dataField.format([ 1, 5 ])
                expect(formattedValue).toEqual('value: I - value: V')
            })

            it('is used to parse individual units of value within a range', function() {
                var dataField = shadow.DataField.create({
                    $el: $('<div />'),
                    attrs: {
                        format: 'value: roman',
                        allowRange: true
                    },
                    formats: {
                        roman: function(value, isParsing) {
                            if ( isParsing ) {
                                for ( var numeral in romans ) {
                                    if ( value === romans[numeral] ) {
                                        return value
                                    }
                                }
                                return
                            }
                            return romans[value]
                        }
                    },
                    formatUnit: function(value) {
                        value = value.roman
                        for ( var numeral in romans ) {
                            if ( value === romans[numeral] ) {
                                value = numeral
                                break
                            }
                        }
                        return this._super(value)
                    }
                })
                var parsedValue = dataField.parse('value: II - value: IV')
                expect(parsedValue).toEqual([ 2, 4 ])
            })

            it('is used to format individual units of value within multiple values', function() {
                var dataField = shadow.DataField.create({
                    $el: $('<div />'),
                    attrs: {
                        format: 'value: roman',
                        allowMultiple: true,
                        allowRange: true
                    },
                    formats: {
                        roman: function(value) {
                            return romans[value]
                        }
                    }
                })
                var formattedValue = dataField.format([ 4, [2, 3], [1, 4], 5, [1, 2] ])
                expect(formattedValue).toEqual('value: IV, value: II - value: III, value: I - value: IV, value: V, value: I - value: II')
            })

            it('is used to parse individual units of value within multiple values', function() {
                var dataField = shadow.DataField.create({
                    $el: $('<div value="" />'),
                    attrs: {
                        format: 'value: roman',
                        allowMultiple: true,
                        allowRange: true
                    },
                    formats: {
                        roman: function(value, isParsing) {
                            if ( isParsing ) {
                                for ( var numeral in romans ) {
                                    if ( value === romans[numeral] ) {
                                        return value
                                    }
                                }
                                return
                            }
                            return romans[value]
                        }
                    },
                    formatUnit: function(value) {
                        value = value.roman
                        for ( var numeral in romans ) {
                            if ( value === romans[numeral] ) {
                                value = numeral
                                break
                            }
                        }
                        return this._super(value)
                    }
                })
                var parsedValue = dataField.parse('value: IV, value: II - value: III, value: I - value: IV, value: V, value: I - value: II')
                expect(parsedValue).toEqual([ 4, [2, 3], [1, 4], 5, [1, 2] ])
            })

            it('can have escaped characters', function() {

                var dataField = shadow.DataField.create({
                    $el: $('<div />'),
                    attrs: {
                        format: 'Y [Y Y Y]'
                    },
                    formats: {
                        Y: function(val) {
                            return val
                        }
                    }
                })

                var formattedValue = dataField.format('something')
                expect(formattedValue).toEqual('something Y Y Y')
            })
        })


        describe('.formatMultiple', function() {

            it('is used to format the value as a collection of values', function() {
                var dataField = shadow.DataField.create({
                    $el: $('<div />'),
                    attrs: {
                        formatMultiple: 'first: {, middle: |, last: } end.',
                        allowMultiple: true
                    }
                })
                var formattedValue = dataField.format([ 1, 10, 15, 20, 25, 50 ])
                expect(formattedValue).toEqual('first: 1, middle: 10, middle: 15, middle: 20, middle: 25, last: 50 end.')
            })

            it('is used to parse the value as a collection of values', function() {
                var dataField = shadow.DataField.create({
                    $el: $('<div />'),
                    attrs: {
                        formatMultiple: 'first: {, middle: |, last: } end.',
                        allowMultiple: true
                    }
                })
                var parsedValue = dataField.parse('first: 5, middle: 10, middle: 14, middle: 20, middle: 50, last: 99 end.')
                expect(parsedValue).toEqual([ 5, 10, 14, 20, 50, 99 ])
            })
        })


        describe('.formatRange', function() {

            it('is used to format the value as a range', function() {
                var dataField = shadow.DataField.create({
                    $el: $('<div />'),
                    attrs: {
                        formatRange: 'From: {. To: }.',
                        allowRange: true
                    }
                })
                var formattedValue = dataField.format([ 1, 3 ])
                expect(formattedValue).toBe('From: 1. To: 3.')
            })

            it('is used to parse the value as a range', function() {
                var dataField = shadow.DataField.create({
                    $el: $('<div />'),
                    attrs: {
                        formatRange: 'From: {. To: }.',
                        allowRange: true
                    }
                })
                var parsedValue = dataField.parse('From: 1. To: 3.')
                expect(parsedValue).toEqual([ 1, 3 ])
            })

            it('is used to format the value as a range within multiple values', function() {
                var dataField = shadow.DataField.create({
                    $el: $('<div />'),
                    attrs: {
                        formatRange: 'From: {. To: }.',
                        allowRange: true,
                        allowMultiple: true
                    }
                })
                var formattedValue = dataField.format([ [1, 3], [10, 15], [20, 22], [25, 50] ])
                expect(formattedValue).toBe('From: 1. To: 3., From: 10. To: 15., From: 20. To: 22., From: 25. To: 50.')
            })

            it('is used to parse the value as a range within multiple values', function() {
                var dataField = shadow.DataField.create({
                    $el: $('<div />'),
                    attrs: {
                        formatRange: 'From: {. To: }.',
                        allowRange: true,
                        allowMultiple: true
                    }
                })
                var parsedValue = dataField.parse('From: 1. To: 3., From: 10. To: 15., From: 20. To: 22., From: 25. To: 50.')
                expect(parsedValue).toEqual([ [1, 3], [10, 15], [20, 22], [25, 50] ])
            })
        })
    })


    describe('.formats', function() {

        var dataField = shadow.DataField.create({
            $el: $('<div />'),
            attrs: {
                format: 'why:Y em:M'
            },
            formats: {
                Y: function(val, isParsing) {
                    if ( isParsing ) {
                        var word = val.match(/ *?(\w+) */)
                        return word && word[1] || ''
                    }
                    return val.split(' ')[0]
                },
                M: function(val, isParsing) {
                    if ( isParsing ) {
                        var word = val.match(/ *?(\w+) */)
                        return word && word[1] || ''
                    }
                    return val.split(' ')[1]
                }
            },
            formatUnit: function(hash) {
                return this._super(hash.Y + ' ' + hash.M)
            }
        })


        it('is a map of formatting rules to parse values', function() {
            var parsedValue = dataField.parse('why:neat em:stuff')
            expect(parsedValue).toBe('neat stuff')
        })


        it('is a map of formatting rules to format values', function() {
            var formattedValue = dataField.format('very cool')
            expect(formattedValue).toBe('why:very em:cool')
        })
    })


    describe('.$host', function() {

        it('is required if the source is an input and there is a template', function() {
            function fail() {
                shadow.DataField.create({
                    $el: $('<input />'),
                    template: '<p>some epic content</p>'
                })
            }
            expect(fail).toThrowError()
            function pass() {
                shadow.DataField.create({
                    $el: $('<div />'),
                    template: '<p>some epic content</p>'
                })
            }
            expect(pass).not.toThrowError()
        })

        it('is the container for the template content', function() {
            var $host = $('<div />')
            shadow.DataField.create({
                $el: $('<input />'),
                $host: $host,
                template: '<p>some epic content</p>'
            })
            expect($host.html()).toBe('<p>some epic content</p>')
        })
    })


    describe('.$input', function() {

        it('is the element that holds the value of the shadow data field', function() {

            var dataField = shadow.DataField.create({
                $el: '<input value="something" />'
            })
            expect(dataField.$input[0]).toEqual(dataField.$el[0])
            expect(dataField.$input.val()).toBe('something')

            dataField = shadow.DataField.create({
                $el: '<div />',
                $input: $('<input />'),
                attrs: {
                    value: 'something'
                }
            })
            expect(dataField.$input.val()).toBe('something')

            dataField = shadow.DataField.create({
                $el: '<div data-ui-value="something" />',
                $input: $('<input />')
            })
            expect(dataField.$input.val()).toBe('something')
        })
    })

})
