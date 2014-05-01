describe('shadow.Picker', function() {

    it('is an instance of the shadow object', function() {
        expect(shadow.Object.is('classOf', shadow.Picker)).toBe(true)
        expect(shadow.Picker.is('instanceOf', shadow.Object)).toBe(true)
    })

    it('is an instance of the shadow element', function() {
        expect(shadow.Element.is('classOf', shadow.Picker)).toBe(true)
        expect(shadow.Picker.is('instanceOf', shadow.Element)).toBe(true)
    })

    it('is an instance of the shadow data field', function() {
        expect(shadow.DataField.is('classOf', shadow.Picker)).toBe(true)
        expect(shadow.Picker.is('instanceOf', shadow.DataField)).toBe(true)
    })


    describe('.template()', function() {

        it('builds out the picker’s template and content')
    })


    describe('.open()', function() {

        it('changes the picker’s state to be opened', function() {
            var picker = shadow.Picker.create({
                $el: $('<div />')
            })
            expect(picker.attrs.opened).toBe(false)
            picker.open()
            expect(picker.attrs.opened).toBe(true)
        })
    })


    describe('.close()', function() {

        it('changes the picker’s state to be closed', function() {
            var picker = shadow.Picker.create({
                $el: $('<div />'),
                attrs: {
                    opened: true
                }
            })
            expect(picker.attrs.opened).toBe(true)
            picker.close()
            expect(picker.attrs.opened).toBe(false)
        })
    })


    describe('.toggle()', function() {

        it('changes the picker’s state to toggle between opened and closed', function() {
            var picker = shadow.Picker.create({
                $el: $('<div />')
            })
            expect(picker.attrs.opened).toBe(false)
            picker.toggle()
            expect(picker.attrs.opened).toBe(true)
            picker.toggle()
            expect(picker.attrs.opened).toBe(false)
        })
    })

})
