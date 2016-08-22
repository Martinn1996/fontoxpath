define([
	'./Selector',
	'./Specificity'
], function (
	Selector,
	Specificity
) {
	'use strict';

	/**
	 * @param  {String}  variableName
	 */
	function VarRef (variableName) {
		Selector.call(this, new Specificity({}));

		this._variableName = variableName;
	}

	VarRef.prototype = Object.create(Selector.prototype);
	VarRef.prototype.constructor = VarRef;

	VarRef.prototype.equals = function (otherSelector) {
		return otherSelector instanceof VarRef &&
			this._variableName === otherSelector.variableName;
	};

	VarRef.prototype.evaluate = function (dynamicContext) {
		var value = dynamicContext.variables[this._variableName];
		if (!value) {
			throw new Error('ERR:XPST0008, The variable ' + this._variableName + ' is not in scope.');
		}

		return value;
	};

	return VarRef;
});