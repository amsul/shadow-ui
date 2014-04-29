
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
    classNames: null,
    classNamesPrefix: null,
    content: null,
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
            throw new TypeError('No `$el` element found.')
        }

        // Make sure the element hasn’t already been bound.
        if ($element.data('shadow.isBound')) {
            return $element.data('shadow.ui')
        }

        // Now set it as having been bound.
        $element.data('shadow.isBound', true)

        // Get and merge the attributes from the source element.
        options.attrs = $.extend({}, this.attrs, options.attrs, getShadowAttributes($element))

        // Setup the starting attributes.
        setupShadowAttributes(options.attrs)

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
        _.define(element, 'content', element.$el.contents().toArray())

        // Prefix and lock the class names.
        _.define(element, 'classNames',
            prefixifyClassNames(element.classNames, element.classNamesPrefix)
        )
        Object.seal(element.classNames)

        // Attach the relevant shadow element nodes.
        attachShadowNodes(element)

        // Define the relationship between the element nodes.
        defineShadowNodesRelationships(element)

        // Copy attributes to the source element and
        // convert them into getters & setters.
        copyShadowAttributes(element)

        // Now let’s prevent adding/removing attributes.
        Object.seal(element.attrs)

        // Return the new element object.
        return element
    }, //create


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
 * Set up the shadow element’s starting attributes.
 */
function setupShadowAttributes(attrs) {
    for ( var attrName in attrs ) {
        if ( typeof attrs[attrName] == 'function' ) {
            attrs[attrName] = attrs[attrName].call(attrs)
        }
    }
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

    // Insert the template if there is one.
    if ( element.template ) {
        if ( !element.$host || !(element.$host[0] instanceof Element) ) {
            throw new TypeError('No `$host` element found.')
        }
        var template = element.template
        if ( typeof template == 'function' ) {
            template = element.template()
        }
        if ( typeof template != 'string' ) try {
            template = JSON.stringify(template)
        }
        catch (e) {}
        element.$host.empty().html(template)
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
 * Define the relationships between the shadow elements.
 */
function defineShadowNodesRelationships(element) {

    if ( element.$host && element.$host[0] !== element.$el[0] ) {
        if ( !element.$host[0].id ) {
            element.$host[0].id = 'host_' + element.id
        }
        _.aria(element.$el[0], 'owns', element.$host[0].id)
    }
}


/**
 * Copy shadow ui attributes to the source element.
 */
function copyShadowAttributes(element) {
    var $element = element.$el
    var elementAttrs = $element[0].attributes
    var shadowAttrs = element.attrs
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
            var event = $.Event('set:' + prop, {
                value: value,
                name: prop
            })
            $element.trigger(event)
            if ( !event.isDefaultPrevented() ) {
                currValue = event.value
                updateShadowAttribute($element, prop, currValue)
            }
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
    for ( var name in classNames ) {
        var className = classNames[name]
        var classNameDelimiter = !prefix || !className ||
            className.match(/^-/) ? '' : '__'
        classNames[name] = prefix + classNameDelimiter + className
    }
    return classNames
}

