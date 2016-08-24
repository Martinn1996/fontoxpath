define([
	'../Selector',
	'../dataTypes/BooleanValue',
	'../dataTypes/Sequence'
], function (
	Selector,
	BooleanValue,
	Sequence
) {
	'use strict';

	function QuantifiedExpression (quantifier, inClauses, satisfiesExpr) {
		var specificity = inClauses.reduce(function (specificity, inClause) {
			return specificity.add(inClause[1].specificity);
		}, satisfiesExpr.specificity);
		Selector.call(this, specificity);

		this._quantifier = quantifier;
		this._inClauses = inClauses;
		this._satisfiesExpr = satisfiesExpr;
	}

	QuantifiedExpression.prototype = Object.create(Selector.prototype);
	QuantifiedExpression.prototype.constructor = QuantifiedExpression;

	QuantifiedExpression.prototype.equals = function (otherSelector) {
		// if (otherSelector === this) {
		// 	return true;
		// }

		return otherSelector === this;
	};

	QuantifiedExpression.prototype.evaluate = function (dynamicContext) {
		var evaluatedInClauses = this._inClauses.map(function (inClause) {
			return {
				name: inClause[0],
				valueSequence: inClause[1].evaluate(dynamicContext)
			};
		});

		var indices = new Array(evaluatedInClauses.length).fill(0);
		indices[0] = -1;
		outer:
		while (indices[indices.length - 1] < evaluatedInClauses[evaluatedInClauses.length - 1].valueSequence.value.length) {
			for (var i in indices) {
				if (++indices[i] > evaluatedInClauses[i].length - 1) {
					indices[i] = 0;
					continue;
				}

				var variables = Object.create(null);

				for (var y = 0; y < indices.length; y++) {
					variables[evaluatedInClauses[y].name] = Sequence.singleton(evaluatedInClauses[y].valueSequence.value[indices[y]]);
				}

				var context = dynamicContext.createScopedContext({
					variables: variables
				});

				var result = this._satisfiesExpr.evaluate(context);

				if (result.getEffectiveBooleanValue() && this._quantifier === 'some') {
					return Sequence.singleton(new BooleanValue(true));
				}
				else if (!result.getEffectiveBooleanValue() && this._quantifier === 'every') {
					return Sequence.singleton(new BooleanValue(false));
				}

				continue outer;
			}
			break;
		}

		return Sequence.singleton(new BooleanValue(this._quantifier !== 'some'));
	};

	return QuantifiedExpression;
});