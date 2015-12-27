//! REPLACE_BY("// Copyright 2015 Claude Petit, licensed under Apache License version 2.0\n")
// dOOdad - Class library for Javascript (BETA) with some extras (ALPHA)
// File: Tools.js - Useful tools
// Project home: https://sourceforge.net/projects/doodad-js/
// Trunk: svn checkout svn://svn.code.sf.net/p/doodad-js/code/trunk doodad-js-code
// Author: Claude Petit, Quebec city
// Contact: doodadjs [at] gmail.com
// Note: I'm still in alpha-beta stage, so expect to find some bugs or incomplete parts !
// License: Apache V2
//
//	Copyright 2015 Claude Petit
//
//	Licensed under the Apache License, Version 2.0 (the "License");
//	you may not use this file except in compliance with the License.
//	You may obtain a copy of the License at
//
//		http://www.apache.org/licenses/LICENSE-2.0
//
//	Unless required by applicable law or agreed to in writing, software
//	distributed under the License is distributed on an "AS IS" BASIS,
//	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//	See the License for the specific language governing permissions and
//	limitations under the License.
//! END_REPLACE()

(function() {
	this.initSafeEval = function initSafeEval() {
		// WARNING: Do not declare any variable and parameter inside this function. Also you must avoid the use of module variables.

		this.constants			= ['true', 'false', 'null', 'undefined', 'NaN', 'Infinity'];
		this.allDigitsRegEx		= /^([0-9]*[.]?[0-9]*([e][-+]?[0-9]+)?|0[xX]([0-9a-fA-F])+|0[bB]([01])+|0[oO]([0-7])+)$/;
		this.spaceRegEx			= /\s/;  // use regex to take care of all Unicode space chars
		this.createEval			= function(/*locals*/) {
									return eval(
										"(function(" + Array.prototype.join.call(arguments[0], ',') + ") {" +
											"return function(/*expression*/) {" +
												"return eval(arguments[0]);" +
											"};" +
										"})"
									);
								};
		this.createStrictEval	= function(/*locals*/) {
									return eval(
										"(function(" + Array.prototype.join.call(arguments[0], ',') + ") {" +
											"return function(/*expression*/) {" +
												'"use strict";' +
												"return eval(arguments[0]);" +
											"};" +
										"})"
									);
								};
		this.evalNoLocals		= function(/*expression*/) {
									return eval(arguments[0]);
								};
		this.evalNoLocalsStrict	= function(/*expression*/) {
									"use strict";
									return eval(arguments[0]);
								};
		this.allowedGlobals = [];
		try {
			this.alphaRegEx = new RegExp("(\w|[$])", 'u');  // try unicode flag
		} catch(ex) {
			this.alphaRegEx 	= /(\w|[$])/;  // use regex to take care of all Unicode alphanumeric chars <=== NOTE: IT VALIDATES ONLY US ASCII CHARACTERS
		};
	};
}).call((function() {
	var global = this;
	
	// Node.js
	var exports = {};
	if (global.process) {
		module.exports = exports;
	};
	
	global.DD_MODULES = (global.DD_MODULES || {});
	global.DD_MODULES['Doodad.Tools'] = {
		type: null,
		version: '0b',
		namespaces: ['Files', 'Config'],
		dependencies: ['Doodad.Types'],
		bootstrap: true,
		exports: exports,
		
		create: function create(root, /*optional*/_options) {
			"use strict";

			//===================================
			// Get namespaces
			//===================================
				
			var doodad = root.Doodad,
				types = doodad.Types,
				tools = doodad.Tools,
				files = tools.Files,
				config = tools.Config;
				
			//===================================
			// Options
			//===================================
				
			tools.options = {
				settings: {
					logLevel: -1,

					configPath: null,
				},
				hooks: {
					console: null,

					urlParser: function(url, /*optional*/options) {
						if (types.isString(url)) {
							if (!options) {
								options = {
									noEscapes: true,
								};
							};
							url = tools.Url.parse(url, options);
						};
						return url;
					},
					
					pathParser: function(path, /*optional*/options) {
						if (types.isString(path)) {
							if (!options) {
								options = {
									os: 'linux',
									dirChar: '/',
								};
							};
							path = tools.Path.parse(path, options).set({
								os: null,
								dirChar: null,
							});
						};
						return path;
					},
				},
			};

			types.depthExtend(1, tools.options, _options);
			
			tools.options.settings.logLevel = parseInt(tools.options.settings.logLevel);

			//===================================
			// Internal
			//===================================
				
			// <FUTURE> Thread context
			var __Internal__ = {
				loadedConfigFiles: new types.Map(),
			};
			
			
			//===================================
			// Native functions
			//===================================
				
			// NOTE: Makes use of "isNativeFunction" to get rid of third-parties injections as possible.

			var __Natives__ = {
				windowXMLHttpRequest: global.XMLHttpRequest,
				windowJSON: global.JSON,

				// Prototype functions
				stringIndexOf: String.prototype.indexOf,
				stringLastIndexOf: String.prototype.lastIndexOf,
				stringReplace: String.prototype.replace,
				stringSearch: String.prototype.search,
			
				windowError: (global.Error || Error), // NOTE: "node.js" does not include "Error" in "global".
				
				windowRegExp: (global.RegExp || RegExp),
				
				windowEscape: (global.escape || escape),
				windowUnescape: (global.unescape || unescape),
				
				stringTrim: String.prototype.trim,

				windowObject: global.Object,

				// Polyfills

				// "Object.keys" Polyfill from Mozilla Developer Network.
				// NOTE: "hasDontEnumBug" is "true" when a property in "defaultNonEnumerables" is still non-enumerable with "for (... in ...)" while being changed to an own property.
				hasDontEnumBug: !types.propertyIsEnumerable({ toString: null }, 'toString'),
				defaultNonEnumerables: [
				  'toString',
				  'toLocaleString',
				  'valueOf',
				  'hasOwnProperty',
				  'isPrototypeOf',
				  'propertyIsEnumerable',
				  'constructor',
				  'length',
				],

				// Other Polyfills

				mathSign: (types.isNativeFunction(Math.sign) ? Math.sign : undefined),

				//windowComponents: (types.isNativeFunction(global.Components) ? global.Components : undefined),
				
				// ES5
				stringRepeat: (types.isNativeFunction(String.prototype.repeat) ? String.prototype.repeat : undefined),
				arrayIndexOf: (types.isNativeFunction(Array.prototype.indexOf) ? Array.prototype.indexOf : undefined),
				arrayLastIndexOf: (types.isNativeFunction(Array.prototype.lastIndexOf) ? Array.prototype.lastIndexOf : undefined),
				arrayForEach: (types.isNativeFunction(Array.prototype.forEach) ? Array.prototype.forEach : undefined),
				arrayMap: (types.isNativeFunction(Array.prototype.map) ? Array.prototype.map : undefined),
				arrayFilter: (types.isNativeFunction(Array.prototype.filter) ? Array.prototype.filter : undefined),
				arrayEvery: (types.isNativeFunction(Array.prototype.every) ? Array.prototype.every : undefined),
				arraySome: (types.isNativeFunction(Array.prototype.some) ? Array.prototype.some : undefined),
				arrayReduce: (types.isNativeFunction(Array.prototype.reduce) ? Array.prototype.reduce : undefined),
				arrayReduceRight: (types.isNativeFunction(Array.prototype.reduceRight) ? Array.prototype.reduceRight : undefined),
				
				// ES6
				windowPromise: (types.isNativeFunction(global.Promise) ? global.Promise : undefined),
				
				// ES7
				regExpEscape: (types.isNativeFunction(RegExp.escape) ? RegExp.escape : undefined),
			};
			
			//===================================
			// Search functions
			//===================================
				
			tools.findItem = root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 0,
							params: {
								obj: {
									type: 'any',
									optional: false,
									description: "Object to scan",
								},
								item: {
									type: 'any',
									optional: false,
									description: "Value to find. If item is a function, call this function to find item.",
								},
								thisObj: {
									type: 'any',
									optional: true,
									description: "When 'item' is a function, specifies 'this'. Default is 'undefined'.",
								},
								includeFunctions: {
									type: 'bool',
									optional: true,
									description: "When 'true' and 'item' is a function, considers that function as a value. Default is 'false'",
								},
							},
							returns: 'integer,string',
							description: "Returns the array index or the attribute name of the specified item. Returns 'null' when item is not found.",
				}
				//! END_REPLACE()
				, function findItem(obj, item, /*optional*/thisObj, /*optional*/includeFunctions) {
					if (!types.isNothing(obj)) {
						obj = __Natives__.windowObject(obj);
						var key;
						if (!includeFunctions && types.isFunction(item)) {
							if (types.isArrayLike(obj)) {
								var len = obj.length;
								for (key = 0; key < len; key++) {
									if (key in obj) {
										if (item.call(thisObj, obj[key], key, obj)) {
											return key;
										};
									};
								};
							} else {
								var keys = types.keys(obj),
									len = keys.length, // performance
									i;
								for (i = 0; i < len; i++) {
									key = keys[i];
									if (item.call(thisObj, obj[key], key, obj)) {
										return key;
									};
								};
							};
						} else {
							if (types.isArrayLike(obj)) {
								var len = obj.length;
								for (key = 0; key < len; key++) {
									if (key in obj) {
										if (obj[key] === item) {
											return key;
										};
									};
								};
							} else {
								var keys = types.keys(obj),
									len = keys.length, // performance
									i;
								for (i = 0; i < len; i++) {
									key = keys[i];
									if (obj[key] === item) {
										return key;
									};
								};
							};
						};
					};
					return null;
				});
			
			tools.findLastItem = root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 0,
							params: {
								obj: {
									type: 'any',
									optional: false,
									description: "Object to scan",
								},
								item: {
									type: 'any',
									optional: false,
									description: "Value to find. If item is a function, call this function to find item.",
								},
								thisObj: {
									type: 'any',
									optional: true,
									description: "When 'item' is a function, specifies 'this'. Default is 'undefined'.",
								},
								includeFunctions: {
									type: 'bool',
									optional: true,
									description: "When 'true' and 'item' is a function, considers that function as a value. Default is 'false'",
								},
							},
							returns: 'integer,string',
							description: "Returns the array index or the attribute name of the specified item, by searching from the end. Returns 'null' when item is not found.",
				}
				//! END_REPLACE()
				, function findLastItem(obj, item, /*optional*/thisObj, /*optional*/includeFunctions) {
					if (!types.isNothing(obj)) {
						obj = Object(obj);
						var key;
						if (!includeFunctions && types.isFunction(item)) {
							if (types.isArrayLike(obj)) {
								for (key = obj.length - 1; key >= 0; key--) {
									if (key in obj) {
										if (item.call(thisObj, obj[key], key, obj)) {
											return key;
										};
									};
								};
							} else {
								var keys = types.keys(obj),
									i;
								for (i = keys.length - 1; i >= 0; i--) {
									key = keys[i];
									if (item.call(thisObj, obj[key], key, obj)) {
										return key;
									};
								};
							};
						} else {
							if (types.isArrayLike(obj)) {
								for (key = obj.length - 1; key >= 0; key--) {
									if (key in obj) {
										if (obj[key] === item) {
											return key;
										};
									};
								};
							} else {
								var keys = types.keys(obj),
									i;
								for (i = keys.length - 1; i >= 0; i--) {
									key = keys[i];
									if (obj[key] === item) {
										return key;
									};
								};
							};
						};
					};
					return null;
				});
			
			tools.findItems = root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 0,
							params: {
								obj: {
									type: 'any',
									optional: false,
									description: "Object to scan",
								},
								items: {
									type: 'any,arrayof(any)',
									optional: false,
									description: "Values to find. If items is a function, call this function to find items.",
								},
								thisObj: {
									type: 'any',
									optional: true,
									description: "When 'items' is a function, specifies 'this'. Default is 'undefined'.",
								},
								includeFunctions: {
									type: 'bool',
									optional: true,
									description: "When 'true' and 'items' is a function, considers that function as a value. Default is 'false'",
								},
							},
							returns: 'arrayof(integer,string)',
							description: "Returns the array indexes or the attribute names of the specified items.",
				}
				//! END_REPLACE()
				, function findItems(obj, items, /*optional*/thisObj, /*optional*/includeFunctions) {
					var result = [];
					if (!types.isNothing(obj)) {
						obj = Object(obj);
						var key;
						if (!includeFunctions && types.isFunction(items)) {
							if (types.isArrayLike(obj)) {
								var len = obj.length;
								for (key = 0; key < len; key++) {
									if (key in obj) {
										if (items.call(thisObj, obj[key], key, obj)) {
											result.push(key);
										};
									};
								};
							} else {
								var keys = types.keys(obj),
									len = keys.length, // performance
									i;
								for (i = 0; i < len; i++) {
									key = keys[i];
									if (items.call(thisObj, obj[key], key, obj)) {
										result.push(key);
									};
								};
							};
						} else {
							if (!types.isArray(items)) {
								items = [items];
							};
							if (types.isArrayLike(obj)) {
								var len = obj.length;
								for (key = 0; key < len; key++) {
									if (key in obj) {
										if (tools.findItem(items, obj[key], undefined, true) !== null) {
											result.push(key);
										};
									};
								};
							} else {
								var keys = types.keys(obj),
									len = keys.length, // performance
									i;
								for (i = 0; i < len; i++) {
									key = keys[i];
									if (tools.findItem(items, obj[key], undefined, true) !== null) {
										result.push(key);
									};
								};
							};
						};
					};
					return result;
				});
			
			
			//===================================
			// String functions
			//===================================

			tools.repeat = root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 0,
							params: {
								str: {
									type: 'string',
									optional: false,
									description: "String to repeat",
								},
								n: {
									type: 'integer',
									optional: false,
									description: "Number of string occurrences.",
								},
							},
							returns: 'string',
							description: "Returns the string repeated 'n' occurrences.",
				}
				//! END_REPLACE()
				, function repeat(str, n) {
					if (root.DD_ASSERT) {
						root.DD_ASSERT(types.isString(str), "Invalid string.");
						root.DD_ASSERT(types.isInteger(n), "Invalid number.");
					};
					if (__Natives__.stringRepeat) {
						return __Natives__.stringRepeat.call(str, n);
					} else {
						// Source: Stackoverflow
						// TODO: Optimize me (join is slow)
						if (n <= 0) {
							return "";
						} else if (n === 1) {
							return str;
						} else {
							return Array(n + 1).join(str);
						};
					};
				});

			tools.trim = root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 0,
							params: {
								str: {
									type: 'string,array',
									optional: false,
									description: "String or array to trim",
								},
								chr: {
									type: 'any',
									optional: true,
									description: "Value used to trim. Default is a space.",
								},
								direction: {
									type: 'integer',
									optional: true,
									description: "'-1' to trim from the end. '1' to trim from the beginning. '0' for bidirectional. Default is '0'.",
								},
								count: {
									type: 'integer',
									optional: true,
									description: "Number of occurrences of 'chr' to trim from both sides.",
								},
							},
							returns: 'string',
							description: "Returns the trimmed string or array.",
				}
				//! END_REPLACE()
				, function trim(str, /*optional*/chr, /*optional*/direction, /*optional*/count) {
					var isArray = types.isArray(str);

					if (root.DD_ASSERT) {
						root.DD_ASSERT(types.isString(str) || isArray, "Invalid string.");
						!isArray && root.DD_ASSERT(types.isNothing(chr) || types.isString(chr), "Invalid character.");
						root.DD_ASSERT(types.isNothing(direction) || types.isInteger(direction), "Invalid direction.");
						root.DD_ASSERT(types.isNothing(count) || types.isInteger(count), "Invalid count.");
					};
					
					if (isArray || (arguments.length > 1)) {
						if (types.isNothing(chr)) {
							chr = " ";
						};
						
						if (types.isNothing(count)) {
							count = Infinity;
						};
						
						var strLen = str.length;
						
						var start = 0,
							x = 0;
						if (!direction || direction > 0) {
							for (; start < strLen; start++, x++) {
								if ((x >= count) || (str[start] !== chr)) {
									break;
								};
							};
						};

						var end = strLen - 1;
						x = 0;
						if (!direction || direction < 0) {
							for (; end >= 0; end--, x++) {
								if ((x >= count) || (str[end] !== chr)) {
									break;
								};
							};
						};

						if (end >= start) {
							return str.slice(start, end + 1);
						} else {
							return (isArray ? [] : '');
						};
						
					} else {
						return __Natives__.stringTrim.call(str);
					};
				});
			
			tools.replace = root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 0,
							params: {
								text: {
									type: 'string,arrayof(string)',
									optional: false,
									description: "String or array to search into",
								},
								from: {
									type: 'string,RegExp',
									optional: false,
									description: "Value to search for.",
								},
								to: {
									type: 'string',
									optional: false,
									description: "String to replace with.",
								},
								options: {
									type: 'string',
									optional: true,
									description: "Search options. Options are 'RegExp' ones.",
								},
							},
							returns: 'string',
							description: "Replaces 'from' with 'to' and returns the result.",
				}
				//! END_REPLACE()
				, function replace(text, from, to, /*optional*/options) {
					if (root.DD_ASSERT) {
						root.DD_ASSERT(types.isArrayLike(text), "Invalid text.");
						root.DD_ASSERT(types.isString(from) || (from instanceof RegExp), "Invalid 'from'.");
						root.DD_ASSERT(types.isString(to) || types.isFunction(to), "Invalid 'to'.");
						root.DD_ASSERT(types.isNothing(options) || types.isString(options), "Invalid options.");
					};
					if (options) {
						var regexp = tools.escapeRegExp(from);
						from = new __Natives__.windowRegExp(regexp, options);
					};
					if (types.isString(text)) {
						return __Natives__.stringReplace.call(text, from, to);
					} else {
						for (var i = 0; i < text.length; i++) {
							text[i] = __Natives__.stringReplace.call(text[i], from, to);
						};
						return text;
					};
				});
			
			tools.search = root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 0,
							params: {
								str: {
									type: 'string',
									optional: false,
									description: "String to search into",
								},
								text: {
									type: 'string,RegExp',
									optional: false,
									description: "Value to search for.",
								},
								start: {
									type: 'integer',
									optional: true,
									description: "Position from which to start searching.",
								},
								end: {
									type: 'integer',
									optional: true,
									description: "Position from which to stop searching.",
								},
								stopStr: {
									type: 'string,RegExp',
									optional: true,
									description: "Value from which to stop searching.",
								},
								getText: {
									type: 'bool',
									optional: true,
									description: "'true' will returns the text found. 'false' will returns its position. Default is 'false'.",
								},
							},
							returns: 'undefined,null,NaN,integer,string',
							description: "Returns the position of 'text' in 'str'. If 'text' is not found, return '-1' (when 'getText' is 'false') or 'undefined' (when 'getText' is 'true'). If 'stopStr' is met before 'text', returns 'NaN' (when 'getText' is 'false') or 'null' (when 'getText' is 'true').",
				}
				//! END_REPLACE()
				, function search(str, text, /*optional*/start, /*optional*/end, /*optional*/stopStr, /*optional*/getText) {
					if (root.DD_ASSERT) {
						root.DD_ASSERT(types.isString(str), "Invalid string.");
						root.DD_ASSERT(types.isString(text) || (text instanceof RegExp), "Invalid text.");
						root.DD_ASSERT(types.isNothing(start) || types.isInteger(start), "Invalid 'start'.");
						root.DD_ASSERT(types.isNothing(end) || types.isInteger(end), "Invalid 'end'.");
						root.DD_ASSERT(types.isNothing(stopStr) || types.isString(stopStr) || (stopStr instanceof RegExp), "Invalid stop string.");
					};

					if (types.isNothing(start)) {
						start = 0;
					};
					if (types.isNothing(end)) {
						end = str.length;
					};
					
					var posText;
					if (types.isString(text)) {
						posText = str.indexOf(text, start);
					} else {
						text.lastIndex = start;
						//var posText = __Natives__.stringSearch.call(str, text);
						posText = text.exec(str);
						if (!text.global && (start > 0)) {
							throw new types.TypeError("Regular expression must have the global flag set.");
						};
						if (posText) {
							posText = posText.index;
						} else {
							posText = -1;
						};
					};

					var posStopStr = -1;
					if (stopStr) {
						if (types.isString(stopStr)) {
							posStopStr = str.indexOf(stopStr, start);
						} else {
							stopStr.lastIndex = start;
							//posStopStr = __Natives__.stringSearch.call(str, stopStr);
							var posStopStr = stopStr.exec(str);
							if (!stopStr.global && (start > 0)) {
								throw new types.TypeError("Regular expression must have the global flag set.");
							};
							if (posStopStr) {
								posStopStr = posStopStr.index;
							} else {
								posStopStr = -1;
							};
						};
					};
					
					if (((posText < 0) && (posStopStr < 0)) || (posText > end)) {
						// No match
						if (getText) {
							return undefined;
						} else {
							return -1;
						};
					} else if ((posStopStr >= 0) && (posStopStr < posText)) {
						// Stop
						if (getText) {
							return null;
						} else {
							return NaN;
						};
					} else {
						// Match
						if (getText) {
							if (posStopStr >= 0) {
								return str.slice(posText, Math.min(posStopStr, end));
							} else {
								return str.slice(posText);
							};
						} else {
							return posText;
						};
					};
				});

			tools.join = root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 0,
							params: {
								ar: {
									type: 'array',
									optional: false,
									description: "Array to join",
								},
								str: {
									type: 'string',
									optional: true,
									description: "String separator. Default is none.",
								},
							},
							returns: 'string',
							description: "Returns a string with joined values.",
				}
				//! END_REPLACE()
				, function join(ar, /*optional*/str) {
					if (root.DD_ASSERT) {
						root.DD_ASSERT(types.isArray(ar), "Invalid array.");
						root.DD_ASSERT(types.isNothing(str) || types.isString(str), "Invalid string.");
					};
					var result = '',
						arLen = ar.length,
						count = 0;
					for (var i = 0; i < arLen; i++) {
						if (i in ar) {
							if (str && (count > 0)) {
								result += str;
							};
							result += (ar[i] + '');
							count++;
						};
					};
					return result;
				});
				
				tools.title = root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 0,
							params: {
								str: {
									type: 'string',
									optional: false,
									description: "String value",
								},
								separator: {
									type: 'string',
									optional: true,
									description: "Word separator. Default is a space.",
								},
							},
							returns: 'string',
							description: "Returns a string with separated lowered-case words each beginning with an upper-case.",
				}
				//! END_REPLACE()
				, function title(str, /*optional*/separator) {
					if (root.DD_ASSERT) {
						root.DD_ASSERT(types.isString(str), "Invalid string.");
						root.DD_ASSERT(types.isNothing(separator) || types.isString(separator), "Invalid separator.");
					};
					var retval = '';
					if (!separator) {
						separator = ' ';
					};
					str = str.split(separator);
					var len = str.length;
					for (var i = 0; i < len; i++) {
						var word = str[i];
						if (i > 0) {
							retval += separator;
						};
						if (word) {
							retval += word[0].toUpperCase() + word.slice(1).toLowerCase();
						};
					};
					return retval;
				});
			
			//===================================
			// Log functions
			//===================================
				
			tools.LogLevels = {
				Debug: 0,
				Info: 1,
				Warning: 2,
				Error: 3,
			};
			
			var __logLevelsName__ = [
				'debug',
				'info',
				'warning',
				'error',
			];
				
			tools.log = root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 0,
							params: {
								leval: {
									type: 'integer',
									optional: false,
									description: "Log level",
								},
								message: {
									type: 'any',
									optional: false,
									description: "Error message or value",
								},
								params: {
									type: 'arrayof(any),objectof(any)',
									optional: true,
									description: "Parameters of the error message",
								},
							},
							returns: 'string',
							description: "Writes message in the console only when the log level is greater or equal to the active one.",
				}
				//! END_REPLACE()
				, function log(level, message, /*optional*/params) {
					// WARNING: Don't use "root.DD_ASSERT" inside this function !!!
					if (global.console && (level >= tools.options.settings.logLevel)) {
						if (params) {
							message = tools.format(message + '', params);
						};
						if (types.isString(message) && types.hasIndex(__logLevelsName__, level)) {
							message = __logLevelsName__[level] + ': ' + message;
						};
						var fn;
						if ((level === tools.LogLevels.Info) && console.info) {
							fn = 'info';
						} else if ((level === tools.LogLevels.Warning) && console.warn) {
							fn = 'warn';
						} else if ((level === tools.LogLevels.Error) && console.error) {
							fn = 'error';
						} else if ((level === tools.LogLevels.Error) && console.exception) {
							fn = 'exception';
						} else {
							fn = 'log';
						};
						var hook = tools.options.hooks.console;
						if (hook) {
							hook(fn, message);
						} else {
							console[fn](message);
						};
					};
				});

			
			//===================================
			// Escape functions
			//===================================
				
			tools.escape = root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 0,
							params: {
								text: {
									type: 'string',
									optional: false,
									description: "Text to escape",
								},
								reserved: {
									type: 'string',
									optional: false,
									description: "Reserved characters to substitute",
								},
								substitutions: {
									type: 'arrayof(string)',
									optional: false,
									description: "Substitutions of the reserved characters in their string position order",
								},
							},
							returns: 'string',
							description: "Escapes a string by replacing reserved characters with their substitution.",
				}
				//! END_REPLACE()
				, function escape(text, reserved, substitutions) {
					if (root.DD_ASSERT) {
						root.DD_ASSERT(types.isNothing(text) || types.isString(text), "Invalid text.");
						root.DD_ASSERT(types.isNothing(reserved) || types.isString(reserved), "Invalid reserved characters string.");
						root.DD_ASSERT(types.isNothing(substitutions) || types.isArray(substitutions), "Invalid reserved characters string.");
						if (reserved) {
							root.DD_ASSERT(substitutions && (reserved.length === substitutions.length), "Reserved characters substitutions length mismatch.");
						};
					};
					if (!text || !reserved) {
						return text;
					};
					var result = '',
						textLen = text.length,
						lastPos = 0,
						reservedLen = reserved.length;
					for (var i = 0; i < textLen; i++) {
						var chr = text[i];
						for (var j = 0; j < reservedLen; j++) {
							if (chr === reserved[j]) {
								result += text.slice(lastPos, i) + substitutions[j];
								lastPos = (i + 1);
								break;
							};
						};
					};
					if (lastPos === 0) {
						result = text;
					} else {
						result += text.slice(lastPos);
					};
					return result;
				});
			
			// See "http://stackoverflow.com/questions/2083754/why-shouldnt-apos-be-used-to-escape-single-quotes"
			__Internal__.htmlReserved = "<>\"'&",
			__Internal__.htmlReservedSubstitutions = ['&lt;', '&gt;', '&quot;', '&#39;', '&amp;'];

			tools.escapeHtml = root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 0,
							params: {
								text: {
									type: 'string',
									optional: false,
									description: "String to escape",
								},
							},
							returns: 'string',
							description: "Escapes a string to HTML.",
				}
				//! END_REPLACE()
				, function escapeHtml(text) {
					return tools.escape(text, __Internal__.htmlReserved, __Internal__.htmlReservedSubstitutions);
				});
			
			__Internal__.regExpReserved = "\\^$*+?()|{}[].",
			__Internal__.regExpReservedSubstitutions = ['\\\\', '\\^', '\\$', '\\*', '\\+', '\\?', '\\(', '\\)', '\\|', '\\{', '\\}', '\\[', '\\]', '\\.'];
				
			tools.escapeRegExp = root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 0,
							params: {
								text: {
									type: 'string',
									optional: false,
									description: "String to escape",
								},
							},
							returns: 'string',
							description: "Escapes a string to a regular expression.",
				}
				//! END_REPLACE()
				, (__Natives__.regExpEscape || function escapeRegExp(text) {
					return tools.escape(text, __Internal__.regExpReserved, __Internal__.regExpReservedSubstitutions);
				}));
			
			//===================================
			// Paths
			//===================================
			
			types.PathError = root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 0,
							params: {
								message: {
									type: 'string',
									optional: false,
									description: "Error message",
								},
								params: {
									type: 'arrayof(any),objectof(any)',
									optional: true,
									description: "Parameters of the error message",
								},
							},
							returns: 'string',
							description: "Path error.",
				}
				//! END_REPLACE()
				, types.createErrorType("PathError", global.Error)
				);
				
			tools.relativeToAbsolute = root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 0,
							params: {
								path: {
									type: 'string,array',
									optional: false,
									description: "Path to resolve",
								},
								dirRoot: {
									type: 'string,array',
									optional: true,
									description: "Path root",
								},
								options: {
									type: 'object',
									optional: true,
									description: "Options",
								},
							},
							returns: 'object',
							description: "Resolves a relative path.",
				}
				//! END_REPLACE()
				, function relativeToAbsolute(path, /*optional*/dirRoot, /*optional*/options) {
					// WARNING: Paths should be parsed and validated according to the OS and file system and shell before calling this function.

					if (root.DD_ASSERT) {
						root.DD_ASSERT(types.isNothing(dirRoot) || types.isArray(dirRoot) || types.isString(dirRoot), "Invalid root.");
						root.DD_ASSERT(types.isArray(path) || types.isString(path), "Invalid path.");
					};
					
					var dirChar = types.get(options, 'dirChar', '/');

					if (types.isString(dirRoot)) {
						dirRoot = dirRoot.split(dirChar);
					};
					
					if (types.isString(path)) {
						path = path.split(dirChar);
					};
					
					var dontThrow = types.get(options, 'dontThrow', false);
					
					var isTrailing = function isTrailing(path) {
						var len = path.length;
						return (len > 1) && (path[len - 1] === '');
					};
					
					// Resolve ".." and "."
					var rootTrailing = dirRoot && isTrailing(dirRoot),
						pathTrailing = isTrailing(path);
					
					if (dirRoot) {
						dirRoot = tools.filter(dirRoot, function (val) {
							return !!val;
						});
					};
					
					path = tools.filter(path, function (val) {
						return !!val;
					});
					
					var pos = 0;
					while (pos < path.length) {
						var name = path[pos],   // NOTE: Don't trim because trailing spaces may be accepted by the OS and the file system. Paths must be parsed and validated before calling this function.
							count = 0;
						if (name === '.') {
							count = 1;
						} else if (name === '..') {
							count = 2;
						};
						if (count) {
							var tmp;
							if (pos <= 0) {
								if (dirRoot && (count > 1)) {
									if (dirRoot.length) {
										var tmp = dirRoot.pop();
										// "doodad/v0///removeMe/..//" will resolves to "doodad/v0"
										while (!tmp && dirRoot.length) {
											tmp = dirRoot.pop();
											if (tmp === '..') {
												tmp = dirRoot.pop();
											};
										};
									};
									if (!dirRoot.length) {
										if (dontThrow) {
											return null;
										} else {
											throw new types.PathError("Path overflow.");
										};
									};
								};
							};
							while (count && (pos >= 0)) {
								tmp = path.splice(pos, 1)[0];
								if (tmp) {
									count--;
								};
								pos--;
							};
							if (!tmp) {
								if (dontThrow) {
									return null;
								} else {
									throw new types.PathError("Path overflow.");
								};
							};
						} else {
							pos++;
						};
					};
					
					if (rootTrailing) {
						dirRoot.push('');
						if (dirRoot.length === 1) {
							dirRoot.push('');
						};
					};
					
					if (pathTrailing) {
						path.push('');
						if (path.length === 1) {
							path.push('');
						};
					};
					
					return {
						dirRoot: dirRoot,
						path: path,
					};
				});
			
			// Windows
			// NOTE: "%NAME%" resolves to variable "NAME", but "%" or "%%" are valid names !
			// NOTE: "^%" resolves to "%", but "^%NAME%" resolves to "%" plus variable "NAME" ! So we can't escape "%".
			// NOTE: Only special characters "^", "&" can be escaped to a normal char
			// NOTE: ":" is valid just for the drive letter and can't be escaped to a normal char. So this validation is done by "parsePathWindowsInvalidNamesRegEx".

			__Internal__.windowsShellSpecialCharacters = '\\^&';
			__Internal__.windowsShellVerySpecialCharacters = ' <>|\\?\\*"/';
			
			// group 1 = chars to unescape, group 2 = always invalid chars, group 3 = valid chars when escaped
			__Internal__.parsePathWindowsUnescapeShellReservedCharsRegEx = new __Natives__.windowRegExp('\\^([^ ' + __Internal__.windowsShellVerySpecialCharacters + '])|([' + __Internal__.windowsShellSpecialCharacters + __Internal__.windowsShellVerySpecialCharacters + ']|%[^%]+%|[\\b]|\\f|\\n|\\r|\\t|\\v)', 'gm');      // <FUTURE> thread level
			
			// group 1 = chars to escape
			__Internal__.parsePathWindowsEscapeShellReservedCharsRegEx = new __Natives__.windowRegExp('([' + __Internal__.windowsShellSpecialCharacters + '])', 'gm');     // <FUTURE> thread level
			
			__Internal__.parsePathWindowsInvalidNamesRegEx = /:|^(com[1-9]|lpt[1-9]|con|nul|prn)$/i;    // <FUTURE> thread level
			
			
			// Unix-like

			__Internal__.unixShellSpecialCharacters = ' <>|?*"\'&`#;~!\-()\\[\\]{}\\\\';

			// group 1 = chars to unescape, group 2 = invalid chars
			__Internal__.parsePathUnixUnescapeShellReservedCharsRegEx = new __Natives__.windowRegExp('\\\\(.)|([' + __Internal__.unixShellSpecialCharacters + ']|[\\b]|\\f|\\n|\\r|\\t|\\v)', 'gm');      // <FUTURE> thread level
			
			// group 1 = chars to escape
			__Internal__.parsePathUnixEscapeShellReservedCharsRegEx = new __Natives__.windowRegExp('([' + __Internal__.unixShellSpecialCharacters + '])', 'gm');     // <FUTURE> thread level

			//__Internal__.parsePathUnixInvalidNamesRegEx = /^()$/i;    // <FUTURE> thread level
			
			__Internal__.pathOptions = {
					os: null,		// '' = deactivate validation, 'windows', 'unix', 'linux'
					dirChar: '/',
					root: null,   // null = auto-detect
					drive: null,  // For Windows only. null = auto-detect 
					path: null,
					file: null,   // null = auto-detect
					quote: null,  // null = auto-detect
					isRelative: false,
					noEscapes: false,
					shell: null,  // null = set to default, '' = deactivate validation, 'api' (default), 'dos', 'bash', 'sh'
				};
			__Internal__.pathOptionsKeys = types.keys(__Internal__.pathOptions);
			
			tools.Path = root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 0,
							params: {
								options: {
									type: 'object',
									optional: true,
									description: "Options",
								},
							},
							returns: 'Path',
							description: "Represents a system path.",
				}
				//! END_REPLACE()
				, types.INIT(types.Type.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'Path',

						parse: root.DD_DOC(
							//! REPLACE_BY("null")
							{
										author: "Claude Petit",
										revision: 1,
										params: {
											path: {
												type: 'string,array',
												optional: false,
												description: "Path to parse",
											},
											options: {
												type: 'object',
												optional: true,
												description: "Parse options",
											},
										},
										returns: 'Path',
										description: "Parse a string to a system path.",
							}
							//! END_REPLACE()
							, function parse(path, /*optional*/options) {
								// WARNING: Validation is incomplete.
								
								if (!options) {
									options = {};
								};
								
								// Flags
								var dontThrow = types.get(options, 'dontThrow', false),
									pathWasNothing = types.isNothing(path);
								
								if (path instanceof tools.Path) {
									options = types.fill(__Internal__.pathOptionsKeys, {}, path, options);
									path = options.path;
									
								} else if (path instanceof tools.Url) {
									if (types.get(options, 'protocol', path.protocol) !== 'file') {
										if (dontThrow) {
											return null;
										} else {
											throw new types.ParseError("Bad url protocol.");
										};
									};

									var pathTmp = tools.trim(path.path, '', 1, 1);
									
									if (path.isWindows) {
										options = types.fill(__Internal__.pathOptionsKeys, {
											os: 'windows',
											drive: pathTmp.shift()[0],
											file: path.file,
										}, options);
									} else {
										options = types.fill(__Internal__.pathOptionsKeys, {
											os: 'linux',
											file: path.file,
										}, options);
									};

									path = pathTmp;

								} else if (!types.isNothing(path) && !types.isString(path) && !types.isArray(path)) {
									if (dontThrow) {
										return null;
									} else {
										throw new types.ParseError("Invalid path.");
									};
								};
								
								// Options
								var osInfo = tools.getOS();
								var os = types.get(options, 'os', null),  // Default is Auto-set
									dirChar = types.get(options, 'dirChar', null),  // Default is Auto-set
									isRelative = types.get(options, 'isRelative', false), // Default is False
									noEscapes = types.get(options, 'noEscapes', false), // Default is False
									shell = types.get(options, 'shell', null), // Default is Auto-set
									quote = types.get(options, 'quote', null),  // Default is Auto-detect
									dirRoot = types.get(options, 'root', null),  // Default is no root
									drive = types.get(options, 'drive', null),  // Default is Auto-detect
									file = types.get(options, 'file', null);  // Default is Auto-detect

								path = types.get(options, 'path', path);
								
								var pathIsString = types.isString(path);
								
								var dirRootIsString = types.isString(dirRoot);
								if (!dirRootIsString && !types.isNothing(dirRoot) && !types.isArray(dirRoot)) {
									if (dontThrow) {
										return null;
									} else {
										throw new types.ParseError("Invalid root.");
									};
								};
								
								if (types.isNothing(os)) {
									// Auto-set
									os = osInfo.type;
									if (!dirChar) {
										dirChar = osInfo.dirChar;
									};
								};
								
								// Get shell from os
								if (types.isNothing(shell)) {
									shell = 'api';
								};
								
								// Detect folder separator
								if (types.isNothing(dirChar)) {
									// Auto-set
									if (os === 'windows') {
										// Auto-set
										if (shell === '') {
											dirChar = ['\\', '/'];
										} else {
											dirChar = '\\';
										};
									} else {
										dirChar = '/';
									};
								};
								
								// Replace alternate folder separators by the first one
								if (types.isArray(dirChar)) {
									var sep = dirChar.slice(1),
										sepLen = sep.length;
									dirChar = dirChar[0];
									if (pathIsString) {
										for (var i = 0; i < sepLen; i++) {
											path = tools.replace(path, sep[i], dirChar, 'g');
										};
									};
								};
								
								// A folder separator is required
								if (!types.isStringAndNotEmpty(dirChar)) {
									if (dontThrow) {
										return null;
									} else {
										throw new types.ParseError("Invalid 'dirChar' option.");
									};
								};
									
								// Detect quotes character
								if (types.isNothing(quote)) {
									quote = '';
									if (pathIsString) {
										if ((os === 'unix') || (os === 'linux') || (os === 'windows')) {
											// Auto-detect
											if (path) {
												var tmp = path[0];
												if (
													(tmp === '"') ||
													(((os === 'unix') || (os === 'linux')) && (tmp === "'"))
												) {
													quote = tmp;
												};
											};
										};
									};
								};
								
								// If path is quoted, root must be quoted
								if (quote && dirRoot && dirRootIsString && (dirRoot[0] !== quote)) {
									if (dontThrow) {
										return null;
									} else {
										throw new types.ParseError("'root' option must be quoted.");
									};
								};
								
								// Trim quotes
								if (pathIsString && quote) {
									path = tools.trim(path, quote);
								};
								if (dirRootIsString && quote) {
									dirRoot = tools.trim(dirRoot, quote);
								};
								
								// Unescape and validate chars
								if (!noEscapes && shell) {
									var unescapePath,
										state = {
											invalid: null,
										};
									
									if (((os === 'windows') && (shell === 'api')) || (shell === 'dos')) {
										unescapePath = function(path) {
											return tools.replace(path, __Internal__.parsePathWindowsUnescapeShellReservedCharsRegEx, function(matched, g1, g2, pos, str) {
												if (g1) {
													// Unescape
													if (quote || (shell === 'api')) {
														// Don't unescape when quoted or using APIs
														return '^' + g1;
													} else {
														return g1;
													};
												} else if (g2) {
													// Invalid characters
													if ((g2 === ' ') && (shell === 'api')) {
														// Allow spaces when using APIs
														return g2;
													} else if (!quote || (g2 === quote)) {
														state.invalid = g2;
													} else {
														// Allow when quoted
														return g2;
													};
												};
											})
										};
									} else { // if (((os === 'linux') && (shell === 'api')) || (shell === 'bash'))
										unescapePath = function(path) {
											return tools.replace(path, __Internal__.parsePathUnixUnescapeShellReservedCharsRegEx, function(matched, g1, g2, pos, str) {
												if (g1) {
													// Unescape
													if (quote || (shell === 'api')) {
														// Don't unescape when quoted or using APIs
														return '\\' + g1;
													} else {
														return g1;
													};
												} else if (g2) {
													// Invalid characters
													if ((g2 === ' ') && (shell === 'api')) {
														// Allow spaces when using APIs
														return g2;
													} else if (!quote || (g2 === quote)) {
														state.invalid = g2;
													} else {
														// Allow when quoted
														return g2;
													};
												};
											})
										};
									};

									var unescapePathArray = function(path) {
										for (var i = 0; i < path.length; i++) {
											path[i] = unescapePath(path[i]);
										};
										return path;
									};
									
									if (dirRoot) {
										if (dirRootIsString) {
											dirRoot = unescapePath(dirRoot);
										} else {
											dirRoot = unescapePathArray(dirRoot);
										};
									};
									if (path) {
										if (pathIsString) {
											path = unescapePath(path);
										} else {
											path = unescapePathArray(path);
										};
									};
									if (file) {
										file = unescapePath(file);
									};

									if (state.invalid) {
										if (dontThrow) {
											return null;
										} else {
											throw new types.ParseError("Invalid char: " + types.toSource(state.invalid) + ".");
										};
									};
									
								};
									
								// Get and validate drive
								if (os === 'windows') {
									if (types.isNothing(drive)) {
										drive = '';
										// Auto-detect (take drive letter)
										// NOTE: We don't allow "F:file.js" which refers to the current path of "F:" (Windows has a current path for every drives)
										if (dirRoot && dirRootIsString) {
											if (dirRoot[1] === ':') {
												drive = dirRoot[0].toUpperCase();
												dirRoot = dirRoot.slice(2);
											};
										} else if (pathIsString) {
											if (path[1] === ':') {
												drive = path[0];
												path = path.slice(2);
											};
										};
									};

									if (drive) {
										// Validate drive letter
										drive = drive.toUpperCase();
										var chr = (drive.charCodeAt(0) || 0);
										if ((drive.length > 1) || (chr < 65) || (chr > 90)) {
											if (dontThrow) {
												return null;
											} else {
												throw new types.ParseError("Invalid drive.");
											};
										};
									};
								} else {
									if (drive) {
										if (dontThrow) {
											return null;
										} else {
											throw new types.ParseError("'drive' option is invalid for Unix-like systems.");
										};
									};
									
									drive = '';
								};
								
								// Split paths
								if (dirRootIsString) {
									dirRoot = dirRoot.split(dirChar);
								};
								if (pathIsString) {
									path = path.split(dirChar);
								};
								if (file) {
									file = file.split(dirChar);
								};
								
								if (types.isNothing(isRelative)) {
									// Auto-detect
									isRelative = (tools.findItems(path, ['.', '..']) !== null) || 
												(tools.findItems(file, ['.', '..']) !== null)
								};
								
								if (types.isNothing(dirRoot)) {
									// Auto-set
									if (pathIsString && !isRelative) {
										dirRoot = [];
									} else {
										dirRoot = null;
									};
								} else if (tools.findItem(dirRoot, function(item) {
											return (item === '.') || (item === '..');
										}) !== null) {
									if (dontThrow) {
										return null;
									} else {
										throw new types.ParseError("'root' can't be relative.");
									};
								};

								if (pathIsString && !pathWasNothing) {
									// Last item, when not empty, is the file name
									if (path.length > 1) {
										var tmp = path.pop();
										if (types.isNothing(file) && tmp) {
											// Auto-set
											file = [tmp];
										};
									} else if (types.isNothing(file)) {
										// Auto-set
										file = path;
										path = null;
									};
								};
								
								if (!isRelative) {
									// Resolve relative paths
									if (dirRoot) {
										var abs = tools.relativeToAbsolute(dirRoot, null, {
											dirChar: dirChar,
											dontThrow: dontThrow,
										});
										if (!abs) {
											return null;
										};
										dirRoot = abs.path;
									};
									
									if (path) {
										var abs = tools.relativeToAbsolute(path, dirRoot, {
											dirChar: dirChar,
											dontThrow: dontThrow,
										});
										if (!abs) {
											return null;
										};
										dirRoot = abs.dirRoot;
										path = abs.path;
									};

									if (file) {
										var abs = tools.relativeToAbsolute(file, path, {
											dirChar: dirChar,
											dontThrow: dontThrow,
										});
										if (!abs) {
											return null;
										};
										path = abs.dirRoot;
										file = abs.path;
									};
								};
								
								// Validate file names
								if (shell) {
									var validatePath = null,
										state = {
											invalid: null,
										};
										
									if (shell === 'dos') {
										validatePath = function(pathArray) {
											tools.forEach(pathArray, function(item, pos, items) {
												// NOTE: DOS trims spaces at the end of path and file names but keeps them at the beginning
												var tmp = tools.trim(item, ' ', -1);
												
												// NOTE: DOS also trims dots at the end
												// NOTE: More than two dots resolves to one
												if (tmp !== '..') {
													tmp = tools.trim(tmp, '.', -1, tmp.length - 1);
												};
												
												if (!isRelative) {
													if ((tmp === '.') || (tmp === '..')) {
														state.invalid = item;
													};
												};

												items[pos] = tmp;
												
												// NOTE: DOS has reserved file names
												if (__Internal__.parsePathWindowsInvalidNamesRegEx.test(tmp)) {
													state.invalid = item;
												};
											});
										};
									//} else if (shell === 'api') {
									} else {
										if (!isRelative) {
											validatePath = function(pathArray) {
												tools.forEach(pathArray, function(item, pos, items) {
													if ((item === '.') || (item === '..')) {
														state.invalid = item;
													};
												});
											};
										};
									};
									//} else {
									//	// Unix/Linux
									//	validatePath = function(pathArray) {
									//		tools.forEach(pathArray, function(item, pos, items) {
									//			if (!isRelative) {
									//				if ((item === '.') || (item === '..')) {
									//					state.invalid = item;
									//				};
									//			};
									//			if (__Internal__.parsePathUnixInvalidNamesRegEx.test(item)) {
									//				state.invalid = item;
									//			};
									//		});
									//	};
									//};
									
									if (validatePath) {
										validatePath(dirRoot);
										validatePath(path);
										validatePath(file);
										
										if (state.invalid) {
											if (dontThrow) {
												return null;
											} else {
												throw new types.ParseError("Invalid path or file name: " + types.toSource(state.invalid) + ".");
											};
										};
									};
								};
								
								if (file) {
									if (isRelative) {
										file = file.join(dirChar);
									} else if (file.length <= 1) {
										file = file[0];
									} else  {
										if (dontThrow) {
											return null;
										} else {
											throw new types.ParseError("Invalid file name.");
										};
									};
								};

								return new this({
									os: os,
									dirChar: dirChar,
									drive: drive,
									root: dirRoot || [],
									path: path || [],
									file: file || null,
									quote: quote,
									isRelative: isRelative,
									noEscapes: noEscapes,
									shell: shell,
								});
							}),
					},
					/*instanceProto*/
					types.extend({
						changed: false,
						
						_new: types.SUPER(function _new(options) {
							if (this instanceof tools.Path) {
								this._super();
								var dirChar = options.dirChar,
									properties = types.fill(__Internal__.pathOptionsKeys, {}, options),
									self = this;
								tools.forEach(properties, function(value, key) {
									//if (((key === 'path') || (key === 'root')) && types.isString(value)) {
									//	value = value.split(dirChar || '/');
									//};
									properties[key] = {
										configurable: true,
										enumerable: true,
										value: properties[key],
										writable: false,
									};
								});
								types.defineProperties(this, properties);
								this.changed = false;
							};
						}),
						
						set: root.DD_DOC(
							//! REPLACE_BY("null")
							{
										author: "Claude Petit",
										revision: 1,
										params: {
											options: {
												type: 'object',
												optional: false,
												description: "Options",
											},
										},
										returns: 'Path',
										description: "Set system path options with specified ones and returns a new Path object.",
							}
							//! END_REPLACE()
							, function set(options) {
								return tools.Path.parse(null, types.fill(__Internal__.pathOptionsKeys, {}, this, options));
							}),
						
						toString: root.DD_DOC(
							//! REPLACE_BY("null")
							{
										author: "Claude Petit",
										revision: 0,
										params: {
											options: {
												type: 'object',
												optional: true,
												description: "Options",
											},
										},
										returns: 'string',
										description: "Converts to a string.",
							}
							//! END_REPLACE()
							, function toString(/*optional*/options) {
								if (!(this instanceof tools.Path)) {
									return '';
								};

								var changed = this.changed;
								
								if (options) {
									changed = true;
								};

								// Flags
								var dontValidate = types.get(options, 'dontValidate', false);
								
								
								if (changed && !dontValidate) {
									// Validate
									// NOTE: Use "parse" because there is too many validations and we don't want to repeat them
									options = types.clone(options) || {};
									if (!types.hasKey(options, 'dontThrow')) {
										options.dontThrow = true;  // "parse" will returns null when invalid
									};
									options = tools.Path.parse(this, options);
									if (!options) {
										// NOTE: Do not throw exceptions in "toString" because the javascript debugger doesn't like it
										//throw new types.PathError("Invalid path.");
										return '';
									};
								} else {
									options = this;
								};
								
								
								var drive = options.drive,
									dirRoot = options.root,
									path = options.path,
									file = options.file,
									hasRoot = path.length && !path[0].length;
								
								
								dirRoot = dirRoot && tools.trim(dirRoot, '');
								path = path && tools.trim(path, '');
								path = types.append([], dirRoot, path, [file]);

								if (!options.noEscapes && !options.quote) {
									if (options.shell === 'bash') {
										var pathLen = path.length;
										for (var i = 0; i < pathLen; i++) {
											path[i] = path[i].replace(__Internal__.parsePathUnixEscapeShellReservedCharsRegEx, "\\$1");
										};
									} else if (options.shell === 'dos') {
										var pathLen = path.length;
										for (var i = 0; i < pathLen; i++) {
											path[i] = path[i].replace(__Internal__.parsePathWindowsEscapeShellReservedCharsRegEx, "^$1");
										};
									};
								};

								var result = path.join(options.dirChar);

								if (!options.isRelative || drive.length || hasRoot) {
									result = (options.dirChar + result);
								};
								
								if (drive.length) {
									result = (drive + ':') + result;
								};
								
								if (options.quote) {
									result = (options.quote + result + options.quote);
								};
								
								return result;
							}),
						
						combine: root.DD_DOC(
							//! REPLACE_BY("null")
							{
										author: "Claude Petit",
										revision: 0,
										params: {
											path: {
												type: 'string,Path,Url',
												optional: true,
												description: "'Path' or 'Url' object to combine with. A string is parsed to a 'Path' object.",
											},
											options: {
												type: 'object',
												optional: true,
												description: "Options",
											},
										},
										returns: 'Path',
										description: "Combines with the specified 'Url' or 'Path' object and the provided options, then returns the result.",
							}
							//! END_REPLACE()
							, function combine(/*optional*/path, /*optional*/options) {
								root.DD_ASSERT && root.DD_ASSERT(types.isNothing(path) || types.isString(path) || types._instanceof(path, [tools.Path, tools.Url]), "Invalid path.");

								var dontThrow = types.get(options, 'dontThrow', false);
								
								if (types.isNothing(path) || types.isString(path)) {
									path = tools.Path.parse(path, options);
									options = null;
								};
								
								var data;
								if (path instanceof tools.Path) {
									data = types.fill(__Internal__.pathOptionsKeys, {}, this, tools.filter(path, function(val, key) {
										return val && (key !== 'os') && (key !== 'dirChar') && (key !== 'root') && (key !== 'path') && (key !== 'quote') && (key !== 'isRelative') && (key !== 'noEscapes') && (key !== 'shell');
									}), options);
									if (data.drive && (data.drive !== this.drive)) {
										if (dontThrow) {
											return null;
										} else {
											throw new types.ParseError("Drive mismatch.");
										};
									};
									var dirRoot = types.get(options, 'root', path.root);
									if (!types.isNothing(dirRoot)) {
										if (types.isString(dirRoot)) {
											dirRoot = dirRoot.split(data.dirChar);
										};
										dirRoot = tools.trim(dirRoot, '');
									};
									var dir = types.get(options, 'path', path.path);
									if (!types.isNothing(dir)) {
										if (types.isString(dir)) {
											dir = dir.split(data.dirChar);
										};
										dir = tools.trim(dir, '');
									};
									data.path = types.append([], dirRoot, dir);
								} else { //if (path instanceof tools.Url)
									if (types.get(options, 'protocol', path.protocol) !== 'file') {
										if (dontThrow) {
											return null;
										} else {
											throw new types.ParseError("Bad url protocol.");
										};
									};
									data = types.fill(__Internal__.pathOptionsKeys, {}, this);
									var dir = types.get(options, 'path', path.path);
									if (!types.isNothing(dir)) {
										if (types.isString(dir)) {
											dir = dir.split('/');
										};
										dir = tools.trim(dir, '');
									};
									if (types.get(options, 'isWindows', path.isWindows)) {
										if (dir.length && (dir[0][0] !== this.drive)) {
											if (dontThrow) {
												return null;
											} else {
												throw new types.ParseError("Drive mismatch.");
											};
										};
										dir.shift();
									};
									data.path = dir;
									data.file = types.get(options, 'file', path.file);
								};
								
								data.root = types.append([], tools.trim(this.root || [], ''), tools.trim(this.path || [], ''));
								data.dontThrow = dontThrow;

								path = tools.Path.parse(null, data);

								return path;
							}),
						
						moveUp: root.DD_DOC(
							//! REPLACE_BY("null")
							{
										author: "Claude Petit",
										revision: 1,
										params: {
											count: {
												type: 'integer',
												optional: true,
												description: "Number of times to move up. Default is '1'.",
											},
										},
										returns: 'Path',
										description: "Moves up to parent folder the specified number of times and returns a new Path object.",
							}
							//! END_REPLACE()
							, function moveUp(/*optional*/count) {
								if (types.isNothing(count)) {
									count = 1;
								};
								var i = this.path.length - 1;
								while ((i >= 0) && (count > 0)) {
									var tmp = this.path[i];
									if (tmp === '.') {
									} else if (tmp === '..') {
										count++;
									} else {
										count--;
									};
									i--;
								};
								var path;
								if (count > 0) {
									path = [];
									if (this.isRelative) {
										while (count > 0) {
											path.push('..');
											count--;
										};
									};
								} else {
									path = this.path.slice(0, i + 1);
								};
								return tools.Path.parse(null, types.fill(__Internal__.pathOptionsKeys, {}, this, {path: path}));
							}),
						
						pushFile: root.DD_DOC(
							//! REPLACE_BY("null")
							{
										author: "Claude Petit",
										revision: 1,
										params: null,
										returns: 'Path',
										description: "Includes file in the path and returns a new Path object. Useful after parsing path strings not including file names which are known to miss the trailing directory separator (like environment variables). It might be a parse option in the future.",
							}
							//! END_REPLACE()
							, function pushFile() {
								if (this.file) {
									return tools.Path.parse(null, types.fill(__Internal__.pathOptionsKeys, {}, this, {file: null, path: types.append([], this.path, [this.file])}));
								} else {
									return tools.Path.parse(this);
								};
							}),
						
					}, __Internal__.pathOptions)
				)));
			
			//===================================
			// URLs
			// TODO: View "window.URL" and "require('url')" implementations
			//===================================
			
			//tools.UrlError = types.createErrorType("UrlError", global.Error);

			tools.UrlArguments = root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 1,
							params: {
								args: {
									type: 'arrayof(object)',
									optional: true,
									description: "Arguments.",
								},
								options: {
									type: 'object',
									optional: true,
									description: "Arguments options.",
								},
							},
							returns: 'UrlArguments',
							description: "Represents arguments to an URL.",
				}
				//! END_REPLACE()
				, types.INIT(types.Type.$inherit( 
					/*typeProto*/
					{
						$TYPE_NAME: 'UrlArguments',

						parse: root.DD_DOC(
							//! REPLACE_BY("null")
							{
									author: "Claude Petit",
									revision: 0,
									params: {
										args: {
											type: 'string,object,array',
											optional: true,
											description: "Arguments to parse.",
										},
										options: {
											type: 'object',
											optional: true,
											description: "Parse options.",
										},
									},
									returns: 'UrlArguments',
									description: "Parses a string and returns an 'UrlArguments' object.",
							}
							//! END_REPLACE()
							, function parse(/*optional*/args, /*optional*/options) {
								// WARNING: Validation is incomplete.
								
								if (root.DD_ASSERT) {
									root.DD_ASSERT(types.isNothing(args) || types.isString(args) || types.isJsObject(args) || types.isArray(args), "Invalid arguments.");
									root.DD_ASSERT(types.isNothing(options) || types.isJsObject(options), "Invalid options.");
								};

								if (!types.isNothing(args)) {
									var noEscapes = types.get(options, 'noEscapes', false);
									if (types.isString(args)) {
										args = args.split('&');
										for (var i = args.length - 1; i >= 0; i--) {
											var arg = args[i].split('=', 2);
											var name = arg[0];
											if (!noEscapes) {
												name = __Natives__.windowUnescape(name);
											};
											var value = null;
											if (arg.length === 2) {
												value = arg[1];
												if (!noEscapes) {
													value = __Natives__.windowUnescape(value);
												};
											};
											args[i] = {
												name: name,
												value: value,
											};
										};
									} else {
										args = tools.reduce(args, function(result, value, name) {
											if (types.isObject(value)) {
												name = value.name;
												value = value.value;
											};
											if (!noEscapes) {
												name = __Natives__.windowUnescape(name);
											};
											if (!noEscapes) {
												value = __Natives__.windowUnescape(value);
											};
											result.push({
												name: name,
												value: value,
											});
											return result;
										}, []);
									};
								};
								
								return new tools.UrlArguments(args, options);
							}),
					},
					/*instanceProto*/
					{
						options: null,
						__args: null,
						
						_new: types.SUPER(function(args, /*optional*/options) {
							if (this instanceof tools.UrlArguments) {
								if (root.DD_ASSERT) {
									root.DD_ASSERT(types.isNothing(args) || types.isArray(args), "Invalid arguments array.");
								};

								this._super();
								
								if (types.hasDefinePropertyEnabled()) {
									types.defineProperties(this, {
										options: {
											configurable: true,
											enumerable: true,
											value: options,
											writable: false,
										},
										__args: {
											configurable: true,
											enumerable: true,
											value: args,
											writable: false,
										},
									});
								} else {
									this.options = options;
									this.__args = args;
								};
							};
						}),
						
						toString: root.DD_DOC(
							//! REPLACE_BY("null")
							{
									author: "Claude Petit",
									revision: 0,
									params: {
										options: {
											type: 'object',
											optional: true,
											description: "Options.",
										},
									},
									returns: 'string',
									description: "Converts to a string with the specified options.",
							}
							//! END_REPLACE()
							, function toString(/*optional*/options) {
								if (types.isNothing(this.__args)) {
									return '';
								};
								options = types.extend({}, this.options, options);
								var result = '',
									len = this.__args.length,
									arg,
									name, 
									val;
								var noEscapes = types.get(options, 'noEscapes', false);
								for (var i = 0; i < len; i++) {
									arg = this.__args[i];
									name = arg.name;
									val = arg.value;
									if (!types.isNothing(name) || !types.isNothing(val)) {
										if (!types.isNothing(name)) {
											if (!noEscapes) {
												name = __Natives__.windowEscape(name);
											};
											result += name;
										};
										if (!types.isNothing(val)) {
											if (!noEscapes) {
												val = __Natives__.windowEscape(val);
											};
											result += '=' + val;
										};
										result += '&';
									};
								};
								return result.slice(0, result.length - 1);
							}),
						
						has: root.DD_DOC(
							//! REPLACE_BY("null")
							{
									author: "Claude Petit",
									revision: 0,
									params: {
										name: {
											type: 'string',
											optional: false,
											description: "Name of the argument.",
										},
									},
									returns: 'bool',
									description: "Returns 'true' if there exists an argument with the specified name. Returns 'false' otherwise.",
							}
							//! END_REPLACE()
							, function has(name) {
								if (root.DD_ASSERT) {
									root.DD_ASSERT((this instanceof tools.UrlArguments), "Invalid arguments object.");
									root.DD_ASSERT(types.isNothing(name) || types.isString(name), "Invalid name.");
								};
								if (this.__args) {
									for (var i = this.__args.length - 1; i >= 0; i--) {
										var arg = this.__args[i];
										if (arg.name === name) {
											return true;
										};
									};
								};
								return false;
							}),
						get: root.DD_DOC(
							//! REPLACE_BY("null")
							{
									author: "Claude Petit",
									revision: 0,
									params: {
										name: {
											type: 'string',
											optional: false,
											description: "Name of the argument.",
										},
										singleValue: {
											type: 'bool',
											optional: true,
											description: "When 'true', function will returns only the first occurrence as a single value. When 'false', all occurrences will be returned as an array. Default is 'false'.",
										},
									},
									returns: 'object',
									description: "Returns an object having 'name' and 'value' attributes. When argument doesn't exists, 'value' is 'undefined'.",
							}
							//! END_REPLACE()
							, function get(name, /*optional*/singleValue) {
								if (root.DD_ASSERT) {
									root.DD_ASSERT((this instanceof tools.UrlArguments), "Invalid arguments object.");
									root.DD_ASSERT(types.isNothing(name) || types.isString(name), "Invalid name.");
								};
								var result = undefined,
									isArray = false,
									isNothing = true;
								if (types.isNothing(this.__args)) {
									return result;
								};
								for (var i = this.__args.length - 1; i >= 0; i--) {
									var arg = this.__args[i];
									if (arg.name === name) {
										if (isArray) {
											result.push(arg.value);
										} else if (isNothing) {
											result = arg.value;
											isNothing = false;
											if (singleValue) {
												break;
											};
										} else {
											result = [value, arg.value];
											isArray = true;
										};
									};
								};
								return result;
							}),
						
						set: root.DD_DOC(
							//! REPLACE_BY("null")
							{
									author: "Claude Petit",
									revision: 1,
									params: {
										name: {
											type: 'string,arrayof(string)',
											optional: false,
											description: "Name of the argument.",
										},
										value: {
											type: 'string',
											optional: true,
											description: "Value of the argument. When value is nothing, the name is parsed like a \"name=value\" pair.",
										},
										replace: {
											type: 'bool',
											optional: true,
											description: "When 'true', function will replace every matching arguments. When 'false', function will append a new value. Default is 'true'.",
										},
									},
									returns: 'this',
									description: "Sets the specified argument with the specified value.",
							}
							//! END_REPLACE()
							, function set(name, /*optional*/value, /*optional*/replace) {
								if (root.DD_ASSERT) {
									root.DD_ASSERT((this instanceof tools.UrlArguments), "Invalid arguments object.");
									root.DD_ASSERT(types.isNothing(name) || types.isString(name) || types.isArray(name), "Invalid name.");
									root.DD_ASSERT(types.isNothing(value) || types.isString(value) || (types.isArray(value) && tools.every(value, types.isString)), "Invalid value.");
								};
								var noEscapes = types.get(this.options, 'noEscapes', false);
								if (!types.isArray(name)) {
									name = [name];
								};
								if (types.isNothing(replace)) {
									replace = true;
								};
								if (!types.isNothing(value) && !types.isArray(value)) {
									value = [value];
								};
								var args;
								if (types.isNothing(this.__args)) {
									args = [];
								} else {
									args = types.clone(this.__args, 1);
								};
								for (var j = 0; j < name.length; j++) {
									var n = name[j],
										v = value;
									if (types.isNothing(v)) {
										n = n.split('=', 2);
										if (n.length < 2) {
											v = null;
										} else {
											v = n[1];
										};
										n = n[0];
										if (!noEscapes) {
											if (v) {
												v = __Natives__.windowUnescape(v);
											};
											n = __Natives__.windowUnescape(n);
										};
										v = [v];
									};
									if (replace) {
										for (var i = 0; i < args.length;) {
											var arg = args[i];
											if (arg.name === n) {
												if (v.length) {
													var val = v.shift();
													if (!noEscapes) {
														val = __Natives__.windowUnescape(val);
													};
													args[i].value = val;
												} else {
													args.pop(i);
													continue;
												};
											};
											i++;
										};
									};
									for (var i = 0; i < v.length; i++) {
										args.push({
											name: n,
											value: v[i],
										});
									};
								};
								if ((!args.length) && !this.__args) {
									args = null;
								};
								return new tools.UrlArguments(args, types.clone(this.options));
							}),
						
						remove: root.DD_DOC(
							//! REPLACE_BY("null")
							{
									author: "Claude Petit",
									revision: 1,
									params: {
										names: {
											type: 'string,arrayof(string)',
											optional: false,
											description: "Name of the argument(s).",
										},
									},
									returns: 'UrlArguments',
									description: "Removes every occurrences of the specified argument(s) and returns a new UrlArguments object.",
							}
							//! END_REPLACE()
							, function remove(names) {
								if (root.DD_ASSERT) {
									root.DD_ASSERT((this instanceof tools.UrlArguments), "Invalid url object.");
									root.DD_ASSERT(types.isNothing(names) || types.isString(names) || types.isArray(names), "Invalid names.");
								};
								if (!types.isArray(names)) {
									names = [names || ''];
								};
								var args = [];
								if (!types.isNothing(this.__args)) {
									for (var i = this.__args.length - 1; i >= 0; i--) {
										var arg = this.__args[i],
											found = false;
										for (var j = 0; j < names.length; j++) {
											if (arg.name === names[j]) {
												found = true;
												break;
											};
										};
										if (!found) {
											args.push(types.clone(arg));
										};
									};
								};
								if (args.length === 0) {
									args = null;
								};
								return new tools.UrlArguments(args, types.clone(this.options));
							}),
						
						combine: root.DD_DOC(
							//! REPLACE_BY("null")
							{
									author: "Claude Petit",
									revision: 0,
									params: {
										args: {
											type: 'string,UrlArguments,object',
											optional: false,
											description: "Argument to combine.",
										},
										options: {
											type: 'object',
											optional: true,
											description: "Options.",
										},
									},
									returns: 'UrlArguments',
									description: "Combines arguments with other arguments and the specified options.",
							}
							//! END_REPLACE()
							, function combine(args, /*optional*/options) {
								if (root.DD_ASSERT) {
									root.DD_ASSERT((types.isString(args)) || (args instanceof tools.UrlArguments) || (types.isJsObject(args)), "Invalid arguments.");
								};
								options = types.extend({}, this.options, options);
								var mode = types.get(options, 'argsMode', 'merge');
								if (types.isString(args) || types.isJsObject(args)) {
									args = tools.UrlArguments.parse(args, options);
									if (mode === 'replace') {
										return args;
									};
								};
								if (mode === 'replace') {
									args = args.__args && types.clone(args.__args);
								} else if (mode === 'merge') {
									var tmp = {},
										ar1 = this.__args,
										ar1Len = ar1 && ar1.length;
									for (var i = 0; i < ar1Len; i++) {
										var item = ar1[i];
										item.order = i;
										tmp[item.name] = item;
									};
									var ar2 = args.__args,
										ar2Len = ar2 && ar2.length;
									for (var i = 0; i < ar2Len; i++) {
										var item = ar2[i];
										item.order = i + ar1Len;
										tmp[item.name] = item;
									};
									args = types.values(tmp).sort(function(item1, item2) {
										if (item1.order < item2.order) {
											return -1;
										} else if (item1.order > item2.order) {
											return 1;
										} else {
											return 0;
										};
									});
								} else { // if (mode === 'append')
									args = types.append([], this.__args, args.__args);
								};
								return new tools.UrlArguments(args, options);						
							}),
					}
				)));
				
			__Internal__.urlOptions = {
				protocol: null,
				user: null,
				password: null,
				domain: null,
				port: null,
				path: null,
				file: null,
				args: null,
				anchor: null,
				isRelative: false,
				noEscapes: false,
				isWindows: false,
			};
			__Internal__.urlOptionsKeys = types.keys(__Internal__.urlOptions);

			tools.Url = root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 0,
							params: {
								options: {
									type: 'object',
									optional: false,
									description: "URL options.",
								},
							},
							returns: 'Url',
							description: "Represents an URL.",
				}
				//! END_REPLACE()
				, types.INIT(types.Type.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'Url',

						parse: root.DD_DOC(
							//! REPLACE_BY("null")
							{
									author: "Claude Petit",
									revision: 1,
									params: {
										url: {
											type: 'string,Url,Path',
											optional: true,
											description: "URL to parse.",
										},
										options: {
											type: 'object',
											optional: true,
											description: "Parse options.",
										},
									},
									returns: 'Url',
									description: "Represents an URL.",
							}
							//! END_REPLACE()
							, function parse(/*optional*/url, /*optional*/options) {
								// WARNING: Validation is incomplete.
								
								if (types.isNothing(url)) {
									url = types.get(options, 'url', null);
								};
								
								// Flags
								var dontThrow = types.get(options, 'dontThrow', false);
								
								if (url instanceof tools.Url) {
									var args = types.get(options, 'args', null);
									
									options = types.fill(__Internal__.urlOptionsKeys, {}, url, options);
									
									if (types.isJsObject(args)) {
										options.args = url.args.combine(args, options);
									};
									
									url = null;
									
								} else if (url instanceof tools.Path) {
									var pathTmp = url.path,
										isWindows = (url.os === 'windows');
									
									if (isWindows) {
										pathTmp = types.append([], [url.drive + ':'], pathTmp)
									};
									
									options = types.fill(__Internal__.urlOptionsKeys, {
										protocol: 'file',
										path: pathTmp,
										file: url.file,
										isWindows: isWindows,
									}, options);
									
									url = null;
									
								} else if (types.isNothing(url) || types.isString(url)) {
									// Valid
								} else {
									if (dontThrow) {
										return null;
									} else {
										throw new types.ParseError("Invalid url.");
									};
								};

								// Options
								var protocol = types.get(options, 'protocol', null), // Default is Auto-detect
									domain = types.get(options, 'domain', null), // Default is Auto-detect
									user = types.get(options, 'user', null), // Default is Auto-detect
									password = types.get(options, 'password', null), // Default is Auto-detect
									port = types.get(options, 'port', null), // Default is Auto-detect
									path = types.get(options, 'path', null), // Default is Auto-detect
									file = types.get(options, 'file', null), // Default is Auto-detect
									args = types.get(options, 'args', null), // Default is Auto-detect
									anchor = types.get(options, 'anchor', null), // Default is Auto-detect
									isWindows = types.get(options, 'isWindows', null), // Default is Auto-detect
									noEscapes = types.get(options, 'noEscapes', false),
									isRelative = types.get(options, 'isRelative', false); // Default is False
								
								
								if (url) {
									url = url.trim();
									
									var pos;
									
									// Auto-detect "protocol"
									//var pos = url.search(/^(?:[A-Za-z]+)\:\/\//);   // WHY IT DOESN'T RETURN THE POSITION OF /\:\/\// ???
									//var pos = /^(?:[A-Za-z]+)[:]\:\/\//.exec(url)      // WHAT IS WRONG ???
									if (/^[A-Za-z]+\:\/\//.test(url)) {
										pos = url.indexOf(':');
										if (pos >= 0) {
											if (types.isNothing(protocol)) {
												protocol = url.slice(0, pos).toLowerCase() || null;
											};
											url = url.slice(pos + 3);
										};
									};
									
									if ((protocol === 'file') || (protocol === '')) {
										// Auto-detect "isWindows"
										if (types.isNothing(isWindows)) {
											// Workaround for Windows and IE
											isWindows = (tools.search(url, /^[/]?[A-Za-z][:]/) >= 0);
										};
									} else {
										// Auto-detect "isWindows", "domain", "user", "password", "port", "path"
										isWindows = false;
										var newDomain = false;
										pos = tools.search(url, /[/\?#]/);
										if (pos >= 0) {
											if (types.isNothing(domain)) {
												domain = url.slice(0, pos) || null;
												newDomain = true;
											};
											url = url.slice(pos);
										} else {
											if (types.isNothing(domain)) {
												domain = url || null;
												newDomain = true;
											};
											url = '';
										};
										if (domain) {
											pos = domain.indexOf('@');
											var login = null;
											if (pos >= 0) {
												login = domain.slice(0, pos);
												domain = domain.slice(pos + 1) || null;
												pos = login.indexOf(':');
												if (pos >= 0) {
													if (types.isNothing(user)) {
														user = login.slice(0, pos) || null;
													};
													if (types.isNothing(password)) {
														password = login.slice(pos + 1);
													};
												} else {
													if (types.isNothing(user)) {
														user = login || null;
													};
												};
											};
										};
										if (domain) {
											pos = tools.search(domain, /[:][0-9]+/);
											if (pos >= 0) {
												if (types.isNothing(port)) {
													port = domain.slice(pos + 1) || null;
												};
												if (newDomain && domain) {
													domain = domain.slice(0, pos) || null;
												};
											};
										};
									};

									// Auto-detect "args" and "anchor"
									var posArgs = tools.search(url, '?', 0, null, '#');
									var posAnchor = tools.search(url, '#', ((posArgs >= 0) ? posArgs + 1 : 0));
									if ((posArgs >= 0) && types.isNothing(args)) {
										args = url.slice(posArgs + 1, (posAnchor >= 0 ? posAnchor: undefined));
									};
									if ((posAnchor >= 0) && types.isNothing(anchor)) {
										anchor = url.slice(posAnchor + 1);
									};
									if (posArgs < 0) {
										posArgs = posAnchor;
									};
									if (posArgs >= 0) {
										url = url.slice(0, posArgs);
									};

									// Auto-detect "path" and "file"
									pos = url.lastIndexOf('/');
									if (pos >= 0) {
										if (types.isNothing(file)) {
											file = url.slice(pos + 1) || null;
										};
										if (types.isNothing(path)) {
											path = url.slice(0, pos + 1);
										};
									} else {
										if (types.isNothing(file)) {
											file = url || null;
										};
										if (types.isNothing(path)) {
											path = '';
										};
									};
									
								};
								
								if (!noEscapes) {
									if (domain) {
										domain = __Natives__.windowUnescape(domain);
									};
									if (user) {
										user =  __Natives__.windowUnescape(user);
									};
									if (password) {
										password = __Natives__.windowUnescape(password);
									};
									if (port) {
										port = __Natives__.windowUnescape(port);
									};
								};
								
								if (domain) {
									domain = domain.toLowerCase();
								};
								
								if (!types.isNothing(port)) {
									port = parseInt(port);
									if (isNaN(port) || (port <= 0) || (port > 65535)) {
										if (dontThrow) {
											return null;
										} else {
											throw new types.ParseError("Invalid port number.");
										};
									};
								};
								
								if (types.isNothing(args) || types.isString(args) || types.isJsObject(args)) {
									args = tools.UrlArguments.parse(args, {
										noEscapes: noEscapes,
									});
								} else if (!(args instanceof tools.UrlArguments)) {
									if (dontThrow) {
										return null;
									} else {
										throw new types.ParseError("Invalid url arguments.");
									};
								};

								if (!noEscapes && anchor) {
									anchor = __Natives__.windowUnescape(anchor);
								};
								
								if (path) {
									if (types.isString(path)) {
										if (!noEscapes) {
											path = __Natives__.windowUnescape(path);
										};
										path = path.split('/');
									} else {
										if (!noEscapes) {
											path = tools.map(path, __Natives__.windowUnescape);
										};
									};
									path = tools.trim(path, '');
								} else {
									path = null;
								};

								if (file) {
									if (types.isString(file)) {
										if (!noEscapes) {
											file = __Natives__.windowUnescape(file);
										};
										file = file.split('/');
									} else {
										if (!noEscapes) {
											file = tools.map(file, __Natives__.windowUnescape);
										};
									};
									file = tools.trim(file, '');
								} else {
									file = null;
								};
								
								if (types.isNothing(isRelative)) {
									// Auto-detect
									isRelative = (tools.findItems(path, ['.', '..']) !== null) || 
												(tools.findItems(file, ['.', '..']) !== null)
								};
								
								if (!isRelative) {
									if (path) {
										var abs = tools.relativeToAbsolute(path, null, {
											dirChar: '/',
											dontThrow: dontThrow,
										});
										if (!abs) {
											return null;
										};
										path = abs.path;
									};
									if (file) {
										var abs = tools.relativeToAbsolute(file, path, {
											dirChar: '/',
											dontThrow: dontThrow,
										});
										if (!abs) {
											return null;
										};
										path = abs.dirRoot;
										file = abs.path;
									};
								};
								
								if (!isRelative) {
									var state = {
											invalid: null,
										},
										validatePath = function(pathArray) {
											tools.forEach(pathArray, function(item, pos, items) {
												if ((item === '.') || (item === '..')) {
													state.invalid = item;
												};
											});
										};
									validatePath(path);
									validatePath(file);
									if (state.invalid) {
										if (dontThrow) {
											return null;
										} else {
											throw new types.ParseError("Invalid path or file name: " + types.toSource(state.invalid) + ".");
										};
									};
								};
										
								if (file) {
									if (isRelative) {
										file = file.join('/');
									} else if (file.length <= 1) {
										file = file[0];
									} else  {
										if (dontThrow) {
											return null;
										} else {
											throw new types.ParseError("Invalid file name.");
										};
									};
								};

								url = new tools.Url({
									protocol: protocol,
									domain: domain,
									user: user,
									password: password,
									port: port,
									path: path,
									file: file || null,
									args: args,
									anchor: anchor,
									noEscapes: !!noEscapes,
									isRelative: !!isRelative,
									isWindows: !!isWindows,
								});

								return url;
							}),
					},
					/*instanceProto*/
					types.extend({
						changed: false,
						
						_new: types.SUPER(function _new(options) {
							if (this instanceof tools.Url) {
								this._super();
								var properties = types.fill(__Internal__.urlOptionsKeys, {}, options),
									self = this;
								tools.forEach(properties, function(value, key) {
									properties[key] = {
										configurable: true,
										enumerable: true,
										value: properties[key],
										writable: false,
									};
								});
								types.defineProperties(this, properties);
								this.changed = false;
							} else {
								return new tools.Url(options);
							};
						}),
						
						set: root.DD_DOC(
							//! REPLACE_BY("null")
							{
									author: "Claude Petit",
									revision: 1,
									params: {
										options: {
											type: 'object',
											optional: false,
											description: "Options.",
										},
									},
									returns: 'Url',
									description: "Sets URL options and returns a new Url object.",
							}
							//! END_REPLACE()
							, function set(options) {
								return tools.Url.parse(null, types.fill(__Internal__.urlOptionsKeys, {}, this, options));
							}),
						
						setArgs: root.DD_DOC(
							//! REPLACE_BY("null")
							{
									author: "Claude Petit",
									revision: 0,
									params: {
										name: {
											type: 'string,arrayof(string)',
											optional: false,
											description: "Name of the argument.",
										},
										value: {
											type: 'string',
											optional: true,
											description: "Value of the argument. When value is nothing, the name is parsed like a \"name=value\" pair.",
										},
										replace: {
											type: 'bool',
											optional: true,
											description: "When 'true', function will replace every matching arguments. When 'false', function will append a new value. Default is 'true'.",
										},
									},
									returns: 'Url',
									description: "Sets URL arguments and returns a new Url object.",
							}
							//! END_REPLACE()
							, function setArgs(name, /*optional*/value, /*optional*/replace) {
								return this.set({
									args: this.args.set(name, value, replace),
								});
							}),
						
						toString: root.DD_DOC(
							//! REPLACE_BY("null")
							{
									author: "Claude Petit",
									revision: 0,
									params: {
										options: {
											type: 'object',
											optional: true,
											description: "Options.",
										},
									},
									returns: 'string',
									description: "Converts to a string.",
							}
							//! END_REPLACE()
							, function toString(/*optional*/options) {
								if (!(this instanceof tools.Url)) {
									return '';
								};

								var changed = this.changed || this.args.changed;
								
								if (options) {
									changed = true;
								};
								
								// Flags
								var dontValidate = types.get(options, 'dontValidate', false);
								
								if (changed && !dontValidate) {
									// Validate
									// NOTE: Use "parse" because there is too many validations and we don't want to repeat them
									options = types.clone(options) || {};
									if (!types.hasKey(options, 'dontThrow')) {
										//options.dontThrow = true;  // "parse" will returns null when invalid
									};
									options = tools.Url.parse(this, options);
									if (!options) {
										// NOTE: Do not throw exceptions in "toString" because the javascript engine doesn't like it
										//throw new tools.UrlError("Invalid url.");
										return '';
									};
								} else {
									options = this;
								};

								// Options
								var noEscapes = types.get(options, 'noEscapes', false);

								
								var result = '';
								
								if (options.protocol) {
									result += options.protocol + '://';
								};
								
								if (!types.isNothing(options.domain)) {
									if (!types.isNothing(options.user) || !types.isNothing(options.password)) {
										if (!types.isNothing(options.user)) {
											result += (noEscapes ? options.user : __Natives__.windowEscape(options.user));
										};
										if (!types.isNothing(options.password)) {
											result += ':' + (noEscapes ? options.password : __Natives__.windowEscape(options.password));
										};
										result += '@';
									}
									result += (noEscapes ? options.domain : __Natives__.windowEscape(options.domain));
									if (!types.isNothing(options.port)) {
										result += ':' + options.port;
									};
								};
								
								if (options.path) {
									var path = '/' + tools.trim((noEscapes ? options.path : tools.map(options.path, __Natives__.windowEscape)), '').join('/');
									if (path.length > 1) {
										path += '/';
									};
									if (!noEscapes && options.isWindows) {
										// Workaround for Windows and IE (must be "/C:/", not "/C%3A/")
										path = tools.replace(path, /^\/?([A-Za-z])\%3[Aa]/, function(result, g1) {
											return '/' + g1.toUpperCase() + ':';
										});
									};
									result += path;
								};

								if (options.file) {
									result += (noEscapes ? options.file : __Natives__.windowEscape(options.file));
								};
								
								if (options.args) {
									if (!types.isNothing(options.args.__args)) {
										result += '?' + options.args.toString(options);
									};
								};
								
								if (!types.isNothing(options.anchor)) {
									result += '#' + (noEscapes ? options.anchor : __Natives__.windowEscape(options.anchor));
								};

								return result;
							}),
						
						compare: root.DD_DOC(
							//! REPLACE_BY("null")
							{
									author: "Claude Petit",
									revision: 0,
									params: {
										url: {
											type: 'string,Url',
											optional: true,
											description: "URL to compare with.",
										},
									},
									returns: 'integer',
									description: "Compares URL with another URL. Returns '0' when exactly the same URL. Returns '1' when same URL, but different anchor. Returns '-1' when different URL.",
							}
							//! END_REPLACE()
							, function compare(url) {
								root.DD_ASSERT && root.DD_ASSERT(types.isString(url) || (url instanceof tools.Url), "Invalid url.");
								
								if (types.isString(url)) {
									url = tools.Url.parse(url);
								};
								var result = (this.toString({anchor: null}) === url.toString({anchor: null}));
								return (result ? ((this.anchor === url.anchor) ? 0 : 1) : -1); // 0=same, 1=different anchor, -1=different
							}),
						
						combine: root.DD_DOC(
							//! REPLACE_BY("null")
							{
									author: "Claude Petit",
									revision: 0,
									params: {
										url: {
											type: 'string,Url,Path',
											optional: false,
											description: "URL to combine with.",
										},
										options: {
											type: 'object',
											optional: true,
											description: "Options.",
										},
									},
									returns: 'Url',
									description: "Combines URL with another URL, then returns the result.",
							}
							//! END_REPLACE()
							, function combine(url, /*optional*/options) {
								root.DD_ASSERT && root.DD_ASSERT(types.isString(url) || types._instanceof(url, [tools.Url, tools.Path]), "Invalid url.");
								
								var dontThrow = types.get(options, 'dontThrow', false);
								
								if (types.isString(url)) {
									url = tools.Url.parse(url, options);
								};

								var data;
								if (url instanceof tools.Url) {
									data = types.fill(__Internal__.urlOptionsKeys, {}, this, tools.filter(url, function(val, key) {
										return val && (key !== 'protocol') && (key !== 'path') && (key !== 'args') && (key !== 'isRelative') && (key !== 'noEscapes') && (key !== 'isWindows');
									}), options);
									if (!types.isNothing(data.path)) {
										if (types.isString(data.path)) {
											data.path = data.path.split('/');
										};
										data.path = tools.trim(data.path, '');
									};
									if (data.isWindows && this.isWindows && (data.path[0] !== this.path[0])) {
										if (dontThrow) {
											return null;
										} else {
											throw new types.ParseError("Drive mismatch.");
										};
									};
									if (url.path) {
										data.path = types.append([], tools.trim(this.path, ''), url.path);
									};
									data.args = data.args.combine(url.args, options);
								} else { // if (url instanceof tools.Path)
									var os = types.get(options, 'os', url.os);
									var drive = types.get(options, 'drive', url.drive);
									var thisPath = this.path;
									if (types.isString(thisPath)) {
										thisPath = thisPath.split('/');
									};
									thisPath = tools.trim(thisPath, '');
									if ((os === 'windows') && (this.isWindows === 'windows') && drive) {
										if (drive !== thisPath[0]) {
											if (dontThrow) {
												return null;
											} else {
												throw new types.ParseError("Drive mismatch.");
											};
										};
										thisPath = thisPath.slice(2);
									};
									data = types.fill(__Internal__.urlOptionsKeys, {}, this);
									var pathRoot = types.get(options, 'root', url.root);
									if (types.isString(pathRoot)) {
										pathRoot = pathRoot.split('/');
									};
									pathRoot = tools.trim(pathRoot, '');
									var path = types.get(options, 'path', url.path);
									if (types.isString(path)) {
										path = path.split('/');
									};
									path = tools.trim(path, '');
									path = types.append([], thisPath, pathRoot, path);
									if (drive) {
										path = types.prepend(drive + ':');
									};
									data.path = path;
									data.file = url.file;
									data.isWindows = (os === 'windows');
								};

								data.dontThrow = dontThrow;
								
								url = tools.Url.parse(null, data);

								return url;
							}),
							
						moveUp: root.DD_DOC(
							//! REPLACE_BY("null")
							{
										author: "Claude Petit",
										revision: 0,
										params: {
											count: {
												type: 'integer',
												optional: true,
												description: "Number of times to move up. Default is '1'.",
											},
										},
										returns: 'Url',
										description: "Moves up to parent folder the specified number of times and returns a new Url object.",
							}
							//! END_REPLACE()
							, function moveUp(/*optional*/count) {
								if (types.isNothing(count)) {
									count = 1;
								};
								var i = this.path.length - 1;
								while ((i >= 0) && (count > 0)) {
									var tmp = this.path[i];
									if (tmp === '.') {
									} else if (tmp === '..') {
										count++;
									} else {
										count--;
									};
									i--;
								};
								var path;
								if (count > 0) {
									path = [];
									if (this.isRelative) {
										while (count > 0) {
											path.push('..');
											count--;
										};
									};
								} else {
									path = this.path.slice(0, i + 1);
								};
								return tools.Url.parse(null, types.fill(__Internal__.urlOptionsKeys, {}, this, {path: path}));
							}),
						
						pushFile: root.DD_DOC(
							//! REPLACE_BY("null")
							{
										author: "Claude Petit",
										revision: 0,
										params: null,
										returns: 'Url',
										description: "Includes file in the path and returns a new Url object. Useful after parsing path strings not including file names which are known to miss the trailing directory separator (like environment variables). It might be a parse option in the future.",
							}
							//! END_REPLACE()
							, function pushFile() {
								if (this.file) {
									return tools.Url.parse(null, types.fill(__Internal__.urlOptionsKeys, {}, this, {file: null, path: types.append([], this.path, [this.file])}));
								} else {
									return tools.Url.parse(this);
								};
							}),
					}, __Internal__.urlOptions)
				)));
				
			
			//===================================
			// Script functions
			//===================================
			
			tools.getCurrentScript = root.DD_DOC(
					//! REPLACE_BY("null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								currentScript: {
									type: 'string,object,error',
									optional: true,
									description: "Some Javascript engines provide a way to get the information. You should give it here.",
								},
							},
							returns: 'Url,Path',
							description:
								"Returns location of the current running script. Multiple usages :\n" + 
								'- Client-side only: Doodad.Tools.getCurrentScript(document.currentScript||(function(){try{throw new Error("");}catch(ex){return ex;}})())\n' +
								'- Client-side and server-side: Doodad.Tools.getCurrentScript((global.document?document.currentScript:module.filename)||(function(){try{throw new Error("");}catch(ex){return ex;}})())\n' +
								'- Server-side only: Don\'t use this function. Instead, do : Doodad.Tools.Path.parse(module.filename)\n',
					}
					//! END_REPLACE()
				, function getCurrentScript(/*optional*/currentScript) {
					var url,
						ex,
						exLevel = 0;
				
					if (types.isError(currentScript)) {
						ex = currentScript;
					} else if (types.isString(currentScript)) {
						// NodeJs
						url = tools.Path.parse(currentScript);
					} else if (types.isObject(currentScript) && types.isString(currentScript.src)) {
						// NOTE: currentScript is 'document.currentScript'
						// Google Chrome 39 Windows: OK
						// Firefox 34: undefined
						// IE 11: undefined
						// Opera 26 Windows: OK
						// Safari 5: undefined
						url = tools.Url.parse(currentScript.src);
					};
					
					if (!url) {
						if (ex && types.isString(ex.sourceURL)) {
							// Safari
							url = tools.Url.parse(ex.sourceURL);
						} else {
							// Other browsers
							if (!ex) {
								exLevel = 1;
								try {
									throw new __Natives__.windowError("");
								} catch(o) {
									ex = o;
								};
							};
							var stack = tools.parseStack(ex);
							if (stack && (stack.length > exLevel)) {
								var trace = stack[exLevel];
								if (trace.isSystemPath) {
									url = tools.Path.parse(trace.path);
								} else {
									url = tools.Url.parse(trace.path);
								};
							};
						};
					};
					
					return url;
				});
			
			
			//===================================
			// Compare functions
			//===================================
				
			tools.compareNumbers = root.DD_DOC(
					//! REPLACE_BY("null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								value1: {
									type: 'any',
									optional: false,
									description: "Value to compare from.",
								},
								value2: {
									type: 'any',
									optional: false,
									description: "Value to compare to.",
								},
							},
							returns: 'integer',
							description:
								"Usable ascendant comparer function. Returns '0' when values are equals. Returns '1' when 'value1' is greater than 'value2'. Returns '-1' when 'value1' is lower than 'value2'.\n" +
								"NOTE: This changes the default behavior of \"sort\" so \"null/NaN/String/Object/Array\" are all evaluated to 0 and \"-1 is > -Infinity\"",
					}
					//! END_REPLACE()
				, function compareNumbers(value1, value2) {
					// null/NaN/undefined/String/Object/Array  are   0
					value1 = ((+value1 === value1) ? value1 : (value1 | 0));
					value2 = ((+value2 === value2) ? value2 : (value2 | 0));
					if (value1 > value2) {
						return 1;
					} else if (value1 < value2) {
						return -1;
					} else {
						return 0;
					};
				});
			
			tools.compareNumbersInverted = root.DD_DOC(
				//! REPLACE_BY("null")
				{
						author: "Claude Petit",
						revision: 0,
						params: {
							value1: {
								type: 'any',
								optional: false,
								description: "Value to compare from.",
							},
							value2: {
								type: 'any',
								optional: false,
								description: "Value to compare to.",
							},
						},
						returns: 'integer',
						description:
							"Usable descendant comparer function. Returns '0' when values are equals. Returns '-1' when 'value1' is greater than 'value2'. Returns '1' when 'value1' is lower than 'value2'.\n" +
							"NOTE: This changes the default behavior of \"sort\" so \"null/NaN/String/Object/Array\" are all evaluated to 0 and \"-1 is > -Infinity\"",
				}
				//! END_REPLACE()
				, function compareInverted(value1, value2) {
					// Usable comparer function
					// null/NaN/undefined/String/Object/Array  are   0
					value1 = ((+value1 === value1) ? value1 : (value1 | 0));
					value2 = ((+value2 === value2) ? value2 : (value2 | 0));
					if (value1 < value2) {
						return 1;
					} else if (value1 > value2) {
						return -1;
					} else {
						return 0;
					};
				});

			

			//===================================
			// Object functions
			//===================================
				
			types.allKeys = root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 0,
							params: {
								obj: {
									type: 'any',
									optional: false,
									description: "An object.",
								},
							},
							returns: 'bool',
							description: "Returns an array of all enumerable and not enumerable property names of an object.",
				}
				//! END_REPLACE()
				, function allKeys(obj) {
					return obj && tools.unique(types.getOwnPropertyNames(obj), types.allKeys(types.getPrototypeOf(obj)));
				});
			
			tools.indexOf = root.DD_DOC(
				//! REPLACE_BY("null")
				{
						author: "Claude Petit",
						revision: 0,
						params: {
							obj: {
								type: 'arraylike',
								optional: false,
								description: "Array value.",
							},
							item: {
								type: 'any',
								optional: false,
								description: "Value to search for.",
							},
							from: {
								type: 'integer',
								optional: true,
								description: "Index to start searching from. Default is '0'.",
							},
						},
						returns: 'integer',
						description: "Returns the index of the first occurrence of the item. Returns '-1' when item is not found.",
				}
				//! END_REPLACE()
				, function indexOf(obj, item, /*optional*/from) {
					if (types.isArrayLike(obj)) {
						from = (+from || 0);
						if (types.isString(obj)) {
							return __Natives__.stringIndexOf.call(obj, item, from);
						} else {
							if (__Natives__.arrayIndexOf) {
								// JS 1.6
								return __Natives__.arrayIndexOf.call(obj, item, from);
							} else {
								obj = Object(obj);
								var len = obj.length;
								from = Math.max(from >= 0 ? from : len - Math.abs(from), 0);
								for (var key = from; key < len; key++) {
									if (key in obj) {
										if (obj[key] === item) {
											return key;
										};
									};
								};
							};
						};
					};
					return -1;
				});
			
			tools.lastIndexOf = root.DD_DOC(
				//! REPLACE_BY("null")
				{
						author: "Claude Petit",
						revision: 0,
						params: {
							obj: {
								type: 'arraylike',
								optional: false,
								description: "Array value.",
							},
							item: {
								type: 'any',
								optional: false,
								description: "Value to search for.",
							},
							from: {
								type: 'integer',
								optional: true,
								description: "Index to start searching from. Default is 'end of array'.",
							},
						},
						returns: 'integer',
						description: "Returns the index of the last occurrence of the item. Returns '-1' when item is not found.",
				}
				//! END_REPLACE()
				, function lastIndexOf(obj, item, /*optional*/from) {
					if (types.isArrayLike(obj)) {
						var len = obj.length;
						from = (+from || (len - 1));
						if (types.isString(obj)) {
							return __Natives__.stringLastIndexOf.call(obj, item, from);
						} else {
							if (__Natives__.arrayLastIndexOf) {
								// JS 1.6
								return __Natives__.arrayLastIndexOf.call(obj, item, from);
							} else {
								obj = Object(obj);
								from = Math.min(from >= 0 ? from : len - Math.abs(from), len - 1);
								for (var key = len - 1; key >= from; key--) {
									if (key in obj) {
										if (obj[key] === item) {
											return key;
										};
									};
								};
							};
						};
					};
					return -1;
				});
			
			tools.map = root.DD_DOC(
				//! REPLACE_BY("null")
				{
						author: "Claude Petit",
						revision: 1,
						params: {
							obj: {
								type: 'arraylike,object,Map,Set',
								optional: false,
								description: "An object to scan.",
							},
							fn: {
								type: 'function',
								optional: false,
								description: 
									"A function to call. Arguments passed to the function are : \n" +
									"  value (any): The current value\n" +
									"  key (integer,string): The current index or attribute name\n" +
									"  obj (arraylike,object): A reference to the object"
							},
							thisObj: {
								type: 'any',
								optional: true,
								description: "Value of 'this' when calling the function. Default is 'undefined'.",
							},
						},
						returns: 'array,object',
						description: "For each item of the array (or the object), maps the value to another value than returns a new array (or a new object instance).",
				}
				//! END_REPLACE()
				, function map(obj, fn, /*optional*/thisObj) {
					root.DD_ASSERT && root.DD_ASSERT(types.isFunction(fn), "Invalid function");

					if (!types.isNothing(obj)) {
						obj = Object(obj);
						if (obj instanceof types.Set) {
							var len = obj.length,
								result = new types.Set();
							obj.forEach(function(value, key, obj) {
								result.add(fn.call(thisObj, value, key, obj));
							});
							return result;
						} else if (obj instanceof types.Map) {
							var len = obj.length,
								result = new types.Map();
							obj.forEach(function(value, key, obj) {
								result.set(key, fn.call(thisObj, value, key, obj));
							});
							return result;
						} else if (types.isArrayLike(obj)) {
							if (__Natives__.arrayMap) {
								return __Natives__.arrayMap.call(obj, fn, thisObj);
							} else {
								var len = obj.length,
									result = Array(len);
								for (var key = 0; key < len; key++) {
									if (key in obj) {
										result[key] = fn.call(thisObj, obj[key], key, obj);
									};
								};
								return result;
							};
						} else {
							var result = types.createObject(types.getPrototypeOf(obj));
							var keys = types.keys(obj),
								len = keys.length, // performance
								i, 
								key;
							for (i = 0; i < len; i++) {
								key = keys[i];
								result[key] = fn.call(thisObj, obj[key], key, obj);
							};
							return result;
						};
					};
				});
			
			tools.forEach = root.DD_DOC(
				//! REPLACE_BY("null")
				{
						author: "Claude Petit",
						revision: 1,
						params: {
							obj: {
								type: 'arraylike,object,Map,Set',
								optional: false,
								description: "An object to browse.",
							},
							fn: {
								type: 'function',
								optional: false,
								description: 
									"A function to call. Arguments passed to the function are : \n" +
									"  value (any): The current value\n" +
									"  key (integer,string): The current index or attribute name\n" +
									"  obj (arraylike,object): A reference to the object"
							},
							thisObj: {
								type: 'any',
								optional: true,
								description: "Value of 'this' when calling the function. Default is 'undefined'.",
							},
						},
						returns: 'undefined',
						description: "For each item of the array (or the object), simply calls the specified function.",
				}
				//! END_REPLACE()
				, function forEach(obj, fn, /*optional*/thisObj) {
					root.DD_ASSERT && root.DD_ASSERT(types.isFunction(fn), "Invalid function");
					
					if (!types.isNothing(obj)) {
						if ((obj instanceof types.Map) || (obj instanceof types.Set)) {
							// "Map" and "Set" have their own "forEach" method.
							return obj.forEach.call(obj, fn, thisObj);
						} else if (types.isArrayLike(obj)) {
							if (__Natives__.arrayForEach) {
								// JS 1.6
								return __Natives__.arrayForEach.call(obj, fn, thisObj);
							} else {
								obj = Object(obj);
								var len = obj.length;
								for (var key = 0; key < len; key++) {
									if (key in obj) {
										fn.call(thisObj, obj[key], key, obj);
									};
								};
							};
						} else {
							// "Object.assign" Polyfill from Mozilla Developer Network.
							obj = Object(obj);
							var keys = types.keys(obj),
								len = keys.length, // performance
								i, 
								key;
							for (i = 0; i < len; i++) {
								key = keys[i];
								fn.call(thisObj, obj[key], key, obj);
							};
						};
					};
				});
			
			tools.filter = root.DD_DOC(
				//! REPLACE_BY("null")
				{
						author: "Claude Petit",
						revision: 1,
						params: {
							obj: {
								type: 'arraylike,object,Map,Set',
								optional: false,
								description: "An object to filter.",
							},
							items: {
								type: 'any,arrayof(any),function',
								optional: false,
								description: 
									"Values to filter with, or a function used to filter. Arguments passed to the function are : \n" +
									"  value (any): The current value\n" +
									"  key (integer,string): The current index or attribute name\n" +
									"  obj (arraylike,object): A reference to the object"
							},
							thisObj: {
								type: 'any',
								optional: true,
								description: "Value of 'this' when calling the function. Default is 'undefined'.",
							},
							invert: {
								type: 'bool',
								optional: true,
								description: "'true' will inverts filtering. Default is 'false'.",
							},
							includeFunctions: {
								type: 'bool',
								optional: true,
								description: "When 'true' and 'items' is a function, the function will be considered like a value.",
							},
						},
						returns: 'array,object',
						description: "Filters array (or object) with the specified items, and returns a new array (or object) with matching items.",
				}
				//! END_REPLACE()
				, function filter(obj, items, /*optional*/thisObj, /*optional*/invert, /*optional*/includeFunctions) {
					var result;
					if (!types.isNothing(obj)) {
						obj = Object(obj);
						invert = !!invert;
						var keys,
							len,
							i, 
							key,
							val;
						if (!includeFunctions && types.isFunction(items)) {
							if (obj instanceof types.Map) {
								result = new types.Map();
								obj.forEach(function(val, key) {
									if (invert === !items.call(thisObj, val, key, obj)) {
										result.set(key, val);
									};
								});
							} else if (obj instanceof types.Set) {
								result = new types.Set();
								obj.forEach(function(val, key) {
									if (invert === !items.call(thisObj, val, key, obj)) {
										result.add(val);
									};
								});
							} else if (types.isArrayLike(obj)) {
								if (__Natives__.arrayFilter && !invert) {
									// JS 1.6
									result = __Natives__.arrayFilter.call(obj, items, thisObj);
								} else {
									result = [];
									len = obj.length;
									for (var key = 0; key < len; key++) {
										if (key in obj) {
											var val = obj[key];
											if (invert === !items.call(thisObj, val, key, obj)) {
												result.push(val);
											};
										};
									};
								};
							} else {
								// "Object.assign" Polyfill from Mozilla Developer Network.
								result = {};
								keys = types.keys(obj);
								len = keys.length;
								for (i = 0; i < len; i++) {
									key = keys[i];
									val = obj[key];
									if (invert === !items.call(thisObj, val, key, obj)) {
										result[key] = val;
									};
								};
							};
						} else {
							if (obj instanceof types.Map) {
								result = new types.Map();
								obj.forEach(function(val, key) {
									if (invert === (tools.findItem(items, val, undefined, true) === null)) {
										result.set(key, val);
									};
								});
							} else if (obj instanceof types.Set) {
								result = new types.Set();
								obj.forEach(function(val, key) {
									if (invert === (tools.findItem(items, val, undefined, true) === null)) {
										result.add(val);
									};
								});
							} else if (types.isArrayLike(obj)) {
								result = [];
								len = obj.length;
								for (var key = 0; key < len; key++) {
									if (key in obj) {
										val = obj[key];
										if (invert === (tools.findItem(items, val, undefined, true) === null)) {
											result.push(val);
										};
									};
								};
							} else {
								// "Object.assign" Polyfill from Mozilla Developer Network.
								result = {};
								keys = types.keys(obj);
								len = keys.length;
								for (i = 0; i < len; i++) {
									key = keys[i];
									val = obj[key];
									if (invert === (tools.findItem(items, val, undefined, true) === null)) {
										result[key] = val;
									};
								};
							};
						};
					};
					return result;
				});
			
			tools.filterKeys = root.DD_DOC(
				//! REPLACE_BY("null")
				{
						author: "Claude Petit",
						revision: 0,
						params: {
							obj: {
								type: 'arraylike,object',
								optional: false,
								description: "An object to filter.",
							},
							items: {
								type: 'any,arrayof(any),function',
								optional: false,
								description: 
									"Keys to filter with, or a function used to filter. Arguments passed to the function are : \n" +
									"  value (any): The current value\n" +
									"  key (integer,string): The current index or attribute name\n" +
									"  obj (arraylike,object): A reference to the object"
							},
							thisObj: {
								type: 'any',
								optional: true,
								description: "Value of 'this' when calling the function. Default is 'undefined'.",
							},
							invert: {
								type: 'bool',
								optional: true,
								description: "'true' will invert filtering. Default is 'false'.",
							},
							includeFunctions: {
								type: 'bool',
								optional: true,
								description: "When 'true' and 'items' is a function, the function will be considered like a value.",
							},
						},
						returns: 'array,object',
						description: "Filters array (or object) with the specified keys, and returns a new array (or object) with matching items.",
				}
				//! END_REPLACE()
				, function filterKeys(obj, items, /*optional*/thisObj, /*optional*/invert, /*optional*/includeFunctions) {
					var result;
					if (!types.isNothing(obj)) {
						obj = Object(obj);
						invert = !!invert;
						var keys,
							len,
							i, 
							key,
							val;
						if (!includeFunctions && types.isFunction(items)) {
							if (types.isArrayLike(obj)) {
								result = [];
								len = obj.length;
								for (var key = 0; key < len; key++) {
									if (key in obj) {
										var val = obj[key];
										if (invert === !items.call(thisObj, val, key, obj)) {
											result.push(val);
										};
									};
								};
							} else {
								// "Object.assign" Polyfill from Mozilla Developer Network.
								result = {};
								keys = types.keys(obj);
								len = keys.length;
								for (i = 0; i < len; i++) {
									key = keys[i];
									val = obj[key];
									if (invert === !items.call(thisObj, val, key, obj)) {
										result[key] = val;
									};
								};
							};
						} else {
							if (types.isArrayLike(obj)) {
								result = [];
								len = obj.length;
								for (var key = 0; key < len; key++) {
									if (key in obj) {
										val = obj[key];
										if (invert === (tools.findItem(items, key, undefined, true) === null)) {
											result.push(val);
										};
									};
								};
							} else {
								// "Object.assign" Polyfill from Mozilla Developer Network.
								result = {};
								keys = types.keys(obj);
								len = keys.length;
								for (i = 0; i < len; i++) {
									key = keys[i];
									val = obj[key];
									if (invert === (tools.findItem(items, key, undefined, true) === null)) {
										result[key] = val;
									};
								};
							};
						};
					};
					return result;
				});
			
			tools.every = root.DD_DOC(
				//! REPLACE_BY("null")
				{
						author: "Claude Petit",
						revision: 1,
						params: {
							obj: {
								type: 'arraylike,object,Map,Set',
								optional: false,
								description: "An object to analyze.",
							},
							items: {
								type: 'any,arrayof(any),function',
								optional: false,
								description: 
									"A list of values to filter with, or a filter function. Arguments passed to the function are : \n" +
									"  value (any): The current value\n" +
									"  key (integer,string): The current index or attribute name\n" +
									"  obj (arraylike,object): A reference to the object"
							},
							thisObj: {
								type: 'any',
								optional: true,
								description: "Value of 'this' when calling the function. Default is 'undefined'.",
							},
							invert: {
								type: 'bool',
								optional: true,
								description: "'true' will invert the filter. Default is 'false'.",
							},
							includeFunctions: {
								type: 'bool',
								optional: true,
								description: "When 'true' and 'items' is a function, the function will be considered like a value.",
							},
						},
						returns: 'bool',
						description: "Returns 'true' when every items of an array (or an object) match the filter. Returns 'false' otherwise.",
				}
				//! END_REPLACE()
				, function every(obj, items, /*optional*/thisObj, /*optional*/invert, /*optional*/includeFunctions) {
					if (types.isNothing(obj)) {
						return false;
					};
					obj = Object(obj);
					invert = !!invert;
					if (!includeFunctions && types.isFunction(items)) {
						if (types.isArrayLike(obj)) {
							if (__Natives__.arrayEvery && !invert) {
								// JS 1.6
								return __Natives__.arrayEvery.call(obj, items, thisObj);
							} else {
								obj = Object(obj);
								var len = obj.length;
								for (var key = 0; key < len; key++) {
									if (key in obj) {
										var value = obj[key];
										if (invert === !!items.call(thisObj, value, key, obj)) {
											return false;
										};
									};
								};
							};
						} else if ((obj instanceof types.Set) || (obj instanceof types.Map)) {
							var ar = obj.entries(),
								len = ar.length; // performance
							for (i = 0; i < len; i++) {
								var val = ar[i];
								if (invert === !!items.call(thisObj, val[1], val[0], obj)) {
									return false;
								};
							};
						} else {
							// "Object.assign" Polyfill from Mozilla Developer Network.
							var keys = types.keys(obj),
								len = keys.length, // performance
								i; 
								key; 
							for (i = 0; i < len; i++) {
								key = keys[i];
								if (invert === !!items.call(thisObj, obj[key], key, obj)) {
									return false;
								};
							};
						};
					} else {
						if (types.isArrayLike(obj)) {
							var len = obj.length;
							for (var key = 0; key < len; key++) {
								if (key in obj) {
									var val = obj[key];
									if (invert === (tools.findItem(items, val, undefined, true) !== null)) {
										return false;
									};
								};
							};
						} else if ((obj instanceof types.Set) || (obj instanceof types.Map)) {
							obj = obj.entries();
							var len = obj.length; // performance
							for (i = 0; i < len; i++) {
								var val = obj[i];
								if (invert === (tools.findItem(items, val[1], undefined, true) !== null)) {
									return false;
								};
							};
						} else {
							// "Object.assign" Polyfill from Mozilla Developer Network.
							var keys = types.keys(obj),
								len = keys.length, // performance
								i, 
								key; 
							for (i = 0; i < len; i++) {
								key = keys[i];
								if (invert === (tools.findItem(items, obj[key], undefined, true) !== null)) {
									return false;
								};
							};
						};
					};
					return true;
				});
			
			tools.some = root.DD_DOC(
				//! REPLACE_BY("null")
				{
						author: "Claude Petit",
						revision: 1,
						params: {
							obj: {
								type: 'arraylike,object,Map,Set',
								optional: false,
								description: "An object to analyze.",
							},
							items: {
								type: 'any,arrayof(any),function',
								optional: false,
								description: 
									"A list of values to filter with, or a filter function. Arguments passed to the function are : \n" +
									"  value (any): The current value\n" +
									"  key (integer,string): The current index or attribute name\n" +
									"  obj (arraylike,object): A reference to the object"
							},
							thisObj: {
								type: 'any',
								optional: true,
								description: "Value of 'this' when calling the function. Default is 'undefined'.",
							},
							invert: {
								type: 'bool',
								optional: true,
								description: "'true' will invert the filter. Default is 'false'.",
							},
							includeFunctions: {
								type: 'bool',
								optional: true,
								description: "When 'true' and 'items' is a function, the function will be considered like a value.",
							},
						},
						returns: 'bool',
						description: "Returns 'true' when at least one item of an array (or an object) matches the filter. Returns 'false' otherwise.",
				}
				//! END_REPLACE()
				, function some(obj, items, /*optional*/thisObj, /*optional*/invert, /*optional*/includeFunctions) {
					if (!types.isNothing(obj)) {
						obj = Object(obj);
						invert = !!invert;
						if (!includeFunctions && types.isFunction(items)) {
							if (types.isArrayLike(obj)) {
								if (__Natives__.arraySome && !invert) {
									// JS 1.6
									return __Natives__.arraySome.call(obj, items, thisObj);
								} else {
									obj = Object(obj);
									var len = obj.length;
									for (var key = 0; key < len; key++) {
										if (key in obj) {
											var val = obj[key];
											if (invert === !items.call(thisObj, val, key, obj)) {
												return true;
											};
										};
									};
								};
							} else if ((obj instanceof types.Set) || (obj instanceof types.Map)) {
								var ar = obj.entries(),
									len = ar.length; // performance
								for (i = 0; i < len; i++) {
									var val = ar[i];
									if (invert === !items.call(thisObj, val[1], val[0], obj)) {
										return true;
									};
								};
							} else {
								// "Object.assign" Polyfill from Mozilla Developer Network.
								var keys = types.keys(obj),
									len = keys.length, // performance
									i, 
									key, 
									val;
								for (i = 0; i < len; i++) {
									key = keys[i];
									val = obj[key];
									if (invert === !items.call(thisObj, val, key, obj)) {
										return true;
									};
								};
							};
						} else {
							if (types.isArrayLike(obj)) {
								var len = obj.length;
								for (var key = 0; key < len; key++) {
									if (key in obj) {
										var val = obj[key];
										if (invert === (tools.findItem(items, val, undefined, true) === null)) {
											return true;
										};
									};
								};
							} else if ((obj instanceof types.Set) || (obj instanceof types.Map)) {
								obj = obj.entries();
								var len = obj.length; // performance
								for (i = 0; i < len; i++) {
									var val = obj[i];
									if (invert === (tools.findItem(items, val[1], undefined, true) === null)) {
										return true;
									};
								};
							} else {
								// "Object.assign" Polyfill from Mozilla Developer Network.
								var keys = types.keys(obj),
									len = keys.length, // performance
									i, 
									key, 
									val;
								for (i = 0; i < len; i++) {
									key = keys[i];
									val = obj[key];
									if (invert == (tools.findItem(items, val, undefined, true) === null)) {
										return true;
									};
								};
							};
						};
					};
					return false;
				});
			
			tools.reduce = root.DD_DOC(
				//! REPLACE_BY("null")
				{
						author: "Claude Petit",
						revision: 1,
						params: {
							obj: {
								type: 'arraylike,object,Map,Set',
								optional: false,
								description: "An object to reduce.",
							},
							fn: {
								type: 'function',
								optional: false,
								description: 
									"A function used to reduce. Arguments passed to the function are : \n" +
									"  result (any): The result of the previous call, or the initial value, or the first item\n" +
									"  value (any): The current value\n" +
									"  key (integer,string): The current index or attribute name\n" +
									"  obj (arraylike,object): A reference to the object"
							},
							initialValue: {
								type: 'any',
								optional: true,
								description: "Initial value. Default is the first item of the array (or object).",
							},
						},
						returns: 'any',
						description: "Reduces every items of an array (or object) to a single value.",
				}
				//! END_REPLACE()
				, function reduce(obj, fn, /*optional*/initialValue) {
					root.DD_ASSERT && root.DD_ASSERT(types.isFunction(fn), "Invalid function.");

					if (types.isNothing(obj)) {
						return initialValue;
					} else if (types.isArrayLike(obj) && __Natives__.arrayReduce) {
						// JS 1.8
						if (arguments.length > 2) {
							return __Natives__.arrayReduce.call(obj, fn, initialValue);
						} else {
							return __Natives__.arrayReduce.call(obj, fn);
						};
					} else {
						obj = Object(obj);
						var result,
							hasInitial = false;
						if (arguments.length > 2) {
							result = initialValue;
							hasInitial = true;
						};
						tools.forEach(obj, function(val, key) {
							if (!hasInitial) {
								result = val;
								hasInitial = true;
							};
							result = fn(result, val, key, obj);
						});
						if (!hasInitial) {
							throw new types.TypeError("Reduce of empty object with no initial value.");
						};
						return result;
					};
				});
			
			tools.reduceRight = root.DD_DOC(
				//! REPLACE_BY("null")
				{
						author: "Claude Petit",
						revision: 0,
						params: {
							obj: {
								type: 'arraylike,object',
								optional: false,
								description: "An object to reduce.",
							},
							fn: {
								type: 'function',
								optional: false,
								description: 
									"A function used to reduce. Arguments passed to the function are : \n" +
									"  result (any): The result of the previous call, or the initial value, or the first item\n" +
									"  value (any): The current value\n" +
									"  key (integer,string): The current index or attribute name\n" +
									"  obj (arraylike,object): A reference to the object"
							},
							initialValue: {
								type: 'any',
								optional: true,
								description: "Initial value. Default is the last item of the array (or object).",
							},
						},
						returns: 'any',
						description: "Reduces every items of an array (or object) to a single value, starting from the last item.",
				}
				//! END_REPLACE()
				, function reduceRight(obj, fn, /*optional*/initialValue) {
					root.DD_ASSERT && root.DD_ASSERT(types.isFunction(fn), "Invalid function.");

					if (types.isNothing(obj)) {
						return initialValue;
					} else {
						root.DD_ASSERT && root.DD_ASSERT(types.isArrayLike(obj), "Invalid array.");

						if (__Natives__.arrayReduceRight) {
							// JS 1.8
							if (arguments.length > 2) {
								return __Natives__.arrayReduceRight.call(obj, fn, initialValue);
							} else {
								return __Natives__.arrayReduceRight.call(obj, fn);
							};
						} else {
							obj = Object(obj);
							var value = initialValue,
								hasItem = false,
								key = obj.length - 1;
							for (; key >= 0; key--) {
								if (key in obj) {
									hasItem = true;
									if (arguments.length < 3) {
										value = 0;
									};
									value = fn(value, obj[key], key, obj);
									key--;
									break;
								};
							};
							if (!hasItem && (arguments.length < 3)) {
								throw new types.TypeError("Reduce of empty array with no initial value.");
							};
							for (; key >= 0; key--) {
								if (key in obj) {
									value = fn(value, obj[key], key, obj);
								};
							};
							return value;
						};
					};
				});
			
			tools.unique = root.DD_DOC(
				//! REPLACE_BY("null")
				{
						author: "Claude Petit",
						revision: 0,
						params: {
							comparer: {
								type: 'function',
								optional: true,
								description: 
									"A comparer function. Arguments passed to the function are : \n" +
									"  value1 (any): The value to compare from\n" +
									"  value2 (any): The value to compare to\n" +
									"Must return boolean 'true' or integer '0' when values are equals, integer '1' when 'value1' is greater than 'value2', or integer '-1' when 'value1' is lower than 'value2'.",
							},
							paramarray: {
								type: 'arraylike',
								optional: true,
								description: "Arrays.",
							},
						},
						returns: 'arrayof(any)',
						description: "Compare every items of every arrays, and returns a new array with unique items.",
				}
				//! END_REPLACE()
				, function unique(/*optional*/comparer, /*paramarray*/obj) {
					// NOTE: Use it when each array mainly contains unique values.

					var start = 1;
					if (!types.isFunction(comparer)) {
						comparer = null;
						start = 0;
					};
					
					var result = [];
					
					if (comparer) {
						var len = arguments.length;
						for (var i = start; i < len; i++) {
							obj = arguments[i];
							if (types.isNothing(obj)) {
								continue;
							};
							root.DD_ASSERT && root.DD_ASSERT(types.isArrayLike(obj), "Invalid array.");
							obj = Object(obj);
							var objLen = obj.length;
							for (var key1 = 0; key1 < objLen; key1++) {
								if (key1 in obj) {
									var value1 = obj[key1],
										found = false,
										resultLen = result.length;
									for (var key2 = 0; key2 < resultLen; key2++) {
										var res = comparer(value1, result[key2]);
										if ((res === true) || (res === 0)) {
											found = true;
											break;
										};
									};
									if (!found) {
										result.push(value1);
									};
								};
							};
						};
					} else {
						var len = arguments.length;
						for (var i = start; i < len; i++) {
							obj = arguments[i];
							obj = arguments[i];
							if (types.isNothing(obj)) {
								continue;
							};
							root.DD_ASSERT && root.DD_ASSERT(types.isArrayLike(obj), "Invalid array.");
							obj = Object(obj);
							var objLen = obj.length;
							for (var key1 = 0; key1 < objLen; key1++) {
								if (key1 in obj) {
									var value1 = obj[key1],
										found = false,
										resultLen = result.length;
									for (var key2 = 0; key2 < resultLen; key2++) {
										if (value1 === result[key2]) {
											found = true;
											break;
										};
									};
									if (!found) {
										result.push(value1);
									};
								};
							};
						};
					};
					
					return result;
				});
		

			//===================================
			// Math functions
			//===================================

			tools.sign = root.DD_DOC(
				//! REPLACE_BY("null")
				{
						author: "Claude Petit",
						revision: 0,
						params: {
							obj: {
								type: 'any',
								optional: false,
								description: "A value",
							},
						},
						returns: 'integer',
						description: "Returns '-1' for negative values. Returns '1' for positive values. Returns '0' for neutral values. Otherwise, returns 'NaN'.",
				}
				//! END_REPLACE()
				, (__Natives__.mathSign || (function sign(obj) {
					obj = +obj;
					return (obj < 0 ? -1 : (obj > 0 ? 1 : obj)); 
				})));
			
			
			//===================================
			// Abort functions
			//===================================
			
			types.ScriptAbortedError = root.DD_DOC(
				//! REPLACE_BY("null")
				{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'error',
						description: "Signals that script has been aborted. Every \"try...catch\" statements must unconditionally re-throw this error.",
				}
				//! END_REPLACE()
				, types.createErrorType("ScriptAbortedError", global.Error, function _new() {
					return global.Error.call(this, "Script aborted.");
				}));
			
			tools.abortScript = root.DD_DOC(
				//! REPLACE_BY("null")
				{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'error',
						description: "Emits \"script aborted\" signal.",
				}
				//! END_REPLACE()
				, function abortScript() {
					throw new types.ScriptAbortedError();
				});
			
			//===================================
			// Version functions
			//===================================

			tools.Version = root.DD_DOC(
				//! REPLACE_BY("null")
				{
						author: "Claude Petit",
						revision: 0,
						params: {
							data: {
								type: 'array',
								optional: false,
								description: "Version data",
							},
							options: {
								type: 'object',
								optional: true,
								description: "Options",
							},
						},
						returns: 'error',
						description: "Represents a software version.",
				}
				//! END_REPLACE()
				, types.INIT(types.Type.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'Version',
						
						__parse: function __parse(val, identifiers, trimSpaces) {
							var ar = [];
							var valLen = val.length;
							var regexps = [/([^0-9]|[ ])/g, /([0-9]|[ ])/g],
								alt = false;
							var result = [];
							var start = 0,
								end;
							do {
								end = tools.search(val, regexps[alt + 0], start);
								if ((end === start) && (val[end] !== ' ')) {
									alt = !alt;
									end = tools.search(val, regexps[alt + 0], start);
								};
								if (end >= 0) {
									while (val[end] === ' ') {
										end++;
										if (end >= valLen) {
											end = -1;
											break;
										};
									};
								};
								var subval = val.slice(start, (end >= 0 ? end: undefined));
								var subvalTrim = subval.trim();
								var subvalNumber;
								if (identifiers && types.hasKey(identifiers, subvalTrim)) {
									subvalNumber = parseInt(identifiers[subvalTrim]);
								} else {
									subvalNumber = parseInt(subvalTrim);
								};
								ar.push(subvalNumber, (trimSpaces ? subvalTrim : subval));
								start = end;
								alt = !alt;
							} while (end >= 0);
							return ar;
						},
						
						parse: root.DD_DOC(
							//! REPLACE_BY("null")
							{
									author: "Claude Petit",
									revision: 0,
									params: {
										str: {
											type: 'string',
											optional: false,
											description: "A string",
										},
										options: {
											type: 'object',
											optional: true,
											description: "Options",
										},
									},
									returns: 'Version',
									description: "Parses a string to a 'Version' object with the specified options.",
							}
							//! END_REPLACE()
							, function parse(str, /*optional*/options) {
								if (str instanceof tools.Version) {
									return str;
								};
								
								root.DD_ASSERT && root.DD_ASSERT(types.isNothing(options) || types.isObject(options), "Invalid options.");
								
								if (!options) {
									options = {};
								};
								
								//var dontThrow = types.getDefault(options, 'dontThrow', false);

								// Force to string
								str += '';
								
								var identifiers = types.getDefault(options, 'identifiers', {});
								var trimSpaces = types.getDefault(options, 'trimSpaces', false);

								// Doodad.Tools.Version.parse('1.1.23 beta', {identifiers: {alpha: 0, beta: 1, release: 2}}) --> [1, 1, 23, 1]
								// Doodad.Tools.Version.parse('1.1.23 build 1324') --> [1, 1, 23, 1324]
								// Doodad.Tools.Version.parse('major: 1, minor: 1, revision: 23 beta', {identifiers: {beta: 1}}) --> [1, 1, 23, 1]
									
								var ar = this.__parse(str, identifiers, trimSpaces);
								
								return new this(ar, options);
							}),
						
						compare: root.DD_DOC(
							//! REPLACE_BY("null")
							{
									author: "Claude Petit",
									revision: 0,
									params: {
										version1: {
											type: 'string,Version',
											optional: false,
											description: "A version to compare from",
										},
										version2: {
											type: 'string,Version',
											optional: false,
											description: "A version to compare to",
										},
										options: {
											type: 'object',
											optional: true,
											description: "Options",
										},
									},
									returns: 'integer',
									description: "Compares two software versions together. Returns '1' if 'version1' is greater than 'version2'. Returns '-1' if 'version1' is lower than 'version2'. Returns '0' if versions are equal.",
							}
							//! END_REPLACE()
							, function compare(version1, version2, /*optional*/options) {
								if (!(version1 instanceof tools.Version)) {
									version1 = this.parse(version1, options);
								};
								return version1.compare(version2, options);
							}),
					},
					/*instanceProto*/
					{
						data: null,
						options: null,
						
						_new: types.SUPER(function _new(data, /*optional*/options) {
							if (this instanceof tools.Version) {
								this._super();
								this.data = data;
								this.options = (options || {});
							};
						}),
						
						compare: root.DD_DOC(
							//! REPLACE_BY("null")
							{
									author: "Claude Petit",
									revision: 0,
									params: {
										version: {
											type: 'string,Version',
											optional: false,
											description: "A version to compare to",
										},
										options: {
											type: 'object',
											optional: true,
											description: "Options",
										},
									},
									returns: 'integer',
									description: "Compares software version with another software version. Returns '1' if 'version1' is greater than 'version2'. Returns '-1' if 'version1' is lower than 'version2'. Returns '0' if versions are equal.",
							}
							//! END_REPLACE()
							, function compare(version, /*optional*/options) {
								options = types.extend({}, this.options, options);
								if (!(version instanceof tools.Version)) {
									version = types.getType(this).parse(version, options);
								};
								var data1 = this.data,
									data1Len = data1.length,
									data2 = version.data,
									data2Len = data2.length,
									count = types.get(options, 'count', (Math.max(data1Len, data2Len) / 2)),
									j = 0,
									k = 0;
								for (var i = 0; i < count; i++) {
									var number1 = NaN;
									while (isNaN(number1) && (j < data1Len)) {
										if ((j in data1) && ((j + 1) in data1)) {
											number1 = data1[j];
										};
										j += 2;
									};
									var number2 = NaN;
									while (isNaN(number2) && (k < data2Len)) {
										if ((k in data2) && ((k + 1) in data2)) {
											number2 = data2[k];
										};
										k += 2;
									};
									number1 = (+number1 || 0);
									number2 = (+number2 || 0);
									if (number2 > number1) {
										return 1;
									} else if (number2 < number1) {
										return -1;
									};
								};
								return 0;
							}),
						
						toString: root.DD_DOC(
							//! REPLACE_BY("null")
							{
									author: "Claude Petit",
									revision: 0,
									params: null,
									returns: 'string',
									description: "Converts to string.",
							}
							//! END_REPLACE()
							, function toString(/*optional*/options) {
								if (!options) {
									options = {};
								};
								var identifiers = types.get(options, 'identifiers', this.options.identifiers);
								var result = '';
								var data = this.data,
									dataLen = data.length;
								for (var i = 1; i < dataLen; i += 2) {
									if (((i - 1) in data) && (i in data)) {
										result += data[i];
									};
								};
								return result;
							}),
					}
				)));
			
			//===================================
			// Evaluation functions
			//===================================
			
			var __hasWindow__ = (global.window === global),
				__hasGlobal__ = (global.global === global);
			
			__Internal__.validateExpression = function(expression, locals, globals, /*optional*/preventAssignment) {
				var prevChr = '',
					isString = false,
					isEscape = false,
					stringChar = null,
					isAssignment = false,
					isComment = false,
					isCommentBlock = false,
					escapeSeq = '',
					tokenName = '',
					isGlobal = true,
					isDot = false;
					
				function validateToken() {
					if (tokenName) {
						if (isGlobal) {
							if (tools.safeEval.allDigitsRegEx.test(tokenName)) {
								// Valid
							} else if (tools.indexOf(tools.safeEval.constants, tokenName) >= 0) {
								// Valid
							} else if (types.hasKey(locals, tokenName)) {
								// Valid
							} else if (tools.indexOf(globals, tokenName) >= 0) {
								// Valid
							} else {
								throw new types.AccessDenied("Access to '~0~' is denied.", [tokenName]);
							};
						};
						tokenName = '';
					};
				};
					
				for (var i = 0; i < expression.length; i++) {
					var chr = expression[i],
						ascii = chr.charCodeAt(0);
					
					if (isString) {
						if (isEscape) {
							// Escaped char
							isEscape = false;
						} else if (chr === '\\') {
							// String escape
							isEscape = true;
						} else if (chr === stringChar) {
							// String closure
							isString = false;
						};
					} else if (isCommentBlock) {
						// Comment block
						if ((prevChr === '*') && (chr === '/')) {
							// End comment block
							isCommentBlock = false;
						};
					} else if (isAssignment && (chr !== '=')) {
						// Assignment
						if (preventAssignment) {
							throw new types.AccessDenied("Assignment is not allowed.");
						};
					} else if ((chr === ';') || (chr === '\n') || (chr === '\r')) {
						if (isComment && (chr === ';')) {
						} else {
							isComment = false;
							validateToken();
							if (!isDot || (chr === ';')) {
								isGlobal = true;
							};
						};
					} else if (isComment) {
						// Statement comment
					} else if (chr === '\\') {
						// For simplicity
						throw new types.AccessDenied("Escape sequences not allowed.");
					} else if (tools.safeEval.alphaRegEx.test(chr) || (!tokenName && (chr === '.')) || ((tokenName.charCodeAt(0) >= 48) && (tokenName.charCodeAt(0) <= 57))) {
						// Token
						tokenName += chr;
					} else if (ascii > 0x7F) {
						// For simplicity
						throw new types.AccessDenied("Non-ascii characters are not allowed.");
					} else if (chr === ':') {
						tokenName = '';
					} else {
						validateToken();
						isDot = false;
						if (tools.safeEval.spaceRegEx.test(chr)) {
							// Space
						} else if ((prevChr === '/') && (chr === '/')) {
							// Begin statement comment
							isComment = true;
						} else if ((prevChr === '/') && (chr === '*')) {
							// Begin comment block
							isCommentBlock = true;
						} else {
							// Operational chars
							isAssignment = false;
							
							if ((chr === '"') || (chr === "'")) {
								// Begin String
								isString = true;
								stringChar = chr;
							} else if (chr === '`') {
								// For simplicity.
								throw new types.AccessDenied("Template strings are denied.");
							} else if ((chr === '+') || (chr === '-')) {
								if (prevChr === chr) {
									// Increment
									if (preventAssignment) {
										throw new types.AccessDenied("Increment operators are not allowed.");
									};
								};
							} else if ((chr === '=') && ((prevChr !== '=') && (prevChr !== '!'))) {
								// Potential assignment
								isAssignment = true
							} else if (chr === '.') {
								isDot = true;
								isGlobal = false;
							};
						};
					};
					prevChr = chr;
				};
				
				validateToken();
			};
			
			__Internal__.createEvalFn = function createEvalFn(locals, globals) {
					root.DD_ASSERT && root.DD_ASSERT(types.isNothing(locals) || types.isObject(locals), "Invalid locals object.");

					if (types.isNothing(globals)) {
						globals = [];
					} else {
						root.DD_ASSERT && root.DD_ASSERT(types.isArray(globals), "Invalid global names array.");
					};
					
					globals = tools.reduce(globals, function(locals, value, name) {
						locals[name] = ((name in global) ? global[name] : tools.safeEval.evalNoLocals(name));
						return locals;
					}, {});
					
					locals = types.extend({}, globals, locals);
					
					if (types.isEmpty(locals)) {
						return tools.safeEval.evalNoLocalsStrict;
					} else {
						return tools.safeEval.createStrictEval(types.keys(locals)).apply(null, types.values(locals));
					};
			};
			
			tools.safeEval = root.DD_DOC(
				//! REPLACE_BY("null")
				{
						author: "Claude Petit",
						revision: 2,
						params: {
							expression: {
								type: 'string',
								optional: false,
								description: "An expression",
							},
							locals: {
								type: 'object',
								optional: true,
								description: "Local variables.",
							},
							globals: {
								type: 'arrayof(string)',
								optional: true,
								description: "List of allowed global variables.",
							},
						},
						returns: 'any',
						description: "Evaluates a Javascript expression with some restrictions.",
				}
				//! END_REPLACE()
				, function safeEval(expression, /*optional*/locals, /*optional*/globals, /*optional*/preventAssignment) {
					// NOTE: Caller functions should use "safeEvalCached" for performance issues (only when expressions are controlled and limited)
					
					// Restrict access to locals (locals={...}) and globals (globals=[...]).
					// Prevents access to my local variables and arguments.
					// Optionally prevents assignments and increments
					
					if (types.isNothing(preventAssignment)) {
						preventAssignment = true;
					};
					
					if (preventAssignment) {
						__Internal__.validateExpression(expression, locals, globals, preventAssignment);
					};
					
					if (root.DD_ASSERT) {
						root.DD_ASSERT(types.isString(expression), "Invalid expression.");
					};
					
					var evalFn = __Internal__.createEvalFn(locals, globals);
					
					return evalFn(expression);
				});
			
			tools.safeEvalCached = root.DD_DOC(
				//! REPLACE_BY("null")
				{
						author: "Claude Petit",
						revision: 2,
						params: {
							evalCacheObject: {
								type: 'object',
								optional: false,
								description: "An object to use as cache",
							},
							expression: {
								type: 'string',
								optional: false,
								description: "An expression",
							},
							locals: {
								type: 'object',
								optional: true,
								description: "Local variables.",
							},
							globals: {
								type: 'arrayof(string)',
								optional: true,
								description: "List of allowed global variables.",
							},
						},
						returns: 'any',
						description: "Evaluates a Javascript expression with some restrictions, with cache.",
				}
				//! END_REPLACE()
				, function safeEvalCached(evalCacheObject, expression, /*optional*/locals, /*optional*/globals, /*optional*/preventAssignment) {
					// CAUTION: Since revision 1, assignments and increments to object fields are no longer prevented.
					// TODO: Find a better way to block assignments and increments.
					// WARNING: If expressions are not controlled and limited, don't use this function because of memory overhead
					// WARNING: Always use same options for the same cache object
					
					root.DD_ASSERT && root.DD_ASSERT(types.isObject(evalCacheObject), "Invalid cache object.");
					root.DD_ASSERT && root.DD_ASSERT(types.isString(expression), "Invalid expression.");
					
					expression = expression.trim();

					if (types.isNothing(preventAssignment)) {
						preventAssignment = true;
					};
					
					if (preventAssignment) {
						__Internal__.validateExpression(expression, locals, globals, preventAssignment);
					};
					
					var evalFn = evalCacheObject.__SAFE_EVAL__;
					if (!evalFn) {
						evalCacheObject.__SAFE_EVAL__ = evalFn = __Internal__.createEvalFn(locals, globals);
					};
					
					if (expression === '__SAFE_EVAL__') {
						return evalFn(expression);
					} else if (types.hasKey(evalCacheObject, expression)) {
						return evalCacheObject[expression];
					} else {
						return evalCacheObject[expression] = evalFn(expression);
					};
				});
				
			exports.initSafeEval.call(tools.safeEval);

			//===================================
			// Misc functions
			//===================================
			
			tools.generateUUID = root.DD_DOC(
				//! REPLACE_BY("null")
				{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'string',
						description: "Generates and returns a UUID.",
				}
				//! END_REPLACE()
				, function generateUUID() {
					// Source: https://gist.github.com/LeverOne
					var a, b;
					for (b = a = ''; a++ < 36; b += a * 51 & 52 ? (a^15 ? 8^Math.random() * (a^20 ? 16 : 4) : 4).toString(16) : '-');
					return b
				});

			//===================================
			// ES6 Promise
			//===================================

			__Internal__.Promise = null;
			
			tools.getPromise = root.DD_DOC(
				//! REPLACE_BY("null")
				{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'Promise',
						description: "Returns the ES6 Promise class or a polyfill.",
				}
				//! END_REPLACE()
				, function getPromise() {
					var Promise = __Internal__.Promise;
					if (!Promise) {
						throw new types.NotSupported("ES6 Promises are not supported. You must include the polyfill 'es6-promise' or 'rsvp' in your project. You can also use another polyfill (see 'Tools.setPromise').");
					};
					return Promise;
				});
				
			tools.setPromise = root.DD_DOC(
				//! REPLACE_BY("null")
				{
						author: "Claude Petit",
						revision: 0,
						params: {
							Promise: {
								type: 'Promise',
								optional: false,
								description: "A Promise polyfill.",
							},
						},
						returns: 'Promise',
						description: "Sets a custom polyfill for ES6 Promises.",
				}
				//! END_REPLACE()
				, function setPromise(Promise) {
					// Make some tests...
					if (
							!types.isFunction(Promise) || 
							!types.isFunction(Promise.resolve) || 
							!types.isFunction(Promise.reject) || 
							!types.isFunction(Promise.all) ||
							!types.isFunction(Promise.prototype.then) ||
							!types.isFunction(Promise.prototype['catch'])
					) {
						throw new types.TypeError("Invalid Promise polyfill.");
					};

					// <PRB> Doing ".then(fn).catch(fn)" or ".then(fn, fn)" is very annoying.
					if (!types.isFunction(Promise.prototype['finally'])) {
						Promise.prototype['finally'] = function _finally(callback) {
							return this.then(callback, callback);
						};
					};
					
					// V8 Easy debugging
					if (types.isFunction(Promise.SetPromiseRejectCallback)) {
						Promise.SetPromiseRejectCallback(function(ex) {
							console.error(ex);
						});
					};
					
					__Internal__.Promise = Promise;
				});
				
				
			tools.PromiseCallback = root.DD_DOC(
				//! REPLACE_BY("null")
				{
						author: "Claude Petit",
						revision: 0,
						params: {
							obj: {
								type: 'object,Object',
								optional: true,
								description: "Object to bind with the callback function.",
							},
							fn: {
								type: 'function',
								optional: false,
								description: "Callback function.",
							},
						},
						returns: 'function',
						description: "Creates a callback handler specially for a Promise.",
				}
				//! END_REPLACE()
				, types.setPrototypeOf(function(/*optional*/obj, fn) {
					var newFn = types.makeInside(obj, fn);
					var callback = function callbackHandler(result) {
						try {
							return newFn(result);
						} catch(ex) {
							try {
								if (!(ex instanceof types.ScriptAbortedError)) {
									tools.log(tools.LogLevels.Debug, "A Promise has been rejected due to an unhandled error :");
									tools.log(tools.LogLevels.Debug, ex);
									tools.log(tools.LogLevels.Debug, fn.toString().slice(0, 500));
								};
							} catch(o) {
							};
							throw ex;
						};
					};
					callback = types.setPrototypeOf(callback, tools.PromiseCallback);
					return callback;
				}, types.Callback));
			
				
			//===================================
			// Config
			//===================================
			
			config.loadFile = root.DD_DOC(
				//! REPLACE_BY("null")
				{
						author: "Claude Petit",
						revision: 2,
						params: {
							url: {
								type: 'string,Url',
								optional: false,
								description: "File URL.",
							},
							options: {
								type: 'object',
								optional: true,
								description: "Options.",
							},
							callbacks: {
								type: 'arrayof(function),function',
								optional: false,
								description: 
									"Callback functions. Arguments are :\n" +
									"  ex (error): Exception object, when an error has occurred\n" +
									"  data (any): Parsed file content, when successful\n",
							},
						},
						returns: 'Promise',
						description: "Loads a configuration file written with JSON and pass its content to the callback functions, then resolve a Promise with the final value.\n" +
									"When the option 'watch' is set to 'true', the file is read again and callbacks called again when the file is modified.\n" +
									"If 'loadFile' is called more than once with the same file, callbacks are chained and nothing else happen.\n" +
									"You can set the option 'force' to force the file to be read again.",
				}
				//! END_REPLACE()
				, function loadFile(url, /*optional*/options, /*optional*/callbacks) {
					var Promise = tools.getPromise(),
						promise = Promise.resolve();
						
					if (callbacks) {
						if (types.isArray(callbacks)) {
							// Remove empty slots.
							callbacks = tools.filter(callbacks, function(callback) {
								return !!callback;
							});
						} else {
							callbacks = [callbacks];
						};
					} else {
						callbacks = [];
					};
					
					if (options) {
						options = types.clone(options);
					} else {
						options = {};
					};
					
					url = tools.options.hooks.urlParser(url, types.get(options, 'parseOptions'));
					
					var configPath = types.get(options, 'configPath', tools.options.settings.configPath);
					if (configPath) {
						configPath = tools.options.hooks.urlParser(configPath, options.parseOptions);
						url = configPath.combine(url);
					};
					
					var key = url.toString();
					
					if (__Internal__.loadedConfigFiles.has(key)) {
						var def = __Internal__.loadedConfigFiles.get(key);
						def.callbacks = tools.unique(def.callbacks, callbacks);
						if (types.get(options, 'force')) {
							var read = def.read;
							promise = promise.then(new tools.PromiseCallback(this, read));
						};
					} else {
						var read = function read() {
							return files.readFile(url, options)
								['finally'](function proceed(data) {
									var promise;
									if (types.isError(data)) {
										promise = Promise.reject(data);
									} else {
										try {
											var encoding = types.get(options, 'encoding', null);
											if (encoding) {
												// <PRB> NodeJS doesn't like the BOM
												if (encoding.slice(0, 3).toLowerCase() === 'utf') {
													// Remove the BOM
													data = tools.trim(data, '\uFEFF', 1);
													data = tools.trim(data, '\uFFFE', 1);
													//data = tools.trim(data, '\xEF', 1);
													//data = tools.trim(data, '\xBB', 1);
													//data = tools.trim(data, '\xBF', 1);
													//data = tools.trim(data, '\xBB', 1);
													//data = tools.trim(data, '\xEF', 1);
												};
											};
											data = __Natives__.windowJSON.parse(data);
											var callbacks = __Internal__.loadedConfigFiles.get(key).callbacks,
												promise = Promise.resolve(data);
											tools.forEach(callbacks, function(callback) {
												promise = promise['finally'](callback);
											});
										} catch(ex) {
											promise = Promise.reject(ex);
										};
									};
									return promise;
								});
						};

						__Internal__.loadedConfigFiles.set(key, {
							read: read,
							callbacks: callbacks,
						});
						
						promise = promise.then(new tools.PromiseCallback(this, read));
						
						if (types.get(options, 'watch', false)) {
							files.watch(url, function(eventName, fileName) {
								if (eventName === 'change') {
									options.async = true;
									var read = __Internal__.loadedConfigFiles.get(key).read;
									read();
								};
							});
						};
					};
					
					return promise;
				});


			//===================================
			// Init
			//===================================
			return function init(/*optional*/options) {
				__Natives__.windowPromise && tools.setPromise(__Natives__.windowPromise);

				// For production
				tools.options.settings.logLevel = tools.LogLevels.Error;
			};
		},
	};
	
	return exports;
})());