(function(factory) {

    // Register as an anonymous module.
    if ( typeof define == 'function' && define.amd )
        define(['shadow','jquery'], factory)

    // Or using browser globals.
    else factory(shadow, jQuery)

}(function(shadow, $) { 'use strict';


/**
 * Construct a picker object.
 */
shadow('picker', {

    extend: 'text-field',

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

    template: function() {

        var picker = this
        var classes = picker.classNames
        var el = shadow._.el

        var frag = document.createDocumentFragment()

        // Create the nodes set as the content.
        var contentNodes = picker.content
        if ( contentNodes ) {
            if ( !Array.isArray(contentNodes) ) {
                contentNodes = [contentNodes]
            }
            contentNodes.forEach(function(contentNode) {
                frag.appendChild(contentNode)
            })
        }

        // Create the nodes that contain the actual picker.
        var valueHolder = el()
        picker.get('value', { bound: true }, function(value) {
            valueHolder.textContent = value
        })
        var pickerHolder = el(classes.holder,
            el(classes.frame,
                el(classes.wrap,
                    el(classes.box,
                        valueHolder)
                    )
                )
            )
        frag.appendChild(pickerHolder)

        // Create the states of the source element.
        var $el = picker.$el.addClass(classes.host)
        picker.get('opened', { bound: true }, function(value) {
            $el.toggleClass(classes.opened, value)
        })

        return frag
    },


    /**
     *  Create a picker object.
     */
    create: function(options) {

        // Create the shadow object.
        var picker = this._super(options)

        // Return the new picker object.
        return picker
    }

}) //shadow('picker')


}));