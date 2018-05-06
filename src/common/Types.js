//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
	// doodad-js - Object-oriented programming framework
	// File: Types.js - Types management
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
	modules['Doodad.Types'] = {
		version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
		bootstrap: true,

		create: function create(root, /*optional*/_options, _shared) {
			//===================================
			// Get namespaces
			//===================================

			const doodad = root.Doodad,  // pre-defined from Bootstrap.js
				types = doodad.Types,  // pre-defined from Bootstrap.js
				tools = doodad.Tools;  // pre-defined from Bootstrap.js

			//===================================
			// Internal
			//===================================

			const __Internal__ = {
			};

			//===================================
			// Options
			//===================================

			//const __options__ = tools.nullObject({
			//}, _options);

			//types.freezeObject(__options__);

			//types.ADD('getOptions', function getOptions() {
			//	return __options__;
			//});

			//===================================
			// Native functions
			//===================================

			// NOTE: Store everything because third-parties can override them.

			tools.complete(_shared.Natives, {
				// No polyfills

				// "toArray"
				windowArrayApply: global.Array.apply.bind(global.Array),

				// "clone", "toArray"
				arraySliceCall: global.Array.prototype.slice.call.bind(global.Array.prototype.slice),

				// "popAt", "popItem", "popItems"
				arraySpliceCall: global.Array.prototype.splice.call.bind(global.Array.prototype.splice),

				// "prepend"
				arrayUnshiftApply: global.Array.prototype.unshift.apply.bind(global.Array.prototype.unshift),

				objectToStringCall: global.Object.prototype.toString.call.bind(global.Object.prototype.toString),

				windowObject: global.Object,

				// "toString"
				//windowString: global.String,

				// "isObjectLikeAndNotEmpty", "hasIndex"
				windowNumber: global.Number,

				// "keysInherited", "symbolsInherited"
				objectPrototype: global.Object.prototype,

				// "isArrowFunction", "isAsyncFunction"
				functionToStringCall: global.Function.prototype.toString.call.bind(global.Function.prototype.toString),

				//// "hasProxies", "hasProxyEnabled", "createProxy"
				//windowProxy: global.Proxy,

				// "values"
				objectValues: (types.isFunction(global.Object.values) ? global.Object.values : null),

				// "entries"
				objectEntries: (types.isFunction(global.Object.entries) ? global.Object.entries : null),

				// "toArray"
				arrayFrom: global.Array.from,
			});

			//===================================
			// Conversion
			//===================================

			__Internal__.returnUndefined = function() {
				return undefined;
			};
			__Internal__.returnUndefinedString = function() {
				return 'undefined';
			};
			__Internal__.returnNull = function() {
				return null;
			};
			__Internal__.returnNullString = function() {
				return 'null';
			};

			types.ADD('Undefined', function Undefined() {});
			tools.extend(types.Undefined.prototype, {
				valueOf: __Internal__.returnUndefined,
				toString: __Internal__.returnUndefinedString,
				toSource: __Internal__.returnUndefinedString,
			});

			types.ADD('Null', function Null() {});
			tools.extend(types.Null.prototype, {
				valueOf: __Internal__.returnNull,
				toString: __Internal__.returnNullString,
				toSource: __Internal__.returnNullString,
			});

			types.ADD('toObject', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 1,
						params: {
							obj: {
								type: 'any',
								optional: false,
								description: "A value to convert.",
							},
						},
						returns: 'object',
						description: "Converts any value to its object equivalent.",
					}
				//! END_REPLACE()
				, function(val) {
					if (val === undefined) {
						return new types.Undefined();
					} else if (val === null) {
						return new types.Null();
					} else {
						return _shared.Natives.windowObject(val);
					}
				}));

			types.ADD('toArray', _shared.Natives.arrayFrom);

			//===================================
			// Shared Symbols
			//===================================

			_shared.NameSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_NAME')), true) */ '__NAME__' /*! END_REPLACE() */, true);


			//===================================
			// ES6 Arrow functions support
			//===================================

			__Internal__.hasArrows = false;
			try {
				tools.eval("a => a");
				__Internal__.hasArrows = true;
			} catch(ex) {
				// Do nothing
			};

			types.ADD('hasArrows', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'bool',
						description: "Returns 'true' if the Javascript engine has ES6 arrow functions, 'false' otherwise.",
					}
				//! END_REPLACE()
				, function hasArrows() {
					return __Internal__.hasArrows;
				}));

			types.ADD('isArrowFunction', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 2,
						params: {
							obj: {
								type: 'any',
								optional: false,
								description: "An object to test for.",
							},
						},
						returns: 'bool',
						description: "Returns 'true' if object is an arrow function, 'false' otherwise.",
					}
				//! END_REPLACE()
				, __Internal__.hasArrows ? function isArrowFunction(obj) {
					if (types.isFunction(obj)) {
						const str = _shared.Natives.functionToStringCall(obj);
						return /^(async[ ]*)?[(]?[^)]*[)]?[ ]*[=][>]/.test(str);
					};
					return false;
				} : function isArrowFunction(obj) {
					return false;
				}));

			//===================================
			// ES7 async/await
			//===================================

			__Internal__.hasAsyncAwait = false;
			//__Internal__.hasAsyncAwaitBug = false;
			try {
				tools.eval("async function test() {}");
				__Internal__.hasAsyncAwait = true;

				// No need to test for it: It will never change.
				//// <PRB> Once again, ES specs are wrong because we SHOULD reuse Thenables instead of coercing them to an ES6 native Promise.
				//tools.eval(
				//	"(async function() {return {then: (res, rej) => {" +
				//		"ctx.Internal.hasAsyncAwaitBug = true;" +
				//		"res(1);" +
				//	"}}})()"
				//, {Internal: __Internal__});

			} catch(ex) {
				// Do nothing
			};

			types.ADD('hasAsyncAwait', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 2,
						params: null,
						returns: 'bool',
						description: "Returns 'true' if the Javascript engine has ES6 async/await support, 'false' otherwise.",
					}
				//! END_REPLACE()
				, (__Internal__.hasAsyncAwait /*&& !__Internal__.hasAsyncAwaitBug*/ ? function hasAsyncAwait() {
					return true;
				} : function hasAsyncAwait() {
					return false;
				})));

			types.ADD('isAsyncFunction', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 0,
						params: {
							obj: {
								type: 'any',
								optional: false,
								description: "An object to test for.",
							},
						},
						returns: 'bool',
						description: "Returns 'true' if object is an async function, 'false' otherwise.",
					}
				//! END_REPLACE()
				, __Internal__.hasAsyncAwait ? function isAsyncFunction(obj) {
					if (types.isFunction(obj)) {
						const str = _shared.Natives.functionToStringCall(obj);
						return /^(async function(\s*[(]|\s+[^\s()]*[(])|async(\s*[(][^()=]*[)]|\s+[(]?[^ ()=]+[)]?)\s*[=][>])/.test(str);
					};
					return false;
				} : function isAsyncFunction(obj) {
					return false;
				}));

			//===================================
			// ES6 Proxy
			//===================================
			/*	NOT USED
			types.ADD('hasProxies', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
				{
							author: "Claude Petit",
							revision: 0,
							params: null,
							returns: 'bool',
							description: "Returns 'true' when ES6 Proxy is available. Returns 'false' otherwise.",
				}
				//! END_REPLACE()
				, (_shared.Natives.windowProxy ? (function hasProxies() {
					return true;
				}) : (function hasProxies() {
					return false;
				}))));

	/ * AS USUAL, NO DETECTION AVAILABLE !!! AND WORSE, THIS TIME THERE IS NO WAY AT ALL TO IMPLEMENT ONE
			types.ADD('isProxy', (_shared.Natives.windowProxy ? (function isProxy(obj) {
				return (obj instanceof _shared.Natives.windowProxy);
			}) : (function isProxy(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				obj = _shared.Natives.windowObject(obj);
				return !!obj.__isProxy__;
			})));
*/

			//===================================
			// Bindable
			//===================================

			_shared.BoundObjectSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_BOUND_OBJECT')), true) */ '__BOUND_OBJECT__' /*! END_REPLACE() */, true);

			// Test for my dream to realize !
			__Internal__.arrowIsBindable = false;
			try {
				__Internal__.arrowIsBindable = (tools.eval("() => this.doodad").bind({doodad: 1})() === 1);
			} catch(ex) {
				// Do nothing
			};

			types.ADD('isBindable', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 1,
						params: {
							obj: {
								type: 'any',
								optional: false,
								description: "An object to test for.",
							},
						},
						returns: 'bool',
						description: "Returns 'true' if object is a bindable function, 'false' otherwise.",
					}
				//! END_REPLACE()
				, function isBindable(obj) {
					// NOTE: Native functions may or may not be bindable and there is no way to know it !!!
					return types.isCustomFunction(obj) && !types.has(obj, _shared.BoundObjectSymbol) && (__Internal__.arrowIsBindable || !types.isArrowFunction(obj));
				}));

			//===================================
			// is*
			//===================================

			types.ADD('isArrayAndNotEmpty', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 1,
						params: {
							obj: {
								type: 'any',
								optional: false,
								description: "An object to test for.",
							},
						},
						returns: 'bool',
						description: "Returns 'true' when the object is an array and is not empty. Returns 'false' otherwise.",
					}
				//! END_REPLACE()
				, function isArrayAndNotEmpty(obj) {
					if (types.isArray(obj)) {
						const len = obj.length;
						for (let key = 0; key < len; key++) {
							if (types.has(obj, key)) {
								return true;
							};
						};
					};
					return false;
				}));

			types.ADD('isArrayLikeAndNotEmpty', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 1,
						params: {
							obj: {
								type: 'any',
								optional: false,
								description: "An object to test for.",
							},
						},
						returns: 'bool',
						description: "Returns 'true' when the object is an array-like object and is not empty. Returns 'false' otherwise.",
					}
				//! END_REPLACE()
				, function isArrayLikeAndNotEmpty(obj) {
					if (types.isArrayLike(obj)) {
						obj = _shared.Natives.windowObject(obj);
						const len = obj.length;
						for (let key = 0; key < len; key++) {
							if (types.has(obj, key)) {
								return true;
							};
						};
					};
					return false;
				}));

			types.ADD('isNothingOrEmpty', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 2,
						params: {
							obj: {
								type: 'any',
								optional: false,
								description: "An object to test for.",
							},
						},
						returns: 'bool',
						description: "Returns 'true' when the object is nothing (is 'undefined' or 'null') or empty (has no own properties or is an empty native string). Returns 'false' otherwise.",
					}
				//! END_REPLACE()
				, function isNothingOrEmpty(obj) {
					if (types.isNothing(obj)) {
						return true;
					} else if (typeof obj === 'string') {
						return !obj;
					} else if (types.isArrayLike(obj)) {
						obj = _shared.Natives.windowObject(obj);
						const len = obj.length;
						for (let key = 0; key < len; key++) {
							if (types.has(obj, key)) {
								return false;
							};
						};
						return true;
					};
					if (types.isObjectLike(obj)) {
						obj = _shared.Natives.windowObject(obj);
						for (const key in obj) {
							if (types.has(obj, key)) {
								return false;
							};
						};
						if (types.symbols(obj).length) {
							return false;
						};
						return true;
					} else {
						return false;
					}
				}));

			types.ADD('isEmpty', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 2,
						params: {
							obj: {
								type: 'any',
								optional: false,
								description: "An object to test for.",
							},
						},
						returns: 'bool',
						description: "Returns 'true' when the object is empty (has no own properties or is an empty native string). Returns 'false' otherwise.",
					}
				//! END_REPLACE()
				, function isEmpty(obj) {
					if (typeof obj === 'string') {
						return !obj;
					} else if (types.isArrayLike(obj)) {
						obj = _shared.Natives.windowObject(obj);
						const len = obj.length;
						for (let key = 0; key < len; key++) {
							if (types.has(obj, key)) {
								return false;
							};
						};
					};
					if (types.isObjectLike(obj)) {
						obj = _shared.Natives.windowObject(obj);
						for (const key in obj) {
							if (types.has(obj, key)) {
								return false;
							};
						};
						if (types.symbols(obj).length) {
							return false;
						};
						return true;
					} else {
						return false;
					}
				}));

			types.ADD('isStringAndNotEmpty', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 0,
						params: {
							obj: {
								type: 'any',
								optional: false,
								description: "An object to test for.",
							},
						},
						returns: 'bool',
						description: "Returns 'true' when the object is a non-empty string. Returns 'false' otherwise.",
					}
				//! END_REPLACE()
				, function isStringAndNotEmpty(obj) {
					return types.isString(obj) && !!obj.length;
				}));

			types.ADD('isStringAndNotEmptyTrim', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 1,
						params: {
							obj: {
								type: 'any',
								optional: false,
								description: "An object to test for.",
							},
						},
						returns: 'bool',
						description: "Returns 'true' when the object is a non-empty string when trimmed (spaces removed). Returns 'false' otherwise.",
					}
				//! END_REPLACE()
				, function isStringAndNotEmptyTrim(obj) {
					return types.isString(obj) && !!tools.trim(obj).length;
				}));

			types.ADD('isObjectAndNotEmpty', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 2,
						params: {
							obj: {
								type: 'any',
								optional: false,
								description: "An object to test for.",
							},
						},
						returns: 'bool',
						description: "Returns 'true' when the value is a non-empty object (has own properties). Returns 'false' otherwise.",
					}
				//! END_REPLACE()
				, function isObjectAndNotEmpty(obj) {
					if (types.isObject(obj)) {
						for (const key in obj) {
							if (types.has(obj, key)) {
								return true;
							};
						};
						if (types.symbols(obj).length) {
							return true;
						};
					};
					return false;
				}));

			types.ADD('isObjectLikeAndNotEmpty', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 0,
						params: {
							obj: {
								type: 'any',
								optional: false,
								description: "An object to test for.",
							},
						},
						returns: 'bool',
						description: "Returns 'true' when the value is like a non-empty object (has own properties). Returns 'false' otherwise.",
					}
				//! END_REPLACE()
				, function isObjectLikeAndNotEmpty(obj) {
					/* eslint guard-for-in: "off" */ // It's all ok, thanks
					if (types.isObjectLike(obj)) {
						obj = _shared.Natives.windowObject(obj);
						if (types.isArrayLike(obj)) {
							for (const key in obj) {
								const number = _shared.Natives.windowNumber(key);
								if ((types.isNaN(number) || !types.isFinite(number)) && types.has(obj, key)) {
									return true;
								};
							};
						} else {
							for (const key in obj) {
								if (types.has(obj, key)) {
									return true;
								};
							};
							if (types.symbols(obj).length) {
								return true;
							};
						};
					};
					return false;
				}));

			//=======================================================
			// Objects
			//=======================================================

			types.ADD('gets', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 2,
						params: {
							obj: {
								type: 'object',
								optional: false,
								description: "An object.",
							},
							keys: {
								type: 'arrayof(string,symbol),string,symbol',
								optional: false,
								description: "Attribute names.",
							},
							_defaults: {
								type: 'objectof(any)',
								optional: true,
								description: "Default values.",
							},
							inherited: {
								type: 'bool',
								optional: true,
								description: "When 'true', the function look at inherited own properties. Default is 'false'.",
							},
						},
						returns: 'objectof(any)',
						description: "Returns an object with the value of each named own property. When an own property doesn't exist, gets its value from the '_defaults' parameter.",
					}
				//! END_REPLACE()
				, function gets(obj, keys, /*optional*/_defaults, /*optional*/inherited) {
					if (types.isNothing(keys)) {
						keys = [];
					};
					const result = {};
					obj = _shared.Natives.windowObject(obj);
					if (!types.isArray(keys)) {
						keys = [keys];
					};
					const keysLen = keys.length,
						hasKey = (inherited ? types.hasInherited : types.has);
					for (let i = 0; i < keysLen; i++) {
						if (types.has(keys, i)) {
							const key = keys[i];
							if (obj && hasKey(obj, key)) {
								result[key] = obj[key];
							} else if (_defaults && types.has(_defaults, key)) {
								result[key] = _defaults[key];
							};
						};
					};
					return result;
				}));

			types.ADD('set', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 1,
						params: {
							obj: {
								type: 'object',
								optional: false,
								description: "An object.",
							},
							key: {
								type: 'string,symbol',
								optional: false,
								description: "Attribute name.",
							},
							value: {
								type: 'any',
								optional: false,
								description: "Attribute's new value.",
							},
							inherited: {
								type: 'bool',
								optional: true,
								description: "When 'true', the function look at inherited own properties. Default is 'false'.",
							},
						},
						returns: 'any',
						description: "Sets the value of an own property and returns that value. When this own property doesn't exist, it only returns 'undefined'.",
					}
				//! END_REPLACE()
				, function set(obj, key, value, /*optional*/inherited) {
					/* eslint consistent-return: "off", no-return-assign: "off" */
					if (types.isNothing(obj)) {
						return;
					};
					obj = _shared.Natives.windowObject(obj);
					const hasKey = (inherited ? types.hasInherited : types.has);
					if (hasKey(obj, key)) {
						return obj[key] = value;
					};
				}));

			types.ADD('sets', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 1,
						params: {
							obj: {
								type: 'object',
								optional: false,
								description: "An object.",
							},
							values: {
								type: 'objectof(any)',
								optional: false,
								description: "Values.",
							},
							inherited: {
								type: 'bool',
								optional: true,
								description: "When 'true', the function look at inherited own properties. Default is 'false'.",
							},
						},
						returns: 'objectof(any)',
						description: "Sets the value of each provided own property and returns these values. When an own property doesn't exist, does nothing.",
					}
				//! END_REPLACE()
				, function sets(obj, values, /*optional*/inherited) {
					const result = {};
					if (types.isNothing(obj)) {
						return result;
					};
					obj = _shared.Natives.windowObject(obj);
					const keys = tools.append(types.keys(values), types.symbols(values)),
						keysLen = keys.length,
						hasKey = (inherited ? types.hasInherited : types.has);
					for (let i = 0; i < keysLen; i++) {
						const key = keys[i];
						if (hasKey(obj, key)) {
							const val = values[key];
							obj[key] = val;
							result[key] = val;
						};
					};
					return result;
				}));

			types.ADD('getsDefault', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 3,
						params: {
							obj: {
								type: 'object',
								optional: false,
								description: "An object.",
							},
							keys: {
								type: 'arrayof(string,symbol),string,symbol',
								optional: false,
								description: "Attribute names.",
							},
							_defaults: {
								type: 'objectof(any)',
								optional: true,
								description: "Default values.",
							},
							inherited: {
								type: 'bool',
								optional: true,
								description: "When 'true', the function look at inherited own properties. Default is 'false'.",
							},
						},
						returns: 'objectof(any)',
						description: "Returns an object with the value of each named own property. When an own property doesn't exist, creates that own property using the value from the '_defaults' parameter.",
					}
				//! END_REPLACE()
				, function getsDefault(obj, keys, /*optional*/_defaults, /*optional*/inherited) {
					if (types.isNothing(keys)) {
						keys = [];
					};
					const result = {};
					obj = _shared.Natives.windowObject(obj);
					if (!types.isArray(keys)) {
						keys = [keys];
					};
					const keysLen = keys.length,
						hasKey = (inherited ? types.hasInherited : types.has);
					for (let i = 0; i < keysLen; i++) {
						if (types.has(keys, i)) {
							const key = keys[i];
							if (obj && hasKey(obj, key)) {
								result[key] = obj[key];
							} else if (types.has(_defaults, key)) {
								const val = _defaults[key];
								if (obj) {
									obj[key] = val;
									result[key] = val;
								};
							};
						};
					};
					return result;
				}));

			types.ADD('keysInherited', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 3,
						params: {
							obj: {
								type: 'any',
								optional: false,
								description: "An object.",
							},
						},
						returns: 'arrayof(string)',
						description: "Returns an array of enumerable owned property names and inherited property names of an object. For array-like objects, index properties are excluded.",
					}
				//! END_REPLACE()
				, function keysInherited(obj) {
					if (types.isNothing(obj)) {
						return [];
					};
					obj = _shared.Natives.windowObject(obj);
					if (obj === _shared.Natives.objectPrototype) {
						return [];
					};
					return tools.unique(types.keys(obj), types.keysInherited(types.getPrototypeOf(obj)));
				}));

			types.ADD('symbolsInherited', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 1,
						params: {
							obj: {
								type: 'any',
								optional: false,
								description: "An object.",
							},
						},
						returns: 'arrayof(symbol)',
						description: "Returns an array of enumerable owned property symbols and inherited property symbols of an object. For array-like objects, index properties are excluded.",
					}
				//! END_REPLACE()
				, function symbolsInherited(obj) {
					if (types.isNothing(obj)) {
						return [];
					};
					obj = _shared.Natives.windowObject(obj);
					if (obj === _shared.Natives.objectPrototype) {
						return [];
					};
					return tools.unique(types.symbols(obj), types.symbolsInherited(types.getPrototypeOf(obj)));
				}));

			//========================================
			// Arrays
			//========================================

			types.ADD('hasIndex', root.DD_DOC(
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
							indexes: {
								type: 'arrayof(integer)',
								optional: false,
							},
						},
						returns: 'bool',
						description: "Returns 'true' when the array has a value (non-empty slot) among specified array indexes.",
					}
				//! END_REPLACE()
				, function hasIndex(obj, indexes) {
					if (types.isArrayLike(obj)) {
						obj = _shared.Natives.windowObject(obj);
						if (!types.isArray(indexes)) {
							indexes = [indexes];
						};
						const len = indexes.length;
						if (!len) {
							return false;
						};
						for (let i = 0; i < len; i++) {
							if (types.has(indexes, i)) {
								const index = indexes[i],
									number = _shared.Natives.windowNumber(index);
								if (types.isNaN(number) || !types.isFinite(number) || !types.has(obj, index)) {
									return false;
								};
							};
						};
						return true;
					} else {
						return false;
					}
				}));

			types.ADD('indexes', root.DD_DOC(
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
						returns: 'arrayof(integer)',
						description: "Returns every array indexes where there is a value (non-empty slot).",
					}
				//! END_REPLACE()
				, function indexes(obj) {
					const result = [];
					if (types.isArrayLike(obj)) {
						obj = _shared.Natives.windowObject(obj);
						const len = obj.length;
						for (let key = 0; key < len; key++) {
							if (types.has(obj, key)) {
								result.push(key);
							};
						};
					};
					return result;
				}));

			types.ADD('values', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 3,
						params: {
							obj: {
								type: 'object,arraylike',
								optional: false,
								description: "An object or an array-like object.",
							},
						},
						returns: 'arrayof(any)',
						description: "Returns the values of an array-like object, or the values of the owned properties of an object.",
					}
				//! END_REPLACE()
				, function values(obj) {
					if (!types.isNothing(obj)) {
						obj = _shared.Natives.windowObject(obj);
						if (types.isArrayLike(obj)) {
							const result = [];
							const keys = types.keys(obj),
								len = keys.length; // performance
							for (let i = 0; i < len; i++) {
								result.push(obj[keys[i]]);
							};
							return result;
						} else if (_shared.Natives.objectValues) {
							return _shared.Natives.objectValues(obj);
						} else {
							const result = [];
							const keys = types.keys(obj),
								len = keys.length; // performance
							for (let i = 0; i < len; i++) {
								const key = keys[i];
								result.push(obj[key]);
							};
							return result;
						}
					};
					return [];
				}));

			types.ADD('entries', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 3,
						params: {
							obj: {
								type: 'any',
								optional: false,
								description: "An object.",
							},
						},
						returns: 'arrayof(array)',
						description: "Returns key-value pairs of the owned properties of an object. Also includes indexes of array-like objects.",
					}
				//! END_REPLACE()
				, function entries(obj) {
					if (!types.isNothing(obj)) {
						obj = _shared.Natives.windowObject(obj);
						if (_shared.Natives.objectEntries) {
							return _shared.Natives.objectEntries(obj);
						} else {
							const result = [];
							for (const key in obj) {
								if (types.has(obj, key)) {
									result.push([key, obj[key]]);
								};
							};
							return result;
						}
					};
					return [];
				}));

			types.ADD('items', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 3,
						params: {
							obj: {
								type: 'object,arraylike',
								optional: false,
								description: "An object or an array-like object.",
							},
						},
						returns: 'arrayof(array)',
						description: "Returns the indexes and the values of an array-like object, or the names and values of the owned properties of an object.",
					}
				//! END_REPLACE()
				, function items(obj) {
					if (types.isNothing(obj)) {
						return [];
					} else {
						obj = _shared.Natives.windowObject(obj);
						if (types.isArrayLike(obj)) {
							const result = [];
							const len = obj.length;
							for (let key = 0; key < len; key++) {
								if (types.has(obj, key)) {
									result.push([key, obj[key]]);
								};
							};
							return result;
						} else {
							return types.entries(obj);
						}
					}
				}));

			types.ADD('available', root.DD_DOC(
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
						description: "Returns the first available array index (the index of the first empty slot).",
					}
				//! END_REPLACE()
				, function available(obj) {
					if (types.isArrayLike(obj)) {
						obj = _shared.Natives.windowObject(obj);
						const len = obj.length;
						for (let key = 0; key < len; key++) {
							if (!types.has(obj, key)) {
								return key;
							};
						};
					};
					return -1;
				}));

			types.ADD('availables', root.DD_DOC(
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
						returns: 'arrayof(integer)',
						description: "Returns all available array indexes (the indexes of every empty slots).",
					}
				//! END_REPLACE()
				, function availables(obj) {
					const keys = [];
					if (types.isArrayLike(obj)) {
						obj = _shared.Natives.windowObject(obj);
						const len = obj.length;
						for (let key = 0; key < len; key++) {
							if (!types.has(obj, key)) {
								keys.push(key);
							};
						};
					};
					return keys;
				}));

			//===================================
			// Make inside
			//===================================

			// NOTE: Will be replaced by "Doodad.js"
			_shared.makeInside = function makeInside(/*optional*/obj, fn) {
				fn = types.unbind(fn) || fn;
				root.DD_ASSERT && root.DD_ASSERT(types.isBindable(fn), "Invalid function.");
				return (types.isNothing(obj) ? fn : types.bind(obj, fn));
			};


			//===================================
			// Init
			//===================================
			//return function init(/*optional*/options) {
			//};
		},
	};
	return modules;
};

//! END_MODULE()
