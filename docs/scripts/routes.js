define(function(require) {

    'use strict';

    var Em = require('ember')
    var $ = require('jquery')
    var objects = require('objects')
    var objectToArray = objects.objectToArray

    var ApplicationRoute = Em.Route.extend({
        model: function() {
            return $.getJSON('/js/docs/data.json').then(function(data) {

                // Convert objects into arrays.
                data.files = objectToArray(data.files)
                data.classes = objectToArray(data.classes)
                data.modules = objectToArray(data.modules)
                data.modules.forEach(function(module) {
                    module.classes = Object.keys(module.classes)
                })

                // Fix the file path that yuidoc gives for modules..
                data.modules.forEach(function(module) {
                    var moduleName = module.name
                    var file = data.files.find(function(f) {
                        return moduleName in f.modules
                    })
                    module.file = file.name
                })

                return data
            })
        }
    })

    var ModuleRoute = Em.Route.extend({
        model: function(params) {
            var data = this.modelFor('application')
            return data.modules.findBy('name', params.module_name)
        }
    })

    var ClassRoute = Em.Route.extend({
        model: function(params) {
            var data = this.modelFor('application')
            return data.classes.findBy('name', params.class_name)
        }
    })

    return {
        ApplicationRoute: ApplicationRoute,
        ModuleRoute: ModuleRoute,
        ClassRoute: ClassRoute,
    }
})