describe('shadow.Element', function() {

    it('is an instance of the shadow object', function() {
        expect(shadow.Object.is('classOf', shadow.Element)).toBe(true)
        expect(shadow.Element.is('instanceOf', shadow.Object)).toBe(true)
    })


    describe('.create()', function() {

        it('creates shadow elements', function() {
            var element = shadow.Element.create({
                $el: '<div />'
            })
            expect(element.is('constructed')).toBe(true)
        })

        it('must have a source element as a jQuery object', function() {
            function fail() {
                shadow.Element.create({})
            }
            expect(fail).toThrowError()
        })
    })


    describe('.on()', function() {

        var BindingElement = shadow.Element.extend({
            name: 'BindingElement',
            attrs: {
                checked: true
            }
        })

        it('binds callbacks to fire when attributes change', function() {
            var bindingElement = BindingElement.create({
                $el: $('<div />')
            })
            var triggered = false
            bindingElement.on('set:checked', function() {
                triggered = true
            })
            bindingElement.attrs.checked = false
            expect(triggered).toBe(true)
        })

        it('can prevent the default attribute change action', function() {
            var bindingElement = BindingElement.create({
                $el: $('<div />')
            })
            bindingElement.on('set:checked', function(event) {
                event.preventDefault()
            })
            bindingElement.attrs.checked = 'hah'
            expect(bindingElement.attrs.checked).not.toBe('hah')
        })

        it('can specify a return value to use for the attribute change', function() {
            var bindingElement = BindingElement.create({
                $el: $('<div />')
            })
            bindingElement.on('set:checked', function(event) {
                event.value = 'alternateValue'
            })
            bindingElement.attrs.checked = 'hah'
            expect(bindingElement.attrs.checked).toBe('alternateValue')
        })
    })


    describe('.off()', function() {

        var element = shadow.Element.create({
            $el: '<div />'
        })

        it('unbinds callbacks expected to fire when attributes change', function() {
            var triggered = false
            element.on('set:id', function() {
                triggered = true
            })
            element.off('set:id')
            element.attrs.id = 'hah'
            expect(triggered).toBe(false)
        })
    })


    describe('.name', function() {
        var element = shadow.Element.create({
            $el: '<div />'
        })
        it('returns the object’s name', function() {
            expect(shadow.Element.name).toBe('Element')
            expect(element.name).toBe('element')
        })
        it('is not directly writable', function() {
            shadow.Element.name = 'haha'
            expect(shadow.Element.name).toBe('Element')
            element.name = 'lol'
            expect(element.name).toBe('element')
        })
        it('is mirrored to the source element’s `data-ui` attribute', function() {
            expect(element.$el.attr('data-ui')).toBe('element')
        })
    })


    describe('.id', function() {

        var element = shadow.Element.create({
            $el: $('<div />')
        })

        var AnotherElement = shadow.Element.extend({
            name: 'AnotherElement'
        })
        var anotherElement = AnotherElement.create({
            $el: $('<div />')
        })

        it('is set after the element is constructed', function() {
            expect(shadow.Element.id).toBe(null)
            expect(element.id).toMatch(/^element\d+$/)
            expect(AnotherElement.id).toBe(null)
            expect(anotherElement.id).toMatch(/^anotherElement\d+$/)
        })

        it('is not directly writable', function() {
            shadow.Element.id = 'hah'
            expect(shadow.Element.id).not.toBe('hah')
            element.id = 'hah'
            expect(element.id).not.toBe('hah')
        })
    })


    describe('.attrs', function() {

        var CustomElement = shadow.Element.extend({
            name: 'CustomElement',
            attrs: {
                key: 'value',
                nulled: null,
                array: [4,20]
            }
        })
        var customElement = CustomElement.create({
            $el: $('<div data-ui-something="cool" data-ui-nothing data-ui-object=\'{"nice":true}\' />'),
            attrs: {
                truthy: true,
                falsey: false
            }
        })

        it('is an object mapping all shadow ui attributes', function() {
            expect(CustomElement.attrs.key).toBe('value')
            expect(CustomElement.attrs.nulled).toBe(null)
            expect(CustomElement.attrs.array).toEqual([4,20])
            expect(customElement.attrs.key).toBe('value')
            expect(customElement.attrs.nulled).toBe(null)
            expect(customElement.attrs.truthy).toBe(true)
            expect(customElement.attrs.falsey).toBe(false)
            expect(customElement.attrs.something).toBe('cool')
            expect(customElement.attrs.nothing).toBe('')
            expect(customElement.attrs.object).toEqual({ nice: true })
        })

        it('copies `attrs` to the source element’s `data-ui-*` attributes', function() {
            var elementData = customElement.$el.data()
            expect(elementData.uiKey).toBe('value')
            expect(elementData.uiNulled).toBe(undefined)
            expect(elementData.uiArray).toEqual([4,20])
            expect(elementData.uiTruthy).toBe(true)
            expect(elementData.uiFalsey).toBe(false)
            expect(elementData.uiSomething).toBe('cool')
            expect(elementData.uiNothing).toBe('')
            expect(elementData.uiObject).toEqual({ nice: true })
        })

        it('cannot be directly added after construction', function() {
            customElement.attrs.random = true
            expect(customElement.attrs.random).toBe(undefined)
        })

        it('cannot be directly removed after construction', function() {
            delete customElement.attrs.something
            expect(customElement.attrs.something).not.toBe(undefined)
        })

        it('mirrors changes to the source element’s `data-ui-*` attributes', function() {

            customElement.attrs.key = 'anotherValue'
            expect(customElement.$el.attr('data-ui-key')).toBe('anotherValue')

            customElement.attrs.nulled = 'notNulled'
            expect(customElement.$el.attr('data-ui-nulled')).toBe('notNulled')

            customElement.attrs.array = [3,16]
            expect(customElement.$el.attr('data-ui-array')).toBe('[3,16]')

            customElement.attrs.truthy = false
            expect(customElement.$el.attr('data-ui-truthy')).toBe('false')

            customElement.attrs.falsey = true
            expect(customElement.$el.attr('data-ui-falsey')).toBe('true')

            customElement.attrs.falsey = true
            expect(customElement.$el.attr('data-ui-falsey')).toBe('true')

            customElement.attrs.something = ''
            expect(customElement.$el.attr('data-ui-something')).toBe('')

            customElement.attrs.nothing = 'nope'
            expect(customElement.$el.attr('data-ui-nothing')).toBe('nope')

            customElement.attrs.object = { cool: 'stuff' }
            expect(customElement.$el.attr('data-ui-object')).toBe('{"cool":"stuff"}')
        })

        it('mirrors changes to the shadow element’s `.attrs` property object')
    })


    describe('.template', function() {

        it('is used to generate the content for a shadow element', function() {
            expect(shadow.Element.template).toBe(null)
        })

        it('can be a string', function() {
            var element = shadow.Element.create({
                $el: $('<div />'),
                template: 'some content :)'
            })
            var content = element.$el.html()
            expect(content).toBe('some content :)')
        })

        it('can be a DOM node', function() {

            var textNode = document.createTextNode('some content :)')
            var textElement = shadow.Element.create({
                $el: $('<div />'),
                template: textNode
            })
            var textContent = textElement.$el.html()
            expect(textContent).toBe('some content :)')

            var divNode = document.createElement('div')
            divNode.innerHTML = 'some content :)'
            var divElement = shadow.Element.create({
                $el: $('<div />'),
                template: divNode
            })
            var divContent = divElement.$el.html()
            expect(divContent).toBe('<div>some content :)</div>')
        })

        it('can be a function', function() {
            var element = shadow.Element.create({
                $el: $('<div />'),
                template: function() {
                    return 'some content :)'
                }
            })
            var content = element.$el.html()
            expect(content).toBe('some content :)')
        })
    })


    describe('.$el', function() {

        it('is not directly writable before being constructed', function() {
            shadow.Element.$el = 'hah'
            expect(shadow.Element.$el).toBe(null)
        })

        var $div = $('<div />')
        var element = shadow.Element.create({
            $el: $div
        })

        it('is defined after the element has been constructed', function() {
            expect(element.$el).not.toBe(null)
        })

        it('is not directly writable after being constructed', function() {
            element.$el = 'hah'
            expect(element.$el).not.toBe('hah')
        })

        it('is the source DOM element for the shadow element object', function() {
            expect(element.$el).toEqual($div)
        })
    })


    describe('.$host', function() {

        it('is the container for the template content', function() {
            var element = shadow.Element.create({
                $el: $('<div />'),
                template: '<p>some epic content</p>'
            })
            expect(element.$host.html()).toBe('<p>some epic content</p>')
        })

        var $host = $('<div />')
        var element = shadow.Element.create({
            $el: $('<div />'),
            $host: $host,
            template: '<p>some epic content</p>'
        })

        it('can be specified upon creation', function() {
            expect(element.$host[0]).toEqual($host[0])
            expect(element.$host.html()).toBe('<p>some epic content</p>')
        })

        it('attaches ARIA attributes to define relationship', function() {
            expect(element.$el.attr('aria-owns')).toBe(element.$host[0].id)
        })

        it('uses the host’s ID if it’s provided', function() {
            var element = shadow.Element.create({
                $el: $('<div />'),
                $host: $('<div id="host_id" />')
            })
            expect(element.$el.attr('aria-owns')).toBe('host_id')
        })
    })

})
