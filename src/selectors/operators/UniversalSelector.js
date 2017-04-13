import Selector from '../Selector';
import Specificity from '../Specificity';
import Sequence from '../dataTypes/Sequence';
import BooleanValue from '../dataTypes/BooleanValue';

/**
 * @extends {Selector}
 */
class UniversalSelector extends Selector {
	constructor () {
		super(
			new Specificity({
				[Specificity.UNIVERSAL_KIND]: 1
			}),
			Selector.RESULT_ORDERINGS.SORTED);
		this._getStringifiedValue = () => '(universal)';
	}

	evaluate () {
		return Sequence.singleton(BooleanValue.TRUE);
	}
}
export default UniversalSelector;
