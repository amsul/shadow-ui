# {%= pkg.name %} v{%= pkg.version %} [![{%= pkg.name %} build status](https://travis-ci.org/amsul/pick.js.png)](https://travis-ci.org/amsul/pick.js)

{%= pkg.description %}




<br>
## Building with Grunt

[Grunt](http://gruntjs.com/) `~{%= grunt.version %}` is used to build the project files. To get started, clone the project and then run:

- `npm install` to get the required node modules.
- `grunt --verbose` to confirm you have all the dependencies.


Read the Gruntfile to see the build tasks and relative directories of the source files.




<br>
## Bugs

Before opening a new issue, please search the existing [Issues]({%= pkg.bugs %}) for anything similar – there might already be an answer to your problem. You might also wanna check out the [Contributing]({%= meta.gitrepo_url %}/blob/gh-pages/CONTRIBUTING.md) guide.




<br>
## Contributing

Before contributing any code to the project, please take a look at the [Contributing]({%= meta.gitrepo_url %}/blob/gh-pages/CONTRIBUTING.md) guide.




<br>
## Versioning

To maintain consistency in the sort of changes to expect with version bumps, [Semantic Versioning guidelines](http://semver.org/) will be followed as closely as possible:

`<major>.<minor>.<patch>`

Constructed as such:

- `major`: breaks backward compatibility (resets the `minor` and `patch`)
- `minor`: new additions with backward compatibility (resets the `patch`)
- `patch`: bug fixes and misc changes




<br><br>

---

© {%= grunt.template.date('yyyy') %} [Amsul](http://twitter.com/amsul_)

Licensed under [{%= pkg.licenses[0].type %}]({%= pkg.licenses[0].url %})