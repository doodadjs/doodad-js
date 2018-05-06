//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
	// doodad-js - Object-oriented programming framework
	// File: Tools_ToSource.js - "tools.toSource" function
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
	modules['Doodad.Tools/ToSource'] = {
		version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
		bootstrap: true,

		create: function create(root, /*optional*/_options, _shared) {
			//===================================
			// Get namespaces
			//===================================

			const doodad = root.Doodad,
				tools = doodad.Tools,
				types = doodad.Types;

			//===================================
			// Internal
			//===================================

			const __Internal__ = {
				// "toSource"
				supportsVerticalTabEscape: ('\v' !== 'v'),
				supportsNullCharEscape: ('\0' !== '0'),
			};

			//===================================
			// Native functions
			//===================================

			tools.complete(_shared.Natives, {
				windowObject: global.Object,
				objectToStringCall: global.Object.prototype.toString.call.bind(global.Object.prototype.toString),
				stringCharCodeAtCall: global.String.prototype.charCodeAt.call.bind(global.String.prototype.charCodeAt),
			});

			//===================================
			// "toSource" function
			//===================================

			tools.ADD('toSource', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 4,
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
								description: "Options.",
							},
						},
						returns: 'string',
						description: "Converts a value to its source code equivalent.",
					}
				//! END_REPLACE()
				, function toSource(obj, /*optional*/depth, /*optional*/options) {
					/* eslint no-cond-assign: "off" */
					// TODO: "chain" option to generate the prototypes chain with "Object.setPrototypeOf"
					if (obj === undefined) {
						return 'undefined';
					} else if (obj === null) {
						return 'null';
					} else if (types.isNaN(obj)) {
						return "NaN";
					} else {
						const primitive = types.isPrimitive(obj);
						obj = _shared.Natives.windowObject(obj);
						let val = obj;
						if (types.isFunction(obj.valueOf)) {
							try {
								val = obj.valueOf();
							} catch(o) {
								// Do nothing
							};
						};
						const toSourceItemsCount = tools.getOptions().toSourceItemsCount;
						if (!primitive && types.isNothing(depth) && types.isFunction(obj.toSource) && types.get(options, 'allowToSource', false)) {
							return obj.toSource();
						} else {
							depth = (+depth || 0);  // null|undefined|true|false|NaN|Infinity
							if (types.isString(obj)) {
								let str = '';
								const len = val.length,
									allowNullChar = types.get(options, 'allowNullChar', __Internal__.supportsNullCharEscape),
									allowVerticalTab = types.get(options, 'allowVerticalTab', __Internal__.supportsVerticalTabEscape);
								//const allowCodePoint = types.get(options, 'allowCodePoint', __Internal__.supportsCodePoint);
								//for (let i = 0; i < len; ) {
								for (let i = 0; i < len; i++) {
									//let code = (allowCodePoint ? unicode.codePointAt(val, i, true) : [_shared.Natives.stringCharCodeAtCall(val, i), 1]);
									//const size = code[1];
									//code = code[0];
									const code = _shared.Natives.stringCharCodeAtCall(val, i);
									if (allowNullChar && (code === 0x0000)) { // Null
										str += '\\0';
									} else if (code === 0x0008) { // Backspace
										str += '\\b';
									} else if (code === 0x0009) { // Horizontal Tab
										str += '\\t';
									} else if (code === 0x000A) { // Line Feed
										str += '\\n';
									} else if (allowVerticalTab && (code === 0x000B)) { // Vertical Tab
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
										//} else if (allowCodePoint && (code >= 0x10000)) {
										//	str += '\\u{' + ('0000000' + code.toString(16)).slice(-8) + '}';
									} else if (((code >= 0x0000) && (code <= 0x001F)) || ((code >= 0x007F) && (code <= 0x009F)) || ((code >= 0xD800) && (code <= 0xDFFF))) { // Other control chars
										str += '\\u' + ('000' + code.toString(16)).slice(-4);
									} else {
										//str += val.slice(i, i + size);
										str += val.slice(i, i + 1);
									};
									//i += size;
								};
								if (primitive) {
									return "'" + str + "'";
								} else {
									return "(new String('" + str + "'))";
								}
							} else if (types.isBoolean(obj)) {
								if (primitive) {
									return (val ? 'true' : 'false');
								} else {
									return (val ? '(new Boolean(true))' : '(new Boolean(false))');
								}
							} else if (types.isNumber(obj)) {
								if (primitive) {
									return val.toString();
								} else {
									return '(new Number(' + val + '))';
								}
							} else if (types.isDate(obj)) {
								return '(new Date(' + obj.getFullYear() + ', ' + obj.getMonth() + ', ' + obj.getDate() + ', ' + obj.getHours() + ', ' + obj.getMinutes() + ', ' + obj.getSeconds() + ', ' + obj.getMilliseconds() + '))';
							} else if (types.isSymbol(obj)) {
								const key = types.getSymbolKey(obj);
								return (types.symbolIsGlobal(obj) && !types.isNothing(key) ? "Symbol.for(" + tools.toSource(key, null, options) + ")" : (types.isNothing(key) ? "Symbol()" : "Symbol(" + tools.toSource(key, null, options) + ")"));
							} else if (types.isError(obj)) {
								return '(new Error(' + tools.toSource(obj.message || obj.description, null, options) + '))';
							} else if (types.isFunction(obj)) {
								if ((depth >= 0) && types.isCustomFunction(obj)) {
									return obj.toString();
								} else {
									return '(new Function())';
								}
							} else if (types.isArray(obj)) {
								const includeFunctions = types.get(options, 'includeFunctions', true);
								if (depth < 0) {
									return '(new Array(' + obj.length + '))';
								};
								let len = val.length,
									str = '',
									continued = '';
								depth--;
								if (len > toSourceItemsCount) {
									len = toSourceItemsCount;
									continued = ', ...';
								};
								for (let key = 0; key < len; key++) {
									if (types.has(val, key)) {
										const item = val[key];
										if (includeFunctions || !types.isFunction(item)) {
											str += tools.toSource(item, depth, options) + ', ';
										};
									} else {
										str += ', ';
									};
								};
								return '[' + str.slice(0, -2) + continued + ']';
							} else if (types.isObject(obj)) {
								const includeFunctions = types.get(options, 'includeFunctions', true);
								if (depth < 0) {
									return '{}';
								};
								let str = '',
									len = 0;
								depth--;
								const inherited = types.get(options, 'inherited', false);
								do {
									const keys = tools.append(types.keys(obj), types.symbols(obj));
									for (let i = 0; i < keys.length; i++) {
										if (len >= toSourceItemsCount) {
											str += '..., ';
											break;
										};
										const key = keys[i];
										const item = obj[key];
										if (includeFunctions || !types.isFunction(item)) {
											str += tools.toSource(key) + ': ' + tools.toSource(item, depth, options) + ', ';
										};
										len++;
									};
								} while (inherited && (obj = types.getPrototypeOf(obj)));
								return '{' + str.slice(0, -2) + '}';
							} else if (types.isObjectLike(obj)) {
								return tools.toSource(_shared.Natives.objectToStringCall(obj));
							} else {
								return obj.toString();
							}
						}
					}
				}));

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
