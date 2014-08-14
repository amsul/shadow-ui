(function() {

    'use strict';

    Em.LOG_VERSION = false

    var markedOptions = {
        smartypants: true
    }

    Em.View.reopen({
        didInsertElement: function() {
            this._super()
            var $pre = this.$().find('pre')
            if ( $pre.length ) {
                $pre.each(function() {
                    var pre = this
                    var codeBlock = pre.children[0]
                    var content = codeBlock.textContent
                    var language = codeBlock.className.replace(/^lang-/, '')
                    if ( !language ) {
                        console.log(pre)
                        throw new Error('Need the language name to correctly syntax highlight.')
                    }
                    pre.classList.add('hljs')
                    var highlight = hljs.highlight(language, content)
                    codeBlock.innerHTML = highlight.value
                })
            }
        }
    })

    Em.Handlebars.registerBoundHelper('md', function(content) {
        return content ? new Em.Handlebars.SafeString(marked(content, markedOptions)) : ''
    })

    var App = window.App = Em.Application.create()

    App.Router.map(function() {
        this.route('module', { path: 'modules/:module_name' })
        this.route('class', { path: 'classes/:class_name' })
        this.route('file', { path: 'files/:file_name' })
    })

    App.ApplicationRoute = Em.Route.extend({
        model: function() {
            return $.getJSON('/js/docs/data.json').then(function(data) {
                var attributes = data.classitems.filterBy('itemtype', 'attribute')
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
                    methods: methods
                }
            })
        }
    })

    App.ModuleRoute = Em.Route.extend({
        model: function(params) {
            var data = this.modelFor('application')
            var module = data.modules.findBy('name', params.module_name)
            var classes = objectIntoArray(module.classes)
            if ( module.namespaces.length || module.submodules.length ) {
                console.log('todo')
            }
            return {
                name: module.name,
                file: module.file,
                line: module.line,
                classes: classes,
            }
        }
    })

    App.ClassRoute = Em.Route.extend({
        setupController: function(controller, model) {
            controller.set('model', model)
        },
        model: function(params) {
            var data = this.modelFor('application')
            var attributes = data.attributes.filterBy('class', params.class_name)
            var methods = data.methods.filterBy('class', params.class_name)
            var klass = data.classes.findBy('name', params.class_name)
            var extensionMethods
            if ( klass.extends ) {
                extensionMethods = data.methods.filterBy('class', klass.extends)
            }
            return {
                'class': klass,
                attributes: attributes,
                methods: methods.map(function(method) {
                    var extensionMethod
                    if ( klass.extends && (extensionMethod = extensionMethods.findBy('name', method.name)) ) {
                        method.extending = extensionMethod
                    }
                    method.isMethod = true
                    return method
                })
            }
        }
    })

    App.ClassController = Em.ObjectController.extend({
        tabsSortedClass: function() {
            var model = this.get('model')
            var ClassItemObject = Em.Object.extend({
                isIndex: false,
                isActive: false,
                name: null,
                title: null,
                data: null
            })
            var index = ClassItemObject.create({
                isIndex: true,
                name: 'index',
                title: 'Index',
                data: []
            })
            var tabs = [index]
            if ( model.attributes.length ) {
                var attributes = ClassItemObject.create({
                    name: 'attributes',
                    title: 'Attributes',
                    data: model.attributes.sortBy('name')
                })
                index.data.push(attributes)
                tabs.push(attributes)
            }
            if ( model.methods.length ) {
                var methods = ClassItemObject.create({
                    name: 'methods',
                    title: 'Methods',
                    data: model.methods.sortBy('name')
                })
                index.data.push(methods)
                tabs.push(methods)
            }
            return tabs
        }.property('model')
    })

    App.ListParamsComponent = Em.Component.extend({
        tagName: 'span',
        data: null,
        dataList: null,
        createListOfParams: function() {
            var data = this.get('data')
            if ( data ) {
                var dataList = ''
                data.forEach(function(param, index) {
                    if ( index ) {
                        dataList += ', '
                    }
                    if ( param.optional ) {
                        dataList += '['
                    }
                    dataList += param.name
                    if ( param.optional ) {
                        dataList += ']'
                    }
                })
                this.set('dataList', dataList)
            }
        }.on('willInsertElement').observes('data')
    })

    App.ToggleTabsComponent = Em.Component.extend({
        showFirstTab: function() {
            var tab = this.get('tabs')[0]
            this.showTab(tab.name)
        }.on('init').observes('tabs'),
        showTab: function(tabName) {
            var tabs = this.get('tabs')
            var otherTabs = tabs.rejectBy('name', tabName)
            var activeTab = tabs.findBy('name', tabName)
            otherTabs.forEach(function(tab) {
                tab.set('isActive', false)
            })
            activeTab.set('isActive', true)
        }
    })

    App.ToggleTabsButtonComponent = Em.Component.extend({
        tagName: 'button',
        classNameBindings: ['tab.isActive:is-active'],
        attributeBindings: ['type'],
        type: 'button',
        action: 'switchTab',
        click: function() {
            this.get('parentView').showTab(this.get('tab.name'))
        }
    })

    App.ToggleTabsBodyComponent = Em.Component.extend({
        attributeBindings: ['isNotActive:hidden'],
        isNotActive: Em.computed.not('tab.isActive')
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

})()