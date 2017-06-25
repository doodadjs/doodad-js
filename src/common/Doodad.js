//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2017 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Doodad.js - Main file
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
				const doodad = root.Doodad,
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
				const __Internal__ = {
					invokedClass: null,	// <FUTURE> thread level
					inTrapException: false, // <FUTURE> thread level
					inEventHandler: false, // <FUTURE> thread level
					
					// Class
					symbolAttributes: types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_ATTRIBUTES')), true) */ '__DD_ATTRIBUTES' /*! END_REPLACE() */, true),
					symbolImplements: types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_IMPLEMENTS')), true) */ '__DD_IMPLEMENTS' /*! END_REPLACE() */, true),
					symbolMustOverride: types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_MUST_OVERRIDE')), true) */ '__DD_MUST_OVERRIDE' /*! END_REPLACE() */, true),
					symbolBase: types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_BASE')), true) */ '__DD_BASE' /*! END_REPLACE() */, true),
					symbolIsolated: types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_ISOLATED')), true) */ '__DD_ISOLATED' /*! END_REPLACE() */, true),
					symbolIsolatedCache: types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_ISOLATED_CACHE')), true) */ '__DD_ISOLATED_CACHE' /*! END_REPLACE() */, true),
					symbolAttributesStorage: types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_ATTRIBUTES_STORAGE')), true) */ '__DD_ATTRIBUTES_STORAGE' /*! END_REPLACE() */, true),
					symbolCurrentDispatch: types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_CURRENT_DISPATCH')), true) */ '__DD_CURRENT_DISPATCH' /*! END_REPLACE() */, true),
					symbolCurrentCallerIndex: types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_CURRENT_CALLER_INDEX')), true) */ '__DD_CURRENT_CALLER_INDEX' /*! END_REPLACE() */, true),
					
					// Class, Methods, Callers, AttributeBox
					symbolPrototype: types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_PROTOTYPE')), true) */ '__DD_PROTOTYPE' /*! END_REPLACE() */, true),
					symbolModifiers: types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_MODIFIERS')), true) */ '__DD_MODIFIERS' /*! END_REPLACE() */, true),

					// Methods, Callers, AttributeBox
					symbolCallers: types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_CALLERS')), true) */ '__DD_CALLERS' /*! END_REPLACE() */, true),

					// Interface
					symbolHost: types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_HOST')), true) */ '__DD_HOST' /*! END_REPLACE() */, true),
					
					// EventHandler, AttributeBox
					symbolExtender: types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_EXTENDER')), true) */ '__DD_EXTENDER' /*! END_REPLACE() */, true),

					// EventHandler
					symbolObject: types.getSymbol('__OBJECT__'),
					symbolStack: types.getSymbol('__STACK__'),
					symbolSorted: types.getSymbol('__SORTED__'),
					symbolClonedStack: types.getSymbol('__CLONED_STACK__'),

					// Methods (Dispatches)
					symbolObsoleteWarned: types.getSymbol('__OBSOLETE_WARNED__'),

					// Callers
					symbolOk: types.getSymbol('__OK__'),
					symbolFunction: types.getSymbol('__FUNCTION__'),

					// Callers & AttributeBox
					symbolCalled: types.getSymbol('__CALLED__'),
					symbolPosition: types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_POSITION')), true) */ '__DD_POSITION' /*! END_REPLACE() */, true),
					symbolUsageMessage: types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_USAGE_MESSAGE')), true) */ '__DD_USAGE_MESSAGE' /*! END_REPLACE() */, true),
					
					// AttributeBox
					symbolScope: types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_SCOPE')), true) */ '__DD_SCOPE' /*! END_REPLACE() */, true),
					symbolReturns: types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_RETURNS')), true) */ '__DD_RETURNS' /*! END_REPLACE() */, true),
					symbolInterface: types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_INTERFACE')), true) */ '__DD_INTERFACE' /*! END_REPLACE() */, true),
					symbolCallFirstLength: types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_CALL_FIRST_LENGTH')), true) */ '__DD_CALL_FIRST_LENGTH' /*! END_REPLACE() */, true),
					symbolRenamedFrom: types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_RENAMED_FROM')), true) */ '__DD_RENAMED_FROM' /*! END_REPLACE() */, true),
					symbolRenamedTo: types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_RENAMED_TO')), true) */ '__DD_RENAMED_TO' /*! END_REPLACE() */, true),
					symbolOverrideWith: types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_OVERRIDE_WITH')), true) */ '__DD_OVERRIDE_WITH' /*! END_REPLACE() */, true),
					symbolReplacedCallers: types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_REPLACED_CALLERS')), true) */ '__DD_REPLACED_CALLERS' /*! END_REPLACE() */, true),
					
					// Creatable
					symbolDestroyed: types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_DESTROYED')), true) */ '__DD_DESTROYED' /*! END_REPLACE() */, true),

					ANONYMOUS: '<anonymous>',

					notReentrantMap: new types.WeakMap(),
				};

				types.complete(_shared.Natives, {
					arraySliceCall: global.Array.prototype.slice.call.bind(global.Array.prototype.slice),
					arraySpliceApply: global.Array.prototype.splice.apply.bind(global.Array.prototype.splice),
					arraySpliceCall: global.Array.prototype.splice.call.bind(global.Array.prototype.splice),
					arrayUnshiftApply: global.Array.prototype.unshift.apply.bind(global.Array.prototype.unshift),
					functionApply: global.Function.prototype.apply,
					functionCall: global.Function.prototype.call,
					functionBind: global.Function.prototype.bind,
					windowObject: global.Object,
				});
				
				// Interface
				doodad.ADD('HostSymbol', __Internal__.symbolHost);

				// Class				
				_shared.CurrentDispatchSymbol = __Internal__.symbolCurrentDispatch;

				// AttributeBox
				_shared.ExtenderSymbol = __Internal__.symbolExtender;

				// EventHandler
				_shared.ObjectSymbol = __Internal__.symbolObject;
				_shared.StackSymbol = __Internal__.symbolStack;
				_shared.ClonedStackSymbol = __Internal__.symbolClonedStack;
				_shared.SortedSymbol = __Internal__.symbolSorted;

				//=====================
				// Options
				//=====================
				
				const __options__ = types.nullObject({
					enforceScopes: false,    // for performance, set it to "false"
					enforcePolicies: false,  // for performance, set it to "false"
					publicOnDebug: false,    // to be able to read core attributes in debug mode, set it to "true"
				}, _options);

				__options__.enforceScopes = types.toBoolean(__options__.enforceScopes);
				__options__.enforcePolicies = types.toBoolean(__options__.enforcePolicies);
				__options__.publicOnDebug = types.toBoolean(__options__.publicOnDebug);

				types.freezeObject(__options__);

				doodad.ADD('getOptions', function getOptions() {
					return __options__;
				});


				//=======================
				// Hooks
				//=======================
				
				_shared.popupExceptionHook = function popupExceptionHook(ex, /*optional*/obj, /*optional*/attr) {
					root.DD_ASSERT && root.DD_ASSERT(types.isError(ex));
					global.alert && global.alert(ex.message);
				};
				
				_shared.catchExceptionHook = function catchExceptionHook(ex, /*optional*/obj, /*optional*/attr) {
					if (ex.stack) {
						tools.log(tools.LogLevels.Error, ex.stack);
					} else {
						types.Error.prototype.parse.call(ex);
						tools.log(tools.LogLevels.Error, "[~0~] in '~1~.~2~' at '~3~:~4~:~5~'.", [
							/*0*/ ex.toString(), 
							/*1*/ types.getTypeName(obj) || '<unknown>',
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

				entries.REGISTER(root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 1,
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
							returns: 'Type',
							description: "Type registry entry.",
					}
					//! END_REPLACE()
					, entries.Entry.$inherit(
						/*typeProto*/
						{
							$TYPE_NAME: 'Type',
							$TYPE_UUID:  '' /*! INJECT('+' + TO_SOURCE(UUID('TypeEntry')), true) */,
						}
					)));

				//============================
				// Extend "Types.js"
				//============================

				types.ADD('isClass', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 1,
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
						if (!types.isFunction(obj)) {
							return false;
						};
						return types.isLike(obj, doodad.Class);
					}));
				
				types.ADD('isInterfaceClass', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 1,
								params: {
									obj: {
										type: 'Type',
										optional: false,
										description: "Type to test for.",
									},
								},
								returns: 'bool',
								description: "Returns 'true' when object is an interface class. Returns 'false' otherwise.",
					}
					//! END_REPLACE()
					, function isInterfaceClass(obj) {
						if (!types.isFunction(obj)) {
							return false;
						};
						return types.isLike(obj, doodad.Interface);
					}));
				
				types.ADD('isBase', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 1,
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
						return types.isClass(obj) && !!((obj[__Internal__.symbolModifiers] || 0) & doodad.ClassModifiers.Base);
					}));
				
				types.ADD('isMixIn', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 1,
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
						return types.isClass(obj) && !!((obj[__Internal__.symbolModifiers] || 0) & doodad.ClassModifiers.MixIn);
					}));

				types.ADD('isInterface', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 1,
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
						return types.isClass(obj) && !!((obj[__Internal__.symbolModifiers] || 0) & doodad.ClassModifiers.Interface);
					}));

				types.ADD('isIsolated', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 1,
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
						return types.isClass(obj) && !!((obj[__Internal__.symbolModifiers] || 0) & doodad.ClassModifiers.Isolated);
					}));

				types.ADD('isNewable', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 1,
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
						return types.isClass(obj) && !((obj[__Internal__.symbolModifiers] || 0) & (doodad.ClassModifiers.Base | doodad.ClassModifiers.Interface | doodad.ClassModifiers.MixIn));
					}));
				
				types.ADD('isSealedClass', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 2,
								params: {
									obj: {
										type: 'Class',
										optional: false,
										description: "Class to test for.",
									},
								},
								returns: 'bool',
								description: "Returns 'true' when class is a sealed class. Returns 'false' otherwise.",
					}
					//! END_REPLACE()
					, function isSealedClass(obj) {
						return types.isClass(obj) && !!((obj[__Internal__.symbolModifiers] || 0) & doodad.ClassModifiers.Sealed);
					}));
				
				types.ADD('isSerializable', root.DD_DOC(
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
					}));
				
				types.ADD('_implements', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 4,
								params: {
									obj: {
										type: 'Object,Class',
										optional: false,
										description: "Object to test for.",
									},
									cls: {
										type: 'arrayof(Class),Class,arrayof(Object),Object',
										optional: false,
										description: "Classes.",
									},
								},
								returns: 'bool',
								description: "Returns 'true' when object implements one of the specified classes. Returns 'false' otherwise.",
					}
					//! END_REPLACE()
					, function _implements(obj, cls) {
						if (!types.isLike(obj, __Internal__.CLASS_OR_INTERFACE)) {
							return false;
						};
						const impls = _shared.getAttribute(obj, __Internal__.symbolImplements);
						if (types.isArray(cls)) {
							const clsLen = cls.length;
							for (let i = 0; i < clsLen; i++) {
								if (types.has(cls, i)) {
									const cl = types.getType(cls[i]);
									if (!cl) {
										continue;
									};
									if (!types.isLike(cl, __Internal__.CLASS_OR_INTERFACE)) {
										continue;
									};
									if (impls.has(cl)) {
										return true;
									};
									const uuid = _shared.getUUID(cl);
									if (uuid && impls.has(uuid)) {
										return true;
									};
								};
							};
							return false;
						} else {
							const cl = types.getType(cls);
							if (!cl) {
								return false;
							};
							if (!types.isLike(cl, __Internal__.CLASS_OR_INTERFACE)) {
								return false;
							};
							if (impls.has(cl)) {
								return true;
							};
							const uuid = _shared.getUUID(cl);
							if (uuid && impls.has(uuid)) {
								return true;
							};
							return false;
						};
					}));

				types.ADD('getImplements', root.DD_DOC(
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
								},
								returns: 'objectof(Class)',
								description: "Returns the implementations of an object.",
					}
					//! END_REPLACE()
					, function getImplements(obj) {
						if (!types.isLike(obj, __Internal__.CLASS_OR_INTERFACE)) {
							return null;
						};
						return types.toArray(_shared.getAttribute(obj, __Internal__.symbolImplements));
					}));
				
				types.ADD('isMethod', root.DD_DOC(
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
								description: "Returns 'true' if method exists. Returns 'false' otherwise. Note: That doesn't validate if method is implemented. Please use 'types.isImplemented' instead if you need that information.",
					}
					//! END_REPLACE()
					, function isMethod(obj, name) {
						if (!types.isLike(obj, __Internal__.CLASS_OR_INTERFACE)) {
							return false;
						};
						const isType = types.isType(obj);
						const attrs = _shared.getAttribute(obj, __Internal__.symbolAttributes);
						if (!(name in attrs)) {
							return false;
						};
						const attr = attrs[name],
							extender = attr[__Internal__.symbolExtender];
						if (!types.isLike(extender, extenders.Method)) {
							return false;
						};
						if ((isType && !extender.isType) || (!isType && !extender.isInstance)) {
							return false;
						};
						return true;
					}));

				types.ADD('isImplemented', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 3,
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
								description: "Returns 'true' if method exists and is implemented. Returns 'false' otherwise. Note: That doesn't validate if the method is entrant. If you need that information, please combine with 'types.isEntrant'.",
					}
					//! END_REPLACE()
					, function isImplemented(obj, name) {
						if (!types.isLike(obj, __Internal__.CLASS_OR_INTERFACE)) {
							return false;
						};
						const attrs = _shared.getAttribute(obj, __Internal__.symbolAttributes);
						if (!(name in attrs)) {
							return false;
						};
						const attr = attrs[name],
							extender = attr[__Internal__.symbolExtender];
						if (!types.isLike(extender, extenders.Method)) {
							return false;
						};
						const isType = types.isType(obj);
						if ((isType && !extender.isType) || (!isType && !extender.isInstance)) {
							return false;
						};
						const method = _shared.getAttribute(obj, name);
						return !((method[__Internal__.symbolModifiers] || 0) & doodad.MethodModifiers.NotImplemented);
					}));
				
				types.ADD('isEntrant', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 0,
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
						description: "Returns 'true' if method is entrant. Returns 'false' otherwise. Note: That doesn't validate if 'name' is a really method and if it has been implemented. If you need that information, please combine with 'types.isImplemented'.",
					}
					//! END_REPLACE()
					, function isEntrant(obj, name) {
						const notReentrantMap = __Internal__.notReentrantMap.get(obj);
						return !notReentrantMap || !notReentrantMap.get(name);
					}));

				__Internal__.makeInside = function makeInside(/*optional*/obj, fn, /*optional*/secret) {
					root.DD_ASSERT && root.DD_ASSERT(!types.isCallback(fn), "Invalid function.");
					fn = types.unbind(fn) || fn;
					root.DD_ASSERT && root.DD_ASSERT(types.isBindable(fn), "Invalid function.");
					let _insider = null;
					const fnApply = fn.apply.bind(fn);
					if (types.isNothing(obj)) {
						_insider = function insider(/*paramarray*/) {
							const type = types.getType(this);
							if (type && (type !== __Internal__.invokedClass) && (secret !== _shared.SECRET)) {
								throw new types.Error("Invalid secret.");
							};
							const oldInvokedClass = __Internal__.invokedClass;
							__Internal__.invokedClass = type;
							try {
								return fnApply(this, arguments);
							} catch(ex) {
								throw ex;
							} finally {
								__Internal__.invokedClass = oldInvokedClass;
							};
						};
					} else {
						const type = types.getType(obj);
						if (type && (type !== __Internal__.invokedClass) && (secret !== _shared.SECRET)) {
							throw new types.Error("Invalid secret.");
						};
						_insider = function insider(/*paramarray*/) {
							const oldInvokedClass = __Internal__.invokedClass;
							__Internal__.invokedClass = type;
							try {
								return fnApply(obj, arguments);
							} catch(ex) {
								throw ex;
							} finally {
								__Internal__.invokedClass = oldInvokedClass;
							};
						};
					};
					_insider[_shared.OriginalValueSymbol] = fn;
					return _insider;
				};
				
				__Internal__.makeInsideForNew = function makeInsideForNew() {
					return (
						"const oldInvokedClass = ctx.internal.invokedClass;" +
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
							revision: 3,
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
					, function makeInside(/*optional*/obj, fn, /*optional*/secret) {
						if (types.isCallback(fn)) {
							throw new types.Error("Invalid function.");
						};
						if (types.isNothing(obj)) {
							return fn;
						} else {
							const type = types.getType(obj);
							if (types.isClass(type) || types.isInterfaceClass(type)) {
								return __Internal__.makeInside(obj, fn, secret);
							} else {
								return __Internal__.oldMakeInside(obj, fn);
							};
						};
					});
				
				__Internal__.oldInvoke = _shared.invoke;
				__Internal__.oldGetAttribute = _shared.getAttribute;
				__Internal__.oldGetAttributes = _shared.getAttributes;
				__Internal__.oldSetAttribute = _shared.setAttribute;
				__Internal__.oldSetAttributes = _shared.setAttributes;
				
				_shared.invoke = root.DD_DOC(
								root.GET_DD_DOC(__Internal__.oldInvoke), 
					function invoke(obj, fn, /*optional*/args, /*optional*/secret, /*optional*/thisObj) {
						if (types.isNothing(thisObj)) {
							thisObj = obj;
						};
						if (types.isCallback(fn)) {
							if (args) {
								return fn.apply(thisObj, args);
							} else {
								return fn.call(thisObj);
							};
						} else {
							if (!types.isNothing(obj) && (secret !== _shared.SECRET)) {
								throw new types.Error("Invalid secret.");
							};
							//const type = types.getType(obj);
							//if (types.isClass(type) || types.isInterfaceClass(type)) {
								const oldInvokedClass = __Internal__.invokedClass;
								__Internal__.invokedClass = types.getType(obj);
								try {
									if (types.isString(fn) || types.isSymbol(fn)) {
										fn = thisObj[fn];
									};
									if (types.isFunction(fn)) {
										if (args) {
											return fn.apply(thisObj, args);
										} else {
											return fn.call(thisObj);
										};
									} else {
										throw new types.TypeError("'fn' is not a function.");
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
								root.GET_DD_DOC(__Internal__.oldGetAttribute), 
					function getAttribute(obj, attr) {
						const type = types.getType(obj);
						if (types.isClass(type) || types.isInterfaceClass(type)) {
							const oldInvokedClass = __Internal__.invokedClass;
							__Internal__.invokedClass = type;
							try {
								const storage = types.get(obj, __Internal__.symbolAttributesStorage);
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
								root.GET_DD_DOC(__Internal__.oldGetAttributes), 
					function getAttributes(obj, attrs) {
						const type = types.getType(obj);
						if (types.isClass(type) || types.isInterfaceClass(type)) {
							const oldInvokedClass = __Internal__.invokedClass;
							__Internal__.invokedClass = type;
							try {
								const storage = obj[__Internal__.symbolAttributesStorage];
								const attrsLen = attrs.length,
									result = {};
								for (let i = 0; i < attrsLen; i++) {
									if (types.has(attrs, i)) {
										const attr = attrs[i];
										if (types.hasIn(storage, attr)) {
											result[attr] = storage[attr];
										} else {
											result[attr] = __Internal__.oldGetAttribute(obj, attr);
										};
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
								root.GET_DD_DOC(__Internal__.oldSetAttribute), 
					function setAttribute(obj, attr, value, /*optional*/options) {
						const type = types.getType(obj);
						if (types.isClass(type) || types.isInterfaceClass(type)) {
							const oldInvokedClass = __Internal__.invokedClass;
							__Internal__.invokedClass = type;
							try {
								const storage = types.get(obj, __Internal__.symbolAttributesStorage);
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
								root.GET_DD_DOC(__Internal__.oldSetAttributes), 
					function setAttributes(obj, values, /*optional*/options) {
						const type = types.getType(obj);
						if (types.isClass(type) || types.isInterfaceClass(type)) {
							const oldInvokedClass = __Internal__.invokedClass;
							__Internal__.invokedClass = type;
							try {
								const storage = obj[__Internal__.symbolAttributesStorage];
								const keys = types.append(types.keys(values), types.symbols(values)),
									keysLen = keys.length;
								for (let i = 0; i < keysLen; i++) {
									const key = keys[i];
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

				__Internal__.oldTypesIsClonable = _shared.isClonable;
				_shared.isClonable = function isClonable(obj, /*optional*/cloneFunctions) {
					return types._implements(obj, mixIns.Clonable) || __Internal__.oldTypesIsClonable.call(this, obj, cloneFunctions);
				};

				__Internal__.oldTypesClone = _shared.clone;
				_shared.clone = function clone(obj, /*optional*/depth, /*optional*/cloneFunctions, /*optional*/keepUnlocked, /*optional*/keepNonClonable) {
					if (types._implements(obj, mixIns.Clonable)) {
						return obj.clone();
					} else {
						return __Internal__.oldTypesClone.call(this, obj, depth, cloneFunctions, keepUnlocked, keepNonClonable);
					};
				};
				
				_shared.getAttributeDescriptor = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 5,
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
						const type = types.getType(obj);
						if (!types.isClass(type) && !types.isInterfaceClass(type)) {
							return undefined;
						};
						const attrs = _shared.getAttribute(obj, __Internal__.symbolAttributes);
						const attr = attrs[name];
						return attr;
					});
					
				__Internal__.oldDESTROY = _shared.DESTROY;
				_shared.DESTROY = function DESTROY(obj) {
					if (types._implements(obj, mixIns.Creatable)) {
						const destroyed = _shared.getAttribute(obj, __Internal__.symbolDestroyed);
						if (destroyed === false) { // NOTE: Can be "null" for "not created".
							if (types.isType(obj)) {
								obj.$destroy();
							} else {
								obj.destroy();
							};
						};
					} else {
						__Internal__.oldDESTROY(obj);
					};
				};

				__Internal__.oldDESTROYED = _shared.DESTROYED;
				_shared.DESTROYED = function DESTROYED(obj) {
					if (types._implements(obj, mixIns.Creatable)) {
						const destroyed = _shared.getAttribute(obj, __Internal__.symbolDestroyed);
						return (types.isType(obj) ? !!destroyed : (destroyed !== false)); // NOTE: Can be "null" for "not created".
					} else {
						return __Internal__.oldDESTROYED(obj);
					};
				};

				//==================================
				// Namespace object
				//==================================

				_shared.REGISTER = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 7,
								params: {
									type: {
										type: 'Type',
										optional: false,
										description: "Type to register.",
									}, 
									args: {
										type: 'arrayof(any)',
										optional: true,
										description: "Arguments of the constructor.",
									}, 
									protect: {
										type: 'bool',
										optional: true,
										description: "'true' will protect the namespace object. 'false' will not. Default is 'true'."
									},
								},
								returns: 'Type',
								description: "Registers the specified type to the current namespace object and returns the specified type. Also validates and initializes that type.",
					}
					//! END_REPLACE()
					, function REGISTER(type, args, protect) {
						root.DD_ASSERT && root.DD_ASSERT(types.isType(type) || types.isErrorType(type), "Invalid type.");
						
						let isType = types.isType(type),
							isErrorType = !isType && types.isErrorType(type),
							newType = type;

						const isClass = isType && types.isClass(type),
							name = (types.getTypeName(type) || types.getFunctionName(type) || null),
							fullName = (name ? (types._instanceof(this, types.Namespace) && !types.is(this, root) ? this.DD_FULL_NAME + '.' : '') + name : null),
							isPrivate = (isType || isErrorType) && (!name || (name.slice(0, 2) === '__'));
						
						if (isType && !types.isInitialized(type)) {
							newType = types.INIT(type);
						};

						if ((root.getOptions().debug || __options__.enforcePolicies)) {
							if (isClass && !types.isMixIn(newType) && !types.isInterface(newType) && !types.isBase(newType)) {
								const mustOverride = newType[__Internal__.symbolMustOverride];
								if (mustOverride) {
									throw new types.Error("You must override the method '~0~' of type '~1~'.", [mustOverride, types.getTypeName(newType) || __Internal__.ANONYMOUS]);
								};
							};
						};

						if (newType !== type) {
							isType = types.isType(newType);
							isErrorType = !isType && types.isErrorType(newType);
						};

						if (isType || isErrorType) {
							const values = {
								apply: type.apply,
								call: type.call,
								bind: type.bind,
							};
							_shared.setAttributes(type, values, {ignoreWhenReadOnly: true});

							if (args) {
								newType = types.newInstance(newType, args);
								isType = false;
								isErrorType = false;
							};
						};

						if (!types.get(newType, 'DD_FULL_NAME')) {
							_shared.setAttributes(newType, {
								DD_PARENT: this,
								DD_NAME: name,
								DD_FULL_NAME: fullName,
							}, {});
						};

						if (!isPrivate) {
							// Public type
							const regNamespace = namespaces.get(fullName);
							if (regNamespace) {
								const result = this.UNREGISTER(regNamespace);
								if (!result) {
									return null;
								};
							};
							
							const entryType = (isType || isErrorType ? entries.Type : entries.Object);
							const entry = new entryType(root, null, newType, {protect: protect});
							entry.init();

							namespaces.add(fullName, entry, {secret: _shared.SECRET});
						};
						
						return newType;
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
						
						const name = (type.DD_NAME || ''),
							isPrivate = (!name || (name.slice(0, 2) === '__')),
							isSingleton = types.isSingleton(type);
						
						if (!isPrivate) {
							const fullName = (isSingleton ? types.getType(type) : type).DD_FULL_NAME;
							const regNamespace = namespaces.get(fullName);
							if (regNamespace) {
								if (regNamespace.DD_PARENT !== this) {
									return false;
								};
								const result = namespaces.remove(fullName, null, {secret: _shared.SECRET});
								if (!result) {
									return false;
								};
							};
						};
						
						if (isSingleton) {
							types.DESTROY(type);
							type = types.getType(type);
						};
						
						if (!isPrivate && !types.isErrorType(type) && !types.isMixIn(type) && !types.isInterface(type) && !types.isBase(type)) {
							types.DESTROY(type);
						};
						
						return true;
					});
				
				
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
						this._this.title = title;
						this.superArgs = [message, params];
					})));

				doodad.ADD('trapException', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 3,
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
								},
								returns: 'error',
								description: "Errors manager.",
					}
					//! END_REPLACE()
					, function trapException(ex, /*optional*/obj, /*optional*/attr) {
						if (!__Internal__.inTrapException) {
							__Internal__.inTrapException = true;
							ex = _shared.Natives.windowObject(ex);
							try {
								if (!ex.trapped) {
									if (!ex.bubble) {
										if (types._instanceof(ex, exceptions.Application)) {
											_shared.popupExceptionHook(ex, obj, attr);
										} else {
											_shared.catchExceptionHook(ex, obj, attr);
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
					}));

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
					, extenders.REGISTER(types.Type.$inherit(
						/*typeProto*/
						{
							$TYPE_NAME: "Extender",
							$TYPE_UUID:  '' /*! INJECT('+' + TO_SOURCE(UUID('Extender')), true) */,
							
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
									const name = proto.$TYPE_NAME;
									const uuid = proto.$TYPE_UUID;
									delete proto.$TYPE_NAME;
									delete proto.$TYPE_UUID;
									const type = this._super(
										/*typeProto*/
										{
											$TYPE_NAME: name,
											$TYPE_UUID: uuid,
										},
										/*instanceProto*/
										proto
									);
									return type;
								})),

							_new: types.SUPER(function _new() {
									this._super();
									_shared.setAttributes(this, {
										$cache: types.nullObject(),
									});
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
									});
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
									const type = types.getType(this),
										name = this.getCacheName(options);
									let extender;
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
										let options = {};
										options = extender.overrideOptions(options, this);
										return extender.get(options);
									} else {
										return this;
									};
								}),
							getValue: types.READ_ONLY(null), // function getValue(attr, attribute, forType)
							extend: types.READ_ONLY(null),   // function extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, proto, protoName)
							postExtend: types.READ_ONLY(null), // function postExtend(attr, destAttributes, destAttribute)
							preInit: types.READ_ONLY(null), // function preInit(attr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value, isProto)
							init: types.READ_ONLY(null), // function init(attr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value, isProto)
							remove: types.READ_ONLY(null), // function remove(attr, obj, storage, forType, attribute)
						}
					)));
				
				doodad.ADD('CallerFunction', function CallerFunction() {});
				doodad.ADD('DispatchFunction', function DispatchFunction() {});

				doodad.ADD('AttributeGetter', function AttributeGetter() {});
				doodad.ADD('AttributeSetter', function AttributeSetter() {});

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
					, extenders.REGISTER([], extenders.Extender.$inherit({
						$TYPE_NAME: "Attribute",
						$TYPE_UUID:  '' /*! INJECT('+' + TO_SOURCE(UUID('AttributeExtender')), true) */,
						
						isReadOnly: types.READ_ONLY(false),
						isEnumerable: types.READ_ONLY(true),
						enableScopes: types.READ_ONLY(true),
						isProto: types.READ_ONLY(true), // true: target is the prototype, false: target is the instance, null: both true and false
						
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
								const extender = this;
								const cache = {
									obj: null,
									storage: null,
								};
								return types.INHERIT(doodad.AttributeGetter, function getter() {
									if (root.getOptions().debug || __options__.enforceScopes) {
										if (extender.enableScopes) {
											const type = types.getType(this);
											if (!__Internal__.invokedClass || (type !== __Internal__.invokedClass)) {
												const result = _shared.getAttributes(this, [__Internal__.symbolCurrentDispatch, __Internal__.symbolCurrentCallerIndex]);
												const dispatch = result[__Internal__.symbolCurrentDispatch],
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
								});
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
								const extender = this;
								const cache = {
									obj: null,
									storage: null,
								};
								return types.INHERIT(doodad.AttributeSetter, function setter(value) {
									if (root.getOptions().debug || __options__.enforceScopes) {
										if (extender.enableScopes) {
											const type = types.getType(this);
											if (!__Internal__.invokedClass || (type !== __Internal__.invokedClass)) {
												const result = _shared.getAttributes(this, [__Internal__.symbolCurrentDispatch, __Internal__.symbolCurrentCallerIndex]);
												const dispatch = result[__Internal__.symbolCurrentDispatch],
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
								});
							}),
						
						_new: types.SUPER(function _new(/*optional*/options) {
								this._super(options);
								_shared.setAttributes(this, {
									isReadOnly: types.get(options, 'isReadOnly', this.isReadOnly),
									isEnumerable: types.get(options, 'isEnumerable', this.isEnumerable),
									enableScopes: types.get(options, 'enableScopes', this.enableScopes),
									isProto: types.get(options, 'isProto', this.isProto),
								});
							}),

						getCacheName: types.SUPER(function getCacheName(/*optional*/options) {
								return this._super(options) + 
									',' + (types.get(options, 'isReadOnly', this.isReadOnly) ? '1' : '0') +
									',' + (types.get(options, 'isEnumerable', this.isEnumerable) ? '1' : '0') +
									',' + (types.get(options, 'enableScopes', this.enableScopes) ? '1' : '0') +
									',' + (types.get(options, 'isProto', this.isProto) ? '1' : '0');
							}),

						overrideOptions: types.SUPER(function overrideOptions(options, newOptions, /*optional*/replace) {
								options = this._super(options, newOptions, replace);
								if (replace) {
									types.fill(['isReadOnly', 'isEnumerable', 'enableScopes', 'isProto'], options, this, newOptions);
								} else {
									options.isReadOnly = !!newOptions.isReadOnly || this.isReadOnly;
									options.isEnumerable = !!newOptions.isEnumerable || this.isEnumerable;
									options.enableScopes = !!newOptions.enableScopes || this.enableScopes;
									options.isProto = !!newOptions.isProto || this.isProto;
								};
								return options;
							}),
						
						extend: root.DD_DOC(
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
										proto: {
											type: 'object',
											optional: false,
											description: "The prototype.",
										},
										protoName: {
											type: 'string',
											optional: false,
											description: "Name of the prototype.",
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

								destAttribute[__Internal__.symbolPrototype] = sourceProto;

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

						preInit: types.SUPER(function preInit(attr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value, isProto) {
							const retVal = this._super(attr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value, isProto);
							const storage = (forType ? typeStorage : instanceStorage);
							if (storage && this.__isFromStorage(attribute)) {
								return retVal || !((this.isProto === null) || !isProto || (isProto === this.isProto));   // 'true' === Cancel init
							} else {
								return retVal || !((this.isProto === null) || (isProto === null) || (isProto === this.isProto));   // 'true' === Cancel init
							};
						}),

						init: root.DD_DOC(
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
										isProto: {
											type: 'bool,null',
											optional: false,
											description: "'true' when 'obj' is a Class prototype. 'false' when 'obj' is a Class instance. 'null' when attribute must be unconditionally set.",
										},
									},
									returns: 'undefined',
									description: "Initializes an attribute for a new object instance.",
							}
							//! END_REPLACE()
							, function init(attr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value, isProto) {
								let storage = (forType ? typeStorage : instanceStorage);

								if (attr === __Internal__.symbolAttributesStorage) {
									value = storage;
								};

								if (storage && this.__isFromStorage(attribute)) {
									storage[attr] = value; // stored regardless of "isProto"

									if (attr !== __Internal__.symbolAttributesStorage) {
										storage = null;
									};
								
									const attrDesc = types.getOwnPropertyDescriptor(obj, attr);

									if (
										storage ||
										!attrDesc ||
										attrDesc.configurable ||
										!types.isPrototypeOf(doodad.AttributeGetter, attrDesc.get) ||
										(!types.isNothing(attrDesc.set) && !types.isPrototypeOf(doodad.AttributeSetter, attrDesc.set))
									) {
										const descriptor = {
											configurable: false,
											enumerable: this.isEnumerable,
											get: this.getterTemplate(attr, attribute, forType, storage),
										};

										if (!this.isReadOnly) {
											descriptor.set = this.setterTemplate(attr, attribute, forType, storage);
										};

										types.defineProperty(obj, attr, descriptor);
									};
								} else {
									const cf = (this.isReadOnly || !this.isPersistent); // to be able to change value when read-only with "setAttribute" or be able to remove the property when not persistent
									_shared.setAttribute(obj, attr, value, {
										configurable: cf,
										enumerable: this.isEnumerable, 
										writable: !this.isReadOnly
									});
								};
							}),

						remove: types.SUPER(function remove(attr, obj, storage, forType, attribute) {
								if (!this.isPersistent) {
									if (storage && this.__isFromStorage(attribute)) {
										delete storage[attr];
									} else {
										delete obj[attr];
									};
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
					, extenders.REGISTER([], extenders.Attribute.$inherit({
						$TYPE_NAME: "Null",
						$TYPE_UUID:  '' /*! INJECT('+' + TO_SOURCE(UUID('NullExtender')), true) */,
						
						extend: types.READ_ONLY(null),

						init: types.SUPER(function init(attr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value, isProto) {
								this._super(attr, obj, attributes, typeStorage, instanceStorage, forType, attribute, null, isProto);
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
					, extenders.REGISTER([], extenders.Attribute.$inherit({
						$TYPE_NAME: "ClonedAttribute",
						$TYPE_UUID:  '' /*! INJECT('+' + TO_SOURCE(UUID('ClonedAttributeExtender')), true) */,
						
						maxDepth: types.READ_ONLY(0),
						keepUnlocked: types.READ_ONLY(false),
						cloneOnInit: types.READ_ONLY(false),
						
						_new: types.SUPER(function _new(/*optional*/options) {
								this._super(options);
								_shared.setAttributes(this, {
									maxDepth: types.get(options, 'maxDepth', this.maxDepth),
									keepUnlocked: types.get(options, 'keepUnlocked', this.keepUnlocked),
									cloneOnInit: types.get(options, 'cloneOnInit', this.cloneOnInit),
								});
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
								let val = types.unbox(attribute);
								if (types.isClonable(val)) {
									val = types.clone(val, this.maxDepth, false, this.keepUnlocked, true);
									attribute = attribute.setValue(val);
								};
								return attribute;
							}),

						preInit: types.SUPER(function preInit(attr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value, isProto) {
							const retVal = this._super(attr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value, isProto);
							if (retVal && !isProto && this.isProto && this.cloneOnInit && types.isClonable(value)) {
								return false; // Must be initialized
							} else {
								return retVal;
							};
						}),

						init: types.SUPER(function init(attr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value, isProto) {
								if (this.cloneOnInit && types.isClonable(value)) {
									value = types.clone(value, this.maxDepth, false, this.keepUnlocked, true);
								};
								
								this._super(attr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value, isProto);
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
					, extenders.REGISTER([], extenders.ClonedAttribute.$inherit({
						$TYPE_NAME: "ExtendObject",
						$TYPE_UUID:  '' /*! INJECT('+' + TO_SOURCE(UUID('ExtendObjectExtender')), true) */,
						
						extend: types.SUPER(function extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, proto, protoName) {
								sourceAttribute = this._super(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, proto, protoName);
								
								let dest = types.unbox(destAttribute);
								if (!dest) {
									dest = {};
								};
									
								const src = types.unbox(sourceAttribute);
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
					, extenders.REGISTER([], extenders.ClonedAttribute.$inherit({
						$TYPE_NAME: "UniqueArray",
						$TYPE_UUID:  '' /*! INJECT('+' + TO_SOURCE(UUID('UniqueArrayExtender')), true) */,
						
						extend: types.SUPER(function extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, proto, protoName) {
								sourceAttribute = this._super(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, proto, protoName);
								
								let dest = types.unbox(destAttribute);
								if (!dest) {
									dest = [];
								};
									
								const src = types.unbox(sourceAttribute);
								if (src) {
									types.append(dest, src);
								};
								
								sourceAttribute = sourceAttribute.setValue(dest);  // preserve attribute flags of "sourceAttribute"
								
								return sourceAttribute;
							}),

						preInit: types.SUPER(function preInit(attr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value, isProto) {
							const retVal = this._super(attr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value, isProto);
							if (retVal && !isProto && this.isProto && !types.isNothing(value)) {
								return false; // Must be initialized
							} else {
								return retVal;
							};
						}),

						init: types.SUPER(function init(attr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value, isProto) {
								if (!types.isNothing(value)) {
									value = types.unique(value);
								};
								
								this._super(attr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value, isProto);
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
					, extenders.REGISTER([], extenders.ClonedAttribute.$inherit({
						$TYPE_NAME: "Method",
						$TYPE_UUID:  '' /*! INJECT('+' + TO_SOURCE(UUID('MethodExtender')), true) */,
						
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
									revision: 5,
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
								const extender = this;
								const fn = types.unbox(sourceAttribute);

								if (root.DD_ASSERT) {
									root.DD_ASSERT(types.isJsFunction(fn), "Invalid function.");
								};

								const values = {
									apply: fn.apply,
									call: fn.call,
									bind: fn.bind,
								};
								_shared.setAttributes(fn, values, {ignoreWhenReadOnly: true});

								const _caller = types.INHERIT(doodad.CallerFunction, function caller(/*paramarray*/) {
									const type = types.getType(this);
										
									const result = _shared.getAttributes(this, [__Internal__.symbolCurrentDispatch, __Internal__.symbolCurrentCallerIndex, '_super']),
										currentDispatch = result[__Internal__.symbolCurrentDispatch],
										currentCaller = result[__Internal__.symbolCurrentCallerIndex] + 1,
										oldSuper = result._super,
										modifiers = currentDispatch[__Internal__.symbolModifiers];

									let _super = null,
										oldCalled = false;

									try {
										// TODO: Find a better way because of RENAME_OVERRIDE and RENAME_REPLACE
										//if (!currentDispatch || (currentDispatch[_shared.NameSymbol] !== attr)) {
										//	throw new types.Error("Current dispatch and caller don't match together.");
										//};

										const callers = currentDispatch[__Internal__.symbolCallers];

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
										
										const callFn = (extender.byReference ? fn : types.unbox(_caller[__Internal__.symbolPrototype][attr]));
										
										let retVal = callFn.apply(this, arguments);

										if (modifiers & doodad.MethodModifiers.Async) {
											const Promise = types.getPromise();
											retVal = Promise.resolve(retVal);
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
										} else {
											if (modifiers & doodad.MethodModifiers.Async) {
												const Promise = types.getPromise();
												return Promise.reject(ex);
											} else {
												throw ex;
											};
										};
										
									} finally {
										_shared.setAttribute(this, '_super', oldSuper);
										if (!types.isNothing(currentCaller)) {
											_shared.setAttribute(this, __Internal__.symbolCurrentCallerIndex, currentCaller - 1);
										};
										if (!types.isNothing(_super)) {
											_super[__Internal__.symbolCalled] = oldCalled;
										};
									};
								});

								return _caller;
							}),

						dispatchTemplate: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 9,
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
								const extender = this;

								const _dispatch = types.INHERIT(doodad.DispatchFunction, function dispatch(/*paramarray*/) {
									const type = types.getType(this),
										forType = types.isType(this),
										modifiers = _dispatch[__Internal__.symbolModifiers],
										canBeDestroyed = !!(modifiers & doodad.MethodModifiers.CanBeDestroyed);
									
									if (!canBeDestroyed) {
										//if (_shared.DESTROYED(this)) {
										//	throw new types.NotAvailable("Method '~0~' of '~1~' is unavailable because object has been destroyed.", [_dispatch[_shared.NameSymbol], types.getTypeName(type) || __Internal__.ANONYMOUS]);
										//};
										if (types._implements(this, mixIns.Creatable)) {
											const destroyed = _shared.getAttribute(this, __Internal__.symbolDestroyed);
											if ((destroyed === null) && !forType) {
												throw new types.NotAvailable("Method '~0~' of '~1~' is unavailable because object has not been created.", [_dispatch[_shared.NameSymbol], types.getTypeName(type) || __Internal__.ANONYMOUS]);
											};
											if (destroyed === true) {
												throw new types.NotAvailable("Method '~0~' of '~1~' is unavailable because object has been destroyed.", [_dispatch[_shared.NameSymbol], types.getTypeName(type) || __Internal__.ANONYMOUS]);
											};
										} else {
											if (__Internal__.oldDESTROYED(this)) {
												throw new types.NotAvailable("Method '~0~' of '~1~' is unavailable because object has been destroyed.", [_dispatch[_shared.NameSymbol], types.getTypeName(type) || __Internal__.ANONYMOUS]);
											};
										};
									};

									const result = _shared.getAttributes(this, [__Internal__.symbolCurrentDispatch, __Internal__.symbolCurrentCallerIndex, __Internal__.symbolAttributes]), 
										oldDispatch = result[__Internal__.symbolCurrentDispatch], 
										oldCaller = result[__Internal__.symbolCurrentCallerIndex],
										attributes = result[__Internal__.symbolAttributes];

									const oldInvokedClass = __Internal__.invokedClass;

									const host = (types.baseof(doodad.Interface, type) ? this[__Internal__.symbolHost] : null),
										hostType = types.getType(host);

									if (root.getOptions().debug || __options__.enforceScopes) {
										// Private methods
										if (!oldInvokedClass || (type !== oldInvokedClass)) {
											if ((attribute[__Internal__.symbolScope] === doodad.Scopes.Private) && oldDispatch && (oldDispatch[__Internal__.symbolCallers][oldCaller - 1][__Internal__.symbolPrototype] !== caller[__Internal__.symbolPrototype])) {
												throw new types.Error("Method '~0~' of '~1~' is private.", [_dispatch[_shared.NameSymbol], types.unbox(caller[__Internal__.symbolPrototype].$TYPE_NAME) || __Internal__.ANONYMOUS]);
											};
										};

										// Non-public methods
										if (!oldInvokedClass || (!host && (type !== oldInvokedClass)) || (host && (type !== oldInvokedClass) && (hostType !== oldInvokedClass))) {
											if ((attribute[__Internal__.symbolScope] !== doodad.Scopes.Public) && !oldDispatch) {
												throw new types.Error("Method '~0~' of '~1~' is not public.", [_dispatch[_shared.NameSymbol], types.getTypeName(type) || __Internal__.ANONYMOUS]);
											};
										};
									};
									
									if (root.getOptions().debug || __options__.enforcePolicies) {
										// External methods (can't be called internally)
										if (extender.isExternal && (type === oldInvokedClass)) {
											throw new types.Error("Method '~0~' of '~1~' is external-only.", [_dispatch[_shared.NameSymbol], types.getTypeName(type) || __Internal__.ANONYMOUS]);
										};

										// Must override methods
										if (modifiers & doodad.MethodModifiers.MustOverride) {
											throw new types.Error("You must override the method '~0~' of type '~1~'.", [_dispatch[_shared.NameSymbol], types.getTypeName(type) || __Internal__.ANONYMOUS]);
										};
									};

									// Not implemented methods
									if (modifiers & doodad.MethodModifiers.NotImplemented) {
										throw new types.Error("Method '~0~' of '~1~' is not implemented.", [_dispatch[_shared.NameSymbol], types.getTypeName(type) || __Internal__.ANONYMOUS]);
									};

									// Obsolete methods
									if ((modifiers & doodad.MethodModifiers.Obsolete) && !_dispatch[__Internal__.symbolObsoleteWarned]) {
										tools.log(tools.LogLevels.Warning, "Method '~0~' of '~1~' is obsolete. ~2~", [_dispatch[_shared.NameSymbol], types.getTypeName(type) || __Internal__.ANONYMOUS, attribute[__Internal__.symbolUsageMessage] || '']);
										_dispatch[__Internal__.symbolObsoleteWarned] = true;
									};

									// Non-reentrant methods
									const notReentrant = extender.notReentrant || (attr === 'toString'),
										async = (attr !== 'toString') && (modifiers & doodad.MethodModifiers.Async); // NOTE: "toString" can't be async

									let notReentrantMap = __Internal__.notReentrantMap.get(this);
									if (notReentrant) {
										if (!notReentrantMap) {
											// NOTE: We create a Map just when needed.
											notReentrantMap = new types.Map();
											__Internal__.notReentrantMap.set(this, notReentrantMap);
										};

										if (notReentrantMap.get(attr)) {
											if (attr === 'toString') {
												// <PRB> Javascript engine calls "toString" internally. When an exception occurs inside "toString", it calls it again and again !
												return "Error: 'toString' is not reentrant.";
											} else {
												throw new types.Error("'~0~' is not reentrant.", [attr]);
											};
										};
									};

									const handleError = function handleError(ex) {
										let emitted = false;
										if (!ex.bubble /*&& !ex.trapped*/) {
											if ((types.isClass(type) || types.isInterfaceClass(type)) && this._implements(mixIns.Events)) {
												let destroyed = false;
												if (this._implements(mixIns.Creatable)) {
													destroyed = _shared.getAttribute(this, __Internal__.symbolDestroyed);
												};
												if (destroyed === false) { // NOTE: Can be 'null' for "not created".
													const errorEvent = this.__ERROR_EVENT;
													if (errorEvent && (attr !== errorEvent) && (!notReentrantMap || !notReentrantMap.get(errorEvent))) {
														const errorAttr = attributes[errorEvent];
														const onError = this[errorEvent];
														if (types.isLike(errorAttr[__Internal__.symbolExtender], extenders.RawEvent)) {
															// <PRB> Node.Js doesn't trap errors. So we don't throw if error has been emitted.
															if (onError.getCount() > 0) {
																// <PRB> Node.Js re-emits 'error'.
																onError.attachOnce(null, function noop(err) {});
															};
															emitted = onError.call(this, ex);
														} else {
															const ev = new doodad.ErrorEvent(ex);
															onError.call(this, ev);
															if (ev.prevent) {
																ex.trapped = true;
															};
														};
													};
												};
											};
										};
										if (!emitted) {
											throw ex;
										};
									}

									const validateResult = function validateResult(result) {
										if (async) {
											// Asynchronous methods must always return a Promise
											const Promise = types.getPromise();
											result = Promise.resolve(result);
											if (root.getOptions().debug || __options__.enforcePolicies) {
												const validator = attribute[__Internal__.symbolReturns];
												if (validator) {
													result = result.then(function(val) {
														if (!validator.call(this, val)) {
															throw new types.Error("Invalid returned value from method '~0~'.", [attr]);
														};
														return val;
													}, null, this);
												};
											};
										} else {
											if (root.getOptions().debug || __options__.enforcePolicies) {
												const validator = attribute[__Internal__.symbolReturns];
												// <PRB> Javascript engine calls "toString" internally. When an exception occurs inside "toString", it calls it again and again !
												if (validator && !validator.call(this, result)) {
													if (attr === 'toString') {
														result = tools.format("Invalid returned value from method '~0~'.", [attr]);
													} else {
														throw new types.Error("Invalid returned value from method '~0~'.", [attr]);
													};
												};
											};
										};
										return result;
									};

									const caller = _dispatch[__Internal__.symbolCallers][0];
									if (!caller) {
										// No caller
										return validateResult(undefined);
									};
									
									const oldCallerCalled = caller[__Internal__.symbolCalled];

									//let oldHostDispatch,
									//	oldHostCaller;

									//if (host) {
									//	const result = _shared.getAttributes(host, [__Internal__.symbolCurrentDispatch, __Internal__.symbolCurrentCallerIndex]);
									//	oldHostDispatch = result[__Internal__.symbolCurrentDispatch];
									//	oldHostCaller = result[__Internal__.symbolCurrentCallerIndex];
									//};

									let retVal = undefined;

									try {
										const values = {};										
										values[__Internal__.symbolCurrentDispatch] = _dispatch;
										values[__Internal__.symbolCurrentCallerIndex] = 0;
										_shared.setAttributes(this, values);
									
										//if (host) {
										//	_shared.setAttributes(host, values);
										//};
									
										__Internal__.invokedClass = type;

										if (notReentrant) {
											notReentrantMap.set(attr, true);
										};

										caller[__Internal__.symbolCalled] = false;
										

										retVal = validateResult(caller.apply(this, arguments));


									} catch(ex) {
										if (attr === 'toString') {
											// <PRB> Javascript engine calls "toString" internally. When an exception occurs inside "toString", it calls it again and again !
											try {
												retVal = "Error: " + types.toString(ex);
											} catch (o) {
												retVal = "Internal error";
											};
										} else {
											if (async) {
												// Asynchronous methods must always return a Promise
												const Promise = types.getPromise();
												retVal = Promise.reject(ex);
											} else {
												handleError.call(this, ex);
											};
										};
										
									} finally {
										if (notReentrant) {
											if (async && retVal) {
												retVal = retVal.nodeify(function resetCalled(err, result) {
													notReentrantMap.set(attr, false);
													if (err) {
														handleError.call(this, err);
													} else {
														return result;
													};
												}, this);
											} else {
												notReentrantMap.set(attr, false);
											};
										} else if (async && retVal) {
											retVal = retVal.catch(handleError, this);
										};

										__Internal__.invokedClass = oldInvokedClass;
										caller[__Internal__.symbolCalled] = oldCallerCalled;

										const values = {};										
										values[__Internal__.symbolCurrentDispatch] = oldDispatch;
										values[__Internal__.symbolCurrentCallerIndex] = oldCaller;
										_shared.setAttributes(this, values);
										
										//if (host) {
										//	const values = {};										
										//	values[__Internal__.symbolCurrentDispatch] = oldHostDispatch;
										//	values[__Internal__.symbolCurrentCallerIndex] = oldHostCaller;
										//	_shared.setAttributes(host, values);
										//};
									};

									return retVal;
								});

								_dispatch[__Internal__.symbolCalled] = false;

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
								const fn = types.unbox(sourceAttribute);
								
								if (root.DD_ASSERT) {
									root.DD_ASSERT(types.isJsFunction(fn), "Invalid function.");
								};

								const caller = this.callerTemplate(attr, sourceAttribute, destAttribute);

								const values = {};
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
								const dispatch = this.dispatchTemplate(attr, attribute, callers);

								_shared.setAttribute(dispatch, _shared.NameSymbol, attr, {});
								_shared.setAttribute(dispatch, __Internal__.symbolCallers, callers, {});
								
								let modifiers = attribute[__Internal__.symbolModifiers];

								// Clear "MustOverride" if method has been overriden
								let caller = callers[0];
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
								});
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
								sourceAttribute = this._super(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, proto, protoName);
								
								let srcIsInterface = types.isInterface(source),
									callersOrFn = types.unbox(sourceAttribute);
									
								//root.DD_ASSERT && root.DD_ASSERT(types.isNothing(destAttribute) || types.isArray(callersOrFn), "Invalid destination value.");
								if (root.DD_ASSERT) {
									if (sourceIsProto) {
										root.DD_ASSERT && root.DD_ASSERT(types.isNothing(callersOrFn) || types.isJsFunction(callersOrFn), "Invalid source value.");
									} else {
										root.DD_ASSERT && root.DD_ASSERT(types.isNothing(callersOrFn) || types.isArray(callersOrFn), "Invalid source value.");
									};
								};
								
								let destCallers = types.unbox(destAttribute);
								const hasDestCallers = types.isArray(destCallers);
								if (!hasDestCallers) {
									destCallers = [];
									destAttribute = sourceAttribute.setValue(destCallers);  // copy attribute flags of "sourceAttribute"
								};
								
								let replacedCallers = sourceAttribute[__Internal__.symbolReplacedCallers];
								if (replacedCallers) {
									destAttribute[__Internal__.symbolReplacedCallers] = replacedCallers = types.unique(replacedCallers);
								} else {
									replacedCallers = destAttribute[__Internal__.symbolReplacedCallers] || [];
								};

								let modifiers = ((destAttribute[__Internal__.symbolModifiers] || 0) & doodad.preservedMethodModifiers) | (sourceAttribute[__Internal__.symbolModifiers] || 0);
								
								if (hasDestCallers && !srcIsInterface && (!sourceIsProto || (modifiers & (doodad.MethodModifiers.Override | doodad.MethodModifiers.Replace)))) {
									// Override or replace
									let start = destAttribute[__Internal__.symbolCallFirstLength];
									if (callersOrFn) {
										if (sourceIsProto) {
											if (root.getOptions().debug || __options__.enforcePolicies) {
												if (destAttribute[__Internal__.symbolScope] === doodad.Scopes.Private) {
													throw new types.Error("Private method '~0~' of '~1~' can't be overridden or replaced.", [attr, protoName || __Internal__.ANONYMOUS]);
												};
											};
											const caller = this.createCaller(attr, sourceAttribute, destAttribute);
											callersOrFn = [caller];
										};
										let toRemove = 0;
										let caller = callersOrFn[start - 1];
										let callerModifiers = caller && caller[__Internal__.symbolModifiers] || 0;
										if ((callerModifiers & (doodad.MethodModifiers.CallFirst | doodad.MethodModifiers.Replace)) === (doodad.MethodModifiers.CallFirst | doodad.MethodModifiers.Replace)) {
											// Replace "call firsts"
											if (sourceIsProto) {
												toRemove = start;
											};
											start = 0;
										};
										caller = callersOrFn[callersOrFn.length - 1];
										callerModifiers = caller && caller[__Internal__.symbolModifiers] || 0;
										if (sourceIsProto && ((callerModifiers & (doodad.MethodModifiers.CallFirst | doodad.MethodModifiers.Replace)) === doodad.MethodModifiers.Replace)) {
											// Replace non "call firsts"
											toRemove = destCallers.length - start;
										};
										const removed = _shared.Natives.arraySpliceApply(destCallers, types.append([start, toRemove], callersOrFn));
										destAttribute[__Internal__.symbolReplacedCallers] = types.append(replacedCallers, removed);
										destAttribute[__Internal__.symbolCallFirstLength] = start + sourceAttribute[__Internal__.symbolCallFirstLength];
									};
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
										destAttribute[__Internal__.symbolCallFirstLength] = ((modifiers & doodad.MethodModifiers.CallFirst) ? 1 : sourceAttribute[__Internal__.symbolCallFirstLength]);
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
								
								const callers = types.unbox(destAttribute);

								const replacedCallers = destAttribute[__Internal__.symbolReplacedCallers] || [];

								// Remove duplicated callers and update "call first" length
								destAttribute[__Internal__.symbolCallFirstLength] = callers.length;

								let caller,
									i = 0;

								while (i < callers.length) {
									caller = callers[i];
									if (!(caller[__Internal__.symbolModifiers] & doodad.MethodModifiers.CallFirst)) {
										destAttribute[__Internal__.symbolCallFirstLength] = i;
										break;
									};
									const proto = caller[__Internal__.symbolPrototype];
									let deleted = false;
									for (let j = 0; j < replacedCallers.length; j++) {
										if (replacedCallers[j][__Internal__.symbolPrototype] === proto) {
											callers.splice(i, 1);
											deleted = true;
											break;
										};
									};
									if (!deleted) {
										let j = i + 1;
										while (j < callers.length) {
											if (callers[j][__Internal__.symbolPrototype] === proto) {
												callers.splice(j, 1);
											} else {
												j++;
											};
										};
										i++;
									};
								};

								i = callers.length - 1;
								while (i >= destAttribute[__Internal__.symbolCallFirstLength]) {
									const proto = callers[i][__Internal__.symbolPrototype];
									let deleted = false;
									for (let j = 0; j < replacedCallers.length; j++) {
										if (replacedCallers[j][__Internal__.symbolPrototype] === proto) {
											callers.splice(i, 1);
											deleted = true;
											break;
										};
									};
									if (!deleted) {
										let j = i - 1;
										while (j >= destAttribute[__Internal__.symbolCallFirstLength]) {
											if (callers[j][__Internal__.symbolPrototype] === proto) {
												_shared.Natives.arraySpliceCall(callers, j, 1);
												i--;
											};
											j--;
										};
									};
									i--;
								};

								// Move callers to their specified position
								i = 0;
								while (i < callers.length) {
									const callerI = callers[i],
										position = callerI[__Internal__.symbolPosition];

									let found = false;

									if (position && !position[__Internal__.symbolOk]) {
										const proto = _shared.getAttribute(position.cls, __Internal__.symbolPrototype);
										for (let j = 0; j < callers.length; j++) {
											const callerJ = callers[j];
											if ((i !== j) && callerJ[__Internal__.symbolPrototype] === proto) {
												let pos = j;
												if (position.position > 0) {
													pos++;
												};
												let toRemove = 0;
												if (position.position === 0) {
													toRemove = 1;
												};
												_shared.Natives.arraySpliceCall(callers, i, 1);
												if (i < destAttribute[__Internal__.symbolCallFirstLength]) {
													destAttribute[__Internal__.symbolCallFirstLength]--;
												};
												if (pos > i) {
													pos--;
												};
												_shared.Natives.arraySpliceCall(callers, pos, toRemove, callerI);
												if (pos < destAttribute[__Internal__.symbolCallFirstLength]) {
													destAttribute[__Internal__.symbolCallFirstLength]++;
												};
												position[__Internal__.symbolOk] = true;
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

								// TODO: Find a better way than "symbolOk"
								for (let j = 0; j < callers.length; j++) {
									const callerI = callers[j],
										position = callerI[__Internal__.symbolPosition];
									if (position) {
										delete position[__Internal__.symbolOk];
									};
								};

								types.freezeObject(callers);
								
								return destAttribute;
							})),

						preInit: types.SUPER(function preInit(attr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value, isProto) {
							const retVal = this._super(attr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value, isProto);
							if (retVal && !isProto && this.isProto && this.bindMethod && !types.isNothing(value)) {
								return false; // Must be initialized
							} else {
								return retVal;
							};
						}),

						init: types.SUPER(function init(attr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value, isProto) {
								value = this.createDispatch(attr, obj, attribute, value);

								if (root.getOptions().debug || __options__.enforcePolicies) {
									if (typeStorage) {
										if (value[__Internal__.symbolModifiers] & doodad.MethodModifiers.MustOverride) {
											if (!typeStorage[__Internal__.symbolMustOverride]) {
												typeStorage[__Internal__.symbolMustOverride] = attr;
											};
										} else if (typeStorage[__Internal__.symbolMustOverride] === attr) {
											typeStorage[__Internal__.symbolMustOverride] = null;
										};
									};
								};

								if (this.bindMethod && !isProto && !types.isNothing(value)) {
									value = types.INHERIT(value, types.bind(obj, value));
								};

								this._super(attr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value, isProto);
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
					, extenders.REGISTER([], extenders.Method.$inherit({
						$TYPE_NAME: "JsMethod",
						$TYPE_UUID:  '' /*! INJECT('+' + TO_SOURCE(UUID('JsMethodExtender')), true) */,
						
						dontSetSuper: types.READ_ONLY(false),
						
						_new: types.SUPER(function _new(/*optional*/options) {
								this._super(options);
								_shared.setAttributes(this, {
									dontSetSuper: types.get(options, 'dontSetSuper', this.dontSetSuper),
								});
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
								let fn = types.unbox(sourceAttribute);

								if (root.DD_ASSERT) {
									root.DD_ASSERT(types.isJsFunction(fn), "Invalid function.");
								};

								const _caller = types.nullObject();

								fn = types.INHERIT(doodad.CallerFunction, fn);

								_caller[__Internal__.symbolFunction] = fn;

								return _caller;
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
											optional: false,
											description: "Method function.",
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
							, function jsCallerTemplate(attr, fn, /*optional*/_super) {
								let _caller;

								const fnApply = fn.apply.bind(fn);

								if (this.dontSetSuper) {
									_caller = function caller(/*paramarray*/) {
										const oldSuper = _shared.getAttribute(this, '_super');
										try {
											return fnApply(this, arguments);
										} catch(ex) {
											throw ex;
										} finally {
											_shared.setAttribute(this, '_super', oldSuper);
										};
									};
								} else {
									_super = _super || (function(){});
									_caller = function caller(/*paramarray*/) {
										const oldSuper = _shared.getAttribute(this, '_super');
										_shared.setAttribute(this, '_super', _super);
										try {
											return fnApply(this, arguments);
										} catch(ex) {
											throw ex;
										} finally {
											_shared.setAttribute(this, '_super', oldSuper);
										};
									};
								};

								_caller = types.INHERIT(doodad.CallerFunction, _caller);

								return _caller;
							}),

						dispatchTemplate: function dispatchTemplate(attr, attribute, callers) {
								const callersLen = callers.length;

								let _super = null;
								for (let i = callersLen - 1; i >= 0; i--) {
									const caller = callers[i];

									_super = this.jsCallerTemplate(attr, caller[__Internal__.symbolFunction], _super);

									_shared.setAttribute(_super, __Internal__.symbolPrototype, caller[__Internal__.symbolPrototype], {});
								};

								let _dispatch = __Internal__.makeInside(null, _super, _shared.SECRET);

								_dispatch = types.INHERIT(doodad.DispatchFunction, _dispatch);

								return _dispatch;
							},
						
						extend: function extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, proto, protoName) {
								sourceAttribute = extenders.ClonedAttribute.extend.call(this, attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, proto, protoName);
								
								let destCallers = types.unbox(destAttribute);
								
								if (!types.isArray(destCallers)) {
									if (sourceAttribute[_shared.SuperEnabledSymbol] && types.isFunction(destCallers)) {
										destCallers = [this.createCaller(attr, destAttribute, null)];
									} else {
										destCallers = [];
									};
									destAttribute = sourceAttribute.setValue(destCallers);  // copy attribute flags of "sourceAttribute"
								};

								let callersOrFn = types.unbox(sourceAttribute);
								
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
								
								_shared.Natives.arrayUnshiftApply(destCallers, callersOrFn);
								
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
								
								const callers = types.unbox(destAttribute);

								// Remove duplicated callers
								let i = callers.length - 1;
								while (i >= 0) {
									const callerI = callers[i];
									
									const proto = callerI[__Internal__.symbolPrototype];
									let j = i - 1;
									while (j >= 0) {
										if (callers[j][__Internal__.symbolPrototype] === proto) {
											_shared.Natives.arraySpliceCall(callers, j, 1);
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
					, extenders.REGISTER([], extenders.Method.$inherit({
						$TYPE_NAME: "Property",
						$TYPE_UUID:  '' /*! INJECT('+' + TO_SOURCE(UUID('PropertyExtender')), true) */,
						
						isReadOnly: types.READ_ONLY(false),
						bindMethod: types.READ_ONLY(true),
						
						extend: types.SUPER(function extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, proto, protoName) {
								sourceAttribute = extenders.Attribute.extend.call(this, attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, proto, protoName);

								const srcDesc = types.unbox(sourceAttribute);
									
								if (types.isNothing(srcDesc)) {
									return sourceAttribute;
								};

								let srcGet,
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
									
								const descriptor = types.extend({}, srcDesc);

								if (srcGet) {
									descriptor.get = this._super(attr, source, sourceProto, destAttributes, forType, types.AttributeBox(srcGet), types.AttributeBox(destGet), sourceIsProto);
								};
									
								if (srcSet) {
									descriptor.set = this._super(attr, source, sourceProto, destAttributes, forType, types.AttributeBox(srcSet), types.AttributeBox(destSet), sourceIsProto);
								};

								return sourceAttribute.setValue(descriptor);  // copy attribute flags of "sourceAttribute"
							}),

						preInit: function preInit(attr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value, isProto) {
							const retVal = !(!types.isNothing(value) && (this.isProto === null) || (isProto === null) || (isProto === this.isProto));
							if (retVal && !isProto && this.isProto && this.bindMethod && !types.isNothing(value)) {
								return false; // Must be initialized
							} else {
								return retVal;   // 'true' === Cancel init
							};
						},

						init: function init(attr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value, isProto) {
								//???? attribute = attributes[attr];
									
								const descriptor = types.extend({}, value);
								
								let get = types.get(descriptor, 'get');
								if (get) {
									get = this.createDispatch(attr, obj, attribute, types.unbox(get));  // copy attribute flags of "boxed"
									if (this.bindMethod && !isProto) {
										get = types.INHERIT(get, types.bind(obj, get));
									};
									descriptor.get = get;
								};
									
								let set = types.get(descriptor, 'set');
								if (set) {
									set = this.createDispatch(attr, obj, attribute, types.unbox(set));  // copy attribute flags of "boxed"
									if (this.bindMethod && !isProto) {
										set = types.INHERIT(set, types.bind(obj, set));
									};
									descriptor.set = set;
								};
									
								descriptor.enumerable = this.isEnumerable;
									
								if (types.has(descriptor, 'get') || types.has(descriptor, 'set')) {
									descriptor.configurable = false;
								} else {
									descriptor.configurable = this.isReadOnly;
									descriptor.writable = !this.isReadOnly;
								};
									
								types.defineProperty(obj, attr, descriptor);
							},

						remove: types.SUPER(function remove(attr, obj, storage, forType, attribute) {
							extenders.ClonedAttribute.remove.call(this, attr, obj, storage, forType, attribute);
						}),
					})));
				
				//==================================
				// Scopes
				//==================================
				
				doodad.ADD('Scopes', types.freezeObject(types.nullObject({
					Public: 1,
					Protected: 2,
					Private: 3,
				})));
				
				doodad.ADD('PUBLIC', root.DD_DOC(
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
						let extender = null;
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
					}));
				
				doodad.ADD('PROTECTED', root.DD_DOC(
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
						let extender = null;
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
					}));

				doodad.ADD('PRIVATE', root.DD_DOC(
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
						// <FUTURE> Will not have other choices than transpiling to JS classes to be able to use the incomming private fields and make Doodad's private fields more secure.
						let extender = null;
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
					}));
				
				doodad.ADD('PROTECTED_DEBUG', (__options__.publicOnDebug && root.getOptions().debug ? doodad.PUBLIC : doodad.PROTECTED));
				doodad.ADD('PRIVATE_DEBUG', (__options__.publicOnDebug && root.getOptions().debug ? doodad.PUBLIC : doodad.PRIVATE));
				
				//==================================
				// Class Modifiers
				//==================================
				
				// Can be combined
				doodad.ADD('ClassModifiers', types.freezeObject(types.nullObject({
					Base: 1,
					MixIn: 2,
					Interface: 4,
					Sealed: 8,
					Static: 16,
					Singleton: 32,
					Isolated: 64,
					Expandable: 128,
				})));
				doodad.ADD('preservedClassModifiers', doodad.ClassModifiers.MixIn | doodad.ClassModifiers.Interface | doodad.ClassModifiers.Sealed | doodad.ClassModifiers.Static);

				doodad.ADD('BASE', root.DD_DOC(
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
					}));
				
				// NOTE: A trait is in fact a mix-in. The only distinction is it has no attribute and its methods may be renamed at their implementation. For the moment, this dictinction is by convention.
				doodad.ADD('TRAIT', doodad.ADD('MIX_IN', root.DD_DOC(
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
							const base = types.getBase(cls);
							if (!types.is(base, doodad.Class) && !types.isMixIn(base)) {
								throw new types.Error("Mix-ins must be based on 'doodad.Class' or another mix-in.");
							};
						};
						if (types.isInitialized(cls)) {
							throw new types.Error("Class '" + (types.getTypeName(cls) || __Internal__.ANONYMOUS) + "' is initialized.");
						};
						_shared.setAttribute(cls, __Internal__.symbolModifiers, ((cls[__Internal__.symbolModifiers] || 0) & ~doodad.ClassModifiers.Interface) | doodad.ClassModifiers.MixIn, {configurable: true});
						return cls;
					})));
				
				doodad.ADD('INTERFACE', root.DD_DOC(
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
							const base = types.getBase(cls);
							if (!types.is(base, doodad.Class) && !types.isInterface(base)) {
								throw new types.Error("Interfaces must be based on 'doodad.Class' or another mix-in.");
							};
						};
						if (types.isInitialized(cls)) {
							throw new types.Error("Class '" + (types.getTypeName(cls) || __Internal__.ANONYMOUS) + "' is initialized.");
						};
						_shared.setAttribute(cls, __Internal__.symbolModifiers, ((cls[__Internal__.symbolModifiers] || 0) & ~doodad.ClassModifiers.MixIn) | doodad.ClassModifiers.Interface, {configurable: true});
						return cls;
					}));
				
				doodad.ADD('SEALED', root.DD_DOC(
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
					}));
				
				doodad.ADD('STATIC', root.DD_DOC(
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
					}));
				
				doodad.ADD('ISOLATED', root.DD_DOC(
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
					}));
				
				doodad.ADD('EXPANDABLE', root.DD_DOC(
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
					}));
				
				//===================================
				// Attribute modifiers
				//===================================

				doodad.ADD('ATTRIBUTE', root.DD_DOC(
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

						let oldExtender = value[__Internal__.symbolExtender];
						if (!oldExtender) {
							oldExtender = extenders.Attribute;
						};

						if (extender) {
							oldExtender = oldExtender.override(extender);
						};

						root.DD_ASSERT && root.DD_ASSERT(types._instanceof(extender, types.getType(extenders.Extender)), "Invalid extender.");

						if (options) {
							root.DD_ASSERT && root.DD_ASSERT(types.isJsObject(options), "Invalid options.");
							oldExtender = oldExtender.get(options);
						};
						
						value[__Internal__.symbolExtender] = oldExtender;
						return value;
					}));

				doodad.ADD('OPTIONS', root.DD_DOC(
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
						
						const valueIsExtender = types._instanceof(value, types.getType(extenders.Extender));

						let extender;
						
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
					}));
				
				doodad.ADD('NOT_INHERITED', root.DD_DOC(
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
					}));

				doodad.ADD('PRE_EXTEND', root.DD_DOC(
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
					}));

				doodad.ADD('TYPE', root.DD_DOC(
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
					}));

				doodad.ADD('INSTANCE', root.DD_DOC(
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
					}));

				doodad.ADD('PERSISTENT', root.DD_DOC(
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
					}));

				doodad.ADD('BIND', root.DD_DOC(
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
					}));

				doodad.ADD('NON_REENTRANT', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 1,
							params: {
								value: {
									type: 'AttributeBox,Extender,any',
									optional: false,
									description: "Attribute or extender or value.",
								},
							},
							returns: 'AttributeBox,Extender',
							description: "Specifies that a method is non-reentrant.",
					}
					//! END_REPLACE()
					, function NON_REENTRANT(value) {
						return doodad.OPTIONS({
							notReentrant: true,
						}, value);
					}));
				
				doodad.ADD('EXTERNAL', root.DD_DOC(
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
					}));
				
				doodad.ADD('READ_ONLY', root.DD_DOC(
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
					}));

				doodad.ADD('WRITABLE', root.DD_DOC(
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
					}));

				doodad.ADD('METHOD', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 2,
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
						if (types._instanceof(fn, types.AttributeBox)) {
							if (types.is(fn[__Internal__.symbolExtender], extenders.Method)) {
								return fn;
							};
						};
						const val = types.unbox(fn);
						if (root.DD_ASSERT) {
							root.DD_ASSERT(types.isNothing(val) || (types.isJsFunction(val) && types.isBindable(val)), "Invalid function.");
						};
						fn = doodad.ATTRIBUTE(fn, extenders.Method);
						if (types.isAsyncFunction(val)) {
							if (types.hasAsyncAwait()) {
								return doodad.ASYNC(fn);
							} else {
								throw new types.NotSupported("Async functions are not supported because they always coerce to a native ES6 Promise.");
							};
						} else {
							return fn;
						};
					}));

				doodad.ADD('JS_METHOD', root.DD_DOC(
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
					}));
				
				doodad.ADD('SUPER', root.DD_DOC(
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
					}));

				doodad.ADD('PROPERTY', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 1,
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
						
						const enumerable = types.getDefault(descriptor, 'enumerable', true);

						return doodad.ATTRIBUTE(descriptor, extenders.Property, {isEnumerable: enumerable});
					}));
				
				//==================================
				// Method Positioning
				//==================================

				doodad.ADD('POSITION', root.DD_DOC(
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
					}));

				doodad.ADD('AFTER', root.DD_DOC(
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
					}));

				doodad.ADD('BEFORE', root.DD_DOC(
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
					}));

				//==================================
				// Method Modifiers
				//==================================
				
				// Can be combined
				doodad.ADD('MethodModifiers', types.freezeObject(types.nullObject({
					Replace: 1,
					Override: 2,
					MustOverride: 4,
					Obsolete: 8,
					CallFirst: 16,
					CanBeDestroyed: 32,
					NotImplemented: 64,
					ForceCreate: 128,
					Async: 256,
				})));
				doodad.ADD('preservedMethodModifiers', doodad.MethodModifiers.Obsolete | doodad.MethodModifiers.CanBeDestroyed | doodad.MethodModifiers.Async);
				
				doodad.ADD('REPLACE', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 2,
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
						let _interface = null;
						if (arguments.length > 1) {
							_interface = fn;
							fn = arguments[1];
						};
						if (root.DD_ASSERT) {
							root.DD_ASSERT(types.isNothing(_interface) || types.isInterface(_interface) || types.isMixIn(_interface), "Invalid interface or mix-in.");
						};
						fn = doodad.METHOD(fn);
						fn[__Internal__.symbolModifiers] = ((fn[__Internal__.symbolModifiers] || 0) & ~doodad.MethodModifiers.Override) | doodad.MethodModifiers.Replace;
						fn[__Internal__.symbolInterface] = _interface;
						return fn;
					}));
				
				doodad.ADD('OVERRIDE', root.DD_DOC(
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
						let _interface = null;
						if (arguments.length > 1) {
							_interface = fn;
							fn = arguments[1];
						};
						if (root.DD_ASSERT) {
							root.DD_ASSERT(types.isNothing(_interface) || types.isInterface(_interface) || types.isMixIn(_interface), "Invalid interface or mix-in.");
						};
						fn = doodad.METHOD(fn);
						fn[__Internal__.symbolModifiers] = ((fn[__Internal__.symbolModifiers] || 0) & ~doodad.MethodModifiers.Replace) | doodad.MethodModifiers.Override;
						fn[__Internal__.symbolInterface] = _interface;
						return fn;
					}));
				
				doodad.ADD('CREATE_REPLACE', root.DD_DOC(
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
					}));
				
				doodad.ADD('CREATE_OVERRIDE', root.DD_DOC(
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
					}));
				
				doodad.ADD('MUST_OVERRIDE', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 1,
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
						fn = doodad.METHOD(fn);
						fn[__Internal__.symbolModifiers] = (fn[__Internal__.symbolModifiers] || 0) | doodad.MethodModifiers.MustOverride;
						return fn;
					}));
				
				doodad.ADD('OBSOLETE', root.DD_DOC(
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
						const argsLen = arguments.length;
						let fn = arguments[argsLen - 1];
						const message = arguments[argsLen - 2];
						fn = doodad.METHOD(fn);
						fn[__Internal__.symbolModifiers] = (fn[__Internal__.symbolModifiers] || 0) | doodad.MethodModifiers.Obsolete;
						fn[__Internal__.symbolUsageMessage] = message;
						return fn;
					}));

				doodad.ADD('CALL_FIRST', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 1,
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
						fn = doodad.METHOD(fn);
						fn[__Internal__.symbolModifiers] = (fn[__Internal__.symbolModifiers] || 0) | doodad.MethodModifiers.CallFirst;
						return fn;
					}));
				
				doodad.ADD('CAN_BE_DESTROYED', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 1,
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
						fn = doodad.METHOD(fn);
						fn[__Internal__.symbolModifiers] = (fn[__Internal__.symbolModifiers] || 0) | doodad.MethodModifiers.CanBeDestroyed;
						return fn;
					}));
				
				doodad.ADD('ABSTRACT', doodad.ADD('NOT_IMPLEMENTED', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 2,
							params: null,
							returns: 'AttributeBox',
							description: "Specifies that this method is not implemented and can be overridden.",
					}
					//! END_REPLACE()
					, function NOT_IMPLEMENTED(/*optional*/fn) {
						fn = doodad.METHOD(fn);
						fn[__Internal__.symbolModifiers] = (fn[__Internal__.symbolModifiers] || 0) | doodad.MethodModifiers.NotImplemented;
						return fn;
					})));
				
				doodad.ADD('RETURNS', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 1,
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
						fn = doodad.METHOD(fn);
						fn[__Internal__.symbolReturns] = validator;
						return fn;
					}));

				doodad.ADD('ASYNC', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 2,
							params: null,
							returns: 'AttributeBox',
							description: "Specifies that this method is async and always returns a Promise.",
					}
					//! END_REPLACE()
					, function ASYNC(/*optional*/fn) {
						fn = doodad.METHOD(fn);
						fn[__Internal__.symbolModifiers] = (fn[__Internal__.symbolModifiers] || 0) | doodad.MethodModifiers.Async;
						return fn;
					}));
				
				doodad.ADD('RENAME_OVERRIDE', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 2,
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
						let name = null;
						if (arguments.length > 1) {
							name = fn;
							fn = arguments[1];
						};
						fn = doodad.METHOD(fn);
						const val = types.unbox(fn);
						if (!name) {
							name = types.getFunctionName(val);
							if (!name) {
								throw new types.TypeError("A function name is required.");
							};
						};
						fn[__Internal__.symbolModifiers] = ((fn[__Internal__.symbolModifiers] || 0) & ~doodad.MethodModifiers.Replace) | doodad.MethodModifiers.Override;
						fn[__Internal__.symbolRenamedTo] = name;
						return fn;
					}));
				
				doodad.ADD('RENAME_REPLACE', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 2,
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
						let name = null;
						if (arguments.length > 1) {
							name = fn;
							fn = arguments[1];
						};
						fn = doodad.METHOD(fn);
						const val = types.unbox(fn);
						if (!name) {
							name = types.getFunctionName(val);
							if (!name) {
								throw new types.TypeError("A function name is required.");
							};
						};
						fn[__Internal__.symbolModifiers] = ((fn[__Internal__.symbolModifiers] || 0) & ~doodad.MethodModifiers.Override) | doodad.MethodModifiers.Replace;
						fn[__Internal__.symbolRenamedTo] = name;
						return fn;
					}));
				
				//==================================
				// Class
				//==================================
				
				__Internal__.getDefaultAttributes = function getDefaultAttributes() {
					const attributes = types.nullObject();

					// From "Doodad.Class"
					attributes[__Internal__.symbolAttributes] = doodad.PRIVATE_DEBUG(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PERSISTENT(doodad.PRE_EXTEND(doodad.TYPE(doodad.INSTANCE(doodad.ATTRIBUTE(attributes, extenders.Attribute, {isProto: null}))))))));
					attributes[__Internal__.symbolAttributesStorage] = doodad.PRIVATE_DEBUG(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PERSISTENT(doodad.PRE_EXTEND(doodad.TYPE(doodad.INSTANCE(doodad.ATTRIBUTE(null, extenders.Attribute, {isProto: null}))))))));
					attributes[__Internal__.symbolPrototype] = doodad.PRIVATE_DEBUG(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PERSISTENT(doodad.PRE_EXTEND(doodad.TYPE(doodad.INSTANCE(doodad.ATTRIBUTE(null, extenders.Attribute, {isProto: false}))))))));
					attributes[__Internal__.symbolModifiers] = doodad.PUBLIC(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PERSISTENT(doodad.PRE_EXTEND(doodad.TYPE(doodad.ATTRIBUTE(0, extenders.Attribute, {isProto: false})))))));
					attributes[__Internal__.symbolImplements] = doodad.PRIVATE_DEBUG(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PERSISTENT(doodad.PRE_EXTEND(doodad.TYPE(doodad.INSTANCE(doodad.ATTRIBUTE(null, extenders.Attribute, {isProto: false}))))))));
					attributes[__Internal__.symbolBase] = doodad.PUBLIC(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PRE_EXTEND(doodad.TYPE(doodad.INSTANCE(doodad.ATTRIBUTE(null, extenders.Attribute, {isProto: false})))))));
					attributes[__Internal__.symbolMustOverride] = doodad.PUBLIC(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PRE_EXTEND(doodad.TYPE(doodad.INSTANCE(extenders.Null))))));
					attributes[__Internal__.symbolCurrentDispatch] = doodad.PRIVATE_DEBUG(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PERSISTENT(doodad.PRE_EXTEND(doodad.TYPE(doodad.INSTANCE(extenders.Null)))))));
					attributes[__Internal__.symbolCurrentCallerIndex] = doodad.PRIVATE_DEBUG(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PERSISTENT(doodad.PRE_EXTEND(doodad.TYPE(doodad.INSTANCE(extenders.Null)))))));

					//if (__Internal__.creatingClass) {
						attributes[__Internal__.symbolIsolated] = doodad.PRIVATE_DEBUG(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PRE_EXTEND(doodad.TYPE(doodad.INSTANCE(doodad.ATTRIBUTE(null, extenders.Attribute, {isProto: false})))))));
						attributes[__Internal__.symbolIsolatedCache] = doodad.PRIVATE_DEBUG(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PRE_EXTEND(doodad.INSTANCE(doodad.ATTRIBUTE(null, extenders.Attribute, {isProto: false}))))));
					//};

					const proto = (__Internal__.creatingClass ? __Internal__.classProto : __Internal__.interfaceProto);
					root.DD_ASSERT && root.DD_ASSERT(types.isObject(proto));

					const keys = types.append(types.keys(attributes), types.symbols(attributes));
					tools.forEach(keys, function(key) {
						const attribute = attributes[key] = doodad.OPTIONS({isEnumerable: false}, attributes[key]);
						attribute[__Internal__.symbolPrototype] = proto;
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
				
				__Internal__.extendRenamed = function extendRenamed(attr, newAttr, source, sourceProto, destAttributes, forType, destAttribute, extender, proto, protoName) {
					// NOTE: The contract must be fullfilled (source: Sorella in freenode) : `compose({ a(){ return 1 }, b(){ return a() + 1 }, {a renamed to _a(){ return 3 } }).b()` should returns 2

					const sourceAttribute = types.AttributeBox(destAttribute);
					sourceAttribute[__Internal__.symbolRenamedTo] = null;
					sourceAttribute[__Internal__.symbolRenamedFrom] = attr;

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
						const result = extender.extend(newAttr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, false, proto, protoName);
						destAttribute = destAttribute.setValue(result);
					};

					return destAttribute;
				};
				
				__Internal__.preExtendAttribute = function preExtendAttribute(attr, base, baseProto, source, sourceProto, sourceAttributes, destAttributes, baseIsProto, sourceIsProto, forType, _isolated, extendedAttributes, proto, protoName) {
					const attrs = (sourceAttributes ? sourceAttributes : sourceProto);
					if (types.has(attrs, attr)) {
						let sourceAttribute = types.AttributeBox(attrs[attr]);
							
						const _interface = types.get(sourceAttribute, __Internal__.symbolInterface);
						if (_interface) {
							const uuid = _shared.getUUID(_interface);
							if (!_isolated.has(_interface) && (!uuid || !_isolated.has(uuid))) {
								throw new types.Error("Interface '~0~' not found.", [types.getTypeName(_interface) || __Internal__.ANONYMOUS]);
							};
							let data = _isolated.get(_interface);
							if (!data) {
								data = _isolated.get(uuid);
							};
							extendedAttributes = data[1];
							destAttributes = data[2];
						};
						
						let extender = null;

						let destAttribute;
						if (types.has(destAttributes, attr)) {
							destAttribute = destAttributes[attr].clone();
							extender = destAttribute[__Internal__.symbolExtender];
						} else {
							destAttribute = types.AttributeBox(undefined);
						};
						
						const sourceExtender = types.get(sourceAttribute, __Internal__.symbolExtender);
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
						
						if (types.isSymbol(attr)) {
							// <FUTURE> When transpiling "ddclass" to "class"...
								//if (scope === doodad.Scopes.Private) {
								//	throw new types.Error("Symbol attributes can't be made private.");
								//};
							// </FUTURE>
						} else {
							if (root.getOptions().debug || __options__.enforcePolicies) {
								let pos = 0;
								// <FUTURE> When transpiling "ddclass" to "class"...
									//if (scope === doodad.Scopes.Private) {
									//	// Private fields must start with a stupid vigil...
									//	if (attr[pos] !== '#') {
									//		throw new types.Error("Private attribute name must begin with '#'.");
									//	};
									//	pos++;
									//};
								// </FUTURE>
								if (!!extender.isType !== !!extender.isInstance) {
									if (attr[pos] === '$') {
										if (!extender.isType) {
											throw new types.Error("Instance attribute name must not begin with '$'.");
										};
									} else {
										if (!extender.isInstance) {
											throw new types.Error("Type attribute name must begin with '$'.");
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
									let result = types.AttributeBox(baseProto[attr]);
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
										const scope = types.get(sourceAttribute, __Internal__.symbolScope);
										if (types.isNothing(scope)) {
											// <FUTURE> When transpiling "ddclass" to "class"...
												//if (!types.isSymbol(attr) && (attr[0] === '#')) {
												//	destAttribute[__Internal__.symbolScope] = doodad.Scopes.Private;
											// </FUTURE>
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
										const result = extender.extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, proto, protoName);
										if (destAttribute) {
											destAttribute = destAttribute.setValue(result);
										} else {
											destAttribute = result; //result.clone();
										};
										const newAttr = sourceIsProto && destAttribute[__Internal__.symbolRenamedTo];
										if (newAttr) {
											destAttribute = __Internal__.extendRenamed(attr, newAttr, source, sourceProto, destAttributes, forType, destAttribute, extender, proto, protoName);
											attr = newAttr;
										};
										let overrideWith = sourceAttribute[__Internal__.symbolOverrideWith];
										if (overrideWith) {
											overrideWith = doodad.OVERRIDE(overrideWith);
											const result = extender.extend(attr, source, sourceProto, destAttributes, forType, overrideWith, destAttribute, sourceIsProto, proto, protoName);
											destAttribute = destAttribute.setValue(result);
										};
										destAttributes[attr] = destAttribute;
										if (extender.isPreserved && !types.isSymbol(attr)) {
											const presAttr = '__' + attr + '_preserved__';
											destAttribute = destAttribute.clone();
											destAttribute[__Internal__.symbolExtender] = extender.get({isPreserved: false});
											destAttributes[presAttr] = destAttribute;
										};

									} else {
										return [
											/* 0 : data   */ [/*0*/ extender], 
											/* 1 : params */ [/*0*/ attr, /*1*/ source, /*2*/ sourceProto, /*3*/ destAttributes, /*4*/ forType, /*5*/ sourceAttribute, /*6*/ destAttribute, /*7*/ sourceIsProto, /*8*/proto, /*9*/ protoName]
										];
									};
								};
							};
						};
					};
				};
				
				__Internal__.extendSource = function extendSource(base, baseAttributes, source, sourceAttributes, destAttributes, baseType, baseIsType, baseIsClass, sourceIsType, sourceIsClass, _isolated, extendedAttributes, proto, protoName) {
					let baseIsProto = false,
						baseTypeProto,
						baseInstanceProto;
					if (baseType) {
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
					
					let sourceIsProto = false,
						sourceTypeProto,
						sourceInstanceProto,
						sourceAttrs;

					if (sourceIsClass) {
						// doodad-js Class
						sourceTypeProto = sourceInstanceProto = _shared.getAttribute(source, __Internal__.symbolPrototype);
						sourceAttrs = types.append(types.keys(sourceAttributes), types.symbols(sourceAttributes));
					} else if (types.isFunction(source)) {
						// doodad-js Type / JS class
						sourceTypeProto = source;
						sourceInstanceProto = source.prototype;
						sourceAttrs = types.append(types.keys(sourceTypeProto), types.symbols(sourceTypeProto), types.keys(sourceInstanceProto), types.symbols(sourceInstanceProto));
					} else {
						// Prototype
						sourceTypeProto = sourceInstanceProto = source;
						sourceAttrs = types.append(types.keys(source), types.symbols(source));
						sourceIsProto = true;
					};
					
					// Pre-extend
					const sourceAttrsLen = sourceAttrs.length;
					const toExtend = [];
					
					for (let k = 0; k < sourceAttrsLen; k++) {
						const attr = sourceAttrs[k];

						if ((attr === '__proto__') || (attr === '_new') || (attr === '_delete') || (attr in _shared.reservedAttributes)) {
							continue;
						};

						if (baseIsType) {
							let params = __Internal__.preExtendAttribute(attr, base, baseTypeProto, source, sourceTypeProto, sourceAttributes, destAttributes, baseIsProto, sourceIsProto, true, _isolated, extendedAttributes, proto, protoName);
							if (params) {
								toExtend.push(params);
							};
						};
						
						let params = __Internal__.preExtendAttribute(attr, base, baseInstanceProto, source, sourceInstanceProto, sourceAttributes, destAttributes, baseIsProto, sourceIsProto, false, _isolated, extendedAttributes, proto, protoName);
						if (params) {
							toExtend.push(params);
						};
					};
					
					// Extend
					const toExtendLen = toExtend.length;
					for (let k = 0; k < toExtendLen; k++) {
						let data = toExtend[k];
						const params = data[1];
						data = data[0];
						const extender = data[0],
							source = params[1],
							sourceProto = params[2],
							destAttributes = params[3],
							forType = params[4],
							sourceAttribute = params[5],
							sourceIsProto = params[7],
							proto = params[8],
							protoName = params[9];
						let attr = params[0],
							destAttribute = params[6];
						const result = extender.extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, proto, protoName);
						if (destAttribute) {
							destAttribute = destAttribute.setValue(result);
						} else {
							destAttribute = result; //result.clone();
						};
						const newAttr = sourceIsProto && destAttribute[__Internal__.symbolRenamedTo];
						if (newAttr) {
							destAttribute = __Internal__.extendRenamed(attr, newAttr, source, sourceProto, destAttributes, forType, destAttribute, extender, proto, protoName);
							attr = newAttr;
						};
						let overrideWith = sourceAttribute[__Internal__.symbolOverrideWith];
						if (overrideWith) {
							overrideWith = doodad.OVERRIDE(overrideWith);
							const result = extender.extend(attr, source, sourceProto, destAttributes, forType, overrideWith, destAttribute, true, proto, protoName);
							destAttribute = destAttribute.setValue(result);
						};
						destAttributes[attr] = destAttribute;
						if (extender.isPreserved && !types.isSymbol(attr)) {
							const presAttr = '__' + attr + '_preserved__';
							destAttribute = destAttribute.clone();
							destAttribute[__Internal__.symbolExtender] = extender.get({isPreserved: false});
							destAttributes[presAttr] = destAttribute;
						};
					};
				};
				
				__Internal__.addImplements = function addImplements(_implements, attributes, _isolated, source, sourceBase, sourceImplements, sourceAttributes, sourceIsolated, baseIsType, extendedAttributes) {
					// Add new implement
					_implements.add(source);

					const uuid = _shared.getUUID(source);
					if (uuid) {
						_implements.add(uuid);
					};
					
					if (sourceBase) {
						if (types.isInterface(sourceBase) || types.isMixIn(sourceBase)) {
							_implements.add(sourceBase);

							const uuid = _shared.getUUID(sourceBase);
							if (uuid) {
								_implements.add(uuid);
							};
						};
					};
					
					if (sourceImplements) {
						//const isIsolated = types.isIsolated(source);
						// <FUTURE> for (let item of sourceImplements)
						sourceImplements.forEach(function(item) {
							if (!types.isString(item)) {
								const uuid = _shared.getUUID(item);

								if (/*(!isIsolated || types.isIsolated(item)) && */ !_implements.has(item) && (!uuid || !_implements.has(uuid))) {
									_implements.add(item);

									if (uuid) {
										_implements.add(uuid);
									};
								};
							};
						});
					};
					
					//if (sourceAttributes) {
					//	const keys = types.append(types.keys(sourceAttributes), types.symbols(sourceAttributes));
					//	tools.forEach(keys, function(key) {
					//		if (!types.has(attributes, key)) {
					//			attributes[key] = sourceAttributes[key].clone();
					//			extendedAttributes.push(key);
					//		};
					//	});
					//};
					
					if (sourceIsolated) {
						sourceIsolated.forEach(function(data, _interface) {
							if (!types.isString(_interface)) {
								const uuid = _shared.getUUID(_interface);

								if (!_isolated.has(_interface) && (!uuid || !_isolated.has(uuid))) {
									_isolated.set(_interface, data);

									if (uuid) {
										_isolated.set(uuid, data);
									};

									const impls = _shared.getAttribute(_interface, __Internal__.symbolImplements).values();

									let impl;
									
									// <FUTURE> for (let impl of impls)
									while (impl = impls.next()) {
										if (impl.done) {
											break;
										};
										impl = impl.value;

										if (!types.isString(impl)) {
											const uuid = _shared.getUUID(impl);

											if (types.isIsolated(impl) && !_isolated.has(impl) && (!uuid || !_isolated.has(uuid))) {
												_isolated.set(impl, data);

												if (uuid) {
													_isolated.set(uuid, data);
												};
											};
										};
									};
								};
							};
						});
					};
				};
				
				__Internal__.implementSource = function implementSource(base, baseAttributes, source, destAttributes, _implements, _isolated, typeStorage, instanceStorage, baseType, baseIsType, baseIsClass, baseIsBase, baseIsMixIn, baseIsInterface, proto, extendedAttributes, protoName) {
					const sourceType = types.getType(source),
						sourceIsType = sourceType && types.isType(source),
						sourceIsClass = sourceType && (types.isClass(sourceType) || types.isInterfaceClass(sourceType)),
						sourceName = (sourceType ? types.getTypeName(sourceType) : types.unbox(source.$TYPE_NAME)),
						sourceUUID = (sourceType ? _shared.getUUID(sourceType) : types.unbox(source.$TYPE_UUID));
					if (!sourceIsClass || (!_implements.has(sourceType) && (!sourceUUID || !_implements.has(sourceUUID)))) {
						if (baseType && !types.baseof(sourceType, baseType)) { // prevents cyclic extend
							if (root.getOptions().debug || __options__.enforcePolicies) {
								if (sourceType !== baseType) {
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
							
							if (types.isIsolated(sourceType) && !types.isIsolated(baseType)) {
								if (!_implements.has(sourceType) && (!sourceUUID || !_implements.has(sourceUUID))) {
									const destImplements = _implements;

									destImplements.add(source);
									
									//const sourceProto = _shared.getAttribute(source, __Internal__.symbolPrototype);
									const protoName = (sourceName ? sourceName + '_Interface' : null);
									base = doodad.Interface;
									baseType = base;
									baseIsType = true;
									baseIsClass = true;
									_implements = new types.Set();
									typeStorage = types.nullObject();
									instanceStorage = types.nullObject();
									destAttributes = __Internal__.getDefaultAttributes();
									
									extendedAttributes = [];
									const data = [/*0*/ protoName, /*1*/ extendedAttributes, /*2*/ destAttributes, /*3*/ source, /*4*/ typeStorage, /*5*/ instanceStorage, /*6 type*/ null, /*7*/ base, /*8 _isolated*/ null, /*9*/ _implements, /*10 sourceProto*/ null, /*11 modifiers*/ 0, /*12*/ sourceUUID];

									_isolated.set(source, data);

									const uuid = _shared.getUUID(source);
									if (uuid) {
										_isolated.set(uuid, data);
									};

									const impls = _shared.getAttribute(source, __Internal__.symbolImplements).values();

									let impl;
									while (impl = impls.next()) {
										if (impl.done) {
											break;
										};
										impl = impl.value;
										if (types.isIsolated(impl)) {
											const uuid = _shared.getUUID(impl);

											if (!destImplements.has(impl) && (!uuid || !destImplements.has(uuid))) {
												destImplements.add(impl);

												if (uuid) {
													destImplements.add(uuid);
												};
											};

											_isolated.set(impl, data);

											if (uuid) {
												_isolated.set(uuid, data);
											};
										};
									};
									
									const sourceData = _shared.getAttributes(base, [__Internal__.symbolBase, __Internal__.symbolImplements, __Internal__.symbolAttributes, __Internal__.symbolIsolated]);
									baseAttributes = sourceData[__Internal__.symbolAttributes];
									__Internal__.addImplements(_implements, destAttributes, _isolated, base, sourceData[__Internal__.symbolBase], sourceData[__Internal__.symbolImplements], baseAttributes, sourceData[__Internal__.symbolIsolated], baseIsType, extendedAttributes);

									__Internal__.extendSource(base, baseAttributes, base, baseAttributes, destAttributes, baseType, baseIsType, baseIsClass, sourceIsType, sourceIsClass, _isolated, extendedAttributes, proto, protoName);
								};
							};
							
							let sourceAttributes = undefined;
							if (sourceIsClass) {
								const sourceData = _shared.getAttributes(source, [__Internal__.symbolBase, __Internal__.symbolImplements, __Internal__.symbolAttributes, __Internal__.symbolIsolated]);
								sourceAttributes = sourceData[__Internal__.symbolAttributes];
								__Internal__.addImplements(_implements, destAttributes, _isolated, source, sourceData[__Internal__.symbolBase], sourceData[__Internal__.symbolImplements], sourceAttributes, sourceData[__Internal__.symbolIsolated], baseIsType, extendedAttributes);
							};
							
							__Internal__.extendSource(base, baseAttributes, source, sourceAttributes, destAttributes, baseType, baseIsType, baseIsClass, sourceIsType, sourceIsClass, _isolated, extendedAttributes, proto, protoName);
						};
					};
				};

				__Internal__.initializeAttributes = function initializeAttributes(obj, attributes, typeStorage, instanceStorage, forType, isProto, /*optional*/values, /*optional*/extendedAttributes) {
					const storage = (forType ? typeStorage : instanceStorage);
					const attrs = (extendedAttributes ? types.unique(extendedAttributes) : types.append(types.keys(attributes), types.symbols(attributes)))
					for (let i = attrs.length - 1; i >= 0; i--) {
						const attr = attrs[i],
							attribute = attributes[attr],
							extender = attribute[__Internal__.symbolExtender];
						
						if (extender) {
							if ((forType && extender.isType) || (!forType && extender.isInstance)) {
								if (extender.preExtend) {
									const value = types.get(values, attr, types.unbox(attribute));
									let cancelInit = extender.preInit && extender.preInit(attr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value, isProto);
									if (!cancelInit) {
										extender.init && extender.init(attr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value, isProto);
										if (extender.isPreserved && !types.isSymbol(attr)) {
											const presAttr = '__' + attr + '_preserved__';
											cancelInit = extender.preInit && extender.preInit(presAttr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value, isProto);
											if (!cancelInit) {
												extender.init && extender.init(presAttr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value, isProto);
											};
										};
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

					for (let i = attrs.length - 1; i >= 0; i--) {
						const attr = attrs[i];
						
						if (attr) {
							const attribute = attributes[attr],
								extender = attribute[__Internal__.symbolExtender];
							
							if (extender) {
								// NOTE: "if (!extender.preExtend && ((forType && extender.isType) || (!forType && extender.isInstance)) {...}" --> Done with "attrs.splice()".
								const value = types.get(values, attr, types.unbox(attribute));
								let cancelInit = extender.preInit && extender.preInit(attr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value, isProto);
								if (!cancelInit) {
									extender.init && extender.init(attr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value, isProto);
									if (extender.isPreserved && !types.isSymbol(attr)) {
										const presAttr = '__' + attr + '_preserved__';
										cancelInit = extender.preInit && extender.preInit(presAttr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value, isProto);
										if (!cancelInit) {
											extender.init && extender.init(presAttr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value, isProto);
										};
									};
								};
							};
						};
					};
				};
				
				__Internal__.postExtend = function postExtend(attributes, extendedAttributes) {
					extendedAttributes = types.unique(extendedAttributes);

					for (let k = 0; k < extendedAttributes.length; k++) {
						const attr = extendedAttributes[k];

						let attribute = attributes[attr];
						
						const extender = attribute[__Internal__.symbolExtender];
						const newAttribute = extender.postExtend && extender.postExtend(attr, attributes, attribute) || attribute;

						if (newAttribute !== attribute) {
							attributes[attr] = attribute = newAttribute;
						};
						
						types.freezeObject(attribute);
					};
				};
				
				__Internal__.createType = function createType(base, baseIsType, proto, protoName, protoUUID, typeStorage, instanceStorage, destAttributes, extendedAttributes, _isolated, _implements, modifiers) {
					// Post-Extend
					__Internal__.postExtend(destAttributes, extendedAttributes);
					
					if (baseIsType) {
						const typeProto = {},
							instanceProto = {};
						
						typeProto.$TYPE_NAME = types.READ_ONLY(protoName);
						typeProto.$TYPE_UUID = types.READ_ONLY(protoUUID);

						if (types.has(proto, '_new')) {
							instanceProto._new = typeProto._new = proto._new;
						};

						if (types.has(proto, '_delete')) {
							instanceProto._delete = typeProto._delete = proto._delete;
						};
					
						const type = base.$inherit(
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
						} else if (__Internal__.creatingInterfaceClass) {
							doodad.Interface = type;
							__Internal__.creatingInterfaceClass = false;
						};
					
						root.DD_ASSERT && root.DD_ASSERT(types.baseof(types.Type, type));
					
						let values;

						// Set values (NOTE: will be initialized in "_new")
						_shared.setAttribute(type, __Internal__.symbolAttributesStorage, typeStorage, {configurable: true});
						
						values = {};
						values[__Internal__.symbolAttributes] = destAttributes;
						values[__Internal__.symbolBase] = base;
						values[__Internal__.symbolIsolated] = _isolated;
						values[__Internal__.symbolImplements] = _implements;
						values[__Internal__.symbolPrototype] = proto;
						values[__Internal__.symbolModifiers] = modifiers;
						_shared.setAttributes(type, values, {configurable: true});

						_shared.setAttribute(type.prototype, __Internal__.symbolAttributesStorage, instanceStorage, {configurable: true});
						
						values = {};
						values[__Internal__.symbolAttributes] = types.clone(destAttributes);
						values[__Internal__.symbolBase] = base;
						values[__Internal__.symbolIsolated] = types.clone(_isolated);
						values[__Internal__.symbolImplements] = types.clone(_implements);
						values[__Internal__.symbolPrototype] = proto;
						_shared.setAttributes(type.prototype, values, {configurable: true});

						return type;

					} else {
						__Internal__.initializeAttributes(base, destAttributes, typeStorage, instanceStorage, false, null, null, extendedAttributes);

						if (base._implements(mixIns.Creatable)) {
							_shared.setAttribute(base, __Internal__.symbolDestroyed, null);
						};

						return base;
					};
				};
				
				__Internal__.$extend = function $extend(/*paramarray*/) {
					let base = ((this === global) ? undefined : this),
						baseType = types.getType(base);
				
					root.DD_ASSERT && root.DD_ASSERT(!base || (baseType === types.Type) || types.baseof(types.Type, baseType), "Base must be a type.");

					if (!base) {
						base = types.Type;
					};
					
					const index = tools.findLastItem(arguments, types.isJsObject),
						proto = (index !== null) && arguments[index] || {};
					
					let protoName = '', 
						protoUUID = '';

					if (proto) {
						protoName = types.unbox(proto.$TYPE_NAME) || '';
						protoUUID = types.unbox(proto.$TYPE_UUID) || '';
					};

					//if (!types.isStringAndNotEmpty(protoName)) {
					//	throw new types.Error("Prototype has no name. You must define the '$TYPE_NAME' attribute.");
					//};

					baseType = types.getType(base);

					const baseIsType = baseType && types.isType(base),
						baseIsClass = baseType && (types.isClass(baseType) || types.isInterfaceClass(baseType)),
						baseIsBase = baseIsClass && types.isBase(baseType),
						baseIsMixIn = baseIsClass && types.isMixIn(baseType),
						baseIsInterface = baseIsClass && types.isInterface(baseType);
						
					let baseTypeAttributes = null,
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

						const baseData = _shared.getAttributes(baseType, [__Internal__.symbolAttributes, __Internal__.symbolBase, __Internal__.symbolImplements, __Internal__.symbolIsolated, __Internal__.symbolAttributesStorage]);
						baseTypeAttributes = baseData[__Internal__.symbolAttributes];
						baseTypeBase = baseData[__Internal__.symbolBase];
						baseTypeImplements = baseData[__Internal__.symbolImplements];
						baseTypeIsolated = baseData[__Internal__.symbolIsolated];
						baseTypeStorage = baseData[__Internal__.symbolAttributesStorage];
					};
					
					let _implements = null,
						_isolated = null,
						destAttributes = null,
						modifiers = 0,
						typeStorage,
						instanceStorage;

					const sources = types.toArray(arguments);

					if (baseIsType) { // Doodad Class / Doodad Type
						_implements = new types.Set();
						_isolated = new types.Map();
						destAttributes = __Internal__.getDefaultAttributes();
						typeStorage = types.nullObject();
						instanceStorage = types.nullObject();
						modifiers = (proto && types.unbox(proto[__Internal__.symbolModifiers]) || 0) | (baseModifiers & doodad.preservedClassModifiers);
					} else if (baseIsClass) { // Doodad Class Object
						const baseData = _shared.getAttributes(base, [__Internal__.symbolAttributes, __Internal__.symbolImplements, __Internal__.symbolIsolated, __Internal__.symbolAttributesStorage]);
						destAttributes = baseData[__Internal__.symbolAttributes];
						_implements = baseData[__Internal__.symbolImplements];
						_isolated = baseData[__Internal__.symbolIsolated];
						instanceStorage = baseData[__Internal__.symbolAttributesStorage];
						typeStorage = baseTypeStorage;
						baseTypeAttributes = destAttributes;

						if (base._implements(mixIns.Creatable)) {
							const injected = {
								create: doodad.REPLACE(__Internal__.creatablePrototype.create),
							};
							injected.create[__Internal__.symbolPrototype] = __Internal__.creatablePrototype;
							sources.unshift(injected);
						};
					} else {
						typeStorage = types.nullObject();
						instanceStorage = types.nullObject();
					}

					const extendedAttributes = [];

					// Implement base
					if (baseIsClass && baseIsType) { // Doodad Class
						__Internal__.implementSource(base, baseTypeAttributes, base, destAttributes, _implements, _isolated, typeStorage, instanceStorage, baseType, baseIsType, baseIsClass, baseIsBase, baseIsMixIn, baseIsInterface, proto, extendedAttributes, protoName);
					};

					// Implement sources
					const sourcesLen = sources.length;
					for (let i = 0; i < sourcesLen; i++) {
						const source = sources[i];
						root.DD_ASSERT && root.DD_ASSERT(types.getType(source) || types.isJsObject(source));
						__Internal__.implementSource(base, baseTypeAttributes, source, destAttributes, _implements, _isolated, typeStorage, instanceStorage, baseType, baseIsType, baseIsClass, baseIsBase, baseIsMixIn, baseIsInterface, proto, extendedAttributes, protoName);
					};

					// Create and return extended version of "base"
					const type = __Internal__.createType(base, baseIsType, proto, protoName, protoUUID, typeStorage, instanceStorage, destAttributes, extendedAttributes, _isolated, _implements, modifiers);

					return type;
				};

				__Internal__._delete = types.SUPER(
						function _delete() {
							const cache = this[__Internal__.symbolIsolatedCache];
							if (cache) {
								cache.forEach(function destroyEachInterface(_interface) {
									types.DESTROY(_interface);
								});
							};

							const forType = types.isType(this),
								cls = types.getType(this),
								attributes = this[__Internal__.symbolAttributes],
								storage = this[__Internal__.symbolAttributesStorage],
								attrs = types.append(types.keys(attributes), types.symbols(attributes)),
								sealed = types.isSealedClass(cls);
								
							for (let i = attrs.length - 1; i >= 0; i--) {
								const attr = attrs[i],
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
							
							for (let i = attrs.length - 1; i >= 0; i--) {
								const attr = attrs[i],
									attribute = attributes[attr],
									extender = attribute[__Internal__.symbolExtender];
									
								// NOTE: "if (!extender.isPersistent && extender.preExtend) {...}" --> Done with "attrs.splice()".
								if ((extender.isType && forType) || (extender.isInstance && !forType)) {
									extender.remove && extender.remove(attr, this, storage, forType, attribute);
								};
							};
							
							this._super();
						}
					);

				__Internal__._superFrom = root.DD_DOC(
						//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
									author: "Claude Petit",
									revision: 3,
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
						function superFrom(cls) {
							const dispatch = this && this[__Internal__.symbolCurrentDispatch];

							if (!dispatch) {
								throw new types.TypeError("Invalid call to '_superFrom'.");
							};
							
							if (!types.isType(cls)) {
								throw new types.TypeError("The 'cls' argument must be a type.");
							};
							
							if (!types._implements(this, cls)) {
								throw new types.TypeError("Type '~0~' is not implemented by '~1~'.", [types.getTypeName(cls) || __Internal__.ANONYMOUS, types.getTypeName(this) || __Internal__.ANONYMOUS]);
							};
							
							let proto = cls;
							if (!types.isType(this)) {
								proto = cls.prototype;
							};
							
							const name = dispatch[_shared.NameSymbol];

							if (!types.isMethod(proto, name)) {
								throw new types.TypeError("Method '~0~' doesn't exist or is not implemented in type '~1~'.", [name, types.getTypeName(cls) || __Internal__.ANONYMOUS]);
							};

							const newDispatch = _shared.getAttribute(proto, name),
								notReentrantMap = __Internal__.notReentrantMap.get(this),
								self = this; // NOTE: That prevents to do "return _superFrom.bind(this)"

							return function _superFrom(/*paramarray*/) {
								// NOTE: We now override super only when "_superFrom" is called.
								// NOTE: Will throw if "_superFrom" called from the outside, that's what we expect.
								self.overrideSuper();

								const oldCalled = notReentrantMap && notReentrantMap.get(name);
								if (oldCalled) {
									notReentrantMap.set(name, false);
								};

								try {
									return newDispatch.apply(self, arguments);

								} catch(ex) {
									throw ex;

								} finally {
									if (oldCalled) {
										notReentrantMap.set(name, true);
									};

								};
							};
						}))))))));
				
				__Internal__.overrideSuper = root.DD_DOC(
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
						}))))));
/* TODO: Test and debug, don't forget ASYNC functions
				__Internal__.superAsync = root.DD_DOC(
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
							var _super = this._super;

							if (_super) {
								var obj = this,
									type = types.getType(obj),
									forType = types.isType(obj);

								_super[__Internal__.symbolCalled] = true;
								
								var dispatch = this[__Internal__.symbolCurrentDispatch],
									index = this[__Internal__.symbolCurrentCallerIndex],
									modifiers = dispatch[__Internal__.symbolModifiers];
								
								var _superApply = _super.apply.bind(_super);

								return function superAsync(/*paramarray* /) {
									if (this._implements(mixIns.Creatable)) {
										var destroyed = _shared.getAttribute(this, __Internal__.symbolDestroyed);
										var attr = dispatch[_shared.NameSymbol];
										if ((destroyed === null) && !forType && (attr !== 'create')) {
											throw new types.NotAvailable("Method '~0~' of '~1~' is unavailable because object has not been created.", [attr, types.getTypeName(type) || __Internal__.ANONYMOUS]);
										};
										if ((destroyed === true) && !(modifiers & doodad.MethodModifiers.CanBeDestroyed)) {
											throw new types.NotAvailable("Method '~0~' of '~1~' is unavailable because object has been destroyed.", [attr, types.getTypeName(type) || __Internal__.ANONYMOUS]);
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
										
										return _superApply(obj, arguments);
										
									} finally {
										_shared.setAttribute(obj, '_super', oldSuper);
										_shared.setAttributes(obj, oldDispatch);
									};
								};
							} else {
								return function() {};
							};
						}))))));
*/
				__Internal__.classProto = {
					$TYPE_NAME: "Class",
					$TYPE_UUID:  '' /*! INJECT('+' + TO_SOURCE(UUID('Class')), true) */,
					
					_new: types.SUPER(
						function _new() {
							const cls = types.getType(this),
								forType = types.isType(this);

							this._super();

							// Validate type
							if (!cls) {
								throw new types.Error("Invalid class.");
							};

							const modifiers = (types.get(cls, __Internal__.symbolModifiers) || 0);
							
							// Must not be a base class
							const isBase = (modifiers & (doodad.ClassModifiers.Base | doodad.ClassModifiers.MixIn | doodad.ClassModifiers.Interface));
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
							const typeStorage = cls[__Internal__.symbolAttributesStorage];
							const instanceStorage = cls.prototype[__Internal__.symbolAttributesStorage];

							let values,
								attributes;

							if (forType) {
								attributes = this[__Internal__.symbolAttributes];
								values = types.nullObject();
								values[__Internal__.symbolAttributes] = attributes;
								values[__Internal__.symbolModifiers] = modifiers;
								values[__Internal__.symbolImplements] = this[__Internal__.symbolImplements];
								values[__Internal__.symbolIsolated] = this[__Internal__.symbolIsolated];
								values[__Internal__.symbolPrototype] = this[__Internal__.symbolPrototype];
								values[__Internal__.symbolBase] = this[__Internal__.symbolBase];
								__Internal__.initializeAttributes(this, attributes, typeStorage, instanceStorage, true, null, values);

								attributes = this.prototype[__Internal__.symbolAttributes]; // NOTE: already cloned
								values = types.nullObject();
								values[__Internal__.symbolAttributes] = attributes; // NOTE: already cloned
								values[__Internal__.symbolImplements] = this.prototype[__Internal__.symbolImplements]; // NOTE: already cloned
								values[__Internal__.symbolIsolated] = this.prototype[__Internal__.symbolIsolated]; // NOTE: already cloned
								values[__Internal__.symbolPrototype] = this.prototype[__Internal__.symbolPrototype];
								values[__Internal__.symbolBase] = this.prototype[__Internal__.symbolBase];
								__Internal__.initializeAttributes(this.prototype, attributes, typeStorage, instanceStorage, false, true, values);
							} else {
								attributes = types.clone(cls.prototype[__Internal__.symbolAttributes]);
								values = types.nullObject();
								values[__Internal__.symbolAttributes] = attributes;
								values[__Internal__.symbolImplements] = types.clone(cls.prototype[__Internal__.symbolImplements]);
								values[__Internal__.symbolIsolated] = types.clone(cls.prototype[__Internal__.symbolIsolated]);
								values[__Internal__.symbolPrototype] = cls.prototype[__Internal__.symbolPrototype];
								values[__Internal__.symbolBase] = cls.prototype[__Internal__.symbolBase];
								__Internal__.initializeAttributes(this, attributes, typeStorage, types.clone(instanceStorage), false, false, values);
							};
	
							// Call constructor
							if (!isBase) {
								if (this._implements(mixIns.Creatable)) {
									if (forType) {
										this.$create.apply(this, _shared.Natives.arraySliceCall(arguments, 3));
									} else {
										this.create.apply(this, arguments);
									};
								};
							};
							
							// Seal object if it is of a sealed class
							return (!forType && types.isSealedClass(cls) ? types.sealObject(this) : this);
						}),
					
					_delete: __Internal__._delete,
					
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
							const cls = types.getType(this);
							if (!cls) {
								return null;
							};
							if (!types.isInterface(type) && !types.isMixIn(type)) {
								return null;
							};

							let cache = this[__Internal__.symbolIsolatedCache];
							if (!cache) {
								cache = _shared.setAttribute(this, __Internal__.symbolIsolatedCache, new types.Map());
							}

							if (cache.has(type)) {
								return cache.get(type);
							};

							const uuid = _shared.getUUID(type);

							if (uuid && cache.has(uuid)) {
								return cache.get(uuid);
							};

							const _isolated = this[__Internal__.symbolIsolated];

							let data = _isolated.get(type);
							if (!data) {
								data = _isolated.get(uuid);
							};

							if (!data) {
								return null;
							};

							let _interface = data[6];

							if (!_interface) {
								const protoName = data[0],
									extendedAttributes = data[1],
									attributes = data[2],
									typeStorage = data[4],
									instanceStorage = data[5],
									base = data[7],
									baseIsType = types.isType(base),
									_isolated = data[8],
									_implements = data[9],
									proto = data[10],
									modifiers = data[11],
									protoUUID = null; //data[12];

								_interface = __Internal__.createType(base, baseIsType, proto, protoName, protoUUID, typeStorage, instanceStorage, attributes, extendedAttributes, _isolated, _implements, modifiers);

								_interface = types.INIT(_interface, [cls]);

								if (!types.baseof(doodad.Interface, _interface)) {
									return null;
								};

								data[6] = _interface;
							};

							const obj = new _interface(this);

							const _implements = _shared.getAttribute(_interface, __Internal__.symbolImplements);

							_implements.forEach(function(impl) {
								if (!types.isString(impl)) {
									const uuid = _shared.getUUID(impl);

									if (types.isIsolated(impl) && !cache.has(impl) && (!uuid || !cache.has(uuid))) {
										cache.set(impl, obj);

										if (uuid) {
											cache.set(uuid, obj);
										};
									};
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
								const attributes = this[__Internal__.symbolAttributes],
									attribute = attributes[attr],
									extender = attribute[__Internal__.symbolExtender];
								if (extender && extender.isPreserved) {
									const preservedAttr = '__' + attr + '_preserved__';
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
								const attributes = this[__Internal__.symbolAttributes],
									attribute = attributes[attr],
									extender = attribute[__Internal__.symbolExtender];
								if (extender && extender.isPreserved) {
									const preservedAttr = '__' + attr + '_preserved__';
									_shared.setAttribute(obj, attr, this[preservedAttr]);
									return true;
								};
							};
							return false;
						}))))),

					overrideSuper: __Internal__.overrideSuper,
					_superFrom: __Internal__._superFrom,
//TODO: Test and debug					superAsync: __Internal__.superAsync,
				
					_implements: root.DD_DOC(
						//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
									author: "Claude Petit",
									revision: 4,
									params: {
										cls: {
											type: 'arrayof(Class),Class,arrayof(Object),Object',
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
							const impls = this[__Internal__.symbolImplements];
							if (types.isArray(cls)) {
								const clsLen = cls.length;
								for (let i = 0; i < clsLen; i++) {
									if (types.has(cls, i)) {
										const cl = types.getType(cls[i]);
										if (!cl) {
											continue;
										};
										if (!types.isLike(cl, __Internal__.CLASS_OR_INTERFACE)) {
											continue;
										};
										if (impls.has(cl)) {
											return true;
										};
										const uuid = _shared.getUUID(cl);
										if (uuid && impls.has(uuid)) {
											return true;
										};
									};
								};
								return false;
							} else {
								const cl = types.getType(cls);
								if (!cl) {
									return false;
								};
								if (!types.isLike(cl, __Internal__.CLASS_OR_INTERFACE)) {
									return false;
								};
								if (impls.has(cl)) {
									return true;
								};
								const uuid = _shared.getUUID(cl);
								if (uuid && impls.has(uuid)) {
									return true;
								};
								return false;
							};
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
							const isType = types.isType(this),
								attrs = this[__Internal__.symbolAttributes];
							if (!(name in attrs)) {
								return false;
							};
							const attr = attrs[name],
								extender = attr[__Internal__.symbolExtender];
							if (!types.isLike(extender, extenders.Method)) {
								return false;
							};
							if ((isType && !extender.isType) || (!isType && !extender.isInstance)) {
								return false;
							};
							const method = _shared.getAttribute(this, name);
							return !((method[__Internal__.symbolModifiers] || 0) & doodad.MethodModifiers.NotImplemented);
						}))))),

				};
				
				//! IF_SET("serverSide")
				(function() {
					//! BEGIN_REMOVE()
					if (nodejs) {
					//! END_REMOVE()
						const customSymbol = nodejs.getCustomInspectSymbol();
						if (customSymbol) {
							__Internal__.classProto[customSymbol] = doodad.PUBLIC(doodad.TYPE(doodad.INSTANCE(doodad.BIND(doodad.JS_METHOD(function inspect(depth, ctx) {
								const isType = types.isType(this),
									attrs = this[__Internal__.symbolAttributes],
									keys = types.append(types.keys(attrs), types.symbols(attrs)),
									result = {};
								for (let i = 0; i < keys.length; i++) {
									const key = keys[i];
									if (key !== customSymbol) {
										const attr = attrs[key],
											extender = attr[__Internal__.symbolExtender];
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
					//! BEGIN_REMOVE()
					};
					//! END_REMOVE()
				})();
				//! END_IF()
				
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
					, doodad.REGISTER(doodad.BASE(__Internal__.$extend.call(types.Type, __Internal__.classProto))));
				
				//==================================
				// Interface
				//==================================

				__Internal__.interfaceProto = {
					$TYPE_NAME: "Interface",
					$TYPE_UUID:  '' /*! INJECT('+' + TO_SOURCE(UUID('Interface')), true) */,
						
					_new: types.SUPER(
						function _new(host) {
							// TODO: Merge _new with Class's _new

							const cls = types.getType(this),
								forType = types.isType(this);

							this._super();

							if (!forType) {
								root.DD_ASSERT && root.DD_ASSERT((types.isType(this) && types.isClass(host)) || (types.isObject(this) && types._instanceof(host, doodad.Class)), "Invalid host.");
							};

							// Validate type
							if (!cls) {
								throw new types.Error("Invalid class.");
							};

							// Initialize attributes
							const typeStorage = cls[__Internal__.symbolAttributesStorage],
								instanceStorage = cls.prototype[__Internal__.symbolAttributesStorage];

							let values,
								attributes;

							if (forType) {
								attributes = this[__Internal__.symbolAttributes];
								values = types.nullObject();
								values[__Internal__.symbolAttributes] = attributes;
								values[__Internal__.symbolModifiers] = (types.get(cls, __Internal__.symbolModifiers) || 0);
								values[__Internal__.symbolImplements] = this[__Internal__.symbolImplements];
								values[__Internal__.symbolIsolated] = this[__Internal__.symbolIsolated];
								values[__Internal__.symbolPrototype] = this[__Internal__.symbolPrototype];
								values[__Internal__.symbolBase] = this[__Internal__.symbolBase];
								__Internal__.initializeAttributes(this, attributes, typeStorage, instanceStorage, true, null, values);

								attributes = this.prototype[__Internal__.symbolAttributes];
								values = types.nullObject();
								values[__Internal__.symbolAttributes] = attributes; // NOTE: already cloned
								values[__Internal__.symbolImplements] = this.prototype[__Internal__.symbolImplements]; // NOTE: already cloned
								values[__Internal__.symbolIsolated] = this.prototype[__Internal__.symbolIsolated]; // NOTE: already cloned
								values[__Internal__.symbolPrototype] = this.prototype[__Internal__.symbolPrototype];
								values[__Internal__.symbolBase] = this.prototype[__Internal__.symbolBase];
								__Internal__.initializeAttributes(this.prototype, attributes, typeStorage, instanceStorage, false, true, values);
							} else {
								attributes = types.clone(cls.prototype[__Internal__.symbolAttributes]);
								values = types.nullObject();
								values[__Internal__.symbolAttributes] = attributes;
								values[__Internal__.symbolImplements] = types.clone(cls.prototype[__Internal__.symbolImplements]);
								values[__Internal__.symbolIsolated] = types.clone(cls.prototype[__Internal__.symbolIsolated]);
								values[__Internal__.symbolPrototype] = cls.prototype[__Internal__.symbolPrototype];
								values[__Internal__.symbolBase] = cls.prototype[__Internal__.symbolBase];
								values[__Internal__.symbolHost] = host;
								__Internal__.initializeAttributes(this, attributes, typeStorage, types.clone(instanceStorage), false, false, values);
							};
	
							return this;
						}),

					_delete: __Internal__._delete,

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
							return '[interface ' + (types.getTypeName(this) || __Internal__.ANONYMOUS) + ']';
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
								returns: 'Interface',
								description: "Returns a new extended interface class.",
						}
						//! END_REPLACE()
						, doodad.PUBLIC(doodad.READ_ONLY(doodad.TYPE(doodad.JS_METHOD( __Internal__.$extend ))))),
					
					overrideSuper: __Internal__.overrideSuper,
					_superFrom: __Internal__._superFrom,
					superAsync: __Internal__.superAsync,
				};
				
				// <FUTURE> Use syntax for variable key in object declaration
				__Internal__.interfaceProto[__Internal__.symbolHost] = doodad.PUBLIC(doodad.READ_ONLY(doodad.TYPE(doodad.INSTANCE(doodad.ATTRIBUTE(null, extenders.Attribute, {isProto: false})))));
				
				__Internal__.creatingInterfaceClass = true;
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
					, doodad.REGISTER(doodad.BASE(__Internal__.$extend.call(types.Type, __Internal__.interfaceProto))));
				

				__Internal__.CLASS_OR_INTERFACE = [doodad.Class, doodad.Interface];


				//==================================
				// Events
				//==================================

				doodad.REGISTER(root.DD_DOC(
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
					, types.Type.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: "Event",
						$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('Event')), true) */,
					},
					/*instanceProto*/
					{
						data: types.READ_ONLY(null),
						
						// dynamic
						obj: null,
						name: null,
						handlerData: null,

						prevent: false,
						
						_new: types.SUPER(function _new(/*optional*/data) {
							//root.DD_ASSERT && root.DD_ASSERT(types.isNothing(data) || types.isObject(data), "Invalid data.");

							this._super();
							
							if (!types.isType(this)) {
								_shared.setAttribute(this, 'data', data || {});
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
							, function preventDefault() {
								this.prevent = true;
							}),
					})));

				doodad.REGISTER(root.DD_DOC(
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
						$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('CancelEvent')), true) */,
					})));

				doodad.REGISTER(root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 2,
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
							description: "Error event object.",
					}
					//! END_REPLACE()
					, doodad.Event.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'ErrorEvent',
						$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('ErrorEvent')), true) */,
					},
					/*instanceProto*/
					{
						error: types.READ_ONLY(null),
						
						_new: types.SUPER(function _new(/*optional*/error, /*optional*/data) {
							this._super(data);

							if (!types.isType(this)) {
								root.DD_ASSERT && root.DD_ASSERT(types.isNothing(error) || types.isError(error), "Invalid error.");
								
								_shared.setAttribute(this, 'error', error);
							};
						}),

						preventDefault: types.SUPER(function preventDefault() {
							this._super();

							this.error.trapped = true;
						}),
					})));

					
				__Internal__.eventHandlerInstanceProto = {
						stackSize: types.NOT_CONFIGURABLE(types.WRITABLE(10)),
						
						_new: types.SUPER(function _new(obj, extender) {
							this._super();
							
							const values = {};
							values[__Internal__.symbolStack] = [];
							values[__Internal__.symbolObject] = obj;
							values[__Internal__.symbolExtender] = extender;
							_shared.setAttributes(this, values);
						}),

						apply: types.NOT_CONFIGURABLE(types.READ_ONLY(_shared.Natives.functionApply)),
						call: types.NOT_CONFIGURABLE(types.READ_ONLY(_shared.Natives.functionCall)),
						bind: types.NOT_CONFIGURABLE(types.READ_ONLY(_shared.Natives.functionBind)),

						getCount: function getCount() {
							const stack = this[__Internal__.symbolStack];
							return tools.reduce(stack, function(result, data) {
								if (data[4] > 0) {
									result++;
								};
								return result;
							}, 0)
						},

						attach: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 4,
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

								if (types.isNothing(count)) {
									count = Infinity;
								};

								if (!types.isNothing(datas)) {
									types.freezeObject(datas);
								};

								if (root.DD_ASSERT) {
									root.DD_ASSERT(types.isNothing(obj) || types.isObject(obj), "Invalid object.");
									root.DD_ASSERT(types.isFunction(fn), "Invalid function.");
									root.DD_ASSERT(types.isInteger(priority), "Invalid priority.");
									root.DD_ASSERT(types.isNothing(datas) || types.isArray(datas), "Invalid datas.");
									root.DD_ASSERT(types.isInfinite(count) || types.isInteger(count), "Invalid count.");
								};
								
								const stack = this[__Internal__.symbolStack];

								const indexes = tools.findItems(stack, function(ev) {
									const evData = ev[3];
									return ((ev[0] || null) === (obj || null)) && (ev[1] === fn) && tools.every(datas, function(data, key) {
										return types.hasIndex(evData, key) && (evData[key] === data);
									});
								});
								
								const indexesLen = indexes.length;
								if (indexesLen) {
									let clearSorted = false;
									for (let i = 0; i < indexesLen; i++) {
										const ev = stack[indexes[i]];
										if (ev[2] !== priority) {
											ev[2] = priority;
											clearSorted = true;
										};
									};
									if (clearSorted) {
										this[__Internal__.symbolSorted] = false;
										this[__Internal__.symbolClonedStack] = null;
									};
									return false;
								} else if (stack.length < this.stackSize) {
									let cb = fn;
									if (obj) {
										cb = doodad.Callback(obj, cb, true);
									};
									stack.push([/*0*/ obj, /*1*/ fn, /*2*/ priority, /*3*/ datas, /*4*/ count, /*5*/ cb]);
									this[__Internal__.symbolSorted] = false;
									this[__Internal__.symbolClonedStack] = null;
									const eventObj = this[__Internal__.symbolObject];
									const ev = new doodad.Event({event: this[_shared.NameSymbol], obj: obj, handler: fn, datas: datas});
									//if (types.isEntrant(eventObj, 'onEventAttached')) {
										_shared.invoke(eventObj, eventObj.onEventAttached, [ev], _shared.SECRET);
									//};
									return true;
								} else {
									throw new types.Error("Stack size limit reached for event method '~0~'. This can be due to a leak, or increase its 'stackSize' attribute.", [this[_shared.NameSymbol]]);
								};
							}),

						detach: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 3,
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
							, function detach(/*optional*/obj, /*optional*/fn, /*optional*/datas) {
								if (root.DD_ASSERT) {
									root.DD_ASSERT(types.isNothing(obj) || types.isObject(obj), "Invalid object.");
									root.DD_ASSERT(types.isNothing(fn) || types.isFunction(fn), "Invalid function.");
									root.DD_ASSERT(types.isNothing(datas) || types.isArray(datas), "Invalid datas.");
								};

								const stack = this[__Internal__.symbolStack];

								const evs = types.popItems(stack, function(ev) {
									const evData = ev[3];
									return (!obj || (ev[0] === obj)) && (!fn || (ev[1] === fn)) && tools.every(datas, function(value, key) {
										return types.hasIndex(evData, key) && (evData[key] === value);
									});
								});

								const evsLen = evs.length;
								if (evsLen) {
									this[__Internal__.symbolSorted] = false;
									this[__Internal__.symbolClonedStack] = null;

									const eventObj = this[__Internal__.symbolObject];

									if (!_shared.DESTROYED(eventObj)) {
										//if (types.isEntrant(eventObj, 'onEventDetached')) {
											const eventName = this[_shared.NameSymbol],
												onEventDetached = eventObj.onEventDetached;

											for (let i = 0; i < evsLen; i++) {
												const data = evs[i];
												const ev = new doodad.Event({event: eventName, obj: data[0], handler: data[1], datas: data[3]});
												_shared.invoke(eventObj, onEventDetached, [ev], _shared.SECRET);
											};
										//};
									};
								};

								return evs;
							}),

						clear: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 2,
									params: null,
									returns: 'undefined',
									description: "Detach every callback function from an event.",
							}
							//! END_REPLACE()
							, function clear() {
								this.detach();
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
							, function promise(/*optional*/callback, /*optional*/thisObj) {
								// NOTE: Don't forget that a promise resolves only once, so ".promise" is like ".attachOnce".
								const Promise = types.getPromise();
								if (callback) {
									callback = _shared.PromiseCallback(thisObj, callback);
								};
								return Promise.create(function eventPromise(resolve, reject) {
										const self = this,
											obj = this[__Internal__.symbolObject],
											errorEvent = obj.__ERROR_EVENT,
											destroy = types.isImplemented(obj, 'onDestroy');

										let successFn = null,
											errorFn = null,
											destroyFn = null,
											detachedFn = null;

										const cleanup = function cleanup() {
											detachedFn && obj.onEventDetached.detach(null, detachedFn); // Must be first to be detached
											self.detach(null, successFn);
											errorEvent && obj[errorEvent].detach(null, errorFn);
											destroy && obj.onDestroy.detach(null, destroyFn);
										};

										this.attach(null, successFn = function onSuccess(ev) {
											let retval = undefined;
											if (callback) {
												try {
													retval = callback(ev);
												} catch(ex) {
													cleanup();
													reject(ex);
													retval = false;
												};
											};
											if (retval !== false) {  // 'false' to prevent resolve and to allows filters on event. To really return 'false', use 'DDPromise.resolve(false)'.
												cleanup();
												resolve(retval);
											};
										});

										if (errorEvent) {
											obj[errorEvent].attachOnce(null, errorFn = function onError(ev) {
												cleanup();
												reject(ev.error);
											});
										};

										if (destroy) {
											obj.onDestroy.attachOnce(null, destroyFn = function(ev) {
												cleanup();
												// NOTE: We absolutly must reject the Promise.
												reject(new types.ScriptInterruptedError("Target object is about to be destroyed."));
											});
										};

										obj.onEventDetached.attach(null, detachedFn = function(ev) {
											if (ev.data.handler === successFn) {
												tools.callAsync(cleanup, -1); // Must be async
												// NOTE: We absolutly must reject the Promise.
												reject(new types.ScriptInterruptedError("Target event has been detached."));
											};
										});
									}, this);
							}),
					};

				// FUTURE: Syntax for variable keys in object declaration
				// TODO: Protect these variables from the outside
				__Internal__.eventHandlerInstanceProto[__Internal__.symbolObject] = types.NOT_CONFIGURABLE(types.READ_ONLY(null));
				__Internal__.eventHandlerInstanceProto[__Internal__.symbolExtender] = types.NOT_CONFIGURABLE(types.READ_ONLY(null));
				__Internal__.eventHandlerInstanceProto[__Internal__.symbolStack] = types.NOT_CONFIGURABLE(types.READ_ONLY(null));
				__Internal__.eventHandlerInstanceProto[__Internal__.symbolSorted] = types.NOT_CONFIGURABLE(types.WRITABLE(false));
				__Internal__.eventHandlerInstanceProto[__Internal__.symbolClonedStack] = types.NOT_CONFIGURABLE(types.WRITABLE(null));

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
					, doodad.REGISTER(types.Type.$inherit(
						/*typeProto*/
						{
							$TYPE_NAME: 'EventHandler',
							$TYPE_UUID:  '' /*! INJECT('+' + TO_SOURCE(UUID('EventHandler')), true) */,
						},
						/*instanceProto*/
						__Internal__.eventHandlerInstanceProto
					)));
				

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
							description: "Attribute extender which extends an event.",
					}
					//! END_REPLACE()
					, extenders.REGISTER([], extenders.Method.$inherit({
						$TYPE_NAME: "Event",
						$TYPE_UUID:  '' /*! INJECT('+' + TO_SOURCE(UUID('EventExtender')), true) */,

						eventsAttr: types.READ_ONLY('__EVENTS'),
						eventsImplementation: types.READ_ONLY('Doodad.MixIns.Events'),
						eventProto: types.READ_ONLY(doodad.EventHandler),

						enableScopes: types.READ_ONLY(false),
						errorEvent: types.READ_ONLY(false),

						isProto: types.READ_ONLY(false), // must be created on Class instances, not on the prototype
						
						_new: types.SUPER(function _new(/*optional*/options) {
								this._super(options);

								_shared.setAttribute(this, 'errorEvent', !!types.get(options, 'errorEvent', this.errorEvent));
							}),

						getCacheName: types.SUPER(function getCacheName(/*optional*/options) {
								return this._super(options) + 
									',' + (types.get(options, 'errorEvent', this.errorEvent) ? '1' : '0');
							}),

						overrideOptions: types.SUPER(function overrideOptions(options, newOptions, /*optional*/replace) {
								options = this._super(options, newOptions, replace);
								if (replace) {
									types.fill(['errorEvent'], options, this, newOptions);
								} else {
									options.errorEvent = !!newOptions.errorEvent || this.errorEvent;
								};
								return options;
							}),

						extend: types.SUPER(function extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, proto, protoName) {
								if (root.getOptions().debug) {
									if (!types.has(destAttributes, this.eventsAttr)) {
										throw new types.Error("You must implement '~0~'.", [this.eventsImplementation]);
									};
								};
								
								const events = types.unbox(destAttributes[this.eventsAttr]);
								events.push(attr);
								
								if (this.errorEvent) {
									destAttributes.__ERROR_EVENT = destAttributes.__ERROR_EVENT.setValue(attr);
								};

								return this._super(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, proto, protoName);
							}),

						createDispatch: types.SUPER(function createDispatch(attr, obj, attribute, callers) {
								const dispatch = this._super(attr, obj, attribute, callers);
								return types.setPrototypeOf(dispatch, new this.eventProto(obj, this));
							}),

						remove: function remove(attr, obj, storage, forType, attribute) {
								const handler = obj[attr];
								if (types._instanceof(handler, doodad.EventHandler)) {
									handler.clear();
								};
		//							extenders.Attribute.remove.call(this, attr, obj, storage, forType, attribute);
							},
					})));

				extenders.REGISTER([], extenders.Event.$inherit({
						$TYPE_NAME: "RawEvent",
						$TYPE_UUID:  '' /*! INJECT('+' + TO_SOURCE(UUID('RawEventExtender')), true) */,
				}));

				__Internal__.EVENT_CACHE = types.nullObject();

				__Internal__.EVENT = function EVENT(/*optional*/cancellable, /*optional*/eventTypeName, /*optional*/fn) {
					cancellable = (types.isNothing(cancellable) ? true : !!cancellable);

					const key = (cancellable ? 'y' : 'n') + '|' + (eventTypeName || '');

					let eventFn = null,
						errorEvent = false;

					if (types.has(__Internal__.EVENT_CACHE, key)) {
						eventFn = __Internal__.EVENT_CACHE[key];
						errorEvent = eventFn[1];
						eventFn = eventFn[0];

					} else {
						let eventType = null;
						if (!types.isNothing(eventTypeName)) {
							eventType = namespaces.get(eventTypeName);
							root.DD_ASSERT && root.DD_ASSERT((eventType === doodad.Event) || types.baseof(doodad.Event, eventType), "Invalid 'eventTypeName' argument.");
						};

						errorEvent = ((eventType === doodad.ErrorEvent) || types.baseof(doodad.ErrorEvent, eventType));

						eventFn = function handleEvent(/*optional*/ev) {
							if (eventType && !types._instanceof(ev, eventType)) {
								if (!errorEvent && types.isNothing(ev)) {
									ev = new eventType();
								} else if (errorEvent && types.isError(ev)) {
									ev = new eventType(ev);
								} else {
									throw new types.Error("Invalid or missing event object.");
								};
							};

							const evObj = ev && ev.obj,
								evName = ev && ev.name,
								dispatch = this[__Internal__.symbolCurrentDispatch];
						
							ev && _shared.setAttributes(ev, {obj: this, name: dispatch[_shared.NameSymbol]});
							
							let cancelled = !!this._super(ev) && cancellable;

							if (!cancelled) {
								const stack = dispatch[__Internal__.symbolStack];

								let clonedStack;
								if (dispatch[__Internal__.symbolSorted]) {
									clonedStack = dispatch[__Internal__.symbolClonedStack];
								} else {
									if (stack.length) {
										stack.sort(function(value1, value2) {
											return tools.compareNumbers(value1[2], value2[2]);
										});
										clonedStack = types.clone(stack);
									} else {
										clonedStack = [];
									};
									dispatch[__Internal__.symbolSorted] = true;
									dispatch[__Internal__.symbolClonedStack] = clonedStack;
								};
							
								const stackLen = clonedStack.length;

								try {
									for (let i = 0; i < stackLen; i++) {
										const data = clonedStack[i];
									
										let retval = undefined;

										const obj = data[0];

										if (data[4] > 0) {
											if (obj && _shared.DESTROYED(obj)) {
												data[4] = 0;
												continue;
											};

											data[4]--;

											ev && _shared.setAttribute(ev, 'handlerData', data[3]);

											retval = data[5].call(obj, ev);
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

								} catch(ex) {
									throw ex;

								} finally {
									const removed = types.popItems(stack, function(data) {
										return (data[4] <= 0);
									});
									if (removed.length) {
										dispatch[__Internal__.symbolSorted] = false;
										dispatch[__Internal__.symbolClonedStack] = null;
									};

									if (evObj) {
										_shared.setAttributes(ev, {obj: evObj, name: evName});
									};

									if (ev && errorEvent) {
										if (!evObj && (ev.error.critical || (!cancelled && !ev.error.trapped))) {
											tools.catchAndExit(ev.error);
										};
									};
								};

							} else {
								if (ev && errorEvent) {
									if (!evObj && (ev.error.critical || (!cancelled && !ev.error.trapped))) {
										tools.catchAndExit(ev.error);
									};
								};
							};

							return cancelled;
						};

						__Internal__.EVENT_CACHE[key] = [eventFn, errorEvent];
					};

					eventFn = doodad.PROTECTED(doodad.CALL_FIRST(doodad.NON_REENTRANT(doodad.ATTRIBUTE(eventFn, extenders.Event, {enableScopes: false, errorEvent: errorEvent}))));

					if (fn) {
						eventFn[__Internal__.symbolOverrideWith] = fn;
					};

					return eventFn;
				};
				
				__Internal__.RAW_EVENT_CACHE = types.nullObject();

				__Internal__.RAW_EVENT = function RAW_EVENT(errorEvent, /*optional*/fn) {
					const key = (errorEvent ? 'y' : 'n');

					let eventFn;

					if (types.has(__Internal__.RAW_EVENT_CACHE, key)) {
						eventFn = __Internal__.RAW_EVENT_CACHE[key];

					} else {
						eventFn = function handleEvent(/*paramarray*/) {
							let emitted = !!this._super.apply(this, arguments);

							const dispatch = _shared.getAttribute(this, __Internal__.symbolCurrentDispatch),
								stack = dispatch[__Internal__.symbolStack];
						
							let clonedStack;
							if (dispatch[__Internal__.symbolSorted]) {
								clonedStack = dispatch[__Internal__.symbolClonedStack];
							} else {
								if (stack.length) {
									stack.sort(function(value1, value2) {
										return tools.compareNumbers(value1[2], value2[2]);
									});
									clonedStack = types.clone(stack);
								} else {
									clonedStack = [];
								};
								dispatch[__Internal__.symbolSorted] = true;
								dispatch[__Internal__.symbolClonedStack] = clonedStack;
							};
							
							const stackLen = clonedStack.length;

							try {
								for (let i = 0; i < stackLen; i++) {
									const data = clonedStack[i],
										obj = data[0],
										fn = data[1];
									
									if (data[4] > 0) {
										data[4]--;

										_shared.invoke(obj, fn, arguments, _shared.SECRET);

										emitted = true;
									};
								};

							} catch(ex) {
								throw ex;

							} finally {
								const removed = types.popItems(stack, function(data) {
									return (data[4] <= 0);
								});
								if (removed.length) {
									dispatch[__Internal__.symbolSorted] = false;
									dispatch[__Internal__.symbolClonedStack] = null;
								};

								if (errorEvent) {
									const ex = arguments[0];

									if (emitted) {
										ex.trapped = true;
									};

									if (!ex.trapped) {
										tools.catchAndExit(ex);
									};
								};
							};

							return emitted;
						};

						__Internal__.RAW_EVENT_CACHE[key] = eventFn;
					};

					eventFn = doodad.PROTECTED(doodad.CALL_FIRST(doodad.NON_REENTRANT(doodad.ATTRIBUTE(eventFn, extenders.RawEvent, {enableScopes: false, errorEvent: errorEvent}))));

					if (fn) {
						eventFn[__Internal__.symbolOverrideWith] = fn;
					};

					return eventFn;
				};
				
				doodad.ADD('EVENT', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 1,
							params: {
								cancellable: {
									type: 'bool',
									optional: true,
									description: "Function. Default is 'true'.",
								},
								fn: {
									type: 'function',
									optional: true,
									description: "Event handler.",
								},
							},
							returns: 'AttributeBox,Extender',
							description: "Creates an event.",
					}
					//! END_REPLACE()
					, function EVENT(/*optional*/cancellable, /*optional*/fn) {
						const boxed = __Internal__.EVENT(cancellable, 'Doodad.Event', fn);
						return boxed;
					}));

				doodad.ADD('ERROR_EVENT', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 1,
							params: {
								fn: {
									type: 'function',
									optional: true,
									description: "Event handler.",
								},
							},
							returns: 'AttributeBox,Extender',
							description: "Creates an error event ('onError').",
					}
					//! END_REPLACE()
					, function ERROR_EVENT(/*optional*/fn) {
						const boxed = __Internal__.EVENT(false, 'Doodad.ErrorEvent', fn);
						return boxed;
					}));

				doodad.ADD('RAW_EVENT', root.DD_DOC(
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
						const boxed = __Internal__.RAW_EVENT(false, fn);
						return boxed;
					}));

				doodad.ADD('RAW_ERROR_EVENT', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'AttributeBox,Extender',
						description: "Creates a special error event.",
					}
					//! END_REPLACE()
					, function RAW_ERROR_EVENT(/*optional*/fn) {
						const boxed = __Internal__.RAW_EVENT(true, fn);
						return boxed;
					}));

				__Internal__.CANCEL_EVENT = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								fn: {
									type: 'function',
									optional: true,
									description: "Event handler.",
								},
							},
							returns: 'AttributeBox,Extender',
							description: "Creates an 'event cancelled' event.",
					}
					//! END_REPLACE()
					, function CANCEL_EVENT(/*optional*/fn) {
						const boxed = __Internal__.EVENT(false, 'Doodad.CancelEvent', fn);
						return boxed;
					});

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
						$TYPE_UUID:  '' /*! INJECT('+' + TO_SOURCE(UUID('Clonable')), true) */,

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
						$TYPE_UUID:  '' /*! INJECT('+' + TO_SOURCE(UUID('Serializable')), true) */,
					
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
						$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('Events')), true) */,
					
						__EVENTS: doodad.PROTECTED(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PRE_EXTEND(doodad.PERSISTENT(doodad.TYPE(doodad.INSTANCE(doodad.ATTRIBUTE([], extenders.UniqueArray)))))))),
						__ERROR_EVENT: doodad.PUBLIC(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PRE_EXTEND(doodad.PERSISTENT(doodad.TYPE(doodad.INSTANCE(null))))))),
						
						onEventAttached: doodad.TYPE(doodad.INSTANCE(__Internal__.EVENT(false))),
						onEventDetached: doodad.TYPE(doodad.INSTANCE(__Internal__.EVENT(false))),
						onEventCancelled: doodad.TYPE(doodad.INSTANCE(__Internal__.CANCEL_EVENT())), // function onEventCancelled(ev)
							
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
								const events = this.__EVENTS,
									eventsLen = events.length;
								for (let i = 0; i < eventsLen; i++) {
									this[events[i]].detach(obj, fn, datas);
								};
							}))))),
						
						clearEvents: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 4,
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
								const events = this.__EVENTS,
									eventsLen = events.length;
								if (types.isNothing(objs)) {
									for (let i = 0; i < eventsLen; i++) {
										this[events[i]].clear();
									};
								} else if (types.isArray(objs)) {
									const objsLen = objs.length;
									for (let i = 0; i < eventsLen; i++) {
										for (let j = 0; j < objsLen; j++) {
											if (types.has(objs, j)) {
												this[events[i]].detach(objs[j]);
											};
										};
									};
								} else {
									for (let i = 0; i < eventsLen; i++) {
										this[events[i]].detach(objs);
									};
								};
							}))))),
					}))));
				

				__Internal__.creatablePrototype = {
						$TYPE_NAME: 'Creatable',
						$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('Creatable')), true) */,

						// TODO: Been able to do something like :
						// onDestroy: doodad.IF_IMPLEMENTS(doodad.Events, doodad.EVENT(false)),

						isDestroyed: doodad.PUBLIC(doodad.TYPE(doodad.INSTANCE(doodad.CAN_BE_DESTROYED(doodad.CALL_FIRST(function isDestroyed() {
							const destroyed = this[__Internal__.symbolDestroyed];
							return (destroyed !== false); // NOTE: Can be "null" for "not created".
						}))))),

						
						$create: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 1,
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
							, doodad.PUBLIC(doodad.CAN_BE_DESTROYED(doodad.CALL_FIRST(function $create(/*paramarray*/) {
								if (this[__Internal__.symbolDestroyed] !== null) {
									throw new types.Error("Object already created.");
								};
								_shared.setAttribute(this, __Internal__.symbolDestroyed, false);
								try {
									this._super.apply(this, arguments);
								} catch(ex) {
									_shared.invoke(null, this.$destroy, null, _shared.SECRET, this);
									throw ex;
								};
							})))),
						
						$destroy: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 2,
									params: null,
									returns: 'undefined',
									description: "Destroys the class.",
							}
							//! END_REPLACE()
							, doodad.PUBLIC(doodad.EXTERNAL(doodad.CALL_FIRST(
							function $destroy() {
								if (this[__Internal__.symbolDestroyed] === false) {
									this._super();

									_shared.setAttribute(this, __Internal__.symbolDestroyed, true);

									this._delete();
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
									revision: 1,
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
							, doodad.PUBLIC(doodad.CAN_BE_DESTROYED(doodad.CALL_FIRST(function create(/*paramarray*/) {
								if (this[__Internal__.symbolDestroyed] !== null) {
									throw new types.Error("Object already created.");
								};
								_shared.setAttribute(this, __Internal__.symbolDestroyed, false);
								try {
									this._super.apply(this, arguments);
								} catch(ex) {
									_shared.invoke(null, this.destroy, null, _shared.SECRET, this);
									throw ex;
								};
							})))),
						
						fastDestroy: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 2,
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

									types.Type.prototype._delete.call(this);
								};
							})))),
						
						destroy: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 2,
									params: null,
									returns: 'undefined',
									description: "Fully destroys the class object instance.",
							}
							//! END_REPLACE()
							, doodad.PUBLIC(doodad.EXTERNAL(doodad.CALL_FIRST(
							function destroy() {
								if (this[__Internal__.symbolDestroyed] === false) {
									this._super();

									_shared.setAttribute(this, __Internal__.symbolDestroyed, true);

									this._delete();
								};
							})))),

					};

				// <FUTURE> Use syntax for variable key in object declaration
				__Internal__.creatablePrototype[__Internal__.symbolDestroyed] = doodad.PRIVATE(doodad.READ_ONLY(doodad.PERSISTENT(doodad.TYPE(doodad.INSTANCE(null)))));

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
						$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('Translatable')), true) */,
					
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
								
								const names = name.split('.'),
									namesLen = names.length;

								let translations = this.$__translations;
									
								for (let i = 0; translations && (i < namesLen); i++) {
									const n = names[i];
									root.DD_ASSERT && root.DD_ASSERT(types.isJsObject(translations) && types.has(translations, n), "Translation '~0~' for '~1~' doesn't exist.", [name, types.getTypeName(this) || __Internal__.ANONYMOUS]);
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
									const names = name.split('.'),
										namesLen = names.length;
										
									let translations = this.$__translations;

									for (let i = 0; translations && (i < namesLen - 1); i++) {
										const n = names[i];
										root.DD_ASSERT && root.DD_ASSERT(types.isJsObject(translations) && types.has(translations, n), "Translation '~0~' for '~1~' doesn't exist.", [name, types.getTypeName(this) || __Internal__.ANONYMOUS]);
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
						$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('Configurable')), true) */,
					
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
								
								const names = name.split('.'),
									namesLen = names.length;
									
								let config = this.$__config;

								for (let i = 0; config && (i < namesLen); i++) {
									const n = names[i];
									root.DD_ASSERT && root.DD_ASSERT(types.isJsObject(config) && types.has(config, n), "Configuration '~0~' for '~1~' doesn't exist.", [name, types.getTypeName(this) || __Internal__.ANONYMOUS]);
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
									const names = name.split('.'),
										namesLen = names.length;
									
									let config = this.$__config;

									for (let i = 0; config && (i < namesLen - 1); i++) {
										const n = names[i];
										root.DD_ASSERT && root.DD_ASSERT(types.isJsObject(config) && types.has(config, n), "Configuration '~0~' for '~1~' doesn't exist.", [name, types.getTypeName(this) || __Internal__.ANONYMOUS]);
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
						$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('Object')), true) */,
					}))));
				
				//==================================
				// Callbacks objects
				//==================================

				doodad.ADD('Callback', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 7,
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
									description: "If 'true', error will bubble. If a function, error will be pass to it as argument. Otherwise, error will be managed. Default is 'true'.",
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
					, function Callback(/*optional*/obj, fn, /*optional*/bubbleError, /*optional*/args, /*optional*/secret) {
						// IMPORTANT: No error should popup from a callback, excepted "ScriptAbortedError".
						let attr = null;
						if (types.isString(fn) || types.isSymbol(fn)) {
							attr = fn;
							fn = obj[attr];
						};
						if (types.isNothing(obj) && types.isCallback(fn)) {
							return fn;
						};
						if (types.isNothing(bubbleError)) {
							bubbleError = true;
						};
						fn = types.unbind(fn) || fn;
						root.DD_ASSERT && root.DD_ASSERT((obj && types.isBindable(fn)) || (!obj && types.isFunction(fn)), "Invalid function.");
						const insideFn = _shared.makeInside(obj, fn, secret),
							insideFnApply = insideFn.apply.bind(insideFn),
							callBubble = types.isFunction(bubbleError);
						if (callBubble && types.isBindable(bubbleError)) {
							bubbleError = _shared.makeInside(obj, bubbleError, secret);
						};
						let callback = types.INHERIT(types.Callback, function callbackHandler(/*paramarray*/) {
							callback.lastError = null;
							try {
								if (!obj || !_shared.DESTROYED(obj)) {
									if (args) {
										return insideFnApply(obj, args);
									} else {
										return insideFnApply(obj, arguments);
									};
								};
							} catch(ex) {
								callback.lastError = ex;
								if (callBubble && !ex.bubble) {
									return bubbleError(ex); // call error handler
								} else if (bubbleError || ex.critical) {
									throw ex;
								} else {
									try {
										doodad.trapException(ex, obj, attr);
									} catch(o) {
										if (root.getOptions().debug) {
											debugger;
										};
									};
								};
							};
						});
						callback[_shared.BoundObjectSymbol] = obj;
						callback[_shared.OriginalValueSymbol] = fn;
						callback.lastError = null;
						return callback;
					}));
				
				doodad.ADD('AsyncCallback', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 9,
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
									description: "If 'true', error will bubble. If a function, error will be pass to it as argument. Otherwise, error will be managed. Default is 'false'.",
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
					, function AsyncCallback(/*optional*/obj, fn, /*optional*/bubbleError, /*optional*/args, /*optional*/secret) {
						// IMPORTANT: No error should popup from a callback, excepted "ScriptAbortedError".
						const Promise = types.getPromise();
						let attr = null;
						if (types.isString(fn) || types.isSymbol(fn)) {
							attr = fn;
							fn = obj[attr];
						};
						if (types.isNothing(obj) && types.isCallback(fn)) {
							return fn;
						};
						fn = types.unbind(fn) || fn;
						root.DD_ASSERT && root.DD_ASSERT((obj && types.isBindable(fn)) || (!obj && types.isFunction(fn)), "Invalid function.");
						const type = types.getType(obj),
							isClass = (types.isClass(type) || types.isInterfaceClass(type));
						if (isClass && (type === __Internal__.invokedClass)) {
							secret = _shared.SECRET;
						};
						const fnApply = fn.apply.bind(fn),
							callBubble = types.isFunction(bubbleError);
						if (callBubble && types.isBindable(bubbleError)) {
							bubbleError = _shared.makeInside(obj, bubbleError, secret);
						};
						let callback = types.INHERIT(types.Callback, function callbackHandler(/*paramarray*/) {
							if (!args) {
								args = types.toArray(arguments);
							}
							callback.lastError = null;
							tools.callAsync(function async(/*paramarray*/) {
								try {
									if (!obj || !_shared.DESTROYED(obj)) {
										if (isClass) {
											_shared.invoke(obj, fn, args, secret);
										} else {
											fnApply(obj, args);
										};
									};
								} catch(ex) {
									callback.lastError = ex;
									if (callBubble && !ex.bubble) {
										bubbleError(ex); // call error handler
									} else if (bubbleError || ex.critical) {
										throw ex;
									} else {
										try {
											doodad.trapException(ex, obj, attr);
										} catch (o) {
											if (root.getOptions().debug) {
												debugger;
											};
										};
									};
								};
							}, 0, null, args);
						});
						callback[_shared.BoundObjectSymbol] = obj;
						callback[_shared.OriginalValueSymbol] = fn;
						callback.lastError = null;
						return callback;
					}));
				
				//==================================
				// Serializable objects
				//==================================

				root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 5,
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
						$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('PackedValue')), true) */,
						
						$ERROR_ATTRIBUTES: doodad.PROTECTED(doodad.TYPE(doodad.ATTRIBUTE([
							'name',
							'message',
							'innerStack',
						], extenders.UniqueArray))),
						
						__value: doodad.PROTECTED(doodad.READ_ONLY(null)),
						
						create: doodad.OVERRIDE(function create(value) {
							if (root.DD_ASSERT) {
								root.DD_ASSERT(types.isSerializable(value), "Invalid value");
								if (types._implements(value, interfaces.Serializable)) {
									const type = types.getType(value);
									root.DD_ASSERT(namespaces.get(type.DD_FULL_NAME) === type, "Value is not of a registered type.");
								};
							};
							_shared.setAttribute(this, '__value', value);
						}),
						
						$pack: doodad.PUBLIC(doodad.TYPE(doodad.JS_METHOD(function $pack(value) {
							let data;
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
								const type = value.constructor;
								const tmp = {
									type: (type && type.DD_FULL_NAME ? '{' + type.DD_FULL_NAME + '}' : ''),
								};
								tools.forEach(this.$ERROR_ATTRIBUTES, function(key) {
									const valKey = (key === 'innerStack' ? 'stack' : key);
									if (types.hasInherited(value, valKey)) {
										tmp[key] = this.$pack(value[valKey]);
									};
								}, this);
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
						
						$unpack: doodad.PUBLIC(doodad.TYPE(doodad.JS_METHOD(function $unpack(data) {
							let value;
							if (types.isJsObject(data)) {
								const type = types.toString(types.get(data, 'type'));
								value = types.get(data, 'value');
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
									let cls;
									const valueType = types.toString(types.get(value, 'type', ''));
									if (valueType) {
										const clsName = valueType.slice(1, -1);
										cls = namespaces.get(clsName);
										if (!types.isErrorType(cls)) {
											throw new types.TypeError("Error of type '~0~' can't be deserialized.", [clsName]);
										};
									} else {
										cls = _shared.Natives.windowError;
									};
									const tmp = new cls();
									tools.forEach(this.$ERROR_ATTRIBUTES, function(key) {
										if (types.has(value, key)) {
											tmp[key] = this.$unpack(value[key]);
										};
									}, this);
									value = tmp;
								} else if (type === 'object') {
									value = tools.map(value, this.$unpack, this);
								} else if (type[0] === '{') {
									const clsName = type.slice(1, -1),
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