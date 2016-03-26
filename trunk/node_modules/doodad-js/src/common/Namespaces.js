//! REPLACE_BY("// Copyright 2016 Claude Petit, licensed under Apache License version 2.0\n")
// dOOdad - Object-oriented programming framework
// File: Namespace.js - Namespaces management
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

(function() {
	var global = this;

	var exports = {};
	if (typeof process === 'object') {
		module.exports = exports;
	};
	
	exports.add = function add(DD_MODULES) {
		DD_MODULES = (DD_MODULES || {});
		DD_MODULES['Doodad.Namespaces'] = {
			type: null,
			//! INSERT("version:'" + VERSION('doodad-js') + "',")
			namespaces: ['Entries'],
			dependencies: [
				'Doodad.Types', 
				'Doodad.Tools',
			],
			bootstrap: true,

			create: function(root, /*optional*/_options) {
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
					versionIdentifiers: {
						development: -4, dev: -4, d: -4, 
						alpha: -3, a: -3, 
						beta: -2, b: -2, 
						stable: -1, s: -1, 
						release: 0, r: 0, 
						production: 1, prod: 1, p: 1, 
						established: 2, e: 2,
					},
					
					waitCounter: 0,
					waiting: false,
					toInit: [],
					
					//oldSetOptions: null,
				};

				//===================================
				// Options
				//===================================
					
				//__Internal__.oldSetOptions = namespaces.setOptions;
				//namespaces.setOptions = function setOptions(/*paramarray*/) {
				//	var options = __Internal__.oldSetOptions.apply(this, arguments),
				//		settings = types.get(options, 'settings', {});
				//		
				//};
				//
				//namespaces.setOptions({
				//	
				//}, _options);
				
				//===================================
				// Events
				//===================================
				
				namespaces.oncreate = null;
				namespaces.oninit = null;
				namespaces.onready = null;
				namespaces.onerror = null;

				
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
				
				namespaces.getEntry = root.DD_DOC(
						//! REPLACE_BY("null")
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
										type: 'Type',
										optional: true,
										description: "",
									},
								},
								returns: 'NamespaceEntry',
								description: "Returns the entry of the specified namespace from the registry.",
						}
						//! END_REPLACE()
				, function getEntry(name, /*optional*/type) {
					var registry = root.DD_REGISTRY;
					if (!(registry instanceof namespaces.Registry)) {
						return null;
					};
					return registry.get(name, type);
				});
				
				//namespaces.getNamespace = function getNamespace(name, /*optional*/type) {
				namespaces.getNamespace = root.DD_DOC(
						//! REPLACE_BY("null")
						{
								author: "Claude Petit",
								revision: 0,
								params: {
									name: {
										type: 'string',
										optional: false,
										description: "Full namespace.",
									},
								},
								returns: 'Namespace',
								description: "Returns the namespace object of the specified namespace from the registry.",
						}
						//! END_REPLACE()
				, function getNamespace(name) {
					var entry = namespaces.getEntry(name);
					if (!entry) {
						return null;
					};
					if (!entry.objectInitialized) {
						return null;
					};
					//if (type) {
					//	if (!types.isLike(type, types.Namespace)) {
					//		return null;
					//	};
					//} else {
					//	type = types.Namespace;
					//};
					var namespace = entry.namespace;
					//if (!types.isLike(namespace, type)) {
					//	return null;
					//};
					return namespace;
				});


				__Internal__.createNamespace = root.DD_DOC(
						//! REPLACE_BY("null")
						{
								author: "Claude Petit",
								revision: 2,
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
					
					var deps = spec.dependencies;
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
								var depEntry = namespaces.getEntry(dep);
								if (version && depEntry && depEntry.version) {
									if (tools.Version.compare(depEntry.version, tools.Version.parse(version, __Internal__.versionIdentifiers)) > 0) {
										// Higher version expected
										depEntry = null;
									};
								};
								if (!depEntry) {
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
					
					var specType = spec.type;
					if (specType) {
						var val;
						if (types.isString(specType)) {
							val = entries[specType];
						} else {
							val = specType;
						};
						if (val && (val === entries.Namespace) || types.baseof(entries.Namespace, val)) {
							specType = val;
						} else {
							throw new types.Error("Invalid registry entry type : '~0~'.", [(specType + '').slice(0, 50)]);
						};
					} else {
						specType = entries.Module;
					};
					
					var specNamespaceType = spec.namespaceType;
					if (specNamespaceType) {
						var val;
						if (types.isString(specNamespaceType)) {
							val = namespaces[specNamespaceType];
						} else {
							val = specNamespaceType;
						};
						if (val && (val === types.Namespace) || types.baseof(types.Namespace, val)) {
							specNamespaceType = val;
						} else {
							throw new types.Error("Invalid namespace object type : '~0~'.", [(specNamespaceType + '').slice(0, 50)]);
						};
					} else {
						specNamespaceType = types.Namespace;
					};
					
					var name = spec.name;
					var entry = namespaces.getEntry(name);
					if (entry) {
						if (!types.is(entry, entries.Namespace) || (specType === entries.Namespace)) {
							return Promise.resolve(entry);
						};
					};
					
					var parent = spec.parent || null,
						fullName;
						
					if (parent) {
						fullName = (parent.DD_FULL_NAME ? '.' + parent.DD_FULL_NAME : '');
						// Delete temporary property
						delete spec.parent;
					} else {
						fullName = '';
						if ((specType !== entries.Package) && !types.baseof(entries.Package, specType)) {
							parent = root;
						};
					};
					
					var shortNames = spec.name.split('.'),
						shortNamesLen = shortNames.length,
						shortName,
						fName,
						type,
						namespaceType,
						newSpec = {},
						namespace,
						i,
						replaceEntry = false;

					for (i = 0; i < shortNamesLen; i++) {
						shortName = shortNames[i];
						fullName += ('.' + shortName);
						fName = fullName.slice(1);
						
						if (i < shortNamesLen - 1) {
							type = entries.Namespace;
							namespaceType = types.Namespace;
							namespace = null;
						} else {
							type = specType;
							namespaceType = specNamespaceType;
							newSpec = spec;
							if (type !== entries.Namespace) {
								replaceEntry = true;
							};
							namespace = spec.object;
							if (namespace) {
								if (!types.isLike(namespace, namespaceType)) {
									throw new types.Error("Invalid namespace object.");
								};
							};
						};
						newSpec.name = fName;
						
						entry = namespaces.getEntry(fName);

						if (namespace) {
							if (entry && replaceEntry) {
								root.DD_REGISTRY.remove(fName);
								entry = null;
							};
						} else {
							var prevNamespace = null;
							if (types.hasKey(parent, shortName)) {
								prevNamespace = parent[shortName];
								if ((!replaceEntry && (namespace instanceof types.Namespace)) || !spec.replaceObject) {
									namespace = prevNamespace;
									prevNamespace = null;
								};
							};
							
							if (entry && replaceEntry) {
								root.DD_REGISTRY.remove(fName);
								entry = null;
							};
							
							if (!namespace) {
								namespace = new namespaceType(parent, shortName, fName);
							};
							
							if (prevNamespace) {
								types.complete(namespace, prevNamespace);
							};
						};
						
						if (!entry) {
							entry = new type(root, newSpec, namespace);
							root.DD_REGISTRY.add(fName, entry);
						};
						
						parent = namespace;
					};

					var createNamespaces = function createNamespaces() {
						var promises = [];
						var specNamespaces = spec.namespaces;
						if (specNamespaces) {
							var namespacesLen = specNamespaces.length;
							for (var i = 0; i < namespacesLen; i++) {
								if (i in specNamespaces) {
									var newSpec = specNamespaces[i];
									if (types.isString(newSpec)) {
										newSpec = {
											name: newSpec,
										};
									};
									if (!newSpec.type) {
										newSpec.type = entries.Namespace;
									};
									newSpec.parent = namespace; // Temporary property
									promises.push(__Internal__.createNamespace(newSpec, options, ignoreOptionals));
								};
							};
						};
						return Promise.all(promises);
					};

					var create = function create() {
						var proto = spec.proto;
						if (proto) {
							for (var key in proto) {
								if (types.hasKey(proto, key)) {
									namespace[key] = proto[key];
								};
							};
						};
						
						options = types.get(options, spec.name);
						
						if (!spec.bootstrap && spec.create) {
							var retval = spec.create(root, options);
							if (!types.isNothing(retval)) {
								if (types.isPromise(retval)) {
									__Internal__.incrementWait();
									return retval
										.nodeify(function(err, result) {
											__Internal__.decrementWait();
											if (err) {
												throw err;
											} else if (!types.isNothing(result)) {
												if (types.isFunction(result)) {
													entry.objectInit = result;
												} else {
													throw new types.Error("'create' of '~0~' has returned an invalid value.", [spec.name]);
												};
											};
										});
								} else if (types.isFunction(retval)) {
									entry.objectInit = retval;
								} else {
									throw new types.Error("'create' of '~0~' has returned an invalid value.", [spec.name]);
								};
							};
						};
					};
					
					var terminate = function terminate() {
						namespaces.dispatchEvent(new types.CustomEvent('create', 
							{
								detail: {
									entry: entry,
									options: options,
								},
							}
						));
						
						tools.log(tools.LogLevels.Debug, "Entry '~0~' created.", [entry.spec.name]);
						
						return entry;
					};
					
					return createNamespaces()
						.then(create)
						.then(terminate);
				});
				
				__Internal__.initNamespace = root.DD_DOC(
						//! REPLACE_BY("null")
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
									
									var depEntry = namespaces.getEntry(dep);
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
						
						options = types.get(options, entry.spec.name);
						
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
						
						return promise.then(terminate);
						
					} else {
						return Promise.resolve(entry);
					};
				});
				
				namespaces.loadNamespaces = root.DD_DOC(
						//! REPLACE_BY("null")
						{
								author: "Claude Petit",
								revision: 7,
								params: {
									specs: {
										type: 'object',
										optional: false,
										description: "Namespaces specifications.",
									},
									callback: {
										type: 'function',
										optional: true,
										description: "Callback function.",
									},
									options: {
										type: 'object',
										optional: true,
										description: "Options.",
									},
									dontThrow: {
										type: 'boolean',
										optional: true,
										description: "'true' will not throw an error when it happens. 'false' will throw errors. Default is 'false'.",
									},
								},
								returns: 'Promise(bool)',
								description: "Returns 'true' when successful. Returns 'false' otherwise.",
						}
						//! END_REPLACE()
				, function loadNamespaces(specs, /*optional*/callback, /*optional*/options, /*optional*/dontThrow) {
					var Promise = types.getPromise();
					
					try {
						var names = types.keys(specs);
						
						var terminate = function _terminate(err, result) {
							if (err) {
								debugger;
								// Dispatches "onerror"
								if (!__Internal__.waiting) {
									namespaces.dispatchEvent(new types.CustomEvent('error', {detail: {error: err}}));
								};

								if (dontThrow) {
									return Promise.resolve(false);
								} else {
									return Promise.reject(err);
								};

							} else {
								// Create Promise for callback result
								var cbPromise = null;
								if (callback) {
									cbPromise = new Promise(function(resolve, reject) {
										var cbReadyHandler = function(ev) {
											namespaces.removeEventListener('ready', cbReadyHandler);
											namespaces.removeEventListener('error', cbErrorHandler);
											try {
												resolve(callback());
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
											return true;
										})
										['catch'](function(ex) {
											if (dontThrow) {
												return false;
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
									return Promise.resolve(true);
								};
							};
						};

						var loopCreateModules = function loopCreateModules(state) {
							if (names.length) {
								if (state.missings.length >= names.length) {
									var entry = state.missings[0];
									throw new types.Error("Module '~0~' is missing dependency '~1~' version '~2~' or higher.", [entry.spec.name, entry.missingDep, (entry.depVersion || '<unspecified>')]);
								} else if ((state.missings.length + state.optionals.length) >= names.length) {
									state.ignoreOptionals = true;
								};
								var name = names.shift(),
									spec = specs[name];
								spec.name = name;
								return __Internal__.createNamespace(spec, options, state.ignoreOptionals)
									.then(function(entry) {
										if (entry.missingDep) {
											if (entry.depOptional) {
												state.optionals.push(entry);
											} else {
												state.missings.push(entry);
											};
											names.push(name);
										} else {
											state.missings = [];
											state.optionals = [];
											if (entry.spec.autoInit !== false) {
												__Internal__.toInit.push(entry);
											};
										};
										return loopCreateModules(state);
									});
							};
						};


/*
								var missings = [],
									optionalsCount = 0,
									count = entries.length;
								
								for (var i = 0; i < entries.length; i++) {
									var entry = entries[i];
									if (entry.missingDep) {
										if (entry.optional) {
											optionalsCount++;
										} else {
											missings.push(entry);
										};
									} else {
										delete specs[entry.spec.name];
										if ((entry.spec.autoInit === undefined) || entry.spec.autoInit) {
											__Internal__.toInit.push(entry);
										};
									};
								};
								
								if (missings.length >= entries.length) {
									var entry = missings[0];
									throw new types.Error("Module '~0~' is missing dependency '~1~' version '~2~' or higher.", [entry.parent.name, entry.missingDep, (entry.version || '<unspecified>')]);
								} else if ((missings.length + optionalsCount) >= entries.length) {
									ignoreOptionals = true;
								};
*/
								
						
						var loopInitModules = function loopInitModules() {
							if (!__Internal__.waiting && __Internal__.toInit.length) {
								var promise;
								var entry = __Internal__.toInit.shift(); 
								if (!entry.objectInitialized && !entry.objectInitializing) {
									entry.objectInitializing = true;
									promise = __Internal__.initNamespace(entry, options);
								} else {
									promise = Promise.resolve();
								};

								return promise.then(function() {
									return loopInitModules();
								});
							};
						};
						
						return loopCreateModules({missings: [], optionals: [], ignoreOptionals: false})
							.then(loopInitModules)
							.nodeify(terminate);
						
					} catch(ex) {
						if (ex instanceof types.ScriptAbortedError) {
							throw ex;
						} else {
							return Promise.reject(ex);
						};
					};
				});

				/*
				namespaces.cloneNamespace = root.DD_DOC(
						//! REPLACE_BY("null")
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
				, function cloneNamespace(name, / *optional* /newName, / *optional* /targetRoot, / *optional* /cloneDeps, / *optional* /dontThrow, / *optional* /options) {
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
						if (!types.hasKey(specs, name)) {
							var entry = namespaces.getEntry(name);
							if (entry) {
								var spec = tools.clone(entry.spec);
								if (newName) {
									spec.name = newName;
								};
								entry = targetNamespaces.getEntry(spec.name);
								if (!entry || !entry.objectInitialized) {
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
					
					return targetNamespaces.loadNamespaces(specs, null, options, dontThrow)
						.then(function() {
							var entry = targetNamespaces.getEntry(newName);
							if (!entry) {
								if (dontThrow) {
									return null;
								} else {
									throw new types.Error("Failed to clone namespace '~0~'.", [name]);
								};
							};
							return entry;
						});
				});
				*/
				
				//===================================
				// Objects
				//===================================
					
				//-----------------------------------
				// Registry object
				//-----------------------------------
					
				namespaces.Registry = root.DD_DOC(
						//! REPLACE_BY("null")
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
						get: root.DD_DOC(
								//! REPLACE_BY("null")
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
							if (!types.hasKey(this, name)) {
								return null;
							};
							if (type) {
								if (!types.baseof(entries.Namespace, type)) {
									return null;
								};
							} else {
								type = entries.Namespace;
							};
							var entry = this[name];
							if (!(entry instanceof type)) {
								return null;
							};
							return entry;
						}),
						has: root.DD_DOC(
								//! REPLACE_BY("null")
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
							if (!types.hasKey(this, name)) {
								return false;
							};
							if (type) {
								if (!types.baseof(entries.Namespace, type)) {
									return false;
								};
							} else {
								type = entries.Namespace;
							};
							var entry = this[name];
							return (entry instanceof type);
						}),
						remove: root.DD_DOC(
								//! REPLACE_BY("null")
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
										description: "Removes an entry and return 'true' when successful. Returns 'false' otherwise.",
								}
								//! END_REPLACE()
						, function remove(name, /*optional*/type) {
							if (!types.hasKey(this, name)) {
								return false;
							};
							if (type) {
								if (!types.baseof(entries.Namespace, type)) {
									return false;
								};
							} else {
								type = entries.Namespace;
							};
							var entry = this[name];
							if (!(entry instanceof type)) {
								return false;
							};
							delete this[name];
							var namespace = entry.namespace;
							if (namespace) {
								var parent = namespace.DD_PARENT;
								if (parent && namespace.DD_NAME) {
									delete parent[namespace.DD_NAME];
								};
							};
							return true;
						}),
						add: root.DD_DOC(
								//! REPLACE_BY("null")
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
												type: 'NamespaceEntry',
												optional: false,
												description: "Namespace entry to add.",
											},
										},
										returns: 'bool',
										description: "Adds a new entry and returns 'true' when successful. Returns 'false' otherwise.",
								}
								//! END_REPLACE()
						, function add(name, entry) {
							if (types.hasKey(this, name)) {
								return false;
							};
							if (!(entry instanceof entries.Namespace)) {
								return false;
							};
							this[name] = entry;
							var namespace = entry.namespace;
							if (namespace) {
								var parent = namespace.DD_PARENT;
								if (parent && namespace.DD_NAME) {
									parent[namespace.DD_NAME] = namespace;
								};
							};
							return true;
						}),
					}
				)));
				
				//-----------------------------------
				// Namespace entry object
				//-----------------------------------

				entries.Namespace = root.DD_DOC(
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
								returns: 'NamespaceEntry',
								description: "Namespace registry entry.",
						}
						//! END_REPLACE()
				, types.INIT(types.Type.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'NamespaceEntry'
					},
					
					/*instanceProto*/
					{
						root: null,
						spec: null,
						namespace: null,
						version: null,
						objectInit: null,
						objectInitialized: false,
						objectInitializing: false,
						
						_new: types.SUPER(function _new(root, spec, namespace) {
							this._super();
							this.root = root;
							this.spec = spec;
							this.namespace = namespace;
							this.version = spec.version && tools.Version.parse(spec.version, __Internal__.versionIdentifiers);
						}),
					
						init: root.DD_DOC(
								//! REPLACE_BY("null")
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

				entries.NamespaceObject = types.Namespace;
				
				//-----------------------------------
				// Module entry object
				//-----------------------------------
				entries.Module = root.DD_DOC(
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
								returns: 'ModuleEntry',
								description: "Module registry entry.",
						}
						//! END_REPLACE()
				, types.INIT(entries.Namespace.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'ModuleEntry'
					}
				)));
				
				
				//-----------------------------------
				// Package entry object
				//-----------------------------------
				entries.Package = root.DD_DOC(
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
								returns: 'PackageEntry',
								description: "Package registry entry.",
						}
						//! END_REPLACE()
				, types.INIT(entries.Namespace.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'PackageEntry'
					}
				)));
				
				
				//-----------------------------------
				// Application entry object
				//-----------------------------------
				entries.Application = root.DD_DOC(
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
								returns: 'ApplicationEntry',
								description: "Application registry entry.",
						}
						//! END_REPLACE()
				, types.INIT(entries.Namespace.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'ApplicationEntry'
					}
				)));
				

				//===================================
				// Init
				//===================================
				return function init(/*optional*/options) {
					if (types.hasDefinePropertyEnabled()) {
						types.defineProperty(root, 'DD_REGISTRY', {
							value: new namespaces.Registry(), 
							writable: false, 
							enumerable: true, 
							configurable: true
						});
					} else {
						root.DD_REGISTRY = new namespaces.Registry();
					};
				};
			},
		};
		
		return DD_MODULES;
	};
	
	if (typeof process !== 'object') {
		// <PRB> export/import are not yet supported in browsers
		global.DD_MODULES = exports.add(global.DD_MODULES);
	};
}).call((typeof global !== 'undefined') ? global : ((typeof window !== 'undefined') ? window : this));