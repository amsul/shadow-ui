
/**
 * Build a shadow element.
 */
shadow.build = function($element, shadowName, shadowOptions) {
    shadowOptions = shadowOptions || {}
    shadowOptions.$el = $element
    shadowName = _.casePascal(shadowName)
    if (
        !(shadowName in shadow) ||
        !shadow.Object.isClassOf(shadow[shadowName])
    ) {
        throw new ReferenceError('There is no shadow UI ' +
            'registered by the name of `' + shadowName + '`.')
    }
    return shadow[shadowName].create(shadowOptions)
}



/**
 * Build all the named shadow elements.
 */
shadow.buildAll = function(shadowName, shadowOptions) {
    var $elements = $('[data-ui="' + shadowName + '"]')
    $elements.each(function() {
        shadow.build($(this), shadowName, shadowOptions)
    })
}
