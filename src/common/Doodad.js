//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
	// doodad-js - Object-oriented programming framework
	// File: Doodad.js - Main file
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

// Naming conventions :
//
//     Namespaces, Types, Enums, and other Public Module Attributes : Each word in lower case and beginning with an upper case. ex.: MyType
//     Object Attributes, Functions, Arguments and Variables : First word all lower case. Other words in lower case and beginning with an upper case. ex.: processQueue
//     JavaScript Keywords : Preceded by an underscore (_). ex.: _new
//     Private Types, and Private Object Attributes : Preceded by two underscores (__). ex.: __MyType
//     Private Module Types, and private Variables : Preceded by two underscores (__) and followed by two other underscores. ex.: __myPrivateVariable__
//     Read-only (or don't touch warning) Attributes, and Special Functions : All upper case and words separated with an underscore (_). ex: READ_ONLY_ATTRIBUTE
//     Non-instance (static) Type Attributes : Preceded by a dollar sign ("$").

exports.add = function add(modules) {
	modules = (modules || {});
	modules['Doodad'] = {
		version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
		namespaces: ['Extenders', 'Interfaces', 'MixIns', 'Exceptions'],
		dependencies: [
			'Doodad.Tools',
			'Doodad.Tools/ToSource',
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
			// Class entry
			const doodad = root.Doodad,
				types = doodad.Types,
				namespaces = doodad.Namespaces,
				entries = namespaces.Entries,
				tools = doodad.Tools,
				extenders = doodad.Extenders,
				interfaces = doodad.Interfaces,
				mixIns = doodad.MixIns,
				exceptions = doodad.Exceptions,
				nodejs = doodad.NodeJs; // optional


			// <FUTURE> Thread context
			const __Internal__ = tools.safeObject({
				currentInstance: null,	// <FUTURE> thread level
				currentType: null,	// <FUTURE> thread level
				inTrapException: false, // <FUTURE> thread level

				callbacks: new types.WeakSet(), // <FUTURE> global to threads

				extendersCache: new types.WeakMap(), // <FUTURE> global to threads

				ANONYMOUS: '<anonymous>',

				notReentrantMap: new types.WeakMap(),

				CLASS_OR_INTERFACE: [], // Will get filled later
			});


			tools.complete(_shared.Natives, {
				arraySliceCall: global.Array.prototype.slice.call.bind(global.Array.prototype.slice),
				arraySpliceApply: global.Array.prototype.splice.apply.bind(global.Array.prototype.splice),
				arraySpliceCall: global.Array.prototype.splice.call.bind(global.Array.prototype.splice),
				arrayUnshiftApply: global.Array.prototype.unshift.apply.bind(global.Array.prototype.unshift),
				functionApply: global.Function.prototype.apply,
				functionCall: global.Function.prototype.call,
				functionBind: global.Function.prototype.bind,
				windowObject: global.Object,
			});


			// Class
			_shared.AttributesSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_ATTRIBUTES')), true) */ '__DD_ATTRIBUTES' /*! END_REPLACE() */, true);
			_shared.ImplementsSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_IMPLEMENTS')), true) */ '__DD_IMPLEMENTS' /*! END_REPLACE() */, true);
			_shared.MustOverrideSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_MUST_OVERRIDE')), true) */ '__DD_MUST_OVERRIDE' /*! END_REPLACE() */, true);
			_shared.BaseSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_BASE')), true) */ '__DD_BASE' /*! END_REPLACE() */, true);
			_shared.IsolatedSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_ISOLATED')), true) */ '__DD_ISOLATED' /*! END_REPLACE() */, true);
			_shared.IsolatedCacheSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_ISOLATED_CACHE')), true) */ '__DD_ISOLATED_CACHE' /*! END_REPLACE() */, true);
			_shared.AttributesStorageSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_ATTRIBUTES_STORAGE')), true) */ '__DD_ATTRIBUTES_STORAGE' /*! END_REPLACE() */, true);
			_shared.CurrentDispatchSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_CURRENT_DISPATCH')), true) */ '__DD_CURRENT_DISPATCH' /*! END_REPLACE() */, true);
			_shared.CurrentCallerIndexSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_CURRENT_CALLER_INDEX')), true) */ '__DD_CURRENT_CALLER_INDEX' /*! END_REPLACE() */, true);
			_shared.InitInstanceSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_INIT_INSTANCE')), true) */ '__DD_INIT_INSTANCE' /*! END_REPLACE() */, true);
			_shared.ToInitializeSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_TO_INITIALIZE')), true) */ '__DD_TO_INITIALIZE' /*! END_REPLACE() */, true);
			_shared.ToExtendLaterSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_TO_EXTEND_LATER')), true) */ '__DD_TO_EXTEND_LATER' /*! END_REPLACE() */, true);
			_shared.CreatorSymbol = (root.getOptions().debug ? types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_CREATOR')), true) */ '__DD_CREATOR' /*! END_REPLACE() */, true) : null);  // debug only

			// Class, Methods, Callers, AttributeBox
			_shared.PrototypeSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_PROTOTYPE')), true) */ '__DD_PROTOTYPE' /*! END_REPLACE() */, true);
			_shared.ModifiersSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_MODIFIERS')), true) */ '__DD_MODIFIERS' /*! END_REPLACE() */, true);

			// Methods, Callers, AttributeBox
			_shared.CallersSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_CALLERS')), true) */ '__DD_CALLERS' /*! END_REPLACE() */, true);

			// Interface
			_shared.HostSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_HOST')), true) */ '__DD_HOST' /*! END_REPLACE() */, true);

			// EventHandler, AttributeBox
			_shared.ExtenderSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_EXTENDER')), true) */ '__DD_EXTENDER' /*! END_REPLACE() */, true);

			// EventHandler
			_shared.ObjectSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_OBJECT')), true) */ '__DD_OBJECT__' /*! END_REPLACE() */, true);
			_shared.StackSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_STACK')), true) */ '__DD_STACK__' /*! END_REPLACE() */, true);
			_shared.SortedSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_SORTED')), true) */ '__DD_SORTED__' /*! END_REPLACE() */, true);
			_shared.ClonedStackSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_CLONED_STACK')), true) */ '__DD_CLONED_STACK__' /*! END_REPLACE() */, true);
			_shared.EventInsideSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_EVENT_INSIDE')), true) */ '__DD_EVENT_INSIDE__' /*! END_REPLACE() */, true);

			// Methods (Dispatches)
			_shared.ObsoleteWarnedSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('OBSOLETE_WARNED')), true) */ '__DD_OBSOLETE_WARNED__' /*! END_REPLACE() */, true);
			//			_shared.SuperAsyncSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_ASYNC_SUPER')), true) */ '__DD_ASYNC_SUPER__' /*! END_REPLACE() */, true);

			// Callers
			_shared.OkSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_OK')), true) */ '__DD_OK__' /*! END_REPLACE() */, true);
			_shared.FunctionSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_FUNCTION')), true) */ '__DD_FUNCTION__' /*! END_REPLACE() */, true);

			// Callers & AttributeBox
			_shared.CalledSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_CALLED')), true) */ '__DD_CALLED__' /*! END_REPLACE() */, true);
			_shared.PositionSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_POSITION')), true) */ '__DD_POSITION' /*! END_REPLACE() */, true);
			_shared.UsageMessageSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_USAGE_MESSAGE')), true) */ '__DD_USAGE_MESSAGE' /*! END_REPLACE() */, true);

			// AttributeBox
			_shared.ScopeSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_SCOPE')), true) */ '__DD_SCOPE' /*! END_REPLACE() */, true);
			_shared.ReturnsSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_RETURNS')), true) */ '__DD_RETURNS' /*! END_REPLACE() */, true);
			_shared.InterfaceSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_INTERFACE')), true) */ '__DD_INTERFACE' /*! END_REPLACE() */, true);
			_shared.CallFirstLengthSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_CALL_FIRST_LENGTH')), true) */ '__DD_CALL_FIRST_LENGTH' /*! END_REPLACE() */, true);
			_shared.RenamedFromSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_RENAMED_FROM')), true) */ '__DD_RENAMED_FROM' /*! END_REPLACE() */, true);
			_shared.RenamedToSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_RENAMED_TO')), true) */ '__DD_RENAMED_TO' /*! END_REPLACE() */, true);
			_shared.OverrideWithSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_OVERRIDE_WITH')), true) */ '__DD_OVERRIDE_WITH' /*! END_REPLACE() */, true);
			_shared.ReplacedCallersSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_REPLACED_CALLERS')), true) */ '__DD_REPLACED_CALLERS' /*! END_REPLACE() */, true);
			_shared.WhenSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_WHEN')), true) */ '__DD_WHEN' /*! END_REPLACE() */, true);

			// Prototype
			_shared.TypeSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_TYPE')), true) */ '__DD_TYPE' /*! END_REPLACE() */, true);

			// Creatable
			_shared.DestroyedSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_DESTROYED')), true) */ '__DD_DESTROYED' /*! END_REPLACE() */, true);


			// Interface
			doodad.ADD('HostSymbol', _shared.HostSymbol);


			//=====================
			// Options
			//=====================

			let __options__ = tools.nullObject({
				enforceScopes: false,    // for performance, set it to "false"
				enforcePolicies: false,  // for performance, set it to "false"
				publicOnDebug: false,    // to be able to read PROTECTED/PRIVATE attributes in debug mode, set it to "true"
			}, _options);

			__Internal__._setOptions = function setOptions(...args) {
				const newOptions = tools.nullObject(__options__, ...args);

				newOptions.enforceScopes = types.toBoolean(newOptions.enforceScopes);
				newOptions.enforcePolicies = types.toBoolean(newOptions.enforcePolicies);
				newOptions.publicOnDebug = types.toBoolean(newOptions.publicOnDebug);

				return newOptions;
			};

			doodad.ADD('getOptions', function getOptions() {
				return __options__;
			});

			doodad.ADD('setOptions', function setOptions(...args) {
				const newOptions = __Internal__._setOptions(...args);

				if (newOptions.secret !== _shared.SECRET) {
					throw new types.AccessDenied("Secrets mismatch.");
				};

				delete newOptions.secret;

				// Read-Only
				newOptions.publicOnDebug = __options__.publicOnDebug;

				__options__ = types.freezeObject(newOptions);

				return __options__;
			});

			__options__ = types.freezeObject(__Internal__._setOptions(_options));

			__Internal__.hasScopes = types.hasDefinePropertyEnabled() && (root.getOptions().debug || __options__.enforceScopes);
			__Internal__.hasPolicies = __Internal__.hasScopes && (root.getOptions().debug || __options__.enforcePolicies);

			doodad.ADD('hasScopes', function hasScopes() {
				return __Internal__.hasScopes;
			});

			doodad.ADD('hasPolicies', function hasPolicies() {
				return __Internal__.hasPolicies;
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
				types.DEBUGGER();
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
						$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('TypeEntry')), true) */,
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
					return types.isClass(obj) && !!((obj[_shared.ModifiersSymbol] || 0) & doodad.ClassModifiers.Base);
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
					return types.isClass(obj) && !!((obj[_shared.ModifiersSymbol] || 0) & doodad.ClassModifiers.MixIn);
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
					return types.isClass(obj) && !!((obj[_shared.ModifiersSymbol] || 0) & doodad.ClassModifiers.Interface);
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
					return types.isClass(obj) && !!((obj[_shared.ModifiersSymbol] || 0) & doodad.ClassModifiers.Isolated);
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
					return types.isClass(obj) && !((obj[_shared.ModifiersSymbol] || 0) & (doodad.ClassModifiers.Base | doodad.ClassModifiers.Interface | doodad.ClassModifiers.MixIn));
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
					return types.isClass(obj) && !!((obj[_shared.ModifiersSymbol] || 0) & doodad.ClassModifiers.Sealed);
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
						revision: 5,
						params: {
							obj: {
								type: 'Object,Class',
								optional: false,
								description: "Object to test for.",
							},
							type: {
								type: 'arrayof(Class),Class,arrayof(Object),Object',
								optional: false,
								description: "Classes.",
							},
						},
						returns: 'bool',
						description: "Returns 'true' when object implements one of the specified classes. Returns 'false' otherwise.",
					}
				//! END_REPLACE()
				, function _implements(obj, type) {
					if (!types.isLike(obj, __Internal__.CLASS_OR_INTERFACE)) {
						return false;
					};
					const isType = types.isType(obj),
						cls = (isType ? obj : types.getType(obj));
					const impls = types.getAttribute((!isType && ((cls[_shared.ModifiersSymbol] || 0) & doodad.ClassModifiers.Expandable) ? obj : cls), _shared.ImplementsSymbol, null, _shared.SECRET);
					if (types.isArray(type)) {
						const typeLen = type.length;
						for (let i = 0; i < typeLen; i++) {
							if (types.has(type, i)) {
								const typ = types.getType(type[i]);
								if (!typ) {
									continue;
								};
								if (!types.isLike(typ, __Internal__.CLASS_OR_INTERFACE)) {
									continue;
								};
								if (impls.has(typ)) {
									return true;
								};
								const uuid = _shared.getUUID(typ);
								if (uuid && impls.has(uuid)) {
									return true;
								};
							};
						};
						return false;
					} else {
						const typ = types.getType(type);
						if (!typ) {
							return false;
						};
						if (!types.isLike(typ, __Internal__.CLASS_OR_INTERFACE)) {
							return false;
						};
						if (impls.has(typ)) {
							return true;
						};
						const uuid = _shared.getUUID(typ);
						if (uuid && impls.has(uuid)) {
							return true;
						};
						return false;
					}
				}));

			types.ADD('getImplements', root.DD_DOC(
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
						},
						returns: 'objectof(Class)',
						description: "Returns the implementations of an object.",
					}
				//! END_REPLACE()
				, function getImplements(obj) {
					if (!types.isLike(obj, __Internal__.CLASS_OR_INTERFACE)) {
						return null;
					};
					const isType = types.isType(obj),
						cls = (isType ? obj : types.getType(obj));
					return types.getAttribute((!isType && ((cls[_shared.ModifiersSymbol] || 0) & doodad.ClassModifiers.Expandable) ? obj : cls), _shared.ImplementsSymbol, null, _shared.SECRET);
				}));

			types.ADD('isMethod', root.DD_DOC(
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
						description: "Returns 'true' if method exists. Returns 'false' otherwise. Note: That doesn't validate if method is implemented. Please use 'types.isImplemented' instead if you need that information.",
					}
				//! END_REPLACE()
				, function isMethod(obj, name) {
					if (!types.isLike(obj, __Internal__.CLASS_OR_INTERFACE)) {
						return false;
					};
					const isType = types.isType(obj);
					const attrs = types.getAttribute(obj, _shared.AttributesSymbol, null, _shared.SECRET);
					if (!attrs || !(name in attrs)) {
						return false;
					};
					const attr = attrs[name],
						extender = attr[_shared.ExtenderSymbol];
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
						revision: 4,
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
					const attrs = types.getAttribute(obj, _shared.AttributesSymbol, null, _shared.SECRET);
					if (!attrs || !(name in attrs)) {
						return false;
					};
					const attr = attrs[name],
						extender = attr[_shared.ExtenderSymbol];
					if (!types.isLike(extender, extenders.Method)) {
						return false;
					};
					const isType = types.isType(obj);
					if ((isType && !extender.isType) || (!isType && !extender.isInstance)) {
						return false;
					};
					const method = types.getAttribute(obj, name, null, _shared.SECRET);
					return !((method[_shared.ModifiersSymbol] || 0) & doodad.MethodModifiers.NotImplemented);
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

			//==================================
			// Callbacks
			//==================================

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

			_shared.registerCallback = function registerCallback(cb) {
				root.DD_ASSERT && root.DD_ASSERT(types.baseof(types.Callback, cb), "Invalid callback.");

				__Internal__.callbacks.add(cb);
			};

			types.ADD('isCallback', function isCallback(obj) {
				return __Internal__.callbacks.has(obj);
			});

			doodad.ADD('Callback', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 8,
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
				, types.INHERIT(types.Callback, function Callback(/*optional*/obj, fn, /*optional*/bubbleError, /*optional*/args, /*optional*/secret) {
					// IMPORTANT: No error should popup from a callback, excepted "ScriptAbortedError".
					let attr = null;
					if (types.isString(fn) || types.isSymbol(fn)) {
						attr = fn;
						fn = obj[attr];
					};
					if (types.isCallback(fn)) {
						throw new types.ValueError("The function is already a Callback.");
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
					const callback = types.INHERIT(doodad.Callback, function callbackHandler(/*paramarray*/...params) {
						callback.lastError = null;
						try {
							if (!obj || !_shared.DESTROYED(obj)) {
								if (args) {
									return insideFnApply(obj, args);
								} else {
									return insideFnApply(obj, params);
								}
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
									types.DEBUGGER();
								};
							};
						};
						return undefined; // "consistent-return"
					});
					types.setAttribute(callback, _shared.BoundObjectSymbol, obj, {});
					types.setAttribute(callback, _shared.OriginalValueSymbol, fn, {});
					callback.lastError = null;
					_shared.registerCallback(callback);
					return callback;
				})));

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
				, types.INHERIT(types.Callback, function AsyncCallback(/*optional*/obj, fn, /*optional*/bubbleError, /*optional*/args, /*optional*/secret) {
					// IMPORTANT: No error should popup from a callback, excepted "ScriptAbortedError".
					let attr = null;
					if (types.isString(fn) || types.isSymbol(fn)) {
						attr = fn;
						fn = obj[attr];
					};
					if (types.isCallback(fn)) {
						throw new types.ValueError("The function is already a Callback.");
					};
					fn = types.unbind(fn) || fn;
					root.DD_ASSERT && root.DD_ASSERT((obj && types.isBindable(fn)) || (!obj && types.isFunction(fn)), "Invalid function.");
					const type = types.getType(obj),
						isClass = (types.isClass(type) || types.isInterfaceClass(type));
					if (isClass && __Internal__.isInside(obj)) {
						secret = _shared.SECRET;
					};
					const fnApply = fn.apply.bind(fn),
						callBubble = types.isFunction(bubbleError);
					if (callBubble && types.isBindable(bubbleError)) {
						bubbleError = _shared.makeInside(obj, bubbleError, secret);
					};
					const callback = types.INHERIT(doodad.AsyncCallback, function callbackHandler(/*paramarray*/...params) {
						if (!args) {
							args = params;
						};
						callback.lastError = null;
						tools.callAsync(function async(/*paramarray*/) {
							try {
								if (!obj || !_shared.DESTROYED(obj)) {
									if (isClass) {
										types.invoke(obj, fn, args, secret);
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
									} catch(o) {
										types.DEBUGGER();
									};
								};
							};
						}, 0, null, args);
					});
					types.setAttribute(callback, _shared.BoundObjectSymbol, obj, {});
					types.setAttribute(callback, _shared.OriginalValueSymbol, fn, {});
					callback.lastError = null;
					_shared.registerCallback(callback);
					return callback;
				})));


			//==================================
			// Inside
			//==================================

			__Internal__.isInside = (__Internal__.hasScopes ?
				function isInside(obj, /*optional*/state) {
					const forType = types.isType(obj);
					if (state) {
						if (forType) {
							const currentType = state[1];
							return !!currentType && (currentType === obj);
						} else {
							const currentInstance = state[0];
							return !!currentInstance && (currentInstance === obj);
						}
					} else {
						if (forType) {
							return !!__Internal__.currentType && (__Internal__.currentType === obj);
						} else {
							return !!__Internal__.currentInstance && (__Internal__.currentInstance === obj);
						}
					}
				}
				:
				function isInside(obj, /*optional*/state) {
					return true;
				}
			);

			__Internal__.setInside = (__Internal__.hasScopes ?
				function setInside(obj, secret, /*optional*/preserve) {
					const type = types.getType(obj);
					if (!type || !__Internal__.isInside(obj)) {
						if (type && !types.isNothing(_shared.SECRET) && (secret !== _shared.SECRET)) {
							throw new types.Error("Invalid secret.");
						};
						const preserved = (preserve ? __Internal__.preserveInside() : null);
						__Internal__.currentInstance = obj;
						__Internal__.currentType = type;
						return preserved;
					};
					return null;
				}
				:
				function setInside(obj, secret) {
				}
			);

			__Internal__.preserveInside = (__Internal__.hasScopes ?
				function preserveInside() {
					return [__Internal__.currentInstance, __Internal__.currentType];
				}
				:
				function preserveInside() {
					return null;
				}
			);

			__Internal__.restoreInside = (__Internal__.hasScopes ?
				function restoreInside(state) {
					__Internal__.currentInstance = state[0];
					__Internal__.currentType = state[1];
				}
				:
				function restoreInside(state) {
				}
			);

			__Internal__.makeInside = (__Internal__.hasScopes ?
				function makeInside(/*optional*/obj, fn, /*optional*/secret) {
					root.DD_ASSERT && root.DD_ASSERT(!types.isCallback(fn), "Invalid function.");
					fn = types.unbind(fn) || fn;
					root.DD_ASSERT && root.DD_ASSERT(types.isBindable(fn), "Invalid function.");
					if (!types.isNothing(obj) && types.isNothing(secret) && __Internal__.isInside(obj)) {
						secret = _shared.SECRET;
					};
					let _insider = null;
					const fnApply = fn.apply.bind(fn);
					if (types.isNothing(obj)) {
						_insider = function insider(/*paramarray*/...params) {
							const oldInside = __Internal__.setInside(this, secret, true);
							try {
								return fnApply(this, params);
							} catch(ex) {
								throw ex;
							} finally {
								if (oldInside) {
									__Internal__.restoreInside(oldInside);
								};
							}
						};
					} else {
						_insider = function insider(/*paramarray*/...params) {
							const oldInside = __Internal__.setInside(obj, secret, true);
							try {
								return fnApply(obj, params);
							} catch(ex) {
								throw ex;
							} finally {
								if (oldInside) {
									__Internal__.restoreInside(oldInside);
								};
							}
						};
					};
					types.setAttribute(_insider, _shared.BoundObjectSymbol, obj, {});
					types.setAttribute(_insider, _shared.OriginalValueSymbol, fn, {});
					return _insider;
				}
				:
				function makeInside(/*optional*/obj, fn, /*optional*/secret) {
					root.DD_ASSERT && root.DD_ASSERT(!types.isCallback(fn), "Invalid function.");
					fn = types.unbind(fn) || fn;
					root.DD_ASSERT && root.DD_ASSERT(types.isBindable(fn), "Invalid function.");
					let _insider = null;
					const fnApply = fn.apply.bind(fn);
					if (types.isNothing(obj)) {
						_insider = function insider(/*paramarray*/...params) {
							return fnApply(this, params);
						};
					} else {
						_insider = function insider(/*paramarray*/...params) {
							return fnApply(obj, params);
						};
					};
					types.setAttribute(_insider, _shared.BoundObjectSymbol, obj, {});
					types.setAttribute(_insider, _shared.OriginalValueSymbol, fn, {});
					return _insider;
				}
			);

			__Internal__.insideNew = (__Internal__.hasScopes ?
				function insideNew(...args) {
					const oldInside = __Internal__.setInside(this, _shared.SECRET, true);
					try {
						const obj = this._new && this._new(...args) || this;
						if (_shared.CreatorSymbol) {
							obj[_shared.CreatorSymbol] = oldInside[0];
						};
						return obj;
					} catch(ex) {
						throw ex;
					} finally {
						if (oldInside) {
							__Internal__.restoreInside(oldInside);
						};
					}
				}
				:
				function insideNew(...args) {
					return this._new && this._new(...args) || this;
				}
			);

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
						description: "Makes a function called like from inside an object.",
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
						}
					}
				});

			//==================================
			// Reflection
			//==================================

			__Internal__.oldInvoke = _shared.invoke;
			_shared.invoke = function invoke(obj, fn, /*optional*/args, /*optional*/secret, /*optional*/thisObj) {
				if (types.isNothing(thisObj)) {
					thisObj = obj;
				};
				if (types.isCallback(fn)) {
					if (args) {
						return fn.apply(thisObj, args);
					} else {
						return fn.call(thisObj);
					}
				} else {
					//const type = types.getType(obj);
					//const needsInside = type && (types.isClass(type) || types.isInterfaceClass(type));
					const oldInside = __Internal__.setInside(obj, secret, true);
					try {
						if (types.isString(fn) || types.isSymbol(fn)) {
							fn = thisObj[fn];
						};
						if (types.isFunction(fn)) {
							if (args) {
								return fn.apply(thisObj, args);
							} else {
								return fn.call(thisObj);
							}
						} else {
							throw new types.ValueError("'fn' is not a function.");
						}
					} catch(ex) {
						throw ex;
					} finally {
						if (oldInside) {
							__Internal__.restoreInside(oldInside);
						};
					}
				}
			};

			__Internal__.oldGetAttribute = _shared.getAttribute;
			_shared.getAttribute = function getAttribute(obj, attr, /*optional*/options, /*optional*/secret) {
				const type = types.getType(obj);
				const needsInside = type && (types.isClass(type) || types.isInterfaceClass(type));
				const defDirect = types.get(options, 'direct', null);
				const direct = ((defDirect === null) ? !needsInside : !!defDirect);
				if (needsInside && !direct) {
					const oldInside = __Internal__.setInside(obj, secret, true);
					let optsDirect = null;
					try {
						const storage = obj[_shared.AttributesStorageSymbol];
						if (types.hasIn(storage, attr)) {
							return storage[attr];
						} else {
							if (!optsDirect) {
								optsDirect = tools.extend({}, options, {direct: true});
							};
							return __Internal__.oldGetAttribute(obj, attr, optsDirect, secret);
						}
					} catch(ex) {
						throw ex;
					} finally {
						if (oldInside) {
							__Internal__.restoreInside(oldInside);
						};
					}
				} else {
					const optsDirect = (defDirect ? options : tools.extend({}, options, {direct: true}));
					return __Internal__.oldGetAttribute(obj, attr, optsDirect, secret);
				}
			};

			__Internal__.oldGetAttributes = _shared.getAttributes;
			_shared.getAttributes = function getAttributes(obj, attrs, /*optional*/options, /*optional*/secret) {
				const type = types.getType(obj);
				const needsInside = type && (types.isClass(type) || types.isInterfaceClass(type));
				const defDirect = types.get(options, 'direct', null);
				const direct = ((defDirect === null) ? !needsInside : !!defDirect);
				if (needsInside && !direct) {
					const oldInside = __Internal__.setInside(obj, secret, true);
					try {
						const storage = (direct ? undefined : obj[_shared.AttributesStorageSymbol]);
						const attrsLen = attrs.length,
							result = {};
						let optsDirect = null;
						for (let i = 0; i < attrsLen; i++) {
							if (types.has(attrs, i)) {
								const attr = attrs[i];
								if (types.hasIn(storage, attr)) {
									result[attr] = storage[attr];
								} else {
									if (!optsDirect) {
										optsDirect = tools.extend({}, options, {direct: true});
									};
									result[attr] = __Internal__.oldGetAttribute(obj, attr, optsDirect, secret);
								};
							};
						};
						return result;
					} catch(ex) {
						throw ex;
					} finally {
						if (oldInside) {
							__Internal__.restoreInside(oldInside);
						};
					}
				} else {
					const optsDirect = (defDirect ? options : tools.extend({}, options, {direct: true}));
					return __Internal__.oldGetAttributes(obj, attrs, optsDirect, secret);
				}
			};

			__Internal__.oldSetAttribute = _shared.setAttribute;
			_shared.setAttribute = function setAttribute(obj, attr, value, /*optional*/options, /*optional*/secret) {
				const type = types.getType(obj);
				const needsInside = type && (types.isClass(type) || types.isInterfaceClass(type));
				const defDirect = types.get(options, 'direct', null);
				const direct = ((defDirect === null) ? !needsInside : !!defDirect);
				if (needsInside && !direct) {
					const oldInside = __Internal__.setInside(obj, secret, true);
					let optsDirect = null;
					try {
						const storage = obj[_shared.AttributesStorageSymbol];
						if (types.hasIn(storage, attr)) {
							storage[attr] = value;
							return value;
						} else {
							if (!optsDirect) {
								optsDirect = tools.extend({}, options, {direct: true});
							};
							return __Internal__.oldSetAttribute(obj, attr, value, optsDirect, secret);
						}
					} catch(ex) {
						throw ex;
					} finally {
						if (oldInside) {
							__Internal__.restoreInside(oldInside);
						};
					}
				} else {
					const optsDirect = (defDirect ? options : tools.extend({}, options, {direct: true}));
					return __Internal__.oldSetAttribute(obj, attr, value, optsDirect, secret);
				}
			};

			__Internal__.oldSetAttributes = _shared.setAttributes;
			_shared.setAttributes = function setAttributes(obj, values, /*optional*/options, /*optional*/secret) {
				const type = types.getType(obj);
				const needsInside = type && (types.isClass(type) || types.isInterfaceClass(type));
				const defDirect = types.get(options, 'direct', null);
				const direct = ((defDirect === null) ? !needsInside : !!defDirect);
				if (needsInside && !direct) {
					const oldInside = __Internal__.setInside(obj, secret, true);
					let optsDirect = null;
					try {
						const storage = obj[_shared.AttributesStorageSymbol];
						const loopKeys = function _loopKeys(keys) {
							const keysLen = keys.length;
							for (let i = 0; i < keysLen; i++) {
								const key = keys[i];
								if (types.hasIn(storage, key)) {
									storage[key] = values[key];
								} else {
									if (!optsDirect) {
										optsDirect = tools.extend({}, options, {direct: true});
									};
									__Internal__.oldSetAttribute(obj, key, values[key], optsDirect, secret);
								};
							};
						};
						loopKeys(types.keys(values));
						loopKeys(types.symbols(values));
						return values;
					} catch(ex) {
						throw ex;
					} finally {
						if (oldInside) {
							__Internal__.restoreInside(oldInside);
						};
					}
				} else {
					const optsDirect = (defDirect ? options : tools.extend({}, options, {direct: true}));
					return __Internal__.oldSetAttributes(obj, values, optsDirect, secret);
				}
			};

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
				}
			};

			//==================================
			// Utilities
			//==================================

			_shared.getAttributeDescriptor = root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 6,
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
					const attrs = types.getAttribute(obj, _shared.AttributesSymbol, null, _shared.SECRET);
					if (!attrs || !(name in attrs)) {
						return null;
					};
					return attrs[name];
				});

			__Internal__.oldDESTROY = _shared.DESTROY;
			_shared.DESTROY = function DESTROY(obj) {
				if (types._implements(obj, mixIns.Creatable)) {
					const destroyed = types.getAttribute(obj, _shared.DestroyedSymbol, null, _shared.SECRET);
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
					const destroyed = types.getAttribute(obj, _shared.DestroyedSymbol, null, _shared.SECRET);
					return (types.isType(obj) ? !!destroyed : (destroyed !== false)); // NOTE: Can be "null" for "not created".
				} else {
					return __Internal__.oldDESTROYED(obj);
				}
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

					if (__Internal__.hasPolicies) {
						const newTypeType = types.getType(newType);  // "newType" can be a Singleton
						if (isClass && !types.isMixIn(newTypeType) && !types.isInterface(newTypeType) && !types.isBase(newTypeType)) {
							const mustOverride = newTypeType[_shared.MustOverrideSymbol] || newTypeType.prototype[_shared.MustOverrideSymbol];
							if (mustOverride) {
								throw new types.Error("You must override the method '~0~' of type '~1~'.", [mustOverride, types.getTypeName(newTypeType) || __Internal__.ANONYMOUS]);
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
						types.setAttributes(type, values, {ignoreWhenReadOnly: true}, _shared.SECRET);

						if (args) {
							newType = types.newInstance(newType, args);
							isType = false;
							isErrorType = false;
						};
					};

					if (!types.get(newType, 'DD_FULL_NAME')) {
						types.setAttributes(newType, {
							DD_PARENT: this,
							DD_NAME: name,
							DD_FULL_NAME: fullName,
						}, {}, _shared.SECRET);
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
				, types.Error.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'Application',
						$TYPE_UUID: /*! REPLACE_BY(TO_SOURCE(UUID('ApplicationException')), true) */ null /*! END_REPLACE() */,

						[types.ConstructorSymbol](title, message, /*optional*/params) {
							root.DD_ASSERT && root.DD_ASSERT(types.isStringAndNotEmptyTrim(title), "Invalid title.");
							this.title = title;
							return [message, params];
						}
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
									// Do nothing
								};
								types.DEBUGGER();
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
						$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('Extender')), true) */,

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
								//delete proto.$TYPE_NAME;
								//delete proto.$TYPE_UUID;
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
							__Internal__.extendersCache.set(this, tools.nullObject());
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
						isProto: types.READ_ONLY(true),

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
							types.setAttributes(this, {
								notInherited: types.get(options, 'notInherited', this.notInherited),
								preExtend: types.get(options, 'preExtend', this.preExtend),
								isType: types.get(options, 'isType', this.isType),
								isInstance: types.get(options, 'isInstance', this.isInstance),
								isPersistent: types.get(options, 'isPersistent', this.isPersistent),
								isPreserved: types.get(options, 'isPreserved', this.isPreserved),
								isProto: types.get(options, 'isProto', this.isProto),
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
								const isProto = types.get(options, 'isProto', this.isProto);
								return (types.get(options, 'notInherited', this.notInherited) ? '1' : '0') +
									',' + (types.get(options, 'preExtend', this.preExtend) ? '1' : '0') +
									',' + (types.get(options, 'isType', this.isType) ? '1' : '0') +
									',' + (types.get(options, 'isInstance', this.isInstance) ? '1' : '0') +
									',' + (types.get(options, 'isPersistent', this.isPersistent) ? '1' : '0') +
									',' + (types.get(options, 'isPreserved', this.isPreserved) ? '1' : '0') +
									',' + (isProto === null ? 'N' : (isProto ? '1' : '0'));
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
								const cache = __Internal__.extendersCache.get(type);
								if (name in cache) {
									extender = cache[name];
								} else {
									extender = new type(options);
									cache[name] = extender;
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
									tools.fill(['notInherited', 'preExtend', 'isType', 'isInstance', 'isPersistent', 'isPreserved', 'isProto'], options, this, newOptions);
								} else {
									options.notInherited = !!newOptions.notInherited || this.notInherited;
									options.preExtend = !!newOptions.preExtend || this.preExtend;
									options.isType = !!newOptions.isType || this.isType;
									options.isInstance = !!newOptions.isInstance || this.isInstance;
									options.isPersistent = !!newOptions.isPersistent || this.isPersistent;
									options.isPreserved = !!newOptions.isPreserved || this.isPreserved;
									options.isProto = !!newOptions.isProto || this.isProto;
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
								}
							}),

						getValue: types.READ_ONLY(null), // function getValue(attr, attribute, forType)
						extend: types.READ_ONLY(null),   // function extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, proto, protoName)
						postExtend: types.READ_ONLY(null), // function postExtend(attr, destAttributes, destAttribute)
						preInit: types.READ_ONLY(null), // function preInit(attr, attributes, forType, attribute, value, generator, isProto, existingAttributes)
						init: types.READ_ONLY(null), // function init(attr, attributes, forType, attribute, value, generator, isProto, existingAttributes)
						remove: types.READ_ONLY(null), // function remove(attr, obj, storage, forType, attribute)
					}
				)));

			doodad.ADD('CallerFunction', function CallerFunction() {});
			doodad.ADD('DispatchFunction', function DispatchFunction() {});

			doodad.ADD('AttributeGetter', function AttributeGetter() {});
			doodad.ADD('AttributeSetter', function AttributeSetter() {});

			__Internal__.attributeDescriptors = tools.nullObject();

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
					$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('AttributeExtender')), true) */,

					isReadOnly: types.READ_ONLY(false),
					isEnumerable: types.READ_ONLY(true),
					enableScopes: types.READ_ONLY(true),
					enableStorage: types.READ_ONLY(true),

					getterTemplate: root.DD_DOC(
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
										optional: false,
										description: "Storage object. Default is attribute '__ATTRIBUTES_STORAGE' for instances, or attribute '$__ATTRIBUTES_STORAGE' for types.",
									},
								},
								returns: 'function',
								description: "Creates a getter function for an attribute.",
							}
						//! END_REPLACE()
						, function getterTemplate(attr, boxed, forType, storage) {
							const extender = this;
							const cache = (attr === _shared.AttributesStorageSymbol ? undefined : {
								obj: null,
								storage: null,
							});
							return types.INHERIT(doodad.AttributeGetter, function getter() {
								if (__Internal__.hasScopes) {
									if (extender.enableScopes) {
										if (!__Internal__.isInside(this)) {
											const result = types.getAttributes(this, [_shared.CurrentDispatchSymbol, _shared.CurrentCallerIndexSymbol], {direct: false}, _shared.SECRET);
											const dispatch = result[_shared.CurrentDispatchSymbol],
												caller = result[_shared.CurrentCallerIndexSymbol];
											if (boxed[_shared.ScopeSymbol] === doodad.Scopes.Private) {
												if (!dispatch || (dispatch[_shared.CallersSymbol][caller][_shared.PrototypeSymbol] !== boxed[_shared.PrototypeSymbol])) {
													throw new types.Error("Attribute '~0~' of '~1~' is private.", [attr, types.getTypeName(this) || __Internal__.ANONYMOUS]);
												};
											} else if (boxed[_shared.ScopeSymbol] === doodad.Scopes.Protected) {
												if (!dispatch) {
													throw new types.Error("Attribute '~0~' of '~1~' is protected.", [attr, types.getTypeName(this) || __Internal__.ANONYMOUS]);
												};
											};
										};
									};
								};
								if (attr === _shared.AttributesStorageSymbol) {
									return storage;
								} else {
									if (cache.obj !== this) {
										cache.obj = this;
										cache.storage = types.invoke(this, function() {
											return this[_shared.AttributesStorageSymbol];
										}, null, _shared.SECRET);
									};
									return cache.storage[attr];
								}
							});
						}),

					setterTemplate: root.DD_DOC(
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
										optional: false,
										description: "Storage object. Default is attribute '__ATTRIBUTES_STORAGE' for instances, or attribute '$__ATTRIBUTES_STORAGE' for types.",
									},
								},
								returns: 'function',
								description: "Creates a setter function for an attribute.",
							}
						//! END_REPLACE()
						, function setterTemplate(attr, boxed, forType, storage) {
							const extender = this;
							const cache = (attr === _shared.AttributesStorageSymbol ? undefined : {
								obj: null,
								storage: null,
							});
							return types.INHERIT(doodad.AttributeSetter, function setter(value) {
								if (__Internal__.hasScopes) {
									if (extender.enableScopes) {
										if (!__Internal__.isInside(this)) {
											const result = types.getAttributes(this, [_shared.CurrentDispatchSymbol, _shared.CurrentCallerIndexSymbol], {direct: false}, _shared.SECRET);
											const dispatch = result[_shared.CurrentDispatchSymbol],
												caller = result[_shared.CurrentCallerIndexSymbol];
											if (boxed[_shared.ScopeSymbol] === doodad.Scopes.Private) {
												if (!dispatch || (dispatch[_shared.CallersSymbol][caller][_shared.PrototypeSymbol] !== boxed[_shared.PrototypeSymbol])) {
													throw new types.Error("Attribute '~0~' of '~1~' is private.", [attr, types.getTypeName(this) || __Internal__.ANONYMOUS]);
												};
											} else if (boxed[_shared.ScopeSymbol] === doodad.Scopes.Protected) {
												if (!dispatch) {
													throw new types.Error("Attribute '~0~' of '~1~' is protected.", [attr, types.getTypeName(this) || __Internal__.ANONYMOUS]);
												};
											};
										};
									};
								};
								if (__Internal__.hasPolicies && extender.isReadOnly) {
									throw new types.Error("Attribute '~0~' of '~1~' is read-only.", [attr, types.getTypeName(this) || __Internal__.ANONYMOUS]);
								} else {
									if (attr !== _shared.AttributesStorageSymbol) {
										if (cache.obj !== this) {
											cache.obj = this;
											cache.storage = types.invoke(this, function() {
												return this[_shared.AttributesStorageSymbol];
											}, null, _shared.SECRET);
										};
										cache.storage[attr] = value;
									};
								};
								return value;
							});
						}),

					_new: types.SUPER(function _new(/*optional*/options) {
						this._super(options);
						types.setAttributes(this, {
							isReadOnly: types.get(options, 'isReadOnly', this.isReadOnly),
							isEnumerable: types.get(options, 'isEnumerable', this.isEnumerable),
							enableScopes: types.get(options, 'enableScopes', this.enableScopes),
							enableStorage: types.get(options, 'enableStorage', this.enableStorage),
						});
					}),

					getCacheName: types.SUPER(function getCacheName(/*optional*/options) {
						return this._super(options) +
								',' + (types.get(options, 'isReadOnly', this.isReadOnly) ? '1' : '0') +
								',' + (types.get(options, 'isEnumerable', this.isEnumerable) ? '1' : '0') +
								',' + (types.get(options, 'enableScopes', this.enableScopes) ? '1' : '0') +
								',' + (types.get(options, 'enableStorage', this.enableStorage) ? '1' : '0');
					}),

					overrideOptions: types.SUPER(function overrideOptions(options, newOptions, /*optional*/replace) {
						options = this._super(options, newOptions, replace);
						if (replace) {
							tools.fill(['isReadOnly', 'isEnumerable', 'enableScopes', 'enableStorage'], options, this, newOptions);
						} else {
							options.isReadOnly = !!newOptions.isReadOnly || this.isReadOnly;
							options.isEnumerable = !!newOptions.isEnumerable || this.isEnumerable;
							options.enableScopes = !!newOptions.enableScopes || this.enableScopes;
							options.enableStorage = !!newOptions.enableStorage || this.enableStorage;
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
							if (__Internal__.hasPolicies) {
								if (sourceIsProto) {
									if (!types.isNothing(types.unbox(destAttribute)) && (destAttribute[_shared.ScopeSymbol] === doodad.Scopes.Private)) {
										throw new types.Error("Private attribute '~0~' of '~1~' can't be overridden.", [attr, types.getTypeName(destAttribute[_shared.PrototypeSymbol][_shared.TypeSymbol]) || __Internal__.ANONYMOUS]);
									};
								};
							};

							return sourceAttribute;
						}),

					__isFromStorage: function __isFromStorage(destAttribute) {
						return (
							this.enableStorage
									&&
									(
										(
											__Internal__.hasScopes
											&&
											(this.enableScopes && (destAttribute[_shared.ScopeSymbol] !== doodad.Scopes.Public))
										)
										||
										(
											__Internal__.hasPolicies
											&&
											this.isReadOnly
										)
									)
						);
					},

					preInit: function preInit(attr, attributes, forType, attribute, value, generator, isProto, existingAttributes) {
						return !((isProto === null) || (this.isProto === null) || (this.isProto === isProto)); // true === Cancel
					},

					init: root.DD_DOC(
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
									attributes: {
										type: 'objectof(AttributeBox)',
										optional: false,
										description: "Attributes of the target class.",
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
									generator: {
										type: 'object',
										optional: false,
										description: "Code generator.",
									},
									isProto: {
										type: 'boolean',
										optional: false,
										description: "'true' when 'obj' is a Class prototype. 'false' when 'obj' is a Class instance. 'null' when attribute must be unconditionally set.",
									},
									existingAttributes: {
										type: 'arrayof(string,symbol)',
										optional: true,
										description: "List of already existing object attributes. Reserved for expanding objects only when in storage mode.",
									},
								},
								returns: 'undefined',
								description: "Initializes an attribute for a new object instance.",
							}
						//! END_REPLACE()
						, function init(attr, attributes, forType, attribute, value, generator, isProto, existingAttributes) {
							const attrId = generator.vars.add(attr);
							const valueId = (attr === _shared.AttributesStorageSymbol ? generator.storageId : generator.vars.add(value, attr));

							if (this.__isFromStorage(attribute)) {
								generator.code.add(generator.storageId + "[" + attrId + "] = " + valueId);

								// NOTE: Using "existingAttributes" to optimize
								if (tools.indexOf(existingAttributes, attr) < 0) {
									const extender = this;
									const extenderId = generator.vars.add(extender);

									// NOTE: Commented out since using "existingAttributes"
									//const attrDesc = new generator.DynamicValue("types.getOwnPropertyDescriptor(" + generator.objId + ", " + attrId + ")");
									//const attrDescId = generator.vars.add(attrDesc);

									const attributeId = generator.vars.add(attribute);

									const get = new generator.DynamicValue(extenderId + ".getterTemplate(" + attrId + ", " + attributeId + ", " + tools.toSource(forType) + ", " + generator.storageId + ")");
									const set = (
										this.isReadOnly ?
											undefined
											:
											new generator.DynamicValue(extenderId + ".setterTemplate(" + attrId + ", " + attributeId + ", " + tools.toSource(forType) + ", " + generator.storageId + ")")
									);

									const getId = generator.vars.add(get);
									const setId = generator.vars.add(set);

									// NOTE: Commented out since using "existingAttributes"
									//generator.code.add(
									//	"if (" +
									//		"!" + attrDescId + " || " +
									//		attrDescId + ".configurable || " +
									//		"!types.isPrototypeOf(doodad.AttributeGetter, " + attrDescId + ".get) || " +
									//		"(!types.isNothing(" + attrDescId + ".set) && !types.isPrototypeOf(doodad.AttributeSetter, " + attrDescId + ".set))" +
									//	") {"
									//, true);

									// NOTE: Commented out since using "existingAttributes"
									//attrDesc.release();

									/* eslint no-useless-concat: "off" */
									const desc = new generator.DynamicValue("{configurable: false, enumerable: " + tools.toSource(this.isEnumerable) + ", get: " + getId + ", " + "set: " + setId + "}");
									const descId = generator.vars.add(desc);
									generator.define(attrId, descId);

									get.release();

									if (set) {
										set.release();
									};

									// NOTE: Commented out since using "existingAttributes"
									//generator.code.add(
									//	"}"
									//, false);
								};

							} else {
								const ro = this.isReadOnly;
								const cf = (ro || !this.isPersistent); // to be able to change value when read-only with "setAttribute" or be able to remove the property when not persistent
								const enu = this.isEnumerable;

								const key = 'K' + (cf ? '1' : '0') + (enu ? '1' : '0') + (ro ? '1' : '0');

								let desc;
								if (key in __Internal__.attributeDescriptors) {
									desc = __Internal__.attributeDescriptors[key];
								} else {
									desc = types.freezeObject({
										configurable: cf,
										enumerable: enu,
										writable: !ro,
										direct: true,
									});
									__Internal__.attributeDescriptors[key] = desc;
								};
								const descId = generator.vars.add(desc);

								//const secretId = generator.vars.add(_shared.SECRET, 'SECRET');

								if (cf && enu && !ro) {
									generator.code.add(
										"if (" + attrId + " in " + generator.objId + ") {" +
											"types.setAttribute(" + generator.objId + ", " + attrId + ", " + valueId + ", " + descId /*+ ", " + secretId*/ + ")" +
										"} else {" +
											generator.objId + "[" + attrId + "] = " + valueId + ";" +
										"}"
									);
								} else {
									generator.code.add(
										"types.setAttribute(" + generator.objId + ", " + attrId + ", " + valueId + ", " + descId /*+ ", " + secretId*/ + ")"
									);
								};
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
					$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('NullExtender')), true) */,

					extend: types.SUPER(function extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, proto, protoName) {
						this._super(attr, source, sourceProto, destAttributes, forType, sourceAttribute.setValue(null), destAttribute, sourceIsProto, proto, protoName);
					}),

					init: types.SUPER(function init(attr, attributes, forType, attribute, value, generator, isProto, existingAttributes) {
						this._super(attr, attributes, forType, attribute, null, generator, isProto, existingAttributes);
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
					$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('ClonedAttributeExtender')), true) */,

					maxDepth: types.READ_ONLY(0),
					keepUnlocked: types.READ_ONLY(false),
					cloneOnInit: types.READ_ONLY(false),
					cloneOnGetValue: types.READ_ONLY(true),

					_new: types.SUPER(function _new(/*optional*/options) {
						this._super(options);
						types.setAttributes(this, {
							maxDepth: types.get(options, 'maxDepth', this.maxDepth),
							keepUnlocked: types.get(options, 'keepUnlocked', this.keepUnlocked),
							cloneOnInit: types.get(options, 'cloneOnInit', this.cloneOnInit),
							cloneOnGetValue: types.get(options, 'cloneOnGetValue', this.cloneOnGetValue),
						});
					}),

					getCacheName: types.SUPER(function getCacheName(/*optional*/options) {
						return this._super(options) +
								',' + types.get(options, 'maxDepth', this.maxDepth) +
								',' + (types.get(options, 'keepUnlocked', this.keepUnlocked) ? '1' : '0') +
								',' + (types.get(options, 'cloneOnInit', this.cloneOnInit) ? '1' : '0') +
								',' + (types.get(options, 'cloneOnGetValue', this.cloneOnGetValue) ? '1' : '0');
					}),

					overrideOptions: types.SUPER(function overrideOptions(options, newOptions, /*optional*/replace) {
						options = this._super(options, newOptions, replace);
						if (replace) {
							tools.fill(['maxDepth', 'keepUnlocked', 'cloneOnInit', 'cloneOnGetValue'], options, this, newOptions);
						} else {
							options.maxDepth = Math.max(newOptions.maxDepth | 0, this.maxDepth);
							options.keepUnlocked = !!newOptions.keepUnlocked || this.keepUnlocked;
							options.cloneOnInit = !!newOptions.cloneOnInit || this.cloneOnInit;
							options.cloneOnGetValue = !!newOptions.cloneOnGetValue || this.cloneOnGetValue;
						};
						return options;
					}),

					getValue: types.SUPER(function getValue(attr, attribute, forType) {
						if (this.cloneOnGetValue) {
							let val = types.unbox(attribute);
							if (types.isClonable(val)) {
								val = types.clone(val, this.maxDepth, false, this.keepUnlocked, true);
								attribute = attribute.setValue(val);
							};
						};
						return attribute;
					}),

					preInit: types.SUPER(function preInit(attr, attributes, forType, attribute, value, generator, isProto, existingAttributes) {
						return this._super(attr, attributes, forType, attribute, value, generator, isProto, existingAttributes) && !(this.cloneOnInit && types.isClonable(value)); // true === Cancel
					}),

					init: types.SUPER(function init(attr, attributes, forType, attribute, value, generator, isProto, existingAttributes) {
						if (this.cloneOnInit && types.isClonable(value)) {
							const valueId = generator.vars.add(value);
							value = new generator.DynamicValue("types.clone(" + valueId + ", " + tools.toSource(this.maxDepth) + ", false, " + tools.toSource(this.keepUnlocked) + ", true)");
						};

						this._super(attr, attributes, forType, attribute, value, generator, isProto, existingAttributes);
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
					$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('ExtendObjectExtender')), true) */,

					extend: types.SUPER(function extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, proto, protoName) {
						sourceAttribute = this._super(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, proto, protoName);

						let dest = types.unbox(destAttribute);
						if (!dest) {
							dest = {};
						};

						const src = types.unbox(sourceAttribute);
						if (src) {
							tools.depthExtend(this.maxDepth, dest, src);
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
					$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('UniqueArrayExtender')), true) */,

					extend: types.SUPER(function extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, proto, protoName) {
						sourceAttribute = this._super(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, proto, protoName);

						let dest = types.unbox(destAttribute);
						if (!dest) {
							dest = [];
						};

						const src = types.unbox(sourceAttribute);
						if (src) {
							tools.append(dest, src);
						};

						sourceAttribute = sourceAttribute.setValue(dest);  // preserve attribute flags of "sourceAttribute"

						return sourceAttribute;
					}),

					postExtend: types.SUPER(function postExtend(attr, destAttributes, destAttribute) {
						destAttribute = this._super(attr, destAttributes, destAttribute) || destAttribute;

						const val = types.unbox(destAttribute);
						if (!types.isNothing(val)) {
							destAttribute = destAttribute.setValue(tools.unique(val));
						};

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
						description: "Attribute extender which extends a method.",
					}
				//! END_REPLACE()
				, extenders.REGISTER([], extenders.ClonedAttribute.$inherit({
					$TYPE_NAME: "Method",
					$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('MethodExtender')), true) */,

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
										optional: false,
										description: "Attribute already present in the destination.",
									},
								},
								returns: 'function',
								description: "Template function to create a caller.",
							}
						//! END_REPLACE()
						, function callerTemplate(attr, sourceAttribute, destAttribute) {
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
							types.setAttributes(fn, values, {ignoreWhenReadOnly: true}, _shared.SECRET);

							const _caller = types.INHERIT(doodad.CallerFunction, function caller(/*paramarray*/...params) {
								//const type = types.getType(this);

								const result = types.getAttributes(this, [_shared.CurrentDispatchSymbol, _shared.CurrentCallerIndexSymbol, '_super'], null, _shared.SECRET),
									currentDispatch = result[_shared.CurrentDispatchSymbol],
									currentCaller = result[_shared.CurrentCallerIndexSymbol] + 1,
									oldSuper = result._super,
									modifiers = currentDispatch[_shared.ModifiersSymbol];

								let _super = null,
									oldCalled = false;

								try {
									// TODO: Find a better way because of RENAME_OVERRIDE and RENAME_REPLACE
									//if (!currentDispatch || (currentDispatch[_shared.NameSymbol] !== attr)) {
									//	throw new types.Error("Current dispatch and caller don't match together.");
									//};

									const callers = currentDispatch[_shared.CallersSymbol];

									if (currentCaller < callers.length) {
										_super = callers[currentCaller];
										oldCalled = _super[_shared.CalledSymbol];
										_super[_shared.CalledSymbol] = false;
									} else {
										_super = function() {};
										_super[_shared.CalledSymbol] = true;
									};
									types.setAttribute(this, '_super', _super, null, _shared.SECRET);
									types.setAttribute(this, _shared.CurrentCallerIndexSymbol, currentCaller, null, _shared.SECRET);

									const callFn = (extender.byReference ? fn : types.unbox(_caller[_shared.PrototypeSymbol][attr]));

									_caller[_shared.CalledSymbol] = true;

									let retVal = callFn.apply(this, params);

									if (modifiers & doodad.MethodModifiers.Async) {
										const Promise = types.getPromise();
										retVal = Promise.resolve(retVal);
									};

									if (__Internal__.hasPolicies) {
										if ((_caller[_shared.ModifiersSymbol] & doodad.MethodModifiers.Override) && !_super[_shared.CalledSymbol]) {
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
										}
									} else {
										if (modifiers & doodad.MethodModifiers.Async) {
											const Promise = types.getPromise();
											return Promise.reject(ex);
										} else {
											throw ex;
										}
									}

								} finally {
									types.setAttribute(this, '_super', oldSuper, null, _shared.SECRET);
									if (!types.isNothing(currentCaller)) {
										types.setAttribute(this, _shared.CurrentCallerIndexSymbol, currentCaller - 1, null, _shared.SECRET);
									};
									if (!types.isNothing(_super)) {
										_super[_shared.CalledSymbol] = oldCalled;
									};
								}
							});

							return _caller;
						}),

					validateDispatchResult: function validateDispatchResult(result, attr, async, attribute, obj, secret) {
						if (async) {
							// Asynchronous methods must always return a Promise
							const Promise = types.getPromise();
							result = Promise.resolve(result);
							if (__Internal__.hasPolicies) {
								const validator = attribute[_shared.ReturnsSymbol];
								if (validator) {
									result = result.then(function(val) {
										if (!validator.call(obj, val)) {
											throw new types.Error("Invalid returned value from method '~0~'.", [attr]);
										};
										return val;
									}, null, obj, secret);
								};
							};
						} else {
							if (__Internal__.hasPolicies) {
								const validator = attribute[_shared.ReturnsSymbol];
								// <PRB> Javascript engine calls "toString" internally. When an exception occurs inside "toString", it calls it again and again !
								if (validator && !validator.call(obj, result)) {
									if (attr === 'toString') {
										result = tools.format("Invalid returned value from method '~0~'.", [attr]);
									} else {
										throw new types.Error("Invalid returned value from method '~0~'.", [attr]);
									};
								};
							};
						};
						return result;
					},

					handleDispatchError: function handleDispatchError(ex, attr, obj) {
						const isType = types.isType(obj),
							type = (isType ? obj : types.getType(obj));
						const attributes = types.getAttribute(obj, _shared.AttributesSymbol, null, _shared.SECRET);
						const notReentrantMap = __Internal__.notReentrantMap.get(obj);
						let emitted = false;
						if (!ex.bubble /*&& !ex.trapped*/) {
							if ((types.isClass(type) || types.isInterfaceClass(type)) && obj._implements(mixIns.Events)) {
								let destroyed = false;
								if (obj._implements(mixIns.Creatable)) {
									destroyed = types.getAttribute(obj, _shared.DestroyedSymbol, null, _shared.SECRET);
								};
								if (destroyed === false) { // NOTE: Can be 'null' for "not created".
									const errorEvent = obj.__ERROR_EVENT;
									if (errorEvent && (attr !== errorEvent) && (!notReentrantMap || !notReentrantMap.get(errorEvent))) {
										const errorAttr = attributes[errorEvent];
										const onError = types.getAttribute(obj, errorEvent, null, _shared.SECRET);
										if (types.isLike(errorAttr[_shared.ExtenderSymbol], extenders.RawEvent)) {
											if (onError.getCount() > 0) {
												// <PRB> Node.Js re-emits 'error'.
												const noop = function _noop(err) {};
												try {
													onError.attachOnce(null, noop);
													emitted = types.invoke(obj, onError, [ex], _shared.SECRET);
												} catch(o) {
													throw o;
												} finally {
													onError.detach(null, noop);
												};
											} else {
												emitted = types.invoke(obj, onError, [ex], _shared.SECRET);
											};
										} else {
											const ev = new doodad.ErrorEvent(ex);
											types.invoke(obj, onError, [ev], _shared.SECRET);
											if (ev.prevent) {
												ex.trapped = true;
											};
											//if (ex.trapped) {
											//	emitted = true;
											//};
										};
									};
								};
							};
						};
						// <PRB> Node.Js doesn't trap errors. So we don't throw if the error has been emitted.
						if (!emitted) {
							throw ex;
						};
					},

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
						, function dispatchTemplate(attr, attribute, callers) {
							/* eslint consistent-return: "off" */

							const extender = this;

							const _dispatch = types.INHERIT(doodad.DispatchFunction, function dispatch(/*paramarray*/...params) {
								const type = types.getType(this),
									forType = types.isType(this),
									modifiers = _dispatch[_shared.ModifiersSymbol],
									canBeDestroyed = !!(modifiers & doodad.MethodModifiers.CanBeDestroyed),
									async = (attr !== 'toString') && (modifiers & doodad.MethodModifiers.Async); // NOTE: "toString" can't be async

								const caller = _dispatch[_shared.CallersSymbol][0];
								if (!caller) {
									// No caller
									return extender.validateDispatchResult(undefined, attr, async, attribute, this, _shared.SECRET);
								};

								if (!canBeDestroyed) {
									//if (_shared.DESTROYED(this)) {
									//	throw new types.NotAvailable("Method '~0~' of '~1~' is unavailable because object has been destroyed.", [_dispatch[_shared.NameSymbol], types.getTypeName(type) || __Internal__.ANONYMOUS]);
									//};
									if (types._implements(this, mixIns.Creatable)) {
										const destroyed = types.getAttribute(this, _shared.DestroyedSymbol, null, _shared.SECRET);
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

								const result = types.getAttributes(this, [_shared.CurrentDispatchSymbol, _shared.CurrentCallerIndexSymbol/*, _shared.AttributesSymbol*/], null, _shared.SECRET),
									oldDispatch = result[_shared.CurrentDispatchSymbol],
									oldCaller = result[_shared.CurrentCallerIndexSymbol];
								//attributes = result[_shared.AttributesSymbol];

								const host = (types.baseof(doodad.Interface, type) ? this[_shared.HostSymbol] : null);
								//hostType = types.getType(host);

								if (__Internal__.hasScopes) {
									// Private methods
									if (!__Internal__.isInside(this)) {
										if ((attribute[_shared.ScopeSymbol] === doodad.Scopes.Private) && oldDispatch && (oldDispatch[_shared.CallersSymbol][oldCaller - 1][_shared.PrototypeSymbol] !== caller[_shared.PrototypeSymbol])) {
											throw new types.Error("Method '~0~' of '~1~' is private.", [_dispatch[_shared.NameSymbol], types.getTypeName(caller[_shared.PrototypeSymbol][_shared.TypeSymbol]) || __Internal__.ANONYMOUS]);
										};
									};

									// Non-public methods
									if ((!host && !__Internal__.isInside(this)) || (host && !__Internal__.isInside(this) && !__Internal__.isInside(host))) {
										if ((attribute[_shared.ScopeSymbol] !== doodad.Scopes.Public) && !oldDispatch) {
											throw new types.Error("Method '~0~' of '~1~' is not public.", [_dispatch[_shared.NameSymbol], types.getTypeName(type) || __Internal__.ANONYMOUS]);
										};
									};
								};

								if (__Internal__.hasPolicies) {
									// External methods (can't be called internally)
									if (extender.isExternal && __Internal__.isInside(this)) {
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
								if ((modifiers & doodad.MethodModifiers.Obsolete) && !_dispatch[_shared.ObsoleteWarnedSymbol]) {
									tools.log(tools.LogLevels.Warning, "Method '~0~' of '~1~' is obsolete. ~2~", [_dispatch[_shared.NameSymbol], types.getTypeName(type) || __Internal__.ANONYMOUS, attribute[_shared.UsageMessageSymbol] || '']);
									_dispatch[_shared.ObsoleteWarnedSymbol] = true;
								};

								// Non-reentrant methods
								const notReentrant = extender.notReentrant || (attr === 'toString');

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
										}
									};
								};

								const oldCallerCalled = caller[_shared.CalledSymbol];

								//let oldHostDispatch,
								//	oldHostCaller;

								//if (host) {
								//	const result = types.getAttributes(host, [_shared.CurrentDispatchSymbol, _shared.CurrentCallerIndexSymbol], null, _shared.SECRET);
								//	oldHostDispatch = result[_shared.CurrentDispatchSymbol];
								//	oldHostCaller = result[_shared.CurrentCallerIndexSymbol];
								//};

								let retVal = undefined;

								const oldInside = __Internal__.setInside(this, _shared.SECRET, true);

								try {
									const values = {
										[_shared.CurrentDispatchSymbol]: _dispatch,
										[_shared.CurrentCallerIndexSymbol]: 0,
									};
									types.setAttributes(this, values, null, _shared.SECRET);

									//if (host) {
									//	types.setAttributes(host, values, null, _shared.SECRET);
									//};

									//										_dispatch[_shared.SuperAsyncSymbol] = false;

									if (notReentrant) {
										notReentrantMap.set(attr, true);
									};

									caller[_shared.CalledSymbol] = false;

									retVal = caller.apply(this, params);

									//									if (!_dispatch[_shared.SuperAsyncSymbol]) {
									retVal = extender.validateDispatchResult(retVal, attr, async, attribute, this, _shared.SECRET);
									//									};

								} catch(ex) {
									if (attr === 'toString') {
										// <PRB> Javascript engine calls "toString" internally. When an exception occurs inside "toString", it calls it again and again !
										try {
											retVal = "Error: " + types.toString(ex);
										} catch(o) {
											retVal = "Internal error";
										};
									} else {
										if (async) {
											// Asynchronous methods must always return a Promise
											const Promise = types.getPromise();
											retVal = Promise.reject(ex);
										} else {
											extender.handleDispatchError(ex, attr, this);
										};
									};

								} finally {
									//									if (!_dispatch[_shared.SuperAsyncSymbol]) {
									if (notReentrant) {
										if (async && retVal) {
											const self = this;
											retVal = retVal.nodeify(_shared.PromiseCallback(null, function resetCalled(err, result) {
												notReentrantMap.set(attr, false);
												if (err) {
													return extender.handleDispatchError(err, attr, self);
												} else {
													return result;
												};
											}));
										} else {
											notReentrantMap.set(attr, false);
										};
									} else if (async && retVal) {
										const self = this;
										retVal = retVal.catch(_shared.PromiseCallback(null, function(err) {
											return extender.handleDispatchError(err, attr, self);
										}));
									};
									//									};

									if (oldInside) {
										__Internal__.restoreInside(oldInside);
									};

									caller[_shared.CalledSymbol] = oldCallerCalled;

									const values = {
										[_shared.CurrentDispatchSymbol]: oldDispatch,
										[_shared.CurrentCallerIndexSymbol]: oldCaller,
									};
									types.setAttributes(this, values, null, _shared.SECRET);

									//if (host) {
									//	const values = {
									//		[_shared.CurrentDispatchSymbol]: oldHostDispatch,
									//		[_shared.CurrentCallerIndexSymbol]: oldHostCaller,
									//	};
									//	types.setAttributes(host, values, null, _shared.SECRET);
									//};
								};

								return retVal;
							});

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
										optional: false,
										description: "Attribute already present in the destination.",
									},
								},
								returns: 'function',
								description: "Creates a caller from the template.",
							}
						//! END_REPLACE()
						, function createCaller(attr, sourceAttribute, destAttribute) {
							const fn = types.unbox(sourceAttribute);

							if (root.DD_ASSERT) {
								root.DD_ASSERT(types.isJsFunction(fn), "Invalid function.");
							};

							const caller = this.callerTemplate(attr, sourceAttribute, destAttribute);

							caller[_shared.CalledSymbol] = false;

							const values = {
								[_shared.PrototypeSymbol]: sourceAttribute[_shared.PrototypeSymbol],
								[_shared.ModifiersSymbol]: (sourceAttribute[_shared.ModifiersSymbol] || 0),
								[_shared.PositionSymbol]: sourceAttribute[_shared.PositionSymbol],
								[_shared.UsageMessageSymbol]: sourceAttribute[_shared.UsageMessageSymbol],
							};
							types.setAttributes(caller, values, {});

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

							types.setAttribute(dispatch, _shared.NameSymbol, attr, {});
							types.setAttribute(dispatch, _shared.CallersSymbol, callers, {});

							let modifiers = attribute[_shared.ModifiersSymbol] || 0;

							// Clear "MustOverride" if method has been overriden
							let caller = callers[0];
							if (caller && !((caller[_shared.ModifiersSymbol] || 0) & doodad.MethodModifiers.MustOverride)) {
								caller = (callers.length > attribute[_shared.CallFirstLengthSymbol]) && callers[attribute[_shared.CallFirstLengthSymbol]];
								if (!caller || !((caller[_shared.ModifiersSymbol] || 0) & doodad.MethodModifiers.MustOverride)) {
									modifiers &= ~doodad.MethodModifiers.MustOverride;
								};
							};

							types.setAttribute(dispatch, _shared.ModifiersSymbol, modifiers, {});

							return dispatch;
						}),

					_new: types.SUPER(function _new(/*optional*/options) {
						this._super(options);
						types.setAttributes(this, {
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
							tools.fill(['bindMethod', 'notReentrant', 'byReference', 'isExternal'], options, this, newOptions);
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

						const callersIsFn = types.isNothing(callersOrFn) || types.isJsFunction(callersOrFn);

						if (root.DD_ASSERT) {
							if (sourceIsProto) {
								root.DD_ASSERT(callersIsFn, "Invalid source value.");
							} else {
								root.DD_ASSERT(callersIsFn || types.isArray(callersOrFn), "Invalid source value.");
							};
						};

						let destCallers = types.unbox(destAttribute);
						const hasDestCallers = types.isArray(destCallers);
						if (hasDestCallers) {
							if (types.isFrozen(destCallers)) {
								destCallers = tools.append([], destCallers);
								destAttribute = destAttribute.setValue(destCallers);  // copy attribute flags of "destAttribute"
							};
						} else {
							destCallers = [];
							destAttribute = sourceAttribute.setValue(destCallers);  // copy attribute flags of "sourceAttribute"
						};

						let replacedCallers = sourceAttribute[_shared.ReplacedCallersSymbol];
						if (replacedCallers) {
							replacedCallers = tools.unique(replacedCallers);
							destAttribute[_shared.ReplacedCallersSymbol] = replacedCallers;
						} else {
							replacedCallers = destAttribute[_shared.ReplacedCallersSymbol] || [];
						};

						let modifiers = ((destAttribute[_shared.ModifiersSymbol] || 0) & _shared.preservedMethodModifiers) | (sourceAttribute[_shared.ModifiersSymbol] || 0);

						if (hasDestCallers && !srcIsInterface && (!sourceIsProto || (modifiers & (doodad.MethodModifiers.Override | doodad.MethodModifiers.Replace)))) {
							// Override or replace
							let start = destAttribute[_shared.CallFirstLengthSymbol];
							if (callersOrFn) {
								if (sourceIsProto) {
									if (__Internal__.hasPolicies) {
										if (destAttribute[_shared.ScopeSymbol] === doodad.Scopes.Private) {
											throw new types.Error("Private method '~0~' of '~1~' can't be overridden or replaced.", [attr, protoName || __Internal__.ANONYMOUS]);
										};
									};
									const caller = this.createCaller(attr, sourceAttribute, destAttribute);
									callersOrFn = [caller];
								};
								let toRemove = 0;
								let caller = callersOrFn[start - 1];
								let callerModifiers = caller && caller[_shared.ModifiersSymbol] || 0;
								if ((callerModifiers & (doodad.MethodModifiers.CallFirst | doodad.MethodModifiers.Replace)) === (doodad.MethodModifiers.CallFirst | doodad.MethodModifiers.Replace)) {
									// Replace "call firsts"
									if (sourceIsProto) {
										toRemove = start;
									};
									start = 0;
								};
								caller = callersOrFn[callersOrFn.length - 1];
								callerModifiers = caller && caller[_shared.ModifiersSymbol] || 0;
								if (sourceIsProto && ((callerModifiers & (doodad.MethodModifiers.CallFirst | doodad.MethodModifiers.Replace)) === doodad.MethodModifiers.Replace)) {
									// Replace non "call firsts"
									toRemove = destCallers.length - start;
								};
								const removed = _shared.Natives.arraySpliceApply(destCallers, tools.append([start, toRemove], callersOrFn));
								destAttribute[_shared.ReplacedCallersSymbol] = tools.append(replacedCallers, removed);
								destAttribute[_shared.CallFirstLengthSymbol] = start + (sourceAttribute[_shared.CallFirstLengthSymbol] || 0);
							};
						} else {
							// Create
							if (sourceIsProto || callersIsFn) {
								if (__Internal__.hasPolicies) {
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
								if (callersOrFn && (sourceAttribute[_shared.PrototypeSymbol] === sourceProto)) {
									if (__Internal__.hasPolicies) {
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
									tools.append(destCallers, callersOrFn);
								};
								destAttribute[_shared.CallFirstLengthSymbol] = ((modifiers & doodad.MethodModifiers.CallFirst) ? 1 : sourceAttribute[_shared.CallFirstLengthSymbol] || 0);
							};
						};

						if (!srcIsInterface) {
							destAttribute[_shared.ModifiersSymbol] = modifiers;
							destAttribute[_shared.ReturnsSymbol] = (sourceAttribute[_shared.ReturnsSymbol] || destAttribute[_shared.ReturnsSymbol]);
							destAttribute[_shared.UsageMessageSymbol] = (sourceAttribute[_shared.UsageMessageSymbol] || destAttribute[_shared.UsageMessageSymbol]);
							destAttribute[_shared.RenamedToSymbol] = sourceAttribute[_shared.RenamedToSymbol];
						};

						return destAttribute;
					}),

					postExtend: root.DD_DOC(
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

							const replacedCallers = destAttribute[_shared.ReplacedCallersSymbol] || [];

							// Remove duplicated callers and update "call first" length
							destAttribute[_shared.CallFirstLengthSymbol] = callers.length;

							let i = 0;

							while (i < callers.length) {
								const callerI = callers[i];
								const modifiersI = callerI[_shared.ModifiersSymbol];
								if (!(modifiersI & doodad.MethodModifiers.CallFirst)) {
									destAttribute[_shared.CallFirstLengthSymbol] = i;
									break;
								};
								const protoI = callerI[_shared.PrototypeSymbol];
								const typeI = protoI[_shared.TypeSymbol];
								let deleted = false;
								for (let j = 0; j < replacedCallers.length; j++) {
									const callerJ = replacedCallers[j];
									const protoJ = callerJ[_shared.PrototypeSymbol];
									//const typeJ = protoJ[_shared.TypeSymbol];
									if ((protoJ === protoI) || types.baseof(protoJ, protoI)) {
										callers.splice(i, 1);
										deleted = true;
										break;
									};
								};
								if (!deleted) {
									let j = i + 1;
									while (j < callers.length) {
										const callerJ = callers[j];
										const protoJ = callerJ[_shared.PrototypeSymbol];
										const typeJ = protoJ[_shared.TypeSymbol];
										if ((typeJ === typeI) || types.baseof(typeJ, typeI)) {
											callers.splice(j, 1);
										} else {
											j++;
										};
									};
									i++;
								};
							};

							i = callers.length - 1;
							while (i >= destAttribute[_shared.CallFirstLengthSymbol]) {
								const callerI = callers[i];
								const protoI = callerI[_shared.PrototypeSymbol];
								const typeI = protoI[_shared.TypeSymbol];
								let deleted = false;
								for (let j = 0; j < replacedCallers.length; j++) {
									const callerJ = replacedCallers[j];
									const protoJ = callerJ[_shared.PrototypeSymbol];
									const typeJ = protoJ[_shared.TypeSymbol];
									if ((typeJ === typeI) || types.baseof(typeJ, typeI)) {
										callers.splice(i, 1);
										deleted = true;
										break;
									};
								};
								if (!deleted) {
									let j = i - 1;
									while (j >= destAttribute[_shared.CallFirstLengthSymbol]) {
										const callerJ = callers[j];
										const protoJ = callerJ[_shared.PrototypeSymbol];
										const typeJ = protoJ[_shared.TypeSymbol];
										if ((typeJ === typeI) || types.baseof(typeJ, typeI)) {
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
									positionI = callerI[_shared.PositionSymbol];

								let found = false;

								if (positionI && !positionI[_shared.OkSymbol]) {
									for (let j = 0; j < callers.length; j++) {
										const callerJ = callers[j];
										const protoJ = callerJ[_shared.PrototypeSymbol];
										const typeJ = protoJ[_shared.TypeSymbol];
										if ((i !== j) && (typeJ === positionI.cls)) {
											let pos = j;
											if (positionI.position > 0) {
												pos++;
											};
											let toRemove = 0;
											if (positionI.position === 0) {
												toRemove = 1;
											};
											_shared.Natives.arraySpliceCall(callers, i, 1);
											if (i < destAttribute[_shared.CallFirstLengthSymbol]) {
												destAttribute[_shared.CallFirstLengthSymbol]--;
											};
											if (pos > i) {
												pos--;
											};
											_shared.Natives.arraySpliceCall(callers, pos, toRemove, callerI);
											if (pos < destAttribute[_shared.CallFirstLengthSymbol]) {
												destAttribute[_shared.CallFirstLengthSymbol]++;
											};
											positionI[_shared.OkSymbol] = true;
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
									positionI = callerI[_shared.PositionSymbol];
								if (positionI) {
									//delete positionI[_shared.OkSymbol];
									positionI[_shared.OkSymbol] = false;
								};
							};

							types.freezeObject(callers);

							return destAttribute;
						})),

					preInit: types.SUPER(function preInit(attr, attributes, forType, attribute, value, generator, isProto, existingAttributes) {
						return this._super(attr, attributes, forType, attribute, value, generator, isProto, existingAttributes) && !(this.bindMethod && !types.isNothing(value)); // true === Cancel
					}),

					init: types.SUPER(function init(attr, attributes, forType, attribute, value, generator, isProto, existingAttributes) {
						const attrId = generator.vars.add(attr);

						if (this.bindMethod && !types.isNothing(value)) {
							const extender = this;
							const extenderId = generator.vars.add(extender);
							const attributeId = generator.vars.add(attribute);
							const valueId = generator.vars.add(value);
							const dispatch = new generator.DynamicValue(extenderId + ".createDispatch(" + attrId + ", " + generator.objId + ", " + attributeId + ", " + valueId + ")");
							const dispatchId = generator.vars.add(dispatch);
							value = new generator.DynamicValue("types.INHERIT(" + dispatchId + ", types.bind(" + generator.objId + ", " + dispatchId + "))");
							dispatch.release();
						} else {
							const extender = this;
							const extenderId = generator.vars.add(extender);
							const attributeId = generator.vars.add(attribute);
							const valueId = generator.vars.add(value);
							value = new generator.DynamicValue(extenderId + ".createDispatch(" + attrId + ", " + generator.objId + ", " + attributeId + ", " + valueId + ")");
						};

						this._super(attr, attributes, forType, attribute, value, generator, isProto, existingAttributes);

						if (__Internal__.hasPolicies) {
							const valueId = generator.vars.fromKey(attr);
							const symbolModifiersId = generator.vars.add(_shared.ModifiersSymbol);
							const symbolMustOverrideId = generator.vars.add(_shared.MustOverrideSymbol);

							generator.code.add(
								"if (" + valueId + "[" + symbolModifiersId + "] & doodad.MethodModifiers.MustOverride) {" +
										"if (!" + generator.storageId + "[" + symbolMustOverrideId + "]) {" +
											generator.storageId + "[" + symbolMustOverrideId + "] = " + attrId + ";" +
										"};" +
									"};"
							);
						};
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
					$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('JsMethodExtender')), true) */,

					dontSetSuper: types.READ_ONLY(false),

					_new: types.SUPER(function _new(/*optional*/options) {
						this._super(options);
						types.setAttributes(this, {
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
							tools.fill(['dontSetSuper'], options, this, newOptions);
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

						const _caller = tools.nullObject();

						fn = types.INHERIT(doodad.CallerFunction, fn);

						_caller[_shared.FunctionSymbol] = fn;

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
								_caller = function caller(/*paramarray*/...params) {
									const oldSuper = types.getAttribute(this, '_super', null, _shared.SECRET);
									try {
										return fnApply(this, params);
									} catch(ex) {
										throw ex;
									} finally {
										types.setAttribute(this, '_super', oldSuper, null, _shared.SECRET);
									}
								};
							} else {
								_super = _super || (function() {
									// Do nothing
								});
								_caller = function caller(/*paramarray*/...params) {
									const oldSuper = types.getAttribute(this, '_super', null, _shared.SECRET);
									types.setAttribute(this, '_super', _super, null, _shared.SECRET);
									try {
										return fnApply(this, params);
									} catch(ex) {
										throw ex;
									} finally {
										types.setAttribute(this, '_super', oldSuper, null, _shared.SECRET);
									}
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

							_super = this.jsCallerTemplate(attr, caller[_shared.FunctionSymbol], _super);

							types.setAttribute(_super, _shared.PrototypeSymbol, caller[_shared.PrototypeSymbol], {});
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
							if (__Internal__.hasPolicies) {
								if (destAttribute[_shared.ScopeSymbol] === doodad.Scopes.Private) {
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
								const protoI = callerI[_shared.PrototypeSymbol];
								const typeI = protoI[_shared.TypeSymbol];

								let j = i - 1;
								while (j >= 0) {
									const callerJ = callers[j];
									const protoJ = callerJ[_shared.PrototypeSymbol];
									const typeJ = protoJ[_shared.TypeSymbol];
									if ((typeJ === typeI) || types.baseof(typeJ, typeI)) {
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
					$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('PropertyExtender')), true) */,

					isReadOnly: types.READ_ONLY(false),
					bindMethod: types.READ_ONLY(true),

					extend: types.SUPER(function extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, proto, protoName) {
						sourceAttribute = extenders.Attribute.extend.call(this, attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, proto, protoName);

						const srcDesc = types.unbox(sourceAttribute);

						if (types.isNothing(srcDesc)) {
							return sourceAttribute;
						};

						let destDesc;

						if (types.isNothing(destAttribute)) {
							destDesc = {};
						} else {
							destDesc = types.unbox(destAttribute);
						};

						const srcGet = types.get(srcDesc, 'get', null);
						const srcSet = types.get(srcDesc, 'set', null);
						const destGet = types.get(destDesc, 'get', null);
						const destSet = types.get(destDesc, 'set', null);

						if (types.has(destDesc, 'value')) {
							(function(srcGet, srcSet, destGet, destSet, destVal) {
								if (srcGet && !destGet) {
									destGet = function get(value) {
										return destVal;
									};
								};
								if (srcSet && !destSet) {
									destSet = function set(value) {
										destVal = value;
									};
								};
							})(srcGet, srcSet, destGet, destSet, destDesc.value);
						};

						const descriptor = tools.extend({}, srcDesc);

						if (srcGet) {
							descriptor.get = this._super(attr, source, sourceProto, destAttributes, forType, types.AttributeBox(srcGet), types.AttributeBox(destGet), sourceIsProto);
						};

						if (srcSet) {
							descriptor.set = this._super(attr, source, sourceProto, destAttributes, forType, types.AttributeBox(srcSet), types.AttributeBox(destSet), sourceIsProto);
						};

						return sourceAttribute.setValue(descriptor);  // copy attribute flags of "sourceAttribute"
					}),

					//preInit: function preInit(attr, attributes, forType, attribute, value, generator, isProto, existingAttributes) {
					//		return false; // true === Cancel
					//	},
					preInit: types.READ_ONLY(null),

					init: function init(attr, attributes, forType, attribute, value, generator, isProto, existingAttributes) {
						if (tools.indexOf(existingAttributes, attr) >= 0) {
							throw new types.Error("Property attributes can't be extended within an expandable object.");
						};

						const extenderId = generator.vars.add(this);
						const attrId = generator.vars.add(attr);
						const attributeId = generator.vars.add(attribute);

						const valueId = generator.vars.add(value);
						const descriptorId = generator.vars.add(new generator.DynamicValue("tools.extend({}, " + valueId + ")"));

						const get = types.get(value, 'get');
						if (get) {
							const getId = generator.vars.add(types.unbox(get));
							const dispatch = new generator.DynamicValue(extenderId + ".createDispatch(" + attrId + ", " + generator.objId + ", " + attributeId + ", " + getId + ")");
							let dispatchId = generator.vars.add(dispatch);
							if (this.bindMethod) {
								const newDispatch = new generator.DynamicValue("types.INHERIT(" + dispatchId + ", types.bind(" + generator.objId + ", " + dispatchId + "))");
								dispatch.release();
								dispatchId = generator.vars.add(newDispatch);
							};
							generator.code.add(descriptorId + ".get = " + dispatchId);
						};

						const set = types.get(value, 'set');
						if (set) {
							const setId = generator.vars.add(types.unbox(set));
							const dispatch = new generator.DynamicValue(extenderId + ".createDispatch(" + attrId + ", " + generator.objId + ", " + attributeId + ", " + setId + ")");
							let dispatchId = generator.vars.add(dispatch);
							if (this.bindMethod) {
								const newDispatch = new generator.DynamicValue("types.INHERIT(" + dispatchId + ", types.bind(" + generator.objId + ", " + dispatchId + "))");
								dispatch.release();
								dispatchId = generator.vars.add(newDispatch);
							};
							generator.code.add(descriptorId + ".set = " + dispatchId);
						};

						generator.code.add(descriptorId + ".enumerable = " + tools.toSource(this.isEnumerable));

						if (get || set) {
							generator.code.add(descriptorId + ".configurable = false");
						} else {
							generator.code.add(descriptorId + ".configurable = " + tools.toSource(this.isReadOnly));
							generator.code.add(descriptorId + ".writable = " + tools.toSource(!this.isReadOnly));
						};

						generator.define(attrId, descriptorId);
					},

					remove: types.SUPER(function remove(attr, obj, storage, forType, attribute) {
						extenders.ClonedAttribute.remove.call(this, attr, obj, storage, forType, attribute);
					}),
				})));

			//==================================
			// Scopes
			//==================================

			doodad.ADD('Scopes', types.freezeObject(tools.nullObject({
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
					value[_shared.ScopeSymbol] = doodad.Scopes.Public;
					if (extender) {
						value[_shared.ExtenderSymbol] = extender;
					};
					return value;
				}));

			doodad.ADD('PROTECTED', (__options__.publicOnDebug && root.getOptions().debug ? doodad.PUBLIC : root.DD_DOC(
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
					value[_shared.ScopeSymbol] = doodad.Scopes.Protected;
					if (extender) {
						value[_shared.ExtenderSymbol] = extender;
					};
					return value;
				})));

			doodad.ADD('PRIVATE', (__options__.publicOnDebug && root.getOptions().debug ? doodad.PUBLIC : root.DD_DOC(
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
					value[_shared.ScopeSymbol] = doodad.Scopes.Private;
					if (extender) {
						value[_shared.ExtenderSymbol] = extender;
					};
					return value;
				})));

			//==================================
			// Class Modifiers
			//==================================

			// Can be combined
			doodad.ADD('ClassModifiers', types.freezeObject(tools.nullObject({
				Base: 1,
				MixIn: 2,
				Interface: 4,
				Sealed: 8,
				Static: 16,
				Singleton: 32,
				Isolated: 64,
				Expandable: 128,
			})));

			_shared.preservedClassModifiers = doodad.ClassModifiers.MixIn | doodad.ClassModifiers.Interface | doodad.ClassModifiers.Sealed | doodad.ClassModifiers.Static;

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
					types.setAttribute(cls, _shared.ModifiersSymbol, (cls[_shared.ModifiersSymbol] || 0) | doodad.ClassModifiers.Base, {configurable: true}, _shared.SECRET);
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
					if (__Internal__.hasPolicies) {
						const base = types.getBase(cls);
						if (!types.is(base, doodad.Class) && !types.isMixIn(base)) {
							throw new types.Error("Mix-ins must be based on 'doodad.Class' or another mix-in.");
						};
					};
					if (types.isInitialized(cls)) {
						throw new types.Error("Class '" + (types.getTypeName(cls) || __Internal__.ANONYMOUS) + "' is initialized.");
					};
					types.setAttribute(cls, _shared.ModifiersSymbol, ((cls[_shared.ModifiersSymbol] || 0) & ~doodad.ClassModifiers.Interface) | doodad.ClassModifiers.MixIn, {configurable: true}, _shared.SECRET);
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
					if (__Internal__.hasPolicies) {
						const base = types.getBase(cls);
						if (!types.is(base, doodad.Class) && !types.isInterface(base)) {
							throw new types.Error("Interfaces must be based on 'doodad.Class' or another mix-in.");
						};
					};
					if (types.isInitialized(cls)) {
						throw new types.Error("Class '" + (types.getTypeName(cls) || __Internal__.ANONYMOUS) + "' is initialized.");
					};
					types.setAttribute(cls, _shared.ModifiersSymbol, ((cls[_shared.ModifiersSymbol] || 0) & ~doodad.ClassModifiers.MixIn) | doodad.ClassModifiers.Interface, {configurable: true}, _shared.SECRET);
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
					types.setAttribute(cls, _shared.ModifiersSymbol, (cls[_shared.ModifiersSymbol] || 0) | doodad.ClassModifiers.Sealed, {configurable: true}, _shared.SECRET);
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
					types.setAttribute(cls, _shared.ModifiersSymbol, (cls[_shared.ModifiersSymbol] || 0) | doodad.ClassModifiers.Static, {configurable: true}, _shared.SECRET);
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
					if (__Internal__.hasPolicies) {
						if (!types.isInterface(cls) && !types.isMixIn(cls)) {
							throw new types.Error("Isolation can only be applied on interfaces and mix-ins.");
						};
					};
					if (types.isInitialized(cls)) {
						throw new types.Error("Class '" + (types.getTypeName(cls) || __Internal__.ANONYMOUS) + "' is initialized.");
					};
					types.setAttribute(cls, _shared.ModifiersSymbol, (cls[_shared.ModifiersSymbol] || 0) | doodad.ClassModifiers.Isolated, {configurable: true}, _shared.SECRET);
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
					if (__Internal__.hasPolicies) {
						if (types.isInterface(cls) || types.isMixIn(cls)) {
							throw new types.Error("Expandable can't be applied on interfaces and mix-ins.");
						};
					};
					if (types.isInitialized(cls)) {
						throw new types.Error("Class '" + (types.getTypeName(cls) || __Internal__.ANONYMOUS) + "' is initialized.");
					};
					types.setAttribute(cls, _shared.ModifiersSymbol, (cls[_shared.ModifiersSymbol] || 0) | doodad.ClassModifiers.Expandable, {configurable: true}, _shared.SECRET);
					return cls;
				}));

			//===================================
			// Attribute modifiers
			//===================================

			doodad.ADD('WHEN', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 1,
						params: {
							type: {
								type: 'Class,Interface,arrayof(Class,Interface)',
								optional: false,
								descripion: "Class or interface type.",
							},
							value: {
								type: 'AttributeBox,any',
								optional: true,
								description: "Value or attribute.",
							},
						},
						returns: 'AttributeBox',
						description: "Specifies that the attribute is skipped until every specified types gets implemented.",
					}
				//! END_REPLACE()
				, function WHEN(type, /*optional*/value) {
					value = types.AttributeBox(value);
					value[_shared.WhenSymbol] = tools.unique(value[_shared.WhenSymbol], (types.isArrayLike(type) ? type : [type]));
					return value;
				}));


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

					let oldExtender = value[_shared.ExtenderSymbol];
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

					value[_shared.ExtenderSymbol] = oldExtender;
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
						extender = value[_shared.ExtenderSymbol];
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
						value[_shared.ExtenderSymbol] = extender;
						return value;
					}
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
						description: "Specifies that an attribute is read-only (the opposite of 'doodad.WRITABLE').",
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
						description: "Specifies that an attribute is writable (the opposite of 'doodad.READ_ONLY'). That's the default behavior.",
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
						if (types.is(fn[_shared.ExtenderSymbol], extenders.Method)) {
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
						}
					} else {
						return fn;
					}
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
					value[_shared.PositionSymbol] = {
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
			doodad.ADD('MethodModifiers', types.freezeObject(tools.nullObject({
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

			_shared.preservedMethodModifiers = doodad.MethodModifiers.Obsolete | doodad.MethodModifiers.CanBeDestroyed | doodad.MethodModifiers.Async;

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
				, function REPLACE(/*<<< optional[_interface]*/ /*optional fn*/...args) {
					let _interface = null,
						fn;
					if (args.length > 1) {
						_interface = args[0];
						fn = args[1];
					} else {
						fn = args[0];
					};
					if (root.DD_ASSERT) {
						root.DD_ASSERT(types.isNothing(_interface) || types.isInterface(_interface) || types.isMixIn(_interface), "Invalid interface or mix-in.");
					};
					fn = doodad.METHOD(fn);
					fn[_shared.ModifiersSymbol] = ((fn[_shared.ModifiersSymbol] || 0) & ~doodad.MethodModifiers.Override) | doodad.MethodModifiers.Replace;
					fn[_shared.InterfaceSymbol] = _interface;
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
				, function OVERRIDE(/*<<< optional[_interface]*/ /*optional fn*/ ...args) {
					let _interface = null,
						fn;
					if (args.length > 1) {
						_interface = args[0];
						fn = args[1];
					} else {
						fn = args[0];
					}
					if (root.DD_ASSERT) {
						root.DD_ASSERT(types.isNothing(_interface) || types.isInterface(_interface) || types.isMixIn(_interface), "Invalid interface or mix-in.");
					};
					fn = doodad.METHOD(fn);
					fn[_shared.ModifiersSymbol] = ((fn[_shared.ModifiersSymbol] || 0) & ~doodad.MethodModifiers.Replace) | doodad.MethodModifiers.Override;
					fn[_shared.InterfaceSymbol] = _interface;
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
				, function CREATE_REPLACE(/*<<< optional[_interface]*/ /*optional[fn]*/...args) {
					const fn = doodad.REPLACE(...args);
					fn[_shared.ModifiersSymbol] = (fn[_shared.ModifiersSymbol] || 0) | doodad.MethodModifiers.ForceCreate;
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
				, function CREATE_OVERRIDE(/*<<< optional[_interface]*/ /*optional[fn]*/...args) {
					const fn = doodad.OVERRIDE(...args);
					fn[_shared.ModifiersSymbol] = (fn[_shared.ModifiersSymbol] || 0) | doodad.MethodModifiers.ForceCreate;
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
					fn[_shared.ModifiersSymbol] = (fn[_shared.ModifiersSymbol] || 0) | doodad.MethodModifiers.MustOverride;
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
				, function OBSOLETE(/* <<< optional[message], optional[fn]*/...args) {
					const argsLen = args.length;
					let fn = args[argsLen - 1];
					const message = args[argsLen - 2];
					fn = doodad.METHOD(fn);
					fn[_shared.ModifiersSymbol] = (fn[_shared.ModifiersSymbol] || 0) | doodad.MethodModifiers.Obsolete;
					fn[_shared.UsageMessageSymbol] = message;
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
					fn[_shared.ModifiersSymbol] = (fn[_shared.ModifiersSymbol] || 0) | doodad.MethodModifiers.CallFirst;
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
					fn[_shared.ModifiersSymbol] = (fn[_shared.ModifiersSymbol] || 0) | doodad.MethodModifiers.CanBeDestroyed;
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
					fn[_shared.ModifiersSymbol] = (fn[_shared.ModifiersSymbol] || 0) | doodad.MethodModifiers.NotImplemented;
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
					fn[_shared.ReturnsSymbol] = validator;
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
					fn[_shared.ModifiersSymbol] = (fn[_shared.ModifiersSymbol] || 0) | doodad.MethodModifiers.Async;
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
				, function RENAME_OVERRIDE(/*<<< optional[name], optional[fn]*/...args) {
					let name = null;
					let fn = args[0];
					if (args.length > 1) {
						name = fn;
						fn = args[1];
					};
					fn = doodad.METHOD(fn);
					const val = types.unbox(fn);
					if (!name) {
						name = types.getFunctionName(val);
						if (!name) {
							throw new types.ValueError("A function name is required.");
						};
					};
					fn[_shared.ModifiersSymbol] = ((fn[_shared.ModifiersSymbol] || 0) & ~doodad.MethodModifiers.Replace) | doodad.MethodModifiers.Override;
					fn[_shared.RenamedToSymbol] = name;
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
				, function RENAME_REPLACE(/*<<< optional[name]*/ /*optional[fn]*/...args) {
					let name = null;
					let fn = args[0];
					if (args.length > 1) {
						name = fn;
						fn = args[1];
					};
					fn = doodad.METHOD(fn);
					const val = types.unbox(fn);
					if (!name) {
						name = types.getFunctionName(val);
						if (!name) {
							throw new types.ValueError("A function name is required.");
						};
					};
					fn[_shared.ModifiersSymbol] = ((fn[_shared.ModifiersSymbol] || 0) & ~doodad.MethodModifiers.Override) | doodad.MethodModifiers.Replace;
					fn[_shared.RenamedToSymbol] = name;
					return fn;
				}));

			//==================================
			// Class
			//==================================

			__Internal__.defaultAttributes = types.freezeObject(tools.nullObject({
				[_shared.AttributesSymbol]: doodad.PRIVATE(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PERSISTENT(doodad.PRE_EXTEND(doodad.TYPE(doodad.INSTANCE(doodad.ATTRIBUTE(null, extenders.Attribute, {isEnumerable: false, isProto: null})))))))),
				[_shared.AttributesStorageSymbol]: doodad.PRIVATE(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PERSISTENT(doodad.PRE_EXTEND(doodad.TYPE(doodad.INSTANCE(doodad.ATTRIBUTE(null, extenders.Attribute, {isEnumerable: false, isProto: null})))))))),
				[_shared.PrototypeSymbol]: doodad.PRIVATE(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PERSISTENT(doodad.PRE_EXTEND(doodad.TYPE(doodad.ATTRIBUTE(null, extenders.Attribute, {isEnumerable: false}))))))),
				[_shared.ModifiersSymbol]: doodad.PUBLIC(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PERSISTENT(doodad.PRE_EXTEND(doodad.TYPE(doodad.ATTRIBUTE(0, extenders.Attribute, {isEnumerable: false}))))))),
				[_shared.ImplementsSymbol]: doodad.PRIVATE(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PERSISTENT(doodad.PRE_EXTEND(doodad.TYPE(doodad.INSTANCE(doodad.ATTRIBUTE(null, extenders.Attribute, {isEnumerable: false, isProto: null})))))))),
				[_shared.BaseSymbol]: doodad.PUBLIC(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PRE_EXTEND(doodad.TYPE(doodad.ATTRIBUTE(null, extenders.Attribute, {isEnumerable: false})))))),
				[_shared.MustOverrideSymbol]: doodad.PUBLIC(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PRE_EXTEND(doodad.TYPE(doodad.INSTANCE(doodad.ATTRIBUTE(null, extenders.Null, {isEnumerable: false}))))))),
				[_shared.CurrentDispatchSymbol]: doodad.PRIVATE(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PERSISTENT(doodad.PRE_EXTEND(doodad.TYPE(doodad.INSTANCE(doodad.ATTRIBUTE(null, extenders.Null, {isEnumerable: false})))))))),
				[_shared.CurrentCallerIndexSymbol]: doodad.PRIVATE(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PERSISTENT(doodad.PRE_EXTEND(doodad.TYPE(doodad.INSTANCE(doodad.ATTRIBUTE(null, extenders.Null, {isEnumerable: false})))))))),
				[_shared.InitInstanceSymbol]: doodad.PRIVATE(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PERSISTENT(doodad.PRE_EXTEND(doodad.TYPE(doodad.ATTRIBUTE(null, extenders.Null, {isEnumerable: false}))))))),
				[_shared.ToInitializeSymbol]: doodad.PRIVATE(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PERSISTENT(doodad.PRE_EXTEND(doodad.TYPE(doodad.INSTANCE(doodad.ATTRIBUTE(null, extenders.Attribute, {isEnumerable: false, isProto: true})))))))),
				[_shared.ToExtendLaterSymbol]: doodad.PRIVATE(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PERSISTENT(doodad.PRE_EXTEND(doodad.TYPE(doodad.INSTANCE(doodad.ATTRIBUTE(null, extenders.Attribute, {isEnumerable: false, isProto: true})))))))),
				[_shared.IsolatedSymbol]: doodad.PRIVATE(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PRE_EXTEND(doodad.TYPE(doodad.ATTRIBUTE(null, extenders.Attribute, {isEnumerable: false})))))),
				[_shared.IsolatedCacheSymbol]: doodad.PRIVATE(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PRE_EXTEND(doodad.TYPE(doodad.INSTANCE(doodad.ATTRIBUTE(null, extenders.Attribute, {isEnumerable: false}))))))),
			}));

			__Internal__.defaultAttributesExpandable = types.freezeObject(tools.nullObject({
				[_shared.AttributesSymbol]: doodad.PRIVATE(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PERSISTENT(doodad.PRE_EXTEND(doodad.TYPE(doodad.INSTANCE(doodad.ATTRIBUTE(null, extenders.ClonedAttribute, {isEnumerable: false, cloneOnInit: true, cloneOnGetValue: false, isProto: null})))))))),
				[_shared.ImplementsSymbol]: doodad.PRIVATE(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PERSISTENT(doodad.PRE_EXTEND(doodad.TYPE(doodad.INSTANCE(doodad.ATTRIBUTE(null, extenders.ClonedAttribute, {isEnumerable: false, cloneOnInit: true, cloneOnGetValue: false, isProto: null})))))))),
				[_shared.ToInitializeSymbol]: doodad.PRIVATE(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PERSISTENT(doodad.PRE_EXTEND(doodad.TYPE(doodad.INSTANCE(doodad.ATTRIBUTE(null, extenders.ClonedAttribute, {isEnumerable: false, cloneOnInit: true, cloneOnGetValue: false, isProto: true})))))))),
				[_shared.ToExtendLaterSymbol]: doodad.PRIVATE(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PERSISTENT(doodad.PRE_EXTEND(doodad.TYPE(doodad.INSTANCE(doodad.ATTRIBUTE(null, extenders.ClonedAttribute, {isEnumerable: false, cloneOnInit: true, cloneOnGetValue: false, isProto: true})))))))),
			}));

			__Internal__.switchToExpandable = function switchToExpandable(attributes) {
				tools.forEach(__Internal__.defaultAttributesExpandable, function(attribute, attr) {
					const oldAttribute = attributes[attr];
					root.DD_ASSERT && root.DD_ASSERT(oldAttribute, "Adding new attributes there is not supported­.");
					const newAttribute = attribute.setValue(oldAttribute);
					attributes[attr] = types.freezeObject(newAttribute);
				});
			};

			/*
			__Internal__.defaultAttributesKeys = types.freezeObject(types.keys(__Internal__.defaultAttributes));
			__Internal__.defaultAttributesSymbols = types.freezeObject(types.symbols(__Internal__.defaultAttributes));

			__Internal__.defaultTypeAttributesKeys = types.freezeObject(tools.map(__Internal__.defaultAttributesKeys, function(key) {
				return __Internal__.defaultAttributes[key][_shared.ExtenderSymbol].isType;
			}));
			__Internal__.defaultTypeAttributesSymbols = types.freezeObject(tools.map(__Internal__.defaultAttributesSymbols, function(key) {
				return __Internal__.defaultAttributes[key][_shared.ExtenderSymbol].isType;
			}));

			__Internal__.defaultInstanceAttributesKeys = types.freezeObject(tools.map(__Internal__.defaultAttributesKeys, function(key) {
				return __Internal__.defaultAttributes[key][_shared.ExtenderSymbol].isInstance;
			}));
			__Internal__.defaultInstanceAttributesSymbols = types.freezeObject(tools.map(__Internal__.defaultAttributesSymbols, function(key) {
				return __Internal__.defaultAttributes[key][_shared.ExtenderSymbol].isInstance;
			}));
*/
			__Internal__.extendRenamed = function extendRenamed(attr, newAttr, source, sourceProto, destAttributes, forType, destAttribute, extender, proto, protoName) {
				// NOTE: The contract must be fullfilled (source: Sorella in freenode) : `compose({ a(){ return 1 }, b(){ return a() + 1 }, {a renamed to _a(){ return 3 } }).b()` should returns 2

				const sourceAttribute = types.AttributeBox(destAttribute);
				sourceAttribute[_shared.RenamedToSymbol] = null;
				sourceAttribute[_shared.RenamedFromSymbol] = attr;

				if (types.has(destAttributes, newAttr)) {
					destAttribute = destAttributes[newAttr];
					extender = destAttribute[_shared.ExtenderSymbol];
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

			__Internal__.preExtendAttribute = function preExtendAttribute(attr, base, baseIsClass, baseAttributes, source, sourceProto, sourceAttributes, destAttributes, baseIsProto, sourceIsProto, forType, _isolated, extendedAttributes, toInitialize, proto, protoName, _implements, toExtendLater, sources, isExtendLater) {
				const attrs = (sourceAttributes ? sourceAttributes : sourceProto);

				let sourceAttribute;
				if (isExtendLater) {
					sourceAttribute = destAttributes[attr].clone();
				} else if (types.has(attrs, attr)) {
					sourceAttribute = types.AttributeBox(attrs[attr]);
				} else {
					sourceAttribute = types.AttributeBox(undefined);
				};

				if (!isExtendLater && sourceIsProto && !sourceAttribute[_shared.PrototypeSymbol]) {
					sourceAttribute[_shared.PrototypeSymbol] = sourceProto;
				};

				const _interface = types.get(sourceAttribute, _shared.InterfaceSymbol);
				if (_interface) {
					const uuid = _shared.getUUID(_interface);
					if (!_isolated.has(_interface) && (!uuid || !_isolated.has(uuid))) {
						throw new types.Error("Interface '~0~' not found.", [types.getTypeName(_interface) || __Internal__.ANONYMOUS]);
					};
					let data = _isolated.get(_interface);
					if (!data) {
						data = _isolated.get(uuid);
					};
					extendedAttributes = (forType ? data[1] : data[18]);
					destAttributes = (forType ? data[2] : data[17]);
					toInitialize = (forType ? data[13] : data[14]);
					toExtendLater = (forType ? data[15] : data[16]);
				};

				let extender = null;

				let destAttribute;
				if (!isExtendLater && types.has(destAttributes, attr)) {
					destAttribute = destAttributes[attr].clone();
					extender = destAttribute[_shared.ExtenderSymbol];
				} else if (!isExtendLater && (source !== base) && baseAttributes && (attr in baseAttributes)) {
					destAttribute = types.AttributeBox(baseAttributes[attr]);
					extender = destAttribute[_shared.ExtenderSymbol];
					if (extender && extender.getValue) {
						destAttribute = extender.getValue(attr, destAttribute, forType);
					};
				} else {
					destAttribute = types.AttributeBox(undefined);
				};

				const sourceExtender = types.get(sourceAttribute, _shared.ExtenderSymbol);
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
				} else if (types.hasSymbolsEnabled()) {
					if (__Internal__.hasPolicies) {
						const pos = 0;
						// <FUTURE> When transpiling "ddclass" to "class"...
						//if (scope === doodad.Scopes.Private) {
						//	// Private fields must start with a vigil...
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

				let retval = undefined; // "consistent-return"

				if (extender.extend) {

					if ((extender.isType && forType) || (extender.isInstance && !forType)) {

						const sourceAttrProto = sourceAttribute[_shared.PrototypeSymbol];
						const destAttrProto = destAttribute[_shared.PrototypeSymbol];

						if (extender.notInherited || (source === base) || !types._implements(destAttrProto && destAttrProto[_shared.TypeSymbol], sourceAttrProto && sourceAttrProto[_shared.TypeSymbol])) {

							if (sourceAttribute[_shared.WhenSymbol] || destAttribute[_shared.WhenSymbol]) {
								const whenTypes = tools.unique(sourceAttribute[_shared.WhenSymbol], destAttribute[_shared.WhenSymbol]);
								if (tools.every(whenTypes, function(type) {
									if (_implements.has(type)) {
										return true;
									};
									const uuid = _shared.getUUID(type);
									if (uuid) {
										return _implements.has(uuid);
									};
									//return tools.some(sources, function(source) {
									//		const sourceType = types.getType(source);
									//		if (!sourceType) {
									//			return false;
									//		};
									//		return (sourceType === type) || types.baseof(type, sourceType) || types._implements(sourceType, type);
									//	});
									return false;
								})) {

									destAttribute[_shared.WhenSymbol] = null;

								} else {
									if (tools.indexOf(toExtendLater, attr) < 0) {
										toExtendLater.push(attr);
									};

									destAttribute = destAttribute.setValue(sourceAttribute);
									destAttribute[_shared.ExtenderSymbol] = extender;
									destAttribute[_shared.WhenSymbol] = whenTypes;
									destAttributes[attr] = destAttribute;
									return retval;
								};
							};

							if (extender.getValue) {
								sourceAttribute = extender.getValue(attr, sourceAttribute, forType);
							};

							if (types.isNothing(destAttribute[_shared.ScopeSymbol])) {
								const scope = types.get(sourceAttribute, _shared.ScopeSymbol);
								if (types.isNothing(scope)) {
									// <FUTURE> When transpiling "ddclass" to "class"...
									//if (!types.isSymbol(attr) && (attr[0] === '#')) {
									//	destAttribute[_shared.ScopeSymbol] = doodad.Scopes.Private;
									// </FUTURE>
									if (!types.isSymbol(attr) && ( (attr.slice(0, 2) === '__') || (attr.slice(0, 3) === '$__') )) {
										destAttribute[_shared.ScopeSymbol] = doodad.Scopes.Protected;
									} else {
										destAttribute[_shared.ScopeSymbol] = doodad.Scopes.Public;
									};
								} else {
									destAttribute[_shared.ScopeSymbol] = scope;
								};
							};

							if (extender.preExtend) {
								const result = extender.extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, proto, protoName);
								destAttribute = destAttribute.setValue(result);
								const newAttr = sourceIsProto && destAttribute[_shared.RenamedToSymbol];
								if (newAttr) {
									destAttribute = __Internal__.extendRenamed(attr, newAttr, source, sourceProto, destAttributes, forType, destAttribute, extender, proto, protoName);
									attr = newAttr;
								};
								let overrideWith = sourceAttribute[_shared.OverrideWithSymbol];
								if (overrideWith) {
									overrideWith = doodad.OVERRIDE(overrideWith);
									const result = extender.extend(attr, source, sourceProto, destAttributes, forType, overrideWith, destAttribute, sourceIsProto, proto, protoName);
									destAttribute = destAttribute.setValue(result);
								};
								destAttribute[_shared.ExtenderSymbol] = extender;
								destAttribute[_shared.PrototypeSymbol] = sourceAttribute[_shared.PrototypeSymbol];
								destAttributes[attr] = destAttribute;
								extendedAttributes.push(attr);
								toInitialize.push(attr);
								tools.popItem(toExtendLater, attr);
								if (extender.isPreserved && !types.isSymbol(attr)) {
									const presAttr = '__' + attr + '_preserved__';
									destAttribute = destAttribute.clone();
									destAttribute[_shared.ExtenderSymbol] = extender.get({isPreserved: false});
									destAttributes[presAttr] = destAttribute;
									extendedAttributes.push(presAttr);
									toInitialize.push(presAttr);
								};

							} else {
								retval = [
									// eslint-disable-next-line array-bracket-spacing
									/* 0 : data   */ [/*0*/ extender],
									// eslint-disable-next-line array-bracket-spacing
									/* 1 : params */ [/*0*/ attr, /*1*/ source, /*2*/ sourceProto, /*3*/ destAttributes, /*4*/ forType, /*5*/ sourceAttribute, /*6*/ destAttribute, /*7*/ sourceIsProto, /*8*/ proto, /*9*/ protoName, /*10*/ extendedAttributes, /*11*/ toInitialize, /*12*/ toExtendLater]
								];
							};
						};
					};
				};

				return retval; // "consistent-return"
			};

			__Internal__.extendSource = function extendSource(base, baseTypeAttributes, baseInstanceAttributes, source, sourceTypeAttributes, sourceInstanceAttributes, destTypeAttributes, destInstanceAttributes, baseType, baseIsType, baseIsClass, sourceIsType, sourceIsClass, _isolated, typeExtendedAttributes, instanceExtendedAttributes, typeToInitialize, instanceToInitialize, proto, protoName, _implements, typeToExtendLater, instanceToExtendLater, sources) {
				const baseIsProto = false;

				if (!baseIsClass) {
					// doodad-js Type / JS Class
					baseTypeAttributes = baseType;
					baseInstanceAttributes = baseType.prototype;
				};

				let sourceIsProto = false,
					sourceTypeProto,
					sourceInstanceProto;

				let sourceTypeToExtend1 = null,
					sourceTypeToExtend2 = null,
					sourceInstanceToExtend1 = null,
					sourceInstanceToExtend2 = null;

				if (sourceIsClass) {
					// doodad-js Class
					sourceTypeProto = types.getAttribute(source, _shared.PrototypeSymbol, null, _shared.SECRET);
					sourceInstanceProto = sourceTypeProto;
					sourceTypeToExtend1 = types.keys(sourceTypeAttributes);
					sourceTypeToExtend2 = types.symbols(sourceTypeAttributes);
					sourceInstanceToExtend1 = types.keys(sourceInstanceAttributes);
					sourceInstanceToExtend2 = types.symbols(sourceInstanceAttributes);
				} else if (types.isFunction(source)) {
					// doodad-js Type / JS class
					sourceTypeProto = source;
					sourceInstanceProto = source.prototype;
					sourceTypeToExtend1 = types.keys(sourceTypeProto);
					sourceTypeToExtend2 = types.symbols(sourceTypeProto);
					sourceInstanceToExtend1 = types.keys(sourceInstanceProto);
					sourceInstanceToExtend2 = types.symbols(sourceInstanceProto);
				} else {
					// Prototype
					sourceTypeProto = source;
					sourceInstanceProto = source;
					const sourceKeys = types.keys(source);
					const sourceSymbols = types.symbols(source);
					sourceTypeToExtend1 = sourceKeys;
					sourceTypeToExtend2 = sourceSymbols;
					sourceInstanceToExtend1 = sourceKeys;
					sourceInstanceToExtend2 = sourceSymbols;
					sourceIsProto = true;
				};

				// Pre-extend
				const preExtendLoop = function _preExtendLoop(sourceAttrs, isExtendLater, forType) {
					const toExtend = [];

					const sourceAttrsLen = sourceAttrs.length;
					for (let k = 0; k < sourceAttrsLen; k++) {
						const attr = sourceAttrs[k];

						if (!attr || (attr === '__proto__') || (attr === '_new') || (attr === '_delete') || (!sourceIsClass && (attr in _shared.reservedAttributes))) {
							continue;
						};

						if (forType) {
							const params = __Internal__.preExtendAttribute(attr, base, baseIsClass, baseTypeAttributes, source, sourceTypeProto, sourceTypeAttributes, destTypeAttributes, baseIsProto, sourceIsProto, true, _isolated, typeExtendedAttributes, typeToInitialize, proto, protoName, _implements, typeToExtendLater, sources, isExtendLater);
							if (params) {
								toExtend.push(params);
							};
						} else {
							const params = __Internal__.preExtendAttribute(attr, base, baseIsClass, baseInstanceAttributes, source, sourceInstanceProto, sourceInstanceAttributes, destInstanceAttributes, baseIsProto, sourceIsProto, false, _isolated, instanceExtendedAttributes, instanceToInitialize, proto, protoName, _implements, instanceToExtendLater, sources, isExtendLater);
							if (params) {
								toExtend.push(params);
							};
						};
					};

					return toExtend;
				};

				// Extend
				const extendLoop = function _extendLoop(toExtend) {
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
							protoName = params[9],
							extendedAttributes = params[10],
							toInitialize = params[11],
							toExtendLater = params[12];
						let attr = params[0],
							destAttribute = params[6];
						const result = extender.extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, proto, protoName);
						destAttribute = destAttribute.setValue(result);
						const newAttr = sourceIsProto && destAttribute[_shared.RenamedToSymbol];
						if (newAttr) {
							destAttribute = __Internal__.extendRenamed(attr, newAttr, source, sourceProto, (forType ? destTypeAttributes : destInstanceAttributes), forType, destAttribute, extender, proto, protoName);
							attr = newAttr;
						};
						let overrideWith = sourceAttribute[_shared.OverrideWithSymbol];
						if (overrideWith) {
							overrideWith = doodad.OVERRIDE(overrideWith);
							overrideWith[_shared.PrototypeSymbol] = sourceAttribute[_shared.PrototypeSymbol];
							const result = extender.extend(attr, source, sourceProto, destAttributes, forType, overrideWith, destAttribute, true, proto, protoName, false);
							destAttribute = destAttribute.setValue(result);
						};
						destAttribute[_shared.ExtenderSymbol] = extender;
						destAttribute[_shared.PrototypeSymbol] = sourceAttribute[_shared.PrototypeSymbol];
						destAttributes[attr] = destAttribute;
						extendedAttributes.push(attr);
						toInitialize.push(attr);
						tools.popItem(toExtendLater, attr);
						if (extender.isPreserved && !types.isSymbol(attr)) {
							const presAttr = '__' + attr + '_preserved__';
							destAttribute = destAttribute.clone();
							destAttribute[_shared.ExtenderSymbol] = extender.get({isPreserved: false});
							destAttributes[presAttr] = destAttribute;
							extendedAttributes.push(presAttr);
							toInitialize.push(presAttr);
						};
					};
				};

				let typeToExtend0 = null,
					instanceToExtend0 = null,
					toExtend1 = null,
					toExtend2 = null,
					toExtend3 = null,
					toExtend4 = null;

				if (sourceIsProto) {
					if (typeToExtendLater) {
						typeToExtend0 = preExtendLoop(typeToExtendLater, true, true);
					};
					if (instanceToExtendLater) {
						instanceToExtend0 = preExtendLoop(instanceToExtendLater, true, false);
					};
				};
				if (sourceTypeToExtend1) {
					toExtend1 = preExtendLoop(sourceTypeToExtend1, false, true);
				};
				if (sourceTypeToExtend2) {
					toExtend2 = preExtendLoop(sourceTypeToExtend2, false, true);
				};
				if (sourceInstanceToExtend1) {
					toExtend3 = preExtendLoop(sourceInstanceToExtend1, false, false);
				};
				if (sourceInstanceToExtend2) {
					toExtend4 = preExtendLoop(sourceInstanceToExtend2, false, false);
				};

				if (typeToExtend0) {
					extendLoop(typeToExtend0);
				};
				if (instanceToExtend0) {
					extendLoop(instanceToExtend0);
				};
				if (toExtend1) {
					extendLoop(toExtend1);
				};
				if (toExtend2) {
					extendLoop(toExtend2);
				};
				if (toExtend3) {
					extendLoop(toExtend3);
				};
				if (toExtend4) {
					extendLoop(toExtend4);
				};
			};

			__Internal__.addImplements = function addImplements(_implements, _isolated, typeToInitialize, instanceToInitialize, typeToExtendLater, instanceToExtendLater, source, sourceBase, sourceTypeAttributes, sourceInstanceAttributes, sourceImplements, sourceIsolated, baseIsType, sourceTypeToInitialize, sourceInstanceToInitialize, sourceTypeToExtendLater, sourceInstanceToExtendLater) {
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

				if (sourceIsolated) {
					sourceIsolated.forEach(function(data, _interface) {
						if (!types.isString(_interface)) {
							const uuid = _shared.getUUID(_interface);

							if (!_isolated.has(_interface) && (!uuid || !_isolated.has(uuid))) {
								_isolated.set(_interface, data);

								if (uuid) {
									_isolated.set(uuid, data);
								};

								const impls = types.getAttribute(_interface, _shared.ImplementsSymbol, null, _shared.SECRET).values();

								for (const impl of impls) {
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

				tools.forEach(sourceTypeToInitialize, function(attr) {
					if (tools.indexOf(typeToInitialize, attr) < 0) {
						typeToInitialize.push(attr);
					};
				});

				tools.forEach(sourceInstanceToInitialize, function(attr) {
					if (tools.indexOf(instanceToInitialize, attr) < 0) {
						instanceToInitialize.push(attr);
					};
				});

				tools.forEach(sourceTypeToExtendLater, function(attr) {
					if (tools.indexOf(typeToExtendLater, attr) < 0) {
						typeToExtendLater.push(attr);
					};
				});

				tools.forEach(sourceInstanceToExtendLater, function(attr) {
					if (tools.indexOf(instanceToExtendLater, attr) < 0) {
						instanceToExtendLater.push(attr);
					};
				});
			};

			__Internal__.implementSource = function implementSource(base, baseTypeAttributes, baseInstanceAttributes, source, destTypeAttributes, destInstanceAttributes, _implements, _isolated, typeStorage, instanceStorage, baseType, baseIsType, baseIsClass, baseIsBase, baseIsMixIn, baseIsInterface, proto, typeExtendedAttributes, instanceExtendedAttributes, typeToInitialize, instanceToInitialize, protoName, typeToExtendLater, instanceToExtendLater, sources) {
				const sourceType = types.getType(source);

				if (baseType && !types.baseof(sourceType, baseType)) { // prevents cyclic extend
					const hasSourceType = !!sourceType,
						sourceIsType = hasSourceType && types.isType(source),
						sourceIsClass = hasSourceType && (types.isClass(sourceType) || types.isInterfaceClass(sourceType)),
						sourceName = (sourceType ? types.getTypeName(sourceType) : types.unbox(source.$TYPE_NAME)),
						sourceUUID = (sourceType ? _shared.getUUID(sourceType) : types.unbox(source.$TYPE_UUID)),
						sourceHasUUID = !!sourceUUID,
						isImplemented = sourceIsClass && (_implements.has(sourceType) || (sourceHasUUID && _implements.has(sourceUUID)));

					if (!isImplemented) {
						if (__Internal__.hasPolicies) {
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

						if (types.isIsolated(source) && !types.isIsolated(base)) {
							if (!baseIsClass) {
								throw new types.TypeError("To implement an isolated 'Class', base must be a 'Class'.");
							};

							const destImplements = _implements;

							const proto = {};
							const protoName = (sourceName ? sourceName + '_Interface' : null);
							base = doodad.Interface;
							baseType = types.getType(base);
							baseIsType = true;
							baseIsClass = true;
							baseIsBase = true;
							baseIsMixIn = false;
							baseIsInterface = false;
							_implements = new types.Set();
							typeStorage = tools.nullObject();
							instanceStorage = tools.nullObject();
							destTypeAttributes = tools.nullObject();
							destInstanceAttributes = tools.nullObject();
							typeExtendedAttributes = [];
							instanceExtendedAttributes = [];
							typeToInitialize = [];
							instanceToInitialize = [];
							typeToExtendLater = [];
							instanceToExtendLater = [];

							// Will be passed later to "__Internal__.createType".
							// eslint-disable-next-line array-bracket-spacing
							const data = [/*0*/ protoName, /*1*/ typeExtendedAttributes, /*2*/ destTypeAttributes, /*3*/ source, /*4*/ typeStorage, /*5*/ instanceStorage, /*6 type*/ null, /*7*/ base, /*8 _isolated*/ null, /*9*/ _implements, /*10 sourceProto*/ proto, /*11 modifiers*/ 0, /*12*/ sourceUUID, /*13*/ typeToInitialize, /*14*/ instanceToInitialize, /*15*/ typeToExtendLater, /*16*/ instanceToExtendLater, /*17*/ destInstanceAttributes, /*18*/ instanceExtendedAttributes];

							const sourceData = types.getAttributes(source, [_shared.ImplementsSymbol], null, _shared.SECRET);

							if (!destImplements.has(sourceType) && (!sourceHasUUID || !destImplements.has(sourceUUID))) {
								destImplements.add(sourceType);

								if (sourceHasUUID) {
									destImplements.add(sourceUUID);
								};
							};

							_isolated.set(sourceType, data);

							if (sourceHasUUID) {
								_isolated.set(sourceUUID, data);
							};

							for (const impl of sourceData[_shared.ImplementsSymbol].values()) {
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

							const baseTypeData = types.getAttributes(baseType, [_shared.BaseSymbol, _shared.ImplementsSymbol, _shared.AttributesSymbol, _shared.IsolatedSymbol, _shared.ToInitializeSymbol, _shared.ToExtendLaterSymbol], null, _shared.SECRET);
							const baseInstanceData = types.getAttributes(baseType.prototype, [_shared.AttributesSymbol, _shared.ToInitializeSymbol, _shared.ToExtendLaterSymbol], null, _shared.SECRET);

							baseTypeAttributes = baseTypeData[_shared.AttributesSymbol];
							baseInstanceAttributes = baseInstanceData[_shared.AttributesSymbol];

							__Internal__.addImplements(_implements, _isolated, typeToInitialize, instanceToInitialize, typeToExtendLater, instanceToExtendLater, base, baseTypeData[_shared.BaseSymbol], baseTypeAttributes, baseInstanceAttributes, baseTypeData[_shared.ImplementsSymbol], baseTypeData[_shared.IsolatedSymbol], baseIsType, baseTypeData[_shared.ToInitializeSymbol], baseInstanceData[_shared.ToInitializeSymbol], baseTypeData[_shared.ToExtendLaterSymbol], baseInstanceData[_shared.ToExtendLaterSymbol]);
							__Internal__.extendSource(base, baseTypeAttributes, baseInstanceAttributes, base, baseTypeAttributes, baseInstanceAttributes, destTypeAttributes, destInstanceAttributes, baseType, baseIsType, baseIsClass, sourceIsType, sourceIsClass, _isolated, typeExtendedAttributes, instanceExtendedAttributes, typeToInitialize, instanceToInitialize, proto, protoName, _implements, typeToExtendLater, instanceToExtendLater, sources);
						};

						let sourceTypeAttributes = null;
						let sourceInstanceAttributes = null;

						if (sourceIsClass) {
							const sourceTypeData = types.getAttributes(sourceType, [_shared.BaseSymbol, _shared.ImplementsSymbol, _shared.AttributesSymbol, _shared.IsolatedSymbol, _shared.ToInitializeSymbol, _shared.ToExtendLaterSymbol], null, _shared.SECRET);
							const sourceInstanceData = types.getAttributes(sourceType.prototype, [_shared.AttributesSymbol, _shared.ToInitializeSymbol, _shared.ToExtendLaterSymbol], null, _shared.SECRET);

							sourceTypeAttributes = sourceTypeData[_shared.AttributesSymbol];
							sourceInstanceAttributes = sourceInstanceData[_shared.AttributesSymbol];

							__Internal__.addImplements(_implements, _isolated, typeToInitialize, instanceToInitialize, typeToExtendLater, instanceToExtendLater, source, sourceTypeData[_shared.BaseSymbol], sourceTypeAttributes, sourceInstanceAttributes, sourceTypeData[_shared.ImplementsSymbol], sourceTypeData[_shared.IsolatedSymbol], baseIsType, sourceTypeData[_shared.ToInitializeSymbol], sourceInstanceData[_shared.ToInitializeSymbol], sourceTypeData[_shared.ToExtendLaterSymbol], sourceInstanceData[_shared.ToExtendLaterSymbol]);
						};

						__Internal__.extendSource(base, baseTypeAttributes, baseInstanceAttributes, source, sourceTypeAttributes, sourceInstanceAttributes, destTypeAttributes, destInstanceAttributes, baseType, baseIsType, baseIsClass, sourceIsType, sourceIsClass, _isolated, typeExtendedAttributes, instanceExtendedAttributes, typeToInitialize, instanceToInitialize, proto, protoName, _implements, typeToExtendLater, instanceToExtendLater, sources);
					};
				};
			};

			__Internal__.initializeAttributes = function initializeAttributes(attributes, forType, values, isProto, existingAttributes, toInitialize) {
				const generator = {
					DynamicValue: function DynamicValue(code) {
						this.__code = code;
					},
					__code: '',
					__vars: [],
					__dvars: 0,
					__dvarsReleased: [],
					__props: [],
					__hasProps: false,
					__kvars: tools.nullObject(),
					objId: 'obj',
					storageId: 'storage',
					varsId: 'vars',
					propsId: 'props',
					vars: {
						add: function add(val, /*optional*/key) {
							if (key && (key in generator.__kvars)) {
								throw new types.Error("Key '~0~' already added.", [key]);
							};
							let varId;
							if (val instanceof generator.DynamicValue) {
								generator.__endDefine();
								const released = generator.__dvarsReleased;
								let index = 0;
								if (released.length) {
									index = released.shift();
								} else {
									index = generator.__dvars;
									generator.__dvars++;
								};
								val.__index = index;
								varId = "$" + types.toString(index);
								generator.code.add(varId + " = (" + val.__code + ")");
							} else {
								const ar = generator.__vars;
								const index = tools.indexOf(ar, val);
								const id = (index < 0 ? ar.length : index);
								varId = generator.varsId + "[" + types.toString(id) + "]";
								if (index < 0) {
									ar.push(val);
								};
							};
							if (key) {
								generator.__kvars[key] = varId;
							};
							return varId;
						},
						fromKey: function fromKey(key) {
							return generator.__kvars[key];
						},
					},
					code: {
						add: function add(code, /*optional*/noSep) {
							generator.__endDefine();
							if (noSep) {
								generator.__code += code;
							} else {
								generator.__code += code + ';';
							};
						},
					},
					define: function define(attrId, descId) {
						generator.__hasProps = true;
						generator.__props.push(generator.propsId + "[" + attrId + "] = " + descId);
					},
					__endDefine: function __endDefine() {
						const props = generator.__props;
						if (props.length > 0) {
							generator.__props = [];
							generator.code.add(props.join(';'));
						};
					},
				};

				generator.DynamicValue.prototype.release = function() {
					if ((this.__index == null) || (generator.__dvarsReleased.indexOf(this.__index) >= 0)) {
						throw new types.Error("Invalid 'release' call for the dynamic value.");
					} else {
						generator.__dvarsReleased.push(this.__index);
						this.__index = null;
					};
				};

				const valuesKeys = types.keys(values);
				const valuesSymbols = types.symbols(values);

				toInitialize = tools.unique(toInitialize, valuesKeys, valuesSymbols);

				const toInitializeLen = toInitialize.length;

				for (let i = 0; i < toInitializeLen; i++) {
					const attr = toInitialize[i],
						attribute = attributes[attr];

					root.DD_ASSERT && root.DD_ASSERT(attribute, "Attribute '~0~' is missing.", [attr]);

					const extender = attribute[_shared.ExtenderSymbol];

					if (extender && extender.init && extender.preExtend) {
						if ((forType && extender.isType) || (!forType && extender.isInstance)) {
							const value = types.get(values, attr, types.unbox(attribute));
							if (!extender.preInit || !extender.preInit(attr, attributes, forType, attribute, value, generator, isProto, existingAttributes)) {
								extender.init(attr, attributes, forType, attribute, value, generator, isProto, existingAttributes);
							};
						};
					};
				};

				for (let i = 0; i < toInitializeLen; i++) {
					const attr = toInitialize[i],
						attribute = attributes[attr];

					root.DD_ASSERT && root.DD_ASSERT(attribute, "Attribute '~0~' is missing.", [attr]);

					const extender = attribute[_shared.ExtenderSymbol];

					if (extender && extender.init && !extender.preExtend) {
						if ((forType && extender.isType) || (!forType && extender.isInstance)) {
							const value = types.get(values, attr, types.unbox(attribute));
							if (!extender.preInit || !extender.preInit(attr, attributes, forType, attribute, value, generator, isProto, existingAttributes)) {
								extender.init(attr, attributes, forType, attribute, value, generator, isProto, existingAttributes);
							};
						};
					};
				};

				generator.__endDefine();
				const dvars = generator.__dvars;
				let dvarsStr = '';
				for (let i = 0; i < dvars; i++) {
					dvarsStr += '$' + types.toString(i) + (i < dvars - 1 ? ',' : '');
				};
				const code = "(function(" + generator.objId + "," + generator.storageId + ") {" +
						(dvarsStr ? "let " + dvarsStr + ";" : "") +
						(generator.__hasProps ? "const " + generator.propsId + " = tools.nullObject();" : "") +
						generator.__code +
						(generator.__hasProps ? "types.defineProperties(" + generator.objId + ", " + generator.propsId + ");" : "") +
					"})";
				const evalFn = tools.createEval(['doodad', 'types', 'tools', '_shared', generator.varsId], true)(doodad, types, tools, _shared, types.freezeObject(generator.__vars));
				const fn = evalFn(code);
				return fn;
			};

			__Internal__.postExtend = function postExtend(attributes, extendedAttributes) {
				for (let k = 0; k < extendedAttributes.length; k++) {
					const attr = extendedAttributes[k];

					const attribute = attributes[attr];
					if (attribute) {
						const extender = attribute[_shared.ExtenderSymbol];

						const newAttribute = extender.postExtend && extender.postExtend(attr, attributes, attribute) || attribute;

						if (newAttribute !== attribute) {
							attributes[attr] = newAttribute;
						};

						types.freezeObject(newAttribute);
					};
				};
			};

			__Internal__.createType = function createType(base, baseType, baseIsType, proto, protoName, protoUUID, typeStorage, instanceStorage, destTypeAttributes, destInstanceAttributes, typeExtendedAttributes, instanceExtendedAttributes, typeToInitialize, instanceToInitialize, _isolated, _implements, modifiers, typeToExtendLater, instanceToExtendLater, existingAttributes) {
				typeExtendedAttributes = tools.unique(typeExtendedAttributes);
				instanceExtendedAttributes = tools.unique(instanceExtendedAttributes);
				//typeToInitialize = tools.unique(typeToInitialize, __Internal__.defaultTypeAttributesKeys, __Internal__.defaultTypeAttributesSymbols);
				//instanceToInitialize = tools.unique(instanceToInitialize, __Internal__.defaultInstanceAttributesKeys, __Internal__.defaultInstanceAttributesSymbols);
				typeToInitialize = tools.unique(typeToInitialize);
				instanceToInitialize = tools.unique(instanceToInitialize);

				// Post-Extend
				__Internal__.postExtend(destTypeAttributes, typeExtendedAttributes);
				__Internal__.postExtend(destInstanceAttributes, instanceExtendedAttributes);

				if (baseIsType) {
					const typeProto = {
							$TYPE_NAME: protoName,
							$TYPE_UUID: protoUUID,

							[types.NewSymbol]: __Internal__.insideNew,
						},

						instanceProto = {};

					if (types.has(proto, '_new')) {
						typeProto._new = proto._new;
						instanceProto._new = proto._new;
					};

					if (types.has(proto, '_delete')) {
						typeProto._delete = proto._delete;
						instanceProto._delete = proto._delete;
					};

					const newType = base.$inherit(
						/*typeProto*/
						typeProto,

						/*instanceProto*/
						instanceProto
					);

					root.DD_ASSERT && root.DD_ASSERT(types.baseof(types.Type, newType));

					types.setAttribute(proto, _shared.TypeSymbol, newType, {}, _shared.SECRET);

					const newProto = newType.prototype;

					const newTypeValues = {
						[_shared.AttributesStorageSymbol]: typeStorage,
						[_shared.AttributesSymbol]: destTypeAttributes,
						[_shared.BaseSymbol]: base,
						[_shared.IsolatedSymbol]: _isolated,
						[_shared.ImplementsSymbol]: _implements,
						[_shared.PrototypeSymbol]: proto,
						[_shared.ModifiersSymbol]: modifiers,
						[_shared.ToInitializeSymbol]: typeToInitialize,
						[_shared.ToExtendLaterSymbol]: typeToExtendLater,
					};
					types.setAttributes(newType, newTypeValues, {configurable: true, direct: true}, _shared.SECRET);

					const newProtoValues = {
						[_shared.AttributesStorageSymbol]: instanceStorage,
						[_shared.AttributesSymbol]: destInstanceAttributes,
						[_shared.ImplementsSymbol]: _implements,  // Will be cloned later
						[_shared.ToInitializeSymbol]: instanceToInitialize,
						[_shared.ToExtendLaterSymbol]: instanceToExtendLater,
					};
					types.setAttributes(newProto, newProtoValues, {configurable: true, direct: true}, _shared.SECRET);

					return newType;

				} else {
					// Expandable objects

					// NOTE: If we need to extend the Type, don't forget to remove "EXPANDABLE" from "Object" and change the example in README.md.

					if (instanceToInitialize.length) {
						const initInstance = __Internal__.initializeAttributes(destInstanceAttributes, false, null, null, existingAttributes, instanceToInitialize);
						initInstance(base, instanceStorage);
					};

					if (base._implements(mixIns.Creatable)) {
						types.setAttribute(base, _shared.DestroyedSymbol, null, null, _shared.SECRET);
					};

					return base;
				}
			};

			__Internal__.$extend = function $extend(/*paramarray*/...args) {
				const base = ((this === global) ? undefined : this) || types.Type,
					baseType = types.getType(base);

				root.DD_ASSERT && root.DD_ASSERT((baseType === types.Type) || types.baseof(types.Type, baseType), "Base must be a type.");

				const index = tools.findLastItem(args, types.isJsObject),
					proto = (index !== null) && args[index] || {};

				let protoName = '',
					protoUUID = '';

				if (proto) {
					protoName = types.unbox(proto.$TYPE_NAME) || '';
					protoUUID = types.unbox(proto.$TYPE_UUID) || '';
				};

				//if (!types.isStringAndNotEmpty(protoName)) {
				//	throw new types.Error("Prototype has no name. You must define the '$TYPE_NAME' attribute.");
				//};

				const baseIsType = baseType && types.isType(base),
					baseIsClass = baseType && (types.isClass(baseType) || types.isInterfaceClass(baseType)),
					baseIsBase = baseIsClass && types.isBase(baseType),
					baseIsMixIn = baseIsClass && types.isMixIn(baseType),
					baseIsInterface = baseIsClass && types.isInterface(baseType);

				let _implements = null,
					_isolated = null,
					destTypeAttributes = null,
					destInstanceAttributes = null,
					typeStorage,
					instanceStorage,
					typeToExtendLater = null,
					instanceToExtendLater = null,
					baseTypeAttributes = null,
					baseInstanceAttributes = null,
					modifiers = 0,
					existingAttributes = null;

				const sources = types.toArray(args);

				if (baseIsType) {
					// Doodad Class / Doodad Type

					_implements = new types.Set();
					_isolated = new types.Map();
					destTypeAttributes = tools.nullObject();
					destInstanceAttributes = tools.nullObject();

					typeStorage = tools.nullObject();
					instanceStorage = tools.nullObject();

					typeToExtendLater = [];
					instanceToExtendLater = [];

					if (baseIsClass) {
						// Doodad Class

						const baseTypeData = types.getAttributes(baseType, [_shared.AttributesSymbol, _shared.ModifiersSymbol], null, _shared.SECRET);
						baseTypeAttributes = baseTypeData[_shared.AttributesSymbol];
						//??? modifiers = (proto && types.unbox(proto[_shared.ModifiersSymbol]) || 0) | ((baseTypeData[_shared.ModifiersSymbol] || 0) & _shared.preservedClassModifiers);
						modifiers = ((baseTypeData[_shared.ModifiersSymbol] || 0) & _shared.preservedClassModifiers);

						const baseInstanceData = types.getAttributes(baseType.prototype, [_shared.AttributesSymbol], null, _shared.SECRET);
						baseInstanceAttributes = baseInstanceData[_shared.AttributesSymbol];
					} else {
						baseTypeAttributes = baseType;
						baseInstanceAttributes = baseType.prototype;
					};

				} else if (baseIsClass) {
					// Doodad Expandable Object

					const baseTypeData = types.getAttributes(baseType, [_shared.ModifiersSymbol, _shared.AttributesStorageSymbol, _shared.ToExtendLaterSymbol], null, _shared.SECRET);

					modifiers = baseTypeData[_shared.ModifiersSymbol] || 0;

					if (!(modifiers & doodad.ClassModifiers.Expandable)) {
						throw new types.Error("Object is not expandable.");
					};

					typeStorage = baseTypeData[_shared.AttributesStorageSymbol];
					typeToExtendLater = baseTypeData[_shared.ToExtendLaterSymbol];

					const baseData = types.getAttributes(base, [_shared.AttributesSymbol, _shared.ImplementsSymbol, _shared.IsolatedSymbol, _shared.AttributesStorageSymbol, _shared.ToExtendLaterSymbol], null, _shared.SECRET);

					destInstanceAttributes = baseData[_shared.AttributesSymbol];
					_implements = baseData[_shared.ImplementsSymbol];
					_isolated = baseData[_shared.IsolatedSymbol];
					instanceStorage = baseData[_shared.AttributesStorageSymbol];
					instanceToExtendLater = baseData[_shared.ToExtendLaterSymbol];

					existingAttributes = tools.append(/*types.keys(destTypeAttributes), types.symbols(destTypeAttributes),*/ types.keys(destInstanceAttributes), types.symbols(destInstanceAttributes));

					if (base._implements(mixIns.Creatable)) {
						const injected = {
							create: doodad.REPLACE(doodad.CALL_FIRST(__Internal__.creatablePrototype.create)),
						};
						injected.create[_shared.PrototypeSymbol] = injected;
						sources.unshift(injected);
					};
				} else {
					// JS

					_implements = new types.Set();
					_isolated = new types.Map();
					destTypeAttributes = tools.nullObject();
					destInstanceAttributes = tools.nullObject();
					typeStorage = tools.nullObject();
					instanceStorage = tools.nullObject();
					typeToExtendLater = [];
					instanceToExtendLater = [];
				}

				const typeExtendedAttributes = [];
				const instanceExtendedAttributes = [];
				const typeToInitialize = [];
				const instanceToInitialize = [];

				// Implement base
				if (baseIsClass && baseIsType) { // Doodad Class
					__Internal__.implementSource(base, baseTypeAttributes, baseInstanceAttributes, base, destTypeAttributes, destInstanceAttributes, _implements, _isolated, typeStorage, instanceStorage, baseType, baseIsType, baseIsClass, baseIsBase, baseIsMixIn, baseIsInterface, proto, typeExtendedAttributes, instanceExtendedAttributes, typeToInitialize, instanceToInitialize, protoName, typeToExtendLater, instanceToExtendLater, sources);
				};

				// Implement sources
				const sourcesLen = sources.length;
				for (let i = 0; i < sourcesLen; i++) {
					const source = sources[i];
					root.DD_ASSERT && root.DD_ASSERT(types.getType(source) || types.isJsObject(source));
					__Internal__.implementSource(base, baseTypeAttributes, baseInstanceAttributes, source, destTypeAttributes, destInstanceAttributes, _implements, _isolated, typeStorage, instanceStorage, baseType, baseIsType, baseIsClass, baseIsBase, baseIsMixIn, baseIsInterface, proto, typeExtendedAttributes, instanceExtendedAttributes, typeToInitialize, instanceToInitialize, protoName, typeToExtendLater, instanceToExtendLater, sources);
				};

				// Create and return extended version of "base"
				const type = __Internal__.createType(base, baseType, baseIsType, proto, protoName, protoUUID, typeStorage, instanceStorage, destTypeAttributes, destInstanceAttributes, typeExtendedAttributes, instanceExtendedAttributes, typeToInitialize, instanceToInitialize, _isolated, _implements, modifiers, typeToExtendLater, instanceToExtendLater, existingAttributes);

				return type;
			};

			__Internal__._delete = types.SUPER(
				function _delete() {
					const cache = this[_shared.IsolatedCacheSymbol];
					if (cache) {
						cache.forEach(function destroyEachInterface(_interface) {
							types.DESTROY(_interface);
						});
					};

					const forType = types.isType(this),
						//cls = (forType ? this : types.getType(this)),
						attributes = this[_shared.AttributesSymbol],
						storage = this[_shared.AttributesStorageSymbol];

					const preLoopAttrs = function _preLoopAttrs(attrs) {
						for (let i = attrs.length - 1; i >= 0; i--) {
							const attr = attrs[i],
								attribute = attributes[attr],
								extender = attribute[_shared.ExtenderSymbol];

							if (extender) {
								if (extender.isPersistent) {
									//attrs.splice(i, 1);
									attrs[i] = null;
								} else if (!extender.preExtend) {
									if ((extender.isType && forType) || (extender.isInstance && !forType)) {
										extender.remove && extender.remove(attr, this, storage, forType, attribute);
									};
									//attrs.splice(i, 1);
									attrs[i] = null;
								};
							} else {
								//attrs.splice(i, 1);
								attrs[i] = null;
							};
						};
					};

					const loopAttrs = function _loopAttrs(attrs) {
						for (let i = attrs.length - 1; i >= 0; i--) {
							const attr = attrs[i];

							if (attr) {
								const attribute = attributes[attr],
									extender = attribute[_shared.ExtenderSymbol];

								// NOTE: "if (!extender.isPersistent && extender.preExtend) {...}" --> Done with "attrs.splice()".
								if ((extender.isType && forType) || (extender.isInstance && !forType)) {
									extender.remove && extender.remove(attr, this, storage, forType, attribute);
								};
							};
						};
					};

					const attrsKeys = types.keys(attributes);
					const attrsSymbols = types.symbols(attributes);
					preLoopAttrs.call(this, attrsKeys);
					preLoopAttrs.call(this, attrsSymbols);
					loopAttrs.call(this, attrsKeys);
					loopAttrs.call(this, attrsSymbols);

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
				, doodad.PROTECTED(doodad.READ_ONLY(doodad.CAN_BE_DESTROYED(doodad.PERSISTENT(doodad.TYPE(doodad.INSTANCE(doodad.JS_METHOD(
					function superFrom(cls) {
						const dispatch = this && this[_shared.CurrentDispatchSymbol];

						if (!dispatch) {
							throw new types.Error("Invalid call to '_superFrom'.");
						};

						if (!types.isType(cls)) {
							throw new types.ValueError("The 'cls' argument must be a type.");
						};

						if (!types._implements(this, cls)) {
							throw new types.ValueError("Type '~0~' is not implemented by '~1~'.", [types.getTypeName(cls) || __Internal__.ANONYMOUS, types.getTypeName(this) || __Internal__.ANONYMOUS]);
						};

						let proto = cls;
						if (!types.isType(this)) {
							proto = cls.prototype;
						};

						const name = dispatch[_shared.NameSymbol];

						if (!types.isMethod(proto, name)) {
							throw new types.ValueError("Method '~0~' doesn't exist or is not implemented in type '~1~'.", [name, types.getTypeName(cls) || __Internal__.ANONYMOUS]);
						};

						const newDispatch = types.getAttribute(proto, name, null, _shared.SECRET),
							notReentrantMap = __Internal__.notReentrantMap.get(this),
							self = this; // NOTE: That prevents to do "return _superFrom.bind(this)"

						return function _superFrom(/*paramarray*/...params) {
							// NOTE: We now override super only when "_superFrom" is called.
							// NOTE: Will throw if "_superFrom" called from the outside, that's what we expect.
							self.overrideSuper();

							const oldCalled = notReentrantMap && notReentrantMap.get(name);
							if (oldCalled) {
								notReentrantMap.set(name, false);
							};

							try {
								return newDispatch.apply(self, params);

							} catch(ex) {
								throw ex;

							} finally {
								if (oldCalled) {
									notReentrantMap.set(name, true);
								};

							}
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
							this._super[_shared.CalledSymbol] = true;
						};
					}))))));

			/* TODO: Complete
			// TODO: Try re-using "dispatchTemplate"
			__Internal__._superAsync = root.DD_DOC(
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
					function _superAsync() {
						const _super = this._super;

						const attributes = this[_shared.AttributesSymbol],
							dispatch = this[_shared.CurrentDispatchSymbol],
							index = this[_shared.CurrentCallerIndexSymbol];

						const modifiers = dispatch[_shared.ModifiersSymbol],
							async = !!(modifiers & doodad.MethodModifiers.Async),
							canBeDestroyed = !!(modifiers & doodad.MethodModifiers.CanBeDestroyed);

						const attr = dispatch[_shared.NameSymbol],
							attribute = attributes[attr],
							extender = attribute[_shared.ExtenderSymbol];

						const notReentrant = __Internal__.notReentrantMap.get(this);

						if (_super) {
							_super[_shared.CalledSymbol] = true;
						};

						dispatch[_shared.SuperAsyncSymbol] = true;

						return (function superAsync(/*paramarray* /...params) {
							if (!canBeDestroyed && types.DESTROYED(this)) {
								throw new types.Error("Object is destroyed.");
							};

							if (!_super) {
								// No caller
								return extender.validateDispatchResult(undefined, attr, async, attribute, this, _shared.SECRET);
							};

							const oldValues = types.getAttributes(this, ['_super', _shared.CurrentDispatchSymbol, _shared.CurrentCallerIndexSymbol], null, _shared.SECRET);
							const oldCallerCalled = _super[_shared.CalledSymbol];

							const oldInside = __Internal__.setInside(this, _shared.SECRET, true);

							let retVal = undefined;

							try {
								const attrs = {
									_super: _super,
									[_shared.CurrentDispatchSymbol]: dispatch,
									[_shared.CurrentCallerIndexSymbol]: index,
								};
								types.setAttributes(this, attrs, null, _shared.SECRET);

								_super[_shared.CalledSymbol] = false;

								retVal = _super.apply(this, params);

								retVal = extender.validateDispatchResult(retVal, attr, async, attribute, this, _shared.SECRET);

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
										extender.handleDispatchError(ex, attr, this);
									};
								};

							} finally {
								if (notReentrant) {
									if (async && retVal) {
										retVal = retVal.nodeify(function resetCalled(err, result) {
											notReentrantMap.set(attr, false);
											if (err) {
												extender.handleDispatchError(err, attr, this);
											} else {
												return result;
											};
										}, this);
									} else {
										notReentrantMap.set(attr, false);
									};
								} else if (async && retVal) {
									retVal = retVal.catch(function(err) {
											extender.handleDispatchError(err, attr, this);
										}, this);
								};

								if (oldInside) {
									__Internal__.restoreInside(oldInside);
								};

								_super[_shared.CalledSymbol] = oldCallerCalled;

								types.setAttributes(this, oldValues, null, _shared.SECRET);
							};

							return retVal;

						}).bind(this);
					}))))));
*/

			__Internal__.callOutsideFn = (__Internal__.hasScopes ?
				function callOutside(fn, /*optional*/args) {
					const isInside = __Internal__.isInside(this);
					const oldValues = isInside && types.getAttributes(this, [_shared.CurrentDispatchSymbol, _shared.CurrentCallerIndexSymbol, '_super'], null, _shared.SECRET);
					const dispatch = isInside && oldValues[_shared.CurrentDispatchSymbol];
					const callers = dispatch && dispatch[_shared.CallersSymbol];
					const caller = callers && callers[oldValues[_shared.CurrentCallerIndexSymbol] - 1];
					const oldCallerCalled = caller && caller[_shared.CalledSymbol];
					const oldInside = __Internal__.setInside(null, null, true);
					try {
						if (args) {
							return fn.apply(null, args);
						} else {
							return fn();
						}
					} catch(ex) {
						throw ex;
					} finally {
						if (oldInside) {
							__Internal__.restoreInside(oldInside);
						};
						if (caller) {
							caller[_shared.CalledSymbol] = oldCallerCalled;
						};
						if (dispatch) {
							types.setAttributes(this, oldValues, null, _shared.SECRET);
						};
					}
				}
				:
				function callOutside(fn, /*optional*/args) {
					if (args) {
						return fn.apply(null, args);
					} else {
						return fn();
					}
				}
			);

			__Internal__.callOutside = doodad.PROTECTED(doodad.TYPE(doodad.INSTANCE(doodad.OPTIONS({dontSetSuper: true}, doodad.JS_METHOD(__Internal__.callOutsideFn)))));

			doodad.ADD('OutsideCallback', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 0,
						params: {
							obj: {
								type: 'Class,Object',
								optional: false,
								description: "Target.",
							},
							fn: {
								type: 'function',
								optional: false,
								description: "Callback function.",
							},
						},
						returns: 'function',
						description: "Creates a callback running outside of a class or class instance.",
					}
				//! END_REPLACE()
				, types.INHERIT(types.Callback, function OutsideCallback(obj, fn) {
					if (types.isCallback(fn)) {
						throw new types.ValueError("The function is already a Callback.");
					};
					const cb = types.INHERIT(doodad.OutsideCallback, function outside(/*paramarray*/...params) {
						return __Internal__.callOutsideFn.call(obj, fn, params);
					});
					types.setAttribute(cb, _shared.BoundObjectSymbol, obj, {});
					types.setAttribute(cb, _shared.OriginalValueSymbol, fn, {});
					_shared.registerCallback(cb);
					return cb;
				})));

			__Internal__.makeOutsideFn = (__Internal__.hasScopes ?
				function makeOutside(fn) {
					if (types.isCallback(fn)) {
						// Already a safe callback.
						return fn;
					};
					return doodad.OutsideCallback(this, fn);
				}
				:
				function makeOutside(fn) {
					return fn;
				}
			);

			__Internal__.makeOutside = doodad.PROTECTED(doodad.TYPE(doodad.INSTANCE(doodad.OPTIONS({dontSetSuper: true}, doodad.JS_METHOD(__Internal__.makeOutsideFn)))));

			__Internal__.classProto = {
				$TYPE_NAME: "Class",
				$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('Class')), true) */,

				_new: types.SUPER(
					function _new(/*paramarray*/...args) {
						const cls = types.getType(this),
							forType = types.isType(this);

						this._super();

						// Validate type
						if (!cls) {
							throw new types.Error("Invalid class.");
						};

						const modifiers = (types.get(cls, _shared.ModifiersSymbol) || 0);

						// Must not be a base class
						const isBase = !!(modifiers & (doodad.ClassModifiers.Base | doodad.ClassModifiers.MixIn | doodad.ClassModifiers.Interface));
						if (isBase) {
							if (!forType) {
								throw new types.Error("Bases, mix-ins and interfaces must be inherited first.");
							};
						};

						// Static types can't be instantiated
						const isStatic = !!(modifiers & doodad.ClassModifiers.Static);
						if (isStatic) {
							if (!forType) {
								throw new types.Error("Static types can't be instantiated.");
							};
						};

						const isExpandable = !!(modifiers & doodad.ClassModifiers.Expandable);

						if (forType) {
							// Initialize attributes
							const typeStorage = this[_shared.AttributesStorageSymbol];
							const instanceStorage = this.prototype[_shared.AttributesStorageSymbol];

							let values;

							const typeAttributes = this[_shared.AttributesSymbol];
							const typeImplements = this[_shared.ImplementsSymbol];
							const typeToInitialize = this[_shared.ToInitializeSymbol];
							const typeToExtendLater = this[_shared.ToExtendLaterSymbol];
							if (isExpandable) {
								__Internal__.switchToExpandable(typeAttributes);
							};
							values = {
								[_shared.AttributesSymbol]: types.freezeObject(typeAttributes), // NOTE: Will be cloned
								[_shared.ModifiersSymbol]: modifiers,
								[_shared.ImplementsSymbol]: types.freezeObject(typeImplements), // NOTE: Will be cloned
								[_shared.IsolatedSymbol]: this[_shared.IsolatedSymbol],
								[_shared.PrototypeSymbol]: this[_shared.PrototypeSymbol],
								[_shared.BaseSymbol]: this[_shared.BaseSymbol],
								[_shared.ToInitializeSymbol]: types.freezeObject(typeToInitialize), // NOTE: Will be cloned
								[_shared.ToExtendLaterSymbol]: types.freezeObject(typeToExtendLater), // NOTE: Will be cloned
							};
							const initType = __Internal__.initializeAttributes(typeAttributes, true, values, null, null, typeToInitialize);
							initType(this, typeStorage);

							const instanceAttributes = this.prototype[_shared.AttributesSymbol];
							const instanceImplements = this.prototype[_shared.ImplementsSymbol];
							const instanceToInitialize = this.prototype[_shared.ToInitializeSymbol];
							const instanceToExtendLater = this.prototype[_shared.ToExtendLaterSymbol];
							if (isExpandable) {
								__Internal__.switchToExpandable(instanceAttributes);
								values = {
									[_shared.AttributesSymbol]: instanceAttributes, // NOTE: Will be cloned
									[_shared.ImplementsSymbol]: instanceImplements, // NOTE: Will be cloned
									[_shared.ToInitializeSymbol]: instanceToInitialize, // NOTE: Will be cloned
									[_shared.ToExtendLaterSymbol]: instanceToExtendLater, // NOTE: Will be cloned
								};
							} else {
								values = {
									[_shared.AttributesSymbol]: types.freezeObject(instanceAttributes),
									[_shared.ImplementsSymbol]: null,
									[_shared.ToInitializeSymbol]: types.freezeObject(instanceToInitialize),
									[_shared.ToExtendLaterSymbol]: types.freezeObject(instanceToExtendLater),
								};
							};
							const initProto = __Internal__.initializeAttributes(instanceAttributes, false, values, true, null, instanceToInitialize);
							initProto(this.prototype, instanceStorage);

							if (!isBase && !isStatic) {
								const initInstance = __Internal__.initializeAttributes(instanceAttributes, false, values, false, null, instanceToInitialize);
								types.setAttribute(this, _shared.InitInstanceSymbol, initInstance, null, _shared.SECRET);
							};

						} else {
							const instanceStorage = types.clone(types.getAttribute(cls.prototype, _shared.AttributesStorageSymbol, null, _shared.SECRET));

							cls[_shared.InitInstanceSymbol](this, instanceStorage);
						};

						// Call constructor
						if (!isBase) {
							if (this._implements(mixIns.Creatable)) {
								if (forType) {
									this.$create(...(_shared.Natives.arraySliceCall(args, 3)));
								} else {
									this.create(...args);
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
							}
						}))))))),


				$extend: root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
							author: "Claude Petit",
							revision: 1,
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

							let cache = this[_shared.IsolatedCacheSymbol];
							if (!cache) {
								cache = types.setAttribute(this, _shared.IsolatedCacheSymbol, new types.Map(), null, _shared.SECRET);
							};

							if (cache.has(type)) {
								return cache.get(type);
							};

							const uuid = _shared.getUUID(type);

							if (uuid && cache.has(uuid)) {
								return cache.get(uuid);
							};

							const _isolated = cls[_shared.IsolatedSymbol];

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
									typeExtendedAttributes = data[1],
									typeAttributes = data[2],
									typeStorage = data[4],
									instanceStorage = data[5],
									base = data[7],
									baseType = types.getType(base),
									baseIsType = types.isType(base),
									_isolated = data[8],
									_implements = data[9],
									proto = data[10],
									modifiers = data[11],
									protoUUID = null, //data[12],
									typeToInitialize = data[13],
									instanceToInitialize = data[14],
									typeToExtendLater = data[15],
									instanceToExtendLater = data[16],
									instanceAttributes = data[17],
									instanceExtendedAttributes = data[18];

								_interface = __Internal__.createType(base, baseType, baseIsType, proto, protoName, protoUUID, typeStorage, instanceStorage, typeAttributes, instanceAttributes, typeExtendedAttributes, instanceExtendedAttributes, typeToInitialize, instanceToInitialize, _isolated, _implements, modifiers, typeToExtendLater, instanceToExtendLater, null);

								_interface = types.INIT(_interface, [cls]);

								if (!types.baseof(doodad.Interface, _interface)) {
									return null;
								};

								data[6] = _interface;
							};

							const obj = new _interface(this);

							const _implements = types.getAttribute(_interface, _shared.ImplementsSymbol, null, _shared.SECRET);

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
								const attributes = this[_shared.AttributesSymbol],
									attribute = attributes[attr],
									extender = attribute[_shared.ExtenderSymbol];
								if (extender && extender.isPreserved) {
									const preservedAttr = '__' + attr + '_preserved__';
									return this[preservedAttr];
								};
							};
							return undefined; // "consistent-return"
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
								const attributes = this[_shared.AttributesSymbol],
									attribute = attributes[attr],
									extender = attribute[_shared.ExtenderSymbol];
								if (extender && extender.isPreserved) {
									const preservedAttr = '__' + attr + '_preserved__';
									types.setAttribute(this, attr, this[preservedAttr], null, _shared.SECRET);
									return true;
								};
							};
							return false;
						}))))),

				overrideSuper: __Internal__.overrideSuper,
				_superFrom: __Internal__._superFrom,
				//					_superAsync: __Internal__._superAsync,
				callOutside: __Internal__.callOutside,
				makeOutside: __Internal__.makeOutside,

				_implements: root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
							author: "Claude Petit",
							revision: 5,
							params: {
								type: {
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
						function _implements(type) {
							const forType = types.isType(this),
								cls = (forType ? this : types.getType(this));
							const impls = (!forType && ((cls[_shared.ModifiersSymbol] || 0) & doodad.ClassModifiers.Expandable) ? this : cls)[_shared.ImplementsSymbol];
							if (types.isArray(type)) {
								const typeLen = type.length;
								for (let i = 0; i < typeLen; i++) {
									if (types.has(type, i)) {
										const typ = types.getType(type[i]);
										if (!typ) {
											continue;
										};
										if (!types.isLike(typ, __Internal__.CLASS_OR_INTERFACE)) {
											continue;
										};
										if (impls.has(typ)) {
											return true;
										};
										const uuid = _shared.getUUID(typ);
										if (uuid && impls.has(uuid)) {
											return true;
										};
									};
								};
								return false;
							} else {
								const typ = types.getType(type);
								if (!typ) {
									return false;
								};
								if (!types.isLike(typ, __Internal__.CLASS_OR_INTERFACE)) {
									return false;
								};
								if (impls.has(typ)) {
									return true;
								};
								const uuid = _shared.getUUID(typ);
								if (uuid && impls.has(uuid)) {
									return true;
								};
								return false;
							}
						}))))),

				isImplemented: root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
							author: "Claude Petit",
							revision: 3,
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
							const attrs = this[_shared.AttributesSymbol];
							if (!(name in attrs)) {
								return false;
							};
							const attr = attrs[name],
								extender = attr[_shared.ExtenderSymbol];
							if (!types.isLike(extender, extenders.Method)) {
								return false;
							};
							const isType = types.isType(this);
							if ((isType && !extender.isType) || (!isType && !extender.isInstance)) {
								return false;
							};
							const method = types.getAttribute(this, name, null, _shared.SECRET);
							return !((method[_shared.ModifiersSymbol] || 0) & doodad.MethodModifiers.NotImplemented);
						}))))),

			};

			tools.extend(__Internal__.classProto, tools.map(__Internal__.defaultAttributes, function(attr) {
				return attr.clone();
			}, /*thisObj*/undefined, /*start*/null, /*end*/null, /*sparsed*/false, /*includeSymbols*/true));

			//! IF_SET("serverSide")
				(function() {
					//! BEGIN_REMOVE()
						if (nodejs) {
						//! END_REMOVE()
						const customSymbol = nodejs.getCustomInspectSymbol();
						if (customSymbol) {
							__Internal__.classProto[customSymbol] = doodad.PUBLIC(doodad.TYPE(doodad.INSTANCE(doodad.BIND(doodad.JS_METHOD(function inspect(depth, ctx) {
								const isType = types.isType(this),
									attrs = types.getAttribute(this, _shared.AttributesSymbol, null, _shared.SECRET) || {},
									result = {};
								const loopKeys = function _loopKeys(keys) {
									for (let i = 0; i < keys.length; i++) {
										const key = keys[i];
										if (key !== customSymbol) {
											const attr = attrs[key],
												extender = attr[_shared.ExtenderSymbol];
											if (extender) {
												if ((attr[_shared.ScopeSymbol] === doodad.Scopes.Public) && ((isType && extender.isType) || (!isType && extender.isInstance))) {
													result[key] = types.getAttribute(this, key, null, _shared.SECRET);
												};
											};
										};
									};
								};
								loopKeys.call(this, types.keys(attrs));
								loopKeys.call(this, types.symbols(attrs));
								return result;
							})))));
						};
						//! BEGIN_REMOVE()
						};
					//! END_REMOVE()
				})();
			//! END_IF()

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
				$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('Interface')), true) */,

				_new: types.SUPER(
					function _new(host) {
						// TODO: Merge _new with Class's _new

						const forType = types.isType(this),
							cls = (forType ? this : types.getType(this));

						this._super();

						if (!forType) {
							root.DD_ASSERT && root.DD_ASSERT((types.isType(this) && types.isClass(host)) || (types.isObject(this) && types._instanceof(host, doodad.Class)), "Invalid host.");
						};

						// Validate type
						if (!cls) {
							throw new types.Error("Invalid class.");
						};

						const modifiers = (types.get(cls, _shared.ModifiersSymbol) || 0);

						// Must not be a base class
						const isBase = !!(modifiers & doodad.ClassModifiers.Base);
						if (isBase) {
							if (!forType) {
								throw new types.Error("Bases, mix-ins and interfaces must be inherited first.");
							};
						};
						// Initialize attributes
						if (forType) {
							// Initialize attributes
							const typeStorage = this[_shared.AttributesStorageSymbol];
							const instanceStorage = this.prototype[_shared.AttributesStorageSymbol];

							let values;

							const typeAttributes = this[_shared.AttributesSymbol];
							const typeImplements = this[_shared.ImplementsSymbol];
							const typeToInitialize = this[_shared.ToInitializeSymbol];
							const typeToExtendLater = this[_shared.ToExtendLaterSymbol];
							values = {
								[_shared.AttributesSymbol]: types.freezeObject(typeAttributes), // NOTE: Will be cloned
								[_shared.ModifiersSymbol]: modifiers,
								[_shared.ImplementsSymbol]: types.freezeObject(typeImplements), // NOTE: Will be cloned
								[_shared.IsolatedSymbol]: this[_shared.IsolatedSymbol],
								[_shared.PrototypeSymbol]: this[_shared.PrototypeSymbol],
								[_shared.BaseSymbol]: this[_shared.BaseSymbol],
								[_shared.ToInitializeSymbol]: types.freezeObject(typeToInitialize), // NOTE: Will be cloned
								[_shared.ToExtendLaterSymbol]: types.freezeObject(typeToExtendLater), // NOTE: Will be cloned
							};
							const initType = __Internal__.initializeAttributes(typeAttributes, true, values, null, null, typeToInitialize);
							initType(this, typeStorage);

							const instanceAttributes = this.prototype[_shared.AttributesSymbol];
							//const instanceImplements = this.prototype[_shared.ImplementsSymbol];
							const instanceToInitialize = this.prototype[_shared.ToInitializeSymbol];
							const instanceToExtendLater = this.prototype[_shared.ToExtendLaterSymbol];
							values = {
								[_shared.AttributesSymbol]: types.freezeObject(instanceAttributes),
								[_shared.ImplementsSymbol]: null,
								[_shared.ToInitializeSymbol]: types.freezeObject(instanceToInitialize),
								[_shared.ToExtendLaterSymbol]: types.freezeObject(instanceToExtendLater),
							};
							const initProto = __Internal__.initializeAttributes(instanceAttributes, false, values, true, null, instanceToInitialize);
							initProto(this.prototype, instanceStorage);

							if (!isBase) {
								const initInstance = __Internal__.initializeAttributes(instanceAttributes, false, values, false, null, instanceToInitialize);
								types.setAttribute(this, _shared.InitInstanceSymbol, initInstance, null, _shared.SECRET);
							};

						} else {
							const instanceStorage = types.clone(types.getAttribute(cls.prototype, _shared.AttributesStorageSymbol, null, _shared.SECRET));

							cls[_shared.InitInstanceSymbol](this, instanceStorage);

							types.setAttribute(this, _shared.HostSymbol, host, null, _shared.SECRET);
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
				//					_superAsync: __Internal__.superAsync,
				callOutside: __Internal__.callOutside,
				makeOutside: __Internal__.makeOutside,

				[_shared.HostSymbol]: doodad.PUBLIC(doodad.READ_ONLY(doodad.INSTANCE(doodad.ATTRIBUTE(null, extenders.Attribute, {isProto: false})))),
			};

			tools.extend(__Internal__.interfaceProto, tools.map(__Internal__.defaultAttributes, function(attr) {
				return attr.clone();
			}, /*thisObj*/undefined, /*start*/null, /*end*/null, /*sparsed*/false, /*includeSymbols*/true));

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

			//==================================
			// Finalization
			//==================================

			__Internal__.CLASS_OR_INTERFACE = [doodad.Class, doodad.Interface];

			(function addReserved() {
				const loopKeys = function _loopKeys(keys) {
					tools.forEach(keys, function(key) {
						_shared.reservedAttributes[key] = null;
					});
				};

				//loopKeys(__Internal__.defaultAttributesKeys);
				//loopKeys(__Internal__.defaultAttributesSymbols);
				loopKeys(types.keys(__Internal__.defaultAttributes));
				loopKeys(types.symbols(__Internal__.defaultAttributes));
			})();

			//==================================
			// Events
			//==================================

			_shared.EVENT_NAME_PREFIX = 'on';
			_shared.EVENT_NAME_PREFIX_LEN = _shared.EVENT_NAME_PREFIX.length;

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
								types.setAttribute(this, 'data', data || {});
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

								types.setAttribute(this, 'error', error);
							};
						}),

						preventDefault: types.SUPER(function preventDefault() {
							this._super();

							this.error.trapped = true;
						}),
					})));


			__Internal__.eventHandlerProto = {
				$TYPE_NAME: 'EventHandler',
				$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('EventHandler')), true) */,

				stackSize: doodad.PUBLIC(10),

				_new: types.SUPER(function _new(/*optional*/obj, /*optional*/extender) {
					this._super();

					if (!types.isType(this)) {
						this[_shared.ObjectSymbol] = obj;
						this[_shared.ExtenderSymbol] = extender;
						this[_shared.StackSymbol] = [];
					};
				}),

				apply: doodad.PUBLIC(doodad.READ_ONLY(_shared.Natives.functionApply)),
				call: doodad.PUBLIC(doodad.READ_ONLY(_shared.Natives.functionCall)),
				bind: doodad.PUBLIC(doodad.READ_ONLY(_shared.Natives.functionBind)),

				getCount: function getCount() {
					const stack = this[_shared.StackSymbol];
					return tools.reduce(stack, function(result, data) {
						if (data[4] > 0) {
							result++;
						};
						return result;
					}, 0);
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

						const stack = this[_shared.StackSymbol];

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
								this[_shared.SortedSymbol] = false;
								this[_shared.ClonedStackSymbol] = null;
							};
							return false;
						} else if (stack.length < this.stackSize) {
							const eventObj = this[_shared.ObjectSymbol];
							let cb = fn;
							if (obj) {
								if ((obj === eventObj) || __Internal__.isInside(obj, this[_shared.EventInsideSymbol])) {
									cb = doodad.Callback(obj, cb, true, null, _shared.SECRET);
								} else {
									cb = doodad.Callback(obj, cb, true);
								};
							};
							// eslint-disable-next-line array-bracket-spacing
							stack.push([/*0*/ obj, /*1*/ fn, /*2*/ priority, /*3*/ datas, /*4*/ count, /*5*/ cb]);
							this[_shared.SortedSymbol] = false;
							this[_shared.ClonedStackSymbol] = null;
							const ev = new doodad.Event({event: this[_shared.NameSymbol], obj: obj, handler: fn, datas: datas});
							//if (types.isEntrant(eventObj, 'onEventAttached')) {
							types.invoke(eventObj, eventObj.onEventAttached, [ev], _shared.SECRET);
							//};
							return true;
						} else {
							throw new types.Error("Stack size limit reached for event method '~0~'. This can be due to a leak, or increase its 'stackSize' attribute.", [this[_shared.NameSymbol]]);
						}
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

						const stack = this[_shared.StackSymbol];

						const evs = tools.popItems(stack, function(ev) {
							const evData = ev[3];
							return (!obj || (ev[0] === obj)) && (!fn || (ev[1] === fn)) && tools.every(datas, function(value, key) {
								return types.hasIndex(evData, key) && (evData[key] === value);
							});
						});

						const evsLen = evs.length;
						if (evsLen) {
							this[_shared.SortedSymbol] = false;
							this[_shared.ClonedStackSymbol] = null;

							const eventObj = this[_shared.ObjectSymbol];

							if (!_shared.DESTROYED(eventObj)) {
								//if (types.isEntrant(eventObj, 'onEventDetached')) {
								const eventName = this[_shared.NameSymbol],
									onEventDetached = eventObj.onEventDetached;

								for (let i = 0; i < evsLen; i++) {
									const data = evs[i];
									const ev = new doodad.Event({event: eventName, obj: data[0], handler: data[1], datas: data[3]});
									types.invoke(eventObj, onEventDetached, [ev], _shared.SECRET);
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
					, function promise(/*optional*/callback, /*optional*/thisObj, /*optional*/secret) {
						// NOTE: Don't forget that a promise resolves only once, so ".promise" is like ".attachOnce".
						const Promise = types.getPromise();
						return Promise.create(function eventPromise(resolve, reject) {
							if (callback) {
								callback = _shared.PromiseCallback(thisObj, callback, secret || (thisObj === this[_shared.ObjectSymbol] ? _shared.SECRET : null));
							};

							const self = this,
								obj = this[_shared.ObjectSymbol],
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

				[_shared.ObjectSymbol]: doodad.PROTECTED(null),
				[_shared.ExtenderSymbol]: doodad.PROTECTED(null),
				[_shared.StackSymbol]: doodad.PROTECTED(null),
				[_shared.SortedSymbol]: doodad.PROTECTED(false),
				[_shared.ClonedStackSymbol]: doodad.PROTECTED(null),
				[_shared.EventInsideSymbol]: doodad.PROTECTED(null),
			};

			root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 4,
						params: null,
						returns: 'Class',
						description: "Event handler prototype.",
					}
				//! END_REPLACE()
				, doodad.REGISTER(doodad.Class.$extend(
					__Internal__.eventHandlerProto
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
					$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('EventExtender')), true) */,

					eventsPrefixed: types.READ_ONLY(false),
					eventsAttr: types.READ_ONLY('__EVENTS'),
					eventsImplementation: types.READ_ONLY('Doodad.MixIns.Events'),
					eventProto: types.READ_ONLY(doodad.EventHandler),

					enableScopes: types.READ_ONLY(false),
					errorEvent: types.READ_ONLY(false),

					isProto: types.READ_ONLY(false), // must be created on Class instances, not on the prototype

					_new: types.SUPER(function _new(/*optional*/options) {
						this._super(options);

						types.setAttribute(this, 'errorEvent', !!types.get(options, 'errorEvent', this.errorEvent));
					}),

					getCacheName: types.SUPER(function getCacheName(/*optional*/options) {
						return this._super(options) +
								',' + (types.get(options, 'errorEvent', this.errorEvent) ? '1' : '0');
					}),

					overrideOptions: types.SUPER(function overrideOptions(options, newOptions, /*optional*/replace) {
						options = this._super(options, newOptions, replace);
						if (replace) {
							tools.fill(['errorEvent'], options, this, newOptions);
						} else {
							options.errorEvent = !!newOptions.errorEvent || this.errorEvent;
						};
						return options;
					}),

					getterTemplate: types.SUPER(function getterTemplate(attr, boxed, forType, storage) {
						const getter = this._super(attr, boxed, forType, storage);
						return types.INHERIT(doodad.AttributeGetter, function eventGetter() {
							const eventHandler = getter.call(this);
							types.setAttribute(eventHandler, _shared.EventInsideSymbol, __Internal__.preserveInside(), null, _shared.SECRET);
							return eventHandler;
						});
					}),

					extend: types.SUPER(function extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, proto, protoName) {
						if (root.getOptions().debug) {
							if (!types.has(destAttributes, this.eventsAttr)) {
								throw new types.Error("You must implement '~0~'.", [this.eventsImplementation]);
							};

							if (this.eventsPrefixed) {
								if (attr.slice(0, _shared.EVENT_NAME_PREFIX_LEN) !== _shared.EVENT_NAME_PREFIX) {
									throw new types.Error("The event named '~0~' must be prefixed by '~1~.", [attr, _shared.EVENT_NAME_PREFIX]);
								};
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
						//extenders.Attribute.remove.call(this, attr, obj, storage, forType, attribute);
					},
				})));

			extenders.REGISTER([], extenders.Event.$inherit({
				$TYPE_NAME: "RawEvent",
				$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('RawEventExtender')), true) */,

				eventsPrefixed: types.READ_ONLY(true),
				eventsAttr: types.READ_ONLY('__RAW_EVENTS'),
				eventsImplementation: types.READ_ONLY('Doodad.MixIns.RawEvents'),
			}));

			__Internal__.EVENT_CACHE = tools.nullObject();

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
							dispatch = this[_shared.CurrentDispatchSymbol];

						ev && types.setAttributes(ev, {obj: this, name: dispatch[_shared.NameSymbol]}, null, _shared.SECRET);

						let cancelled = !!this._super(ev) && cancellable;

						if (!cancelled) {
							const values = types.getAttributes(dispatch, [_shared.StackSymbol, _shared.SortedSymbol, _shared.ClonedStackSymbol], null, _shared.SECRET);
							const stack = values[_shared.StackSymbol];

							let clonedStack;
							if (values[_shared.SortedSymbol]) {
								clonedStack = values[_shared.ClonedStackSymbol];
							} else {
								if (stack.length) {
									stack.sort(function(value1, value2) {
										return tools.compareNumbers(value1[2], value2[2]);
									});
									clonedStack = types.clone(stack);
								} else {
									clonedStack = [];
								};
								const values = {
									[_shared.SortedSymbol]: true,
									[_shared.ClonedStackSymbol]: clonedStack,
								};
								types.setAttributes(dispatch, values, null, _shared.SECRET);
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

										ev && types.setAttribute(ev, 'handlerData', data[3], null, _shared.SECRET);

										retval = data[5].call(obj, ev);
									};

									if ((retval === false) && cancellable) {
										ev = new doodad.CancelEvent({
											event: ev,
										});

										types.setAttributes(ev, {obj: this, name: this.onEventCancelled[_shared.NameSymbol]}, null, _shared.SECRET);

										this.onEventCancelled(ev);

										cancelled = true;

										break;
									};
								};

							} catch(ex) {
								throw ex;

							} finally {
								const removed = tools.popItems(stack, function(data) {
									return (data[4] <= 0);
								});
								if (removed.length) {
									const values = {
										[_shared.SortedSymbol]: false,
										[_shared.ClonedStackSymbol]: null,
									};
									types.setAttributes(dispatch, values, null, _shared.SECRET);
								};

								if (evObj) {
									types.setAttributes(ev, {obj: evObj, name: evName}, null, _shared.SECRET);
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
					eventFn[_shared.OverrideWithSymbol] = fn;
				};

				return eventFn;
			};

			__Internal__.RAW_EVENT_CACHE = tools.nullObject();

			__Internal__.RAW_EVENT = function RAW_EVENT(errorEvent, /*optional*/fn) {
				const key = (errorEvent ? 'y' : 'n');

				let eventFn;

				if (types.has(__Internal__.RAW_EVENT_CACHE, key)) {
					eventFn = __Internal__.RAW_EVENT_CACHE[key];

				} else {
					eventFn = function handleEvent(/*paramarray*/...params) {
						let emitted = !!this._super(...params);

						const dispatch = types.getAttribute(this, _shared.CurrentDispatchSymbol, null, _shared.SECRET);

						const values = types.getAttributes(dispatch, [_shared.StackSymbol, _shared.SortedSymbol, _shared.ClonedStackSymbol], null, _shared.SECRET);
						const stack = values[_shared.StackSymbol];

						let clonedStack;
						if (values[_shared.SortedSymbol]) {
							clonedStack = values[_shared.ClonedStackSymbol];
						} else {
							if (stack.length) {
								stack.sort(function(value1, value2) {
									return tools.compareNumbers(value1[2], value2[2]);
								});
								clonedStack = types.clone(stack);
							} else {
								clonedStack = [];
							};
							const values = {
								[_shared.SortedSymbol]: true,
								[_shared.ClonedStackSymbol]: clonedStack,
							};
							types.setAttributes(dispatch, values, null, _shared.SECRET);
						};

						const stackLen = clonedStack.length;

						try {
							for (let i = 0; i < stackLen; i++) {
								const data = clonedStack[i],
									obj = data[0],
									cb = data[5];

								if (data[4] > 0) {
									data[4]--;

									cb.apply(obj, params);

									emitted = true;
								};
							};

						} catch(ex) {
							throw ex;

						} finally {
							const removed = tools.popItems(stack, function(data) {
								return (data[4] <= 0);
							});
							if (removed.length) {
								const values = {
									[_shared.SortedSymbol]: false,
									[_shared.ClonedStackSymbol]: null,
								};
								types.setAttributes(dispatch, values, null, _shared.SECRET);
							};

							if (errorEvent) {
								const ex = params[0];

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
					eventFn[_shared.OverrideWithSymbol] = fn;
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
					$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('Clonable')), true) */,

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
						, doodad.PUBLIC(doodad.RETURNS(function clone(val) {
							return (val !== this) && types.is(val, this);
						}))),  // function()
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
					$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('Serializable')), true) */,

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
						, doodad.PUBLIC(doodad.RETURNS(function(val) {
							return types._instanceof(val, this); /* Polymorphism allowed */
						}))), // function(data)
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

					__EVENTS: doodad.PROTECTED(doodad.READ_ONLY(/*doodad.NOT_INHERITED(*/doodad.PRE_EXTEND(doodad.PERSISTENT(doodad.TYPE(doodad.INSTANCE(doodad.ATTRIBUTE([], extenders.UniqueArray))))))),
					__ERROR_EVENT: doodad.PUBLIC(doodad.READ_ONLY(/*doodad.NOT_INHERITED(*/doodad.PRE_EXTEND(doodad.PERSISTENT(doodad.TYPE(doodad.INSTANCE(null)))))),

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
						, doodad.PUBLIC(doodad.TYPE(doodad.INSTANCE(function detachEvents(obj, fn, /*optional*/datas) {
							const events = this.__EVENTS,
								eventsLen = events.length;
							for (let i = 0; i < eventsLen; i++) {
								this[events[i]].detach(obj, fn, datas);
							};
						})))),

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
						, doodad.PUBLIC(doodad.TYPE(doodad.INSTANCE(function clearEvents(/*optional*/objs) {
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
						})))),
				}))));


			root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'Class',
						description: "Mix-in that implements raw events (and normal events) in a class.",
					}
				//! END_REPLACE()
				, mixIns.REGISTER(doodad.MIX_IN(mixIns.Events.$extend({
					$TYPE_NAME: "RawEvents",
					$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('Events')), true) */,

					__RAW_EVENTS: doodad.PROTECTED(doodad.READ_ONLY(/*doodad.NOT_INHERITED(*/doodad.PRE_EXTEND(doodad.PERSISTENT(doodad.TYPE(doodad.INSTANCE(doodad.ATTRIBUTE([], extenders.UniqueArray))))))),

					detachEvents: doodad.OVERRIDE(function detachEvents(obj, fn, /*optional*/datas) {
						const rawEvents = this.__RAW_EVENTS,
							rawEventsLen = rawEvents.length;
						for (let i = 0; i < rawEventsLen; i++) {
							this[rawEvents[i]].detach(obj, fn);
						};

						this._super(obj, fn, datas);
					}),

					clearEvents: doodad.OVERRIDE(function clearEvents(/*optional*/objs) {
						const events = this.__RAW_EVENTS,
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

						this._super(objs);
					}),
				}))));


			__Internal__.creatablePrototype = {
				$TYPE_NAME: 'Creatable',
				$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('Creatable')), true) */,

				[_shared.DestroyedSymbol]: doodad.PRIVATE(doodad.READ_ONLY(doodad.PERSISTENT(doodad.TYPE(doodad.INSTANCE(doodad.ATTRIBUTE(null, extenders.Attribute, {isProto: null})))))),

				$onDestroy: doodad.WHEN(mixIns.Events, doodad.EVENT(false)),
				onDestroy: doodad.WHEN(mixIns.Events, doodad.EVENT(false)),

				isDestroyed: doodad.PUBLIC(doodad.TYPE(doodad.INSTANCE(doodad.CAN_BE_DESTROYED(doodad.CALL_FIRST(function isDestroyed() {
					const destroyed = this[_shared.DestroyedSymbol];
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
					, doodad.PUBLIC(doodad.CAN_BE_DESTROYED(doodad.CALL_FIRST(function $create(/*paramarray*/...args) {
						if (this[_shared.DestroyedSymbol] !== null) {
							throw new types.Error("Object already created.");
						};
						types.setAttribute(this, _shared.DestroyedSymbol, false);
						try {
							this._super(...args);
						} catch(ex) {
							types.invoke(null, this.$destroy, null, _shared.SECRET, this);
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
							if (this[_shared.DestroyedSymbol] === false) {
								if (this._implements(mixIns.Events)) {
									this.$onDestroy();
								};

								this._super();

								types.setAttribute(this, _shared.DestroyedSymbol, true);

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
						function $createInstance(/*paramarray*/...args) {
							return types.newInstance(this, args);
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
					, doodad.PUBLIC(doodad.CAN_BE_DESTROYED(doodad.CALL_FIRST(function create(/*paramarray*/...args) {
						if (this[_shared.DestroyedSymbol] !== null) {
							throw new types.Error("Object already created.");
						};
						types.setAttribute(this, _shared.DestroyedSymbol, false);
						try {
							this._super(...args);
						} catch(ex) {
							types.invoke(null, this.destroy, null, _shared.SECRET, this);
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
							if (this[_shared.DestroyedSymbol] === false) {
								this._super();

								types.setAttribute(this, _shared.DestroyedSymbol, true);

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
							if (this[_shared.DestroyedSymbol] === false) {
								if (this._implements(mixIns.Events)) {
									this.onDestroy();
								};

								this._super();

								types.setAttribute(this, _shared.DestroyedSymbol, true);

								this._delete();
							};
						})))),

			};

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

					$__translations: doodad.PROTECTED(doodad.ATTRIBUTE(tools.nullObject(), extenders.ExtendObject, {maxDepth: 5, cloneOnInit: true})),

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
									tools.depthExtend(this[_shared.AttributesSymbol].$__translations[_shared.ExtenderSymbol].maxDepth, this.$__translations, value);

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
									root.DD_ASSERT && root.DD_ASSERT(false, "Invalid translation name.");

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

					$__config: doodad.PROTECTED(doodad.ATTRIBUTE(tools.nullObject(), extenders.ExtendObject, {maxDepth: 5, cloneOnInit: true})),

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
								tools.depthExtend(this[_shared.AttributesSymbol].$__config[_shared.ExtenderSymbol].maxDepth, this.$__config, value);

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
								root.DD_ASSERT && root.DD_ASSERT(false, "Invalid configuration name.");

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
			// Serializable objects
			//==================================

			root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 6,
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
							'code',  // Node.Js
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
							types.setAttribute(this, '__value', value);
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
								const details = tools.reduce(this.$ERROR_ATTRIBUTES, function(result, key) {
									const valKey = (key === 'innerStack' ? 'stack' : key);
									if (types.hasInherited(value, valKey)) {
										result[key] = this.$pack(value[valKey]);
									};
									return result;
								}, {}, this);
								data = {
									type: (type && type.DD_FULL_NAME ? '{' + type.DD_FULL_NAME + '}' : 'error'),
									value: details,
								};
							} else if (types.isArray(value)) {
								value = tools.map(value, this.$pack, this);
								data = value;
							} else if (types._implements(value, interfaces.Serializable)) {
								data = {
									type: '{' + types.getType(value).DD_FULL_NAME + '}',
									value: this.$pack(value.serialize()),
								};
							} else if (types.isObject(value) && types.isFunction(value.toJSON)) {
								const type = types.getType(value);
								data = {
									type: (type && type.DD_FULL_NAME ? '{' + type.DD_FULL_NAME + '}' : 'object'),
									value: this.$pack(value.toJSON('')),
								};
							} else if (types.isJsObject(value)) {
								value = tools.map(value, this.$pack, this);
								data = {
									type: 'object',
									value: value,
								};
							} else {
								throw new types.ValueError("Value can't be packed.");
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
									const cls = _shared.Natives.windowError;
									const tmp = new cls();
									tools.forEach(this.$ERROR_ATTRIBUTES, function(key) {
										if (types.has(value, key)) {
											types.setAttribute(tmp, key, this.$unpack(value[key]), {ignoreWhenReadOnly: true, configurable: true}, _shared.SECRET);
										};
									}, this);
									value = tmp;
								} else if (type === 'object') {
									value = tools.map(value, this.$unpack, this);
								} else if (type[0] === '{') {
									const clsName = type.slice(1, -1),
										cls = namespaces.get(clsName);
									const isError = types.isErrorType(cls);
									const isSerializable = !isError && types._implements(cls, interfaces.Serializable);
									const fromJSON = (cls && !isError && !isSerializable ? cls.fromJSON : null);
									if (!isError && !isSerializable && !types.isFunction(fromJSON)) {
										throw new types.ValueError("Object of type '~0~' can't be deserialized.", [clsName]);
									};
									if (isError) {
										const tmp = new cls();
										tools.forEach(this.$ERROR_ATTRIBUTES, function(key) {
											if (types.has(value, key)) {
												types.setAttribute(tmp, key, this.$unpack(value[key]), {ignoreWhenReadOnly: true, configurable: true}, _shared.SECRET);
											};
										}, this);
										value = tmp;
									} else if (isSerializable) {
										value = this.$unpack(value);
										value = cls.$unserialize(value);
									} else {
										value = this.$unpack(value);
										value = fromJSON.call(cls, value);
									};
								} else {
									throw new types.ValueError("Invalid packet.");
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


			types.preventExtensions(__Internal__[_shared.TargetSymbol]);
		},
	};
	return modules;
};

//! END_MODULE()
