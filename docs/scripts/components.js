define(function(require) {

    'use strict';

    var Em = require('ember')

    var ListParamsComponent = Em.Component.extend({
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

    var ToggleTabsComponent = Em.Component.extend(Ember.ControllerMixin, {
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
            itemtype = itemtype || 'index'
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

    var ToggleTabsButtonComponent = Em.Component.extend({
        classNameBindings: ['tab.isActive:is-active']
    })

    var ToggleTabsBodyComponent = Em.Component.extend({
        attributeBindings: ['isNotActive:hidden'],
        isNotActive: Em.computed.not('tab.isActive')
    })

    var BlockNoteComponent = Em.Component.extend({
        classNames: ['notification']
    })

    var CrossLinkComponent = Em.Component.extend(Ember.ControllerMixin, {

        tagName: 'span',

        needs: ['application'],
        data: Em.computed.alias('controllers.application.model'),

        file: null,
        line: null,
        to: null,
        section: null,

        fileLink: function() {
            var file = this.get('file')
            var line = this.get('line')
            if ( !file ) {
                return
            }
            var root = 'http://github.com/amsul/shadow-ui/blob'
            var version = this.get('parentView.controller.model.project.version')
            return root + '/' + version + '/' + file + (line ? '#L' + line : '')
        }.property('file', 'line'),

        toSplit: function() {
            var to = this.get('to')
            if ( !to ) {
                throw new Error('A cross-link requires a "to" property.')
            }
            return to.split('#')
        }.property('to'),
        toNamespace: function() {
            return this.get('toSplit.0')
        }.property('toSplit.0'),
        toSubspace: function() {
            return this.get('toSplit.1')
        }.property('toSplit.1'),

        categoryName: Em.computed.alias('toNamespace'),
        categoryType: function() {
            var data = this.get('data')
            var toNamespace = this.get('toNamespace')
            var categoryClass = data.classes.findBy('name', toNamespace)
            if ( categoryClass ) {
                return 'class'
            }
            var categoryModule = data.modules.findBy('name', toNamespace)
            if ( categoryModule ) {
                return 'module'
            }
        }.property('toNamespace', 'data'),

        itemName: Em.computed.alias('toSubspace'),
        itemType: function() {
            var data = this.get('data')
            var toSubspace = this.get('toSubspace')
            var section = this.get('section')
            if ( section ) {
                return section == 'attributes' ? 'attribute' :
                    section == 'properties' ? 'property' :
                    section == 'methods' ? 'method' :
                    section
            }
            var itemAttribute = data.attributes.findBy('name', toSubspace)
            if ( itemAttribute ) {
                return 'attribute'
            }
            var categoryModule = data.properties.findBy('name', toSubspace)
            if ( categoryModule ) {
                return 'property'
            }
        }.property('toSubspace', 'data')

    })

    return {
        ListParamsComponent: ListParamsComponent,
        ToggleTabsComponent: ToggleTabsComponent,
        ToggleTabsButtonComponent: ToggleTabsButtonComponent,
        ToggleTabsBodyComponent: ToggleTabsBodyComponent,
        BlockNoteComponent: BlockNoteComponent,
        CrossLinkComponent: CrossLinkComponent,
    }
})