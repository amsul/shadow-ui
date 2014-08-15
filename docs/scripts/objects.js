define(function(require) {

    'use strict';

    var Em = require('ember')

    var ClassItemObject = Em.Object.extend({
        isMethod: Em.computed.equal('itemtype', 'method'),
        isStatic: Em.computed.equal('static', 1),
        isRequired: Em.computed.equal('required', 1),
        isReadOnly: Em.computed.equal('readonly', true),
        isWriteOnce: Em.computed.equal('writeonce', ''),
        isInherited: Em.computed.any('inherits'),
        isExtended: false,
        queryName: function() {
            var queryName = this.get('name')
            var params = this.get('params')
            if ( params ) {
                queryName += '(' + params.mapProperty('name').join('-') + ')'
            }
            return queryName
        }.property('name', 'params[]')
    })

    return {
        ClassItemObject: ClassItemObject
    }
})