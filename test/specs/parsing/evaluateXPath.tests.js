import slimdom from 'slimdom';

import {
	domFacade,
	evaluateXPathToBoolean,
	evaluateXPath,
	evaluateXPathToFirstNode,
	evaluateXPathToNodes,
	evaluateXPathToNumber,
	evaluateXPathToString,
	evaluateXPathToStrings
} from 'fontoxpath';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

describe('evaluateXPath', () => {
	let documentNode;
	beforeEach(() => {
		documentNode = slimdom.createDocument();
	});

	it('Keeps booleans booleans',
		() => chai.assert.equal(evaluateXPath('true()', documentNode, domFacade), true));
	it('Keeps numbers numbers',
		() => chai.assert.equal(evaluateXPath('1', documentNode, domFacade), 1));
	it('Keeps nodes nodes',
		() => chai.assert.equal(evaluateXPath('.', documentNode, domFacade), documentNode));


	describe('toBoolean', () => {
		it('Keeps booleans booleans',
			() => chai.assert.equal(evaluateXPathToBoolean('true()', documentNode, domFacade), true));

		it('Converts the result to a boolean',
			() => chai.assert.equal(evaluateXPathToBoolean('()', documentNode, domFacade), false));

		it('Throws when unable to convert the result to a number',
			() => chai.assert.throws(() => evaluateXPathToBoolean('(1,2,3)', documentNode, domFacade)));
	});

	describe('toNumber', () => {
		it('Keeps numeric values numbers',
			() => chai.assert.equal(evaluateXPathToNumber('42', documentNode, domFacade), 42));

		it('returns NaN when not resolving to a singleton',
			() => chai.assert.isNaN(evaluateXPathToNumber('()', documentNode, domFacade)));

		it('Returns NaN when unable to convert the result to a number',
			() => chai.assert.isNaN(evaluateXPathToNumber('"fortytwo"', documentNode, domFacade)));
	});

	describe('toString', () => {
		it('Keeps string values strings',
			() => chai.assert.equal(evaluateXPathToString('"A piece of text"', documentNode, domFacade), 'A piece of text'));

		it('Stringifies numeric types',
			() => chai.assert.equal(evaluateXPathToString('42', documentNode, domFacade), '42'));

		it('Returns the empty string when resolving to the empty sequence',
			() => chai.assert.equal(evaluateXPathToString('()', documentNode, domFacade), ''));
	});

	describe('toStrings', () => {
		it('Keeps string values strings',
			() => chai.assert.deepEqual(evaluateXPathToStrings('("A piece of text", "another piece of text")', documentNode, domFacade), ['A piece of text', 'another piece of text']));

		it('Stringifies numeric types',
			() => chai.assert.deepEqual(evaluateXPathToStrings('(42, 42)', documentNode, domFacade), ['42', '42']));

		it('returns an empty array when it resolves to the empty sequence',
			() => chai.assert.deepEqual(evaluateXPathToStrings('()', documentNode, domFacade), []));
	});

	describe('toFirstNode', () => {
		it('Keeps nodes nodes',
			() => chai.assert.equal(evaluateXPathToFirstNode('.', documentNode, domFacade), documentNode));

		it('Only returns the first node',
			() => chai.assert.equal(evaluateXPathToFirstNode('(., ., .)', documentNode, domFacade), documentNode));

		it('Returns null when the xpath resolves to the empty sequence',
			() => chai.assert.equal(evaluateXPathToFirstNode('()', documentNode, domFacade), null));

		it('Throws when the xpath resolves to an attribute', () => {
			jsonMlMapper.parse(['someElement', {
				someAttribute: 'someValue'
			}], documentNode);
			chai.assert.throws(() => evaluateXPathToFirstNode('//@someAttribute', documentNode, domFacade));
		});
	});

	describe('toNodes', () => {
		it('Keeps nodes nodes',
			() => chai.assert.deepEqual(evaluateXPathToNodes('.', documentNode, domFacade), [documentNode]));

		it('Returns all nodes',
			() => chai.assert.deepEqual(evaluateXPathToNodes('(., ., .)', documentNode, domFacade), [documentNode, documentNode, documentNode]));

		it('Returns null when the xpath resolves to the empty sequence',
			() => chai.assert.deepEqual(evaluateXPathToNodes('()', documentNode, domFacade), []));

		it('Throws when the xpath resolves to an attribute', () => {
			jsonMlMapper.parse(['someElement', {
				someAttribute: 'someValue'
			}], documentNode);
			chai.assert.throws(() => evaluateXPathToNodes('//@someAttribute', documentNode, domFacade));
		});
	});

	describe('using the actual browser HTML DOM', () => {
		it('will find an HTML node', ()=> {
			chai.assert.isTrue(evaluateXPathToBoolean('/descendant::HTML', window.document, domFacade));
		});
	});
});