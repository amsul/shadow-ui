
/*!
 * Shadow UI v0.6.0, 2014/04/29
 * By Amsul, http://amsul.ca
 * Hosted on http://amsul.github.io/shadow-ui
 * Licensed under MIT
 */

(function (root, factory) {

    // Setup the exports for Node module pattern...
    if ( typeof module == 'object' && typeof module.exports == 'object' )
        module.exports = factory(root, root.jQuery)

    // ...AMD...
    else if ( typeof define == 'function' && define.amd )
        define('shadow', [root, 'jquery'], factory)

    // ...and basic `script` includes.
    else root.shadow = factory(root, root.jQuery)

}(this, function(window, $, undefined) {

'use strict';

function shadow(shadowName, shadowOptions) {
    if (!shadowName) {
        throw new ReferenceError("The `shadowName` is required to register a UI interface.");
    }
    var extendingName = "Element";
    shadowOptions = $.extend(true, {}, shadowOptions);
    if (shadowOptions.extend) {
        extendingName = shadowOptions.extend;
        delete shadowOptions.extend;
    }
    extendingName = _.casePascal(extendingName);
    if (!_.isTypeOf(shadow[extendingName], "object") || extendingName != "Element" && !shadow.Element.is("classOf", shadow[extendingName])) {
        throw new ReferenceError("There is no shadow element named “" + _.caseDash(extendingName) + "”.");
    }
    if (shadowOptions.name) {
        throw new ReferenceError("The `name` property of the `shadowOptions` is reserved.");
    }
    shadowOptions.name = _.casePascal(shadowName);
    shadow[extendingName].extend(shadowOptions);
}

Object.defineProperty(shadow, "IS_DEBUGGING", {
    writable: true,
    value: true
});

/**
 * Build a shadow element.
 */
shadow.build = function($element, shadowName, shadowOptions) {
    shadowOptions = shadowOptions || {};
    shadowOptions.$el = $element;
    shadowName = _.casePascal(shadowName);
    if (!(shadowName in shadow) || !shadow.Object.is("classOf", shadow[shadowName])) {
        throw new ReferenceError("There is no shadow UI " + "registered by the name of `" + shadowName + "`.");
    }
    return shadow[shadowName].create(shadowOptions);
};

/**
 * Build all the named shadow elements.
 */
shadow.buildAll = function(shadowName, shadowOptions) {
    var $elements = $('[data-ui="' + shadowName + '"]');
    $elements.each(function() {
        shadow.build($(this), shadowName, shadowOptions);
    });
};

var _ = shadow._ = {
    /**
     * Define an enumerable property on an object.
     */
    define: function(object, item, value) {
        Object.defineProperty(object, item, {
            enumerable: true,
            value: value
        });
    },
    /**
     * Convert to camel-cased text.
     */
    caseCamel: function(words) {
        var newWord = true;
        var wordChunks = words.split(/(?=[A-Z])|-|_/).map(function(word, index) {
            if (!word) {
                return "";
            }
            if (word.length === 1) {
                if (!newWord) {
                    return word.toLowerCase();
                }
                newWord = false;
                return word;
            }
            newWord = true;
            return (index ? word[0].toUpperCase() : word[0].toLowerCase()) + word.slice(1);
        });
        return wordChunks.join("");
    },
    /**
     * Convert to pascal-cased text.
     */
    casePascal: function(words) {
        var newWord = true;
        var wordChunks = words.split(/(?=[A-Z])|-|_/).map(function(word) {
            if (!word) {
                return "";
            }
            if (word.length === 1) {
                if (!newWord) {
                    return word.toLowerCase();
                }
                newWord = false;
                return word;
            }
            newWord = true;
            return word[0].toUpperCase() + word.slice(1);
        });
        return wordChunks.join("");
    },
    /**
     * Convert to dash-cased text.
     */
    caseDash: function(words) {
        var newWord = true;
        var wordChunks = words.split(/(?=[A-Z])|-|_/).map(function(word, index) {
            if (!word) {
                return "";
            }
            if (word.length === 1) {
                if (!newWord) {
                    return word.toLowerCase();
                }
                newWord = false;
                return "-" + word.toLowerCase();
            }
            newWord = true;
            return (index ? "-" : "") + word[0].toLowerCase() + word.slice(1);
        });
        return wordChunks.join("");
    },
    /**
     * Check what the type of a thing is.
     */
    isTypeOf: function(thing, type) {
        var thingType = {}.toString.call(thing).slice(8, -1).toLowerCase();
        return type ? type === thingType : thingType;
    },
    /**
     * Define aria attributes on an element.
     */
    aria: function(element, attribute, value) {
        if ($.isPlainObject(attribute)) {
            for (var key in attribute) {
                ariaSet(element, key, attribute[key]);
            }
        } else {
            ariaSet(element, attribute, value);
        }
    },
    /**
     * Create an element node with optional children.
     */
    el: function(className, childEls) {
        var el = document.createElement("div");
        if (className) {
            el.className = className;
        }
        if (childEls) {
            if (!Array.isArray(childEls)) {
                childEls = [ childEls ];
            }
            childEls.forEach(function(childEl) {
                if (typeof childEl == "string") {
                    childEl = document.createTextNode(childEl);
                }
                el.appendChild(childEl);
            });
        }
        return el;
    }
};

function ariaSet(element, attribute, value) {
    element.setAttribute((attribute == "role" ? "" : "aria-") + attribute, value);
}

var CHECKS = {
    // Check if a shadow object inherits from the class of another.
    // http://aaditmshah.github.io/why-prototypal-inheritance-matters/#fixing_the_instanceof_operator
    classOf: function(Instance) {
        var Base = this;
        do {
            Instance = Object.getPrototypeOf(Instance);
            if (Base === Instance) {
                return true;
            }
        } while (Instance);
        return false;
    },
    // Check if a shadow object is an instance of another.
    // http://aaditmshah.github.io/why-prototypal-inheritance-matters/#fixing_the_instanceof_operator
    instanceOf: function(Base) {
        var Instance = this;
        do {
            Instance = Object.getPrototypeOf(Instance);
            if (Instance === Base) {
                return true;
            }
        } while (Instance);
        return false;
    },
    // Check if a shadow object is the prototype of another.
    prototypeOf: function(object) {
        var Base = this;
        var Prototype = Object.getPrototypeOf(object);
        return Base === Prototype && object.name === _.caseCamel(Prototype.name) && object.create === undefined && object.extend === undefined;
    },
    // Check if a shadow object has been constructed.
    constructed: function() {
        var object = this;
        var Base = Object.getPrototypeOf(object);
        return object !== shadow.Object && Base.is("prototypeOf", object);
    }
};

//CHECKS
var checkForSuperCall = function(prototype, property) {
    var methodString = "" + prototype[property];
    var variableNameMatch = methodString.match(/(\w+) *= *this/);
    var variableName = variableNameMatch && variableNameMatch[1] + "|" || "";
    var superRegex = new RegExp("(?:" + variableName + "this)\\._super\\(");
    if (shadow.IS_DEBUGGING && !methodString.match(superRegex)) {
        console.warn("Overriding the base method `" + property + "` " + "without calling `this._super()` within the method might cause " + "unexpected results. Make sure this is the behavior you desire.\n", prototype);
    }
};

// Allow inheritence of super methods. Based on:
// http://ejohn.org/blog/simple-javascript-inheritance/
var superFun = function(Base, property, fn) {
    return function superWrapper() {
        var object = this;
        object._super = Base[property];
        var ret = fn.apply(object, arguments);
        delete object._super;
        return ret;
    };
};

/**
 * The core shadow object prototype.
 */
shadow.Object = Object.create({}, {
    // A name for the object (to help with debugging).
    name: {
        enumerable: true,
        value: "Object"
    },
    // Create an instance of the shadow object.
    create: {
        enumerable: true,
        value: function(options) {
            var Base = this;
            var object = Object.create(Base);
            Object.defineProperties(object, {
                name: {
                    value: _.caseCamel(Base.name),
                    enumerable: true
                },
                create: {
                    value: undefined
                },
                extend: {
                    value: undefined
                }
            });
            for (var item in options) {
                if (item in Base) {
                    var isBasePropertyFn = typeof Base[item] == "function";
                    if (isBasePropertyFn) {
                        checkForSuperCall(options, item);
                    }
                    var value = options[item];
                    if (isBasePropertyFn && typeof value == "function") {
                        value = superFun(Base, item, value);
                    }
                    _.define(object, item, value);
                } else if (shadow.IS_DEBUGGING) {
                    throw new ReferenceError("The `" + item + "` property is not recognized by " + Base + ".");
                }
            }
            return object;
        }
    },
    // Extend the object using prototypes. Based on:
    // http://aaditmshah.github.io/why-prototypal-inheritance-matters/#inheriting_from_multiple_prototypes
    extend: {
        enumerable: true,
        value: function(prototype) {
            var Base = this;
            if (Base.is("constructed") && Base.is("constructed")) {
                console.debug(Base);
                throw new TypeError("Cannot extend a constructed object.");
            }
            var Instance = Object.create(Base);
            for (var property in prototype) {
                if (prototype.hasOwnProperty(property)) {
                    if (property == "_super") {
                        throw new TypeError("The `_super` property is reserved " + "to allow object method inheritance.");
                    }
                    if (property == "extend") {
                        throw new TypeError("The `extend` method cannot be over-written.");
                    }
                    var isBasePropertyFn = typeof Base[property] == "function";
                    if (isBasePropertyFn) {
                        checkForSuperCall(prototype, property);
                    }
                    var value = isBasePropertyFn && typeof prototype[property] == "function" ? superFun(Base, property, prototype[property]) : $.isPlainObject(Base[property]) && $.isPlainObject(prototype[property]) ? $.extend({}, Base[property], prototype[property]) : prototype[property];
                    _.define(Instance, property, value);
                }
            }
            if (!Instance.name.match(/^[A-Z]/)) {
                throw new TypeError("An object’s name must be PascalCased.");
            }
            if (hasOwnProperty.call(shadow, Instance.name)) {
                throw new TypeError('An object by the name of "' + Instance.name + '" already exists.');
            }
            shadow[Instance.name] = Instance;
            shadow.buildAll(_.caseDash(Instance.name));
            return Instance;
        }
    },
    //extend
    // Check if a thing is a certain value.
    is: {
        enumerable: true,
        value: function(thing, value) {
            var object = this;
            return typeof CHECKS[thing] == "function" && CHECKS[thing].call(object, value);
        }
    },
    // Cast the object into a string representation.
    toString: {
        enumerable: true,
        value: function() {
            if (shadow.IS_DEBUGGING) {
                return this.toLocaleString();
            }
            var object = this;
            var isConstructed = object.is("constructed");
            var type = isConstructed ? "object" : "class";
            var Base = isConstructed ? Object.getPrototypeOf(object) : object;
            return "{" + type + " " + Base.name + "}";
        }
    },
    toLocaleString: {
        enumerable: true,
        value: function() {
            var object = this;
            var isConstructed = object.is("constructed");
            var type = isConstructed ? "object" : "class";
            var names = [];
            if (isConstructed) {
                object = Object.getPrototypeOf(object);
            }
            do {
                names.push(object.name);
                object = Object.getPrototypeOf(object);
            } while (object && object.name);
            return "{" + type + " " + names.join(":") + "}";
        }
    }
});

// var docEl = document.documentElement,
//     HAS_SHADOW_ROOT = docEl.webkitCreateShadowRoot || docEl.createShadowRoot
/**
 * Construct an element object.
 */
shadow.Object.extend({
    name: "Element",
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
        var $element = options.$el = options.$el instanceof jQuery ? options.$el : $(options.$el);
        if (!$element.length) {
            throw new TypeError("No `$el` element found.");
        }
        // Make sure the element hasn’t already been bound.
        if ($element.data("shadow.isBound")) {
            return $element.data("shadow.ui");
        }
        // Now set it as having been bound.
        $element.data("shadow.isBound", true);
        // Get and merge the attributes from the source element.
        options.attrs = $.extend({}, this.attrs, options.attrs, getShadowAttributes($element));
        // Setup the starting attributes.
        setupShadowAttributes(options.attrs);
        // Now we instantiate the shadow object.
        var element = this._super(options);
        // Keep a reference to the shadow.
        $element.data("shadow.ui", element);
        // Create an ID.
        _.define(element, "id", element.name + Math.abs(~~(1 + Math.random() * new Date() * 1e4)));
        // Set the ui name if needed.
        if (element.$el.attr("data-ui") != element.name) {
            element.$el.attr("data-ui", _.caseDash(element.name));
        }
        // Set the content using the element’s initial content.
        _.define(element, "content", element.$el.contents().toArray());
        // Prefix and lock the class names.
        _.define(element, "classNames", prefixifyClassNames(element.classNames, element.classNamesPrefix));
        Object.seal(element.classNames);
        // Attach the relevant shadow element nodes.
        attachShadowNodes(element);
        // Define the relationship between the element nodes.
        defineShadowNodesRelationships(element);
        // Copy attributes to the source element and
        // convert them into getters & setters.
        copyShadowAttributes(element);
        // Now let’s prevent adding/removing attributes.
        Object.seal(element.attrs);
        // Return the new element object.
        return element;
    },
    //create
    /**
     * Bind/unbind events to fire.
     */
    on: function() {
        var element = this;
        if (!element.is("constructed")) {
            throw new TypeError("To bind an event callback, " + "the element must first be constructed.");
        }
        $.fn.on.apply(element.$el, arguments);
    },
    off: function() {
        var element = this;
        if (!element.is("constructed")) {
            throw new TypeError("To unbind an event callback, " + "the element must first be constructed.");
        }
        $.fn.off.apply(element.$el, arguments);
    }
});

//shadow.Object.extend
/**
 * Get the shadow ui attributes from an element.
 */
function getShadowAttributes($element) {
    var elementNode = $element[0];
    var attributes = {};
    [].slice.call(elementNode.attributes).forEach(function(attr) {
        var attrName = attr.name;
        if (attrName.match(/^data-ui-/)) {
            var attrValue = $element.data(attrName.replace(/^data-/, ""));
            attrName = attrName.replace(/^data-ui-/, "");
            attrName = _.caseCamel(attrName);
            attributes[attrName] = attrValue;
        }
    });
    return attributes;
}

/**
 * Set up the shadow element’s starting attributes.
 */
function setupShadowAttributes(attrs) {
    for (var attrName in attrs) {
        if (typeof attrs[attrName] == "function") {
            attrs[attrName] = attrs[attrName].call(attrs);
        }
    }
}

/**
 * Attach nodes relevant to the shadow element.
 */
function attachShadowNodes(element) {
    var nodeName = element.$el[0].nodeName;
    // Setup the source as the host if none is given.
    if (!element.$host && !nodeName.match(/^INPUT$/)) {
        _.define(element, "$host", element.$el);
    }
    // Insert the template if there is one.
    if (element.template) {
        if (!element.$host || !(element.$host[0] instanceof Element)) {
            throw new TypeError("No `$host` element found.");
        }
        var template = element.template;
        if (typeof template == "function") {
            template = element.template();
        }
        if (typeof template != "string") try {
            template = JSON.stringify(template);
        } catch (e) {}
        element.$host.empty().html(template);
    }
}

/**
 * Define the relationships between the shadow elements.
 */
function defineShadowNodesRelationships(element) {
    if (element.$host && element.$host[0] !== element.$el[0]) {
        if (!element.$host[0].id) {
            element.$host[0].id = "host_" + element.id;
        }
        _.aria(element.$el[0], "owns", element.$host[0].id);
    }
}

/**
 * Copy shadow ui attributes to the source element.
 */
function copyShadowAttributes(element) {
    var $element = element.$el;
    var elementAttrs = $element[0].attributes;
    var shadowAttrs = element.attrs;
    for (var prop in shadowAttrs) {
        var propAttr = "data-ui-" + _.caseDash(prop);
        var propValue = shadowAttrs[prop];
        if (propValue != null && !elementAttrs.getNamedItem(propAttr)) {
            if (typeof propValue == "object") {
                propValue = JSON.stringify(propValue);
            }
            $element.attr(propAttr, propValue);
        }
        decorateShadowAttribute($element, shadowAttrs, prop);
    }
}

/**
 * Decorate a shadow attribute with a getter and setter.
 */
function decorateShadowAttribute($element, shadowAttrs, prop) {
    var currValue = shadowAttrs[prop];
    Object.defineProperty(shadowAttrs, prop, {
        get: function() {
            return currValue;
        },
        set: function(value) {
            var event = $.Event("set:" + prop, {
                value: value,
                name: prop
            });
            $element.trigger(event);
            if (!event.isDefaultPrevented()) {
                currValue = event.value;
                updateShadowAttribute($element, prop, currValue);
            }
        }
    });
}

/**
 * Update a shadow attribute on an element.
 */
function updateShadowAttribute($element, prop, value) {
    prop = "data-ui-" + _.caseDash(prop);
    if (value == null) {
        $element.removeAttr(prop);
    } else {
        $element.attr(prop, typeof value == "object" ? JSON.stringify(value) : value);
    }
}

/**
 * Prefix each class name in a hash of class names with a prefix.
 */
function prefixifyClassNames(classNames, prefix) {
    if (!prefix && !classNames) {
        return {};
    }
    prefix = prefix || "";
    if (!classNames) {
        throw new TypeError("No `classNames` were given to prefix.");
    }
    for (var name in classNames) {
        var className = classNames[name];
        var classNameDelimiter = !prefix || !className || className.match(/^-/) ? "" : "__";
        classNames[name] = prefix + classNameDelimiter + className;
    }
    return classNames;
}
//# sourceMappingURL=shadow.map
return shadow
}));
