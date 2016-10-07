//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2016 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Doodad.js - Main file
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

// Naming conventions :
//
//     Namespaces, Types, Enums, and other Public Module Attributes : Each word in lower case and beginning with an upper case. ex.: MyType
//     Object Attributes, Functions, Arguments and Variables : First word all lower case. Other words in lower case and beginning with an upper case. ex.: processQueue
//     JavaScript Keywords : Preceded by an underscore (_). ex.: _new
//     Private Types, and Private Object Attributes : Preceded by two underscores (__). ex.: __MyType
//     Private Module Types, and private Variables : Preceded by two underscores (__) and followed by two other underscores. ex.: __myPrivateVariable__
//     Read-only (or don't touch warning) Attributes, and Special Functions : All upper case and words separated with an underscore (_). ex: READ_ONLY_ATTRIBUTE
//     Non-instance (static) Type Attributes : Preceded by a dollar sign ("$").

module.exports = {
	add: function add(DD_MODULES) {
		DD_MODULES = (DD_MODULES || {});
		DD_MODULES['Doodad'] = {
			version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
			namespaces: ['Extenders', 'Interfaces', 'MixIns', 'Exceptions'],
			dependencies: [
				'Doodad.Tools',
				'Doodad.Types',
				'Doodad.Namespaces',
				{
					name: 'Doodad.NodeJs',
					optional: true,
				},
			],
			replaceEntry: true,
			//replaceObject: true,
			bootstrap: true,
			
			create: function create(root, /*optional*/_options, _shared) {
				"use strict";

				// Class entry
				var doodad = root.Doodad,
					types = doodad.Types,
					dom = doodad.DOM,
					namespaces = doodad.Namespaces,
					entries = namespaces.Entries,
					tools = doodad.Tools,
					extenders = doodad.Extenders,
					interfaces = doodad.Interfaces,
					mixIns = doodad.MixIns,
					exceptions = doodad.Exceptions,
					nodejs = doodad.NodeJs; // optional


				// <FUTURE> Thread context
				var __Internal__ = {
					invokedClass: null,	// <FUTURE> thread level
					inTrapException: false, // <FUTURE> thread level
					inEventHandler: false, // <FUTURE> thread level
					
					arrayObj: (global.Array && global.Array.prototype || []), // temporary, will get deleted
					
					// Class
					symbolAttributes: types.getSymbolFor('__ATTRIBUTES'),
					symbolImplements: types.getSymbolFor('IMPLEMENTS'),
					symbolMustOverride: types.getSymbolFor('MUST_OVERRIDE'),
					symbolBase: types.getSymbolFor('BASE'),
					symbolIsolated: types.getSymbolFor('ISOLATED'),
					symbolIsolatedCache: types.getSymbolFor('__ISOLATED_CACHE'),
					symbolAttributesStorage: types.getSymbolFor('__ATTRIBUTES_STORAGE'),
					symbolCurrentDispatch: types.getSymbolFor('__CURRENT_DISPATCH'),
					symbolCurrentCallerIndex: types.getSymbolFor('__CURRENT_CALLER_INDEX'),
					
					// Class, Methods, Callers, AttributeBox
					symbolPrototype: types.getSymbolFor('PROTOTYPE'),
					symbolModifiers: types.getSymbolFor('__MODIFIERS__'),

					// Methods, Callers, AttributeBox
					symbolCallers: types.getSymbolFor('__CALLERS__'),

					// Interface
					symbolHost: types.getSymbolFor('__HOST__'),
					
					// EventHandler, AttributeBox
					symbolExtender: types.getSymbolFor('__EXTENDER__'),

					// EventHandler
					symbolObject: types.getSymbolFor('__OBJECT__'),
					symbolStack: types.getSymbolFor('__STACK__'),
					symbolSorted: types.getSymbolFor('__SORTED__'),
					
					// Callers & AttributeBox
					symbolCalled: types.getSymbolFor('__CALLED__'),
					symbolPosition: types.getSymbolFor('__POSITION__'),
					symbolUsageMessage: types.getSymbolFor('__USAGE_MESSAGE__'),
					
					// AttributeBox
					symbolScope: types.getSymbolFor('__SCOPE__'),
					symbolReturns: types.getSymbolFor('__RETURNS__'),
					symbolInterface: types.getSymbolFor('__INTERFACE__'),
					symbolCallFirstLength: types.getSymbolFor('__CALL_FIRST_LENGTH__'),
					symbolRenamedFrom: types.getSymbolFor('__RENAMED_FROM__'),
					symbolRenamedTo: types.getSymbolFor('__RENAMED_TO__'),
					symbolOverrideWith: types.getSymbolFor('__OVERRIDE_WITH__'),
					
					// Creatable
					symbolDestroyed: types.getSymbolFor('__destroyed'),

					ANONYMOUS: '<anonymous>',
				};

				types.complete(_shared.Natives, {
					arraySlice: __Internal__.arrayObj.slice,
					arraySplice: __Internal__.arrayObj.splice,
					arrayUnshift: __Internal__.arrayObj.unshift,
					functionPrototype: global.Function.prototype,
				});
				
				delete __Internal__.arrayObj;  // free memory
				
				// Interface
				doodad.HostSymbol = __Internal__.symbolHost;
				
				// AttributeBox
				_shared.ExtenderSymbol = __Internal__.symbolExtender;

				// EventHandler
				_shared.ObjectSymbol = __Internal__.symbolObject;
				_shared.StackSymbol = __Internal__.symbolStack;
				_shared.SortedSymbol = __Internal__.symbolSorted;

				//=====================
				// Options
				//=====================
				
				var __options__ = types.nullObject({
					enforceScopes: false,    // for performance, set it to "false"
					enforcePolicies: false,  // for performance, set it to "false"
					publicOnDebug: false,    // to be able to read core attributes in debug mode, set it to "true"
				}, _options);

				__options__.enforceScopes = types.toBoolean(__options__.enforceScopes);
				__options__.enforcePolicies = types.toBoolean(__options__.enforcePolicies);
				__options__.publicOnDebug = types.toBoolean(__options__.publicOnDebug);

				types.freezeObject(__options__);

				doodad.getOptions = function() {
					return __options__;
				};


				//=======================
				// Hooks
				//=======================
				
				_shared.popupExceptionHook = function popupExceptionHook(ex, /*optional*/obj, /*optional*/attr, /*optional*/caller) {
					root.DD_ASSERT && root.DD_ASSERT(types.isError(ex));
					global.alert && global.alert(ex.message);
				};
				
				_shared.catchExceptionHook = function catchExceptionHook(ex, /*optional*/obj, /*optional*/attr, /*optional*/caller) {
					var doodad = root.Doodad,
						tools = doodad.Tools;
					types.Error.prototype.parse.apply(ex);
					if (ex.stack) {
						tools.log(tools.LogLevels.Error, ex.stack);
					} else {
						tools.log(tools.LogLevels.Error, "[~0~] in '~1~.~2~' at '~3~:~4~:~5~'.", [
							/*0*/ ex.toString(), 
							/*1*/ (caller && types.unbox(caller[__Internal__.symbolPrototype].$TYPE_NAME)) || types.getTypeName(obj) || '<unknown>',
							/*2*/ attr || ex.functionName || '<unknown>',
							/*3*/ ex.fileName || '<unknown>', 
							/*4*/ types.isNothing(ex.lineNumber) ? -1 : ex.lineNumber, 
							/*5*/ types.isNothing(ex.columnNumber) ? -1 : ex.columnNumber
						]);
					};
					if (root.getOptions().debug) {
						debugger;
					};
				};
				
				
				//=======================
				// Namespace entries
				//=======================

				entries.Type = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								root: {
									type: 'Root',
									optional: false,
									description: "Root namespace object",
								},
								spec: {
									type: 'object',
									optional: false,
									description: "Namespace specifications",
								},
								namespace: {
									type: 'Namespace',
									optional: false,
									description: "Namespace object",
								},
							},
							returns: 'TypeEntry',
							description: "Type registry entry.",
					}
					//! END_REPLACE()
					, types.INIT(entries.Namespace.$inherit(
						/*typeProto*/
						{
							$TYPE_NAME: 'TypeEntry',
						}
					)));

				//==================================
				// Exceptions
				//==================================
				
				exceptions.REGISTER(root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									title: {
										type: 'string',
										optional: false,
										description: "Message title",
									},
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
								description: "Application error with title and message formatting.",
					}
					//! END_REPLACE()
					, types.createErrorType('Application', types.Error, function _new(title, message, /*optional*/params) {
						root.DD_ASSERT && root.DD_ASSERT(types.isStringAndNotEmptyTrim(title), "Invalid title.");
						var error = types.Error.call(this, message, params);
						error.title = title;
						return error;
					})));

				doodad.trapException = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 2,
								params: {
									ex: {
										type: 'error',
										optional: false,
										description: "Trapped error object.",
									},
									obj: {
										type: 'object',
										optional: true,
										description: "Object.",
									},
									attr: {
										type: 'string,symbol',
										optional: true,
										description: "Attribute name.",
									},
									caller: {
										type: 'function',
										optional: true,
										description: "Caller function.",
									},
								},
								returns: 'error',
								description: "Errors manager.",
					}
					//! END_REPLACE()
					, function trapException(ex, /*optional*/obj, /*optional*/attr, /*optional*/caller) {
						if (!__Internal__.inTrapException) {
							__Internal__.inTrapException = true;
							ex = Object(ex);
							try {
								if (!ex.trapped) {
									if (!ex.bubble) {
										if (types._instanceof(ex, exceptions.Application)) {
											_shared.popupExceptionHook(ex, obj, attr, caller);
										} else {
											_shared.catchExceptionHook(ex, obj, attr, caller);
										};
									};
								};
							} catch(o) {
								if (o.critical) {
									throw o;
								} else if (!o.bubble) {
									try {
										tools.log(tools.LogLevels.Error, o.toString());
									} catch(p) {
									};
									if (root.getOptions().debug) {
										debugger;
									};
								};
							} finally {
								__Internal__.inTrapException = false;
								if (!ex.trapped) {
									ex.trapped = true;
									if (types.isNothing(ex.throwLevel)) {
										ex.throwLevel = 0;
									};
								};
							};
						};
						return ex;
					});

				//============================
				// Extend "Types.js"
				//============================

				doodad.INIT = types.INIT; // alias
				
				types.isClass = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'Class',
										optional: false,
										description: "Class to test for.",
									},
								},
								returns: 'bool',
								description: "Returns 'true' when object is a class. Returns 'false' otherwise.",
					}
					//! END_REPLACE()
					, function isClass(obj) {
						return !!obj && ((obj === doodad.Class) || types.baseof(doodad.Class, obj));
					});
				
				types.isBase = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'Class',
										optional: false,
										description: "Class to test for.",
									},
								},
								returns: 'bool',
								description: "Returns 'true' when object is a base type. Returns 'false' otherwise.",
					}
					//! END_REPLACE()
					, function isBase(obj) {
						return !!obj && ((obj === doodad.Class) || types.baseof(doodad.Class, obj)) && !!((obj[__Internal__.symbolModifiers] || 0) & doodad.ClassModifiers.Base);
					});
				
				types.isMixIn = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'Class',
										optional: false,
										description: "Class to test for.",
									},
								},
								returns: 'bool',
								description: "Returns 'true' when class is a mix-in. Returns 'false' otherwise.",
					}
					//! END_REPLACE()
					, function isMixIn(obj) {
						return !!obj && ((obj === doodad.Class) || types.baseof(doodad.Class, obj)) && !!((obj[__Internal__.symbolModifiers] || 0) & doodad.ClassModifiers.MixIn);
					});

				types.isInterface = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'Class',
										optional: false,
										description: "Class to test for.",
									},
								},
								returns: 'bool',
								description: "Returns 'true' when class is an interface. Returns 'false' otherwise.",
					}
					//! END_REPLACE()
					, function isInterface(obj) {
						return !!obj && ((obj === doodad.Class) || types.baseof(doodad.Class, obj)) && !!((obj[__Internal__.symbolModifiers] || 0) & doodad.ClassModifiers.Interface);
					});

				types.isIsolated = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'Class',
										optional: false,
										description: "Class to test for.",
									},
								},
								returns: 'bool',
								description: "Returns 'true' when class is an isolated interface. Returns 'false' otherwise.",
					}
					//! END_REPLACE()
					, function isIsolated(obj) {
						return !!obj && ((obj === doodad.Class) || types.baseof(doodad.Class, obj)) && !!((obj[__Internal__.symbolModifiers] || 0) & doodad.ClassModifiers.Isolated);
					});

				types.isNewable = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'Class',
										optional: false,
										description: "Class to test for.",
									},
								},
								returns: 'bool',
								description: "Returns 'true' when class is a class that can be instantiated. Returns 'false' otherwise.",
					}
					//! END_REPLACE()
					, function isNewable(obj) {
						return !!obj && ((obj === doodad.Class) || types.baseof(doodad.Class, obj)) && !((obj[__Internal__.symbolModifiers] || 0) & (doodad.ClassModifiers.Base | doodad.ClassModifiers.Interface | doodad.ClassModifiers.MixIn));
					});
				
				types.isSealed = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 1,
								params: {
									obj: {
										type: 'Object,Class',
										optional: false,
										description: "Object to test for.",
									},
								},
								returns: 'bool',
								description: "Returns 'true' when object is a sealed class. Returns 'false' otherwise.",
					}
					//! END_REPLACE()
					, function isSealed(obj) {
						if (types.isNothing(obj)) {
							return null;
						};
						if (types.isObject(obj)) {
							obj = types.getType(obj);
						};
						if (!obj) {
							return false;
						};
						if ((obj !== doodad.Class) && !types.baseof(doodad.Class, obj)) {
							return false;
						};
						return !!((obj[__Internal__.symbolModifiers] || 0) & doodad.ClassModifiers.Sealed);
					});
				
				types.isSerializable = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 1,
								params: {
									obj: {
										type: 'object',
										optional: false,
										description: "Object to test for.",
									},
								},
								returns: 'bool',
								description: "Returns 'true' when object is serealizable. Returns 'false' otherwise.",
					}
					//! END_REPLACE()
					, function isSerializable(obj) {
						return types.isNothing(obj) || (types.isPrimitive(obj) && !types.isSymbol(obj)) || types.isArray(obj) || types.isJsObject(obj) || types.isError(obj) || types._implements(obj, interfaces.Serializable);
					});
				
				types._implements = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 1,
								params: {
									obj: {
										type: 'Object,Class',
										optional: false,
										description: "Object to test for.",
									},
									cls: {
										type: 'arrayof(Class),Class',
										optional: false,
										description: "Classes.",
									},
								},
								returns: 'bool',
								description: "Returns 'true' when object implements one of the specified classes. Returns 'false' otherwise.",
					}
					//! END_REPLACE()
					, function _implements(obj, cls) {
						if (!types.isLike(obj, doodad.Class)) {
							return false;
						};
						return obj._implements(cls);
					});

				types.getImplements = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 1,
								params: {
									obj: {
										type: 'Object,Class',
										optional: false,
										description: "Object to test for.",
									},
								},
								returns: 'objectof(Class)',
								description: "Returns the implementations of an object.",
					}
					//! END_REPLACE()
					, function getImplements(obj) {
						var cls = types.getType(obj);
						if (!cls) {
							return null;
						};
						if ((cls !== doodad.Class) && !types.baseof(doodad.Class, cls)) {
							return null;
						};
						return types.toArray(_shared.getAttribute(obj, __Internal__.symbolImplements));
					});
				
				types.isMethod = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 1,
								params: {
									obj: {
										type: 'Object,Class',
										optional: false,
										description: "Object to test for.",
									},
									name: {
										type: 'string,Symbol',
										optional: false,
										description: "Method name.",
									},
								},
								returns: 'bool',
								description: "Returns 'true' if method exists. Returns 'false' otherwise. Throws an error when not of public scope.",
					}
					//! END_REPLACE()
					, function isMethod(obj, name) {
						var isType = types.isType(obj),
							type = types.getType(obj);
						if (!type) {
							return false;
						};
						var attrs = _shared.getAttribute(obj, __Internal__.symbolAttributes);
						if (!(name in attrs)) {
							return false;
						};
						var attr = attrs[name],
							extender = attr[__Internal__.symbolExtender];
						if (!types.isLike(extender, extenders.Method)) {
							return false;
						};
						if ((isType && !extender.isType) || (!isType && !extender.isInstance)) {
							return false;
						};
						return true;
					});

				types.isImplemented = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 2,
								params: {
									obj: {
										type: 'Object,Class',
										optional: false,
										description: "Object to test for.",
									},
									name: {
										type: 'string,Symbol',
										optional: false,
										description: "Method name.",
									},
								},
								returns: 'bool',
								description: "Returns 'true' if method exists and is implemented. Returns 'false' otherwise.",
					}
					//! END_REPLACE()
					, function isImplemented(obj, name) {
						if (!types.isLike(obj, doodad.Class)) {
							return false;
						};
						return obj.isImplemented(name);
					});
				
				__Internal__.makeInside = function makeInside(/*optional*/obj, fn, /*optional*/secret) {
					root.DD_ASSERT && root.DD_ASSERT(!types.isCallback(fn), "Invalid function.");
					fn = types.unbind(fn);
					root.DD_ASSERT && root.DD_ASSERT(types.isBindable(fn), "Invalid function.");
					var _dispatch = null;
					if (types.isNothing(obj)) {
						_dispatch = function dispatch(/*paramarray*/) {
							var type = types.getType(this);
							if ((type !== __Internal__.invokedClass) && (secret !== _shared.SECRET)) {
								throw new types.Error("Invalid secret.");
							};
							var oldInvokedClass = __Internal__.invokedClass;
							__Internal__.invokedClass = type;
							try {
								return fn.apply(this, arguments);
							} catch(ex) {
								throw ex;
							} finally {
								__Internal__.invokedClass = oldInvokedClass;
							};
						};
					} else {
						var type = types.getType(obj);
						if ((type !== __Internal__.invokedClass) && (secret !== _shared.SECRET)) {
							throw new types.Error("Invalid secret.");
						};
						_dispatch = function dispatch(/*paramarray*/) {
							var oldInvokedClass = __Internal__.invokedClass;
							__Internal__.invokedClass = type;
							try {
								return fn.apply(obj, arguments);
							} catch(ex) {
								throw ex;
							} finally {
								__Internal__.invokedClass = oldInvokedClass;
							};
						};
					};
					_dispatch[_shared.OriginalValueSymbol] = fn;
					return _dispatch;
				};
				
				__Internal__.makeInsideForNew = function makeInsideForNew() {
					return (
						"var oldInvokedClass = ctx.internal.invokedClass;" +
						"ctx.internal.invokedClass = ctx.getType(this);" +
						"try {" +
							"return this._new.apply(this, arguments) || this;" +
						"} catch(ex) {" +
							"throw ex;" +
						"} finally {" +
							"ctx.internal.invokedClass = oldInvokedClass;" +
						"};"
					);
				};
				
				__Internal__.oldMakeInside = _shared.makeInside;
				
				_shared.makeInside = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 2,
							params: {
								obj: {
									type: 'any',
									optional: true,
									description: "Object to bind to.",
								},
								fn: {
									type: 'function',
									optional: false,
									description: "Function.",
								},
								secret: {
									type: 'any',
									optional: true,
									description: "Confirms the secret.",
								},
							},
							returns: 'function',
							description: "Makes a function like called from inside an object.",
					}
					//! END_REPLACE()
					, function(/*optional*/obj, fn, /*optional*/secret) {
						if (types.isCallback(fn)) {
							throw new types.Error("Invalid function.");
						};
						if (types.isNothing(obj)) {
							return fn;
						} else if (types.isClass(types.getType(obj))) {
							return __Internal__.makeInside(obj, fn, secret);
						} else {
							return __Internal__.oldMakeInside(obj, fn);
						};
					});
				
				__Internal__.oldInvoke = _shared.invoke;
				__Internal__.oldGetAttribute = _shared.getAttribute;
				__Internal__.oldGetAttributes = _shared.getAttributes;
				__Internal__.oldSetAttribute = _shared.setAttribute;
				__Internal__.oldSetAttributes = _shared.setAttributes;
				
				_shared.invoke = root.DD_DOC(
								root.DD_GET_DOC(__Internal__.oldInvoke), 
					function invoke(obj, fn, /*optional*/args, /*optional*/secret) {
						if (types.isCallback(fn)) {
							if (args) {
								return fn.apply(obj, args);
							} else {
								return fn.call(obj);
							};
						} else {
							if (secret !== _shared.SECRET) {
								throw new types.Error("Invalid secret.");
							};
							//var type = types.getType(obj);
							//if (types.isClass(type)) {
								var oldInvokedClass = __Internal__.invokedClass;
								__Internal__.invokedClass = types.getType(obj);
								try {
									if (types.isString(fn) || types.isSymbol(fn)) {
										fn = obj[fn];
									};
									if (args) {
										return fn.apply(obj, args);
									} else {
										return fn.call(obj);
									};
								} catch(ex) {
									throw ex;
								} finally {
									__Internal__.invokedClass = oldInvokedClass;
								};
							//} else {
							//	return __Internal__.oldInvoke(obj, fn, args);
							//};
						};
					});

				_shared.getAttribute = root.DD_DOC(
								root.DD_GET_DOC(__Internal__.oldGetAttribute), 
					function getAttribute(obj, attr) {
						var type = types.getType(obj);
						if (types.isClass(type)) {
							var oldInvokedClass = __Internal__.invokedClass;
							__Internal__.invokedClass = type;
							try {
								var storage = types.get(obj, __Internal__.symbolAttributesStorage);
								if (types.hasIn(storage, attr)) {
									return storage[attr];
								} else {
									return __Internal__.oldGetAttribute(obj, attr);
								};
							} catch(ex) {
								throw ex;
							} finally {
								__Internal__.invokedClass = oldInvokedClass;
							};
						} else {
							return __Internal__.oldGetAttribute(obj, attr);
						};
					});
				
				_shared.getAttributes = root.DD_DOC(
								root.DD_GET_DOC(__Internal__.oldGetAttributes), 
					function getAttributes(obj, attrs) {
						var type = types.getType(obj);
						if (types.isClass(type)) {
							var oldInvokedClass = __Internal__.invokedClass;
							__Internal__.invokedClass = type;
							try {
								var storage = obj[__Internal__.symbolAttributesStorage];
								var attrsLen = attrs.length,
									result = {};
								for (var i = 0; i < attrsLen; i++) {
									var attr = attrs[i];
									if (types.hasIn(storage, attr)) {
										result[attr] = storage[attr];
									} else {
										result[attr] = __Internal__.oldGetAttribute(obj, attr);
									};
								};
								return result;
							} catch(ex) {
								throw ex;
							} finally {
								__Internal__.invokedClass = oldInvokedClass;
							};
						} else {
							return __Internal__.oldGetAttributes(obj, attrs);
						};
					});
				
				_shared.setAttribute = root.DD_DOC(
								root.DD_GET_DOC(__Internal__.oldSetAttribute), 
					function setAttribute(obj, attr, value, /*optional*/options) {
						var type = types.getType(obj);
						if (types.isClass(type)) {
							var oldInvokedClass = __Internal__.invokedClass;
							__Internal__.invokedClass = type;
							try {
								var storage = types.get(obj, __Internal__.symbolAttributesStorage);
								if (types.hasIn(storage, attr)) {
									storage[attr] = value;
									return value;
								} else {
									return __Internal__.oldSetAttribute(obj, attr, value, options);
								};
							} catch(ex) {
								throw ex;
							} finally {
								__Internal__.invokedClass = oldInvokedClass;
							};
						} else {
							return __Internal__.oldSetAttribute(obj, attr, value, options);
						};
					});
				
				_shared.setAttributes = root.DD_DOC(
								root.DD_GET_DOC(__Internal__.oldSetAttributes), 
					function setAttributes(obj, values, /*optional*/options) {
						var type = types.getType(obj);
						if (types.isClass(type)) {
							var oldInvokedClass = __Internal__.invokedClass;
							__Internal__.invokedClass = type;
							try {
								var storage = obj[__Internal__.symbolAttributesStorage];
								var keys = types.append(types.keys(values), types.symbols(values)),
									keysLen = keys.length;
								for (var i = 0; i < keysLen; i++) {
									var key = keys[i];
									if (types.hasIn(storage, key)) {
										storage[key] = values[key];
									} else {
										__Internal__.oldSetAttribute(obj, key, values[key], options);
									};
								};
								return values;
							} catch(ex) {
								throw ex;
							} finally {
								__Internal__.invokedClass = oldInvokedClass;
							};
						} else {
							return __Internal__.oldSetAttributes(obj, values, options);
						};
					});

				__Internal__.oldTypesIsClonable = types.isClonable;
				types.isClonable = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
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
						return types._implements(obj, mixIns.Clonable) || __Internal__.oldTypesIsClonable.call(this, obj, cloneFunctions);
					});

				__Internal__.oldTypesClone = types.clone;
				types.clone = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 1,
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
								keepUnlocked: {
									type: 'bool',
									optional: true,
									description: "When 'true', the result will not get locked (frozen or not extensible) when the original object was. When 'false', the result will get locked as the original. Default is 'false'.",
								},
							},
							returns: 'any',
							description: "Clone a value.",
					}
					//! END_REPLACE()
					, function clone(obj, /*optional*/depth, /*optional*/cloneFunctions, /*optional*/keepUnlocked) {
						if (types._implements(obj, mixIns.Clonable)) {
							return obj.clone();
						} else {
							return __Internal__.oldTypesClone.call(this, obj, depth, cloneFunctions, keepUnlocked);
						};
					});
				
				_shared.getAttributeDescriptor = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 4,
								params: {
									obj: {
										type: 'Object,Type',
										optional: false,
										description: "Object to test for.",
									},
									name: {
										type: 'string,Symbol',
										optional: false,
										description: "Attribute name.",
									},
								},
								returns: 'AttributeBox',
								description: "Returns the descriptor of an attribute, or 'null' if attribute doesn't exist.",
					}
					//! END_REPLACE()
					, function getAttributeDescriptor(obj, name) {
						var type = types.getType(obj);
						if (!types.isClass(type)) {
							return undefined;
						};
						var attrs = _shared.getAttribute(obj, __Internal__.symbolAttributes);
						var attr = attrs[name];
						return attr;
					});
					
				//==================================
				// Namespace object
				//==================================

				_shared.REGISTER = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 6,
								paramsDirection: 'rightToLeft',
								params: {
									type: {
										type: 'Type',
										optional: false,
										description: "Type to register.",
									}, 
									protect: {
										type: 'bool',
										optional: true,
										description: "'true' will protect the namespace object. 'false' will not. Default is 'true'."
									},
									args: {
										type: 'arrayof(any)',
										optional: true,
										description: "Arguments of the constructor.",
									}, 
								},
								returns: 'Type',
								description: "Registers the specified type to the current namespace object and returns the specified type. Also validates and initializes that type.",
					}
					//! END_REPLACE()
					, function REGISTER(/*<<< optional*/args, /*optional*/protect, type) {
						var args;
						if (arguments.length <= 1) {
							type = args;
							protect = true;
							args = undefined;
						} else if (arguments.length <= 2) {
							type = protect;
							protect = args;
							args = undefined;
						};
						
						//root.DD_ASSERT && root.DD_ASSERT(types.isType(type) || types.isErrorType(type), "Invalid type.");
						
						var isSingleton = types.isSingleton(type),
							isNamespace = (type === types.Namespace) || types.baseof(types.Namespace, type),
							name = (types.getTypeName(type) || types.getFunctionName(type)),
							fullName = (name ? ((this !== root) && (this instanceof types.Namespace) ? this.DD_FULL_NAME + '.' : '') + name : ''),
							isPrivate = (!name || (name.slice(0, 2) === '__'));
						
						if (isNamespace) {
							if (!types.isInitialized(type)) {
								if (types.isType(type) && !isSingleton && !types.isMixIn(type) && !types.isInterface(type) && !types.isBase(type)) {
									if ((root.getOptions().debug || __options__.enforcePolicies)) {
										var mustOverride = type[__Internal__.symbolMustOverride];
										if (mustOverride) {
											throw new types.Error("You must override the method '~0~' of type '~1~'.", [mustOverride, types.getTypeName(type)]);
										};
									};
								};
								
								type = types.INIT(type, types.append([this, name, fullName], args));
							};
						} else {
							_shared.setAttributes(type, {
								DD_PARENT: this,
								DD_NAME: name,
								DD_FULL_NAME: fullName,
							}, {});

							if (!types.isErrorType(type)) {
								type = types.INIT(type, args);
							};
						};
						
						if (!isPrivate) {
							// Public type
							var regNamespace = namespaces.get(fullName);
							if (regNamespace) {
								var result = this.UNREGISTER(regNamespace);
								if (!result) {
									return null;
								};
							};
							
							var entry = new entries.Type(root, null, type, {protect: protect});
							entry.init();
							namespaces.add(fullName, entry, {secret: _shared.SECRET});
						};
						
						return type;
					});
				
				// TODO: Review and test
				_shared.UNREGISTER = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 4,
								params: {
									type: {
										type: 'Type',
										optional: false,
										description: "Type to unregister.",
									}, 
								},
								returns: 'bool',
								description: "Unregisters the specified type from its namespace object and returns 'true' when successful. Returns 'false' otherwise. Also destroys that type.",
					}
					//! END_REPLACE()
					, function UNREGISTER(type) {
						root.DD_ASSERT && root.DD_ASSERT(types.isType(type) || types.isSingleton(type) || types.isErrorType(type), "Invalid type.");
						
						var name = (type.DD_NAME || ''),
							isPrivate = (!name || (name.slice(0, 2) === '__')),
							isSingleton = types.isSingleton(type);
						
						if (!isPrivate) {
							var fullName = (isSingleton ? types.getType(type) : type).DD_FULL_NAME;
							var regNamespace = namespaces.get(fullName);
							if (regNamespace) {
								if (regNamespace.DD_PARENT !== this) {
									return false;
								};
								var result = namespaces.remove(fullName, null, {secret: _shared.SECRET});
								if (!result) {
									return false;
								};
							};
						};
						
						if (isSingleton) {
							if (types._implements(type, mixIns.Creatable)) {
								type.destroy();
							} else {
								_shared.invoke(type, '_delete', null, _shared.SECRET);
							};
							type = types.getType(type);
						};
						
						if (!isPrivate && !types.isErrorType(type) && !types.isMixIn(type) && !types.isInterface(type) && !types.isBase(type)) {
							if (types._implements(type, mixIns.Creatable)) {
								type.$destroy();
							} else if (types.isInitialized(type)) {
								_shared.invoke(type, '_delete', null, _shared.SECRET);
							};
						};
						
						return true;
					});
				
				
				root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 0,
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
								returns: 'TypeNamespace',
								description: "Type Namespace object.",
					}
					//! END_REPLACE()
					, doodad.REGISTER(types.Namespace.$inherit(
						//typeProto
						{
							$TYPE_NAME: 'TypeNamespace',
						}
					)));
				
				//==================================
				// Attribute extenders
				//==================================
				
				root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
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
							returns: 'Extender',
							description: "Base of every attribute extenders. Not to be used directly.",
					}
					//! END_REPLACE()
					, extenders.REGISTER(types.SINGLETON(doodad.TypeNamespace.$inherit(
						/*typeProto*/
						{
							$TYPE_NAME: "Extender",
							
							$cache: types.READ_ONLY(null),  // TODO: Protect from the outside
							
							$inherit: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
										author: "Claude Petit",
										revision: 0,
										params: {
											proto: {
												type: 'object',
												optional: false,
												description: "Instance prototype, including '$TYPE_NAME'.",
											},
										},
										returns: 'Extender',
										description: "Extends an extender with the specified prototype and returns a new extender.",
								}
								//! END_REPLACE()
								, types.SUPER(function $inherit(proto) {
									if (root.DD_ASSERT) {
										root.DD_ASSERT(types.isJsObject(proto), "Invalid extender prototype.");
										root.DD_ASSERT(types.isStringAndNotEmpty(types.unbox(proto.$TYPE_NAME)), "Extender prototype has no name.");
									};
									var name = proto.$TYPE_NAME;
									delete proto.$TYPE_NAME;
									var type = this._super(
										/*typeProto*/
										{
											$TYPE_NAME: name,
										},
										/*instanceProto*/
										proto
									);
									return type;
								})),

							_new: types.SUPER(function(parent, name, fullName) {
									this._super(parent, name, fullName);
									_shared.setAttributes(this, {
										$cache: types.nullObject(),
									}, {all: true});
								}),
						},
						/*instanceProto*/
						{
							notInherited: types.READ_ONLY(false),
							preExtend: types.READ_ONLY(false),
							isType: types.READ_ONLY(false),
							isInstance: types.READ_ONLY(false),
							isPersistent: types.READ_ONLY(false),
							isPreserved: types.READ_ONLY(false),

							$inherit: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
										author: "Claude Petit",
										revision: 0,
										params: {
											proto: {
												type: 'object',
												optional: false,
												description: "Instance prototype, including '$TYPE_NAME'.",
											},
										},
										returns: 'Extender',
										description: "Extends an extender with the specified prototype and returns a new extender.",
								}
								//! END_REPLACE()
								, function $inherit(proto) {
									return types.getType(this).$inherit(proto);
								}),

							_new: types.SUPER(function _new(/*optional*/options) {
									this._super();
									_shared.setAttributes(this, {
										notInherited: types.get(options, 'notInherited', this.notInherited),
										preExtend: types.get(options, 'preExtend', this.preExtend),
										isType: types.get(options, 'isType', this.isType),
										isInstance: types.get(options, 'isInstance', this.isInstance),
										isPersistent: types.get(options, 'isPersistent', this.isPersistent),
										isPreserved: types.get(options, 'isPreserved', this.isPreserved),
									}, {all: true});
								}),
							
							getCacheName: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
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
										description: "Builds a cache key from the extender's options so the extender object can be re-used. You can optionally override options with specified ones to retrieve or create a similar extender object.",
								}
								//! END_REPLACE()
								, function getCacheName(/*optional*/options) {
									return (types.get(options, 'notInherited', this.notInherited) ? '1' : '0') +
										',' + (types.get(options, 'preExtend', this.preExtend) ? '1' : '0') + 
										',' + (types.get(options, 'isType', this.isType) ? '1' : '0') + 
										',' + (types.get(options, 'isInstance', this.isInstance) ? '1' : '0') +
										',' + (types.get(options, 'isPersistent', this.isPersistent) ? '1' : '0') + 
										',' + (types.get(options, 'isPreserved', this.isPreserved) ? '1' : '0');
								}),
							get: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
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
										returns: 'Extender',
										description: "Retrieves a similar extender object from the cache having the specified options. If none exists, creates a new one. If no options is specified, should returns itself.",
								}
								//! END_REPLACE()
								, function get(/*optional*/options) {
									root.DD_ASSERT && root.DD_ASSERT(types.isNothing(options) || types.isObject(options), "Invalid options.");
									var type = types.getType(this),
										name = this.getCacheName(options),
										extender;
									if (name in type.$cache) {
										extender = type.$cache[name];
									} else {
										extender = new type(options);
										_shared.setAttribute(type.$cache, name, extender, {});
									};
									return extender;
								}),
							overrideOptions: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
										author: "Claude Petit",
										revision: 1,
										params: {
											options: {
												type: 'object',
												optional: false,
												description: "Object where to store the result.",
											},
											newOptions: {
												type: 'object,Extender',
												optional: false,
												description: "Options to apply.",
											},
											replace: {
												type: 'boolean',
												optional: false,
												description: "When true, replace options. When false, merge them.",
											},
										},
										returns: 'object',
										description: "Overrides the current options by the specified ones. Returns the 'options' parameter value, where result has been stored.",
								}
								//! END_REPLACE()
								, function overrideOptions(options, newOptions, /*optional*/replace) {
									if (replace) {
										types.fill(['notInherited', 'preExtend', 'isType', 'isInstance', 'isPersistent', 'isPreserved'], options, this, newOptions);
									} else {
										options.notInherited = !!newOptions.notInherited || this.notInherited;
										options.preExtend = !!newOptions.preExtend || this.preExtend;
										options.isType = !!newOptions.isType || this.isType;
										options.isInstance = !!newOptions.isInstance || this.isInstance;
										options.isPersistent = !!newOptions.isPersistent || this.isPersistent;
										options.isPreserved = !!newOptions.isPreserved || this.isPreserved;
									};
									return options;
								}),
							override: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
										author: "Claude Petit",
										revision: 0,
										params: {
											extender: {
												type: 'Extender',
												optional: false,
												description: "Extender object to override with.",
											},
										},
										returns: 'Extender',
										description: "Overrides the current extender object by another extender object and returns the resulting extender object.",
								}
								//! END_REPLACE()
								, function override(extender) {
									if (types._instanceof(extender, types.getType(this))) {
										// Override
										var options = {};
										options = extender.overrideOptions(options, this);
										return extender.get(options);
									} else {
										return this;
									};
								}),
							getValue: types.READ_ONLY(null), // function getValue(attr, attribute, forType)
							extend: types.READ_ONLY(null),   // function extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, proto, protoName)
							postExtend: types.READ_ONLY(null), // function postExtend(attr, destAttributes, destAttribute)
							init: types.READ_ONLY(null), // function init(attr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value)
							remove: types.READ_ONLY(null), // function remove(attr, obj, storage, forType, attribute)
						}
					))));
				
				doodad.AttributeGetter = function() {};
				doodad.AttributeSetter = function() {};

				root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
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
							returns: 'Extender',
							description: "Attribute extender.",
					}
					//! END_REPLACE()
					, extenders.REGISTER(extenders.Extender.$inherit({
						$TYPE_NAME: "Attribute",
						
						isReadOnly: types.READ_ONLY(false),
						isEnumerable: types.READ_ONLY(true),
						enableScopes: types.READ_ONLY(true),
						
						getterTemplate: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 2,
									params: {
										attr: {
											type: 'string,symbol',
											optional: false,
											description: "Attribute name.",
										},
										boxed: {
											type: 'AttributeBox',
											optional: false,
											description: "Attribute box.",
										},
										forType: {
											type: 'bool',
											optional: false,
											description: "When 'true', 'this' will be the type. When 'false', 'this' will be an instance.",
										},
										storage: {
											type: 'object',
											optional: true,
											description: "Storage object. Default is attribute '__ATTRIBUTES_STORAGE' for instances, or attribute '$__ATTRIBUTES_STORAGE' for types.",
										},
									},
									returns: 'function',
									description: "Creates a getter function for an attribute.",
							}
							//! END_REPLACE()
							, function getterTemplate(attr, boxed, forType, /*optional*/storage) {
								var extender = this;
								var cache = {
									obj: null,
									storage: null,
								};
								return types.setPrototypeOf(function getter() {
									if (root.getOptions().debug || __options__.enforceScopes) {
										if (extender.enableScopes) {
											var type = types.getType(this);
											if (!__Internal__.invokedClass || (type !== __Internal__.invokedClass)) {
												var result = _shared.getAttributes(this, [__Internal__.symbolCurrentDispatch, __Internal__.symbolCurrentCallerIndex]);
												var dispatch = result[__Internal__.symbolCurrentDispatch],
													caller = result[__Internal__.symbolCurrentCallerIndex];
												if (boxed[__Internal__.symbolScope] === doodad.Scopes.Private) {
													if (!dispatch || (dispatch[__Internal__.symbolCallers][caller][__Internal__.symbolPrototype] !== boxed[__Internal__.symbolPrototype])) {
														throw new types.Error("Attribute '~0~' of '~1~' is private.", [attr, types.getTypeName(this) || __Internal__.ANONYMOUS]);
													};
												} else if (boxed[__Internal__.symbolScope] === doodad.Scopes.Protected) {
													if (!dispatch) {
														throw new types.Error("Attribute '~0~' of '~1~' is protected.", [attr, types.getTypeName(this) || __Internal__.ANONYMOUS]);
													};
												};
											};
										};
									};
									if (storage) {
										return storage[attr];
									} else {
										if (cache.obj !== this) {
											cache.obj = this;
											cache.storage = _shared.invoke(this, function() {return this[__Internal__.symbolAttributesStorage]}, null, _shared.SECRET);
										};
										return cache.storage[attr];
									};
								}, doodad.AttributeGetter);
							}),
						setterTemplate: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 2,
									params: {
										attr: {
											type: 'string,symbol',
											optional: false,
											description: "Attribute name.",
										},
										boxed: {
											type: 'AttributeBox',
											optional: false,
											description: "Attribute box.",
										},
										forType: {
											type: 'bool',
											optional: false,
											description: "When 'true', 'this' will be the type. When 'false', 'this' will be an instance.",
										},
										storage: {
											type: 'object',
											optional: true,
											description: "Storage object. Default is attribute '__ATTRIBUTES_STORAGE' for instances, or attribute '$__ATTRIBUTES_STORAGE' for types.",
										},
									},
									returns: 'function',
									description: "Creates a setter function for an attribute.",
							}
							//! END_REPLACE()
							, function setterTemplate(attr, boxed, forType, /*optional*/storage) {
								var extender = this;
								var cache = {
									obj: null,
									storage: null,
								};
								return types.setPrototypeOf(function setter(value) {
									if (root.getOptions().debug || __options__.enforceScopes) {
										if (extender.enableScopes) {
											var type = types.getType(this);
											if (!__Internal__.invokedClass || (type !== __Internal__.invokedClass)) {
												var result = _shared.getAttributes(this, [__Internal__.symbolCurrentDispatch, __Internal__.symbolCurrentCallerIndex]);
												var dispatch = result[__Internal__.symbolCurrentDispatch],
													caller = result[__Internal__.symbolCurrentCallerIndex];
												if (boxed[__Internal__.symbolScope] === doodad.Scopes.Private) {
													if (!dispatch || (dispatch[__Internal__.symbolCallers][caller][__Internal__.symbolPrototype] !== boxed[__Internal__.symbolPrototype])) {
														throw new types.Error("Attribute '~0~' of '~1~' is private.", [attr, types.getTypeName(this) || __Internal__.ANONYMOUS]);
													};
												} else if (boxed[__Internal__.symbolScope] === doodad.Scopes.Protected) {
													if (!dispatch) {
														throw new types.Error("Attribute '~0~' of '~1~' is protected.", [attr, types.getTypeName(this) || __Internal__.ANONYMOUS]);
													};
												};
											};
										};
									};
									if ((root.getOptions().debug || __options__.enforcePolicies) && extender.isReadOnly) {
										throw new types.Error("Attribute '~0~' of '~1~' is read-only.", [attr, types.getTypeName(this) || __Internal__.ANONYMOUS]);
									} else {
										if (storage) {
											storage[attr] = value;
										} else {
											if (cache.obj !== this) {
												cache.obj = this;
												cache.storage = _shared.invoke(this, function() {return this[__Internal__.symbolAttributesStorage]}, null, _shared.SECRET);
											};
											cache.storage[attr] = value;
										};
									};
									return value;
								}, doodad.AttributeSetter);
							}),
						
						_new: types.SUPER(function _new(/*optional*/options) {
								this._super(options);
								_shared.setAttributes(this, {
									isReadOnly: types.get(options, 'isReadOnly', this.isReadOnly),
									isEnumerable: types.get(options, 'isEnumerable', this.isEnumerable),
									enableScopes: types.get(options, 'enableScopes', this.enableScopes),
								}, {all: true});
							}),
						getCacheName: types.SUPER(function getCacheName(/*optional*/options) {
								return this._super(options) + 
									',' + (types.get(options, 'isReadOnly', this.isReadOnly) ? '1' : '0') +
									',' + (types.get(options, 'isEnumerable', this.isEnumerable) ? '1' : '0') +
									',' + (types.get(options, 'enableScopes', this.enableScopes) ? '1' : '0');
							}),
						overrideOptions: types.SUPER(function overrideOptions(options, newOptions, /*optional*/replace) {
								options = this._super(options, newOptions, replace);
								if (replace) {
									types.fill(['isReadOnly', 'isEnumerable', 'enableScopes'], options, this, newOptions);
								} else {
									options.isReadOnly = !!newOptions.isReadOnly || this.isReadOnly;
									options.isEnumerable = !!newOptions.isEnumerable || this.isEnumerable;
									options.enableScopes = !!newOptions.enableScopes || this.enableScopes;
								};
								return options;
							}),
						
						extend: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 1,
									params: {
										attr: {
											type: 'string,symbol',
											optional: false,
											description: "Attribute name.",
										},
										source: {
											type: 'Class,object',
											optional: false,
											description: "Source class.",
										},
										sourceProto: {
											type: 'object',
											optional: false,
											description: "Source prototype.",
										},
										destAttributes: {
											type: 'objectof(AttributeBox)',
											optional: false,
											description: "Attributes of the new class.",
										},
										forType: {
											type: 'bool',
											optional: false,
											description: "When 'true', the target object is the type. When 'false', the target object is an instance.",
										},
										sourceAttribute: {
											type: 'AttributeBox',
											optional: false,
											description: "Current source attribute.",
										},
										destAttribute: {
											type: 'AttributeBox',
											optional: false,
											description: "Attribute value already present in the destination.",
										},
										sourceIsProto: {
											type: 'bool',
											optional: false,
											description: "When 'true', the source is a prototype. When 'false', the source is a Class.",
										},
									},
									returns: 'AttributeBox',
									description: "Extends an attributes, taking the base value into account.",
							}
							//! END_REPLACE()
							, function extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, proto, protoName) {
								if (root.getOptions().debug || __options__.enforcePolicies) {
									if (sourceIsProto) {
										if (!types.isNothing(types.unbox(destAttribute)) && (destAttribute[__Internal__.symbolScope] === doodad.Scopes.Private)) {
											throw new types.Error("Private attribute '~0~' of '~1~' can't be overridden.", [attr, types.unbox(destAttribute[__Internal__.symbolPrototype].$TYPE_NAME) || __Internal__.ANONYMOUS]);
										};
									};
								};
								if (sourceIsProto) {
									destAttribute[__Internal__.symbolPrototype] = sourceProto;
								} else {
									destAttribute[__Internal__.symbolPrototype] = proto;
								};
								return sourceAttribute;
							}),
						__isFromStorage: function __isFromStorage(destAttribute) {
								return (
										types.hasDefinePropertyEnabled()
										&&
										(
											(
												(root.getOptions().debug || __options__.enforceScopes) 
												&& 
												(this.enableScopes && (destAttribute[__Internal__.symbolScope] !== doodad.Scopes.Public))
											) 
											||
											(
												(root.getOptions().debug || __options__.enforcePolicies)
												&&
												(this.isReadOnly)
											)
										) 
								);
						},
						__createProperty: function __createProperty(attr, proto, typeStorage, instanceStorage, forType, destAttribute, value) {
								var storage = (forType ? typeStorage : instanceStorage);

								storage[attr] = value;
									
								if (attr !== __Internal__.symbolAttributesStorage) {
									storage = null;
								};
								
								var descriptor = types.getOwnPropertyDescriptor(proto, attr);

								if (
									storage ||
									!descriptor ||
									descriptor.configurable ||
									!types.isPrototypeOf(doodad.AttributeGetter, descriptor.get) ||
									(!types.isNothing(descriptor.set) && !types.isPrototypeOf(doodad.AttributeSetter, descriptor.set))
								) {
									var descriptor = {
										configurable: false,
										enumerable: this.isEnumerable,
										get: this.getterTemplate(attr, destAttribute, forType, storage),
									};

									if (!this.isReadOnly) {
										descriptor.set = this.setterTemplate(attr, destAttribute, forType, storage);
									};

									types.defineProperty(proto, attr, descriptor);
								};
							},
						init: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 2,
									params: {
										attr: {
											type: 'string,symbol',
											optional: false,
											description: "Attribute name.",
										},
										obj: {
											type: 'Object',
											optional: false,
											description: "Target object.",
										},
										attributes: {
											type: 'objectof(AttributeBox)',
											optional: false,
											description: "Attributes of the target class.",
										},
										typeStorage: {
											type: 'object',
											optional: false,
											description: "Storage for the values of type attributes.",
										},
										instanceStorage: {
											type: 'object',
											optional: false,
											description: "Storage for the values of instance attributes.",
										},
										forType: {
											type: 'bool',
											optional: false,
											description: "When 'true', the target object is the type. When 'false', the target object is an instance.",
										},
										attribute: {
											type: 'AttributeBox',
											optional: false,
											description: "Current attribute.",
										},
										value: {
											type: 'any',
											optional: false,
											description: "Current attribute value.",
										},
									},
									returns: 'undefined',
									description: "Initializes an attribute for a new object instance.",
							}
							//! END_REPLACE()
							, function init(attr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value) {
								if (attr === __Internal__.symbolAttributesStorage) {
									value = (forType ? typeStorage : instanceStorage);
								};

								if (this.__isFromStorage(attribute)) {
									this.__createProperty(attr, obj, typeStorage, instanceStorage, forType, attribute, value);
								} else {
									_shared.setAttribute(obj, attr, value, {configurable: this.isReadOnly, enumerable: this.isEnumerable, writable: !this.isReadOnly});
								};
							}),
						remove: types.SUPER(function remove(attr, obj, storage, forType, attribute) {
								if (!this.isPersistent) {
									delete storage[attr];
									//	var descriptor = types.getOwnPropertyDescriptor(obj, attr);
									//	if (types.get(descriptor, 'configurable')) {
									//		delete obj[attr];
									//	};
								};
							}),
					})));

				root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
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
							returns: 'Extender',
							description: "Attribute extender where the value will be always 'null'.",
					}
					//! END_REPLACE()
					, extenders.REGISTER(extenders.Attribute.$inherit({
						$TYPE_NAME: "Null",
						
						extend: types.READ_ONLY(null),

						init: types.SUPER(function init(attr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value) {
								this._super(attr, obj, attributes, typeStorage, instanceStorage, forType, attribute, null);
							}),
					})));
				
				root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
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
							returns: 'Extender',
							description: "Attribute extender where the value will get cloned if possible. Additionally, the attribute itself can get cloned.",
					}
					//! END_REPLACE()
					, extenders.REGISTER(extenders.Attribute.$inherit({
						$TYPE_NAME: "ClonedAttribute",
						
						maxDepth: types.READ_ONLY(0),
						keepUnlocked: types.READ_ONLY(false),
						cloneOnInit: types.READ_ONLY(false),
						
						_new: types.SUPER(function _new(/*optional*/options) {
								this._super(options);
								_shared.setAttributes(this, {
									maxDepth: types.get(options, 'maxDepth', this.maxDepth),
									keepUnlocked: types.get(options, 'keepUnlocked', this.keepUnlocked),
									cloneOnInit: types.get(options, 'cloneOnInit', this.cloneOnInit),
								}, {all: true});
							}),
						getCacheName: types.SUPER(function getCacheName(/*optional*/options) {
								return this._super(options) + 
									',' + types.get(options, 'maxDepth', this.maxDepth) +
									',' + (types.get(options, 'keepUnlocked', this.keepUnlocked) ? '1' : '0') +
									',' + (types.get(options, 'cloneOnInit', this.cloneOnInit) ? '1' : '0');
							}),
						overrideOptions: types.SUPER(function overrideOptions(options, newOptions, /*optional*/replace) {
								options = this._super(options, newOptions, replace);
								if (replace) {
									types.fill(['maxDepth', 'keepUnlocked', 'cloneOnInit'], options, this, newOptions);
								} else {
									options.maxDepth = Math.max(newOptions.maxDepth | 0, this.maxDepth);
									options.keepUnlocked = !!newOptions.keepUnlocked || this.keepUnlocked;
									options.cloneOnInit = !!newOptions.cloneOnInit || this.cloneOnInit;
								};
								return options;
							}),
						
						getValue: types.SUPER(function getValue(attr, attribute, forType) {
								var val = types.unbox(attribute);
								if (types.isClonable(val)) {
									val = types.clone(val, this.maxDepth, false, this.keepUnlocked);
									attribute = attribute.setValue(val);
								};
								return attribute;
							}),
						init: types.SUPER(function init(attr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value) {
								if (this.cloneOnInit) {
									value = types.clone(value, this.maxDepth, false, this.keepUnlocked);
								};
								
								this._super(attr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value);
							}),
					})));

				root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
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
							returns: 'Extender',
							description: "Attribute extender which extends an object.",
					}
					//! END_REPLACE()
					, extenders.REGISTER(extenders.ClonedAttribute.$inherit({
						$TYPE_NAME: "ExtendObject",
						
						extend: types.SUPER(function extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, proto, protoName) {
								sourceAttribute = this._super(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, protoName);
								
								var dest = types.unbox(destAttribute);
								if (!dest) {
									dest = {};
								};
									
								var src = types.unbox(sourceAttribute);
								if (src) {
									types.depthExtend(this.maxDepth, dest, src);
								};
								
								sourceAttribute = sourceAttribute.setValue(dest);  // keep attribute flags of "sourceAttribute"
								
								return sourceAttribute;
							}),
					})));
				
				root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
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
							returns: 'Extender',
							description: "Attribute extender which extends an array with unique items.",
					}
					//! END_REPLACE()
					, extenders.REGISTER(extenders.ClonedAttribute.$inherit({
						$TYPE_NAME: "UniqueArray",
						
						extend: types.SUPER(function extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, proto, protoName) {
								sourceAttribute = this._super(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, protoName);
								
								var dest = types.unbox(destAttribute);
								if (!dest) {
									dest = [];
								};
									
								var src = types.unbox(sourceAttribute);
								if (src) {
									types.append(dest, src);
								};
								
								sourceAttribute = sourceAttribute.setValue(dest);  // preserve attribute flags of "sourceAttribute"
								
								return sourceAttribute;
							}),
						init: types.SUPER(function init(attr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value) {
								if (!types.isNothing(value)) {
									value = types.unique(value);
								};
								
								this._super(attr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value);
							}),
					})));
				
				root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
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
							returns: 'Extender',
							description: "Attribute extender which extends a method.",
					}
					//! END_REPLACE()
					, extenders.REGISTER(extenders.ClonedAttribute.$inherit({
						$TYPE_NAME: "Method",
						
						keepUnlocked: types.READ_ONLY(true),

						bindMethod: types.READ_ONLY(false),
						notReentrant: types.READ_ONLY(false),
						isReadOnly: types.READ_ONLY(true),
						byReference: types.READ_ONLY(true),
						isExternal: types.READ_ONLY(false),
						
						callerTemplate: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 3,
									params: {
										attr: {
											type: 'string,symbol',
											optional: false,
											description: "Attribute name.",
										},
										sourceAttribute: {
											type: 'AttributeBox',
											optional: false,
											description: "Current attribute.",
										},
										destAttribute: {
											type: 'AttributeBox',
											optional: true,
											description: "Attribute already present in the destination.",
										},
									},
									returns: 'function',
									description: "Template function to create a caller.",
							}
							//! END_REPLACE()
							, function callerTemplate(attr, sourceAttribute, /*optional*/destAttribute) {
								var extender = this;
								var fn = types.unbox(sourceAttribute);
								var _caller = function caller(/*paramarray*/) {
									var oldSuper,
										currentCaller,
										_super,
										oldCalled = false;
									try {
										oldSuper = _shared.getAttribute(this, '_super');

										var type = types.getType(this);
										
										var result = _shared.getAttributes(this, [__Internal__.symbolCurrentDispatch, __Internal__.symbolCurrentCallerIndex]),
											currentDispatch = result[__Internal__.symbolCurrentDispatch],
											modifiers = currentDispatch[__Internal__.symbolModifiers],
											callers = currentDispatch[__Internal__.symbolCallers];

										currentCaller = result[__Internal__.symbolCurrentCallerIndex] + 1;
										if (currentCaller < callers.length) {
											_super = callers[currentCaller];
											oldCalled = _super[__Internal__.symbolCalled];
											_super[__Internal__.symbolCalled] = false;
										} else {
											_super = function() {};
											_super[__Internal__.symbolCalled] = true;
										};
										_shared.setAttribute(this, '_super', _super);
										_shared.setAttribute(this, __Internal__.symbolCurrentCallerIndex, currentCaller);
										
										fn = (extender.byReference ? fn : types.unbox(_caller[__Internal__.symbolPrototype][attr]));
										
										var retVal = fn.apply(this, arguments);

										if (modifiers & doodad.MethodModifiers.Async) {
											if (!types.isPromise(retVal)) {
												var Promise = types.getPromise();
												retVal = Promise.resolve(retVal);
											};
										};
										
										_caller[__Internal__.symbolCalled] = true;
										
										if (root.getOptions().debug || __options__.enforcePolicies) {
											if ((_caller[__Internal__.symbolModifiers] & doodad.MethodModifiers.Override) && !_super[__Internal__.symbolCalled]) {
												throw new types.Error("You must always call '_super' for method '~0~' of '~1~'. Use 'doodad.REPLACE' when '_super' is never called. Or call 'overrideSuper' instead of '_super' when '_super' is conditionally called.", [attr, types.getTypeName(this) || __Internal__.ANONYMOUS]);
											};
										};

										return retVal;
										
									} catch(ex) {
										if (attr === 'toString') {
											// <PRB> Javascript debugger calls "toString" internally. When an exception occurs inside "toString", it calls it again and again !
											try {
												return "Error: " + ex.toString();
											} catch(o) {
												return "Internal error";
											};
										} else if (ex.trapped || ex.bubble) {
											if (modifiers & doodad.MethodModifiers.Async) {
												var Promise = types.getPromise();
												return Promise.reject(ex);
											} else {
												throw ex;
											};
										} else {
											if (modifiers & doodad.MethodModifiers.Async) {
												var Promise = types.getPromise();
												return Promise.reject(doodad.trapException(ex, this, attr, _caller));
											} else {
												throw doodad.trapException(ex, this, attr, _caller);
											};
										};
										
									} finally {
										if (oldSuper !== undefined) {
											_shared.setAttribute(this, '_super', oldSuper);
										};
										if (currentCaller !== undefined) {
											_shared.setAttribute(this, __Internal__.symbolCurrentCallerIndex, currentCaller - 1);
										};
										if (_super !== undefined) {
											_super[__Internal__.symbolCalled] = oldCalled;
										};
									};
								};
								return _caller;
							}),
						dispatchTemplate: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 3,
									params: {
										attr: {
											type: 'string,symbol',
											optional: false,
											description: "Attribute name.",
										},
										attribute: {
											type: 'AttributeBox',
											optional: false,
											description: "Callers attribute.",
										},
										value: {
											type: 'arrayof(function)',
											optional: false,
											description: "Callers.",
										},
									},
									returns: 'function',
									description: "Template function to create a dispatch.",
							}
							//! END_REPLACE()
							, function(attr, attribute, callers) {
								var extender = this;
								var _dispatch = function dispatch(/*paramarray*/) {
									var type = types.getType(this),
										forType = types.isType(this),
										result = _shared.getAttributes(this, [__Internal__.symbolCurrentDispatch, __Internal__.symbolCurrentCallerIndex]), 
										oldDispatch = result[__Internal__.symbolCurrentDispatch], 
										oldCaller = result[__Internal__.symbolCurrentCallerIndex],
										oldInvokedClass = __Internal__.invokedClass;
									
									// External methods (can't be called internally)
									if (root.getOptions().debug || __options__.enforcePolicies) {
										if (extender.isExternal && (type === oldInvokedClass)) {
											throw new types.Error("Method '~0~' of '~1~' is external-only.", [_dispatch[_shared.NameSymbol], types.getTypeName(type) || __Internal__.ANONYMOUS]);
										};
									};
									
									// Public methods
									if (root.getOptions().debug || __options__.enforceScopes) {
										if (!oldInvokedClass || (type !== oldInvokedClass)) {
											if ((attribute[__Internal__.symbolScope] !== doodad.Scopes.Public) && !oldDispatch) {
												throw new types.Error("Method '~0~' of '~1~' is not public.", [_dispatch[_shared.NameSymbol], types.getTypeName(type) || __Internal__.ANONYMOUS]);
											};
										};
									};
									
									// <PRB> Javascript engine calls "toString" internally. When an exception occurs inside "toString", it calls it again and again !
									if ((extender.notReentrant || (attr === 'toString')) && oldDispatch && (_dispatch === oldDispatch)) {
										if (attr === 'toString') {
											return "Error: 'toString' is not reentrant.";
										} else {
											throw new types.Error("'~0~' is not reentrant.", [attr]);
										};
									};
									
									var modifiers = _dispatch[__Internal__.symbolModifiers];

									// Not implemented methods
									if (modifiers & doodad.MethodModifiers.NotImplemented) {
										throw new types.Error("Method '~0~' of '~1~' is not implemented.", [_dispatch[_shared.NameSymbol], types.getTypeName(type) || __Internal__.ANONYMOUS]);
									};
									
									// Obsolete methods
									if (modifiers & doodad.MethodModifiers.Obsolete) {
										tools.log(tools.LogLevels.Warning, "Method '~0~' of '~1~' is obsolete. ~2~", [_dispatch[_shared.NameSymbol], types.getTypeName(type) || __Internal__.ANONYMOUS, attribute[__Internal__.symbolUsageMessage] || '']);
										_dispatch[__Internal__.symbolModifiers] = (modifiers ^ doodad.MethodModifiers.Obsolete);
									};

									if (root.getOptions().debug || __options__.enforcePolicies) {
										// Must override methods
										if (modifiers & doodad.MethodModifiers.MustOverride) {
											throw new types.Error("You must override the method '~0~' in '~1~'.", [_dispatch[_shared.NameSymbol], types.getTypeName(type) || __Internal__.ANONYMOUS]);
										};
										
										// Destroyed objects
										if (this._implements(mixIns.Creatable)) {
											var destroyed = _shared.getAttribute(this, __Internal__.symbolDestroyed);
											if ((destroyed === null) && !forType && (attr !== 'create')) {
												throw new types.Error("Method '~0~' of '~1~' is unavailable because object has not been created.", [_dispatch[_shared.NameSymbol], types.getTypeName(type) || __Internal__.ANONYMOUS]);
											};
											if ((destroyed === true) && !(modifiers & doodad.MethodModifiers.CanBeDestroyed)) {
												throw new types.Error("Method '~0~' of '~1~' is unavailable because object has been destroyed.", [_dispatch[_shared.NameSymbol], types.getTypeName(type) || __Internal__.ANONYMOUS]);
											};
										};
									};

									var caller = _dispatch[__Internal__.symbolCallers][0];
									if (!caller) {
										// No caller
										return;
									};
									
									var oldCallerCalled = caller[__Internal__.symbolCalled];

									// Private methods
									if (root.getOptions().debug || __options__.enforceScopes) {
										if (!oldInvokedClass || (type !== oldInvokedClass)) {
											if ((attribute[__Internal__.symbolScope] === doodad.Scopes.Private) && oldDispatch && (oldDispatch[__Internal__.symbolCallers][oldCaller - 1][__Internal__.symbolPrototype] !== caller[__Internal__.symbolPrototype])) {
												throw new types.Error("Method '~0~' of '~1~' is private.", [_dispatch[_shared.NameSymbol], types.unbox(caller[__Internal__.symbolPrototype].$TYPE_NAME) || __Internal__.ANONYMOUS]);
											};
										};
									};
									
									var values = {};										
									values[__Internal__.symbolCurrentDispatch] = _dispatch;
									values[__Internal__.symbolCurrentCallerIndex] = 0;
									_shared.setAttributes(this, values);
									
									var oldHostDispatch,
										oldHostCaller,
										host;
									if (types.baseof(doodad.Interface, type) && this[__Internal__.symbolHost]) {
										host = this[__Internal__.symbolHost];
										var result = _shared.getAttributes(host, [__Internal__.symbolCurrentDispatch, __Internal__.symbolCurrentCallerIndex]),
											oldHostDispatch = result[__Internal__.symbolCurrentDispatch],
											oldHostCaller = result[__Internal__.symbolCurrentCallerIndex];
										var values = {};										
										values[__Internal__.symbolCurrentDispatch] = _dispatch;
										values[__Internal__.symbolCurrentCallerIndex] = 0;
										_shared.setAttributes(host, values);
									};
									
									__Internal__.invokedClass = type;
									
									try {
										
										
										caller[__Internal__.symbolCalled] = false;
										
										var retVal = caller.apply(this, arguments);

										if (modifiers & doodad.MethodModifiers.Async) {
											// Asynchronous methods must always return a Promise
											if (!types.isPromise(retVal)) {
												var Promise = types.getPromise();
												retVal = Promise.resolve(retVal);
											};
										};
										
										if (root.getOptions().debug || __options__.enforcePolicies) {
											var validator = attribute[__Internal__.symbolReturns];
											// <PRB> Javascript engine calls "toString" internally. When an exception occurs inside "toString", it calls it again and again !
											if (validator && !validator.call(this, retVal)) {
												if (attr === 'toString') {
													return tools.format("Invalid returned value from method '~0~'.", [attr]);
												} else {
													throw new types.Error("Invalid returned value from method '~0~'.", [attr]);
												};
											};
										};
										
										return retVal;
										
									} catch(ex) {
										if (attr === 'toString') {
											// <PRB> Javascript engine calls "toString" internally. When an exception occurs inside "toString", it calls it again and again !
											try {
												return "Error: " + ex.toString();
											} catch(o) {
												return "Internal error";
											};
										} else if (modifiers & doodad.MethodModifiers.Async) {
											// Asynchronous methods must always return a Promise
											var Promise = types.getPromise();
											return Promise.reject(ex);
										} else {
											throw ex;
										};
										
									} finally {
										__Internal__.invokedClass = oldInvokedClass;
										caller[__Internal__.symbolCalled] = oldCallerCalled;
										
										var values = {};										
										values[__Internal__.symbolCurrentDispatch] = oldDispatch;
										values[__Internal__.symbolCurrentCallerIndex] = oldCaller;
										_shared.setAttributes(this, values);
										
										if (host) {
											var values = {};										
											values[__Internal__.symbolCurrentDispatch] = oldHostDispatch;
											values[__Internal__.symbolCurrentCallerIndex] = oldHostCaller;
											_shared.setAttributes(host, values);
										};
									};
								};
								return _dispatch;
							}),
						createCaller: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 1,
									params: {
										attr: {
											type: 'string,symbol',
											optional: false,
											description: "Attribute name.",
										},
										sourceAttribute: {
											type: 'AttributeBox',
											optional: false,
											description: "Source attribute.",
										},
										destAttribute: {
											type: 'AttributeBox',
											optional: true,
											description: "Attribute already present in the destination.",
										},
									},
									returns: 'function',
									description: "Creates a caller from the template.",
							}
							//! END_REPLACE()
							, function createCaller(attr, sourceAttribute, /*optional*/destAttribute) {
								var fn = types.unbox(sourceAttribute);
								
								if (root.DD_ASSERT) {
									root.DD_ASSERT(types.isJsFunction(fn), "Invalid function.");
								};

								var caller = this.callerTemplate(attr, sourceAttribute, destAttribute);

								var values = {};
								values[__Internal__.symbolPrototype] = sourceAttribute[__Internal__.symbolPrototype];
								values[__Internal__.symbolModifiers] = (sourceAttribute[__Internal__.symbolModifiers] || 0);
								values[__Internal__.symbolPosition] = sourceAttribute[__Internal__.symbolPosition];
								values[__Internal__.symbolUsageMessage] = sourceAttribute[__Internal__.symbolUsageMessage];
								_shared.setAttributes(caller, values, {});
								
								return caller;
							}),
						createDispatch: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 2,
									params: {
										attr: {
											type: 'string,symbol',
											optional: false,
											description: "Attribute name.",
										},
										obj: {
											type: 'object',
											optional: false,
											description: "Target object.",
										},
										attribute: {
											type: 'AttributeBox',
											optional: false,
											description: "Array of callers.",
										},
										callers: {
											type: 'arrayof(function)',
											optional: false,
											description: "Array of callers.",
										},
									},
									returns: 'function',
									description: "Creates a dispatch from the template.",
							}
							//! END_REPLACE()
							, function createDispatch(attr, obj, attribute, callers) {
								if (root.DD_ASSERT) {
									root.DD_ASSERT(types.isArray(callers), "Invalid callers array.");
								};
								
								// Create dispatch function
								var dispatch = this.dispatchTemplate(attr, attribute, callers);
								_shared.setAttribute(dispatch, _shared.NameSymbol, attr, {});
								_shared.setAttribute(dispatch, __Internal__.symbolCallers, callers, {});
								
								var modifiers = attribute[__Internal__.symbolModifiers];

								// Clear "MustOverride" if method has been overriden
								var caller = callers.length && callers[0];
								if (caller && !((caller[__Internal__.symbolModifiers] || 0) & doodad.MethodModifiers.MustOverride)) {
									caller = (callers.length > attribute[__Internal__.symbolCallFirstLength]) && callers[attribute[__Internal__.symbolCallFirstLength]];
									if (!caller || !((caller[__Internal__.symbolModifiers] || 0) & doodad.MethodModifiers.MustOverride)) {
										modifiers = (modifiers || 0) & (~ doodad.MethodModifiers.MustOverride);
									};
								};

								_shared.setAttribute(dispatch, __Internal__.symbolModifiers, modifiers, {});

								return dispatch;
							}),
						
						_new: types.SUPER(function _new(/*optional*/options) {
								this._super(options);
								_shared.setAttributes(this, {
									bindMethod: types.get(options, 'bindMethod', this.bindMethod),
									notReentrant: types.get(options, 'notReentrant', this.notReentrant),
									byReference: types.get(options, 'byReference', this.byReference),
									isExternal: types.get(options, 'isExternal', this.isExternal),
								}, {all: true});
							}),
						getCacheName: types.SUPER(function getCacheName(/*optional*/options) {
								return this._super(options) + 
									',' + (types.get(options, 'bindMethod', this.bindMethod) ? '1' : '0') +
									',' + (types.get(options, 'notReentrant', this.notReentrant) ? '1' : '0') +
									',' + (types.get(options, 'byReference', this.byReference) ? '1' : '0') +
									',' + (types.get(options, 'isExternal', this.isExternal) ? '1' : '0');
							}),
						overrideOptions: types.SUPER(function overrideOptions(options, newOptions, /*optional*/replace) {
								options = this._super(options, newOptions, replace);
								if (replace) {
									types.fill(['bindMethod', 'notReentrant', 'byReference', 'isExternal'], options, this, newOptions);
								} else {
									options.bindMethod = !!newOptions.bindMethod || this.bindMethod;
									options.notReentrant = !!newOptions.notReentrant || this.notReentrant;
									options.byReference = !!newOptions.byReference || this.byReference;
									options.isExternal = !!newOptions.isExternal || this.isExternal;
								};
								return options;
							}),
						
						extend: types.SUPER(function extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, proto, protoName) {
								sourceAttribute = this._super(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, protoName);
								
								var srcIsInterface = types.isInterface(source),
									callersOrFn = types.unbox(sourceAttribute);
									
								//root.DD_ASSERT && root.DD_ASSERT(types.isNothing(destAttribute) || types.isArray(callersOrFn), "Invalid destination value.");
								if (root.DD_ASSERT) {
									if (sourceIsProto) {
										root.DD_ASSERT && root.DD_ASSERT(types.isNothing(callersOrFn) || types.isJsFunction(callersOrFn), "Invalid source value.");
									} else {
										root.DD_ASSERT && root.DD_ASSERT(types.isNothing(callersOrFn) || types.isArray(callersOrFn), "Invalid source value.");
									};
								};
								
								var destCallers = types.unbox(destAttribute),
									hasDestCallers = types.isArray(destCallers);
								if (!hasDestCallers) {
									destCallers = [];
									destAttribute = sourceAttribute.setValue(destCallers);  // copy attribute flags of "sourceAttribute"
								};
								
								var modifiers = ((destAttribute[__Internal__.symbolModifiers] || 0) & doodad.preservedMethodModifiers) | (sourceAttribute[__Internal__.symbolModifiers] || 0);
								
								if (hasDestCallers && !srcIsInterface && (!sourceIsProto || (modifiers & (doodad.MethodModifiers.Override | doodad.MethodModifiers.Replace)))) {
									// Override or replace
									var start = destAttribute[__Internal__.symbolCallFirstLength];
									if (callersOrFn) {
										if (sourceIsProto) {
											if (root.getOptions().debug || __options__.enforcePolicies) {
												if (destAttribute[__Internal__.symbolScope] === doodad.Scopes.Private) {
													throw new types.Error("Private method '~0~' of '~1~' can't be overridden or replaced.", [attr, protoName || __Internal__.ANONYMOUS]);
												};
											};
											callersOrFn = [this.createCaller(attr, sourceAttribute, destAttribute)];
										};
										var toRemove = 0;
										if ((start > 0) && callersOrFn.length && ((callersOrFn[0][__Internal__.symbolModifiers] || 0) & doodad.MethodModifiers.Replace)) {
											// Replace "call firsts"
											toRemove = start;
											start = 0;
										};
										if (callersOrFn.length && ((callersOrFn[callersOrFn.length - 1][__Internal__.symbolModifiers] || 0) & doodad.MethodModifiers.Replace)) {
											// Replace non "call firsts"
											toRemove = destCallers.length - start;
										};
										_shared.Natives.arraySplice.apply(destCallers, types.append([start, toRemove], callersOrFn));
									};
									destAttribute[__Internal__.symbolCallFirstLength] = start + (sourceAttribute ? sourceAttribute[__Internal__.symbolCallFirstLength] : 0);
								} else {
									// Create
									if (sourceIsProto) {
										if (root.getOptions().debug || __options__.enforcePolicies) {
											if (modifiers & (doodad.MethodModifiers.Override | doodad.MethodModifiers.Replace)) {
												if (!hasDestCallers && !(modifiers & doodad.MethodModifiers.ForceCreate)) {
													throw new types.Error("Method '~0~' of '~1~' can't be overridden or replaced because the method doesn't exist.", [attr, protoName || __Internal__.ANONYMOUS]);
												};
											} else {
												if (hasDestCallers) {
													throw new types.Error("Method '~0~' of '~1~' can't be created because the method already exists.", [attr, protoName || __Internal__.ANONYMOUS]);
												};
											};
										};
									} else if (srcIsInterface) {
										if (callersOrFn && (sourceAttribute[__Internal__.symbolPrototype] === sourceProto)) {
											if (root.getOptions().debug || __options__.enforcePolicies) {
												if (hasDestCallers) {
													throw new types.Error("Method '~0~' of '~1~' can't be created because the method already exists.", [attr, protoName || __Internal__.ANONYMOUS]);
												};
												if (callersOrFn.length) {
													throw new types.Error("Interface '~0~' must not have a body for method '~1~'. You should create a mix-in instead.", [types.getTypeName(source) || __Internal__.ANONYMOUS, attr]);
												};
											};
											// Create method with an empty body and the MustOverride flag.
											callersOrFn.length = 0;
											modifiers |= doodad.MethodModifiers.MustOverride;
											srcIsInterface = false;
										};
									};
									if (!srcIsInterface) {
										if (callersOrFn) {
											if (types.isFunction(callersOrFn)) {
												callersOrFn = [this.createCaller(attr, sourceAttribute, destAttribute)];
											};
											destCallers.length = 0;
											types.append(destCallers, callersOrFn);
										};
										destAttribute[__Internal__.symbolCallFirstLength] = ((modifiers & doodad.MethodModifiers.CallFirst) ? 1 : 0);
									};
								};

								if (!srcIsInterface) {
									destAttribute[__Internal__.symbolModifiers] = modifiers;
									destAttribute[__Internal__.symbolReturns] = (sourceAttribute[__Internal__.symbolReturns] || destAttribute[__Internal__.symbolReturns]);
									destAttribute[__Internal__.symbolUsageMessage] = (sourceAttribute[__Internal__.symbolUsageMessage] || destAttribute[__Internal__.symbolUsageMessage]);
									destAttribute[__Internal__.symbolRenamedTo] = sourceAttribute[__Internal__.symbolRenamedTo];
								};
								
								return destAttribute;
							}),
						postExtend: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 0,
									params: {
										attr: {
											type: 'string,symbol',
											optional: false,
											description: "Attribute name.",
										},
										destAttributes: {
											type: 'objectof(AttributeBox)',
											optional: false,
											description: "Attributes of the new class.",
										},
										destAttribute: {
											type: 'AttributeBox',
											optional: false,
											description: "Attribute value already present in the destination.",
										},
									},
									returns: 'AttributeBox',
									description: "Finalizes the extension of an attribute.",
							}
							//! END_REPLACE()
							, types.SUPER(function postExtend(attr, destAttributes, destAttribute) {
								destAttribute = this._super(attr, destAttributes, destAttribute) || destAttribute;
								
								var callers = types.unbox(destAttribute);

								// Remove duplicated callers and update "call first" length
								destAttribute[__Internal__.symbolCallFirstLength] = callers.length;
								var caller,
									proto,
									i = 0,
									j;
								while (i < callers.length) {
									caller = callers[i];
									if (!(caller[__Internal__.symbolModifiers] & doodad.MethodModifiers.CallFirst)) {
										destAttribute[__Internal__.symbolCallFirstLength] = i;
										break;
									};
									proto = caller[__Internal__.symbolPrototype];
									j = i + 1;
									while (j < callers.length) {
										if (callers[j][__Internal__.symbolPrototype] === proto) {
											callers.splice(j, 1);
										} else {
											j++;
										};
									};
									i++;
								};
								i = callers.length - 1;
								while (i >= destAttribute[__Internal__.symbolCallFirstLength]) {
									proto = callers[i][__Internal__.symbolPrototype];
									j = i - 1;
									while (j >= destAttribute[__Internal__.symbolCallFirstLength]) {
										if (callers[j][__Internal__.symbolPrototype] === proto) {
											_shared.Natives.arraySplice.call(callers, j, 1);
											i--;
										};
										j--;
									};
									i--;
								};

								// Move callers to their specified position
								i = 0;
								while (i < callers.length) {
									var callerI = callers[i],
										position = callerI[__Internal__.symbolPosition],
										found = false;
									if (position && !position.ok) {
										var proto = _shared.getAttribute(position.cls, __Internal__.symbolPrototype);
										for (var j = 0; j < callers.length; j++) {
											var callerJ = callers[j];
											if ((i !== j) && callerJ[__Internal__.symbolPrototype] === proto) {
												var pos = j;
												if (position.position > 0) {
													pos++;
												};
												var toRemove = 0;
												if (position.position === 0) {
													toRemove = 1;
												};
												_shared.Natives.arraySplice.call(callers, i, 1);
												if (i < destAttribute[__Internal__.symbolCallFirstLength]) {
													destAttribute[__Internal__.symbolCallFirstLength]--;
												};
												if (pos > i) {
													pos--;
												};
												_shared.Natives.arraySplice.call(callers, pos, toRemove, callerI);
												if (pos < destAttribute[__Internal__.symbolCallFirstLength]) {
													destAttribute[__Internal__.symbolCallFirstLength]++;
												};
												position.ok = true;
												found = true;
												break;
											};
										};
										//if (!found && !sourceIsProto) {
										//	throw new types.Error("Position for method '~0~' of '~1~' not found.", [attr, protoName || __Internal__.ANONYMOUS]);
										//};
									};
									if (!found) {
										i++;
									};
								};
								for (var i = 0; i < callers.length; i++) {
									var callerI = callers[i],
										position = callerI[__Internal__.symbolPosition];
									if (position) {
										delete position.ok;
									};
								};

								types.freezeObject(callers);
								
								return destAttribute;
							})),
						init: types.SUPER(function init(attr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value) {
								value = this.createDispatch(attr, obj, attribute, value);

								if (root.getOptions().debug || __options__.enforcePolicies) {
									var storage = (forType ? typeStorage : instanceStorage);
									if (!storage[__Internal__.symbolMustOverride] && (value[__Internal__.symbolModifiers] & doodad.MethodModifiers.MustOverride)) {
										storage[__Internal__.symbolMustOverride] = attr;
									};
								};

								if (this.bindMethod && value) {
									value = types.bind(obj, value);
								};

								this._super(attr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value);
							}),
						remove: types.READ_ONLY(null),
					})));

				root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 1,
							params: {
								options: {
									type: 'object',
									optional: true,
									description: "Options.",
								},
							},
							returns: 'Extender',
							description: "Attribute extender which extends a JS method.",
					}
					//! END_REPLACE()
					, extenders.REGISTER(extenders.Method.$inherit({
						$TYPE_NAME: "JsMethod",
						
						dontSetSuper: types.READ_ONLY(false),
						
						_new: types.SUPER(function _new(/*optional*/options) {
								this._super(options);
								_shared.setAttributes(this, {
									dontSetSuper: types.get(options, 'dontSetSuper', this.dontSetSuper),
								}, {all: true});
							}),
						getCacheName: types.SUPER(function getCacheName(/*optional*/options) {
								return this._super(options) + 
									',' + (types.get(options, 'dontSetSuper', this.dontSetSuper) ? '1' : '0');
							}),
						overrideOptions: types.SUPER(function overrideOptions(options, newOptions, /*optional*/replace) {
								options = this._super(options, newOptions, replace);
								if (replace) {
									types.fill(['dontSetSuper'], options, this, newOptions);
								} else {
									options.dontSetSuper = !!newOptions.dontSetSuper || this.dontSetSuper;
								};
								return options;
							}),
						
						callerTemplate: function callerTemplate(attr, sourceAttribute, destAttribute) {
								var fn = types.unbox(sourceAttribute);
								if (root.DD_ASSERT) {
									root.DD_ASSERT(types.isJsFunction(fn), "Invalid function.");
								};
								//return [/*0*/ sourceAttribute];
								return {};
							},
						jsCallerTemplate: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 1,
									params: {
										attr: {
											type: 'string,symbol',
											optional: false,
											description: "Attribute name.",
										},
										fn: {
											type: 'function',
											optional: true,
											description: "Method function. Default is taken from 'PROTOTYPE[attr]'.",
										},
										_super: {
											type: 'function',
											optional: true,
											description: "Method function already present in the destination. Default is none.",
										},
									},
									returns: 'function',
									description: "Template to create a caller for a JS method.",
							}
							//! END_REPLACE()
							, function jsCallerTemplate(attr, /*optional*/fn, /*optional*/_super) {
								var _caller;
								if (this.dontSetSuper) {
									_caller = function caller(/*paramarray*/) {
										var oldSuper = _shared.getAttribute(this, '_super');
										try {
											var target = (fn || types.unbox(_caller[__Internal__.symbolPrototype][attr]));
											return target.apply(this, arguments);
										} catch(ex) {
											throw ex;
										} finally {
											_shared.setAttribute(this, '_super', oldSuper);
										};
									};
								} else {
									_super = _super || (function(){});
									_caller = function caller(/*paramarray*/) {
										var oldSuper = _shared.getAttribute(this, '_super');
										_shared.setAttribute(this, '_super', _super);
										try {
											var target = (fn || types.unbox(_caller[__Internal__.symbolPrototype][attr]));
											return target.apply(this, arguments);
										} catch(ex) {
											throw ex;
										} finally {
											_shared.setAttribute(this, '_super', oldSuper);
										};
									};
								};
								return _caller;
							}),
						dispatchTemplate: function dispatchTemplate(attr, attribute, callers) {
								var callersLen = callers.length,
									_super = null;
								for (var i = callersLen - 1; i >= 0; i--) {
									var caller = callers[i];
									_super = this.jsCallerTemplate(attr, caller.FUNCTION, _super);
									_super[__Internal__.symbolPrototype] = caller[__Internal__.symbolPrototype];
								};
								return __Internal__.makeInside(null, _super, _shared.SECRET);
							},
						
						extend: function extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, proto, protoName) {
								sourceAttribute = extenders.ClonedAttribute.extend.call(this, attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, protoName);
								
								var destCallers = types.unbox(destAttribute);
								
								if (!types.isArray(destCallers)) {
									if (sourceAttribute[_shared.SuperEnabledSymbol] && types.isFunction(destCallers)) {
										destCallers = [this.createCaller(attr, destAttribute, null)];
									} else {
										destCallers = [];
									};
									destAttribute = sourceAttribute.setValue(destCallers);  // copy attribute flags of "sourceAttribute"
								};

								var callersOrFn = types.unbox(sourceAttribute);
								
								if (!sourceAttribute[_shared.SuperEnabledSymbol]) {
									destCallers.length = 0;
								};
								
								if (sourceIsProto) {
									if (root.getOptions().debug || __options__.enforcePolicies) {
										if (destAttribute[__Internal__.symbolScope] === doodad.Scopes.Private) {
											throw new types.Error("Private method '~0~' of '~1~' can't be overridden or replaced.", [attr, protoName || __Internal__.ANONYMOUS]);
										};
									};
									callersOrFn = [this.createCaller(attr, sourceAttribute, destAttribute)];
								};
								
								_shared.Natives.arrayUnshift.apply(destCallers, callersOrFn);
								
								return destAttribute;
							},
							
						postExtend: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 0,
									params: {
										attr: {
											type: 'string,symbol',
											optional: false,
											description: "Attribute name.",
										},
										destAttributes: {
											type: 'objectof(AttributeBox)',
											optional: false,
											description: "Attributes of the new class.",
										},
										destAttribute: {
											type: 'AttributeBox',
											optional: false,
											description: "Attribute value already present in the destination.",
										},
									},
									returns: 'AttributeBox',
									description: "Finalizes the extension of an attribute.",
							}
							//! END_REPLACE()
							, function postExtend(attr, destAttributes, destAttribute) {
								//destAttribute = extenders.ClonedAttribute.postExtend.call(this, attr, destAttributes, destAttribute) || destAttribute;
								
								var callers = types.unbox(destAttribute);

								// Remove duplicated callers
								var i = callers.length - 1;
								while (i >= 0) {
									var callerI = callers[i];
									
									var proto = callerI[__Internal__.symbolPrototype];
									var j = i - 1;
									while (j >= 0) {
										if (callers[j][__Internal__.symbolPrototype] === proto) {
											_shared.Natives.arraySplice.call(callers, j, 1);
											i--;
										};
										j--;
									};
									i--;
								};

								types.freezeObject(callers);
								
								return destAttribute;
							}),
					})));
				
				root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
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
							returns: 'Extender',
							description: "Attribute extender which extends a property.",
					}
					//! END_REPLACE()
					, extenders.REGISTER(extenders.Method.$inherit({
						$TYPE_NAME: "Property",
						
						isReadOnly: types.READ_ONLY(false),
						bindMethod: types.READ_ONLY(true),
						
						extend: types.SUPER(function extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, proto, protoName) {
								sourceAttribute = extenders.Attribute.extend.call(this, attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, protoName);

								var srcDesc = types.unbox(sourceAttribute);
									
								if (!types.isNothing(srcDesc)) {
									var srcGet,
										srcSet,
										destDesc,
										destGet,
										destSet;
										
									if (types.isNothing(destAttribute)) {
										destDesc = {};
									} else {
										destDesc = types.unbox(destAttribute);
									};
									
									srcGet = types.get(srcDesc, 'get', null);
									srcSet = types.get(srcDesc, 'set', null);
									destGet = types.get(destDesc, 'get', null);
									destSet = types.get(destDesc, 'set', null);

									if (types.has(destDesc, 'value')) {
										if (srcGet && !destGet) {
											destGet = function get(value) {
												return destDesc.value;
											}
										};
										if (srcSet && !destSet) {
											destSet = function set(value) {
												destDesc.value = value;
											};
										};
									};
									
									srcDesc = types.extend({}, srcDesc);

									if (srcGet) {
										srcDesc.get = this._super(attr, source, sourceProto, destAttributes, forType, types.AttributeBox(srcGet), types.AttributeBox(destGet), sourceIsProto);
									};
									
									if (srcSet) {
										srcDesc.set = this._super(attr, source, sourceProto, destAttributes, forType, types.AttributeBox(srcSet), types.AttributeBox(destSet), sourceIsProto);
									};
								};
								
								return sourceAttribute.setValue(srcDesc);  // copy attribute flags of "sourceAttribute"
							}),
						init: function init(attr, obj, attributes, typeStorage, instanceStorage, forType, value) {
								if (value) {
									var attribute = attributes[attr];
									
									var descriptor = types.extend({}, value);
									
									var value = types.get(descriptor, 'get');
									if (value) {
										value = this.createDispatch(attr, obj, attribute, value);  // copy attribute flags of "boxed"
										if (this.bindMethod) {
											value = types.bind(obj, value);
										};
										descriptor.get = value;
									};
									
									value = types.get(descriptor, 'set');
									if (value) {
										value = this.createDispatch(attr, obj, attribute, value);  // copy attribute flags of "boxed"
										if (this.bindMethod) {
											value = types.bind(obj, value);
										};
										descriptor.set = value;
									};
									
									descriptor.enumerable = this.isEnumerable;
									
									if (types.has(descriptor, 'get') || types.has(descriptor, 'set')) {
										descriptor.configurable = false;
									} else {
										descriptor.configurable = this.isReadOnly;
										descriptor.writable = !this.isReadOnly;
									};
									
									types.defineProperty(obj, attr, descriptor);
								};
							},
						remove: types.SUPER(function remove(attr, obj, storage, forType, attribute) {
							extenders.Attribute.remove.call(this, attr, obj, storage, forType, attribute);
						}),
					})));
				
				__Internal__.eventHandlerInstanceProto = {
						//stackSize: types.READ_ONLY(10),
						stackSize: types.WRITABLE(10), // TODO: Make a function to set it and protect this field from the external with a getter/setter
						
						_new: types.SUPER(function _new(obj, extender) {
							this._super();
							var values = {};
							values[__Internal__.symbolStack] = [];
							values[__Internal__.symbolObject] = obj;
							values[__Internal__.symbolExtender] = extender;
							_shared.setAttributes(this, values, {all: true});
						}),

						apply: _shared.Natives.functionPrototype.apply,
						call: _shared.Natives.functionPrototype.call,
						bind: _shared.Natives.functionPrototype.bind,

						attach: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 1,
									params: {
										obj: {
											type: 'object',
											optional: true,
											description: "Object to have in 'this' of the callback function.",
										},
										fn: {
											type: 'function',
											optional: false,
											description: "Callback function.",
										},
										priority: {
											type: 'integer',
											optional: true,
											description: "Priority. Default is '20'.",
										},
										datas: {
											type: 'arrayof(any)',
											optional: true,
											description: "Data to attach with the event.",
										},
										count: {
											type: 'integer',
											optional: true,
											description: "Number of times the callback function will be called before been detached. Default is Infinity.",
										},
									},
									returns: 'undefined',
									description: "Attach a callback function to an event.",
							}
							//! END_REPLACE()
							, function attach(/*optional*/obj, fn, /*optional*/priority, /*optional*/datas, /*optional*/count) {
								if (types.isNothing(priority)) {
									priority = 20;
								};

								if (root.DD_ASSERT) {
									root.DD_ASSERT(types.isNothing(obj) || types.isObject(obj), "Invalid object.");
									root.DD_ASSERT(types.isFunction(fn), "Invalid function.");
									root.DD_ASSERT(types.isInteger(priority), "Invalid priority.");
									root.DD_ASSERT(types.isNothing(datas) || types.isArray(datas), "Invalid datas.");
									root.DD_ASSERT(types.isNothing(count) || types.isInteger(count), "Invalid count.");
								};
								
								var cb = fn;
								if (obj) {
									cb = new doodad.Callback(obj, fn);
								};

								datas = datas || [];

								var indexes = [];
								if (this[__Internal__.symbolStack].length) {
									indexes = tools.findItems(this[__Internal__.symbolStack], function(ev) {
										var evData = ev[3];
										return (ev[0] === obj) && (ev[1] === fn) && tools.every(datas, function(data, key) {
											return types.hasIndex(evData, key) && (evData[key] === data);
										});
									});
								};
								
								var indexesLen = indexes.length;
								if (indexesLen) {
									for (var i = 0; i < indexesLen; i++) {
										var ev = this[__Internal__.symbolStack][indexes[i]];
										if (ev[2] !== priority) {
											ev[2] = priority;
											this[__Internal__.symbolSorted] = false;
										};
									};
									return false;
								} else if (this[__Internal__.symbolStack].length < this.stackSize) {
									this[__Internal__.symbolStack].push([/*0*/ obj, /*1*/ fn, /*2*/ priority, /*3*/ datas, /*4*/ count, /*5*/ cb]);
									this[__Internal__.symbolSorted] = false;
									return true;
								} else {
									throw new types.Error("Stack size limit reached for event method '~0~'. This can be due to a leak, or increase its 'stackSize' attribute.", [this[_shared.NameSymbol]]);
								};
							}),
						detach: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 2,
									params: {
										obj: {
											type: 'object',
											optional: true,
											description: "Object linked with the callback function.",
										},
										fn: {
											type: 'function',
											optional: true,
											description: "Callback function.",
										},
										datas: {
											type: 'array',
											optional: true,
											description: "Data attached with the event.",
										},
									},
									returns: 'undefined',
									description: "Detach a callback function from an event.",
							}
							//! END_REPLACE()
							, function detach(obj, fn, /*optional*/datas) {
								if (root.DD_ASSERT) {
									root.DD_ASSERT(types.isNothing(obj) || types.isObject(obj), "Invalid object.");
									root.DD_ASSERT(types.isNothing(fn) || types.isFunction(fn), "Invalid function.");
									root.DD_ASSERT(types.isNothing(datas) || types.isArray(datas), "Invalid datas.");
								};

								datas = datas || [];

								var evs = null;
								if (this[__Internal__.symbolStack]) {
									if (this[__Internal__.symbolStack].length) {
										evs = types.popItems(this[__Internal__.symbolStack], function(ev) {
											var evData = ev[3];
											return (ev[0] === obj) && (!fn || (ev[1] === fn)) && tools.every(datas, function(value, key) {
												return types.hasIndex(evData, key) && (evData[key] === value);
											});
										});
									};
								};

								return evs;
							}),
						clear: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 1,
									params: null,
									returns: 'undefined',
									description: "Detach every callback function from an event.",
							}
							//! END_REPLACE()
							, function clear() {
								this[__Internal__.symbolStack].length = 0;
							}),
						attachOnce: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 0,
									params: {
										obj: {
											type: 'object',
											optional: true,
											description: "Object to have in 'this' of the callback function.",
										},
										fn: {
											type: 'function',
											optional: false,
											description: "Callback function.",
										},
										priority: {
											type: 'integer',
											optional: true,
											description: "Priority. Default is '20'.",
										},
										datas: {
											type: 'array',
											optional: true,
											description: "Data to attach with the event.",
										},
									},
									returns: 'undefined',
									description: "Attach a callback function to an event that will get called only once.",
							}
							//! END_REPLACE()
							, function attachOnce(obj, fn, /*optional*/priority, /*optional*/datas) {
								return this.attach(obj, fn, priority, datas, 1);
							}),
						promise: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 1,
									params: null,
									returns: 'Promise',
									description: "Creates a promise for an event.",
							}
							//! END_REPLACE()
							, function promise() {
								// NOTE: Don't forget that a promise resolves only once, so ".promise" is like ".attachOnce".
								var Promise = types.getPromise();
								return Promise.create(function eventPromise(resolve, reject) {
										var self = this,
											obj = this[__Internal__.symbolObject],
											fn = null,
											errorFn = null;
										this.attachOnce(null, fn = function(ev) {
											obj.onError.detach(null, errorFn);
											resolve(ev);
										});
										if (obj.onError) {
											obj.onError.attachOnce(null, errorFn = function(ev) {
												self.detach(null, fn);
												reject(ev.error);
											});
										};
									}, this);
							}),
					};

				// FUTURE: Syntax for variable keys in object declaration
				// TODO: Protect these variables from the outside
				__Internal__.eventHandlerInstanceProto[__Internal__.symbolObject] = types.READ_ONLY(null);
				__Internal__.eventHandlerInstanceProto[__Internal__.symbolExtender] = types.READ_ONLY(null);
				__Internal__.eventHandlerInstanceProto[__Internal__.symbolStack] = types.READ_ONLY(null);
				__Internal__.eventHandlerInstanceProto[__Internal__.symbolSorted] = types.WRITABLE(true);
					
				root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 2,
							params: null,
							returns: 'EventHandler',
							description: "Event handler prototype.",
					}
					//! END_REPLACE()
					, doodad.REGISTER(doodad.TypeNamespace.$inherit(
						/*typeProto*/
						{
							$TYPE_NAME: 'EventHandler',
						},
						/*instanceProto*/
						__Internal__.eventHandlerInstanceProto
					)));
				
				root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
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
							returns: 'Extender',
							description: "Attribute extender which extends an event.",
					}
					//! END_REPLACE()
					, extenders.REGISTER(extenders.Method.$inherit({
						$TYPE_NAME: "Event",

						eventsAttr: types.READ_ONLY('__EVENTS'),
						eventsImplementation: types.READ_ONLY('Doodad.MixIns.Events'),
						
						enableScopes: types.READ_ONLY(false),
						
						eventProto: types.READ_ONLY(doodad.EventHandler),
						
						extend: types.SUPER(function extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, proto, protoName) {
								if (root.getOptions().debug) {
									if (!types.has(destAttributes, this.eventsAttr)) {
										throw new types.Error("You must implement '~0~'.", [this.eventsImplementation]);
									};
								};
								
								var events = destAttributes[this.eventsAttr];
								events = types.unbox(events);
								events.push(attr);
								
								return this._super(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, protoName);
							}),
						createDispatch: types.SUPER(function createDispatch(attr, obj, attribute, callers) {
								var dispatch = this._super(attr, obj, attribute, callers);
								return types.setPrototypeOf(dispatch, new this.eventProto(obj, this));
							}),
						remove: function remove(attr, obj, storage, forType, attribute) {
								var handler = obj[attr];
								if (types.baseof(doodad.EventHandler, handler)) {
									handler.clear();
								};
		//							extenders.Attribute.remove.call(this, attr, obj, storage, forType, attribute);
							},
					})));

				doodad.ATTRIBUTE = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								value: {
									type: 'any',
									optional: false,
									description: "Value.",
								},
								extender: {
									type: 'Extender',
									optional: true,
									description: "Extender. Default is 'ClonedAttribute' extender.'",
								},
								options: {
									type: 'object',
									optional: true,
									description: "Extender options.'",
								},
							},
							returns: 'AttributeBox',
							description: "Creates an attribute from a value with the specified extender.",
					}
					//! END_REPLACE()
					, function ATTRIBUTE(value, /*optional*/extender, /*optional*/options) {
						value = types.AttributeBox(value);

						if (!extender) {
							extender = value[__Internal__.symbolExtender];
						};

						if (!extender) {
							extender = extenders.ClonedAttribute;
						};

						if (root.DD_ASSERT) {
							root.DD_ASSERT(types._instanceof(extender, types.getType(extenders.Extender)), "Invalid extender.");
						};
						
						if (options) {
							root.DD_ASSERT && root.DD_ASSERT(types.isJsObject(options), "Invalid options.");
							extender = extender.get(options);
						};
						
						value[__Internal__.symbolExtender] = extender;
						return value;
					});

				doodad.OPTIONS = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 1,
							params: {
								options: {
									type: 'object',
									optional: false,
									description: "Extender options.'",
								},
								value: {
									type: 'AttributeBox,Extender,any',
									optional: false,
									description: "Attribute or extender or value.",
								},
							},
							returns: 'AttributeBox,Extender',
							description: "Sets the options of the extender of an attribute or sets the options of an extender.",
					}
					//! END_REPLACE()
					, function OPTIONS(options, value) {
						root.DD_ASSERT && root.DD_ASSERT(types.isJsObject(options), "Invalid options.");
						
						var extender,
							valueIsExtender = types._instanceof(value, types.getType(extenders.Extender));
						
						if (valueIsExtender) {
							extender = value;
							value = undefined;
						} else {
							value = types.AttributeBox(value);
							extender = value[__Internal__.symbolExtender];
						};
						
						if (!extender) {
							if (types.isJsFunction(types.unbox(value))) {
								extender = extenders.Method;
							} else {
								extender = extenders.ClonedAttribute;
							};
						};
						
						root.DD_ASSERT && root.DD_ASSERT(types._instanceof(extender, types.getType(extenders.Extender)), "Invalid extender.");
						
						options = extender.overrideOptions({}, options, true);
						extender = extender.get(options);
						
						if (valueIsExtender) {
							return extender;
						} else {
							value[__Internal__.symbolExtender] = extender;
							return value;
						};
					});
				
				doodad.NOT_INHERITED = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								value: {
									type: 'AttributeBox,Extender,any',
									optional: false,
									description: "Attribute or extender or value.",
								},
							},
							returns: 'AttributeBox,Extender',
							description: "Specifies that an attribute will always override.",
					}
					//! END_REPLACE()
					, function NOT_INHERITED(value) {
						return doodad.OPTIONS({
							notInherited: true,
						}, value);
					});

				doodad.PRE_EXTEND = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								value: {
									type: 'AttributeBox,Extender,any',
									optional: false,
									description: "Attribute or extender or value.",
								},
							},
							returns: 'AttributeBox,Extender',
							description: "Specifies that an attribute needs to be extended before others.",
					}
					//! END_REPLACE()
					, function PRE_EXTEND(value) {
						return doodad.OPTIONS({
							preExtend: true,
						}, value);
					});

				doodad.TYPE = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								value: {
									type: 'AttributeBox,Extender,any',
									optional: false,
									description: "Attribute or extender or value.",
								},
							},
							returns: 'AttributeBox,Extender',
							description: "Specifies that an attribute is a type attribute.",
					}
					//! END_REPLACE()
					, function TYPE(value) {
						return doodad.OPTIONS({
							isType: true,
						}, value);
					});

				doodad.INSTANCE = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								value: {
									type: 'AttributeBox,Extender,any',
									optional: false,
									description: "Attribute or extender or value.",
								},
							},
							returns: 'AttributeBox,Extender',
							description: "Specifies that an attribute is an instance attribute.",
					}
					//! END_REPLACE()
					, function INSTANCE(value) {
						return doodad.OPTIONS({
							isInstance: true,
						}, value);
					});

				doodad.PERSISTENT = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								value: {
									type: 'AttributeBox,Extender,any',
									optional: false,
									description: "Attribute or extender or value.",
								},
							},
							returns: 'AttributeBox,Extender',
							description: "Specifies that an attribute will not get deleted on object destruction.",
					}
					//! END_REPLACE()
					, function PERSISTENT(value) {
						return doodad.OPTIONS({
							isPersistent: true,
						}, value);
					});

				doodad.BIND = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								value: {
									type: 'AttributeBox,Extender,any',
									optional: false,
									description: "Attribute or extender or value.",
								},
							},
							returns: 'AttributeBox,Extender',
							description: "Specifies that a method will bind to the object.",
					}
					//! END_REPLACE()
					, function BIND(value) {
						return doodad.OPTIONS({
							bindMethod: true,
						}, value);
					});

				doodad.NOT_REENTRANT = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								value: {
									type: 'AttributeBox,Extender,any',
									optional: false,
									description: "Attribute or extender or value.",
								},
							},
							returns: 'AttributeBox,Extender',
							description: "Specifies that a method is not reentrant.",
					}
					//! END_REPLACE()
					, function NOT_REENTRANT(value) {
						return doodad.OPTIONS({
							notReentrant: true,
						}, value);
					});
				
				doodad.EXTERNAL = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								value: {
									type: 'AttributeBox,Extender,any',
									optional: false,
									description: "Attribute or extender or value.",
								},
							},
							returns: 'AttributeBox,Extender',
							description: "Specifies that a method can only be called from outside the object.",
					}
					//! END_REPLACE()
					, function EXTERNAL(value) {
						return doodad.OPTIONS({
							isExternal: true,
						}, value);
					});
				
				doodad.READ_ONLY = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								value: {
									type: 'AttributeBox,Extender,any',
									optional: false,
									description: "Attribute or extender or value.",
								},
							},
							returns: 'AttributeBox,Extender',
							description: "Specifies that an attribute is read-only.",
					}
					//! END_REPLACE()
					, function READ_ONLY(value) {
						return doodad.OPTIONS({
							isReadOnly: true,
						}, value);
					});

				doodad.WRITABLE = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								value: {
									type: 'AttributeBox,Extender,any',
									optional: false,
									description: "Attribute or extender or value.",
								},
							},
							returns: 'AttributeBox,Extender',
							description: "Specifies that an attribute is writable.",
					}
					//! END_REPLACE()
					, function WRITABLE(value) {
						return doodad.OPTIONS({
							isReadOnly: false,
						}, value);
					});

				doodad.METHOD = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								fn: {
									type: 'AttributeBox,function',
									optional: true,
									description: "Function.",
								},
							},
							returns: 'AttributeBox',
							description: "Creates a method.",
					}
					//! END_REPLACE()
					, function METHOD(/*optional*/fn) {
						if (root.DD_ASSERT) {
							var val = types.unbox(fn);
							root.DD_ASSERT(types.isNothing(val) || (types.isJsFunction(val) && types.isBindable(val)), "Invalid function.");
						};
						return doodad.ATTRIBUTE(fn, extenders.Method);
					});

				doodad.JS_METHOD = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								fn: {
									type: 'function',
									optional: false,
									description: "Function.",
								},
							},
							returns: 'AttributeBox',
							description: "Creates a JS method.",
					}
					//! END_REPLACE()
					, function JS_METHOD(fn) {
						root.DD_ASSERT && root.DD_ASSERT(types.isJsFunction(fn) && types.isBindable(fn), "Invalid function.");
						
						return doodad.ATTRIBUTE(fn, extenders.JsMethod);
					});
				
				doodad.SUPER = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								fn: {
									type: 'function',
									optional: false,
									description: "Function.",
								},
							},
							returns: 'AttributeBox',
							description: "Creates a JS method with '_super'.",
					}
					//! END_REPLACE()
					, function(fn) {
						root.DD_ASSERT && root.DD_ASSERT(types.isJsFunction(fn) && types.isBindable(fn), "Invalid function.");
						
						fn = doodad.ATTRIBUTE(fn, extenders.JsMethod);
						fn[_shared.SuperEnabledSymbol] = true;
						return fn;
					});

				doodad.PROPERTY = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								descriptor: {
									type: 'object',
									optional: false,
									description: "Property descriptor.",
								},
							},
							returns: 'AttributeBox',
							description: "Creates a property.",
					}
					//! END_REPLACE()
					, function PROPERTY(descriptor) {
						root.DD_ASSERT && root.DD_ASSERT(types.isJsObject(descriptor), "Invalid descriptor.");
						
						var enumerable = descriptor.enumerable;
						if (types.isNothing(enumerable)) {
							enumerable = true;
						};
						return doodad.ATTRIBUTE(descriptor, extenders.Property, {isEnumerable: enumerable});
					});
				
				__Internal__.EVENT = function EVENT(/*optional*/cancellable) {
					cancellable = (types.isNothing(cancellable) ? true : cancellable);
					return doodad.PROTECTED(function handleEvent(/*optional*/ev) {
						root.DD_ASSERT && root.DD_ASSERT(types.isNothing(ev) || (ev instanceof doodad.Event), "Invalid event object.");
						
						if (types.isNothing(ev)) {
							ev = new doodad.Event();
						};

						var cancelled = false,
							type = types.getType(this),
							dispatch = _shared.getAttribute(this, __Internal__.symbolCurrentDispatch),
							stack = dispatch[__Internal__.symbolStack];
						
						if (stack) {
							if (!dispatch[__Internal__.symbolSorted]) {
								stack.sort(function(value1, value2) {
									return tools.compareNumbers(value1[2], value2[2]);
								});
								dispatch[__Internal__.symbolSorted] = true;
							};
							
							_shared.setAttributes(ev, {obj: this, name: dispatch[_shared.NameSymbol]});
							
							var i = 0;
							while (i < stack.length) {
								var data = stack[i],
									obj = data[0],
									cb = data[5];
									
								_shared.setAttribute(ev, 'handlerData', data[3]);

								var retval = cb.call(obj, ev);
								
								data[4]--;
								if (data[4] === 0) {
									stack.splice(i, 1);
								} else {
									i++;
								};
								
								if ((retval === false) && cancellable) {
									ev = new doodad.CancelEvent({
										event: ev,
									});
									_shared.setAttributes(ev, {obj: this, name: this.onEventCancelled[_shared.NameSymbol]});
									this.onEventCancelled(ev);
									cancelled = true;
									break;
								};
							};
						};
						
						return cancelled;
					});
				};
				
				__Internal__.RAW_EVENT = function RAW_EVENT() {
					return doodad.PROTECTED(function handleEvent(/*paramarray*/) {
						var type = types.getType(this),
							dispatch = _shared.getAttribute(this, __Internal__.symbolCurrentDispatch),
							stack = dispatch[__Internal__.symbolStack];
						
						if (stack) {
							if (!dispatch[__Internal__.symbolSorted]) {
								stack.sort(function(value1, value2) {
									return tools.compareNumbers(value1[2], value2[2]);
								});
								dispatch[__Internal__.symbolSorted] = true;
							};
							
							var i = 0;
							while (i < stack.length) {
								var data = stack[i],
									obj = data[0],
									fn = data[1];
									
								_shared.invoke(obj, fn, arguments, _shared.SECRET);
								
								data[4]--;
								if (data[4] === 0) {
									stack.splice(i, 1);
								} else {
									i++;
								};
							};
							
							return !!stack.length; // event emitted if stack not empty
							
						} else {
							return false; // no event emitted
							
						};
					});
				};
				
				doodad.EVENT = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								cancellable: {
									type: 'bool',
									optional: true,
									description: "Function. Default is 'true'.",
								},
								fn: {
									type: 'function',
									optional: true,
									description: "Function.",
								},
							},
							returns: 'AttributeBox,Extender',
							description: "Creates an event.",
					}
					//! END_REPLACE()
					, function EVENT(/*optional*/cancellable, /*optional*/fn) {
						var boxed = doodad.PROTECTED(doodad.ATTRIBUTE(__Internal__.EVENT(cancellable, fn), extenders.Event, {enableScopes: false}));
						boxed[__Internal__.symbolOverrideWith] = fn;
						return boxed;
					});

				doodad.ERROR_EVENT = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 1,
							params: {
								fn: {
									type: 'function',
									optional: true,
									description: "Function.",
								},
							},
							returns: 'AttributeBox,Extender',
							description: "Creates an error event ('onError').",
					}
					//! END_REPLACE()
					, function ERROR_EVENT(/*optional*/fn) {
						return doodad.EVENT(false, fn);
					});

				doodad.RAW_EVENT = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: null,
							returns: 'AttributeBox,Extender',
							description: "Creates a special event.",
					}
					//! END_REPLACE()
					, function RAW_EVENT(/*optional*/fn) {
						var boxed = doodad.PROTECTED(doodad.ATTRIBUTE(__Internal__.RAW_EVENT(), extenders.Event, {enableScopes: false}));
						boxed[__Internal__.symbolOverrideWith] = fn;
						return boxed;
					});

				//==================================
				// Scopes
				//==================================
				
				doodad.Scopes = types.freezeObject(types.nullObject({
					Public: 1,
					Protected: 2,
					Private: 3,
				}));
				
				doodad.PUBLIC = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								value: {
									type: 'AttributeBox,any',
									optional: false,
									description: "Value.",
								},
							},
							returns: 'AttributeBox',
							description: "Creates a public attribute.",
					}
					//! END_REPLACE()
					, function PUBLIC(value) {
						var extender;
						if (types._instanceof(value, types.getType(extenders.Extender))) {
							extender = value;
							value = undefined;
						};
						value = types.AttributeBox(value);
						value[__Internal__.symbolScope] = doodad.Scopes.Public;
						if (extender) {
							value[__Internal__.symbolExtender] = extender;
						};
						return value;
					});
				
				doodad.PROTECTED = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								value: {
									type: 'AttributeBox,any',
									optional: false,
									description: "Value.",
								},
							},
							returns: 'AttributeBox',
							description: "Creates a protected attribute.",
					}
					//! END_REPLACE()
					, function PROTECTED(value) {
						var extender;
						if (types._instanceof(value, types.getType(extenders.Extender))) {
							extender = value;
							value = undefined;
						};
						value = types.AttributeBox(value);
						value[__Internal__.symbolScope] = doodad.Scopes.Protected;
						if (extender) {
							value[__Internal__.symbolExtender] = extender;
						};
						return value;
					});

				doodad.PRIVATE = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								value: {
									type: 'AttributeBox,any',
									optional: false,
									description: "Value.",
								},
							},
							returns: 'AttributeBox',
							description: "Creates a private attribute.",
					}
					//! END_REPLACE()
					, function PRIVATE(value) {
						var extender;
						if (types._instanceof(value, types.getType(extenders.Extender))) {
							extender = value;
							value = undefined;
						};
						value = types.AttributeBox(value);
						value[__Internal__.symbolScope] = doodad.Scopes.Private;
						if (extender) {
							value[__Internal__.symbolExtender] = extender;
						};
						return value;
					});
				
				doodad.PROTECTED_DEBUG = (__options__.publicOnDebug && root.getOptions().debug ? doodad.PUBLIC : doodad.PROTECTED);
				doodad.PRIVATE_DEBUG = (__options__.publicOnDebug && root.getOptions().debug ? doodad.PUBLIC : doodad.PRIVATE);
				
				//==================================
				// Class Modifiers
				//==================================
				
				// Can be combined
				doodad.ClassModifiers = types.freezeObject(types.nullObject({
					Base: 1,
					MixIn: 2,
					Interface: 4,
					Sealed: 8,
					Static: 16,
					Singleton: 32,
					Isolated: 64,
					Expandable: 128,
				}));
				doodad.preservedClassModifiers = doodad.ClassModifiers.MixIn | doodad.ClassModifiers.Interface | doodad.ClassModifiers.Sealed | doodad.ClassModifiers.Static;

				doodad.BASE = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 1,
							params: {
								cls: {
									type: 'Class',
									optional: false,
									description: "Class.",
								},
							},
							returns: 'Class',
							description: "Sets a class, interface or mix-in as base.",
					}
					//! END_REPLACE()
					, function BASE(cls) {
						root.DD_ASSERT && root.DD_ASSERT((cls === types.Type) || types.baseof(types.Type, cls), "Invalid class.");
						if (types.isInitialized(cls)) {
							throw new types.Error("Class '" + (types.getTypeName(cls) || __Internal__.ANONYMOUS) + "' is initialized.");
						};
						_shared.setAttribute(cls, __Internal__.symbolModifiers, (cls[__Internal__.symbolModifiers] || 0) | doodad.ClassModifiers.Base, {configurable: true});
						return cls;
					});
				
				// NOTE: A trait is in fact a mix-in. The only distinction is it has no attribute and its methods may be renamed at their implementation. For the moment, this dictinction is by convention.
				doodad.TRAIT = doodad.MIX_IN = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 1,
							params: {
								cls: {
									type: 'Class',
									optional: false,
									description: "Class.",
								},
							},
							returns: 'Class',
							description: "Transforms a class to a mix-in.",
					}
					//! END_REPLACE()
					, function MIX_IN(cls) {
						root.DD_ASSERT && root.DD_ASSERT((cls === types.Type) || types.baseof(types.Type, cls), "Invalid class.");
						if (root.getOptions().debug || __options__.enforcePolicies) {
							var base = types.getBase(cls);
							if (!types.is(base, doodad.Class) && !types.isMixIn(base)) {
								throw new types.Error("Mix-ins must be based on 'doodad.Class' or another mix-in.");
							};
						};
						if (types.isInitialized(cls)) {
							throw new types.Error("Class '" + (types.getTypeName(cls) || __Internal__.ANONYMOUS) + "' is initialized.");
						};
						_shared.setAttribute(cls, __Internal__.symbolModifiers, ((cls[__Internal__.symbolModifiers] || 0) & ~doodad.ClassModifiers.Interface) | doodad.ClassModifiers.MixIn, {configurable: true});
						return cls;
					});
				
				doodad.INTERFACE = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 1,
							params: {
								cls: {
									type: 'Class',
									optional: false,
									description: "Class.",
								},
							},
							returns: 'Class',
							description: "Transforms a class to an interface.",
					}
					//! END_REPLACE()
					, function INTERFACE(cls) {
						root.DD_ASSERT && root.DD_ASSERT((cls === types.Type) || types.baseof(types.Type, cls), "Invalid class.");
						if (root.getOptions().debug || __options__.enforcePolicies) {
							var base = types.getBase(cls);
							if (!types.is(base, doodad.Class) && !types.isInterface(base)) {
								throw new types.Error("Interfaces must be based on 'doodad.Class' or another mix-in.");
							};
						};
						if (types.isInitialized(cls)) {
							throw new types.Error("Class '" + (types.getTypeName(cls) || __Internal__.ANONYMOUS) + "' is initialized.");
						};
						_shared.setAttribute(cls, __Internal__.symbolModifiers, ((cls[__Internal__.symbolModifiers] || 0) & ~doodad.ClassModifiers.MixIn) | doodad.ClassModifiers.Interface, {configurable: true});
						return cls;
					});
				
				doodad.SEALED = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 1,
							params: {
								cls: {
									type: 'Class',
									optional: false,
									description: "Class.",
								},
							},
							returns: 'Class',
							description: "Sets a class, interface or mix-in to a sealed one.",
					}
					//! END_REPLACE()
					, function SEALED(cls) {
						root.DD_ASSERT && root.DD_ASSERT((cls === types.Type) || types.baseof(types.Type, cls), "Invalid class.");
						if (types.isInitialized(cls)) {
							throw new types.Error("Class '" + (types.getTypeName(cls) || __Internal__.ANONYMOUS) + "' is initialized.");
						};
						_shared.setAttribute(cls, __Internal__.symbolModifiers, (cls[__Internal__.symbolModifiers] || 0) | doodad.ClassModifiers.Sealed, {configurable: true});
						return cls;
					});
				
				doodad.STATIC = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 1,
							params: {
								cls: {
									type: 'Class',
									optional: false,
									description: "Class.",
								},
							},
							returns: 'Class',
							description: "Transforms a class to a static class.",
					}
					//! END_REPLACE()
					, function STATIC(cls) {
						root.DD_ASSERT && root.DD_ASSERT((cls === types.Type) || types.baseof(types.Type, cls), "Invalid class.");
						if (types.isInitialized(cls)) {
							throw new types.Error("Class '" + (types.getTypeName(cls) || __Internal__.ANONYMOUS) + "' is initialized.");
						};
						_shared.setAttribute(cls, __Internal__.symbolModifiers, (cls[__Internal__.symbolModifiers] || 0) | doodad.ClassModifiers.Static, {configurable: true});
						return cls;
					});
				
				doodad.ISOLATED = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 1,
							params: {
								cls: {
									type: 'Class',
									optional: false,
									description: "Class.",
								},
							},
							returns: 'Class',
							description: "Transforms a mix-in or an interface to an isolated one.",
					}
					//! END_REPLACE()
					, function ISOLATED(cls) {
						root.DD_ASSERT && root.DD_ASSERT((cls === types.Type) || types.baseof(types.Type, cls), "Invalid class.");
						if (root.getOptions().debug || __options__.enforcePolicies) {
							if (!types.isInterface(cls) && !types.isMixIn(cls)) {
								throw new types.Error("Isolation can only be applied on interfaces and mix-ins.");
							};
						};
						if (types.isInitialized(cls)) {
							throw new types.Error("Class '" + (types.getTypeName(cls) || __Internal__.ANONYMOUS) + "' is initialized.");
						};
						_shared.setAttribute(cls, __Internal__.symbolModifiers, (cls[__Internal__.symbolModifiers] || 0) | doodad.ClassModifiers.Isolated, {configurable: true});
						return cls;
					});
				
				doodad.EXPANDABLE = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								cls: {
									type: 'Class',
									optional: false,
									description: "Class.",
								},
							},
							returns: 'Class',
							description: "Makes expandable objects.",
					}
					//! END_REPLACE()
					, function EXPANDABLE(cls) {
						root.DD_ASSERT && root.DD_ASSERT((cls === types.Type) || types.baseof(types.Type, cls), "Invalid class.");
						if (root.getOptions().debug || __options__.enforcePolicies) {
							if (types.isInterface(cls) || types.isMixIn(cls)) {
								throw new types.Error("Expandable can't be applied on interfaces and mix-ins.");
							};
						};
						if (types.isInitialized(cls)) {
							throw new types.Error("Class '" + (types.getTypeName(cls) || __Internal__.ANONYMOUS) + "' is initialized.");
						};
						_shared.setAttribute(cls, __Internal__.symbolModifiers, (cls[__Internal__.symbolModifiers] || 0) | doodad.ClassModifiers.Expandable, {configurable: true});
						return cls;
					});
				
				//==================================
				// Method Positioning
				//==================================

				doodad.POSITION = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								position: {
									type: 'integer',
									optional: false,
									description: "'-1': Before class. '1': After class. '0': Replace class.",
								},
								cls: {
									type: 'Class',
									optional: false,
									description: "Class.",
								},
								value: {
									type: 'AttributeBox,any',
									optional: false,
									description: "Value.",
								},
							},
							returns: 'AttributeBox',
							description: "Positions an attribute relatively to the same attribute of another class.",
					}
					//! END_REPLACE()
					, function POSITION(position, cls, value) {
						root.DD_ASSERT && root.DD_ASSERT(types.baseof(doodad.Class, cls), "Invalid class.");
						value = types.AttributeBox(value);
						value[__Internal__.symbolPosition] = {
							position: position,
							cls: cls,
						};
						return value;
					});

				doodad.AFTER = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								cls: {
									type: 'Class',
									optional: false,
									description: "Class.",
								},
								value: {
									type: 'AttributeBox,any',
									optional: false,
									description: "Value.",
								},
							},
							returns: 'AttributeBox',
							description: "Positions an attribute after to the same attribute of another class.",
					}
					//! END_REPLACE()
					, function AFTER(cls, value) {
						return doodad.POSITION(1, cls, value);
					});

				doodad.BEFORE = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								cls: {
									type: 'Class',
									optional: false,
									description: "Class.",
								},
								value: {
									type: 'AttributeBox,any',
									optional: false,
									description: "Value.",
								},
							},
							returns: 'AttributeBox',
							description: "Positions an attribute before to the same attribute of another class.",
					}
					//! END_REPLACE()
					, function BEFORE(cls, value) {
						return doodad.POSITION(-1, cls, value);
					});

				//==================================
				// Method Modifiers
				//==================================
				
				// Can be combined
				doodad.MethodModifiers = types.freezeObject(types.nullObject({
					Replace: 1,
					Override: 2,
					MustOverride: 4,
					Obsolete: 8,
					CallFirst: 16,
					CanBeDestroyed: 32,
					NotImplemented: 64,
					ForceCreate: 128,
					Async: 256,
				}));
				doodad.preservedMethodModifiers = doodad.MethodModifiers.Obsolete | doodad.MethodModifiers.CanBeDestroyed | doodad.MethodModifiers.Async;
				
				doodad.REPLACE = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							paramsDirection: 'rightToLeft',
							params: {
								fn: {
									type: 'AttributeBox,function',
									optional: true,
									description: "Method function.",
								},
								_interface: {
									type: 'Class',
									optional: true,
									description: "Interface class.",
								},
							},
							returns: 'AttributeBox',
							description: "Specifies that a method will replace the existing one.",
					}
					//! END_REPLACE()
					, function REPLACE(/*<<< optional[_interface]*/ /*optional*/fn) {
						var _interface;
						if (arguments.length > 1) {
							_interface = fn;
							fn = arguments[1];
						};
						fn = types.AttributeBox(fn);
						if (root.DD_ASSERT) {
							root.DD_ASSERT(types.isNothing(_interface) || types.isInterface(_interface) || types.isMixIn(_interface), "Invalid interface or mix-in.");
							var val = types.unbox(fn);
							root.DD_ASSERT(types.isNothing(val) || types.isJsFunction(val), "Invalid function.");
						};
						fn[__Internal__.symbolModifiers] = ((fn[__Internal__.symbolModifiers] || 0) & ~doodad.MethodModifiers.Override) | doodad.MethodModifiers.Replace;
						if (!fn[__Internal__.symbolExtender]) {
							fn[__Internal__.symbolExtender] = extenders.Method;
						};
						fn[__Internal__.symbolInterface] = _interface;
						return fn;
					});
				
				doodad.OVERRIDE = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							paramsDirection: 'rightToLeft',
							params: {
								fn: {
									type: 'AttributeBox,function',
									optional: true,
									description: "Method function.",
								},
								_interface: {
									type: 'Class',
									optional: true,
									description: "Interface class.",
								},
							},
							returns: 'AttributeBox',
							description: "Specifies that a method will override the existing one.",
					}
					//! END_REPLACE()
					, function OVERRIDE(/*<<< optional[_interface]*/ /*optional*/fn) {
						var _interface;
						if (arguments.length > 1) {
							_interface = fn;
							fn = arguments[1];
						};
						fn = types.AttributeBox(fn);
						if (root.DD_ASSERT) {
							root.DD_ASSERT(types.isNothing(_interface) || types.isInterface(_interface) || types.isMixIn(_interface), "Invalid interface or mix-in.");
							var val = types.unbox(fn);
							root.DD_ASSERT(types.isNothing(val) || types.isJsFunction(val), "Invalid function.");
						};
						fn[__Internal__.symbolModifiers] = ((fn[__Internal__.symbolModifiers] || 0) & ~doodad.MethodModifiers.Replace) | doodad.MethodModifiers.Override;
						if (!fn[__Internal__.symbolExtender]) {
							fn[__Internal__.symbolExtender] = extenders.Method;
						};
						fn[__Internal__.symbolInterface] = _interface;
						return fn;
					});
				
				doodad.CREATE_REPLACE = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							paramsDirection: 'rightToLeft',
							params: {
								fn: {
									type: 'AttributeBox,function',
									optional: true,
									description: "Method function.",
								},
								_interface: {
									type: 'Class',
									optional: true,
									description: "Interface class.",
								},
							},
							returns: 'AttributeBox',
							description: "Specifies that a method will create or replace the existing one.",
					}
					//! END_REPLACE()
					, function CREATE_REPLACE(/*<<< optional[_interface]*/ /*optional*/fn) {
						fn = doodad.REPLACE.apply(this, arguments);
						fn[__Internal__.symbolModifiers] = (fn[__Internal__.symbolModifiers] || 0) | doodad.MethodModifiers.ForceCreate;
						return fn;
					});
				
				doodad.CREATE_OVERRIDE = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							paramsDirection: 'rightToLeft',
							params: {
								fn: {
									type: 'AttributeBox,function',
									optional: true,
									description: "Method function.",
								},
								_interface: {
									type: 'Class',
									optional: true,
									description: "Interface class.",
								},
							},
							returns: 'AttributeBox',
							description: "Specifies that a method will create or override the existing one.",
					}
					//! END_REPLACE()
					, function CREATE_OVERRIDE(/*<<< optional[_interface]*/ /*optional*/fn) {
						fn = doodad.OVERRIDE.apply(this, arguments);
						fn[__Internal__.symbolModifiers] = (fn[__Internal__.symbolModifiers] || 0) | doodad.MethodModifiers.ForceCreate;
						return fn;
					});
				
				doodad.MUST_OVERRIDE = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								fn: {
									type: 'AttributeBox,function',
									optional: true,
									description: "Method function.",
								},
							},
							returns: 'AttributeBox',
							description: "Specifies that a method must be overridden (or replaced).",
					}
					//! END_REPLACE()
					, function MUST_OVERRIDE(/*optional*/fn) {
						fn = types.AttributeBox(fn);
						if (root.DD_ASSERT) {
							var val = types.unbox(fn);
							root.DD_ASSERT(types.isNothing(val) || types.isJsFunction(val), "Invalid function.");
						};
						fn[__Internal__.symbolModifiers] = (fn[__Internal__.symbolModifiers] || 0) | doodad.MethodModifiers.MustOverride;
						if (!fn[__Internal__.symbolExtender]) {
							fn[__Internal__.symbolExtender] = extenders.Method;
						};
						return fn;
					});
				
				doodad.OBSOLETE = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							paramsDirection: 'rightToLeft',
							params: {
								fn: {
									type: 'AttributeBox,function',
									optional: true,
									description: "Method function.",
								},
								message: {
									type: 'string',
									optional: true,
									description: "Explanation.",
								},
							},
							returns: 'AttributeBox',
							description: "Specifies that a method is obsolete.",
					}
					//! END_REPLACE()
					, function OBSOLETE(/* <<< optional[message], optional[fn]*/) {
						var argsLen = arguments.length;
						var fn = arguments[argsLen - 1];
						var message = arguments[argsLen - 2];
						fn = types.AttributeBox(fn);
						if (root.DD_ASSERT) {
							var val = types.unbox(fn);
							root.DD_ASSERT(types.isNothing(val) || types.isJsFunction(val), "Invalid function.");
						};
						fn[__Internal__.symbolModifiers] = (fn[__Internal__.symbolModifiers] || 0) | doodad.MethodModifiers.Obsolete;
						if (!fn[__Internal__.symbolExtender]) {
							fn[__Internal__.symbolExtender] = extenders.Method;
						};
						fn[__Internal__.symbolUsageMessage] = message;
						return fn;
					});

				doodad.CALL_FIRST = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								fn: {
									type: 'AttributeBox,function',
									optional: true,
									description: "Method function.",
								},
							},
							returns: 'AttributeBox',
							description: "Specifies that this method function is called first.",
					}
					//! END_REPLACE()
					, function CALL_FIRST(/*optional*/fn) {
						fn = types.AttributeBox(fn);
						if (root.DD_ASSERT) {
							var val = types.unbox(fn);
							root.DD_ASSERT(types.isNothing(val) || types.isJsFunction(val), "Invalid function.");
						};
						fn[__Internal__.symbolModifiers] = (fn[__Internal__.symbolModifiers] || 0) | doodad.MethodModifiers.CallFirst;
						if (!fn[__Internal__.symbolExtender]) {
							fn[__Internal__.symbolExtender] = extenders.Method;
						};
						return fn;
					});
				
				doodad.CAN_BE_DESTROYED = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								fn: {
									type: 'AttributeBox,function',
									optional: true,
									description: "Method function.",
								},
							},
							returns: 'AttributeBox',
							description: "Specifies that the method can be called when the object is destroyed.",
					}
					//! END_REPLACE()
					, function CAN_BE_DESTROYED(/*optional*/fn) {
						fn = types.AttributeBox(fn);
						if (root.DD_ASSERT) {
							var val = types.unbox(fn);
							root.DD_ASSERT(types.isNothing(val) || types.isJsFunction(val), "Invalid function.");
						};
						fn[__Internal__.symbolModifiers] = (fn[__Internal__.symbolModifiers] || 0) | doodad.MethodModifiers.CanBeDestroyed;
						if (!fn[__Internal__.symbolExtender]) {
							fn[__Internal__.symbolExtender] = extenders.Method;
						};
						return fn;
					});
				
				doodad.ABSTRACT = doodad.NOT_IMPLEMENTED = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: null,
							returns: 'AttributeBox',
							description: "Specifies that this method is not implemented and can be overridden.",
					}
					//! END_REPLACE()
					, function NOT_IMPLEMENTED() {
						var fn = types.AttributeBox();
						fn[__Internal__.symbolModifiers] = (fn[__Internal__.symbolModifiers] || 0) | doodad.MethodModifiers.NotImplemented;
						fn[__Internal__.symbolExtender] = extenders.Method;
						return fn;
					});
				
				doodad.RETURNS = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								validator: {
									type: 'function',
									optional: true,
									description: "Method function.",
								},
								fn: {
									type: 'AttributeBox,function',
									optional: true,
									description: "Method function.",
								},
							},
							returns: 'AttributeBox',
							description: "Specifies that this method should returns a value validated by the specified validator.",
					}
					//! END_REPLACE()
					, function RETURNS(validator, /*optional*/fn) {
						root.DD_ASSERT && root.DD_ASSERT(types.isJsFunction(validator), "Invalid validator.");
						fn = types.AttributeBox(fn);
						if (root.DD_ASSERT) {
							var val = types.unbox(fn);
							root.DD_ASSERT(types.isNothing(val) || types.isJsFunction(val), "Invalid function.");
						};
						fn[__Internal__.symbolReturns] = validator;
						if (!fn[__Internal__.symbolExtender]) {
							fn[__Internal__.symbolExtender] = extenders.Method;
						};
						return fn;
					});

				doodad.ASYNC = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: null,
							returns: 'AttributeBox',
							description: "Specifies that this method is async and always returns a Promise.",
					}
					//! END_REPLACE()
					, function ASYNC(/*optional*/fn) {
						fn = types.AttributeBox(fn);
						if (root.DD_ASSERT) {
							var val = types.unbox(fn);
							root.DD_ASSERT(types.isNothing(val) || types.isJsFunction(val), "Invalid function.");
						};
						fn[__Internal__.symbolModifiers] = (fn[__Internal__.symbolModifiers] || 0) | doodad.MethodModifiers.Async;
						if (!fn[__Internal__.symbolExtender]) {
							fn[__Internal__.symbolExtender] = extenders.Method;
						};
						return doodad.RETURNS(types.isPromise, fn);
					});
				
				doodad.RENAME_OVERRIDE = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 1,
							paramsDirection: 'rightToLeft',
							params: {
								fn: {
									type: 'AttributeBox,function',
									optional: true,
									description: "Method function.",
								},
								name: {
									type: 'string',
									optional: true,
									description: "New name. If not specified, the name of the provided function will be taken.",
								},
							},
							returns: 'AttributeBox',
							description: "Specifies that a method will override the existing one with a new name.",
					}
					//! END_REPLACE()
					, function RENAME_OVERRIDE(/*<<< optional[name]*/ fn) {
						var name = null;
						if (arguments.length > 1) {
							name = fn;
							fn = arguments[1];
						};
						fn = types.AttributeBox(fn);
						var val = types.unbox(fn);
						if (root.DD_ASSERT) {
							root.DD_ASSERT(types.isBindable(val), "Invalid function.");
						};
						if (!name) {
							name = types.getFunctionName(val);
							if (!name) {
								throw new types.TypeError("A function name is required.");
							};
						};
						fn[__Internal__.symbolModifiers] = ((fn[__Internal__.symbolModifiers] || 0) & ~doodad.MethodModifiers.Replace) | doodad.MethodModifiers.Override;
						if (!fn[__Internal__.symbolExtender]) {
							fn[__Internal__.symbolExtender] = extenders.Method;
						};
						fn[__Internal__.symbolRenamedTo] = name;
						return fn;
					});
				
				doodad.RENAME_REPLACE = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 1,
							paramsDirection: 'rightToLeft',
							params: {
								fn: {
									type: 'AttributeBox,function',
									optional: true,
									description: "Method function.",
								},
								name: {
									type: 'string',
									optional: true,
									description: "New name. If not specified, the name of the provided function will be taken.",
								},
							},
							returns: 'AttributeBox',
							description: "Specifies that a method will be renamed and replace the previous one.",
					}
					//! END_REPLACE()
					, function RENAME_REPLACE(/*<<< optional[name]*/ /*optional*/fn) {
						var name = null;
						if (arguments.length > 1) {
							name = fn;
							fn = arguments[1];
						};
						fn = types.AttributeBox(fn);
						var val = types.unbox(fn);
						if (root.DD_ASSERT) {
							root.DD_ASSERT(types.isBindable(val), "Invalid function.");
						};
						if (!name) {
							name = types.getFunctionName(val);
							if (!name) {
								throw new types.TypeError("A function name is required.");
							};
						};
						fn[__Internal__.symbolModifiers] = ((fn[__Internal__.symbolModifiers] || 0) & ~doodad.MethodModifiers.Override) | doodad.MethodModifiers.Replace;
						if (!fn[__Internal__.symbolExtender]) {
							fn[__Internal__.symbolExtender] = extenders.Method;
						};
						fn[__Internal__.symbolRenamedTo] = name;
						return fn;
					});
				

				//==================================
				// Class
				//==================================
				
				__Internal__.getDefaultAttributes = function getDefaultAttributes() {
					var attributes = types.nullObject();

					// From "Doodad.Class"
					attributes[__Internal__.symbolAttributes] = doodad.PRIVATE_DEBUG(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PERSISTENT(doodad.PRE_EXTEND(doodad.TYPE(doodad.INSTANCE(doodad.ATTRIBUTE(attributes, extenders.Attribute))))))));
					attributes[__Internal__.symbolPrototype] = doodad.PRIVATE_DEBUG(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PERSISTENT(doodad.PRE_EXTEND(doodad.TYPE(doodad.INSTANCE(doodad.ATTRIBUTE(null, extenders.Attribute))))))));
					attributes[__Internal__.symbolModifiers] = doodad.PUBLIC(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PERSISTENT(doodad.PRE_EXTEND(doodad.TYPE(doodad.ATTRIBUTE(0, extenders.Attribute)))))));
					attributes[__Internal__.symbolImplements] = doodad.PRIVATE_DEBUG(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PERSISTENT(doodad.PRE_EXTEND(doodad.TYPE(doodad.INSTANCE(doodad.ATTRIBUTE(null, extenders.Attribute))))))));
					attributes[__Internal__.symbolMustOverride] = doodad.PUBLIC(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PRE_EXTEND(doodad.TYPE(doodad.INSTANCE(extenders.Null))))));
					attributes[__Internal__.symbolBase] = doodad.PUBLIC(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PRE_EXTEND(doodad.TYPE(doodad.INSTANCE(doodad.ATTRIBUTE(null, extenders.Attribute)))))));
					attributes[__Internal__.symbolIsolated] = doodad.PRIVATE_DEBUG(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PRE_EXTEND(doodad.TYPE(doodad.INSTANCE(doodad.ATTRIBUTE(null, extenders.Attribute)))))));
					attributes[__Internal__.symbolIsolatedCache] = doodad.PRIVATE_DEBUG(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PRE_EXTEND(doodad.INSTANCE(doodad.ATTRIBUTE(null, extenders.Attribute))))));
					attributes[__Internal__.symbolAttributesStorage] = doodad.PRIVATE_DEBUG(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PERSISTENT(doodad.PRE_EXTEND(doodad.TYPE(doodad.INSTANCE(doodad.ATTRIBUTE(null, extenders.Attribute))))))));
					attributes[__Internal__.symbolCurrentDispatch] = doodad.PRIVATE_DEBUG(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PERSISTENT(doodad.PRE_EXTEND(doodad.TYPE(doodad.INSTANCE(extenders.Null)))))));
					attributes[__Internal__.symbolCurrentCallerIndex] = doodad.PRIVATE_DEBUG(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PERSISTENT(doodad.PRE_EXTEND(doodad.TYPE(doodad.INSTANCE(extenders.Null)))))));

					root.DD_ASSERT && root.DD_ASSERT(types.isObject(__Internal__.classProto));
					
					var keys = types.append(types.keys(attributes), types.symbols(attributes));
					
					tools.forEach(keys, function(key) {
						var attribute = attributes[key] = doodad.OPTIONS({isEnumerable: false}, attributes[key]);
						attribute[__Internal__.symbolPrototype] = __Internal__.classProto;
					});
					
					if (!(__Internal__.symbolAttributes in _shared.reservedAttributes)) {
						// First time "getDefaultAttributes" is called...
						tools.forEach(keys, function(key) {
							if (!(key in _shared.reservedAttributes)) {
								_shared.reservedAttributes[key] = null;
							};
						});
					};
					
					return attributes;
				};
				
				__Internal__.extendRenamed = function extendRenamed(attr, newAttr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, extender, proto, protoName) {
					// NOTE: The contract must be fullfilled (source: Sorella in freenode) : `compose({ a(){ return 1 }, b(){ return a() + 1 }, {a renamed to _a(){ return 3 } }).b()` should returns 2

					var sourceAttribute = types.AttributeBox(destAttribute);
					sourceAttribute[__Internal__.symbolRenamedTo] = null;
					sourceAttribute[__Internal__.symbolRenamedFrom] = attr;

					var destAttribute;
					if (types.has(destAttributes, newAttr)) {
						destAttribute = destAttributes[newAttr];
						extender = destAttribute[__Internal__.symbolExtender];
					} else {
						destAttribute = types.AttributeBox(undefined);
					};

					if (extender.getValue) {
						destAttribute = extender.getValue(newAttr, destAttribute, forType);
					};

					if (extender.extend) {
						var result = extender.extend(newAttr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, false, proto, protoName);
						destAttribute = destAttribute.setValue(result);
					};

					return destAttribute;
				};
				
				__Internal__.preExtendAttribute = function preExtendAttribute(attr, base, baseProto, source, sourceProto, sourceAttributes, destAttributes, baseIsProto, sourceIsProto, forType, _isolated, extendedAttributes, proto, protoName) {
					var attrs = (sourceAttributes ? sourceAttributes : sourceProto);
					if ((attr !== '__proto__') && !(attr in _shared.reservedAttributes) && types.has(attrs, attr)) {
						var sourceAttribute = types.AttributeBox(attrs[attr]);
							
						var _interface = types.get(sourceAttribute, __Internal__.symbolInterface);
						if (_interface) {
							if (!_isolated.has(_interface)) {
								throw new types.Error("Interface '~0~' not found.", [types.getTypeName(_interface) || __Internal__.ANONYMOUS]);
							};
							var data = _isolated.get(_interface);
							extendedAttributes = data[1];
							destAttributes = data[2];
						};
						
						var extender = null;

						var destAttribute;
						if (types.has(destAttributes, attr)) {
							destAttribute = destAttributes[attr];
							extender = destAttribute[__Internal__.symbolExtender];
						} else {
							destAttribute = types.AttributeBox(undefined);
						};
						
						var sourceExtender = types.get(sourceAttribute, __Internal__.symbolExtender);
						if (sourceExtender)  {
							if (extender && extender.override) {
								extender = extender.override(sourceExtender);
							} else {
								extender = sourceExtender;
							};
						};
						
						if (!extender) {
							if (sourceIsProto) {
								if (types.isJsFunction(types.unbox(sourceAttribute))) {
									extender = extenders.Method;
								} else {
									extender = extenders.ClonedAttribute;
								};
							} else {
								extender = extenders.Null;
							};
						};
						
						if (!extender.isType && !extender.isInstance) {
							if (!types.isSymbol(attr) && (attr[0] === '$')) {
								extender = doodad.TYPE(extender);
							} else {
								extender = doodad.INSTANCE(extender);
							};
						};
						
						if (!types.isSymbol(attr)) {
							if (root.getOptions().debug || __options__.enforcePolicies) {
								if (!!extender.isType !== !!extender.isInstance) {
									if (attr[0] === '$') {
										if (!extender.isType) {
											throw new types.Error("Instance attributes must not begin with '$'.");
										};
									} else {
										if (!extender.isInstance) {
											throw new types.Error("Type attributes must begin with '$'.");
										};
									};
								};
							};
						};

						if (extender.getValue) {
							sourceAttribute = extender.getValue(attr, sourceAttribute, forType);
						};
						
						if (sourceIsProto) {
							sourceAttribute[__Internal__.symbolExtender] = extender;
						};

						if (!types.get(sourceAttribute, __Internal__.symbolPrototype)) {
							sourceAttribute[__Internal__.symbolPrototype] = sourceProto;
							sourceProto[attr] = sourceAttribute;
						};
						
						if (extender.extend) {
							if ((extender.isType && forType) || (extender.isInstance && !forType)) {
								if (extender.getValue) {
									destAttribute = extender.getValue(attr, destAttribute, forType);
								};

								if (baseProto && ((types.unbox(destAttribute) === undefined) || extender.notInherited)) {
									var result = types.AttributeBox(baseProto[attr]);
									if (extender.getValue) {
										result = extender.getValue(attr, result, forType);
									};
									if (destAttribute) {
										destAttribute = destAttribute.setValue(result);
									} else {
										destAttribute = result;
									};
									if (!destAttribute[__Internal__.symbolPrototype]) {
										destAttribute[__Internal__.symbolPrototype] = baseProto;
									};
								};
								
								if ((source === base) || (destAttribute[__Internal__.symbolPrototype] !== sourceAttribute[__Internal__.symbolPrototype]) || extender.notInherited) {
									destAttribute[__Internal__.symbolExtender] = extender;
									
									if (types.isNothing(destAttribute[__Internal__.symbolScope])) {
										var scope = types.get(sourceAttribute, __Internal__.symbolScope);
										if (types.isNothing(scope)) {
											if (!types.isSymbol(attr) && ( (attr.slice(0, 2) === '__') || (attr.slice(0, 3) === '$__') )) {
												destAttribute[__Internal__.symbolScope] = doodad.Scopes.Protected;
											} else {
												destAttribute[__Internal__.symbolScope] = doodad.Scopes.Public;
											};
										} else {
											destAttribute[__Internal__.symbolScope] = scope;
										};
									};
									
									extendedAttributes.push(attr);
									
									if (extender.preExtend) {
										var result = extender.extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, protoName);
										if (destAttribute) {
											destAttribute = destAttribute.setValue(result);
										} else {
											destAttribute = result; //result.clone();
										};
										var newAttr = sourceIsProto && destAttribute[__Internal__.symbolRenamedTo];
										if (newAttr) {
											destAttribute = __Internal__.extendRenamed(attr, newAttr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, extender, proto, protoName);
											attr = newAttr;
										};
										var overrideWith = sourceAttribute[__Internal__.symbolOverrideWith];
										if (overrideWith) {
											overrideWith = doodad.OVERRIDE(overrideWith);
											result = extender.extend(attr, source, sourceProto, destAttributes, forType, overrideWith, destAttribute, sourceIsProto, protoName);
											destAttribute = destAttribute.setValue(result);
										};
										destAttributes[attr] = destAttribute;
										if (extender.isPreserved && !types.isSymbol(attr)) {
											var presAttr = '__' + attr + '_preserved__';
											destAttribute = destAttribute.clone();
											destAttribute[__Internal__.symbolExtender] = extender.get({isPreserved: false});
											destAttributes[presAttr] = destAttribute;
										};

									} else {
										return [
											/* 0 : data   */ [/*0*/ extender], 
											/* 1 : params */ [/*0*/ attr, /*1*/ source, /*2*/ sourceProto, /*3*/ destAttributes, /*4*/ forType, /*5*/ sourceAttribute, /*6*/ destAttribute, /*7*/ sourceIsProto, /*8*/ protoName]
										];
									};
								};
							};
						};
					};
				};
				
				__Internal__.extendSource = function extendSource(base, baseAttributes, source, sourceAttributes, destAttributes, baseType, baseIsType, baseIsClass, sourceIsType, sourceIsClass, _isolated, extendedAttributes, proto, protoName) {
					var baseIsProto = false,
						baseTypeProto,
						baseInstanceProto;
					if (types.isFunction(base) || baseType) {
						if (baseIsClass) {
							// doodad-js Class / Class Object
							baseTypeProto = baseInstanceProto = _shared.getAttribute(base, __Internal__.symbolPrototype);
						} else {
							// doodad-js Type / JS Class
							baseTypeProto = base;
							baseInstanceProto = base.prototype;
						};
					} else {
						// Prototype
						baseTypeProto = baseInstanceProto = base;
						baseIsProto = true;
					};
					
					var sourceIsProto = false,
						sourceTypeProto,
						sourceInstanceProto,
						sourceAttrs;
					if (sourceIsClass || sourceIsType) {
						sourceAttrs = types.append(types.keys(sourceAttributes), types.symbols(sourceAttributes));
						if (sourceIsClass) {
							// doodad-js Class
							sourceTypeProto = sourceInstanceProto = _shared.getAttribute(source, __Internal__.symbolPrototype);
						} else {
							// doodad-js Type
							sourceTypeProto = source;
							sourceInstanceProto = source.prototype;
						};
					} else if (types.isFunction(source)) {
						// JS class
						sourceTypeProto = source;
						sourceInstanceProto = source.prototype;
					} else {
						// Prototype
						sourceTypeProto = sourceInstanceProto = source;
						sourceAttrs = types.append(types.keys(source), types.symbols(source));
						sourceIsProto = true;
					};
					
					// Pre-extend
					var destAttributesKeys = types.append(types.keys(destAttributes), types.symbols(destAttributes));
					var attrs = types.unique(sourceAttrs, destAttributesKeys);
					var toExtend = [];
					
					for (var k = 0; k < attrs.length; k++) {
						var attr = attrs[k];
						var params;

						if (baseIsType) {
							params = __Internal__.preExtendAttribute(attr, base, baseTypeProto, source, sourceTypeProto, sourceAttributes, destAttributes, baseIsProto, sourceIsProto, true, _isolated, extendedAttributes, proto, protoName);
							if (params) {
								toExtend.push(params);
							};
						};
						
						params = __Internal__.preExtendAttribute(attr, base, baseInstanceProto, source, sourceInstanceProto, sourceAttributes, destAttributes, baseIsProto, sourceIsProto, false, _isolated, extendedAttributes, proto, protoName);
						if (params) {
							toExtend.push(params);
						};
					};
					
					// Extend
					var toExtendLen = toExtend.length;
					for (var k = 0; k < toExtendLen; k++) {
						var data = toExtend[k],
							params = data[1];
						data = data[0];
						var extender = data[0],
							attr = params[0],
							source = params[1],
							sourceProto = params[2],
							destAttributes = params[3],
							forType = params[4],
							sourceAttribute = params[5],
							destAttribute = params[6],
							sourceIsProto = params[7],
							protoName = params[8];
						var result = extender.extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, protoName);
						if (destAttribute) {
							destAttribute = destAttribute.setValue(result);
						} else {
							destAttribute = result; //result.clone();
						};
						var newAttr = sourceIsProto && destAttribute[__Internal__.symbolRenamedTo];
						if (newAttr) {
							destAttribute = __Internal__.extendRenamed(attr, newAttr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, extender, proto, protoName);
							attr = newAttr;
						};
						var overrideWith = sourceAttribute[__Internal__.symbolOverrideWith];
						if (overrideWith) {
							overrideWith = doodad.OVERRIDE(overrideWith);
							result = extender.extend(attr, source, sourceProto, destAttributes, forType, overrideWith, destAttribute, sourceIsProto, protoName);
							destAttribute = destAttribute.setValue(result);
						};
						destAttributes[attr] = destAttribute;
						if (extender.isPreserved && !types.isSymbol(attr)) {
							var presAttr = '__' + attr + '_preserved__';
							destAttribute = destAttribute.clone();
							destAttribute[__Internal__.symbolExtender] = extender.get({isPreserved: false});
							destAttributes[presAttr] = destAttribute;
						};
					};
				};
				
				__Internal__.addImplements = function addImplements(_implements, attributes, _isolated, source, sourceBase, sourceImplements, sourceAttributes, sourceIsolated, baseIsType, extendedAttributes) {
					// Add new implement
					_implements.add(source);
					
					if (sourceBase) {
						if (types.isInterface(sourceBase) || types.isMixIn(sourceBase)) {
							_implements.add(sourceBase);
						};
					};
					
					if (sourceImplements) {
						var isIsolated = types.isIsolated(source);
						// <FUTURE> for (var item of sourceImplements)
						sourceImplements.forEach(function(item) {
							if ((!isIsolated || types.isIsolated(item)) && !_implements.has(item)) {
								_implements.add(item);
							};
						});
					};
					
					//if (sourceAttributes) {
					//	var keys = types.append(types.keys(sourceAttributes), types.symbols(sourceAttributes));
					//	tools.forEach(keys, function(key) {
					//		if (!types.has(attributes, key)) {
					//			attributes[key] = sourceAttributes[key].clone();
					//			extendedAttributes.push(key);
					//		};
					//	});
					//};
					
					if (sourceIsolated) {
						sourceIsolated.forEach(function(data, _interface) {
							if (!_isolated.has(_interface)) {
								_isolated.set(_interface, data);

								var impls = _shared.getAttribute(_interface, __Internal__.symbolImplements).values(),
									impl;
									
								// <FUTURE> for (let impl of impls)
								while (impl = impls.next()) {
									if (impl.done) {
										break;
									};
									impl = impl.value;
									if (types.isIsolated(impl) && !_isolated.has(impl)) {
										_isolated.set(impl, data);
									};
								};
							};
						});
					};
				};
				
				__Internal__.implementSource = function implementSource(base, baseAttributes, source, destAttributes, _implements, _isolated, typeStorage, instanceStorage, baseType, baseIsType, baseIsClass, baseIsBase, baseIsMixIn, baseIsInterface, proto, extendedAttributes, protoName) {
					var sourceType = types.getType(source),
						sourceIsType = sourceType && types.isType(source),
						sourceIsClass = sourceType && types.isClass(sourceType),
						sourceName = (sourceType ? types.getTypeName(sourceType) : types.unbox(source.$TYPE_NAME));
						base; doodad
					if (!sourceIsClass || !_implements.has(source)) {
						if (baseType && !types.baseof(sourceType, baseType)) { // prevents cyclic extend
							if (root.getOptions().debug || __options__.enforcePolicies) {
								if (source !== base) {
									//if (!baseIsBase && types.isBase(source)) {
									//	throw new types.Error("Can't implement base type '~0~' in non-base type '~1~'.", [sourceName || __Internal__.ANONYMOUS, types.getTypeName(base) || __Internal__.ANONYMOUS]);
									//};
									if (baseIsMixIn) {
										if (sourceIsClass && !types.isMixIn(source) && !types.isInterface(source)) {
											throw new types.Error("Can't implement non-mix-in or non-interface type '~0~' in a mix-in.", [sourceName || __Internal__.ANONYMOUS]);
										};
									} else if (baseIsInterface) {
										if (sourceIsClass && !types.isInterface(source)) {
											throw new types.Error("Can't implement non-interface type '~0~' in an interface.", [sourceName || __Internal__.ANONYMOUS]);
										};
									};
								};
							};
							
							if (types.isIsolated(source) && !types.isIsolated(base)) {
								if (!_implements.has(source)) {
									var destImplements = _implements;

									destImplements.add(source);

									var protoName = (sourceName ? sourceName + '_Interface' : null);
									base = doodad.Interface;
									baseType = base;
									baseIsType = true;
									baseIsClass = true;
									_implements = new types.Set();
									typeStorage = types.nullObject();
									instanceStorage = types.nullObject();
									destAttributes = __Internal__.getDefaultAttributes();
									
									//newImplements.add(source);
									extendedAttributes = [];
									var data = [/*0*/ protoName, /*1*/ extendedAttributes, /*2*/ destAttributes, /*3*/ source, /*4*/ typeStorage, /*5*/ instanceStorage, /*6 type*/ null, /*7*/ base, /*8 _isolated*/ null, /*9*/ _implements, /*10*/ proto, /*11 modifiers*/ 0];

									_isolated.set(source, data);
									var impls = _shared.getAttribute(source, __Internal__.symbolImplements).values(),
										impl;
									while (impl = impls.next()) {
										if (impl.done) {
											break;
										};
										impl = impl.value;
										if (types.isIsolated(impl)) {
											if (!destImplements.has(impl)) {
												destImplements.add(impl);
											};
											_isolated.set(impl, data);
										};
									};
									
									var sourceData = _shared.getAttributes(base, [__Internal__.symbolBase, __Internal__.symbolImplements, __Internal__.symbolAttributes, __Internal__.symbolIsolated]);
									baseAttributes = sourceData[__Internal__.symbolAttributes];
									__Internal__.addImplements(_implements, destAttributes, _isolated, base, sourceData[__Internal__.symbolBase], sourceData[__Internal__.symbolImplements], baseAttributes, sourceData[__Internal__.symbolIsolated], baseIsType, extendedAttributes);

									__Internal__.extendSource(base, baseAttributes, base, baseAttributes, destAttributes, baseType, baseIsType, baseIsClass, sourceIsType, sourceIsClass, _isolated, extendedAttributes, proto, protoName);
								};
							};
							
							var sourceAttributes = undefined;
							if (sourceIsClass) {
								var sourceData = _shared.getAttributes(source, [__Internal__.symbolBase, __Internal__.symbolImplements, __Internal__.symbolAttributes, __Internal__.symbolIsolated]);
								sourceAttributes = sourceData[__Internal__.symbolAttributes];
								__Internal__.addImplements(_implements, destAttributes, _isolated, source, sourceData[__Internal__.symbolBase], sourceData[__Internal__.symbolImplements], sourceAttributes, sourceData[__Internal__.symbolIsolated], baseIsType, extendedAttributes);
							};
							
							__Internal__.extendSource(base, baseAttributes, source, sourceAttributes, destAttributes, baseType, baseIsType, baseIsClass, sourceIsType, sourceIsClass, _isolated, extendedAttributes, proto, protoName);
						};
					};
				};

				__Internal__.initializeAttributes = function initializeAttributes(obj, attributes, typeStorage, instanceStorage, forType, /*optional*/values, /*optional*/extendedAttributes) {
					var storage = (forType ? typeStorage : instanceStorage);
					var attrs = (extendedAttributes ? types.unique(extendedAttributes) : types.append(types.keys(attributes), types.symbols(attributes)))
					for (var i = attrs.length - 1; i >= 0; i--) {
						var attr = attrs[i],
							attribute = attributes[attr],
							extender = attribute[__Internal__.symbolExtender];
						
						if (extender) {
							if ((forType && extender.isType) || (!forType && extender.isInstance)) {
								if (extender.preExtend) {
									var value = types.get(values, attr, types.unbox(attribute));
									extender.init && extender.init(attr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value);
									if (extender.isPreserved && !types.isSymbol(attr)) {
										var presAttr = '__' + attr + '_preserved__';
										extender.init && extender.init(presAttr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value);
									};
									delete attrs[i]; //attrs.splice(i, 1);
								};
							} else {
								delete attrs[i]; //attrs.splice(i, 1);
							};
						} else {
							delete attrs[i]; //attrs.splice(i, 1);
						};
					};
					for (var i = attrs.length - 1; i >= 0; i--) {
						var attr = attrs[i];
						
						if (attr) {
							var attribute = attributes[attr],
								extender = attribute[__Internal__.symbolExtender];
							
							if (extender) {
								// NOTE: "if (!extender.preExtend && ((forType && extender.isType) || (!forType && extender.isInstance)) {...}" --> Done with "attrs.splice()".
								var value = types.get(values, attr, types.unbox(attribute));
								extender.init && extender.init(attr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value);
								if (extender.isPreserved && !types.isSymbol(attr)) {
									var presAttr = '__' + attr + '_preserved__';
									extender.init && extender.init(presAttr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value);
								};
							};
						};
					};
				};
				
				__Internal__.postExtend = function postExtend(attributes, extendedAttributes) {
					extendedAttributes = types.unique(extendedAttributes);

					for (var k = 0; k < extendedAttributes.length; k++) {
						var attr = extendedAttributes[k];
						var attribute = attributes[attr];
						
						var extender = attribute[__Internal__.symbolExtender];
						var newAttribute = extender.postExtend && extender.postExtend(attr, attributes, attribute) || attribute;
						if (newAttribute !== attribute) {
							attributes[attr] = attribute = newAttribute;
						};
						
						types.freezeObject(attribute);
					};
				};
				
				__Internal__.createType = function createType(base, baseIsType, proto, protoName, typeStorage, instanceStorage, destAttributes, extendedAttributes, _isolated, _implements, modifiers, /*optional*/_new, /*optional*/_delete) {
					// Post-Extend
					__Internal__.postExtend(destAttributes, extendedAttributes);
					
					if (baseIsType) {
						var typeProto = {},
							instanceProto = {};
						
						typeProto.$TYPE_NAME = types.READ_ONLY(protoName);

						if (_new) {
							instanceProto._new = typeProto._new = _new;
						};

						if (_delete) {
							instanceProto._delete = typeProto._delete = _delete;
						};
					
						var type = base.$inherit(
							/*typeProto*/
							typeProto,
						
							/*instanceProto*/
							instanceProto,
						
							/*constructor*/
							__Internal__.makeInsideForNew(),
						
							/*constructorContext*/
							{internal: __Internal__, getType: types.getType}
						);
					
						//_shared.setAttribute(type, __Internal__.symbolAttributes, destAttributes, {});

						if (__Internal__.creatingClass) {
							doodad.Class = type;
							__Internal__.creatingClass = false;
						};
					
						root.DD_ASSERT && root.DD_ASSERT(types.baseof(types.Type, type));
					
						// Set values (NOTE: will be initialized in "_new")
						_shared.setAttribute(type, __Internal__.symbolAttributesStorage, typeStorage, {configurable: true});
						var values = {};
						values[__Internal__.symbolAttributes] = destAttributes;
						values[__Internal__.symbolBase] = base;
						values[__Internal__.symbolIsolated] = _isolated;
						values[__Internal__.symbolImplements] = _implements;
						values[__Internal__.symbolPrototype] = proto;
						values[__Internal__.symbolModifiers] = modifiers;
						_shared.setAttributes(type, values, {configurable: true});

						_shared.setAttribute(type.prototype, __Internal__.symbolAttributesStorage, instanceStorage, {configurable: true});
						var values = {};
						values[__Internal__.symbolAttributes] = types.clone(destAttributes);
						values[__Internal__.symbolBase] = base;
						values[__Internal__.symbolIsolated] = types.clone(_isolated);
						values[__Internal__.symbolImplements] = types.clone(_implements);
						values[__Internal__.symbolPrototype] = proto;
						_shared.setAttributes(type.prototype, values, {configurable: true});

						return type;

					} else {
						__Internal__.initializeAttributes(base, destAttributes, typeStorage, instanceStorage, false, null, extendedAttributes);

						if (base._implements(mixIns.Creatable)) {
							_shared.setAttribute(base, __Internal__.symbolDestroyed, null);
						};

						return base;
					};
				};
				
				__Internal__.$extend = function $extend(/*paramarray*/) {
					var base = ((this === global) ? undefined : this);
				
					root.DD_ASSERT && root.DD_ASSERT(!base || types.baseof(types.Type, types.getType(base)), "Base must be a type.");

					if (!base) {
						base = types.TypeNamespace;
					};
					
					var index = tools.findLastItem(arguments, types.isJsObject),
						proto = (index !== null) && arguments[index] || {},
						protoName = proto && types.unbox(proto.$TYPE_NAME) || '',
						_new = types.get(proto, '_new'),
						_delete = types.get(proto, '_delete');
					
					if (proto) {	
						delete proto._new;
						delete proto._delete;
					};

					//if (!types.isStringAndNotEmpty(protoName)) {
					//	throw new types.Error("Prototype has no name. You must define the '$TYPE_NAME' attribute.");
					//};

					var baseType = types.getType(base),
						baseIsType = baseType && types.isType(base),
						baseIsClass = baseType && types.isClass(baseType),
						baseIsBase = baseIsClass && types.isBase(baseType),
						baseIsMixIn = baseIsClass && types.isMixIn(baseType),
						baseIsInterface = baseIsClass && types.isInterface(baseType);
						
					var baseTypeAttributes = null,
						baseTypeBase = null,
						baseTypeImplements = null,
						baseTypeIsolated = null,
						baseTypeStorage = null,
						baseModifiers = 0;

					if (baseIsClass) { // Doodad Class / Doodad Class Object
						baseModifiers = baseType[__Internal__.symbolModifiers];

						if (!baseIsType && !(baseModifiers & doodad.ClassModifiers.Expandable)) {
							throw new types.Error("Object is not expandable.");
						};

						var baseData = _shared.getAttributes(baseType, [__Internal__.symbolAttributes, __Internal__.symbolBase, __Internal__.symbolImplements, __Internal__.symbolIsolated, __Internal__.symbolAttributesStorage]);
						baseTypeAttributes = baseData[__Internal__.symbolAttributes];
						baseTypeBase = baseData[__Internal__.symbolBase];
						baseTypeImplements = baseData[__Internal__.symbolImplements];
						baseTypeIsolated = baseData[__Internal__.symbolIsolated];
						baseTypeStorage = baseData[__Internal__.symbolAttributesStorage];
					};
					
					var _implements = null,
						_isolated = null,
						destAttributes = null,
						typeStorage = types.nullObject(),
						instanceStorage = types.nullObject(),
						modifiers = 0,
						additionalProtos = [];

					var sources = types.toArray(arguments);

					if (baseIsType) { // Doodad Class / Doodad Type
						_implements = new types.Set();
						_isolated = new types.Map();
						destAttributes = __Internal__.getDefaultAttributes();
						typeStorage = types.nullObject();
						instanceStorage = types.nullObject();
						modifiers = (proto && types.unbox(proto[__Internal__.symbolModifiers]) || 0) | (baseModifiers & doodad.preservedClassModifiers);
					} else if (baseIsClass) { // Doodad Class Object
						var baseData = _shared.getAttributes(base, [__Internal__.symbolAttributes, __Internal__.symbolImplements, __Internal__.symbolIsolated, __Internal__.symbolAttributesStorage]);
						destAttributes = baseData[__Internal__.symbolAttributes];
						_implements = baseData[__Internal__.symbolImplements];
						_isolated = baseData[__Internal__.symbolIsolated];
						instanceStorage = baseData[__Internal__.symbolAttributesStorage];

						typeStorage = baseTypeStorage;
						baseTypeAttributes = destAttributes;

						if (base._implements(mixIns.Creatable)) {
							var injected = {
								create: doodad.REPLACE(__Internal__.creatablePrototype.create),
							};
							injected.create[__Internal__.symbolPrototype] = __Internal__.creatablePrototype;
							sources.unshift(injected);
						};
					};

					var extendedAttributes = [];

					// Implement base
					if (baseIsClass && baseIsType) { // Doodad Class
						__Internal__.implementSource(base, baseTypeAttributes, base, destAttributes, _implements, _isolated, typeStorage, instanceStorage, baseType, baseIsType, baseIsClass, baseIsBase, baseIsMixIn, baseIsInterface, proto, extendedAttributes, protoName);
					};

					// Implement sources
					var sourcesLen = sources.length;
					for (var i = 0; i < sourcesLen; i++) {
						var source = sources[i];
						root.DD_ASSERT && root.DD_ASSERT(types.getType(source) || types.isJsObject(source));
						__Internal__.implementSource(base, baseTypeAttributes, source, destAttributes, _implements, _isolated, typeStorage, instanceStorage, baseType, baseIsType, baseIsClass, baseIsBase, baseIsMixIn, baseIsInterface, proto, extendedAttributes, protoName);
					};

					// Create and return extended version of "base"
					var type = __Internal__.createType(base, baseIsType, proto, protoName, typeStorage, instanceStorage, destAttributes, extendedAttributes, _isolated, _implements, modifiers, _new, _delete);

					return type;
				};
				
				__Internal__.classProto = {
					$TYPE_NAME: "Class",
					
					_new: types.SUPER(
						function _new(parent, name, fullName /*paramarray*/) {
							var cls = types.getType(this),
								forType = types.isType(this);

							if (forType) {
								this._super(parent, name, fullName);
							} else {
								this._super();
							};

							// Validate type
							if (!cls) {
								throw new types.Error("Invalid class.");
							};

							var modifiers = (types.get(cls, __Internal__.symbolModifiers) || 0);
							
							// Must not be a base class
							var isBase = (modifiers & (doodad.ClassModifiers.Base | doodad.ClassModifiers.MixIn | doodad.ClassModifiers.Interface));
							if (isBase) {
								if (!forType) {
									throw new types.Error("Bases, mix-ins and interfaces must be inherited first.");
								};
							};
							
							// Static types can't be instantiated
							if (modifiers & doodad.ClassModifiers.Static) {
								if (!forType) {
									throw new types.Error("Static types can't be instantiated.");
								};
							};
							
							// Initialize attributes
							var typeStorage = cls[__Internal__.symbolAttributesStorage];
							var instanceStorage = cls.prototype[__Internal__.symbolAttributesStorage];

							if (forType) {
								var values = types.nullObject();
								var attributes = values[__Internal__.symbolAttributes] = this[__Internal__.symbolAttributes];
								values[__Internal__.symbolModifiers] = modifiers;
								values[__Internal__.symbolImplements] = this[__Internal__.symbolImplements];
								values[__Internal__.symbolIsolated] = this[__Internal__.symbolIsolated];
								values[__Internal__.symbolPrototype] = this[__Internal__.symbolPrototype];
								values[__Internal__.symbolBase] = this[__Internal__.symbolBase];
								__Internal__.initializeAttributes(this, attributes, typeStorage, instanceStorage, true, values);

								var values = types.nullObject();
								var attributes = values[__Internal__.symbolAttributes] = this.prototype[__Internal__.symbolAttributes]; // NOTE: already cloned
								values[__Internal__.symbolImplements] = this.prototype[__Internal__.symbolImplements]; // NOTE: already cloned
								values[__Internal__.symbolIsolated] = this.prototype[__Internal__.symbolIsolated]; // NOTE: already cloned
								values[__Internal__.symbolPrototype] = this.prototype[__Internal__.symbolPrototype];
								values[__Internal__.symbolBase] = this.prototype[__Internal__.symbolBase];
								__Internal__.initializeAttributes(this.prototype, attributes, typeStorage, instanceStorage, false, values);
							} else {
								var values = types.nullObject();
								var attributes = values[__Internal__.symbolAttributes] = types.clone(cls.prototype[__Internal__.symbolAttributes]);
								values[__Internal__.symbolImplements] = types.clone(cls.prototype[__Internal__.symbolImplements]);
								values[__Internal__.symbolIsolated] = types.clone(cls.prototype[__Internal__.symbolIsolated]);
								values[__Internal__.symbolPrototype] = cls.prototype[__Internal__.symbolPrototype];
								values[__Internal__.symbolBase] = cls.prototype[__Internal__.symbolBase];
								__Internal__.initializeAttributes(this, attributes, typeStorage, types.clone(instanceStorage), false, values);
							};
	
							// Call constructor
							if (!isBase) {
								if (this._implements(mixIns.Creatable)) {
									if (forType) {
										this.$create.apply(this, _shared.Natives.arraySlice.call(arguments, 3));
									} else {
										this.create.apply(this, arguments);
									};
								};
							};
							
							// Seal object if it is of a sealed class
							return this; // TODO: //(types.isSealed(cls) ? types.sealObject(this) : this);
						}),
					
					_delete: types.SUPER(
						function _delete() {
							this._super();
							
							var forType = types.isType(this);
							var cls = types.getType(this);
							var attributes = this[__Internal__.symbolAttributes];
							var storage = this[__Internal__.symbolAttributesStorage];
							var attrs = types.append(types.keys(attributes), types.symbols(attributes));
							var sealed = types.isSealed(this);
								
							for (var i = attrs.length - 1; i >= 0; i--) {
								var attr = attrs[i],
									attribute = attributes[attr],
									extender = attribute[__Internal__.symbolExtender];
								
								if (extender) {
									if (extender.isPersistent) {
										attrs.splice(i, 1);
									} else if (!extender.preExtend) {
										if ((extender.isType && forType) || (extender.isInstance && !forType)) {
											extender.remove && extender.remove(attr, this, storage, forType, attribute);
										};
										attrs.splice(i, 1);
									};
								} else {
									attrs.splice(i, 1);
								};
							};
							
							for (var i = attrs.length - 1; i >= 0; i--) {
								var attr = attrs[i],
									attribute = attributes[attr],
									extender = attribute[__Internal__.symbolExtender];
									
								// NOTE: "if (!extender.isPersistent && extender.preExtend) {...}" --> Done with "attrs.splice()".
								if ((extender.isType && forType) || (extender.isInstance && !forType)) {
									extender.remove && extender.remove(attr, this, storage, forType, attribute);
								};
							};
							
						}),
					
					toString: root.DD_DOC(
						//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
								author: "Claude Petit",
								revision: 2,
								params: null,
								returns: 'string',
								description: "Converts object to a string.",
						}
						//! END_REPLACE()
						, doodad.PUBLIC(doodad.RETURNS(types.isString, doodad.PRE_EXTEND(doodad.TYPE(doodad.INSTANCE(doodad.JS_METHOD(
						function toString() {
							if (types.isClass(this)) {
								return '[class ' + (types.getTypeName(this) || __Internal__.ANONYMOUS) + ']';
							} else {
								return '[object ' + (types.getTypeName(this) || __Internal__.ANONYMOUS) + ']';
							};
						}))))))),



					$extend: root.DD_DOC(
						//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
								author: "Claude Petit",
								revision: 0,
								params: {
									paramarray: {
										type: 'arrayof(object,Class)',
										optional: false,
										description: "Prototypes and classes to extend with.",
									},
								},
								returns: 'Class',
								description: "Returns a new extended class.",
						}
						//! END_REPLACE()
						, doodad.PUBLIC(doodad.READ_ONLY(doodad.TYPE(doodad.JS_METHOD( __Internal__.$extend ))))),
					
					extend: root.DD_DOC(
						//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
								author: "Claude Petit",
								revision: 0,
								params: {
									paramarray: {
										type: 'arrayof(object,Class)',
										optional: false,
										description: "Prototypes and classes to extend with.",
									},
								},
								returns: 'Object',
								description: "Extends an object and returns that same object.",
						}
						//! END_REPLACE()
						, doodad.PUBLIC(doodad.READ_ONLY(doodad.INSTANCE(doodad.JS_METHOD( __Internal__.$extend ))))),
					
					getInterface: root.DD_DOC(
						//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
								author: "Claude Petit",
								revision: 2,
								params: {
									type: {
										type: 'Class',
										optional: false,
										description: "Isolated interface class.",
									},
								},
								returns: 'Interface',
								description: "Returns the instance of the specified isolated interface.",
						}
						//! END_REPLACE()
						, doodad.PUBLIC(doodad.TYPE(doodad.INSTANCE(
						function getInterface(type) {
							var cls = types.getType(this);
							if (!cls) {
								return null;
							};
							if (!types.isInterface(type) && !types.isMixIn(type)) {
								return null;
							};

							var cache = this[__Internal__.symbolIsolatedCache];
							if (!cache) {
								cache = _shared.setAttribute(this, __Internal__.symbolIsolatedCache, new types.Map());
							}
							if (cache.has(type)) {
								return cache.get(type);
							};

							var _isolated = this[__Internal__.symbolIsolated];
							if (!_isolated.has(type)) {
								return null;
							};

							var data = _isolated.get(type);

							var _interface = data[6];
							if (!_interface) {
								var protoName = data[0];
								var extendedAttributes = data[1];
								var attributes = data[2];
								var typeStorage = data[4];
								var instanceStorage = data[5];
								var base = data[7];
								var baseIsType = types.isType(base);
								var _isolated = data[8];
								var _implements = data[9];
								var proto = data[10];
								var modifiers = data[11];

								var _interface = __Internal__.createType(base, baseIsType, proto, protoName, typeStorage, instanceStorage, attributes, extendedAttributes, _isolated, _implements, modifiers);

								_interface = types.INIT(_interface, [cls]);

								if (!types.baseof(doodad.Interface, _interface)) {
									return null;
								};

								data[6] = _interface;
							};

							var obj = new _interface(this);

							var _implements = _shared.getAttribute(_interface, __Internal__.symbolImplements);
							_implements.forEach(function(impl) {
								if (types.isIsolated(impl) && !cache.has(impl)) {
									cache.set(impl, obj);
								};
							});

							return obj;
						})))),
					
					getPreserved: root.DD_DOC(
						//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
								author: "Claude Petit",
								revision: 1,
								params: {
									attr: {
										type: 'string',
										optional: false,
										description: "Attribute name.",
									},
								},
								returns: 'any',
								description: "Returns the preserved value of an attribute.",
						}
						//! END_REPLACE()
						, doodad.PROTECTED(doodad.TYPE(doodad.INSTANCE(doodad.JS_METHOD(
						function getPreserved(attr) {
							if (!types.isSymbol(attr)) {
								var attributes = this[__Internal__.symbolAttributes],
									attribute = attributes[attr],
									extender = attribute[__Internal__.symbolExtender];
								if (extender && extender.isPreserved) {
									var preservedAttr = '__' + attr + '_preserved__';
									return this[preservedAttr];
								};
							};
						}))))),
					
					restorePreserved: root.DD_DOC(
						//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
								author: "Claude Petit",
								revision: 2,
								params: {
									attr: {
										type: 'string',
										optional: false,
										description: "Attribute name.",
									},
								},
								returns: 'bool',
								description: "Reverts an attribute to its preserved value. Returns 'true' if attribute is reverted. Returns 'false' if it failed.",
						}
						//! END_REPLACE()
						, doodad.PROTECTED(doodad.TYPE(doodad.INSTANCE(doodad.JS_METHOD(
						function restorePreserved(attr) {
							if (!types.isSymbol(attr)) {
								var attributes = this[__Internal__.symbolAttributes],
									attribute = attributes[attr],
									extender = attribute[__Internal__.symbolExtender];
								if (extender && extender.isPreserved) {
									var preservedAttr = '__' + attr + '_preserved__';
									_shared.setAttribute(obj, attr, this[preservedAttr]);
									return true;
								};
							};
							return false;
						}))))),

					overrideSuper: root.DD_DOC(
						//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
								author: "Claude Petit",
								revision: 1,
								params: null,
								returns: 'undefined',
								description: "Prevents the need to call '_super'. Use when '_super' is conditionally called.",
						}
						//! END_REPLACE()
						, doodad.PROTECTED(doodad.TYPE(doodad.INSTANCE(doodad.OPTIONS({dontSetSuper: true}, doodad.JS_METHOD(
						function overrideSuper() {
							if (this._super) {
								this._super[__Internal__.symbolCalled] = true;
							};
						})))))),
				
					superAsync: root.DD_DOC(
						//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
								author: "Claude Petit",
								revision: 0,
								params: null,
								returns: 'function',
								description: "Returns a version of 'this._super' to be called asynchronously.",
						}
						//! END_REPLACE()
						, doodad.PROTECTED(doodad.TYPE(doodad.INSTANCE(doodad.OPTIONS({dontSetSuper: true}, doodad.JS_METHOD(
						function superAsync() {
							if (this._super) {
								var obj = this,
									type = types.getType(obj),
									forType = types.isType(obj),
									_super = this._super;

								_super[__Internal__.symbolCalled] = true;
								
								var dispatch = this[__Internal__.symbolCurrentDispatch],
									index = this[__Internal__.symbolCurrentCallerIndex],
									modifiers = dispatch[__Internal__.symbolModifiers];
								
								return function superAsync(/*paramarray*/) {
									if (this._implements(mixIns.Creatable)) {
										var destroyed = _shared.getAttribute(this, __Internal__.symbolDestroyed);
										var attr = dispatch[_shared.NameSymbol];
										if ((destroyed === null) && !forType && (attr !== 'create')) {
											throw new types.Error("Method '~0~' of '~1~' is unavailable because object has not been created.", [attr, types.getTypeName(type) || __Internal__.ANONYMOUS]);
										};
										if ((destroyed === true) && !(modifiers & doodad.MethodModifiers.CanBeDestroyed)) {
											throw new types.Error("Method '~0~' of '~1~' is unavailable because object has been destroyed.", [attr, types.getTypeName(type) || __Internal__.ANONYMOUS]);
										};
									};
									
									var oldSuper = _shared.getAttribute(obj, '_super');
									var oldDispatch = _shared.getAttributes(obj, [__Internal__.symbolCurrentDispatch, __Internal__.symbolCurrentCallerIndex]);
									try {
										_shared.setAttribute(obj, '_super', _super);
										
										var attrs = {};
										attrs[__Internal__.symbolCurrentDispatch] = dispatch;
										attrs[__Internal__.symbolCurrentCallerIndex] = index;
										_shared.setAttributes(obj, attrs);
										
										return _super.apply(obj, arguments);
										
									} finally {
										_shared.setAttribute(obj, '_super', oldSuper);
										_shared.setAttributes(obj, oldDispatch);
									};
								};
							} else {
								return function() {};
							};
						})))))),
				
					_implements: root.DD_DOC(
						//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
									author: "Claude Petit",
									revision: 3,
									params: {
										cls: {
											type: 'arrayof(Class),Class',
											optional: false,
											description: "Classes.",
										},
									},
									returns: 'bool',
									description: "Returns 'true' when object implements one of the specified classes. Returns 'false' otherwise.",
						}
						//! END_REPLACE()
						, doodad.PUBLIC(doodad.TYPE(doodad.INSTANCE(doodad.JS_METHOD(
						function _implements(cls) {
							if (!types.isArray(cls)) {
								cls = [cls];
							};
							var clsLen = cls.length;
							var impls = this[__Internal__.symbolImplements];
							for (var i = 0; i < clsLen; i++) {
								var cl = cls[i];
								cl = types.getType(cl);
								if (!cl) {
									continue;
								};
								if ((cl !== doodad.Class) && !types.baseof(doodad.Class, cl)) {
									continue;
								};
								if (impls.has(cl)) {
									return true;
								};
							};
							return false;
						}))))),
						
					isImplemented: root.DD_DOC(
						//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
									author: "Claude Petit",
									revision: 2,
									params: {
										name: {
											type: 'string,symbol',
											optional: false,
											description: "Method name.",
										},
									},
									returns: 'bool',
									description: "Returns 'true' if method exists and is implemented. Returns 'false' otherwise.",
						}
						//! END_REPLACE()
						, doodad.PUBLIC(doodad.TYPE(doodad.INSTANCE(doodad.JS_METHOD(
						function isImplemented(name) {
							var isType = types.isType(this),
								type = types.getType(this);
							if (!type) {
								return false;
							};
							var attrs = this[__Internal__.symbolAttributes];
							if (!(name in attrs)) {
								return false;
							};
							var attr = attrs[name],
								extender = attr[__Internal__.symbolExtender];
							if (!types.isLike(extender, extenders.Method)) {
								return false;
							};
							if ((isType && !extender.isType) || (!isType && !extender.isInstance)) {
								return false;
							};
							var method = _shared.getAttribute(this, name);
							return !((method[__Internal__.symbolModifiers] || 0) & doodad.MethodModifiers.NotImplemented);
						}))))),

					_superFrom: root.DD_DOC(
						//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
									author: "Claude Petit",
									revision: 1,
									params: {
										cls: {
											type: 'Class',
											optional: false,
											description: "Class.",
										},
									},
									returns: 'any',
									description: "Call '_super' from the specified implemented class.",
						}
						//! END_REPLACE()
						, doodad.PROTECTED_DEBUG(doodad.READ_ONLY(doodad.CAN_BE_DESTROYED(doodad.PERSISTENT(doodad.TYPE(doodad.INSTANCE(doodad.JS_METHOD(
						function _superFrom(cls) {
							var thisType = types.getType(this),
								dispatch = this[__Internal__.symbolCurrentDispatch];
							if (!dispatch) {
								throw new types.TypeError("Invalid call to '_superFrom'.");
							};
							
							if (!types.isType(cls)) {
								throw new types.TypeError("The 'cls' argument must be a type.");
							};
							
							if (!this._implements(cls)) {
								throw new types.TypeError("Type '~0~' is not implemented by '~1~'.", [types.getTypeName(cls) || __Internal__.ANONYMOUS, types.getTypeName(this) || __Internal__.ANONYMOUS]);
							};
							
							if (!types.isType(this)) {
								cls = cls.prototype;
							};
							
							var name = dispatch[_shared.NameSymbol];

							if (!types.isMethod(cls, name)) {
								throw new types.TypeError("Method '~0~' doesn't exist or is not implemented in type '~1~'.", [name, types.getTypeName(cls) || __Internal__.ANONYMOUS]);
							};

							this.overrideSuper();
							
							return cls[name].bind(this);
						})))))))),
				};
				
				//! BEGIN_REMOVE()
				if (nodejs) {
				//! END_REMOVE()
					//! IF_SET("serverSide")
						var customSymbol = nodejs.getCustomInspectSymbol();
						if (customSymbol) {
							__Internal__.classProto[customSymbol] = doodad.PUBLIC(doodad.TYPE(doodad.INSTANCE(doodad.BIND(doodad.JS_METHOD(function inspect(depth, ctx) {
								var isType = types.isType(this),
									attrs = this[__Internal__.symbolAttributes],
									keys = types.append(types.keys(attrs), types.symbols(attrs)),
									result = {};
								for (var i = 0; i < keys.length; i++) {
									var key = keys[i];
									if (key !== customSymbol) {
										var attr = attrs[key];
										var extender = attr[__Internal__.symbolExtender];
										if (extender) {
											if ((attr[__Internal__.symbolScope] === doodad.Scopes.Public) && ((isType && extender.isType) || (!isType && extender.isInstance))) {
												result[key] = _shared.getAttribute(this, key);
											};
										};
									};
								};
								return result;
							})))));
						};
					//!END_IF()
				//! BEGIN_REMOVE()
				};
				//! END_REMOVE()
				
				__Internal__.creatingClass = true;
				root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 1,
							params: null,
							returns: 'Class',
							description: "Main class of every Doodad classes.",
					}
					//! END_REPLACE()
					, doodad.REGISTER(doodad.BASE(__Internal__.$extend.call(doodad.TypeNamespace, __Internal__.classProto))));
				
				//==================================
				// Interface
				//==================================

				__Internal__.interfaceProto = {
						$TYPE_NAME: "Interface",
						
						_new: types.SUPER(function _new(host) {
							if (types.isType(this)) {
								this._super.apply(this, arguments);

							} else {
								this._super();

								root.DD_ASSERT && root.DD_ASSERT((types.isClass(this) && types.isClass(host)) || (types.isObject(this) && types._instanceof(host, doodad.Class)), "Invalid host.");
								
								_shared.setAttribute(this, __Internal__.symbolHost, host);
							};
						}),
					};
				
				// <FUTURE> Use syntax for variable key in object declaration
				__Internal__.interfaceProto[__Internal__.symbolHost] = doodad.PROTECTED(doodad.READ_ONLY(doodad.TYPE(doodad.INSTANCE(null))));
				
				root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 1,
							params: {
								host: {
									type: 'Object',
									optional: false,
									description: "Object host of the new isolated interface instance.",
								},
							},
							returns: 'Interface',
							description: "Isolated interface instance.",
					}
					//! END_REPLACE()
					, doodad.REGISTER(doodad.BASE(doodad.Class.$extend(__Internal__.interfaceProto))));
				
				//==================================
				// Interfaces
				//==================================
				
				root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: null,
							returns: 'Class',
							description: "Interface that represents a clonable object.",
					}
					//! END_REPLACE()
					, interfaces.REGISTER(doodad.INTERFACE(doodad.Class.$extend({
						$TYPE_NAME: 'Clonable',

						clone: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 0,
									params: null,
									returns: 'Object',
									description: "Returns a clone of the object.",
							}
							//! END_REPLACE()
							, doodad.PUBLIC(doodad.RETURNS(function clone(val) {return (val !== this) && types.is(val, this);}))),  // function()
					}))));
				
				root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: null,
							returns: 'Class',
							description: "Interface that represents a serializable object.",
					}
					//! END_REPLACE()
					, interfaces.REGISTER(doodad.INTERFACE(doodad.Class.$extend({
						$TYPE_NAME: 'Serializable',
					
						serialize: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 0,
									params: null,
									returns: 'object',
									description: "Serializes the object and returns the result.",
							}
							//! END_REPLACE()
							, doodad.PUBLIC(doodad.RETURNS(types.isJsObject))), // function()
								
						$unserialize: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 0,
									params: {
										data: {
											type: 'object',
											optional: false,
											description: "Serialized object.",
										},
									},
									returns: 'Object',
									description: "Deserializes an object.",
							}
							//! END_REPLACE()
							, doodad.PUBLIC(doodad.RETURNS(function(val) {return types._instanceof(val, this); /* Polymorphism allowed */}))), // function(data)
					}))));

				//==================================
				// Mix-ins
				//==================================
				
				root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: null,
							returns: 'Class',
							description: "Mix-in that implements events in a class.",
					}
					//! END_REPLACE()
					, mixIns.REGISTER(doodad.MIX_IN(doodad.Class.$extend({
						$TYPE_NAME: "Events",
					
						__EVENTS: doodad.PROTECTED(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PRE_EXTEND(doodad.PERSISTENT(doodad.TYPE(doodad.INSTANCE(doodad.ATTRIBUTE([], extenders.UniqueArray)))))))),
						
						onEventCancelled: doodad.EVENT(false), // function onEventCancelled(ev)
							
						detachEvents: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 1,
									params: {
										obj: {
											type: 'object',
											optional: true,
											description: "Object linked with the callback function.",
										},
										fn: {
											type: 'function',
											optional: true,
											description: "Callback function.",
										},
										datas: {
											type: 'array',
											optional: true,
											description: "Data attached with the event.",
										},
									},
									returns: 'undefined',
									description: "Detaches the callback function from every events.",
							}
							//! END_REPLACE()
							, doodad.PUBLIC(doodad.TYPE(doodad.INSTANCE(doodad.METHOD(function detachEvents(obj, fn, /*optional*/datas) {
								var events = this.__EVENTS,
									eventsLen = events.length;
								for (var i = 0; i < eventsLen; i++) {
									this[events[i]].detach(obj, fn, datas);
								};
							}))))),
						
						clearEvents: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 2,
									params: {
										objs: {
											type: 'object,arrayof(object)',
											optional: true,
											description: "List of objects to detach from every events.",
										},
									},
									returns: 'undefined',
									description: "Detaches every callback functions from every events.",
							}
							//! END_REPLACE()
							, doodad.PUBLIC(doodad.TYPE(doodad.INSTANCE(doodad.METHOD(function clearEvents(/*optional*/objs) {
								var events = this.__EVENTS,
									eventsLen = events.length;
								if (types.isNothing(objs)) {
									for (var i = 0; i < eventsLen; i++) {
										this[events[i]].clear();
									};
								} else if (types.isArray(objs)) {
									var objsLen = objs.length;
									if (objsLen) {
										for (var i = 0; i < eventsLen; i++) {
											for (var j = 0; j < objsLen; j++) {
												this[events[i]].detach(objs[j]);
											};
										};
									};
								} else {
									this[events[i]].detach(objs);
								};
							}))))),
					}))));
				

				__Internal__.creatablePrototype = {
						$TYPE_NAME: 'Creatable',

						isDestroyed: doodad.PUBLIC(doodad.TYPE(doodad.INSTANCE(doodad.CAN_BE_DESTROYED(doodad.CALL_FIRST(function() {
							return this[__Internal__.symbolDestroyed];
						}))))),

						
						$create: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 0,
									params: {
										paramarray: {
											type: 'any',
											optional: true,
											description: "Arguments.",
										},
									},
									returns: 'undefined',
									description: "Creates the class.",
							}
							//! END_REPLACE()
							, doodad.PUBLIC(function $create(/*paramarray*/) {
								if (this[__Internal__.symbolDestroyed] !== null) {
									throw new types.Error("Object already created.");
								};
								_shared.setAttribute(this, __Internal__.symbolDestroyed, false);
							})),
						
						$destroy: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 1,
									params: null,
									returns: 'undefined',
									description: "Destroys the class.",
							}
							//! END_REPLACE()
							, doodad.PUBLIC(doodad.EXTERNAL(doodad.CALL_FIRST(
							function $destroy() {
								if (this[__Internal__.symbolDestroyed] === false) {
									this._super();

									this._delete();
							
									_shared.setAttribute(this, __Internal__.symbolDestroyed, true);
								};
							})))),

						
						$createInstance: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 0,
									params: {
										paramarray: {
											type: 'any',
											optional: true,
											description: "Arguments to the constructor.",
										},
									},
									returns: 'Object',
									description: "Creates a new instance of the class.",
							}
							//! END_REPLACE()
							, doodad.PUBLIC(doodad.CALL_FIRST(
							function $createInstance(/*paramarray*/) {
								return types.newInstance(this, arguments);
							}))),


						create: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 0,
									params: {
										paramarray: {
											type: 'any',
											optional: true,
											description: "Arguments.",
										},
									},
									returns: 'undefined',
									description: "Creates the class object instance.",
							}
							//! END_REPLACE()
							, doodad.PUBLIC(function create(/*paramarray*/) {
								if (this[__Internal__.symbolDestroyed] !== null) {
									throw new types.Error("Object already created.");
								};
								_shared.setAttribute(this, __Internal__.symbolDestroyed, false);
							})),
						
						fastDestroy: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 1,
									params: null,
									returns: 'undefined',
									description: "Rapidly destroys the class object instance.",
							}
							//! END_REPLACE()
							, doodad.PUBLIC(doodad.EXTERNAL(doodad.CALL_FIRST(
							function fastDestroy() {
								if (this[__Internal__.symbolDestroyed] === false) {
									this._super();
							
									_shared.setAttribute(this, __Internal__.symbolDestroyed, true);
								};
							})))),
						
						destroy: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 1,
									params: null,
									returns: 'undefined',
									description: "Fully destroys the class object instance.",
							}
							//! END_REPLACE()
							, doodad.PUBLIC(doodad.EXTERNAL(doodad.CALL_FIRST(
							function destroy() {
								if (this[__Internal__.symbolDestroyed] === false) {
									this._super();

									this._delete();
							
									_shared.setAttribute(this, __Internal__.symbolDestroyed, true);
								};
							})))),

					};

				// <FUTURE> Use syntax for variable key in object declaration
				__Internal__.creatablePrototype[__Internal__.symbolDestroyed] = doodad.PROTECTED(doodad.READ_ONLY(doodad.PERSISTENT(doodad.TYPE(doodad.INSTANCE(null)))));

				root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: null,
							returns: 'Class',
							description: "Implements a creatable object.",
					}
					//! END_REPLACE()
					, mixIns.REGISTER(doodad.MIX_IN(doodad.Class.$extend(__Internal__.creatablePrototype))));
				


				root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: null,
							returns: 'Class',
							description: "Implements a translatable (localized) object.",
					}
					//! END_REPLACE()
					, mixIns.REGISTER(doodad.MIX_IN(doodad.Class.$extend({
						$TYPE_NAME: 'Translatable',
					
						$__translations: doodad.PROTECTED(doodad.ATTRIBUTE(types.nullObject(), extenders.ExtendObject, {maxDepth: 5, cloneOnInit: true})),
					
						$getTranslation: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 0,
									params: {
										name: {
											type: 'string',
											optional: true,
											description: "Name of the localized string. Default will returns an object with all localized strings.",
										},
									},
									returns: 'string,object',
									description: "Returns a localized string.",
							}
							//! END_REPLACE()
							, doodad.PUBLIC(
							function $getTranslation(/*optional*/name) {
								if (types.isNothing(name)) {
									return this.$__translations;
								};
								
								root.DD_ASSERT && root.DD_ASSERT(types.isStringAndNotEmpty(name), "Invalid translation name.");
								
								var translations = this.$__translations,
									names = name.split('.'),
									n = names[i],
									namesLen = names.length;
									
								for (var i = 0; translations && (i < namesLen); i++) {
									n = names[i];
									root.DD_ASSERT && root.DD_ASSERT(types.isJsObject(translations) && (n in translations), "Translation '~0~' for '~1~' doesn't exist.", [name, types.getTypeName(this) || __Internal__.ANONYMOUS]);
									translations = translations[n];
								};
								
								return translations;
							})),
							
						$setTranslation: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 0,
									params: {
										value: {
											type: 'string,object',
											optional: false,
											description: "Value of the localized string.",
										},
										name: {
											type: 'string',
											optional: true,
											description: "Name of the localized string. Default will set all localized strings by the object value.",
										},
									},
									returns: 'undefined',
									description: "Sets a localized string.",
							}
							//! END_REPLACE()
							, doodad.PUBLIC(
							function $setTranslation(value, /*optional*/name) {
								if (types.isNothing(name)) {
									root.DD_ASSERT && root.DD_ASSERT(types.isJsObject(value), "Invalid translation value.");
									types.depthExtend(this[__Internal__.symbolAttributes].$__translations[__Internal__.symbolExtender].maxDepth, this.$__translations, value);
									
								} else if (types.isStringAndNotEmpty(name)) {
									var translations = this.$__translations,
										names = name.split('.'),
										namesLen = names.length,
										n;
										
									for (var i = 0; translations && (i < namesLen - 1); i++) {
										n = names[i];
										root.DD_ASSERT && root.DD_ASSERT(types.isJsObject(translations) && (n in translations), "Translation '~0~' for '~1~' doesn't exist.", [name, types.getTypeName(this) || __Internal__.ANONYMOUS]);
										translations = translations[n];
									};
									
									if (types.isJsObject(translations)) {
										translations[names[namesLen - 1]] = value;
									};
									
								} else {
									root.DD_ASSERT && root.DD_ASSERT(false, "Invalid translation name.")
									
								};
							})),
					}))));

				root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: null,
							returns: 'Class',
							description: "Implements a configurable object.",
					}
					//! END_REPLACE()
					, mixIns.REGISTER(doodad.MIX_IN(doodad.Class.$extend({
						$TYPE_NAME: 'Configurable',
					
						$__config: doodad.PROTECTED(doodad.ATTRIBUTE(types.nullObject(), extenders.ExtendObject, {maxDepth: 5, cloneOnInit: true})),
					
						$getConfig: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 0,
									params: {
										name: {
											type: 'string',
											optional: true,
											description: "Name of the configuration value. Default will returns an object with all configuration values.",
										},
									},
									returns: 'string,object',
									description: "Returns a configuration value.",
							}
							//! END_REPLACE()
							, doodad.PUBLIC(
							function $getConfig(/*optional*/name) {
								if (types.isNothing(name)) {
									return this.$__config;
								};
								
								root.DD_ASSERT && root.DD_ASSERT(types.isStringAndNotEmpty(name), "Invalid configuration name.");
								
								var config = this.$__config,
									names = name.split('.'),
									namesLen = names.length,
									n;
									
								for (var i = 0; config && (i < namesLen); i++) {
									n = names[i];
									root.DD_ASSERT && root.DD_ASSERT(types.isJsObject(config) && (n in config), "Configuration '~0~' for '~1~' doesn't exist.", [name, types.getTypeName(this) || __Internal__.ANONYMOUS]);
									config = config[n];
								};
								
								return config;
							})),
							
						$setConfig: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 0,
									params: {
										value: {
											type: 'string,object',
											optional: false,
											description: "Value of the configuration.",
										},
										name: {
											type: 'string',
											optional: true,
											description: "Name of the configuration value. Default will set all configuration values by the object value.",
										},
									},
									returns: 'undefined',
									description: "Sets a configuration value.",
							}
							//! END_REPLACE()
							, doodad.PUBLIC(function $setConfig(value, /*optional*/name) {
								if (types.isNothing(name)) {
									root.DD_ASSERT && root.DD_ASSERT(types.isJsObject(value), "Invalid configuration value.");
									types.depthExtend(this[__Internal__.symbolAttributes].$__config[__Internal__.symbolExtender].maxDepth, this.$__config, value);
									
								} else if (types.isStringAndNotEmpty(name)) {
									var config = this.$__config,
										names = name.split('.'),
										namesLen = names.length,
										n;
									
									for (var i = 0; config && (i < namesLen - 1); i++) {
										n = names[i];
										root.DD_ASSERT && root.DD_ASSERT(types.isJsObject(config) && (n in config), "Configuration '~0~' for '~1~' doesn't exist.", [name, types.getTypeName(this) || __Internal__.ANONYMOUS]);
										config = config[n];
									};
									
									if (types.isJsObject(config)) {
										config[names[namesLen - 1]] = value;
									};
									
								} else {
									root.DD_ASSERT && root.DD_ASSERT(false, "Invalid configuration name.")
									
								};
							})),
					}))));

				
				//==================================
				// Object class
				//==================================
				
				root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: null,
							returns: 'Object',
							description: "Main class of every Doodad objects.",
					}
					//! END_REPLACE()
					, doodad.REGISTER(doodad.EXPANDABLE(doodad.Class.$extend(
							mixIns.Creatable,
					{
						$TYPE_NAME: "Object",
					}))));
				
				//==================================
				// Events classes
				//==================================
				
				doodad.Event = types.INIT(root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 2,
							params: {
								data: {
									type: 'any',
									optional: true,
									description: "Custom event data.",
								},
							},
							returns: 'Event',
							description: "Event object.",
					}
					//! END_REPLACE()
					, doodad.TypeNamespace.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: "Event",
					},
					/*instanceProto*/
					{
						data: types.READ_ONLY(null),
						
						// dynamic
						obj: null,
						name: null,
						handlerData: null,

						prevent: false,
						
						_new: types.SUPER(function(/*optional*/data) {
							//root.DD_ASSERT && root.DD_ASSERT(types.isNothing(data) || types.isObject(data), "Invalid data.");

							this._super();
							
							if (!types.isType(this)) {
								_shared.setAttribute(this, 'data', data || {}, {all: true});
							};
						}),
						
						preventDefault: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 0,
									params: null,
									returns: 'undefined',
									description: "Prevents default behavior.",
							}
							//! END_REPLACE()
							, function() {
								this.prevent = true;
							}),
					})));

				doodad.CancelEvent = types.INIT(root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 1,
							params: {
								data: {
									type: 'any',
									optional: true,
									description: "Custom event data.",
								},
							},
							returns: 'CancelEvent',
							description: "Canceled event object.",
					}
					//! END_REPLACE()
					, doodad.Event.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'CancelEvent',
					})));

				doodad.ErrorEvent = types.INIT(root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 1,
							params: {
								error: {
									type: 'error',
									optional: true,
									description: "Error object.",
								},
								data: {
									type: 'any',
									optional: true,
									description: "Custom event data.",
								},
							},
							returns: 'ErrorEvent',
							description: "Canceled event object.",
					}
					//! END_REPLACE()
					, doodad.Event.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'ErrorEvent',
					},
					/*instanceProto*/
					{
						error: types.READ_ONLY(null),
						
						_new: types.SUPER(function _new(/*optional*/error, /*optional*/data) {
							this._super(data);

							if (!types.isType(this)) {
								root.DD_ASSERT && root.DD_ASSERT(types.isNothing(error) || types.isError(error), "Invalid error.");
								
								_shared.setAttribute(this, 'error', error, {all: true});
							};
						}),
					})));

				//==================================
				// Callbacks objects
				//==================================

				doodad.Callback = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 6,
							params: {
								obj: {
									type: 'object,Object',
									optional: true,
									description: "Object to bind with the callback function.",
								},
								fn: {
									type: 'function,string,symbol',
									optional: false,
									description: "Callback function.",
								},
								bubbleError: {
									type: 'bool,function',
									optional: true,
									description: "If 'true', error will bubble. If a function, error will be pass to it as argument. Otherwise, error will be managed.",
								},
								args: {
									type: 'arrayof(any)',
									optional: true,
									description: "Callback arguments.",
								},
								secret: {
									type: 'any',
									optional: true,
									description: "Secret.",
								},
							},
							returns: 'function',
							description: "Creates a callback handler.",
					}
					//! END_REPLACE()
					, types.setPrototypeOf(function(/*optional*/obj, fn, /*optional*/bubbleError, /*optional*/args, /*optional*/secret) {
						// IMPORTANT: No error should popup from a callback, excepted "ScriptAbortedError".
						var attr;
						if (types.isString(fn) || types.isSymbol(fn)) {
							attr = fn;
							fn = obj[attr];
						};
						if (!obj && types.isCallback(fn)) {
							return fn;
						};
						fn = types.unbind(fn);
						root.DD_ASSERT && root.DD_ASSERT((obj && types.isBindable(fn)) || (!obj && types.isFunction(fn)), "Invalid function.");
						var insideFn = _shared.makeInside(obj, fn, secret);
						var isCreatable = types._implements(obj, mixIns.Creatable);
						var callback = function callbackHandler(/*paramarray*/) {
							callback.lastError = null;
							try {
								if (!obj || !isCreatable || !obj.isDestroyed()) {
									if (args) {
										return insideFn.apply(obj, types.append([], args, arguments));
									} else {
										return insideFn.apply(obj, arguments);
									};
								};
							} catch(ex) {
								if (bubbleError || ex.bubble) {
									callback.lastError = ex;
									if (types.isFunction(bubbleError)) {
										return bubbleError(ex); // call error handler
									} else {
										throw ex; // bubble the error
									};
								} else {
									try {
										callback.lastError = doodad.trapException(ex, obj, attr);
									} catch(o) {
										debugger;
									};
								};
							};
						};
						callback = types.setPrototypeOf(callback, doodad.Callback);
						callback[_shared.BoundObjectSymbol] = obj;
						callback[_shared.OriginalValueSymbol] = fn;
						callback.lastError = null;
						return callback;
					}, types.Callback));
				
				doodad.AsyncCallback = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 6,
							params: {
								obj: {
									type: 'object,Object',
									optional: true,
									description: "Object to bind with the callback function.",
								},
								fn: {
									type: 'function,string,symbol',
									optional: false,
									description: "Callback function.",
								},
								bubbleError: {
									type: 'bool,function',
									optional: true,
									description: "If 'true', error will bubble. If a function, error will be pass to it as argument. Otherwise, error will be managed.",
								},
								args: {
									type: 'arrayof(any)',
									optional: true,
									description: "Callback arguments.",
								},
								secret: {
									type: 'any',
									optional: true,
									description: "Secret.",
								},
							},
							returns: 'function',
							description: "Creates an asynchronous callback handler.",
					}
					//! END_REPLACE()
					, types.setPrototypeOf(function(/*optional*/obj, fn, /*optional*/bubbleError, /*optional*/args, /*optional*/secret) {
						// IMPORTANT: No error should popup from a callback, excepted "ScriptAbortedError".
						var Promise = types.getPromise();
						var attr;
						if (types.isString(fn) || types.isSymbol(fn)) {
							attr = fn;
							fn = obj[attr];
						};
						if (!obj && types.isCallback(fn)) {
							return fn;
						};
						fn = types.unbind(fn);
						root.DD_ASSERT && root.DD_ASSERT((obj && types.isBindable(fn)) || (!obj && types.isFunction(fn)), "Invalid function.");
						var type = types.getType(obj),
							isClass = types.isClass(type),
							secret = (isClass && (type === __Internal__.invokedClass) ? _shared.SECRET : secret),
							isCreatable = isClass && types._implements(obj, mixIns.Creatable);
						var callback = function callbackHandler(/*paramarray*/) {
							var args = types.toArray(arguments);
							return Promise.create(function(resolve, reject) {
								tools.callAsync(function async(/*paramarray*/) {
									callback.lastError = null;
									try {
										if (isClass) {
											if (!isCreatable || !obj.isDestroyed()) {
												if (args) {
													resolve(_shared.invoke(obj, fn, types.append([], args, arguments), secret));
												} else {
													resolve(_shared.invoke(obj, fn, arguments, secret));
												};
											};
										} else {
											if (args) {
												resolve(fn.apply(obj, types.append([], args, arguments)));
											} else {
												resolve(fn.apply(obj, arguments));
											};
										};
									} catch(ex) {
										if (bubbleError || ex.bubble) {
											callback.lastError = ex;
											if (types.isFunction(bubbleError)) {
												try {
													resolve(bubbleError(ex)); // call error handler
												} catch(o) {
													reject(o); // error handler failed
												};
											} else {
												reject(ex); // must reject
												if (ex.critical) {
													throw ex; // bubble error, the application should halt because there is no other try...catch outside
												};
											};
										} else {
											try {
												callback.lastError = doodad.trapException(ex, obj, attr);
												reject(callback.lastError);
											} catch(o) {
												debugger;
												reject(ex);
											};
										};
									};
								}, 0, null, args);
							});
						};
						callback = types.setPrototypeOf(callback, doodad.AsyncCallback);
						callback[_shared.BoundObjectSymbol] = obj;
						callback[_shared.OriginalValueSymbol] = fn;
						callback.lastError = null;
						return callback;
					}, types.Callback));
				
				//==================================
				// Serializable objects
				//==================================

				root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 3,
							params: {
								value: {
									type: 'any',
									optional: false,
									description: "Serializable value.",
								},
								type: {
									type: 'string',
									optional: true,
									description: "Type of the value. Default is taken from a call to 'types._typeof'.",
								},
							},
							returns: 'Object',
							description: "Packed value.",
					}
					//! END_REPLACE()
					, doodad.REGISTER(doodad.Object.$extend(
									interfaces.Serializable,
					{
						$TYPE_NAME: "PackedValue",
						
						$ERROR_ATTRIBUTES: doodad.PROTECTED(doodad.TYPE(doodad.ATTRIBUTE([
							'name',
							'message',
						], extenders.UniqueArray))),
						
						__value: doodad.PROTECTED(doodad.READ_ONLY(null)),
						
						create: doodad.OVERRIDE(function create(value) {
							if (root.DD_ASSERT) {
								root.DD_ASSERT(types.isSerializable(value), "Invalid value");
								if (types._implements(value, interfaces.Serializable)) {
									var type = types.getType(value);
									root.DD_ASSERT(namespaces.get(type.DD_FULL_NAME) === type, "Value is not of a registered type.");
								};
							};
							_shared.setAttribute(this, '__value', value);
						}),
						
						$pack: doodad.PUBLIC(doodad.TYPE(doodad.JS_METHOD(function pack(value) {
							var data;
							if (types.isNothing(value)) {
								data = undefined;
							} else if (types.isInfinite(value)) {
								if (value < 0) {
									value = -1;
								} else {
									value = 1;
								};
								data = {
									type: 'infinity',
									value: value,
								};
							} else if (types.isNumber(value)) {
								data = value;
							} else if (types.isBoolean(value)) {
								data = value;
							} else if (types.isString(value)) {
								data = value;
							} else if (types.isDate(value)) {
								value = value.valueOf();
								data = {
									type: 'date',
									value: value,
								};
							} else if (types.isNaN(value)) {
								data = {
									type: 'nan',
									value: undefined,
								};
							} else if (types.isError(value)) {
								types.Error.prototype.parse.call(value);
								var type = value.constructor;
								var tmp = {
									type: (type && type.DD_FULL_NAME ? '{' + type.DD_FULL_NAME + '}' : ''),
								};
								var self = this;
								tools.forEach(self.$ERROR_ATTRIBUTES, function(key) {
									if (types.hasKeyInherited(value, key)) {
										tmp[key] = self.$pack(value[key]);
									};
								});
								data = {
									type: 'error',
									value: tmp,
								};
							} else if (types.isArray(value)) {
								value = tools.map(value, this.$pack, this);
								data = value;
							} else if (types._implements(value, interfaces.Serializable)) {
								data = {
									type: '{' + types.getType(value).DD_FULL_NAME + '}',
									value: this.$pack(value.serialize()),
								};
							} else if (types.isJsObject(value)) {
								value = tools.map(value, this.$pack, this);
								data = {
									type: 'object',
									value: value,
								};
							} else {
								throw new types.TypeError("Value can't be packed.");
							};
							return data;
						}))),
						
						$unpack: doodad.PUBLIC(doodad.TYPE(doodad.JS_METHOD(function pack(data) {
							if (types.isJsObject(data)) {
								var type = data.type,
									value = data.value;
								if (type === 'undefined') {
									value = undefined;
								} else if (type === 'infinity') {
									value = types.toInteger(value) || 0;
									if (value < 0) {
										value = -Infinity;
									} else {
										value = Infinity;
									};
								} else if (type === 'date') {
									if (!types.isNothing(value)) {
										value = new Date(types.toInteger(value));
									};
								} else if (type === 'nan') {
									value = NaN;
								} else if (type === 'error') {
									var cls;
									if (value.type) {
										var clsName = value.type.slice(1, -1);
										cls = namespaces.get(clsName);
										if (!types.isErrorType(cls)) {
											throw new types.TypeError("Error of type '~0~' can't be deserialized.", [clsName]);
										};
									} else {
										cls = _shared.Natives.windowError;
									};
									var tmp = new cls(),
										self = this;
									tools.forEach(self.$ERROR_ATTRIBUTES, function(key) {
										if (types.has(value, key)) {
											tmp[key] = self.$unpack(value[key]);
										};
									});
									value = tmp;
								} else if (type === 'object') {
									value = tools.map(value, this.$unpack, this);
								} else if (type[0] === '{') {
									var clsName = type.slice(1, -1),
										cls = namespaces.get(clsName);
									if (!types._implements(cls, interfaces.Serializable)) {
										throw new types.TypeError("Object of type '~0~' can't be deserialized.", [clsName]);
									};
									value = this.$unpack(value);
									value = cls.$unserialize(value);
								} else {
									throw new types.TypeError("Invalid packet.");
								};
							} else if (types.isArray(data)) {
								value = tools.map(data, this.$unpack, this);
							} else {
								value = data;
							};
							return value;
						}))),
						
						serialize: doodad.OVERRIDE(function serialize() {
							return types.getType(this).$pack(this.__value);
						}),
						
						$unserialize: doodad.OVERRIDE(function $unserialize(data) {
							return new this(this.$unpack(data));
						}),
						
						valueOf: function valueOf() {
							return this.__value;
						},
					})));
			},
		};
		return DD_MODULES;
	},
};
//! END_MODULE()