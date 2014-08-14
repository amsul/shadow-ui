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

    App.ClassItemObject = Em.Object.extend({
        isMethod: Em.computed.equal('itemtype', 'method'),
        isStatic: Em.computed.equal('static', 1),
        isInherited: Em.computed.any('inherits'),
        isExtended: false,
    })

    App.ClassRoute = Em.Route.extend({
        setupController: function(controller, model) {
            controller.set('model', model)
        },
        model: function(params) {
            var data = this.modelFor('application')
            var klass = data.classes.findBy('name', params.class_name)
            klass = App.ClassItemObject.create(klass)
            var extensionTree = createExtensionTree(klass, data.classes)
            return {
                'class': klass,
                attributes: filterClassAttributes(klass, data.attributes, extensionTree),
                methods: filterClassMethods(klass, data.methods, extensionTree)
            }
        }
    })

    App.ClassController = Em.ObjectController.extend({
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
                    name: 'attributes',
                    title: 'Attributes',
                    data: model.attributes.sortBy('name')
                })
                index.data.push(attributes)
                tabs.push(attributes)
            }
            if ( model.methods.length ) {
                var methods = ClassItemsObject.create({
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

    App.ToggleTabsComponent = Em.Component.extend(Ember.ControllerMixin, {
        needs: ['class'],
        showStartingTab: function() {
            if ( this.get('controllers.class.itemtype') ) {
                this.queryItemIntoView()
                return
            }
            var tab = this.get('tabs')[0]
            this.showTab(tab.name)
        }.on('init').observes('tabs', 'controllers.class.itemtype'),
        queryItemIntoView: function() {
            var itemtype = this.get('controllers.class.itemtype')
            itemtype = itemtype == 'attribute' ? 'attributes' :
                itemtype == 'method' ? 'methods' : itemtype || 'index'
            this.showTab(itemtype)
            Em.run.next(this, function() {
                var name = this.get('controllers.class.name')
                this.scrollIntoView(name)
            })
        }.on('init').observes('controllers.class.itemtype', 'controllers.class.name'),
        showTab: function(tabName) {
            if ( !tabName ) {
                return
            }
            var tabs = this.get('tabs')
            var otherTabs = tabs.rejectBy('name', tabName)
            otherTabs.forEach(function(tab) {
                tab.set('isActive', false)
            })
            var activeTab = tabs.findBy('name', tabName)
            activeTab.set('isActive', true)
        },
        scrollIntoView: function(name) {
            if ( !name ) {
                return
            }
            var $el = $('[data-query-name="' + name + '"]')
            $el[0].scrollIntoView()
        }
    })

    App.ToggleTabsButtonComponent = Em.Component.extend({
        classNameBindings: ['tab.isActive:is-active']
    })

    App.ToggleTabsBodyComponent = Em.Component.extend({
        attributeBindings: ['isNotActive:hidden'],
        isNotActive: Em.computed.not('tab.isActive')
    })

    App.LinkToGithubView = Em.View.extend({
        tagName: 'a',
        attributeBindings: ['href'],
        href: function() {
            var root = 'http://github.com/amsul/shadow-ui/blob'
            var version = this.get('parentView.controller.model.project.version')
            var file = this.get('file')
            var line = this.get('line')
            return root + '/' + version + '/' + file + (line ? '#L' + line : '')
        }.property('file', 'line')
    })

    Em.Handlebars.helper('link-to-github', App.LinkToGithubView)

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
                return App.ClassItemObject.create(method)
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
                return App.ClassItemObject.create(attribute)
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

})()