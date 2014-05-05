(function(factory) {

    // Register as an anonymous module.
    if ( typeof define == 'function' && define.amd )
        define(['shadow','jquery'], factory)

    // Or using browser globals.
    else factory(shadow, jQuery)

}(function(shadow, $) { 'use strict';


var el = shadow._.el


/**
 * Construct a picker object.
 */
shadow('picker', {

    extend: 'data-field',

    attrs: {
        opened: false
    },

    classNames: {
        host: '',
        opened: '--opened',
        holder: 'holder',
        frame: 'frame',
        wrap: 'wrap',
        box: 'box'
    },
    classNamesPrefix: 'picker',


    /**
     * Create a picker object.
     */
    create: function(options) {

        var picker = this._super(options)
        var classes = picker.classNames

        // Setup the states of the host element.
        var $host = picker.$host.addClass(classes.host)
        var isOpened = picker.get('opened', { bound: true }, function(value) {
            $host.toggleClass(classes.opened, value)
        })

        // If it’s already opened, bind the document click.
        if ( isOpened ) {
            bindDocumentClickToClose(picker)
        }

        // Bind the open/close triggers.
        var eventNames = 'click.' + picker.id + ' focusin.' + picker.id
        var onClickToOpen = function(event) {
            event.stopPropagation()
            bindDocumentClickToClose(picker)
            picker.open()
        }
        picker.$el.on(eventNames, onClickToOpen)
        picker.$host.on(eventNames, onClickToOpen)

        return picker
    },


    /**
     * Build out the templating for the picker.
     */
    template: function() {

        var picker = this
        var classes = picker.classNames

        // Create the nodes that contain the content.
        var pickerHolder = el(classes.holder,
            el(classes.frame,
                el(classes.wrap,
                    el(classes.box,
                        picker.content)
                    )
                )
            )

        var frag = document.createDocumentFragment()
        frag.appendChild(pickerHolder)
        return frag
    }, //template


    /**
     * Open & close the picker.
     */
    open: function() {
        if ( !this.attrs.opened ) this.attrs.opened = true
    },
    close: function() {
        if ( this.attrs.opened ) this.attrs.opened = false
    },
    toggle: function() {
        this.attrs.opened = !this.attrs.opened
    }

}) //shadow('picker')


/**
 * When the document is clicked, close the picker.
 */
function bindDocumentClickToClose(picker) {

    $(document).on('click', function() {
        picker.close()
    })
}


}));