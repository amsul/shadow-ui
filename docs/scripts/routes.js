define(function(require) {

    'use strict';

    var Em = require('ember')
    var $ = require('jquery')
    var objects = require('objects')
    var ClassItemObject = objects.ClassItemObject

    var ApplicationRoute = Em.Route.extend({
        model: function() {
            return $.getJSON('/js/docs/data.json').then(function(data) {
                var attributes = data.classitems.filterBy('itemtype', 'attribute')
                var properties = data.classitems.filterBy('itemtype', 'property')
                var methods = data.classitems.filterBy('itemtype', 'method')
                return {
                    project: data.project,
                    classes: objectIntoFlatArray(data.classes),
                    modules: objectIntoFlatArray(data.modules),
                    attributes: attributes.map(function(attribute) {
                        attribute.readonly = 'readonly' in attribute
                        attribute.type = attribute.type.replace(/^\{|\}$/g, '')
                        return attribute
                    }),
                    properties: properties.map(function(property) {
                        property.readonly = 'readonly' in property
                        property.type = property.type.replace(/^\{|\}$/g, '')
                        return property
                    }),
                    methods: methods
                }
            })
        }
    })

    var ModuleRoute = Em.Route.extend({
        model: function(params) {
            var data = this.modelFor('application')
            var module = data.modules.findBy('name', params.module_name)
            var classes = objectIntoArray(module.classes)
            if ( module.namespaces.length || module.submodules.length ) {
                console.log('todo')
            }
            return {
                module: module,
                classes: classes,
            }
        }
    })

    var ClassRoute = Em.Route.extend({
        setupController: function(controller, model) {
            controller.set('model', model)
        },
        model: function(params) {
            var data = this.modelFor('application')
            var klass = data.classes.findBy('name', params.class_name)
            klass = ClassItemObject.create(klass)
            var extensionTree = createExtensionTree(klass, data.classes)
            return {
                'class': klass,
                attributes: filterClassAttributes(klass, data.attributes, extensionTree),
                properties: filterClassAttributes(klass, data.properties, extensionTree),
                methods: filterClassMethods(klass, data.methods, extensionTree)
            }
        }
    })

    function objectIntoFlatArray(object) {
        return Object.keys(object).map(function(key) {
            return object[key]
        })
    }

    function objectIntoArray(object) {
        return Object.keys(object).map(function(key) {
            return {
                name: key,
                value: object[key]
            }
        })
    }

    function filterClassMethods(klass, methods, extensionTree) {
        var methodsAdded = []
        methods = methods.
            map(function(method) {
                return ClassItemObject.create(method)
            })
            .filter(function(method) {
                var added = false
                var methodAdded = methodsAdded.findBy('name', method.name)
                if ( method.class != klass.name && methodAdded ) {
                    if (
                        extensionTree.indexOf(method.class) > -1 &&
                        !methodAdded.get('isExtended') &&
                        methodAdded.class == klass.name
                    ) {
                        methodAdded.set('isExtended', true)
                        methodAdded.set('extends', method.class)
                    }
                    return false
                }
                if ( extensionTree.indexOf(method.class) > -1 ) {
                    method.set('inherits', method.class)
                    added = true
                }
                else {
                    added = method.class == klass.name
                }
                if ( added ) {
                    methodsAdded.push(method)
                }
                return added
            })
        return methods
    }

    function filterClassAttributes(klass, attributes, extensionTree) {
        return attributes.
            map(function(attribute) {
                return ClassItemObject.create(attribute)
            }).
            filter(function(attribute) {
                if ( extensionTree.indexOf(attribute.class) > -1 ) {
                    attribute.set('inherits', attribute.class)
                    return true
                }
                return attribute.class == klass.name
            })
    }

    function createExtensionTree(klass, classes) {
        var extensionTree = []
        var extensionName = klass.extends
        if ( !extensionName ) {
            return extensionTree
        }
        extensionTree.push(extensionName)
        var extension = classes.findBy('name', extensionName)
        if ( extension.extends ) {
            extensionTree = extensionTree.concat(createExtensionTree(extension, classes))
        }
        return extensionTree
    }

    return {
        ApplicationRoute: ApplicationRoute,
        ModuleRoute: ModuleRoute,
        ClassRoute: ClassRoute,
    }
})