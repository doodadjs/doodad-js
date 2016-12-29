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
								revision: 0,
								params: {
									module: {
										type: 'string',
										optional: false,
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
					, function locate(_module, /*optional*/file, /*optional*/options) {
						const Promise = types.getPromise();
						return Promise.try(function() {
							let location = files.Path.parse(_module, {file: 'package.json'})
								.toString({isRelative: true});
							location = Module._resolveFilename(location, require.main || module.parent);
							location = files.Path.parse(location)
								.set({file: ''})
								.combine(file, {dirChar: ['/', '\\'], isRelative: true});
							return location;
						});
					}));
				
				modules.ADD('loadFiles', function loadFiles(_module, files, /*optional*/options) {
					const Promise = types.getPromise();

					// Convert to array of objects for Promise.map
					files = tools.reduce(files, function(files, fileOptions, name) {
						files.push({
							module: _module,
							name: name,
							options: types.extend({optional: false, isConfig: false, configOptions: null}, fileOptions),
						});
						return files;
					}, []);

					return Promise.map(files, function(file) {
						return modules.locate(file.module, file.name, options)
							.then(function(location) {
								if (file.options.isConfig) {
									try {
										const conf = Module._load(location.toString(), require.main || module.parent);
										types.depthExtend(2, file.configOptions, conf, file.configOptions);
									} catch(err) {
										if (!file.options.optional) {
											throw err;
										};
									};
								} else {
									try {
										file.exports = Module._load(location.toString(), require.main || module.parent);
									} catch(err) {
										file.exports = null;
										if (!file.options.optional) {
											throw err;
										};
									};
								};
								return file;
							})
							['catch'](function(err) {
								throw new types.Error("Failed to load file '~0~' from module '~1~': ~2~", [file.name, file.module, err]);
							});
					});
				});
				
				modules.ADD('load', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 3,
								params: {
									modules: {
										type: 'object',
										optional: false,
										description: "Module names with their files",
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
					, function load(_modules, /*optional*/options) {
						const Promise = types.getPromise();
						//const fromSource = root.getOptions().fromSource;

						if (types.isArray(options)) {
							options = types.depthExtend.apply(null, types.append([15, {}], options));
						};

						// Convert to array of objects for Promise.map
						_modules = tools.reduce(_modules, function(_modules, files, name) {
							name = name.split('/', 2)[0];
							if (!files) {
								files = {};
							};
							if (types.isEmpty(files)) {
								files['index.js'] = {optional: false};
							};
							_modules.push({
								name: name,
								files: files,
							});
							return _modules;
						}, []);

						return Promise.map(_modules, function(module) {
								return modules.loadFiles(module.name, module.files, options);
							})
							.then(function(_modules) {
								const DD_MODULES = {};
								tools.forEach(_modules, function(_files) {
									tools.forEach(_files, function(file) {
										if (!file.options.isConfig && file.exports.add) {
											file.exports.add(DD_MODULES);
										};
									});
								});
								return namespaces.load(DD_MODULES, options);
							});
					}));
				
				
				modules.ADD('loadManifest', function loadManifest(pkg, /*optional*/options) {
					const Promise = types.getPromise();
					return modules.loadFiles(pkg, {'package.json': {}, 'make.json': {}}, options)
						.then(function(contents) {
							return {
								manifest: contents[0].exports,
								makeManifest: contents[1].exports,
							};
						})
						.then(function(manifests) {
							const manifest = manifests.manifest,
								makeManifest = manifests.makeManifest;
							
							return {
								add: function(DD_MODULES) {
									DD_MODULES = DD_MODULES || {};
									DD_MODULES[manifest.name] = {
										type: makeManifest.type,
										version: manifest.version + (manifest.stage || 'd'),
										dependencies: tools.filter(makeManifest.dependencies, function(dep) {
											return dep.server && !dep.manual && !dep.test;
										}),
										
										create: function create(root, /*optional*/_options, _shared) {
											"use strict";
											
											const doodad = root.Doodad,
												modules = doodad.Modules,
												fromSource = root.getOptions().fromSource;
											
											let files = tools.filter(makeManifest.modules, function(mod) {
												return mod.server && !mod.manual && !mod.test;
											});

											files = tools.reduce(files, function(files, mod) {
												const file = (fromSource ?
														(makeManifest.sourceDir || './src') + '/' + mod.src
													:
														(makeManifest.buildDir || './build') + '/' + mod.src.replace(/([.]js)$/, ".min.js")
													);
												files[file] = {optional: types.get(mod, 'optional', false)};
												return files;
											}, {});
											
											return modules.load({[manifest.name]: files}, types.extend({}, _options, {secret: _shared.SECRET}))
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