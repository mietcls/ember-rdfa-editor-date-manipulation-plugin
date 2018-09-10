import { next } from '@ember/runloop';
import { getOwner } from '@ember/application';
import Service from '@ember/service';
import EmberObject, { computed } from '@ember/object';
import { task } from 'ember-concurrency';

/**
 * Service responsible for correct annotation of dates
 *
 * @module editor-date-manipulation-plugin
 * @class RdfaEditorDateManipulationPlugin
 * @constructor
 * @extends EmberService
 */
const RdfaEditorDateManipulationPlugin = Service.extend({

  init(){
    this._super(...arguments);
    const config = getOwner(this).resolveRegistration('config:environment');
  },

  /**
   * Restartable task to handle the incoming events from the editor dispatcher
   *
   * @method execute
   *
   * @param {string} hrId Unique identifier of the event in the hintsRegistry
   * @param {Array} contexts RDFa contexts of the text snippets the event applies on
   * @param {Object} hintsRegistry Registry of hints in the editor
   * @param {Object} editor The RDFa editor instance
   *
   * @public
   */
  execute: task(function * (hrId, contexts, hintsRegistry, editor) {
    contexts
      .filter( ({context}) => {
        return context.find( ({object}) => object == "http://data.vlaanderen.be/ns/persoon#Geboorte" );
      })
      .forEach( (ctx) => {
        let region = ctx.region;
        hintsRegistry.removeHintsInRegion(region, hrId, this.get('who')); // I think we don't need this
        editor.replaceTextWithHTML(...region, "<strong>here be date</strong>");
      } );
    return null;
  }).restartable(),

  /**
   * Given context object, tries to detect a context the plugin can work on
   *
   * @method detectRelevantContext
   *
   * @param {Object} context Text snippet at a specific location with an RDFa context
   *
   * @return {String} URI of context if found, else empty string.
   *
   * @private
   */
  detectRelevantContext(context){
    return context.text.toLowerCase().indexOf('hello') >= 0;
  },

  /**
   * Maps location of substring back within reference location
   *
   * @method normalizeLocation
   *
   * @param {[int,int]} [start, end] Location withing string
   * @param {[int,int]} [start, end] reference location
   *
   * @return {[int,int]} [start, end] absolute location
   *
   * @private
   */
  normalizeLocation(location, reference){
    return [location[0] + reference[0], location[1] + reference[0]];
  },

  /**
   * Generates a card given a hint
   *
   * @method generateCard
   *
   * @param {string} hrId Unique identifier of the event in the hintsRegistry
   * @param {Object} hintsRegistry Registry of hints in the editor
   * @param {Object} editor The RDFa editor instance
   * @param {Object} hint containing the hinted string and the location of this string
   *
   * @return {Object} The card to hint for a given template
   *
   * @private
   */
  generateCard(hrId, hintsRegistry, editor, hint){
    return EmberObject.create({
      info: {
        label: this.get('who'),
        plainValue: hint.text,
        htmlString: '<b>hello world</b>',
        location: hint.location,
        hrId, hintsRegistry, editor
      },
      location: hint.location,
      card: this.get('who')
    });
  },

  /**
   * Generates a hint, given a context
   *
   * @method generateHintsForContext
   *
   * @param {Object} context Text snippet at a specific location with an RDFa context
   *
   * @return {Object} [{dateString, location}]
   *
   * @private
   */
  generateHintsForContext(context){
    const hints = [];
    const index = context.text.toLowerCase().indexOf('hello');
    const text = context.text.slice(index, index+5);
    const location = this.normalizeLocation([index, index + 5], context.region);
    hints.push({text, location});
    return hints;
  }
});

RdfaEditorDateManipulationPlugin.reopen({
  who: 'editor-plugins/date-manipulation-card'
});
export default RdfaEditorDateManipulationPlugin;
