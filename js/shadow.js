
/*!
 * Shadow UI v0.5.0, 2014/04/24
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
        throw new ReferenceError("There is no shadow element named “" + extendingName + "”.");
    }
    if (shadowOptions.name) {
        throw new ReferenceError("The `name` property of the `shadowOptions` is reserved.");
    }
    shadowOptions.name = _.casePascal(shadowName);
    shadow[extendingName].extend(shadowOptions);
    shadow.buildAll(shadowName);
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
    // /**
    //  * Create a blueprint constructor function.
    //  */
    // createBlueprint: function(constructor) {
    //     var blueprint = function() {
    //             var property,
    //                 prototype = this
    //             constructor.apply(prototype, arguments)
    //             blueprint.clones.unshift(prototype)
    //             for (property in blueprint) {
    //                 if (property !== 'clones' &&
    //                     hasOwnProperty.call(blueprint, property)) {
    //                         prototype[property] = blueprint[property]
    //                 }
    //             }
    //         }
    //     blueprint.clones = []
    //     return blueprint
    // },
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
    id: null,
    attrs: null,
    template: null,
    $el: null,
    $host: null,
    // $root: null,
    // root: null,
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
        // Now we instantiate the shadow object.
        var element = this._super(options);
        // Keep a reference to the shadow.
        $element.data("shadow.ui", element);
        // Create an ID.
        _.define(element, "id", element.name + Math.abs(~~(1 + Math.random() * new Date() * 1e4)));
        // Set the ui name if needed.
        if (element.$el.attr("data-ui") != element.name) {
            element.$el.attr("data-ui", element.name);
        }
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
            attributes[attrName.replace(/^data-ui-/, "")] = attrValue;
        }
    });
    return attributes;
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
        element.$host.html(element.template);
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
        if (!elementAttrs.getNamedItem(propAttr) && propValue != null) {
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
                $element.attr("data-ui-" + _.caseDash(prop), typeof currValue == "object" ? JSON.stringify(currValue) : currValue);
            }
        }
    });
}

/**
 * Construct an input object.
 */
shadow.Element.extend({
    name: "Input",
    formats: null,
    attrs: {
        value: null,
        allowMultiple: null,
        allowRange: null,
        format: null,
        formatMultiple: "{, |, }",
        // <before first>{<before middle>|<before last>}<after last>
        formatRange: "{ - }"
    },
    $input: null,
    /**
     * Create an input object.
     */
    create: function(options) {
        // Construct the shadow input.
        var input = this._super(options);
        // Make sure we have options with attributes.
        options = $.extend(true, {
            attrs: {}
        }, options);
        // Setup the formatting attributes based on the options.
        setupFormattingAttributes(input, options);
        // Make sure we have a valid source element.
        if (input.$el[0].nodeName != "INPUT") {
            throw new TypeError("To create a shadow input, " + "the `$el` must be an input element.");
        }
        // If a format is expected, the must be formatters available.
        if (input.attrs.format && !input.formats) {
            throw new TypeError("The `formats` hash map is required.");
        }
        // When there are formats, prepare it to be format-able.
        if (input.formats) {
            // Make sure the element has a format for the value.
            if (!input.attrs.format) {
                throw new TypeError("The `format` attribute is required.");
            }
            // Prevent adding/removing more formats.
            Object.seal(input.formats);
        }
        // Set the input element.
        _.define(input, "$input", input.$el);
        // When the attribute’s value is set, update
        // the element’s value after formatting.
        var setValueFn = function(value) {
            input.$input[0].value = input.convertAttrToValue(value);
        };
        // When the element’s value is set, update
        // the attribute’s value after parsing.
        input.$input.on("input." + input.id, function() {
            input.off("set:value." + input.id);
            input.attrs.value = input.convertValueToAttr(this.value);
            input.on("set:value." + input.id, function(event) {
                setValueFn(event.value);
            });
        });
        // Set the starting value.
        if (input.attrs.value) {
            setValueFn(input.attrs.value);
        } else {
            input.$input.triggerHandler("input." + input.id);
        }
        // Return the new input object.
        return input;
    },
    //create
    /**
     * Convert an attribute value into a formatted string.
     */
    convertAttrToValue: function(value) {
        var input = this;
        var formatValueUnit = function(valueUnit) {
            var formatsHash = input.formats;
            if (!formatsHash) {
                return typeof valueUnit == "object" ? JSON.stringify(valueUnit) : valueUnit;
            }
            return toFormattingArray(input.attrs.format, formatsHash).map(function(chunk) {
                return chunk.f ? formatsHash[chunk.f](valueUnit) : chunk;
            }).join("");
        };
        // If multiple values are allowed, setup the combo formatter.
        if (input.attrs.allowMultiple === true) {
            return formatMultipleUnits(formatValueUnit, input.attrs.formatMultiple, input.attrs.formatRange, value);
        }
        // If range values are allowed, setup the range formatter.
        if (input.attrs.allowRange === true) {
            return formatRangeUnits(formatValueUnit, input.attrs.formatRange, value);
        }
        // Otherwise just format it as a single unit.
        return formatValueUnit(value);
    },
    /**
     * Convert a formatted string into a parsed attribute value.
     */
    convertValueToAttr: function(value) {
        if (typeof value != "string") {
            throw new TypeError("An input expects it’s " + "element value to be a string.");
        }
        var input = this;
        var parseValueUnit = function(valueUnit) {
            // If there are formats, decorate the value unit as needed.
            if (input.formats) {
                // Create a parsed hash from the string value.
                var parsedHash = input.convertValueToParsedHash(valueUnit);
                // Convert the hash into an attribute value.
                valueUnit = input.convertParsedHashToAttr(parsedHash);
            }
            // Try to evaluate it as JSON.
            try {
                valueUnit = JSON.parse(valueUnit);
            } catch (e) {}
            return valueUnit;
        };
        // If multiple values are allowed, setup the combo parser.
        if (input.attrs.allowMultiple === true) {
            return parseMultipleUnits(parseValueUnit, input.attrs.formatMultiple, input.attrs.formatRange, value);
        }
        // If range values are allowed, setup the range parser.
        if (input.attrs.allowRange === true) {
            return parseRangeUnits(parseValueUnit, input.attrs.formatRange, value);
        }
        // Otherwise just parse it as a single unit.
        return parseValueUnit(value);
    },
    /**
     * Convert a formatted string into a parsed hash.
     */
    convertValueToParsedHash: function(value) {
        var input = this;
        var formatsHash = input.formats;
        var parsedHash = {};
        // If there are formats, parse the value.
        if (formatsHash) {
            toFormattingArray(input.attrs.format, formatsHash).forEach(function(chunk) {
                if (chunk.f) {
                    var chunkValue = formatsHash[chunk.f](value, true);
                    if (!value.match(new RegExp("^" + chunkValue))) {
                        throw new SyntaxError("The value parsed by the " + "`" + chunk.f + "` formatting rule did not " + "match the value being parsed.\n" + "Value being parsed: “" + value + "”.\n" + "Rule parsed value: “" + chunkValue + "”.");
                    }
                    value = value.slice(chunkValue.length);
                    parsedHash[chunk.f] = chunkValue;
                } else {
                    value = value.replace(new RegExp("^" + chunk), "");
                }
            });
        }
        return parsedHash;
    },
    /**
     * Convert a formatting hash into an attribute value.
     */
    convertParsedHashToAttr: function(value) {
        return value;
    }
});

//shadow.Element.extend
/**
 * Set up the input’s formatting attributes based on the options.
 */
function setupFormattingAttributes(input, options) {
    if (!options.attrs.allowMultiple) {
        input.attrs.formatMultiple = null;
    }
    if (!options.attrs.allowRange) {
        input.attrs.formatRange = null;
    }
}

/**
 * Format multiple units of value.
 */
function formatMultipleUnits(formatter, formatMultiple, formatRange, value) {
    if (!Array.isArray(value)) {
        throw new TypeError("An input with multiple values " + "expects it’s attribute value to be a collection.");
    }
    var matchCombo = formatMultiple.match(/(.*)\{(.*?)\|(.*?)\}(.*)/);
    var beforeFirst = matchCombo[1];
    var beforeMiddle = matchCombo[2];
    var beforeLast = matchCombo[3];
    var afterLast = matchCombo[4];
    value = value.map(function(unit, index) {
        var before = index === 0 ? beforeFirst : index === value.length - 1 ? beforeLast : beforeMiddle;
        var after = index === value.length - 1 ? afterLast : "";
        if (formatRange && Array.isArray(unit)) {
            unit = formatRangeUnits(formatter, formatRange, unit);
        } else {
            unit = formatter(unit);
        }
        return before + unit + after;
    });
    return value.join("");
}

/**
 * Format a range’s units.
 */
function formatRangeUnits(formatter, format, rangeUnit) {
    var matchRange = format.match(/(.*)\{(.*?)\}(.*)/);
    var beforeLower = matchRange[1];
    var beforeUpper = matchRange[2];
    var afterUpper = matchRange[3];
    rangeUnit = rangeUnit.map(function(subItem, subIndex) {
        var subBefore = subIndex === 0 ? beforeLower : beforeUpper;
        var subAfter = subIndex === rangeUnit.length - 1 ? afterUpper : "";
        return subBefore + formatter(subItem) + subAfter;
    });
    return rangeUnit.join("");
}

/**
 * Parse multiple units of value.
 */
function parseMultipleUnits(parser, formatMultiple, formatRange, value) {
    var values = [];
    // If there’s no value, stop right here.
    if (!value) {
        return values;
    }
    var addToCollection = function(string, stringBefore, stringAfter) {
        var originalString = string;
        string = sliceUptoUnit(string, stringBefore);
        var unit = sliceUnit(string, stringAfter);
        if (unit) {
            string = string.replace(unit, "");
            if (formatRange) {
                unit = parseRangeUnits(parser, formatRange, unit);
            }
            if (typeof unit == "string") {
                unit = parser(unit);
            }
            values.push(unit);
            return string;
        }
        return originalString;
    };
    var matchCombo = formatMultiple.match(/(.*)\{(.*?)\|(.*?)\}(.*)/);
    var regStrBeforeFirst = matchCombo[1];
    var regStrBeforeMiddle = matchCombo[2];
    var regStrBeforeLast = matchCombo[3];
    var regStrAfterLast = matchCombo[4];
    var safety = 100;
    value = addToCollection(value, regStrBeforeFirst, regStrBeforeMiddle);
    while (safety && value) {
        if (!--safety) {
            throw "Fell into an infinite loop..";
        }
        var originalValue = value;
        value = addToCollection(value, regStrBeforeMiddle, regStrBeforeMiddle);
        if (value === originalValue) {
            value = addToCollection(value, regStrBeforeMiddle, regStrBeforeLast);
        }
        if (value === originalValue) {
            value = addToCollection(value, regStrBeforeLast, regStrAfterLast);
            break;
        }
    }
    value = addToCollection(value, regStrBeforeLast, regStrAfterLast);
    return values;
}

/**
 * Parse a range’s units.
 */
function parseRangeUnits(parser, format, value) {
    var range = [];
    // If there’s no value, stop right here.
    if (!value) {
        return range;
    }
    var addToCollection = function(rangeUnit) {
        var originalvalueUnit = rangeUnit;
        rangeUnit = parser(rangeUnit);
        range.push(rangeUnit);
        if (typeof rangeUnit == "string") originalvalueUnit = rangeUnit;
        value = value.replace(originalvalueUnit, "");
    };
    var matchRange = format.match(/(.*)\{(.*?)\}(.*)/);
    var regStrBeforeStart = matchRange[1];
    var regStrBeforeEnd = matchRange[2];
    var regStrAfterEnd = matchRange[3];
    value = sliceUptoUnit(value, regStrBeforeStart);
    var valueUnit = sliceUnit(value, regStrBeforeEnd);
    // If there’s no unit value, stop right here.
    if (!valueUnit) {
        return value;
    }
    addToCollection(valueUnit);
    value = sliceUptoUnit(value, regStrBeforeEnd);
    valueUnit = sliceUnit(value, regStrAfterEnd);
    if (valueUnit) {
        addToCollection(valueUnit);
    }
    return range;
}

/**
 * Escape any regular expression special characters.
 */
function escapeRegString(string) {
    return string.replace(/[\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

/**
 * Slice a string up to a string marked as a starting point.
 */
function sliceUptoUnit(string, beforeString) {
    var valueMatch = string.match(new RegExp("^" + escapeRegString(beforeString)));
    if (valueMatch) {
        string = string.replace(valueMatch[0], "");
    }
    return string;
}

/**
 * Slice a string up to a string marked as the ending point.
 */
function sliceUnit(string, afterString) {
    var valueMatch = string.match(new RegExp("(.*?)" + (escapeRegString(afterString) || "$")));
    return valueMatch && valueMatch[1];
}

/**
 * Convert a formatting string into a formatting array.
 */
function toFormattingArray(formattingString, formatsHash) {
    // Define a format’s matching regular expression.
    var formatsRegex = new RegExp(// Match any [escaped] characters.
    "(\\[[^\\[]*\\])" + // Match any formatting characters.
    "|(" + Object.keys(formatsHash).sort(function(a, b) {
        return b > a ? 1 : -1;
    }).join("|") + ")" + // Match all other characters.
    "|(.)", "g");
    return (formattingString || "").split(formatsRegex).reduce(function(array, chunk) {
        if (chunk) {
            if (chunk in formatsHash) {
                array.push({
                    f: chunk
                });
            } else if (chunk.match(/^\[.*]$/)) {
                array.push(chunk.replace(/^\[(.*)]$/, "$1"));
            } else {
                var lastItem = array[array.length - 1];
                if (typeof lastItem == "string") {
                    array[array.length - 1] = lastItem + chunk;
                } else {
                    array.push(chunk);
                }
            }
        }
        return array;
    }, []);
}
//# sourceMappingURL=shadow.map
return shadow
}));
