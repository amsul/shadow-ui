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

    return {
        ListParamsComponent: ListParamsComponent,
        ToggleTabsComponent: ToggleTabsComponent,
        ToggleTabsButtonComponent: ToggleTabsButtonComponent,
        ToggleTabsBodyComponent: ToggleTabsBodyComponent,
    }
})