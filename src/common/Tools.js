//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2017 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Tools.js - Useful tools
// Project home: https://github.com/doodadjs/
// Author: Claude Petit, Quebec city
// Contact: doodadjs [at] gmail.com
// Note: I'm still in alpha-beta stage, so expect to find some bugs or incomplete parts !
// License: Apache V2
//
//	Copyright 2015-2017 Claude Petit
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

module.exports = {
	add: function add(DD_MODULES) {
		DD_MODULES = (DD_MODULES || {});
		DD_MODULES['Doodad.Tools'] = {
			version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
			dependencies: [
				'Doodad.Types',
			],
			bootstrap: true,
			
			create: function create(root, /*optional*/_options, _shared) {
				"use strict";

				//===================================
				// Get namespaces
				//===================================
					
				var doodad = root.Doodad,
					types = doodad.Types,
					tools = doodad.Tools,
					config = tools.Config;
					
				//===================================
				// Internal
				//===================================
					
				// <FUTURE> Thread context
				var __Internal__ = {
				};
				

				tools.ADD('LogLevels', types.freezeObject(types.nullObject({
					Debug: 0,
					Info: 1,
					Warning: 2,
					Error: 3,
				})));
				
				
				//===================================
				// Options
				//===================================
					
				var __options__ = types.nullObject({
					logLevel: tools.LogLevels.Error,
					unhandledRejectionsTimeout: 5000,
					unhandledRejectionsMaxSize: 20,
					caseSensitive: null, // null = auto-detect (not 100 % viable)
				}, _options);

				__options__.logLevel = types.toInteger(__options__.logLevel);
				__options__.unhandledRejectionsTimeout = types.toInteger(__options__.unhandledRejectionsTimeout);
				__options__.unhandledRejectionsMaxSize = types.toInteger(__options__.unhandledRejectionsMaxSize);
				if (!types.isNothing(__options__.caseSensitive)) {
					__options__.caseSensitive = types.toBoolean(__options__.caseSensitive);
				};

				types.freezeObject(__options__);

				tools.ADD('getOptions', function() {
					return __options__;
				});

				//===================================
				// Hooks
				//===================================
				
				_shared.consoleHook = function consoleHook(level, message) {
					if (global.console) {
						var fn;
						if ((level === tools.LogLevels.Info) && global.console.info) {
							//! BEGIN_REMOVE()
								if ((typeof process === 'object') && (typeof module === 'object')) {
									fn = 'warn'; // force stderr
								} else {
									fn = 'info';
								};
							//! END_REMOVE()
							
							//! IF_SET("serverSide")
								//! INJECT("fn = 'warn'") // force stderr
							//! ELSE()
								//! INJECT("fn = 'info'")
							//! END_IF()
						} else if ((level === tools.LogLevels.Warning) && global.console.warn) {
							fn = 'warn';
						} else if ((level === tools.LogLevels.Error) && (global.console.error || global.console.exception)) {
							fn = 'error';
						} else {
							//! BEGIN_REMOVE()
								if ((typeof process === 'object') && (typeof module === 'object')) {
									fn = 'warn'; // force stderr
								} else {
									fn = 'log';
								};
							//! END_REMOVE()
							
							//! IF_SET("serverSide")
								//! INJECT("fn = 'warn'") // force stderr
							//! ELSE()
								//! INJECT("fn = 'log'")
							//! END_IF()
						};
						global.console[fn](message);
					};
				};

				//===================================
				// Native functions
				//===================================
					
				// NOTE: Makes use of "isNativeFunction" to get rid of third-parties injections as possible.

				types.complete(_shared.Natives, {
					// Prototype functions
					stringIndexOfCall: global.String.prototype.indexOf.call.bind(global.String.prototype.indexOf),
					stringLastIndexOfCall: global.String.prototype.lastIndexOf.call.bind(global.String.prototype.lastIndexOf),
					stringReplaceCall: global.String.prototype.replace.call.bind(global.String.prototype.replace),
					//stringSearchCall: global.String.prototype.search.call.bind(global.String.prototype.search),
				
					windowRegExp: global.RegExp,
					windowObject: global.Object,

					// Polyfills

					// "map"
					windowArray: global.Array,

					// "sign"
					mathSign: (types.isNativeFunction(global.Math.sign) ? global.Math.sign : undefined),

					//windowComponents: (types.isNativeFunction(global.Components) ? global.Components : undefined),
					
					// ES5
					stringRepeatCall: (types.isNativeFunction(global.String.prototype.repeat) ? global.String.prototype.repeat.call.bind(global.String.prototype.repeat) : undefined),
					arrayIndexOfCall: (types.isNativeFunction(global.Array.prototype.indexOf) ? global.Array.prototype.indexOf.call.bind(global.Array.prototype.indexOf) : undefined),
					arrayLastIndexOfCall: (types.isNativeFunction(global.Array.prototype.lastIndexOf) ? global.Array.prototype.lastIndexOf.call.bind(global.Array.prototype.lastIndexOf) : undefined),
					arrayForEachCall: (types.isNativeFunction(global.Array.prototype.forEach) ? global.Array.prototype.forEach.call.bind(global.Array.prototype.forEach) : undefined),
					arrayMapCall: (types.isNativeFunction(global.Array.prototype.map) ? global.Array.prototype.map.call.bind(global.Array.prototype.map) : undefined),
					arrayFilterCall: (types.isNativeFunction(global.Array.prototype.filter) ? global.Array.prototype.filter.call.bind(global.Array.prototype.filter) : undefined),
					arrayEveryCall: (types.isNativeFunction(global.Array.prototype.every) ? global.Array.prototype.every.call.bind(global.Array.prototype.every) : undefined),
					arraySomeCall: (types.isNativeFunction(global.Array.prototype.some) ? global.Array.prototype.some.call.bind(global.Array.prototype.some) : undefined),
					arrayReduceCall: (types.isNativeFunction(global.Array.prototype.reduce) ? global.Array.prototype.reduce.call.bind(global.Array.prototype.reduce) : undefined),
					arrayReduceRightCall: (types.isNativeFunction(global.Array.prototype.reduceRight) ? global.Array.prototype.reduceRight.call.bind(global.Array.prototype.reduceRight) : undefined),
					
					// ES7
					regExpEscape: (types.isNativeFunction(global.RegExp.escape) ? global.RegExp.escape : undefined),
				});
				
				//===================================
				// String Tools
				//===================================
		
				tools.ADD('split', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 2,
								params: {
									str: {
										type: 'string',
										optional: false,
										description: "String to split",
									},
									separator: {
										type: 'string,RegExp',
										optional: true,
										description: "Separator",
									},
									limit: {
										type: 'integer',
										optional: true,
										description: "Number of items.",
									},
								},
								returns: 'arrayof(string)',
								description: "Proper 'limit' argument for the 'String.prototype.split' function.",
					}
					//! END_REPLACE()
					, function split(str, /*optional*/separator, /*optional*/limit) {
						// TODO: Unit tests
						if (types.isNothing(str) || (limit === 0)) {
							return [];
						};
						if (types.isNothing(separator) || (limit === 1)) {
							return [str];
						};
						if (types.isNothing(limit)) {
							return str.split(separator);
						};
						var result;
						if (separator === '') {
							// Char array
							limit--;
							result = str.slice(0, limit).split('');
							if (result.length < str.length) {
								// Remaining
								result[result.length] = str.slice(limit);
							};
						} else if (types.isString(separator)) {
							var last = 0,
								sepLen = separator.length,
								index;
							result = [];
							while ((limit > 1) && ((index = str.indexOf(separator, last)) >= 0)) {
								result[result.length] = str.slice(last, index);
								last = index + sepLen;
								limit--;
							};
							if ((limit > 0) && (last <= str.length)) {
								// Remaining
								result[result.length] = str.slice(last);
							};
						} else { // RegExp
							var matches,
								strLen = str.length;
							result = [];
							separator.lastIndex = 0;
							while ((limit > 1) && (matches = separator.exec(str))) {
								var index = matches.index;
								result[result.length] = str.slice(0, index);
								str = str.slice(index + matches[0].length);
								limit--;
								separator.lastIndex = 0;
							};
							if ((limit > 0) && (str.length <= strLen)) {
								// Remaining
								result[result.length] = str;
							};
						};
						return result;
					}));

				//===================================
				// Array Tools
				//===================================
	
				tools.ADD('map', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 3,
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
										"  obj (arraylike,object,Map,Set): A reference to the object"
								},
								thisObj: {
									type: 'any',
									optional: true,
									description: "Value of 'this' when calling the function. Default is 'undefined'.",
								},
								start: {
									type: 'integer',
									optional: true,
									description: "For array-like 'obj' only... Start position (inclusive). Default is '0'.",
								},
								end: {
									type: 'integer',
									optional: true,
									description: "For array-like 'obj' only... End position (exclusive). Default is 'obj.length'.",
								},
							},
							returns: 'array,object',
							description: "For each item of the array (or the object), maps the value to another value than returns a new array (or a new object instance).",
					}
					//! END_REPLACE()
					, function map(obj, fn, /*optional*/thisObj, /*optional*/start, /*optional*/end) {
						if (!types.isNothing(obj)) {
							obj = _shared.Natives.windowObject(obj);
							if (types._instanceof(obj, types.Set)) {
								var result = new types.Set();
								obj.forEach(function(value, key, obj) {
									result.add(fn.call(thisObj, value, key, obj));
								});
								return result;
							} else if (types._instanceof(obj, types.Map)) {
								var result = new types.Map();
								obj.forEach(function(value, key, obj) {
									result.set(key, fn.call(thisObj, value, key, obj));
								});
								return result;
							} else if (types.isArrayLike(obj)) {
								if (types.isNothing(start) || (start < 0)) {
									start = 0;
								};
								var len = obj.length;
								if (types.isNothing(end) || (end > len)) {
									end = len;
								};
								if (_shared.Natives.arrayMapCall && (start === 0) && (end >= len)) {
									return _shared.Natives.arrayMapCall(obj, fn, thisObj);
								} else {
									var result = _shared.Natives.windowArray(end - start);
									for (var key = start, pos = 0; key < end; key++, pos++) {
										if (key in obj) {
											result[pos] = fn.call(thisObj, obj[key], key, obj);
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
					}));

				//===================================
				// Search functions
				//===================================
					
				tools.ADD('findItem', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 1,
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
							obj = _shared.Natives.windowObject(obj);
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
								} else if (types.isIterable(obj)) {
									var iter = obj[_shared.Natives.symbolIterator](),
										key = 0,
										result;
									while ((result = iter.next()) && !result.done) {
										if (item.call(thisObj, result.value, key++, obj)) {
											return key;
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
								} else if (types.isIterable(obj)) {
									var iter = obj[_shared.Natives.symbolIterator](),
										key = 0,
										result;
									while ((result = iter.next()) && !result.done) {
										if (result.value === item) {
											return key;
										};
										key++;
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
					}));
				
				tools.ADD('findLastItem', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
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
					}));
				
				tools.ADD('findItems', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
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
					}));
				
				tools.ADD('getItem', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
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
								returns: 'any',
								description: "Returns the found item. Returns 'null' when item is not found.",
					}
					//! END_REPLACE()
					, function getItem(obj, item, /*optional*/thisObj, /*optional*/includeFunctions) {
						if (!types.isNothing(obj)) {
							obj = _shared.Natives.windowObject(obj);
							if (!includeFunctions && types.isFunction(item)) {
								if (types.isArrayLike(obj)) {
									var len = obj.length;
									for (var key = 0; key < len; key++) {
										if (key in obj) {
											var val = obj[key];
											if (item.call(thisObj, val, key, obj)) {
												return val;
											};
										};
									};
								} else {
									var keys = types.keys(obj),
										len = keys.length; // performance
									for (var i = 0; i < len; i++) {
										var key = keys[i],
											val = obj[key];
										if (item.call(thisObj, val, key, obj)) {
											return val;
										};
									};
								};
							} else {
								if (types.isArrayLike(obj)) {
									var len = obj.length;
									for (var key = 0; key < len; key++) {
										if (key in obj) {
											if (obj[key] === item) {
												return item;
											};
										};
									};
								} else {
									var keys = types.keys(obj),
										len = keys.length; // performance
									for (var i = 0; i < len; i++) {
										key = keys[i];
										if (obj[key] === item) {
											return item;
										};
									};
								};
							};
						};
						return null;
					}));
				
				
				//===================================
				// String functions
				//===================================

				tools.ADD('repeat', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
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
						if (_shared.Natives.stringRepeatCall) {
							return _shared.Natives.stringRepeatCall(str, n);
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
					}));

				tools.ADD('replace', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
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
							root.DD_ASSERT(types.isString(from) || types._instanceof(from, _shared.Natives.windowRegExp), "Invalid 'from'.");
							root.DD_ASSERT(types.isString(to) || types.isFunction(to), "Invalid 'to'.");
							root.DD_ASSERT(types.isNothing(options) || types.isString(options), "Invalid options.");
						};
						if (options) {
							var regexp = tools.escapeRegExp(from);
							from = new _shared.Natives.windowRegExp(regexp, options);
						};
						if (types.isString(text)) {
							return _shared.Natives.stringReplaceCall(text, from, to);
						} else {
							for (var i = 0; i < text.length; i++) {
								text[i] = _shared.Natives.stringReplaceCall(text[i], from, to);
							};
							return text;
						};
					}));
				
				tools.ADD('search', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
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
							root.DD_ASSERT(types.isString(text) || types._instanceof(text, _shared.Natives.windowRegExp), "Invalid text.");
							root.DD_ASSERT(types.isNothing(start) || types.isInteger(start), "Invalid 'start'.");
							root.DD_ASSERT(types.isNothing(end) || types.isInteger(end), "Invalid 'end'.");
							root.DD_ASSERT(types.isNothing(stopStr) || types.isString(stopStr) || types._instanceof(stopStr, _shared.Natives.windowRegExp), "Invalid stop string.");
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
							//var posText = _shared.Natives.stringSearchCall(str, text);
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
								//posStopStr = _shared.Natives.stringSearchCall(str, stopStr);
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
					}));

				tools.ADD('join', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
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
								result += types.toString(ar[i]);
								count++;
							};
						};
						return result;
					}));
					
				tools.ADD('title', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
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
					}));
				
				//===================================
				// Log functions
				//===================================
					
				var __logLevelsName__ = [
					'debug',
					'info',
					'warning',
					'error',
				];
					
				tools.ADD('log', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 2,
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
						if (level >= __options__.logLevel) {
							if (params) {
								message = tools.format(types.toString(message), params);
							};
							if (types.isString(message) && types.hasIndex(__logLevelsName__, level)) {
								message = __logLevelsName__[level] + ': ' + message;
							};
							var hook = _shared.consoleHook;
							if (types.isFunction(hook)) {
								hook(level, message);
							};
						};
					}));

				
				//===================================
				// Escape functions
				//===================================
					
				tools.ADD('escape', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
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
					}));
				
				// See "http://stackoverflow.com/questions/2083754/why-shouldnt-apos-be-used-to-escape-single-quotes"
				__Internal__.htmlReserved = "<>\"'&",
				__Internal__.htmlReservedSubstitutions = ['&lt;', '&gt;', '&quot;', '&#39;', '&amp;'];

				tools.ADD('escapeHtml', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
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
					}));
				
				__Internal__.regExpReserved = "\\^$*+?()|{}[].",
				__Internal__.regExpReservedSubstitutions = ['\\\\', '\\^', '\\$', '\\*', '\\+', '\\?', '\\(', '\\)', '\\|', '\\{', '\\}', '\\[', '\\]', '\\.'];
					
				tools.ADD('escapeRegExp', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
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
					, (_shared.Natives.regExpEscape || function escapeRegExp(text) {
						return tools.escape(text, __Internal__.regExpReserved, __Internal__.regExpReservedSubstitutions);
					})));
				
				//===================================
				// Compare functions
				//===================================
					
				tools.ADD('compareNumbers', root.DD_DOC(
						//! REPLACE_IF(IS_UNSET('debug'), "null")
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
					}));
				
				tools.ADD('compareNumbersInverted', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
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
					, function compareNumbersInverted(value1, value2) {
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
					}));

				

				//===================================
				// Object functions
				//===================================
					
				tools.ADD('indexOf', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
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
								return _shared.Natives.stringIndexOfCall(obj, item, from);
							} else {
								if (_shared.Natives.arrayIndexOfCall) {
									// JS 1.6
									return _shared.Natives.arrayIndexOfCall(obj, item, from);
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
					}));
				
				tools.ADD('lastIndexOf', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
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
								return _shared.Natives.stringLastIndexOfCall(obj, item, from);
							} else {
								if (_shared.Natives.arrayLastIndexOfCall) {
									// JS 1.6
									return _shared.Natives.arrayLastIndexOfCall(obj, item, from);
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
					}));
				
				tools.ADD('forEach', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 3,
							params: {
								obj: {
									type: 'arraylike,object,Map,Set,Iterable',
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
							if (types._instanceof(obj, types.Map) || types._instanceof(obj, types.Set)) {
								// "Map" and "Set" have their own "forEach" method.
								return obj.forEach.call(obj, fn, thisObj);
							} else if (types.isArrayLike(obj)) {
								if (_shared.Natives.arrayForEachCall) {
									// JS 1.6
									return _shared.Natives.arrayForEachCall(obj, fn, thisObj);
								} else {
									obj = Object(obj);
									var len = obj.length;
									for (var key = 0; key < len; key++) {
										if (key in obj) {
											fn.call(thisObj, obj[key], key, obj);
										};
									};
								};
							} else if (types.isIterable(obj)) {
								var iter = obj[_shared.Natives.symbolIterator](),
									key = 0,
									item;
								while ((item = iter.next()) && !item.done) {
									fn.call(thisObj, item.value, key++, obj);
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
					}));
				
				tools.ADD('filter', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 3,
							params: {
								obj: {
									type: 'arraylike,object,Map,Set,Iterable',
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
								if (types._instanceof(obj, types.Map)) {
									result = new types.Map();
									obj.forEach(function(val, key) {
										if (invert === !items.call(thisObj, val, key, obj)) {
											result.set(key, val);
										};
									});
								} else if (types._instanceof(obj, types.Set)) {
									result = new types.Set();
									obj.forEach(function(val, key) {
										if (invert === !items.call(thisObj, val, key, obj)) {
											result.add(val);
										};
									});
								} else if (types.isArrayLike(obj)) {
									if (_shared.Natives.arrayFilterCall && !invert) {
										// JS 1.6
										result = _shared.Natives.arrayFilterCall(obj, items, thisObj);
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
								} else if (types.isIterable(obj)) {
									result = [];
									var iter = obj[_shared.Natives.symbolIterator](),
										item;
									while ((item = iter.next()) && !item.done) {
										if (invert === !items.call(thisObj, item.value, undefined, obj)) {
											result.push(item.value);
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
								if (types._instanceof(obj, types.Map)) {
									result = new types.Map();
									obj.forEach(function(val, key) {
										if (invert === (tools.findItem(items, val, undefined, true) === null)) {
											result.set(key, val);
										};
									});
								} else if (types._instanceof(obj, types.Set)) {
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
								} else if (types.isIterable(obj)) {
									result = [];
									var iter = obj[_shared.Natives.symbolIterator](),
										item;
									while ((item = iter.next()) && !item.done) {
										if (invert === (tools.findItem(items, item.value, undefined, true) === null)) {
											result.push(item.value);
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
					}));
				
				tools.ADD('filterKeys', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
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
					}));
				
				tools.ADD('every', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 4,
							params: {
								obj: {
									type: 'arraylike,object,Map,Set,Iterable',
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
								if (_shared.Natives.arrayEveryCall && !invert) {
									// JS 1.6
									return _shared.Natives.arrayEveryCall(obj, items, thisObj);
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
							} else if (types._instanceof(obj, types.Set) || types._instanceof(obj, types.Map)) {
								var entries = obj.entries(),
									entry;
								while (entry = entries.next()) {
									if (entry.done) {
										break;
									};
									if (invert === !!items.call(thisObj, entry.value[1], entry.value[0], obj)) {
										return false;
									};
								};
							} else if (types.isIterable(obj)) {
								var iter = obj[_shared.Natives.symbolIterator](),
									key = 0,
									item;
								while ((item = iter.next()) && !item.done) {
									if (invert === !!items.call(thisObj, item.value, key++, obj)) {
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
							} else if (types._instanceof(obj, types.Set) || types._instanceof(obj, types.Map)) {
								var entries = obj.entries(),
									entry;
								while (entry = entries.next()) {
									if (entry.done) {
										break;
									};
									if (invert === (tools.findItem(items, entry.value[1], undefined, true) !== null)) {
										return false;
									};
								};
							} else if (types.isIterable(obj)) {
								var iter = obj[_shared.Natives.symbolIterator](),
									key = 0,
									item;
								while ((item = iter.next()) && !item.done) {
									if (invert === (tools.findItem(items, item.value, undefined, true) !== null)) {
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
					}));
				
				tools.ADD('some', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 4,
							params: {
								obj: {
									type: 'arraylike,object,Map,Set,Iterable',
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
									if (_shared.Natives.arraySomeCall && !invert) {
										// JS 1.6
										return _shared.Natives.arraySomeCall(obj, items, thisObj);
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
								} else if (types._instanceof(obj, types.Set) || types._instanceof(obj, types.Map)) {
									var entries = obj.entries(),
										entry;
									while (entry = entries.next()) {
										if (entry.done) {
											break;
										};
										if (invert === !items.call(thisObj, entry.value[1], entry.value[0], obj)) {
											return true;
										};
									};
								} else if (types.isIterable(obj)) {
									var iter = obj[_shared.Natives.symbolIterator](),
										key = 0,
										item;
									while ((item = iter.next()) && !item.done) {
										if (invert === !items.call(thisObj, item.value, key++, obj)) {
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
								} else if (types._instanceof(obj, types.Set) || types._instanceof(obj, types.Map)) {
									var entries = obj.entries(),
										entry;
									while (entry = entries.next()) {
										if (entry.done) {
											break;
										};
										if (invert === (tools.findItem(items, entry.value[1], undefined, true) === null)) {
											return true;
										};
									};
								} else if (types.isIterable(obj)) {
									var iter = obj[_shared.Natives.symbolIterator](),
										key = 0,
										item;
									while ((item = iter.next()) && !item.done) {
										if (invert === (tools.findItem(items, item.value, undefined, true) === null)) {
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
					}));
				
				tools.ADD('reduce', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 2,
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
								thisObj: {
									type: 'any',
									optional: true,
									description: "Specifies 'this' for 'fn'. Default is 'undefined'.",
								},
							},
							returns: 'any',
							description: "Reduces every items of an array (or object) to a single value.",
					}
					//! END_REPLACE()
					, function reduce(obj, fn, /*optional*/initialValue, /*optional*/thisObj) {
						root.DD_ASSERT && root.DD_ASSERT(types.isFunction(fn), "Invalid function.");

						if (types.isNothing(obj)) {
							return initialValue;
						} else if (types.isArrayLike(obj) && types.isNothing(thisObj) && _shared.Natives.arrayReduceCall) {
							// JS 1.8
							if (arguments.length > 2) {
								return _shared.Natives.arrayReduceCall(obj, fn, initialValue);
							} else {
								return _shared.Natives.arrayReduceCall(obj, fn);
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
								result = fn.call(thisObj, result, val, key, obj);
							});
							if (!hasInitial) {
								throw new types.TypeError("Reduce of empty object with no initial value.");
							};
							return result;
						};
					}));
				
				tools.ADD('reduceRight', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 1,
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
								thisObj: {
									type: 'any',
									optional: true,
									description: "Specifies 'this' for 'fn'. Default is 'undefined'.",
								},
							},
							returns: 'any',
							description: "Reduces every items of an array (or object) to a single value, starting from the last item.",
					}
					//! END_REPLACE()
					, function reduceRight(obj, fn, /*optional*/initialValue, /*optional*/thisObj) {
						root.DD_ASSERT && root.DD_ASSERT(types.isFunction(fn), "Invalid function.");

						if (types.isNothing(obj)) {
							return initialValue;
						} else {
							root.DD_ASSERT && root.DD_ASSERT(types.isArrayLike(obj), "Invalid array.");

							if (types.isNothing(thisObj) && _shared.Natives.arrayReduceRightCall) {
								// JS 1.8
								if (arguments.length > 2) {
									return _shared.Natives.arrayReduceRightCall(obj, fn, initialValue);
								} else {
									return _shared.Natives.arrayReduceRightCall(obj, fn);
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
										value = fn.call(thisObj, value, obj[key], key, obj);
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
					}));
				
				//===================================
				// Math functions
				//===================================

				tools.ADD('sign', (_shared.Natives.mathSign || root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
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
					, function sign(obj) {
						obj = +obj;
						return (obj < 0 ? -1 : (obj > 0 ? 1 : obj)); 
					})));
					
			},
		};
		return DD_MODULES;
	},
};
//! END_MODULE()