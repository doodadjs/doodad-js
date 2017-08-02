//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2017 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Modules.js - Doodad Modules management (server-side)
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

module.exports = {
	add: function add(DD_MODULES) {
		DD_MODULES = (DD_MODULES || {});
		DD_MODULES['Doodad.Modules'] = {
			version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
			dependencies: ['Doodad.Tools', 'Doodad.Tools.Config', 'Doodad.Tools.Files', 'Doodad.Types', 'Doodad.Namespaces', 'Doodad.NodeJs'],
			bootstrap: true,
			
			create: function create(root, /*optional*/_options, _shared) {
				"use strict";

				//===================================
				// Get namespaces
				//===================================

				const doodad = root.Doodad,
					types = doodad.Types,
					tools = doodad.Tools,
					files = tools.Files,
					config = tools.Config,
					namespaces = doodad.Namespaces,
					modules = doodad.Modules;
				
				const Module = require('module').Module;
				
				//const __Internal__ = {
				//};
				
				
				
				modules.ADD('locate', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 1,
								params: {
									module: {
										type: 'string',
										optional: true,
										description: "Module name",
									},
									file: {
										type: 'string,Path,Url',
										optional: true,
										description: "Module file",
									},
									options: {
										type: 'object',
										optional: true,
										description: "Options",
									},
								},
								returns: 'Promise(string)',
								description: "Locates a module and returns its path.",
					}
					//! END_REPLACE()
					, function locate(/*optional*/_module, /*optional*/file, /*optional*/options) {
						const Promise = types.getPromise();
						return Promise.try(function() {
							let location;
							if (file) {
								file = files.parsePath(file);
							};
							if (!file || file.isRelative) {
								location = files.Path.parse(_module, {file: 'package.json'})
									.toApiString({isRelative: true});
								location = Module._resolveFilename(location, require.main || module.parent);
								location = files.Path.parse(location)
									.set({file: ''});
								if (file) {
									location = location
										.combine(file);
								};
							} else {
								location = file;
							};
							if (location.file) {
								const rootOptions = root.getOptions();
								if (!rootOptions.debug && !rootOptions.fromSource && (location.file !== 'index.js')) {
									// Force minified files.
									const parts = location.file.split('.');
									if ((parts.slice(-1)[0] === 'js') && (parts.slice(-2, -1)[0] !== 'min')) {
										location = location
											.set({file: parts.slice(0, -1).join('.') + '.min.js'});
									};
								};
							} else {
								location = location
									.set({file: 'index.js'});
							};

							return location;
						});
					}));
				
				modules.ADD('loadFiles', function loadFiles(files, /*optional*/options) {
					const Promise = types.getPromise();

					return Promise.map(files, function(file) {
						types.getDefault(file, 'module', null);
						types.getDefault(file, 'path', (file.module ? 'index.js' : null));
						types.getDefault(file, 'optional', false);
						types.getDefault(file, 'isConfig', false);

						file.exports = null;

						return modules.locate(file.module, file.path, options)
							.then(function(location) {
								try {
									file.exports = Module._load(location.toApiString(), (require.main || module.parent));
									return file;
								} catch(err) {
									if (!file.optional) {
										throw err;
									} else {
										return null;
									};
								};
							})
							.catch(function(err) {
								if (file.module) {
									if (file.path) {
										throw new types.Error("Failed to load file '~0~' from module '~1~': ~2~", [file.path, file.module, err]);
									} else {
										throw new types.Error("Failed to load module '~0~': ~1~", [file.module, err]);
									};
								} else {
									throw new types.Error("Failed to load file '~0~': ~1~", [file.path, err]);
								};
							});
					});
				});
				
				modules.ADD('load', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 3,
								params: {
									files: {
										type: 'arrayof(object)',
										optional: false,
										description: "Module files.",
									},
									options: {
										type: 'arrayof(object),object',
										optional: true,
										description: "Options",
									},
								},
								returns: 'Promise(bool)',
								description: "Loads a module.",
					}
					//! END_REPLACE()
					, function load(files, /*optional*/options) {
						const Promise = types.getPromise();

						if (types.isArray(options)) {
							options = types.depthExtend.apply(null, types.append([15, {}], options));
						};

						const trapMissingDeps = function _trapMissingDeps(err) {
								const ignoredMissingDeps = types.get(options, 'ignoredMissingDeps', null);
								const missingDeps = tools.filter(err.missingDeps, function(dep1) {
									return dep1.autoLoad && (tools.findItem(ignoredMissingDeps, function(dep2) {
										return ((dep1.module || '') === (dep2.module || '')) && ((dep1.path || '') === (dep2.path || ''));
									}) === null);
								});
								if (missingDeps.length) {
									const newOptions = types.extend({}, options, {ignoredMissingDeps: missingDeps});
									return modules.load(missingDeps, newOptions)
										.then(function(dummy) {
											return namespaces.load(err.modules, newOptions)
												.catch(types.MissingDependencies, trapMissingDeps);
										});
								} else {
									throw err;
								};
							};

						const DD_MODULES = {};

						let promise = Promise.resolve();

						if (root.getOptions().fromSource) {
							const pkgs = tools.map(
								tools.filter(files, function(dep) {
									return dep.module && !dep.path;
								}), function(dep) {
									return dep.module;
								}
							);
							files = tools.filter(files, function(dep) {
								return !!dep.path;
							});
							if (pkgs.length) {
								promise = promise
									.then(function(dummy) {
										return modules.loadManifests(pkgs, options)
											.then(function(mods) {
												tools.forEach(mods, function(mod) {
													if (types.has(mod, 'add')) {
														mod.add(DD_MODULES);
													};
												});
											});
									});
							};
						};

						return promise
							.then(function(dummy) {
								if (files && files.length) {
									return modules.loadFiles(files, options);
								};
							})
							.then(function(files) {
								if (files && files.length) {
									tools.forEach(files, function(file) {
										if (file && file.isConfig) {
											types.depthExtend(15, options, file.exports, options);
										};
									});
									tools.forEach(files, function(file) {
										if (file && !file.isConfig) {
											file.exports.add(DD_MODULES);
										};
									});
								};
							})
							.then(function(dummy) {
								return namespaces.load(DD_MODULES, options)
									.catch(types.MissingDependencies, trapMissingDeps);
							})
							.then(function(dummy) {
								return root;
							});
					}));
				
				
				modules.ADD('loadManifest', function loadManifest(pkg, /*optional*/options) {
					const Promise = types.getPromise();
					return modules.loadFiles([
							{module: pkg, path: 'package.json'},
							{module: pkg, path: 'make.json'},
						], options)
						.then(function(files) {
							return {
								manifest: files[0].exports,
								makeManifest: files[1].exports,
							};
						})
						.then(function(manifests) {
							const manifest = manifests.manifest,
								makeManifest = manifests.makeManifest;
							
							return {
								add: function(DD_MODULES) {
									DD_MODULES = DD_MODULES || {};
									DD_MODULES[manifest.name] = {
										type: makeManifest.type || 'Package',
										version: manifest.version + (manifest.stage || 'd'),
										dependencies: tools.filter(makeManifest.dependencies, function(dep) {
											return dep.server && !dep.test;
										}).map(function(dep) {
											return types.extend({}, dep, {type: types.get(dep, 'type', 'Package')});
										}),
										
										create: function create(root, /*optional*/_options, _shared) {
											"use strict";
											
											const doodad = root.Doodad,
												modules = doodad.Modules,
												fromSource = root.getOptions().fromSource;
											
											let files = tools.filter(makeManifest.modules, function(mod) {
												return mod.server && !mod.exclude && !mod.test;
											});

											files = tools.map(files, function(file) {
												return {
													module: manifest.name,
													path: (fromSource ?
															(makeManifest.sourceDir || './src') + '/' + file.src
														:
															(makeManifest.buildDir || './build') + '/' + file.src.replace(/([.]js)$/, ".min.js")
														),
													optional: types.get(file, 'optional', false),
												};
											}, []);
											
											files.push({
												module: manifest.name,
												path: 'config.json',
												optional: true,
												isConfig: true,
											});

											return modules.load(files, types.depthExtend(15, {}, _options, {startup: {secret: _shared.SECRET}}))
												.then(function() {
													// Returns nothing.
												});
										},
									};
									return DD_MODULES;
								},
							};
						});
				});
				
				modules.ADD('loadManifests', function loadManifests(pkgs, /*optional*/options) {
					const Promise = types.getPromise();
					return Promise.map(pkgs, function(pkg) {
						return modules.loadManifest(pkg, options);
					});
				});
				
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