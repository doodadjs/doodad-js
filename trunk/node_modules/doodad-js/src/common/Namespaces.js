//! REPLACE_BY("// Copyright 2015 Claude Petit, licensed under Apache License version 2.0\n")
// dOOdad - Class library for Javascript (BETA) with some extras (ALPHA)
// File: Namespace.js - Namespaces management
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

(function() {
	var global = this;

	global.DD_MODULES = (global.DD_MODULES || {});
	global.DD_MODULES['Doodad.Namespaces'] = {
		type: null,
		version: '0a',
		namespaces: ['Entries'],
		dependencies: ['Doodad.Types', 'Doodad.Tools'],
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
			// Options
			//===================================
				
			namespaces.options =
				{
					settings: {
					},
				};
			
			types.depthExtend(1, namespaces.options, _options);

			
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
				loading: false,
			};

			//===================================
			// Events
			//===================================
			
			namespaces.oncreatenamespace = null;
			namespaces.oninitnamespace = null;
			namespaces.onready = null;

			
			//===================================
			// Utilities
			//===================================
			
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
			
			namespaces.createNamespace = root.DD_DOC(
					//! REPLACE_BY("null")
					{
							author: "Claude Petit",
							revision: 0,
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
							},
							returns: 'NamespaceEntry,object',
							description: "Creates a new namespace object and returns its entry from the registry. When there is a missing dependency, aborts and returns this dependency instead.",
					}
					//! END_REPLACE()
			, function createNamespace(spec, /*optional*/options, /*optional*/ignoreOptionals) {
				if (!options) {
					options = {};
				};
				
				if (types.isString(spec)) {
					spec = {
						name: spec,
					};
				};
				
				var deps = spec.dependencies;
				if (deps) {
					var depsLen = deps.length;
					for (var i = 0; i < depsLen; i++) {
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
						if (!depEntry || !(depEntry instanceof entries.Module)) {
							if (!optional || !ignoreOptionals) {
								return {
									missingDep: dep, 
									optional: optional,
									version: version,
								};
							};
						};
					};
				};
				
				var name = spec.name;
				
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
				
				var entry = namespaces.getEntry(name);
				if (entry) {
					if (!types.is(entry, entries.Namespace) || (specType === entries.Namespace)) {
						return entry;
					};
				};
				
				var parent = spec.parent,
					fullName;
					
				if (parent) {
					fullName = (parent.DD_FULL_NAME ? '.' + parent.DD_FULL_NAME : '');
					// Delete temporary property
					delete spec.parent;
				} else {
					fullName = '';
					parent = root;
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

				entry = null;

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

				if (entry) {
					var specNamespaces = spec.namespaces;
					if (specNamespaces) {
						var namespacesLen = specNamespaces.length;
						for (var i = 0; i < namespacesLen; i++) {
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
							namespaces.createNamespace(newSpec, options, ignoreOptionals);
						};
					};

					var proto = spec.proto;
					if (proto) {
						for (var key in proto) {
							if (types.hasKey(proto, key)) {
								namespace[key] = proto[key];
							};
						};
					};
						
					options = options[spec.name];
					
					if (spec.create && !spec.bootstrap) {
						entry.objectInit = spec.create(entry.root, options);
					};
					
					namespaces.dispatchEvent(new types.CustomEvent('createnamespace', 
						{
							detail: {
								entry: entry,
								options: options,
							},
						}
					));
					
					if (root.DD_ASSERT) {
						tools.log(tools.LogLevels.Debug, "Entry '~0~' created.", [entry.spec.name]);
					};
				};
				
				return entry;
			});
			
			namespaces.initNamespace = root.DD_DOC(
					//! REPLACE_BY("null")
					{
							author: "Claude Petit",
							revision: 0,
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
							returns: 'undefined',
							description: "Initializes a namespace and its dependencies.",
					}
					//! END_REPLACE()
			, function initNamespace(entry, /*optional*/options) {
				if (!options) {
					options = {};
				};
				
				if (entry && !entry.objectInitialized) {
					var deps = entry.spec.dependencies;
					if (deps) {
						var depsLen = deps.length;
						for (var i = 0; i < depsLen; i++) {
							var dep = deps[i];
							if (!types.isString(dep)) {
								dep = dep.name;
							};
							
							var depEntry = namespaces.getEntry(dep);
							if (depEntry && (depEntry instanceof entries.Module)) {
								if (!depEntry.objectInitialized) {
									if (depEntry.spec.autoInit !== false) {
										namespaces.initNamespace(depEntry, options);
									};
								};
							};
						};
					};
					
					options = options[entry.spec.name];
					
					entry.init.call(entry, options);

					namespaces.dispatchEvent(new types.CustomEvent('initnamespace', 
						{
							detail: {
								entry: entry,
								options: options,
							},
						}
					));
					
					if (root.DD_ASSERT) {
						tools.log(tools.LogLevels.Debug, "Entry '~0~' initialized.", [entry.spec.name]);
					};
				};
				
				if (!__Internal__.waiting && !__Internal__.loading) {
					namespaces.dispatchEvent(new types.CustomEvent('ready'));
				};
			});
			
			namespaces.loadNamespaces = root.DD_DOC(
					//! REPLACE_BY("null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
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
								specs: {
									type: 'object',
									optional: true,
									description: "Namespaces specifications. Default is \"global.DD_MODULES\".",
								},
								dontMergeSpecs: {
									type: 'bool',
									optional: true,
									description: "'true' will not merge specifications with \"global.DD_MODULES\". 'false' will merge. Default is 'false'.",
								},
							},
							returns: 'bool',
							description: "Returns 'true' when successful. Returns 'false' otherwise.",
					}
					//! END_REPLACE()
			, function loadNamespaces(/*optional*/dontThrow, /*optional*/options, /*optional*/specs, /*optional*/dontMergeSpecs) {
				var wasLoading = __Internal__.loading;
				__Internal__.loading = true;
					
				try {
					if (!options) {
						options = {};
					};
					
					var modules = (global.DD_MODULES || {});
					if (specs) {
						if (dontMergeSpecs) {
							modules = specs;
						} else {
							types.extend(modules, specs);
						};
					};
					
					var done = true,
						spec,
						entry,
						missings = 0,
						optionals = 0,
						toInit = [],
						names = types.keys(modules),
						name;
						
					var ignoreOptionals = false;
					
					while (name = names.shift()) {
						var spec = modules[name];
						spec.name = name;
						entry = namespaces.createNamespace(spec, options, ignoreOptionals);
						if (entry.missingDep) {
							if (!entry.optional || !ignoreOptionals) {
								names.push(name);
								if (missings >= names.length) {
									done = false;
									break;
								} else if ((missings + optionals) >= names.length) {
									if (ignoreOptionals) {
										done = false;
										break;
									} else {
										ignoreOptionals = true;
										optionals = 0;
										missings = 0;
									};
								} else if (entry.optional) {
									optionals++;
								} else {
									missings++;
								};
							};
						} else {
							delete modules[name];
							missings = 0;
							optionals = 0;
							if (entry.spec.autoInit !== false) {
								toInit.push(entry);
							};
						};
					};

					var len = toInit.length;
					for (var i = 0; i < len; i++) {
						namespaces.initNamespace(toInit[i], options);
					};

					if (!done && !dontThrow) {
						throw new types.Error("Missing dependency '~0~' version '~1~' or higher.", [entry.missingDep, (entry.version || '<any>')]);
					};
					
				} catch(ex) {
					done = false;
					throw ex;
				} finally {
					__Internal__.loading = wasLoading;
					
					if (done && !__Internal__.waiting && !wasLoading) {
						namespaces.dispatchEvent(new types.CustomEvent('ready'));
					};
				};
				
				return done;
			});

			namespaces.cloneNamespace = root.DD_DOC(
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
							returns: 'undefined',
							description: "Clones a namespace and returns the entry from the registry when successful. Returns 'null' otherwise.",
					}
					//! END_REPLACE()
			, function cloneNamespace(name, /*optional*/newName, /*optional*/targetRoot, /*optional*/cloneDeps, /*optional*/dontThrow, /*optional*/options) {
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

				var fillSpecs = function fillSpecs(name, /*optional*/newName) {
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
				
				targetNamespaces.loadNamespaces(dontThrow, options, specs, false);
				
				var entry = targetNamespaces.getEntry(newName);
				if (!entry) {
					if (!dontThrow) {
						throw new types.Error("Failed to clone namespace '~0~'.", [name]);
					};
					return null;
				};
				
				return entry;
			});
			
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
							if (!types.baseof(entries.Namespace, type.prototype)) {
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
							if (!types.baseof(entries.Namespace, type.prototype)) {
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
							if (!types.baseof(entries.Namespace, type.prototype)) {
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
					
					_new: types.SUPER(function _new(root, spec, namespace) {
						this._super();
						this.root = root;
						this.spec = spec;
						this.namespace = namespace;
						this.version = tools.Version.parse(spec.version, __Internal__.versionIdentifiers);
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
						if (!this.objectInitialized) {
							this.objectInitialized = true;
							this.objectInit && this.objectInit(options); // function(/*optional*/options)
						};
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
			, types.INIT(entries.Module.$inherit(
				/*typeProto*/
				{
					$TYPE_NAME: 'ApplicationEntry'
				}
			)));
			

			//-----------------------------------
			// Ready Event
			//-----------------------------------
			namespaces.ReadyCallback = root.DD_DOC(
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
								callback: {
									type: 'function',
									optional: true,
									description: "Additional callback function to be called.",
								},
							},
							returns: 'ReadyCallback',
							description: "Callback function for Namespaces 'ready' event. Use it when an asynchronous operation is made on the initialization of a namespace so that the application will start after every namespaces are correctly initialized.",
					}
					//! END_REPLACE()
			, types.setPrototypeOf(function(/*optional*/obj, /*optional*/callback) {
				__Internal__.waiting = true;
				__Internal__.waitCounter++;
				var fn = function wait() {
					try {
						if (!fn.CALLED) {
							fn.CALLED = true;
							__Internal__.waitCounter--;
							if (callback) {
								callback.call(obj);
							};
							if (__Internal__.waitCounter <= 0) {
								__Internal__.waiting = false;
								__Internal__.waitCounter = 0;
							};
							if (!__Internal__.waiting && !__Internal__.loading) {
								namespaces.dispatchEvent(new types.CustomEvent('ready'));
							};
						};
					} catch(ex) {
						if (ex instanceof types.ScriptAbortedError) {
							throw ex;
						} else {
							doodad.trapException(obj, null, ex);
						};
					};
				};
				fn = types.setPrototypeOf(fn, namespaces.ReadyCallback);
				fn.CALLED = false;
				return fn;
			}, types.Callback));
	
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
})();