import Service from '@ember/service';
import { task } from 'ember-concurrency';
import moment from 'moment';

/**
 * Service responsible for setting current date/datetime when rdfaInstructive is encountered.
 *
 * ---------------------------------------------------
 * CODE REVIEW NOTES
 * ---------------------------------------------------
 *
 *  INTERACTION PATTERNS
 *  --------------------
 *  For all incoming contexts, first looks whether there is an rdfa instructive to set current date/datetime.
 *  If encountered, the node (and its parent node, specifying whether date or date time should be set), are replaced with current date info.
 *
 *  POTENTIAL ISSUES/TODO
 *  ---------------------
 *  - The current usage of the plugin, forces us to insert invalid RDFA to make it work. (see README.md on usage)
 *    If this the setting of current date fails for some reason, we end up with basically a broken document.
 *
 *      TODO: Correct the RDFA instructive to contain valid RDFA while still containing the info we need to specify the behaviour we want.
 *
 *  - The current implementation expects context.richNode to be a single element, new Marawa always returns array [RichNode].
 *
 *      TODO: update code
 *
 *  - Danger that if two auto-document-modifying plugins modify the same node or its parent before current plugin executes its behaviour,
 *    the domNode to replace is not attached to domTree anymore and the plugin fails.
 *    (Probably we will encounter these case not only in 'auto' plugins)
 *
 *      TODO: some check if node exists and fallback behaviour (i.e rescan or something) when current plugin is about to replace an unattached node.
 *  - TODO:  restarable tasks do not seem to be the safest option
 * ---------------------------------------------------
 * END CODE REVIEW NOTES
 * ---------------------------------------------------
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
        if(ctx.richNode.length == 0 || ! ctx.richNode || ! ctx.richNode[0].parent ) {
          // TODO: the context does not exist anymore.  Do we need to
          // recalculate the context again and see if the new nodes
          // can be used for updating the contents?
          console.warn( "Context does not have right parents for setting the date" );
        } else {
          editor.replaceNodeWithHTML(ctx.richNode[0].parent.parent.domNode , this.setCurrentDateHtml(ctx));
        }
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
    if(context.context.find( ({ predicate, object }) => predicate === 'a' && object === 'http://mu.semte.ch/vocabularies/ext/currentDate'))
      return true;
    return false;
  },

  belongsToDateTime(context){
    return context.context.slice(-2)[0].datatype == 'http://www.w3.org/2001/XMLSchema#dateTime';
  },

  setCurrentDateHtml(context){
    let nodeToReplace = context.richNode[0].parent.parent.domNode;
    if(this.belongsToDateTime(context)){
      return this.createCurrentDateTimeHtml(nodeToReplace);
    }
    return this.createDateHtml(nodeToReplace);
  },

  createDateHtml(nodeToReplace){
    let newDomNode = nodeToReplace.cloneNode(true);
    newDomNode.textContent = moment().format('LL');
    newDomNode.setAttribute('content', moment().format('YYYY-MM-DD'));
    return newDomNode.outerHTML;
  },

  createCurrentDateTimeHtml(nodeToReplace){
    let current = moment();
    let content = current.toISOString();
    let value = `${current.format('LL')} ${current.hour()}:${current.minutes()}`;

    let newDomNode = nodeToReplace.cloneNode(true);
    newDomNode.textContent = value;
    newDomNode.setAttribute('content', content);
    return newDomNode.outerHTML;
  }

});

RdfaEditorDateManipulationPlugin.reopen({
  who: 'editor-plugins/date-manipulation-card'
});
export default RdfaEditorDateManipulationPlugin;
