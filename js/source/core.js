
function shadow(shadowName, shadowOptions) {
    if ( !shadowName ) {
        throw new ReferenceError('The `shadowName` is required to register a UI interface.')
    }
    var extendingName = 'Element'
    shadowOptions = $.extend(true, {}, shadowOptions)
    if ( shadowOptions.extend ) {
        extendingName = shadowOptions.extend
        delete shadowOptions.extend
    }
    extendingName = _.casePascal(extendingName)
    if ( !_.isTypeOf(shadow[extendingName], 'object') ||
        extendingName != 'Element' && !shadow.Element.is('classOf', shadow[extendingName])
    ) {
        throw new ReferenceError('There is no shadow element named “' + extendingName + '”.')
    }
    if ( shadowOptions.name ) {
        throw new ReferenceError('The `name` property of the `shadowOptions` is reserved.')
    }
    shadowOptions.name = _.casePascal(shadowName)
    shadow[extendingName].extend(shadowOptions)
    shadow.buildAll(shadowName)
}


Object.defineProperty(shadow, 'IS_DEBUGGING', {
    writable: true,
    value: true
})


// /**
//  * Get the shadow element of a node.
//  */
// shadow.getShadow = function($element) {
//     $element = $element instanceof jQuery ? $element : $($element)
//     return $element.data('shadow.el')
// }
