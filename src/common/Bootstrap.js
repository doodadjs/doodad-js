//! REPLACE_BY("// Copyright 2016 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Bootstrap.js - Bootstrap module
// Project home: https://github.com/doodadjs/
// Author: Claude Petit, Quebec city
// Contact: doodadjs [at] gmail.com
// Note: I'm still in alpha-beta stage, so expect to find some bugs or incomplete parts !
// License: Apache V2
//
//	Copyright 2016 Claude Petit
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

(function(getEvals) {
	var global = this;

	var exports = {};
	
	//! BEGIN_REMOVE()
	if ((typeof process === 'object') && (typeof module === 'object')) {
	//! END_REMOVE()
		//! IF_SET("serverSide")
			module.exports = exports;
		//! END_IF()
	//! BEGIN_REMOVE()
	};
	//! END_REMOVE()

	var MODULE_NAME = 'doodad-js';
	var MODULE_VERSION;
	//! INJECT("MODULE_VERSION = " + TO_SOURCE(VERSION('doodad-js')) + ";")

	// V8: Increment maximum number of stack frames
	// Source: https://code.google.com/p/v8-wiki/wiki/JavaScriptStackTraceApi
	if (Error.stackTraceLimit < 50) {
		Error.stackTraceLimit = 50;
	};
	
	exports.createRoot = function createRoot(/*optional*/modules, /*optional*/_options) {
		"use strict";
		
		var __Internal__ = {
			// "isNativeFunction", "isCustomFunction"
			hasIncompatibleFunctionToStringBug: false,
			
			// "createObject", "getPrototypeOf", "setPrototypeOf"
			hasProto: !!({}.__proto__),

			// Number.MAX_SAFE_INTEGER and MIN_SAFE_INTEGER polyfill
			SAFE_INTEGER_LEN: (global.Number.MAX_VALUE ? global.Number.MAX_VALUE.toString(2).replace(/[(]e[+]\d+[)]|[.]|[0]/g, '').length : 53),   // TODO: Find a mathematical way

			MIN_BITWISE_INTEGER: 0,
			MAX_BITWISE_INTEGER: ((~0) >>> 0), //   MAX_BITWISE_INTEGER | 0 === -1  ((-1 >>> 0) === 0xFFFFFFFF)
			
			tempDocs: [],
			tempTypes: [],  // types to register into Doodad.Types
			
			DD_ASSERT: null,
		};

		__Internal__.BITWISE_INTEGER_LEN = global.Math.round(global.Math.log(__Internal__.MAX_BITWISE_INTEGER) / global.Math.LN2, 0);

		var _shared = {
			// Secret value used to load modules, ...
			SECRET: null,

			// NOTE: Preload of immediatly needed natives.
			Natives: {
				// "has", "isCustomFunction", "isNativeFunction"
				objectHasOwnProperty: global.Object.prototype.hasOwnProperty,
				
				// "isCustomFunction", "isNativeFunction", "isArrowFunction", "getFunctionName"
				functionToString: global.Function.prototype.toString,
			},
		};
		
		// Temporary. Will get replaced.
		var types = {
			},
			
			tools = {
			};
			
		//===================================
		// Temporary DD_DOC
		//===================================
		//! REPLACE_BY("__Internal__.DD_DOC = function(d,v) {return v;}")
		__Internal__.DD_DOC = function DD_DOC(doc, value) {
			value = Object(value);
			__Internal__.tempDocs.push([doc, value]);
			return value;
		};
		//! END_REPLACE()

		//===================================
		// Temporary REGISTER (for Doodad.Types)
		//===================================
		__Internal__.REGISTER = function REGISTER(type) {
			var name = (types.getTypeName && types.getTypeName(type) || types.getFunctionName(type));
			if (types.isType && types.isType(type)) {
				if ((type === types.Namespace) || (types.baseof && types.baseof(types.Namespace, type))) {
					type = types.INIT(type, [null, name, 'Doodad.Types.' + name]); // TODO: DD_PARENT
				} else {
					type = types.INIT(type);
				};
			};
			types[name] = type;
			__Internal__.tempTypes.push(type);
			return type;
		};

		//===================================
		// Native functions
		//===================================
		// <PRB> "function.prototype.toString called on incompatible object" raised with some functions (EventTarget, Node, HTMLElement, ...) ! Don't know how to test for compatibility.
		try {
			if (typeof global.Event === 'function') {
				_shared.Natives.functionToString.call(global.Event);
			};
		} catch(ex) {
			__Internal__.hasIncompatibleFunctionToStringBug = true;
		};
		
		types.isFunction = __Internal__.DD_DOC(
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
					description: "Returns 'true' if object is a function, 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isFunction(obj) {
				return (typeof obj === 'function');
			});
		
		types.isNativeFunction = __Internal__.DD_DOC(
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
					description: "Returns 'true' if object is a native function, 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isNativeFunction(obj) {
				if (types.isFunction(obj)) {
					var str;
					if (__Internal__.hasIncompatibleFunctionToStringBug && _shared.Natives.objectHasOwnProperty.call(obj, 'toString') && types.isNativeFunction(obj.toString)) {
						str = obj.toString();
					} else {
						str = _shared.Natives.functionToString.call(obj);
					};
					var index1 = str.indexOf('{') + 1,
						index2 = str.indexOf('[native code]', index1);
					if (index2 < 0) {
						return false;
					};
					str = str.slice(index1, index2);
					var len = str.length;
					for (var i = 0; i < len; i++) {
						var chr = str[i];
						if ((chr !== '\n') && (chr !== '\r') && (chr !== '\t') && (chr !== ' ')) {
							return false;
						};
					};
					return true;
				} else {
					return false;
				};
			});
		
		types.isCustomFunction = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a custom function (non-native), 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isCustomFunction(obj) {
				if (types.isFunction(obj)) {
					var str;
					if (__Internal__.hasIncompatibleFunctionToStringBug && types.has(obj, 'toString') && types.isNativeFunction(obj.toString)) {
						str = obj.toString();
					} else {
						str = _shared.Natives.functionToString.call(obj);
					};
					var index1 = str.indexOf('{') + 1,
						index2 = str.indexOf('[native code]', index1);
					if (index2 < 0) {
						return true;
					};
					str = str.slice(index1, index2);
					var len = str.length;
					for (var i = 0; i < len; i++) {
						var chr = str[i];
						if ((chr !== '\n') && (chr !== '\r') && (chr !== '\t') && (chr !== ' ')) {
							return true;
						};
					};
				};
				return false;
			});
		
		types.isArrowFunction = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is an arrow function, 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isArrowFunction(obj) {
				if (types.isFunction(obj)) {
					var str;
					if (__Internal__.hasIncompatibleFunctionToStringBug && types.has(obj, 'toString') && types.isNativeFunction(obj.toString)) {
						str = obj.toString();
					} else {
						str = _shared.Natives.functionToString.call(obj);
					};
					return !/^[(]?function(\s+([^(\s]*)[^(]*)?\(/.test(str);
				};
				return false;
			});
		
		types.getFunctionName = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
						params: {
							obj: {
								type: 'function',
								optional: false,
								description: "A function.",
							},
						},
						returns: 'string',
						description: "Returns function name.",
			}
			//! END_REPLACE()
			, function getFunctionName(obj) {
				if (types.isFunction(obj)) {
					if ('name' in obj) {
						return obj.name;
					} else {
						// Internet Explorer
						var str;
						if (__Internal__.hasIncompatibleFunctionToStringBug && types.has(obj, 'toString') && types.isNativeFunction(obj.toString)) {
							str = obj.toString();
						} else {
							str = _shared.Natives.functionToString.call(obj);
						};
						var result = str.match(/function\s+([^(\s]*)[^(]*\(/);
						return result && result[1] || null;
					};
				} else {
					return null;
				};
			});
		
		types.isNothing = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is 'null' or 'undefined'. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isNothing(obj) {
				return (obj == null);
			});
		
		// FUTURE: "types.extend(_shared.Natives, {...})" when "Object.assign" will be accessible on every engine
		_shared.Natives = {
			// "everywhere"
			windowObject: global.Object,

			// "hasKeyInherited"
			windowObjectPrototype: global.Object.prototype,
			
			// "has", "isCustomFunction", "isNativeFunction"
			// FUTURE: Remove when "Natives" will be "types.extend"ed
			objectHasOwnProperty: global.Object.prototype.hasOwnProperty,
			
			// "isCustomFunction", "isNativeFunction", "isArrowFunction", "getFunctionName"
			// FUTURE: Remove when "Natives" will be "types.extend"ed
			functionToString: global.Function.prototype.toString,
				
			// "extend"
			objectAssign: (types.isNativeFunction(global.Object.assign) ? global.Object.assign : undefined),
			
			// "createObject"
			objectCreate: global.Object.create,
			
			// "hasDefinePropertyEnabled" and "defineProperty"
			objectDefineProperty: (types.isNativeFunction(global.Object.defineProperty) ? global.Object.defineProperty : undefined),
			
			// "defineProperties"
			objectDefineProperties: (types.isNativeFunction(global.Object.defineProperties) ? global.Object.defineProperties : undefined),
			
			// "allKeys"
			objectGetOwnPropertyNames: (types.isNativeFunction(global.Object.getOwnPropertyNames) ? global.Object.getOwnPropertyNames : undefined),
			
			// "getOwnPropertyDescriptor"
			objectGetOwnPropertyDescriptor: (types.isNativeFunction(global.Object.getOwnPropertyDescriptor) ? global.Object.getOwnPropertyDescriptor : undefined),
			
			// "getPrototypeOf"
			objectGetPrototypeOf: (types.isNativeFunction(global.Object.getPrototypeOf) ? global.Object.getPrototypeOf : undefined),
			
			// "isPrototypeOf"
			objectIsPrototypeOf: (types.isNativeFunction(global.Object.prototype.isPrototypeOf) ? global.Object.prototype.isPrototypeOf : undefined),
			
			// "keys"
			objectKeys: (types.isNativeFunction(global.Object.keys) ? global.Object.keys : undefined),
			
			// "isEnumerable", "symbols"
			objectPropertyIsEnumerable: (types.isNativeFunction(global.Object.prototype.propertyIsEnumerable) ? global.Object.prototype.propertyIsEnumerable : undefined),
			
			// "setPrototypeOf"
			objectSetPrototypeOf: (types.isNativeFunction(global.Object.setPrototypeOf) ? global.Object.setPrototypeOf : undefined),
			
			// "isNumber", "isDate", "isArray", "isObject", "isJsObject", "isCallable"
			objectToString: global.Object.prototype.toString,
			
			// "isArray"
			arrayIsArray: (global.Array && types.isNativeFunction(global.Array.isArray) ? global.Array.isArray : undefined),

			// "isArray"
			windowArray: (types.isNativeFunction(global.Array) ? global.Array : undefined),
			
			// "isBoolean"
			windowBoolean: (types.isNativeFunction(global.Boolean) ? global.Boolean : undefined),
			
			// "isDate"
			windowDate: (types.isNativeFunction(global.Date) ? global.Date : undefined),
			
			// "createErrorType", "isError"
			windowError: (global.Error || Error), // NOTE: "node.js" does not include "Error" in "global".

			windowTypeError: (types.isNativeFunction(global.TypeError) ? global.TypeError : undefined),
			
			// "isNumber", "toInteger"
			windowNumber: global.Number,
			
			// "isString"
			windowString: (types.isNativeFunction(global.String) ? global.String : undefined),
			
			// "hasSymbols", "isSymbol", "getSymbol"
			windowSymbol: (types.isNativeFunction(global.Symbol) ? global.Symbol : undefined),
			
			// "getSymbolFor"
			symbolFor: (types.isNativeFunction(global.Symbol) && types.isNativeFunction(global.Symbol['for']) ? global.Symbol['for'] : undefined),
			
			// "getSymbolKey", "symbolIsGlobal"
			symbolKeyFor: (types.isNativeFunction(global.Symbol) && types.isNativeFunction(global.Symbol.keyFor) ? global.Symbol.keyFor : undefined),
			
			// "getSymbolFor", "getSymbolKey"
			//windowWeakMap: (types.isNativeFunction(global.WeakMap) ? global.WeakMap : undefined),
			
			// "isNaN"
			numberIsNaN: (global.Number && types.isNativeFunction(global.Number.isNaN) ? global.Number.isNaN : undefined),

			// "isFinite"
			numberIsFinite: (global.Number && types.isNativeFunction(global.Number.isFinite) ? global.Number.isFinite : undefined),
			
			// "append"
			arrayPush: (global.Array && global.Array.prototype || []).push,
			
			// "isInteger"
			numberIsInteger: (global.Number && types.isNativeFunction(global.Number.isInteger) ? global.Number.isInteger : undefined),

			// "trim"
			stringTrim: (types.isNativeFunction(global.String.prototype.trim) ? global.String.prototype.trim : undefined),
			
			// "depthExtend"
			functionBind: global.Function.prototype.bind,
			
			// "isSafeInteger"
			numberIsSafeInteger: (types.isNativeFunction(global.Number.isSafeInteger) ? global.Number.isSafeInteger : undefined),

			// "isSafeInteger", "toInteger", "toFloat"
			mathFloor: global.Math.floor,
			mathAbs: global.Math.abs,
			mathPow: global.Math.pow,
			
			// "sealObject"
			objectSeal: (types.isNativeFunction(global.Object.seal) ? global.Object.seal : undefined),
			
			// "isFrozen"
			objectIsFrozen: (types.isNativeFunction(global.Object.isFrozen) ? global.Object.isFrozen : undefined),
			
			// "freezeObject"
			objectFreeze: (types.isNativeFunction(global.Object.freeze) ? global.Object.freeze : undefined),
			
			// "isExtensible"
			objectIsExtensible: (types.isNativeFunction(global.Object.isExtensible) ? global.Object.isExtensible : undefined),

			// "preventExtensions"
			objectPreventExtensions: (types.isNativeFunction(global.Object.preventExtensions) ? global.Object.preventExtensions : undefined),
			
			// "allSymbols", "symbols"
			objectGetOwnPropertySymbols: (types.isNativeFunction(global.Object.getOwnPropertySymbols) ? global.Object.getOwnPropertySymbols : undefined),
			
			// "isSafeInteger"
			numberMaxSafeInteger: global.Number.MAX_SAFE_INTEGER || global.Math.pow(2, __Internal__.SAFE_INTEGER_LEN) - 1,
			numberMinSafeInteger: global.Number.MIN_SAFE_INTEGER || -global.Math.pow(2, __Internal__.SAFE_INTEGER_LEN) + 1,
			
			// "hasProxies", "hasProxyEnabled", "createProxy"
			windowProxy: (types.isNativeFunction(global.Proxy) ? global.Proxy : undefined),
		};

		//===================================
		// For old browsers
		//===================================
		
		if (!_shared.Natives.objectGetPrototypeOf || !_shared.Natives.objectSetPrototypeOf) {
			_shared.Natives.objectGetPrototypeOf = undefined;
			_shared.Natives.objectSetPrototypeOf = undefined;
			_shared.Natives.objectIsPrototypeOf = undefined;
		};
		
//IE8		//===================================
//IE8		// IE 8 Bug
//IE8		//===================================
//IE8		
//IE8		try {
//IE8			_shared.Natives.objectDefineProperty({}, 'test', {value: 1});
//IE8		} catch(ex) {
//IE8			_shared.Natives.objectDefineProperty = undefined;
//IE8			_shared.Natives.objectDefineProperties = undefined;
//IE8			_shared.Natives.objectGetOwnPropertyDescriptor = undefined;
//IE8		};

		//===================================
		// Eval
		//===================================
		
		// WARNING: It is for compatibility purpose only. It is NOT to be used with arbitrary expressions.
		__Internal__.evals = getEvals();
		
		types.eval = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
						params: {
							expr: {
								type: 'string',
								optional: false,
								description: "Expression",
							},
							ctx: {
								type: 'any',
								optional: true,
								description: "Context, accessible by the expression from the variable 'ctx'.",
							},
						},
						returns: 'string',
						description: "Evaluates an expression accross JS engines. NOT to be used with arbitrary expressions.",
			}
			//! END_REPLACE()
			, function _eval(expr, /*optional*/ctx) {
				if (ctx) {
//					types.freezeObject(ctx);
					return __Internal__.evals.evalWithCtx(ctx, expr);
				} else {
					return __Internal__.evals.eval(expr);
				};
			});

		types.evalStrict = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							expr: {
								type: 'string',
								optional: false,
								description: "Expression",
							},
							ctx: {
								type: 'any',
								optional: true,
								description: "Context, accessible by the expression from the variable 'ctx'.",
							},
						},
						returns: 'string',
						description: "Evaluates an expression accross JS engines in strict mode. NOT to be used with arbitrary expressions.",
			}
			//! END_REPLACE()
			, function evalStrict(expr, /*optional*/ctx) {
				if (ctx) {
					return __Internal__.evals.evalWithCtxStrict(ctx, expr);
				} else {
					return __Internal__.evals.evalStrict(expr);
				};
			});

		//===================================
		// String Tools
		//===================================
		
		tools.split = __Internal__.DD_DOC(
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
					};
					if ((limit > 0) && (str.length <= strLen)) {
						// Remaining
						result[result.length] = str;
					};
				};
				return result;
			});

		tools.trim = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
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
								type: 'string',
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

				if (types.isNothing(chr)) {
					chr = ' ';
				};
				if (types.isNothing(count)) {
					count = Infinity;
				};
				
				if (isArray || (arguments.length > 1)) {
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
					
				} else if (_shared.Natives.stringTrim && (chr === ' ') && !direction && (count === Infinity)) {
					return _shared.Natives.stringTrim.call(str);
				} else {
					var i = 0,
						x = 0,
						chrLen = chr.length;
					if (chrLen <= 0) {
						chrLen = 1;
					};
					if (!direction || (direction > 0)) {
						while ((x < count) && (i < str.length) && (str.slice(i, i + chrLen) === chr)) {
							i += chrLen;
							x++;
						};
					};
					var j = str.length - chrLen,
						x = 0;
					if (!direction || (direction < 0)) {
						while ((x < count) && (j > i) && (j >= 0) && (str.slice(j, j + chrLen) === chr)) {
							j -= chrLen;
							x++;
						};
					};
					return str.slice(i, j + chrLen);
				};
			});

		//===================================
		// Array Tools
		//===================================
	
		tools.map = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
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
								"  obj (arraylike,object,Map,Set): A reference to the object"
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
						if (_shared.Natives.arrayMap) {
							return _shared.Natives.arrayMap.call(obj, fn, thisObj);
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

		//==================================
		// Conversion
		//==================================
		
		types.toBoolean = __Internal__.DD_DOC(
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
						returns: 'bool',
						description: "Converts a value to a boolean.",
			}
			//! END_REPLACE()
			, function toBoolean(obj) {
				return (obj === 'true') || !!(+obj);
			});

		types.toInteger = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
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
						returns: 'number',
						description: "Converts the value to an integer.",
			}
			//! END_REPLACE()
			, function toInteger(obj) {
				// Source: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/from
				var number = _shared.Natives.windowNumber(obj);
				if (types.isNaN(number)) {
					return 0;
				};
				if ((number === 0) || !types.isFinite(number)) {
					return number;
				};
				return (number > 0 ? 1 : -1) * _shared.Natives.mathFloor(_shared.Natives.mathAbs(number));
			});
		
		types.toFloat = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							obj: {
								type: 'any',
								optional: false,
								description: "A value to convert.",
							},
							precision: {
								type: 'integer',
								optional: true,
								description: "Float precision",
							},
						},
						returns: 'number',
						description: "Converts the value to a float.",
			}
			//! END_REPLACE()
			, function toFloat(obj, /*optional*/precision) {
				var number = _shared.Natives.windowNumber(obj);
				if (types.isNaN(number)) {
					return 0.0;
				} else {
					if (!types.isNothing(precision)) {
						precision = _shared.Natives.mathPow(10, precision);
						number = _shared.Natives.mathFloor(number * precision) / precision;
					};
					return number;
				};
			});
		
		types.toString = __Internal__.DD_DOC(
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
						returns: 'string',
						description: "Converts the value to a string.",
			}
			//! END_REPLACE()
			, function toString(obj) {
				return _shared.Natives.windowString(obj);
			});
			
		//===================================
		// Format functions
		//===================================
		
		tools.format = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
						params: {
							message: {
								type: 'string',
								optional: false,
								description: "Error message",
							},
							params: {
								type: 'arrayof(any),objectof(any)',
								optional: false,
								description: "Parameters of the message",
							},
						},
						returns: 'string',
						description: "Formats message with parameters.",
			}
			//! END_REPLACE()
			, function format(message, params) {
				// WARNING: Don't use "root.DD_ASSERT" inside this function !!!
				if (!types.isString(message) || (!types.isNothing(params) && !types.isArrayLike(params) && !types.isObjectLike(params))) {
					// Invalid parameters. DO NOT CALL root.DD_ASSERT
					return '';
				};
				var result = '',
					pos,
					lastPos = 0,
					isKey = false;
				while ((pos = message.indexOf('~', lastPos)) >= 0) {
					var key = message.slice(lastPos, pos);
					if (isKey) {
						if (params && key.length) {
							result += types.toString(params[key]);
						} else {
							result += '~';
						};
						isKey = false;
					} else {
						result += key;
						isKey = true;
					};
					lastPos = pos + 1;
				};
				return isKey ? result : result + message.slice(lastPos);
			});
		
		//===================================
		// ASSERTS functions
		//===================================
			
		var __ASSERT__ = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							expr: {
								type: 'any',
								optional: false,
								description: "Expression",
							},
							message: {
								type: 'string',
								optional: true,
								description: "Error message",
							},
							params: {
								type: 'arrayof(any),objectof(any)',
								optional: true,
								description: "Parameters of the error message",
							},
						},
						returns: 'undefined',
						description: "Throws 'AssertionFailed' when expression resolves to 'false'. Does nothing otherwise.",
			}
			//! END_REPLACE()
			, function ASSERT(expr, /*optional*/message, /*optional*/params) {
				// IMPORTANT: You must use it like this : 
				//          root.DD_ASSERT && root.DD_ASSERT(expr, message, params);
				
				// WARNING: Don't use "root.DD_ASSERT" inside this function !!!
				if (!expr) {
					if (types.isString(message)) {
						message = tools.format(message, params || []);
					};
					debugger;
					throw new types.AssertionFailed(message);
				};
			});
		
		//==================
		// Utilities
		//==================
		
		// <PRB> JS has no function to test for primitives
		types.isPrimitive = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a primitive value. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isPrimitive(obj) {
				if (types.isNothing(obj)) {
					return true;
				};
				// Source: http://cwestblog.com/2011/08/02/javascript-isprimitive-function/
				var type = (typeof obj);
				return (type !== "object") && (type !== "function");
			});
		
		types.isNumber = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a number (integer or float). Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (_shared.Natives.windowNumber ? (function isNumber(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				if (typeof obj === 'number') {
					return (obj === obj); // means "not NaN"
				} else if ((typeof obj === 'object') && (obj instanceof _shared.Natives.windowNumber)) {
					obj = obj.valueOf();
					return (obj === obj); // means "not NaN"
				} else {
					return false;
				};
			}) : (function isNumber(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				obj = _shared.Natives.windowObject(obj).valueOf();
				// Source: Jeremie Patonnier, MDN Documentation 
				return (+obj === obj);
			})));
		
		types.isInteger = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 3,
						params: {
							obj: {
								type: 'any',
								optional: false,
								description: "An object to test for.",
							},
						},
						returns: 'bool',
						description: "Returns 'true' if object is an integer. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isInteger(obj) {
				// <PRB> "Number.isInteger(Object(1)) === false", but "Object(1) instanceof Number === true" !!!
				if (!types.isNumber(obj)) {
					return false;
				};
				if (typeof obj === 'object') {
					obj = obj.valueOf();
				};
				if (_shared.Natives.numberIsInteger) {
					return _shared.Natives.numberIsInteger(obj);
				} else {
					if (!types.isFinite(obj)) {
						return false;
					};
					return (obj === _shared.Natives.mathFloor(obj));
				};
			});
		
		types.isSafeInteger = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is an integer that correctly fits into 'Number'. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isSafeInteger(obj) {
				// <PRB> "Number.isSafeInteger(Object(1)) === false", but "Object(1) instanceof Number === true" !!!
				if  (!types.isInteger(obj)) {
					return false;
				};
				if (typeof obj === 'object') {
					obj = obj.valueOf();
				};
				if (_shared.Natives.numberIsSafeInteger) {
					return _shared.Natives.numberIsSafeInteger(obj);
				} else {
					return (obj >= _shared.Natives.numberMinSafeInteger) && (obj <= _shared.Natives.numberMaxSafeInteger);
				};
			});
		
		types.getSafeIntegerLen = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'object',
						description: "Returns 'len' (in bits), 'min' and 'max' values of a safe integer.",
			}
			//! END_REPLACE()
			, function getSafeIntegerLen() {
				return {
					len: __Internal__.SAFE_INTEGER_LEN, 
					min: _shared.Natives.numberMinSafeInteger, 
					max: _shared.Natives.numberMaxSafeInteger,
				};
			});
		
		types.getBitwiseIntegerLen = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'object',
						description: "Returns 'len' (in bits), 'min' and 'max' values of a bitwise integer.",
			}
			//! END_REPLACE()
			, function getBitwiseIntegerLen() {
				return {
					len: __Internal__.BITWISE_INTEGER_LEN, 
					min: __Internal__.MIN_BITWISE_INTEGER, 
					max: __Internal__.MAX_BITWISE_INTEGER,
				};
			});
		
		types.isFinite = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a finite number. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isFinite(obj) {
				if (!types.isNumber(obj)) {
					return false;
				};
				if (typeof obj === 'object') {
					obj = obj.valueOf();
				};
				if (_shared.Natives.numberIsFinite) {
					// <PRB> "Number.isFinite(Object(1)) === false", but "Object(1) instanceof Number === true" !!!
					return _shared.Natives.numberIsFinite(obj);
				} else {
					if (types.isDate(obj)) {
						return false;
					};
					// Source: http://es6-features.org/#NumberTypeChecking
					return (obj === obj) && (obj !== Infinity) && (obj !== -Infinity);
				};
			});
		
		types.isInfinite = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is an infinite number. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isInfinite(obj) {
				if (!types.isNumber(obj)) {
					return false;
				};
				if (typeof obj === 'object') {
					obj = obj.valueOf();
				};
				return (obj === Infinity) || (obj === -Infinity);
			});
		
		types.isFloat = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a float. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isFloat(obj) {
				if (!types.isFinite(obj)) {
					return false;
				};
				if (typeof obj === 'object') {
					obj = obj.valueOf();
				};
				return (obj !== (obj | 0));
			}),
		
		// <PRB> JS has no function to test for booleans
		types.isBoolean = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a boolean. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (_shared.Natives.windowBoolean ? (function isBoolean(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				if (typeof obj === 'boolean') {
					return true;
				} else if ((typeof obj === 'object') && (obj instanceof _shared.Natives.windowBoolean)) {
					return true;
				} else {
					return false;
				};
			}) : (function isBoolean(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				obj = _shared.Natives.windowObject(obj).valueOf();
				return ((obj === false) || (obj === true));
			})));
		
		// <PRB> JS has no function to test for strings
		types.isString = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a string. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (_shared.Natives.windowString ? (function isString(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				if (typeof obj === 'string') {
					return true;
				} else if ((typeof obj === 'object') && (obj instanceof _shared.Natives.windowString)) {
					return true;
				} else {
					return false;
				};
			}) : (function isString(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				return (typeof _shared.Natives.windowObject(obj).valueOf() === 'string');
			})));
		
		// <PRB> JS has no function to test for dates
		types.isDate = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a date. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (_shared.Natives.windowDate ? (function isDate(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				if ((typeof obj === 'object') && (obj instanceof _shared.Natives.windowDate)) {
					return true;
				} else {
					return false;
				};
			}) : (function isDate(obj) {
				return (_shared.Natives.objectToString.call(obj) === '[object Date]');
			})));
		
		types.isArray = (_shared.Natives.arrayIsArray || __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is an array. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (_shared.Natives.windowArray ? (function isArray(obj) {
				return !types.isNothing(obj) && (typeof obj === 'object') && (obj instanceof _shared.Natives.windowArray);
			}) : (function isArray(obj) {
				return (_shared.Natives.objectToString.call(obj) === '[object Array]');
			}))));

		types.isArrayLike = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is an array-like object. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isArrayLike(obj) {
				// Unbelievable : There is not an official way to detect an array-like object !!!!
				if (types.isNothing(obj)) {
					return false;
				};
				if (typeof obj === 'object') {
					var len = obj.length;
					return (typeof len === 'number') && ((len >>> 0) === len);
				} else if (typeof obj === 'string') {
					return true;
				} else {
					return false;
				};
			});
		
		// <PRB> JS has no function to test for errors
		types.isError = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is an error. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isError(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				return (typeof obj === 'object') && (obj instanceof _shared.Natives.windowError);
			});
		
		types.isNaN = (_shared.Natives.numberIsNaN || __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is 'NaN'. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isNaN(obj) {
				//     Unbelievable : There was no official way to detect NaN before ES6 !!!!
				// Source: http://stackoverflow.com/questions/2652319/how-do-you-check-that-a-number-is-nan-in-javascript
				// Explanation: NaN is the only object not equal to itself.
				return (obj !== obj);
			}));
		
		types.isCallable = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is callable. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isCallable(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				// Source: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/from
				return (typeof obj === 'function') || (_shared.Natives.objectToString.call(obj) === '[object Function]');
			});
			
		
		//===================================
		// Stack functions
		//===================================
		// <PRB> JS has no official stack trace. They are non-standardized strings.
		
		__Internal__.stackToString = function stackToString() {
			var str = '';
			var len = this.length;
			for (var i = 0; i < len; i++) {
				var trace = this[i];
				str += (i + ': function "' + (trace.functionName || '<unknown>') + '" in file "' + (trace.path || '<unknown>') + '" at line ' + (trace.lineNumber < 0 ? '<unknown>' : trace.lineNumber) + ', column ' + (trace.columnNumber < 0 ? '<unknown>' : trace.columnNumber) + '\n');
			};
			return str;
		};

		// NOTE: It removes native functions from the stack
		// <FUTURE> thread level
		__Internal__.parseStackRegEx = / at ([^\[(@ ]+)?( [\[]as [^\]]+[\]])? ?[(@]?(([a-zA-Z]+[:][\/][\/][\/]?[^\/]+[\/][^: ]+)|([A-Z][:][\\][^\\]+[\\][^:]+)|([\/][^\/]+[\/][^:]+)|eval code)( line ([0-9]+) [>] eval)?(([:])([0-9]+)([:])([0-9]+))?/gm;

		tools.parseStack = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							ex: {
								type: 'error, string',
								optional: false,
								description: "An error object.",
							},
						},
						returns: 'object',
						description: "Parses a stack trace and returns the result.",
			}
			//! END_REPLACE()
			, function parseStack(ex) {
				if (!types.isError(ex) && !types.isString(ex)) {
					throw new types.ParseError("Invalid error object or stack trace.");
				};
				
				var stack = ex;
				if (types.isError(ex)) {
					stack = ex.stack || null;
				};
				
				if (!stack) {
					return null;
				};
				
				// Google Chrome 39: "Error\n    at Object.Doodad.Tools.getCurrentScript (file:///F:/Doodad/test.html:38:72)\n    at file:///F:/Doodad/debug.js:17:25"
				// Firefox 34: "Doodad.Tools.getCurrentScript<@file:///F:/Doodad/test.html:38:72@file:///F:/Doodad/debug.js:17:18"
				// IE 11: "Error\n   at Doodad.Tools.getCurrentScript (file:///F:/Doodad/test.html:38:66)\n   at Global code (file:///F:/Doodad/debug.js:7:1)"
				// Opera 26: "Error: file:///F:/Doodad/debug.js\n    at Object.Doodad.Tools.getCurrentScript (file:///F:/Doodad/test.html:37:78)\n    at file:///F:/Doodad/debug.js:33:21"
				// Safari 5 (win): undefined
				
				// NOTE: Internet Explorer 11 doesn't return more than 10 call levels.
				
				var rawFunctionName,
					functionName, 
					pos,
					calls = [];
				//stack = 'Error\n    at D:\\Doodad\\node_modules\\doodad-js-mime\\src\\common\\Tools_Mime.js:83:122\n    at D:\\Doodad\\node_modules\\doodad-js-mime\\src\\common\\Tools_Mime.js:83:160\n    at D:\\Doodad\\node_modules\\doodad-js\\src\\common\\Types.js:1866:18\n    at Function._try (D:\\Doodad\\node_modules\\doodad-js\\src\\common\\Types.js:1864:15)\n    at Function._try [as try] (D:\\Doodad\\node_modules\\doodad-js\\src\\common\\Types.js:1933:28)\n    at Object.locate (D:\\Doodad\\node_modules\\doodad-js-mime\\src\\common\\Tools_Mime.js:81:28)\n    at Namespace.loadTypes (D:\\Doodad\\node_modules\\doodad-js-mime\\src\\common\\Tools_Mime.js:153:42)\n    at ModuleEntry.init [as objectInit] (D:\\Doodad\\node_modules\\doodad-js-mime\\src\\common\\Tools_Mime.js:184:18)\n    at Object.initNamespace (D:\\Doodad\\node_modules\\doodad-js\\src\\common\\Namespaces.js:567:28)\n    at loopInitModules (D:\\Doodad\\node_modules\\doodad-js\\src\\common\\Namespaces.js:767:33)\n    at D:\\Doodad\\node_modules\\doodad-js\\src\\common\\Namespaces.js:773:17'
				__Internal__.parseStackRegEx.lastIndex = 0;
				var call = __Internal__.parseStackRegEx.exec(stack);
				
				if (!call) {
					return null;
				};
				
				do {
					functionName = call[1] || '';
					pos = functionName.indexOf(' at '); // Not Firefox beginning of function name
					if (pos >= 0) {
						functionName = functionName.slice(pos + 4);
					};
					rawFunctionName = functionName + (call[2] || '');
					pos = functionName.lastIndexOf('@'); // Firefox beginning of file name
					if (pos >= 0) {
						functionName = functionName.slice(0, pos);
					} else {
						pos = functionName.lastIndexOf('('); // Not Firefox beginning of file name
						if (pos >= 0) {
							functionName = functionName.slice(0, pos);
						};
					};
					pos = functionName.indexOf('[as '); // Chrome name aliases
					if (pos >= 0) {
						functionName = functionName.slice(0, pos);
					};
					pos = functionName.lastIndexOf('/'); // Firefox namespaces
					if (pos >= 0) {
						functionName = functionName.slice(pos + 1);
					};
					pos = functionName.lastIndexOf('.'); // Chrome namespaces
					if (pos >= 0) {
						functionName = functionName.slice(pos + 1);
					};
					functionName = tools.trim(functionName);
					if (functionName.slice(0, 4) === 'new ') { // Chrome "new" operator
						functionName = functionName.slice(4);
					};
					var path = call[4],
						url,
						isSystemPath = false;
					if (!path) {
						// File system path
						isSystemPath = true;
						path = call[5];
						if (!path) {
							path = call[6];
						};
					};
					calls.push({
						rawFunctionName: rawFunctionName,
						functionName: ((functionName === "eval code") ? '' : functionName),
						path: (path || ''),
						lineNumber: types.toInteger(call[8] || call[11] || -1),
						columnNumber: types.toInteger(call[13] || -1),
						isSystemPath: isSystemPath,
					});
					
					call = __Internal__.parseStackRegEx.exec(stack);
				} while (call);
				
				calls.toString = __Internal__.stackToString;
				
				return calls;
			});

		tools.getStackTrace = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'object',
						description: "Returns the current stack trace, already parsed.",
			}
			//! END_REPLACE()
			, function getStackTrace() {
				try {
					throw new _shared.Natives.windowError("");
				} catch(ex) {
					var stack = null;
					if (ex.stack) {
						stack = tools.parseStack(ex.stack);
						if (stack) {
							stack.splice(0, 1);  // remove "getStackTrace" call entry
						};
					};
					return stack;
				};
			});
		
		//===================================
		// Objects
		//===================================
		
		// TODO: Remove "hasKeyInherited"
		types.hasKeyInherited = types.hasInherited = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 2,
						params: {
							obj: {
								type: 'any',
								optional: false,
								description: "An object.",
							},
							keys: {
								type: 'arrayof(string,Symbol),string,Symbol',
								optional: false,
								description: "Array of keys to test for.",
							},
						},
						returns: 'bool',
						description: "Returns 'true' when the object has or inherits one of the provided keys as own property. Object's prototype is ignored. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function hasInherited(obj, keys) {
				if (!types.isNothing(obj)) {
					obj = _shared.Natives.windowObject(obj);
					do {
						if (obj === _shared.Natives.windowObjectPrototype) {
							break;
						};
						if (types.has(obj, keys)) {
							return true;
						};
						obj = types.getPrototypeOf(obj);
					} while (obj);
				};
				
				return false;
			});
		
		// TODO: Remove "hasKey"
		types.has = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 2,
						params: {
							obj: {
								type: 'any',
								optional: false,
								description: "An object.",
							},
							keys: {
								type: 'arrayof(string,Symbol),string,Symbol',
								optional: false,
								description: "Key(s) to test for.",
							},
						},
						returns: 'bool',
						description: "Returns 'true' if one of the specified keys is an owned property of the object.",
			}
			//! END_REPLACE()
			, function has(obj, keys) {
				if (!types.isNothing(obj)) {
					obj = _shared.Natives.windowObject(obj);
					if (!types.isArray(keys)) {
						return _shared.Natives.objectHasOwnProperty.call(obj, keys);
					};
					var len = keys.length;
					if (!len) {
						return false;
					};
					for (var i = 0; i < len; i++) {
						if (i in keys) {
							var key = keys[i];
							if (_shared.Natives.objectHasOwnProperty.call(obj, key)) {
								return true;
							};
						};
					};
				};
				return false;
			});
		
		types.get = __Internal__.DD_DOC(
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
								type: 'string,Symbol',
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
						description: "Returns the value of an own property. If the own property doesn't exist, returns the value of the '_default' parameter.",
			}
			//! END_REPLACE()
			, function get(obj, key, /*optional*/_default, /*optional*/inherited) {
				if (types.isNothing(obj)) {
					return _default;
				};
				obj = _shared.Natives.windowObject(obj);
				var hasKey = (inherited ? types.hasInherited : types.has);
				if (hasKey(obj, key)) {
					return obj[key];
				} else {
					return _default;
				};
			});
		
		types.getDefault = __Internal__.DD_DOC(
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
							key: {
								type: 'string,Symbol',
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
				obj = _shared.Natives.windowObject(obj);
				var hasKey = (inherited ? types.hasInherited : types.has);
				if (hasKey(obj, key)) {
					return obj[key];
				} else {
					var descriptor = types.getPropertyDescriptor(obj, key);
					if (descriptor && !types.get(descriptor, 'writable') && !types.get(descriptor, 'get') && !types.get(descriptor, 'set') && types.get(descriptor, 'configurable')) {
						descriptor.value = _default;
						types.defineProperty(obj, key, descriptor);
					} else {
						obj[key] = _default;
					};
					return _default;
				};
			});
		
		
		types.isEnumerable = __Internal__.DD_DOC(
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
							key: {
								type: 'string,Symbol',
								optional: false,
								description: "A property name to test for.",
							},
						},
						returns: 'boolean',
						description: "Returns 'true' if the property of the object is enumerable. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (_shared.Natives.objectPropertyIsEnumerable ? function isEnumerable(obj, key) {
				return _shared.Natives.objectPropertyIsEnumerable.call(obj, key);
			} : function isEnumerable(obj, key) {
				return true;
			}));
		
//IE8		// "Object.keys" Polyfill from Mozilla Developer Network.
//IE8		// NOTE: "hasDontEnumBug" is "true" when a property in "defaultNonEnumerables" is still non-enumerable with "for (... in ...)" while being changed to an own property.
//IE8		__Internal__.hasDontEnumBug = !types.isEnumerable({ toString: null }, 'toString');
//IE8		__Internal__.defaultNonEnumerables = [
//IE8		  'toString',
//IE8		  'toLocaleString',
//IE8		  'valueOf',
//IE8		  'hasOwnProperty',
//IE8		  'isPrototypeOf',
//IE8		  'propertyIsEnumerable',
//IE8		  'constructor',
//IE8		  'length',
//IE8		];
		
		types.keys = __Internal__.DD_DOC(
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
						returns: 'arrayof(string)',
						description: "Returns an array of enumerable owned property names of an object. For array-like objects, index properties are excluded.",
			}
			//! END_REPLACE()
			, function keys(obj) {
				// Returns enumerable own properties (those not inherited).
				// Doesn't not include array items.
				if (types.isNothing(obj)) {
					return [];
				};
				
				var result,
					key;
					
				if (types.isArrayLike(obj)) {
					result = [];
					for (key in obj) {
						var number = Number(key);
						if ((types.isNaN(number) || !types.isFinite(number)) && types.has(obj, key)) {
							result.push(key);
						};
					};
				} else if (_shared.Natives.objectKeys) {
					 result = _shared.Natives.objectKeys(obj);
				} else {
					// Polyfill from Mozilla Developer Network.
					obj = _shared.Natives.windowObject(obj);
					result = [];
					for (key in obj) {
						if (types.has(obj, key)) {
							result.push(key);
						};
					};
				};
				
//IE8				if (__Internal__.hasDontEnumBug) {
//IE8					for (var i = 0; i < __Internal__.defaultNonEnumerables.length; i++) {
//IE8						key = __Internal__.defaultNonEnumerables[i];
//IE8						if (types.has(obj, key)) {
//IE8							result.push(key);
//IE8						};
//IE8					};
//IE8				};

				return result;
			});
		
		types.allKeys = (_shared.Natives.objectGetOwnPropertyNames || __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 2,
						params: {
							obj: {
								type: 'any',
								optional: false,
								description: "An object.",
							},
						},
						returns: 'arrayof(string)',
						description: "Returns every own property of an object.",
			}
			//! END_REPLACE()
			, (function allKeys(obj) {
				// NOTE: Can't get non-enumerables from the polyfill
				if (types.isNothing(obj)) {
					return [];
				};
				obj = _shared.Natives.windowObject(obj);
				var result = [];
				for (var key in obj) {
					if (types.has(obj, key)) {
						result.push(key);
					};
				};
				return result;
			})));

		types.allKeysInherited = __Internal__.DD_DOC(
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
						returns: 'arrayof(string)',
						description: "Returns an array of all inherited enumerable and not enumerable property names of an object.",
			}
			//! END_REPLACE()
			, function allKeysInherited(obj) {
				if (types.isNothing(obj)) {
					return [];
				};
				obj = _shared.Natives.windowObject(obj);
				return types.unique(types.allKeys(obj), types.allKeysInherited(types.getPrototypeOf(obj)));
			});
		
		types.symbols = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 2,
						params: {
							obj: {
								type: 'any',
								optional: false,
								description: "An object.",
							},
						},
						returns: 'arrayof(symbol)',
						description: "Returns an array of enumerable own property symbols.",
			}
			//! END_REPLACE()
			, function symbols(obj) {
				// FUTURE: "Object.symbols" ? (like "Object.keys")
				// FUTURE: Use "filter"
				if (types.isNothing(obj)) {
					return [];
				};
				var all = types.allSymbols(obj);
				var symbols = [];
				for (var i = 0; i < all.length; i++) {
					var symbol = all[i];
					if (types.isEnumerable(obj, symbol)) {
						symbols.push(symbol);
					};
				};
				return symbols;
			});
		
		types.allSymbols = __Internal__.DD_DOC(
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
						description: "Returns an array of enumerable and non-enumerable own property symbols.",
			}
			//! END_REPLACE()
			, (_shared.Natives.objectGetOwnPropertySymbols ? 
			function symbols(obj) {
				if (types.isNothing(obj)) {
					return [];
				};
				return _shared.Natives.objectGetOwnPropertySymbols(obj);
			}
			:
			function symbols(obj) {
				// Not supported
				return [];
			}));

		types.allSymbolsInherited = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
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
						returns: 'arrayof(symbol)',
						description: "Returns an array of all inherited enumerable and not enumerable symbols of an object.",
			}
			//! END_REPLACE()
			, function allSymbolsInherited(obj) {
				if (types.isNothing(obj)) {
					return [];
				};
				obj = _shared.Natives.windowObject(obj);
				return types.unique(types.allSymbols(obj), types.allSymbolsInherited(types.getPrototypeOf(obj)));
			});
		
		types.extend = (_shared.Natives.objectAssign || __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 2,
						params: {
							paramarray: {
								type: 'any',
								optional: false,
								description: "An object.",
							},
						},
						returns: 'object',
						description: "Extends the first object with owned properties of the other objects.",
			}
			//! END_REPLACE()
			, function extend(/*paramarray*/obj) {
				var result;
				if (!types.isNothing(obj)) {
					result = _shared.Natives.windowObject(obj);
					var len = arguments.length;
					for (var i = 1; i < len; i++) {
						obj = arguments[i];
						if (types.isNothing(obj)) {
							continue;
						};
						// Part of "Object.assign" Polyfill from Mozilla Developer Network.
						obj = _shared.Natives.windowObject(obj);
						var keys = types.append(types.keys(obj), types.symbols(obj));
						for (var j = 0; j < keys.length; j++) {
							var key = keys[j];
							result[key] = obj[key];
						};
					};
				};
				return result;
			}));
			
		__Internal__.hasDefinePropertyBug = (function() {
			// Safari 5
			if (_shared.Natives.objectDefineProperty) {
				var o = {};
				delete o.doodad; // in case of "doodad" is in "Object.prototype"
				_shared.Natives.objectDefineProperty(o, 'doodad', {value: 1, configurable: true});
				_shared.Natives.objectDefineProperty(o, 'doodad', {value: 2, configurable: true});
				return (o.doodad !== 2);
			} else {
				return false;
			};
		})();
		
		__Internal__.hasGetOwnPropertyRestrictionOnCaller = false;
		(function() {
			// Edge
			var ctx = {
				getOwnPropertyDescriptor: _shared.Natives.objectGetOwnPropertyDescriptor,
			};
			ctx.f = types.eval(
				"function() {" +
					"return ctx.getOwnPropertyDescriptor(ctx.f, 'caller');" +
				"}", ctx);
			try {
				ctx.f();
			} catch(o) {
				__Internal__.hasGetOwnPropertyRestrictionOnCaller = true;
			};
		})();

		types.hasProperties = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'boolean',
						description: "Returns 'true' if properties are available. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (!__Internal__.hasDefinePropertyBug && _shared.Natives.objectDefineProperty ? (function hasProperties() {
				return true;
			}) : (function hasProperties() {
				return false;
			})));
		
		types.defineProperty = __Internal__.DD_DOC(
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
							name: {
								type: 'string',
								optional: false,
								description: "The property name.",
							},
							descriptor: {
								type: 'object',
								optional: false,
								description: "The property descriptor.",
							},
						},
						returns: 'undefined',
						description: "Defines a property of the object.",
			}
			//! END_REPLACE()
			, (!__Internal__.hasDefinePropertyBug && _shared.Natives.objectDefineProperty ? (function defineProperty(obj, name, descriptor) {
				if (!types.isJsObject(descriptor)) {
					throw new types.TypeError("Invalid descriptor.");
				};
				// <PRB> "Object.defineProperty" stupidly takes inherited properties instead of just own properties. So we fix that because of "Object.prototype".
				descriptor = types.extend(types.createObject(null), descriptor);
				types.getDefault(descriptor, 'configurable', false);
				types.getDefault(descriptor, 'enumerable', false);
				if (!types.get(descriptor, 'get') && !types.get(descriptor, 'set')) {
					types.getDefault(descriptor, 'writable', false);
				};
				return _shared.Natives.objectDefineProperty(obj, name, descriptor);
			}) : (function defineProperty(obj, name, descriptor) {
				if (!types.isJsObject(descriptor)) {
					throw new types.TypeError("Invalid descriptor.");
				};
				if (descriptor.get || descriptor.set || !descriptor.enumerable || !descriptor.writable || !descriptor.configurable) {
					throw new types.TypeError("Properties are not supported.");
				} else {
					if (!types.isObjectLike(obj)) {
						throw new types.TypeError("Not an object.");
					};
					obj[name] = descriptor.value;
				};
			}))),

		types.defineProperties = (!__Internal__.hasDefinePropertyBug && _shared.Natives.objectDefineProperties ? _shared.Natives.objectDefineProperties : __Internal__.DD_DOC(
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
							props: {
								type: 'object',
								optional: false,
								description: "An object of properties with their descriptor.",
							},
						},
						returns: 'undefined',
						description: "Defines properties of the object.",
			}
			//! END_REPLACE()
			, (function defineProperties(obj, props) {
				if (!types.isObject(props)) {
					throw new types.TypeError("Invalid properties.");
				};
				var keys = types.append(types.keys(props), types.symbols(props));
				for (var i = 0; i < keys.length; i++) {
					var key = keys[i];
					types.defineProperty(obj, key, props[key]);
				};
			})));

		if (_shared.Natives.objectGetOwnPropertyDescriptor && !__Internal__.hasDefinePropertyBug && !__Internal__.hasGetOwnPropertyRestrictionOnCaller) {
			types.getOwnPropertyDescriptor = _shared.Natives.objectGetOwnPropertyDescriptor;
		} else {
			types.getOwnPropertyDescriptor = __Internal__.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
				{
							author: "Claude Petit",
							revision: 0,
							params: {
								obj: {
									type: 'any',
									optional: false,
									description: "An object.",
								},
								key: {
									type: 'string',
									optional: false,
									description: "Property name.",
								},
							},
							returns: 'object',
							description: "Returns the descriptor of an own property of an object.",
				}
				//! END_REPLACE()
				, (_shared.Natives.objectGetOwnPropertyDescriptor ? function getOwnPropertyDescriptor(obj, key) {
					var desc;
					if (__Internal__.hasGetOwnPropertyRestrictionOnCaller && (key === 'caller')) {
						desc = {
							configurable: false,
							enumerable: false,
							value: null,
							writable: false,
						};
					} else {
						desc = _shared.Natives.objectGetOwnPropertyDescriptor(obj, key);
						if (__Internal__.hasDefinePropertyBug) {
							if (desc && !desc.writable && !desc.get && !desc.set) {
								desc.configurable = false;
							};
						};
					};
					return desc;
				} : function getOwnPropertyDescriptor(obj, key) {
					if (types.has(obj, key)) {
						return {
							writable: true,
							configurable: true,
							enumerable: true,
							value: obj[key],
						};
					} else {
						return undefined;
					};
				}));
		};
		
		types.getPropertyDescriptor = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 2,
						params: {
							obj: {
								type: 'any',
								optional: false,
								description: "An object.",
							},
							key: {
								type: 'string,Symbol',
								optional: false,
								description: "Property name.",
							},
						},
						returns: 'object',
						description: "Returns the current descriptor of a property of an object.",
			}
			//! END_REPLACE()
			, function getPropertyDescriptor(obj, key) {
				obj = _shared.Natives.windowObject(obj);
				var proto = obj,
					descriptor = undefined;
				if (key in obj) {
					do {
						descriptor = types.getOwnPropertyDescriptor(proto, key);
					} while (!descriptor && (proto = types.getPrototypeOf(proto)));
				};
				return descriptor;
			});
		
		types.createObject = (_shared.Natives.objectCreate || __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							proto: {
								type: 'object',
								optional: false,
								description: "An object defining the prototype of the new object.",
							},
							properties: {
								type: 'object',
								optional: true,
								description: "Properties, with their descriptor, to append to the new object.",
							},
						},
						returns: 'object',
						description: "Creates an object with the specified prototype. Optionally appends properties.",
			}
			//! END_REPLACE()
			, (__Internal__.hasProto ? 
					// Enhanced polyfill taken from Mozilla Developer Network. 
					(function() {
						var tmp = function Object() {};
						return (function createObject(proto, /*optional*/properties) {
							tmp.prototype = proto;
							var obj = new tmp();
							tmp.prototype = null; // free memory

							if (properties) {
								types.defineProperties(obj, properties);
							};
							
							return obj;
						});
					})()
				:
					(function createObject(proto, /*optional*/properties) {
						var tmp = function Object() {};
						tmp.prototype = proto;
						var obj = new tmp();

						if (properties) {
							types.defineProperties(obj, properties);
						};

//IE8						if (!_shared.Natives.objectGetPrototypeOf) {
//IE8							types.defineProperty(obj, '__dd_proto__', {value: proto, configurable: true, enumerable: true, writable: true});
//IE8						};
						
						return obj;
					})
			)));

		types.newInstance = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
						params: {
							type: {
								type: 'type',
								optional: false,
								description: "An object type.",
							},
							properties: {
								type: 'arrayof(any)',
								optional: true,
								description: "Constructor arguments.",
							},
						},
						returns: 'object',
						description: "Instantiates an object from the specified object type with provided constructor arguments.",
			}
			//! END_REPLACE()
			, function newInstance(type, /*optional*/args) {
				if (!types.isFunction(type)) {
					return null;
				};
				if (args && !types.isArrayLike(args)) {
					return null;
				};
				if (!__Internal__.prototypeIsConfigurable && types.isType(type)) {
					// <PRB> If "prototype" is not configurable, we can't set it to read-only
					// Prototype will get fixed by the constructor if it has been changed. Just make sure it is an object...
					if (!types.isObject(type.prototype)) {
						type.prototype = {};
					};
				};
				if (args && args.length) {
					var obj = types.createObject(type.prototype, {
						constructor: {
							configurable: true,
							//enumerable: false, 'FALSE' is the default
							value: type,
							writable: true,
						},
					});
					obj.constructor.apply(obj, args);
				} else {
					obj = new type();
				};
				return obj;
			});
		
		types.getPrototypeOf = (_shared.Natives.objectGetPrototypeOf || __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
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
						returns: 'object',
						description: "Returns the prototype of an object.",
			}
			//! END_REPLACE()
			, (__Internal__.hasProto ? 
					// For browsers implementing "__proto__".
					(function getPrototypeOf(obj) {
						return _shared.Natives.windowObject(obj).__proto__;
					})
				:
					(function getPrototypeOf(obj) {
						throw new global.Error("Browser not supported.");
					})
//IE8					// For very old browsers.
//IE8					(function getPrototypeOf(obj) {
//IE8						if ((obj === __Internal__.fnProto) || (obj === __Internal__.objProto)) {
//IE8							return null;
//IE8						};
//IE8						// "__dd_proto__" is injected by "types.createObject" and "types.setPrototypeOf"
//IE8						if (types.isFunction(obj)) {
//IE8							return types.get(obj, '__dd_proto__') || __Internal__.fnProto;
//IE8						} else {
//IE8							obj = _shared.Natives.windowObject(obj);
//IE8							return types.get(obj, '__dd_proto__') || (obj.constructor && obj.constructor.prototype) || __Internal__.objProto;
//IE8						};
//IE8					})
			)));
		
		__Internal__.fnProto = (_shared.Natives.objectGetPrototypeOf ? types.getPrototypeOf(function(){}) : (function(){}).constructor.prototype);
//IE8		__Internal__.objProto = (_shared.Natives.objectGetPrototypeOf ? types.getPrototypeOf({}) : (({}).constructor.prototype));
		
		types.setPrototypeOf = __Internal__.DD_DOC(
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
							proto: {
								type: 'object',
								optional: false,
								description: "An object defining the new prototype.",
							},
							forceNative: {
								type: 'boolean',
								optional: true,
								description: "Force use of the native function 'Object.setPrototypeOf'. Defaults to 'false'. Always 'true' if object is a function.",
							},
						},
						returns: 'object',
						description: "Returns a clone of the provided object attached to the specified prototype.",
			}
			//! END_REPLACE()
			, function setPrototypeOf(obj, proto, /*optional*/forceNative) {
				// NOTE: Functions can't be created using "createObject".
				// TODO: How to prevent the use of "setPrototypeOf" (which MDN doesn't like) for "functions" ?
				var enabled = (forceNative || types.isFunction(obj));
				if (enabled && _shared.Natives.objectSetPrototypeOf) {
					return _shared.Natives.objectSetPrototypeOf(obj, proto);
				} else if (enabled && __Internal__.hasProto) {
					// For browsers implementing "__proto__".
					if ((obj === undefined) || (obj === null)) {
						return obj;
					};
					obj.__proto__ = proto;
					return obj; 
				} else {
					if ((obj === undefined) || (obj === null)) {
						return obj;
					};

					var tmp;
					if (types.isFunction(obj)) {
						throw new global.Error("Browser not supported.");
//IE8						// Impossible to change the prototype of the function !
//IE8						var p = proto;
//IE8						while (p) {
//IE8							for (var key in p) {
//IE8								if (!types.has(obj, key) && types.has(p, key)) {
//IE8									obj[key] = p[key];
//IE8								};
//IE8							};
//IE8							p = types.getPrototypeOf(p);
//IE8						};
//IE8						tmp = obj;
					} else {
						tmp = types.createObject(proto, {
							constructor: {
								configurable: true,
								value: obj.constructor,
								writable: true,
							},
						});
						types.extend(tmp, obj);
					};
					
//IE8					if (!_shared.Natives.objectSetPrototypeOf && !__Internal__.hasProto) {
//IE8						types.defineProperty(tmp, '__dd_proto__', {value: proto, configurable: true, enumerable: true, writable: true});
//IE8					};
					
					return tmp;
				};
			});

		types.isPrototypeOf = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							protoObj: {
								type: 'object',
								optional: false,
								description: "An object defining a prototype.",
							},
							obj: {
								type: 'object',
								optional: false,
								description: "An object.",
							},
						},
						returns: 'boolean',
						description: "Returns 'true' if the prototype is the prototype of the object. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (_shared.Natives.objectIsPrototypeOf ? (function isPrototypeOf(protoObj, obj) {
				// NOTE: Why does this function is part of Object prototype ?
				return _shared.Natives.objectIsPrototypeOf.call(protoObj, obj);
			}) : (function isPrototypeOf(protoObj, obj) {
				obj = _shared.Natives.windowObject(obj);
				while (obj = types.getPrototypeOf(obj)) {
					if (obj === protoObj) {
						return true;
					};
				};
				return false;
			})));
		
		types.nullObject = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							paramarray: {
								type: 'object',
								optional: true,
								description: "List of objects.",
							},
						},
						returns: 'object',
						description: "Returns a null object extended by the provided objects.",
			}
			//! END_REPLACE()
			, function nullObject(/*paramarray*/) {
				return types.extend.apply(types, types.append([types.createObject(null)], arguments));
			});

		types.getIn = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							obj: {
								type: 'nullobject',
								optional: false,
								description: "A null object.",
							},
							key: {
								type: 'string,Symbol',
								optional: false,
								description: "Attribute name.",
							},
							_default: {
								type: 'any',
								optional: true,
								description: "Default value.",
							},
						},
						returns: 'any',
						description: "Returns the value of the attribute of an object. If the attribute doesn't exist, returns the value of the '_default' parameter.",
			}
			//! END_REPLACE()
			, function getIn(obj, key, /*optional*/_default) {
				if (types.isNothing(obj)) {
					return _default;
				};
				obj = _shared.Natives.windowObject(obj);
				if (key in obj) {
					return obj[key];
				} else {
					return _default;
				};
			});
		
		types.hasIn = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							obj: {
								type: 'nullobject',
								optional: false,
								description: "A null object.",
							},
							keys: {
								type: 'arrayof(string,Symbol),string,Symbol',
								optional: false,
								description: "Key(s) to test for.",
							},
						},
						returns: 'bool',
						description: "Returns 'true' if one of the specified keys is a property of an object.",
			}
			//! END_REPLACE()
			, function hasIn(obj, keys) {
				if (!types.isNothing(obj)) {
					obj = _shared.Natives.windowObject(obj);
					if (!types.isArray(keys)) {
						return (keys in obj);
					};
					var len = keys.length;
					if (!len) {
						return false;
					};
					for (var i = 0; i < len; i++) {
						if (i in keys) {
							var key = keys[i];
							if (key in obj) {
								return true;
							};
						};
					};
				};
				return false;
			});
		
		types.extendProperties = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
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
						description: "Extends the first object with owned properties of the other objects.",
			}
			//! END_REPLACE()
			, function extendProperties(/*paramarray*/obj) {
				var result;
				if (!types.isNothing(obj)) {
					result = _shared.Natives.windowObject(obj);
					var len = arguments.length;
					if (types.hasProperties()) {
						for (var i = 1; i < len; i++) {
							obj = arguments[i];
							if (types.isNothing(obj)) {
								continue;
							};
							// Part of "Object.assign" Polyfill from Mozilla Developer Network.
							obj = _shared.Natives.windowObject(obj);
							var keys = types.append(types.keys(obj), types.symbols(obj));
							for (var j = 0; j < keys.length; j++) {
								var key = keys[j];
								var descriptor = types.getOwnPropertyDescriptor(obj, key);
								types.defineProperty(result, key, descriptor);
							};
						};
					} else {
						for (var i = 1; i < len; i++) {
							obj = arguments[i];
							if (types.isNothing(obj)) {
								continue;
							};
							// Part of "Object.assign" Polyfill from Mozilla Developer Network.
							obj = _shared.Natives.windowObject(obj);
							var keys = types.append(types.keys(obj), types.symbols(obj));
							for (var j = 0; j < keys.length; j++) {
								var key = keys[j];
								result[key] = obj[key];
							};
						};
					};
				};
				return result;
			});
			
		types.depthExtend = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 4,
						params: {
							depth: {
								type: 'integer,function',
								optional: false,
								description: "Depth, or extender function.",
							},
							paramarray: {
								type: 'any',
								optional: false,
								description: "An object.",
							},
						},
						returns: 'object',
						description: "Extends the first object with owned properties of the other objects using the specified depth.",
			}
			//! END_REPLACE()
			, function depthExtend(depth, /*paramarray*/obj) {
				var result;
				if (!types.isNothing(obj)) {
					var extender;
					if (types.isFunction(depth)) {
						extender = depth;
						depth = Infinity;
					} else {
						depth = (+depth || 0) - 1;  // null|undefined|true|false|NaN|Infinity
						extender = function(result, val, key, extend) {
							if ((extender.depth >= 0) && types.isObject(val)) {
								var resultVal = result[key];
								if (types.isNothing(resultVal)) {
									extender.depth--;
									if (extender.depth >= -1) {
										result[key] = extend({}, val);
									};
								} else if (types.isObjectLike(resultVal)) {
									extender.depth--;
									if (extender.depth >= -1) {
										extend(resultVal, val);
									};
								} else if (resultVal !== val) {
									result[key] = val;
								};
							} else if (resultVal !== val) {
								result[key] = val;
							};
						};
						extender.depth = depth;
					};
					if (depth >= -1) {
						result = _shared.Natives.windowObject(obj);
						var len = arguments.length;
						for (var i = 2; i < len; i++) {
							obj = arguments[i];
							if (types.isNothing(obj)) {
								continue;
							};
							// Part of "Object.assign" Polyfill from Mozilla Developer Network.
							obj = _shared.Natives.windowObject(obj);
							var keys = types.append(types.keys(obj), types.symbols(obj)),
								keysLen = keys.length; // performance
							for (var j = 0; j < keysLen; j++) {
								var key = keys[j];
								extender(result, obj[key], key, _shared.Natives.functionBind.call(types.depthExtend, types, extender));
							};
						};
					};
				};
				return result;
			});
				
		types.complete = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 2,
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
					result = _shared.Natives.windowObject(obj);
					var len = arguments.length;
					for (var i = 1; i < len; i++) {
						obj = arguments[i];
						if (types.isNothing(obj)) {
							continue;
						};
						// Part of "Object.assign" Polyfill from Mozilla Developer Network.
						obj = _shared.Natives.windowObject(obj);
						var keys = types.append(types.keys(obj), types.symbols(obj));
						for (var j = 0; j < keys.length; j++) {
							var key = keys[j];
							if (!types.has(result, key)) {
								result[key] = obj[key];
							};
						};
					};
				};
				
				return result;
			});
		
		types.completeProperties = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
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
			, function completeProperties(/*paramarray*/obj) {
				var result;
				if (!types.isNothing(obj)) {
					result = _shared.Natives.windowObject(obj);
					var len = arguments.length;
					if (types.hasProperties()) {
						for (var i = 1; i < len; i++) {
							obj = arguments[i];
							if (types.isNothing(obj)) {
								continue;
							};
							// Part of "Object.assign" Polyfill from Mozilla Developer Network.
							obj = _shared.Natives.windowObject(obj);
							var keys = types.append(types.keys(obj), types.symbols(obj));
							for (var j = 0; j < keys.length; j++) {
								var key = keys[j];
								if (!types.has(result, key)) {
									var descriptor = types.getOwnPropertyDescriptor(obj, key);
									types.defineProperty(result, key, descriptor);
								};
							};
						};
					} else {
						for (var i = 1; i < len; i++) {
							obj = arguments[i];
							if (types.isNothing(obj)) {
								continue;
							};
							// Part of "Object.assign" Polyfill from Mozilla Developer Network.
							obj = _shared.Natives.windowObject(obj);
							var keys = types.append(types.keys(obj), types.symbols(obj));
							for (var j = 0; j < keys.length; j++) {
								var key = keys[j];
								if (!types.has(result, key)) {
									result[key] = obj[key];
								};
							};
						};
					};
				};
				
				return result;
			});
		
		types.append = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
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
					obj = _shared.Natives.windowObject(obj);
					_shared.Natives.arrayPush.apply(result, obj);
				};
				
				return result;
			});
			
		types.unique = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
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
				var start = 1;
				var comparerFn = comparer;
				if (!types.isFunction(comparerFn)) {
					comparerFn = null;
					start = 0;
				};
				
				var result = [];
				
				if (comparerFn) {
					var len = arguments.length;
					for (var i = start; i < len; i++) {
						obj = arguments[i];
						if (types.isNothing(obj)) {
							continue;
						};
						obj = _shared.Natives.windowObject(obj);
						var objLen = obj.length;
						for (var key1 = 0; key1 < objLen; key1++) {
							if (key1 in obj) {
								var value1 = obj[key1],
									found = false,
									resultLen = result.length;
								for (var key2 = 0; key2 < resultLen; key2++) {
									var res = comparerFn(value1, result[key2]);
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
						if (types.isNothing(obj)) {
							continue;
						};
						obj = _shared.Natives.windowObject(obj);
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
			
		// <PRB> JS has no function to test for objects ( new Object() )
		types.isObject = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
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
						returns: 'boolean',
						description: "Returns 'true' if the object is a direct instance of 'Object'. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isObject(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				return (typeof obj === 'object') && (_shared.Natives.objectToString.call(obj) === '[object Object]');
			});
			
		types.isObjectLike = __Internal__.DD_DOC(
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
						returns: 'boolean',
						description: "Returns 'true' if the object is a direct instance of 'Object' or an instance of a type which inherits 'Object'. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isObjectLike(obj) {
				return (types.isObject(obj) || (obj instanceof _shared.Natives.windowObject));
			});
		
		types.isExtensible = (_shared.Natives.objectIsExtensible || __Internal__.DD_DOC(
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
						description: "Returns 'true' if an object is extensible. Otherwise, returns 'false'.",
			}
			//! END_REPLACE()
			, function isExtensible(obj) {
					return false;
				}));
		
		types.preventExtensions = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
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
						returns: 'object',
						description: "Prevent extensions of the object when supported and returns that same object. Otherwise, returns that object untouched. Note that it can't be reverted for the moment (ES5).",
			}
			//! END_REPLACE()
			, (_shared.Natives.objectPreventExtensions ? 
				function preventExtensions(obj) {
					obj = _shared.Natives.windowObject(obj);
					_shared.Natives.objectPreventExtensions(obj);
					return obj;
				} : function preventExtensions(obj) {
					obj = _shared.Natives.windowObject(obj);
					return obj;
				}));
		
		types.sealObject = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
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
						returns: 'object',
						description: "Seals the object when supported and returns that same object. Otherwise returns the object untouched.",
			}
			//! END_REPLACE()
			, (_shared.Natives.objectSeal ? 
				function sealObject(obj) {
					obj = _shared.Natives.windowObject(obj);
					return _shared.Natives.objectSeal(obj);
				} : function sealObject(obj) {
					obj = _shared.Natives.windowObject(obj);
					return obj;
				}));
		
		types.isFrozen = (_shared.Natives.objectIsFrozen || __Internal__.DD_DOC(
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
						description: "Returns 'true' if an object is frozen. Otherwise, returns 'false'.",
			}
			//! END_REPLACE()
			, function isFrozen(obj) {
					return false;
				}));
		
		types.freezeObject = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
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
						returns: 'object',
						description: "Freezes the object when supported and returns that same object. Otherwise returns the object untouched. Note that it can't be reverted for the moment (ES5).",
			}
			//! END_REPLACE()
			, (_shared.Natives.objectFreeze ? 
				function freezeObject(obj) {
					obj = _shared.Natives.windowObject(obj);
					return _shared.Natives.objectFreeze(obj);
				} : function freezeObject(obj) {
					obj = _shared.Natives.windowObject(obj);
					return obj;
				}));
		
		//==============
		// Options
		//==============
		
		var __options__ = types.extend({
			//! IF(IS_SET('debug'))
				// Starting from source code...
				debug: true,					// When 'true', will be in 'debug mode'.
				fromSource: true,				// When 'true', loads source code instead of built code
				enableProperties: true,			// When 'true', enables "defineProperty"
				// SLOW enableProxies: true,	// Enables or disables ES6 Proxies
				enableProtection: true,			// When 'true', "__Internal__.protectObject" is enabled if 'enableProperties' is also 'true'.
				enableAsserts: true,			// When 'true', enables asserts.
			//! END_IF()
			
			enableSymbols: true,				// When 'true', symbols are enabled.
		}, types.get(_options, 'startup'));
		
		__options__.debug = types.toBoolean(__options__.debug);
		__options__.fromSource = types.toBoolean(__options__.fromSource);
		__options__.enableProperties = types.toBoolean(__options__.enableProperties);
		__options__.enableSymbols = types.toBoolean(__options__.enableSymbols);
		__options__.enableProxies = types.toBoolean(__options__.enableProxies);
		__options__.enableProtection = types.toBoolean(__options__.enableProtection);
		__options__.enableAsserts = types.toBoolean(__options__.enableAsserts);
		
		types.freezeObject(__options__);
		
		types.hasDefinePropertyEnabled = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
						params: null,
						returns: 'boolean',
						description: "Returns 'true' if 'defineProperty' is enabled. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (__options__.enableProperties && !__Internal__.hasDefinePropertyBug && _shared.Natives.objectDefineProperty ? function hasDefinePropertyEnabled() {
				return true;
			} : function hasDefinePropertyEnabled() {
				return false;
			}));
		
		//===================================
		// Symbols
		//===================================
		
		types.hasSymbols = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
						params: null,
						returns: 'bool',
						description: "Returns 'true' if the engine has symbols. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (_shared.Natives.windowSymbol ? function hasSymbols() {
				return true;
			} : function hasSymbols() {
				return false;
			}));
			
		types.hasGetSymbolForEnabled = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'bool',
						description: "Returns 'true' if 'getSymbolFor' is available and enabled. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (__options__.enableSymbols && _shared.Natives.windowSymbol ? function hasGetSymbolForEnabled() {
				return true;
			} : function hasGetSymbolForEnabled() {
				return false;
			}));
			
		types.isSymbol = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a Symbol. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (_shared.Natives.windowSymbol ? function isSymbol(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				if (typeof obj === 'symbol') {
					return true;
				} else if ((typeof obj === 'object') && (obj instanceof _shared.Natives.windowSymbol)) {
					return true;
				} else {
					return false;
				};
			} : function isSymbol(obj) {
				return false;
			}));
			
		types.getSymbol = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
						params: null,
						returns: 'Symbol',
						description: "Returns the Symbol constructor.",
			}
			//! END_REPLACE()
			, function getSymbol() {
				return _shared.Natives.windowSymbol;
			});
		
		types.getSymbolFor = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 3,
						params: {
							key: {
								type: 'string',
								optional: false,
								description: "Symbol key.",
							},
							isGlobal: {
								type: 'bool',
								optional: true,
								description: "When 'true', gets or creates a global symbol. Otherwise, returns a new anonymous symbol.",
							},
						},
						returns: 'symbol',
						description: "Gets or creates a Symbol.",
			}
			//! END_REPLACE()
			, (__options__.enableSymbols && _shared.Natives.windowSymbol ? function getSymbolFor(key, /*optional*/isGlobal) {
				key = _shared.Natives.windowString(key);
				var symbol;
				if (isGlobal) {
					symbol = _shared.Natives.symbolFor(key);
				} else {
					symbol = _shared.Natives.windowSymbol(key);
				};
				return symbol;
			} : function getSymbolFor(key, /*optional*/isGlobal) {
				// Not supported
				key = _shared.Natives.windowString(key);
				return key;
			}));
			
		types.getSymbolKey = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							symbol: {
								type: 'symbol',
								optional: false,
								description: "Symbol value.",
							},
						},
						returns: 'string',
						description: "Returns the key of the specified Symbol.",
			}
			//! END_REPLACE()
			, (_shared.Natives.windowSymbol ? function getSymbolKey(symbol) {
				symbol = _shared.Natives.windowObject(symbol).valueOf();
				var key = _shared.Natives.symbolKeyFor(symbol);
				return key;
			} : function getSymbolKey(symbol) {
				// Not supported
				return undefined;
			}));
			
		types.symbolIsGlobal = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							symbol: {
								type: 'symbol',
								optional: false,
								description: "Symbol value.",
							},
						},
						returns: 'bool',
						description: "Returns 'true' if 'obj' is a global Symbol. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (_shared.Natives.windowSymbol ? function symbolIsGlobal(symbol) {
				symbol = _shared.Natives.windowObject(symbol).valueOf();
				return (_shared.Natives.symbolKeyFor(symbol) !== undefined);
			} : function symbolIsGlobal(symbol) {
				// Not supported
				return false;
			}));
			
		//===================================
		// Errors
		//===================================
		
		types.isErrorType = function isErrorType(type) {
			return types.isFunction(type) && ((_shared.Natives.windowError.prototype === type.prototype) || types.isPrototypeOf(_shared.Natives.windowError.prototype, type.prototype));
		};
			
		// NOTE: 2015/04/16 The actual implementations of Error and other error types are not easily inheritable because their constructor always act as an instantiator.
		types.createErrorType = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							name: {
								type: 'string',
								optional: false,
								description: "Name of the resulting error type.",
							},
							base: {
								type: 'error',
								optional: true,
								description: "Error type from which to inherit. Defaults to 'Error'.",
							},
							constructor: {
								type: 'function',
								optional: true,
								description: "A function to be called to construct a new instance. Defaults to base's constructor.",
							},
						},
						returns: 'error',
						description: "Creates a new error type, based on another error type.",
			}
			//! END_REPLACE()
			, function createErrorType(name, /*optional*/base, /*optional*/constructor) {
				if (types.isNothing(base)) {
					base = _shared.Natives.windowError;
				};
				name = name.replace(/[.]/g, '_');
				var expr = "function " + name + "(/*paramarray*/) {" +
					(constructor ? (
						"var error = ctx.constructor.apply(this, arguments) || this;" +
						"this.throwLevel++;"
					) : (
						"var error = ctx.base.apply(this, arguments) || this;"
					)) +
					"if (error !== this) {" +
						// <PRB> As of January 2015, "global.Error" doesn't behave like a normal constructor within any browser. This might be part of W3C specs.
						//
						//       Proof of concept :
						//          var a = new Error("hello");
						//          var b = Error.call(a, "bye");
						//          a === b  // always returns "false"
						//          a.constructor === b.constructor  // returns "true"
						//          a.constructor === Error  // returns "true"
						//          a instanceof Error  // returns "true"
						//          b instanceof Error  // returns "true"
						//
						//       Moreover :
						//          this instanceof Error  // returns "true"
						"this.message = (error.message || error.description);" +
						// NOTE: Internet Explorer doesn't fill the "stack" attribute because the "throw" operator has not been used yet.
						// NOTE: Internet Explorer doesn't have the "stack" attribute in "Error.prototype". This attribute is not part of the object, but injected by the throwing mechanism.
						// NOTE: With Internet Explorer, the "stack" attribute doesn't get filled on throwing if the attribute is present. This is to allow re-throwing the error.
						"if (error.stack) {" +
							"this.stack = error.stack;" +
						"};" +
					"};" +
					"this.throwLevel++;" +
					"this.name = ctx.name;" +
					"this.description = this.message;" +
					"return this;" +
				"}";
				
				// NOTE: Use of "eval" to give the name to the function				
				var type = types.eval(expr, {
					base: base,
					constructor: constructor,
					name: name,
				});
				
				// For "instanceof".
				type.prototype = types.setPrototypeOf(type.prototype, base.prototype);
				
				types.extend(type.prototype, {
					name: name,
					throwLevel: 0,
					parsed: false,
					parsedStack: null,
					bubble: false,
					critical: false,
					trapped: false,
					
					toString: function toString(/*paramarray*/) {
						return this.message;
					},
					
					parse: function parse() {
						// Call this method before accessing "this.stack", "this.fileName", "this.lineNumber" and "this.columnNumber".
						if (!this.parsed) {
							var stack;
							if (this.stack) {
								stack = tools.parseStack(this.stack);
								if (stack) {
									stack.splice(0, this.throwLevel);
									// Internet Explorer (tested with version 11) and Chrome (tested with version 42) doesn't return more than 10 call levels, so the stack may be empty after "splice".
									if (!stack.length) {
										stack = null;
									};
								};
								this.parsedStack = stack;
							};
							
							var fileName,
								lineNumber,
								columnNumber,
								functionName;
							if (this.fileName) {
								// <FUTURE> Firefox
								// NOTE: "this.lineNumber" and "this.columnNumber" should be already set
								fileName = this.fileName;
								lineNumber = this.lineNumber;
								functionName = "";
							} else if (this.sourceURL) {
								// Safari 5
								// NOTE: "this.line" should be already set
								fileName = this.sourceURL;
								lineNumber = this.line;
								columnNumber = 0;
								functionName = "";
							} else {
								// Other browsers
								// Set attributes from the stack.
								if (stack) {
									var trace = stack[0];
									fileName = trace.path;
									columnNumber = trace.columnNumber;
									lineNumber = trace.lineNumber;
									functionName = trace.functionName;
								} else {
									fileName = "";
									columnNumber = 0;
									lineNumber = 0;
									functionName = "";
								};
							};
							this.fileName = fileName;
							this.sourceURL = fileName;
							this.line = lineNumber;
							this.lineNumber = lineNumber;
							this.columnNumber = columnNumber;
							this.functionName = functionName;
							this.parsed = true;
						};
					},
				});
				
				return type;
			});
		
		__Internal__.createErrorConstructor = function(base) {
			return function _new(message, /*optional*/params) {
				message = tools.format(message, params);
				return base.call(this, message);
			};
		};
		
		__Internal__.REGISTER(__Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
						params: null,
						returns: 'error',
						description: "Raised on invalid value type.",
			}
			//! END_REPLACE()
			, (_shared.Natives.windowTypeError
				? types.createErrorType("TypeError", _shared.Natives.windowTypeError, __Internal__.createErrorConstructor(_shared.Natives.windowTypeError))
				: types.createErrorType("TypeError", _shared.Natives.windowError, __Internal__.createErrorConstructor(_shared.Natives.windowError))
			)));
		
		__Internal__.REGISTER(__Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
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
						returns: 'undefined',
						description: "Generic error with message formatting.",
			}
			//! END_REPLACE()
			, types.createErrorType('Error', _shared.Natives.windowError, __Internal__.createErrorConstructor(_shared.Natives.windowError))));

		__Internal__.REGISTER(__Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
						params: {
							message: {
								type: 'string',
								optional: false,
								description: "A message explaining the assertion.",
							},
							params: {
								type: 'arrayof(any),objectof(any)',
								optional: true,
								description: "Parameters of the error message",
							},
						},
						returns: 'error',
						description: "Raised when an assertion fail.",
			}
			//! END_REPLACE()
			, types.createErrorType("AssertionFailed", types.Error, function _new(message, /*optional*/params) {
				if (message) {
					return types.Error.call(this, "Assertion failed: " + message, params);
				} else {
					return types.Error.call(this, "Assertion failed.");
				};
			})));

		__Internal__.REGISTER(__Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
						params: {
							message: {
								type: 'string',
								optional: true,
								description: "A message explaining that something has failed to parse.",
							},
							params: {
								type: 'arrayof(any),objectof(any)',
								optional: true,
								description: "Parameters of the error message",
							},
						},
						returns: 'error',
						description: "Raised on parse error.",
			}
			//! END_REPLACE()
			, types.createErrorType("ParseError", types.Error, function _new(/*optional*/message, /*optional*/params) {
				return types.Error.call(this, message || "Parse error.", params);
			})));
		
		__Internal__.REGISTER(__Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
						params: {
							message: {
								type: 'string',
								optional: true,
								description: "A message explaining what is not supported.",
							},
							params: {
								type: 'arrayof(any),objectof(any)',
								optional: true,
								description: "Parameters of the error message",
							},
						},
						returns: 'error',
						description: "Raised when something is not supported.",
			}
			//! END_REPLACE()
			, types.createErrorType("NotSupported", types.Error, function _new(/*optional*/message, /*optional*/params) {
				return types.Error.call(this, message || "Not supported.", params);
			})));
		
		__Internal__.REGISTER(__Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
						params: {
							message: {
								type: 'string',
								optional: true,
								description: "A message explaining what is not available.",
							},
							params: {
								type: 'arrayof(any),objectof(any)',
								optional: true,
								description: "Parameters of the error message",
							},
						},
						returns: 'error',
						description: "Raised when something is not available.",
			}
			//! END_REPLACE()
			, types.createErrorType("NotAvailable", types.Error, function _new(/*optional*/message, /*optional*/params) {
				return types.Error.call(this, message || "Not available.", params);
			})));
		
		__Internal__.REGISTER(__Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
						params: {
							code: {
								type: 'integer',
								optional: false,
								description: "HTTP status code.",
							},
							message: {
								type: 'string',
								optional: false,
								description: "A message explaining the error.",
							},
							params: {
								type: 'arrayof(any),objectof(any)',
								optional: true,
								description: "Parameters of the error message",
							},
						},
						returns: 'error',
						description: "Raised on HTTP error.",
			}
			//! END_REPLACE()
			, types.createErrorType('HttpError', types.Error, function _new(code, message, /*optional*/params) {
				this.code = code;
				return types.Error.call(this, message, params);
			})));
		
		__Internal__.REGISTER(__Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
						params: {
							message: {
								type: 'string',
								optional: true,
								description: "A message explaining that something has overflowed.",
							},
							params: {
								type: 'arrayof(any),objectof(any)',
								optional: true,
								description: "Parameters of the error message",
							},
						},
						returns: 'error',
						description: "Raised on buffer overflow.",
			}
			//! END_REPLACE()
			, types.createErrorType('BufferOverflow', types.Error, function _new(/*optional*/message, /*optional*/params) {
				return types.Error.call(this, message || "Buffer overflow.", params);
			})));
		
		__Internal__.REGISTER(__Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
						params: {
							message: {
								type: 'string',
								optional: true,
								description: "A message explaining that something has timed out.",
							},
							params: {
								type: 'arrayof(any),objectof(any)',
								optional: true,
								description: "Parameters of the error message",
							},
						},
						returns: 'error',
						description: "Raised on timeout.",
			}
			//! END_REPLACE()
			, types.createErrorType('TimeoutError', types.Error, function _new(/*optional*/message, /*optional*/params) {
				return types.Error.call(this, message || "Operation timed out.", params);
			})));
		
		__Internal__.REGISTER(__Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
						params: {
							message: {
								type: 'string',
								optional: true,
								description: "A message explaining that something has been canceled.",
							},
							params: {
								type: 'arrayof(any),objectof(any)',
								optional: true,
								description: "Parameters of the error message",
							},
						},
						returns: 'error',
						description: "Raised on cancel.",
			}
			//! END_REPLACE()
			, types.createErrorType('CanceledError', types.Error, function _new(/*optional*/message, /*optional*/params) {
				return types.Error.call(this, message || "Operation canceled.", params);
			})));
		
		__Internal__.REGISTER(__Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							message: {
								type: 'string',
								optional: true,
								description: "A message explaining that something is denied or not allowed.",
							},
							params: {
								type: 'arrayof(any),objectof(any)',
								optional: true,
								description: "Parameters of the error message",
							},
						},
						returns: 'error',
						description: "Raised on access denied or not allowed operation.",
			}
			//! END_REPLACE()
			, types.createErrorType('AccessDenied', types.Error, function _new(/*optional*/message, /*optional*/params) {
				return types.Error.call(this, message || "Access denied.", params);
			})));
		
		__Internal__.REGISTER(__Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
					author: "Claude Petit",
					revision: 1,
					params: {
						message: {
							type: 'string',
							optional: true,
							description: "A message explaining that the script execution has been interrupted.",
						},
						params: {
							type: 'arrayof(any),objectof(any)',
							optional: true,
							description: "Parameters of the error message",
						},
					},
					returns: 'error',
					description: "Signals that script execution has been interrupted, but not aborted.",
			}
			//! END_REPLACE()
			, types.createErrorType("ScriptInterruptedError", types.Error, function _new(/*optional*/message, /*optional*/params) {
				this.bubble = true;
				return types.Error.call(this, message || "Script interrupted.", params);
			})));
		
		__Internal__.REGISTER(__Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
					author: "Claude Petit",
					revision: 3,
					params: {
						exitCode: {
							type: 'integer',
							optional: true,
							description: "Exit code.",
						},
						message: {
							type: 'string',
							optional: true,
							description: "A message explaining that the script has been aborted.",
						},
						params: {
							type: 'arrayof(any),objectof(any)',
							optional: true,
							description: "Parameters of the error message",
						},
					},
					returns: 'error',
					description: "Signals that script has been aborted. Every \"try...catch\" statements must unconditionally re-throw this error.",
			}
			//! END_REPLACE()
			, types.createErrorType("ScriptAbortedError", types.ScriptInterruptedError, function _new(/*optional*/exitCode, /*optional*/message, /*optional*/params) {
				this.exitCode = types.toInteger(exitCode) || 0;
				this.critical = true;
				return types.ScriptInterruptedError.call(this, message || "Script aborted.", params);
			})));
				
		//===================================
		// Box/Unbox
		//===================================
		
		_shared.OriginalValueSymbol = types.getSymbolFor('__ORIGINAL_VALUE__');
		
		types.box = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
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
			, function box(value) {
				//if (new.target) {
				if (this instanceof types.box) {
					if (value instanceof types.box) {
						value.setAttributes(this);
						value = value[_shared.OriginalValueSymbol];
					};
					this[_shared.OriginalValueSymbol] = value;
					return this;
				} else {
					return new types.box(value);
				};
			});
		types.extend(types.box.prototype, {
			setAttributes: function setAttributes(dest, /*optional*/override) {
				var keys = types.append(types.keys(this), types.symbols(this));
				for (var i = 0; i < keys.length; i++) {
					var key = keys[i];
					if ((key !== _shared.OriginalValueSymbol) && (override || !types.has(dest, key))) {
						dest[key] = this[key];
					};
				};
				return dest;
			},
			valueOf: function valueOf() {
				return this[_shared.OriginalValueSymbol];
			},
			setValue: function setValue(value, /*optional*/override) {
				// NOTE: "OriginalValueSymbol" is immutable
				var type = this.constructor;
				var newBox = new type(value);
				return this.setAttributes(newBox, override);
			},
			clone: function clone() {
				return this.setValue(this[_shared.OriginalValueSymbol]);
			},
		});
			
		types.unbox = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
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
				return ((value instanceof types.box) ? value.valueOf() : value);
			});
					
		//===================================
		// Type functions
		//===================================
		
		__Internal__.symbolInitialized = types.getSymbolFor('INITIALIZED');
		__Internal__.symbol$IsSingleton = types.getSymbolFor('$IS_SINGLETON');

		types.isType = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							obj: {
								type: 'object',
								optional: false,
								description: "An object to test for.",
							},
						},
						returns: 'boolean',
						description: "Returns 'true' when object is a Doodad type (inherits from 'Doodad.Types.Type'). Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isType(obj) {
				return (!types.isNothing(obj)) && ((obj === types.Type) || types.baseof(types.Type, obj));
			});
		
		types.isJsFunction = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
						params: {
							obj: {
								type: 'object',
								optional: false,
								description: "An object to test for.",
							},
						},
						returns: 'boolean',
						description: "Returns 'true' if object is a function, and not a Doodad type. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isJsFunction(obj) {
				return types.isFunction(obj) && (obj !== types.Type) && !types.baseof(types.Type, obj);
			});

		types.isJsObject = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							obj: {
								type: 'object',
								optional: false,
								description: "An object to test for.",
							},
						},
						returns: 'boolean',
						description: "Returns 'true' if object is a normal Javascript object, so not created from a Doodad type. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isJsObject(obj) {
				return ((_shared.Natives.objectToString.call(obj) === '[object Object]') && !types._instanceof(obj, types.Type));
			});

		types.is = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
						params: {
							obj: {
								type: ['object', 'type'],
								optional: false,
								description: "An object to test for. A Doodad type can be provided.",
							},
							type: {
								type: ['type', 'object'],
								optional: false,
								description: "A Doodad type. If a Doodad object is provided, its type will be used.",
							},
						},
						returns: 'boolean',
						description: "Returns 'true' if object is from the specified Doodad type. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function is(obj, type) {
				// "obj" is of type "type".
				
				if ((obj === undefined) || (obj === null)) {
					return false;
				};
				obj = _shared.Natives.windowObject(obj);
				if (!(type instanceof Array)) {
					type = [type];
				};
				if (!types.isFunction(obj)) {
					obj = obj.constructor;
				};
				for (var i = 0; i < type.length; i++) {
					if (i in type) {
						var t = type[i];
						if (t) {
							if (!types.isFunction(t)) {
								t = t.constructor;
							};
							if (obj === t) {
								return true;
							};
						};
					};
				};
				return false;
			});

		types.isLike = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 2,
						params: {
							obj: {
								type: ['object', 'type'],
								optional: false,
								description: "An object to test for. A Doodad type can be provided.",
							},
							type: {
								type: ['type', 'object'],
								optional: false,
								description: "A Doodad type. If a Doodad object is provided, its type will be used.",
							},
						},
						returns: 'boolean',
						description: "Returns 'true' if object is from or inherits from the specified Doodad type. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isLike(obj, type) {
				// "obj" is of or inherits type "types".
				if ((obj === undefined) || (obj === null)) {
					return false;
				};
				obj = _shared.Natives.windowObject(obj);
				if (!types.isFunction(obj)) {
					obj = obj.constructor;
				};
				if (!(type instanceof Array)) {
					type = [type];
				};
				for (var i = 0; i < type.length; i++) {
					if (i in type) {
						var t = type[i];
						if (t) {
							if (!types.isFunction(t)) {
								t = t.constructor;
							};
							if ((t === obj) || types.isPrototypeOf(t, obj)) {
								return true;
							};
						};
					};
				};
				return false;
			});

		types.baseof = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 2,
						params: {
							base: {
								type: 'type',
								optional: false,
								description: "A Doodad type.",
							},
							type: {
								type: 'type',
								optional: false,
								description: "A Doodad type.",
							},
						},
						returns: 'boolean',
						description: "Returns 'true' if a type is the derivative base of another type. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function baseof(base, type) {
				// "obj" is a type that inherits "type".

				if (!types.isFunction(type)) {
					// Use "isLike"
					return false;
				};
				if (!(base instanceof Array)) {
					base = [base];
				};
				for (var i = 0; i < base.length; i++) {
					if (i in base) {
						var b = base[i];
						if (types.isFunction(b)) {
							if ((b !== __Internal__.fnProto) && types.isPrototypeOf(b, type)) {
								return true;
							};
						};
					};
				};
				return false;
			});

		types._instanceof = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 2,
						params: {
							base: {
								type: 'object',
								optional: false,
								description: "A Doodad object.",
							},
							type: {
								type: 'type',
								optional: false,
								description: "A Doodad type.",
							},
						},
						returns: 'boolean',
						description: "Returns 'true' if an object inherits from type. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function _instanceof(obj, type) {
				// Uses prototypes chain like the operator "instanceof", but doesn't raise an exception when 'type' is not a type. 
				// NOTE: With Doodad objects it is recommended to use this function instead of the operator.

				obj = _shared.Natives.windowObject(obj);
				if (types.isFunction(obj)) {
					// Please use "types.baseof"
					return false;
				};
				if (!(type instanceof Array)) {
					type = [type];
				};
				for (var i = 0; i < type.length; i++) {
					if (i in type) {
						var t = type[i];
						if (types.isFunction(t)) {
							if (obj instanceof t) {
								return true;
							};
						};
					};
				};
				
				return false;
			});

		types.isSingleton = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
						params: {
							obj: {
								type: ['object', 'type'],
								optional: false,
								description: "A Doodad object, or its type.",
							},
						},
						returns: 'boolean',
						description: "Returns 'true' if a object is a singleton. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isSingleton(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				obj = types.getType(obj);
				if (!obj) {
					return false;
				};
				return !!obj[__Internal__.symbol$IsSingleton];
			});

		
		types.getType = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							obj: {
								type: ['object', 'type'],
								optional: false,
								description: "A Doodad object, or a Doodad type.",
							},
						},
						returns: 'type',
						description: "Returns the type of an object. Returns 'null' if not a Doodad object.",
			}
			//! END_REPLACE()
			, function getType(obj) {
				if (types.isNothing(obj)) {
					return null;
				};
				obj = _shared.Natives.windowObject(obj);
				if (!types.isFunction(obj)) {
					obj = obj.constructor;
				};
				if ((obj !== types.Type) && !types.baseof(types.Type, obj)) {
					return null;
				};
				return obj;
			});

		types.getTypeName = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
						params: {
							obj: {
								type: ['object', 'type'],
								optional: false,
								description: "A Doodad object, or a Doodad type.",
							},
						},
						returns: 'string',
						description: "Returns the name of the type of an object. Returns 'null' if not a Doodad object.",
			}
			//! END_REPLACE()
			, function getTypeName(obj) {
				if (types.isNothing(obj)) {
					return null;
				};
				obj = _shared.Natives.windowObject(obj);
				if (!types.isFunction(obj)) {
					obj = obj.constructor;
				};
				if ((obj !== types.Type) && !types.baseof(types.Type, obj)) {
					return null;
				};
				return obj.$TYPE_NAME || types.getFunctionName(obj);
			});
		
		types.getBase = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
						params: {
							obj: {
								type: ['object', 'type'],
								optional: false,
								description: "A Doodad object, or a Doodad type.",
							},
						},
						returns: 'type',
						description: "Returns the base type of an object. Returns 'null' if not a Doodad object.",
			}
			//! END_REPLACE()
			, function getBase(obj) {
				if (types.isNothing(obj)) {
					return null;
				};
				obj = _shared.Natives.windowObject(obj);
				if (!types.isFunction(obj)) {
					obj = obj.constructor;
				};
				if ((obj !== types.Type) && !types.baseof(types.Type, obj)) {
					return null;
				};
				return types.getPrototypeOf(obj);
			});

		_shared.invoke = __Internal__.DD_DOC(
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
							fn: {
								type: 'string,Symbol,function',
								optional: false,
								description: "Method name or function.",
							},
							args: {
								type: 'arrayof(any)',
								optional: true,
								description: "Method or function arguments.",
							},
						},
						returns: 'any',
						description: "Invoke a method or a function as from inside the object.",
			}
			//! END_REPLACE()
			, function invoke(obj, fn, /*optional*/args) {
				if (types.isString(fn) || types.isSymbol(fn)) {
					fn = _shared.getAttribute(obj, fn);
				};
				if (args) {
					return fn.apply(obj, args);
				} else {
					return fn.call(obj);
				};
			});
			
		_shared.getAttribute = __Internal__.DD_DOC(
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
							attr: {
								type: 'string,Symbol',
								optional: false,
								description: "Attribute name.",
							},
						},
						returns: 'any',
						description: "Gets the value of an attribute as from inside the object.",
			}
			//! END_REPLACE()
			, function getAttribute(obj, attr) {
				return obj[attr];
			});
			
		_shared.getAttributes = __Internal__.DD_DOC(
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
							attrs: {
								type: 'arrayof(string,Symbol)',
								optional: false,
								description: "Attribute names.",
							},
						},
						returns: 'object',
						description: "Gets the value of multiple attributes as from inside the object.",
			}
			//! END_REPLACE()
			, function getAttributes(obj, attrs) {
				var attrsLen = attrs.length,
					result = {};
				for (var i = 0; i < attrsLen; i++) {
					var attr = attrs[i];
					result[attr] = _shared.getAttribute(obj, attr);
				};
				return result;
			});
			
		_shared.setAttribute = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 6,
						params: {
							obj: {
								type: 'object',
								optional: false,
								description: "An object.",
							},
							attr: {
								type: 'string,Symbol',
								optional: false,
								description: "Attribute name.",
							},
							value: {
								type: 'any',
								optional: false,
								description: "New value.",
							},
							options : {
								type: 'object',
								optional: true,
								description: "Options.",
							},
						},
						returns: 'object',
						description: "Sets the value of an attribute as from inside the object.",
			}
			//! END_REPLACE()
			, function setAttribute(obj, attr, value, /*optional*/options) {
				options = options && types.nullObject(options);
				if (types.hasProperties()) {
					var hasOwn = types.has(obj, attr),
						descriptor = types.getPropertyDescriptor(obj, attr),
						descConfigurable = !hasOwn || !descriptor || types.get(descriptor, 'configurable'),
						descWritable = !descriptor || types.get(descriptor, 'writable'),
						descGet = types.get(descriptor, 'get'),
						descSet = types.get(descriptor, 'set');
					if (hasOwn && descSet) {
						descSet.call(obj, value);
					} else if (hasOwn && descGet) {
						if (!options.ignoreWhenReadOnly && (!options.ignoreWhenSame || (descGet.call(obj) !== value))) {
							// NOTE: Use native error because something might be wrong
							throw new _shared.Natives.windowError(tools.format("Attribute '~0~' is read-only.", [attr]));
						};
					} else if (hasOwn && descWritable && !options) {
						obj[attr] = value;
					} else if (descConfigurable) {
						if (options) {
							if ('all' in options) {
								descriptor = {
									configurable: ('configurable' in options ? options.configurable : options.all),
									enumerable: ('enumerable' in options ? options.enumerable : options.all),
									writable: ('writable' in options ? options.writable : options.all),
								};
							} else {
								descriptor = options;
							};
						} else if (!descriptor) {
							descriptor = {configurable: true, enumerable: true, writable: true};
						};
						descriptor.value = value;
						types.defineProperty(obj, attr, descriptor);
					} else {
						if (!options.ignoreWhenReadOnly && (!options.ignoreWhenSame || (obj[attr] !== value))) {
							// NOTE: Use native error because something might be wrong
							throw new _shared.Natives.windowError(tools.format("Attribute '~0~' is read-only.", [attr]));
						};
					};
				} else {
					obj[attr] = value;
				};
				return value;
			});
			
		_shared.setAttributes = __Internal__.DD_DOC(
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
								type: 'object',
								optional: false,
								description: "name/value pairs.",
							},
							options : {
								type: 'object',
								optional: true,
								description: "Options.",
							},
						},
						returns: 'object',
						description: "Sets the value of multiple attribute as from inside the object.",
			}
			//! END_REPLACE()
			, function setAttributes(obj, values, /*optional*/options) {
				var keys = types.append(types.keys(values), types.symbols(values)),
					keysLen = keys.length;
				for (var i = 0; i < keysLen; i++) {
					var key = keys[i];
					_shared.setAttribute(obj, key, values[key], options);
				};
				return values;
			});

		//===================================
		// DD_DOC
		//===================================
		
		__Internal__.symbolDD_DOC = types.getSymbolFor('__DD_DOC__');
		
		//! REPLACE_BY("__Internal__.DD_DOC = function(d,v) {return v;}")
		__Internal__.DD_DOC = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
					author: "Claude Petit",
					revision: 1,
					params: {
						doc: {
							type: 'object',
							optional: false,
							description: "Document to apply.",
						},
						value: {
							type: 'any',
							optional: false,
							description: "Target value",
						},
					},
					returns: 'object',
					description: "Applies a document to an object and returns that object.",
			}
			//! END_REPLACE()
			, function DD_DOC(doc, value) {
				value = _shared.Natives.windowObject(value);
				if (types.hasDefinePropertyEnabled()) {
					types.defineProperty(value, __Internal__.symbolDD_DOC, {
						value: doc,
					});
				} else {
					value[__Internal__.symbolDD_DOC] = doc;
				};
				return value;
			});
		//! END_REPLACE()

		__Internal__.DD_GET_DOC = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
					author: "Claude Petit",
					revision: 1,
					params: null,
					returns: 'object',
					description: "Gets the document applied to an object.",
			}
			//! END_REPLACE()
			, function DD_GET_DOC(value) {
				return value[__Internal__.symbolDD_DOC];
			});
		
		(function() {
			for (var i = 0; i < __Internal__.tempDocs.length; i++) {
				__Internal__.DD_DOC.apply(null, __Internal__.tempDocs[i]);
			};
			delete __Internal__.tempDocs;
		})();
		
		//===================================
		// ES6 Proxy
		//===================================
			
		types.hasProxies = __Internal__.DD_DOC(
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
			})));

		types.hasProxyEnabled = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'bool',
						description: "Returns 'true' when ES6 Proxy is available and if it's enabled. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (__options__.enableProxies && _shared.Natives.windowProxy ? (function hasProxyEnabled() {
				return true;
			}) : (function hasProxyEnabled() {
				return false;
			})));

/* AS USUAL, NO DETECTION AVAILABLE !!! AND WORSE, THIS TIME THERE IS NO WAY AT ALL TO IMPLEMENT ONE
		types.isProxy = (_shared.Natives.windowProxy ? (function isProxy(obj) {
			return (obj instanceof _shared.Natives.windowProxy);
		}) : (function isProxy(obj) {
			if (types.isNothing(obj)) {
				return false;
			};
			obj = _shared.Natives.windowObject(obj);
			return !!obj.__isProxy__;
		}));
*/
		
		types.createProxy = __Internal__.DD_DOC(
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
			, (_shared.Natives.windowProxy ? (function createProxy(target, handler) {
				return new _shared.Natives.windowProxy(target, handler);
				
			}) : (function createProxy(target, handler) {
				var keys = types.allKeys(handler);
				for (var i = 0; i < keys.length; i++) {
					var key = keys[i];
					if (key !== 'apply') {
						throw new types.TypeError("Proxies not available.");
					};
				};
				
				if (handler.apply) {
					var _caller = function caller(/*paramarray*/) {
						return handler.apply.call(handler, target, this, arguments);
					};
					//types.defineProperty(_caller, '__isProxy__', {value: true});
					return _caller;
				} else {
					// "Invisible proxy"
					//return types.createObject(target, {__isProxy__: {value: true}});
					return types.createObject(target);
				};
			})));

		//===================================
		// Type
		//===================================
		
		_shared.SuperEnabledSymbol = types.getSymbolFor('__SUPER_ENABLED__');
		_shared.EnumerableSymbol = types.getSymbolFor('__ENUMERABLE__');
		_shared.ReadOnlySymbol = types.getSymbolFor('__READ_ONLY__');
		_shared.ConfigurableSymbol = types.getSymbolFor('__CONFIGURABLE__');
		__Internal__.symbolGetter = types.getSymbolFor('__GETTER__');
		__Internal__.symbolSetter = types.getSymbolFor('__SETTER__');
		
		types.INHERIT = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
						params: {
							base: {
								type: 'type',
								optional: false,
								description: "A type used as a base type.",
							},
							type: {
								type: 'type',
								optional: false,
								description: "A type to inherit.",
							},
						},
						returns: 'type',
						description: "Makes type inherits the base type.",
			}
			//! END_REPLACE()
			, function INHERIT(base, type) {
				if (types.baseof(base, type)) {
					// Already inherits base
					return type;
				};
				
				// console.log(Object.prototype.isPrototypeOf.call(Error.prototype, TypeError.prototype));
				// >>> true
				// var t1 = function(){};
				// var t2 = function(){};
				// t2.prototype = t1.prototype;
				// console.log(Object.prototype.isPrototypeOf.call(t1.prototype, t2.prototype));
				// >>> false   // BAD
				// var t1 = function(){};
				// var t2 = function(){};
				// t2.prototype = Object.setPrototypeOf(t2.prototype, t1.prototype);
				// console.log(Object.prototype.isPrototypeOf.call(t1.prototype, t2.prototype));
				// >>> true    // OK
				
				type = types.setPrototypeOf(type, base);

				type.prototype = types.createObject(base.prototype, {
					constructor: {
						configurable: true,
						value: type,
						writable: true,
					},
				});

				return type;
			});

		types.AttributeBox = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
						params: {
							value: {
								type: 'any',
								optional: false,
								description: "A value to box.",
							},
						},
						returns: 'AttributeBox',
						description: "Creates an attribute box with the specified value.",
			}
			//! END_REPLACE()
			, types.INHERIT(types.box, function AttributeBox(value) {
				//if (new.target) {
				if (this instanceof types.AttributeBox) {
					if (value instanceof types.box) {
						value.setAttributes(this);
						value = value[_shared.OriginalValueSymbol];
					};
					this[_shared.OriginalValueSymbol] = value;
					return this;
				} else {
					return new types.AttributeBox(value);
				};
			}));
			//types.extend(types.AttributeBox.prototype, {
			//});
			
		__Internal__.emptyFunction = function empty() {};
		
		types.SUPER = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
						params: {
							fn: {
								type: 'function',
								optional: false,
								description: "A method.",
							},
						},
						returns: 'AttributeBox',
						description: "Flags a method so it will override instead of replace. Returns an AttributeBox.",
			}
			//! END_REPLACE()
			, function SUPER(fn) {
				fn = types.AttributeBox(fn);
				fn[_shared.SuperEnabledSymbol] = true;
				return fn;
			});
		
		types.NOT_ENUMERABLE = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							val: {
								type: 'any',
								optional: false,
								description: "A value.",
							},
						},
						returns: 'AttributeBox',
						description: "Flags an attribute as not enumerable. Returns an AttributeBox.",
			}
			//! END_REPLACE()
			, function NOT_ENUMERABLE(val) {
				val = types.AttributeBox(val);
				val[_shared.EnumerableSymbol] = false;
				return val;
			});

		types.ENUMERABLE = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							val: {
								type: 'any',
								optional: false,
								description: "A value.",
							},
						},
						returns: 'AttributeBox',
						description: "Flags an attribute as enumerable. Returns an AttributeBox.",
			}
			//! END_REPLACE()
			, function ENUMERABLE(val) {
				val = types.AttributeBox(val);
				val[_shared.EnumerableSymbol] = true;
				return val;
			});

		types.NOT_CONFIGURABLE = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							val: {
								type: 'any',
								optional: false,
								description: "A value.",
							},
						},
						returns: 'AttributeBox',
						description: "Flags an attribute as not configurable. Returns an AttributeBox.",
			}
			//! END_REPLACE()
			, function NOT_CONFIGURABLE(val) {
				val = types.AttributeBox(val);
				val[_shared.ConfigurableSymbol] = false;
				return val;
			});

		types.CONFIGURABLE = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							val: {
								type: 'any',
								optional: false,
								description: "A value.",
							},
						},
						returns: 'AttributeBox',
						description: "Flags an attribute as configurable. Returns an AttributeBox.",
			}
			//! END_REPLACE()
			, function CONFIGURABLE(val) {
				val = types.AttributeBox(val);
				val[_shared.ConfigurableSymbol] = true;
				return val;
			});

		types.READ_ONLY = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							val: {
								type: 'any',
								optional: false,
								description: "A value.",
							},
						},
						returns: 'AttributeBox',
						description: "Flags an attribute as read-only. Returns an AttributeBox.",
			}
			//! END_REPLACE()
			, function READ_ONLY(val) {
				val = types.AttributeBox(val);
				if (val[__Internal__.symbolGetter] || val[__Internal__.symbolSetter]) {
					throw new types.Error("'READ_ONLY' can't be applied on a get/set attribute.");
				};
				val[_shared.ReadOnlySymbol] = true;
				return val;
			});

		types.WRITABLE = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							val: {
								type: 'any',
								optional: false,
								description: "A value.",
							},
						},
						returns: 'AttributeBox',
						description: "Flags an attribute as writable. Returns an AttributeBox.",
			}
			//! END_REPLACE()
			, function WRITABLE(val) {
				val = types.AttributeBox(val);
				if (val[__Internal__.symbolGetter] || val[__Internal__.symbolSetter]) {
					throw new types.Error("'WRITABLE' can't be applied on a get/set attribute.");
				};
				val[_shared.ReadOnlySymbol] = false;
				return val;
			});

		types.GET_SET = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							getter: {
								type: 'function',
								optional: true,
								description: "The getter function.",
							},
							setter: {
								type: 'function',
								optional: true,
								description: "The setter function.",
							},
						},
						returns: 'AttributeBox',
						description: "Creates a get/set attribute.",
			}
			//! END_REPLACE()
			, function GET_SET(getter, setter) {
				val = types.AttributeBox();
				val[__Internal__.symbolGetter] = getter;
				val[__Internal__.symbolSetter] = setter;
				return val;
			});

		types.GET = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							getter: {
								type: 'function',
								optional: true,
								description: "The getter function.",
							},
						},
						returns: 'AttributeBox',
						description: "Creates a get attribute.",
			}
			//! END_REPLACE()
			, function GET(getter) {
				val = types.AttributeBox();
				val[__Internal__.symbolGetter] = getter;
				return val;
			});

		types.SET = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							setter: {
								type: 'function',
								optional: true,
								description: "The setter function.",
							},
						},
						returns: 'AttributeBox',
						description: "Creates a set attribute.",
			}
			//! END_REPLACE()
			, function SET(setter) {
				val = types.AttributeBox();
				val[__Internal__.symbolSetter] = setter;
				return val;
			});

		// <PRB> If "prototype" is not configurable, we can't set it to read-only
		__Internal__.prototypeIsConfigurable = false;
		(function() {
			if (types.hasProperties()) {
				var f = function() {};
				var desc = types.getOwnPropertyDescriptor(f, 'prototype');
				__Internal__.prototypeIsConfigurable = desc.configurable;
			};
		})();
			
		// TODO: Find another way
		_shared.reservedAttributes = types.nullObject({
			//name: null, 
			//apply: null, 
			//call: null, 
			//bind: null, 
			arguments: null, 
			caller: null, 
			length: null, 
			prototype: null,
			
			//__proto__: null,   must be handled conditionally
			constructor: null, 
			
			__defineGetter__: null,
			__lookupGetter__: null,
			__defineSetter__: null,
			__lookupSetter__: null,
			
			_super: null,

			$TYPE_NAME: null,
		});
		
		_shared.reservedAttributes[__Internal__.symbolInitialized] = null;
		_shared.reservedAttributes[__Internal__.symbol$IsSingleton] = null;
		_shared.reservedAttributes[__Internal__.symbolDD_DOC] = null;
		
		// <PRB> Proxy checks existence of the property in the target AFTER the handler instead of BEFORE. That prevents us to force non-configurable and non-writable on a NEW NON-EXISTING property with a different value.
		//       Error given is "TypeError: 'set' on proxy: trap returned truish for property 'doodad' which exists in the proxy target as a non-configurable and non-writable data property with a different value"
		/*
		_shared.proxyHasSetHandlerBug = false;
		(function() {
			if (types.hasProxies()) {
				var proxy = types.createProxy(types.createObject(null), {
					set: function(target, prop, val) {
						// Should set NEW NON-EXISTING property as non-configurable and non-writable with a different value.
						types.defineProperty(target, prop, {
							//configurable: false,  'FALSE' is the default
							value: val + 1,
							//writable: false,  'FALSE' is the default
						});
						return true;
					},
				});
				try {
					proxy.doodad = 1;
				} catch(ex) {
					_shared.proxyHasSetHandlerBug = true;
				};
			};
		})();
		*/
		
		__Internal__.createCaller = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 2,
						params: {
							attr: {
								type: 'string,Symbol',
								optional: false,
								description: "The method name.",
							},
							fn: {
								type: 'function',
								optional: false,
								description: "The new function.",
							},
							superFn: {
								type: 'function',
								optional: true,
								description: "The old function from base.",
							},
						},
						returns: 'method',
						description: "Returns a new method which is the result of the override.",
			}
			//! END_REPLACE()
			, function createCaller(attr, fn, /*optional*/superFn) {
				var superFn = superFn || __Internal__.emptyFunction;
				var _caller = function caller(/*paramarray*/) {
					var oldSuper = _shared.getAttribute(this, '_super');
					_shared.setAttribute(this, '_super', superFn);
					try {
						return fn.apply(this, arguments);
					} catch (ex) {
						throw ex;
					} finally {
						_shared.setAttribute(this, '_super', oldSuper);
					};
				};
				_caller = types.setPrototypeOf(_caller, types.SUPER);
				return _caller;
			});

		types.SINGLETON = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
						paramsDirection: 'rightToLeft',
						params: {
							type: {
								type: 'type',
								optional: false,
								description: "A Doodad type.",
							},
						},
						returns: 'type',
						description: "Transforms a Doodad type to a singleton object. Returns that singleton object.",
			}
			//! END_REPLACE()
			, function SINGLETON(type) {
				if (!types.isType(type)) {
					throw new types.Error("Invalid type.");
				};

				if (!types.isSingleton(type)) {
					//var val = __Internal__.createCaller('$inherit', function $inherit(/*paramarray*/) {
					//		var obj = this._super.apply(this, arguments) || this;
					//		var type = types.getType(obj);
					//		return types.newInstance(type, args);
					//	}, type.$inherit);
					//_shared.setAttribute(type, '$inherit', val, {all: true});


					//var val = __Internal__.createCaller('$inherit', function $inherit(/*paramarray*/) {
					//		var type = this._super.apply(this, arguments) || this;
					//		type = types.getType(type);
					//		return type.$inherit.apply(type, arguments);
					//	}, type.prototype.$inherit);
					//_shared.setAttribute(type.prototype, '$inherit', val, {all: true});


					_shared.setAttribute(type, __Internal__.symbol$IsSingleton, true, {});
				};
				
				return type;
			});
		
		types.INIT = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
						params: {
							type: {
								type: 'type',
								optional: false,
								description: "A Doodad type.",
							},
							args: {
								type: 'arrayof(any)',
								optional: true,
								description: "Arguments of the constructor.",
							},
						},
						returns: 'type',
						description: "Initialize a Doodad type. Returns that type.",
			}
			//! END_REPLACE()
			, function INIT(type, /*optional*/args) {
				if (types.isInitialized(type)) {
					return type;
				} else {
					type = type.apply(type, args) || type;
					if (types.isSingleton(type)) {
						type = types.newInstance(type, args);
					};
					return type;
				};
			});
			
		types.isInitialized = function isInitialized(obj) {
			return !!(types.isLike(obj, types.Type) && types.get(obj, __Internal__.symbolInitialized));
		};
		
		__Internal__.applyProto = function applyProto(target, base, proto, preApply, skipExisting) {
			var forType = types.isType(target),
				keys = types.append(types.keys(proto), types.symbols(proto));

			for (var i = 0; i < keys.length; i++) {
				var key = keys[i];

				var hasValue = types.has(target, key);
				//if (hasValue && skipExisting) {
				//	continue;
				//};

				if ((key !== '__proto__') && !(key in _shared.reservedAttributes)) {
					var attr = types.AttributeBox(proto[key]),
						targetValue = hasValue && target[key],
						value = types.unbox(hasValue ? targetValue : attr),
						isFunction = types.isJsFunction(value),
						createSuper = (!hasValue && isFunction ? types.get(attr, _shared.SuperEnabledSymbol) : false);

					if (createSuper) {
						value = __Internal__.createCaller(key, value, base && _shared.getAttribute(base, key));
					};

					if (preApply) {
						_shared.setAttribute(target, key, value, {all: true});

					} else {
						var enu = types.get(attr, _shared.EnumerableSymbol);
						if (types.isNothing(enu)) {
							enu = true;
						};

						var cf = types.get(attr, _shared.ConfigurableSymbol);
						var g = types.get(attr, __Internal__.symbolGetter);
						var s = types.get(attr, __Internal__.symbolSetter);

						if (g || s) {
							// TODO: SUPER

							if (types.isNothing(cf)) {
								cf = false;
							};

							types.defineProperty(target, key, {
								configurable: !!cf,
								get: g || undefined,
								set: s || undefined,
							});
						} else {
							var ro = types.get(attr, _shared.ReadOnlySymbol);
							if (types.isNothing(ro)) {
								ro = isFunction;
							};

							if (types.isNothing(cf)) {
								cf = false;
							};

							_shared.setAttribute(target, key, value, {
								configurable: !!cf,
								enumerable: !!enu,
								writable: !ro,
								ignoreWhenReadOnly: true,
							});
						};
					};
				};
			};

			types.defineProperty(target, '_super', {value: null, writable: true});
		};

		types.createType = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 6,
						params: {
							name: {
								type: 'string',
								optional: true,
								description: "Name of the new type.",
							},
							base: {
								type: 'type',
								optional: true,
								description: "A Doodad type to inherit.",
							},
							constructor: {
								type: ['string', 'function'],
								optional: true,
								description: "The constructor body, or the constructor function.",
							},
							typeProto: {
								type: 'object',
								optional: true,
								description: "An object to be used as the prototype of the new type.",
							},
							instanceProto: {
								type: 'object',
								optional: true,
								description: "An object to be used as the prototype of the instances of the new type.",
							},
							constructorContext: {
								type: 'any',
								optional: true,
								description: "A variable that can be used by the constructor body.",
							},
						},
						returns: 'type',
						description: "Creates and returns a new Doodad type. N.B.: You should always use methods '$inherit' and '$extend' instead of this function.",
			}
			//! END_REPLACE()
			, function createType(/*optional*/name, /*optional*/base, /*optional*/constructor, /*optional*/typeProto, /*optional*/instanceProto, /*optional*/constructorContext) {
				if (types.isNothing(name)) {
					name = '';
				};
				
				var baseIsType = types.isType(base);
				if (baseIsType) {
					if (!types.get(base, __Internal__.symbolInitialized)) {
						throw new _shared.Natives.windowError("Base type '" + types.getTypeName(base) + "' is not initialized.");
					};
				};
				
				if (types.isNothing(constructor)) {
					constructor = "return this._new && this._new.apply(this, arguments);";
				};
				
				if (types.isString(constructor)) {
					constructorContext = types.extend({}, constructorContext, {
						base: base,
					});
					// TODO: Avoid this extra function ?
					constructor = types.eval("function(/*paramarray*/) {" + constructor + "}", constructorContext);
				};
				
				// NOTE: 'eval' is the only way found to give a name to dynamicaly created functions.
				var expr = "function " + name.replace(/[.]/g, "_") + "(/*paramarray*/) {" + 
					//"if (ctx.get(this, ctx.InitializedSymbol)) {" +
					//	"throw new ctx.Error('Object is already initialized.');" +
					//"};" +

					"var forType = ctx.isFunction(this);" +

					"if (forType) {" +
						"if ((this !== ctx.type) && (!ctx.baseof(ctx.type, this))) {" +
							"throw new ctx.Error('Wrong constructor.');" +
						"};" +
					"} else {" +
						"if (!ctx.get(ctx.type, ctx.InitializedSymbol)) {" +
							"throw new ctx.Error(\"Type '\" + ctx.getTypeName(ctx.type) + \"' is not initialized.\");" +
						"};" +
						"if (!(this instanceof ctx.type)) {" +
							"throw new ctx.Error('Wrong constructor.');" +
						"};" +
					"};" +

					(!__Internal__.prototypeIsConfigurable ?
						// <PRB> "prototype" is not configurable, so we can't set it to read-only
						"if (!forType) {" +
							"if (ctx.type.prototype !== ctx.proto) {" +
								// Something has changed the prototype. Set it back to original and recreate the object.
								"ctx.type.prototype = ctx.proto;" +
								"return ctx.newInstance(ctx.type, arguments);" +
							"};" +
						"};"
					:
						""
					) +

					"var obj;" +
					"if (!ctx.get(this, ctx.InitializedSymbol)) {" +
						"ctx.setAttribute(this, ctx.InitializedSymbol, true, {});" +
						"obj = ctx.constructor.apply(this, arguments) || this;" + // _new
					"} else {" +
						"obj = this;" +
					"};" +

					(typeProto ?
						"if (forType) {" +
							"ctx.applyProto(obj, ctx.base, ctx.typeProto);" +
						"};"
					: 
						""
					) +

					(instanceProto ?
						"if (!forType) {" +
							"ctx.applyProto(obj, ctx.instanceBase, ctx.instanceProto, false, true);" +
						"};"
					: 
						""
					) +

					(baseIsType ?
						"ctx.base.apply(obj, arguments);"
					:
						""
					) +

					(baseIsType ? 
						""
					:
						"if ((obj !== this) && !ctx.get(obj, ctx.InitializedSymbol)) {" +
							"ctx.setAttribute(obj, ctx.InitializedSymbol, true, {});" +
						"};"
					) +

					"return obj;" +
				"}";
				
				var ctx = {
					base: base,
					constructor: constructor,
					Error: _shared.Natives.windowError,
					isFunction: types.isFunction,
					baseof: types.baseof,
					newInstance: types.newInstance,
					get: types.get,
					protectObject: __Internal__.protectObject,
					setAttribute: _shared.setAttribute,
					InitializedSymbol: __Internal__.symbolInitialized,
					getTypeName: types.getTypeName,
					typeProto: typeProto, 
					instanceProto: instanceProto,
					instanceBase: (base ? base.prototype : null),
					applyProto: __Internal__.applyProto,
				};
				var type = types.eval(expr, ctx);
				
				// Inherit base
				var proto;
				var baseIsType = false;
				if (base) {
					baseIsType = types.isType(base);
					type = types.INHERIT(base, type);
					proto = type.prototype;
				} else {
//IE8					// IE 8
//IE8					proto = types.createObject({});
//IE8					type.prototype = proto;
					proto = type.prototype;
				};
			
				ctx.type = type;
				ctx.proto = proto;
			
				proto.constructor = type;
				
				_shared.setAttribute(type, '$TYPE_NAME', name, {});
				
				if (typeProto) {
					__Internal__.applyProto(type, base, typeProto, true);
				};

				if (instanceProto) {
					__Internal__.applyProto(proto, ctx.instanceBase, instanceProto);
				};
				
				// Return type
				return type;
			});
		

		__Internal__.typeInherit = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 2,
						params: {
							typeProto: {
								type: 'object',
								optional: true,
								description: "An object to be used as the prototype of the new type.",
							},
							instanceProto: {
								type: 'object',
								optional: true,
								description: "An object to be used as the prototype of the instances of the new type.",
							},
							constructor: {
								type: ['string', 'function'],
								optional: true,
								description: "The constructor body, or the constructor function. Defaults to a call to the method '_new'.",
							},
							constructorContext: {
								type: 'any',
								optional: true,
								description: "A variable that can be used by the constructor body.",
							},
						},
						returns: 'type',
						description: "Creates and returns a new Doodad type that inherits from 'this'.",
			}
			//! END_REPLACE()
			, function $inherit(/*optional*/typeProto, /*optional*/instanceProto, /*optional*/constructor, /*optional*/constructorContext) {
				// <PRB> "fn.call(undefined, ...)" can automatically set "this" to "window" !
				var base = ((this === global) ? undefined: this);
				
				var name = null;
				if (typeProto) {
					name = types.get(typeProto, '$TYPE_NAME');
					typeProto['$TYPE_NAME'] = types.READ_ONLY(name || null);
					name = types.unbox(name) || null;
				};
	
				var type = types.createType(
						/*name*/
						name,
						
						/*base*/
						base, 
						
						/*constructor*/
						constructor, 
						
						/*typeProto*/
						typeProto, 
						
						/*instanceProto*/
						instanceProto, 
						
						/*constructorContext*/
						constructorContext
					);
					
				return type;
			});
		
		//__Internal__.typeNew = __Internal__.DD_DOC(
		//	//! REPLACE_IF(IS_UNSET('debug'), "null")
		//	{
		//				author: "Claude Petit",
		//				revision: 1,
		//				params: null,
		//				returns: 'undefined',
		//				description: "Object or type creator.",
		//	}
		//	//! END_REPLACE()
		//	, function _new() {
		//	});
		
		//__Internal__.typeDelete = __Internal__.DD_DOC(
		//	//! REPLACE_IF(IS_UNSET('debug'), "null")
		//	{
		//				author: "Claude Petit",
		//				revision: 1,
		//				params: null,
		//				returns: 'undefined',
		//				description: "Object or type destructor.",
		//	}
		//	//! END_REPLACE()
		//	, function _delete() {
		//	});
		
		__Internal__.typeToString = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							paramarray: {
								type: 'arrayof(any)',
								optional: true,
								description: "Arguments.",
							},
						},
						returns: 'string',
						description: "Converts the object to a string using neutral locale and returns that string.",
			}
			//! END_REPLACE()
			, function toString(/*paramarray*/) {
				if (types.isType(this)) {
					return '[type ' + types.getTypeName(this) + ']';
				} else {
					var name = types.getTypeName(this);
					if (name) {
						return '[object ' + name + ']';
					} else {
						return this._super.apply(this, arguments);
					};
				};
			});
		
		__Internal__.typeToLocaleString = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							paramarray: {
								type: 'arrayof(any)',
								optional: true,
								description: "Arguments.",
							},
						},
						returns: 'string',
						description: "Converts the object to a string using current locale and returns that string.",
			}
			//! END_REPLACE()
			, function toLocaleString(/*paramarray*/) {
				return this.toString.apply(this, arguments);
			});

		__Internal__.typeTypeProto = {
			$TYPE_NAME: 'Type',

			_super: null,
			
			$inherit: __Internal__.typeInherit,
			
			_new: types.READ_ONLY(null), //__Internal__.typeNew,
			_delete: types.READ_ONLY(null), //__Internal__.typeDelete,
			
			toString: types.SUPER(__Internal__.typeToString),
			toLocaleString: types.SUPER(__Internal__.typeToLocaleString),
		};
		
		 __Internal__.typeTypeProto[__Internal__.symbol$IsSingleton] = false,

		__Internal__.typeInstanceProto = {
			_super: null,
			
			_new: types.READ_ONLY(null), //__Internal__.typeNew,
			_delete: types.READ_ONLY(null), //__Internal__.typeDelete,
			
			toString: types.SUPER(__Internal__.typeToString),
			toLocaleString: types.SUPER(__Internal__.typeToLocaleString),
		}
		
		types.Type = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
						params: null,
						returns: 'object',
						description: "Base type of every Doodad types.",
			}
			//! END_REPLACE()
			, __Internal__.typeInherit.call(undefined,
				/*typeProto*/
				__Internal__.typeTypeProto,
				
				/*instanceProto*/
				__Internal__.typeInstanceProto
			));
			
		__Internal__.REGISTER(types.Type);

		//===================================
		// Event functions
		//===================================
			
		// NOTE: 2015/04/16 We can't inherit from the actual implementations of Event and CustomEvent !
		__Internal__.REGISTER(__Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							type: {
								type: 'string',
								optional: false,
								description: "Event name.",
							},
							init: {
								type: 'object',
								optional: true,
								description: "Object to initialize event with.",
							},
						},
						returns: 'object',
						description: "Custom event type for custom event targets.",
			}
			//! END_REPLACE()
			, types.Type.$inherit(
				/*typeProto*/
				{
					$TYPE_NAME: 'CustomEvent',
				},
				/*instanceProto*/
				{
					type: types.READ_ONLY(null),
					bubbles: types.READ_ONLY(false),
					cancelable: types.READ_ONLY(false),
					detail: types.READ_ONLY(null),
					
					canceled: false,   // preventDefault
					bubbling: false,   // stopPropagation
					stopped: false,    // stopImmediatePropagation
					
					_new: types.SUPER(function _new(type, /*optional*/init) {
						this._super();
						//if (new.target) {
						if (this instanceof types.CustomEvent) {
							init = types.nullObject(init);
							_shared.setAttributes(this, {
								type: type,
								// NOTE: Event targets are responsible to bubble events to their parent when "bubbling" is true.
								bubbles: !!init.bubbles,
								cancelable: !!init.cancelable,
								detail: init.detail,
							}, {all: true});
							this.bubbling = this.bubbles;
						};
					}),
					
					preventDefault: __Internal__.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
											author: "Claude Petit",
											revision: 0,
											params: null,
											returns: 'undefined',
											description: "Prevents default behavior of the object that raises the event.",
								}
								//! END_REPLACE()
						, function() {
							// NOTE: "preventDefault" should be "cancel".
							if (this.cancelable) {
								this.canceled = true;
							};
						}),
						
					stopPropagation: __Internal__.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
											author: "Claude Petit",
											revision: 0,
											params: null,
											returns: 'undefined',
											description: "Stops propagation of the event.",
								}
								//! END_REPLACE()
						, function stopPropagation() {
							// NOTE: "stopPropagation" should be "preventBubbling".
							this.bubbling = false;
						}),
						
					stopImmediatePropagation: __Internal__.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
											author: "Claude Petit",
											revision: 0,
											params: null,
											returns: 'undefined',
											description: "Stops propagation of the event and breaks the listeners chain.",
								}
								//! END_REPLACE()
						, function stopImmediatePropagation() {
							// NOTE: "stopImmediatePropagation" should be "stopPropagation".
							this.bubbling = false;
							this.stopped = true;
						}),
				}
			)));
		
		__Internal__.symbolEventListeners = types.getSymbolFor('__EVENT_LISTENERS__');
		
		__Internal__.REGISTER(__Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
						params: null,
						returns: 'object',
						description: "Custom event target.",
			}
			//! END_REPLACE()
			, types.Type.$inherit(
				/*typeProto*/
				{
					$TYPE_NAME: 'CustomEventTarget',
				},
				/*instanceProto*/
				{
					_new: types.SUPER(function _new() {
						this._super();
						//if (new.target) {
						if (this instanceof types.CustomEventTarget) {
							_shared.setAttribute(this, __Internal__.symbolEventListeners, types.nullObject(), {
								configurable: true, 
								//enumerable: false,  'FALSE' is the default
								//writable: false 'FALSE' is the default
							});
						};
					}),
					
					addEventListener: __Internal__.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
											author: "Claude Petit",
											revision: 0,
											params: {
												type: {
													type: 'string',
													optional: false,
													description: "Event name.",
												}, 
												handler: {
													type: 'function',
													optional: false,
													description: "Callback function",
												}, 
												useCapture: {
													type: 'boolean',
													optional: true,
													description: "Reserved.",
												}, 
												wantsUntrusted: {
													type: 'boolean',
													optional: true,
													description: "Reserved.",
												},
											},
											returns: 'undefined',
											description: "Adds an event listener for the specified event name.",
								}
								//! END_REPLACE()
						, function addEventListener(type, handler, /*optional*/useCapture, /*optional*/wantsUntrusted) {
							type = type.toLowerCase();
							useCapture = !!useCapture;
							wantsUntrusted = (types.isNothing(wantsUntrusted) ? true : !!wantsUntrusted);
							
							var listeners = this[__Internal__.symbolEventListeners][type];
							if (!types.isArray(listeners)) {
								this[__Internal__.symbolEventListeners][type] = listeners = [];
							};
							var found = false;
							for (var i = 0; i < listeners.length; i++) {
								var value = listeners[i];
								if ((value[0] === handler) && (value[1] === useCapture)) {
									found = true;
									break;
								};
							};
							if (!found) {
								listeners.push([handler, useCapture, wantsUntrusted]);
							};
						}),
						
					removeEventListener: __Internal__.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
											author: "Claude Petit",
											revision: 1,
											params: {
												type: {
													type: 'string',
													optional: false,
													description: "Event name.",
												}, 
												handler: {
													type: 'function',
													optional: false,
													description: "Original callback function",
												}, 
												useCapture: {
													type: 'boolean',
													optional: true,
													description: "Reserved.",
												}, 
											},
											returns: 'undefined',
											description: "Removes an event listener for the specified event name.",
								}
								//! END_REPLACE()
						, function removeEventListener(type, /*optional*/handler, /*optional*/useCapture) {
							type = type.toLowerCase();
							
							if (type in this[__Internal__.symbolEventListeners]) {
								var listeners = this[__Internal__.symbolEventListeners][type];
								if (types.isArray(listeners)) {
									if (types.isNothing(useCapture)) {
										for (var i = listeners.length - 1; i >= 0; i--) {
											var value = listeners[i];
											if (!handler || (value[0] === handler)) {
												listeners.splice(i, 1);
											};
										};
									} else {
										useCapture = !!useCapture;
										for (var i = listeners.length - 1; i >= 0; i--) {
											var value = listeners[i];
											if ((!handler || (value[0] === handler)) && (value[1] === useCapture)) {
												listeners.splice(i, 1);
											};
										};
									};
								};
							};
						}),
						
					dispatchEvent: __Internal__.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
											author: "Claude Petit",
											revision: 0,
											params: {
												event: {
													type: 'string',
													optional: false,
													description: "Event name.",
												}, 
											},
											returns: 'any',
											description: "Raises an event by its name.",
								}
								//! END_REPLACE()
						, function dispatchEvent(event) {
							// TODO: What should I do with "useCapture" ???
							// TODO: Implement "wantsUntrusted" ?
							var type = event.type.toLowerCase();
							
							var res = true;
							
							if (!event.stopped) {
								var	listeners;
								if (type in this[__Internal__.symbolEventListeners]) {
									listeners = this[__Internal__.symbolEventListeners][type];
								} else {
									this[__Internal__.symbolEventListeners][type] = listeners = [];
								};
								
								if (listeners.__locked) {
									return res;
									//throw new types.Error("Listeners locked for event '~0~'.", [type]);
								};
								
								try {
									listeners.__locked = true;  // prevents infinite loop
									
									var listenersLen = listeners.length;
									for (var i = 0; i < listenersLen; i++) {
										var listener = listeners[i];
										var retval = listener[0].call(this, event);
										if (event.canceled) {
											res = false;
										};
										if (retval === false) {
											event.stopImmediatePropagation();
										};
										if (event.stopped) {
											break;
										};
									};
									
									type = 'on' + type;
									if (!event.stopped && types.has(this, type)) {
										var fn = this[type];
										if (types.isFunction(fn)) {
											var retval = fn.call(this, event);
											if (event.canceled) {
												res = false;
											};
											if (retval === false) {
												event.stopImmediatePropagation();
											};
										};
									};
								} catch(ex) {
									throw ex;
								} finally {
									listeners.__locked = false;
								};
							};
							
							return res;
						}),
						
					clearListeners: __Internal__.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
											author: "Claude Petit",
											revision: 0,
											params: null,
											returns: 'undefined',
											description: "Removes every event listeners.",
								}
								//! END_REPLACE()
						, function clearListeners() {
							this[__Internal__.symbolEventListeners].length = 0;
						}),
				}
			)));
		
		//===================================
		// Namespace
		//===================================
		
		types.Namespace = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
						params: {
							parent: {
								type: 'Doodad.Types.Namespace',
								optional: false,
								description: "Parent namespace.",
							}, 
							name: {
								type: 'string',
								optional: false,
								description: "Short name.",
							}, 
							fullName: {
								type: 'string',
								optional: false,
								description: "Full name.",
							},
						},
						returns: 'Namespace',
						description: "Namespace object.",
			}
			//! END_REPLACE()
			, types.CustomEventTarget.$inherit(
				/*typeProto*/
				{
					$TYPE_NAME: 'Namespace',
					
					DD_PARENT: types.READ_ONLY(null),
					DD_NAME: types.READ_ONLY(null),
					DD_FULL_NAME: types.READ_ONLY(null),

					_new: types.SUPER(function _new(/*optional*/parent, /*optional*/name, /*optional*/fullName) {
						this._super();
						
						_shared.setAttributes(this, {
							DD_PARENT: parent,
							DD_NAME: name,
							DD_FULL_NAME: fullName,
						}, {all: true});
					}),
				},
				/*instanceProto*/
				{
					DD_PARENT: types.READ_ONLY(null),
					DD_NAME: types.READ_ONLY(null),
					DD_FULL_NAME: types.READ_ONLY(null),

					REGISTER: function REGISTER(/*<<< optional*/args, /*optional*/protect, type) {
						return _shared.REGISTER && _shared.REGISTER.apply(this, arguments);
					},
					
					UNREGISTER: function UNREGISTER(type) {
						return _shared.UNREGISTER && _shared.UNREGISTER.apply(this, arguments);
					},
					
					_new: types.SUPER(function _new(/*optional*/parent, /*optional*/name, /*optional*/fullName) {
						this._super();
						
						_shared.setAttributes(this, {
							DD_PARENT: parent,
							DD_NAME: name,
							DD_FULL_NAME: fullName,
						}, {all: true});
					}),
				}
			));

		__Internal__.REGISTER(types.Namespace);
		
		//===================================
		// Secret
		//===================================

		_shared.SECRET = types.get(_options, 'secret');

//! IF_SET("serverSide")
		//===================================
		// Server Modules
		//===================================

//! ELSE()
		//===================================
		// Client Modules
		//===================================
/*
		if (typeof global.document === 'object') {
			__Internal__.modules = types.nullObject();

			_shared.setAttribute(global.document, 'getScriptModule', function getScriptModule(name) {
				return __Internal__.modules[name];
			}, {});

			_shared.setAttribute(global.document, 'registerScriptModule', function registerScriptModule(name, module / *, secret* /) {
				//if (secret !== _shared.SECRET) {
				//	throw new types.AccessDenied("Secrets mismatch.");
				//};
				types.freezeObject(module);
				types.freezeObject(module.exports);
				_shared.setAttribute(__Internal__.modules, name, module, {});
			}, {});
		};
*/
//! END_IF()

		//===================================
		// Root
		//===================================

		return types.INIT(__Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 2,
						params: {
							modules: {
								type: 'object',
								optional: true,
								description: "Object of modules to load.",
							}, 
							options: {
								type: 'object',
								optional: true,
								description: "Module options.",
							},
						},
						returns: 'object',
						description: "Namespace root.",
			}
			//! END_REPLACE()
			, types.SINGLETON(types.Namespace.$inherit(
				/*typeProto*/
				{
					$TYPE_NAME: 'Root',
				},
				/*instanceProto*/
				{
					//DD_ASSERT: types.WRITABLE(null),
					
					_new: types.SUPER(function _new(/*optional*/modules, /*optional*/options) {
						// TODO: Set namespace members to read-only
	
						/////types.defineProperty(global, 'root', {get: function() {debugger;}});

						this._super(null, '<Root>', '<Root>');

						options = types.nullObject(options);
						
						var root = this;

						// Prebuild "Doodad.Types" and "Doodad.Tools"
						// NOTE: 'Doodad' is the parent of 'Types', 'Tools' and 'Namespaces', but it depends on them. I should have put these namespaces at Root, but it's too late now.
						root.Doodad = new types.Namespace(root, 'Doodad', 'Doodad');
						root.Doodad.Types = types;
						root.Doodad.Tools = tools;

						var nsObjs = types.nullObject({
							'Doodad': root.Doodad,
							'Doodad.Types': types,
							'Doodad.Tools': tools,
						});

						root.createRoot = exports.createRoot;
						root.DD_DOC = __Internal__.DD_DOC;
						root.DD_GET_DOC = __Internal__.DD_GET_DOC;
						root.Namespace = types.Namespace;
						
						if (types.hasDefinePropertyEnabled()) {
							types.defineProperty(root, 'DD_ASSERT', {
								get: function() {
									return __Internal__.DD_ASSERT;
								},
							});
						};
						
						if (__options__.enableAsserts) {
							this.enableAsserts();
						};
						
						// Load bootstrap modules

						modules[MODULE_NAME] = {
							type: 'Package',
							version: MODULE_VERSION,
							bootstrap: true,
						};
						
						var names = types.keys(modules),
							inits = types.nullObject(),
							name;
							
						whileName: while (name = names.shift()) {
							var mod = modules[name];
							mod.name = name;
							if (mod.bootstrap) {
								var deps = (mod.dependencies || []);
								forEachDep: for (var i = 0; i < deps.length; i++) {
									if (i in deps) {
										var dep = deps[i],
											optional = false;
										if (types.isObject(dep)) {
											optional = dep.optional;
											dep = dep.name;
										};
										var loading = (dep in inits);
										if (!types.has(modules, dep) && !loading) {
											if (optional) {
												loading = true;
											} else {
												throw new types.Error("Missing bootstrap module '~0~'.", [dep]);
											};
										};
										if (!loading) {
											names.push(name);
											continue whileName;
										};
									};
								};
								
								var shortNames = name.split('.'),
									proto = mod.proto,
									nsObj = null,
									parent = root,
									fullName = '';
									
								forEachShortName: for (var k = 0; k < shortNames.length; k++) {
									var shortName = shortNames[k].split('/', 1)[0];
									fullName += '.' + shortName;
									var fn = fullName.slice(1);
									//var prevNsObj = nsObjs[fn];
									var prevNsObj = types.get(parent, shortName);
									if ((k === (shortNames.length - 1)) && (proto || (prevNsObj && !(prevNsObj instanceof types.Namespace)))) {
										var nsType = types.getType(prevNsObj) || types.Namespace;
										if (prevNsObj && !(prevNsObj instanceof types.Namespace)) {
											var nsProto = {};
											var prevNsObjKeys = types.append(types.keys(prevNsObj), types.symbols(prevNsObj));
											for (var i = 0; i < prevNsObjKeys.length; i++) {
												var prevNsObjKey = prevNsObjKeys[i];
												var prevNsObjVal = prevNsObj[prevNsObjKey];
												if (!(prevNsObjVal instanceof types.AttributeBox)) {
													// Sets everything to READ_ONLY by default
													prevNsObjVal = types.READ_ONLY(types.ENUMERABLE(prevNsObjVal));
												};
												nsProto[prevNsObjKey] = prevNsObjVal;
											};
											nsType = types.INIT(nsType.$inherit(
												/*typeProto*/
												{
													$TYPE_NAME: types.getTypeName(nsType),
												},
												/*instanceProto*/
												nsProto
											));
										};
										if (proto) {
											// Extend namespace object
											if (types.isFunction(proto)) {
												proto = proto(root);
											};
											if (!types.isArray(proto)) {
												proto = [
													/*typeProto*/
													{
														$TYPE_NAME: types.getTypeName(nsType),
													},
													/*instanceProto*/
													proto
												];
											};
											nsType = types.INIT(nsType.$inherit.apply(nsType, proto));
										};
										nsObj = new nsType(parent, shortName, fn);
										// Update module variables
										if (prevNsObj === types) {
											types = nsObj;
										} else if (prevNsObj === tools) {
											tools = nsObj;
										};
									} else if (!prevNsObj) {
										nsObj = new types.Namespace(parent, shortName, fn);
									} else {
										nsObj = prevNsObj;
									};
									nsObjs[fn] = parent[shortName] = nsObj;
									parent = nsObj;
								};
								
								nsObjs[name] = nsObj;
								
								var namespaces = (mod.namespaces || []);
								forEachNamespace: for (var j = 0; j < namespaces.length; j++) {
									if (j in namespaces) {
										shortNames = namespaces[j].split('.');
										var fullName = '.' + name;
										for (var k = 0; k < shortNames.length; k++) {
											var shortName = shortNames[k];
											fullName += '.' + shortName;
											var fn = fullName.slice(1);
											if (!(fn in nsObjs)) {
												nsObjs[fn] = parent[shortName] = new types.Namespace(parent, shortName, fn);
											};
											parent = parent[shortName];
										};
										parent = nsObj;
									};
								};

								var opts = options[name];
								inits[name] = mod.create && mod.create(root, opts, _shared);
							};
						};

						var names = types.keys(inits),
							doodad = root.Doodad,
							namespaces = doodad.Namespaces,
							entries = namespaces.Entries,
							nsOptions = {secret: _shared.SECRET};

						forEachInit: for (var i = 0; i < names.length; i++) {
							var name = names[i];
							var spec = modules[name];
							var entryType = entries[spec.type || 'Module'];
							var entry = new entryType(root, spec, nsObjs[name]);
							var opts = options[name];
							entry.objectCreated = true;
							entry.objectInit = inits[name];
							entry.objectInit && entry.objectInit(opts)
							entry.init(opts);
							namespaces.add(name, entry, nsOptions);
							delete nsObjs[name];
						};
						
						var names = types.keys(nsObjs);
						forEachNamespace: for (var i = 0; i < names.length; i++) {
							var name = names[i];
							var namespace = nsObjs[name];
							var entry = new entries.Namespace(root, null, namespace);
							namespaces.add(name, entry, nsOptions);
						};
						
						var entry = new entries.Namespace(root, null, root);
						namespaces.add(spec.name, entry, nsOptions);
						
						forEachType: for (var i = 0; i < __Internal__.tempTypes.length; i++) {
							var type = __Internal__.tempTypes[i];
							types.REGISTER(type);
						};
						delete __Internal__.tempTypes;
						delete __Internal__.REGISTER;
					}),
					
					enableAsserts: __Internal__.DD_DOC(
						//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
								author: "Claude Petit",
								revision: 1,
								params: null,
								returns: 'undefined',
								description: "Enables 'DD_ASSERT'.",
						}
						//! END_REPLACE()
						, function enableAsserts() {
							if (types.hasDefinePropertyEnabled()) {
								__Internal__.DD_ASSERT = __ASSERT__;
							} else {
								var root = this;
								root.DD_ASSERT = __ASSERT__;
							};
						}),
					
					disableAsserts: __Internal__.DD_DOC(
						//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
								author: "Claude Petit",
								revision: 1,
								params: null,
								returns: 'undefined',
								description: "Disables 'DD_ASSERT'.",
						}
						//! END_REPLACE()
						, function disableAsserts() {
							if (types.hasDefinePropertyEnabled()) {
								__Internal__.DD_ASSERT = null;
							} else {
								var root = this;
								root.DD_ASSERT = null;
							};
						}),
						
					getOptions: function() {
						return __options__;
					},
				}
			))), [modules, _options]);
	};
	
	//! BEGIN_REMOVE()
	if ((typeof process !== 'object') || (typeof module !== 'object')) {
	//! END_REMOVE()
		//! IF_UNSET("serverSide")
			// <PRB> export/import are not yet supported in browsers
			global.createRoot = exports.createRoot;
		//! END_IF()
	//! BEGIN_REMOVE()
	};
	//! END_REMOVE()
}).call(
	//! BEGIN_REMOVE()
	(typeof window !== 'undefined') ? window : ((typeof global !== 'undefined') ? global : this)
	//! END_REMOVE()
	//! IF_SET("serverSide")
	//! 	INJECT("global")
	//! ELSE()
	//! 	INJECT("window")
	//! END_IF()
,
	// WARNING: It is for compatibility purpose only. It is NOT to be used with arbitrary expressions.
	// WARNING: Do not declare any variable and parameter inside these functions.

	// getEvals
	(function() {
//IE8	return ((typeof eval("(function(){})") === 'function') ?
		return (
		
			// Recent engines
			{
				eval: function(/*expr*/) {
					// <PRB> "{...}" and "function ..." need parentheses.
					return eval('(' + arguments[0] + ')');
				},
				evalStrict: function(/*expr*/) {
					"use strict";
					// <PRB> "{...}" and "function ..." need parentheses.
					return eval('(' + arguments[0] + ')');
					
				},
				evalWithCtx: function(ctx /*, expr*/) {
					// NOTE: "ctx" is to be used by the expression
					ctx = ctx || {}; // force variable to be preserved
					// <PRB> "{...}" and "function ..." need parentheses.
					return eval('(' + arguments[1] + ')');
				},
				evalWithCtxStrict: function(ctx /*, expr*/) {
					"use strict";
					// NOTE: "ctx" is to be used by the expression
					ctx = ctx || {}; // force variable to be preserved
					// <PRB> "{...}" and "function ..." need parentheses.
					return eval('(' + arguments[1] + ')');
				},
			}
//IE8			:
//IE8			// Old engines
//IE8			{
//IE8				eval: function(/*expr*/) {
//IE8					var result;
//IE8					// <PRB> "{...}" and "function ..." need parentheses.
//IE8					eval('result=(' + arguments[0] + ')');
//IE8					return result;
//IE8				},
//IE8				evalStrict: function(/*expr*/) {
//IE8					"use strict";
//IE8					var result;
//IE8					// <PRB> "{...}" and "function ..." need parentheses.
//IE8					eval('result=(' + arguments[0] + ')');
//IE8					return result;
//IE8				},
//IE8				evalWithCtx: function(ctx /*, expr*/) {
//IE8					// NOTE: "ctx" is to be used by the expression
//IE8					ctx = ctx || {}; // force variable to be preserved
//IE8					var result;
//IE8					// <PRB> "{...}" and "function ..." need parentheses.
//IE8					eval('result=(' + arguments[1] + ')');
//IE8					return result;
//IE8				},
//IE8				evalWithCtxStrict: function(ctx /*, expr*/) {
//IE8					"use strict";
//IE8					// NOTE: "ctx" is to be used by the expression
//IE8					ctx = ctx || {}; // force variable to be preserved
//IE8					var result;
//IE8					// <PRB> "{...}" and "function ..." need parentheses.
//IE8					eval('result=(' + arguments[1] + ')');
//IE8					return result;
//IE8				},
//IE8			}
			
		);
	})
	
);