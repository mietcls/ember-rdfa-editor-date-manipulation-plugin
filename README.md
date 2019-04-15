ember-rdfa-editor-date-manipulation-plugin
==============================================================================

plugin responsible for automatically manipulating a date according to an RDFA instructive .

Installation
------------------------------------------------------------------------------

```
ember install @lblod/ember-rdfa-editor-date-manipulation-plugin
```


Usage
------------------------------------------------------------------------------
An instructive is an RDFA snippet you insert in your template.

Currently the following snippet should be inserted:
```
<span property="a:specificProperty" datatype="xsd:date" content="">
  <span typeOf="ext:currentDate">&nbsp;</span>
</span>
```
and will result, once triggered by the eventProcessor, in:
```
<span property="a:specificProperty" datatype="xsd:date" content="2018-09-17">
  17 september 2018
</span>
```

The text value of the span is moment.js long format date, localized.
The config of moment.js should be provided by the parent app, in the config/environment.js:

```
let ENV = {
    moment: {
      includeLocales: ['nl'],
  }
}
```

If used in `datatype="xsd:dateTime"`, current datetime  will be set.

Contributing
------------------------------------------------------------------------------

### Installation

* `git clone <repository-url>`
* `cd ember-rdfa-editor-date-manipulation-plugin`
* `npm install`

### Linting

* `npm run lint:hbs`
* `npm run lint:js`
* `npm run lint:js -- --fix`

### Running tests

* `ember test` – Runs the test suite on the current Ember version
* `ember test --server` – Runs the test suite in "watch mode"
* `ember try:each` – Runs the test suite against multiple Ember versions

### Running the dummy application

* `ember serve`
* Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
