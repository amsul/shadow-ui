define(function(require) {

    'use strict';

    var Em = require('ember')

    var ClassController = Em.ObjectController.extend({
        queryParams: ['itemtype', 'name'],
        itemtype: 'index',
        name: '',
        tabsSortedClass: function() {
            var model = this.get('model')
            var ClassItemsObject = Em.Object.extend({
                isIndex: false,
                isActive: false,
                name: null,
                title: null,
                data: null
            })
            var index = ClassItemsObject.create({
                isIndex: true,
                name: 'index',
                title: 'Index',
                data: []
            })
            var tabs = [index]
            if ( model.attributes.length ) {
                var attributes = ClassItemsObject.create({
                    name: 'attribute',
                    title: 'Attributes',
                    data: model.attributes.sortBy('name')
                })
                index.data.push(attributes)
                tabs.push(attributes)
            }
            if ( model.properties.length ) {
                var properties = ClassItemsObject.create({
                    name: 'property',
                    title: 'Properties',
                    data: model.properties.sortBy('name')
                })
                index.data.push(properties)
                tabs.push(properties)
            }
            if ( model.methods.length ) {
                var methods = ClassItemsObject.create({
                    name: 'method',
                    title: 'Methods',
                    data: model.methods.sortBy('name')
                })
                index.data.push(methods)
                tabs.push(methods)
            }
            return tabs
        }.property('model')
    })

    return {
        ClassController: ClassController
    }
})