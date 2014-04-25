describe('shadow', function() {

    var $dom = $('<div id="dom" />').appendTo('html')

    it('is the main method for registering a ui interface', function() {
        $dom.append('<div data-ui="component">hi there :)</div>')
        expect(shadow.Component).toBe(undefined)
        shadow('component', {
            attrs: {
                something: true
            },
            anotherThing: false
        })
        expect(shadow.Element.is('classOf', shadow.Component)).toBe(true)
        expect(shadow.Component.attrs.something).toBe(true)
        expect(shadow.Component.anotherThing).toBe(false)
    })

    it('extends any of the registered ui interfaces', function() {
        expect(shadow.InputComponent).toBe(undefined)
        shadow('input-component', {
            extend: 'input',
            attrs: {
                something: true
            },
            anotherThing: false
        })
        expect(shadow.Input.is('classOf', shadow.InputComponent)).toBe(true)
        expect(shadow.InputComponent.attrs.something).toBe(true)
        expect(shadow.InputComponent.anotherThing).toBe(false)
    })

    it('builds any dom elements with the same `name` as the registered ui interface', function() {
        var $element = $dom.find('[data-ui][data-ui-something]')
        var shadowEl = $element.data('shadow.ui')
        expect(shadowEl.anotherThing).toBe(false)
        $dom.empty()
    })

})
