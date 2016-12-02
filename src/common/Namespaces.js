//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2016 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Namespace.js - Namespaces management
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

module.exports = {
	add: function add(DD_MODULES) {
		DD_MODULES = (DD_MODULES || {});
		DD_MODULES['Doodad.Namespaces'] = {
			version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
			namespaces: ['Entries'],
			dependencies: [
				'Doodad.Types', 
				'Doodad.Tools',
			],
			bootstrap: true,

			create: function(root, /*optional*/_options, _shared) {
				"use strict";

				//===================================
				// Get namespaces
				//===================================
					
				var doodad = root.Doodad,
					types = doodad.Types,
					tools = doodad.Tools,
					namespaces = doodad.Namespaces,
					entries = namespaces.Entries,
					nodejs = tools.NodeJs;
					
				//===================================
				// Internals
				//===================================
				// <FUTURE> Thread context
				var __Internal__ = {
					waitCounter: 0,
					waiting: false,
				};

				//===================================
				// Shared
				//===================================

				types.complete(_shared.Natives, {
					symbolIterator: (types.isNativeFunction(global.Symbol) && (typeof global.Symbol.iterator === 'symbol') ? global.Symbol.iterator : undefined),
				});

				//===================================
				// Utilities
				//===================================
				
				__Internal__.incrementWait = function incrementWait() {
					__Internal__.waiting = true;
					if (__Internal__.waitCounter < 0) {
						__Internal__.waitCounter = 0;
					};
					__Internal__.waitCounter++;
				};
				
				__Internal__.decrementWait = function decrementWait() {
					__Internal__.waitCounter--;
					if (__Internal__.waitCounter <= 0) {
						__Internal__.waiting = false;
						__Internal__.waitCounter = 0;
					};
				};

				namespaces.ADD('VersionIdentifiers', types.freezeObject(types.nullObject({
					development: -4, dev: -4, d: -4, 
					alpha: -3, a: -3, 
					beta: -2, b: -2, 
					stable: -1, s: -1, 
					release: 0, r: 0, 
					production: 1, prod: 1, p: 1, 
					established: 2, e: 2,
				})));
				
				if (_shared.Natives.symbolIterator) {
					namespaces.ADD(_shared.Natives.symbolIterator, root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
							{
									author: "Claude Petit",
									revision: 1,
									params: null,
									returns: 'RegistryIterator',
									description: "Returns an iterator of the registry namespaces.",
							}
							//! END_REPLACE()
					, function symbolIterator() {
						return __Internal__.DD_REGISTRY.iter();
					}));
				};

				namespaces.ADD('iter', root.DD_DOC(
						//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
								author: "Claude Petit",
								revision: 1,
								params: {
									type: {
										type: 'entries.Object',
										optional: true,
										description: "Entry type.",
									},
								},
								returns: 'RegistryIterator',
								description: "Returns an iterator of the registry namespaces.",
						}
						//! END_REPLACE()
				, function iter(/*optional*/type, /*optional*/exact) {
					return __Internal__.DD_REGISTRY.iter(type, exact);
				}));

				namespaces.ADD('get', root.DD_DOC(
						//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
								author: "Claude Petit",
								revision: 1,
								params: {
									name: {
										type: 'string',
										optional: false,
										description: "Full namespace.",
									},
									type: {
										type: 'entries.Object',
										optional: true,
										description: "Entry type.",
									},
								},
								returns: 'Namespace',
								description: "Returns the namespace object of the specified namespace from the registry, accroding to the specified entry type if present.",
						}
						//! END_REPLACE()
				, function get(name, /*optional*/type) {
					var entry = __Internal__.DD_REGISTRY.get(name, type);
					if (!entry || !entry.objectInitialized) {
						return null;
					};
					return entry.namespace;
				}));

				namespaces.ADD('add', root.DD_DOC(
						//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
								author: "Claude Petit",
								revision: 0,
								params: {
									name: {
										type: 'string',
										optional: false,
										description: "Full namespace.",
									},
									entry: {
										type: 'entries.Object',
										optional: false,
										description: "Entry type.",
									},
								},
								returns: 'bool',
								description: "Adds a namespace entry to the registry. Returns 'true' on success, otherwise returns 'false'.",
						}
						//! END_REPLACE()
				, function add(name, entry, /*optinal*/options) {
					return __Internal__.DD_REGISTRY.add(name, entry, options);
				}));

				namespaces.ADD('remove', root.DD_DOC(
						//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
								author: "Claude Petit",
								revision: 0,
								params: {
									name: {
										type: 'string',
										optional: false,
										description: "Full namespace.",
									},
									type: {
										type: 'entries.Object',
										optional: true,
										description: "Entry type to be retrieved.",
									},
								},
								returns: 'bool',
								description: "Removes a namespace entry from the registry. Returns 'true' on success, otherwise returns 'false'.",
						}
						//! END_REPLACE()
				, function remove(name, /*optional*/type, /*optional*/options) {
					return __Internal__.DD_REGISTRY.remove(name, type, options);
				}));

				__Internal__.createNamespace = root.DD_DOC(
						//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
								author: "Claude Petit",
								revision: 5,
								params: {
									spec: {
										type: 'object,string',
										optional: false,
										description: "Specifications of the namespace to create, or just its name.",
									},
									options: {
										type: 'object',
										optional: true,
										description: "Options.",
									},
									ignoreOptionals: {
										type: 'boolean',
										optional: true,
										description: "When 'true', optional modules are ignored. Default is 'false'.",
									},
								},
								returns: 'Promise(object),Promise(NamespaceEntry)',
								description: "Creates a new namespace object and returns its entry from the registry. When there is a missing dependency, aborts and returns this dependency instead.",
						}
						//! END_REPLACE()
				, function createNamespace(spec, /*optional*/options, /*optional*/ignoreOptionals) {
					var Promise = types.getPromise();
					
					if (types.isString(spec)) {
						spec = {
							name: spec,
						};
					};
					
					function checkDependencies(spec) {
						var baseName = spec.name.split('/', 2)[0],
							deps = spec.dependencies;
						if (spec.name !== baseName) {
							if (!deps) {
								spec.dependencies = deps = [];
							};
							if (tools.indexOf(deps, baseName) < 0) {
								deps.push(baseName);
							};
						};
						if (deps) {
							for (var i = 0; i < deps.length; i++) {
								if (i in deps) {
									var dep = deps[i],
										optional = false,
										version = null;
									if (!types.isString(dep)) {
										optional = types.toBoolean(dep.optional);
										version = dep.version;
										dep = dep.name;
									};
									var depEntry = __Internal__.DD_REGISTRY.get(dep);
									if (version && depEntry && depEntry.version) {
										if (tools.Version.compare(depEntry.version, tools.Version.parse(version, namespaces.VersionIdentifiers)) > 0) {
											// Higher version expected
											depEntry = null;
										};
									};
									if (!depEntry || !depEntry.objectCreated) {
										if (!optional || !ignoreOptionals) {
											var result = {
												spec: spec,
												missingDep: dep, 
												depOptional: optional,
												depVersion: version,
											};
											return Promise.resolve(result);
										};
									};
								};
							};
						};
					};
					
					function createParents(shortNames, fullName, parent) {
						for (var i = 0; i < shortNames.length - 1; i++) {
							var shortName = shortNames[i];
							fullName += ('.' + shortName);
							
							var fName = fullName.slice(1);
							
							var namespace = parent[shortName];
							if (!namespace) {
								var newSpec = {
									name: fName,
								};
								namespace = new types.Namespace(parent, shortName, fName);
								var entry = new entries.Namespace(root, newSpec, namespace);
								__Internal__.DD_REGISTRY.add(fName, entry, {secret: _shared.SECRET});
							};
							
							parent = namespace;
						};
						
						return parent;
					};

					function createMain(shortNames, spec, parent) {
						var entryType = spec.type;
						if (entryType) {
							var val;
							if (types.isString(entryType)) {
								val = types.get(entries, entryType);
							} else {
								val = entryType;
							};
							if (val && (val === entries.Object) || types.baseof(entries.Object, val)) {
								entryType = val;
							} else {
								throw new types.Error("Invalid registry entry type : '~0~'.", [types.toString(entryType).slice(0, 50)]);
							};
						} else {
							entryType = entries.Module;
						};

						var entry = __Internal__.DD_REGISTRY.get(spec.name);
						if (entry) {
							if (!types.is(entry, entries.Namespace) || (entryType === entries.Namespace)) {
								return null;
							};
						};
						
						var namespaceType = spec.namespaceType;
						if (namespaceType) {
							var val;
							if (types.isString(namespaceType)) {
								val = namespaces[namespaceType];
							} else {
								val = namespaceType;
							};
							if (val && (val === types.Namespace) || types.baseof(types.Namespace, val)) {
								namespaceType = val;
							} else {
								throw new types.Error("Invalid namespace object type : '~0~'.", [types.toString(namespaceType).slice(0, 50)]);
							};
						} else {
							namespaceType = types.Namespace;
						};
						
						var namespace = spec.object;
						if (namespace) {
							if (!types.isLike(namespace, namespaceType)) {
								throw new types.Error("Invalid namespace object.");
							};
						};
						
						var replaceEntry = false,
							curEntryType = types.getType(entry);
						if (curEntryType && (entryType !== curEntryType) && (entryType !== entries.Namespace)) {
							replaceEntry = true;
						};
						
						var shortName = shortNames[shortNames.length - 1];
						var prevNamespace = null;
						if (types.has(parent, shortName)) {
							prevNamespace = parent[shortName];
							if ((!replaceEntry && (namespace instanceof types.Namespace)) || !spec.replaceObject) {
								namespace = prevNamespace;
								prevNamespace = null;
							};
						};
						
						if (entry && replaceEntry) {
							__Internal__.DD_REGISTRY.remove(spec.name, null, {secret: _shared.SECRET});
							entry = null;
						};
						
						var proto;
						if (prevNamespace && (!prevNamespace instanceof namespaceType)) {
							var proto = {};
							var keys = types.append(types.keys(prevNamespace), types.symbols(prevNamespace));
							for (var i = 0; i < keys.length; i++) {
								var key = keys[i];
								var val = prevNamespace[key];
								if (!(val instanceof types.AttributeBox)) {
									// Sets everything to READ_ONLY by default
									val = types.READ_ONLY(types.ENUMERABLE(val));
								};
								proto[key] = val;
							};
							namespaceType = types.INIT(namespaceType.$inherit(
								/*typeProto*/
								{
									$TYPE_NAME: types.getTypeName(namespaceType),
								},
								/*instanceProto*/
								proto
							));
						};
						
						proto = spec.proto;
						if (proto) {
							// Extend namespace object
							if (types.isFunction(proto)) {
								proto = proto(root);
							};
							if (proto) {
								if (!types.isArray(proto)) {
									proto = [/*typeProto*/{$TYPE_NAME: types.getTypeName(namespaceType)}, /*instanceProto*/proto];
								};
								namespaceType = types.INIT(namespaceType.$inherit.apply(namespaceType, proto));
							};
						};

						if (!namespace) {
							namespace = new namespaceType(parent, shortName, spec.name);
						};
						
						if (!entry) {
							var protect = types.get(spec, 'protect', true);
							entry = new entryType(root, spec, namespace, {protect: protect});
							__Internal__.DD_REGISTRY.add(spec.name, entry, {secret: _shared.SECRET});
						};
						
						return entry;
					};
					
					function create(spec, parentName, parent) {
						var baseName = spec.name.split('/', 2)[0];
						var shortNames = baseName.split('.');
						var parent = createParents(shortNames, parentName, parent);
						var entry = createMain(shortNames, spec, parent);
						return Promise.resolve(entry);
					};
					
					function createNamespaces(entry) {
						if (entry) {
							var specNamespaces = entry.spec.namespaces;
							if (specNamespaces) {
								var baseName = entry.spec.name.split('/', 2)[0];
								for (var i = 0; i < specNamespaces.length; i++) {
									if (i in specNamespaces) {
										var name = specNamespaces[i],
											shortNames = name.split('.');
										var parent = createParents(shortNames, baseName, entry.namespace);
										var	newSpec = {
												name: baseName + '.' + name,
												type: entries.Namespace,
												namespaceType: types.Namespace,
											};
										createMain(shortNames, newSpec, parent);
									};
								};
							};
						};
						return entry;
					};

					function createObject(entry) {
						if (entry) {
							var baseName = entry.spec.name.split('/', 2)[0];
							var opts = ((entry instanceof entries.Package) ? options : types.get(options, baseName));
							if (!entry.spec.bootstrap && !entry.objectCreated && !entry.objectCreating) {
								var retval = null;
								entry.objectCreating = true;
								if (entry.spec.create) {
									retval = entry.spec.create(root, opts, _shared);
								};
								if (types.isNothing(retval)) {
									entry.objectCreating = false;
									entry.objectCreated = true;
								} else if (types.isPromise(retval)) {
									__Internal__.incrementWait();
									return retval
										.nodeify(function(err, result) {
											__Internal__.decrementWait();
											if (err) {
												throw err;
											} else {
												entry.objectCreating = false;
												entry.objectCreated = true;
												if (!types.isNothing(result)) {
													if (types.isFunction(result)) {
														entry.objectInit = result;
													} else {
														throw new types.Error("'create' of '~0~' has returned an invalid value.", [entry.spec.name]);
													};
												};
												return entry;
											};
										});
								} else if (types.isFunction(retval)) {
									entry.objectCreating = false;
									entry.objectCreated = true;
									entry.objectInit = retval;
								} else {
									throw new types.Error("'create' of '~0~' has returned an invalid value.", [entry.spec.name]);
								};
							};
						};
						return entry;
					};
					
					function terminate(entry) {
						if (entry) {
							namespaces.dispatchEvent(new types.CustomEvent('create', 
								{
									detail: {
										entry: entry,
										options: options,
									},
								}
							));
							
							tools.log(tools.LogLevels.Debug, "Entry '~0~' created.", [entry.spec.name]);
						};
						return entry;
					};
					
					
					
					var retval = checkDependencies(spec);
					if (retval) {
						return retval;
					};
					
					return create(spec, '', root)
						.then(createNamespaces)
						.then(createObject)
						.then(terminate);
				});
				
				__Internal__.initNamespace = root.DD_DOC(
						//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
								author: "Claude Petit",
								revision: 3,
								params: {
									entry: {
										type: 'NamespaceEntry',
										optional: false,
										description: "Namespace entry object.",
									},
									options: {
										type: 'object',
										optional: true,
										description: "Options.",
									},
								},
								returns: 'Promise(NamespaceEntry)',
								description: "Initializes a namespace and its dependencies.",
						}
						//! END_REPLACE()
				, function initNamespace(entry, /*optional*/options) {
					var Promise = types.getPromise();
						
					if (entry && !entry.objectInitialized) {
						var promise = Promise.resolve();
						
						var deps = entry.spec.dependencies;
						if (deps) {
							var depsLen = deps.length;
							for (var i = 0; i < depsLen; i++) {
								if (i in deps) {
									var dep = deps[i];
									if (!types.isString(dep)) {
										dep = dep.name;
									};
									
									var depEntry = __Internal__.DD_REGISTRY.get(dep);
									if (depEntry) {
										if (!depEntry.objectInitialized && !depEntry.objectInitializing) {
											if (depEntry.spec.autoInit !== false) {
												depEntry.objectInitializing = true;
												promise = promise
													.then(function() {
														return __Internal__.initNamespace(depEntry, options);
													});
											};
										};
									};
								};
							};
						};
						
						var baseName = entry.spec.name.split('/', 2)[0];
						options = types.get(options, baseName);
						
						if (entry.objectInit) {
							if (types.isFunction(entry.objectInit)) {
								var retval = entry.objectInit(options);
								if (types.isPromise(retval)) {
									__Internal__.incrementWait();
									promise = promise
										.then(function() {
											return retval;
										})
										.nodeify(function(err, result) {
											__Internal__.decrementWait();
											if (err) {
												throw err;
											} else {
												return result;
											};
										});
								};
							} else {
								throw new types.Error("'objectInit' of '~0~' has an invalid value.", [entry.spec.name]);
							};
						};
						
						var terminate = function terminate() {
							namespaces.dispatchEvent(new types.CustomEvent('init', 
								{
									detail: {
										entry: entry,
										options: options,
									},
								}
							));
							
							entry.init(options);
							
							tools.log(tools.LogLevels.Debug, "Entry '~0~' initialized.", [entry.spec.name]);
							
							return entry;
						};
						
						return promise
							.then(terminate);
						
					} else {
						return Promise.resolve(entry);
					};
				});
				
				namespaces.ADD('load', root.DD_DOC(
						//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
								author: "Claude Petit",
								revision: 10,
								params: {
									modules: {
										type: 'object',
										optional: false,
										description: "Namespaces specifications.",
									},
									options: {
										type: 'arrayof(object),object',
										optional: true,
										description: "Options.",
									},
									callback: {
										type: 'function',
										optional: true,
										description: "Callback function.",
									},
								},
								returns: 'Promise(bool)',
								description: "Returns 'true' when successful. Returns 'false' otherwise.",
						}
						//! END_REPLACE()
				, function load(modules, /*optional*/options, /*optional*/callback) {
					var Promise = types.getPromise();

					if (types.isArray(options)) {
						options = types.depthExtend.apply(null, types.append([15, {}], options));
					};

					if (types.get(types.get(options, 'startup'), 'secret') !== _shared.SECRET) {
						throw new types.AccessDenied("Secrets mismatch.");
					};

					var dontThrow = types.get(options, 'dontThrow');
					
					return Promise.try(function() {
						var toInit = [];
						
						var terminate = function _terminate(err, result) {
							if (err) {
								debugger;
								// Dispatches "onerror"
								if (!__Internal__.waiting) {
									namespaces.dispatchEvent(new types.CustomEvent('error', {detail: {error: err}}));
								};

								if (dontThrow) {
									return Promise.resolve(root);
								} else {
									return Promise.reject(err);
								};

							} else {
								// Create Promise for callback result
								var cbPromise = null;
								if (callback) {
									cbPromise = Promise.create(function readyPromise(resolve, reject) {
										var cbReadyHandler = function(ev) {
											namespaces.removeEventListener('ready', cbReadyHandler);
											namespaces.removeEventListener('error', cbErrorHandler);
											try {
												resolve(callback(root, _shared));
											} catch(ex) {
												reject(ex);
											};
										};
										var cbErrorHandler = function(ev) {
											namespaces.removeEventListener('ready', cbReadyHandler);
											namespaces.removeEventListener('error', cbErrorHandler);
											reject(ev.detail.error);
										};
										namespaces.addEventListener('ready', cbReadyHandler);
										namespaces.addEventListener('error', cbErrorHandler);
									})
										.then(function() {
											return root;
										})
										['catch'](function(ex) {
											if (dontThrow) {
												return root;
											} else {
												throw ex;
											};
										});
								};
								
								// Dispatches "onready"
								if (!__Internal__.waiting) {
									namespaces.dispatchEvent(new types.CustomEvent('ready'));
								};
								
								// Returns the callback promise or a "done" flag.
								if (cbPromise) {
									// NOTE: Returns the result of "cbPromise". This allows to catch callback errors.
									return cbPromise;
								} else {
									return Promise.resolve(root);
								};
							};
						};

						var names = types.keys(modules);
						
						var loopCreateModules = function loopCreateModules(state) {
							if (names.length) {
								if (state.missings.length >= names.length) {
									var entry = state.missings[0];
									throw new types.Error("Module '~0~' is missing dependency '~1~' version '~2~' or higher.", [entry.spec.name, entry.missingDep, (entry.depVersion || '<unspecified>')]);
								} else if ((state.missings.length + state.optionals.length) >= names.length) {
									state.ignoreOptionals = true;
								};
								var name = names.shift(),
									spec = modules[name];
								spec.name = name;
								return __Internal__.createNamespace(spec, options, state.ignoreOptionals)
									.then(function(entry) {
										if (entry && entry.missingDep) {
											if (entry.depOptional) {
												state.optionals.push(entry);
											} else {
												state.missings.push(entry);
											};
											names.push(name);
										} else {
											state.missings = [];
											state.optionals = [];
											if (entry && (entry.spec.autoInit !== false)) {
												toInit.push(entry);
											};
										};
										return loopCreateModules(state);
									});
							} else {
								return Promise.resolve();
							};
						};

						var loopInitModules = function loopInitModules() {
							if (toInit.length) {
								var promise;
								var entry = toInit.shift(); 
								if (!entry.objectInitialized && !entry.objectInitializing) {
									entry.objectInitializing = true;
									promise = __Internal__.initNamespace(entry, options);
								} else {
									promise = Promise.resolve();
								};

								return promise.then(function() {
									return loopInitModules();
								});
							} else {
								return Promise.resolve();
							};
						};
						
						return loopCreateModules({missings: [], optionals: [], ignoreOptionals: false})
							.then(loopInitModules)
							.nodeify(terminate);
						
					});
						//.catch(tools.catchAndExit);
				}));

				/*
				namespaces.ADD('clone', root.DD_DOC(
						//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
								author: "Claude Petit",
								revision: 1,
								params: {
									name: {
										type: 'string',
										optional: false,
										description: "Full namespace.",
									},
									newName: {
										type: 'string',
										optional: true,
										description: "New namespace. Default is same name.",
									},
									targetRoot: {
										type: 'Root',
										optional: true,
										description: "Target root. Default is current root.",
									},
									cloneDeps: {
										type: 'boolean',
										optional: true,
										description: "'true' will clone dependencies. 'false' will not clone dependencies. Default is 'false'.",
									},
									dontThrow: {
										type: 'boolean',
										optional: true,
										description: "'true' will not throw an error when it happens. 'false' will throw errors. Default is 'false'.",
									},
									options: {
										type: 'object',
										optional: true,
										description: "Options.",
									},
								},
								returns: 'Promise(object)',
								description: "Clones a namespace and returns the entry from the registry when successful. Returns 'null' otherwise.",
						}
						//! END_REPLACE()
				, function clone(name, / *optional* /newName, / *optional* /targetRoot, / *optional* /cloneDeps, / *optional* /dontThrow, / *optional* /options) {
					if (!newName) {
						newName = name;
					};
					if (!targetRoot) {
						targetRoot = root;
					};
					if (targetRoot === root) {
						if (newName === name) {
							if (!dontThrow) {
								throw new types.Error("A new name must be specified.");
							};
							return null;
						};
						cloneDeps = false;
					};
					
					var targetNamespaces = targetRoot.Namespaces;
					
					var specs = {};

					var fillSpecs = function fillSpecs(name, / *optional* /newName) {
						if (!types.has(specs, name)) {
							var entry = __Internal__.DD_REGISTRY.get(name);
							if (entry) {
								var spec = tools.clone(entry.spec);
								if (newName) {
									spec.name = newName;
								};
								namespace = targetNamespaces.get(spec.name);
								if (!namespace) {
									specs[name] = spec;
									if (cloneDeps) {
										var deps = (spec.dependencies || []);
										for (var i = 0; i < deps.length; i++) {
											fillSpecs(deps[i], null);
										};
									};
								};
							};
						};
					};
					
					fillSpecs(name, newName);
					
					return targetNamespaces.load(specs, options)
						.then(function() {
							var namespace = targetNamespaces.get(newName);
							if (!namespace) {
								if (dontThrow) {
									return null;
								} else {
									throw new types.Error("Failed to clone namespace '~0~'.", [name]);
								};
							};
							return namespace;
						});
				}));
				*/
				
				//===================================
				// Objects
				//===================================
					
				//-----------------------------------
				// Registry object
				//-----------------------------------
					
				__Internal__.NamespaceGetter = function() {};
					
				__Internal__.RegistryIterator = types.INIT(types.Iterator.$inherit(
					{
						$TYPE_NAME: 'RegistryIterator',
					},
					{
						__values: types.READ_ONLY(null),
						__type: types.READ_ONLY(null),
						__exact: types.READ_ONLY(false),
						__index: types.NOT_CONFIGURABLE(0),

						_new: types.SUPER(function _new(registry, type, exact) {
							this._super();

							_shared.setAttributes(this, {
								__type: type,
								__exact: !!exact,
								__values: tools.map(types.values(registry.registry), function(entry) {
									// NOTE: We MUST NOT expose the entry object
									return {
										type: types.getType(entry),
										name: entry.spec.name, 
										namespace: entry.namespace
									};
								}),
							}, {all: true});
						}),

						next: function next() {
							var ar = this.__values,
								len = ar.length,
								type = this.__type,
								exact = this.__exact,
								ok = false,
								entry;
							while (!ok) {
								if ((this.index < 0) || (this.__index >= len)) {
									break;
								};
								entry = ar[this.__index++];
								ok = ((entry.type === type) || (!exact && types.baseof(type, entry.type)))
							};
							if (ok) { 
								return {
									value: entry,
								};
							} else {
								return {
									done: true,
								};
							};
						},
					}));

				__Internal__.Registry = root.DD_DOC(
						//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
								author: "Claude Petit",
								revision: 0,
								params: null,
								returns: 'Registry',
								description: "Namespaces registry.",
						}
						//! END_REPLACE()
				, types.INIT(types.Type.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'Registry'
					},
					
					/*instanceProto*/
					{
						registry: null,
						
						_new: types.SUPER(function _new() {
							this._super();
							this.registry = types.nullObject();
						}),
						
						get: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
										author: "Claude Petit",
										revision: 0,
										params: {
											name: {
												type: 'string',
												optional: false,
												description: "Full namespace.",
											},
											type: {
												type: 'NamespaceEntry',
												optional: true,
												description: "Entry type to be retrieved.",
											},
										},
										returns: 'NamespaceEntry',
										description: "Returns an entry by its name.",
								}
								//! END_REPLACE()
						, function get(name, /*optional*/type) {
							if (!(name in this.registry)) {
								return null;
							};
							if (type) {
								if (!types.baseof(entries.Object, type)) {
									return null;
								};
							} else {
								type = entries.Object;
							};
							var entry = this.registry[name];
							if (!(entry instanceof type)) {
								return null;
							};
							return entry;
						}),
						has: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
										author: "Claude Petit",
										revision: 0,
										params: {
											name: {
												type: 'string',
												optional: false,
												description: "Full namespace.",
											},
											type: {
												type: 'NamespaceEntry',
												optional: true,
												description: "Entry type to be retrieved.",
											},
										},
										returns: 'bool',
										description: "Returns 'true' if an entry exists. Returns 'false' otherwise.",
								}
								//! END_REPLACE()
						, function has(name, /*optional*/type) {
							if (!(name in this.registry)) {
								return false;
							};
							if (type) {
								if (!types.baseof(entries.Object, type)) {
									return false;
								};
							} else {
								type = entries.Object;
							};
							var entry = this.registry[name];
							return (entry instanceof type);
						}),
						remove: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
										author: "Claude Petit",
										revision: 3,
										params: {
											name: {
												type: 'string',
												optional: false,
												description: "Full namespace.",
											},
											type: {
												type: 'NamespaceEntry',
												optional: true,
												description: "Entry type to be retrieved.",
											},
											options: {
												type: 'object',
												optional: true,
												description: "Options",
											},
										},
										returns: 'bool',
										description: "Removes an entry and return 'true' when successful. Returns 'false' otherwise.",
								}
								//! END_REPLACE()
						, function remove(name, /*optional*/type, /*optional*/options) {
							options = types.nullObject(options);
							if (options.secret !== _shared.SECRET) {
								throw new types.AccessDenied("Secrets mismatch.");
							};
							if (!(name in this.registry)) {
								return false;
							};
							if (type) {
								if (!types.baseof(entries.Object, type)) {
									return false;
								};
							} else {
								type = entries.Object;
							};
							var entry = this.registry[name];
							if (!(entry instanceof type)) {
								return false;
							};
							if (entry.options.protect) {
								return false;
							};
							delete this.registry[name];
							var namespace = entry.namespace;
							if (namespace) {
								var parent = namespace.DD_PARENT;
								if (parent && namespace.DD_NAME) {
									var descriptor = types.getPropertyDescriptor(parent, namespace.DD_NAME);
									if (descriptor && types.get(descriptor, 'configurable')) {
										delete parent[namespace.DD_NAME];
									};
								};
							};
							return true;
						}),
						add: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
										author: "Claude Petit",
										revision: 3,
										params: {
											name: {
												type: 'string',
												optional: false,
												description: "Full namespace.",
											},
											entry: {
												type: 'NamespaceEntry',
												optional: false,
												description: "Namespace entry to add.",
											},
											options: {
												type: 'object',
												optional: true,
												description: "Options",
											},
										},
										returns: 'bool',
										description: "Adds a new entry and returns 'true' when successful. Returns 'false' otherwise.",
								}
								//! END_REPLACE()
						, function add(name, entry, /*optional*/options) {
							options = types.nullObject(options);
							if (options.secret !== _shared.SECRET) {
								throw new types.AccessDenied("Secrets mismatch.");
							};
							if (name in this.registry) {
								return false;
							};
							if (!(entry instanceof entries.Object)) {
								return false;
							};
							if (types.get(entry.spec, 'name') !== name) {
								entry.spec = types.extend({}, entry.spec, {
									name: name,
								});
							};
							types.freezeObject(entry.spec);
							//types.freezeObject(entry);
							this.registry[name] = entry;
							if (!(entry instanceof entries.Package)) {
								var namespace = entry.namespace;
								if (namespace) {
									var type = (types.isSingleton(namespace) ? types.getType(namespace) : namespace);
									var parent = type.DD_PARENT;
									if (parent && type.DD_NAME) {
										parent.ADD(type.DD_NAME, namespace, entry.options.protect);
									};
								};
							};
							return true;
						}),

						iter: function iter(/*optional*/type, /*optional*/exact) {
							return new __Internal__.RegistryIterator(this, type || entries.Object, exact);
						},
					}
				)));
				
				__Internal__.DD_REGISTRY = new __Internal__.Registry();
				
				//-----------------------------------
				// Object entry
				//-----------------------------------

				entries.REGISTER(root.DD_DOC(
						//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
								author: "Claude Petit",
								revision: 2,
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
								description: "Namespace registry entry.",
						}
						//! END_REPLACE()
				, types.Type.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'Object'
					},
					
					/*instanceProto*/
					{
						root: null,
						spec: null,
						namespace: null,
						version: null,
						objectCreated: false,
						objectCreating: false,
						objectInit: null,
						objectInitialized: false,
						objectInitializing: false,
						options: null,
						
						_new: types.SUPER(function _new(root, spec, namespace, /*optional*/options) {
							this._super();
							this.root = root;
							this.spec = types.extend({}, spec, {
								type: types.getType(this),
								namespaceType: types.getType(namespace),
							});
							this.namespace = namespace;
							this.version = this.spec.version && tools.Version.parse(this.spec.version, namespaces.VersionIdentifiers);
							
							this.options = types.nullObject(options);
							
							var val = types.getIn(this.options, 'protect', true);
							this.options.protect = types.toBoolean(val);
						}),
					
						init: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
										author: "Claude Petit",
										revision: 0,
										params: {
											options: {
												type: 'object',
												optional: true,
												description: "Options",
											},
										},
										returns: 'undefined',
										description: "Initializes the namespace object.",
								}
								//! END_REPLACE()
						, function init(/*optional*/options) {
							this.objectInitialized = true;
							this.objectInitializing = false;
						}),
					}
				)));

				//-----------------------------------
				// Namespace entry
				//-----------------------------------

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
								description: "Namespace registry entry.",
						}
						//! END_REPLACE()
				, entries.Object.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'Namespace'
					}
				)));

				entries.ADD('NamespaceObject', types.Namespace);
				
				//-----------------------------------
				// Module entry object
				//-----------------------------------
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
								description: "Module registry entry.",
						}
						//! END_REPLACE()
				, entries.Namespace.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'Module'
					}
				)));
				
				
				//-----------------------------------
				// Package entry object
				//-----------------------------------
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
								description: "Package registry entry.",
						}
						//! END_REPLACE()
				, entries.Namespace.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'Package'
					}
				)));
				
				
				//-----------------------------------
				// Application entry object
				//-----------------------------------
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
								description: "Application registry entry.",
						}
						//! END_REPLACE()
				, entries.Namespace.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'Application'
					}
				)));
				

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