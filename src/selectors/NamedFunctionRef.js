define([
	'./Selector',
	'./Specificity',
	'./dataTypes/Sequence',
	'./dataTypes/FunctionItem',
	'./functions/functionRegistry'
], function (
	Selector,
	Specificity,
	Sequence,
	FunctionItem,
	functionRegistry
) {
	'use strict';

	function NamedFunctionRef (functionName, arity) {
		Selector.call(this, new Specificity({external: 1}), Selector.RESULT_ORDER_UNSORTED);

		this._functionName = functionName;
		this._arity = arity;

		var functionProperties = functionRegistry.getFunctionByArity(this._functionName, this._arity);

		if (!functionProperties) {
			throw new Error('XPST0017: Function ' + functionName + ' with arity of ' + arity + ' not registered. ' + functionRegistry.getAlternativesAsStringFor(functionName));
		}

		this._functionItem = new FunctionItem(
			functionProperties.callFunction,
			functionProperties.argumentTypes,
			arity,
			functionProperties.returnType);
	}

	NamedFunctionRef.prototype = Object.create(Selector.prototype);
	NamedFunctionRef.prototype.constructor = NamedFunctionRef;

	NamedFunctionRef.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof NamedFunctionRef &&
			this._functionName === otherSelector._functionName &&
			this._arity === otherSelector._arity;
	};

	NamedFunctionRef.prototype.evaluate = function (dynamicContext) {
		return Sequence.singleton(this._functionItem);
	};

	return NamedFunctionRef;
});