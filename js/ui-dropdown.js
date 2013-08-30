
// (function( /*$*/ ) { 'use strict';


// Create the shadow extension.
shadow.extend({

    /**
     * Give it a name and alias.
     */
    name: 'picker',
    alias: 'picker',


    /**
     * Create a dictionary of things
     */
    dict: {
        options: null,
        select: [  ]
    },


    formats: {
        id: function( value/*, isParsing*/ ) {
            return value.sort(function( a, b ) { return b > a ? -1 : 1 })
        },
        full: function( value/*, isParsing*/ ) {
            return ( this.fetch( 'options' ) || [] ).
                filter( function( option ) {
                    return value.indexOf( option.id ) > -1
                }).
                sort(function( a, b ) { return b.id > a.id ? -1 : 1 }).
                map( function( option ) {
                    return option.id + ':' + option.value
                })
        }
    },


    /**
     * Set the default settings.
     */
    defaults: {
        klasses: shadow._.prefix( 'ui-face', {
            face: '',
            list: 'list',
            listItem: 'list-item',
            listOption: 'list-option'
        })
    },


    /**
     * Create the template for the face of the extension.
     */
    template: function() {

        var options = this.fetch('options'),
            selections = this.fetch('select'),
            klasses = this.ui.klasses


        // If there’s no options, show the empty dialogue.
        if ( !options ) return shadow._.node({
            klass: 'ui-face ui-face--padded',
            content: '<span class="ui-disabled">No options to select.</span>'
        })


        // Otherwise create the options list.
        return shadow._.node({
            klass: klasses.face,
            content: shadow._.node({
                el: 'ul',
                klass: klasses.list,
                content: options.map( function( option ) {
                    var isSelected = selections.indexOf( option.id ) > -1
                    return shadow._.node({
                        el: 'li',
                        klass: klasses.listItem,
                        content: shadow._.node({
                            el: 'label',
                            klass: klasses.listOption,
                            content: [
                                '<input value="' + option.id + '"' + (isSelected ? ' checked' : '') + ' type=checkbox>',
                                option.value
                            ]
                        })
                    })
                })
            })
        })
    }, //template


    /**
     * Set up everything.
     */
    init: function() {

        var component = this,
            ui = component.ui

        // Set the options for this instance.
        component.update( 'options', ui.settings.options )

        // Once the UI is ready, bind stuff.
        ui.on( 'start', function() {

            ui.$root.on( 'change', function( event ) {
                var value = ~~event.target.value
                if ( event.target.checked ) ui.add( 'select', value )
                else ui.remove( 'select', value )
            })
        })

    } //init
})


// })( jQuery );

