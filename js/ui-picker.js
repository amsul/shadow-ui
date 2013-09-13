
// (function( /*$*/ ) { 'use strict';


// Create the shadow extension.
shadow( 'picker', {

    /**
     * Give it a jQuery alias.
     */
    alias: 'picker',


    /**
     * Create a dictionary of things.
     */
    dict: {
        options: [],
        select: null,
        highlight: null
    },


    /**
     * Create a formatting collection.
     */
    formats: {

        id: function( value, isParsing ) {

            var single = this.ui.settings.single

            // If we’re trying to parse, match a list of IDs.
            // Then return the length of the match.
            if ( isParsing ) {
                var match = value.match( single ? /^\d+/ : /((?:(?:^|,)(?:\d+))+)/ )
                return match && match[0].length
            }

            // Otherwise return the sorted list of IDs.
            return single ? value : value.sort(function( a, b ) { return b > a ? -1 : 1 }).join(',')
        },

        full: function( value, isParsing ) {

            var single = this.ui.settings.single

            // If we’re trying to parse, match a list of IDs and values.
            // Then return the length of the match.
            if ( isParsing ) {
                var match = value.match( single ? /^\d+:\w+/ : /((?:(?:^|,)(?:\d+:\w+))+)/ )
                return match && match[0].length
            }


            // Return the complete list of options with IDs.
            return this.ui.get( 'options' ).
                filter( function( option ) {
                    return single ? value === option.id : value.indexOf( option.id ) > -1
                }).
                sort(function( a, b ) { return b.id > a.id ? -1 : 1 }).
                map( function( option ) {
                    return option.id + ':' + option.value
                }).join(',')
        }
    },


    /**
     * Set the default settings.
     */
    defaults: {
        klasses: shadow._.prefix( 'ui-face', {
            face: '',
            facePadded: '--padded',
            list: 'list',
            listItem: 'list-item',
            listOption: 'list-option'
        })
    },


    /**
     * Set up everything.
     */
    init: function( formatValueHash ) {

        var ui = this.ui,
            single = ui.settings.single


        // If it’s not single, allow multiple selections.
        if ( !single ) {
            ui.set( 'select', [] )
        }


        // Set the starting selections based on the value hash.
        if ( formatValueHash.id ) {
            ui.set( 'select', single ?
                ~~formatValueHash.id :
                formatValueHash.id.split(',').map(function(val) { return ~~val })
            )
        }
        else if ( formatValueHash.full ) {
            ui.set( 'select', single ?
                ~~formatValueHash.full.split(':')[0] :
                formatValueHash.full.split(',').map(function(val) { return ~~val.split(':')[0] })
            )
        }


        // Grab the context.
        var contextSelector = 'script[type="json/ui-context"]',
            $context = ui.$input ? ui.$input.next(contextSelector) : ui.$source.children(contextSelector),
            context = JSON.parse( $context.html() )


        // Set the options for this instance.
        ui.set( 'options', context )


        // Once the UI is ready, bind stuff.
        ui.on( 'start', function() {

            ui.$root.on( 'change', function( event ) {
                var value = ~~event.target.value
                if ( event.target.checked ) {
                    ui[ ui.settings.single ? 'set' : 'add' ]( 'select', value )
                }
                else if ( !ui.settings.single ) {
                    ui.remove( 'select', value )
                }
            })
        })

    }, //init


    /**
     * Create the template for the face of the extension.
     */
    template: function() {

        var ui = this.ui,
            options = ui.get('options'),
            selections = ui.get('select'),
            settings = ui.settings,
            klasses = ui.klasses,
            single = settings.single


        // If there’s no options, show the empty dialogue.
        if ( !options.length ) return shadow._.node({
            klass: [ klasses.face, klasses.facePadded ],
            content: '<span class="ui-disabled">Nothing to pick.</span>'
        })


        // Otherwise create the options list.
        return shadow._.node({
            klass: klasses.face,
            content: shadow._.node({
                el: 'ul',
                klass: klasses.list,
                content: options.map( function( option ) {
                    var isSelected = single ? selections === option.id : selections.indexOf( option.id ) > -1
                    return shadow._.node({
                        el: 'li',
                        klass: klasses.listItem,
                        content: shadow._.node({
                            el: 'label',
                            klass: klasses.listOption,
                            content: [
                                '<input',
                                    ' value="' + option.id + '"',
                                    isSelected ? ' checked' : '',
                                    ' type=', settings.single ? 'radio' : 'checkbox',
                                    ' name="' + settings.nameHidden + '_option"',
                                '>',
                                option.value
                            ]
                        })
                    })
                })
            })
        })
    } //template
})

// })( jQuery );

