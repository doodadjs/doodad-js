//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2017 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Types.js - Types management
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
		DD_MODULES['Doodad.Types'] = {
			version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
			bootstrap: true,
			
			create: function create(root, /*optional*/_options, _shared) {
				"use strict";

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
					
				const __options__ = types.nullObject({
					toSourceItemsCount: 255,		// Max number of items
				}, _options);

				__options__.toSourceItemsCount = types.toInteger(__options__.toSourceItemsCount);

				types.freezeObject(__options__);

				types.ADD('getOptions', function getOptions() {
					return __options__;
				});

				//===================================
				// Native functions
				//===================================
					
				// NOTE: Makes use of "isNativeFunction" to get rid of third-parties injections as possible.
				// NOTE: Store everything because third-parties can override them.
				
				types.complete(_shared.Natives, {
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
					//windowProxy: (types.isNativeFunction(global.Proxy) ? global.Proxy : undefined),

					// "values"
					objectValues: (types.isNativeFunction(global.Object.values) ? global.Object.values : undefined),
					
					// "entries"
					objectEntries: (types.isNativeFunction(global.Object.entries) ? global.Object.entries : undefined),
					
					// "toArray"
					arrayFrom: ((global.Array && types.isNativeFunction(Array.from)) ? global.Array.from : undefined),
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
				types.extend(types.Undefined.prototype, {
					valueOf: __Internal__.returnUndefined,
					toString: __Internal__.returnUndefinedString,
					toSource: __Internal__.returnUndefinedString,
				});

				types.ADD('Null', function Null() {});
				types.extend(types.Null.prototype, {
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
						};
					}));
				
				types.ADD('toArray', (_shared.Natives.arrayFrom || root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 3,
								params: {
									obj: {
										type: 'string,array,arraylike',
										optional: false,
										description: "A value to convert.",
									},
									mapFn: {
										type: 'function',
										optional: true,
										description: "A transform function.",
									},
									thisObj: {
										type: 'any',
										optional: true,
										description: "When 'mapFn' is specified, specifies 'this'. Default is 'undefined'.",
									},
								},
								returns: 'array',
								description: "Converts a value to an array.",
					}
					//! END_REPLACE()
					, function toArray(obj, /*optional*/mapFn, /*optional*/thisObj) {
						if (types.isNothing(obj)) {
							throw new types.TypeError("can't convert " + ((obj === null) ? 'null' : 'undefined') + " to object");
						};
						obj = _shared.Natives.windowObject(obj);
						let result,
							fill = false;
						if (types.isString(obj)) {
							result = _shared.Natives.arraySliceCall(obj);
						} else { //if (types.isArrayLike(obj)) {
							if (obj.length === 1) {
								// <PRB> With only one integer argument to the constructor, an Array of X empty slots is created
								result = [obj[0]];
							} else {
								result = _shared.Natives.windowArrayApply(null, obj);
							};
						};
						const len = result.length;
						if (mapFn) {
							for (let key = 0; key < len; key++) {
								result[key] = mapFn.call(thisObj, result[key], key);
							};
						};
						return result;
					})));
				
				//===================================
				// Shared Symbols
				//===================================
				
				_shared.NameSymbol = types.getSymbol('__NAME__');


				//===================================
				// ES6 Arrow functions support
				//===================================

				__Internal__.hasArrows = false;
				try {
					types.eval("a => a");
					__Internal__.hasArrows = true;
				} catch(ex) {
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
				try {
					types.eval("async function test() {}");
					__Internal__.hasAsyncAwait = true;
				} catch(ex) {
				};

				types.ADD('hasAsyncAwait', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: null,
							returns: 'bool',
							description: "Returns 'true' if the Javascript engine has ES6 classes, 'false' otherwise.",
					}
					//! END_REPLACE()
					, function hasAsyncAwait() {
						return __Internal__.hasAsyncAwait;
					}));

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

				_shared.BoundObjectSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('BOUND_OBJECT')), true) */ '__BOUND_OBJECT__' /*! END_REPLACE() */, true);
				
				// Test for my dream to realize !
				__Internal__.arrowIsBindable = false;
				try {
					__Internal__.arrowIsBindable = (types.eval("() => this.doodad").bind({doodad: 1})() === 1);
				} catch(ex) {
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
							for (let key in obj) {
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
						};
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
							for (let key in obj) {
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
						};
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
							for (let key in obj) {
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
						if (types.isObjectLike(obj)) {
							obj = _shared.Natives.windowObject(obj);
							if (types.isArrayLike(obj)) {
								const len = obj.length;
								for (let key in obj) {
									const number = _shared.Natives.windowNumber(key);
									if ((types.isNaN(number) || !types.isFinite(number)) && types.has(obj, key)) {
										return true;
									};
								};
							} else {
								for (let key in obj) {
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
						const keys = types.append(types.keys(values), types.symbols(values)),
							keysLen = keys.length,
							hasKey = (inherited ? types.hasInherited : types.has);
						for (let i = 0; i < keysLen; i++) {
							const key = keys[i];
							if (hasKey(obj, key)) {
								result[key] = obj[key] = values[key];
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
										result[key] = obj[key] = val;
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
						return types.unique(types.keys(obj), types.keysInherited(types.getPrototypeOf(obj)));
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
						return types.unique(types.symbols(obj), types.symbolsInherited(types.getPrototypeOf(obj)));
					}));
				
				types.ADD('depthComplete', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 2,
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
					, function depthComplete(depth, /*paramarray*/obj) {
						let result;
						if (!types.isNothing(obj)) {
							depth = (+depth || 0) - 1;  // null|undefined|true|false|NaN|Infinity
							if (depth >= -1) {
								result = _shared.Natives.windowObject(obj);
								const len = arguments.length;
								for (let i = 2; i < len; i++) {
									obj = arguments[i];
									if (types.isNothing(obj)) {
										continue;
									};
									// Part of "Object.assign" Polyfill from Mozilla Developer Network.
									obj = _shared.Natives.windowObject(obj);
									const keys = types.append(types.keys(obj), types.symbols(obj)),
										keysLen = keys.length; // performance
									for (let j = 0; j < keysLen; j++) {
										const key = keys[j];
										const objVal = obj[key];
										if ((depth >= 0) && types.isObjectLike(objVal)) {
											const resultVal = result[key];
											if (types.isNothing(resultVal)) {
												result[key] = types.depthComplete(depth, {}, objVal);
											} else if (types.isObjectLike(resultVal)) {
												types.depthComplete(depth, resultVal, objVal);
											};
										} else if (!types.has(result, key)) {
											result[key] = objVal;
										};
									};
								};
							};
						};

						return result;
					}));
				
				types.ADD('fill', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 2,
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
					, function fill(keys, /*paramarray*/obj) {
						let result;
						if (!types.isNothing(obj)) {
							if (types.isNothing(keys)) {
								keys = [];
							} else if (!types.isArray(keys)) {
								keys = [keys];
							};
							result = _shared.Natives.windowObject(obj);
							const argumentsLen = arguments.length,
								keysLen = keys.length;
							for (let i = 1; i < argumentsLen; i++) {
								obj = arguments[i];
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
						};
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
								revision: 1,
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
						if (types.isNothing(obj)) {
							return [];
						} else {
							if (_shared.Natives.objectValues && !types.isArrayLike(obj)) {
								return _shared.Natives.objectValues(obj);
							} else {
								obj = _shared.Natives.windowObject(obj);
								const result = [];
								const keys = types.keys(obj),
									len = keys.length; // performance
								for (let i = 0; i < len; i++) {
									result.push(obj[keys[i]]);
								};
								return result;
							};
						};
					}));
				
				types.ADD('entries', root.DD_DOC(
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
								returns: 'arrayof(array)',
								description: "Returns key-value pairs of the owned properties of an object. Also includes indexes of array-like objects.",
					}
					//! END_REPLACE()
					, function entries(obj) {
						if (types.isNothing(obj)) {
							return [];
						} else {
							obj = _shared.Natives.windowObject(obj);
							if (_shared.Natives.objectEntries) {
								return _shared.Natives.objectEntries(obj);
							} else {
								const result = [];
								for (let key in obj) {
									if (types.has(obj, key)) {
										result.push([key, obj[key]]);
									};
								};
								return result;
							};
						};
					}));
				
				types.ADD('items', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 1,
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
							} else if (_shared.Natives.objectEntries) {
								return _shared.Natives.objectEntries(obj);
							} else {
								const result = [];
								for (let key in obj) {
									if (types.has(obj, key)) {
										result.push([key, obj[key]]);
									};
								};
								return result;
							};
						};
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
				
				types.ADD('getFirstIndex', root.DD_DOC(
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
				
				types.ADD('getFirstValue', root.DD_DOC(
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
				
				types.ADD('popAt', root.DD_DOC(
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
				
				types.ADD('popItem', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 3,
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
								},
								returns: 'any',
								description: "Search the first occurrence of the specified value among owned properties of an object, than deletes it and returns that value. When not found, returns 'undefined'. If object is an array, splices at the index of the first occurrence.",
					}
					//! END_REPLACE()
					, function popItem(obj, item, /*optional*/thisObj, /*optional*/includeFunctions) {
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
									const keys = types.keys(obj),
										len = keys.length; // performance
									for (let i = 0; i < len; i++) {
										const key = keys[i];
										const val = obj[key];
										if (item.call(thisObj, val, key, obj)) {
											delete obj[key];
											return val;
										};
									};
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
									const keys = types.keys(obj),
										len = keys.length; // performance
									for (let i = 0; i < len; i++) {
										const key = keys[i];
										const val = obj[key];
										if (val === item) {
											delete obj[key];
											return val;
										};
									};
								};
							};
						};
					}));
				
				types.ADD('popItems', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 5,
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
								},
								returns: 'arrayof(any)',
								description: "Search all occurrence of the specified values among owned properties of an object, than deletes them and returns these values in an array. If object is an array, splices at the indexes of each occurrences.",
					}
					//! END_REPLACE()
					, function popItems(obj, items, /*optional*/thisObj) {
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
									const keys = types.keys(obj),
										len = keys.length; // performance
									for (let i = 0; i < len; i++) {
										const key = keys[i];
										const val = obj[key];
										if (items.call(thisObj, val, key, obj)) {
											delete obj[key];
											result.push(val);
										};
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
									const keys = types.keys(obj),
										len = keys.length; // performance
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
									const keys = types.keys(obj),
										len = keys.length; // performance
									for (let i = 0; i < len; i++) {
										const key = keys[i];
										const val = obj[key];
										if (items === val) {
											delete obj[key];
											result.push(val);
										};
									};
								};
							};
						};
						return result;
					}));
				
				types.ADD('prepend', root.DD_DOC(
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
					, function prepend(obj /*paramarray*/) {
						if (!types.isArrayLike(obj)) {
							return null;
						};
						const len = arguments.length;
						for (let i = 1; i < len; i++) {
							const arg = arguments[i];
							if (!types.isNothing(arg)) {
								_shared.Natives.arrayUnshiftApply(obj, arg);
							};
						};
						return obj;
					}));
				
				
				//===================================
				// Callback base type
				//===================================
				
				types.ADD('Callback', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: null,
							returns: 'undefined',
							description: "Base of every callback handlers.",
					}
					//! END_REPLACE()
					, function(/*optional*/obj, fn) {
						throw new types.NotSupported("Type is a base type.");
					}));
				
				types.ADD('isCallback', function isCallback(obj) {
					return types.isCallable(obj) && types.baseof(types.Callback, obj);
				});
				
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
		return DD_MODULES;
	},
};
//! END_MODULE()