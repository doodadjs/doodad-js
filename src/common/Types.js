//! REPLACE_BY("// Copyright 2015 Claude Petit, licensed under Apache License version 2.0\n")
// dOOdad - Object-oriented programming framework with some extras
// File: Types.js - Types management
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
	var global = this;

	var exports = {};
	if (global.process) {
		module.exports = exports;
	};
	
	exports.add = function add(DD_MODULES) {
		DD_MODULES = (DD_MODULES || {});
		DD_MODULES['Doodad.Types'] = {
			type: null,
			version: '1a',
			namespaces: null,
			dependencies: null,
			bootstrap: true,
			exports: exports,
			
			create: function create(root, /*optional*/_options) {
				"use strict";

				//===================================
				// Get namespaces
				//===================================

				var types = root.Doodad.Types;
				
				//===================================
				// Cast functions
				//===================================
				
				var __returnUndefined__ = function() {
					return undefined;
				};
				var __returnUndefinedString__ = function() {
					return 'undefined';
				};
				var __returnNull__ = function() {
					return null;
				};
				var __returnNullString__ = function() {
					return 'null';
				};
				
				types.Undefined = function Undefined() {
					if (types.undefined) {
						throw new types.Error("Can't create object.");
					};
				};
				types.Undefined.prototype.valueOf = __returnUndefined__;
				types.Undefined.prototype.toString = __returnUndefinedString__;
				types.Undefined.prototype.toSource = __returnUndefinedString__;
				types.undefined = new types.Undefined();

				types.Null = function Null() {
					if (types.null) {
						throw new types.Error("Can't create object.");
					};
				};
				types.Null.prototype.valueOf = __returnNull__;
				types.Null.prototype.toString = __returnNullString__;
				types.Null.prototype.toSource = __returnNullString__;
				types.null = new types.Null();
				
				types.toObject = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
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
							return types.undefined;
						} else if (val === null) {
							return types.null;
						} else {
							return __Natives__.windowObject(val);
						};
					});
				
				types.toArray = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'any',
										optional: false,
										description: "A value to convert.",
									},
								},
								returns: 'array',
								description: "Converts any value to an array.",
					}
					//! END_REPLACE()
					, function toArray(obj) {
						if (types.isNothing(obj)) {
							return obj;
						} else if (types.isArrayLike(obj)) {
							obj = Object(obj);
							if (obj.length === 1) {
								// <PRB> With only one integer argument to the constructor, an Array of X empty slots is created
								return [obj[0]];
							} else {
								return __Natives__.arrayConstructor.apply(null, obj);
							};
						} else {
							return [obj];
						};
					});
				
				types.toBoolean = root.DD_DOC(
					//! REPLACE_BY("null")
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
								returns: 'bool',
								description: "Converts a value to a boolean.",
					}
					//! END_REPLACE()
					, function toBoolean(obj) {
						return (obj === 'true') || !!(+obj);
					});

				types.toString = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'any',
										optional: false,
										description: "A value to convert.",
									},
								},
								returns: 'string',
								description: "Converts the value to a string.",
					}
					//! END_REPLACE()
					, function toString(obj) {
						if (obj === undefined) {
							return "undefined";
						} else if (obj === null) {
							return "null";
						} else {
							return (obj + '');
						};
					});
				
				//===================================
				// Options
				//===================================
					
				types.options = types.depthExtend(2, {
					settings: {
						toSourceItemsCount: 255,		// Max number of items
						enableProxies: false,			// <FUTURE> Enables or disables ECMA 6 Proxies
					},
				}, _options);
				
				types.options.settings.toSourceItemsCount = parseInt(types.options.settings.toSourceItemsCount);
				types.options.settings.enableProxies = types.toBoolean(types.options.settings.enableProxies);
				
				//===================================
				// Internal
				//===================================
				
				var __Internal__ = {
					// "toSource"
					supportsVerticalTabEscape: ('\v' !== 'v'),
					supportsNullCharEscape: ('\0' !== '0'),
				};

				//===================================
				// Native functions
				//===================================
					
				// NOTE: Makes use of "isNativeFunction" to get rid of third-parties injections as possible.
				// NOTE: Store everything because third-parties can override them.
				
				var __arrayObj__ = global.Array && global.Array.prototype || []; // temporary
				
				var __Natives__ = {
					// No polyfills
					
					objectToString: Object.prototype.toString,
					
					// "toArray"
					arrayConstructor: __arrayObj__.constructor,
					
					// "clone"
					arraySlice: __arrayObj__.slice,
					//functionToString: Function.prototype.toString,
					
					// "popAt", "popItem", "popItems"
					arraySplice: __arrayObj__.splice,
					
					// "append"
					arrayPush: __arrayObj__.push,
					
					// "prepend"
					arrayUnshift: __arrayObj__.unshift,
					
					windowObject: global.Object,
					

					// Polyfills
					
					// "bind"
					functionBind: (types.isNativeFunction(Function.prototype.bind) ? Function.prototype.bind : undefined),
					
					// ES6
					windowSet: (types.isNativeFunction(global.Set) ? global.Set : undefined),
					windowMap: (types.isNativeFunction(global.Map) ? global.Map : undefined),
					windowProxy: (types.options.settings.enableProxies && types.isNativeFunction(global.Proxy) ? global.Proxy : undefined),
				};
				
				__arrayObj__ = null;   // free memory
				
				types.isArrayAndNotEmpty = root.DD_DOC(
					//! REPLACE_BY("null")
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
								description: "Returns 'true' when the object is an array and is not empty. Returns 'false' otherwise.",
					}
					//! END_REPLACE()
					, function isArrayAndNotEmpty(obj) {
						if (types.isArray(obj)) {
							var len = obj.length;
							for (var key = 0; key < len; key++) {
								if (key in obj) {
									return true;
								};
							};
						};
						return false;
					});
				
				types.isArrayLikeAndNotEmpty = root.DD_DOC(
					//! REPLACE_BY("null")
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
								description: "Returns 'true' when the object is an array-like object and is not empty. Returns 'false' otherwise.",
					}
					//! END_REPLACE()
					, function isArrayLikeAndNotEmpty(obj) {
						if (types.isArrayLike(obj)) {
							obj = __Natives__.windowObject(obj);
							var len = obj.length;
							for (var key = 0; key < len; key++) {
								if (key in obj) {
									return true;
								};
							};
						};
						return false;
					});
				
				types.isNothingOrEmpty = root.DD_DOC(
					//! REPLACE_BY("null")
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
								description: "Returns 'true' when the object is nothing (is 'undefined' or 'null') or empty (has no own properties). Returns 'false' otherwise.",
					}
					//! END_REPLACE()
					, function isNothingOrEmpty(obj) {
						if (types.isNothing(obj)) {
							return true;
						} else if (types.isArrayLike(obj)) {
							obj = __Natives__.windowObject(obj);
							var len = obj.length;
							for (var key = 0; key < len; key++) {
								if (key in obj) {
									return false;
								};
							};
							return true;
						} else if (types.isObjectLike(obj)) {
							obj = __Natives__.windowObject(obj);
							for (var key in obj) {
								if (types.hasKey(obj, key)) {
									return false;
								};
							};
							return true;
						};
						return false;
					});
				
				types.isEmpty = root.DD_DOC(
					//! REPLACE_BY("null")
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
								description: "Returns 'true' when the object is empty (has no own properties). Returns 'false' otherwise.",
					}
					//! END_REPLACE()
					, function isEmpty(obj) {
						if (types.isArrayLike(obj)) {
							obj = __Natives__.windowObject(obj);
							var len = obj.length;
							for (var key = 0; key < len; key++) {
								if (key in obj) {
									return false;
								};
							};
							return true;
						} else if (types.isObjectLike(obj)) {
							obj = __Natives__.windowObject(obj);
							for (var key in obj) {
								if (types.hasKey(obj, key)) {
									return false;
								};
							};
							return true;
						};
						return false;
					});
				
				types.isStringAndNotEmpty = root.DD_DOC(
					//! REPLACE_BY("null")
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
					});
				
				types.isStringAndNotEmptyTrim = root.DD_DOC(
					//! REPLACE_BY("null")
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
								description: "Returns 'true' when the object is a non-empty string when trimmed (spaces removed). Returns 'false' otherwise.",
					}
					//! END_REPLACE()
					, function isStringAndNotEmptyTrim(obj) {
						return types.isString(obj) && !!obj.trim().length;
					});
				
				types.isObjectAndNotEmpty = root.DD_DOC(
					//! REPLACE_BY("null")
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
								description: "Returns 'true' when the value is a non-empty object (has own properties). Returns 'false' otherwise.",
					}
					//! END_REPLACE()
					, function isObjectAndNotEmpty(obj) {
						// "Object.keys" Polyfill from Mozilla Developer Network.
						if (types.isObject(obj)) {
							var key, i;
							for (key in obj) {
								if (types.hasKey(obj, key)) {
									return true;
								};
							};
							if (__Natives__.hasDontEnumBug) {
								for (i = 0; i < __Natives__.defaultNonEnumerables.length; i++) {
									key = __Natives__.defaultNonEnumerables[i];
									if (types.hasKey(obj, key)) {
										return true;
									};
								};
							};
						};
						return false;
					});
				
				types.isObjectLikeAndNotEmpty = root.DD_DOC(
					//! REPLACE_BY("null")
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
							obj = __Natives__.windowObject(obj);
							var key, i;
							if (types.isArrayLike(obj)) {
								var len = obj.length;
								for (key in obj) {
									if ((isNaN(key) || !isFinite(key)) && types.hasKey(obj, key)) {
										return true;
									};
								};
							} else {
								// "Object.keys" Polyfill from Mozilla Developer Network.
								for (key in obj) {
									if (types.hasKey(obj, key)) {
										return true;
									};
								};
							};
							if (__Natives__.hasDontEnumBug) {
								for (i = 0; i < __Natives__.defaultNonEnumerables.length; i++) {
									key = __Natives__.defaultNonEnumerables[i];
									if (types.hasKey(obj, key)) {
										return true;
									};
								};
							};
						};
						return false;
					});

				
				types._typeof = root.DD_DOC(
					//! REPLACE_BY("null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								obj: {
									type: 'any',
									optional: false,
									description: "A value.",
								},
							},
							returns: 'string',
							description: "Returns the type of a value. It does something similar to what 'typeof' should do instead of its current ECMA specification.",
					}
					//! END_REPLACE()
					, function _typeof(obj) {
						if (types.isNothing(obj)) {
							return 'undefined';
						} else if (types.isType(obj)) {
							return '[' + types.getTypeName(obj) + ']';
						} else if (types.isFunction(obj)) {
							return 'function';
						} else if (types.isInfinite(obj)) {
							return 'infinite';
						} else if (types.isInteger(obj)) {
							return 'integer';
						} else if (types.isFloat(obj)) {
							return 'float';
						} else if (types.isBoolean(obj)) {
							return 'boolean';
						} else if (types.isString(obj)) {
							return 'string';
						} else if (types.isDate(obj)) {
							return 'date';
						} else if (types.isArray(obj)) {
							return 'array';
						} else if (types.isError(obj)) {
							return 'error';
						} else if (types.isNaN(obj)) {
							return 'nan';
						} else if (types.isSymbol(obj)) {
							return 'symbol';
						} else if (types.isObject(obj)) {
							return 'object';
						} else {
							return 'unknown'; // not supported
						};
					});
					
					
				types.gets = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'object',
										optional: false,
										description: "An object.",
									},
									keys: {
										type: 'arrayof(string)',
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
						var result = {};
						obj = __Natives__.windowObject(obj);
						if (!types.isArray(keys)) {
							keys = [keys];
						};
						var keysLen = keys.length,
							hasKey = (inherited ? types.hasKeyInherited : types.hasKey);
						for (var i = 0; i < keysLen; i++) {
							var key = keys[i];
							if (obj && hasKey(obj, key)) {
								result[key] = obj[key];
							} else if (_defaults && types.hasKey(_defaults, key)) {
								result[key] = _defaults[key];
							};
						};
						return result;
					});
				
				types.set = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'object',
										optional: false,
										description: "An object.",
									},
									key: {
										type: 'string',
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
						obj = __Natives__.windowObject(obj);
						var hasKey = (inherited ? types.hasKeyInherited : types.hasKey);
						if (hasKey(obj, key)) {
							obj[key] = value;
							return value;
						};
					});
				
				types.sets = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
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
						var result = {};
						if (types.isNothing(obj)) {
							return result;
						};
						obj = __Natives__.windowObject(obj);
						var keys = types.keys(values),
							keysLen = keys.length,
							hasKey = (inherited ? types.hasKeyInherited : types.hasKey);
						for (var i = 0; i < keysLen; i++) {
							var key = keys[i];
							if (hasKey(obj, key)) {
								result[key] = obj[key] = values[key];
							};
						};
						return result;
					});
				
				types.getDefault = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'object',
										optional: false,
										description: "An object.",
									},
									key: {
										type: 'string',
										optional: false,
										description: "Attribute name.",
									},
									_default: {
										type: 'any',
										optional: true,
										description: "Default value.",
									},
									inherited: {
										type: 'bool',
										optional: true,
										description: "When 'true', the function look at inherited own properties. Default is 'false'.",
									},
								},
								returns: 'any',
								description: "Returns the value of an own property. If the own property doesn't exist, creates that own property with the value of the '_default' parameter and returns that value.",
					}
					//! END_REPLACE()
					, function getDefault(obj, key, /*optional*/_default, /*optional*/inherited) {
						if (types.isNothing(obj)) {
							return _default;
						};
						obj = __Natives__.windowObject(obj);
						var hasKey = (inherited ? types.hasKeyInherited : types.hasKey);
						if (hasKey(obj, key)) {
							return obj[key];
						} else if (_default !== undefined) {
							return obj[key] = _default;
						};
					});
				
				types.getsDefault = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'object',
										optional: false,
										description: "An object.",
									},
									keys: {
										type: 'arrayof(string)',
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
						var result = {};
						obj = __Natives__.windowObject(obj);
						if (!types.isArray(keys)) {
							keys = [keys];
						};
						var keysLen = keys.length,
							hasKey = (inherited ? types.hasKeyInherited : types.hasKey);
						for (var i = 0; i < keysLen; i++) {
							var key = keys[i];
							if (obj && hasKey(obj, key)) {
								result[key] = obj[key];
							} else if (types.hasKey(_defaults, key)) {
								var val = _defaults[key];
								if (obj) {
									obj[key] = val;
								};
								result[key] = val;
							};
						};
						return result;
					});
				
				types.keysInherited = root.DD_DOC(
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
								description: "Returns an array of enumerable owned property names and inherited property names of an object. For array-like objects, index properties are excluded.",
					}
					//! END_REPLACE()
					, function keysInherited(obj) {
						// Returns enumerable own properties (those not inherited).
						// Doesn't not include array items.
						var result = [];
							
						if (!types.isNothing(obj)) {
							obj = __Natives__.windowObject(obj);
							
							var proto = obj,
								protos = [],
								lastProto;
								
							do {
								protos.push(proto);
								if (!lastProto && types.isNativeFunction(proto.constructor)) {
									lastProto = proto.constructor.prototype;
								};
								proto = types.getPrototypeOf(proto);
							} while (proto && (proto !== lastProto));
							
							var protosLen = protos.length;
							
							var hasKeyInherited = function hasKeyInherited(key) {
								if (protosLen) {
									for (var j = 0; j < protosLen; j++) {
										var proto = protos[j];
										if (types.hasKey(proto, key)) {
											return true;
										};
									};
								};
								return false;
							};
							
							if (types.isArrayLike(obj)) {
								for (var key in obj) {
									if ((isNaN(key) || !isFinite(key)) && hasKeyInherited(key)) {
										result.push(key);
									};
								};
							} else {
								// Polyfill from Mozilla Developer Network.
								for (var key in obj) {
									if (hasKeyInherited(key)) {
										result.push(key);
									};
								};
							};

							if (__Natives__.hasDontEnumBug) {
								for (var i = 0; i < __Natives__.defaultNonEnumerables.length; i++) {
									var key = __Natives__.defaultNonEnumerables[i];
									if (hasKeyInherited(key)) {
										result.push(key);
									};
								};
							};
						};
						
						return result;
					});
				
				types.complete = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									paramarray: {
										type: 'any',
										optional: false,
										description: "An object.",
									},
								},
								returns: 'object',
								description: "Extends the first object with owned properties of the other objects. Existing owned properties are excluded.",
					}
					//! END_REPLACE()
					, function complete(/*paramarray*/obj) {
						var result;
						if (!types.isNothing(obj)) {
							result = __Natives__.windowObject(obj);
							var len = arguments.length;
							for (var i = 1; i < len; i++) {
								obj = arguments[i];
								if (types.isNothing(obj)) {
									continue;
								};
								// Part of "Object.assign" Polyfill from Mozilla Developer Network.
								obj = __Natives__.windowObject(obj);
								var keys = types.keys(obj),
									keysLen = keys.length, // performance
									j, 
									key;
								for (j = 0; j < keysLen; j++) {
									key = keys[j];
									if (!types.hasKey(result, key)) {
										result[key] = obj[key];
									};
								};
							};
						};
						
						return result;
					});
				
				types.depthComplete = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
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
						var result;
						if (!types.isNothing(obj)) {
							depth = (+depth || 0) - 1;  // null|undefined|true|false|NaN|Infinity
							if (depth >= -1) {
								result = __Natives__.windowObject(obj);
								var len = arguments.length;
								for (var i = 2; i < len; i++) {
									obj = arguments[i];
									if (types.isNothing(obj)) {
										continue;
									};
									// Part of "Object.assign" Polyfill from Mozilla Developer Network.
									obj = __Natives__.windowObject(obj);
									var keys = types.keys(obj),
										keysLen = keys.length, // performance
										j, 
										key, 
										objVal,
										resultVal;
									for (j = 0; j < keysLen; j++) {
										key = keys[j];
										objVal = obj[key];
										if ((depth >= 0) && types.isObjectLike(objVal)) {
											resultVal = result[key];
											if (types.isNothing(resultVal)) {
												result[key] = types.depthComplete(depth, {}, objVal);
											} else if (types.isObjectLike(resultVal)) {
												types.depthComplete(depth, resultVal, objVal);
											};
										} else if (!types.hasKey(result, key)) {
											result[key] = objVal;
										};
									};
								};
							};
						};

						return result;
					});
				
				types.fill = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									keys: {
										type: 'arrayof(string)',
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
						var result;
						if (!types.isNothing(obj)) {
							if (types.isNothing(keys)) {
								keys = [];
							} else if (!types.isArray(keys)) {
								keys = [keys];
							};
							result = __Natives__.windowObject(obj);
							var argumentsLen = arguments.length,
								keysLen = keys.length;
							for (var i = 1; i < argumentsLen; i++) {
								obj = arguments[i];
								if (!types.isNothing(obj)) {
									obj = __Natives__.windowObject(obj);
									for (var k = 0; k < keysLen; k++) {
										if (k in keys) {
											var key = keys[k];
											if (types.hasKey(obj, key)) {
												result[key] = obj[key];
											};
										};
									};
								};
							};
						};
						return result;
					});
				
				types.isClonable = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'any',
										optional: false,
										description: "Object to test for.",
									},
									cloneFunctions: {
										type: 'bool',
										optional: true,
										description: "When 'true', the function will returns 'true' for custom functions. Default is 'false'.",
									},
								},
								returns: 'bool',
								description: "Returns 'true' when the value is clonable.",
					}
					//! END_REPLACE()
					, function isClonable(obj, /*optional*/cloneFunctions) {
						// NOTE: This function will get replaced when "Doodad.js" is loaded.
						return !types.isString(obj) && (types.isArrayLike(obj) || types.isObject(obj) || (!!cloneFunctions && types.isCustomFunction(val)));
					});
				
				types.clone = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'any',
										optional: false,
										description: "A value.",
									},
									depth: {
										type: 'integer',
										optional: true,
										description: "Depth.",
									},
									cloneFunctions: {
										type: 'bool,integer',
										optional: true,
										description: "When 'true', the function will clone custom functions. When an integer, it will specify the depth where custom functions are cloned. Default is 'false'.",
									},
								},
								returns: 'any',
								description: "Clone a value.",
					}
					//! END_REPLACE()
					, function clone(obj, /*optional*/depth, /*optional*/cloneFunctions) {
						// NOTE: This function will get replaced when "Doodad.js" is loaded.
						// TODO: "defineProperty", "Symbols", ...
						var result;

						if (types.isNothing(obj)) {
							result = obj;
						} else {
							depth = (+depth || 0) - 1;  // null|undefined|true|false|NaN|Infinity
							cloneFunctions = (+cloneFunctions || 0) - 1;  // null|undefined|true|false|NaN|Infinity
							
							var key;
							
							if (types.isClonable(obj)) {
								if (types.isArrayLike(obj)) {
									obj = __Natives__.windowObject(obj);
									if (depth >= 0) {
										result = Array(obj.length);
										var len = obj.length;
										for (key = 0; key < len; key++) {
											if (key in obj) {
												result[key] = types.clone(obj[key], depth, cloneFunctions);
											};
										};
									} else {
										result = __Natives__.arraySlice.call(obj, 0);
									};
								} else if (types.isCustomFunction(obj)) {
									if (cloneFunctions >= 0) {
										//result = eval('(' + __Natives__.functionToString.call(obj) + ')');
										result = eval('(' + obj.toString() + ')');
									} else {
										return obj;
									};
								} else {  // if (types.isObject(obj))
									result = types.createObject(types.getPrototypeOf(obj));
								};
							} else {
								return obj;
							};

							// Copy properties
							if (depth >= 0) {
								// "types.extend"
								var keys = types.keys(obj),
									len = keys.length, // performance
									i;
								for (i = 0; i < len; i++) {
									key = keys[i];
									result[key] = types.clone(obj[key], depth, cloneFunctions);
								};
							} else {
								types.extend(result, obj);
							};
						};
						
						return result;
					});
				


				
				types.hasIndex = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
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
							obj = __Natives__.windowObject(obj);
							if (!types.isArray(indexes)) {
								indexes = [indexes];
							};
							var len = indexes.length;
							if (!len) {
								return false;
							};
							for (var i = 0; i < len; i++) {
								if (i in indexes) {
									var index = indexes[i];
									if (isNaN(index) || !isFinite(index) || !(index in obj)) {
										return false;
									};
								};
							};
							return true;
						} else {
							return false;
						};
					});
				
				types.indexes = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
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
						var result = [];
						if (types.isArrayLike(obj)) {
							obj = __Natives__.windowObject(obj);
							var len = obj.length;
							for (var key = 0; key < len; key++) {
								if (key in obj) {
									result.push(key);
								};
							};
						};
						return result;
					});
				
				types.values = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
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
							obj = __Natives__.windowObject(obj);
							var result = [];
							if (types.isArrayLike(obj)) {
								var len = obj.length;
								for (var key = 0; key < len; key++) {
									if (key in obj) {
										result.push(obj[key]);
									};
								};
							} else {
								var keys = types.keys(obj),
									len = keys.length; // performance
								for (var i = 0; i < len; i++) {
									result.push(obj[keys[i]]);
								};
							};
							return result;
						};
					});
				
				types.items = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
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
							obj = __Natives__.windowObject(obj);
							var result = [];
							if (types.isArrayLike(obj)) {
								var len = obj.length;
								for (var key = 0; key < len; key++) {
									if (key in obj) {
										result.push([key, obj[key]]);
									};
								};
							} else {
								var keys = types.keys(obj),
									len = keys.length; // performance
								for (var i = 0; i < len; i++) {
									var key = keys[i];
									result.push([key, obj[key]]);
								};
							};
							return result;
						};
					});
				
				types.available = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
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
							obj = __Natives__.windowObject(obj);
							var len = obj.length;
							for (var key = 0; key < len; key++) {
								if (!(key in obj)) {
									return key;
								};
							};
						};
						return -1;
					});
				
				types.availables =  root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
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
						var keys = [];
						if (types.isArrayLike(obj)) {
							obj = __Natives__.windowObject(obj);
							var len = obj.length;
							for (var key = 0; key < len; key++) {
								if (!(key in obj)) {
									keys.push(key);
								};
							};
						};
						return keys;
					});
				
				types.getFirstIndex =  root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
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
							var len = obj.length;
							for (var key = 0; key < len; key++) {
								if (key in obj) {
									return key;
								};
							};
						};
					});
				
				types.getFirstValue = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
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
							var len = obj.length;
							for (var key = 0; key < len; key++) {
								if (key in obj) {
									return obj[key];
								};
							};
						};
					});
				
				types.popAt = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
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
						if (!types.isNothing(obj)) {
							obj = __Natives__.windowObject(obj);
							if (types.isArray(obj)) {
								if (key in obj) {
									var item = obj[key];
									__Natives__.arraySplice.call(obj, key, 1);
									return item;
								};
							};
							if (types.hasKey(obj, key)) {
								var item = obj[key];
								delete obj[key];
								return item;
							};
						};
					});
				
				types.popItem = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
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
							var key, 
								val;
							obj = __Natives__.windowObject(obj);
							if (!includeFunctions && types.isFunction(item)) {
								if (types.isArray(obj)) {
									var len = obj.length;
									for (key = 0; key < len; key++) {
										if (key in obj) {
											val = obj[key];
											if (item.call(thisObj, val, key, obj)) {
												__Natives__.arraySplice.call(obj, key, 1);
												return val;
											};
										};
									};
								};
								var keys = types.keys(obj),
									len = keys.length, // performance
									i;
								for (i = 0; i < len; i++) {
									key = keys[i];
									val = obj[key];
									if (item.call(thisObj, val, key, obj)) {
										delete obj[key];
										return val;
									};
								};
							} else {
								if (types.isArray(obj)) {
									var len = obj.length;
									for (key = 0; key < len; key++) {
										if (key in obj) {
											val = obj[key];
											if (val === item) {
												__Natives__.arraySplice.call(obj, key, 1);
												return val;
											};
										};
									};
								};
								var keys = types.keys(obj),
									len = keys.length, // performance
									i;
								for (i = 0; i < len; i++) {
									key = keys[i];
									val = obj[key];
									if (val === item) {
										delete obj[key];
										return val;
									};
								};
							};
						};
					});
				
				types.popItems = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'object,array',
										optional: false,
										description: "An object or an array.",
									},
									items: {
										type: 'arrayof(any),function',
										optional: false,
										description: "The values of the items to pop out. When it is a function, calls it to get the items to pop out.",
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
								returns: 'arrayof(any)',
								description: "Search all occurrence of the specified values among owned properties of an object, than deletes them and returns these values in an array. If object is an array, splices at the indexes of each occurrences.",
					}
					//! END_REPLACE()
					, function popItems(obj, items, /*optional*/thisObj, /*optional*/includeFunctions) {
						var result = [];
						if (!types.isNothing(obj)) {
							var key, 
								val;
							obj = __Natives__.windowObject(obj);
								
							if (!includeFunctions && types.isFunction(items)) {
								if (types.isArray(obj)) {
									for (key = obj.length - 1; key >= 0; key--) {
										if (key in obj) {
											val = obj[key];
											if (items.call(thisObj, val, key, obj)) {
												__Natives__.arraySplice.call(obj, key, 1);
												result.push(val);
											};
										};
									};
								};
								var keys = types.keys(obj),
									len = keys.length, // performance
									i;
								for (i = 0; i < len; i++) {
									key = keys[i];
									val = obj[key];
									if (items.call(thisObj, val, key, obj)) {
										delete obj[key];
										result.push(val);
									};
								};
							} else {
								var values = types.values(items),
									valuesLen = values.length;
								if (types.isArray(obj)) {
									for (key = obj.length - 1; key >= 0; key--) {
										if (key in obj) {
											val = obj[key];
											for (var j = 0; j < valuesLen; j++) {
												if (values[j] === val) {
													__Natives__.arraySplice.call(obj, key, 1);
													result.push(val);
												};
											};
										};
									};
								};
								var keys = types.keys(obj),
									len = keys.length, // performance
									i;
								for (i = 0; i < len; i++) {
									key = keys[i];
									val = obj[key];
									for (var j = 0; j < valuesLen; j++) {
										if (values[j] === val) {
											delete obj[key];
											result.push(val);
										};
									};
								};
							};
						};
						return result;
					});
				
				types.append = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									paramarray: {
										type: 'array',
										optional: false,
										description: "An array.",
									},
								},
								returns: 'array',
								description: "Appends the items of each array to the first array than returns that array.",
					}
					//! END_REPLACE()
					, function append(obj /*paramarray*/) {
						if (!types.isArrayLike(obj)) {
							return null;
						};
						
						var result,
							start = 0;
						if (types.isArray(obj)) {
							result = obj;
							start = 1;
						} else {
							result = [];
						};
						
						var len = arguments.length;
						for (var i = start; i < len; i++) {
							obj = arguments[i];
							if (types.isNothing(obj)) {
								continue;
							};
							obj = __Natives__.windowObject(obj);
							__Natives__.arrayPush.apply(result, obj);
						};
						
						return result;
					});
				
				types.prepend = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									paramarray: {
										type: 'array',
										optional: false,
										description: "An array.",
									},
								},
								returns: 'array',
								description: "Prepends the items of each array to the first array than returns that array.",
					}
					//! END_REPLACE()
					, function prepend(obj /*paramarray*/) {
						if (!types.isArrayLike(obj)) {
							return null;
						};
						
						var result,
							start = 0;
						if (types.isArray(obj)) {
							result = obj;
							start = 1;
						} else {
							result = [];
						};
						
						var len = arguments.length;
						for (var i = start; i < len; i++) {
							obj = arguments[i];
							if (types.isNothing(obj)) {
								continue;
							};
							obj = __Natives__.windowObject(obj);
							__Natives__.arrayUnshift.apply(result, obj);
						};
						
						return result;
					});
				
				
				//===================================
				// "toSource" function
				//===================================
				
				types.toSource = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'any',
										optional: false,
										description: "A value.",
									},
									depth: {
										type: 'integer',
										optional: true,
										description: "Depth.",
									},
									options: {
										type: 'object',
										optional: true,
										description: "Options... 'allowToSource' (bool): When 'true', calls the function 'toSource' of the object when it exists.",
									},
								},
								returns: 'string',
								description: "Converts a value to its source code equivalent.",
					}
					//! END_REPLACE()
					, function toSource(obj, /*optional*/depth, /*optional*/options) {
						if (obj === undefined) {
							return 'undefined';
						} else if (obj === null) {
							return 'null';
						} else if (types.isNaN(obj)) {
							return "NaN";
						} else {
							var primitive = types.isPrimitive(obj);
							obj = __Natives__.windowObject(obj);
							var val = obj.valueOf();
							if (!primitive && types.isNothing(depth) && types.isFunction(obj.toSource) && types.get(options, 'allowToSource', false)) {
								return obj.toSource();
							} else {
								depth = (+depth || 0);  // null|undefined|true|false|NaN|Infinity
								if (types.isString(obj)) {
									var str = '',
										len = val.length;
									for (var i = 0; i < len; i++) {
										var chr = val[i],
											code = chr.charCodeAt(0);
										if (__Natives__.supportsNullCharEscape && (code === 0x0000)) { // Null
											str += '\\0';
										} else if (code === 0x0008) { // Backspace
											str += '\\b';
										} else if (code === 0x0009) { // Horizontal Tab
											str += '\\t';
										} else if (code === 0x000A) { // Line Feed
											str += '\\n';
										} else if (__Natives__.supportsVerticalTabEscape && (code === 0x000B)) { // Vertical Tab
											str += '\\v';
										} else if (code === 0x000C) { // Form Feed
											str += '\\f';
										} else if (code === 0x000D) { // Carriage return
											str += '\\r';
										} else if (code === 0x0027) { // Single Quote
											str += "\\'";
										} else if (code === 0x005C) { // Backslash
											str += '\\\\';
										} else if (code === 0x00A0) { // Non-breaking space
											str += '\\u00A0';
										} else if (code === 0x2028) { // Line separator
											str += '\\u2028';
										} else if (code === 0x2029) { // Paragraph separator
											str += '\\u2029';
										} else if (code === 0xFEFF) { // Byte order mark
											str += '\\uFEFF';
										} else if (((code >= 0x0000) && (code <= 0x001F)) || ((code >= 0x007F) && (code <= 0x009F))) { // Other control chars
											str += '\\u' + ('000' + code.toString(16)).slice(-4);
										} else {
											str += chr;
										};
									};
									if (primitive) {
										return "'" + str + "'";
									} else {
										return "(new String('" + str + "'))";
									};
								} else if (types.isBoolean(obj)) {
									if (primitive) {
										return (val ? 'true' : 'false');
									} else {
										return (val ? '(new Boolean(true))' : '(new Boolean(false))');
									};
								} else if (types.isNumber(obj)) {
									if (primitive) {
										return val.toString();
									} else {
										return '(new Number(' + val + '))';
									};
								} else if (types.isDate(obj)) {
									return '(new Date(' + obj.getFullYear() + ', ' + obj.getMonth() + ', ' + obj.getDate() + ', ' + obj.getHours() + ', ' + obj.getMinutes() + ', ' + obj.getSeconds() + ', ' + obj.getMilliseconds() + '))';
								} else if (types.isError(obj)) {
									return '(new Error(' + types.toSource(obj.message || obj.description) + '))';
								} else if (types.isFunction(obj)) {
									if ((depth >= 0) && types.isCustomFunction(obj)) {
										return obj.toString();
									} else {
										return '(new Function())';
									};
								} else if (types.isArray(obj)) {
									if (depth < 0) {
										return '(new Array(' + obj.length + '))';
									};
									var str = '',
										len = val.length,
										continued = '';
									depth--;
									if (len > types.options.toSourceItemsCount) {
										len = types.options.toSourceItemsCount;
										continued = ', ...';
									};
									for (var key = 0; key < len; key++) {
										if (key in val) {
											str += types.toSource(val[key], depth) + ', ';
										} else {
											str += ', ';
										};
									};
									return '[' + str.slice(0, -2) + continued + ']';
								} else if (types.isObject(obj)) {
									if (depth < 0) {
										return '(new Object())';
									};
									var str = '',
										len = 0,
										maxLen = types.options.toSourceItemsCount;
									depth--;
									for (var key in val) {
										if (types.hasKey(val, key)) {
											if (len >= maxLen) {
												str += '..., ';
												break;
											};
											str += types.toSource(key) + ': ' + types.toSource(val[key], depth) + ', ';
											len++;
										};
									};
									return '{' + str.slice(0, -2) + '}';
								} else if (types.isObjectLike(obj)) {
									return types.toSource(__Natives__.objectToString.call(obj));
								} else {
									return obj.toString();
								};
							};
						};
					});
				
				//===================================
				// ECMA 6 Proxies functions
				//===================================
					
				types.hasProxiesEnabled = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: null,
								returns: 'bool',
								description: "Returns 'true' when ES6 Proxy is available.",
					}
					//! END_REPLACE()
					, (__Natives__.windowProxy ? (function hasProxiesEnabled() {
						return true;
					}) : (function hasProxiesEnabled() {
						return false;
					})));
				
		/*
				types.isProxy = (__Natives__.windowProxy ? (function isProxy(obj) {
					return (obj instanceof __Natives__.windowProxy);
				}) : (function isProxy(obj) {
					if (types.isNothing(obj)) {
						return false;
					};
					obj = __Natives__.windowObject(obj);
					return !!obj.__isProxy__;
				}));
		*/
				
				types.createProxy = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'object',
										optional: false,
										description: "An object.",
									},
									handler: {
										type: 'object',
										optional: false,
										description: "Handler.",
									},
								},
								returns: 'object',
								description: "Helper function to create a ES6 Proxy for an object. When ES6 Proxy is not available, attempts to reproduce it when possible.",
					}
					//! END_REPLACE()
					, (__Natives__.windowProxy ? (function createProxy(target, handler) {
						return new __Natives__.windowProxy(target, handler);
					}) : (function createProxy(target, handler) {
						if (types.hasKey(handler, [
								'getPrototypeOf', 'setPrototypeOf', 'isExtensible', 'preventExtensions', 
								'getOwnPropertyDescriptor', 'defineProperty', 'has', 'get', 'set', 'deleteProperty', 
								'enumerate', 'ownKeys', 'construct'
						])) {
							throw new types.TypeError("Proxies not available.");
						};
						
						if (handler.apply) {
							var _caller = function caller(/*paramarray*/) {
								return handler.apply.call(handler, target, this, arguments);
							};
							//__Types.defineProperty(_caller, '__isProxy__', {value: true});
							return _caller;
						};
						
						// "Invisible proxy"
						//return types.createObject(target, {__isProxy__: {value: true}});
						return types.createObject(target);
					})));
				
				//===================================
				// Bind/Unbind
				//===================================
				
				types.bind = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'object',
										optional: false,
										description: "An object.",
									},
									fn: {
										type: 'function',
										optional: false,
										description: "A function.",
									},
									args: {
										type: 'arrayof(any)',
										optional: true,
										description: "Function arguments.",
									},
								},
								returns: 'object',
								description: "Binds a function to an object (so that 'this' will always be that object) and returns the resulting function. The original function is preserved in the property '__ORIGINAL_FUNCTION__'.",
					}
					//! END_REPLACE()
					, function bind(obj, fn, /*optional*/args) {
						fn = types.unbind(fn);
						if (fn === null) {
							return null;
						};
						var newFn;
						if (__Natives__.functionBind) {
							if (args) {
								newFn = __Natives__.functionBind.apply(fn, types.append([obj], args));
							} else {
								newFn = __Natives__.functionBind.call(fn, obj);
							};
						} else {
							if (args) {
								newFn = function(/*fixed to 'args'*/) {
									return fn.apply(obj, args);
								};
							} else {
								newFn = function(/*paramarray*/) {
									return fn.apply(obj, arguments);
								};
							};
						};
						for (var key in fn) {
							if (types.hasKey(fn, key)) {
								newFn[key] = fn[key];
							};
						};
						if (types.hasDefinePropertyEnabled()) {
							types.defineProperty(newFn, '__ORIGINAL_FUNCTION__', {
								writable: false,
								configurable: false,
								enumerable: false,
								value: fn,
							});
						} else {
							// NOTE: Will enumerate
							newFn.__ORIGINAL_FUNCTION__ = fn;
						};
						return newFn;
					});
				
				types.unbind = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									fn: {
										type: 'function',
										optional: false,
										description: "A function.",
									},
								},
								returns: 'object',
								description: "Unbinds a function and returns the resulting function. In fact, it returns the value of its '__ORIGINAL_FUNCTION__' attribute. Owned properties are also copied.",
					}
					//! END_REPLACE()
					, function unbind(fn) {
						if (!types.isFunction(fn)) {
							return null;
						};
						var oldFn = fn.__ORIGINAL_FUNCTION__;
						if (oldFn) {
							for (var key in fn) {
								if (types.hasKey(fn, key)) {
									oldFn[key] = fn[key];
								};
							};
							fn = oldFn;
						};
						return fn;
					});

				//===================================
				// Box/Unbox
				//===================================
				types.box = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									value: {
										type: 'any',
										optional: false,
										description: "A value.",
									},
								},
								returns: 'Doodad.Types.box',
								description: "Box a value inside a box object.",
					}
					//! END_REPLACE()
					, types.INIT(types.Type.$inherit(
						/*typeProto*/
						{
							$TYPE_NAME: 'box',
						},
						/*instanceProto*/
						{
							_new: function box(value) {
								if (value instanceof types.box) {
									value.setAttributes(this);
									value = value.__BOXED_VALUE__;
								};
								if (types.hasDefinePropertyEnabled()) {
									types.defineProperty(this, '__BOXED_VALUE__', {
										writable: false,
										configurable: false,
										enumerable: false,
										value: value,
									});
								} else {
									// NOTE: Will enumerate
									this.__BOXED_VALUE__ = value;
								};
							},
							
							setAttributes: function setAttributes(dest, /*optional*/override) {
								for (var key in this) {
									if ((key !== '__BOXED_VALUE__') && types.hasKey(this, key) && (override || !types.hasKey(dest, key))) {
										dest[key] = this[key];
									};
								};
							},
							valueOf: function valueOf() {
								return this.__BOXED_VALUE__;
							},
							setValue: function setValue(value, /*optional*/override) {
								// NOTE: "box" is immutable
								var type = types.getType(this);
								var newBox = new type(value);
								this.setAttributes(newBox, override);
								return newBox;
							},
							clone: function clone() {
								return this.setValue(this.__BOXED_VALUE__);
							},
						},
						/*constructor*/
						function box(value) {
							if (this instanceof types.box) {
								return (this._new(value) || this);
							} else {
								return new types.box(value);
							};
						}
					)));
				
				types.unbox = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									value: {
										type: 'Doodad.Types.box',
										optional: false,
										description: "A value.",
									},
								},
								returns: 'object',
								description: "Extract the value of a box object.",
					}
					//! END_REPLACE()
					, function unbox(value) {
						return ((value instanceof types.box) ? value.__BOXED_VALUE__ : value);
					});
					
					
				types.Set = (__Natives__.windowSet || types.Type.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'Set',
					},
					/*instanceProto*/
					{
						size: 0,
						__ar: null,

						_new: function _new(/*optional*/ar) {
							if (types.isNothing(ar)) {
								this.__ar = [];
							} else if (ar instanceof types.Set) {
								this.__ar = ar.values();
							} else if (ar instanceof types.Map) {
								this.__ar = ar.entries();
							} else if (types.isArrayLike(ar)) {
								this.__ar = tools.unique(ar);
							} else {
								throw types.TypeError("Invalid array.");
							};
						},
						has: function has(value) {
							for (var i = 0; i < this.__ar.length; i++) {
								if (this.__ar[i] === value) {
									return true;
								};
							};
							return false;
						},
						add: function add(value) {
							if (!this.has(value)) {
								this.__ar.push(value);
								this.size++;
							};
							return this;
						},
						delete: function _delete(value) {
							for (var i = 0; i < this.__ar.length; i++) {
								if (this.__ar[i] === value) {
									this.__ar.splice(i, 1);
									this.size--;
									return true;
								};
							};
							return false;
						},
						clear: function clear() {
							this.__ar = [];
							this.size = 0;
						},
						keys: function keys() {
							return types.clone(this.__ar);
						},
						values: function values() {
							return types.clone(this.__ar);
						},
						entries: function entries() {
							return types.map(this.__ar, function(item) {
								return [item, item];
							});
						},
						forEach: function forEach(callbackFn, /*optional*/thisObj) {
							for (var i = 0; i < this.__ar.length; i++) {
								var value = this.__ar[i];
								callbackFn.call(thisObj, value, value, this);
							};
						},
					},
					/*constructor*/
					function _new(ar) {
						this.__ar = ar || [];
					}
				));
				
				types.Map = (__Natives__.windowMap || types.Type.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'Map',
					},
					/*instanceProto*/
					{
						size: 0,
						__keys: null,
						__values: null,

						_new: function _new(ar) {
							if (types.isNothing(ar)) {
								// Do nothing
							} else if (ar instanceof types.Map) {
								this.__keys = types.clone(ar.__keys);
								this.__values = types.clone(ar.__values);
								return;
							} else if (ar instanceof types.Set) {
								ar = ar.__ar;
							} else if (types.isArrayLike(ar)) {
								// Do nothing
							} else {
								throw types.TypeError("Invalid array.");
							};

							this.__keys = [];
							this.__values = [];
							
							if (ar) {
								for (var i = 0; i < ar.length; i++) {
									var item = ar[i];
									this.__keys.push(item[0]);
									this.__values.push(item[1]);
								};
							};
						},
						has: function has(key) {
							for (var i = 0; i < this.__keys.length; i++) {
								if (this.__keys[i] === key) {
									return true;
								};
							};
							return false;
						},
						get: function get(key) {
							for (var i = 0; i < this.__keys.length; i++) {
								if (this.__keys[i] === key) {
									return this.__values[i];
								};
							};
						},
						set: function set(key, value) {
							if (!this.has(key)) {
								this.__keys.push(key);
								this.__values.push(value);
								this.size++;
							};
							return this;
						},
						delete: function _delete(key) {
							for (var i = 0; i < this.__keys.length; i++) {
								if (this.__keys[i] === key) {
									this.__keys.splice(i, 1);
									this.__values.splice(i, 1);
									this.size--;
									return true;
								};
							};
							return false;
						},
						clear: function clear() {
							this.__keys = [];
							this.__values = [];
							this.size = 0;
						},
						keys: function keys() {
							return types.clone(this.__keys);
						},
						values: function values() {
							return types.clone(this.__values);
						},
						entries: function entries() {
							var values = this.__values;
							return types.map(this.__keys, function(key, i) {
								return [key, values[i]];
							});
						},
						forEach: function forEach(callbackFn, /*optional*/thisObj) {
							for (var i = 0; i < this.__keys.length; i++) {
								callbackFn.call(thisObj, this.__values[i], this.__keys[i], this);
							};
						},
					}
				));
				
				//===================================
				// Callback base type
				//===================================
				
				types.Callback = root.DD_DOC(
					//! REPLACE_BY("null")
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
					});
				
				// NOTE: Will be replaced by "Doodad.js"
				types.makeInside = function(/*optional*/obj, fn) {
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
	};
	
	if (!global.process) {
		// <PRB> export/import are not yet supported in browsers
		global.DD_MODULES = exports.add(global.DD_MODULES);
	};
})();