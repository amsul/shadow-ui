describe('shadow.Input', function() {

    it('is an instance of the shadow object', function() {
        expect(shadow.Object.is('classOf', shadow.Input)).toBe(true)
        expect(shadow.Input.is('instanceOf', shadow.Object)).toBe(true)
    })

    it('is an instance of the shadow element', function() {
        expect(shadow.Element.is('classOf', shadow.Input)).toBe(true)
        expect(shadow.Input.is('instanceOf', shadow.Element)).toBe(true)
    })


    describe('.create()', function() {

        it('creates shadow input elements', function() {
            var input = shadow.Input.create({
                $el: '<input />'
            })
            expect(input.id).toMatch(/^input/)
            expect(input.$el.data('ui')).toBe('input')
        })

        it('must have an input element as the source element', function() {
            function fail() {
                shadow.Input.create({
                    $el: '<div />'
                })
            }
            expect(fail).toThrowError()
        })
    })


    describe('.convertAttrToValue()', function() {

        it('formats a raw attribute value into a formatted element value', function() {
            var inputNoFormat = shadow.Input.create({
                $el: $('<input />')
            })
            expect(inputNoFormat.convertAttrToValue('something')).toBe('something')
            var inputFormat = shadow.Input.create({
                $el: $('<input />'),
                attrs: { format: 'text: Y' },
                formats: {
                    Y: function(val) {
                        return Array(4).join(val)
                    }
                }
            })
            expect(inputFormat.convertAttrToValue('cool')).toBe('text: coolcoolcool')
        })

        it('formats a raw attribute value with multiple units into a formatted element value', function() {
            var input = shadow.Input.create({
                $el: $('<input />'),
                attrs: {
                    allowMultiple: true
                }
            })
            var value = [ 4, 20, 316, 6969 ]
            var formattedValue = input.convertAttrToValue(value)
            expect(formattedValue).toBe('4, 20, 316, 6969')
            expect(input.$el.val()).toBe('')
            input.attrs.value = value
            expect(input.$el.val()).toBe('4, 20, 316, 6969')
        })

        it('expects a raw attribute value with multiple units to be an array', function() {
            function fail() {
                var input = shadow.Input.create({
                    $el: $('<input />'),
                    attrs: {
                        allowMultiple: true
                    }
                })
                input.convertAttrToValue('something')
            }
            expect(fail).toThrowError()
        })

        it('formats a raw attribute value with a range unit into a formatted element value', function() {
            var input = shadow.Input.create({
                $el: $('<input />'),
                attrs: {
                    allowRange: true
                }
            })
            var value = [10, 15]
            var formattedValue = input.convertAttrToValue(value)
            expect(formattedValue).toBe('10 - 15')
            expect(input.$el.val()).toBe('')
            input.attrs.value = value
            expect(input.$el.val()).toBe('10 - 15')
        })

        it('expects a raw attribute value with a range unit to be an array', function() {
            function fail() {
                var input = shadow.Input.create({
                    $el: $('<input />'),
                    attrs: {
                        allowRange: true
                    }
                })
                input.convertAttrToValue('something')
            }
            expect(fail).toThrowError()
        })

        it('formats a raw attribute value with multiple units and range units into a formatted element value', function() {
            var input = shadow.Input.create({
                $el: $('<input />'),
                attrs: {
                    allowMultiple: true,
                    allowRange: true
                }
            })
            var value = [ 1, [10, 15], 20, [25, 50] ]
            var formattedValue = input.convertAttrToValue(value)
            expect(formattedValue).toBe('1, 10 - 15, 20, 25 - 50')
            expect(input.$el.val()).toBe('')
            input.attrs.value = value
            expect(input.$el.val()).toBe('1, 10 - 15, 20, 25 - 50')
        })
    })


    describe('.convertValueToAttr()', function() {

        it('expects the formatted element value to be a string', function() {
            function fail() {
                var input = shadow.Input.create({
                    $el: $('<input />')
                })
                input.convertValueToAttr(['something'])
            }
            expect(fail).toThrowError()
        })

        it('parses a formatted element value into a raw attribute value', function() {
            var inputNoFormat = shadow.Input.create({
                $el: $('<input />')
            })
            expect(inputNoFormat.convertValueToAttr('something')).toBe('something')
            var inputFormat = shadow.Input.create({
                $el: $('<input />'),
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
            var attr = inputFormat.convertValueToAttr('text: awesomeness')
            expect(attr).toEqual({ Y: 'awesome', M: 'ness' })
        })

        it('parses a formatted element value with multiple units into a raw attribute value', function() {
            var input = shadow.Input.create({
                $el: $('<input />'),
                attrs: {
                    allowMultiple: true
                }
            })
            var value = '4, 20, 316, 6969'
            var parsedValue = input.convertValueToAttr(value)
            expect(parsedValue).toEqual([ 4, 20, 316, 6969 ])
            expect(input.attrs.value).toEqual([])
            input.$el.val(value).trigger('input')
            expect(input.attrs.value).toEqual([ 4, 20, 316, 6969 ])
        })

        it('parses a formatted element value with a range unit into a raw attribute value', function() {
            var input = shadow.Input.create({
                $el: $('<input />'),
                attrs: {
                    allowRange: true
                }
            })
            var value = '10 - 15'
            var parsedValue = input.convertValueToAttr(value)
            expect(parsedValue).toEqual([ 10, 15 ])
            expect(input.attrs.value).toEqual([])
            input.$el.val(value).trigger('input')
            expect(input.attrs.value).toEqual([ 10, 15 ])
        })

        it('parses a formatted element value with multiple units and range units into a raw attribute value', function() {
            var input = shadow.Input.create({
                $el: $('<input />'),
                attrs: {
                    allowMultiple: true,
                    allowRange: true
                }
            })
            var value = '1, 10 - 15, 20, 25 - 50'
            var parsedValue = input.convertValueToAttr(value)
            expect(parsedValue).toEqual([ 1, [10, 15], 20, [25, 50] ])
            expect(input.attrs.value).toEqual([])
            input.$el.val(value).trigger('input')
            expect(input.attrs.value).toEqual([ 1, [10, 15], 20, [25, 50] ])
        })
    })


    describe('.convertValueToParsedHash()', function() {
        var inputFormat = shadow.Input.create({
            $el: $('<input />'),
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
        it('parses a formatted element value into a hash value mapping', function() {
            var parsedHashValue = inputFormat.convertValueToParsedHash('value')
            expect(parsedHashValue).toEqual({ Y: 'value' })
        })
        var inputNoFormat = shadow.Input.create({
            $el: $('<input />')
        })
        it('returns an empty hash when there are no formatting options', function() {
            var parsedHashValue = inputNoFormat.convertValueToParsedHash('value')
            expect(parsedHashValue).toEqual({})
        })
    })


    describe('.convertParsedHashToAttr()', function() {

        it('does no formatting by default', function() {
            var input = shadow.Input.create({
                $el: $('<input />')
            })
            var attr = input.convertParsedHashToAttr({ something: true })
            expect(attr).toEqual({ something: true })
        })

        var hash = null
        var input = shadow.Input.create({
            $el: $('<input value="YMCA" />'),
            attrs: {
                format: 'YMCA'
            },
            formats: {
                Y: function() { return 'Y' },
                M: function() { return 'M' },
                C: function() { return 'C' },
                A: function() { return 'A' }
            },
            convertParsedHashToAttr: function(valuesHash) {
                hash = valuesHash
                valueHash = [
                    'Y:' + valuesHash.Y,
                    'M:' + valuesHash.M,
                    'C:' + valuesHash.C,
                    'A:' + valuesHash.A
                ].join(' ')
                return this._super(valueHash)
            }
        })
        it('can be changed to manipulate the attribute value to set', function() {
            expect(input.attrs.value).toBe('Y:Y M:M C:C A:A')
        })
        it('is passed the parsed hash', function() {
            expect(hash).toEqual({ Y: 'Y', M: 'M', C: 'C', A: 'A' })
        })
    })


    describe('.attrs', function() {

        describe('.value', function() {

            it('is the value behind the input element’s value', function() {

                var inputNoValue = shadow.Input.create({
                    $el: $('<input />')
                })
                expect(inputNoValue.attrs.value).toBe('')
                expect(inputNoValue.$el.val()).toBe('')

                var inputValue = shadow.Input.create({
                    $el: $('<input value="something" />')
                })
                expect(inputValue.attrs.value).toBe('something')
                expect(inputValue.$el.val()).toBe('something')
            })

            var inputSimple = shadow.Input.create({
                $el: $('<input />')
            })

            it('mirrors the value from the attrs to the element', function() {
                inputSimple.attrs.value = 'hah'
                expect(inputSimple.$el.val()).toBe('hah')
                inputSimple.attrs.value = 4
                expect(inputSimple.$el.val()).toBe('4')
                inputSimple.attrs.value = [4,20]
                expect(inputSimple.$el.val()).toBe('[4,20]')
                inputSimple.attrs.value = { very: 'cool' }
                expect(inputSimple.$el.val()).toBe('{"very":"cool"}')
            })

            it('mirrors the value from the element to the attrs', function() {
                inputSimple.$el.val('awesome').trigger('input')
                expect(inputSimple.attrs.value).toBe('awesome')
                inputSimple.$el.val('4').trigger('input')
                expect(inputSimple.attrs.value).toBe(4)
                inputSimple.$el.val('[4,20]').trigger('input')
                expect(inputSimple.attrs.value).toEqual([4,20])
                inputSimple.$el.val('{"very":"cool"}').trigger('input')
                expect(inputSimple.attrs.value).toEqual({ very: 'cool' })
            })
        })

        describe('.format', function() {

            it('is required when there are formats', function() {
                function fail() {
                    shadow.Input.create({
                        $el: $('<input />'),
                        formats: {
                            Y: function() {}
                        }
                    })
                }
                expect(fail).toThrowError()
            })

            it('is used to format the value from the attrs to the element', function() {
                var input = shadow.Input.create({
                    $el: $('<input />'),
                    attrs: {
                        format: 'it is: Y yeah'
                    },
                    formats: {
                        Y: function(val) {
                            return val
                        }
                    }
                })
                input.attrs.value = 'something'
                expect(input.attrs.value).toBe('something')
                expect(input.$el.val()).toBe('it is: something yeah')
            })

            var romans = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' }

            it('is used to format individual units of value', function() {
                var input = shadow.Input.create({
                    $el: $('<input />'),
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
                input.attrs.value = [ 4 ]
                expect(input.$el.val()).toBe('IV')
            })

            it('is used to parse individual units of value', function() {
                var input = shadow.Input.create({
                    $el: $('<input value="III" />'),
                    attrs: {
                        format: 'roman',
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
                    },
                    convertParsedHashToAttr: function(value) {
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
                expect(input.attrs.value).toEqual([ 3 ])
            })

            it('is used to format individual units of value within a range', function() {
                var input = shadow.Input.create({
                    $el: $('<input />'),
                    attrs: {
                        format: 'roman',
                        allowRange: true
                    },
                    formats: {
                        roman: function(value) {
                            return romans[value]
                        }
                    }
                })
                input.attrs.value = [ 1, 5 ]
                expect(input.$el.val()).toBe('I - V')
            })

            it('is used to parse individual units of value within a range', function() {
                var input = shadow.Input.create({
                    $el: $('<input value="II - IV" />'),
                    attrs: {
                        format: 'roman',
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
                    convertParsedHashToAttr: function(value) {
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
                expect(input.attrs.value).toEqual([ 2, 4 ])
            })

            it('is used to format individual units of value within multiple values', function() {
                var input = shadow.Input.create({
                    $el: $('<input />'),
                    attrs: {
                        format: 'roman',
                        allowMultiple: true,
                        allowRange: true
                    },
                    formats: {
                        roman: function(value) {
                            return romans[value]
                        }
                    }
                })
                input.attrs.value = [ 4, [2, 3], [1, 4], 5, [1, 2] ]
                expect(input.$el.val()).toBe('IV, II - III, I - IV, V, I - II')
            })

            it('is used to parse individual units of value within multiple values', function() {
                var input = shadow.Input.create({
                    $el: $('<input value="IV, II - III, I - IV, V, I - II" />'),
                    attrs: {
                        format: 'roman',
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
                    convertParsedHashToAttr: function(value) {
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
                expect(input.attrs.value).toEqual([ 4, [2, 3], [1, 4], 5, [1, 2] ])
            })

            it('can have escaped characters', function() {

                var input = shadow.Input.create({
                    $el: $('<input />'),
                    attrs: {
                        format: 'Y [Y Y Y]'
                    },
                    formats: {
                        Y: function(val) {
                            return val
                        }
                    }
                })

                input.attrs.value = 'something'

                expect(input.attrs.value).toBe('something')
                expect(input.$el.val()).toBe('something Y Y Y')
            })
        })

        describe('.formatMultiple', function() {

            it('is used to format the value as a collection of values', function() {
                var input = shadow.Input.create({
                    $el: $('<input />'),
                    attrs: {
                        formatMultiple: 'first: {, middle: |, last: } end.',
                        allowMultiple: true
                    }
                })
                input.attrs.value = [ 1, 10, 15, 20, 25, 50 ]
                expect(input.$el.val()).toBe('first: 1, middle: 10, middle: 15, middle: 20, middle: 25, last: 50 end.')
            })

            it('is used to parse the value as a collection of values', function() {
                var input = shadow.Input.create({
                    $el: $('<input value="first: 5, middle: 10, middle: 14, middle: 20, middle: 50, last: 99 end." />'),
                    attrs: {
                        formatMultiple: 'first: {, middle: |, last: } end.',
                        allowMultiple: true
                    }
                })
                expect(input.attrs.value).toEqual([ 5, 10, 14, 20, 50, 99 ])
            })
        })

        describe('.formatRange', function() {

            it('is used to format the value as a range', function() {
                var input = shadow.Input.create({
                    $el: $('<input />'),
                    attrs: {
                        formatRange: 'From: {. To: }.',
                        allowRange: true
                    }
                })
                input.attrs.value = [ 1, 3 ]
                expect(input.$el.val()).toBe('From: 1. To: 3.')
            })

            it('is used to parse the value as a range', function() {
                var input = shadow.Input.create({
                    $el: $('<input value="From: 1. To: 3." />'),
                    attrs: {
                        formatRange: 'From: {. To: }.',
                        allowRange: true
                    }
                })
                expect(input.attrs.value).toEqual([ 1, 3 ])
            })

            it('is used to format the value as a range within multiple values', function() {
                var input = shadow.Input.create({
                    $el: $('<input />'),
                    attrs: {
                        formatRange: 'From: {. To: }.',
                        allowRange: true,
                        allowMultiple: true
                    }
                })
                input.attrs.value = [ [1, 3], [10, 15], [20, 22], [25, 50] ]
                expect(input.$el.val()).toBe('From: 1. To: 3., From: 10. To: 15., From: 20. To: 22., From: 25. To: 50.')
            })

            it('is used to parse the value as a range within multiple values', function() {
                var input = shadow.Input.create({
                    $el: $('<input value="From: 1. To: 3., From: 10. To: 15., From: 20. To: 22., From: 25. To: 50." />'),
                    attrs: {
                        formatRange: 'From: {. To: }.',
                        allowRange: true,
                        allowMultiple: true
                    }
                })
                expect(input.attrs.value).toEqual([ [1, 3], [10, 15], [20, 22], [25, 50] ])
            })
        })
    })


    describe('.formats', function() {

        var input = shadow.Input.create({
            $el: $('<input value="why:neat em:stuff" />'),
            attrs: {
                format: 'why:Y em:M'
            },
            formats: {
                Y: function(val, isParsing) {
                    if ( isParsing ) {
                        var word = val.match(/ *?(\w+) */)
                        return word && word[1] || ''
                    }
                    return val
                },
                M: function(val, isParsing) {
                    if ( isParsing ) {
                        var word = val.match(/ *?(\w+) */)
                        return word && word[1] || ''
                    }
                    return val
                }
            },
            convertParsedHashToAttr: function(hash) {
                return this._super(hash.Y + ' ' + hash.M)
            }
        })

        it('is a map of formatting rules to parse values', function() {
            expect(input.attrs.value).toBe('neat stuff')
        })

        it('is a map of formatting rules to format values', function() {
            input.$el.val('why:very em:cool').trigger('input')
            expect(input.attrs.value).toBe('very cool')
        })
    })


    describe('.template', function() {

        it('requires a host element', function() {
            function fail() {
                shadow.Input.create({
                    $el: '<input />',
                    template: 'some content'
                })
            }
            expect(fail).toThrowError()
        })
    })


    describe('.$host', function() {

        it('is required when there is any template content', function() {
            function fail() {
                shadow.Input.create({
                    $el: $('<input />'),
                    template: '<p>some epic content</p>'
                })
            }
            expect(fail).toThrowError()
        })

        it('is the container for the template content', function() {
            var $host = $('<div />')
            shadow.Input.create({
                $el: $('<input />'),
                $host: $host,
                template: '<p>some epic content</p>'
            })
            expect($host.html()).toBe('<p>some epic content</p>')
        })
    })


    describe('.$input', function() {

        it('is the element that holds the value of the shadow input', function() {
            var input = shadow.Input.create({
                $el: '<input />',
                $host: $('<div />'),
                template: 'some content'
            })
            expect(input.$input[0]).toEqual(input.$el[0])
        })
    })

})
