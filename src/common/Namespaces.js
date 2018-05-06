//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
	// doodad-js - Object-oriented programming framework
	// File: Namespace.js - Namespaces management
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
	modules['Doodad.Namespaces'] = {
		version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
		namespaces: ['Entries'],
		dependencies: [
			'Doodad.Types',
			'Doodad.Types/Iterators',
			'Doodad.Tools',
		],
		bootstrap: true,

		create: function(root, /*optional*/_options, _shared) {
			//===================================
			// Get namespaces
			//===================================

			const doodad = root.Doodad,
				types = doodad.Types,
				tools = doodad.Tools,
				namespaces = doodad.Namespaces,
				entries = namespaces.Entries;

			//===================================
			// Internals
			//===================================
			// <FUTURE> Thread context
			const __Internal__ = {
				waitCounter: 0,
				waiting: false,
				pendingProtection: new types.Set(),
			};

			//===================================
			// Shared
			//===================================

			tools.complete(_shared.Natives, {
				symbolIterator: global.Symbol.iterator,
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

			namespaces.ADD('VersionIdentifiers', types.freezeObject(tools.nullObject({
				/* eslint object-property-newline: "off" */
				development: -4, dev: -4, d: -4,
				alpha: -3, a: -3,
				beta: -2, b: -2,
				stable: -1, s: -1,
				release: 0, r: 0,
				production: 1, prod: 1, p: 1,
				established: 2, e: 2,
			})));

			types.setAttribute(namespaces, _shared.Natives.symbolIterator, function symbolIterator() {
				return __Internal__.DD_REGISTRY.iter();
			}, {});

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
							exact: {
								type: 'bool',
								optional: true,
								description: "'true' will match exactly the entry type. 'false' will include inherited ones. Default is 'false'.",
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
						revision: 2,
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
						description: "Returns the namespace object of the specified namespace from the registry, according to the specified entry type if present.",
					}
				//! END_REPLACE()
				, function get(name, /*optional*/type) {
					const entry = __Internal__.DD_REGISTRY.get(name, type);
					if (!entry || !entry.objectCreated) {
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
							options: {
								type: 'object',
								optional: true,
								description: "Options.",
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
							options: {
								type: 'object',
								optional: true,
								description: "Options.",
							},
						},
						returns: 'bool',
						description: "Removes a namespace entry from the registry. Returns 'true' on success, otherwise returns 'false'.",
					}
				//! END_REPLACE()
				, function remove(name, /*optional*/type, /*optional*/options) {
					return __Internal__.DD_REGISTRY.remove(name, type, options);
				}));

			__Internal__.getBaseName = function getBaseName(name) {
				return (name[0] === '@' ? name.split('/', 3).slice(0, 2).join('/') : name.split('/', 2)[0]);
			};

			__Internal__.createNamespace = root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 8,
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
						returns: 'Promise(NamespaceEntry),Promise(arrayof(object))',
						description: "Creates a new namespace object and returns its entry from the registry. When there are a missing dependencies, aborts and returns information on them instead.",
					}
				//! END_REPLACE()
				, function createNamespace(spec, /*optional*/options, /*optional*/ignoreOptionals) {
					const Promise = types.getPromise();

					return Promise.try(function() {
						const globalOptions = types.get(options, 'global');

						const getEntryType = function _getEntryType(spec, /*optional*/_default) {
							const entryType = types.get(spec, 'type');
							if (entryType) {
								if (types.isString(entryType)) {
									const tmp = types.get(entries, entryType);
									if (tmp && types.baseof(entries.Entry, tmp)) {
										//spec.type = tmp;
										return tmp;
									} else {
										throw new types.Error("Invalid registry entry type : '~0~'.", [types.toString(entryType).slice(0, 50)]);
									}
								} else if (!entryType || !types.baseof(entries.Entry, entryType)) {
									throw new types.Error("Invalid registry entry type : '~0~'.", [types.getTypeName(entryType)]);
								} else {
									return entryType;
								}
							} else {
								//spec.type = _default || entries.Module;
								return _default || entries.Module;
							}
						};

						const getNamespaceType = function _getNamespaceType(spec) {
							const namespaceType = types.get(spec, 'namespaceType');
							if (namespaceType) {
								if (types.isString(namespaceType)) {
									// TODO: Place namespace types in their own Namespace, like 'entries'.
									const tmp = namespaces[namespaceType];
									if (tmp && (tmp === types.Namespace) || types.baseof(types.Namespace, tmp)) {
										//spec.namespaceType = tmp;
										return tmp;
									} else {
										throw new types.Error("Invalid namespace object type : '~0~'.", [types.toString(namespaceType).slice(0, 50)]);
									}
								} else if (!namespaceType || ((namespaceType !== types.Namespace) && !types.baseof(types.Namespace, namespaceType))) {
									throw new types.Error("Invalid namespace object type : '~0~'.", [types.getTypeName(namespaceType)]);
								} else {
									return namespaceType;
								}
							} else {
								//spec.namespaceType = types.Namespace;
								return types.Namespace;
							}
						};

						const checkDependencies = function _checkDependencies(spec) {
							const baseName = __Internal__.getBaseName(spec.name);
							let deps = types.get(spec, 'dependencies');
							if (spec.name !== baseName) {
								if (!deps) {
									deps = [];
									spec.dependencies = deps;
								};
								if (tools.findItem(deps, function(dep) {
									if (types.isString(dep)) {
										return (dep === baseName);
									};
									return (dep.name === baseName);
								}) === null) {
									deps.push({
										name: baseName,
										autoLoad: false,
										optional: true,
									});
								};
							};
							const missingDeps = [];
							if (deps) {
								const entryType = getEntryType(spec, entries.Module);
								const defaultAutoLoad = types.isLike(entryType, entries.Package) || types.isLike(entryType, entries.Application);
								for (let i = 0; i < deps.length; i++) {
									if (types.has(deps, i)) {
										let dep = deps[i],
											optional = false,
											version = null,
											path = null,
											autoLoad = defaultAutoLoad;
										if (!types.isString(dep)) {
											const depType = getEntryType(dep, entryType);
											path = types.get(dep, 'path', null);
											optional = types.toBoolean(types.get(dep, 'optional', false));
											version = types.get(dep, 'version', null);
											autoLoad = types.get(dep, 'autoLoad', types.isLike(depType, entries.Package) || types.isLike(depType, entries.Application));
											dep = dep.name;
										};
										const depEntry = __Internal__.DD_REGISTRY.get(dep);
										let versionMismatch = false;
										if (version && depEntry && depEntry.version) {
											if (tools.Version.compare(depEntry.version, tools.Version.parse(version, namespaces.VersionIdentifiers)) > 0) {
												// Higher version expected
												versionMismatch = true;
											};
										};
										if (!depEntry || !depEntry.objectCreated || versionMismatch) {
											if (!optional || !ignoreOptionals) {
												const missingDep = {
													name: dep,
													module: __Internal__.getBaseName(dep),
													version: version,
													optional: optional,
													path: path,
													consumer: spec.name,
													versionMismatch: versionMismatch,
													autoLoad: autoLoad,
												};
												if (versionMismatch) {
													return [missingDep];
												};
												missingDeps.push(missingDep);
											};
										};
									};
								};
							};
							return missingDeps;
						};

						const createParents = function _createParents(shortNames, fullName, parent) {
							for (let i = 0; i < shortNames.length - 1; i++) {
								const shortName = shortNames[i];
								fullName += ('.' + shortName);

								const fName = fullName.slice(1);

								let namespace = parent[shortName];

								if (!namespace) {
									const newSpec = {
										name: fName,
									};

									namespace = new types.Namespace(parent, shortName, fName);

									const entry = new entries.Namespace(root, newSpec, namespace);
									__Internal__.DD_REGISTRY.add(fName, entry, {secret: _shared.SECRET});
								};

								parent = namespace;
							};

							return parent;
						};

						const createMain = function _createMain(shortNames, spec, parent) {
							const baseName = __Internal__.getBaseName(spec.name);

							const entryType = getEntryType(spec, entries.Module);

							let entry = __Internal__.DD_REGISTRY.get(spec.name);
							if (entry) {
								if (!types.is(entry, entries.Namespace) || (entryType === entries.Namespace)) {
									return entry;
								};
							};

							let namespaceType = getNamespaceType(spec);

							let namespace = types.get(spec, 'object');
							if (namespace) {
								if (!types.isLike(namespace, namespaceType)) {
									throw new types.Error("Invalid namespace object.");
								};
							};

							const curEntryType = types.getType(entry);
							let replaceEntry = false;
							if (curEntryType && (entryType !== curEntryType) && (entryType !== entries.Namespace)) {
								replaceEntry = true;
							};

							const shortName = shortNames[shortNames.length - 1];
							let prevNamespace = null;
							if (types.has(parent, shortName)) {
								prevNamespace = parent[shortName];
								if ((!replaceEntry && types._instanceof(namespace, types.Namespace)) || !types.get(spec, 'replaceObject', false)) {
									namespace = prevNamespace;
									prevNamespace = null;
								};
							};

							if (entry && replaceEntry) {
								__Internal__.DD_REGISTRY.remove(spec.name, null, {secret: _shared.SECRET});
								entry = null;
							};

							if (!entry) {
								if (spec.name !== baseName) {
									const baseEntry = __Internal__.DD_REGISTRY.get(baseName);
									if (baseEntry) {
										namespace = baseEntry.namespace;
									};
								};

								if (!namespace) {
									if (prevNamespace && !types._instanceof(prevNamespace, namespaceType)) {
										const proto = {};
										const keys = tools.append(types.keys(prevNamespace), types.symbols(prevNamespace));
										const keysLen = keys.length;
										for (let i = 0; i < keysLen; i++) {
											const key = keys[i];
											let val = prevNamespace[key];
											if (!types._instanceof(val, types.AttributeBox)) {
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

									let proto = types.get(spec, 'proto');
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

									namespace = new namespaceType(parent, shortName, baseName);
								};

								const protect = types.get(spec, 'protect', true);
								entry = new entryType(root, spec, namespace, {protect: protect});
								__Internal__.DD_REGISTRY.add(spec.name, entry, {secret: _shared.SECRET});
							};

							return entry;
						};

						const create = function _create(spec, parentName, parent) {
							const baseName = __Internal__.getBaseName(spec.name);
							const shortNames = baseName.split('.');
							parent = createParents(shortNames, parentName, parent);
							const entry = createMain(shortNames, spec, parent);
							return entry;
						};

						const createObject = function _createObject(entry) {
							const baseName = __Internal__.getBaseName(entry.spec.name);
							let opts = (types._instanceof(entry, entries.Package) || types._instanceof(entry, entries.Application) ? options : types.get(options, baseName));
							if (globalOptions) {
								opts = tools.extend({}, globalOptions, opts);
							};
							if (!types.get(entry.spec, 'bootstrap', false) && !entry.objectCreated && !entry.objectCreating) {
								let retval = null;
								entry.objectCreating = true;
								const create = types.get(entry.spec, 'create');
								if (create) {
									retval = create(root, opts, _shared);
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
											}
										});
								} else if (types.isFunction(retval)) {
									entry.objectCreating = false;
									entry.objectCreated = true;
									entry.objectInit = retval;
								} else {
									throw new types.Error("'create' of '~0~' has returned an invalid value.", [entry.spec.name]);
								};
							};
							return entry;
						};

						const createNamespaces = function _createNamespaces(entry) {
							const specNamespaces = types.get(entry.spec, 'namespaces');
							if (specNamespaces) {
								const baseName = __Internal__.getBaseName(entry.spec.name);
								const specNamespacesLen = specNamespaces.length;
								for (let i = 0; i < specNamespacesLen; i++) {
									if (types.has(specNamespaces, i)) {
										const name = specNamespaces[i],
											shortNames = name.split('.');
										const parent = createParents(shortNames, baseName, entry.namespace);
										const newSpec = {
											name: baseName + '.' + name,
											type: entries.Namespace,
											namespaceType: types.Namespace,
										};
										const main = createMain(shortNames, newSpec, parent);
										createObject(main);
									};
								};
							};
							return entry;
						};

						const terminate = function _terminate(entry) {
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

						const check = function _check(spec) {
							const baseName = __Internal__.getBaseName(spec.name);
							if (!spec.bootstrap && (spec.name !== baseName)) {
								const existing = __Internal__.DD_REGISTRY.get(spec.name);
								if (existing) {
									return existing;
								};
							};

							const missingDeps = checkDependencies(spec);
							if (missingDeps.length) {
								return missingDeps;
							};

							return null;
						};

						const result = check(spec);
						if (result) {
							return result;
						};

						return Promise.resolve(create(spec, '', root))
							.then(createNamespaces)
							.then(function(entry) {
								if (!entry.objectCreated && !entry.objectCreating && !entry.objectCreate && types._instanceof(entry, entries.Application)) {
									entry.objectCreate = function() {
										return Promise.resolve(createObject(entry))
											.then(terminate);
									};
									return entry;
								};
								return Promise.resolve(createObject(entry))
									.then(terminate);
							});
					});
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
					/* eslint no-loop-func: "off" */

					const Promise = types.getPromise();

					return Promise.try(function() {
						if (entry && !entry.objectInitialized && !entry.objectInitializing) {
							entry.objectInitializing = true;

							let promise = Promise.resolve();

							const deps = types.get(entry.spec, 'dependencies');
							if (deps) {
								const depsLen = deps.length;
								for (let i = 0; i < depsLen; i++) {
									if (types.has(deps, i)) {
										let dep = deps[i];
										if (!types.isString(dep)) {
											dep = dep.name;
										};

										const depEntry = __Internal__.DD_REGISTRY.get(dep);
										if (depEntry) {
											if (!depEntry.objectInitialized && !depEntry.objectInitializing) {
												if (depEntry.spec.autoInit !== false) {
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

							const globalOptions = types.get(options, 'global');

							const baseName = __Internal__.getBaseName(entry.spec.name);
							options = types.get(options, baseName);

							if (globalOptions) {
								options = tools.extend({}, globalOptions, options);
							};

							if (entry.objectInit) {
								if (types.isFunction(entry.objectInit)) {
									const retval = entry.objectInit(options);
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
												}
											});
									};
								} else {
									throw new types.Error("'objectInit' of '~0~' has an invalid value.", [entry.spec.name]);
								};
							};

							const terminate = function terminate() {
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

						};

						return entry;
					});
				});

			namespaces.ADD('load', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 13,
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
						returns: 'Promise',
						description: "Loads additional Doodad modules, then returns 'root'.",
					}
				//! END_REPLACE()
				, function load(modules, /*optional*/options, /*optional*/callback) {
					const Promise = types.getPromise();

					return Promise.try(function() {
						const dontThrow = types.get(options, 'dontThrow');

						if (types.isArray(options)) {
							options = tools.depthExtend.apply(null, tools.append([15, {}], options));
						};

						if (types.get(types.get(options, 'startup'), 'secret') !== _shared.SECRET) {
							throw new types.AccessDenied("Secrets mismatch.");
						};

						tools.forEach(modules, function(mod, name) {
							if (mod) {
								mod.name = name;
								let modType = types.get(mod, 'type') || entries.Module;
								if (types.isString(modType)) {
									modType = types.get(entries, modType);
								};
								mod.type = modType;
							};
						});

						const names = types.keys(modules);

						names.sort(function(name1, name2) {
							const mod1 = modules[name1],
								mod2 = modules[name2],
								mod1IsModule = mod1 && !((mod1.type === entries.Special) || types.baseof(entries.Special, mod1.type)),
								mod2IsModule = mod2 && !((mod2.type === entries.Special) || types.baseof(entries.Special, mod2.type));
							if (mod1IsModule && mod2IsModule) {
								return 0;
							} else if (mod1IsModule) {
								return -1;
							} else {
								return 1;
							}
						});

						const doCallback = function _doCallback() {
							// Create Promise for callback result
							let cbPromise = null;
							if (callback) {
								cbPromise = Promise.create(function readyPromise(resolve, reject) {
									let cbReadyHandler,
										cbErrorHandler;
									const cbCleanUp = function() {
										namespaces.removeEventListener('ready', cbReadyHandler);
										namespaces.removeEventListener('error', cbErrorHandler);
									};
									cbReadyHandler = function(ev) {
										cbCleanUp();
										try {
											resolve(callback(root, _shared));
										} catch(ex) {
											reject(ex);
										};
									};
									cbErrorHandler = function(ev) {
										cbCleanUp();
										reject(ev.detail.error);
									};
									namespaces.addEventListener('ready', cbReadyHandler);
									namespaces.addEventListener('error', cbErrorHandler);
								});
							};

							// Dispatches "onready"
							if (!__Internal__.waiting) {
								namespaces.dispatchEvent(new types.CustomEvent('ready'));
							};

							// Returns the callback promise or nothing.
							if (cbPromise) {
								// NOTE: Returns "cbPromise". This allows to catch callback errors.
								return cbPromise;
							};

							return undefined; // "consistent-return"
						};

						const loopCreateModules = function _loopCreateModules(state) {
							if (names.length) {
								if (state.missings >= names.length) {
									const entry = state.missingDeps[0];
									if (entry.versionMismatch) {
										throw new types.Error("Module '~0~' is missing dependency '~1~' version '~2~' or higher.", [entry.consumer, entry.name, (entry.version || '<unspecified>')]);
									} else {
										const missingDeps = tools.unique(function(dep1, dep2) {
											return (dep1.name === dep2.name) && (dep1.path === dep2.path);
										}, state.missingDeps);
										throw new types.MissingDependencies(missingDeps, modules);
									};
								} else if (!state.ignoreOptionals && ((state.missings + state.optionals) >= names.length)) {
									state.ignoreOptionals = true;
									state.missings = 0;
									state.optionals = 0;
									state.missingDeps = [];
								};
								const name = names.shift(),
									spec = modules[name];
								return __Internal__.createNamespace(spec, options, state.ignoreOptionals)
									.then(function(entry) {
										if (types.isArray(entry)) {
											if (tools.every(entry, function(dep) {
												return dep.optional;
											})) {
												state.optionals++;
											} else {
												state.missings++;
											};
											tools.append(state.missingDeps, entry);
											names.push(name);
										} else {
											state.missings = 0;
											state.optionals = 0;
											state.missingDeps = [];
											if (entry) {
												if (entry.objectCreate || (entry.spec.autoInit !== false)) {
													state.toInit.push(entry);
												};
											};
										};
										return loopCreateModules(state);
									});
							} else {
								return state.toInit;
							}
						};

						const protectModules = function _protectModules(toInit) {
							__Internal__.pendingProtection.forEach(function(name) {
								__Internal__.pendingProtection.delete(name);
								const entry = __Internal__.DD_REGISTRY.get(name);
								if (entry) {
									const namespace = entry.namespace;
									if (namespace) {
										const parent = namespace.DD_PARENT,
											name = namespace.DD_NAME;
										if (parent && name) {
											if (entry.options.protect) {
												parent.ADD(name, namespace, true);
											};
										};
									};
								};
							});
							return toInit;
						};

						const loopInitModules = function _loopInitModules(toInit) {
							if (toInit.length) {
								let promise = Promise.resolve();

								const entry = toInit.shift();

								if (!entry.objectCreated && !entry.objectCreating && entry.objectCreate) {
									if (entry.spec.autoInit !== false) {
										toInit.push(entry);
									};
									promise = promise.then(entry.objectCreate);
								} else if (!entry.objectInitialized && !entry.objectInitializing && (entry.spec.autoInit !== false)) {
									promise = promise.then(function(dummy) {
										return __Internal__.initNamespace(entry, options);
									});
								};

								return promise.then(function() {
									return loopInitModules(toInit);
								});
							};

							return undefined; // "consistent-return"
						};

						const state = {missingDeps: [], missings: 0, optionals: 0, ignoreOptionals: false, toInit: []};

						return Promise.resolve(loopCreateModules(state))
							.then(protectModules)
							.then(loopInitModules)
							.then(doCallback)
							.catch(function(err) {
								if (!__Internal__.waiting) {
									// Dispatches "onerror"
									namespaces.dispatchEvent(new types.CustomEvent('error', {detail: {error: err}}));
								};
								if (!dontThrow || err.bubble) {
									throw err;
								};
							})
							.then(function() {
								return root;
							});
					});
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

			__Internal__.NamespaceGetter = function NamespaceGetter() {};

			__Internal__.RegistryIterator = types.INIT(types.Iterator.$inherit(
				{
					$TYPE_NAME: 'RegistryIterator',
					$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('RegistryIterator')), true) */,
				},
				{
					__values: types.READ_ONLY(null),
					__type: types.READ_ONLY(null),
					__exact: types.READ_ONLY(false),
					__index: types.NOT_CONFIGURABLE(0),

					_new: types.SUPER(function _new(registry, type, exact) {
						this._super();

						types.setAttributes(this, {
							__type: type,
							__exact: !!exact,
							__values: tools.map(types.values(registry.registry), function(entry) {
								// NOTE: We MUST NOT expose the entry objects
								return {
									type: types.getType(entry),
									name: entry.spec.name,
									object: entry.namespace
								};
							}),
						});
					}),

					next: function next() {
						const ar = this.__values,
							len = ar.length,
							type = this.__type,
							exact = this.__exact;
						let ok = false,
							entry;
						while (!ok) {
							if ((this.__index < 0) || (this.__index >= len)) {
								break;
							};
							entry = ar[this.__index++];
							ok = ((entry.type === type) || (!exact && types.baseof(type, entry.type)));
						};
						if (ok) {
							return {
								value: types.clone(entry), // FUTURE: freeze entries in the registry
							};
						} else {
							return {
								done: true,
							};
						}
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
						$TYPE_NAME: 'Registry',
						$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('Registry')), true) */,
					},

					/*instanceProto*/
					{
						registry: null,

						_new: types.SUPER(function _new() {
							this._super();
							this.registry = tools.nullObject();
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
									if (!types.baseof(entries.Entry, type)) {
										return null;
									};
								} else {
									type = entries.Entry;
								};
								const entry = this.registry[name];
								if (!types._instanceof(entry, type)) {
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
									if (!types.baseof(entries.Entry, type)) {
										return false;
									};
								} else {
									type = entries.Object;
								};
								const entry = this.registry[name];
								return types._instanceof(entry, type);
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
								options = tools.nullObject(options);
								if (options.secret !== _shared.SECRET) {
									throw new types.AccessDenied("Secrets mismatch.");
								};
								if (!(name in this.registry)) {
									return false;
								};
								if (type) {
									if (!types.baseof(entries.Entry, type)) {
										return false;
									};
								} else {
									type = entries.Entry;
								};
								const entry = this.registry[name];
								if (!types._instanceof(entry, type)) {
									return false;
								};
								const pendingProtection = __Internal__.pendingProtection.has(name);
								if (entry.options.protect && !pendingProtection) {
									return false;
								};
								delete this.registry[name];
								if (pendingProtection) {
									__Internal__.pendingProtection.delete(name);
								};
								const namespace = entry.namespace;
								if (namespace) {
									const parent = namespace.DD_PARENT;
									if (parent && namespace.DD_NAME) {
										const descriptor = types.getPropertyDescriptor(parent, namespace.DD_NAME);
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
								options = tools.nullObject(options);
								if (options.secret !== _shared.SECRET) {
									throw new types.AccessDenied("Secrets mismatch.");
								};
								if (name in this.registry) {
									return false;
								};
								if (!types._instanceof(entry, entries.Entry)) {
									return false;
								};
								if (types.get(entry.spec, 'name') !== name) {
									entry.spec = tools.extend({}, entry.spec, {
										name: name,
									});
								};
								types.freezeObject(entry.spec);
								//types.freezeObject(entry);
								this.registry[name] = entry;
								if (!types._instanceof(entry, entries.Special)) {
									const namespace = entry.namespace;
									if (namespace) {
										const parent = namespace.DD_PARENT,
											name = namespace.DD_NAME,
											fullname = namespace.DD_FULL_NAME;
										if (parent && name && fullname) {
											parent.ADD(name, namespace, false);
											if (entry.options.protect) {
												__Internal__.pendingProtection.add(fullname);
											};
										} else {
											return false;
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
			// Entry
			//-----------------------------------

			entries.REGISTER(root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 3,
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
						$TYPE_NAME: 'Entry',
						$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('Entry')), true) */,
					},

					/*instanceProto*/
					{
						root: null,
						spec: null,
						namespace: null,
						version: null,
						objectCreate: null,
						objectCreated: false,
						objectCreating: false,
						objectInit: null,
						objectInitialized: false,
						objectInitializing: false,
						options: null,

						_new: types.SUPER(function _new(root, spec, namespace, /*optional*/options) {
							this._super();
							this.root = root;
							this.spec = tools.extend({}, spec, {
								type: types.getType(this),
								namespaceType: types.getType(namespace),
							});
							this.namespace = namespace;
							this.version = this.spec.version && tools.Version.parse(this.spec.version, namespaces.VersionIdentifiers);

							this.options = tools.nullObject(options);

							const val = types.getIn(this.options, 'protect', true);
							this.options.protect = types.toBoolean(val);
						}),

						init: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
									author: "Claude Petit",
									revision: 1,
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
								this.objectCreate = null;
								this.objectCreated = true;
								this.objectCreating = false;
								this.objectInitialized = true;
								this.objectInitializing = false;
								this.objectInit = null;
							}),
					}
				)));

			//-----------------------------------
			// Object Entry
			//-----------------------------------

			entries.REGISTER(root.DD_DOC(
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
						returns: 'Type',
						description: "Namespace object entry.",
					}
				//! END_REPLACE()
				, entries.Entry.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'Object',
						$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('ObjectEntry')), true) */,
					}
				)));

			//-----------------------------------
			// Namespace Entry
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
				, entries.Entry.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'Namespace',
						$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('NamespaceEntry')), true) */,
					}
				)));

			//-----------------------------------
			// Module Entry
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
						$TYPE_NAME: 'Module',
						$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('ModuleEntry')), true) */,
					}
				)));

			//-----------------------------------
			// Special Entry
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
						description: "Special registry entry.",
					}
				//! END_REPLACE()
				, entries.Entry.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'Special',
						$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('SpecialEntry')), true) */,
					}
				)));


			//-----------------------------------
			// Package Entry
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
				, entries.Special.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'Package',
						$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('PackageEntry')), true) */,
					}
				)));


			//-----------------------------------
			// Application Entry
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
				, entries.Special.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'Application',
						$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('ApplicationEntry')), true) */,
					}
				)));


			types.REGISTER(types.Error.$inherit(
				{
					$TYPE_NAME: "MissingDependencies",
					$TYPE_UUID: /*! REPLACE_BY(TO_SOURCE(UUID('MissingDependencies')), true) */ null /*! END_REPLACE() */,

					[types.ConstructorSymbol](missingDeps, modules) {
						this.missingDeps = missingDeps;
						this.modules = modules;
						const names = tools.map(missingDeps, function(dep) {
							return dep.name;
						});
						return ["Missing dependencies: ~0~.", [names.join(', ')]];
					}
				}));


			types.preventExtensions(__Internal__);


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
