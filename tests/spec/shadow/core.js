describe('shadow', function() {

    var $dom = $('<div id="dom" />').appendTo('html')

    $dom.append('<div data-ui="component" data-ui-long-attribute-name="true">hi there :)</div>')
    $dom.append('<input data-ui="input-component" data-ui-allow-multiple="true" data-ui-select="[4, 20, 316, 6969]">')

    shadow('input-component', {
        extend: 'data-element',
        attrs: {
            something: true
        },
        anotherThing: false
    })

    shadow('component', {
        attrs: {
            something: true
        },
        anotherThing: false
    })

    it('is the main method for registering a ui interface', function() {
        expect(shadow.DataElement.isClassOf(shadow.InputComponent)).toBe(true)
        expect(shadow.Component.attrs.something).toBe(true)
        expect(shadow.Component.anotherThing).toBe(false)
    })

    it('extends any of the registered ui interfaces', function() {
        expect(shadow.Element.isClassOf(shadow.Component)).toBe(true)
        expect(shadow.InputComponent.attrs.something).toBe(true)
        expect(shadow.InputComponent.anotherThing).toBe(false)
    })

    it('builds any dom elements with the same `name` as the registered ui interface', function() {

        var $element = $dom.find('[data-ui="component"]')
        var shadowElement = $element.data('shadow.ui')
        expect(shadowElement.anotherThing).toBe(false)
        expect(shadowElement.attrs.something).toBe(true)
        expect(shadowElement.attrs.longAttributeName).toBe(true)

        var $input = $dom.find('[data-ui="input-component"]')
        var shadowInput = $input.data('shadow.ui')
        expect(shadowInput.$el.val()).toBe('4, 20, 316, 6969')
        expect(shadowInput.anotherThing).toBe(false)
        expect(shadowInput.attrs.something).toBe(true)
        expect(shadowInput.attrs.allowMultiple).toBe(true)
        expect(shadowInput.attrs.select).toEqual([ 4, 20, 316, 6969 ])

        $dom.empty()
    })

})
