//! REPLACE_BY("// Copyright 2015-2017 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Bootstrap.js - Bootstrap module
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

(function(getEvals) {
	const global = this;

	const exports = {};
	
	//! BEGIN_REMOVE()
	if ((typeof process === 'object') && (process !== null) && (typeof module === 'object') && (module !== null)) {
	//! END_REMOVE()
		//! IF_SET("serverSide")
			module.exports = exports;
		//! END_IF()
	//! BEGIN_REMOVE()
	};
	//! END_REMOVE()

	//! IF_SET('debug')
	// V8: Increment maximum number of stack frames
	// Source: https://code.google.com/p/v8-wiki/wiki/JavaScriptStackTraceApi
	if (Error.stackTraceLimit < 50) {
		Error.stackTraceLimit = 50;
	};
	//! END_IF()
	
	exports.createRoot = function createRoot(/*optional*/modules, /*optional*/_options, /*optional*/startup) {
		"use strict";
		
		const _shared = {
			// Secret value used to load modules, ...
			SECRET: null,

			// NOTE: Preload of immediatly needed natives.
			Natives: {
				// General
				stringReplaceCall: global.String.prototype.replace.call.bind(global.String.prototype.replace),
				numberToStringCall: global.Number.prototype.toString.call.bind(global.Number.prototype.toString),

				// "isNativeFunction"
				functionToStringCall: global.Function.prototype.toString.call.bind(global.Function.prototype.toString),
			},
		};

		
		const __Internal__ = {
			// Number.MAX_SAFE_INTEGER and MIN_SAFE_INTEGER polyfill
			SAFE_INTEGER_LEN: (global.Number.MAX_VALUE ? _shared.Natives.stringReplaceCall(_shared.Natives.numberToStringCall(global.Number.MAX_VALUE, 2), /[(]e[+]\d+[)]|[.]|[0]/g, '').length : 53),   // TODO: Find a mathematical way

			MIN_BITWISE_INTEGER: 0,
			MAX_BITWISE_INTEGER: ((~0) >>> 0), //   MAX_BITWISE_INTEGER | 0 === -1  ((-1 >>> 0) === 0xFFFFFFFF)
			
			DD_ASSERT: null,
		};

		__Internal__.BITWISE_INTEGER_LEN = global.Math.round(global.Math.log(__Internal__.MAX_BITWISE_INTEGER) / global.Math.LN2, 0);


		const types = {
			},
			
			tools = {
			};

			
		//===================================
		// Temporary DD_DOC
		//===================================
		__Internal__.tempDocs = [];

		__Internal__.DD_DOC = function DD_DOC(doc, value) {
			__Internal__.tempDocs.push([doc, value]);
			return value;
		};

		//===================================
		// Temporary ADD (for Doodad.Types)
		//===================================
		__Internal__.tempTypesAdded = [];

		__Internal__.ADD = function ADD(name, obj) {
			if (types.isType && types.isType(obj)) {
				obj = types.INIT(obj);
			};
			types[name] = obj;
			__Internal__.tempTypesAdded.push([name, obj]);
			return obj;
		};

		//===================================
		// Temporary ADD (for Doodad.Tools)
		//===================================
		__Internal__.tempToolsAdded = [];

		__Internal__.ADD_TOOL = function ADD_TOOL(name, obj) {
			tools[name] = obj;
			__Internal__.tempToolsAdded.push([name, obj]);
			return obj;
		};

		//===================================
		// ES6 Classes support
		//===================================

		__Internal__.hasClasses = false;
		__Internal__.classesNotCallable = true;
		
		(function() {
			try {
				// <PRB> Firefox returns 'undefined' on class definition !!!
				//const cls = global.eval("class A {}"); // Will throw an error if ES6 classes are not supported.
				const cls = global.eval("var a = class A {}; a"); // Will throw an error if ES6 classes are not supported.
				__Internal__.hasClasses = (_shared.Natives.functionToStringCall(cls).slice(0, 6) === 'class ');  // Check for Firefox's bug
				// FUTURE: Uncomment if classes can potentially be callable, for the moment, it's useless
				//if (__Internal__.hasClasses) {
				//	cls.call(_shared.Natives.objectCreate(cls.prototype)); // Will throw an error if ES6 classes are not callable.
				//	__Internal__.classesNotCallable = false;
				//};
			} catch(o) {
			};
		})();

		__Internal__.ADD('hasClasses', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
					author: "Claude Petit",
					revision: 0,
					params: null,
					returns: 'bool',
					description: "Returns 'true' if the Javascript engine has ES6 classes, 'false' otherwise.",
			}
			//! END_REPLACE()
			, function hasClasses() {
				return __Internal__.hasClasses;
			}));

		//===================================
		// Native functions
		//===================================
		// <PRB> "function.prototype.toString called on incompatible object" raised with some functions (EventTarget, Node, HTMLElement, ...) ! Don't know how to test for compatibility.
		try {
			if (typeof global.Event === 'function') {
				_shared.Natives.functionToStringCall(global.Event);
			};
		} catch(ex) {
			throw new global.Error("Browser version not supported.");
		};
		
		__Internal__.ADD('isFunction', __Internal__.DD_DOC(
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
			}));
		
		__Internal__.ADD('isJsClass', __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a Javascript class function, 'false' otherwise.",
			}
			//! END_REPLACE()
			, __Internal__.hasClasses ? function isJsClass(obj) {
				if (types.isFunction(obj)) {
					return (_shared.Natives.functionToStringCall(obj).slice(0, 6) === 'class ');
				};
				return false;
			} : function isJsClass(obj) {
				return false;
			}));
		
		__Internal__.ADD('isNativeFunction', __Internal__.DD_DOC(
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
					description: "Returns 'true' if object is a native function, 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isNativeFunction(obj) {
				if (types.isJsClass(obj)) {
					return true;
				} else if (types.isFunction(obj)) {
					const str = _shared.Natives.functionToStringCall(obj),
						index1 = str.indexOf('{') + 1,
						index2 = str.indexOf('[native code]', index1);
					if (index2 < 0) {
						return false;
					};
					for (let i = index1; i < index2; i++) {
						const chr = str[i];
						if ((chr !== '\n') && (chr !== '\r') && (chr !== '\t') && (chr !== ' ')) {
							return false;
						};
					};
					return true;
				} else {
					return false;
				};
			}));
		
		// FUTURE: "types.extend(_shared.Natives, {...})" when "Object.assign" will be accessible on every engine
		_shared.Natives = {
			// General
			windowFunction: global.Function,
			windowObject: global.Object,
			stringReplaceCall: global.String.prototype.replace.call.bind(global.String.prototype.replace),

			// "eval"
			windowEval: global.eval,

			// "hasInherited"
			objectPrototype: global.Object.prototype,
			
			// "has", "isCustomFunction", "isNativeFunction"
			// FUTURE: Remove when "Natives" will be "types.extend"ed
			objectHasOwnPropertyCall: global.Object.prototype.hasOwnProperty.call.bind(global.Object.prototype.hasOwnProperty),
			
			// "isCustomFunction", "isNativeFunction", getFunctionName"
			// FUTURE: Remove when "_shared.Natives" will be "types.extend"ed
			functionToStringCall: global.Function.prototype.toString.call.bind(global.Function.prototype.toString),
				
			// "extend"
			objectAssign: (types.isNativeFunction(global.Object.assign) ? global.Object.assign : undefined),
			
			// "createObject"
			objectCreate: global.Object.create,
			
			// "hasDefinePropertyEnabled" and "defineProperty"
			objectDefineProperty: global.Object.defineProperty,
			
			// "defineProperties"
			objectDefineProperties: global.Object.defineProperties,
			
			// "allKeys"
			objectGetOwnPropertyNames: global.Object.getOwnPropertyNames,
			
			// "getOwnPropertyDescriptor"
			objectGetOwnPropertyDescriptor: global.Object.getOwnPropertyDescriptor,
			
			// "getPrototypeOf"
			objectGetPrototypeOf: global.Object.getPrototypeOf,
			
			// "isPrototypeOf"
			objectIsPrototypeOfCall: global.Object.prototype.isPrototypeOf.call.bind(global.Object.prototype.isPrototypeOf),

			// "keys"
			objectKeys: global.Object.keys,
			
			// "isEnumerable", "symbols"
			objectPropertyIsEnumerableCall: global.Object.prototype.propertyIsEnumerable.call.bind(global.Object.prototype.propertyIsEnumerable),
			
			// "setPrototypeOf"
			objectSetPrototypeOf: global.Object.setPrototypeOf,
			
			// "isArray", "isObject", "isJsObject", "isCallable"
			objectToStringCall: global.Object.prototype.toString.call.bind(global.Object.prototype.toString),
			
			// "isArray"
			arrayIsArray: (types.isNativeFunction(global.Array.isArray) ? global.Array.isArray : undefined),
			arraySpliceCall: global.Array.prototype.splice.call.bind(global.Array.prototype.splice),

			arraySliceCall: global.Array.prototype.slice.call.bind(global.Array.prototype.slice),

			// "clone"
			windowArray: global.Array,
			
			// "createErrorType", "isError"
			windowError: (global.Error || Error), // NOTE: "node.js" v4 does not include "Error" in "global".

			windowTypeError: (global.TypeError || TypeError),
			
			// "isNumber", "toInteger"
			windowNumber: global.Number,
			
			// "isString"
			windowString: (types.isNativeFunction(global.String) ? global.String : undefined),
			
			// "hasSymbols", "isSymbol", "getSymbol"
			windowSymbol: (types.isNativeFunction(global.Symbol) ? global.Symbol : undefined),
			
			// "getSymbolFor"
			symbolFor: (types.isNativeFunction(global.Symbol) && types.isNativeFunction(global.Symbol.for) ? global.Symbol.for : undefined),
			
			// "getSymbolKey", "symbolIsGlobal"
			symbolToStringCall: (types.isNativeFunction(global.Symbol) && types.isNativeFunction(global.Symbol.prototype.toString) ? global.Symbol.prototype.toString.call.bind(global.Symbol.prototype.toString) : undefined),
			symbolValueOfCall: (types.isNativeFunction(global.Symbol) && types.isNativeFunction(global.Symbol.prototype.valueOf) ? global.Symbol.prototype.valueOf.call.bind(global.Symbol.prototype.valueOf) : undefined),
			symbolKeyFor: (types.isNativeFunction(global.Symbol) && types.isNativeFunction(global.Symbol.keyFor) ? global.Symbol.keyFor : undefined),
			
			// "createType", "_instanceof"
			symbolHasInstance: (types.isNativeFunction(global.Symbol) && (typeof global.Symbol.hasInstance === 'symbol') ? global.Symbol.hasInstance : undefined),

			// "is*"
			symbolToStringTag: (types.isNativeFunction(global.Symbol) && (typeof global.Symbol.toStringTag === 'symbol') ? global.Symbol.toStringTag : undefined),
			numberValueOfCall: global.Number.prototype.valueOf.call.bind(global.Number.prototype.valueOf),
			booleanValueOfCall: global.Boolean.prototype.valueOf.call.bind(global.Boolean.prototype.valueOf),
			stringValueOfCall: global.String.prototype.valueOf.call.bind(global.String.prototype.valueOf),
			dateValueOfCall: global.Date.prototype.valueOf.call.bind(global.Date.prototype.valueOf),

			// "isNaN"
			numberIsNaN: (types.isNativeFunction(global.Number.isNaN) ? global.Number.isNaN : undefined),

			// "isFinite"
			numberIsFinite: (types.isNativeFunction(global.Number.isFinite) ? global.Number.isFinite : undefined),
			
			// "concat"
			arrayConcatApply: (types.isNativeFunction(global.Array.prototype.concat) ? global.Array.prototype.concat.apply.bind(global.Array.prototype.concat) : undefined),

			// "append"
			arrayPushCall: global.Array.prototype.push.call.bind(global.Array.prototype.push),
			arrayPushApply: global.Array.prototype.push.apply.bind(global.Array.prototype.push),
			
			// "isInteger"
			numberIsInteger: (types.isNativeFunction(global.Number.isInteger) ? global.Number.isInteger : undefined),

			// "trim"
			stringTrimCall: global.String.prototype.trim.call.bind(global.String.prototype.trim),

			// "depthExtend"
			functionBindCall: global.Function.prototype.bind.call.bind(global.Function.prototype.bind),
			
			// "isSafeInteger"
			numberIsSafeInteger: (types.isNativeFunction(global.Number.isSafeInteger) ? global.Number.isSafeInteger : undefined),

			// "isSafeInteger", "toInteger", "toFloat"
			mathFloor: global.Math.floor,
			mathAbs: global.Math.abs,
			mathPow: global.Math.pow,
			
			// "sealObject"
			objectSeal: global.Object.seal,
			
			// "isFrozen"
			objectIsFrozen: global.Object.isFrozen,
			
			// "freezeObject"
			objectFreeze: global.Object.freeze,
			
			// "isExtensible"
			objectIsExtensible: global.Object.isExtensible,

			// "preventExtensions"
			objectPreventExtensions: global.Object.preventExtensions,
			
			// "allSymbols", "symbols"
			objectGetOwnPropertySymbols: (types.isNativeFunction(global.Object.getOwnPropertySymbols) ? global.Object.getOwnPropertySymbols : undefined),
			
			// "isSafeInteger", "getSafeIntegerBounds"
			numberMaxSafeInteger: global.Number.MAX_SAFE_INTEGER || global.Math.pow(2, __Internal__.SAFE_INTEGER_LEN) - 1,
			numberMinSafeInteger: global.Number.MIN_SAFE_INTEGER || -global.Math.pow(2, __Internal__.SAFE_INTEGER_LEN) + 1,
			
			// generateUUID
			mathRandom: global.Math.random,

			// AssertionError
			//consoleAssert: (types.isNativeFunction(global.console.assert) ? global.console.assert.bind(global.console) : undefined),
		};

		// "_instanceof"
		_shared.Natives.functionHasInstance = (_shared.Natives.symbolHasInstance ? global.Function.prototype[_shared.Natives.symbolHasInstance] : undefined);

		//===================================
		// Eval
		//===================================
		
		// WARNING: NOT to be used with arbitrary expressions.

		__Internal__.evals = getEvals(_shared.Natives.windowEval);
		getEvals = null; // free memory
		
		__Internal__.ADD('eval', __Internal__.DD_DOC(
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
			}));

		__Internal__.ADD('evalStrict', __Internal__.DD_DOC(
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
			}));

		//==================================
		// is*
		//==================================
		
		__Internal__.ADD('isCustomFunction', __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a custom function (non-native), 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isCustomFunction(obj) {
				if (types.isJsClass(obj)) {
					return false;
				} else if (types.isFunction(obj)) {
					const str = _shared.Natives.functionToStringCall(obj),
						index1 = str.indexOf('{') + 1,
						index2 = str.indexOf('[native code]', index1);
					if (index2 < 0) {
						return true;
					};
					for (let i = index1; i < index2; i++) {
						const chr = str[i];
						if ((chr !== '\n') && (chr !== '\r') && (chr !== '\t') && (chr !== ' ')) {
							return true;
						};
					};
				};
				return false;
			}));
		
		__Internal__.ADD('isNothing', __Internal__.DD_DOC(
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
			}));
		
		//==================================
		// String Tools
		//==================================
		
		__Internal__.ADD_TOOL('trim', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
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
				const isArray = types.isArray(str);

				if (types.isNothing(chr)) {
					chr = ' ';
				};
				if (types.isNothing(count)) {
					count = Infinity;
				};
				
				if (isArray) {
 					const strLen = str.length;
					
					let start = 0,
						x = 0;
					if (!direction || direction > 0) {
						for (; start < strLen; start++, x++) {
							if ((x >= count) || (str[start] !== chr)) {
								break;
							};
						};
					};

					let end = strLen - 1;
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
						return [];
					};
				} else if ((chr === ' ') && !direction && (count === Infinity)) {
					return _shared.Natives.stringTrimCall(str);
				} else {
					let i = 0,
						x = 0;
					let chrLen = chr.length;
					if (chrLen <= 0) {
						chrLen = 1;
					};
					if (!direction || (direction > 0)) {
						while ((x < count) && (i < str.length) && (str.slice(i, i + chrLen) === chr)) {
							i += chrLen;
							x++;
						};
					};
					let j = str.length - chrLen;
					x = 0;
					if (!direction || (direction < 0)) {
						while ((x < count) && (j > i) && (j >= 0) && (str.slice(j, j + chrLen) === chr)) {
							j -= chrLen;
							x++;
						};
					};
					return str.slice(i, j + chrLen);
				};
			}));

		//==================================
		// Conversion
		//==================================
		
		__Internal__.ADD('toBoolean', __Internal__.DD_DOC(
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
			}));

		__Internal__.ADD('toInteger', __Internal__.DD_DOC(
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
				const number = _shared.Natives.windowNumber(obj);
				if (types.isNaN(number)) {
					return 0;
				};
				if ((number === 0) || !types.isFinite(number)) {
					return number;
				};
				return (number > 0 ? 1 : -1) * _shared.Natives.mathFloor(_shared.Natives.mathAbs(number));
			}));
		
		__Internal__.ADD('toFloat', __Internal__.DD_DOC(
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
				let number = _shared.Natives.windowNumber(obj);
				if (types.isNaN(number)) {
					return 0.0;
				} else {
					if (!types.isNothing(precision)) {
						precision = _shared.Natives.mathPow(10, precision);
						number = _shared.Natives.mathFloor(number * precision) / precision;
					};
					return number;
				};
			}));
		
		__Internal__.ADD('toString', __Internal__.DD_DOC(
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
			}));

		//===================================
		// Format functions
		//===================================
		
		__Internal__.ADD_TOOL('format', __Internal__.DD_DOC(
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
				let result = '',
					pos,
					lastPos = 0,
					isKey = false;
				while ((pos = message.indexOf('~', lastPos)) >= 0) {
					const key = message.slice(lastPos, pos);
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
			}));
		
		//===================================
		// ASSERTS functions
		//===================================
			
		__Internal__.ASSERT = __Internal__.DD_DOC(
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
						description: "Throws 'AssertionError' when expression resolves to 'false'. Does nothing otherwise.",
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
					throw new types.AssertionError(message);
				};
			});
		
		//==================
		// Utilities
		//==================
		
		// <PRB> JS has no function to test for primitives
		__Internal__.ADD('isPrimitive', __Internal__.DD_DOC(
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
				const type = (typeof obj);
				return (type !== "object") && (type !== "function");
			}));
		
		__Internal__.ADD('isNumber', __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a number (integer or float). Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isNumber(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				if (typeof obj === 'object') {
					if (_shared.Natives.symbolToStringTag && (obj[_shared.Natives.symbolToStringTag] === 'Number')) {
						try {
							obj = _shared.Natives.numberValueOfCall(obj);
						} catch(o) {
							return false;
						};
					} else if (_shared.Natives.objectToStringCall(obj) !== '[object Number]') {
						return false;
					} else {
						obj = _shared.Natives.numberValueOfCall(obj);
					};
				};
				if (typeof obj !== 'number') {
					return false;
				};
				return (obj === obj); // Not NaN
			}));
		
		__Internal__.ADD('isInteger', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 6,
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
				if (types.isNothing(obj)) {
					return false;
				};
				if (typeof obj === 'object') {
					if (_shared.Natives.symbolToStringTag && (obj[_shared.Natives.symbolToStringTag] === 'Number')) {
						try {
							obj = _shared.Natives.numberValueOfCall(obj);
						} catch(o) {
							return false;
						};
					} else if (_shared.Natives.objectToStringCall(obj) !== '[object Number]') {
						return false;
					} else {
						obj = _shared.Natives.numberValueOfCall(obj);
					};
				};
				if (typeof obj !== 'number') {
					return false;
				};
				if (obj !== obj) {
					// NaN
					return false;
				};
				if (_shared.Natives.numberIsInteger) {
					// <PRB> "Number.isInteger(Object(1)) === false", but "Object(1) instanceof Number === true" !!!
					return _shared.Natives.numberIsInteger(obj);
				} else {
					if (!types.isFinite(obj)) {
						return false;
					};
					return (obj === _shared.Natives.mathFloor(obj));
				};
			}));
		
		__Internal__.ADD('isSafeInteger', __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is an integer that correctly fits into 'Number'. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isSafeInteger(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				if (typeof obj === 'object') {
					if (_shared.Natives.symbolToStringTag && (obj[_shared.Natives.symbolToStringTag] === 'Number')) {
						try {
							obj = _shared.Natives.numberValueOfCall(obj);
						} catch(o) {
							return false;
						};
					} else if (_shared.Natives.objectToStringCall(obj) !== '[object Number]') {
						return false;
					} else {
						obj = _shared.Natives.numberValueOfCall(obj);
					};
				};
				if (typeof obj !== 'number') {
					return false;
				};
				if (obj !== obj) {
					// NaN
					return false;
				};
				if (_shared.Natives.numberIsSafeInteger) {
					// <PRB> "Number.isSafeInteger(Object(1)) === false", but "Object(1) instanceof Number === true" !!!
					return _shared.Natives.numberIsSafeInteger(obj);
				} else {
					return (obj >= _shared.Natives.numberMinSafeInteger) && (obj <= _shared.Natives.numberMaxSafeInteger);
				};
			}));
		
		__Internal__.ADD('getSafeIntegerBounds', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
						params: null,
						returns: 'object',
						description: "Returns 'len' (in bits), 'min' and 'max' values of a safe integer.",
			}
			//! END_REPLACE()
			, function getSafeIntegerBounds() {
				if (!__Internal__.safeIntegerLen) {
					__Internal__.safeIntegerLen = types.freezeObject(types.nullObject({
						len: __Internal__.SAFE_INTEGER_LEN, 
						min: _shared.Natives.numberMinSafeInteger, 
						max: _shared.Natives.numberMaxSafeInteger,
					}));
				};
				return __Internal__.safeIntegerLen;
			}));
		
		__Internal__.ADD('getBitwiseIntegerBounds', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
						params: null,
						returns: 'object',
						description: "Returns 'len' (in bits), 'min' and 'max' values of a bitwise integer.",
			}
			//! END_REPLACE()
			, function getBitwiseIntegerBounds() {
				if (!__Internal__.bitwiseIntegerLen) {
					__Internal__.bitwiseIntegerLen = types.freezeObject(types.nullObject({
						len: __Internal__.BITWISE_INTEGER_LEN, 
						min: __Internal__.MIN_BITWISE_INTEGER, 
						max: __Internal__.MAX_BITWISE_INTEGER,
					}));
				};
				return __Internal__.bitwiseIntegerLen;
			}));
		
		__Internal__.ADD('isFinite', __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a finite number. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isFinite(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				if (typeof obj === 'object') {
					if (_shared.Natives.symbolToStringTag && (obj[_shared.Natives.symbolToStringTag] === 'Number')) {
						try {
							obj = _shared.Natives.numberValueOfCall(obj);
						} catch(o) {
							return false;
						};
					} else if (_shared.Natives.objectToStringCall(obj) !== '[object Number]') {
						return false;
					} else {
						obj = _shared.Natives.numberValueOfCall(obj);
					};
				};
				if (typeof obj !== 'number') {
					return false;
				};
				if (obj !== obj) {
					// NaN
					return false;
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
			}));
		
		__Internal__.ADD('isInfinite', __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is an infinite number. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isInfinite(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				if (typeof obj === 'object') {
					if (_shared.Natives.symbolToStringTag && (obj[_shared.Natives.symbolToStringTag] === 'Number')) {
						try {
							obj = _shared.Natives.numberValueOfCall(obj);
						} catch(o) {
							return false;
						};
					} else if (_shared.Natives.objectToStringCall(obj) !== '[object Number]') {
						return false;
					} else {
						obj = _shared.Natives.numberValueOfCall(obj);
					};
				};
				return (obj === Infinity) || (obj === -Infinity);
			}));
		
		__Internal__.ADD('isFloat', __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a float. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isFloat(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				if (typeof obj === 'object') {
					if (_shared.Natives.symbolToStringTag && (obj[_shared.Natives.symbolToStringTag] === 'Number')) {
						try {
							obj = _shared.Natives.numberValueOfCall(obj);
						} catch(o) {
							return false;
						};
					} else if (_shared.Natives.objectToStringCall(obj) !== '[object Number]') {
						return false;
					} else {
						obj = _shared.Natives.numberValueOfCall(obj);
					};
				};
				if (typeof obj !== 'number') {
					return false;
				};
				if (obj !== obj) {
					// NaN
					return false;
				};
				if (!types.isFinite(obj)) {
					return false;
				};
				return (obj !== (obj | 0));
			})),
		
		// <PRB> JS has no function to test for booleans
		__Internal__.ADD('isBoolean', __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a boolean. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isBoolean(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				if (typeof obj === 'object') {
					if (_shared.Natives.symbolToStringTag && (obj[_shared.Natives.symbolToStringTag] === 'Boolean')) {
						try {
							obj = _shared.Natives.booleanValueOfCall(obj);
						} catch(o) {
							return false;
						};
					} else if (_shared.Natives.objectToStringCall(obj) !== '[object Boolean]') {
						return false;
					} else {
						obj = _shared.Natives.booleanValueOfCall(obj);
					};
				};
				return (typeof obj === 'boolean');
			}));
		
		// <PRB> JS has no function to test for strings
		__Internal__.ADD('isString', __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a string. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isString(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				if (typeof obj === 'object') {
					if (_shared.Natives.symbolToStringTag && (obj[_shared.Natives.symbolToStringTag] === 'String')) {
						try {
							obj = _shared.Natives.stringValueOfCall(obj);
						} catch(o) {
							return false;
						};
					} else if (_shared.Natives.objectToStringCall(obj) !== '[object String]') {
						return false;
					} else {
						obj = _shared.Natives.stringValueOfCall(obj);
					};
				};
				return (typeof obj === 'string');
			}));
		
		// <PRB> JS has no function to test for dates
		__Internal__.ADD('isDate', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 4,
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
			, function isDate(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				if (typeof obj !== 'object') {
					return false;
				};
				if (_shared.Natives.symbolToStringTag && (obj[_shared.Natives.symbolToStringTag] === 'Date')) {
					try {
						_shared.Natives.dateValueOfCall(obj);
						return true;
					} catch(o) {
						return false;
					};
				} else {
					return (_shared.Natives.objectToStringCall(obj) === '[object Date]');
				};
			}));
		
		__Internal__.ADD('isArray', (_shared.Natives.arrayIsArray || __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 4,
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
			, function isArray(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				if (typeof obj !== 'object') {
					return false;
				};
				if (_shared.Natives.symbolToStringTag && (obj[_shared.Natives.symbolToStringTag] === 'Array')) {
					try {
						_shared.Natives.arraySpliceCall(obj, 0, 0);
					} catch(o) {
						return false;
					};
				};
				return (_shared.Natives.objectToStringCall(obj) === '[object Array]');
			})));

		__Internal__.ADD('isArrayLike', __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is an array-like object. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isArrayLike(obj) {
				// Unbelievable : There is not an official way to detect an array-like object !!!!
				if (types.isNothing(obj)) {
					return false;
				};
				if (typeof obj === 'object') {
					const len = obj.length;
					return (typeof len === 'number') && ((len >>> 0) === len);
				} else if (types.isString(obj)) {
					return true;
				} else {
					return false;
				};
			}));
		
		// <PRB> JS has no function to test for errors
		__Internal__.ADD('isError', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 4,
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
				if (typeof obj !== 'object') {
					return false;
				};
				//if (_shared.Natives.symbolToStringTag && (obj[_shared.Natives.symbolToStringTag] === 'Error')) {
				//	????
				//};
				// <PRB> Object.prototype.toString ignores custom errors inherited from Error.
				return (_shared.Natives.objectToStringCall(obj) === '[object Error]') || types.isErrorType(obj.constructor);
			}));
		
		__Internal__.ADD('isNaN', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 4,
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
				if (types.isNothing(obj)) {
					return false;
				};
				if (typeof obj === 'object') {
					if (_shared.Natives.symbolToStringTag && (obj[_shared.Natives.symbolToStringTag] === 'Number')) {
						try {
							obj = _shared.Natives.numberValueOfCall(obj);
						} catch(o) {
							return false;
						};
					} else if (_shared.Natives.objectToStringCall(obj) !== '[object Number]') {
						return false;
					} else {
						obj = _shared.Natives.numberValueOfCall(obj);
					};
				};
				if (typeof obj !== 'number') {
					return false;
				};
				if (_shared.Natives.numberIsNaN) {
					return _shared.Natives.numberIsNaN(obj);
				} else {
					// Explanation: NaN is the only object not equal to itself.
					return (obj !== obj); // NaN
				};
			}));
		
		__Internal__.ADD('isCallable', __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is callable. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isCallable(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				if (typeof obj === 'function') {
					return true;
				};
				if (typeof obj !== 'object') {
					return false;
				};
				if (_shared.Natives.symbolToStringTag && (obj[_shared.Natives.symbolToStringTag] === 'Function')) {
					try {
						_shared.Natives.functionToStringCall(obj);
					} catch(o) {
						return false;
					};
				} else {
					return (_shared.Natives.objectToStringCall(obj) === '[object Function]');
				};
			}));
			
		
		//===================================
		// Stack functions
		//===================================
		// <PRB> JS has no official stack trace. They are non-standardized strings.
		
		__Internal__.stackToString = function stackToString() {
			let str = '';
			const len = this.length;
			for (let i = 0; i < len; i++) {
				const trace = this[i];
				str += (i + ': function "' + (trace.functionName || '<unknown>') + '" in file "' + (trace.path || '<unknown>') + '" at line ' + (trace.lineNumber < 0 ? '<unknown>' : trace.lineNumber) + ', column ' + (trace.columnNumber < 0 ? '<unknown>' : trace.columnNumber) + '\n');
			};
			return str;
		};

		// NOTE: It removes native functions from the stack
		// <FUTURE> thread level
		__Internal__.parseStackRegEx = /( at )?([^\[(@ ]+)?( [\[]as [^\]]+[\]])? ?[(@]?(([a-zA-Z]+[:][\/][\/][\/]?[^\/]+[\/][^: ]+)|(([A-Z][:]|[\\])[\\][^:]+)|([\/][^:]+)|eval code)( line ([0-9]+) [>] eval)?(([:])([0-9]+)([:])([0-9]+))?/gm;

		__Internal__.ADD_TOOL('parseStack', __Internal__.DD_DOC(
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
				
				let stack = ex;
				if (types.isError(ex)) {
					stack = ex.stack || null;
				};
				
				if (!stack) {
					return null;
				};
				
				// NOTE: Internet Explorer 11 doesn't return more than 10 call levels.
				
				__Internal__.parseStackRegEx.lastIndex = 0;
				let call = __Internal__.parseStackRegEx.exec(stack);
				
				if (!call) {
					return null;
				};
				
				const calls = [];
				
				do {
					let rawFunctionName,
						functionName, 
						pos;
				
					functionName = call[2] || '';
					pos = functionName.indexOf(' at '); // Not Firefox beginning of function name
					if (pos >= 0) {
						functionName = functionName.slice(pos + 4);
					};
					rawFunctionName = functionName + (call[3] || '');
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
					let path = call[5],
						url,
						isSystemPath = false;
					if (!path) {
						// File system path
						path = call[6];
						if (!path) {
							path = call[8];
						};
						if (path) {
							isSystemPath = true;
						};
					};
					calls.push({
						rawFunctionName: rawFunctionName,
						functionName: ((functionName === "eval code") ? '' : functionName),
						path: (path || ''),
						lineNumber: types.toInteger(call[10] || call[13] || -1), // Starts at 1. Number -1 is for "unknown".
						columnNumber: types.toInteger(call[15] || -1), // Starts at 1. Number -1 is for "unknown".
						isSystemPath: isSystemPath,
					});
					
					call = __Internal__.parseStackRegEx.exec(stack);
				} while (call);
				
				calls.toString = __Internal__.stackToString;
				
				return calls;
			}));

		// <PRB> Internet Explorer doesn't fill the stack on Error creation.
		(function() {
			// 'stack' is a property under Firefox.
			const desc = _shared.Natives.objectGetOwnPropertyDescriptor(_shared.Natives.windowError.prototype, 'stack');
			__Internal__.ieStack = !desc || !_shared.Natives.objectHasOwnPropertyCall(desc, 'get');
			if (__Internal__.ieStack) {
				const ex = new _shared.Natives.windowError("");
				__Internal__.ieStack = !_shared.Natives.objectHasOwnPropertyCall(ex, 'stack');
			};
		})();

		__Internal__.ADD_TOOL('getStackTrace', __Internal__.DD_DOC(
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
				let ex = new _shared.Natives.windowError("");
				if (__Internal__.ieStack) {
					try {
						throw ex;
					} catch(o) {
						ex = o;
					};
				};
				const stack = tools.parseStack(ex.stack);
				if (stack) {
					stack.splice(0, 1);  // remove "getStackTrace" call entry
				};
				return stack;
			}));
		
		//===================================
		// Objects
		//===================================
		
		__Internal__.ADD('hasInherited', __Internal__.DD_DOC(
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
						if (obj === _shared.Natives.objectPrototype) {
							break;
						};
						if (types.has(obj, keys)) {
							return true;
						};
						obj = types.getPrototypeOf(obj);
					} while (obj);
				};
				
				return false;
			}));
		
		__Internal__.ADD('has', __Internal__.DD_DOC(
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
						return _shared.Natives.objectHasOwnPropertyCall(obj, keys);
					};
					const len = keys.length;
					if (!len) {
						return false;
					};
					for (let i = 0; i < len; i++) {
						if (_shared.Natives.objectHasOwnPropertyCall(keys, i)) {
							const key = keys[i];
							if (_shared.Natives.objectHasOwnPropertyCall(obj, key)) {
								return true;
							};
						};
					};
				};
				return false;
			}));
		
		__Internal__.ADD('get', __Internal__.DD_DOC(
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
				const hasKey = (inherited ? types.hasInherited : types.has);
				if (hasKey(obj, key)) {
					return obj[key];
				} else {
					return _default;
				};
			}));
		
		__Internal__.ADD('getDefault', __Internal__.DD_DOC(
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
				const hasKey = (inherited ? types.hasInherited : types.has);
				if (hasKey(obj, key)) {
					return obj[key];
				} else {
					const descriptor = types.getPropertyDescriptor(obj, key);
					if (descriptor && !types.get(descriptor, 'writable') && !types.get(descriptor, 'get') && !types.get(descriptor, 'set') && types.get(descriptor, 'configurable')) {
						descriptor.value = _default;
						types.defineProperty(obj, key, descriptor);
					} else {
						obj[key] = _default;
					};
					return _default;
				};
			}));
		
		
		__Internal__.ADD('isEnumerable', __Internal__.DD_DOC(
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
			, function isEnumerable(obj, key) {
				return _shared.Natives.objectPropertyIsEnumerableCall(obj, key);
			}));
		
		__Internal__.isArrayIndex = /^(0|[1-9][0-9]*)$/;

		__Internal__.ADD('keys', __Internal__.DD_DOC(
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
						description: "Returns an array of enumerable owned property names of an object. For array-like objects, index properties are excluded.",
			}
			//! END_REPLACE()
			, function keys(obj) {
				// Returns enumerable own properties (those not inherited).
				// Doesn't not include array items.
				if (types.isNothing(obj)) {
					return [];
				};
				
				obj = _shared.Natives.windowObject(obj);

				let result;
				
				if (types.isArrayLike(obj)) {
					result = [];
					for (let key in obj) {
						if (types.has(obj, key) && !__Internal__.isArrayIndex.test(key)) {
							result.push(key);
						};
					};
				} else {
					 result = _shared.Natives.objectKeys(obj);
				};
				
				return result;
			}));
		
		__Internal__.ADD('allKeys', _shared.Natives.objectGetOwnPropertyNames);

		__Internal__.ADD('allKeysInherited', __Internal__.DD_DOC(
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
			}));
		
		__Internal__.ADD('symbols', __Internal__.DD_DOC(
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
				const all = types.allSymbols(obj);
				const symbols = [];
				for (let i = 0; i < all.length; i++) {
					const symbol = all[i];
					if (types.isEnumerable(obj, symbol)) {
						symbols.push(symbol);
					};
				};
				return symbols;
			}));
		
		__Internal__.ADD('allSymbols', __Internal__.DD_DOC(
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
			})));

		__Internal__.ADD('allSymbolsInherited', __Internal__.DD_DOC(
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
			}));
		
		__Internal__.ADD('extend', (_shared.Natives.objectAssign || __Internal__.DD_DOC(
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
				let result;
				if (!types.isNothing(obj)) {
					result = _shared.Natives.windowObject(obj);
					const len = arguments.length;
					for (let i = 1; i < len; i++) {
						obj = arguments[i];
						if (types.isNothing(obj)) {
							continue;
						};
						// Part of "Object.assign" Polyfill from Mozilla Developer Network.
						obj = _shared.Natives.windowObject(obj);
						const keys = types.append(types.keys(obj), types.symbols(obj));
						for (let j = 0; j < keys.length; j++) {
							const key = keys[j];
							result[key] = obj[key];
						};
					};
				};
				return result;
			})));
			
		__Internal__.hasGetOwnPropertyRestrictionOnCaller = false;
		(function() {
			// Edge
			const ctx = {
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

		__Internal__.ADD('defineProperty', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 5,
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
			, function defineProperty(obj, name, descriptor) {
				// <PRB> "Object.defineProperty" stupidly takes inherited properties instead of just own properties. So we fix that because of "Object.prototype".
				descriptor = types.extend(types.createObject(null), descriptor);
				types.getDefault(descriptor, 'configurable', false);
				types.getDefault(descriptor, 'enumerable', false);
				if (!types.get(descriptor, 'get') && !types.get(descriptor, 'set')) {
					types.getDefault(descriptor, 'writable', false);
				};
				return _shared.Natives.objectDefineProperty(obj, name, descriptor);
			}));

		__Internal__.ADD('defineProperties', _shared.Natives.objectDefineProperties);

		if (!__Internal__.hasGetOwnPropertyRestrictionOnCaller) {
			__Internal__.ADD('getOwnPropertyDescriptor', _shared.Natives.objectGetOwnPropertyDescriptor);
		} else {
			__Internal__.ADD('getOwnPropertyDescriptor', __Internal__.DD_DOC(
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
									type: 'string',
									optional: false,
									description: "Property name.",
								},
							},
							returns: 'object',
							description: "Returns the descriptor of an own property of an object.",
				}
				//! END_REPLACE()
				, function getOwnPropertyDescriptor(obj, key) {
					let desc;
					if (key === 'caller') {
						desc = {
							configurable: false,
							enumerable: false,
							value: null,
							writable: false,
						};
					} else {
						desc = _shared.Natives.objectGetOwnPropertyDescriptor(obj, key);
					};
					return desc;
				}));
		};
		
		__Internal__.ADD('getPropertyDescriptor', __Internal__.DD_DOC(
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
				let proto = obj,
					descriptor = undefined;
				if (key in obj) {
					do {
						descriptor = types.getOwnPropertyDescriptor(proto, key);
					} while (!descriptor && (proto = types.getPrototypeOf(proto)));
				};
				return descriptor;
			}));
		
		__Internal__.ADD('createObject', _shared.Natives.objectCreate);

		__Internal__.ADD('newInstance', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 3,
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
						description: "Instantiates an object from the specified constructor with provided arguments.",
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
				let obj;
				if (args && args.length) {
					if (__Internal__.classesNotCallable && types.isJsClass(type)) {
						obj = types.eval("new ctx.type(...ctx.args)", {type: type, args: args});
					} else {
						obj = types.createObject(type.prototype, {
							constructor: {
								value: type,
							},
						});
						obj.constructor.apply(obj, args);
					};
				} else {
					obj = new type();
				};
				return obj;
			}));
		
		__Internal__.ADD('getPrototypeOf', _shared.Natives.objectGetPrototypeOf)
		
		__Internal__.ADD('setPrototypeOf', __Internal__.DD_DOC(
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
				const enabled = (forceNative || types.isFunction(obj));
				if (enabled) {
					return _shared.Natives.objectSetPrototypeOf(obj, proto);
				} else {
					if ((obj === undefined) || (obj === null)) {
						return obj;
					};

					let tmp;
					if (types.isFunction(obj)) {
						throw new global.Error("Browser not supported.");
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
					
					return tmp;
				};
			}));

		__Internal__.ADD('isPrototypeOf', function isPrototypeOf(protoObj, obj) {
				// NOTE: Why does this function is part of Object prototype ?
				return _shared.Natives.objectIsPrototypeOfCall(protoObj, obj);
			});

		__Internal__.ADD('nullObject', __Internal__.DD_DOC(
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
			}));

		__Internal__.ADD('getIn', __Internal__.DD_DOC(
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
			}));
		
		__Internal__.ADD('hasIn', __Internal__.DD_DOC(
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
					const len = keys.length;
					if (!len) {
						return false;
					};
					for (let i = 0; i < len; i++) {
						if (types.has(keys, i)) {
							const key = keys[i];
							if (key in obj) {
								return true;
							};
						};
					};
				};
				return false;
			}));
		
		__Internal__.ADD('extendProperties', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
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
				let result;
				if (!types.isNothing(obj)) {
					result = _shared.Natives.windowObject(obj);
					const len = arguments.length;
					for (let i = 1; i < len; i++) {
						obj = arguments[i];
						if (types.isNothing(obj)) {
							continue;
						};
						// Part of "Object.assign" Polyfill from Mozilla Developer Network.
						obj = _shared.Natives.windowObject(obj);
						const keys = types.append(types.keys(obj), types.symbols(obj));
						for (let j = 0; j < keys.length; j++) {
							const key = keys[j];
							const descriptor = types.getOwnPropertyDescriptor(obj, key);
							types.defineProperty(result, key, descriptor);
						};
					};
				};
				return result;
			}));
			
		__Internal__.ADD('depthExtend', __Internal__.DD_DOC(
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
				let result;
				if (!types.isNothing(obj)) {
					let extender;
					if (types.isFunction(depth)) {
						extender = depth;
						depth = Infinity;
					} else {
						depth = (+depth || 0) - 1;  // null|undefined|true|false|NaN|Infinity
						extender = function(result, val, key, extend) {
							if ((extender.depth >= 0) && types.isObject(val)) {
								const resultVal = result[key];
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
							} else {
								result[key] = val;
							};
						};
						extender.depth = depth;
					};
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
								extender(result, obj[key], key, _shared.Natives.functionBindCall(types.depthExtend, types, extender));
							};
						};
					};
				};
				return result;
			}));
				
		__Internal__.ADD('complete', __Internal__.DD_DOC(
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
				let result;
				if (!types.isNothing(obj)) {
					result = _shared.Natives.windowObject(obj);
					const len = arguments.length;
					for (let i = 1; i < len; i++) {
						obj = arguments[i];
						if (types.isNothing(obj)) {
							continue;
						};
						// Part of "Object.assign" Polyfill from Mozilla Developer Network.
						obj = _shared.Natives.windowObject(obj);
						const keys = types.append(types.keys(obj), types.symbols(obj));
						for (let j = 0; j < keys.length; j++) {
							const key = keys[j];
							if (!types.has(result, key)) {
								result[key] = obj[key];
							};
						};
					};
				};
				
				return result;
			}));
		
		__Internal__.ADD('completeProperties', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
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
				let result;

				if (!types.isNothing(obj)) {
					result = _shared.Natives.windowObject(obj);
					const len = arguments.length;
					for (let i = 1; i < len; i++) {
						obj = arguments[i];
						if (types.isNothing(obj)) {
							continue;
						};
						// Part of "Object.assign" Polyfill from Mozilla Developer Network.
						obj = _shared.Natives.windowObject(obj);
						const keys = types.append(types.keys(obj), types.symbols(obj));
						for (let j = 0; j < keys.length; j++) {
							const key = keys[j];
							if (!types.has(result, key)) {
								const descriptor = types.getOwnPropertyDescriptor(obj, key);
								types.defineProperty(result, key, descriptor);
							};
						};
					};
				};
				
				return result;
			}));
		
		__Internal__.emptyArray = []; // Avoids to create a new array each time we call 'types.concat'.
		__Internal__.ADD('concat', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							paramarray: {
								type: 'arrayof(any)',
								optional: false,
								description: "Values or arrays to concatenate.",
							},
						},
						returns: 'array',
						description: "Concatenates the arrays (non-arrays are pushed) to a new array then returns that array.",
			}
			//! END_REPLACE()
			, (_shared.Natives.arrayConcatApply ? 
				function concat(/*paramarray*/) {
					return _shared.Natives.arrayConcatApply(__Internal__.emptyArray, arguments);
				}
			: 
				function concat(/*paramarray*/) {
					const result = [];
				
					const len = arguments.length;
					for (let i = 0; i < len; i++) {
						const obj = arguments[i];
						if (types.isArray(obj)) {
							_shared.Natives.arrayPushApply(result, obj);
						} else {
							_shared.Natives.arrayPushCall(result, obj);
						};
					};
				
					return result;
				}
			)));
			
		__Internal__.ADD('append', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 2,
						params: {
							obj: {
								type: 'arraylike',
								optional: false,
								description: "Target array.",
							},
							paramarray: {
								type: 'arrayof(arraylike)',
								optional: true,
								description: "Arrays to append.",
							},
						},
						returns: 'array',
						description: "Appends the items of each array to the first argument then returns that array. Skips undefined or null values. Better than 'concat' because it accepts array-likes. But for large array, it's probably better to use 'concat'.",
			}
			//! END_REPLACE()
			, function append(obj /*paramarray*/) {
				if (!types.isArrayLike(obj)) {
					return null;
				};
				const len = arguments.length;
				for (let i = 1; i < len; i++) {
					const arg = arguments[i];
					if (!types.isNothing(arg)) {
						_shared.Natives.arrayPushApply(obj, arg);
					};
				};
				return obj;
			}));
			
		__Internal__.ADD('unique', __Internal__.DD_DOC(
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
				let start = 1;
				let comparerFn = comparer;
				if (!types.isFunction(comparerFn)) {
					comparerFn = null;
					start = 0;
				};
				
				const result = [];

				const len = arguments.length;
				
				if (comparerFn) {
					for (let i = start; i < len; i++) {
						obj = arguments[i];
						if (types.isNothing(obj)) {
							continue;
						};
						obj = _shared.Natives.windowObject(obj);
						const objLen = obj.length;
						for (let key1 = 0; key1 < objLen; key1++) {
							if (types.has(obj, key1)) {
								const value1 = obj[key1];
								const resultLen = result.length;
								let found = false;
								for (let key2 = 0; key2 < resultLen; key2++) {
									const res = comparerFn(value1, result[key2]);
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
					for (let i = start; i < len; i++) {
						obj = arguments[i];
						if (types.isNothing(obj)) {
							continue;
						};
						obj = _shared.Natives.windowObject(obj);
						const objLen = obj.length;
						for (let key1 = 0; key1 < objLen; key1++) {
							if (types.has(obj, key1)) {
								const value1 = obj[key1];
								const resultLen = result.length;
								let found = false;
								for (let key2 = 0; key2 < resultLen; key2++) {
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
			}));
			
		// <PRB> JS has no function to test for objects ( new Object() )
		__Internal__.ADD('isObject', __Internal__.DD_DOC(
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
						returns: 'boolean',
						description: "Returns 'true' if the object is a direct instance of 'Object'. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isObject(obj) {
				if (types.isNothing(obj)) {
					return false;
				};

				if (typeof obj !== 'object') {
					return false;
				};

				let result = (_shared.Natives.objectToStringCall(obj) === '[object Object]');

				if (!result) {
					if (_shared.Natives.symbolToStringTag && (obj[_shared.Natives.symbolToStringTag] === 'Object')) {
						// <PRB> Sometimes, the first call returns "false", but the second one returns "true". That seems to be a bug in V8 with Symbol.toStringTag.
						result = true;
					};
				};

				return result;
			}));
			
		__Internal__.ADD('isObjectLike', __Internal__.DD_DOC(
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
						returns: 'boolean',
						description: "Returns 'true' if the object is a direct instance of 'Object' or an instance of a type which inherits 'Object'. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isObjectLike(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				return (typeof obj === 'object') || (typeof obj === 'function');
			}));
		
		__Internal__.ADD('isExtensible', _shared.Natives.objectIsExtensible);
		
		__Internal__.ADD('preventExtensions', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
						params: {
							obj: {
								type: 'object,arraylike',
								optional: false,
								description: "An object.",
							},
							depth: {
								type: 'integer',
								optional: true,
								description: "Depth.",
							},
						},
						returns: 'object',
						description: "Prevent extensions of the object returns that same object. Note that it can't be reverted for the moment (ES5).",
			}
			//! END_REPLACE()
			, function preventExtensions(obj, /*optional*/depth) {
					depth = (+depth || 0) - 1;  // null|undefined|true|false|NaN|Infinity
					const isArray = types.isArrayLike(obj);
					const isObject = types.isJsObject || types.isObject;
					if (isArray || isObject(obj)) {
						if (depth >= 0) {
							if (isArray) {
								const len = obj.length;
								for (let i = 0; i < len; i++) {
									if (types.has(obj, i)) {
										types.preventExtensions(obj[i], depth);
									};
								};
							} else {
								const keys = types.keys(obj),
									keysLen = keys.length;
								for (let i = 0; i < keysLen; i++) {
									types.preventExtensions(obj[keys[i]], depth);
								};
							};
						};
						_shared.Natives.objectPreventExtensions(obj);
					};
					return obj;
				}));
		
		__Internal__.ADD('sealObject', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
						params: {
							obj: {
								type: 'object,arraylike',
								optional: false,
								description: "An object.",
							},
							depth: {
								type: 'integer',
								optional: true,
								description: "Depth.",
							},
						},
						returns: 'object',
						description: "Seals the object and returns that same object. Note that it can't be reverted for the moment (ES5).",
			}
			//! END_REPLACE()
			, function sealObject(obj, /*optional*/depth) {
					depth = (+depth || 0) - 1;  // null|undefined|true|false|NaN|Infinity
					const isArray = types.isArrayLike(obj);
					const isObject = types.isJsObject || types.isObject;
					if (isArray || isObject(obj)) {
						if (depth >= 0) {
							if (isArray) {
								const len = obj.length;
								for (let i = 0; i < len; i++) {
									if (types.has(obj, i)) {
										types.sealObject(obj[i], depth);
									};
								};
							} else {
								const keys = types.keys(obj),
									keysLen = keys.length;
								for (let i = 0; i < keysLen; i++) {
									types.sealObject(obj[keys[i]], depth);
								};
							};
						};
						return _shared.Natives.objectSeal(obj);
					} else {
						return obj;
					};
				}));
		
		__Internal__.ADD('isFrozen', _shared.Natives.objectIsFrozen);
		
		__Internal__.ADD('freezeObject', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
						params: {
							obj: {
								type: 'object,arraylike',
								optional: false,
								description: "An object.",
							},
							depth: {
								type: 'integer',
								optional: true,
								description: "Depth.",
							},
						},
						returns: 'object',
						description: "Freezes the object and returns that same object. Note that it can't be reverted for the moment (ES5).",
			}
			//! END_REPLACE()
			, function freezeObject(obj, /*optional*/depth) {
					depth = (+depth || 0) - 1;  // null|undefined|true|false|NaN|Infinity
					const isArray = types.isArrayLike(obj);
					const isObject = types.isJsObject || types.isObject;
					if (isArray || isObject(obj)) {
						if (depth >= 0) {
							if (isArray) {
								const len = obj.length;
								for (let i = 0; i < len; i++) {
									if (types.has(obj, i)) {
										types.freezeObject(obj[i], depth);
									};
								};
							} else {
								const keys = types.keys(obj),
									keysLen = keys.length;
								for (let i = 0; i < keysLen; i++) {
									types.freezeObject(obj[keys[i]], depth);
								};
							};
						};
						return _shared.Natives.objectFreeze(obj);
					} else {
						return obj;
					};
				}));
		
		//==============
		// Options
		//==============
		
		if (types.isArray(_options)) {
			_options = types.depthExtend.apply(null, types.append([15, {} /*! IF_UNSET("serverSide") */ , ((typeof DD_OPTIONS === 'object') && (DD_OPTIONS !== null) ? DD_OPTIONS : undefined) /*! END_IF() */ ],  _options));
		//! IF_UNSET("serverSide")
		} else {
			_options = types.depthExtend(15, {}, ((typeof DD_OPTIONS === 'object') && (DD_OPTIONS !== null) ? DD_OPTIONS : undefined), _options);
		//! END_IF()
		};

		const __options__ = types.depthExtend(15, {
			//! IF(IS_SET('debug'))
				// Starting from source code...
				debug: true,					// When 'true', will be in 'debug mode'.
				fromSource: true,				// When 'true', loads source code instead of built code
				enableProperties: true,			// When 'true', enables "defineProperty"
				enableAsserts: true,			// When 'true', enables asserts.
			//! END_IF()
			
			enableSymbols: true,				// When 'true', symbols are enabled.
		}, types.get(_options, 'startup'));
		
		__options__.debug = types.toBoolean(__options__.debug);
		__options__.fromSource = types.toBoolean(__options__.fromSource);
		__options__.enableProperties = types.toBoolean(__options__.enableProperties);
		__options__.enableSymbols = types.toBoolean(__options__.enableSymbols);
		__options__.enableAsserts = types.toBoolean(__options__.enableAsserts);
		
		_shared.SECRET = types.get(__options__, 'secret');
		delete __options__.secret;

		types.freezeObject(__options__);
		
		__Internal__.ADD('hasDefinePropertyEnabled', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 2,
						params: null,
						returns: 'boolean',
						description: "Returns 'true' if 'defineProperty' is enabled. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (__options__.enableProperties ? function hasDefinePropertyEnabled() {
				return true;
			} : function hasDefinePropertyEnabled() {
				return false;
			})));
		
		//===================================
		// UUIDs
		//===================================

		__Internal__.nodeUUID = null;
		if (typeof require === 'function') {
			try {
				// NOTE: Client-side 'uuid' is browserified to "lib/uuid/uuid.js" and "lib/uuid/uuid.min.js", and made available in JS through "require".
				//       Also it works with Node.js and bundlers.
				__Internal__.nodeUUID = require('uuid');
			} catch(ex) {
			};
		};

		__Internal__.ADD_TOOL('generateUUID', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
					author: "Claude Petit",
					revision: 1,
					params: null,
					returns: 'string',
					description: "Generates and returns a UUID.",
			}
			//! END_REPLACE()
			, function generateUUID() {
				if (__Internal__.nodeUUID) {
					return __Internal__.nodeUUID();
				} else {
					throw new global.Error("Package 'uuid' is missing.");
				};
			})
		);

		//===================================
		// Symbols
		//===================================
		
		__Internal__.ADD('hasSymbols', __Internal__.DD_DOC(
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
			})));
			
		__Internal__.ADD('hasGetSymbolEnabled', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'bool',
						description: "Returns 'true' if 'getSymbolFor' is available and enabled. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (__options__.enableSymbols && _shared.Natives.windowSymbol ? function hasGetSymbolEnabled() {
				return true;
			} : function hasGetSymbolEnabled() {
				return false;
			})));
			
		__Internal__.ADD('isSymbol', __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a Symbol. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (_shared.Natives.windowSymbol ? function isSymbol(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				if (typeof obj === 'object') {
					if (_shared.Natives.symbolToStringTag && (obj[_shared.Natives.symbolToStringTag] === 'Symbol')) {
						try {
							obj = _shared.Natives.symbolValueOfCall(obj);
						} catch(o) {
							return false;
						};
					} else if (_shared.Natives.objectToStringCall(obj) !== '[object Symbol]') {
						return false;
					} else {
						obj = _shared.Natives.symbolValueOfCall(obj);
					};
				};
				return (typeof obj === 'symbol');
			} : function isSymbol(obj) {
				return false;
			})));
		
		if (!__options__.enableSymbols || !_shared.Natives.windowSymbol) {
			__Internal__.globalSymbolsUUID = /*! REPLACE_BY(TO_SOURCE(UUID('Symbol')), true) */ tools.generateUUID() /*! END_REPLACE() */;
		};
	
		__Internal__.ADD('getSymbol', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 6,
						params: {
							key: {
								type: 'string',
								optional: false,
								description: "Symbol key.",
							},
							isGlobal: {
								type: 'bool',
								optional: true,
								description: "When 'true', gets or creates a global symbol. Otherwise, returns a new unique symbol.",
							},
						},
						returns: 'symbol',
						description: "Gets or creates a Symbol.",
			}
			//! END_REPLACE()
			, (__options__.enableSymbols && _shared.Natives.windowSymbol ? function getSymbol(key, /*optional*/isGlobal) {
				key = _shared.Natives.windowString(key);
				let symbol;
				if (isGlobal) {
					symbol = _shared.Natives.symbolFor(key);
				} else {
					symbol = _shared.Natives.windowSymbol(key);
				};
				return symbol;
			} : function getSymbol(key, /*optional*/isGlobal) {
				// Not supported
				const genKey = (isGlobal ? __Internal__.globalSymbolsUUID : tools.generateUUID());
				if (!isGlobal && types.isNothing(key)) {
					return genKey;
				} else {
					return _shared.Natives.windowString(key) + '$' + genKey;
				};
			})));
			
		__Internal__.ADD('getSymbolKey', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 3,
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
				if (!types.isSymbol(symbol)) {
					return undefined;
				};
				let key = _shared.Natives.symbolKeyFor(symbol.valueOf());
				if (types.isNothing(key)) {
					key = _shared.Natives.symbolToStringCall(symbol);
					key = /^Symbol[(]((.|\n)*)[)]$/gm.exec(key) || undefined;
					key = key && key[1];
				};
				return key;
			} : function getSymbolKey(symbol) {
				// Not supported
				return undefined;
			})));
			
		__Internal__.ADD('symbolIsGlobal', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 3,
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
				if (!types.isSymbol(symbol)) {
					return false;
				};
				return (_shared.Natives.symbolKeyFor(symbol.valueOf()) !== undefined);
			} : function symbolIsGlobal(symbol) {
				// Not supported
				return false;
			})));
			
		//===================================
		// Functions
		//===================================
		
		__Internal__.ADD('getFunctionName', __Internal__.DD_DOC(
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
						const str = _shared.Natives.functionToStringCall(obj);
						const result = str.match(/function\s+([^(\s]*)[^(]*\(/);
						return result && result[1] || null;
					};
				} else {
					return null;
				};
			}));
		
		//===================================
		// Type functions
		//===================================
		
		__Internal__.symbolIsType = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_IS_TYPE')), true) */ '__DD_IS_TYPE__' /*! END_REPLACE() */, true);
		__Internal__.symbolTypeUUID = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_TYPE_UUID')), true) */ '__DD_TYPE_UUID__' /*! END_REPLACE() */, true);
		__Internal__.symbolInitialized = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_INITIALIZED')), true) */ '__DD_INITIALIZED' /*! END_REPLACE() */, true);
		__Internal__.symbol$IsSingleton = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_$IS_SINGLETON')), true) */ '__DD_$IS_SINGLETON' /*! END_REPLACE() */, true);
		__Internal__.symbolSingleton = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_SINGLETON')), true) */ '__DD_SINGLETON' /*! END_REPLACE() */, true);
		_shared.UUIDSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_JS_TYPE_UUID')), true) */ '__DD_JS_TYPE_UUID__' /*! END_REPLACE() */, true);

		__Internal__.ADD('isType', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 3,
						params: {
							obj: {
								type: 'object',
								optional: false,
								description: "An object to test for.",
							},
						},
						returns: 'boolean',
						description: "Returns 'true' when object is a Doodad type (created using 'Types.createType'). Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isType(obj) {
				if (!types.isFunction(obj)) {
					return false;
				};
				return !!obj[__Internal__.symbolIsType]; // types.has(obj, __Internal__.symbolIsType);
			}));
		
		__Internal__.ADD('isJsFunction', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 5,
						params: {
							obj: {
								type: 'object',
								optional: false,
								description: "An object to test for.",
							},
						},
						returns: 'boolean',
						description: "Returns 'true' if object is a function, and not a JS class and not a Doodad type. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isJsFunction(obj) {
				return types.isFunction(obj) && !types.isJsClass(obj) && !types.isType(obj) && !types.isErrorType(obj);
			}));

		__Internal__.ADD('isJsObject', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 4,
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
				return types.isObject(obj) && !types.getType(obj);
			}));

		_shared.getUUID = function getUUID(obj) {
			if (!types.isObjectLike(obj)) {
				return null;
			};
			let type;
			if (types.isFunction(obj)) {
				type = obj;
			} else {
				type = obj.constructor;
				if (!types.isFunction(type)) {
					// Invalid constructor
					return null;
				};
			};
			let uuid;
			const isType = types.isType(type);
			if (isType) {
				uuid = types.get(type, __Internal__.symbolTypeUUID);
				// TODO: Is the following necessary ?
				//if (uuid && (types.get(type.prototype, __Internal__.symbolTypeUUID) !== uuid)) {
				//	// Invalid type
				//	return null;
				//};
			} else {
				uuid = types.get(type, _shared.UUIDSymbol);
				// TODO: Is the following necessary ?
				//if (uuid && (types.get(type.prototype, _shared.UUIDSymbol) !== uuid)) {
				//	// Invalid type
				//	return null;
				//};
			};
			if (uuid && !isType && !types.isNativeFunction(type) && !types.isErrorType(type)) {
				uuid = /*! REPLACE_BY(TO_SOURCE(UUID('JS_TYPE')), true) */ '__JS_TYPE__' /*! END_REPLACE() */ + uuid;
			};
			return (uuid || null);
		};

		__Internal__.ADD('baseof', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 7,
						params: {
							base: {
								type: 'type,arrayof(type)',
								optional: false,
								description: "A type.",
							},
							type: {
								type: 'type',
								optional: false,
								description: "A type.",
							},
						},
						returns: 'boolean',
						description: "Returns 'true' if a type derivates from base. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function baseof(base, type) {
				if (!types.isFunction(type)) {
					return false;
				};
				type = _shared.Natives.windowObject(type);
				let crossRealm = !(type instanceof _shared.Natives.windowFunction);
				if (types.isArray(base)) {
					let i = 0;
					if (!crossRealm) {
						for (; i < base.length; i++) {
							if (types.has(base, i)) {
								let b = base[i];
								if (types.isFunction(b)) {
									b = _shared.Natives.windowObject(b);
									if (b instanceof _shared.Natives.windowFunction) {
										if (types.isPrototypeOf(b, type)) {
											return true;
										};
									} else {
										// Cross-realm
										crossRealm = true;
										break;
									};
								};
							};
						};
					};
					if (crossRealm) {
						//type = types.getPrototypeOf(type);
							type = types.getPrototypeOf(type.prototype);
							type = type && type.constructor;
						let start = i;
						while (!types.isNothing(type)) {
							const tuuid = _shared.getUUID(type);
							for (; i < base.length; i++) {
								if (types.has(base, i)) {
									const b = base[i];
									if (types.isFunction(b)) {
										if (tuuid) {
											if (tuuid === _shared.getUUID(b)) {
												return true;
											};
										} else {
											if (type === b) {
												return true;
											};
										};
									};
								};
							};
							//type = types.getPrototypeOf(type);
								type = types.getPrototypeOf(type.prototype);
								type = type && type.constructor;
							i = start;
						};
					};
				} else if (types.isFunction(base)) {
					base = _shared.Natives.windowObject(base);
					if (!crossRealm) {
						if (base instanceof _shared.Natives.windowFunction) {
							if (types.isPrototypeOf(base, type)) {
								return true;
							};
						} else {
							// Cross-realm
							crossRealm = true;
						};
					};
					if (crossRealm) {
						const uuid = _shared.getUUID(base);
						//type = types.getPrototypeOf(type);
							type = types.getPrototypeOf(type.prototype);
							type = type && type.constructor;
						while (!types.isNothing(type)) {
							const tuuid = _shared.getUUID(type);
							if (tuuid) {
								if (tuuid === uuid) {
									return true;
								};
							} else {
								if (type === base) {
									return true;
								};
							};
							//type = types.getPrototypeOf(type);
								type = types.getPrototypeOf(type.prototype);
								type = type && type.constructor;
						};
					};
				};
				
				return false;
			}));

		__Internal__.ADD('is', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 7,
						params: {
							obj: {
								type: 'object,type',
								optional: false,
								description: "An object to test for. A type can be provided.",
							},
							type: {
								type: 'type,object,arrayof(type,object)',
								optional: false,
								description: "A type. If an object is provided, its type will be used.",
							},
						},
						returns: 'boolean',
						description: "Returns 'true' if object is from the specified type. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function is(obj, type) {
				if (types.isNothing(obj)) {
					return false;
				};
				obj = _shared.Natives.windowObject(obj);
				if (!types.isFunction(obj)) {
					obj = obj.constructor;
					if (!types.isFunction(obj)) {
						return false;
					};
					obj = _shared.Natives.windowObject(obj);
				};
				let crossRealm = !(obj instanceof _shared.Natives.windowFunction);
				if (types.isArray(type)) {
					let i = 0;
					if (!crossRealm) {
						for (; i < type.length; i++) {
							if (types.has(type, i)) {
								let t = type[i];
								if (!types.isNothing(t)) {
									t = _shared.Natives.windowObject(t);
									if (!types.isFunction(t)) {
										t = t.constructor;
										if (!types.isFunction(t)) {
											continue;
										};
										t = _shared.Natives.windowObject(t);
									};
									if (t instanceof _shared.Natives.windowFunction) {
										if (obj === t) {
											return true;
										};
									} else {
										// Cross-realm
										crossRealm = true;
										break;
									};
								};
							};
						};
					};
					if (crossRealm) {
						const uuid = _shared.getUUID(obj);
						if (uuid) {
							for (; i < type.length; i++) {
								if (types.has(type, i)) {
									let t = type[i];
									if (!types.isNothing(t)) {
										t = _shared.Natives.windowObject(t);
										if (!types.isFunction(t)) {
											t = t.constructor;
											if (!types.isFunction(t)) {
												continue;
											};
										};
										if (uuid === _shared.getUUID(t)) {
											return true;
										};
									};
								};
							};
						};
					};
				} else if (!types.isNothing(type)) {
					type = _shared.Natives.windowObject(type);
					if (!types.isFunction(type)) {
						type = type.constructor;
						if (!types.isFunction(type)) {
							return false;
						};
						type = _shared.Natives.windowObject(type);
					};
					if (!crossRealm) {
						if (type instanceof _shared.Natives.windowFunction) {
							if (obj === type) {
								return true;
							};
						} else {
							// Cross-realm
							crossRealm = true;
						};
					};
					if (crossRealm) {
						const tuuid = _shared.getUUID(type);
						if (tuuid) {
							if (tuuid === _shared.getUUID(obj)) {
								return true;
							};
						} else {
							if (type === obj) {
								return true;
							};
						};
					};
				};
				
				return false;
			}));

		__Internal__.ADD('isLike', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 8,
						params: {
							obj: {
								type: 'object,type',
								optional: false,
								description: "An object to test for. A type can be provided.",
							},
							type: {
								type: 'type,object,arrayof(type,object)',
								optional: false,
								description: "A Doodad type. If an object is provided, its type will be used.",
							},
						},
						returns: 'boolean',
						description: "Returns 'true' if object is from or inherits from the specified type. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isLike(obj, type) {
				if (types.isNothing(obj)) {
					return false;
				};
				obj = _shared.Natives.windowObject(obj);
				if (!types.isFunction(obj)) {
					obj = obj.constructor;
					if (!types.isFunction(obj)) {
						return false;
					};
					obj = _shared.Natives.windowObject(obj);
				};
				let crossRealm = !(obj instanceof _shared.Natives.windowFunction);
				if (types.isArray(type)) {
					let i = 0;
					if (!crossRealm) {
						for (; i < type.length; i++) {
							if (types.has(type, i)) {
								let t = type[i];
								if (!types.isNothing(t)) {
									t = _shared.Natives.windowObject(t);
									if (!types.isFunction(t)) {
										t = t.constructor;
										if (!types.isFunction(t)) {
											continue;
										};
										t = _shared.Natives.windowObject(t);
									};
									if (t instanceof _shared.Natives.windowFunction) {
										if ((obj === t) || types.isPrototypeOf(t, obj)) {
											return true;
										};
									} else {
										// Cross-realm
										crossRealm = true;
										break;
									};
								};
							};
						};
					};
					if (crossRealm) {
						const start = i;
						do {
							const uuid = _shared.getUUID(obj);
							for (; i < type.length; i++) {
								if (types.has(type, i)) {
									let t = type[i];
									if (!types.isNothing(t)) {
										t = _shared.Natives.windowObject(t);
										if (!types.isFunction(t)) {
											t = t.constructor;
											if (!types.isFunction(t)) {
												continue;
											};
										};
										const tuuid = _shared.getUUID(t);
										if (tuuid) {
											if (tuuid === uuid) {
												return true;
											};
										} else {
											if (obj === type) {
												return true;
											};
										};
									};
								};
							};
							//obj = types.getPrototypeOf(obj);
								obj = types.getPrototypeOf(obj.prototype);
								obj = obj && obj.constructor;
							i = start;
						} while (!types.isNothing(obj));
					};
				} else if (!types.isNothing(type)) {
					type = _shared.Natives.windowObject(type);
					if (!types.isFunction(type)) {
						type = type.constructor;
						if (!types.isFunction(type)) {
							return false;
						};
						type = _shared.Natives.windowObject(type);
					};
					if (!crossRealm) {
						if (type instanceof _shared.Natives.windowFunction) {
							if ((obj === type) || types.isPrototypeOf(type, obj)) {
								return true;
							};
						} else {
							// Cross-realm
							crossRealm = true;
						};
					};
					if (crossRealm) {
						const tuuid = _shared.getUUID(type);
						do {
							if (tuuid) {
								if (tuuid === _shared.getUUID(obj)) {
									return true;
								};
							} else {
								if (obj === type) {
									return true;
								};
							};
							//obj = types.getPrototypeOf(obj);
								obj = types.getPrototypeOf(obj.prototype);
								obj = obj && obj.constructor;
						} while (!types.isNothing(obj));
					};
				};
				
				return false;
			}));

		__Internal__.ADD('_instanceof', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 10,
						params: {
							obj: {
								type: 'object',
								optional: false,
								description: "An object.",
							},
							type: {
								type: 'type,arrayof(type)',
								optional: false,
								description: "A type.",
							},
						},
						returns: 'boolean',
						description: "Returns 'true' if an object inherits from type. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function _instanceof(obj, type) {
				// Uses prototypes chain like the operator "instanceof", but doesn't raise an exception when 'type' is not a type. 
				// NOTE: With Doodad objects it is recommended to use this function instead of the operator.
				if (types.isNothing(obj)) {
					return false;
				};
				obj = _shared.Natives.windowObject(obj);
				// NOTE: "null objects" will appear "cross-realm"
				let crossRealm = !(obj instanceof _shared.Natives.windowObject);
				if (types.isArray(type)) {
					let i = 0;
					if (!crossRealm) {
						for (; i < type.length; i++) {
							if (types.has(type, i)) {
								const t = type[i];
								if (types.isFunction(t)) {
									if (_shared.Natives.windowObject(t) instanceof _shared.Natives.windowFunction) {
										const hasInstance = _shared.Natives.symbolHasInstance && t[_shared.Natives.symbolHasInstance];
										if (!types.isNothing(hasInstance) && (hasInstance !== _shared.Natives.functionHasInstance)) {
											// "hasInstance" has been messed, switch to cross-realm mode
											crossRealm = true;
											break;
										} else if (obj instanceof t) {
											return true;
										};
									} else {
										// Cross-realm
										crossRealm = true;
										break;
									};
								};
							};
						};
					};
					if (crossRealm) {
						const start = i;
						do {
							const uuid = _shared.getUUID(obj);
							for (; i < type.length; i++) {
								if (types.has(type, i)) {
									const t = type[i];
									if (types.isFunction(t)) {
										const tuuid = _shared.getUUID(t);
										if (tuuid) {
											if (tuuid === uuid) {
												return true;
											};
										} else {
											if (obj.constructor === type) {
												return true;
											};
										};
									};
								};
							};
							obj = types.getPrototypeOf(obj);
							i = start;
						} while (!types.isNothing(obj));
					};
				} else if (types.isFunction(type)) {
					if (!crossRealm) {
						if (_shared.Natives.windowObject(type) instanceof _shared.Natives.windowFunction) {
							const hasInstance = _shared.Natives.symbolHasInstance && type[_shared.Natives.symbolHasInstance];
							if (!types.isNothing(hasInstance) && (hasInstance !== _shared.Natives.functionHasInstance)) {
								// "hasInstance" has been messed, switch to cross-realm mode
								crossRealm = true;
							} else if (obj instanceof type) {
								return true;
							};
						} else {
							// Cross-realm
							crossRealm = true;
						};
					};
					if (crossRealm) {
						const tuuid = _shared.getUUID(type);
						do {
							if (tuuid) {
								if (tuuid === _shared.getUUID(obj)) {
									return true;
								};
							} else {
								if (obj.constructor === type) {
									return true;
								};
							};
							obj = types.getPrototypeOf(obj);
						} while (!types.isNothing(obj));
					};
				};
				
				return false;
			}));

		__Internal__.ADD('isSingleton', __Internal__.DD_DOC(
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
			}));

		
		__Internal__.ADD('getType', __Internal__.DD_DOC(
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
						description: "Returns the type of an object. Returns 'null' if not a Doodad object.",
			}
			//! END_REPLACE()
			, function getType(obj) {
				if (types.isNothing(obj)) {
					return null;
				};
				obj = _shared.Natives.windowObject(obj);
				if (types.isType(obj)) {
					return obj;
				};
				const ctr = obj.constructor;
				if (types.isType(ctr)) {
					return ctr;
				};
				return null;
			}));

		__Internal__.ADD('getTypeName', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 2,
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
				obj = _shared.Natives.windowObject(obj);
				obj = types.getType(obj);
				if (!obj) {
					return null;
				};
				return obj.$TYPE_NAME || types.getFunctionName(obj);
			}));
		
		__Internal__.ADD('getBase', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 2,
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
				obj = _shared.Natives.windowObject(obj);
				obj = types.getType(obj);
				if (!obj) {
					return null;
				};
				obj = types.getPrototypeOf(obj.prototype);
				if (!obj) {
					return null;
				};
				return obj.constructor;
			}));

		_shared.invoke = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 3,
						params: {
							obj: {
								type: 'object',
								optional: false,
								description: "The object from where comes 'fn'.",
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
							secret: {
								type: 'any',
								optional: true,
								description: "The secret.",
							},
							thisObj: {
								type: 'any',
								optional: true,
								description: "The value to pass to 'this'. Default is the 'obj' argument.",
							},
						},
						returns: 'any',
						description: "Invokes a method or a function as from inside the object.",
			}
			//! END_REPLACE()
			, function invoke(obj, fn, /*optional*/args, /*optional*/secret, /*optional*/thisObj) {
				if (types.isString(fn) || types.isSymbol(fn)) {
					fn = _shared.getAttribute(obj, fn);
				};
				if (types.isNothing(thisObj)) {
					thisObj = obj;
				};
				if (args) {
					return fn.apply(thisObj, args);
				} else {
					return fn.call(thisObj);
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
						revision: 2,
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
				const attrsLen = attrs.length,
					result = {};
				for (let i = 0; i < attrsLen; i++) {
					if (types.has(attrs, i)) {
						const attr = attrs[i];
						result[attr] = _shared.getAttribute(obj, attr);
					};
				};
				return result;
			});
			
		__Internal__.setAttribute = _shared.setAttribute = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 9,
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
				const hasOwn = types.has(obj, attr);
				let descriptor = types.getPropertyDescriptor(obj, attr);
				const descConfigurable = !hasOwn || !descriptor || types.get(descriptor, 'configurable', false),
					descEnumerable = !descriptor || types.get(descriptor, 'enumerable', false),
					descWritable = !descriptor || types.get(descriptor, 'writable', false),
					descGet = types.get(descriptor, 'get'),
					descSet = types.get(descriptor, 'set');
				if (descSet && !options) {
					descSet.call(obj, value);
				} else if (descGet && !options) {
					if (!options || (!options.ignoreWhenReadOnly && (!options.ignoreWhenSame || (descGet.call(obj) !== value)))) {
						// NOTE: Use native error because something might be wrong
						throw new _shared.Natives.windowError(tools.format("Attribute '~0~' is read-only.", [attr]));
					};
				} else if (hasOwn && descWritable && (!options || ((!!options.configurable === descConfigurable) && (!!options.enumerable === descEnumerable) && (!!options.writable === descWritable)))) {
					obj[attr] = value;
				} else if (descConfigurable) {
					if (options && types.hasDefinePropertyEnabled()) {
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
					if (!options || (!options.ignoreWhenReadOnly && (!options.ignoreWhenSame || (obj[attr] !== value)))) {
						// NOTE: Use native error because something might be wrong
						throw new _shared.Natives.windowError(tools.format("Attribute '~0~' is read-only.", [attr]));
					};
				};
				return value;
			});
			
		_shared.setAttributes = __Internal__.DD_DOC(
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
				const keys = types.append(types.keys(values), types.symbols(values)),
					keysLen = keys.length;
				for (let i = 0; i < keysLen; i++) {
					const key = keys[i];
					__Internal__.setAttribute(obj, key, values[key], options);
				};
				return values;
			});

		//===================================
		// Temporary REGISTER (for Doodad.Types)
		//===================================
		__Internal__.tempTypesRegistered = [];

		__Internal__.REGISTER = function REGISTER(type) {
			const name = (types.getTypeName && types.getTypeName(type) || types.getFunctionName(type));
			if (types.isType && types.isType(type)) {
				type = types.INIT(type);
			};
			types[name] = type;
			__Internal__.tempTypesRegistered.push(type);
			return type;
		};

		//===================================
		// Errors
		//===================================

		global.Error.prototype.bubble = false;
		global.Error.prototype.critical = false;
		global.Error.prototype.trapped = false;
		global.Error.prototype.promiseName = false;

		__Internal__.symbolIsErrorType = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_IS_ERROR_TYPE')), true) */ '__DD_IS_ERROR_TYPE' /*! END_REPLACE() */, true);

		__Internal__.ADD('isErrorType', function isErrorType(type) {
			return types.isFunction(type) && types.has(type, __Internal__.symbolIsErrorType);
		});
			
		// NOTE: 2015/04/16 The actual implementations of Error and other error types are not easily inheritable because their constructor always act as an instantiator.
		// NOTE: 2016: ES6 Classes are the only way to really extend an Error object.
		__Internal__.ADD('createErrorType', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 6,
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
							uuid: {
								type: 'string',
								optional: true,
								description: "UUID of the resulting error type.",
							},
						},
						returns: 'error',
						description: "Creates a new error type, based on another error type.",
			}
			//! END_REPLACE()
			, function createErrorType(name, /*optional*/base, /*optional*/constructor, /*optional*/uuid) {
				if (types.isNothing(base)) {
					base = _shared.Natives.windowError;
				};
				name = _shared.Natives.stringReplaceCall(name, /[^a-zA-Z0-9$_]/g, "_");
				// <FUTURE> Declare classes directly (when ES6 will be everywhere)
				let type;
				if (__Internal__.hasClasses) {
					const expr = "class " + name + " extends ctx.base {" +
						"constructor(/*paramarray*/...args) {" +
							"const context = {_this: {}, superArgs: null};" +
							(constructor ? (
								"ctx.constructor.apply(context, args);"
							) : (
								""
							)) +
							"super(...(context.superArgs || args));" +
							"ctx.extend(this, context._this);" +
							"this.name = ctx.name;" +
							"this.description = this.message;" +
						"}" +
					"}";

					// NOTE: Use of "eval" to give the name to the class
					type = types.evalStrict(expr, {
						base: base,
						constructor: constructor,
						name: name,
						extend: types.extend,
					});

				} else {
					const expr = "function " + name + "(/*paramarray*/) {" +
						"const context = {_this: {}, superArgs: null};" +
						(constructor ? (
							"ctx.constructor.apply(context, arguments);" +
							"ctx.extend(this, context._this);" +
							"this.throwLevel++;"
						) : (
							""
						)) +
						"const error = ctx.base.apply(this, (context.superArgs || arguments)) || this;" +
						"if (error !== this) {" +
							// <PRB> As of January 2015, "global.Error" doesn't behave like a normal constructor within any browser. This might be part of W3C specs.
							//
							//       Proof of concept :
							//          let a = new Error("hello");
							//          let b = Error.call(a, "bye");
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
					type = types.eval(expr, {
						base: base,
						constructor: constructor,
						name: name,
						extend: types.extend,
					});
				
					// For "instanceof".
					type.prototype = types.createObject(base.prototype, {
						constructor: {
							value: type,
						},
					});
				};
				
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
							let stack;
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
							
							let fileName,
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
									const trace = stack[0];
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

				if (_shared.Natives.symbolToStringTag) {
					_shared.setAttribute(type.prototype, _shared.Natives.symbolToStringTag, 'Error', {});
				};
				
				_shared.setAttribute(type, __Internal__.symbolIsErrorType, true, {});
				
				uuid = (uuid ? /*! REPLACE_BY(TO_SOURCE(UUID('ERROR_TYPE')), true) */ '__ERROR_TYPE__' /*! END_REPLACE() */ + uuid : null);
				_shared.setAttribute(type, _shared.UUIDSymbol, uuid, {});
				_shared.setAttribute(type.prototype, _shared.UUIDSymbol, uuid, {});

				return type;
			}));
		
		__Internal__.createErrorConstructor = function() {
			return function _new(message, /*optional*/params) {
				message = tools.format(message, params);
				this.superArgs = [message];
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
			, types.createErrorType("TypeError", _shared.Natives.windowTypeError, __Internal__.createErrorConstructor(), /*! REPLACE_BY(TO_SOURCE(UUID('TypeError')), true) */ null /*! END_REPLACE() */)
			));
		
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
			, types.createErrorType('Error', _shared.Natives.windowError, __Internal__.createErrorConstructor(), /*! REPLACE_BY(TO_SOURCE(UUID('Error')), true) */ null /*! END_REPLACE() */)));


		//! IF_SET('serverSide')
		__Internal__.AssertionError = null;
		//! END_IF()

		//! BEGIN_REMOVE()
		if (typeof require === 'function') {
		//! END_REMOVE()
		//! IF_SET('serverSide')
			try {
				__Internal__.AssertionError = require('assert').AssertionError;
			} catch(ex) {
			};
		//! END_IF()
		//! BEGIN_REMOVE()
		};
		//! END_REMOVE()

		__Internal__.AssertionErrorDD_DOC = 
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 2,
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

		//! IF_SET('serverSide')
		if (__Internal__.AssertionError) {
			__Internal__.ADD('AssertionFailed', __Internal__.REGISTER(__Internal__.DD_DOC(
				__Internal__.AssertionErrorDD_DOC
				, types.createErrorType("AssertionError", __Internal__.AssertionError, function _new(/*optional*/message, /*optional*/params) {
						if (message) {
							this.superArgs = [{
								actual: false,
								expected: true,
								operator: '==',
								message: tools.format("Assertion failed: " + message, params),
							}];
						} else {
							this.superArgs = [{
								actual: false,
								expected: true,
								operator: '==',
								message: "Assertion failed.",
							}];
						};
					}, /*! REPLACE_BY(TO_SOURCE(UUID('AssertionError')), true) */ null /*! END_REPLACE() */))));
		};
		//! END_IF()

		//! IF_SET('serverSide')
		if (!__Internal__.AssertionError) {
		//! END_IF()
			__Internal__.ADD('AssertionFailed', __Internal__.REGISTER(__Internal__.DD_DOC(
				__Internal__.AssertionErrorDD_DOC
				, types.createErrorType("AssertionError", types.Error, function _new(message, /*optional*/params) {
					if (message) {
						this.superArgs = ["Assertion failed: " + message, params];
					} else {
						this.superArgs = ["Assertion failed."];
					};
				}, /*! REPLACE_BY(TO_SOURCE(UUID('AssertionError')), true) */ null /*! END_REPLACE() */))));
		//! IF_SET('serverSide')
		};
		//! END_IF()

		delete __Internal__.AssertionErrorDD_DOC;

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
				this.superArgs = [message || "Parse error.", params];
			}, /*! REPLACE_BY(TO_SOURCE(UUID('ParseError')), true) */ null /*! END_REPLACE() */)));
		
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
				this.superArgs = [message || "Not supported.", params];
			}, /*! REPLACE_BY(TO_SOURCE(UUID('NotSupported')), true) */ null /*! END_REPLACE() */)));
		
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
				this.superArgs = [message || "Not available.", params];
			}, /*! REPLACE_BY(TO_SOURCE(UUID('NotAvailable')), true) */ null /*! END_REPLACE() */)));
		
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
				this._this.code = code;
				this.superArgs = [message, params];
			}, /*! REPLACE_BY(TO_SOURCE(UUID('HttpError')), true) */ null /*! END_REPLACE() */)));
		
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
				this.superArgs = [message || "Buffer overflow.", params];
			}, /*! REPLACE_BY(TO_SOURCE(UUID('BufferOverflow')), true) */ null /*! END_REPLACE() */)));
		
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
				this.superArgs = [message || "Operation timed out.", params];
			}, /*! REPLACE_BY(TO_SOURCE(UUID('TimeoutError')), true) */ null /*! END_REPLACE() */)));
		
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
				this.superArgs = [message || "Operation canceled.", params];
			}, /*! REPLACE_BY(TO_SOURCE(UUID('CanceledError')), true) */ null /*! END_REPLACE() */)));
		
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
				this.superArgs = [message || "Access denied.", params];
			}, /*! REPLACE_BY(TO_SOURCE(UUID('AccessDenied')), true) */ null /*! END_REPLACE() */)));
		
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
				this._this.bubble = true;
				this.superArgs = [message || "Script interrupted.", params];
			}, /*! REPLACE_BY(TO_SOURCE(UUID('ScriptInterruptedError')), true) */ null /*! END_REPLACE() */)));
		
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
					description: "Signals that the script has been aborted. Every \"try...catch\" statements must unconditionally re-throw this error.",
			}
			//! END_REPLACE()
			, types.createErrorType("ScriptAbortedError", types.ScriptInterruptedError, function _new(/*optional*/exitCode, /*optional*/message, /*optional*/params) {
				this._this.exitCode = types.toInteger(exitCode) || 0;
				this._this.critical = true;
				this.superArgs = [message || "Script aborted.", params];
			}, /*! REPLACE_BY(TO_SOURCE(UUID('ScriptAbortedError')), true) */ null /*! END_REPLACE() */)));
				
		//===================================
		// Box/Unbox
		//===================================
		
		_shared.OriginalValueSymbol =  types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_ORIGINAL_VALUE')), true) */ '__DD_ORIGINAL_VALUE' /*! END_REPLACE() */, true);
		
		__Internal__.ADD('box', __Internal__.DD_DOC(
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
					if (types._instanceof(value, types.box)) {
						value.setAttributes(this);
						value = value[_shared.OriginalValueSymbol];
					};
					this[_shared.OriginalValueSymbol] = value;
					return this;
				} else {
					return new types.box(value);
				};
			}));

		types.extend(types.box.prototype, {
			setAttributes: function setAttributes(dest, /*optional*/override) {
				const keys = types.append(types.keys(this), types.symbols(this));
				for (let i = 0; i < keys.length; i++) {
					const key = keys[i];
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
				const type = this.constructor;
				const newBox = new type(value);
				return this.setAttributes(newBox, override);
			},
			clone: function clone() {
				return this.setValue(this[_shared.OriginalValueSymbol]);
			},
		});
			
		__Internal__.ADD('unbox', __Internal__.DD_DOC(
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
				return (types._instanceof(value, types.box) ? value.valueOf() : value);
			}));
					

		//===================================
		// Reserved attributes
		//===================================
		
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
			$TYPE_UUID: null,
		});

		if (_shared.Natives.symbolToStringTag) {
			_shared.reservedAttributes[_shared.Natives.symbolToStringTag] = null;
		};

		//===================================
		// DD_DOC
		//===================================
		
		__Internal__.symbolDD_DOC = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_DOCUMENTATION')), true) */ '__DD_DOC' /*! END_REPLACE() */, true);

		_shared.reservedAttributes[__Internal__.symbolDD_DOC] = null;
		
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
						value: doc && types.freezeObject(doc),
					});
				} else {
					value[__Internal__.symbolDD_DOC] = doc && types.freezeObject(doc);
				};
				return value;
			});

		__Internal__.GET_DD_DOC = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
					author: "Claude Petit",
					revision: 1,
					params: null,
					returns: 'object',
					description: "Gets the document applied to an object.",
			}
			//! END_REPLACE()
			, function GET_DD_DOC(value) {
				return value[__Internal__.symbolDD_DOC];
			});
		
		(function() {
			for (let i = 0; i < __Internal__.tempDocs.length; i++) {
				__Internal__.DD_DOC.apply(null, __Internal__.tempDocs[i]);
			};
			delete __Internal__.tempDocs;
		})();

		//===================================
		// Clone
		//===================================
		
		_shared.isClonable = function isClonable(obj, /*optional*/cloneFunctions) {
			// NOTE: This function will get overriden when "Doodad.js" is loaded.
			return (!types.isString(obj) && types.isArrayLike(obj)) || types.isObject(obj) || (!!cloneFunctions && types.isCustomFunction(val));
		};

		_shared.clone = function clone(obj, /*optional*/depth, /*optional*/cloneFunctions, /*optional*/keepUnlocked, /*options*/keepNonClonables) {
			// NOTE: This function will get overriden when "Doodad.js" is loaded.
			let result;

			if (types.isNothing(obj)) {
				result = obj;
			} else {
				const isArray = !types.isString(obj) && types.isArrayLike(obj);
				depth = (+depth || 0) - 1;  // null|undefined|true|false|NaN|Infinity
				cloneFunctions = (+cloneFunctions || 0) - 1;  // null|undefined|true|false|NaN|Infinity
							
				if (isArray) {
					obj = _shared.Natives.windowObject(obj);
					if (depth >= 0) {
						result = new _shared.Natives.windowArray(obj.length);
						const len = obj.length;
						for (let key = 0; key < len; key++) {
							if (types.has(obj, key)) {
								result[key] = _shared.clone(obj[key], depth, cloneFunctions, keepUnlocked, keepNonClonables);
							};
						};
					} else {
						result = _shared.Natives.arraySliceCall(obj, 0);
					};
				} else if ((cloneFunctions >= 0) && types.isCustomFunction(obj)) {
					result = types.eval(_shared.Natives.functionToStringCall(obj));
				} else if (types.isObject(obj)) {
					result = types.createObject(types.getPrototypeOf(obj));
				} else if (keepNonClonables) {
					return obj;
				} else {
					throw new types.Error("Object is not clonable.");
				};

				// Copy properties
				const keys = types.append(types.allKeys(obj), types.allSymbols(obj)),
					arrayLen = isArray && obj.length,
					props = {};
				for (let i = 0; i < keys.length; i++) {
					const key = keys[i];
					if (isArray) {
						if (key === 'length') {
							continue;
						};
						const tmp = _shared.Natives.windowNumber(key);
						if ((tmp >= 0) && (tmp < arrayLen)) {
							continue;
						};
					};
					let prop = types.getOwnPropertyDescriptor(result, key);
					if (!prop || prop.configurable) {
						prop = types.getOwnPropertyDescriptor(obj, key);
						if (types.has(prop, 'value') && (depth >= 0)) {
							prop.value = _shared.clone(prop.value, depth, cloneFunctions, keepUnlocked, keepNonClonables);
						};
						props[key] = prop;
					};
				};
				types.defineProperties(result, props);

				if (!keepUnlocked) {
					if (types.isFrozen(obj)) {
						types.freezeObject(result);
					} else if (!types.isExtensible(obj)) {
						types.preventExtensions(result);
					};
				};
			};
						
			return result;
		};

		__Internal__.ADD('isClonable', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
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
				return _shared.isClonable(obj, cloneFunctions);
			}));
				
		__Internal__.ADD('clone', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 8,
						params: {
							obj: {
								type: 'any',
								optional: false,
								description: "A clonable value.",
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
							keepUnlocked: {
								type: 'bool',
								optional: true,
								description: "When 'true', the result will not get locked (frozen or not extensible) when the original object was. When 'false', the result will get locked as the original. Default is 'false'.",
							},
							keepNonClonables: {
								type: 'bool',
								optional: true,
								description: "When 'true', will keep non-clonable values instead of throwing. When 'false', will throw an error on a non-clonable value. Default is 'false'.",
							},
						},
						returns: 'any',
						description: "Clones a value.",
			}
			//! END_REPLACE()
			, function clone(obj, /*optional*/depth, /*optional*/cloneFunctions, /*optional*/keepUnlocked, /*optional*/keepNonClonables) {
				return _shared.clone(obj, depth, cloneFunctions, keepUnlocked, keepNonClonables);
			}));
				
		//===================================
		// Type
		//===================================
		
		_shared.SuperEnabledSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_SUPER_ENABLED')), true) */ '__DD_SUPER_ENABLED' /*! END_REPLACE() */, true);
		_shared.EnumerableSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_ENUMERABLE')), true) */ '__DD_ENUMERABLE' /*! END_REPLACE() */, true);
		_shared.ReadOnlySymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_READ_ONLY')), true) */ '__DD_READ_ONLY' /*! END_REPLACE() */, true);
		_shared.ConfigurableSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_CONFIGURABLE')), true) */ '__DD_CONFIGURABLE' /*! END_REPLACE() */, true);
		__Internal__.symbolGetter = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_GETTER')), true) */ '__DD_GETTER' /*! END_REPLACE() */, true);
		__Internal__.symbolSetter = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_SETTER')), true) */ '__DD_SETTER' /*! END_REPLACE() */, true);
		
		__Internal__.ADD('INHERIT', __Internal__.DD_DOC(
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
				// let t1 = function(){};
				// let t2 = function(){};
				// t2.prototype = t1.prototype;
				// console.log(Object.prototype.isPrototypeOf.call(t1.prototype, t2.prototype));
				// >>> false   // BAD
				// t1 = function(){};
				// t2 = function(){};
				// t2.prototype = Object.setPrototypeOf(t2.prototype, t1.prototype);
				// console.log(Object.prototype.isPrototypeOf.call(t1.prototype, t2.prototype));
				// >>> true    // OK
				
				type = types.setPrototypeOf(type, base);

				type.prototype = types.createObject(base.prototype, {
					constructor: {
						value: type,
					},
				});

				const values = {
					apply: type.apply,
					call: type.call,
					bind: type.bind,
				};
				_shared.setAttributes(type, values, {});

				return type;
			}));

		__Internal__.ADD('AttributeBox', __Internal__.DD_DOC(
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
					if (types._instanceof(value, types.box)) {
						value.setAttributes(this);
						value = value[_shared.OriginalValueSymbol];
					};
					this[_shared.OriginalValueSymbol] = value;
					return this;
				} else {
					return new types.AttributeBox(value);
				};
			})));
			//types.extend(types.AttributeBox.prototype, {
			//});
			
		__Internal__.emptyFunction = function empty() {};
		
		__Internal__.ADD('SUPER', __Internal__.DD_DOC(
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
			}));
		
		__Internal__.ADD('NOT_ENUMERABLE', __Internal__.DD_DOC(
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
			}));

		__Internal__.ADD('ENUMERABLE', __Internal__.DD_DOC(
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
			}));

		__Internal__.ADD('NOT_CONFIGURABLE', __Internal__.DD_DOC(
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
			}));

		__Internal__.ADD('CONFIGURABLE', __Internal__.DD_DOC(
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
			}));

		__Internal__.ADD('READ_ONLY', __Internal__.DD_DOC(
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
			}));

		__Internal__.ADD('WRITABLE', __Internal__.DD_DOC(
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
			}));

		__Internal__.ADD('GET_SET', __Internal__.DD_DOC(
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
			}));

		__Internal__.ADD('GET', __Internal__.DD_DOC(
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
			}));

		__Internal__.ADD('SET', __Internal__.DD_DOC(
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
			}));

		// <PRB> If "prototype" is not configurable, we can't set it to read-only
		__Internal__.prototypeIsConfigurable = false;
		(function() {
			const f = function() {};
			const desc = types.getOwnPropertyDescriptor(f, 'prototype');
			__Internal__.prototypeIsConfigurable = desc.configurable;
		})();
			
		_shared.reservedAttributes[__Internal__.symbolInitialized] = null;
		_shared.reservedAttributes[__Internal__.symbol$IsSingleton] = null;
		
		// <PRB> Proxy checks existence of the property in the target AFTER the handler instead of BEFORE. That prevents us to force non-configurable and non-writable on a NEW NON-EXISTING property with a different value.
		//       Error given is "TypeError: 'set' on proxy: trap returned truish for property 'doodad' which exists in the proxy target as a non-configurable and non-writable data property with a different value"
		/*
		_shared.proxyHasSetHandlerBug = false;
		(function() {
			if (types.hasProxies()) {
				const proxy = types.createProxy(types.createObject(null), {
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
				superFn = superFn || __Internal__.emptyFunction;
				let _caller = types.INHERIT(types.SUPER, function caller(/*paramarray*/) {
					const oldSuper = _shared.getAttribute(this, '_super');
					_shared.setAttribute(this, '_super', superFn);
					try {
						return fn.apply(this, arguments);
					} catch (ex) {
						throw ex;
					} finally {
						_shared.setAttribute(this, '_super', oldSuper);
					};
				});
				_shared.setAttribute(_caller, _shared.OriginalValueSymbol, fn, {});
				return _caller;
			});

		__Internal__.ADD('SINGLETON', __Internal__.DD_DOC(
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
					_shared.setAttribute(type, __Internal__.symbol$IsSingleton, true, {configurable: true});
				};
				
				return type;
			}));
		
		__Internal__.ADD('INIT', __Internal__.DD_DOC(
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
			}));
		
		// "types.DESTROY" Hook	
		_shared.DESTROY = function DESTROY(obj) {
			if (types.isInitialized(obj)) {
				_shared.invoke(obj, '_delete', null, _shared.SECRET);
			};
		};

		__Internal__.ADD('DESTROY', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							obj: {
								type: 'object,type',
								optional: false,
								description: "A Doodad object or type.",
							},
						},
						returns: 'undefined',
						description: "Destroys a Doodad object or type.",
			}
			//! END_REPLACE()
			, function DESTROY(obj) {
				_shared.DESTROY(obj);
			}));
			

		// "types.DESTROYED" Hook	
		_shared.DESTROYED = function DESTROYED(obj) {
			return types.isNothing(obj) || ( !!(types.isLike(obj, types.Type) && !types.get(obj, __Internal__.symbolInitialized)) );
		};

		__Internal__.ADD('DESTROYED', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							obj: {
								type: 'object,type',
								optional: false,
								description: "A Doodad object or type.",
							},
						},
						returns: 'bool',
						description: "Returns 'true' is object is destroyed. Otherwise, returns 'false'.",
			}
			//! END_REPLACE()
			, function DESTROYED(obj) {
				return _shared.DESTROYED(obj);
			}));
			

		__Internal__.ADD('isInitialized', function isInitialized(obj) {
			return !!(types.isLike(obj, types.Type) && types.get(obj, __Internal__.symbolInitialized));
		});
		
		__Internal__.applyProto = function applyProto(target, base, proto, preApply, skipExisting, skipConfigurables) {
			const forType = types.isType(target),
				keys = types.append(types.keys(proto), types.symbols(proto));

			for (let i = 0; i < keys.length; i++) {
				const key = keys[i];

				const hasKey = types.has(target, key);
				if (hasKey && skipExisting) {
					continue;
				};

				if ((key !== '__proto__') && !(key in _shared.reservedAttributes)) {
					const attr = types.AttributeBox(proto[key]),
						g = types.get(attr, __Internal__.symbolGetter),
						s = types.get(attr, __Internal__.symbolSetter);
					let value = attr,
						isFunction = false;

					if (!g && !s) {
						if (hasKey) {
							value = target[key];
						};
						value = types.unbox(value);
						isFunction = types.isJsFunction(value);
					};

					let cf = types.get(attr, _shared.ConfigurableSymbol);
					if (types.isNothing(cf)) {
						cf = !isFunction;
					};

					if (cf && skipConfigurables && !types.hasIn(target, key)) {
						continue;
					};

					const createSuper = (!hasKey && isFunction ? types.get(attr, _shared.SuperEnabledSymbol) : false);
					if (createSuper) {
						const _super = base && _shared.getAttribute(base, key);
						value = __Internal__.createCaller(key, value, _super);
					};

					if (isFunction) {
						_shared.setAttributes(value, {
							apply: value.apply,
							call: value.call,
							bind: value.bind,
						}, {ignoreWhenReadOnly: true});
					};

					if (preApply) {
						_shared.setAttribute(target, key, value, {all: true});

					} else {
						let enu = types.get(attr, _shared.EnumerableSymbol);
						if (types.isNothing(enu)) {
							enu = true;
						};

						if (g || s) {
							// TODO: SUPER
							types.defineProperty(target, key, {
								configurable: !!cf,
								enumerable: !!enu,
								get: g || undefined,
								set: s || undefined,
							});
						} else {
							let ro = types.get(attr, _shared.ReadOnlySymbol);
							if (types.isNothing(ro)) {
								ro = isFunction;
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

		__Internal__.ADD('createType', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 10,
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
							uuid: {
								type: 'string',
								optional: true,
								description: "UUID of the new type.",
							},
						},
						returns: 'type',
						description: "Creates and returns a new Doodad type. N.B.: You should always use methods '$inherit' and '$extend' instead of this function.",
			}
			//! END_REPLACE()
			, function createType(/*optional*/name, /*optional*/base, /*optional*/constructor, /*optional*/typeProto, /*optional*/instanceProto, /*optional*/constructorContext, /*optional*/uuid) {
				if (types.isNothing(name)) {
					name = '';
				};

				name = _shared.Natives.stringReplaceCall(name, /[^a-zA-Z0-9$_]/g, "_");
				
				const baseIsType = types.isType(base);
				if (baseIsType) {
					if (!types.get(base, __Internal__.symbolInitialized)) {
						throw new _shared.Natives.windowError("Base type '" + (types.getTypeName(base) || types.getFunctionName(base)) + "' is not initialized.");
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
				const expr = "function " + name + "(/*paramarray*/) {" + 
					//"if (ctx.types.get(this, ctx.__Internal__.symbolInitialized)) {" +
					//	"throw new ctx.types.Error('Object is already initialized.');" +
					//"};" +

					"const forType = ctx.types.isFunction(this);" +

					"if (forType) {" +
						"if ((this !== ctx.type) && (!ctx.types.baseof(ctx.type, this))) {" +
							"throw new ctx.types.Error('Wrong constructor.');" +
						"};" +
					"} else {" +
						"if (!ctx.types.get(ctx.type, ctx.__Internal__.symbolInitialized)) {" +
							"throw new ctx.types.Error(\"Type '\" + ctx.types.getTypeName(ctx.type) + \"' is not initialized.\");" +
						"};" +
						"if (!(this instanceof ctx.type)) {" +
							"throw new ctx.types.Error('Wrong constructor. Did you forget the \\'new\\' operator ?');" +
						"};" +
					"};" +

					(!__Internal__.prototypeIsConfigurable ?
						// <PRB> "prototype" is not configurable, so we can't set it to read-only
						"if (!forType) {" +
							"if (ctx.type.prototype !== ctx.proto) {" +
								// Something has changed the prototype. Set it back to original and recreate the object.
								"ctx.type.prototype = ctx.proto;" +
								"return ctx.types.newInstance(ctx.type, arguments);" +
							"};" +
						"};"
					:
						""
					) +

					"let " + (typeProto ? "skipConfigurables = true," : "") +
						"obj;" +
					"if (ctx.types.get(this, ctx.__Internal__.symbolInitialized)) {" +
						"obj = this;" +
					"} else {" +
						"if (!forType) {" +
							"if (ctx.types.get(ctx.type, ctx.__Internal__.symbolSingleton)) {" +
								"throw new ctx.types.Error('Singleton object has already been created.');" +
							"};" +

							"ctx._shared.setAttribute(this, 'constructor', ctx.type, {ignoreWhenSame: true});" +

							(_shared.Natives.symbolToStringTag ?
								// Have to make sure that 'types.isObject' will always return 'true' for Doodad objects.
								"ctx._shared.setAttribute(this, ctx._shared.Natives.symbolToStringTag, 'Object', {});"
							:
								""
							) +
						"};" +

						// <PRB> Symbol.hasInstance: We force default behavior of "instanceof" by setting Symbol.hasInstance to 'undefined'.
						(_shared.Natives.symbolHasInstance ? 
							"ctx._shared.setAttribute(this, ctx._shared.Natives.symbolHasInstance, undefined, {});" 
						: 
							""
						) +

						"ctx._shared.setAttribute(this, ctx.__Internal__.symbolInitialized, true, {configurable: true});" +
						"obj = ctx.constructor.apply(this, arguments) || this;" + // _new
						(typeProto ? 
							"skipConfigurables = false;" 
						: 
							""
						) +

						"const isSingleton = !!ctx.type[ctx.__Internal__.symbol$IsSingleton];" +
						"ctx._shared.setAttribute(obj, ctx.__Internal__.symbol$IsSingleton, isSingleton, {});" +
						"if (isSingleton) {" +
							"if (!forType) {" +
								"ctx._shared.setAttribute(ctx.type, ctx.__Internal__.symbolSingleton, obj, {});" +
							"};" +
						"} else {" +
							"ctx._shared.setAttribute(obj, ctx.__Internal__.symbolSingleton, null, {});" +
						"};" +
					"};" +

					(typeProto ?
						"if (forType) {" +
							"ctx.__Internal__.applyProto(obj, ctx.base, ctx.typeProto, false, true, skipConfigurables);" +
						"};"
					: 
						""
					) +

					(instanceProto && types.hasDefinePropertyEnabled() ?
						"if (!forType) {" +
							"ctx.__Internal__.applyProto(obj, ctx.instanceBase, ctx.instanceProto, false, true, true);" +
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
						"if ((obj !== this) && !ctx.types.get(obj, ctx.__Internal__.symbolInitialized)) {" +
							"ctx._shared.setAttribute(obj, ctx.__Internal__.symbolInitialized, true, {configurable: true});" +
						"};"
					) +

					"return obj;" +
				"}";
				
				const ctx = types.nullObject({
					base: base,
					constructor: constructor,
					typeProto: typeProto, 
					instanceProto: instanceProto,
					instanceBase: (base ? base.prototype : null),
					type: null, // will be set after type creation
					proto: null, // will be set after type creation
					_shared: _shared,
					__Internal__: __Internal__,
					types: types,
				});

				let type = types.eval(expr, ctx);
				
				// Inherit base
				let proto;
				if (base) {
					type = types.INHERIT(base, type);
					proto = type.prototype;
				} else {
					proto = type.prototype;
					const values = {
						call: type.call,
						apply: type.apply,
						bind: type.bind,
					};
					_shared.setAttributes(type, values, {});
					_shared.setAttribute(proto, 'constructor', type, {});
				};
			
				ctx.type = type;
				ctx.proto = proto;
			
				_shared.setAttribute(type, '$TYPE_NAME', name, {});
				_shared.setAttribute(type, __Internal__.symbolIsType, true, {});

				uuid = (uuid ? /*! REPLACE_BY(TO_SOURCE(UUID('DD_TYPE')), true) */ '__DD_TYPE__' /*! END_REPLACE() */ + '-' + uuid : null);
				_shared.setAttribute(type, __Internal__.symbolTypeUUID, uuid, {});
				_shared.setAttribute(proto, __Internal__.symbolTypeUUID, uuid, {});
	
				if (typeProto) {
					__Internal__.applyProto(type, base, typeProto, true, false, false);
				};

				if (instanceProto) {
					__Internal__.applyProto(proto, ctx.instanceBase, instanceProto, false, false, false);
				};

				// Return type
				return type;
			}));
		

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
				const base = ((this === global) ? undefined: this);
				
				let name = null,
					uuid = null;

				if (typeProto) {
					name = types.unbox(types.get(typeProto, '$TYPE_NAME'));
					uuid = types.unbox(types.get(typeProto, '$TYPE_UUID'));
					delete typeProto.$TYPE_NAME;
					delete typeProto.$TYPE_UUID;
					name = !types.isNothing(name) && types.toString(name) || '';
					uuid = !types.isNothing(uuid) && types.toString(uuid) || '';
				};
	
				const type = types.createType(
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
						constructorContext,

						/*uuid*/
						uuid
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
		
		__Internal__.typeDelete = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 2,
						params: null,
						returns: 'undefined',
						description: "Object or type destructor.",
			}
			//! END_REPLACE()
			, function _delete() {
				if (this[__Internal__.symbolInitialized]) {
					_shared.setAttribute(this, __Internal__.symbolInitialized, false, {});
				} else if (__options__.debug) {
					// Object already deleted, should not happens.
					debugger;
				};
			});
		
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
					const name = types.getTypeName(this);
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
			$TYPE_UUID:  '' /*! INJECT('+' + TO_SOURCE(UUID('Type')), true) */,

			_super: null,
			
			$inherit: __Internal__.typeInherit,
			
			_new: types.NOT_CONFIGURABLE(types.READ_ONLY(null)), //__Internal__.typeNew,
			_delete: types.NOT_CONFIGURABLE(types.READ_ONLY(__Internal__.typeDelete)),
			
			toString: types.SUPER(__Internal__.typeToString),
			toLocaleString: types.SUPER(__Internal__.typeToLocaleString),
		};

		 __Internal__.typeTypeProto[__Internal__.symbol$IsSingleton] = types.READ_ONLY(false),
		 __Internal__.typeTypeProto[__Internal__.symbolSingleton] = types.READ_ONLY(null),

		__Internal__.typeInstanceProto = {
			_super: null,
			
			_new: types.NOT_CONFIGURABLE(types.READ_ONLY(null)), //__Internal__.typeNew,
			_delete: types.NOT_CONFIGURABLE(types.READ_ONLY(__Internal__.typeDelete)),
			
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
					$TYPE_UUID:  '' /*! INJECT('+' + TO_SOURCE(UUID('CustomEvent')), true) */,
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
						init = types.nullObject(init);
						_shared.setAttributes(this, {
							type: type,
							// NOTE: Event targets are responsible to bubble events to their parent when "bubbling" is true.
							bubbles: !!init.bubbles,
							cancelable: !!init.cancelable,
							detail: init.detail,
						});
						this.bubbling = this.bubbles;
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
		
		__Internal__.symbolEventListeners = types.getSymbol('__EVENT_LISTENERS__');
		
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
					$TYPE_UUID:  '' /*! INJECT('+' + TO_SOURCE(UUID('CustomEventTarget')), true) */,
				},
				/*instanceProto*/
				{
					_new: types.SUPER(function _new() {
						this._super();
						_shared.setAttribute(this, __Internal__.symbolEventListeners, types.nullObject(), {configurable: true});
					}),

					_delete: types.SUPER(function _delete() {
						delete this[__Internal__.symbolEventListeners];
						this._super();
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
							
							let listeners = this[__Internal__.symbolEventListeners][type];
							if (!types.isArray(listeners)) {
								this[__Internal__.symbolEventListeners][type] = listeners = [];
							};
							let found = false;
							for (let i = 0; i < listeners.length; i++) {
								const value = listeners[i];
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
								const listeners = this[__Internal__.symbolEventListeners][type];
								if (types.isArray(listeners)) {
									if (types.isNothing(useCapture)) {
										for (let i = listeners.length - 1; i >= 0; i--) {
											const value = listeners[i];
											if (!handler || (value[0] === handler)) {
												listeners.splice(i, 1);
											};
										};
									} else {
										useCapture = !!useCapture;
										for (let i = listeners.length - 1; i >= 0; i--) {
											const value = listeners[i];
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
											revision: 1,
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
							let type = event.type.toLowerCase();
							
							let res = true;
							
							if (!event.stopped) {
								var	listeners;
								if (type in this[__Internal__.symbolEventListeners]) {
									listeners = this[__Internal__.symbolEventListeners][type];
									if (listeners.__locked) {
										return res;
										//throw new types.Error("Listeners locked for event '~0~'.", [type]);
									};
								} else {
									this[__Internal__.symbolEventListeners][type] = listeners = [];
								};
								
								try {
									listeners.__locked = true;  // prevents infinite loop
									
									const ar = types.clone(listeners),
										arLen = ar.length;
									for (let i = 0; i < arLen; i++) {
										const listener = ar[i];
										const retval = listener[0].call(this, event);
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
										const fn = this[type];
										if (types.isFunction(fn)) {
											const retval = fn.call(this, event);
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
											revision: 1,
											params: null,
											returns: 'undefined',
											description: "Removes every event listeners.",
								}
								//! END_REPLACE()
						, function clearListeners() {
							_shared.setAttribute(this, __Internal__.symbolEventListeners, types.nullObject());
						}),
				}
			)));
		
		//===================================
		// Namespace
		//===================================
		
		_shared.ADD = function ADD(name, obj, /*optional*/protect, /*optional*/args) {
				// NOTE: "name" is a String or a Symbol.
				// NOTE: "obj" is a Doodad Type, a Doodad Error Type, or any object.
				if (types.isNothing(protect)) {
					protect = true;
				};

				if (types.isObjectLike(obj) && types.isString(name) && !types.has(obj, 'DD_FULL_NAME') && types.isExtensible(obj)) {
					_shared.setAttributes(obj, {
						DD_PARENT: this,
						DD_NAME: name,
						DD_FULL_NAME: (this.DD_FULL_NAME + '.' + name),
					}, {});
				};

				if (types.isType(obj) && !types.isInitialized(obj)) {
					obj = types.INIT(obj, args);
				};

				if (protect && types.isFunction(obj)) {
					const values = {
						apply: obj.apply,
						call: obj.call,
						bind: obj.bind,
					};
					_shared.setAttributes(obj, values, {ignoreWhenReadOnly: true});
				};

				_shared.setAttribute(this, name, obj, {
					configurable: !protect,
					enumerable: true,
					writable: !protect,
					ignoreWhenSame: true,
				});

				return obj;
			};
				
		_shared.REMOVE = function REMOVE(name) {
				delete this[name];
			};
				
		// Temporary, and not for registering classes.
		__Internal__.tempRegisteredOthers = [];
		__Internal__.registerOthers = _shared.REGISTER = function REGISTER(type, args, protect) {
				// NOTE: "type" is a Doodad Type, or a Doodad Error Type.
				const name = (types.getTypeName(type) || types.getFunctionName(type) || null),
					fullName = (name ? this.DD_FULL_NAME + '.' + name : null);

				if (!types.has(type, 'DD_FULL_NAME') && types.isExtensible(type)) {
					_shared.setAttributes(type, {
						DD_PARENT: this,
						DD_NAME: name,
						DD_FULL_NAME: fullName,
					}, {});
				};

				if (!types.isErrorType(type) && !types.isInitialized(type)) {
					type = types.INIT(type, args);
				};

				// NOTE: Will get protected when the real REGISTER will get called.
				_shared.setAttribute(this, name, type, {
					configurable: true,
				});

				__Internal__.tempRegisteredOthers.push([this, [type, args, protect]]);
			};
	
		// NOTE: Will get overriden by Doodad.js
		_shared.UNREGISTER = function(type) {
				throw new types.NotSupported("Module 'Doodad.js' is not loaded.");
			};

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
					$TYPE_UUID:  '' /*! INJECT('+' + TO_SOURCE(UUID('Namespace')), true) */,
				},
				/*instanceProto*/
				{
					DD_PARENT: types.READ_ONLY(null),
					DD_NAME: types.READ_ONLY(null),
					DD_FULL_NAME: types.READ_ONLY(null),

					ADD:  __Internal__.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 1,
								params: {
									name: {
										type: 'string',
										optional: false,
										description: "Name of the object.",
									}, 
									obj: {
										type: 'object,Type',
										optional: false,
										description: "Object to add.",
									}, 
									protect: {
										type: 'bool',
										optional: true,
										description: "'true' will protect the object. 'false' will not. Default is 'true'."
									},
									args: {
										type: 'arrayof(any)',
										optional: true,
										description: "Arguments of the constructor.",
									}, 
								},
								returns: 'object',
								description: "Adds the specified object to the current namespace object and returns that object. Also intialize if 'obj' is a Type.",
					}
					//! END_REPLACE()
					, function ADD(name, obj, /*optional*/protect, /*optional*/args) {
						return _shared.ADD.call(this, name, obj, protect, args);
					}),
					
					REMOVE: __Internal__.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									name: {
										type: 'string',
										optional: false,
										description: "Name of the object.",
									}, 
								},
								returns: 'undefined',
								description: "Removes the object from the current namespace object.",
					}
					//! END_REPLACE()
					, function REMOVE(name) {
						return _shared.REMOVE.apply(this, arguments);
					}),
					
					REGISTER: function REGISTER(/*<<< optional*/protect, /*optional*/args, type) {
						if (arguments.length < 2) {
							type = protect;
							protect = true;
						} else if (arguments.length < 3) {
							type = args;
							args = protect;
							protect = true;
						};
						return _shared.REGISTER.call(this, type, args, protect);
					},
					
					UNREGISTER: function UNREGISTER(type) {
						return _shared.UNREGISTER.apply(this, arguments);
					},
					
					_new: types.SUPER(function _new(/*optional*/parent, /*optional*/name, /*optional*/fullName) {
						this._super();
						
						_shared.setAttributes(this, {
							DD_PARENT: parent,
							DD_NAME: name,
							DD_FULL_NAME: fullName,
						});
					}),
				}
			));

		_shared.setAttribute(types.Namespace, __Internal__.symbolInitialized, true, {all: true});
		__Internal__.ADD('Namespace', types.Namespace);

		//===================================
		// Root
		//===================================

		//! IF_UNSET("serverSide")
			if ((typeof DD_MODULES === 'object') && (DD_MODULES !== null)) {
				modules = types.extend({}, DD_MODULES, modules);
			};
		//! END_IF()

		const root = types.INIT(__Internal__.DD_DOC(
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
					$TYPE_UUID:  '' /*! INJECT('+' + TO_SOURCE(UUID('RootNamespace')), true) */,
				},
				/*instanceProto*/
				{
					Namespace: types.NOT_CONFIGURABLE(types.READ_ONLY(  types.Namespace  )),

					createRoot: exports.createRoot,
					DD_DOC: __Internal__.DD_DOC,
					GET_DD_DOC: __Internal__.GET_DD_DOC,
					
					_new: types.SUPER(function _new(/*optional*/modules, /*optional*/options) {
						this._super(null, 'Root', 'Root');

						options = types.nullObject(options);
						
						const root = this;

						// Prebuild "Doodad", "Doodad.Types" and "Doodad.Tools"
						// NOTE: 'Doodad' is the parent of 'Types', 'Tools' and 'Namespaces', but it depends on them. I should have put these namespaces at Root, but it's too late now.
						root.Doodad = new types.Namespace(root, 'Doodad', 'Doodad');
						root.Doodad.Tools = new types.Namespace(root.Doodad, 'Tools', 'Doodad.Tools');

						// NOTE: "types" replaces "toString". It's too late to rename it.
						const __typesTmp = types.INIT(types.Namespace.$inherit({
								$TYPE_NAME: '__TypesNamespace',
							},
							{
								toString: types.CONFIGURABLE(null),  // Will get set later by "tempTypesAdded"
							}));
						root.Doodad.Types = new __typesTmp(root.Doodad, 'Types', 'Doodad.Types');

						for (let i = 0; i < __Internal__.tempTypesAdded.length; i++) {
							const type = __Internal__.tempTypesAdded[i],
								name = type[0],
								obj = type[1];
							root.Doodad.Types.ADD(name, obj);
						};
						for (let i = 0; i < __Internal__.tempTypesRegistered.length; i++) {
							const type = __Internal__.tempTypesRegistered[i];
							// Temporary... will get registered later.
							root.Doodad.Types.ADD(types.getTypeName(type) || types.getFunctionName(type), type, false);
						};
						for (let i = 0; i < __Internal__.tempToolsAdded.length; i++) {
							const tool = __Internal__.tempToolsAdded[i],
								name = tool[0],
								obj = tool[1];
							root.Doodad.Tools.ADD(name, obj);
						};
						delete __Internal__.tempTypesAdded;
						delete __Internal__.tempToolsAdded;
						delete __Internal__.ADD;
						delete __Internal__.REGISTER;
						delete __Internal__.ADD_TOOL;

						const nsObjs = types.nullObject({
							'Doodad': root.Doodad,
							'Doodad.Types': root.Doodad.Types,
							'Doodad.Tools': root.Doodad.Tools,
						});

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

						if (!modules) {
							modules = {};
						};

						let MODULE_VERSION;
						//! INJECT("MODULE_VERSION = " + TO_SOURCE(VERSION('doodad-js')) + ";")

						modules['doodad-js'] = {
							type: 'Package',
							version: MODULE_VERSION,
							bootstrap: true,
						};
						
						const names = types.keys(modules),
							inits = types.nullObject();

						let namespaces = null,
							entries = null,
							name;
							
						whileName: while (name = names.shift()) {
							const spec = modules[name];
							spec.name = name;
							if (spec.bootstrap) {
								const deps = (types.get(spec, 'dependencies') || []);
								for (let i = 0; i < deps.length; i++) {
									if (types.has(deps, i)) {
										let dep = deps[i],
											optional = false;
										if (types.isObject(dep)) {
											optional = dep.optional;
											dep = dep.name;
										};
										let loading = (dep in inits);
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
								
								const baseName = name.split('/', 2)[0],
									shortNames = baseName.split('.'),
									proto = types.get(spec, 'proto');

								let nsObj = null,
									parent = root,
									fullName = '';
									
								for (let k = 0; k < shortNames.length; k++) {
									const shortName = shortNames[k];
									fullName += '.' + shortName;
									const fn = fullName.slice(1);
									const prevNsObj = types.get(parent, shortName);
									if ((k === (shortNames.length - 1)) && (proto || (prevNsObj && !(prevNsObj instanceof types.Namespace)))) {
										let nsType = types.getType(prevNsObj) || types.Namespace;
										if (proto) {
											let args = proto;
											// Extend namespace object
											if (types.isFunction(args)) {
												args = args(root);
											};
											if (!types.isArray(args)) {
												args = [
													/*typeProto*/
													{
														$TYPE_NAME: types.getTypeName(nsType),
													},
													/*instanceProto*/
													args
												];
											};
											nsType = types.INIT(nsType.$inherit.apply(nsType, args));
										};
										nsObj = new nsType(parent, shortName, fn);
									} else if (!prevNsObj) {
										nsObj = new types.Namespace(parent, shortName, fn);
									} else {
										nsObj = prevNsObj;
									};
									nsObjs[fn] = nsObj;
									if ((parent !== root) || (!entries && (spec.type !== 'Package')) || (entries && !(entries[spec.type || 'Module'] instanceof entries.Package))) {
										parent[shortName] = nsObj;
									};
									parent = nsObj;
								};
								
								nsObjs[name] = nsObj;

								const nsList = (types.get(spec, 'namespaces') || []);
								for (let j = 0; j < nsList.length; j++) {
									if (types.has(nsList, j)) {
										const shortNames = nsList[j].split('.');
										let name = '.' + baseName;
										for (let k = 0; k < shortNames.length; k++) {
											const shortName = shortNames[k];
											name += '.' + shortName;
											const fn = name.slice(1);
											if (!(fn in nsObjs)) {
												nsObjs[fn] = parent[shortName] = new types.Namespace(parent, shortName, fn);
											};
											parent = parent[shortName];
										};
										parent = nsObj;
									};
								};

								const opts = options[name];
								const create = types.get(spec, 'create');
								inits[name] = create && create(root, opts, _shared);

								if (!namespaces && (name === 'Doodad.Namespaces')) {
									namespaces = nsObj;
									entries = namespaces.Entries;
								};
							};
						};

						const initsNames = types.keys(inits),
							nsOptions = {secret: _shared.SECRET};

						for (let i = 0; i < initsNames.length; i++) {
							const name = initsNames[i];
							const spec = modules[name];
							const baseName = name.split('/', 2)[0];
							const entryType = entries[spec.type || 'Module'];
							const entry = new entryType(root, spec, nsObjs[name]);
							const opts = options[baseName];
							entry.objectCreated = true;
							entry.objectInit = inits[name];
							entry.objectInit && entry.objectInit(opts)
							entry.init(opts);
							namespaces.add(name, entry, nsOptions);
							delete nsObjs[name];
						};
						
						const nsNames = types.keys(nsObjs);
						for (let i = 0; i < nsNames.length; i++) {
							const name = nsNames[i];
							const namespace = nsObjs[name];
							const baseName = name.split('/', 2)[0];
							const entry = new entries.Namespace(root, null, namespace);
							const opts = options[baseName];
							entry.init(opts);
							namespaces.add(name, entry, nsOptions);
						};
						
						delete types.Namespace[__Internal__.symbolInitialized];
						_shared.REGISTER.call(root.Doodad.Types, types.Namespace, null, true);

						for (let i = 0; i < __Internal__.tempTypesRegistered.length; i++) {
							const type = __Internal__.tempTypesRegistered[i];
							_shared.REGISTER.call(root.Doodad.Types, type, null, true);
						};
						delete __Internal__.tempTypesRegistered;

						if (_shared.REGISTER !== __Internal__.registerOthers) { 
							for (let i = 0; i < __Internal__.tempRegisteredOthers.length; i++) {
								const type = __Internal__.tempRegisteredOthers[i],
									namespace = type[0],
									args = type[1];
								_shared.REGISTER.apply(namespace, args);
							};
						} else {
							// "_shared.REGISTER" should have been replaced by "Doodad.js" !!!
							debugger;
						};
						delete __Internal__.registerOthers;
						delete __Internal__.tempRegisteredOthers;
					}),
					
					//! BEGIN_REMOVE()
						serverSide: types.NOT_CONFIGURABLE(types.READ_ONLY((typeof process === 'object') && (process !== null) && !process.browser && (typeof module === 'object') && (module !== null))),
					//! END_REMOVE()
					//! IF(IS_SET("serverSide") && !IS_SET("browserify"))
					//!		INJECT("serverSide: types.NOT_CONFIGURABLE(types.READ_ONLY(true)),")
					//! ELSE()
					//!		INJECT("serverSide: types.NOT_CONFIGURABLE(types.READ_ONLY(false)),")
					//! END_IF()

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
								__Internal__.DD_ASSERT = __Internal__.ASSERT;
							} else {
								const root = this;
								root.DD_ASSERT = __Internal__.ASSERT;
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
								const root = this;
								root.DD_ASSERT = null;
							};
						}),
						
					getOptions: function() {
						return __options__;
					},
				}
			))), [modules, _options]);

		_shared.REGISTER.call(root.Doodad.Types, types.getType(root), null, true);

		return root.Doodad.Namespaces.load(modules, _options, startup)
			.catch(root.Doodad.Tools.catchAndExit);
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
	// getEvals
	(function(eval) {
		// WARNING: It is NOT to be used with arbitrary expressions.
		// WARNING: Do not declare any variable and parameter inside these functions.
		return {
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
	})
);