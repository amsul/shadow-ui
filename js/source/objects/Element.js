
// var docEl = document.documentElement,
//     HAS_SHADOW_ROOT = docEl.webkitCreateShadowRoot || docEl.createShadowRoot



/**
 * Construct an element object.
 */
shadow.Object.extend({

    name: 'Element',

    $el: null,
    $host: null,
    // $root: null,
    // root: null,

    id: null,
    attrs: null,
    dict: null,
    classNames: null,
    classNamesPrefix: null,
    content: null,
    setup: null,
    template: null,


    /**
     * Create an element object.
     */
    create: function(options) {

        // Make sure the $el is a jQuery DOM element.
        var $element = options.$el = options.$el instanceof jQuery ?
            options.$el :
            $(options.$el)

        if ( !$element.length ) {
            throw new TypeError('No `$el` element found for “' + this.name + '”.')
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
     * After extending the element, build all in the DOM.
     */
    extend: function() {
        var ElementInstance = this._super.apply(this, arguments)
        shadow.buildAll(_.caseDash(ElementInstance.name))
        return ElementInstance
    },


    /**
     * Bind/unbind events to fire.
     */
    on: function() {
        var element = this
        if ( !element.is('constructed') ) {
            throw new TypeError('To bind an event callback, ' +
                'the element must first be constructed.')
        }
        $.fn.on.apply(element.$el, arguments)
    },
    off: function() {
        var element = this
        if ( !element.is('constructed') ) {
            throw new TypeError('To unbind an event callback, ' +
                'the element must first be constructed.')
        }
        $.fn.off.apply(element.$el, arguments)
    },


    /**
     * Get an attribute of the shadow element.
     */
    get: function(name) {
        return this.attrs[name]
    },


    /**
     * Set an attribute of the shadow element.
     */
    set: function(name, value, options) {
        var element = this
        if ( !(name in element.attrs) ) return
        element.attrs[name] = value
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
        if ( typeof template != 'string' &&
            !(template instanceof Node) &&
            !(template instanceof jQuery)
        ) try {
            template = JSON.stringify(template)
        }
        catch (e) {}
        element.$host.empty().html(template)
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
            var eventSet = $.Event('assign:' + prop, {
                value: value,
                name: prop
            })
            $element.trigger(eventSet)
            var isPrevented = eventSet.isDefaultPrevented()
            if ( !isPrevented ) {
                currValue = eventSet.value
                updateShadowAttribute($element, prop, currValue)
            }
            var eventUpdate = $.Event('set:' + prop, {
                value: isPrevented ? value : currValue,
                previousValue: previousValue,
                name: prop
            })
            $element.trigger(eventUpdate)
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
        throw new TypeError('No `classNames` were given to prefix.')
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

