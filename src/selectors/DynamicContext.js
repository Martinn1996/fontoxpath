import { ready } from './util/iterators';
import DateTime from './dataTypes/valueTypes/DateTime';
import DayTimeDuration from './dataTypes/valueTypes/DayTimeDuration';

/**
 * @typedef {./dataTypes/Sequence}
 */
let Sequence;

/**
 * @typedef {!{isInitialized: boolean, currentDateTime: ?DateTime, implicitTimezone: ?DayTimeDuration}}
 */
let TemporalContext;

/**
 * All possible permutations
 * @typedef {!{contextItemIndex: !number, contextSequence: ?Sequence}|{variables: Object}}|{contextItemIndex: number, contextSequence: !Sequence, variables: !Object, createSelectorFromXPath: function(string):!./Selector}}
 */
let ScopingType;

class DynamicContext {
	/**
	 * @param  {{contextItem: ?./dataTypes/Value, contextItemIndex: number, contextSequence: !Sequence, domFacade: ?IDomFacade, variables: !Object, resolveNamespacePrefix: function(string):?string, createSelectorFromXPath: function(string):!./Selector, nodesFactory: !INodesFactory}}  context  The context to overlay
	 * @param  {!TemporalContext=}  temporalContext
	 */
	constructor (context, temporalContext = { isInitialized: false, currentDateTime: null, implicitTimezone: null}) {
		this._temporalContext = temporalContext;

		/**
		 * @type {!number}
		 * @const
		 */
		this.contextItemIndex = context.contextItemIndex;

		/**
		 * @type {!Sequence}
		 * @const
		 */
		this.contextSequence = context.contextSequence;

		/**
		 * @type {?./dataTypes/Value}
		 * @const
		 */
		this.contextItem = context.contextItem;

		/**
		 * @type {?IDomFacade}
		 * @const
		 */
		this.domFacade = context.domFacade;

		/**
		 * @type {!Object}
		 * @const
		 */
		this.variables = context.variables;

		/**
		 * @type {!function(string):?string}
		 * @const
		 */
		this.resolveNamespacePrefix = context.resolveNamespacePrefix;

		this.createSelectorFromXPath = context.createSelectorFromXPath;

		/**
		 * @type {!INodesFactory}
		 * @const
		 */
		this.nodesFactory = context.nodesFactory;
	}

	getCurrentDateTime () {
		if (!this._temporalContext.isInitialized) {
			this._temporalContext.isInitialized = true;

			this._temporalContext.currentDateTime = DateTime.fromString(new Date().toISOString()),
			this._temporalContext.implicitTimezone = DayTimeDuration.fromString('PT0S');
		}
		return this._temporalContext.currentDateTime;
	}

	getImplicitTimezone () {
		if (!this._temporalContext.isInitialized) {
			this._temporalContext.isInitialized = true;

			this._temporalContext.currentDateTime = DateTime.fromString(new Date().toISOString()),
			this._temporalContext.implicitTimezone = DayTimeDuration.fromString('PT0S');
		}
		return this._temporalContext.implicitTimezone;
	}

	/**
	 * @param   {!Object<string, !./dataTypes/Sequence>}    variables
	 * @return  {!DynamicContext}
	 */
	scopeWithVariables (variables) {
		return new DynamicContext(
			{
				contextItemIndex: this.contextItemIndex,
				contextItem: this.contextItem,
				contextSequence: this.contextSequence,

				domFacade: this.domFacade,
				variables: Object.assign({}, this.variables, variables),
				resolveNamespacePrefix: this.resolveNamespacePrefix,
				createSelectorFromXPath: this.createSelectorFromXPath,
				nodesFactory: this.nodesFactory
			},
			this._temporalContext);
	}

	/**
	 * @param   {number}             contextItemIndex
	 * @param   {./dataTypes/Value}  contextItem
	 * @param   {Sequence}           [contextSequence]
	 * @return  {!DynamicContext}
	 */
	scopeWithFocus (contextItemIndex, contextItem, contextSequence) {
		return new DynamicContext(
			{
				contextItemIndex: contextItemIndex,
				contextItem: contextItem,
				contextSequence: contextSequence || this.contextSequence,

				domFacade: this.domFacade,
				variables: this.variables,
				resolveNamespacePrefix: this.resolveNamespacePrefix,
				createSelectorFromXPath: this.createSelectorFromXPath,
				nodesFactory: this.nodesFactory
			},
			this._temporalContext);
	}

	/**
	 * @param {function(string):string?} namespaceResolver
	 *
	 * @return {!DynamicContext}
	 */
	scopeWithNamespaceResolver (namespaceResolver) {
		return new DynamicContext(
			{
				contextItemIndex: this.contextItemIndex,
				contextItem: this.contextItem,
				contextSequence: this.contextSequence,

				domFacade: this.domFacade,
				variables: this.variables,
				resolveNamespacePrefix: namespaceResolver,
				createSelectorFromXPath: this.createSelectorFromXPath,
				nodesFactory: this.nodesFactory
			},
			this._temporalContext);
	}

	/**
	 * @param   {!./dataTypes/Sequence}  contextSequence
	 * @return  {!Iterator<!DynamicContext>}
	 */
	createSequenceIterator (contextSequence) {
		let i = 0;
		/**
		 * @type {!Iterator<!./dataTypes/Value>}
		 */
		const iterator = contextSequence.value();
		return /** @type {!Iterator<!DynamicContext>}*/ ({
			next: () => {
				const value = iterator.next();
				if (value.done) {
					return value;
				}
				if (!value.ready) {
					return value;
				}
				return ready(this.scopeWithFocus( i++, value.value, contextSequence));
			}
		});
	}
}

export default DynamicContext;
