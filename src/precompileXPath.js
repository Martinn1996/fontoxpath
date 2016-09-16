define([
	'./parsing/createSelectorFromXPathAsync',
	'./parsing/compiledSelectorCache'
], function (
	createSelectorFromXPathAsync,
	compiledSelectorCache
) {
	'use strict';

	/**
	 * Precompile an XPath selector asynchronously.
	 * After compilation, the result is cached so that it can be reused using the synchronous functions.
	 *
	 * @param   {string}    xPathString  The xPath which should be pre-compiled
	 *
	 * @return  {Promise}   A promise which is resolved with the selector after compilation
	 */
	return function precompileXPath (xPathString) {
		return createSelectorFromXPathAsync(xPathString)
			.then(function (selector) {
				compiledSelectorCache[xPathString] = selector;
				return selector;
			});
	};
});