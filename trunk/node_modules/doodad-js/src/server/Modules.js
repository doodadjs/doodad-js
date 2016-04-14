//! REPLACE_BY("// Copyright 2016 Claude Petit, licensed under Apache License version 2.0\n", true)
// dOOdad - Object-oriented programming framework
// File: Modules.js - Doodad Modules management (server-side)
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
	
	//! BEGIN_REMOVE()
	if ((typeof process === 'object') && (typeof module === 'object')) {
	//! END_REMOVE()
		//! IF_DEF("serverSide")
			module.exports = exports;
		//! END_IF()
	//! BEGIN_REMOVE()
	};
	//! END_REMOVE()
	
	exports.add = function add(DD_MODULES) {
		DD_MODULES = (DD_MODULES || {});
		DD_MODULES['Doodad.Modules'] = {
			version: '2.2.0r',
			dependencies: ['Doodad.Tools', 'Doodad.Tools.Config', 'Doodad.Tools.Files', 'Doodad.Types', 'Doodad.Namespaces', 'Doodad.NodeJs'],
			bootstrap: true,
			
			create: function create(root, /*optional*/_options) {
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
				
				const Module = module.constructor;
				
				const __Internal__ = {
					rootModule: null,
					getRootModule: function getRootModule() {
						if (__Internal__.rootModule) {
							return __Internal__.rootModule;
						};
						let mod;
						do {
							__Internal__.rootModule = mod;
							mod = module.parent;
						} while (mod && (mod !== __Internal__.rootModule))
						return __Internal__.rootModule;
					},
				};
				
				
				
				modules.locate = root.DD_DOC(
					//! REPLACE_BY("null")
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
					, function locate(module, /*optional*/file, /*optional*/options) {
						const Promise = types.getPromise();
						let location = files.Path.parse(module, {file: 'package.json'})
							.toString({isRelative: true});
						location = Module._resolveFilename(location, __Internal__.getRootModule());
						location = files.Path.parse(location)
							.set({file: ''})
							.combine(file, {dirChar: ['/', '\\'], isRelative: true});
						return Promise.resolve(location);
					});
				
				modules.loadFiles = function loadFiles(module, files, /*optional*/options) {
					const Promise = types.getPromise();
					if (!types.isArray(files)) {
						files = [files];
					};
					return Promise.all(tools.map(files, function(fname) {
						return modules.locate(module, fname, options)
							.then(function(location) {
								const content = Module._load(location.toString(), __Internal__.getRootModule());
								return {
									name: fname, 
									content: content,
								};
							})
							['catch'](function(err) {
								throw new types.Error("Failed to load file '~0~' from module '~1~': ~2~.", [fname, module, err]);
							});
					}));
				};
				
				modules.load = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 2,
								params: {
									module: {
										type: 'string',
										optional: false,
										description: "Module name",
									},
									files: {
										type: 'string,Path,Url,arrayof(string,Path,Url)',
										optional: true,
										description: "Module file",
									},
									options: {
										type: 'object',
										optional: true,
										description: "Options",
									},
								},
								returns: 'Promise(bool)',
								description: "Loads a module.",
					}
					//! END_REPLACE()
					, function load(module, /*optional*/files, /*optional*/options) {
						const opts = {};
						return modules.loadFiles(module, 'config.json', options)
							.nodeify(function(err, _files) {
								if (!err) {
									types.depthExtend(2, opts, _files[0].content, options);
								}
								return modules.loadFiles(module, files || 'index.js', options);
							})
							.then(function(_files) {
								const DD_MODULES = {};
								tools.forEach(_files, function(file) {
									const mod = file.content;
									mod.add(DD_MODULES);
									return mod;
								});
								return namespaces.load(DD_MODULES, null, opts, false);
							});
					});
				
				
				modules.loadManifest = function loadManifest(manifest, /*optional*/options) {
					const Promise = types.getPromise();
					let promise;
					if (types.isString(manifest)) {
						promise = modules.loadFiles(manifest, ['package.json', 'make.json'], options)
							.then(function(contents) {
								return {
									manifest: contents[0].content,
									makeManifest: contents[1].content,
								};
							});
					} else {
						promise = Promise.resolve(manifest);
					};
					return promise.then(function(manifests) {
						const manifest = manifests.manifest,
							makeManifest = manifests.makeManifest;
						
						return {
							add: function add(DD_MODULES) {
								DD_MODULES = (DD_MODULES || {});
								DD_MODULES[manifest.name] = {
									type: makeManifest.type,
									version: manifest.version + (manifest.stage || 'd'),
									dependencies: tools.filter(makeManifest.dependencies, function(dep) {
										return dep.server;
									}),
									
									create: function create(root, /*optional*/_options) {
										"use strict";
										
										const doodad = root.Doodad,
											modules = doodad.Modules,
											fromSource = root.getOptions().fromSource;
										
										const files = tools.map(tools.filter(makeManifest.modules, function(mod) {
											return mod.server;
										}), function(mod) {
											return (fromSource 
												?
													(makeManifest.sourceDir || './src') + '/' + mod.src 
												: 
													(makeManifest.buildDir || './build') + '/' + mod.src.replace(/([.]js)$/, ".min.js")
											);
										});
										
										return modules.load(manifest.name, files, _options)
											.then(function() {
												// Returns nothing
											});
									},
								};
								return DD_MODULES;
							},
						};
					});
				};
				
				
				//===================================
				// Init
				//===================================
				//return function init(/*optional*/options) {
				//};
			},
		};
		
		return DD_MODULES;
	};
	
	//! BEGIN_REMOVE()
	if ((typeof process !== 'object') || (typeof module !== 'object')) {
	//! END_REMOVE()
		//! IF_UNDEF("serverSide")
			// <PRB> export/import are not yet supported in browsers
			global.DD_MODULES = exports.add(global.DD_MODULES);
		//! END_IF()
	//! BEGIN_REMOVE()
	};
	//! END_REMOVE()
}).call(
	//! BEGIN_REMOVE()
	(typeof window !== 'undefined') ? window : ((typeof global !== 'undefined') ? global : this)
	//! END_REMOVE()
	//! IF_DEF("serverSide")
	//! 	INJECT("global")
	//! ELSE()
	//! 	INJECT("window")
	//! END_IF()
);