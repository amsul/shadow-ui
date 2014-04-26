
var CHECKS = {

    // Check if a shadow object inherits from the class of another.
    // http://aaditmshah.github.io/why-prototypal-inheritance-matters/#fixing_the_instanceof_operator
    classOf: function(Instance) {
        var Base = this
        do {
            Instance = Object.getPrototypeOf(Instance)
            if ( Base === Instance ) {
                return true
            }
        } while (Instance)
        return false
    },


    // Check if a shadow object is an instance of another.
    // http://aaditmshah.github.io/why-prototypal-inheritance-matters/#fixing_the_instanceof_operator
    instanceOf: function(Base) {
        var Instance = this
        do {
            Instance = Object.getPrototypeOf(Instance)
            if ( Instance === Base ) {
                return true
            }
        } while (Instance)
        return false
    },


    // Check if a shadow object is the prototype of another.
    prototypeOf: function (object) {
        var Base = this
        var Prototype = Object.getPrototypeOf(object)
        return Base === Prototype &&
            object.name === _.caseCamel(Prototype.name) &&
            object.create === undefined &&
            object.extend === undefined
    },


    // Check if a shadow object has been constructed.
    constructed: function() {
        var object = this
        var Base = Object.getPrototypeOf(object)
        return object !== shadow.Object &&
            Base.is('prototypeOf', object)
    }

} //CHECKS


var checkForSuperCall = function(prototype, property) {
    var methodString = '' + prototype[property]
    var variableNameMatch = methodString.match(/(\w+) *= *this/)
    var variableName = variableNameMatch && variableNameMatch[1] + '|' || ''
    var superRegex = new RegExp('(?:' + variableName + 'this)\\._super\\(')
    if ( shadow.IS_DEBUGGING && !methodString.match(superRegex) ) {
        console.warn('Overriding the base method `' + property + '` ' +
            'without calling `this._super()` within the method might cause ' +
            'unexpected results. Make sure this is the behavior you desire.\n',
            prototype)
    }
}


// Allow inheritence of super methods. Based on:
// http://ejohn.org/blog/simple-javascript-inheritance/
var superFun = function(Base, property, fn) {
    return function superWrapper() {
        var object = this
        object._super = Base[property]
        var ret = fn.apply(object, arguments)
        delete object._super
        return ret
    }
}



/**
 * The core shadow object prototype.
 */
shadow.Object = Object.create({}, {


    // A name for the object (to help with debugging).
    name: {
        enumerable: true,
        value: 'Object'
    },


    // Create an instance of the shadow object.
    create: {
        enumerable: true,
        value: function(options) {
            var Base = this
            var object = Object.create(Base)
            Object.defineProperties(object, {
                name: { value: _.caseCamel(Base.name), enumerable: true },
                create: { value: undefined },
                extend: { value: undefined }
            })
            for ( var item in options ) {
                if ( item in Base ) {
                    var isBasePropertyFn = typeof Base[item] == 'function'
                    if ( isBasePropertyFn ) {
                        checkForSuperCall(options, item)
                    }
                    var value = options[item]
                    if ( isBasePropertyFn && typeof value == 'function' ) {
                        value = superFun(Base, item, value)
                    }
                    _.define(object, item, value)
                }
                else if ( shadow.IS_DEBUGGING ) {
                    throw new ReferenceError('The `' + item + '` property is not recognized by ' + Base + '.')
                }
            }
            return object
        }
    },


    // Extend the object using prototypes. Based on:
    // http://aaditmshah.github.io/why-prototypal-inheritance-matters/#inheriting_from_multiple_prototypes
    extend: {
        enumerable: true,
        value: function(prototype) {

            var Base = this

            if ( Base.is('constructed') && Base.is('constructed') ) {
                console.debug(Base)
                throw new TypeError('Cannot extend a constructed object.')
            }

            var Instance = Object.create(Base)

            for ( var property in prototype ) {
                if ( prototype.hasOwnProperty(property) ) {
                    if ( property == '_super' ) {
                        throw new TypeError('The `_super` property is reserved ' +
                            'to allow object method inheritance.')
                    }
                    if ( property == 'extend' ) {
                        throw new TypeError('The `extend` method cannot be over-written.')
                    }
                    var isBasePropertyFn = typeof Base[property] == 'function'
                    if ( isBasePropertyFn ) {
                        checkForSuperCall(prototype, property)
                    }
                    var value =
                        isBasePropertyFn && typeof prototype[property] == 'function' ?
                            superFun(Base, property, prototype[property]) :
                        $.isPlainObject(Base[property]) && $.isPlainObject(prototype[property]) ?
                            $.extend({}, Base[property], prototype[property]) :
                        prototype[property]
                    _.define(Instance, property, value)
                }
            }

            if ( !Instance.name.match(/^[A-Z]/) ) {
                throw new TypeError('An object’s name must be PascalCased.');
            }
            if ( hasOwnProperty.call(shadow, Instance.name) ) {
                throw new TypeError('An object by the name of "' +
                    Instance.name + '" already exists.')
            }
            shadow[Instance.name] = Instance

            shadow.buildAll(_.caseDash(Instance.name))

            return Instance
        }
    }, //extend


    // Check if a thing is a certain value.
    is: {
        enumerable: true,
        value: function(thing, value) {
            var object = this
            return typeof CHECKS[thing] == 'function' &&
                CHECKS[thing].call(object, value)
        }
    },


    // Cast the object into a string representation.
    toString: {
        enumerable: true,
        value: function() {
            if ( shadow.IS_DEBUGGING ) {
                return this.toLocaleString()
            }
            var object = this
            var isConstructed = object.is('constructed')
            var type = isConstructed ? 'object' : 'class'
            var Base = isConstructed ?
                Object.getPrototypeOf(object) :
                object
            return '{' + type + ' ' + Base.name + '}'
        }
    },

    toLocaleString: {
        enumerable: true,
        value: function() {
            var object = this
            var isConstructed = object.is('constructed')
            var type = isConstructed ? 'object' : 'class'
            var names = []
            if ( isConstructed ) {
                object = Object.getPrototypeOf(object)
            }
            do {
                names.push(object.name)
                object = Object.getPrototypeOf(object)
            } while (object && object.name)
            return '{' + type + ' ' + names.join(':') + '}'
        }
    }

}) //shadow.Object
