
/**
 * Construct a shadow element object.
 *
 * @class shadow.Element
 * @extends shadow.Object
 * @static
 */
shadow.Object.extend({

    name: 'Element',


    /**
     * The source element to bind the shadow data to.
     *
     * If it is a string, the value will be used as a jQuery selector.
     *
     * @attribute $el
     * @type jQuery|HTMLElement|String
     * @default null
     */
    $el: null,


    /**
     * The host element that contains the shadow element within.
     *
     * This is usually the same as the `$el` - unless if it’s an element
     * that cannot contain elements, such as an `input`.
     *
     * If it is a string, the value will be used as a jQuery selector.
     *
     * @attribute $host
     * @type jQuery|HTMLElement|String
     * @default null
     */
    $host: null,


    // $root: null,
    // root: null,


    /**
     * A unique ID for the element; constructed when the element is created.
     *
     * @attribute id
     * @type String
     * @default null
     * @readOnly
     */
    id: null,


    /**
     * An hash mapping of an element’s attributes.
     *
     * This object also gets populated with any `data-ui-*` attributes
     * on the source element.
     *
     * ```html
     * <div data-ui-prop="false" data-ui-another-prop="[1,3,4]"></div>
     * ```
     *
     * Becomes
     *
     * ```javascript
     * attrs: { prop: false, anotherProp: [1,3,4] }
     * ```
     *
     * @attribute attrs
     * @type Hash
     * @default null
     */
    attrs: null,


    /**
     * An hash mapping of an element’s dictionary to be used in templating.
     *
     * @attribute dict
     * @type Hash
     * @default null
     */
    dict: null,


    /**
     * An hash mapping of an element’s class names to be used in templating.
     *
     * @attribute classNames
     * @type Hash
     * @default null
     */
    classNames: null,


    /**
     * A prefix to use on all the class names of an element.
     *
     * ```javascript
     * classNames: {
     *     root: ' --root',
     *     box: 'box',
     *     button: 'button'
     * },
     * classNamesPrefix: 'my-prefix'
     * ```
     *
     * Becomes
     *
     * ```javascript
     * classNames: {
     *     root: 'my-prefix my-prefix--root',
     *     box: 'my-prefix__box',
     *     button: 'my-prefix__button'
     * }
     * ```
     *
     * @attribute classNamesPrefix
     * @type String
     * @default null
     */
    classNamesPrefix: null,


    /**
     * The contents to put within the shadow element during templating.
     *
     * This default to using anything within the source element as the `content`.
     *
     * @attribute content
     * @type Node|DocumentFragment
     * @default null
     */
    content: null,


    /**
     * Set up any listeners, configurations, attributes, etc. before
     * they all are sealed and frozen.
     *
     * @method setup
     */
    setup: null,


    /**
     * Create a template for the shadow element.
     *
     * @attribute template
     * @type Function|String|Node|jQuery
     * @default null
     */
    template: null,


    /**
     * Create an instance of a shadow element.
     *
     * @method create
     * @param {Object} options Options for the element’s prototype.
     * @param {HTMLElement|jQuery} options.$el The source element of the shadow element.
     * @return {shadow.Element} An instance of the shadow element.
     * @static
     */
    create: function(options) {

        // Make sure the $el is a jQuery DOM element.
        var $element = options.$el = options.$el instanceof jQuery ?
            options.$el :
            $(options.$el)

        if ( !$element.length ) {
            throw new ReferenceError('No `$el` element found for “' + this.name + '”.')
        }

        // Make sure the element hasn’t already been bound.
        if ($element.data('shadow.isBound')) {
            return $element.data('shadow.ui')
        }

        // Now set it as having been bound.
        $element.data('shadow.isBound', true)

        // Get and merge the attributes from the source element.
        options.attrs = $.extend({}, this.attrs, options.attrs, getShadowAttributes($element))

        // Make sure we have a dict hash.
        options.dict = $.extend({}, this.dict, options.dict)

        // Make sure we have a class names hash.
        options.classNames = $.extend({}, this.classNames, options.classNames)

        // Now we instantiate the shadow object.
        var element = this._super(options)

        // Keep a reference to the shadow.
        $element.data('shadow.ui', element)

        // Create an ID.
        _.define(element, 'id', element.name + Math.abs(
            ~~(1 + Math.random() * new Date() * 1e4)
        ))

        // Set the ui name if needed.
        if ( element.$el.attr('data-ui') != element.name ) {
            element.$el.attr('data-ui', _.caseDash(element.name))
        }

        // Set the content using the element’s initial content.
        var contents = element.$el.contents().toArray()
        var frag = document.createDocumentFragment()
        contents.forEach(function(content) {
            frag.appendChild(content)
        })
        _.define(element, 'content', frag)

        // Prefix and seal the class names.
        _.define(element, 'classNames',
            prefixifyClassNames(element.classNames, element.classNamesPrefix)
        )
        Object.seal(element.classNames)

        // Setup the starting attributes before everything gets sealed.
        if ( element.setup ) {
            element.setup()
        }

        // Freeze any changes to dict terms.
        Object.freeze(element.dict)

        // Copy attributes to the source element and
        // convert them into getters & setters.
        copyShadowAttributes(element.$el, $element[0].attributes, element.attrs)

        // Now seal the attributes.
        Object.seal(element.attrs)

        // Attach the relevant shadow element nodes.
        attachShadowNodes(element)

        // Build the template content.
        buildTemplate(element)

        // Define the relationship between the element and the host.
        defineHostOwnership($element[0], element.$host && element.$host[0], $element[0].id || element.id)

        // Return the new element object.
        return element
    }, //create


    /**
     * After extending the shadow element class, build all the occurrences
     * of the element in the DOM.
     *
     * @method extend
     * @param {Object} options Options to extend the element’s prototype.
     * @return {shadow.Object} An extension of the shadow element class.
     * @static
     */
    extend: function() {
        var ElementInstance = this._super.apply(this, arguments)
        shadow.buildAll(_.caseDash(ElementInstance.name))
        return ElementInstance
    },


    /**
     * Bind events to fire during the element’s lifecycle.
     *
     * This method is basically a wrapper for jQuery’s `$.fn.on` method
     * and uses the source element (`$el`) as the target.
     *
     * Check out the [documentation here](http://api.jquery.com/on/#on-events-selector-data).
     *
     * @method on
     * @param {String|Object} events Unlike with jQuery, each event’s namespace is **required**.
     * @param {String} [selector]
     * @param {Object} [data]
     * @param {Function} handler
     */
    on: function() {
        var element = this
        if ( element.isClass() ) {
            throw new TypeError('To bind an event callback, ' +
                'the element must first be constructed.')
        }
        $.fn.on.apply(element.$el, arguments)
    },


    /**
     * Unbind events from firing during the element’s lifecycle.
     *
     * This method is basically a wrapper for jQuery’s `$.fn.off` method
     * and uses the source element (`$el`) as the target.
     *
     * Check out the [documentation here](http://api.jquery.com/on/#on-events-selector-data).
     *
     * @method off
     * @param {String|Object} events Unlike with jQuery, each event’s namespace is **required**.
     * @param {String} [selector]
     * @param {Function} [handler]
     */
    off: function() {
        var element = this
        if ( element.isClass() ) {
            throw new TypeError('To unbind an event callback, ' +
                'the element must first be constructed.')
        }
        $.fn.off.apply(element.$el, arguments)
    },


    /**
     * Get the value of an attribute of the shadow element.
     *
     * ```javascript
     * var element = shadow.Element.create({
     *     //...
     *     attrs: {
     *         myAttr: true,
     *         myOtherAttr: { niceness: 10 }
     *     }
     * })
     * ```
     *
     * We can use the `get` method:
     *
     * ```javascript
     * element.get('myAttr')
     * // returns true
     *
     * element.get('myOtherAttr')
     * // returns { niceness: 10 }
     * ```
     *
     * Or, we can directly access the `attrs` object:
     *
     * ```javascript
     * element.attrs.myAttr
     * // returns true
     *
     * element.attrs.myOtherAttr
     * // returns { niceness: 10 }
     * ```
     *
     * @method get
     * @param {String} name The name of the attribute to get.
     * @return {String|Boolean|Number|Array|Hash} The value of the attribute.
     */
    get: function(name) {
        return this.attrs[name]
    },


    /**
     * Set the value of an attribute of the shadow element.
     *
     * @method set
     * @param {String} name The name of the attribute to set.
     * @param {String|Boolean|Number|Array|Hash} value The value of the attribute to set.
     */
    set: function(name, value) {
        var element = this
        if ( !(name in element.attrs) ) return
        element.attrs[name] = value
    },


    /**
     * Add a unit to an attribute of the shadow element.
     *
     * The attribute **must** be an array containing the same types of units.
     *
     * ```js
     * var element = shadow.Element.create({
     *     //...
     *     attrs: {
     *         myCollection: [{ value: 6 }, { value: 14 }, { value: 19 }]
     *     }
     * })
     * ```
     *
     * To add a value, we’d do something like this:
     *
     * ```js
     * element.get('myCollection')
     * // returns [{ value: 6 }, { value: 14 }, { value: 19 }]
     *
     * element.add('myCollection', { value: 24 }, function(unit, loopedUnit) {
     *     return unit.value === loopedUnit.value
     * })
     *
     * element.get('myCollection')
     * // returns [{ value: 6 }, { value: 14 }, { value: 19 }, { value: 24 }]
     * ```
     *
     * @method add
     * @param {String} name The name of the attribute to add to.
     * @param {String|Boolean|Number|Array|Hash} unit The unit of the value to add.
     * @param {Function} [comparator] A function to use to compare the units to avoid duplicates.
     */
    add: function(name, unit, comparator) {
        var element = this
        var value = element.attrs[name]
        if ( _.isWithin(value, unit, comparator) ) {
            return
        }
        var insertAt = value.length
        value.splice(insertAt, 0, unit)
        var eventAdd = $.Event('add:' + name, {
            value: value,
            unit: unit,
            name: name
        })
        element.$el.trigger(eventAdd)
    },


    /**
     * Remove a unit from an attribute of the shadow element.
     *
     * The attribute **must** be an array containing the same types of units.
     *
     * @method remove
     * @param {String} name The name of the attribute to remove from.
     * @param {String|Boolean|Number|Array|Hash} unit The unit of the value to remove.
     * @param {Function} [comparator] A function to use to find the unit to remove.
     */
    remove: function(name, unit, comparator) {
        var element = this
        var value = element.attrs[name]
        var index = _.indexIn(value, unit, comparator)
        if ( index < 0 ) {
            return
        }
        value.splice(index, 1)
        var eventRemove = $.Event('remove:' + name, {
            value: value,
            unit: unit,
            name: name
        })
        element.$el.trigger(eventRemove)
    }


}) //shadow.Object.extend


/**
 * Get the shadow ui attributes from an element.
 */
function getShadowAttributes($element) {

    var elementNode = $element[0]
    var attributes = {}

    ;[].slice.call(elementNode.attributes).forEach(function(attr) {
        var attrName = attr.name
        if ( attrName.match(/^data-ui-/) ) {
            var attrValue = $element.data(attrName.replace(/^data-/, ''))
            attrName = attrName.replace(/^data-ui-/, '')
            attrName = _.caseCamel(attrName)
            attributes[attrName] = attrValue
        }
    })

    return attributes
}


/**
 * Attach nodes relevant to the shadow element.
 */
function attachShadowNodes(element) {

    var nodeName = element.$el[0].nodeName

    // Setup the source as the host if none is given.
    if ( !element.$host && !nodeName.match(/^INPUT$/) ) {
        _.define(element, '$host', element.$el)
    }

    if ( !element.$host ) {
        _.define(element, '$host', $('<div>'))
        element.$el.after(element.$host)
    }


    // var docEl = document.documentElement,
    //     HAS_SHADOW_ROOT = docEl.webkitCreateShadowRoot || docEl.createShadowRoot

    // // // Create the actual shadow root fragment.
    // // if (HAS_SHADOW_ROOT) {
    // //     element.root = element.$host[0].webkitCreateShadowRoot()
    // //     element.root.applyAuthorStyles = true
    // //     element.root.innerHTML = '<content></content>' + element.template
    // //     element.$root = $(element.root.childNodes[1])
    // // } else {
    // //     element.$root = $(element.template)
    // //     element.$host.append(element.$root)
    // // }
}


/**
 * Build out the template contents.
 */
function buildTemplate(element) {

    var template = element.template

    // Insert the template if there is one.
    if ( template ) {
        if ( typeof template == 'function' ) {
            template = element.template()
        }
        element.$host.html(template)
    }
}


/**
 * Define the relationship between the element and the host.
 */
function defineHostOwnership(elementNode, hostNode, id) {
    if ( hostNode && hostNode !== elementNode ) {
        if ( !hostNode.id ) {
            hostNode.id = 'host_' + id
        }
        _.aria(elementNode, 'owns', hostNode.id)
    }
}


/**
 * Copy shadow ui attributes to the source element.
 */
function copyShadowAttributes($element, elementAttrs, shadowAttrs) {
    for (var prop in shadowAttrs) {
        var propAttr = 'data-ui-' + _.caseDash(prop)
        var propValue = shadowAttrs[prop]
        if ( propValue != null && !elementAttrs.getNamedItem(propAttr) ) {
            if ( typeof propValue == 'object' ) {
                propValue = JSON.stringify(propValue)
            }
            $element.attr(propAttr, propValue)
        }
        decorateShadowAttribute($element, shadowAttrs, prop)
    }
}


/**
 * Decorate a shadow attribute with a getter and setter.
 */
function decorateShadowAttribute($element, shadowAttrs, prop) {
    var currValue = shadowAttrs[prop]
    Object.defineProperty(shadowAttrs, prop, {
        get: function() {
            return currValue
        },
        set: function(value) {
            var previousValue = currValue
            var eventAssign = $.Event('assign:' + prop, {
                value: value,
                name: prop
            })
            $element.trigger(eventAssign)
            var isPrevented = eventAssign.isDefaultPrevented()
            if ( !isPrevented ) {
                currValue = eventAssign.value
                updateShadowAttribute($element, prop, currValue)
            }
            var eventSet = $.Event('set:' + prop, {
                value: isPrevented ? value : currValue,
                previousValue: previousValue,
                name: prop
            })
            $element.trigger(eventSet)
        }
    })
}


/**
 * Update a shadow attribute on an element.
 */
function updateShadowAttribute($element, prop, value) {
    prop = 'data-ui-' + _.caseDash(prop)
    if ( value == null ) {
        $element.removeAttr(prop)
    }
    else {
        $element.attr(prop, typeof value == 'object' ?
            JSON.stringify(value) : value
        )
    }
}


/**
 * Prefix each class name in a hash of class names with a prefix.
 */
function prefixifyClassNames(classNames, prefix) {
    if ( !prefix && !classNames ) {
        return {}
    }
    prefix = prefix || ''
    if ( !classNames ) {
        throw new ReferenceError('No `classNames` were given to prefix.')
    }
    var prefixClassName = function(className) {
        var classNameDelimiter = !prefix || !className ||
            className.match(/^-/) ? '' : '__'
        return prefix + classNameDelimiter + className
    }
    for ( var name in classNames ) {
        var classList = classNames[name]
        if ( typeof classList == 'string' ) {
            classNames[name] = classList.split(' ').
                map(prefixClassName).
                join(' ')
        }
    }
    return classNames
}

