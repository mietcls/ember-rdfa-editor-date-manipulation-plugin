import Service from '@ember/service';
import { task } from 'ember-concurrency';
import moment from 'moment';

/**
 * Service responsible for correct annotation of dates
 *
 * @module editor-date-manipulation-plugin
 * @class RdfaEditorDateManipulationPlugin
 * @constructor
 * @extends EmberService
 */
const RdfaEditorDateManipulationPlugin = Service.extend({

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
      .filter(this.detectRelevantContext)
      .forEach( (ctx) => {
        editor.replaceNodeWithHTML(ctx.richNode.parent.parent.domNode , this.createCurrentDateHtml(ctx));
      } );
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
    //Seek for:  <span class="annotation" property="besluit:geplandeStart" datatype="xsd:date" content=""><span typeOf="ext:currentDate">&nbsp;</span></span>
    if(!context.context.find( ({ predicate, object }) => predicate === 'a' && object === 'http://mu.semte.ch/vocabularies/ext/currentDate'))
      return false;
    return true;
  },

  createCurrentDateHtml(context){
    let nodeToReplace = context.richNode.parent.parent;
    let newDomNode = nodeToReplace.domNode.cloneNode(true);
    newDomNode.textContent = moment().format('LL');
    newDomNode.setAttribute('content', moment().format('YYYY-MM-DD'));
    return newDomNode.outerHTML;
  }
});

RdfaEditorDateManipulationPlugin.reopen({
  who: 'editor-plugins/date-manipulation-card'
});
export default RdfaEditorDateManipulationPlugin;
