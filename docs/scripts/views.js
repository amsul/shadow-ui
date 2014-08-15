define(function(require) {

    'use strict';

    var Em = require('ember')
    var marked = require('marked')
    var hljs = require('hljs')

    Em.View.reopen({
        didInsertElement: function() {
            this._super()
            var $pre = this.$().find('pre')
            if ( $pre.length ) {
                $pre.each(function() {
                    var pre = this
                    var codeBlock = pre.children[0]
                    var content = codeBlock.textContent
                    var language = codeBlock.className.replace(/^lang-/, '')
                    if ( !language ) {
                        console.log(pre)
                        throw new Error('Need the language name to correctly syntax highlight.')
                    }
                    pre.classList.add('hljs')
                    var highlight = hljs.highlight(language, content)
                    codeBlock.innerHTML = highlight.value
                })
            }
        }
    })

    var MarkdownView = Em.View.extend({
        init: function() {
            this._super()
            var content = this.get('content')
            if ( content ) {
                content = marked(content)
                var div = document.createElement('div')
                div.innerHTML = content + '<span></span>'
                content = div.innerHTML
            }
            else {
                content = ''
            }
            var template = Em.Handlebars.compile(content)
            this.set('template', template)
        }
    })

    Em.Handlebars.helper('md', MarkdownView)

    var LinkToGithubView = Em.View.extend({
        tagName: 'a',
        attributeBindings: ['href'],
        href: function() {
            var root = 'http://github.com/amsul/shadow-ui/blob'
            var version = this.get('parentView.controller.model.project.version')
            var file = this.get('file')
            var line = this.get('line')
            return root + '/' + version + '/' + file + (line ? '#L' + line : '')
        }.property('file', 'line')
    })

    Em.Handlebars.helper('link-to-github', LinkToGithubView)

    return {
        MarkdownView: MarkdownView,
        LinkToGithubView: LinkToGithubView
    }
})