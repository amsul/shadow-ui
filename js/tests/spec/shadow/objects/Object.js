describe('shadow.Object', function() {

    it('is the root prototype of all shadow objects', function() {
        expect(Object.getPrototypeOf(shadow.Object)).toEqual({})
    })

    it('is able to add new properties to the prototype', function() {
        var AddProperties = shadow.Object.extend({
            name: 'AddProperties'
        })
        var addProperties = AddProperties.create()
        shadow.Object.someMethod = function() { return 'hi' }
        shadow.Object.someValue = 'hello'
        expect(AddProperties.someMethod()).toBe('hi')
        expect(addProperties.someMethod()).toBe('hi')
        expect(AddProperties.someValue).toBe('hello')
        expect(addProperties.someValue).toBe('hello')
    })


    describe('.extend()', function() {

        var MyExtension = shadow.Object.extend({
            name: 'Extension',
            myMethod: function() {
                return 'very'
            }
        })

        it('extends a new instance of the base shadow object', function() {
            var prototype = Object.getPrototypeOf(MyExtension)
            expect(prototype).toEqual(shadow.Object)
            expect(MyExtension.name).toEqual('Extension')
            expect(MyExtension.myMethod()).toEqual('very')
        })


        it('registers the instance under the `shadow` namespace', function() {
            expect(shadow.Extension).toEqual(MyExtension)
        })


        it('requires a `name` property', function() {
            function notAllowed() {
                shadow.Object.extend()
            }
            expect(notAllowed).toThrowError()
        })


        var MyOtherExtension = MyExtension.extend({
            name: 'OtherExtension',
            myOtherMethod: function() {
                return 'cool'
            }
        })

        it('builds upon an instance’s prototype', function() {
            expect(MyOtherExtension.name).toEqual('OtherExtension')
            expect(MyOtherExtension.myMethod()).toEqual('very')
            expect(MyOtherExtension.myOtherMethod()).toEqual('cool')
        })

    })


    describe('.create()', function() {

        var object = shadow.Object.create()

        it('creates a new instance of the object', function() {
            var prototype = Object.getPrototypeOf(object)
            expect(prototype).toEqual(shadow.Object)
        })
        it('prevents the instance’s name from being changed', function() {
            object.name = 'something'
            expect(object.name).toBe('object')
        })
        it('prevents the instance from being further constructed', function() {
            function notAllowed() {
                object.create()
            }
            expect(notAllowed).toThrowError()
        })
        it('prevents the instance from being further extended', function() {
            function notAllowed() {
                object.extend()
            }
            expect(notAllowed).toThrowError()
        })
        it('prevents the instance’s name from being changed during creation', function() {
            function notAllowed() {
                shadow.Object.create({
                    name: 'something'
                })
            }
            expect(notAllowed).toThrowError()
        })

        var OptionsObject = shadow.Object.extend({
            name: 'OptionsObject',
            something: true
        })

        it('allows replacing properties on it’s prototype', function() {
            var optionsObject = OptionsObject.create()
            expect(optionsObject.something).toBe(true)
        })
        it('prevents adding properties not on it’s prototype', function() {
            function notAllowed() {
                OptionsObject.create({
                    nothing: false
                })
            }
            expect(notAllowed).toThrowError()
        })

    })


    describe('.is()', function() {

        describe('"classOf"', function() {

            it('compares a shadow object’s prototype chain', function() {

                expect(shadow.Object.is('classOf', shadow.Object)).toBe(false)
                expect(shadow.Object.is('classOf', shadow.Extension)).toBe(true)
                expect(shadow.Object.is('classOf', shadow.OtherExtension)).toBe(true)

                expect(shadow.Extension.is('classOf', shadow.Object)).toBe(false)
                expect(shadow.Extension.is('classOf', shadow.Extension)).toBe(false)
                expect(shadow.Extension.is('classOf', shadow.OtherExtension)).toBe(true)

                expect(shadow.OtherExtension.is('classOf', shadow.Object)).toBe(false)
                expect(shadow.OtherExtension.is('classOf', shadow.Extension)).toBe(false)
                expect(shadow.OtherExtension.is('classOf', shadow.OtherExtension)).toBe(false)
            })
        })

        describe('"instanceOf"', function() {

            it('compares a shadow object’s instance chain', function() {

                expect(shadow.Extension.is('instanceOf', shadow.Object)).toBe(true)
                expect(shadow.Extension.is('instanceOf', shadow.Extension)).toBe(false)
                expect(shadow.Extension.is('instanceOf', shadow.OtherExtension)).toBe(false)

                expect(shadow.OtherExtension.is('instanceOf', shadow.Object)).toBe(true)
                expect(shadow.OtherExtension.is('instanceOf', shadow.Extension)).toBe(true)
                expect(shadow.OtherExtension.is('instanceOf', shadow.OtherExtension)).toBe(false)
            })
        })

        describe('"constructed"', function() {

            it('compares a shadow object’s constructor', function() {

                expect(shadow.Object.is('constructed')).toBe(false)
                expect(shadow.Extension.is('constructed')).toBe(false)
                expect(shadow.OtherExtension.is('constructed')).toBe(false)
            })
        })

    })


    describe('.toString()', function() {

        it('returns the shadow object’s definition', function() {

            shadow.IS_DEBUGGING = false

            expect('' + shadow.Object).toBe('{class Object}')
            expect('' + shadow.Extension).toBe('{class Extension}')
            expect('' + shadow.OtherExtension).toBe('{class OtherExtension}')

            expect('' + shadow.Object.create()).toBe('{object Object}')
            expect('' + shadow.Extension.create()).toBe('{object Extension}')
            expect('' + shadow.OtherExtension.create()).toBe('{object OtherExtension}')

            shadow.IS_DEBUGGING = true

            expect('' + shadow.Object).toBe('{class Object}')
            expect('' + shadow.Extension).toBe('{class Extension:Object}')
            expect('' + shadow.OtherExtension).toBe('{class OtherExtension:Extension:Object}')

            expect('' + shadow.Object.create()).toBe('{object Object}')
            expect('' + shadow.Extension.create()).toBe('{object Extension:Object}')
            expect('' + shadow.OtherExtension.create()).toBe('{object OtherExtension:Extension:Object}')
        })
    })


    describe('._super()', function() {

        it('is a reserved property', function() {
            function notAllowed() {
                shadow.Object.extend({
                    name: 'NotAllowed',
                    _super: function() {}
                })
            }
            expect(notAllowed).toThrowError()
        })

        it('is a prototype-inherited method, scoped within an object’s method', function() {
            var SuperExtension = shadow.Object.extend({
                name: 'SuperExtension',
                toString: function() {
                    var asString = this._super()
                    return 'Result: ' + asString
                },
                nothing: function() {
                    var nada = this._super()
                    return nada
                }
            })
            expect('' + SuperExtension).toBe('Result: {class SuperExtension:Object}')
            expect(SuperExtension.nothing).toThrowError()
        })
    })


    describe('.name', function() {
        var object = shadow.Object.create()
        it('returns the object’s name', function() {
            expect(shadow.Object.name).toBe('Object')
            expect(object.name).toBe('object')
        })
        it('is not be directly writable', function() {
            shadow.Object.name = 'haha'
            expect(shadow.Object.name).toBe('Object')
            object.name = 'lol'
            expect(object.name).toBe('object')
        })
    })

})
