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
            expect(object.create()).toBeUndefined()
        })
        it('prevents the instance from being further extended', function() {
            expect(object.extend()).toBeUndefined()
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


    describe('.isClass()', function() {

        it('checks if a shadow object is a class', function() {

            expect(shadow.Object.isClass()).toBe(true)
            expect(shadow.Extension.isClass()).toBe(true)
            expect(shadow.OtherExtension.isClass()).toBe(true)

            expect(shadow.Object.create().isClass()).toBe(false)
            expect(shadow.Extension.create().isClass()).toBe(false)
            expect(shadow.OtherExtension.create().isClass()).toBe(false)
        })
    })


    describe('.isClassOf()', function() {

        it('checks if a shadow object is the class on an object', function() {

            expect(shadow.Object.isClassOf(shadow.Object)).toBe(false)
            expect(shadow.Object.isClassOf(shadow.Extension)).toBe(true)
            expect(shadow.Object.isClassOf(shadow.OtherExtension)).toBe(true)

            expect(shadow.Extension.isClassOf(shadow.Object)).toBe(false)
            expect(shadow.Extension.isClassOf(shadow.Extension)).toBe(false)
            expect(shadow.Extension.isClassOf(shadow.OtherExtension)).toBe(true)

            expect(shadow.OtherExtension.isClassOf(shadow.Object)).toBe(false)
            expect(shadow.OtherExtension.isClassOf(shadow.Extension)).toBe(false)
            expect(shadow.OtherExtension.isClassOf(shadow.OtherExtension)).toBe(false)
        })
    })


    describe('.isInstanceOf()', function() {

        it('checks if a shadow object is the instance of an object', function() {

            expect(shadow.Extension.isInstanceOf(shadow.Object)).toBe(true)
            expect(shadow.Extension.isInstanceOf(shadow.Extension)).toBe(false)
            expect(shadow.Extension.isInstanceOf(shadow.OtherExtension)).toBe(false)

            expect(shadow.OtherExtension.isInstanceOf(shadow.Object)).toBe(true)
            expect(shadow.OtherExtension.isInstanceOf(shadow.Extension)).toBe(true)
            expect(shadow.OtherExtension.isInstanceOf(shadow.OtherExtension)).toBe(false)
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
