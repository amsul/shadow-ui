
/*!
 * <%= pkg.title %> v<%= pkg.version %>, <%= grunt.template.today("yyyy/mm/dd") %>
 * By <%= pkg.author.name %>, <%= pkg.author.url %>
 * Hosted on <%= pkg.homepage %>
 * Licensed under <%= pkg.licenses[0].type %>
 */

(function (global, factory) {

    // Setup the exports for Node module pattern...
    if ( typeof module == 'object' && typeof module.exports == 'object' )
        module.exports = factory(global, global.jQuery)

    // ...AMD...
    else if ( typeof define == 'function' && define.amd )
        define([global, 'jquery'], factory)

    // ...and basic `script` includes.
    else global.shadow = factory(global, global.jQuery)

}(this, function(window, $, undefined) {

'use strict';
