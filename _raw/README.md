# {%= pkg.title %} v{%= pkg.version %} [![{%= pkg.title %} build status](https://travis-ci.org/amsul/{%= pkg.name %}.png)](https://travis-ci.org/amsul/{%= pkg.name %})

{%= pkg.description %}

- [Homepage]({%= pkg.homepage %})
- [Docs]({%= pkg.homepage %}/{%= dirs.dest.docs %})


### Get started:

- [Download the package]({%= meta.gitrepo_url %}/archive/{%= pkg.version %}.zip), or
- `git clone git://github.com/amsul/{%= pkg.name %}.git`, or
- `bower install {%= pkg.name %}`


### Browser support:

Aim for v1.0 is to support the following browsers:

- IE 8+
- Chrome
- Safari
- Firefox
- Opera
- Blackberry 6.0+
- Android 3.2+
- All other modern browsers


<br>
## Building

[Grunt](http://gruntjs.com/) `~{%= grunt.version %}` is used to build the project files. To get started, clone the project and then run:

- `npm install` to get the required node modules.
- `grunt strict --verbose` to confirm you have all the dependencies.


Read the Gruntfile to see the build tasks and relative directories of the source files.



<br>
## Versioning

In order to make it easy to understand the type of changes expected with each version bump, [semantic versioning guidelines](http://semver.org/) will be followed as closely as possible:

`<major>.<minor>.<patch>`

Where:

- `major`: breaks backward compatibility (resets the `minor` and `patch`)
- `minor`: new additions with backward compatibility (resets the `patch`)
- `patch`: bug fixes and misc changes



<br>
---

© {%= grunt.template.date('yyyy') %} [Amsul](http://twitter.com/amsul_)

Licensed under [{%= pkg.licenses[0].type %}]({%= pkg.licenses[0].url %})

