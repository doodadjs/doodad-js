//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
	// doodad-js - Object-oriented programming framework
	// File: Tools.js - Useful tools
	// Project home: https://github.com/doodadjs/
	// Author: Claude Petit, Quebec city
	// Contact: doodadjs [at] gmail.com
	// Note: I'm still in alpha-beta stage, so expect to find some bugs or incomplete parts !
	// License: Apache V2
	//
	//	Copyright 2015-2018 Claude Petit
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

//! IF_SET("mjs")
//! ELSE()
	"use strict";
//! END_IF()

exports.add = function add(modules) {
	modules = (modules || {});
	modules['Doodad.Tools'] = {
		version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
		dependencies: [
			'Doodad.Types',
		],
		bootstrap: true,

		create: function create(root, /*optional*/_options, _shared) {
			//===================================
			// Get namespaces
			//===================================

			const doodad = root.Doodad,
				types = doodad.Types,
				tools = doodad.Tools;

			//===================================
			// Internal
			//===================================

			// <FUTURE> Thread context
			const __Internal__ = {
			};


			tools.ADD('LogLevels', types.freezeObject(tools.nullObject({
				Debug: 0,
				Info: 1,
				Warning: 2,
				Error: 3,
			})));


			//===================================
			// Options
			//===================================

			let __options__ = tools.nullObject({
				logLevel: tools.LogLevels.Error,
				unhandledRejectionsTimeout: 5000,
				unhandledRejectionsMaxSize: 20,
				caseSensitive: null, // null = auto-detect (not 100 % viable)
				noWatch: false,
				toSourceItemsCount: 255,		// Max number of items
			});

			__Internal__._setOptions = function setOptions(...args) {
				const newOptions = tools.nullObject(__options__, ...args);

				newOptions.logLevel = types.toInteger(newOptions.logLevel);
				newOptions.unhandledRejectionsTimeout = types.toInteger(newOptions.unhandledRejectionsTimeout);
				newOptions.unhandledRejectionsMaxSize = types.toInteger(newOptions.unhandledRejectionsMaxSize);
				newOptions.noWatch = types.toBoolean(newOptions.noWatch);
				newOptions.toSourceItemsCount = types.toInteger(newOptions.toSourceItemsCount);

				if (!types.isNothing(newOptions.caseSensitive)) {
					newOptions.caseSensitive = types.toBoolean(newOptions.caseSensitive);
				};

				return newOptions;
			};

			tools.ADD('getOptions', function getOptions() {
				return __options__;
			});

			tools.ADD('setOptions', function setOptions(...args) {
				const newOptions = __Internal__._setOptions(...args);

				if (newOptions.secret !== _shared.SECRET) {
					throw new types.AccessDenied("Secrets mismatch.");
				};

				delete newOptions.secret;

				__options__ = types.freezeObject(newOptions);

				return __options__;
			});

			__options__ = types.freezeObject(__Internal__._setOptions(_options));

			//===================================
			// Hooks
			//===================================

			_shared.consoleHook = function consoleHook(level, message) {
				if (global.console) {
					let fn;
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

			tools.complete(_shared.Natives, {
				// Prototype functions
				stringIndexOfCall: global.String.prototype.indexOf.call.bind(global.String.prototype.indexOf),
				stringLastIndexOfCall: global.String.prototype.lastIndexOf.call.bind(global.String.prototype.lastIndexOf),
				stringReplaceCall: global.String.prototype.replace.call.bind(global.String.prototype.replace),
				//stringSearchCall: global.String.prototype.search.call.bind(global.String.prototype.search),
				stringSplitCall: global.String.prototype.split.call.bind(global.String.prototype.split),

				windowRegExp: global.RegExp,
				windowObject: global.Object,

				// Polyfills

				// "sign"
				mathSign: global.Math.sign,

				// "round", "floor"
				mathPow: global.Math.pow,

				// "round"
				mathRound: global.Math.round,

				// "floor"
				mathFloor: global.Math.floor,

				// ES5
				stringRepeatCall: global.String.prototype.repeat.call.bind(global.String.prototype.repeat),
				arrayIndexOfCall: global.Array.prototype.indexOf.call.bind(global.Array.prototype.indexOf),
				arrayLastIndexOfCall: global.Array.prototype.lastIndexOf.call.bind(global.Array.prototype.lastIndexOf),
				arrayForEachCall: global.Array.prototype.forEach.call.bind(global.Array.prototype.forEach),
				arrayMapCall: global.Array.prototype.map.call.bind(global.Array.prototype.map),
				arrayFilterCall: global.Array.prototype.filter.call.bind(global.Array.prototype.filter),
				arrayEveryCall: global.Array.prototype.every.call.bind(global.Array.prototype.every),
				arraySomeCall: global.Array.prototype.some.call.bind(global.Array.prototype.some),
				arrayReduceCall: global.Array.prototype.reduce.call.bind(global.Array.prototype.reduce),
				arrayReduceRightCall: global.Array.prototype.reduceRight.call.bind(global.Array.prototype.reduceRight),

				// ES7
				regExpEscape: global.RegExp.escape || null,
			});

			//===================================
			// String Tools
			//===================================

			tools.ADD('split', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 3,
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
						return _shared.Natives.stringSplitCall(str, separator);
					};
					let result;
					if (separator === '') {
						// Char array
						limit--;
						result = str.slice(0, limit).split('');
						if (result.length < str.length) {
							// Remaining
							result[result.length] = str.slice(limit);
						};
					} else if (types.isString(separator)) {
						let last = 0,
							index;
						const sepLen = separator.length;
						result = [];
						// eslint-disable-next-line no-cond-assign
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
						let matches;
						const strLen = str.length;
						result = [];
						separator.lastIndex = 0;
						// eslint-disable-next-line no-cond-assign
						while ((limit > 1) && (matches = separator.exec(str))) {
							const index = matches.index;
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

			tools.ADD('indexOf', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 2,
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
							sparsed: {
								type: 'bool',
								optional: true,
								description: "When 'true', empty slots are ignored. When 'false', empty slots are included. Default is 'true'.",
							},
						},
						returns: 'integer',
						description: "Returns the index of the first occurrence of the item. Returns '-1' when item is not found.",
					}
				//! END_REPLACE()
				, function indexOf(obj, item, /*optional*/from, /*optional*/sparsed) {
					if (types.isArrayLike(obj)) {
						from = (+from || 0);
						if (types.isNothing(sparsed)) {
							sparsed = true;
						};
						if (types.isString(obj)) {
							return _shared.Natives.stringIndexOfCall(obj, item, from);
						} else {
							if (!sparsed && _shared.Natives.arrayIndexOfCall) {
								// JS 1.6
								return _shared.Natives.arrayIndexOfCall(obj, item, from);
							} else {
								obj = _shared.Natives.windowObject(obj);
								const len = obj.length;
								from = Math.max(from >= 0 ? from : len - Math.abs(from), 0);
								for (let key = from; key < len; key++) {
									if (!sparsed || types.has(obj, key)) {
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
						revision: 2,
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
							sparsed: {
								type: 'bool',
								optional: true,
								description: "When 'true', empty slots are ignored. When 'false', empty slots are included. Default is 'true'.",
							},
						},
						returns: 'integer',
						description: "Returns the index of the last occurrence of the item. Returns '-1' when item is not found.",
					}
				//! END_REPLACE()
				, function lastIndexOf(obj, item, /*optional*/from, /*optional*/sparsed) {
					if (types.isArrayLike(obj)) {
						const len = obj.length;
						from = (+from || (len - 1));
						if (types.isNothing(sparsed)) {
							sparsed = true;
						};
						if (types.isString(obj)) {
							return _shared.Natives.stringLastIndexOfCall(obj, item, from);
						} else {
							if (_shared.Natives.arrayLastIndexOfCall && !sparsed) {
								// JS 1.6
								return _shared.Natives.arrayLastIndexOfCall(obj, item, from);
							} else {
								obj = _shared.Natives.windowObject(obj);
								from = Math.min(from >= 0 ? from : len - Math.abs(from), len - 1);
								for (let key = len - 1; key >= from; key--) {
									if (!sparsed || types.has(obj, key)) {
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

			tools.ADD('getFirstIndex', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 1,
						params: {
							obj: {
								type: 'arraylike',
								optional: false,
								description: "An array-like object.",
							},
						},
						returns: 'integer',
						description: "Returns the index of the first available value (the index of the first non-empty slot).",
					}
				//! END_REPLACE()
				, function getFirstIndex(obj) {
					if (types.isArrayLike(obj)) {
						const len = obj.length;
						for (let key = 0; key < len; key++) {
							if (types.has(obj, key)) {
								return key;
							};
						};
					};
				}));

			tools.ADD('getFirstValue', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 1,
						params: {
							obj: {
								type: 'arraylike',
								optional: false,
								description: "An array-like object.",
							},
						},
						returns: 'any',
						description: "Returns the first available value (the value of the first non-empty slot).",
					}
				//! END_REPLACE()
				, function getFirstValue(obj) {
					if (types.isArrayLike(obj)) {
						const len = obj.length;
						for (let key = 0; key < len; key++) {
							if (types.has(obj, key)) {
								return obj[key];
							};
						};
					};
				}));

			tools.ADD('popAt', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 1,
						params: {
							obj: {
								type: 'object,array',
								optional: false,
								description: "An object or an array.",
							},
							key: {
								type: 'string,integer',
								optional: false,
								description: "An attribute name or an array index.",
							},
						},
						returns: 'any',
						description: "Deletes the named own property of an object and returns its value. If object is an array, splices at the specified array index if 'key' is any existing array index.",
					}
				//! END_REPLACE()
				, function popAt(obj, key) {
					let item;
					if (!types.isNothing(obj)) {
						obj = _shared.Natives.windowObject(obj);
						if (types.has(obj, key)) {
							if (types.isArray(obj)) {
								const number = _shared.Natives.windowNumber(key);
								if ((number >= 0) && (number < obj.length)) {
									item = obj[key];
									_shared.Natives.arraySpliceCall(obj, key, 1);
								} else {
									item = obj[key];
									delete obj[key];
								};
							} else {
								item = obj[key];
								delete obj[key];
							};
						};
					};
					return item;
				}));

			tools.ADD('popItem', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 4,
						params: {
							obj: {
								type: 'object,array',
								optional: false,
								description: "An object or an array.",
							},
							item: {
								type: 'any,function',
								optional: false,
								description: "The value of the item to pop out. When it is a function, calls it to get the item to pop out.",
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
							includeSymbols: {
								type: 'bool',
								optional: false,
								description: "When 'true' and 'obj' is an object, will include symbols. Default is 'false'",
							},
						},
						returns: 'any',
						description: "Search the first occurrence of the specified value among owned properties of an object, than deletes it and returns that value. When not found, returns 'undefined'. If object is an array, splices at the index of the first occurrence.",
					}
				//! END_REPLACE()
				, function popItem(obj, item, /*optional*/thisObj, /*optional*/includeFunctions, /*optional*/includeSymbols) {
					if (!types.isNothing(obj)) {
						obj = _shared.Natives.windowObject(obj);
						if (!includeFunctions && types.isFunction(item)) {
							if (types.isArray(obj)) {
								const len = obj.length;
								for (let key = 0; key < len; key++) {
									if (types.has(obj, key)) {
										const val = obj[key];
										if (item.call(thisObj, val, key, obj)) {
											_shared.Natives.arraySpliceCall(obj, key, 1);
											return val;
										};
									};
								};
							} else {
								let result = undefined;
								const loopKeys = function _loopKeys(keys) {
									const len = keys.length; // performance
									for (let i = 0; i < len; i++) {
										const key = keys[i];
										const val = obj[key];
										if (item.call(thisObj, val, key, obj)) {
											delete obj[key];
											result = val;
											return true;
										};
									};
									return false;
								};
								if (!loopKeys(types.keys(obj))) {
									if (includeSymbols) {
										loopKeys(types.symbols(obj));
									};
								};
								return result;
							};
						} else {
							if (types.isArray(obj)) {
								const len = obj.length;
								for (let key = 0; key < len; key++) {
									if (types.has(obj, key)) {
										const val = obj[key];
										if (val === item) {
											_shared.Natives.arraySpliceCall(obj, key, 1);
											return val;
										};
									};
								};
							} else {
								let result = undefined;
								const loopKeys = function _loopKeys(keys) {
									const len = keys.length; // performance
									for (let i = 0; i < len; i++) {
										const key = keys[i];
										const val = obj[key];
										if (val === item) {
											delete obj[key];
											result = val;
											return true;
										};
									};
									return false;
								};
								if (!loopKeys(types.keys(obj))) {
									if (includeSymbols) {
										loopKeys(types.symbols(obj));
									};
								};
								return result;
							};
						};
					};
					return undefined;
				}));

			tools.ADD('popItems', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 6,
						params: {
							obj: {
								type: 'object,array',
								optional: false,
								description: "An object or an array.",
							},
							items: {
								type: 'any,arrayof(any),function',
								optional: false,
								description: "The values of the items to pop out. When it is a function, calls it to get the items to pop out.",
							},
							thisObj: {
								type: 'any',
								optional: true,
								description: "When 'items' is a function, specifies 'this'. Default is 'undefined'.",
							},
							includeSymbols: {
								type: 'bool',
								optional: false,
								description: "When 'true' and 'obj' is an object, will include symbols. Default is 'false'",
							},
						},
						returns: 'arrayof(any)',
						description: "Search all occurrence of the specified values among owned properties of an object, than deletes them and returns these values in an array. If object is an array, splices at the indexes of each occurrences.",
					}
				//! END_REPLACE()
				, function popItems(obj, items, /*optional*/thisObj, /*optional*/includeSymbols) {
					const result = [];
					if (!types.isNothing(obj)) {
						obj = _shared.Natives.windowObject(obj);

						if (types.isFunction(items)) {
							if (types.isArray(obj)) {
								for (let key = obj.length - 1; key >= 0; key--) {
									if (types.has(obj, key)) {
										const val = obj[key];
										if (items.call(thisObj, val, key, obj)) {
											_shared.Natives.arraySpliceCall(obj, key, 1);
											result.push(val);
										};
									};
								};
							} else {
								const loopKeys = function _loopKeys(keys) {
									const len = keys.length; // performance
									for (let i = 0; i < len; i++) {
										const key = keys[i];
										const val = obj[key];
										if (items.call(thisObj, val, key, obj)) {
											delete obj[key];
											result.push(val);
										};
									};
								};
								loopKeys(types.keys(obj));
								if (includeSymbols) {
									loopKeys(types.symbols(obj));
								};
							};
						} else if (types.isArray(items)) {
							const itemsLen = items.length;
							if (types.isArray(obj)) {
								for (let key = obj.length - 1; key >= 0; key--) {
									if (types.has(obj, key)) {
										const val = obj[key];
										for (let j = 0; j < itemsLen; j++) {
											if (types.has(items, j)) {
												if (items[j] === val) {
													_shared.Natives.arraySpliceCall(obj, key, 1);
													result.push(val);
												};
											};
										};
									};
								};
							} else {
								const loopKeys = function _loopKeys(keys) {
									const len = keys.length; // performance
									for (let i = 0; i < len; i++) {
										const key = keys[i];
										const val = obj[key];
										for (let j = 0; j < itemsLen; j++) {
											if (types.has(items, j)) {
												if (items[j] === val) {
													delete obj[key];
													result.push(val);
												};
											};
										};
									};
								};
								loopKeys(types.keys(obj));
								if (includeSymbols) {
									loopKeys(types.symbols(obj));
								};
							};
						} else {
							if (types.isArray(obj)) {
								for (let key = obj.length - 1; key >= 0; key--) {
									if (types.has(obj, key)) {
										const val = obj[key];
										if (items === val) {
											_shared.Natives.arraySpliceCall(obj, key, 1);
											result.push(val);
										};
									};
								};
							} else {
								const loopKeys = function _loopKeys(keys) {
									const len = keys.length; // performance
									for (let i = 0; i < len; i++) {
										const key = keys[i];
										const val = obj[key];
										if (items === val) {
											delete obj[key];
											result.push(val);
										};
									};
								};
								loopKeys(types.keys(obj));
								if (includeSymbols) {
									loopKeys(types.symbols(obj));
								};
							};
						};
					};
					return result;
				}));

			tools.ADD('prepend', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 1,
						params: {
							obj: {
								type: 'arraylike',
								optional: false,
								description: "Target array.",
							},
							paramarray: {
								type: 'arrayof(arraylike)',
								optional: true,
								description: "An array.",
							},
						},
						returns: 'array',
						description: "Prepends the items of each array to the first argument than returns that array.",
					}
				//! END_REPLACE()
				, function prepend(obj, /*paramarray*/...args) {
					if (!types.isArrayLike(obj)) {
						return null;
					};
					const len = args.length;
					for (let i = 0; i < len; i++) {
						const arg = args[i];
						if (!types.isNothing(arg)) {
							_shared.Natives.arrayUnshiftApply(obj, arg);
						};
					};
					return obj;
				}));

			//===================================
			// Search functions
			//===================================

			tools.ADD('findItem', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 5,
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
							sparsed: {
								type: 'bool',
								optional: true,
								description: "When 'true', empty slots are ignored. When 'false', empty slots are included. Default is 'true'.",
							},
							includeSymbols: {
								type: 'bool',
								optional: false,
								description: "When 'true' and 'obj' is an object, will include symbols. Default is 'false'",
							},
						},
						returns: 'integer,string',
						description: "Returns the array index or the attribute name of the specified item. Returns 'null' when item is not found.",
					}
				//! END_REPLACE()
				, function findItem(obj, item, /*optional*/thisObj, /*optional*/includeFunctions, /*optional*/sparsed, /*optional*/includeSymbols) {
					if (!types.isNothing(obj)) {
						if (types.isNothing(sparsed)) {
							sparsed = true;
						};
						obj = _shared.Natives.windowObject(obj);
						if (!includeFunctions && types.isFunction(item)) {
							if (types.isArrayLike(obj)) {
								const len = obj.length;
								for (let key = 0; key < len; key++) {
									if (!sparsed || types.has(obj, key)) {
										if (item.call(thisObj, obj[key], key, obj)) {
											return key;
										};
									};
								};
							} else if (types.isIterable(obj)) {
								let key = 0;
								for (const val of obj) {
									if (item.call(thisObj, val, key, obj)) {
										return key;
									};
									key++;
								};
							} else {
								let result = null;
								const loopKeys = function _loopKeys(keys) {
									const len = keys.length; // performance
									for (let i = 0; i < len; i++) {
										const key = keys[i];
										if (item.call(thisObj, obj[key], key, obj)) {
											result = key;
											return true;
										};
									};
									return false;
								};
								if (!loopKeys(types.keys(obj))) {
									if (includeSymbols) {
										loopKeys(types.symbols(obj));
									};
								};
								return result;
							};
						} else {
							if (types.isArrayLike(obj)) {
								const len = obj.length;
								for (let key = 0; key < len; key++) {
									if (!sparsed || types.has(obj, key)) {
										if (obj[key] === item) {
											return key;
										};
									};
								};
							} else if (types.isIterable(obj)) {
								let key = 0;
								for (const val of obj) {
									if (val === item) {
										return key;
									};
									key++;
								};
							} else {
								let result = null;
								const loopKeys = function _loopKeys(keys) {
									const len = keys.length; // performance
									for (let i = 0; i < len; i++) {
										const key = keys[i];
										if (obj[key] === item) {
											result = key;
											return true;
										};
									};
									return false;
								};
								if (!loopKeys(types.keys(obj))) {
									if (includeSymbols) {
										loopKeys(types.symbols(obj));
									};
								};
								return result;
							};
						};
					};
					return null;
				}));

			tools.ADD('findLastItem', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 3,
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
							sparsed: {
								type: 'bool',
								optional: true,
								description: "When 'true', empty slots are ignored. When 'false', empty slots are included. Default is 'true'.",
							},
							includeSymbols: {
								type: 'bool',
								optional: false,
								description: "When 'true' and 'obj' is an object, will include symbols. Default is 'false'",
							},
						},
						returns: 'integer,string',
						description: "Returns the array index or the attribute name of the specified item, by searching from the end. Returns 'null' when item is not found.",
					}
				//! END_REPLACE()
				, function findLastItem(obj, item, /*optional*/thisObj, /*optional*/includeFunctions, /*optional*/sparsed, /*optional*/includeSymbols) {
					if (!types.isNothing(obj)) {
						if (types.isNothing(sparsed)) {
							sparsed = true;
						};
						obj = _shared.Natives.windowObject(obj);
						if (!includeFunctions && types.isFunction(item)) {
							if (types.isArrayLike(obj)) {
								for (let key = obj.length - 1; key >= 0; key--) {
									if (!sparsed || types.has(obj, key)) {
										if (item.call(thisObj, obj[key], key, obj)) {
											return key;
										};
									};
								};
							} else {
								let result = null;
								const loopKeys = function _loopKeys(keys) {
									for (let i = keys.length - 1; i >= 0; i--) {
										const key = keys[i];
										if (item.call(thisObj, obj[key], key, obj)) {
											result = key;
											return true;
										};
									};
									return false;
								};
								if (!loopKeys(types.keys(obj))) {
									if (includeSymbols) {
										loopKeys(types.symbols(obj));
									};
								};
								return result;
							};
						} else {
							if (types.isArrayLike(obj)) {
								for (let key = obj.length - 1; key >= 0; key--) {
									if (!sparsed || types.has(obj, key)) {
										if (obj[key] === item) {
											return key;
										};
									};
								};
							} else {
								let result = null;
								const loopKeys = function _loopKeys(keys) {
									for (let i = keys.length - 1; i >= 0; i--) {
										const key = keys[i];
										if (obj[key] === item) {
											result = key;
											return true;
										};
									};
									return false;
								};
								if (!loopKeys(types.keys(obj))) {
									if (includeSymbols) {
										loopKeys(types.symbols(obj));
									};
								};
								return result;
							};
						};
					};
					return null;
				}));

			tools.ADD('findItems', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 4,
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
							sparsed: {
								type: 'bool',
								optional: true,
								description: "When 'true', empty slots are ignored. When 'false', empty slots are included. Default is 'true'.",
							},
							includeSymbols: {
								type: 'bool',
								optional: false,
								description: "When 'true' and 'obj' is an object, will include symbols. Default is 'false'",
							},
						},
						returns: 'arrayof(integer,string)',
						description: "Returns the array indexes or the attribute names of the specified items.",
					}
				//! END_REPLACE()
				, function findItems(obj, items, /*optional*/thisObj, /*optional*/includeFunctions, /*optional*/sparsed, /*optional*/includeSymbols) {
					const result = [];
					if (!types.isNothing(obj)) {
						if (types.isNothing(sparsed)) {
							sparsed = true;
						};
						obj = _shared.Natives.windowObject(obj);
						if (!includeFunctions && types.isFunction(items)) {
							if (types.isArrayLike(obj)) {
								const len = obj.length;
								for (let key = 0; key < len; key++) {
									if (!sparsed || types.has(obj, key)) {
										if (items.call(thisObj, obj[key], key, obj)) {
											result.push(key);
										};
									};
								};
							} else if (types.isIterable(obj)) {
								let key = 0;
								for (const val of obj) {
									if (items.call(thisObj, val, key, obj)) {
										result.push(key);
									};
									key++;
								};
							} else {
								const loopKeys = function _loopKeys(keys) {
									const len = keys.length;
									for (let i = 0; i < len; i++) {
										const key = keys[i];
										if (items.call(thisObj, obj[key], key, obj)) {
											result.push(key);
										};
									};
								};
								loopKeys(types.keys(obj));
								if (includeSymbols) {
									loopKeys(types.symbols(obj));
								};
							};
						} else {
							if (!types.isArray(items)) {
								items = [items];
							};
							if (types.isArrayLike(obj)) {
								const len = obj.length;
								for (let key = 0; key < len; key++) {
									if (!sparsed || types.has(obj, key)) {
										if (tools.findItem(items, obj[key], undefined, true, sparsed) !== null) {
											result.push(key);
										};
									};
								};
							} else if (types.isIterable(obj)) {
								let key = 0;
								for (const val of obj) {
									if (tools.findItem(items, val, undefined, true, sparsed) !== null) {
										result.push(key);
									};
									key++;
								};
							} else {
								const loopKeys = function _loopKeys(keys) {
									const len = keys.length;
									for (let i = 0; i < len; i++) {
										const key = keys[i];
										if (tools.findItem(items, obj[key], undefined, true, sparsed) !== null) {
											result.push(key);
										};
									};
								};
								loopKeys(types.keys(obj));
								if (includeSymbols) {
									loopKeys(types.symbols(obj));
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
						revision: 5,
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
							sparsed: {
								type: 'bool',
								optional: true,
								description: "When 'true', empty slots are ignored. When 'false', empty slots are included. Default is 'true'.",
							},
							includeSymbols: {
								type: 'bool',
								optional: false,
								description: "When 'true' and 'obj' is an object, will include symbols. Default is 'false'",
							},
						},
						returns: 'any',
						description: "Returns the found item. Returns 'null' when item is not found.",
					}
				//! END_REPLACE()
				, function getItem(obj, item, /*optional*/thisObj, /*optional*/includeFunctions, /*optional*/sparsed, /*optional*/includeSymbols) {
					if (!types.isNothing(obj)) {
						if (types.isNothing(sparsed)) {
							sparsed = true;
						};
						obj = _shared.Natives.windowObject(obj);
						if (!includeFunctions && types.isFunction(item)) {
							if (types.isArrayLike(obj)) {
								const len = obj.length;
								for (let key = 0; key < len; key++) {
									if (!sparsed || types.has(obj, key)) {
										const val = obj[key];
										if (item.call(thisObj, val, key, obj)) {
											return val;
										};
									};
								};
							} else if (types.isIterable(obj)) {
								let key = 0;
								for (const val of obj) {
									if (item.call(thisObj, val, key, obj)) {
										return val;
									};
									key++;
								};
							} else {
								let result = null;
								const loopKeys = function _loopKeys(keys) {
									const len = keys.length;
									for (let i = 0; i < len; i++) {
										const key = keys[i],
											val = obj[key];
										if (item.call(thisObj, val, key, obj)) {
											result = val;
											return true;
										};
									};
									return false;
								};
								if (!loopKeys(types.keys(obj))) {
									if (includeSymbols) {
										loopKeys(types.symbols(obj));
									};
								};
								return result;
							};
						} else {
							if (types.isArrayLike(obj)) {
								const len = obj.length;
								for (let key = 0; key < len; key++) {
									if (!sparsed || types.has(obj, key)) {
										if (obj[key] === item) {
											return item;
										};
									};
								};
							} else if (types.isIterable(obj)) {
								for (const val of obj) {
									if (val === item) {
										return val;
									};
								};
							} else {
								let result = null;
								const loopKeys = function _loopKeys(keys) {
									const len = keys.length;
									for (let i = 0; i < len; i++) {
										const key = keys[i];
										if (obj[key] === item) {
											result = item;
											return true;
										};
									};
									return false;
								};
								if (!loopKeys(types.keys(obj))) {
									if (includeSymbols) {
										loopKeys(types.symbols(obj));
									};
								};
								return result;
							};
						};
					};
					return null;
				}));


			tools.ADD('getItems', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 4,
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
								description: "When 'item' is a function, specifies 'this'. Default is 'undefined'.",
							},
							includeFunctions: {
								type: 'bool',
								optional: true,
								description: "When 'true' and 'item' is a function, considers that function as a value. Default is 'false'",
							},
							sparsed: {
								type: 'bool',
								optional: true,
								description: "When 'true', empty slots are ignored. When 'false', empty slots are included. Default is 'true'.",
							},
							includeSymbols: {
								type: 'bool',
								optional: false,
								description: "When 'true' and 'obj' is an object, will include symbols. Default is 'false'",
							},
						},
						returns: 'any',
						description: "Returns the found items.",
					}
				//! END_REPLACE()
				, function getItems(obj, items, /*optional*/thisObj, /*optional*/includeFunctions, /*optional*/sparsed, /*optional*/includeSymbols) {
					const result = [];
					if (!types.isNothing(obj)) {
						if (types.isNothing(sparsed)) {
							sparsed = true;
						};
						obj = _shared.Natives.windowObject(obj);
						if (!includeFunctions && types.isFunction(items)) {
							if (types.isArrayLike(obj)) {
								const len = obj.length;
								for (let key = 0; key < len; key++) {
									if (!sparsed || types.has(obj, key)) {
										const val = obj[key];
										if (items.call(thisObj, val, key, obj)) {
											result.push(val);
										};
									};
								};
							} else if (types.isIterable(obj)) {
								let key = 0;
								for (const val of obj) {
									if (items.call(thisObj, val, key, obj)) {
										result.push(val);
									};
									key++;
								};
							} else {
								const loopKeys = function _loopKeys(keys) {
									const len = keys.length;
									for (let i = 0; i < len; i++) {
										const key = keys[i],
											val = obj[key];
										if (items.call(thisObj, val, key, obj)) {
											result.push(val);
										};
									};
								};
								loopKeys(types.keys(obj));
								if (includeSymbols) {
									loopKeys(types.symbols(obj));
								};
							};
						} else {
							if (!types.isArrayLike(items)) {
								items = [items];
							};
							if (types.isArrayLike(obj)) {
								const objLen = obj.length,
									itemsLen = items.length;
								for (let key = 0; key < objLen; key++) {
									if (!sparsed || types.has(obj, key)) {
										const val = obj[key];
										for (let i = 0; i < itemsLen; i++) {
											if (!sparsed || types.has(items, i)) {
												if (val === items[i]) {
													result.push(val);
												};
											};
										};
									};
								};
							} else if (types.isIterable(obj)) {
								const itemsLen = items.length;
								for (const val of obj) {
									for (let j = 0; j < itemsLen; j++) {
										if (!sparsed || types.has(items, j)) {
											if (val === items[j]) {
												result.push(val);
											};
										};
									};
								};
							} else {
								const loopKeys = function _loopKeys(keys) {
									const keysLen = keys.length,
										itemsLen = items.length;
									for (let i = 0; i < keysLen; i++) {
										const key = keys[i];
										const val = obj[key];
										for (let j = 0; j < itemsLen; j++) {
											if (!sparsed || types.has(items, j)) {
												if (val === items[j]) {
													result.push(val);
												};
											};
										};
									};
								};
								loopKeys(types.keys(obj));
								if (includeSymbols) {
									loopKeys(types.symbols(obj));
								};
							};
						};
					};
					return result;
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
						}
					}
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
						const regexp = tools.escapeRegExp(from);
						from = new _shared.Natives.windowRegExp(regexp, options);
					};
					if (types.isString(text)) {
						return _shared.Natives.stringReplaceCall(text, from, to);
					} else {
						for (let i = 0; i < text.length; i++) {
							text[i] = _shared.Natives.stringReplaceCall(text[i], from, to);
						};
						return text;
					}
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

					let posText;
					if (types.isString(text)) {
						posText = str.indexOf(text, start);
					} else {
						text.lastIndex = start;
						//posText = _shared.Natives.stringSearchCall(str, text);
						posText = text.exec(str);
						if (!text.global && (start > 0)) {
							throw new types.ValueError("Regular expression must have the global flag set.");
						};
						if (posText) {
							posText = posText.index;
						} else {
							posText = -1;
						};
					};

					let posStopStr = -1;
					if (stopStr) {
						if (types.isString(stopStr)) {
							posStopStr = str.indexOf(stopStr, start);
						} else {
							stopStr.lastIndex = start;
							//posStopStr = _shared.Natives.stringSearchCall(str, stopStr);
							posStopStr = stopStr.exec(str);
							if (!stopStr.global && (start > 0)) {
								throw new types.ValueError("Regular expression must have the global flag set.");
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
						}
					} else if ((posStopStr >= 0) && (posStopStr < posText)) {
						// Stop
						if (getText) {
							return null;
						} else {
							return NaN;
						}
					} else {
						// Match
						if (getText) {
							if (posStopStr >= 0) {
								return str.slice(posText, Math.min(posStopStr, end));
							} else {
								return str.slice(posText);
							}
						} else {
							return posText;
						}
					}
				}));

			tools.ADD('join', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 2,
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
							sparsed: {
								type: 'bool',
								optional: true,
								description: "When 'true', empty slots are ignored. When 'false', empty slots are included. Default is 'true'.",
							},
						},
						returns: 'string',
						description: "Returns a string with joined values.",
					}
				//! END_REPLACE()
				, function join(ar, /*optional*/str, /*optional*/sparsed) {
					if (root.DD_ASSERT) {
						root.DD_ASSERT(types.isArray(ar), "Invalid array.");
						root.DD_ASSERT(types.isNothing(str) || types.isString(str), "Invalid string.");
					};
					if (types.isNothing(sparsed)) {
						sparsed = true;
					};
					const arLen = ar.length;
					let result = '',
						count = 0;
					for (let i = 0; i < arLen; i++) {
						if (!sparsed || types.has(ar, i)) {
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
					let retval = '';
					if (!separator) {
						separator = ' ';
					};
					str = str.split(separator);
					const len = str.length;
					for (let i = 0; i < len; i++) {
						const word = str[i];
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

			__Internal__.logLevelsName = [
				'debug',
				'info',
				'warning',
				'error',
			];

			tools.ADD('log', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 3,
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
						if (types.isString(message) && types.hasIndex(__Internal__.logLevelsName, level)) {
							message = __Internal__.logLevelsName[level] + ': ' + message;
						};
						const hook = _shared.consoleHook;
						if (types.isFunction(hook)) {
							hook(level, message);
						};
					};
				}));


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
					}
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
					}
				}));


			//===================================
			// Object functions
			//===================================

			tools.ADD('depthComplete', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 3,
						params: {
							depth: {
								type: 'integer',
								optional: false,
								description: "Depth.",
							},
							paramarray: {
								type: 'any',
								optional: false,
								description: "An object.",
							},
						},
						returns: 'object',
						description: "Extends the first object with owned properties of the other objects using the specified depth. Existing owned properties are excluded.",
					}
				//! END_REPLACE()
				, function depthComplete(depth, obj, /*paramarray*/...args) {
					let result;
					const loopKeys = function _loopKeys(obj, keys) {
						const keysLen = keys.length; // performance
						for (let j = 0; j < keysLen; j++) {
							const key = keys[j];
							const objVal = obj[key];
							if ((depth >= 0) && types.isObjectLike(objVal)) {
								const resultVal = result[key];
								if (types.isNothing(resultVal)) {
									result[key] = tools.depthComplete(depth, {}, objVal);
								} else if (types.isObjectLike(resultVal)) {
									tools.depthComplete(depth, resultVal, objVal);
								};
							} else if (!types.has(result, key)) {
								result[key] = objVal;
							};
						};
					};
					if (!types.isNothing(obj)) {
						depth = (+depth || 0) - 1;  // null|undefined|true|false|NaN|Infinity
						if (depth >= -1) {
							result = _shared.Natives.windowObject(obj);
							const len = args.length;
							for (let i = 0; i < len; i++) {
								obj = args[i];
								if (types.isNothing(obj)) {
									continue;
								};
								// Part of "Object.assign" Polyfill from Mozilla Developer Network.
								obj = _shared.Natives.windowObject(obj);
								loopKeys(obj, types.keys(obj));
								loopKeys(obj, types.symbols(obj));
							};
						};
					};
					return result;
				}));

			tools.ADD('fill', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 3,
						params: {
							keys: {
								type: 'arrayof(string,symbol),string,symbol',
								optional: false,
								description: "Attribute names.",
							},
							paramarray: {
								type: 'any',
								optional: false,
								description: "An object.",
							},
						},
						returns: 'object',
						description: "Extends the first object with named owned properties of the other objects.",
					}
				//! END_REPLACE()
				, function fill(keys, obj, /*paramarray*/...args) {
					let result;
					if (!types.isNothing(obj)) {
						if (types.isNothing(keys)) {
							keys = [];
						} else if (!types.isArray(keys)) {
							keys = [keys];
						};
						result = _shared.Natives.windowObject(obj);
						const argumentsLen = args.length,
							keysLen = keys.length;
						for (let i = 0; i < argumentsLen; i++) {
							obj = args[i];
							if (!types.isNothing(obj)) {
								obj = _shared.Natives.windowObject(obj);
								for (let k = 0; k < keysLen; k++) {
									if (types.has(keys, k)) {
										const key = keys[k];
										if (types.has(obj, key)) {
											result[key] = obj[key];
										};
									};
								};
							};
						};
					};
					return result;
				}));

			tools.ADD('map', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 5,
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
							sparsed: {
								type: 'bool',
								optional: true,
								description: "When 'true', empty slots are ignored. When 'false', empty slots are included. Default is 'true'.",
							},
							includeSymbols: {
								type: 'bool',
								optional: false,
								description: "When 'true' and 'obj' is an object, will include symbols. Default is 'false'",
							},
						},
						returns: 'array,object',
						description: "For each item of the array (or the object), maps the value to another value than returns a new array (or a new object instance).",
					}
				//! END_REPLACE()
				, function map(obj, fn, /*optional*/thisObj, /*optional*/start, /*optional*/end, /*optional*/sparsed, /*optional*/includeSymbols) {
					/* eslint consistent-return: "off" */

					if (!types.isNothing(obj)) {
						if (types.isNothing(sparsed)) {
							sparsed = true;
						};
						obj = _shared.Natives.windowObject(obj);
						if (types._instanceof(obj, types.Set)) {
							const result = new types.Set();
							obj.forEach(function(value, key, obj) {
								result.add(fn.call(thisObj, value, key, obj));
							});
							return result;
						} else if (types._instanceof(obj, types.Map)) {
							const result = new types.Map();
							obj.forEach(function(value, key, obj) {
								result.set(key, fn.call(thisObj, value, key, obj));
							});
							return result;
						} else if (types.isArrayLike(obj)) {
							if (types.isNothing(start) || (start < 0)) {
								start = 0;
							};
							const len = obj.length;
							if (types.isNothing(end) || (end > len)) {
								end = len;
							};
							if (_shared.Natives.arrayMapCall && (start === 0) && (end >= len) && !sparsed) {
								return _shared.Natives.arrayMapCall(obj, fn, thisObj);
							} else {
								const result = (sparsed ? [] : tools.createArray(end - start));
								let pos = 0;
								for (let key = start; key < end; key++) {
									if (!sparsed || types.has(obj, key)) {
										result[pos] = fn.call(thisObj, obj[key], key, obj);
										pos++;
									};
								};
								return result;
							}
						} else if (types.isIterable(obj)) {
							const result = [];
							let key = 0;
							for (const val of obj) {
								result[key] = fn.call(thisObj, val, key, obj);
								key++;
							};
							return result;
						} else {
							const result = tools.createObject(types.getPrototypeOf(obj));
							const loopKeys = function _loopKeys(keys) {
								const len = keys.length; // performance
								for (let i = 0; i < len; i++) {
									const key = keys[i];
									result[key] = fn.call(thisObj, obj[key], key, obj);
								};
							};
							loopKeys(types.keys(obj));
							loopKeys(types.symbols(obj));
							return result;
						}
					};
				}));

			tools.ADD('forEach', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 5,
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
							sparsed: {
								type: 'bool',
								optional: true,
								description: "When 'true', empty slots are ignored. When 'false', empty slots are included. Default is 'true'.",
							},
							includeSymbols: {
								type: 'bool',
								optional: false,
								description: "When 'true' and 'obj' is an object, will include symbols. Default is 'false'",
							},
						},
						returns: 'undefined',
						description: "For each item of the array (or the object), simply calls the specified function.",
					}
				//! END_REPLACE()
				, function forEach(obj, fn, /*optional*/thisObj, /*optional*/sparsed, /*optional*/includeSymbols) {
					/* eslint consistent-return: "off" */

					root.DD_ASSERT && root.DD_ASSERT(types.isFunction(fn), "Invalid function");

					if (!types.isNothing(obj)) {
						if (types.isNothing(sparsed)) {
							sparsed = true;
						};
						if (types._instanceof(obj, types.Map) || types._instanceof(obj, types.Set)) {
							// "Map" and "Set" have their own "forEach" method.
							return obj.forEach(fn, thisObj);
						} else if (types.isArrayLike(obj)) {
							if (!sparsed && _shared.Natives.arrayForEachCall) {
								// JS 1.6
								return _shared.Natives.arrayForEachCall(obj, fn, thisObj);
							} else {
								obj = _shared.Natives.windowObject(obj);
								const len = obj.length;
								for (let key = 0; key < len; key++) {
									if (!sparsed || types.has(obj, key)) {
										fn.call(thisObj, obj[key], key, obj);
									};
								};
							};
						} else if (types.isIterable(obj)) {
							let key = 0;
							for (const val of obj) {
								fn.call(thisObj, val, key++, obj);
							};
						} else {
							obj = _shared.Natives.windowObject(obj);
							const loopKeys = function _loopKeys(keys) {
								const len = keys.length; // performance
								for (let i = 0; i < len; i++) {
									const key = keys[i];
									fn.call(thisObj, obj[key], key, obj);
								};
							};
							loopKeys(types.keys(obj));
							if (includeSymbols) {
								loopKeys(types.symbols(obj));
							};
						};
					};
				}));

			tools.ADD('filter', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 6,
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
							sparsed: {
								type: 'bool',
								optional: true,
								description: "When 'true', empty slots are ignored. When 'false', empty slots are included. Default is 'true'.",
							},
							includeSymbols: {
								type: 'bool',
								optional: false,
								description: "When 'true' and 'obj' is an object, will include symbols. Default is 'false'",
							},
						},
						returns: 'array,object',
						description: "Filters array (or object) with the specified items, and returns a new array (or object) with matching items.",
					}
				//! END_REPLACE()
				, function filter(obj, items, /*optional*/thisObj, /*optional*/invert, /*optional*/includeFunctions, /*optional*/sparsed, /*optional*/includeSymbols) {
					let result;
					if (!types.isNothing(obj)) {
						obj = _shared.Natives.windowObject(obj);
						invert = !!invert;
						if (types.isNothing(sparsed)) {
							sparsed = true;
						};
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
								if (!_shared.Natives.arrayFilterCall && !invert && !sparsed) {
									// JS 1.6
									result = _shared.Natives.arrayFilterCall(obj, items, thisObj);
								} else {
									result = [];
									const len = obj.length;
									for (let key = 0; key < len; key++) {
										if (!sparsed || types.has(obj, key)) {
											const val = obj[key];
											if (invert === !items.call(thisObj, val, key, obj)) {
												result.push(val);
											};
										};
									};
								};
							} else if (types.isIterable(obj)) {
								result = [];
								for (const val of obj) {
									if (invert === !items.call(thisObj, val, undefined, obj)) {
										result.push(val);
									};
								};
							} else {
								result = {};
								const loopKeys = function _loopKeys(keys) {
									const len = keys.length;
									for (let i = 0; i < len; i++) {
										const key = keys[i];
										const val = obj[key];
										if (invert === !items.call(thisObj, val, key, obj)) {
											result[key] = val;
										};
									};
								};
								loopKeys(types.keys(obj));
								if (includeSymbols) {
									loopKeys(types.symbols(obj));
								};
							};
						} else {
							if (types._instanceof(obj, types.Map)) {
								result = new types.Map();
								obj.forEach(function(val, key) {
									if (invert === (tools.findItem(items, val, undefined, true, sparsed) === null)) {
										result.set(key, val);
									};
								});
							} else if (types._instanceof(obj, types.Set)) {
								result = new types.Set();
								obj.forEach(function(val, key) {
									if (invert === (tools.findItem(items, val, undefined, true, sparsed) === null)) {
										result.add(val);
									};
								});
							} else if (types.isArrayLike(obj)) {
								result = [];
								const len = obj.length;
								for (let key = 0; key < len; key++) {
									if (!sparsed || types.has(obj, key)) {
										const val = obj[key];
										if (invert === (tools.findItem(items, val, undefined, true, sparsed) === null)) {
											result.push(val);
										};
									};
								};
							} else if (types.isIterable(obj)) {
								result = [];
								for (const val of obj) {
									if (invert === (tools.findItem(items, val, undefined, true, sparsed) === null)) {
										result.push(val);
									};
								};
							} else {
								result = {};
								const loopKeys = function _loopKeys(keys) {
									const len = keys.length;
									for (let i = 0; i < len; i++) {
										const key = keys[i];
										const val = obj[key];
										if (invert === (tools.findItem(items, val, undefined, true, sparsed) === null)) {
											result[key] = val;
										};
									};
								};
								loopKeys(types.keys(obj));
								if (includeSymbols) {
									loopKeys(types.symbols(obj));
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
						revision: 2,
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
							sparsed: {
								type: 'bool',
								optional: true,
								description: "When 'true', empty slots are ignored. When 'false', empty slots are included. Default is 'true'.",
							},
							includeSymbols: {
								type: 'bool',
								optional: false,
								description: "When 'true' and 'obj' is an object, will include symbols. Default is 'false'",
							},
						},
						returns: 'array,object',
						description: "Filters array (or object) with the specified keys, and returns a new array (or object) with matching items.",
					}
				//! END_REPLACE()
				, function filterKeys(obj, items, /*optional*/thisObj, /*optional*/invert, /*optional*/includeFunctions, /*optional*/sparsed, /*optional*/includeSymbols) {
					let result;
					if (!types.isNothing(obj)) {
						obj = _shared.Natives.windowObject(obj);
						invert = !!invert;
						if (types.isNothing(sparsed)) {
							sparsed = true;
						};
						if (!includeFunctions && types.isFunction(items)) {
							if (types.isArrayLike(obj)) {
								result = [];
								const len = obj.length;
								for (let key = 0; key < len; key++) {
									if (!sparsed || types.has(obj, key)) {
										const val = obj[key];
										if (invert === !items.call(thisObj, val, key, obj)) {
											result.push(val);
										};
									};
								};
							} else {
								result = {};
								const loopKeys = function _loopKeys(keys) {
									const len = keys.length;
									for (let i = 0; i < len; i++) {
										const key = keys[i];
										const val = obj[key];
										if (invert === !items.call(thisObj, val, key, obj)) {
											result[key] = val;
										};
									};
								};
								loopKeys(types.keys(obj));
								if (includeSymbols) {
									loopKeys(types.symbols(obj));
								};
							};
						} else {
							if (types.isArrayLike(obj)) {
								result = [];
								const len = obj.length;
								for (let key = 0; key < len; key++) {
									if (!sparsed || types.has(obj, key)) {
										const val = obj[key];
										if (invert === (tools.findItem(items, key, undefined, true, sparsed) === null)) {
											result.push(val);
										};
									};
								};
							} else {
								result = {};
								const loopKeys = function _loopKeys(keys) {
									const len = keys.length;
									for (let i = 0; i < len; i++) {
										const key = keys[i];
										const val = obj[key];
										if (invert === (tools.findItem(items, key, undefined, true, sparsed) === null)) {
											result[key] = val;
										};
									};
								};
								loopKeys(types.keys(obj));
								if (includeSymbols) {
									loopKeys(types.symbols(obj));
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
						revision: 8,
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
							sparsed: {
								type: 'bool',
								optional: true,
								description: "When 'true', empty slots are ignored. When 'false', empty slots are included. Default is 'true'.",
							},
							includeSymbols: {
								type: 'bool',
								optional: false,
								description: "When 'true' and 'obj' is an object, will include symbols. Default is 'false'",
							},
						},
						returns: 'bool',
						description: "Returns 'true' when every items of an array (or an object) match the filter. Returns 'false' otherwise.",
					}
				//! END_REPLACE()
				, function every(obj, items, /*optional*/thisObj, /*optional*/invert, /*optional*/includeFunctions, /*optional*/sparsed, /*optional*/includeSymbols) {
					if (!types.isNothing(obj)) {
						obj = _shared.Natives.windowObject(obj);
						invert = !!invert;
						if (types.isNothing(sparsed)) {
							sparsed = true;
						};
						if (!includeFunctions && types.isFunction(items)) {
							if (types.isArrayLike(obj)) {
								if (_shared.Natives.arrayEveryCall && !invert && !sparsed) {
									// JS 1.6
									return _shared.Natives.arrayEveryCall(obj, items, thisObj);
								} else {
									const len = obj.length;
									for (let key = 0; key < len; key++) {
										if (!sparsed || types.has(obj, key)) {
											const value = obj[key];
											if (invert === !!items.call(thisObj, value, key, obj)) {
												return false;
											};
										};
									};
								};
							} else if (types._instanceof(obj, types.Set) || types._instanceof(obj, types.Map)) {
								for (const item of obj.entries()) {
									if (invert === !!items.call(thisObj, item[1], item[0], obj)) {
										return false;
									};
								};
							} else if (types.isIterable(obj)) {
								let key = 0;
								for (const val of obj) {
									if (invert === !!items.call(thisObj, val, key, obj)) {
										return false;
									};
									key++;
								};
							} else {
								let result = true;
								const loopKeys = function _loopKeys(keys) {
									const len = keys.length; // performance
									for (let i = 0; i < len; i++) {
										const key = keys[i];
										if (invert === !!items.call(thisObj, obj[key], key, obj)) {
											result = false;
											return true;
										};
									};
									return false;
								};
								if (!loopKeys(types.keys(obj))) {
									if (includeSymbols) {
										loopKeys(types.symbols(obj));
									};
								};
								return result;
							};
						} else {
							if (types.isArrayLike(obj)) {
								const len = obj.length;
								for (let key = 0; key < len; key++) {
									if (!sparsed || types.has(obj, key)) {
										const val = obj[key];
										if (invert === (tools.findItem(items, val, undefined, true, sparsed) !== null)) {
											return false;
										};
									};
								};
							} else if (types._instanceof(obj, types.Set) || types._instanceof(obj, types.Map)) {
								for (const item of obj.entries()) {
									if (invert === (tools.findItem(items, item[1], undefined, true, sparsed) !== null)) {
										return false;
									};
								};
							} else if (types.isIterable(obj)) {
								for (const val of obj) {
									if (invert === (tools.findItem(items, val, undefined, true, sparsed) !== null)) {
										return false;
									};
								};
							} else {
								let result = true;
								const loopKeys = function _loopKeys(keys) {
									const len = keys.length; // performance
									for (let i = 0; i < len; i++) {
										const key = keys[i];
										if (invert === (tools.findItem(items, obj[key], undefined, true, sparsed) !== null)) {
											result = false;
											return true;
										};
									};
									return false;
								};
								if (!loopKeys(types.keys(obj))) {
									if (includeSymbols) {
										loopKeys(types.symbols(obj));
									};
								};
								return result;
							};
						};
					};
					return true;
				}));

			tools.ADD('some', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 7,
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
							sparsed: {
								type: 'bool',
								optional: true,
								description: "When 'true', empty slots are ignored. When 'false', empty slots are included. Default is 'true'.",
							},
							includeSymbols: {
								type: 'bool',
								optional: false,
								description: "When 'true' and 'obj' is an object, will include symbols. Default is 'false'",
							},
						},
						returns: 'bool',
						description: "Returns 'true' when at least one item of an array (or an object) matches the filter. Returns 'false' otherwise.",
					}
				//! END_REPLACE()
				, function some(obj, items, /*optional*/thisObj, /*optional*/invert, /*optional*/includeFunctions, /*optional*/sparsed, /*optional*/includeSymbols) {
					if (!types.isNothing(obj)) {
						obj = _shared.Natives.windowObject(obj);
						invert = !!invert;
						if (types.isNothing(sparsed)) {
							sparsed = true;
						};
						if (!includeFunctions && types.isFunction(items)) {
							if (types.isArrayLike(obj)) {
								if (_shared.Natives.arraySomeCall && !invert && !sparsed) {
									// JS 1.6
									return _shared.Natives.arraySomeCall(obj, items, thisObj);
								} else {
									obj = _shared.Natives.windowObject(obj);
									const len = obj.length;
									for (let key = 0; key < len; key++) {
										if (!sparsed || types.has(obj, key)) {
											const val = obj[key];
											if (invert === !items.call(thisObj, val, key, obj)) {
												return true;
											};
										};
									};
								};
							} else if (types._instanceof(obj, types.Set) || types._instanceof(obj, types.Map)) {
								for (const item of obj.entries()) {
									if (invert === !items.call(thisObj, item[1], item[0], obj)) {
										return true;
									};
								};
							} else if (types.isIterable(obj)) {
								let key = 0;
								for (const val of obj) {
									if (invert === !items.call(thisObj, val, key, obj)) {
										return true;
									};
									key++;
								};
							} else {
								let result = false;
								const loopKeys = function _loopKeys(keys) {
									const len = keys.length; // performance
									for (let i = 0; i < len; i++) {
										const key = keys[i];
										const val = obj[key];
										if (invert === !items.call(thisObj, val, key, obj)) {
											result = true;
											return true;
										};
									};
									return false;
								};
								if (!loopKeys(types.keys(obj))) {
									if (includeSymbols) {
										loopKeys(types.symbols(obj));
									};
								};
								return result;
							};
						} else {
							if (types.isArrayLike(obj)) {
								const len = obj.length;
								for (let key = 0; key < len; key++) {
									if (!sparsed || types.has(obj, key)) {
										const val = obj[key];
										if (invert === (tools.findItem(items, val, undefined, true, sparsed) === null)) {
											return true;
										};
									};
								};
							} else if (types._instanceof(obj, types.Set) || types._instanceof(obj, types.Map)) {
								for (const item of obj.entries()) {
									if (invert === (tools.findItem(items, item[1], undefined, true, sparsed) === null)) {
										return true;
									};
								};
							} else if (types.isIterable(obj)) {
								for (const val of obj) {
									if (invert === (tools.findItem(items, val, undefined, true, sparsed) === null)) {
										return true;
									};
								};
							} else {
								let result = false;
								const loopKeys = function _loopKeys(keys) {
									const len = keys.length; // performance
									for (let i = 0; i < len; i++) {
										const key = keys[i];
										const val = obj[key];
										if (invert === (tools.findItem(items, val, undefined, true, sparsed) === null)) {
											result = true;
											return true;
										};
									};
									return false;
								};
								if (!loopKeys(types.keys(obj))) {
									if (includeSymbols) {
										loopKeys(types.symbols(obj));
									};
								};
								return result;
							};
						};
					};
					return false;
				}));

			tools.ADD('reduce', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 4,
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
							sparsed: {
								type: 'bool',
								optional: true,
								description: "When 'true', empty slots are ignored. When 'false', empty slots are included. Default is 'true'.",
							},
							includeSymbols: {
								type: 'bool',
								optional: false,
								description: "When 'true' and 'obj' is an object, will include symbols. Default is 'false'",
							},
						},
						returns: 'any',
						description: "Reduces every items of an array (or object) to a single value.",
					}
				//! END_REPLACE()
				, function reduce(obj, fn, /*optional*/initialValue, /*optional*/thisObj, /*optional*/sparsed, /*optional*/includeSymbols) {
					root.DD_ASSERT && root.DD_ASSERT(types.isFunction(fn), "Invalid function.");

					if (types.isNothing(obj)) {
						return initialValue;
					} else {
						if (types.isNothing(sparsed)) {
							sparsed = true;
						};
						if (_shared.Natives.arrayReduceCall && types.isArrayLike(obj) && types.isNothing(thisObj) && !sparsed) {
							// JS 1.8
							if (arguments.length > 2) {
								return _shared.Natives.arrayReduceCall(obj, fn, initialValue);
							} else {
								return _shared.Natives.arrayReduceCall(obj, fn);
							}
						} else {
							obj = _shared.Natives.windowObject(obj);
							let result,
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
							}, null, sparsed);
							if (!hasInitial) {
								throw new types.ValueError("Reduce of empty object with no initial value.");
							};
							return result;
						}
					}
				}));

			tools.ADD('reduceRight', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 2,
						params: {
							obj: {
								type: 'arraylike',
								optional: false,
								description: "An array to reduce.",
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
							sparsed: {
								type: 'bool',
								optional: true,
								description: "When 'true', empty slots are ignored. When 'false', empty slots are included. Default is 'true'.",
							},
						},
						returns: 'any',
						description: "Reduces every items of an array (or object) to a single value, starting from the last item.",
					}
				//! END_REPLACE()
				, function reduceRight(obj, fn, /*optional*/initialValue, /*optional*/thisObj, /*optional*/sparsed) {
					root.DD_ASSERT && root.DD_ASSERT(types.isFunction(fn), "Invalid function.");

					if (!types.isArrayLike(obj)) {
						return initialValue;
					} else {
						if (types.isNothing(sparsed)) {
							sparsed = true;
						};
						if (_shared.Natives.arrayReduceRightCall && types.isNothing(thisObj) && !sparsed) {
							// JS 1.8
							if (arguments.length > 2) {
								return _shared.Natives.arrayReduceRightCall(obj, fn, initialValue);
							} else {
								return _shared.Natives.arrayReduceRightCall(obj, fn);
							}
						} else {
							obj = _shared.Natives.windowObject(obj);
							let value = initialValue,
								hasItem = false,
								key = obj.length - 1;
							for (; key >= 0; key--) {
								if (!sparsed || types.has(obj, key)) {
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
								throw new types.ValueError("Reduce of empty array with no initial value.");
							};
							for (; key >= 0; key--) {
								if (!sparsed || types.has(obj, key)) {
									value = fn(value, obj[key], key, obj);
								};
							};
							return value;
						}
					}
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

			tools.ADD('round', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 1,
						params: {
							number: {
								type: 'number',
								optional: false,
								description: "Number to round.",
							},
							precision: {
								type: 'integer',
								optional: true,
								description: "Decimal precision. Default is 0.",
							},
						},
						returns: 'number',
						description: "Rounds a number with the specified precision.",
					}
				//! END_REPLACE()
				, function round(number, /*optional*/precision) {
					const MUL = _shared.Natives.mathPow(10, precision | 0);
					return _shared.Natives.mathRound((+number) * MUL) / MUL;
				}));

			tools.ADD('floor', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 1,
						params: {
							number: {
								type: 'number',
								optional: false,
								description: "Number to round.",
							},
							precision: {
								type: 'integer',
								optional: true,
								description: "Decimal precision. Default is 0.",
							},
						},
						returns: 'number',
						description: "Floors a number with the specified precision.",
					}
				//! END_REPLACE()
				, function floor(number, /*optional*/precision) {
					const MUL = _shared.Natives.mathPow(10, precision | 0);
					return _shared.Natives.mathFloor((+number) * MUL) / MUL;
				}));


			//===================================
			// Escape functions
			//===================================

			tools.ADD('prepareMappingForEscape', function(mapping, /*optional*/prefix, /*optional*/suffix) {
				const reserved = types.keys(mapping);

				reserved.sort(function(v1, v2) {
					if (v1.length > v2.length) {
						return -1;
					} else if (v1.length < v2.length) {
						return 1;
					} else {
						return 0;
					};
				});

				types.freezeObject(reserved);

				const substitutions = tools.map(reserved, function(key) {
					return (prefix || '') + mapping[key] + (suffix || '');
				});

				types.freezeObject(substitutions);

				return types.freezeObject([reserved, substitutions]);
			});

			tools.ADD('escape', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 1,
						params: {
							text: {
								type: 'string',
								optional: false,
								description: "Text to escape",
							},
							reserved: {
								type: 'arrayof(string)',
								optional: false,
								description: "Reserved characters to substitute, sorted by their length descendent.",
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
						root.DD_ASSERT(types.isNothing(reserved) || types.isArray(reserved), "Invalid reserved characters array.");
						root.DD_ASSERT(types.isNothing(substitutions) || types.isArray(substitutions), "Invalid reserved characters array.");
						if (reserved) {
							root.DD_ASSERT(substitutions && (reserved.length === substitutions.length), "Reserved characters substitutions length mismatch.");
						};
					};
					if (!text || !reserved) {
						return text;
					};
					const textLen = text.length,
						reservedLen = reserved.length,
						maxInt = root.DD_ASSERT && types.getSafeIntegerBounds().max;
					let result = '',
						lastPos = 0;
					for (let i = 0; i < textLen; ) {
						let found = false,
							prevResLen = maxInt;
						for (let j = 0; j < reservedLen; j++) {
							const reservedChr = reserved[j],
								reservedChrLen = reservedChr.length;
							if (root.DD_ASSERT) {
								root.DD_ASSERT(reservedChrLen <= prevResLen, "Reserved characters must be sorted by length, in descending order.");
								prevResLen = reservedChrLen;
							};
							const chr = text.slice(i, i + reservedChrLen);
							if (chr === reservedChr) {
								result += text.slice(lastPos, i) + substitutions[j];
								i += reservedChrLen;
								lastPos = i;
								found = true;
								break;
							}
						};
						if (!found) {
							i++;
						};
					};
					if (lastPos === 0) {
						result = text;
					} else {
						result += text.slice(lastPos);
					};
					return result;
				}));


			__Internal__.regExMapping = tools.prepareMappingForEscape(tools.nullObject({
				'\\': '\\\\',
				'^': '\\^',
				'$': '\\$',
				'*': '\\*',
				'+': '\\+',
				'?': '\\?',
				'(': '\\(',
				')': '\\)',
				'|': '\\|',
				'{': '\\{',
				'}': '\\}',
				'[': '\\[',
				']': '\\]',
				'.': '\\.',
			}));

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
					return tools.escape(text, __Internal__.regExMapping[0], __Internal__.regExMapping[1]);
				})));
		},
	};
	return modules;
};

//! END_MODULE()
