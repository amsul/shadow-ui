describe('shadow._', function() {

    _ = shadow._

    it('is a utility object with all the helper methods', function() {
        expect( $.isPlainObject(_) ).toEqual(true)
    })

    describe('.define()', function() {
        var object = {}
        _.define(object, 'prop', 'value')
        it('defines an enumerable property on an object', function() {
            expect(object.prop).toBe('value')
            expect(Object.hasOwnProperty.call(object, 'prop')).toBe(true)
            expect(Object.propertyIsEnumerable.call(object, 'prop')).toBe(true)
        })
    })

    describe('.caseCamel()' , function() {
        it('converts a string to be camel cased', function() {
            var casedString = _.caseCamel('Completely_SOMETHINGMixed-Up')
            expect(casedString).toBe('completelySomethingMixedUp')
        })
    })

    describe('.casePascal()' , function() {
        it('converts a string to be pascal cased', function() {
            var casedString = _.casePascal('Completely_SOMETHINGMixed-Up')
            expect(casedString).toBe('CompletelySomethingMixedUp')
        })
    })

    describe('.caseDash()' , function() {
        it('converts a string to be dash cased', function() {
            var casedString = _.caseDash('Completely_SOMETHINGMixed-Up')
            expect(casedString).toBe('completely-something-mixed-up')
        })
    })

    describe('.isTypeOf()', function() {
        it('returns the value’s type', function() {
            expect( _.isTypeOf({}) ).toBe('object')
            expect( _.isTypeOf([]) ).toBe('array')
            expect( _.isTypeOf(0) ).toBe('number')
            expect( _.isTypeOf(new Date()) ).toBe('date')
            expect( _.isTypeOf('') ).toBe('string')
        })
        it('compares the value’s type', function() {
            expect( _.isTypeOf({}, 'object') ).toBe(true)
            expect( _.isTypeOf([], 'array') ).toBe(true)
            expect( _.isTypeOf(0, 'number') ).toBe(true)
            expect( _.isTypeOf(new Date(), 'date') ).toBe(true)
            expect( _.isTypeOf('', 'string') ).toBe(true)
        })
    })

    describe('.aria()', function() {
        it('sets an individual ARIA attribute to an element', function() {
            var $element = $('<div />')
            _.aria($element[0], 'role', 'presentation')
            expect($element.attr('role')).toBe('presentation')
            _.aria($element[0], 'owns', 'someId')
            expect($element.attr('aria-owns')).toBe('someId')
        })
        it('sets multiple ARIA attributes to an element', function() {
            var $element = $('<div />')
            _.aria($element[0], {
                role: 'option',
                controls: 'someId',
                selected: false
            })
            expect($element.attr('role')).toBe('option')
            expect($element.attr('aria-controls')).toBe('someId')
            expect($element.attr('aria-selected')).toBe('false')
        })
    })
})
