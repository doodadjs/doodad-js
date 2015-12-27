//! REPLACE_BY("// Copyright 2015 Claude Petit, licensed under Apache License version 2.0\n")
// dOOdad - Class library for Javascript (BETA) with some extras (ALPHA)
// File: Doodad.js - Main file
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

// Naming conventions :
//
//     Namespaces, Types, Enums, and other Public Module Attributes : Each word in lower case and beginning with an upper case. ex.: MyType
//     Object Attributes, Functions, Arguments and Variables : First word all lower case. Other words in lower case and beginning with an upper case. ex.: processQueue
//     JavaScript Keywords : Preceded by an underscore (_). ex.: _new
//     Private Types, and Private Object Attributes : Preceded by two underscores (__). ex.: __MyType
//     Private Module Types, and private Variables : Preceded by two underscores (__) and followed by two other underscores. ex.: __myPrivateVariable__
//     Read-only (or don't touch warning) Attributes, and Special Functions : All upper case and words separated with an underscore (_). ex: READ_ONLY_ATTRIBUTE
//     Non-instance (static) Type Attributes : Preceded by a dollar sign ("$").

(function() {
	var global = this;

	global.DD_MODULES = (global.DD_MODULES || {});
	global.DD_MODULES['Doodad'] = {
		type: null,
		version: '0b',
		namespaces: ['Extenders', 'Interfaces', 'MixIns', 'Exceptions'],
		dependencies: [
			'Doodad.Tools',
			'Doodad.Types',
			'Doodad.Namespaces',
			{
				name: 'Doodad.Debug',
				optional: true,
			},
		],
		replaceEntry: true,
		//replaceObject: true,
		bootstrap: true,
		
		create: function create(root, /*optional*/_options) {
			"use strict";

			// Class entry
			var registry = root.DD_REGISTRY,
				doodad = root.Doodad,
				types = doodad.Types,
				dom = doodad.DOM,
				namespaces = doodad.Namespaces,
				entries = namespaces.Entries,
				tools = doodad.Tools,
				extenders = doodad.Extenders,
				interfaces = doodad.Interfaces,
				mixIns = doodad.MixIns,
				exceptions = doodad.Exceptions;


			doodad.options = {
				// Settings
				settings: {
					enforceScopes: false,    // for performance, set it to "false"
					enforcePolicies: false,  // for performance, set it to "false"
					publicOnDebug: false,    // to be able to read core attributes in debug mode, set it to "true"
				},
				
				// Hooks
				hooks: {
					popupExceptionHook: function popupException(obj, ex, /*optional*/attr, /*optional*/caller) {
						root.DD_ASSERT && root.DD_ASSERT(types._instanceof(ex, exceptions.Exception));
						global.alert && global.alert(ex.message);
					},
					catchExceptionHook: function catchException(obj, ex, /*optional*/attr, /*optional*/caller) {
						var doodad = root.Doodad,
							tools = doodad.Tools;
						types.Error.prototype.parse.apply(ex);
						var functionName = ((caller && types.unbox(caller.PROTOTYPE.$TYPE_NAME)) || types.getTypeName(obj) || '');
						if (functionName) {
							functionName += '.';
						};
						functionName += (ex.functionName || '<anonymous>');
						tools.log(tools.LogLevels.Error, "[~0~] in '~1~' at '~2~:~3~:~4~'.", [
							/*0*/ ex.toString(), 
							/*1*/ functionName,
							/*2*/ (attr || '<unknown>', ex.fileName || '<unknown>'), 
							/*3*/ ex.lineNumber, 
							/*4*/ ex.columnNumber
						]);
						doodad.Stack.dump();
						if (root.DD_ASSERT) {
							debugger;
						};
					},
				},
			};
			
			types.depthExtend(1, doodad.options, _options);
			
			doodad.options.settings.enforceScopes = types.toBoolean(doodad.options.settings.enforceScopes);
			doodad.options.settings.enforcePolicies = types.toBoolean(doodad.options.settings.enforcePolicies);
			doodad.options.settings.publicOnDebug = types.toBoolean(doodad.options.settings.publicOnDebug);
			
			// <FUTURE> Thread context
			var __Internal__ = {
				invokedClass: null,	// <FUTURE> thread level
				inTrapException: false, // <FUTURE> thread level
			};
			
			
			entries.Type = root.DD_DOC(
				//! REPLACE_BY("null")
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
						$TYPE_NAME: 'TypeEntry'
					}
				)));

			// Namespace objects
			doodad.TypeNamespace = root.DD_DOC(
				//! REPLACE_BY("null")
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
				, types.INIT(types.Namespace.$inherit(
					//typeProto
					{
						$TYPE_NAME: 'TypeNamespace',
					}
				)));
			
			types.Namespace.prototype.REGISTER = root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 0,
							paramsDirection: 'rightToLeft',
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
							},
							returns: 'Type',
							description: "Registers the specified type to the current namespace object and returns the specified type. Also validates and initializes that type.",
				}
				//! END_REPLACE()
				, function REGISTER(/*<<< optional[args]*/ type) {
					root.DD_ASSERT && root.DD_ASSERT((type === types.Type) || types.baseof(types.Type, type) || types.isSingleton(type), "Invalid type.");
					
					var args;
					if (arguments.length > 1) {
						args = type;
						type = arguments[1];
					};
					
					var name = types.getTypeName(type),
						isPrivate = (name.slice(0, 2) === '__');
					
					if (!isPrivate) {
						// Public type
						var fullName = ((this !== root) && (this instanceof types.Namespace) ? this.DD_FULL_NAME + '.' : '') + name;
						var regType = registry.get(fullName, entries.Type);
						if (regType) {
							doodad.UNREGISTER(regType);
						};
						
						types.invoke(type, 'setAttributes', [{
							DD_FULL_NAME: fullName,
							DD_NAME: name,
							DD_PARENT: this,
						}], {writable: false, enumerable: false});
						var entry = namespaces.createNamespace({
							name: fullName,
							type: entries.Type,
							namespaceType: doodad.TypeNamespace,
							args: args,
							object: type,
						});
						namespaces.initNamespace(entry);
					};
					
					var retval = type;
					if (types.isSingleton(type)) {
						type = types.getType(type);
					};
					
					if (!types.isMixIn(type) && !types.isInterface(type) && !types.isBase(type)) {
						if ((root.DD_ASSERT || doodad.options.settings.enforcePolicies)) {
							var mustOverride = type.$MUST_OVERRIDE;
							if (mustOverride) {
								throw new exceptions.Error("You must override the method '~0~' of type '~1~'.", [mustOverride, types.getTypeName(type)]);
							};
						};
						
						type = types.INIT(type, args);
					};
					
					return retval;
				});
			
			types.Namespace.prototype.UNREGISTER = root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 0,
							params: {
								type: {
									type: 'Type',
									optional: false,
									description: "Type to unregister.",
								}, 
							},
							returns: 'bool',
							description: "Unregisters the specified type from the current namespace object and returns 'true' when successful. Returns 'false' otherwise. Also destroys that type.",
				}
				//! END_REPLACE()
				, function UNREGISTER(type) {
					root.DD_ASSERT && root.DD_ASSERT((type === types.Type) || types.baseof(types.Type, type) || types.isSingleton(type), "Invalid type or type name.");
					
					var name = types.getTypeName(type),
						isPrivate = (name.slice(0, 2) === '__');
					
					if (!isPrivate) {
						registry.remove(type.DD_FULL_NAME, entries.Type);
					};
					
					if (types.isSingleton(type)) {
						if (types._implements(type, mixIns.Creatable)) {
							type.destroy();
						} else {
							types.invoke(type, '_delete');
						};
						type = types.getType(type);
					};
					
					if (!isPrivate && !types.isMixIn(type) && !types.isInterface(type) && !types.isBase(type)) {
						if (types._implements(type, mixIns.Creatable)) {
							type.$destroy();
						} else if (type.INITIALIZED) {
							types.invoke(type, '_delete');
						};
					};
					
					return true;
				});
			
			
			//==================================
			// Exceptions
			//==================================
			
			exceptions.Error = types.Error;
			
			exceptions.Application = root.DD_DOC(
				//! REPLACE_BY("null")
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
				, types.createErrorType('Application', exceptions.Error, function _new(title, message, /*optional*/params) {
					root.DD_ASSERT && root.DD_ASSERT(types.isStringAndNotEmptyTrim(title), "Invalid title.");
					var error = exceptions.Error.call(this, message, params);
					this.title = title;
					return error;
				}));

			doodad.trapException = root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 0,
							params: {
								obj: {
									type: 'object',
									optional: false,
									description: "Object.",
								},
								attr: {
									type: 'string',
									optional: false,
									description: "Attribute name.",
								},
								ex: {
									type: 'error',
									optional: false,
									description: "Trapped error object.",
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
				, function trapException(obj, attr, ex, /*optional*/caller) {
					if (!__Internal__.inTrapException) {
						__Internal__.inTrapException = true;
						ex = Object(ex);
						try {
							if (!(ex instanceof types.ScriptAbortedError)) {
								if (!ex.trapped) {
									if (types._instanceof(ex, exceptions.Application)) {
										doodad.options.hooks.popupExceptionHook(obj, ex, attr, caller);
									} else {
										doodad.options.hooks.catchExceptionHook(obj, ex, attr, caller);
									};
								};
							};
						} catch(o) {
							if (o instanceof types.ScriptAbortedError) {
								throw o;
							} else {
								try {
									tools.log(tools.LogLevels.Error, o.toString());
								} catch(p) {
								};
								if (root.DD_ASSERT) {
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
			
			types.isClass = root.DD_DOC(
				//! REPLACE_BY("null")
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
				//! REPLACE_BY("null")
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
					return !!obj && ((obj === doodad.Class) || types.baseof(doodad.Class, obj)) && !!((obj.$TYPE_MODIFIERS || 0) & doodad.ClassModifiers.Base);
				});
			
			types.isMixIn = root.DD_DOC(
				//! REPLACE_BY("null")
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
					return !!obj && ((obj === doodad.Class) || types.baseof(doodad.Class, obj)) && !!((obj.$TYPE_MODIFIERS || 0) & doodad.ClassModifiers.MixIn);
				});

			types.isInterface = root.DD_DOC(
				//! REPLACE_BY("null")
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
					return !!obj && ((obj === doodad.Class) || types.baseof(doodad.Class, obj)) && !!((obj.$TYPE_MODIFIERS || 0) & doodad.ClassModifiers.Interface);
				});

			types.isIsolated = root.DD_DOC(
				//! REPLACE_BY("null")
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
					return !!obj && ((obj === doodad.Class) || types.baseof(doodad.Class, obj)) && !!((obj.$TYPE_MODIFIERS || 0) & doodad.ClassModifiers.Isolated);
				});

			types.isNewable = root.DD_DOC(
				//! REPLACE_BY("null")
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
					return !!obj && ((obj === doodad.Class) || types.baseof(doodad.Class, obj)) && !((obj.$TYPE_MODIFIERS || 0) & (doodad.ClassModifiers.Base | doodad.ClassModifiers.Interface | doodad.ClassModifiers.MixIn));
				});
			
			types.isSealed = root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 0,
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
						obj = obj.constructor;
					};
					if (!obj) {
						return false;
					};
					if ((obj !== doodad.Class) && !types.baseof(doodad.Class, obj)) {
						return false;
					};
					return !!((obj.$TYPE_MODIFIERS || 0) & doodad.ClassModifiers.Sealed);
				});
			
			types.isSerializable = root.DD_DOC(
				//! REPLACE_BY("null")
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
				//! REPLACE_BY("null")
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
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 0,
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
					if (types.isNothing(obj)) {
						return null;
					};
					//obj = types.getType(obj);
					if (types.isObject(obj)) {
						obj = obj.constructor;
					};
					if (!obj) {
						return null;
					};
					if ((obj !== doodad.Class) && !types.baseof(doodad.Class, obj)) {
						return null;
					};
					return types.clone(types.invoke(obj, 'getAttribute', ['$IMPLEMENTS']));
				});
			
			types.isMethod = root.DD_DOC(
				//! REPLACE_BY("null")
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
									type: 'string',
									optional: false,
									description: "Method name.",
								},
							},
							returns: 'bool',
							description: "Returns 'true' if method exists. Returns 'false' otherwise.",
				}
				//! END_REPLACE()
				, function isMethod(obj, name) {
					if (!types.isLike(obj, doodad.Class)) {
						return false;
					};
					var method = obj[name];
					if (!types.isJsFunction(method)) {
						return false;
					};
					return (method.METHOD_NAME === name);
				});

			types.isImplemented = root.DD_DOC(
				//! REPLACE_BY("null")
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
									type: 'string',
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
					var isType = types.isType(obj),
						type = types.getType(obj);
					if (!type) {
						return false;
					};
					var attrs = types.invoke(type, 'getAttribute', ['$__ATTRIBUTES']);
					if (!types.hasKey(attrs, name)) {
						return false;
					};
					var attr = attrs[name],
						extender = attr.EXTENDER;
					if (!types.isLike(extender, extenders.Method)) {
						return false;
					};
					if ((isType && !extender.isType) || (!isType && !extender.isInstance)) {
						return false;
					}
					var method = obj[name];
					return !((method.METHOD_MODIFIERS || 0) & doodad.MethodModifiers.NotImplemented);
				});
			
			__Internal__.makeInside = function makeInside(fn) {
				root.DD_ASSERT && root.DD_ASSERT(types.isFunction(fn), "Invalid function.");
				var _dispatch = function dispatch(/*paramarray*/) {
					var oldInvokedClass = __Internal__.invokedClass;
					__Internal__.invokedClass = types.getType(this);
					try {
						return fn.apply(this, arguments);
					} catch(ex) {
						throw ex;
					} finally {
						__Internal__.invokedClass = oldInvokedClass;
					};
				};
				return _dispatch;
			};
			
			__Internal__.makeInsideForNew = function makeInsideForNew() {
				return (
					"var oldInvokedClass = constructorContext.invokedClass;" +
					"constructorContext.invokedClass = types.getType(this);" +
					"try {" +
						"return this._new.apply(this, arguments);" +
					"} catch(ex) {" +
						"throw ex;" +
					"} finally {" +
						"constructorContext.invokedClass = oldInvokedClass;" +
					"};"
				);
			};
			
			__Internal__.oldMakeInside = types.makeInside;
			types.makeInside = root.DD_DOC(
				//! REPLACE_BY("null")
				{
						author: "Claude Petit",
						revision: 0,
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
						},
						returns: 'function',
						description: "Makes a function like called from inside an object.",
				}
				//! END_REPLACE()
				, function(/*optional*/obj, fn) {
					root.DD_ASSERT && root.DD_ASSERT(types.isFunction(fn), "Invalid function.");
					if (types.isFunction(fn.__OUTSIDE_FUNCTION__)) {
						fn = fn.__OUTSIDE_FUNCTION__;
					};
					var newFn;
					if (obj instanceof doodad.Class) {
						newFn = types.bind(obj, __Internal__.makeInside(fn));
					} else {
						newFn = __Internal__.oldMakeInside(obj, fn);
					};
					if (types.hasDefinePropertyEnabled()) {
						types.defineProperty(newFn, '__OUTSIDE_FUNCTION__', {
							configurable: false,
							enumerable: false,
							value: fn,
							writable: false,
						});
					} else {
						newFn.__OUTSIDE_FUNCTION__ = fn;
					};
					return newFn;
				});
			
			types.options.hooks.invoke = function invoke(obj, fn, /*optional*/args) {
				var oldInvokedClass = __Internal__.invokedClass;
				__Internal__.invokedClass = types.getType(obj);
				try {
					if (types.isString(fn)) {
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
			};

			var __oldTypesIsClonable__ = types.isClonable;
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
					return types._implements(obj, mixIns.Clonable) || __oldTypesIsClonable__.call(this, obj, cloneFunctions);
				});

			var __oldTypesClone__ = types.clone;
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
					if (types._implements(obj, mixIns.Clonable)) {
						return obj.clone();
					} else {
						return __oldTypesClone__.call(this, obj, depth, cloneFunctions);
					};
				});
			
			var __oldTypesTypeOf__ = types._typeof;
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
					if ((obj instanceof doodad.TypeNamespace) && obj.DD_FULL_NAME) {
						return '{' + obj.DD_FULL_NAME + '}';
					} else {
						return __oldTypesTypeOf__(obj);
					};
				});
			
			//==================================
			// Attribute extenders
			//==================================

			doodad.ATTRIBUTE_BOX_PROPERTIES = {
				EXTENDER: null,
				SCOPE: null,
				METHOD_MODIFIERS: null,
				INTERFACE: null,
				RETURNS: null,
				PROTOTYPE: null,
				CALL_FIRST_LENGTH: null,
				POSITION: null,
				USAGE_MESSAGE: null,
				superEnabled: null,
			};
			doodad.ATTRIBUTE_BOX_PROPERTIES_KEYS = types.keys(doodad.ATTRIBUTE_BOX_PROPERTIES);
			
			doodad.AttributeBox = root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 0,
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
				, types.INIT(types.box.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'AttributeBox',
					},
					/*instanceProto*/
					types.extend({
						setAttributes: root.DD_DOC(
							//! REPLACE_BY("null")
							{
									author: "Claude Petit",
									revision: 0,
									params: {
										dest: {
											type: 'object',
											optional: false,
											description: "An object.",
										},
										override: {
											type: 'bool',
											optional: true,
											description: "'true' will override existing properties. 'false' will not. Default is 'false'.",
										},
									},
									returns: 'AttributeBox',
									description: "Copies attribute properties to another object.",
							}
							//! END_REPLACE()
							, function setAttributes(dest, /*optional*/override) {
								if (override) {
									types.fill(doodad.ATTRIBUTE_BOX_PROPERTIES_KEYS, dest, this);
								} else {
									var keys = doodad.ATTRIBUTE_BOX_PROPERTIES_KEYS,
										keysLen = keys.length;
									for (var i = 0; i < keysLen; i++) {
										var key = keys[i];
										if (types.isNothing(dest[key])) {
											dest[key] = this[key];
										};
									};
								};
							}),
					}, doodad.ATTRIBUTE_BOX_PROPERTIES),
					/*constructor*/
					function AttributeBox(value) {
						if (types._instanceof(this, doodad.AttributeBox)) {
							return (this._new(value) || this);
						} else if (types._instanceof(value, extenders.Extender)) {
							var newAttr = new doodad.AttributeBox();
							newAttr.EXTENDER = value;
							return newAttr;
						} else {
							return new doodad.AttributeBox(value);
						};
					}
				)));
			
			root.DD_DOC(
				//! REPLACE_BY("null")
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
				, extenders.REGISTER(types.SINGLETON(true, [], doodad.TypeNamespace.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: "Extender",
						
						$cache: null,
						
						$inherit: root.DD_DOC(
							//! REPLACE_BY("null")
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
									root.DD_ASSERT(types.isStringAndNotEmpty(proto.$TYPE_NAME), "Extender prototype has no name.");
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
								type.$cache = {};
								return new type();
							})),
					},
					/*instanceProto*/
					{
						notInherited: false,
						preExtend: false,
						isType: false,
						isInstance: false,
						isPersistent: false,
						isPreserved: false,

						_new: types.SUPER(function _new(/*optional*/options) {
								this._super();
								this.notInherited = types.get(options, 'notInherited', this.notInherited);
								this.preExtend = types.get(options, 'preExtend', this.preExtend);
								this.isType = types.get(options, 'isType', this.isType);
								this.isInstance = types.get(options, 'isInstance', this.isInstance);
								this.isPersistent = types.get(options, 'isPersistent', this.isPersistent);
								this.isPreserved = types.get(options, 'isPreserved', this.isPreserved);
							}),
						
						getCacheName: root.DD_DOC(
							//! REPLACE_BY("null")
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
							//! REPLACE_BY("null")
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
								if (types.hasKey(type.$cache, name)) {
									extender = type.$cache[name];
								} else {
									type.$cache[name] = extender = new type(options);
								};
								return extender;
							}),
						overrideOptions: root.DD_DOC(
							//! REPLACE_BY("null")
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
							//! REPLACE_BY("null")
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
						getValue: null, // function getValue(attr, proto, forType, isProto)
						extend: null,   // function extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto)
						setValue: null, // function setValue(attr, proto, typeStorage, instanceStorage, forType, destAttribute)
						init: null,     // function init(attr, obj, attributes, typeStorage, instanceStorage, forType, value)
						remove: root.DD_DOC(
							//! REPLACE_BY("null")
							{
									author: "Claude Petit",
									revision: 0,
									params: {
										attr: {
											type: 'string',
											optional: false,
											description: "Attribute name.",
										},
										obj: {
											type: 'object',
											optional: false,
											description: "Target object.",
										},
										storage: {
											type: 'object',
											optional: false,
											description: "Storage object.",
										},
										forType: {
											type: 'bool',
											optional: false,
											description: "When 'true', the target object is the type. When 'false', the target object is an instance.",
										},
									},
									returns: 'undefined',
									description: "Removes the specified attribute from the target object and/or the storage object.",
							}
							//! END_REPLACE()
							, function remove(attr, obj, storage, forType) {
								if (!types.isSealed(obj)) {
									if (!types.getOwnPropertyDescriptor(obj, attr)) {
										delete obj[attr];
									};
								};
							}),
						clone: null, // function clone(sourceAttr, destinationAttr, obj, attributes, storage, forType, value, /*optional*/options)
					}
				))));
			
			root.DD_DOC(
				//! REPLACE_BY("null")
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
					
					isReadOnly: false,
					isEnumerable: true,
					enableScopes: true,
					
					getterTemplate: root.DD_DOC(
						//! REPLACE_BY("null")
						{
								author: "Claude Petit",
								revision: 0,
								params: {
									attr: {
										type: 'string',
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
							return function getter() {
								if (root.DD_ASSERT || doodad.options.settings.enforceScopes) {
									if (extender.enableScopes) {
										var type = types.getType(this);
										if (!__Internal__.invokedClass || (type !== __Internal__.invokedClass)) {
											//var result = types.invoke(type, 'getAttributes', [['$CURRENT_DISPATCH', '$CURRENT_CALLER_INDEX']]);
											var result = types.invoke(type, function() {return {$CURRENT_DISPATCH: this.$CURRENT_DISPATCH, $CURRENT_CALLER_INDEX: this.$CURRENT_CALLER_INDEX}});
											var dispatch = result.$CURRENT_DISPATCH,
												caller = result.$CURRENT_CALLER_INDEX;
											if (boxed.SCOPE === doodad.Scopes.Private) {
												if (!dispatch || (dispatch.CALLERS[caller].PROTOTYPE !== boxed.PROTOTYPE)) {
													throw new exceptions.Error("Attribute '~0~' of '~1~' is private.", [attr, types.getTypeName(this)]);
												};
											} else if (boxed.SCOPE === doodad.Scopes.Protected) {
												if (!dispatch) {
													throw new exceptions.Error("Attribute '~0~' of '~1~' is protected.", [attr, types.getTypeName(this)]);
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
										cache.storage = types.invoke(this, function() {return (forType ? this.$__ATTRIBUTES_STORAGE : this.__ATTRIBUTES_STORAGE)});
									};
									return cache.storage[attr];
								};
							};
						}),
					setterTemplate: root.DD_DOC(
						//! REPLACE_BY("null")
						{
								author: "Claude Petit",
								revision: 0,
								params: {
									attr: {
										type: 'string',
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
							return function setter(value) {
								if (root.DD_ASSERT || doodad.options.settings.enforceScopes) {
									if (extender.enableScopes) {
										var type = types.getType(this);
										if (!__Internal__.invokedClass || (type !== __Internal__.invokedClass)) {
											//var result = types.invoke(type, 'getAttributes', [['$CURRENT_DISPATCH', '$CURRENT_CALLER_INDEX']]);
											var result = types.invoke(type, function() {return {$CURRENT_DISPATCH: this.$CURRENT_DISPATCH, $CURRENT_CALLER_INDEX: this.$CURRENT_CALLER_INDEX}});
											var dispatch = result.$CURRENT_DISPATCH,
												caller = result.$CURRENT_CALLER_INDEX;
											if (boxed.SCOPE === doodad.Scopes.Private) {
												if (!dispatch || (dispatch.CALLERS[caller].PROTOTYPE !== boxed.PROTOTYPE)) {
													throw new exceptions.Error("Attribute '~0~' of '~1~' is private.", [attr, types.getTypeName(this)]);
												};
											} else if (boxed.SCOPE === doodad.Scopes.Protected) {
												if (!dispatch) {
													throw new exceptions.Error("Attribute '~0~' of '~1~' is protected.", [attr, types.getTypeName(this)]);
												};
											};
										};
									};
								};
								if ((root.DD_ASSERT || doodad.options.settings.enforcePolicies) && extender.isReadOnly) {
									throw new exceptions.Error("Attribute '~0~' of '~1~' is read-only.", [attr, types.getTypeName(this)]);
								} else {
									if (storage) {
										storage[attr] = value;
									} else {
										if (cache.obj !== this) {
											cache.obj = this;
											cache.storage = types.invoke(this, function() {return (forType ? this.$__ATTRIBUTES_STORAGE : this.__ATTRIBUTES_STORAGE)});
										};
										cache.storage[attr] = value;
									};
								};
								return value;
							};
						}),
					
					_new: types.SUPER(function _new(/*optional*/options) {
							this._super(options);
							this.isReadOnly = types.get(options, 'isReadOnly', this.isReadOnly);
							this.isEnumerable = types.get(options, 'isEnumerable', this.isEnumerable);
							this.enableScopes = types.get(options, 'enableScopes', this.enableScopes);
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
						//! REPLACE_BY("null")
						{
								author: "Claude Petit",
								revision: 0,
								params: {
									attr: {
										type: 'string',
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
						, types.SUPER(function extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto) {
							if (root.DD_ASSERT || doodad.options.settings.enforcePolicies) {
								if (sourceIsProto) {
									if (!types.isNothing(types.unbox(destAttribute)) && (destAttribute.SCOPE === doodad.Scopes.Private)) {
										throw new exceptions.Error("Private attribute '~0~' of '~1~' can't be overridden.", [attr, types.unbox(destAttribute.PROTOTYPE.$TYPE_NAME)]);
									};
								};
							};					
							return sourceAttribute;
						})),
					__createProperty: function __createProperty(attr, proto, typeStorage, instanceStorage, forType, destAttribute) {
							if (
									(
										(
											(root.DD_ASSERT || doodad.options.settings.enforceScopes) 
											&& 
											(this.enableScopes && (destAttribute.SCOPE !== doodad.Scopes.Public))
										) 
										||
										(
											(root.DD_ASSERT || doodad.options.settings.enforcePolicies)
											&&
											(this.isReadOnly)
										)
									) 
									&&
									types.hasDefinePropertyEnabled()
							) {
								var storage = (forType ? typeStorage : instanceStorage);
								storage[attr] = types.unbox(destAttribute);
								
								if ((attr !== '$__ATTRIBUTES_STORAGE') && (attr !== '__ATTRIBUTES_STORAGE')) {
									storage = null;
								};
								
								var descriptor = {
									enumerable: this.isEnumerable,
									configurable: !this.isPersistent,
									get: this.getterTemplate(attr, destAttribute, forType, storage),
								};

								if (!this.isReadOnly) {
									descriptor.set = this.setterTemplate(attr, destAttribute, forType, storage);
								};

								types.defineProperty(proto, attr, descriptor);
								
							} else if (types.hasDefinePropertyEnabled()) {
								// <PRB> When a property is in base, it's impossible to set an own attribute with the same name to the new prototype without using "defineProperty"
								types.defineProperty(proto, attr, {
									configurable: true,
									enumerable: this.isEnumerable,
									value: types.unbox(destAttribute),
									writable: true,
								});
							} else {
								proto[attr] = types.unbox(destAttribute);
							};
						},
					setValue: root.DD_DOC(
						//! REPLACE_BY("null")
						{
								author: "Claude Petit",
								revision: 0,
								params: {
									attr: {
										type: 'string',
										optional: false,
										description: "Attribute name.",
									},
									proto: {
										type: 'object',
										optional: false,
										description: "Target prototype.",
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
									destAttribute: {
										type: 'AttributeBox',
										optional: false,
										description: "Current attribute.",
									},
								},
								returns: 'undefined',
								description: "Sets the final value of an attribute, either in the target prototype or in the appropriated attributes storage or both.",
						}
						//! END_REPLACE()
						, function setValue(attr, proto, typeStorage, instanceStorage, forType, destAttribute) {
							this.__createProperty(attr, proto, typeStorage, instanceStorage, forType, destAttribute);
						}),
					init: root.DD_DOC(
						//! REPLACE_BY("null")
						{
								author: "Claude Petit",
								revision: 0,
								params: {
									attr: {
										type: 'string',
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
						, function init(attr, obj, attributes, typeStorage, instanceStorage, forType, value) {
							if ((attr === '$__ATTRIBUTES_STORAGE') || (attr === '__ATTRIBUTES_STORAGE')) {
								value = (forType ? typeStorage : instanceStorage);
							};
							this.__createProperty(attr, obj, typeStorage, instanceStorage, forType, attributes[attr].setValue(value));
						}),
					remove: types.SUPER(function remove(attr, obj, storage, forType) {
							if (!this.isPersistent && !types.isSealed(obj)) {
								var descriptor = types.getOwnPropertyDescriptor(obj, attr);
								if (descriptor && descriptor.get) {
									delete obj[attr];
									delete storage[attr];
								};
							};
							this._super(attr, obj, storage, forType);
						}),
				})));

			root.DD_DOC(
				//! REPLACE_BY("null")
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
					
					extend: null,
					setValue: types.SUPER(function setValue(attr, proto, typeStorage, instanceStorage, forType, destAttribute) {
							this._super(attr, proto, typeStorage, instanceStorage, forType, destAttribute.setValue(null));
						}),
				})));
			
			root.DD_DOC(
				//! REPLACE_BY("null")
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
					
					maxDepth: 0,
					cloneOnInit: false,
					
					_new: types.SUPER(function _new(/*optional*/options) {
							this._super(options);
							this.maxDepth = types.get(options, 'maxDepth', this.maxDepth);
							this.cloneOnInit = types.get(options, 'cloneOnInit', this.cloneOnInit);
						}),
					getCacheName: types.SUPER(function getCacheName(/*optional*/options) {
							return this._super(options) + 
								',' + types.get(options, 'maxDepth', this.maxDepth) +
								',' + types.get(options, 'cloneOnInit', this.cloneOnInit);
						}),
					overrideOptions: types.SUPER(function overrideOptions(options, newOptions, /*optional*/replace) {
							options = this._super(options, newOptions, replace);
							if (replace) {
								types.fill(['maxDepth', 'cloneOnInit'], options, this, newOptions);
							} else {
								options.maxDepth = Math.max(newOptions.maxDepth | 0, this.maxDepth);
								options.cloneOnInit = !!newOptions.cloneOnInit || this.cloneOnInit;
							};
							return options;
						}),
					
					getValue: types.SUPER(function getValue(attr, proto, forType, isProto) {
							var boxed;
							if (isProto ? types.hasKey(proto, attr) : types.hasKeyInherited(proto, attr)) {
								boxed = doodad.AttributeBox(proto[attr]);
								var val = types.unbox(boxed);
								if (types.isClonable(val)) {
									val = types.clone(val, this.maxDepth);
									boxed = boxed.setValue(val);
								};
							};
							return boxed;
						}),
					clone: root.DD_DOC(
						//! REPLACE_BY("null")
						{
								author: "Claude Petit",
								revision: 0,
								params: {
									sourceAttr: {
										type: 'string',
										optional: false,
										description: "Source attribute name.",
									},
									destinationAttr: {
										type: 'string',
										optional: false,
										description: "Target attribute name.",
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
									value: {
										type: 'any',
										optional: false,
										description: "Current attribute value.",
									},
									options: {
										type: 'object',
										optional: true,
										description: "Destination attribute's extender options.",
									},
								},
								returns: 'undefined',
								description: "Clones an attribute.",
						}
						//! END_REPLACE()
						, function clone(sourceAttr, destinationAttr, obj, attributes, typeStorage, instanceStorage, forType, value, /*optional*/options) {
							value = types.clone(value, this.maxDepth);
							var cls = types.getType(obj);
							var sourceAttribute = attributes[sourceAttr];
							var destAttribute  = attributes[destinationAttr] = sourceAttribute.setValue(value);
							destAttribute.EXTENDER = this.get(options);
							var proto = (forType ? types.getPrototypeOf(cls) : cls.prototype);
							this.setValue && this.setValue(destinationAttr, proto, typeStorage, instanceStorage, forType, destAttribute);
							var storage = (forType ? typeStorage : instanceStorage);
							value = types.get(storage, destinationAttr, obj[destinationAttr]);
							this.init && this.init(destinationAttr, obj, attributes, storage, forType, value);
						}),
					init: types.SUPER(function init(attr, obj, attributes, typeStorage, instanceStorage, forType, value) {
							if (this.cloneOnInit) {
								value = types.clone(value, this.maxDepth);
							};
							
							this._super(attr, obj, attributes, typeStorage, instanceStorage, forType, value);
						}),
				})));

			root.DD_DOC(
				//! REPLACE_BY("null")
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
					
					extend: types.SUPER(function extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto) {
							sourceAttribute = this._super(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto);
							
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
				//! REPLACE_BY("null")
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
					
					extend: types.SUPER(function extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto) {
							sourceAttribute = this._super(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto);
							
							var dest = types.unbox(destAttribute);
							if (!dest) {
								dest = [];
							};
								
							var src = types.unbox(sourceAttribute);
							if (src) {
								Array.prototype.push.apply(dest, src);
							};
							
							sourceAttribute = sourceAttribute.setValue(dest);  // preserve attribute flags of "sourceAttribute"
							
							return sourceAttribute;
						}),
					setValue: types.SUPER(function setValue(attr, proto, typeStorage, instanceStorage, forType, destAttribute) {
							var value = types.unbox(destAttribute);
							
							if (!types.isNothing(value)) {
								value = tools.unique(value);
								destAttribute = destAttribute.setValue(value);  // preserve attribute flags of "destAttribute"
							};
							
							this._super(attr, proto, typeStorage, instanceStorage, forType, destAttribute);
						}),
				})));
			
			root.DD_DOC(
				//! REPLACE_BY("null")
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
					bindMethod: false,
					notReentrant: false,
					isReadOnly: true,
					byReference: true,
					isExternal: false,
					
					callerTemplate: root.DD_DOC(
						//! REPLACE_BY("null")
						{
								author: "Claude Petit",
								revision: 0,
								params: {
									attr: {
										type: 'string',
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
								if (doodad.Stack.isEnabled()) {
									doodad.Stack.push(types.unbox(_caller.PROTOTYPE.$TYPE_NAME), attr, arguments);
								};

								try {
									var type = types.getType(this);
									
									var oldSuper = types.invoke(this, 'getAttribute', ['_super']);
									
									var result = types.invoke(type, 'getAttributes', [['$CURRENT_DISPATCH', '$CURRENT_CALLER_INDEX']]),
										currentDispatch = result.$CURRENT_DISPATCH,
										currentCaller = result.$CURRENT_CALLER_INDEX + 1,
										callers = currentDispatch.CALLERS;
										
									types.invoke(type, 'setAttribute', ['$CURRENT_CALLER_INDEX', currentCaller]);
									
									var _super;
									if (currentCaller < callers.length) {
										_super = callers[currentCaller];
										_super.CALLED = false;
									} else {
										_super = function() {};
										_super.CALLED = true;
									};
									
									types.invoke(this, 'setAttribute', ['_super', _super]);
									
									var oldSuperCalled = _super.CALLED;
									
									fn = (extender.byReference ? fn : types.unbox(_caller.PROTOTYPE[attr]));
									var retVal = fn.apply(this, arguments);

									_caller.CALLED = true;
									
									if (root.DD_ASSERT || doodad.options.settings.enforcePolicies) {
										if ((_caller.METHOD_MODIFIERS & doodad.MethodModifiers.Override) && !_super.CALLED) {
											throw new exceptions.Error("You must always call '_super' for method '~0~' of '~1~'. Use 'doodad.REPLACE' when '_super' is never called. Or call 'overrideSuper' instead of '_super' when '_super' is conditionally called.", [attr, types.getTypeName(this)]);
										};
									};

									return retVal;
									
								} catch(ex) {
									// <PRB> Javascript engine calls "toString" internally. When an exception occurs inside "toString", it calls it again and again !
									if (attr === 'toString') {
										try {
											return ex.toString();
										} catch(o) {
											return '';
										};
									};
									
									throw doodad.trapException(this, attr, ex, _caller);
									
								} finally {
									doodad.Stack.pop();
									_super.CALLED = oldSuperCalled;
									types.invoke(this, 'setAttribute', ['_super', oldSuper]);
									types.invoke(type, 'setAttribute', ['$CURRENT_CALLER_INDEX', currentCaller - 1]);
								};
							};
							return _caller;
						}),
					dispatchTemplate: root.DD_DOC(
						//! REPLACE_BY("null")
						{
								author: "Claude Petit",
								revision: 0,
								params: {
									attr: {
										type: 'string',
										optional: false,
										description: "Attribute name.",
									},
									boxedCallers: {
										type: 'aAttributeBox',
										optional: false,
										description: "Array of callers.",
									},
								},
								returns: 'function',
								description: "Template function to create a dispatch.",
						}
						//! END_REPLACE()
						, function(attr, boxedCallers) {
							var extender = this;
							var _dispatch = function dispatch(/*paramarray*/) {
								var type = types.getType(this),
									result = types.invoke(type, 'getAttributes', [['$CURRENT_DISPATCH', '$CURRENT_CALLER_INDEX']]), 
									oldDispatch = result.$CURRENT_DISPATCH, 
									oldCaller = result.$CURRENT_CALLER_INDEX,
									oldInvokedClass = __Internal__.invokedClass;
								
								// External methods (can't be called internally)
								if (root.DD_ASSERT || doodad.options.settings.enforcePolicies) {
									if (extender.isExternal && (type === oldInvokedClass)) {
										throw new exceptions.Error("Method '~0~' of '~1~' is external-only.", [_dispatch.METHOD_NAME, types.getTypeName(type)]);
									};
								};
								
								// Public methods
								if (root.DD_ASSERT || doodad.options.settings.enforceScopes) {
									if (!oldInvokedClass || (type !== oldInvokedClass)) {
										if ((boxedCallers.SCOPE !== doodad.Scopes.Public) && !oldDispatch) {
											throw new exceptions.Error("Method '~0~' of '~1~' is not public.", [_dispatch.METHOD_NAME, types.getTypeName(type)]);
										};
									};
								};
								
								// <PRB> Javascript engine calls "toString" internally. When an exception occurs inside "toString", it calls it again and again !
								if ((extender.notReentrant || (attr === 'toString')) && oldDispatch && (_dispatch === oldDispatch)) {
									if (attr === 'toString') {
										return "Error: 'toString' is not reentrant.";
									} else {
										throw new exceptions.Error("'~0~' is not reentrant.", [attr]);
									};
								};
								
								var modifiers = _dispatch.METHOD_MODIFIERS;

								// Not implemented methods
								if (modifiers & doodad.MethodModifiers.NotImplemented) {
									throw new exceptions.Error("Method '~0~' of '~1~' is not implemented.", [_dispatch.METHOD_NAME, types.getTypeName(type)]);
								};
								
								// Obsolete methods
								if (modifiers & doodad.MethodModifiers.Obsolete) {
									tools.log(tools.LogLevels.Warning, "Method '~0~' of '~1~' is obsolete.~2~", [_dispatch.METHOD_NAME, types.getTypeName(type), (boxedCallers.USAGE_MESSAGE ? ' ' + boxedCallers.USAGE_MESSAGE : '')]);
									_dispatch.METHOD_MODIFIERS = (modifiers ^ doodad.MethodModifiers.Obsolete);
								};

								if (root.DD_ASSERT || doodad.options.settings.enforcePolicies) {
									// Must override methods
									if (modifiers & doodad.MethodModifiers.MustOverride) {
										throw new exceptions.Error("You must override the method '~0~' in '~1~'.", [_dispatch.METHOD_NAME, types.getTypeName(type)]);
									};
									
									// Destroyed objects
									if (this._implements(mixIns.Creatable) && types.invoke(this, 'getAttribute', ['__destroyed']) && !(modifiers & doodad.MethodModifiers.CanBeDestroyed)) {
										throw new exceptions.Error("Method '~0~' of '~1~' is unavailable because object has been destroyed.", [_dispatch.METHOD_NAME, types.getTypeName(type)]);
									};
								};

								var caller = _dispatch.CALLERS[0];
								if (!caller) {
									// No caller
									return;
								};
								
								var oldCallerCalled = caller.CALLED;

								// Private methods
								if (root.DD_ASSERT || doodad.options.settings.enforceScopes) {
									if (!oldInvokedClass || (type !== oldInvokedClass)) {
										if ((boxedCallers.SCOPE === doodad.Scopes.Private) && oldDispatch && (oldDispatch.CALLERS[oldCaller - 1].PROTOTYPE !== caller.PROTOTYPE)) {
											throw new exceptions.Error("Method '~0~' of '~1~' is private.", [_dispatch.METHOD_NAME, types.unbox(caller.PROTOTYPE.$TYPE_NAME)]);
										};
									};
								};
								
								types.invoke(type, 'setAttributes', [{$CURRENT_DISPATCH: _dispatch, $CURRENT_CALLER_INDEX: 0}]);
								
								var oldHostDispatch,
									oldHostCaller,
									hostType;
								if (types.baseof(doodad.Interface, type)) {
									hostType = types.getType(this.__host);
									var result = types.invoke(hostType, 'getAttributes', [['$CURRENT_DISPATCH', '$CURRENT_CALLER_INDEX']]),
										oldHostDispatch = result.$CURRENT_DISPATCH,
										oldHostCaller = result.$CURRENT_CALLER_INDEX;
									types.invoke(hostType, 'setAttributes', [{$CURRENT_DISPATCH: _dispatch, $CURRENT_CALLER_INDEX: 0}]);
								};
								
								__Internal__.invokedClass = type;
								
								try {
									
									
									caller.CALLED = false;
									
									var retVal = caller.apply(this, arguments);
									
									if (root.DD_ASSERT || doodad.options.settings.enforcePolicies) {
										var validator = boxedCallers.RETURNS;
										// <PRB> Javascript engine calls "toString" internally. When an exception occurs inside "toString", it calls it again and again !
										if (validator && !validator.call(this, retVal)) {
											if (attr === 'toString') {
												return tools.format("Invalid returned value from method '~0~'.", [attr]);
											} else {
												throw new doodad.Error("Invalid returned value from method '~0~'.", [attr]);
											};
										};
									};
									
									return retVal;
									
								} catch(ex) {
									// <PRB> Javascript engine calls "toString" internally. When an exception occurs inside "toString", it calls it again and again !
									if (attr === 'toString') {
										try {
											return "Error: " + ex.toString();
										} catch(o) {
											return "Internal error";
										};
									};
									throw ex;
								} finally {
									__Internal__.invokedClass = oldInvokedClass;
									caller.CALLED = oldCallerCalled;
									types.invoke(type, 'setAttributes', [{$CURRENT_DISPATCH: oldDispatch, $CURRENT_CALLER_INDEX: oldCaller}]);
									if (hostType) {
										types.invoke(hostType, 'setAttributes', [{$CURRENT_DISPATCH: oldHostDispatch, $CURRENT_CALLER_INDEX: oldHostCaller}]);
									};
								};
							};
							return _dispatch;
						}),
					createCaller: root.DD_DOC(
						//! REPLACE_BY("null")
						{
								author: "Claude Petit",
								revision: 0,
								params: {
									attr: {
										type: 'string',
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
								root.DD_ASSERT(types.isStringAndNotEmpty(attr), "Invalid attribute name.");
								root.DD_ASSERT(types.isJsFunction(fn), "Invalid function.");
							};

							var caller = this.callerTemplate(attr, sourceAttribute, destAttribute);
							caller.PROTOTYPE = sourceAttribute.PROTOTYPE;
							caller.METHOD_MODIFIERS = (sourceAttribute.METHOD_MODIFIERS || 0);
							caller.CALLED = false;
							caller.POSITION = sourceAttribute.POSITION;
							caller.USAGE_MESSAGE = sourceAttribute.USAGE_MESSAGE;
							
							return caller;
						}),
					createDispatch: root.DD_DOC(
						//! REPLACE_BY("null")
						{
								author: "Claude Petit",
								revision: 0,
								params: {
									attr: {
										type: 'string',
										optional: false,
										description: "Attribute name.",
									},
									boxedCallers: {
										type: 'AttributeBox',
										optional: false,
										description: "Array of callers.",
									},
								},
								returns: 'function',
								description: "Creates a dispatch from the template.",
						}
						//! END_REPLACE()
						, function createDispatch(attr, boxedCallers) {
							var callers = types.unbox(boxedCallers);
							
							if (root.DD_ASSERT) {
								root.DD_ASSERT(types.isStringAndNotEmpty(attr), "Invalid attribute name.");
								root.DD_ASSERT(types.isArray(callers), "Invalid callers array.");
							};
							
							// Remove duplicated callers and update "call first" length
							boxedCallers.CALL_FIRST_LENGTH = callers.length;
							var caller,
								proto,
								i = 0,
								j;
							while (i < callers.length) {
								caller = callers[i];
								if (!(caller.METHOD_MODIFIERS & doodad.MethodModifiers.CallFirst)) {
									boxedCallers.CALL_FIRST_LENGTH = i;
									break;
								};
								proto = caller.PROTOTYPE;
								j = i + 1;
								while (j < callers.length) {
									if (callers[j].PROTOTYPE === proto) {
										callers.splice(j, 1);
									} else {
										j++;
									};
								};
								i++;
							};
							i = callers.length - 1;
							while (i >= boxedCallers.CALL_FIRST_LENGTH) {
								proto = callers[i].PROTOTYPE;
								j = i - 1;
								while (j >= boxedCallers.CALL_FIRST_LENGTH) {
									if (callers[j].PROTOTYPE === proto) {
										callers.splice(j, 1);
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
									position = callerI.POSITION,
									found = false;
								if (position && !position.ok) {
									var proto = types.invoke(position.cls, 'getAttribute', ['$PROTOTYPE']);
									for (var j = 0; j < callers.length; j++) {
										var callerJ = callers[j];
										if ((i !== j) && callerJ.PROTOTYPE === proto) {
											var pos = j;
											if (position.position > 0) {
												pos++;
											};
											var toRemove = 0;
											if (position.position === 0) {
												toRemove = 1;
											};
											callers.splice(i, 1);
											if (i < boxedCallers.CALL_FIRST_LENGTH) {
												boxedCallers.CALL_FIRST_LENGTH--;
											};
											if (pos > i) {
												pos--;
											};
											callers.splice(pos, toRemove, callerI);
											if (pos < boxedCallers.CALL_FIRST_LENGTH) {
												boxedCallers.CALL_FIRST_LENGTH++;
											};
											position.ok = true;
											found = true;
											break;
										};
									};
									//if (!found && !sourceIsProto) {
									//	throw new exceptions.Error("Position for method '~0~' of '~1~' not found.", [attr, destAttributes.$TYPE_NAME.valueOf()]);
									//};
								};
								if (!found) {
									i++;
								};
							};
							for (var i = 0; i < callers.length; i++) {
								var callerI = callers[i],
									position = callerI.POSITION;
								if (position) {
									delete position.ok;
								};
							};

							// Create dispatch function
							var dispatch = this.dispatchTemplate(attr, boxedCallers);
							dispatch.METHOD_NAME = attr;
							dispatch.METHOD_MODIFIERS = boxedCallers.METHOD_MODIFIERS;
							dispatch.CALLERS = callers;

							return dispatch;
						}),
					
					_new: types.SUPER(function _new(/*optional*/options) {
							this._super(options);
							this.bindMethod = types.get(options, 'bindMethod', this.bindMethod);
							this.notReentrant = types.get(options, 'notReentrant', this.notReentrant);
							this.byReference = types.get(options, 'byReference', this.byReference);
							this.isExternal = types.get(options, 'isExternal', this.isExternal);
							return this;
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
					
					extend: types.SUPER(function extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto) {
							sourceAttribute = this._super(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto);
							
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
							
							var modifiers = ((destAttribute.METHOD_MODIFIERS || 0) & doodad.preservedMethodModifiers) | (sourceAttribute.METHOD_MODIFIERS || 0);
								
							if (hasDestCallers && !srcIsInterface && (!sourceIsProto || (modifiers & (doodad.MethodModifiers.Override | doodad.MethodModifiers.Replace)))) {
								// Override or replace
								var start = destAttribute.CALL_FIRST_LENGTH;
								if (callersOrFn) {
									if (sourceIsProto) {
										if (root.DD_ASSERT || doodad.options.settings.enforcePolicies) {
											if (destAttribute.SCOPE === doodad.Scopes.Private) {
												throw new exceptions.Error("Private method '~0~' of '~1~' can't be overridden or replaced.", [attr, destAttributes.$TYPE_NAME.valueOf()]);
											};
										};
										callersOrFn = [this.createCaller(attr, sourceAttribute, destAttribute)];
									};
									var toRemove = 0;
									if ((start > 0) && ((callersOrFn[0].METHOD_MODIFIERS || 0) & doodad.MethodModifiers.Replace)) {
										// Replace "call firsts"
										toRemove = start;
										start = 0;
									};
									if ((callersOrFn.length) && ((callersOrFn[callersOrFn.length - 1].METHOD_MODIFIERS || 0) & doodad.MethodModifiers.Replace)) {
										// Replace non "call firsts"
										toRemove = destCallers.length - start;
									};
									Array.prototype.splice.apply(destCallers, types.append([start, toRemove], callersOrFn));
								};
								destAttribute.CALL_FIRST_LENGTH = start + (sourceAttribute ? sourceAttribute.CALL_FIRST_LENGTH : 0);
							} else {
								// Create
								if (sourceIsProto) {
									if (root.DD_ASSERT || doodad.options.settings.enforcePolicies) {
										if (modifiers & (doodad.MethodModifiers.Override | doodad.MethodModifiers.Replace)) {
											if (!hasDestCallers && !(modifiers & doodad.MethodModifiers.ForceCreate)) {
												throw new exceptions.Error("Method '~0~' of '~1~' can't be overridden or replaced because the method doesn't exist.", [attr, destAttributes.$TYPE_NAME.valueOf()]);
											};
										} else {
											if (hasDestCallers) {
												throw new exceptions.Error("Method '~0~' of '~1~' can't be created because the method already exists.", [attr, destAttributes.$TYPE_NAME.valueOf()]);
											};
										};
									};
								} else if (srcIsInterface) {
									if (callersOrFn && (sourceAttribute.PROTOTYPE === sourceProto)) {
										if (root.DD_ASSERT || doodad.options.settings.enforcePolicies) {
											if (hasDestCallers) {
												throw new exceptions.Error("Method '~0~' of '~1~' can't be created because the method already exists.", [attr, destAttributes.$TYPE_NAME.valueOf()]);
											};
											if (callersOrFn.length) {
												throw new exceptions.Error("Interface '~0~' must not have a body for method '~1~', or create a mix-in instead.", [types.getTypeName(source), attr]);
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
										Array.prototype.push.apply(destCallers, callersOrFn);
									};
									destAttribute.CALL_FIRST_LENGTH = ((modifiers & doodad.MethodModifiers.CallFirst) ? 1 : 0);
								};
							};

							if (!srcIsInterface) {
								destAttribute.METHOD_MODIFIERS = modifiers;
								destAttribute.RETURNS = (sourceAttribute.RETURNS || destAttribute.RETURNS);
								destAttribute.USAGE_MESSAGE = (sourceAttribute.USAGE_MESSAGE || destAttribute.USAGE_MESSAGE);
							};
							
							return destAttribute;
						}),
					setValue: types.SUPER(function setValue(attr, proto, typeStorage, instanceStorage, forType, destAttribute) {
							if (root.DD_ASSERT || doodad.options.settings.enforcePolicies) {
								if (!typeStorage.$MUST_OVERRIDE && (destAttribute.METHOD_MODIFIERS & doodad.MethodModifiers.MustOverride)) {
									typeStorage.$MUST_OVERRIDE = attr;
								};
							};

							var dispatch = this.createDispatch(attr, destAttribute);

							destAttribute = destAttribute.setValue(dispatch);
							
							this._super(attr, proto, typeStorage, instanceStorage, forType, destAttribute);
						}),
					init: types.SUPER(function init(attr, obj, attributes, typeStorage, instanceStorage, forType, value) {
							if (this.bindMethod && value) {
								value = types.bind(obj, value);
							};

							this._super(attr, obj, attributes, typeStorage, instanceStorage, forType, value);
						}),
					remove: null,
				})));

			root.DD_DOC(
				//! REPLACE_BY("null")
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
						description: "Attribute extender which extends a JS method.",
				}
				//! END_REPLACE()
				, extenders.REGISTER(extenders.Method.$inherit({
					$TYPE_NAME: "JsMethod",
					
					callerTemplate: function callerTemplate(attr, sourceAttribute, destAttribute) {
							var fn = types.unbox(sourceAttribute);
							if (root.DD_ASSERT) {
								root.DD_ASSERT(types.isJsFunction(fn), "Invalid function.");
							};
							//return [/*0*/ sourceAttribute];
							return {};
						},
					jsCallerTemplate: root.DD_DOC(
						//! REPLACE_BY("null")
						{
								author: "Claude Petit",
								revision: 0,
								params: {
									attr: {
										type: 'string',
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
							if (_super) {
								_caller = function caller(/*paramarray*/) {
									var oldSuper = types.invoke(this, 'getAttribute', ['_super']);
									types.invoke(this, 'setAttribute', ['_super', _super]);
									try {
										var target = (fn || types.unbox(_caller.PROTOTYPE[attr]));
										return target.apply(this, arguments);
									} catch(ex) {
										throw ex;
									} finally {
										types.invoke(this, 'setAttribute', ['_super', oldSuper]);
									};
								};
							} else {
								_caller = (fn || function caller(/*paramarray*/) {
									var target = types.unbox(_caller.PROTOTYPE[attr]);
									return target.apply(this, arguments);
								});
							};
							return _caller;
						}),
					dispatchTemplate: function (attr, boxedCallers) {
							var callers = types.unbox(boxedCallers),
								callersLen = callers.length,
								_super = null;
							for (var i = callersLen - 1; i >= 0; i--) {
								var caller = callers[i];
								_super = this.jsCallerTemplate(attr, caller.FUNCTION, _super);
								_super.PROTOTYPE = caller.PROTOTYPE;
							};
							return __Internal__.makeInside(_super);
						},
					
					extend: function extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto) {
							sourceAttribute = extenders.ClonedAttribute.extend.call(this, attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto);
							
							var destCallers = types.unbox(destAttribute);
							
							if (!types.isArray(destCallers)) {
								if (sourceAttribute.superEnabled && types.isFunction(destCallers)) {
									destCallers = [this.createCaller(attr, destAttribute, null)];
								} else {
									destCallers = [];
								};
								destAttribute = sourceAttribute.setValue(destCallers);  // copy attribute flags of "sourceAttribute"
							};

							var callersOrFn = types.unbox(sourceAttribute);
							
							if (!sourceAttribute.superEnabled) {
								destCallers.lengh = 0;
							};
							
							if (sourceIsProto) {
								if (root.DD_ASSERT || doodad.options.settings.enforcePolicies) {
									if (destAttribute.SCOPE === doodad.Scopes.Private) {
										throw new exceptions.Error("Private method '~0~' of '~1~' can't be overridden or replaced.", [attr, destAttributes.$TYPE_NAME.valueOf()]);
									};
								};
								callersOrFn = [this.createCaller(attr, sourceAttribute, destAttribute)];
							};
							
							Array.prototype.unshift.apply(destCallers, callersOrFn);
							
							return destAttribute;
						},
				})));
			
			root.DD_DOC(
				//! REPLACE_BY("null")
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
					
					isReadOnly: false,
					bindMethod: true,
					
					extend: types.SUPER(function extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto) {
							sourceAttribute = extenders.Attribute.extend.call(this, attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto);

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

								if (types.hasKey(destDesc, 'value')) {
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
								
								if (srcGet) {
									srcDesc.get = this._super(attr, source, sourceProto, destAttributes, forType, doodad.AttributeBox(srcGet), doodad.AttributeBox(destGet), sourceIsProto);
								};
								
								if (srcSet) {
									srcDesc.set = this._super(attr, source, sourceProto, destAttributes, forType, doodad.AttributeBox(srcSet), doodad.AttributeBox(destSet), sourceIsProto);
								};
							};
							
							return sourceAttribute.setValue(srcDesc);  // copy attribute flags of "sourceAttribute"
						}),
					setValue: function setValue(attr, proto, typeStorage, instanceStorage, forType, destAttribute) {
							proto[attr] = destAttribute;
						},
					init: function init(attr, obj, attributes, typeStorage, instanceStorage, forType, descriptor) {
							if (descriptor) {
								var attribute = attributes[attr];
								
								descriptor = types.extend({}, descriptor);
								
								var value = descriptor.get;
								if (value) {
									value = this.createDispatch(attr, attribute.setValue(value));  // copy attribute flags of "boxed"
									if (this.bindMethod) {
										value = types.bind(obj, value);
									};
									descriptor.get = value;
								};
								
								value = descriptor.set;
								if (value) {
									value = this.createDispatch(attr, attribute.setValue(value));  // copy attribute flags of "boxed"
									if (this.bindMethod) {
										value = types.bind(obj, value);
									};
									descriptor.set = value;
								};
								
								descriptor.configurable = !this.isPersistent;
								descriptor.enumerable = this.isEnumerable;
								
								if (types.isNothing(descriptor.get) && types.isNothing(descriptor.set)) {
									descriptor.writable = !this.isReadOnly;
								};
								
								types.defineProperty(obj, attr, descriptor);
							};
						},
					remove: types.SUPER(function remove(attr, obj, storage, forType) {
						if (!this.isPersistent && !types.isSealed(obj)) {
							var descriptor = types.getOwnPropertyDescriptor(obj, attr);
							if (descriptor) {
								delete obj[attr];
							};
						};
						this._super(attr, obj, storage, forType);
					}),
				})));
			
			root.DD_DOC(
				//! REPLACE_BY("null")
				{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'EventHandler',
						description: "Event handler prototype.",
				}
				//! END_REPLACE()
				, doodad.REGISTER(doodad.TypeNamespace.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'EventHandler',
						
						obj: null,
						extender: null,
						stack: null,
						sorted: true,
						
						attach: root.DD_DOC(
							//! REPLACE_BY("null")
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
										count: {
											type: 'integer',
											optional: true,
											description: "Number of times the callback function will be called before been detached. Default is infinite.",
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
								
								datas = datas || [];

								var indexes = [];
								if (this.stack) {
									indexes = tools.findItems(this.stack, function(item) {
										var evData = item[3];
										return (item[0] === obj) && (item[1] === fn) && tools.every(datas, function(data, key) {
											return types.hasIndex(evData, key) && (evData[key] === data);
										});
									});
								} else {
									this.stack = [];
								};
								
								var indexesLen = indexes.length;
								if (indexesLen) {
									for (var i = 0; i < indexesLen; i++) {
										var ev = this.stack[indexes[i]];
										if (ev[2] !== priority) {
											ev[2] = priority;
											this.sorted = false;
										};
									};
									return false;
								} else {
									this.stack.push([obj, fn, priority, datas, count]);
									this.sorted = false;
									return true;
								};
							}),
						detach: root.DD_DOC(
							//! REPLACE_BY("null")
							{
									author: "Claude Petit",
									revision: 0,
									params: {
										obj: {
											type: 'object',
											optional: true,
											description: "Object linked with the callback function.",
										},
										fn: {
											type: 'function',
											optional: false,
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
									root.DD_ASSERT(types.isFunction(fn), "Invalid function.");
									root.DD_ASSERT(types.isNothing(datas) || types.isArray(datas), "Invalid datas.");
								};

								datas = datas || [];

								var evs = [];
								if (this.stack) {
									evs = types.popItems(this.stack, function(ev) {
										var evData = ev[3];
										return (ev[0] === obj) && (ev[1] === fn) && tools.every(datas, function(value, key) {
											return types.hasIndex(evData, key) && (evData[key] === value);
										});
									});
									if (!this.stack.length) {
										this.stack = null;
									};
								};

								return evs;
							}),
						clear: root.DD_DOC(
							//! REPLACE_BY("null")
							{
									author: "Claude Petit",
									revision: 0,
									params: null,
									returns: 'undefined',
									description: "Detach every callback function from an event.",
							}
							//! END_REPLACE()
							, function clear() {
								this.stack = null;
							}),
						attachOnce: root.DD_DOC(
							//! REPLACE_BY("null")
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
							//! REPLACE_BY("null")
							{
									author: "Claude Petit",
									revision: 0,
									params: null,
									returns: 'Promise',
									description: "Creates a promise for an event.",
							}
							//! END_REPLACE()
							, function promise() {
								// NOTE: Don't forget that a promise resolves only once, so ".promise" is like ".attachOnce".
								var canReject = this.extender.canReject;
								var self = this;
								var Promise = tools.getPromise();
								return new Promise(function(resolve, reject) {
									self.attachOnce(null, function(ev) {
										if (canReject && (ev instanceof doodad.ErrorEvent)) {
											return reject.call(self.obj, ev);
										} else {
											return resolve.call(self.obj, ev);
										};
									});
								});
							}),
					}
				)));
			
			root.DD_DOC(
				//! REPLACE_BY("null")
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

					eventsAttr: '__EVENTS',
					eventsImplementation: 'Doodad.MixIns.Events',
					
					enableScopes: false,
					canReject: true,
					
					eventProto: doodad.EventHandler,
					
					_new: types.SUPER(function _new(/*optional*/options) {
							this._super(options);
							this.canReject = types.get(options, 'canReject', this.canReject);
						}),
					getCacheName: types.SUPER(function getCacheName(/*optional*/options) {
							return this._super(options) + 
								',' + types.get(options, 'canReject', this.canReject);
						}),
					overrideOptions: types.SUPER(function overrideOptions(options, newOptions, /*optional*/replace) {
							options = this._super(options, newOptions, replace);
							if (replace) {
								types.fill(['canReject'], options, this, newOptions);
							} else {
								options.canReject = !!newOptions.canReject || this.canReject;
							};
							return options;
						}),

					extend: types.SUPER(function extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto) {
							if (root.DD_ASSERT) {
								if (!types.hasKey(destAttributes, this.eventsAttr) && !types.hasKey(types.unbox(destAttributes.$IMPLEMENTS), this.eventsImplementation)) {
									throw new exceptions.Error("You must implement '~0~'.", [this.eventsImplementation]);
								};
							};
							
							var events = destAttributes[this.eventsAttr];
							events = types.unbox(events);
							events.push(attr);
							
							return this._super(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto);
						}),
					createEventDispatch: root.DD_DOC(
						//! REPLACE_BY("null")
						{
								author: "Claude Petit",
								revision: 0,
								params: {
									attr: {
										type: 'string',
										optional: false,
										description: "Attribute name.",
									},
									obj: {
										type: 'object',
										optional: false,
										description: "Target object.",
									},
									attributes: {
										type: 'objectof(AttributeBox)',
										optional: false,
										description: "Attributes to create at destination.",
									},
								},
								returns: 'function',
								description: "Creates a dispatch for the event.",
						}
						//! END_REPLACE()
						, function createEventDispatch(attr, obj, attributes) {
							var dispatch = this.createDispatch(attr, attributes[attr]);
							dispatch = types.setPrototypeOf(dispatch, this.eventProto);
							dispatch.obj = obj;
							dispatch.extender = this;
							return dispatch;
						}),
					init: types.SUPER(function init(attr, obj, attributes, typeStorage, instanceStorage, forType, value) {
							value = this.createEventDispatch(attr, obj, attributes);
							this._super(attr, obj, attributes, typeStorage, instanceStorage, forType, value);
						}),
					remove: types.SUPER(function remove(attr, obj, storage, forType) {
							var handler = obj[attr];
							if (types.baseof(doodad.EventHandler, handler)) {
								handler.clear();
							};
//							extenders.Attribute.remove.call(this, attr, obj, storage, forType);
						}),
				})));

			doodad.ATTRIBUTE = root.DD_DOC(
				//! REPLACE_BY("null")
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
					value = doodad.AttributeBox(value);

					if (!extender) {
						extender = value.EXTENDER;
					};

					if (!extender) {
						extender = extenders.ClonedAttribute;
					};

					if (root.DD_ASSERT) {
						root.DD_ASSERT(types._instanceof(extender, extenders.Extender), "Invalid extender.");
					};
					
					if (options) {
						root.DD_ASSERT && root.DD_ASSERT(types.isJsObject(options), "Invalid options.");
						extender = extender.get(options);
					};
					
					value.EXTENDER = extender;
					return value;
				});

			doodad.OPTIONS = root.DD_DOC(
				//! REPLACE_BY("null")
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
						valueIsExtender = types._instanceof(value, extenders.Extender);
					
					if (valueIsExtender) {
						extender = value;
						value = undefined;
					} else {
						value = doodad.AttributeBox(value);
						extender = value.EXTENDER;
					};
					
					if (!extender) {
						if (types.isJsFunction(types.unbox(value))) {
							extender = extenders.Method;
						} else {
							extender = extenders.ClonedAttribute;
						};
					};
					
					root.DD_ASSERT && root.DD_ASSERT(types._instanceof(extender, extenders.Extender), "Invalid extender.");
					
					options = extender.overrideOptions({}, options, true);
					extender = extender.get(options);
					
					if (valueIsExtender) {
						return extender;
					} else {
						value.EXTENDER = extender;
						return value;
					};
				});
			
			doodad.NOT_INHERITED = root.DD_DOC(
				//! REPLACE_BY("null")
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
				//! REPLACE_BY("null")
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
				//! REPLACE_BY("null")
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
				//! REPLACE_BY("null")
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
				//! REPLACE_BY("null")
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
				//! REPLACE_BY("null")
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
				//! REPLACE_BY("null")
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
				//! REPLACE_BY("null")
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
				//! REPLACE_BY("null")
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

			doodad.METHOD = root.DD_DOC(
				//! REPLACE_BY("null")
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
						root.DD_ASSERT(types.isNothing(val) || types.isJsFunction(val), "Invalid function.");
					};
					return doodad.ATTRIBUTE(fn, extenders.Method);
				});

			doodad.JS_METHOD = root.DD_DOC(
				//! REPLACE_BY("null")
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
					root.DD_ASSERT && root.DD_ASSERT(types.isJsFunction(fn), "Invalid function.");
					
					return doodad.ATTRIBUTE(fn, extenders.JsMethod);
				});
			
			doodad.SUPER = root.DD_DOC(
				//! REPLACE_BY("null")
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
					root.DD_ASSERT && root.DD_ASSERT(types.isJsFunction(fn), "Invalid function.");
					
					fn = doodad.ATTRIBUTE(fn, extenders.JsMethod);
					fn.superEnabled = true;
					return fn;
				});

			doodad.PROPERTY = root.DD_DOC(
				//! REPLACE_BY("null")
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
			
			__Internal__.EVENT = function EVENT(/*optional*/cancellable, /*optional*/preRaise) {
				cancellable = (types.isNothing(cancellable) ? true : cancellable);
				return doodad.PROTECTED(function handleEvent(/*optional*/ev) {
					root.DD_ASSERT && root.DD_ASSERT(types.isNothing(ev) || (ev instanceof doodad.Event), "Invalid event object.");
					
					var cancelled = false,
						type = types.getType(this),
						dispatch = types.invoke(type, 'getAttribute', ['$CURRENT_DISPATCH']),
						stack = dispatch.stack;
					
					if (preRaise) {
						cancelled = (preRaise.call(this, ev) === false) && cancellable;
					};
					
					if (!cancelled && stack) {
						if (!dispatch.sorted) {
							stack.sort(function(value1, value2) {
								return tools.compareNumbers(value1[2], value2[2]);
							});
							dispatch.sorted = true;
						};
						
						ev && types.invoke(ev, 'setAttributes', [{obj: this, name: dispatch.METHOD_NAME}]);
						
						var i = 0;
						while (i < stack.length) {
							var data = stack[i],
								obj = data[0],
								fn = data[1];
								
							ev && types.invoke(ev, 'setAttribute', ['handlerData', data[3]]);

							var retval = types.invoke(obj, fn, [ev]);
							
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
								types.invoke(ev, 'setAttributes', [{obj: this, name: this.onEventCancelled.METHOD_NAME}]);
								this.onEventCancelled.call(obj, ev);
								cancelled = true;
								break;
							};
						};
					};
					
					return cancelled;
				});
			};
			
			doodad.EVENT = root.DD_DOC(
				//! REPLACE_BY("null")
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
					return doodad.PROTECTED(doodad.ATTRIBUTE(__Internal__.EVENT(cancellable, fn), extenders.Event, {enableScopes: false}));
				});

			doodad.ERROR_EVENT = root.DD_DOC(
				//! REPLACE_BY("null")
				{
						author: "Claude Petit",
						revision: 0,
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
					return doodad.OPTIONS({canReject: false}, doodad.EVENT(false, fn));
				});

			//==================================
			// Scopes
			//==================================
			
			doodad.Scopes = {
				Public: 1,
				Protected: 2,
				Private: 3,
			};
			
			doodad.PUBLIC = root.DD_DOC(
				//! REPLACE_BY("null")
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
					value = doodad.AttributeBox(value);
					value.SCOPE = doodad.Scopes.Public;
					return value;
				});
			
			doodad.PROTECTED = root.DD_DOC(
				//! REPLACE_BY("null")
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
					value = doodad.AttributeBox(value);
					value.SCOPE = doodad.Scopes.Protected;
					return value;
				});

			doodad.PRIVATE = root.DD_DOC(
				//! REPLACE_BY("null")
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
					value = doodad.AttributeBox(value);
					value.SCOPE = doodad.Scopes.Private;
					return value;
				});
			
			doodad.PROTECTED_DEBUG = (root.DD_ASSERT && doodad.options.settings.publicOnDebug ? doodad.PUBLIC : doodad.PROTECTED);
			doodad.PRIVATE_DEBUG = (root.DD_ASSERT && doodad.options.settings.publicOnDebug ? doodad.PUBLIC : doodad.PRIVATE);
			
			//==================================
			// Class Modifiers
			//==================================
			
			// Can be combined
			doodad.ClassModifiers = {
				Base: 1,
				MixIn: 2,
				Interface: 4,
				Sealed: 8,
				Static: 16,
				Singleton: 32,
				Isolated: 64,
			};
			doodad.preservedClassModifiers = doodad.ClassModifiers.MixIn | doodad.ClassModifiers.Interface | doodad.ClassModifiers.Sealed | doodad.ClassModifiers.Static;

			doodad.BASE = root.DD_DOC(
				//! REPLACE_BY("null")
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
						description: "Sets a class, interface or mix-in as base.",
				}
				//! END_REPLACE()
				, function BASE(cls) {
					root.DD_ASSERT && root.DD_ASSERT((cls === types.Type) || types.baseof(types.Type, cls), "Invalid class.");
					if (cls.INITIALIZED) {
						throw new exceptions.Error("Class '" + types.getTypeName(cls) + "' is initialized.");
					};
					types.invoke(cls, 'setAttribute', ['$TYPE_MODIFIERS', (cls.$TYPE_MODIFIERS || 0) | doodad.ClassModifiers.Base]);
					return cls;
				});
			
			doodad.MIX_IN = root.DD_DOC(
				//! REPLACE_BY("null")
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
						description: "Transforms a class to a mix-in.",
				}
				//! END_REPLACE()
				, function MIX_IN(cls) {
					root.DD_ASSERT && root.DD_ASSERT((cls === types.Type) || types.baseof(types.Type, cls), "Invalid class.");
					if (root.DD_ASSERT || doodad.options.settings.enforcePolicies) {
						var base = types.getBase(cls);
						if (!types.is(base, doodad.Class) && !types.isMixIn(base)) {
							throw new exceptions.Error("Mix-ins must be based on 'doodad.Class' or another mix-in.");
						};
					};
					if (cls.INITIALIZED) {
						throw new exceptions.Error("Class '" + types.getTypeName(cls) + "' is initialized.");
					};
					types.invoke(cls, 'setAttribute', ['$TYPE_MODIFIERS', ((cls.$TYPE_MODIFIERS || 0) & ~doodad.ClassModifiers.Interface) | doodad.ClassModifiers.MixIn]);
					return cls;
				});
			
			doodad.INTERFACE = root.DD_DOC(
				//! REPLACE_BY("null")
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
						description: "Transforms a class to an interface.",
				}
				//! END_REPLACE()
				, function INTERFACE(cls) {
					root.DD_ASSERT && root.DD_ASSERT((cls === types.Type) || types.baseof(types.Type, cls), "Invalid class.");
					if (root.DD_ASSERT || doodad.options.settings.enforcePolicies) {
						var base = types.getBase(cls);
						if (!types.is(base, doodad.Class) && !types.isInterface(base)) {
							throw new exceptions.Error("Interfaces must be based on 'doodad.Class' or another mix-in.");
						};
					};
					if (cls.INITIALIZED) {
						throw new exceptions.Error("Class '" + types.getTypeName(cls) + "' is initialized.");
					};
					types.invoke(cls, 'setAttribute', ['$TYPE_MODIFIERS', ((cls.$TYPE_MODIFIERS || 0) & ~doodad.ClassModifiers.MixIn) | doodad.ClassModifiers.Interface]);
					return cls;
				});
			
			doodad.SEALED = root.DD_DOC(
				//! REPLACE_BY("null")
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
						description: "Sets a class, interface or mix-in to a sealed one.",
				}
				//! END_REPLACE()
				, function SEALED(cls) {
					root.DD_ASSERT && root.DD_ASSERT((cls === types.Type) || types.baseof(types.Type, cls), "Invalid class.");
					if (cls.INITIALIZED) {
						throw new exceptions.Error("Class '" + types.getTypeName(cls) + "' is initialized.");
					};
					types.invoke(cls, 'setAttribute', ['$TYPE_MODIFIERS', (cls.$TYPE_MODIFIERS || 0) | doodad.ClassModifiers.Sealed]);
					return cls;
				});
			
			doodad.STATIC = root.DD_DOC(
				//! REPLACE_BY("null")
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
						description: "Transforms a class a static class.",
				}
				//! END_REPLACE()
				, function STATIC(cls) {
					root.DD_ASSERT && root.DD_ASSERT((cls === types.Type) || types.baseof(types.Type, cls), "Invalid class.");
					if (cls.INITIALIZED) {
						throw new exceptions.Error("Class '" + types.getTypeName(cls) + "' is initialized.");
					};
					types.invoke(cls, 'setAttribute', ['$TYPE_MODIFIERS', (cls.$TYPE_MODIFIERS || 0) | doodad.ClassModifiers.Static]);
					return cls;
				});
			
			doodad.ISOLATED = root.DD_DOC(
				//! REPLACE_BY("null")
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
						description: "Transforms a mix-in or an interface to an isolated one.",
				}
				//! END_REPLACE()
				, function ISOLATED(cls) {
					root.DD_ASSERT && root.DD_ASSERT((cls === types.Type) || types.baseof(types.Type, cls), "Invalid class.");
					if (root.DD_ASSERT || doodad.options.settings.enforcePolicies) {
						if (!types.isInterface(cls) && !types.isMixIn(cls)) {
							throw new exceptions.Error("Isolation can only be applied on interfaces and mix-ins.");
						};
					};
					if (cls.INITIALIZED) {
						throw new exceptions.Error("Class '" + types.getTypeName(cls) + "' is initialized.");
					};
					types.invoke(cls, 'setAttribute', ['$TYPE_MODIFIERS', (cls.$TYPE_MODIFIERS || 0) | doodad.ClassModifiers.Isolated]);
					return cls;
				});
			
			//==================================
			// Method Positioning
			//==================================

			doodad.POSITION = root.DD_DOC(
				//! REPLACE_BY("null")
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
					value = doodad.AttributeBox(value);
					value.POSITION = {
						position: position,
						cls: cls,
					};
					return value;
				});

			doodad.AFTER = root.DD_DOC(
				//! REPLACE_BY("null")
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
				//! REPLACE_BY("null")
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
			doodad.MethodModifiers = {
				Replace: 1,
				Override: 2,
				MustOverride: 4,
				Obsolete: 8,
				CallFirst: 16,
				CanBeDestroyed: 32,
				NotImplemented: 64,
				ForceCreate: 128,
			};
			doodad.preservedMethodModifiers = doodad.MethodModifiers.Obsolete | doodad.MethodModifiers.CanBeDestroyed;
			
			doodad.REPLACE = root.DD_DOC(
				//! REPLACE_BY("null")
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
					fn = doodad.AttributeBox(fn);
					if (root.DD_ASSERT) {
						root.DD_ASSERT(types.isNothing(_interface) || types.isInterface(_interface) || types.isMixIn(_interface), "Invalid interface or mix-in.");
						var val = types.unbox(fn);
						root.DD_ASSERT(types.isNothing(val) || types.isJsFunction(val), "Invalid function.");
					};
					fn.METHOD_MODIFIERS = ((fn.METHOD_MODIFIERS || 0) & ~doodad.MethodModifiers.Override) | doodad.MethodModifiers.Replace;
					if (!fn.EXTENDER) {
						fn.EXTENDER = extenders.Method;
					};
					fn.INTERFACE = _interface;
					return fn;
				});
			
			doodad.OVERRIDE = root.DD_DOC(
				//! REPLACE_BY("null")
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
					fn = doodad.AttributeBox(fn);
					if (root.DD_ASSERT) {
						root.DD_ASSERT(types.isNothing(_interface) || types.isInterface(_interface) || types.isMixIn(_interface), "Invalid interface or mix-in.");
						var val = types.unbox(fn);
						root.DD_ASSERT(types.isNothing(val) || types.isJsFunction(val), "Invalid function.");
					};
					fn.METHOD_MODIFIERS = ((fn.METHOD_MODIFIERS || 0) & ~doodad.MethodModifiers.Replace) | doodad.MethodModifiers.Override;
					if (!fn.EXTENDER) {
						fn.EXTENDER = extenders.Method;
					};
					fn.INTERFACE = _interface;
					return fn;
				});
			
			doodad.CREATE_REPLACE = root.DD_DOC(
				//! REPLACE_BY("null")
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
					fn.METHOD_MODIFIERS = (fn.METHOD_MODIFIERS || 0) | doodad.MethodModifiers.ForceCreate;
					return fn;
				});
			
			doodad.CREATE_OVERRIDE = root.DD_DOC(
				//! REPLACE_BY("null")
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
					fn.METHOD_MODIFIERS = (fn.METHOD_MODIFIERS || 0) | doodad.MethodModifiers.ForceCreate;
					return fn;
				});
			
			doodad.MUST_OVERRIDE = root.DD_DOC(
				//! REPLACE_BY("null")
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
						description: "Specifies that a method will must be overridden (or replaced).",
				}
				//! END_REPLACE()
				, function MUST_OVERRIDE(/*optional*/fn) {
					fn = doodad.AttributeBox(fn);
					if (root.DD_ASSERT) {
						var val = types.unbox(fn);
						root.DD_ASSERT(types.isNothing(val) || types.isJsFunction(val), "Invalid function.");
					};
					fn.METHOD_MODIFIERS = (fn.METHOD_MODIFIERS || 0) | doodad.MethodModifiers.MustOverride;
					if (!fn.EXTENDER) {
						fn.EXTENDER = extenders.Method;
					};
					return fn;
				});
			
			doodad.OBSOLETE = root.DD_DOC(
				//! REPLACE_BY("null")
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
					fn = doodad.AttributeBox(fn);
					if (root.DD_ASSERT) {
						var val = types.unbox(fn);
						root.DD_ASSERT(types.isNothing(val) || types.isJsFunction(val), "Invalid function.");
					};
					fn.METHOD_MODIFIERS = (fn.METHOD_MODIFIERS || 0) | doodad.MethodModifiers.Obsolete;
					if (!fn.EXTENDER) {
						fn.EXTENDER = extenders.Method;
					};
					fn.USAGE_MESSAGE = message;
					return fn;
				});

			doodad.CALL_FIRST = root.DD_DOC(
				//! REPLACE_BY("null")
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
					fn = doodad.AttributeBox(fn);
					if (root.DD_ASSERT) {
						var val = types.unbox(fn);
						root.DD_ASSERT(types.isNothing(val) || types.isJsFunction(val), "Invalid function.");
					};
					fn.METHOD_MODIFIERS = (fn.METHOD_MODIFIERS || 0) | doodad.MethodModifiers.CallFirst;
					if (!fn.EXTENDER) {
						fn.EXTENDER = extenders.Method;
					};
					return fn;
				});
			
			doodad.CAN_BE_DESTROYED = root.DD_DOC(
				//! REPLACE_BY("null")
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
					fn = doodad.AttributeBox(fn);
					if (root.DD_ASSERT) {
						var val = types.unbox(fn);
						root.DD_ASSERT(types.isNothing(val) || types.isJsFunction(val), "Invalid function.");
					};
					fn.METHOD_MODIFIERS = (fn.METHOD_MODIFIERS || 0) | doodad.MethodModifiers.CanBeDestroyed;
					if (!fn.EXTENDER) {
						fn.EXTENDER = extenders.Method;
					};
					return fn;
				});
			
			doodad.NOT_IMPLEMENTED = root.DD_DOC(
				//! REPLACE_BY("null")
				{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'AttributeBox',
						description: "Specifies that this method is not implemented and can be overridden.",
				}
				//! END_REPLACE()
				, function NOT_IMPLEMENTED() {
					var fn = doodad.AttributeBox();
					fn.METHOD_MODIFIERS = (fn.METHOD_MODIFIERS || 0) | doodad.MethodModifiers.NotImplemented;
					fn.EXTENDER = extenders.Method;
					return fn;
				});
			
			doodad.RETURNS = root.DD_DOC(
				//! REPLACE_BY("null")
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
					fn = doodad.AttributeBox(fn);
					if (root.DD_ASSERT) {
						var val = types.unbox(fn);
						root.DD_ASSERT(types.isNothing(val) || types.isJsFunction(val), "Invalid function.");
					};
					fn.returns = validator;
					if (!fn.EXTENDER) {
						fn.EXTENDER = extenders.Method;
					};
					return fn;
				});


			//==================================
			// Internal stack
			//==================================
			
			root.DD_DOC(
				//! REPLACE_BY("null")
				{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'Class',
						description: "Registers method calls from inside Doodad.",
				}
				//! END_REPLACE()
				, doodad.REGISTER(types.SINGLETON(doodad.TypeNamespace.$inherit(
					{
						$TYPE_NAME: "Stack",
					},
					{
						stackLimit: 50,
						
						__calls: null,
						
						push: root.DD_DOC(
							//! REPLACE_BY("null")
							{
									author: "Claude Petit",
									revision: 0,
									params: {
										type: {
											type: 'Class',
											optional: false,
											description: "Class that has been called.",
										},
										name: {
											type: 'string',
											optional: false,
											description: "Name of the called method.",
										},
										args: {
											type: 'arrayof(any)',
											optional: true,
											description: "Arguments of the called method.",
										},
									},
									returns: 'undefined',
									description: "Adds a method call to the stack.",
							}
							//! END_REPLACE()
							, function push(type, name, /*optional*/args) {
								if (this.__calls && (this.__calls.length < this.stackLimit)) {
									this.__calls.push([type, name, args || []]);
								};
							}),
						pop: root.DD_DOC(
							//! REPLACE_BY("null")
							{
									author: "Claude Petit",
									revision: 0,
									params: null,
									returns: 'undefined',
									description: "Removes the last call from the stack.",
							}
							//! END_REPLACE()
							, function pop() {
								if (this.__calls) {
									this.__calls.pop();
								};
							}),
						dump: root.DD_DOC(
							//! REPLACE_BY("null")
							{
									author: "Claude Petit",
									revision: 0,
									params: null,
									returns: 'undefined',
									description: "Dumps the stack to the logger.",
							}
							//! END_REPLACE()
							, function dump() {
								var call, url;
								if (this.__calls) {
									tools.log(tools.LogLevels.Info, "Internal stack dump :");
									for (var i = this.__calls.length - 1; i >= 0; i--) {
										call = this.__calls[i];
										tools.log(tools.LogLevels.Info, "    ~0~.~1~", [call[0], call[1]]);
										var args = call[2];
										if (args.length) {
											var	arg,
												argsLen = args.length;
											for (var j = 0; j < argsLen; j++) {
												arg = (args[j] + '');
												tools.log(tools.LogLevels.Info, "        ~0~: ~1~~2~", [j, arg.slice(0, 50), (arg.length > 50 ? '...' : '')]);
											};
										};
									};
									return;
								} else if (global.console && console.trace) {
									tools.log(tools.LogLevels.Info, "Browser trace :");
									console.trace();
									return;
								} else {
									var stack = tools.getStackTrace();
									if (stack.length) {
										tools.log(tools.LogLevels.Error, stack.toString());
										return;
									};
								};
								tools.log(tools.LogLevels.Info, "Stack dump not available.");
							}),
						clear: root.DD_DOC(
							//! REPLACE_BY("null")
							{
									author: "Claude Petit",
									revision: 0,
									params: null,
									returns: 'undefined',
									description: "Clears the stack.",
							}
							//! END_REPLACE()
							, function clear() {
								if (this.__calls) {
									this.__calls = [];
								};
							}),
						enable: root.DD_DOC(
							//! REPLACE_BY("null")
							{
									author: "Claude Petit",
									revision: 0,
									params: null,
									returns: 'undefined',
									description: "Enables the stack.",
							}
							//! END_REPLACE()
							, function enable() {
								if (!this.__calls) {
									this.__calls = [];
								};
							}),
						disable: root.DD_DOC(
							//! REPLACE_BY("null")
							{
									author: "Claude Petit",
									revision: 0,
									params: null,
									returns: 'undefined',
									description: "Disables the stack.",
							}
							//! END_REPLACE()
							, function disable() {
								this.__calls = null;
							}),
						isEnabled: root.DD_DOC(
							//! REPLACE_BY("null")
							{
									author: "Claude Petit",
									revision: 0,
									params: null,
									returns: 'bool',
									description: "Returns 'true' if the stack is enabled. Returns 'false' otherwise.",
							}
							//! END_REPLACE()
							, function isEnabled() {
								return !!this.__calls;
							}),
					}
				))));

			//==================================
			// Class
			//==================================
				
			__Internal__.getDefaultAttributes = function setDefaultAttributes(base, _implements, typeStorage, instanceStorage, modifiers, _isolated, proto, protoName) {
				var attributes = {
					// From "Doodad.Types.Type"
					$TYPE_NAME: doodad.PUBLIC(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PRE_EXTEND(doodad.PERSISTENT(doodad.TYPE(doodad.ATTRIBUTE(protoName, extenders.Attribute))))))),
					INITIALIZED: doodad.PUBLIC(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PRE_EXTEND(doodad.TYPE(doodad.INSTANCE(extenders.Attribute)))))),
					$isSingleton: doodad.PUBLIC(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PRE_EXTEND(doodad.PERSISTENT(doodad.TYPE(extenders.Attribute)))))),
					_super: doodad.PROTECTED_DEBUG(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PERSISTENT(doodad.PRE_EXTEND(doodad.TYPE(doodad.INSTANCE(extenders.Null))))))),
					__DD_DOC__: doodad.PUBLIC(doodad.PRE_EXTEND(doodad.TYPE(extenders.Attribute))),

					// From "types.Namespace".
					DD_PARENT: doodad.PUBLIC(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PRE_EXTEND(doodad.PERSISTENT(doodad.TYPE(extenders.Attribute)))))),
					DD_NAME: doodad.PUBLIC(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PRE_EXTEND(doodad.PERSISTENT(doodad.TYPE(extenders.Attribute)))))),
					DD_FULL_NAME: doodad.PUBLIC(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PRE_EXTEND(doodad.PERSISTENT(doodad.TYPE(extenders.Attribute)))))),
				
					// Added by Doodad to "types.Namespace".
					REGISTER: doodad.PUBLIC(doodad.READ_ONLY(doodad.PRE_EXTEND(doodad.PERSISTENT(doodad.TYPE(extenders.Attribute))))),
					UNREGISTER: doodad.PUBLIC(doodad.READ_ONLY(doodad.PRE_EXTEND(doodad.PERSISTENT(doodad.TYPE(extenders.Attribute))))),
				
					// From "Doodad.TypeNamespace"
					
					// From "Doodad.Class"
					$PROTOTYPE: doodad.PRIVATE_DEBUG(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PRE_EXTEND(doodad.TYPE(doodad.ATTRIBUTE(proto, extenders.Attribute)))))),
					$TYPE_MODIFIERS: doodad.PUBLIC(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PRE_EXTEND(doodad.TYPE(doodad.ATTRIBUTE(modifiers, extenders.Attribute)))))),
					$IMPLEMENTS: doodad.PRIVATE_DEBUG(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PRE_EXTEND(doodad.TYPE(doodad.ATTRIBUTE(_implements, extenders.Attribute)))))),
					$MUST_OVERRIDE: doodad.PUBLIC(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PRE_EXTEND(doodad.TYPE(extenders.Null))))),
					$BASE: doodad.PUBLIC(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PRE_EXTEND(doodad.TYPE(doodad.ATTRIBUTE(base, extenders.Attribute)))))),
					$ISOLATED: doodad.PRIVATE_DEBUG(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PRE_EXTEND(doodad.TYPE(doodad.ATTRIBUTE(_isolated, extenders.Attribute)))))),
					__ISOLATED_CACHE: doodad.PRIVATE_DEBUG(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PRE_EXTEND(doodad.INSTANCE(doodad.ATTRIBUTE(new types.Map(), extenders.Attribute)))))),
					$__ATTRIBUTES_STORAGE: doodad.PRIVATE_DEBUG(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PERSISTENT(doodad.PRE_EXTEND(doodad.TYPE(doodad.ATTRIBUTE(typeStorage, extenders.Attribute))))))),
					__ATTRIBUTES_STORAGE: doodad.PRIVATE_DEBUG(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PERSISTENT(doodad.PRE_EXTEND(doodad.INSTANCE(doodad.ATTRIBUTE(instanceStorage, extenders.Attribute))))))),
					$CURRENT_DISPATCH: doodad.PROTECTED_DEBUG(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PERSISTENT(doodad.TYPE(extenders.Null))))),
					$CURRENT_CALLER_INDEX: doodad.PROTECTED_DEBUG(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PERSISTENT(doodad.TYPE(extenders.Null))))),
				};

				attributes.$__ATTRIBUTES = doodad.PRIVATE_DEBUG(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PERSISTENT(doodad.PRE_EXTEND(doodad.TYPE(doodad.ATTRIBUTE(attributes, extenders.Attribute)))))));
				
				tools.forEach(attributes, function(attribute, name) {
					attributes[name] = attribute = doodad.OPTIONS({isEnumerable: false}, attribute);
					attribute.PROTOTYPE = __Internal__.classProto;
				});
				
				if (!types.hasKey(types.options.settings.reservedAttributes, '$__ATTRIBUTES')) {
					tools.forEach(attributes, function(attribute, name) {
						types.options.settings.reservedAttributes[name] = undefined;
					});
				};
				
				return attributes;
			};
			
			__Internal__.preExtendAttribute = function preExtendAttribute(attr, baseProto, source, sourceProto, destAttributes, baseIsProto, sourceIsProto, forType, _isolated) {
				if ((sourceIsProto ? types.hasKey(sourceProto, attr) : types.hasKeyInherited(sourceProto, attr)) && !types.hasKey(types.options.settings.reservedAttributes, attr)) {
					var sourceAttribute = doodad.AttributeBox(sourceProto[attr]);
						
					var _interface = sourceAttribute.INTERFACE;
					if (_interface) {
						if (!_isolated.has(_interface)) {
							throw new exceptions.Error("Interface '~0~' not found.", [types.getTypeName(_interface)]);
						};
						_isolated = _isolated.get(_interface);
						destAttributes = _isolated[2];
					};
					
					var extender = null;

					if (types.hasKey(destAttributes, attr)) {
						extender = destAttributes[attr].EXTENDER;
					};
					
					if (sourceAttribute.EXTENDER)  {
						if (extender && extender.override) {
							extender = extender.override(sourceAttribute.EXTENDER);
						} else {
							extender = sourceAttribute.EXTENDER;
						};
					};
					
					if (!extender) {
						if (types.isJsFunction(types.unbox(sourceAttribute))) {
							extender = extenders.Method;
						} else {
							extender = extenders.ClonedAttribute;
						};
					};
					
					if (!extender.isType && !extender.isInstance) {
						if (attr[0] === '$') {
							extender = doodad.TYPE(extender);
						//} else if (forType) {
						//	extender = doodad.TYPE(doodad.INSTANCE(extender));
						} else {
							extender = doodad.INSTANCE(extender);
						};
					};
					
					if (root.DD_ASSERT || doodad.options.settings.enforcePolicies) {
						if (!!extender.isType !== !!extender.isInstance) {
							if (attr[0] === '$') {
								if (!extender.isType) {
									throw new exceptions.Error("Instance attributes must not begin with '$'.");
								};
							} else {
								if (!extender.isInstance) {
									throw new exceptions.Error("Type attributes must begin with '$'.");
								};
							};
						};
					};

					if (extender.getValue) {
						var result = extender.getValue(attr, sourceProto, forType, sourceIsProto);
						sourceAttribute = sourceAttribute.setValue(result);
					};
					
					if (sourceIsProto) {
						sourceAttribute.EXTENDER = extender;
					};

					if (!sourceAttribute.PROTOTYPE) {
						sourceAttribute.PROTOTYPE = sourceProto;
					};
					
					if (extender.extend) {
						if ((extender.isType && forType) || (extender.isInstance && !forType)) {
							var destAttribute;

							if (extender.getValue) {
								destAttribute = doodad.AttributeBox(extender.getValue(attr, destAttributes, forType, false));
							} else {
								destAttribute = doodad.AttributeBox(destAttributes[attr]);
							};
							
							if ((types.unbox(destAttribute) === undefined) || extender.notInherited) {
								if (extender.getValue) {
									destAttribute = destAttribute.setValue(extender.getValue(attr, baseProto, forType, baseIsProto));
								} else {
									destAttribute = destAttribute.setValue(baseProto[attr]);
								};
								if (!destAttribute.PROTOTYPE) {
									destAttribute.PROTOTYPE = baseProto;
								};
							};
								
							if ((destAttribute.PROTOTYPE !== sourceAttribute.PROTOTYPE) || extender.notInherited) {
								destAttribute.EXTENDER = extender;
								
								if (types.isNothing(destAttribute.SCOPE)) {
									if (types.isNothing(sourceAttribute.SCOPE)) {
										var start = attr.slice(0, 2);
										if ((start === '__') || ((start + attr[2]) === '$__')) {
											destAttribute.SCOPE = doodad.Scopes.Protected;
										} else {
											destAttribute.SCOPE = doodad.Scopes.Public;
										};
									} else {
										destAttribute.SCOPE = sourceAttribute.SCOPE;
									};
								};
								
								if (extender.preExtend) {
									var result = extender.extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto);
									if (destAttribute) {
										destAttribute = destAttribute.setValue(result);
									} else {
										destAttribute = result; //result.clone();
									};
									//if (sourceIsProto) {
									//	destAttribute.PROTOTYPE = sourceProto;
									//};
									destAttributes[attr] = destAttribute;
								} else {
									return [
										/* 0 : data   */ [/*0*/ extender], 
										/* 1 : params */ [/*0*/ attr, /*1*/ source, /*2*/ sourceProto, /*3*/ destAttributes, /*4*/ forType, /*5*/ sourceAttribute, /*6*/ destAttribute, /*7*/ sourceIsProto]
									];
								};
							};
						};
					};
				};
			};
			
			__Internal__.extendSource = function extendSource(base, baseAttributes, source, sourceAttributes, destAttributes, baseIsClass, sourceIsClass, _isolated) {
				var baseIsProto = false,
					baseTypeProto = baseAttributes,
					baseInstanceProto = baseAttributes;
				if (!baseIsClass) {
					if (types.isFunction(base)) {
						// JS class
						baseTypeProto = types.getPrototypeOf(base);
						baseInstanceProto = base.prototype;
					} else {
						// Prototype
						baseTypeProto = base;
						baseInstanceProto = base;
						baseIsProto = true;
					};
				};
				
				var sourceIsProto = false,
					sourceTypeProto = sourceAttributes,
					sourceInstanceProto = sourceAttributes,
					sourceAttrs;
				if (sourceIsClass) {
					// Doodad class
					sourceAttrs = types.keys(sourceAttributes);
				} else {
					if (types.isFunction(source)) {
						// JS class
						sourceTypeProto = types.getPrototypeOf(source);
						sourceInstanceProto = source.prototype;
					} else {
						// Prototype
						sourceTypeProto = source;
						sourceInstanceProto = source;
						sourceAttrs = types.keys(source);
						sourceIsProto = true;
					};
					//sourceNames = tools.unique(types.keysInherited(sourceTypeProto), types.keysInherited(sourceInstanceProto));
				};
				
				// Pre-extend
				var attrs = tools.unique(sourceAttrs, types.keys(destAttributes));
				var attrsLen = attrs.length;
				var toExtend = [];
				
				for (var k = 0; k < attrsLen; k++) {
					var attr = attrs[k];
					var params;
					params = __Internal__.preExtendAttribute(attr, baseTypeProto, source, sourceTypeProto, destAttributes, baseIsProto, sourceIsProto, true, _isolated);
					if (params) {
						toExtend.push(params);
					};
					
					params = __Internal__.preExtendAttribute(attr, baseInstanceProto, source, sourceInstanceProto, destAttributes, baseIsProto, sourceIsProto, false, _isolated);
					if (params) {
						toExtend.push(params);
					};
				};
				
				// Extend
				var toExtendLen = toExtend.length;
				for (var k = 0; k < toExtendLen; k++) {
					var data = toExtend[k];
					var params = data[1];
					data = data[0];
					var extender = data[0];
					var attr = params[0];
					var destAttributes = params[3];
					var sourceAttribute = params[5];
					var destAttribute = params[6];
					var result = extender.extend.apply(extender, params);
					if (destAttribute) {
						destAttribute = destAttribute.setValue(result);
					} else {
						destAttribute = result; //result.clone();
					};
					destAttribute.PROTOTYPE = sourceAttribute.PROTOTYPE;
					destAttributes[attr] = destAttribute;
				};
			};
			
			__Internal__.addImplements = function addImplements(_implements, attributes, _isolated, source, sourceName, sourceBase, sourceImplements, sourceAttributes, sourceIsolated) {
				// Add new implement
				_implements.add(source);
				
				if (sourceBase) {
					if (types.isInterface(sourceBase) || types.isMixIn(sourceBase)) {
						_implements.add(sourceBase);
					};
				};
				
				if (sourceImplements) {
					//types.complete(_implements, sourceImplements);
					//NOT COMPATIBLE for (var item of sourceImplements) { 
					sourceImplements.forEach(function(item) {
						if (!_implements.has(item)) {
							_implements.add(item);
						};
					});
				};
				
				if (sourceAttributes) {
					tools.forEach(sourceAttributes, function(attribute, name) {
						if (!types.hasKey(attributes, name)) {
							attributes[name] = attribute.clone();
						};
					});
				};
				
				if (sourceIsolated) {
					sourceIsolated.forEach(function(data, _interface) {
						if (!_isolated.has(_interface)) {
							data = types.clone(data);
							data[6] = null; // clear constructed type (see "getInterface")
							_isolated.set(_interface, data);
						};
					});
				};
			};
			
			__Internal__.implementSource = function implementSource(base, baseAttributes, source, destAttributes, _implements, _isolated, typeStorage, instanceStorage, baseIsClass, baseIsBase, baseIsMixIn, baseIsInterface, proto) {
				var sourceIsClass = types.isClass(source),
					sourceName = (sourceIsClass ? types.getTypeName(source) : types.unbox(source.$TYPE_NAME));

				if (!sourceIsClass || (sourceName && !_implements.has(source))) {
					if (!types.baseof(source, base)) { // prevents cyclic extend
						if (root.DD_ASSERT || doodad.options.settings.enforcePolicies) {
							if (source !== base) {
								if (!baseIsBase && types.isBase(source)) {
									throw new exceptions.Error("Can't implement base type '~0~' in a non-base type.", [sourceName]);
								};
								if (baseIsMixIn) {
									if (sourceIsClass && !types.isMixIn(source) && !types.isInterface(source)) {
										throw new exceptions.Error("Can't implement non-mix-in or non-interface type '~0~' in a mix-in.", [sourceName]);
									};
								} else if (baseIsInterface) {
									if (sourceIsClass && !types.isInterface(source)) {
										throw new exceptions.Error("Can't implement non-interface type '~0~' in an interface.", [sourceName]);
									};
								};
							};
						};
						
						if (types.isIsolated(source)) {
							_implements.add(source);
							var protoName = sourceName + '_Interface';
							base = doodad.Interface;
							baseIsClass = true;
							_implements = new types.Set();
							typeStorage = {};
							instanceStorage = {};
							destAttributes = __Internal__.getDefaultAttributes(base, _implements, typeStorage, instanceStorage, null, null, proto, protoName);
							var typeProto = {
								$TYPE_NAME: protoName,
							};
							_isolated.set(source, [/*0*/ typeProto, /*1 : instanceProto*/ {}, /*2*/ destAttributes, /*3*/ source, /*4*/ typeStorage, /*5*/ instanceStorage, /*6 : type*/ null]);
							
							var sourceData = types.invoke(base, 'getAttributes', [['$BASE', '$IMPLEMENTS', '$__ATTRIBUTES', '$ISOLATED']]);
							baseAttributes = sourceData.$__ATTRIBUTES;
							__Internal__.addImplements(_implements, destAttributes, _isolated, base, types.getTypeName(base), sourceData.$BASE, sourceData.$IMPLEMENTS, baseAttributes, sourceData.$ISOLATED);
						};

						var sourceAttributes;
						if (sourceIsClass) {
							var sourceData = types.invoke(source, 'getAttributes', [['$BASE', '$IMPLEMENTS', '$__ATTRIBUTES', '$ISOLATED']]);
							sourceAttributes = sourceData.$__ATTRIBUTES;
							__Internal__.addImplements(_implements, destAttributes, _isolated, source, sourceName, sourceData.$BASE, sourceData.$IMPLEMENTS, sourceAttributes, sourceData.$ISOLATED);
						};
						
						__Internal__.extendSource(base, baseAttributes, source, sourceAttributes, destAttributes, baseIsClass, sourceIsClass, _isolated);
					};
				};
			};
			
			__Internal__.setAttributes = function setAttributes(attributes, typeProto, instanceProto, typeStorage, instanceStorage) {
				for (var attr in attributes) {
					if (types.hasKey(attributes, attr)) {
						var attribute = attributes[attr];
						var extender = attribute.EXTENDER;
						if (extender.setValue) {
							if (extender.isType) {
								extender.setValue(attr, typeProto, typeStorage, instanceStorage, true, attribute);
							};
							if (extender.isInstance) {
								extender.setValue(attr, instanceProto, typeStorage, instanceStorage, false, attribute);
							};
						};
					};
				};
			};
				
			__Internal__.initializeAttributes = function initializeAttributes(obj, attributes, typeStorage, instanceStorage, forType) {
				var storage = (forType ? typeStorage : instanceStorage);
				var attrs = types.keys(attributes);
				for (var i = attrs.length - 1; i >= 0; i--) {
					var attr = attrs[i],
						attribute = attributes[attr],
						extender = attribute.EXTENDER;
					
					var value;
					
					if ((forType && extender.isType) || (!forType && extender.isInstance)) {
						if (extender.preExtend) {
							//var value = types.get(storage, attr, obj[attr]);
							if (types.hasKey(storage, attr)) {
								value = storage[attr];
							} else {
								value = obj[attr];
							};
							extender.init && extender.init(attr, obj, attributes, typeStorage, instanceStorage, forType, value);
							if (extender.isPreserved) {
								//var value = types.get(storage, attr, obj[attr]);
								if (types.hasKey(storage, attr)) {
									value = storage[attr];
								} else {
									value = obj[attr];
								};
								var presAttr = '__' + attr + '_preserved__';
								if (extender.clone) {
									extender.clone(attr, presAttr, obj, attributes, typeStorage, instanceStorage, forType, value, {isPreserved: false});
									if (types.hasDefinePropertyEnabled()) {
										types.defineProperty(obj, presAttr, {
											enumerable: false,
										});
									};
								} else {
									if (types.hasDefinePropertyEnabled()) {
										types.defineProperty(obj, presAttr, {
											writable: false,
											enumerable: false,
											configurable: true, // to allow "delete"
											value: obj[attr],
										});
									} else {
										obj[presAttr] = obj[attr];
									};
								};
							};
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
							extender = attribute.EXTENDER;
						
						// NOTE: "if (!extender.preExtend && ((forType && extender.isType) || (!forType && extender.isInstance)) {...}" --> Done with "attrs.splice".
						//var value = types.get(storage, attr, obj[attr]);
						var value;
						if (types.hasKey(storage, attr)) {
							value = storage[attr];
						} else {
							value = obj[attr];
						};
						extender.init && extender.init(attr, obj, attributes, typeStorage, instanceStorage, forType, value);
						if (extender.isPreserved) {
							if (types.hasKey(storage, attr)) {
								value = storage[attr];
							} else {
								value = obj[attr];
							};
							var presAttr = '__' + attr + '_preserved__';
							if (extender.clone) {
								extender.clone(attr, presAttr, obj, attributes, typeStorage, instanceStorage, forType, value, {isPreserved: false});
								if (types.hasDefinePropertyEnabled()) {
									types.defineProperty(obj, presAttr, {
										enumerable: false,
									});
								};
							} else {
								if (types.hasDefinePropertyEnabled()) {
									types.defineProperty(obj, presAttr, {
										writable: false,
										enumerable: false,
										configurable: true, // to allow "delete"
										value: obj[attr],
									});
								} else {
									obj[presAttr] = obj[attr];
								};
							};
						};
					};
				};
			};
			
			__Internal__.initializeAttributes2 = function initializeAttributes(obj, attributes, typeStorage, instanceStorage, forType) {
				var storage = (forType ? typeStorage : instanceStorage);
				var attrs = types.keys(attributes);
				for (var i = attrs.length - 1; i >= 0; i--) {
					var attr = attrs[i],
						attribute = attributes[attr],
						extender = attribute.EXTENDER;
					
					var value;
					
					if ((forType && extender.isType) || (!forType && extender.isInstance)) {
						if (extender.preExtend) {
							//var value = types.get(storage, attr, obj[attr]);
							if (types.hasKey(storage, attr)) {
								value = storage[attr];
							} else {
								value = obj[attr];
							};
							extender.init && extender.init(attr, obj, attributes, typeStorage, instanceStorage, forType, value);
							if (extender.isPreserved) {
								//var value = types.get(storage, attr, obj[attr]);
								if (types.hasKey(storage, attr)) {
									value = storage[attr];
								} else {
									value = obj[attr];
								};
								var presAttr = '__' + attr + '_preserved__';
								if (extender.clone) {
									extender.clone(attr, presAttr, obj, attributes, typeStorage, instanceStorage, forType, value, {isPreserved: false});
									if (types.hasDefinePropertyEnabled()) {
										types.defineProperty(obj, presAttr, {
											enumerable: false,
										});
									};
								} else {
									if (types.hasDefinePropertyEnabled()) {
										types.defineProperty(obj, presAttr, {
											writable: false,
											enumerable: false,
											configurable: true, // to allow "delete"
											value: obj[attr],
										});
									} else {
										obj[presAttr] = obj[attr];
									};
								};
							};
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
							extender = attribute.EXTENDER;
						
						// NOTE: "if (!extender.preExtend && ((forType && extender.isType) || (!forType && extender.isInstance)) {...}" --> Done with "attrs.splice".
						//var value = types.get(storage, attr, obj[attr]);
						var value;
						if (types.hasKey(storage, attr)) {
							value = storage[attr];
						} else {
							value = obj[attr];
						};
						extender.init && extender.init(attr, obj, attributes, typeStorage, instanceStorage, forType, value);
						if (extender.isPreserved) {
							if (types.hasKey(storage, attr)) {
								value = storage[attr];
							} else {
								value = obj[attr];
							};
							var presAttr = '__' + attr + '_preserved__';
							if (extender.clone) {
								extender.clone(attr, presAttr, obj, attributes, typeStorage, instanceStorage, forType, value, {isPreserved: false});
								if (types.hasDefinePropertyEnabled()) {
									types.defineProperty(obj, presAttr, {
										enumerable: false,
									});
								};
							} else {
								if (types.hasDefinePropertyEnabled()) {
									types.defineProperty(obj, presAttr, {
										writable: false,
										enumerable: false,
										configurable: true, // to allow "delete"
										value: obj[attr],
									});
								} else {
									obj[presAttr] = obj[attr];
								};
							};
						};
					};
				};
			};
			
			__Internal__.$extend = function $extend(/*paramarray*/) {
				var base = ((this === global) ? undefined : this);
			
				root.DD_ASSERT && root.DD_ASSERT(!base || types.baseof(types.Type, base), "Base must be a type.");

				if (!base) {
					base = types.Type;
				};

				var index = tools.findLastItem(arguments, types.isJsObject);
				if (index === null) {
					throw new exceptions.Error("You must define a prototype.");
				};

				var proto = arguments[index],
					protoName = types.unbox(proto.$TYPE_NAME);
					
				if (!types.isStringAndNotEmpty(protoName)) {
					throw new exceptions.Error("Prototype has no name. You must define the '$TYPE_NAME' attribute.");
				};

				var modifiers = (types.unbox(proto.$TYPE_MODIFIERS) || 0) | (base.$TYPE_MODIFIERS & doodad.preservedClassModifiers);
				
				var baseIsClass = types.isClass(base),
					baseIsBase = baseIsClass && types.isBase(base),
					baseIsMixIn = baseIsClass && types.isMixIn(base),
					baseIsInterface = baseIsClass && types.isInterface(base);
					
				var _implements = new types.Set();
				var _isolated = new types.Map();
				var typeStorage = {};
				var instanceStorage = {};
				var destAttributes = __Internal__.getDefaultAttributes(base, _implements, typeStorage, instanceStorage, modifiers, _isolated, proto, protoName);
					
				// Implement base
				var baseAttributes;
				if (baseIsClass) {
					var baseData = types.invoke(base, 'getAttributes', [['$__ATTRIBUTES', '$BASE', '$IMPLEMENTS', '$ISOLATED']]);
					baseAttributes = baseData.$__ATTRIBUTES;
					__Internal__.addImplements(_implements, destAttributes, _isolated, base, types.getTypeName(base), baseData.$BASE, baseData.$IMPLEMENTS, baseAttributes, baseData.$ISOLATED);
				};

				var argsLen = arguments.length;
				for (var i = 0; i < argsLen; i++) {
					if (i in arguments) {
						__Internal__.implementSource(base, baseAttributes, arguments[i], destAttributes, _implements, _isolated, typeStorage, instanceStorage, baseIsClass, baseIsBase, baseIsMixIn, baseIsInterface, proto);
					};
				};

				// Return new type
				var typeProto = {},
					instanceProto = {};
					
				typeProto.$TYPE_NAME = protoName;
				
				var type = base.$inherit(
					/*typeProto*/
					typeProto,
					
					/*instanceProto*/
					instanceProto,
					
					/*constructor*/
					__Internal__.makeInsideForNew(),
					
					/*constructorContext*/
					__Internal__
				);
				
				root.DD_ASSERT && root.DD_ASSERT(types.baseof(types.Type, type));
				
				// Set attributes. Because of properties, it must be done after $inherit
				__Internal__.setAttributes(destAttributes, types.getPrototypeOf(type), type.prototype, typeStorage, instanceStorage);
				
				// Initialize values
				__Internal__.initializeAttributes(type, destAttributes, typeStorage, instanceStorage, true);
				
				return type;
			};
			
			__Internal__.classProto = {
				$TYPE_NAME: "Class",
				
				_new: doodad.PROTECTED(doodad.READ_ONLY(doodad.TYPE(doodad.INSTANCE(doodad.SUPER(
					function _new(/*paramarray*/) {
						this._super(this.DD_PARENT, this.DD_NAME, this.DD_FULL_NAME);
						
						var cls = types.getType(this),
							forType = types.isType(this);

						// Validate type
						if (!cls) {
							throw new exceptions.Error("Invalid class.");
						};

						var modifiers = (cls.$TYPE_MODIFIERS || 0);
						
						// Must not be a base class
						var isBase = (modifiers & (doodad.ClassModifiers.Base | doodad.ClassModifiers.MixIn | doodad.ClassModifiers.Interface));
						if (isBase) {
							if (!forType) {
								throw new exceptions.Error("Bases, mix-ins and interfaces must be inherited first.");
							};
						};
						
						// Static types can't be instantiated
						if (modifiers & doodad.ClassModifiers.Static) {
							if (!forType) {
								throw new exceptions.Error("Static types can't be instantiated.");
							};
						};
						
						// Initialize attributes
						if (!forType) {
							__Internal__.initializeAttributes(this, cls.$__ATTRIBUTES, cls.$__ATTRIBUTES_STORAGE, types.extend({}, this.__ATTRIBUTES_STORAGE), false);
						};
						
						// Call constructor
						if (!isBase) {
							if (this._implements(mixIns.Creatable)) {
								if (forType) {
									this.$create.apply(this, arguments);
								} else {
									this.create.apply(this, arguments);
								};
							};
						};
						
						// Seal object if it is of a sealed class
						if (Object.seal && types.isSealed(cls)) {
							Object.seal(this);
						};
						
						// Return object
						return this;
					}))))),
				
				_delete: doodad.PROTECTED(doodad.READ_ONLY(doodad.TYPE(doodad.INSTANCE(doodad.SUPER(
					function _delete() {
						this._super();
						
						var forType = types.isType(this);
						var cls = types.getType(this);
						var attributes = cls.$__ATTRIBUTES;
						var storage = (forType ? this.$__ATTRIBUTES_STORAGE : this.__ATTRIBUTES_STORAGE);
						var attrs = types.keys(attributes);
						var sealed = types.isSealed(this);
							
						for (var i = attrs.length - 1; i >= 0; i--) {
							var attr = attrs[i],
								attribute = attributes[attr],
								extender = attribute.EXTENDER;
							
							if (extender.isPersistent) {
								attrs.splice(i, 1);
							} else if (!extender.preExtend) {
								if ((extender.isType && forType) || (extender.isInstance && !forType)) {
									extender.remove && extender.remove(attr, this, storage, forType);
									if (extender.isPreserved) {
										if (extender.clone) {
											extender.remove && extender.remove('__' + attr + '_preserved__', this, storage, forType);
										} else {
											if (!sealed) {
												delete this['__' + attr + '_preserved__'];
											};
										};
									};
								};
								attrs.splice(i, 1);
							};
						};
						
						for (var i = attrs.length - 1; i >= 0; i--) {
							var attr = attrs[i],
								attribute = attributes[attr],
								extender = attribute.EXTENDER;
								
							// NOTE: "if (!extender.isPersistent && extender.preExtend) {...}" --> Done with "attrs.splice".
							if ((extender.isType && forType) || (extender.isInstance && !forType)) {
								extender.remove && extender.remove(attr, this, storage, forType);
								if (extender.isPreserved) {
									if (extender.clone) {
										extender.remove && extender.remove('__' + attr + '_preserved__', this, storage, forType);
									} else {
										if (!sealed) {
											delete this['__' + attr + '_preserved__'];
										};
									};
								};
							};
						};
						
					}))))),
				
				toString: root.DD_DOC(
					//! REPLACE_BY("null")
					{
							author: "Claude Petit",
							revision: 0,
							params: null,
							returns: 'string',
							description: "Converts object to a string.",
					}
					//! END_REPLACE()
					, doodad.PUBLIC(doodad.PRE_EXTEND(doodad.TYPE(doodad.INSTANCE(doodad.JS_METHOD(
					function toString() {
						if (types.isClass(this)) {
							return '[class ' + types.getTypeName(this) + ']';
						} else {
							return '[object ' + types.getTypeName(this) + ']';
						};
					})))))),



				$extend: root.DD_DOC(
					//! REPLACE_BY("null")
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
					, doodad.PUBLIC(doodad.TYPE(doodad.JS_METHOD( __Internal__.$extend )))),
				
				getAttribute: root.DD_DOC(
					//! REPLACE_BY("null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								attr: {
									type: 'string',
									optional: false,
									description: "Attribute name.",
								},
							},
							returns: 'any',
							description: "Returns the value of an attribute.",
					}
					//! END_REPLACE()
					, doodad.PROTECTED(doodad.READ_ONLY(doodad.TYPE(doodad.INSTANCE(doodad.JS_METHOD(
					function getAttribute(attr) {
						if (root.DD_ASSERT) {
							root.DD_ASSERT(types.isString(attr), "Invalid attribute name.");
						};
						var storage = (types.isType(this) ? this.$__ATTRIBUTES_STORAGE : this.__ATTRIBUTES_STORAGE);
						if (types.hasKey(storage, attr)) {
							return storage[attr];
						} else {
							return this[attr];
						};
					})))))),
				
				getAttributes: root.DD_DOC(
					//! REPLACE_BY("null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								attrs: {
									type: 'arrayof(string),string',
									optional: false,
									description: "Attribute name(s).",
								},
							},
							returns: 'objectof(any)',
							description: "Returns the values of one or more attribute(s).",
					}
					//! END_REPLACE()
					, doodad.PROTECTED(doodad.READ_ONLY(doodad.TYPE(doodad.INSTANCE(doodad.JS_METHOD(
					function getAttributes(attrs) {
						if (root.DD_ASSERT) {
							root.DD_ASSERT(types.isArray(attrs), "Invalid attributes list.");
						};
						var storage = (types.isType(this) ? this.$__ATTRIBUTES_STORAGE : this.__ATTRIBUTES_STORAGE),
							attrsLen = attrs.length,
							result = {};
						for (var i = 0; i < attrsLen; i++) {
							var attr = attrs[i];
							if (types.hasKey(storage, attr)) {
								result[attr] = storage[attr];
							} else {
								result[attr] = this[attr];
							};
						};
						return result;
					})))))),
				
				setAttribute: root.DD_DOC(
					//! REPLACE_BY("null")
					{
							author: "Claude Petit",
							revision: 1,
							params: {
								attr: {
									type: 'string',
									optional: false,
									description: "Attribute name.",
								},
								value: {
									type: 'any',
									optional: false,
									description: "Attribute value.",
								},
								options: {
									type: 'object',
									optional: true,
									description: "Default property options.",
								},
							},
							returns: 'any',
							description: "Sets the value of an attribute.",
					}
					//! END_REPLACE()
					, doodad.PROTECTED(doodad.READ_ONLY(doodad.TYPE(doodad.INSTANCE(doodad.JS_METHOD(
					function setAttribute(attr, value, /*optional*/options) {
						if (root.DD_ASSERT) {
							root.DD_ASSERT(types.isString(attr), "Invalid attribute name.");
						};
						var storage = (types.isType(this) ? this.$__ATTRIBUTES_STORAGE : this.__ATTRIBUTES_STORAGE);
						if (types.hasKey(storage, attr)) {
							storage[attr] = value;
						} else {
							var descriptor = types.getOwnPropertyDescriptor(this, attr);
							if (descriptor && !descriptor.writable && !descriptor.set && descriptor.configurable) {
								descriptor.value = value;
								types.defineProperty(this, attr, descriptor);
							} else if (!descriptor && options && types.hasDefinePropertyEnabled()) {
								descriptor = types.extend({}, options);
								descriptor.value = value;
								types.defineProperty(this, attr, descriptor);
							} else {
								this[attr] = value;
							};
						};
						return value;
					})))))),

				setAttributes: root.DD_DOC(
					//! REPLACE_BY("null")
					{
							author: "Claude Petit",
							revision: 1,
							params: {
								values: {
									type: 'objectof(any)',
									optional: false,
									description: "Attribute values with their name.",
								},
								options: {
									type: 'object',
									optional: true,
									description: "Default property options.",
								},
							},
							returns: 'objectof(any)',
							description: "Sets the value of one or more attribute(s).",
					}
					//! END_REPLACE()
					, doodad.PROTECTED(doodad.READ_ONLY(doodad.TYPE(doodad.INSTANCE(doodad.JS_METHOD(
					function setAttributes(values, /*optional*/options) {
						if (root.DD_ASSERT) {
							root.DD_ASSERT(types.isJsObject(values), "Invalid attributes object.");
						};
						var storage = (types.isType(this) ? this.$__ATTRIBUTES_STORAGE : this.__ATTRIBUTES_STORAGE),
							keys = types.keys(values),
							keysLen = keys.length;
						for (var i = 0; i < keysLen; i++) {
							var key = keys[i];
							this.setAttribute(key, values[key], options);
						};
						return values;
					})))))),
				
				getInterface: root.DD_DOC(
					//! REPLACE_BY("null")
					{
							author: "Claude Petit",
							revision: 0,
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
					, doodad.PUBLIC(doodad.TYPE(doodad.INSTANCE(doodad.JS_METHOD(
					function getInterface(type) {
						var cls = types.getType(this);
						if (!cls) {
							return null;
						};
						if (!types.isInterface(type) && !types.isMixIn(type)) {
							return null;
						};
						var _isolated = cls.$ISOLATED;
						if (!_isolated.has(type)) {
							return null;
						};
						_isolated = _isolated.get(type);
						type = _isolated[6];
						if (!type) {
							type = _isolated[6] = doodad.Interface.$inherit(
								/*typeProto*/
								_isolated[0],
								
								/*instanceProto*/
								_isolated[1],
								
								/*constructor*/
								__Internal__.makeInsideForNew(),
								
								/*constructorContext*/
								__Internal__
							);

							var typeProto = types.getPrototypeOf(type);
							var instanceProto = type.prototype;
							var attributes = _isolated[2];
							var typeStorage = _isolated[4];
							var instanceStorage = _isolated[5];

							__Internal__.setAttributes(attributes, typeProto, instanceProto, typeStorage, instanceStorage);

							__Internal__.initializeAttributes(type, attributes, typeStorage, instanceStorage, true);

							types.INIT(type, [cls]);
						};
						if (!types.baseof(doodad.Interface, type)) {
							return null;
						};
						if (types.isType(this)) {
							return type;
						};
						var cache = this.__ISOLATED_CACHE;
						if (cache.has(type)) {
							_isolated = cache.get(type);
						} else {
							_isolated = new type(this);
							cache.set(type, _isolated);
						};
						return _isolated;
					}))))),
				
				getPreserved: root.DD_DOC(
					//! REPLACE_BY("null")
					{
							author: "Claude Petit",
							revision: 0,
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
						root.DD_ASSERT && root.DD_ASSERT(types.isString(attr), "Invalid attribute name.");
						
						var cls = types.getType(this),
							attributes = cls.$__ATTRIBUTES,
							attribute = attributes[attr],
							extender = attribute.EXTENDER;
						if (extender && extender.isPreserved) {
							var preservedAttr = '__' + attr + '_preserved__';
							return this[preservedAttr];
						};
					}))))),
				
				restorePreserved: root.DD_DOC(
					//! REPLACE_BY("null")
					{
							author: "Claude Petit",
							revision: 0,
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
						root.DD_ASSERT && root.DD_ASSERT(types.isString(attr), "Invalid attribute name.");
						
						var cls = types.getType(this),
							attributes = cls.$__ATTRIBUTES,
							attribute = attributes[attr],
							extender = attribute.EXTENDER,
							forType = types.isType(this);
						if (extender && extender.isPreserved) {
							extender.remove && extender.remove(attr, this, forType);
							var preservedAttr = '__' + attr + '_preserved__',
								typeStorage = cls.$__ATTRIBUTES_STORAGE,
								instanceStorage = this.__ATTRIBUTES_STORAGE;
							if (extender.clone) {
								extender.clone(preservedAttr, attr, this, attributes, typeStorage, instanceStorage, forType, storage[preservedAttr], {isPreserved: true});
							} else {
								types.invoke(obj, 'setAttribute', [attr, storage[preservedAttr]]);
							};
							return true;
						};
						return false;
					}))))),

				overrideSuper: root.DD_DOC(
					//! REPLACE_BY("null")
					{
							author: "Claude Petit",
							revision: 0,
							params: null,
							returns: 'undefined',
							description: "Prevents the need to call '_super'. Use when '_super' is conditionally called.",
					}
					//! END_REPLACE()
					, doodad.PROTECTED(doodad.TYPE(doodad.INSTANCE(doodad.JS_METHOD(
					function overrideSuper() {
						if (this._super) {
							this._super.CALLED = true;
						};
					}))))),
			
				_implements: root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 1,
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
						var impls = types.getType(this).$IMPLEMENTS;
						for (var i = 0; i < clsLen; i++) {
							var cl = cls[i];
							if (types.isObject(cl)) {
								cl = cl.constructor;
							};
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
			};
			
			root.DD_DOC(
				//! REPLACE_BY("null")
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

			root.DD_DOC(
				//! REPLACE_BY("null")
				{
						author: "Claude Petit",
						revision: 0,
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
				, doodad.REGISTER(doodad.BASE(doodad.Class.$extend(
				{
					$TYPE_NAME: "Interface",
					
					__host: doodad.PROTECTED(doodad.READ_ONLY(doodad.TYPE(doodad.INSTANCE(null)))),
					
					_new: doodad.SUPER(function _new(host) {
						root.DD_ASSERT && root.DD_ASSERT((types.isClass(this) && types.isClass(host)) || (types.isObject(this) && types._instanceof(host, doodad.Class)), "Invalid host.");
						
						this._super();
						
						this.setAttribute('__host', host);
						
						return this;
					}),
				}))));
			
			//==================================
			// Interfaces
			//==================================
			
			root.DD_DOC(
				//! REPLACE_BY("null")
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
						//! REPLACE_BY("null")
						{
								author: "Claude Petit",
								revision: 0,
								params: null,
								returns: 'Object',
								description: "Returns a clone of the object.",
						}
						//! END_REPLACE()
						, doodad.PUBLIC(doodad.RETURNS(function clone(val) {return types.is(val, this);}))),  // function()
				}))));
			
			root.DD_DOC(
				//! REPLACE_BY("null")
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
						//! REPLACE_BY("null")
						{
								author: "Claude Petit",
								revision: 0,
								params: null,
								returns: 'object',
								description: "Serializes the object and returns the result.",
						}
						//! END_REPLACE()
						, doodad.PUBLIC(doodad.RETURNS(function(val) {return types.isJsObject(val)}))), // function()
							
					$unserialize: root.DD_DOC(
						//! REPLACE_BY("null")
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
				//! REPLACE_BY("null")
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
						//! REPLACE_BY("null")
						{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'object',
										optional: true,
										description: "Object linked with the callback function.",
									},
									fn: {
										type: 'function',
										optional: false,
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
						, doodad.PROTECTED(doodad.TYPE(doodad.INSTANCE(doodad.METHOD(function detachEvents(obj, fn, /*optional*/datas) {
							var events = this.__EVENTS,
								eventsLen = events.length;
							for (var i = 0; i < eventsLen; i++) {
								this[events[i]].detach(obj, fn, datas);
							};
						}))))),
					
					clearEvents: root.DD_DOC(
						//! REPLACE_BY("null")
						{
								author: "Claude Petit",
								revision: 0,
								params: null,
								returns: 'undefined',
								description: "Detaches every callback functions from every events.",
						}
						//! END_REPLACE()
						, doodad.PROTECTED(doodad.TYPE(doodad.INSTANCE(doodad.METHOD(function clearEvents() {
							var events = this.__EVENTS,
								eventsLen = events.length;
							for (var i = 0; i < eventsLen; i++) {
								this[events[i]].clear();
							};
						}))))),
				}))));
			
			root.DD_DOC(
				//! REPLACE_BY("null")
				{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'Class',
						description: "Implements a creatable object.",
				}
				//! END_REPLACE()
				, mixIns.REGISTER(doodad.MIX_IN(doodad.Class.$extend({
					$TYPE_NAME: 'Creatable',

					__destroyed: doodad.PROTECTED(doodad.READ_ONLY(doodad.PERSISTENT(doodad.TYPE(doodad.INSTANCE(false))))),
					
					isDestroyed: doodad.PUBLIC(doodad.TYPE(doodad.INSTANCE(doodad.CAN_BE_DESTROYED(doodad.CALL_FIRST(function() {
						return this.__destroyed;
					}))))),

					
					$create: root.DD_DOC(
						//! REPLACE_BY("null")
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
						, doodad.PUBLIC(doodad.METHOD())), // function(/*paramarray*/)
					
					$destroy: root.DD_DOC(
						//! REPLACE_BY("null")
						{
								author: "Claude Petit",
								revision: 0,
								params: null,
								returns: 'undefined',
								description: "Destroys the class.",
						}
						//! END_REPLACE()
						, doodad.PUBLIC(doodad.EXTERNAL(doodad.CALL_FIRST(
						function $destroy() {
							if (!this.__destroyed) {
								this._super();

								this._delete();
						
								types.invoke(this, 'setAttribute', ['__destroyed', true]);
							};
						})))),

					
					$createInstance: root.DD_DOC(
						//! REPLACE_BY("null")
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
							return types._new(this, arguments);
						}))),


					create: root.DD_DOC(
						//! REPLACE_BY("null")
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
						, doodad.PUBLIC(doodad.METHOD())), // function(/*paramarray*/)
					
					fastDestroy: root.DD_DOC(
						//! REPLACE_BY("null")
						{
								author: "Claude Petit",
								revision: 0,
								params: null,
								returns: 'undefined',
								description: "Rapidly destroys the class object instance.",
						}
						//! END_REPLACE()
						, doodad.PUBLIC(doodad.EXTERNAL(doodad.CALL_FIRST(
						function fastDestroy() {
							if (!this.__destroyed) {
								this._super();
						
								types.invoke(this, 'setAttribute', ['__destroyed', true]);
							};
						})))),
					
					destroy: root.DD_DOC(
						//! REPLACE_BY("null")
						{
								author: "Claude Petit",
								revision: 0,
								params: null,
								returns: 'undefined',
								description: "Fully destroys the class object instance.",
						}
						//! END_REPLACE()
						, doodad.PUBLIC(doodad.EXTERNAL(doodad.CALL_FIRST(
						function destroy() {
							if (!this.__destroyed) {
								this._super();
						
								this._delete();
								
								types.invoke(this, 'setAttribute', ['__destroyed', true]);
							};
						})))),

				}))));
			
			root.DD_DOC(
				//! REPLACE_BY("null")
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
				
					$__translations: doodad.PROTECTED(doodad.ATTRIBUTE({}, extenders.ExtendObject, {maxDepth: 5, cloneOnInit: true})),
				
					$getTranslation: root.DD_DOC(
						//! REPLACE_BY("null")
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
								root.DD_ASSERT && root.DD_ASSERT(types.isJsObject(translations) && types.hasKey(translations, n), "Translation '~0~' for '~1~' doesn't exist.", [name, types.getTypeName(this)]);
								translations = translations[n];
							};
							
							return translations;
						})),
						
					$setTranslation: root.DD_DOC(
						//! REPLACE_BY("null")
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
								types.depthExtend(this.$__ATTRIBUTES.$__translations.EXTENDER.maxDepth, this.$__translations, value);
								
							} else if (types.isStringAndNotEmpty(name)) {
								var translations = this.$__translations,
									names = name.split('.'),
									namesLen = names.length,
									n;
									
								for (var i = 0; translations && (i < namesLen - 1); i++) {
									n = names[i];
									root.DD_ASSERT && root.DD_ASSERT(types.isJsObject(translations) && types.hasKey(translations, n), "Translation '~0~' for '~1~' doesn't exist.", [name, types.getTypeName(this)]);
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
				//! REPLACE_BY("null")
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
				
					$__config: doodad.PROTECTED(doodad.ATTRIBUTE({}, extenders.ExtendObject, {maxDepth: 5, cloneOnInit: true})),
				
					$getConfig: root.DD_DOC(
						//! REPLACE_BY("null")
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
								root.DD_ASSERT && root.DD_ASSERT(types.isJsObject(config) && types.hasKey(config, n), "Configuration '~0~' for '~1~' doesn't exist.", [name, types.getTypeName(this)]);
								config = config[n];
							};
							
							return config;
						})),
						
					$setConfig: root.DD_DOC(
						//! REPLACE_BY("null")
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
								types.depthExtend(this.$__ATTRIBUTES.$__config.EXTENDER.maxDepth, this.$__config, value);
								
							} else if (types.isStringAndNotEmpty(name)) {
								var config = this.$__config,
									names = name.split('.'),
									namesLen = names.length,
									n;
								
								for (var i = 0; config && (i < namesLen - 1); i++) {
									n = names[i];
									root.DD_ASSERT && root.DD_ASSERT(types.isJsObject(config) && types.hasKey(config, n), "Configuration '~0~' for '~1~' doesn't exist.", [name, types.getTypeName(this)]);
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
				//! REPLACE_BY("null")
				{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'Object',
						description: "Main class of every Doodad objects.",
				}
				//! END_REPLACE()
				, doodad.REGISTER(doodad.Class.$extend(
						mixIns.Creatable,
				{
					$TYPE_NAME: "Object",
				})));
			
			//==================================
			// Events classes
			//==================================
			
			doodad.Event = root.DD_DOC(
				//! REPLACE_BY("null")
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
						returns: 'Object',
						description: "Event object.",
				}
				//! END_REPLACE()
				, types.Type.$inherit(
				/*typeProto*/
				{
					$TYPE_NAME: "Event",
				},
				/*instanceProto*/
				{
					data: null,
					
					// dynamic
					obj: null,
					name: null,
					handlerData: null,

					prevent: false,
					
					_new: types.SUPER(function(/*optional*/data) {
						//root.DD_ASSERT && root.DD_ASSERT(types.isNothing(data) || types.isObject(data), "Invalid data.");

						this._super();
						
						this.data = data;
					}),
					
					preventDefault: root.DD_DOC(
						//! REPLACE_BY("null")
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
				}));

			doodad.CancelEvent = root.DD_DOC(
				//! REPLACE_BY("null")
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
						returns: 'Object',
						description: "Canceled event object.",
				}
				//! END_REPLACE()
				, doodad.Event.$inherit(
				/*typeProto*/
				{
					$TYPE_NAME: 'CancelEvent',
				}));

			doodad.ErrorEvent = root.DD_DOC(
				//! REPLACE_BY("null")
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
						returns: 'Object',
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
					error: doodad.PUBLIC(doodad.READ_ONLY(null)),
					
					_new: types.SUPER(function _new(/*optional*/error, /*optional*/data) {
						root.DD_ASSERT && root.DD_ASSERT(types.isNothing(error) || types.isError(error), "Invalid error.");

						this._super(data);

						this.error = error;
					}),
				}));

			//==================================
			// Callbacks objects
			//==================================

			doodad.Callback = root.DD_DOC(
				//! REPLACE_BY("null")
				{
						author: "Claude Petit",
						revision: 1,
						params: {
							obj: {
								type: 'object,Object',
								optional: true,
								description: "Object to bind with the callback function.",
							},
							fn: {
								type: 'function',
								optional: false,
								description: "Callback function.",
							},
						},
						returns: 'function',
						description: "Creates a callback handler.",
				}
				//! END_REPLACE()
				, types.setPrototypeOf(function(/*optional*/obj, fn) {
					var attr;
					if (types.isString(fn)) {
						attr = fn;
						fn = obj[attr];
					};
					var isCreatable = types._implements(obj, mixIns.Creatable);
					fn = types.makeInside(obj, fn);
					var callback = function callbackHandler(/*paramarray*/) {
						try {
							if (!obj || !isCreatable || !obj.isDestroyed()) {
								return fn.apply(obj, arguments);
							};
						} catch(ex) {
							if (ex instanceof types.ScriptAbortedError) {
								throw ex;
							} else {
								doodad.trapException(obj, attr, ex);
							};
						};
					};
					callback = types.setPrototypeOf(callback, doodad.Callback);
					return callback;
				}, types.Callback));
			
			//==================================
			// Serializable objects
			//==================================

			root.DD_DOC(
				//! REPLACE_BY("null")
				{
						author: "Claude Petit",
						revision: 1,
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
					
					$ERROR_IGNORED_ATTRIBUTES: doodad.PROTECTED(doodad.TYPE([
						'throwLevel', 'fileName', 'sourceURL', 'line', 'lineNumber', 'columnNumber', 'functionName', 
						'stack', 'parsedStack', 'parsed', 'trapped', 'description',
					])),
					
					__value: doodad.PROTECTED(doodad.READ_ONLY(null)),
					
					create: doodad.OVERRIDE(function create(value) {
						if (root.DD_ASSERT) {
							root.DD_ASSERT(types.isSerializable(value), "Invalid value");
							if (types._implements(value, interfaces.Serializable)) {
								root.DD_ASSERT(namespaces.getNamespace(value.DD_FULL_NAME) === types.getType(value), "Value is not of a registered type.");
							};
						};
						this.setAttribute('__value', value);
					}),
					
					$pack: doodad.PUBLIC(doodad.TYPE(doodad.JS_METHOD(function pack(value) {
						var data,
							type = types._typeof(value);
						if (type === 'undefined') {
							value = undefined;
						} else if (type === 'infinite') {
							if (value < 0) {
								value = -1;
							} else {
								value = 1;
							};
							data = {
								type: type,
								value: value,
							};
						} else if (type === 'integer') {
							data = value;
						} else if (type === 'float') {
							data = value;
						} else if (type === 'boolean') {
							data = value;
						} else if (type === 'string') {
							data = value;
						} else if (type === 'date') {
							value = value.valueOf();
							data = {
								type: type,
								value: value,
							};
						} else if (type === 'nan') {
							value = undefined;
							data = {
								type: type,
								value: value,
							};
						} else if (type === 'error') {
							types.Error.prototype.parse.call(value);
							var tmp = {
									name: this.$pack(value.name),
									message: this.$pack(value.message || value.description),
								},
								self = this;
							value = tools.forEach(value, function(value, key) {
								if (self.$ERROR_IGNORED_ATTRIBUTES.indexOf(key) < 0) {
									tmp[key] = self.$pack(value);
								};
							});
							value = tmp;
							data = {
								type: type,
								value: value,
							};
						} else if (type === 'array') {
							value = tools.map(value, this.$pack);
							data = value;
						} else if (type === 'object') {
							value = tools.map(value, this.$pack);
							data = {
								type: type,
								value: value,
							};
						} else if (type[0] === '{') {
							value = value.serialize();
							value = this.$pack(value);
							data = {
								type: type,
								value: value,
							};
						} else {
							throw new types.TypeError("Value can't be packed.");
						};
						return data;
					}))),
					
					$unpack: doodad.PUBLIC(doodad.TYPE(doodad.JS_METHOD(function pack(data) {
						if (types.isObject(data)) {
							var type = data.type,
								value = data.value;
							if (type === 'undefined') {
								value = undefined;
							} else if (type === 'infinite') {
								value = parseInt(value) || 0;
								if (value < 0) {
									value = -Infinite;
								} else {
									value = Infinite;
								};
							} else if (type === 'date') {
								if (!types.isNothing(value)) {
									value = new Date(parseInt(value));
								};
							} else if (type === 'nan') {
								value = NaN;
							} else if (type === 'error') {
								var tmp = new types.Error(value.message),
									self = this;
								value = tools.forEach(value, function(value, key) {
									if (self.$ERROR_IGNORED_ATTRIBUTES.indexOf(key) < 0) {
										tmp[key] = self.$unpack(value);
									};
								});
								value = tmp;
							} else if (type === 'object') {
								value = tools.map(value, this.$unpack);
							} else if (type[0] === '{') {
								var clsName = type.slice(1, -1),
									cls = namespaces.getNamespace(clsName);
								if (!types._implements(cls, interfaces.Serializable)) {
									throw new types.TypeError("Object of type '~0~' can't be unserialized.", [clsName]);
								};
								value = this.$unpack(value);
								value = cls.$unserialize(value);
							} else {
								throw new types.TypeError("Invalid packet.");
							};
						} else if (types.isArray(data)) {
							value = tools.map(data, this.$unpack);
						} else {
							value = data;
						};
						return value;
					}))),
					
					serialize: doodad.OVERRIDE(function serialize() {
						return types.getType(this).$pack(this.__value);
					}),
					
					$unserialize: doodad.OVERRIDE(function $unserialize(data) {
						return new this(types.getType(this).$unpack(data));
					}),
					
					valueOf: function valueOf() {
						return this.__value;
					},
				})));
		},
		
	};
})();