//! REPLACE_BY("// Copyright 2016 Claude Petit, licensed under Apache License version 2.0\n")
// dOOdad - Object-oriented programming framework
// File: Bootstrap.js - Bootstrap module
// Project home: https://sourceforge.net/projects/doodad-js/
// Trunk: svn checkout svn://svn.code.sf.net/p/doodad-js/code/trunk doodad-js-code
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
	if (typeof process === 'object') {
		module.exports = exports;
	};

	var MODULE_NAME = 'doodad-js';
	var MODULE_VERSION = '2.2.0r';

	// V8: Increment maximum number of stack frames
	// Source: https://code.google.com/p/v8-wiki/wiki/JavaScriptStackTraceApi
	if (Error.stackTraceLimit < 50) {
		Error.stackTraceLimit = 50;
	};
	
	var __bootstraps__ = {},
		__recordNewBootstraps__ = true;

	exports.createRoot = function createRoot(/*optional*/modules, /*optional*/_options) {
		var __Internal__ = {
			// "isNativeFunction", "isCustomFunction"
			hasIncompatibleFunctionToStringBug: false,
			
			// "createObject", "getPrototypeOf", "setPrototypeOf"
			hasProto: !!({}.__proto__),
		};

		var types = {
			},
			
			tools = {
			};
			
		//===================================
		// Native functions
		//===================================
		__Internal__.objectHasOwnProperty = Object.prototype.hasOwnProperty;
		__Internal__.functionToString = Function.prototype.toString;
			
		// <PRB> "function.prototype.toString called on incompatible object" raised with some functions (EventTarget, Node, HTMLElement, ...) ! Don't know how to test for compatibility.
		try {
			if (typeof global.Event === 'function') {
				__Internal__.functionToString.call(global.Event);
			};
		} catch(ex) {
			__Internal__.hasIncompatibleFunctionToStringBug = true;
		};
		
		types.isFunction = function isFunction(obj) {
				return (typeof obj === 'function');
			};
		
		types.isNativeFunction = function isNativeFunction(obj) {
				if (types.isFunction(obj)) {
					var str;
					if (__Internal__.hasIncompatibleFunctionToStringBug && __Internal__.objectHasOwnProperty.call(obj, 'toString') && types.isNativeFunction(obj.toString)) {
						str = obj.toString();
					} else {
						str = __Internal__.functionToString.call(obj);
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
			};
		
		types.isCustomFunction = function isCustomFunction(obj) {
				if (types.isFunction(obj)) {
					var str;
					if (__Internal__.hasIncompatibleFunctionToStringBug && types.hasKey(obj, 'toString') && types.isNativeFunction(obj.toString)) {
						str = obj.toString();
					} else {
						str = __Internal__.functionToString.call(obj);
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
			};
		
		types.getFunctionName = function getFunctionName(obj) {
				if (types.isFunction(obj)) {
					if ('name' in obj) {
						return obj.name;
					} else {
						// Internet Explorer
						if (__Internal__.hasIncompatibleFunctionToStringBug && types.hasKey(obj, 'toString') && types.isNativeFunction(obj.toString)) {
							str = obj.toString();
						} else {
							str = __Internal__.functionToString.call(obj);
						};
						str = str.match(/function\s+(\S*).*\(/);
						return str && str[1] || null;
					};
				} else {
					return null;
				};
			};
		
			
			
		var __Natives__ = {
			// "extend"
			objectAssign: (types.isNativeFunction(Object.assign) ? Object.assign : undefined),
			
			// "createObject"
			objectCreate: Object.create,
			
			// "hasDefinePropertyEnabled" and "defineProperty"
			objectDefineProperty: (types.isNativeFunction(Object.defineProperty) ? Object.defineProperty : undefined),
			
			// "defineProperties"
			objectDefineProperties: (types.isNativeFunction(Object.defineProperties) ? Object.defineProperties : undefined),
			
			// "getOwnPropertyNames"
			getOwnPropertyNames: (types.isNativeFunction(Object.getOwnPropertyNames) ? Object.getOwnPropertyNames : undefined),
			
			// "getOwnPropertyDescriptor"
			objectGetOwnPropertyDescriptor: (types.isNativeFunction(Object.getOwnPropertyDescriptor) ? Object.getOwnPropertyDescriptor : undefined),
			
			// "getPrototypeOf"
			objectGetPrototypeOf: (types.isNativeFunction(Object.getPrototypeOf) ? Object.getPrototypeOf : undefined),
			
			// "isPrototypeOf"
			objectIsPrototypeOf: (types.isNativeFunction(Object.prototype.isPrototypeOf) ? Object.prototype.isPrototypeOf : undefined),
			
			// "keys"
			objectKeys: (types.isNativeFunction(Object.keys) ? Object.keys : undefined),
			
			// "propertyIsEnumerable"
			objectPropertyIsEnumerable: (types.isNativeFunction(Object.prototype.propertyIsEnumerable) ? Object.prototype.propertyIsEnumerable : undefined),
			
			// "setPrototypeOf"
			objectSetPrototypeOf: (types.isNativeFunction(Object.setPrototypeOf) ? Object.setPrototypeOf : undefined),
			
			// "isNumber", "isDate", "isArray", "isObject", "isJsObject", "isCallable"
			objectToString: Object.prototype.toString,
			
			// "isArray"
			arrayIsArray: (global.Array && types.isNativeFunction(global.Array.isArray) ? Array.isArray : undefined),

			// "isArray"
			windowArray: (types.isNativeFunction(global.Array) ? global.Array : undefined),
			
			// "isBoolean"
			windowBoolean: (types.isNativeFunction(global.Boolean) ? global.Boolean : undefined),
			
			// "isDate"
			windowDate: (types.isNativeFunction(global.Date) ? global.Date : undefined),
			
			// "createErrorType", "isError"
			windowError: (global.Error || Error), // NOTE: "node.js" does not include "Error" in "global".

			// "isNumber"
			windowNumber: (types.isNativeFunction(global.Number) ? global.Number : undefined),
			
			// everywhere
			windowObject: global.Object,
			
			// "isString"
			windowString: (types.isNativeFunction(global.String) ? global.String : undefined),
			
			// "hasSymbols", "isSymbol"
			windowSymbol: (types.isNativeFunction(global.Symbol) ? global.Symbol : undefined),
			
			// "getSymbol", "DD_DOC", "DD_GET_DOC"
			windowSymbolFor: (types.isNativeFunction(global.Symbol) && types.isNativeFunction(global.Symbol['for']) ? global.Symbol['for'] : undefined),
			
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
		};
		
		//===================================
		// For old browsers
		//===================================
		
		if (!__Natives__.objectGetPrototypeOf || !__Natives__.objectSetPrototypeOf) {
			__Natives__.objectGetPrototypeOf = undefined;
			__Natives__.objectSetPrototypeOf = undefined;
			__Natives__.objectIsPrototypeOf = undefined;
		};
		
//IE8		//===================================
//IE8		// IE 8 Bug
//IE8		//===================================
//IE8		
//IE8		try {
//IE8			__Natives__.objectDefineProperty({}, 'test', {value: 1});
//IE8		} catch(ex) {
//IE8			__Natives__.objectDefineProperty = undefined;
//IE8			__Natives__.objectDefineProperties = undefined;
//IE8			__Natives__.objectGetOwnPropertyDescriptor = undefined;
//IE8		};

		//===================================
		// Symbols
		//===================================
		
		types.hasSymbols = (__Natives__.windowSymbol ? function hasSymbols() {
				return true;
			} : function hasSymbols() {
				return false;
			});
			
		types.isSymbol = (__Natives__.windowSymbol ? function isSymbol(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				return __Natives__.windowObject(obj) instanceof __Natives__.windowSymbol;
			} : function isSymbol(obj) {
				// "Symbol" not implemented.
				return false;
			});
			
		types.getSymbol = (__Natives__.windowSymbolFor ? function getSymbol(name) {
				return __Natives__.windowSymbolFor(name);
			} : function getSymbol(name) {
				// "Symbol" not implemented.
				return null;
			});
		

		//===================================
		// DD_DOC
		//===================================
		
		//! REPLACE_BY(";__Internal__.DD_DOC=function(d,v){return v;};")
		__Internal__.DD_DOC = (types.hasSymbols() ? function DD_DOC(doc, value) {
			value = Object(value);
			value[types.getSymbol('DD_DOC')] = doc;
			return value;
		} : (__Natives__.objectDefineProperty ? function DD_DOC(doc, value) {
			value = Object(value);
			__Natives__.objectDefineProperty(value, '__DD_DOC__', {
				configurable: true,
				enumerable: false,
				value: doc,
				writable: false,
			});
			return value;
		} : function DD_DOC(doc, value) {
			value = Object(value);
			value.__DD_DOC__ = doc;
			return value;
		}));
		//! END_REPLACE()

		__Internal__.DD_DOC = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
					author: "Claude Petit",
					revision: 0,
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
			, __Internal__.DD_DOC);
		
		__Internal__.DD_GET_DOC = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
					author: "Claude Petit",
					revision: 0,
					params: null,
					returns: 'object',
					description: "Get the document applied to an object.",
			}
			//! END_REPLACE()
			, (types.hasSymbols() ? function DD_GET_DOC(value) {
				value = Object(value);
				return value[types.getSymbol('DD_DOC')];
			} : function DD_GET_DOC(value) {
				value = Object(value);
				return value['__DD_DOC__'];
			}));
		
		
		types.isFunction = __Internal__.DD_DOC(
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
					description: "Returns 'true' if object is a function, 'false' otherwise.",
			}
			//! END_REPLACE()
			, types.isFunction);
		
		types.isNativeFunction =  __Internal__.DD_DOC(
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
					description: "Returns 'true' if object is a native function, 'false' otherwise.",
			}
			//! END_REPLACE()
			, types.isNativeFunction);
		
		types.isCustomFunction = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a custom function (non-native), 'false' otherwise.",
			}
			//! END_REPLACE()
			, types.isCustomFunction);
		
		types.getFunctionName = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
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
			, types.getFunctionName);
		
		types.hasSymbols = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'bool',
						description: "Returns 'true' if the engine has symbols. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, types.hasSymbols);
		
		types.isSymbol = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a Symbol. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, types.isSymbol);
		
		types.getSymbol = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							obj: {
								type: 'string',
								optional: true,
								description: "Symbol name.",
							},
						},
						returns: 'Symbol',
						description: "Returns a Symbol by its name.",
			}
			//! END_REPLACE()
			, types.getSymbol);
		
		//===================================
		// Eval
		//===================================
		
		// WARNING: It is for compatibility purpose only. It is NOT to be used with arbitrary expressions.
		__Internal__.evals = getEvals();
		
		types.eval = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
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
						description: "Evaluates an expression accross JS engines. NOT to be used with arbitrary expressions.",
			}
			//! END_REPLACE()
			, function _eval(expr, /*optional*/ctx) {
				if (ctx) {
					return __Internal__.evals.evalWithCtx(ctx, expr);
				} else {
					return __Internal__.evals.eval(expr);
				};
			});

		types.evalStrict = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
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
		
		tools.trim = __Internal__.DD_DOC(
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
					
				} else if (__Natives__.stringTrim && (chr === ' ') && !direction && (count === Infinity)) {
					return __Natives__.stringTrim.call(str);
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
		// Format functions
		//===================================
			
		tools.format = __Internal__.DD_DOC(
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
							result += params[key];
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
			//! REPLACE_BY("null")
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

		types.isNothing = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
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
		
		// <PRB> JS has no function to test for primitives
		types.isPrimitive = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
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
				// Source: http://cwestblog.com/2011/08/02/javascript-isprimitive-function/
				var type = (typeof obj);
				return (obj == null) || ((type !== "object") && (type !== "function"));
			});
		
		// <PRB> JS has no function to test for numbers
		types.isNumber = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a number (integer or float). Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (__Natives__.windowNumber ? (function isNumber(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				obj = __Natives__.windowObject(obj);
				if (obj instanceof __Natives__.windowNumber) {
					obj = obj.valueOf();
					return (obj === obj); // means "not NaN"
				} else {
					return false;
				};
			}) : (function isNumber(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				obj = __Natives__.windowObject(obj).valueOf();
				// Source: Jeremie Patonnier, MDN Documentation 
				return (+obj === obj);
			})));
		
		types.isInteger = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
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
						description: "Returns 'true' if object is an integer. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isInteger(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				obj = __Natives__.windowObject(obj);
				if (__Natives__.numberIsInteger) {
					// <PRB> "Number.isInteger(Object(1)) === false", but "Object(1) instanceof Number === true" !!!
					if (obj instanceof __Natives__.windowNumber) {
						return __Natives__.numberIsInteger(obj.valueOf());
					} else {
						return false;
					};
				} else {
					if (!types.isNumber(obj)) {
						return false;
					};
					obj = obj.valueOf();
					return (obj === (obj | 0));
				};
			});
		
		types.isFinite = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a finite number. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isFinite(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				obj = __Natives__.windowObject(obj);
				if (__Natives__.numberIsFinite) {
					// <PRB> "Number.isFinite(Object(1)) === false", but "Object(1) instanceof Number === true" !!!
					if (obj instanceof __Natives__.windowNumber) {
						return __Natives__.numberIsFinite(obj.valueOf());
					} else {
						return false;
					};
				} else {
					if (types.isDate(obj)) {
						return false;
					};
					obj = obj.valueOf();
					// Source: http://es6-features.org/#NumberTypeChecking
					return (typeof obj === "number") && (obj === obj) && (obj !== Infinity) && (obj !== -Infinity);
				};
			});
		
		types.isInfinite = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is an infinite number. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isInfinite(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				obj = __Natives__.windowObject(obj).valueOf();
				return (obj === Infinity) || (obj === -Infinity);
			});
		
		types.isFloat = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a float. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isFloat(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				obj = __Natives__.windowObject(obj);
				if (!types.isFinite(obj)) {
					return false;
				};
				obj = obj.valueOf();
				return (obj !== (obj | 0));
			}),
		
		// <PRB> JS has no function to test for booleans
		types.isBoolean = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a boolean. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (__Natives__.windowBoolean ? (function isBoolean(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				return (__Natives__.windowObject(obj) instanceof __Natives__.windowBoolean);
			}) : (function isBoolean(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				obj = __Natives__.windowObject(obj).valueOf();
				return ((obj === false) || (obj === true));
			})));
		
		// <PRB> JS has no function to test for strings
		types.isString = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a string. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (__Natives__.windowString ? (function isString(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				return (__Natives__.windowObject(obj) instanceof __Natives__.windowString);
			}) : (function isString(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				return (typeof __Natives__.windowObject(obj).valueOf() === 'string');
			})));
		
		// <PRB> JS has no function to test for dates
		types.isDate = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a date. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (__Natives__.windowDate ? (function isDate(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				return (__Natives__.windowObject(obj) instanceof __Natives__.windowDate);
			}) : (function isDate(obj) {
				return (__Natives__.objectToString.call(obj) === '[object Date]');
			})));
		
		types.isArray = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is an array. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (__Natives__.arrayIsArray || (__Natives__.windowArray ? (function isArray(obj) {
				return (obj instanceof __Natives__.windowArray);
			}) : (function isArray(obj) {
				return (__Natives__.objectToString.call(obj) === '[object Array]');
			}))));

		types.isArrayLike = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
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
						description: "Returns 'true' if object is an array-like object. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isArrayLike(obj) {
				// Unbelievable : There is not an official way to detect an array-like object !!!!
				if (types.isNothing(obj)) {
					return false;
				};
				obj = __Natives__.windowObject(obj);
				var len = obj.length;
				return !types.isFunction(obj) && ((len >>> 0) === len);
			});
		
		types.isError = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is an error. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isError(obj) {
				return (obj instanceof __Natives__.windowError);
			});
		
		types.isNaN = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is 'NaN'. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (__Natives__.numberIsNaN || function isNaN(obj) {
				//     Unbelievable : There was not an official way to detect NaN before ES6 !!!!
				// Source: http://stackoverflow.com/questions/2652319/how-do-you-check-that-a-number-is-nan-in-javascript
				// Explanation: NaN is the only object not equal to itself.
				return (obj !== obj);
			}));
		
		types.isCallable = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is callable. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isCallable(obj) {
				// Source: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/from
				return (typeof obj === 'function') || (__Natives__.objectToString.call(obj) === '[object Function]');
			});
			
		
		//===================================
		// Stack functions
		//===================================
		
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
		__Internal__.parseStackRegEx = /([^(@]+[(@])?(eval at [^(]+[(])?(([a-zA-Z]+[:][/][/][/]?[^/]+[/][^: ]+)|([A-Z][:][\\][^\\]+[\\][^:]+)|([/][^/]+[/][^:]+)|eval code)( line ([0-9]+) [>] eval)?(([:])([0-9]+)([:])([0-9]+))?/gm;

		tools.parseStack = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
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
						lineNumber: parseInt(call[8] || call[11] || -1),
						columnNumber: parseInt(call[13] || -1),
						isSystemPath: isSystemPath,
					});
					
					call = __Internal__.parseStackRegEx.exec(stack);
				} while (call);
				
				calls.toString = __Internal__.stackToString;
				
				return calls;
			});

		tools.getStackTrace = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
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
					throw new __Natives__.windowError("");
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
		// Error functions
		//===================================
			
		// NOTE: 2015/04/16 The actual implementations of Error and other error types are not easily inheritable because their constructor always act as an instantiator.
		types.createErrorType = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
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
					base = __Natives__.windowError;
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
				
				var type = types.eval(expr, {
					base: base,
					constructor: constructor,
					name: name,
				});
				
				// For "instanceof".
				type.prototype = types.setPrototypeOf(type.prototype, base.prototype);
				
				types.extend(type.prototype, {
					name: null,
					throwLevel: 0,
					parsed: false,
					parsedStack: null,
					
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
								line = this.lineNumber;
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
		
		//===================================
		// Objects functions
		//===================================
		
		types.hasKeyInherited = __Internal__.DD_DOC(
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
							keys: {
								type: 'arrayof(string),string',
								optional: false,
								description: "Array of keys to test for.",
							},
						},
						returns: 'bool',
						description: "Returns 'true' when the object has or inherits one of the provided keys as own property. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function hasKeyInherited(obj, keys) {
				if (!types.isNothing(obj)) {
					obj = __Natives__.windowObject(obj);
					
					if (!types.isArray(keys)) {
						keys = [keys];
					};
					
					var protos = [],
						lastProto;
						
					do {
						protos.push(obj);
						if (!lastProto && types.isNativeFunction(obj.constructor)) {
							lastProto = obj.constructor.prototype;
						};
						obj = types.getPrototypeOf(obj);
					} while (obj && (obj !== lastProto));

					var protosLen = protos.length;
					
					for (var i = 0; i < protosLen; i++) {
						obj = protos[i];
						if (types.hasKey(obj, keys)) {
							return true;
						};
					};
				};
				
				return false;
			});
		
		types.hasKey = __Internal__.DD_DOC(
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
							keys: {
								type: 'arrayof(string),string',
								optional: false,
								description: "Key(s) to test for.",
							},
						},
						returns: 'bool',
						description: "Returns 'true' if one of the specified keys is an owned property of the object.",
			}
			//! END_REPLACE()
			, function hasKey(obj, keys) {
				if (!types.isNothing(obj)) {
					obj = __Natives__.windowObject(obj);
					if (!types.isArray(keys)) {
						keys = [keys];
					};
					var len = keys.length;
					if (!len) {
						return false;
					};
					for (var i = 0; i < len; i++) {
						if (i in keys) {
							var key = keys[i];
							if (__Internal__.objectHasOwnProperty.call(obj, key)) {
								return true;
							};
						};
					};
				};
				return false;
			});
		
		types.get = __Internal__.DD_DOC(
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
						description: "Returns the value of an own property. If the own property doesn't exist, returns the value of the '_default' parameter.",
			}
			//! END_REPLACE()
			, function get(obj, key, /*optional*/_default, /*optional*/inherited) {
				if (types.isNothing(obj)) {
					return _default;
				};
				obj = __Natives__.windowObject(obj);
				var hasKey = (inherited ? types.hasKeyInherited : types.hasKey);
				if (hasKey(obj, key)) {
					return obj[key];
				} else {
					return _default;
				};
			});
		
		types.getDefault = __Internal__.DD_DOC(
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
		
		
		types.propertyIsEnumerable = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
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
								description: "A property name to test for.",
							},
						},
						returns: 'boolean',
						description: "Returns 'true' if the property of the object is enumerable. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (__Natives__.objectPropertyIsEnumerable ? function propertyIsEnumerable(obj, key) {
				return __Natives__.objectPropertyIsEnumerable.call(obj, key);
			} : function propertyIsEnumerable(obj, key) {
				return true;
			}));
		
//IE8		// "Object.keys" Polyfill from Mozilla Developer Network.
//IE8		// NOTE: "hasDontEnumBug" is "true" when a property in "defaultNonEnumerables" is still non-enumerable with "for (... in ...)" while being changed to an own property.
//IE8		__Internal__.hasDontEnumBug = !types.propertyIsEnumerable({ toString: null }, 'toString');
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
						if ((types.isNaN(number) || !types.isFinite(number)) && types.hasKey(obj, key)) {
							result.push(key);
						};
					};
				} else if (__Natives__.objectKeys) {
					 result = __Natives__.objectKeys(obj);
				} else {
					// Polyfill from Mozilla Developer Network.
					obj = __Natives__.windowObject(obj);
					result = [];
					for (key in obj) {
						if (types.hasKey(obj, key)) {
							result.push(key);
						};
					};
				};
				
//IE8				if (__Internal__.hasDontEnumBug) {
//IE8					for (var i = 0; i < __Internal__.defaultNonEnumerables.length; i++) {
//IE8						key = __Internal__.defaultNonEnumerables[i];
//IE8						if (types.hasKey(obj, key)) {
//IE8							result.push(key);
//IE8						};
//IE8					};
//IE8				};

				return result;
			});
		
		types.extend = __Internal__.DD_DOC(
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
						description: "Extends the first object with owned properties of the other objects.",
			}
			//! END_REPLACE()
			, (__Natives__.objectAssign || function extend(/*paramarray*/obj) {
				var result;
				if (!types.isNothing(obj)) {
					result = __Natives__.windowObject(obj);
					var len = arguments.length;
					for (var i = 1; i < len; i++) {
						obj = arguments[i];
						if (types.isNothing(obj)) {
							continue;
						};
						// "Object.assign" Polyfill from Mozilla Developer Network.
						obj = __Natives__.windowObject(obj);
						var keys = types.keys(obj),
							keysLen = keys.length, // performance
							j, 
							key;
						for (j = 0; j < keysLen; j++) {
							key = keys[j];
							result[key] = obj[key];
						};
					};
				};
				return result;
			}));
		
		types.depthExtend = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 1,
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
						description: "Extends the first object with owned properties of the other objects using the specified depth.",
			}
			//! END_REPLACE()
			, function depthExtend(depth, /*paramarray*/obj) {
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
							// "Object.assign" Polyfill from Mozilla Developer Network.
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
								if ((depth >= 0) && types.isObject(objVal)) {
									resultVal = result[key];
									if (types.isNothing(resultVal)) {
										result[key] = types.depthExtend(depth, {}, objVal);
									} else if (types.isObjectLike(resultVal)) {
										types.depthExtend(depth, resultVal, objVal);
									} else {
										result[key] = objVal;
									};
								} else {
									result[key] = objVal;
								};
							};
						};
					};
				};
				return result;
			});
				
		types.append = __Internal__.DD_DOC(
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
			
		// <PRB> JS has no function to test for objects ( new Object() )
		types.isObject = __Internal__.DD_DOC(
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
						returns: 'boolean',
						description: "Returns 'true' if the object is a direct instance of 'Object'. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isObject(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				return (__Natives__.objectToString.call(obj) === '[object Object]');
			});
			
		types.isObjectLike = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
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
				return (types.isObject(obj) || (obj instanceof __Natives__.windowObject));
			});
		
		//==============
		// Options
		//==============
		
		var __options__ = types.depthExtend(2, {
			settings: {
				fromSource: false,              // When 'true', runs from source code instead of built code
				enableProperties: false,		// When 'true', enables "defineProperty"
			},
			hooks: {
				reservedAttributes: {
					$TYPE_NAME: undefined,
					$isSingleton: undefined,
					INITIALIZED: undefined,
					apply: undefined, 
					call: undefined, 
					bind: undefined, 
					arguments: undefined, 
					caller: undefined, 
					length: undefined, 
					prototype: undefined, 
					__proto__: undefined, 
					constructor: undefined, 
					isPrototypeOf: undefined, 
					hasOwnProperty: undefined, 
					watch: undefined, 
					unwatch: undefined, 
					isGenerator: undefined, 
					propertyIsEnumerable: undefined, 
					__EVENT_LISTENERS__: undefined,
				},
				
				invoke: function invoke(obj, fn, /*optional*/args) {
					if (types.isString(fn)) {
						fn = obj[fn];
					};
					if (args) {
						return fn.apply(obj, args);
					} else {
						return fn.call(obj);
					};
				},
				
				getAttribute: function getAttribute(obj, attr) {
					return obj[attr];
				},
				
				getAttributes: function getAttributes(obj, attrs) {
					var attrsLen = attrs.length,
						result = {};
					for (var i = 0; i < attrsLen; i++) {
						var attr = attrs[i];
						result[attr] = __options__.hooks.getAttribute(obj, attr);
					};
					return result;
				},
				
				setAttribute: function setAttribute(obj, attr, value, /*optional*/options) {
					var descriptor = types.getPropertyDescriptor(obj, attr);
					if (descriptor && !descriptor.writable && !descriptor.get && !descriptor.set && descriptor.configurable) {
						descriptor.value = value;
						types.defineProperty(obj, attr, descriptor);
					} else if (!descriptor && options && types.hasDefinePropertyEnabled()) {
						descriptor = types.extend({}, options);
						descriptor.value = value;
						types.defineProperty(obj, attr, descriptor);
					} else {
						obj[attr] = value;
					};
					return value;
				},
				
				setAttributes: function setAttributes(obj, values, /*optional*/options) {
					var keys = types.keys(values),
						keysLen = keys.length;
					for (var i = 0; i < keysLen; i++) {
						var key = keys[i];
						__options__.hooks.setAttribute(obj, key, values[key], options);
					};
					return values;
				},
			},
		}, types.get(_options, 'startup'));
		
		__options__.settings.fromSource = (__options__.settings.fromSource === 'true') || !!(+__options__.settings.fromSource);
		__options__.settings.enableProperties = (__options__.settings.enableProperties === 'true') || !!(+__options__.settings.enableProperties);
		
		//==============
		// Properties
		//==============
		
		types.hasProperties = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'boolean',
						description: "Returns 'true' if properties are available. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (__Natives__.objectDefineProperty ? (function hasProperties() {
				return true;
			}) : (function hasProperties() {
				return false;
			})));
		
		types.hasDefinePropertyEnabled = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'boolean',
						description: "Returns 'true' if 'defineProperty' is enabled. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (__options__.settings.enableProperties && __Natives__.objectDefineProperty ? (function hasDefinePropertyEnabled() {
				return true;
			}) : (function hasDefinePropertyEnabled() {
				return false;
			})));
		
		types.defineProperty = __Internal__.DD_DOC(
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
			, (__Natives__.objectDefineProperty || (function defineProperty(obj, name, descriptor) {
				if (!types.isObjectLike(descriptor)) {
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

		types.defineProperties = __Internal__.DD_DOC(
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
			, (__Natives__.objectDefineProperties || (function defineProperties(obj, props) {
				if (!types.isObject(props)) {
					throw new types.TypeError("Invalid properties.");
				};
				for (var key in props) {
					if (types.hasKey(props, key)) {
						types.defineProperty(obj, key, props[key]);
					};
				};
			})));

		types.getOwnPropertyNames = __Internal__.DD_DOC(
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
						returns: 'arrayof(string)',
						description: "Returns every own property of an object.",
			}
			//! END_REPLACE()
			, (__Natives__.getOwnPropertyNames || (function getOwnPropertyNames(obj, key) {
				obj = Object(obj);
				var result = [];
				for (var key in obj) {
					if (types.hasOwnProperty(obj, key)) {
						result.push(key);
					};
				};
				return result;
			})));
		
		types.getOwnPropertyDescriptor = __Internal__.DD_DOC(
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
			, (__Natives__.objectGetOwnPropertyDescriptor || (function getOwnPropertyDescriptor(obj, key) {
				if (types.hasKey(obj, key)) {
					return {
						writable: true,
						configurable: true,
						enumerable: true,
						value: obj[key],
					};
				} else {
					return undefined;
				};
			})));
		
		types.getPropertyDescriptor = __Internal__.DD_DOC(
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
							key: {
								type: 'string',
								optional: false,
								description: "Property name.",
							},
						},
						returns: 'object',
						description: "Returns the current descriptor of a property of an object.",
			}
			//! END_REPLACE()
			, function getPropertyDescriptor(obj, key) {
				var proto = obj,
					descriptor = undefined;
				if (key in obj) {
					do {
						descriptor = types.getOwnPropertyDescriptor(proto, key);
						proto = types.getPrototypeOf(proto);
					} while (!descriptor && proto);
				};
				return descriptor;
			});
		
		//===========================
		// Object
		//===========================
		
		types.createObject = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
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
			, (__Natives__.objectCreate || (__Internal__.hasProto ? 
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

//IE8						if (!__Natives__.objectGetPrototypeOf) {
//IE8							types.defineProperty(obj, '__dd_proto__', {value: proto, configurable: true, enumerable: true, writable: true});
//IE8						};
						
						return obj;
					})
			)));

		types._new = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
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
			, function _new(type, /*optional*/args) {
				if (!types.isFunction(type)) {
					return null;
				};
				if (args && !types.isArrayLike(args)) {
					return null;
				};
				if (args && args.length) {
					var obj = types.createObject(type.prototype);
					obj.constructor = type;
					obj.constructor.apply(obj, args);
				} else {
					obj = new type();
				};
				return obj;
			});
		
		types.getPrototypeOf = __Internal__.DD_DOC(
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
						returns: 'object',
						description: "Returns the prototype of an object.",
			}
			//! END_REPLACE()
			, (__Natives__.objectGetPrototypeOf || (__Internal__.hasProto ? 
					// For browsers implementing "__proto__".
					(function getPrototypeOf(obj) {
						return __Natives__.windowObject(obj).__proto__;
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
//IE8							obj = __Natives__.windowObject(obj);
//IE8							return types.get(obj, '__dd_proto__') || (obj.constructor && obj.constructor.prototype) || __Internal__.objProto;
//IE8						};
//IE8					})
			)));
		
		__Internal__.fnProto = (__Natives__.objectGetPrototypeOf ? types.getPrototypeOf(function(){}) : (function(){}).constructor.prototype);
//IE8		__Internal__.objProto = (__Natives__.objectGetPrototypeOf ? types.getPrototypeOf({}) : (({}).constructor.prototype));
		
		types.setPrototypeOf = __Internal__.DD_DOC(
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
				if (enabled && __Natives__.objectSetPrototypeOf) {
					return __Natives__.objectSetPrototypeOf(obj, proto);
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
//IE8								if (!types.hasKey(obj, key) && types.hasKey(p, key)) {
//IE8									obj[key] = p[key];
//IE8								};
//IE8							};
//IE8							p = types.getPrototypeOf(p);
//IE8						};
//IE8						tmp = obj;
					} else {
						tmp = types.createObject(proto, {
							constructor: {
								value: obj.constructor,
								writable: true,
							},
						});
						for (var key in obj) {
							if (types.hasKey(obj, key)) {
								tmp[key] = obj[key];
							};
						};
					};
					
//IE8					if (!__Natives__.objectSetPrototypeOf && !__Internal__.hasProto) {
//IE8						types.defineProperty(tmp, '__dd_proto__', {value: proto, configurable: true, enumerable: true, writable: true});
//IE8					};
					
					return tmp;
				};
			});

		types.isPrototypeOf = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
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
			, (__Natives__.objectIsPrototypeOf ? (function isPrototypeOf(protoObj, obj) {
				// NOTE: Why does this function is part of Object prototype ?
				return __Natives__.objectIsPrototypeOf.call(protoObj, obj);
			}) : (function isPrototypeOf(protoObj, obj) {
				obj = __Natives__.windowObject(obj);
				while (obj = types.getPrototypeOf(obj)) {
					if (obj === protoObj) {
						return true;
					};
				};
				return false;
			})));
		
		//===================================
		// Errors
		//===================================
		
		// TODO: Find a way to inherit both "types.Error" and "global.TypeError", or forget "global.TypeError" and inherit "types.Error"
		types.TypeError = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'error',
						description: "Raised on invalid value type.",
			}
			//! END_REPLACE()
			, global.TypeError || types.createErrorType("TypeError", __Natives__.windowError));
		
		types.Error = __Internal__.DD_DOC(
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
						returns: 'undefined',
						description: "Generic error with message formatting.",
			}
			//! END_REPLACE()
			, types.createErrorType('Error', __Natives__.windowError, function _new(message, /*optional*/params) {
				message = tools.format(message, params);
				return __Natives__.windowError.call(this, message);
			}));

		types.AssertionFailed = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							message: {
								type: 'string',
								optional: false,
								description: "A message explaining the assertion.",
							},
						},
						returns: 'error',
						description: "Raised when an assertion fail.",
			}
			//! END_REPLACE()
			, types.createErrorType("AssertionFailed", types.Error, function _new(message, /*optionla*/params) {
				if (message) {
					return types.Error.call(this, "Assertion failed: " + message, params);
				} else {
					return types.Error.call(this, "Assertion failed.");
				};
			}));

		types.ParseError = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'error',
						description: "Raised on parse error.",
			}
			//! END_REPLACE()
			, types.createErrorType("ParseError", types.Error));
		
		types.NotSupported = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'error',
						description: "Raised when something is not supported.",
			}
			//! END_REPLACE()
			, types.createErrorType("NotSupported", types.Error));
		
		types.HttpError = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
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
						},
						returns: 'error',
						description: "Raised on HTTP error.",
			}
			//! END_REPLACE()
			, types.createErrorType('HttpError', types.Error, function _new(code, message, /*optionla*/params) {
				this.code = code;
				return types.Error.call(this, message, params);
			}));
		
		types.BufferOverflow = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'error',
						description: "Raised on buffer overflow.",
			}
			//! END_REPLACE()
			, types.createErrorType('BufferOverflow', types.Error, function _new() {
				return types.Error.call(this, "Buffer overflow.");
			}));
		
		types.TimeoutError = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'error',
						description: "Raised on timeout.",
			}
			//! END_REPLACE()
			, types.createErrorType('TimeoutError', types.Error, function _new(message, /*optionla*/params) {
				return types.Error.call(this, message || "Timeout.", params);
			}));
		
		types.AccessDenied = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							message: {
								type: 'string',
								optional: true,
								description: "A message explaining what is denied or not allowed.",
							},
						},
						returns: 'error',
						description: "Raised on access denied or not allowed operation.",
			}
			//! END_REPLACE()
			, types.createErrorType('AccessDenied', types.Error, function _new(message, /*optionla*/params) {
				return types.Error.call(this, message || "Access denied.", params);
			}));
		
		//===================================
		// Type functions
		//===================================
		
		types.isType = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
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
				return (obj === types.Type) || types.baseof(types.Type, obj);
			});
		
		types.isJsFunction = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
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
			//! REPLACE_BY("null")
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
				return ((__Natives__.objectToString.call(obj) === '[object Object]') && !types._instanceof(obj, types.Type));
			});

		types.is = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
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
				obj = __Natives__.windowObject(obj);
				if (!(type instanceof Array)) {
					type = [type];
				};
				var typeLen = type.length,
					i,
					t;
				if (!types.isFunction(obj)) {
					obj = obj.constructor;
				};
				for (i = 0; i < typeLen; i++) {
					if (i in type) {
						t = type[i];
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
			//! REPLACE_BY("null")
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
						description: "Returns 'true' if object is from or inherits from the specified Doodad type. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isLike(obj, type) {
				// "obj" is of or inherits type "types".

				if ((obj === undefined) || (obj === null)) {
					return false;
				};
				obj = __Natives__.windowObject(obj);
				if (!types.isFunction(obj)) {
					obj = obj.constructor;
				};
				if (!(type instanceof Array)) {
					type = [type];
				};
				var typeLen = type.length,
					baseName,
					i,
					t;
				for (i = 0; i < typeLen; i++) {
					if (i in type) {
						t = type[i];
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
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 1,
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
				var baseLen = base.length,
					i,
					b;
				for (i = 0; i < baseLen; i++) {
					if (i in base) {
						b = base[i];
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
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 1,
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
						description: "Returns 'true' if a object inherits from type. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function _instanceof(obj, type) {
				// Uses prototypes chain like the operator "instanceof", but doesn't raise an exception when 'type' is not a type. 
				// NOTE: With Doodad objects it is recommended to use this function instead of the operator.

				obj = __Natives__.windowObject(obj);
				if (types.isFunction(obj)) {
					// Use "types.baseof"
					return false;
				};
				if (!(type instanceof Array)) {
					type = [type];
				};
				var typeLen = type.length,
					i,
					t;
				for (i = 0; i < typeLen; i++) {
					if (i in type) {
						t = type[i];
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
			//! REPLACE_BY("null")
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
				return !!obj.$isSingleton;
			});

		
		types.getType = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
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
				obj = __Natives__.windowObject(obj);
				if (!types.isFunction(obj)) {
					obj = obj.constructor;
				};
				if ((obj !== types.Type) && !types.baseof(types.Type, obj)) {
					return null;
				};
				return obj;
			});

		types.getTypeName = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
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
				obj = __Natives__.windowObject(obj);
				if (!types.isFunction(obj)) {
					obj = obj.constructor;
				};
				if ((obj !== types.Type) && !types.baseof(types.Type, obj)) {
					return null;
				};
				return obj.$TYPE_NAME || types.getFunctionName(obj);
			});
		
		types.getBase = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
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
				obj = __Natives__.windowObject(obj);
				if (!types.isFunction(obj)) {
					obj = obj.constructor;
				};
				if ((obj !== types.Type) && !types.baseof(types.Type, obj)) {
					return null;
				};
				return types.getPrototypeOf(obj);
			});

		//===================================
		// Type
		//===================================
		
		types.INHERIT = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							base: {
								type: 'type',
								optional: false,
								description: "A Doodad type used as a base type.",
							},
							type: {
								type: 'type',
								optional: false,
								description: "A Doodad type to inherit.",
							},
						},
						returns: 'type',
						description: "Returns a new Doodad type which is the result of a Doodad type inherited from a base Doodad type.",
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
				
				type.prototype = types.setPrototypeOf(type.prototype, base.prototype);
//IE8				type.prototype = types.createObject(base.prototype, {
//IE8					constructor: {
//IE8						value: type,
//IE8						configurable: true,
//IE8						enumerable: true,
//IE8						writable: true,
//IE8					},
//IE8				});
				
				return type;
			});

		__Internal__.emptyFunction = function empty() {};
		
		types.SUPER = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							fn: {
								type: 'method',
								optional: false,
								description: "A method.",
							},
						},
						returns: 'method',
						description: "Flags a method so it will override instead of replace. Returns that method.",
			}
			//! END_REPLACE()
			, function SUPER(fn) {
				fn.superEnabled = true;
				return fn;
			});
		
		types.createCaller = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 1,
						params: {
							attr: {
								type: 'string',
								optional: false,
								description: "The method name.",
							},
							proto: {
								type: 'object',
								optional: false,
								description: "The new function.",
							},
							superFn: {
								type: 'object',
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
					var oldSuper = __options__.hooks.getAttribute(this, '_super');
					__options__.hooks.setAttribute(this, '_super', superFn, { configurable: true, enumerable: false, writable: false });
					try {
						return fn.apply(this, arguments);
					} catch (ex) {
						throw ex;
					} finally {
						__options__.hooks.setAttribute(this, '_super', oldSuper, { configurable: true, enumerable: false, writable: false });
					};
				};
				_caller = types.setPrototypeOf(_caller, types.SUPER);
				_caller.METHOD_NAME = attr;
				return _caller;
			});

		types.createSuper = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 2,
						params: {
							attr: {
								type: 'string',
								optional: false,
								description: "The method name.",
							},
							proto: {
								type: 'object',
								optional: false,
								description: "The prototype where the new method is stored.",
							},
							base: {
								type: 'object',
								optional: true,
								description: "The prototype where the overridden method is stored.",
							},
						},
						returns: 'method',
						description: "Returns a new method which is the result of the override.",
			}
			//! END_REPLACE()
			, function createSuper(attr, proto, /*optional*/base) {
				var fn = __options__.hooks.getAttribute(proto, attr);
				var superFn = base && __options__.hooks.getAttribute(base, attr);
				return types.createCaller(attr, fn, superFn);
			});

		types.SINGLETON = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
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
							args: {
								type: 'arrayof(any)',
								optional: true,
								description: "Arguments of the constructor.",
							},
							getType: {
								type: 'boolean',
								optional: true,
								description: "If 'true', will returns the type of the singleton object.",
							},
						},
						returns: ['object', 'type'],
						description: "Transforms a Doodad type to a singleton object. Returns that singleton object.",
			}
			//! END_REPLACE()
			, function SINGLETON(/*<<< optional[getType], optional[args], type*/) {
				var argumentsLen = arguments.length,
					type = arguments[argumentsLen - 1],
					args,
					getType = false;
					
				if (argumentsLen > 1) {
					args = arguments[argumentsLen - 2];
				};
				
				if (argumentsLen > 2) {
					getType = arguments[argumentsLen - 3];
				};
				
				if (!type.$isSingleton) {
					var name = types.getTypeName(type);
					
					__options__.hooks.setAttributes(type, {
						$isSingleton: true,
						$inherit: types.createCaller('$inherit', function $inherit(/*paramarray*/) {
							var obj = this._super.apply(this, arguments) || this;
							if (types.baseof(types.Type, obj)) {
								// Object is a type, so instantiate it
								obj = types._new(obj, args);
							};
							return obj;
						}, type.$inherit),
					}, { configurable: true, enumerable: false, writable: false });

					__options__.hooks.setAttributes(type.prototype, {
						$inherit: types.createCaller('$inherit', function $inherit(/*paramarray*/) {
							var type = this._super.apply(this, arguments) || this;
							type = types.getType(type);
							return type.$inherit.apply(type, arguments);
						}, type.prototype.$inherit),
					}, { configurable: true, enumerable: false, writable: false });
				};
				
				type = types.INIT(type, args);

				if (getType) {
					return type;
				};
				
				var obj = types._new(type, args);
				
				return obj;
			});
		
		types.INIT = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
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
				if (!types.isType(type) || type.INITIALIZED) {
					return type;
				} else {
					return __options__.hooks.invoke(type, '_new', args) || type;
				};
			});
		
		types.createType = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 1,
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
				
				name = name.replace(/[.]/g, "_");
				
				var expr = (types.isFunction(constructor) ? "ctx.constructor" : "function " + name + "(/*paramarray*/) {" + (types.isString(constructor) ? constructor : (base ? "return ctx.base.apply(this, arguments) || this;" : "return this;")) + "}");
				
				// NOTE: 'eval' is the only way found to give a name to dynamicaly created functions.
				var ctx = types.extend({}, constructorContext, {
					base: base,
					constructor: constructor,
				});
				var type = types.eval(expr, ctx);
				
				// Inherit base
				var proto;
				var baseIsType = false;
				if (base) {
					type = types.INHERIT(base, type);
					proto = type.prototype;
					baseIsType = types.isType(base);
					type = types.setPrototypeOf(type, base);
				} else {
//IE8					// IE 8
//IE8					proto = types.createObject({});
//IE8					type.prototype = proto;
					proto = type.prototype;
				};
			
				proto.constructor = type;
				
				var propsEnabled = types.hasDefinePropertyEnabled();

				// Override type prototype
				var reservedAttributes = __options__.hooks.reservedAttributes;
				if (typeProto) {
					var keys = types.keys(typeProto);
					for (var i = 0; i < keys.length; i++) {
						var key = keys[i];
						if (!types.hasKey(reservedAttributes, key)) {
							if (types.hasKey(typeProto, key)) {
								var value = typeProto[key],
									createSuper = (types.isFunction(value) ? value.superEnabled : false);
									
								if (createSuper) {
									value = types.createSuper(key, typeProto, base);
								};
								
								//if (base && types.isObjectLike(value)) {
								//	var baseValue = base[key];
								//	if (types.isObjectLike(baseValue)) {
								//		value = __Internal__.DD_DOC(__Internal__.DD_GET_DOC(baseValue), value);
								//	};
								//};
								
								if (propsEnabled) {
									types.defineProperty(type, key, {
										configurable: true,
										enumerable: true,
										value: value,
										writable: true,
									});
								} else {
									type[key] = value;
								};
							};
						};
					};
				};
				
				if (propsEnabled) {
					types.defineProperty(type, 'INITIALIZED', {
						configurable: true,
						enumerable: false,
						value: false,
						writable: false,
					});
				} else {
					type.INITIALIZED = false;
				};

				// Override instance prototype
				if (instanceProto) {
					var baseProto = (base ? base.prototype : null);
					var keys = types.keys(instanceProto);
					for (var i = 0; i < keys.length; i++) {
						var key = keys[i];
						if (!types.hasKey(reservedAttributes, key)) {
							if (types.hasKey(instanceProto, key)) {
								var value = instanceProto[key],
									createSuper = (types.isFunction(value) ? value.superEnabled : false);
									
								if (createSuper) {
									value = types.createSuper(key, instanceProto, baseProto);
								};
								
								//if (baseProto && types.isObjectLike(value)) {
								//	var baseValue = baseProto[key];
								//	if (types.isObjectLike(baseValue)) {
								//		value = __Internal__.DD_DOC(__Internal__.DD_GET_DOC(baseValue), value);
								//	};
								//};

								if (propsEnabled) {
									types.defineProperty(proto, key, {
										configurable: true,
										enumerable: true,
										value: value,
										writable: true,
									});
								} else {
									proto[key] = value;
								};
							};
						};
					};
				};
				
				if (propsEnabled) {
					types.defineProperty(proto, 'INITIALIZED', {
						configurable: true,
						enumerable: false,
						value: false,
						writable: false,
					});
				} else {
					proto.INITIALIZED = false;
				};
				
				// Return type
				return type;
			});
		

		__Internal__.typeInherit = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 1,
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
				var name = (typeProto ? typeProto.$TYPE_NAME : null),
					base = ((this === global) ? undefined: this);
					
				var type = types.createType(
						/*name*/
						name,
						
						/*base*/
						base, 
						
						/*constructor*/
						(constructor || "return this._new.apply(this, arguments) || this;"), 
						
						/*typeProto*/
						typeProto, 
						
						/*instanceProto*/
						instanceProto, 
						
						/*constructorContext*/
						constructorContext
					);
					
				if (types.hasDefinePropertyEnabled()) {
					types.defineProperty(type, '$TYPE_NAME', {
						configurable: true,
						enumerable: false,
						value: (name || ''),
						writable: false,
					});
				} else {
					type.$TYPE_NAME = (name || '');
				};
				
				return type;
			});
		
		__Internal__.typeNew = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 1,
						params: null,
						returns: 'undefined',
						description: "Object or type creator.",
			}
			//! END_REPLACE()
			, function _new() {
				__options__.hooks.setAttribute(this, 'INITIALIZED', true, {enumerable: false, writable: false, configurable: true});
			});
		
		__Internal__.typeDelete = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 1,
						params: null,
						returns: 'undefined',
						description: "Object or type destructor.",
			}
			//! END_REPLACE()
			, function _delete() {
				__options__.hooks.setAttribute(this, 'INITIALIZED', false, {enumerable: false, writable: false, configurable: true});
			});
		
		__Internal__.typeToString = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
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
			//! REPLACE_BY("null")
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


		types.Type = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 1,
						params: null,
						returns: 'object',
						description: "Base type of every Doodad types.",
			}
			//! END_REPLACE()
			, types.INIT(__Internal__.typeInherit.call(undefined,
				/*typeProto*/
				{
					$TYPE_NAME: 'Type',
					
					$inherit: __Internal__.typeInherit,
					
					_new: __Internal__.typeNew,
					_delete: __Internal__.typeDelete,
					
					toString: types.SUPER(__Internal__.typeToString),
					toLocaleString: types.SUPER(__Internal__.typeToLocaleString),
				},
				/*instanceProto*/
				{
					//_super: null,
					INITIALIZED: false,
					
					_new: __Internal__.typeNew,
					_delete: __Internal__.typeDelete,
					
					toString: types.SUPER(__Internal__.typeToString),
					toLocaleString: types.SUPER(__Internal__.typeToLocaleString),
				}
			)));

		//===================================
		// Event functions
		//===================================
			
		// NOTE: 2015/04/16 We can't inherit from the actual implementations of Event and CustomEvent !
		types.CustomEvent = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
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
			, types.INIT(types.Type.$inherit(
				/*typeProto*/
				{
					$TYPE_NAME: 'CustomEvent',
				},
				/*instanceProto*/
				{
					type: null,
					bubbles: false,
					cancelable: false,
					detail: null,
					
					canceled: false,   // preventDefault
					bubbling: false,   // stopPropagation
					stopped: false,    // stopImmediatePropagation
					
					_new: types.SUPER(function _new(type, /*optional*/init) {
						this._super();
						this.type = type;
						// NOTE: Event targets are responsible to bubble events to their parent when "bubbling" is true.
						this.bubbling = this.bubbles = !!types.get(init, 'bubbles');
						this.cancelable = !!types.get(init, 'cancelable');
						this.detail = types.get(init, 'detail');
					}),
					
					preventDefault: __Internal__.DD_DOC(
								//! REPLACE_BY("null")
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
								//! REPLACE_BY("null")
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
								//! REPLACE_BY("null")
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
		
		types.CustomEventTarget = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 1,
						params: null,
						returns: 'object',
						description: "Custom event target.",
			}
			//! END_REPLACE()
			, types.INIT(types.Type.$inherit(
				/*typeProto*/
				{
					$TYPE_NAME: 'CustomEventTarget',
				},
				/*instanceProto*/
				{
					__EVENT_LISTENERS__: null,
					
					_new: types.SUPER(function _new() {
						this._super();
						__options__.hooks.setAttribute(this, '__EVENT_LISTENERS__', {}, {configurable: true, enumerable: false, writable: false});
					}),
					
					addEventListener: __Internal__.DD_DOC(
								//! REPLACE_BY("null")
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
							
							var listeners = this.__EVENT_LISTENERS__[type];
							if (!types.isArray(listeners)) {
								this.__EVENT_LISTENERS__[type] = listeners = [];
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
								//! REPLACE_BY("null")
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
							
							if (types.hasKey(this.__EVENT_LISTENERS__, type)) {
								var listeners = this.__EVENT_LISTENERS__[type];
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
								//! REPLACE_BY("null")
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
								if (types.hasKey(this.__EVENT_LISTENERS__, type)) {
									listeners = this.__EVENT_LISTENERS__[type];
								} else {
									this.__EVENT_LISTENERS__[type] = listeners = [];
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
									if (!event.stopped && types.hasKey(this, type)) {
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
								//! REPLACE_BY("null")
								{
											author: "Claude Petit",
											revision: 0,
											params: null,
											returns: 'undefined',
											description: "Removes every event listeners.",
								}
								//! END_REPLACE()
						, function clearListeners() {
							this.__EVENT_LISTENERS__.length = 0;
						}),
				}
			)));
		
		//===================================
		// Namespace
		//===================================
		
		types.Namespace = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
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
			, types.INIT(types.CustomEventTarget.$inherit(
				/*typeProto*/
				{
					$TYPE_NAME: 'Namespace',
				},
				/*instanceProto*/
				{
					DD_PARENT: null,
					DD_NAME: null,
					DD_FULL_NAME: null,
					DD_OPTIONS: null,
					
					_new: types.SUPER(function _new(parent, name, fullName) {
						this._super();
						
						__options__.hooks.setAttributes(this, {
							DD_PARENT: parent,
							DD_NAME: name,
							DD_FULL_NAME: fullName,
							DD_OPTIONS: {},
						}, {writable: false, enumerable: false, configurable: true});
					}),
					
					getOptions: function getOptions() {
						return this.DD_OPTIONS;
					},
					
					setOptions: function setOptions(/*paramarray*/) {
						return types.depthExtend.apply(types, types.append([2, this.DD_OPTIONS], arguments));
					},
				}
			)));
		
		//===================================
		// Root
		//===================================

		return __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 1,
						params: {
							modules: {
								type: 'arrayof(object)',
								optional: true,
								description: "Array of modules to load.",
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
			, types.SINGLETON([modules, _options], types.Namespace.$inherit(
				/*typeProto*/
				{
					$TYPE_NAME: 'Root',
				},
				/*instanceProto*/
				{
					DD_DOC: __Internal__.DD_DOC,
					DD_GET_DOC: __Internal__.DD_GET_DOC,
					DD_REGISTRY: null,  // Created by "Namespaces.js"
					Namespace: types.Namespace,
					
					_new: types.SUPER(function _new(/*optional*/modules, /*optional*/options) {
						"use strict";
						
						this._super(null, '<Root>', '<Root>');

						__options__.hooks.setAttribute(this, 'DD_OPTIONS', __options__);
						
						// Prebuild "Doodad.Types" and "Doodad.Tools"
						var doodadNs = this.Doodad = new types.Namespace(this, 'Doodad', 'Doodad'),
							typesNs = doodadNs.Types = new types.Namespace(doodadNs, 'Types', 'Doodad.Types'),
							toolsNs = doodadNs.Tools = new types.Namespace(doodadNs, 'Tools', 'Doodad.Tools');
							
						types.extend(typesNs, types);
						types.extend(toolsNs, tools);
						
						var self = this;
						
						if (types.hasDefinePropertyEnabled()) {
							types.defineProperties(typesNs, {
								createRoot: {
									get: function() {
										return exports.createRoot;
									},
								},
								invoke: {
									get: function() {
										return __options__.hooks.invoke;
									},
								},
								getAttribute: {
									get: function() {
										return __options__.hooks.getAttribute;
									},
								},
								getAttributes: {
									get: function() {
										return __options__.hooks.getAttributes;
									},
								},
								setAttribute: {
									get: function() {
										return __options__.hooks.setAttribute;
									},
								},
								setAttributes: {
									get: function() {
										return __options__.hooks.setAttributes;
									},
								},
							});
						} else {
							typesNs.createRoot = exports.createRoot;
							typesNs.invoke = function invoke(obj, fn, /*optional*/args) {
								return __options__.hooks.invoke(obj, fn, args);
							};
							typesNs.getAttribute = function getAttribute(obj, attr) {
								return __options__.hooks.getAttribute(obj, attr);
							};
							typesNs.getAttributes = function getAttributes(obj, attrs) {
								return __options__.hooks.getAttributes(obj, attrs);
							};
							typesNs.setAttribute = function setAttribute(obj, attr, value, /*optional*/options) {
								return __options__.hooks.setAttribute(obj, attr, value, options);
							};
							typesNs.setAttributes = function setAttributes(obj, values, /*optional*/options) {
								return __options__.hooks.setAttributes(obj, values, options);
							};
						};
						
						// Load bootstrap modules

						modules = types.extend({}, modules, __bootstraps__);
						
						var names = types.keys(modules);
						if (!names.length) {
							throw new types.Error("Missing bootstrap modules.");
						};

						var loading = {},
							nsObjs = {},
							name;
						whileName: while (name = names.shift()) {
							var mod = modules[name];
							if (mod.bootstrap) {
								var deps = (mod.dependencies || []);
								for (var i = 0; i < deps.length; i++) {
									if (i in deps) {
										var dep = deps[i],
											optional = false;
										if (types.isObject(dep)) {
											optional = dep.optional;
											dep = dep.name;
										};
										var bootstrapping = types.hasKey(loading, dep);
										if (!types.hasKey(modules, dep) && !bootstrapping) {
											if (optional) {
												bootstrapping = true;
											} else {
												throw new types.Error("Missing bootstrap module '~0~'.", [dep]);
											};
										};
										if (!bootstrapping) {
											names.push(name);
											continue whileName;
										};
									};
								};
								var shortNames = name.split('.'),
									parent = this,
									fullName = '',
									shortName,
									j,
									k,
									nsObj = null;
								for (k = 0; k < shortNames.length; k++) {
									shortName = shortNames[k];
									fullName += '.' + shortName;
									if (types.hasKey(parent, shortName)) {
										nsObj = parent[shortName];
									} else {
										parent[shortName] = nsObj = new types.Namespace(parent, shortName, fullName.slice(1));
									};
									parent = parent[shortName];
								};
								nsObjs[name] = nsObj;
								
								var namespaces = (mod.namespaces || []),
									namespace = parent;
								for (j = 0; j < namespaces.length; j++) {
									if (j in namespaces) {
										shortNames = namespaces[j].split('.');
										fullName = '.' + name;
										for (k = 0; k < shortNames.length; k++) {
											shortName = shortNames[k];
											fullName += '.' + shortName;
											if (!types.hasKey(parent, shortName)) {
												parent[shortName] = nsObj = new types.Namespace(parent, shortName, fullName.slice(1));
												nsObjs[name] = nsObj;
											};
											parent = parent[shortName];
										};
										parent = namespace;
									};
								};

								var opts = types.get(options, name);
								var init = mod.create && mod.create(this, opts);
								init && init(opts);
								
								loading[name] = mod;
								
								if (__recordNewBootstraps__) {
									__bootstraps__[name] = mod;
								};
							};
						};
						
						if (__recordNewBootstraps__) {
							__bootstraps__[MODULE_NAME] = {
								type: 'Package',
								version: MODULE_VERSION,
								namespaces: null,
								dependencies: null,
								bootstrap: true,
							};
							
							__recordNewBootstraps__ = false;
						};

						this.Doodad.Namespaces.loadNamespaces(__bootstraps__, null, options, false);
					}),
					
					enableAsserts: __Internal__.DD_DOC(
						//! REPLACE_BY("null")
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
								types.defineProperty(this, 'DD_ASSERT', {
									configurable: true, 
									enumerable: false, 
									value: __ASSERT__,
									writable: false,
								});
							} else {
								this.DD_ASSERT = __ASSERT__;
							};
						}),
					
					disableAsserts: __Internal__.DD_DOC(
						//! REPLACE_BY("null")
						{
								author: "Claude Petit",
								revision: 1,
								params: null,
								returns: 'undefined',
								description: "Disables 'DD_ASSERT'.",
						}
						//! END_REPLACE()
						, function disableAsserts() {
							delete this.DD_ASSERT;
						}),
				}
			)));
	};
	
	if (typeof process !== 'object') {
		// <PRB> export/import are not yet supported in browsers
		global.createRoot = exports.createRoot;
	};
}).call((typeof global !== 'undefined') ? global : ((typeof window !== 'undefined') ? window : this), 
	// WARNING: It is for compatibility purpose only. It is NOT to be used with arbitrary expressions.
	// WARNING: Do not declare any variable and parameter inside these functions.

	// getEvals
	(function() {
		//return ((typeof eval("(function(){})") === 'function') ?
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