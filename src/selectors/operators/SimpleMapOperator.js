import Selector from '../Selector';
import Specificity from '../Specificity';
import Sequence from '../dataTypes/Sequence';

/**
 * @extends {Selector}
 */
class SimpleMapOperator extends Selector {
	/**
	 * Simple Map operator
	 * The simple map operator will evaluate expressions given in expression1 and use the results as context for
	 * evaluating all expressions in expression2. Returns a sequence with results from the evaluation of expression2.
	 * Order is undefined.
	 *
	 * @param  {!Selector}  expression1
	 * @param  {!Selector}  expression2
	 */
	constructor (expression1, expression2) {
		super(
			new Specificity({}).add(expression1.specificity),
			Selector.RESULT_ORDERINGS.UNSORTED);

		this._expression1 = expression1;
		this._expression2 = expression2;
	}

	evaluate (dynamicContext) {
		return this._expression1.evaluate(dynamicContext).value.reduce(function (sequenceToReturn, currentValue) {
			var context = dynamicContext.createScopedContext({
					contextItem: Sequence.singleton(currentValue)
				});
			return sequenceToReturn.merge(this._expression2.evaluate(context));
		}.bind(this), Sequence.empty());
	}

	equals (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof SimpleMapOperator &&
			this._expression1.equals(otherSelector._expression1) &&
			this._expression2.equals(otherSelector._expression2);
	}
}

export default SimpleMapOperator;
