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
            casedString = _.caseCamel('HTMLElement')
            expect(casedString).toBe('htmlElement')
        })
    })


    describe('.casePascal()' , function() {

        it('converts a string to be pascal cased', function() {
            var casedString = _.casePascal('Completely_SOMETHINGMixed-Up')
            expect(casedString).toBe('CompletelySomethingMixedUp')
            casedString = _.casePascal('HTMLElement')
            expect(casedString).toBe('HtmlElement')
        })
    })


    describe('.caseDash()' , function() {

        it('converts a string to be dash cased', function() {
            var casedString = _.caseDash('Completely_SOMETHINGMixed-Up')
            expect(casedString).toBe('completely-something-mixed-up')
            casedString = _.caseDash('HTMLElement')
            expect(casedString).toBe('html-element')
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


    describe('.el()', function() {

        var el = _.el

        it('creates dom nodes', function() {
            var element = el()
            expect(element.nodeName).toBe('#text')
            element = el('my-class')
            expect(element.nodeName).toBe('DIV')
            expect(element.className).toBe('my-class')
        })

        it('can be passed an options object to create different elements', function() {
            var section = el({
                name: 'section',
                klass: 'some class-names',
                attrs: {
                    title: 'Nice title'
                }
            }, 'Section content')
            expect(section.nodeName).toBe('SECTION')
            expect(section.className).toBe('some class-names')
            expect(section.title).toBe('Nice title')
            expect(section.innerHTML).toBe('Section content')
        })

        it('can optionally have children dom nodes', function() {
            var child = el('child')
            var parent = el('parent', child)
            expect(parent.childNodes[0]).toEqual(child)
            var child2 = el('child2')
            parent = el('parent', [child, child2])
            expect(parent.childNodes[0]).toEqual(child)
            expect(parent.childNodes[1]).toEqual(child2)
        })

        it('can optionally create a text node', function() {
            var textNode = el('', 'some text here')
            expect(textNode.nodeName).toBe('#text')
            expect(textNode.nodeValue).toBe('some text here')
        })
    })


    describe('.indexIn()', function() {
        it('returns the index of a unit within a collection', function() {
            expect(_.indexIn([1, 3, 4, 6], 3)).toBe(1)
            expect(_.indexIn([1, 3, 4, 6], 6)).toBe(3)
            expect(_.indexIn([1, 3, 4, 6], 5)).toBe(-1)
            expect(_.indexIn([1, 3, 4, 6], 0)).toBe(-1)
        })
        it('can be passed a comparator function to perform the match', function() {
            var collection = [{ v: 1 }, { v: 3 }, { v: 8 }, { v: 9 }]
            var comparator = function(unit, loopedUnit) {
                return unit.v === loopedUnit.v
            }
            expect(_.indexIn(collection, { v: 3 }, comparator)).toBe(1)
            expect(_.indexIn(collection, { v: 8 }, comparator)).toBe(2)
            expect(_.indexIn(collection, { v: 7 }, comparator)).toBe(-1)
            expect(_.indexIn(collection, { v: 0 }, comparator)).toBe(-1)
        })
    })


    describe('.isWithin()', function() {
        it('returns if a unit is within a collection', function() {
            expect(_.isWithin([1, 3, 4, 6], 3)).toBe(true)
            expect(_.isWithin([1, 3, 4, 6], 6)).toBe(true)
            expect(_.isWithin([1, 3, 4, 6], 5)).toBe(false)
            expect(_.isWithin([1, 3, 4, 6], 0)).toBe(false)
        })
        it('can be passed a comparator function to perform the match', function() {
            var collection = [{ v: 1 }, { v: 3 }, { v: 8 }, { v: 9 }]
            var comparator = function(unit, loopedUnit) {
                return unit.v === loopedUnit.v
            }
            expect(_.isWithin(collection, { v: 3 }, comparator)).toBe(true)
            expect(_.isWithin(collection, { v: 8 }, comparator)).toBe(true)
            expect(_.isWithin(collection, { v: 7 }, comparator)).toBe(false)
            expect(_.isWithin(collection, { v: 0 }, comparator)).toBe(false)
        })
    })
})
