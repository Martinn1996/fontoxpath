define([
	'fontoxml-blueprints',
	'../Selector',
	'../dataTypes/Sequence'
], function (
	blueprints,
	Selector,
	Sequence
) {
	'use strict';

	var blueprintQuery = blueprints.blueprintQuery;

	/**
	 * @param  {Selector}  descendantSelector
	 */
	function DescendantAxis (descendantSelector) {
		Selector.call(this, descendantSelector.specificity, Selector.RESULT_ORDER_SORTED);

		this._descendantSelector = descendantSelector;
	}

	DescendantAxis.prototype = Object.create(Selector.prototype);
	DescendantAxis.prototype.constructor = DescendantAxis;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	DescendantAxis.prototype.matches = function (node, blueprint) {
		return blueprintQuery.findDescendants(blueprint, node, function (descendantNode) {
			return this._descendantSelector.matches(descendantNode, blueprint);
		}.bind(this)).length > 0;
	};

	DescendantAxis.prototype.equals = function (otherSelector) {
		return otherSelector instanceof DescendantAxis &&
			this._descendantSelector.equals(otherSelector._descendantSelector);
	};

	DescendantAxis.prototype.evaluate = function (dynamicContext) {
		var contextItem = dynamicContext.contextItem,
			domFacade = dynamicContext.domFacade;

		// Assume singleton, since axes are only valid in paths
		var isMatchingDescendant = function (descendantNode) {
				var scopedContext = dynamicContext.createScopedContext({
						contextItem: Sequence.singleton(descendantNode),
						contextSequence: null
					});
				return this._descendantSelector.evaluate(scopedContext).getEffectiveBooleanValue();
			}.bind(this);
		return new Sequence(blueprintQuery.findDescendants(
			domFacade,
			contextItem.value[0],
			isMatchingDescendant,
			true));
	};


	return DescendantAxis;
});
