//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2017 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Modules.js - Doodad Modules management (client-side)
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
			dependencies: [
				'Doodad.Tools', 
				'Doodad.Tools.Config', 
				'Doodad.Tools.Files', 
				'Doodad.Types', 
				'Doodad.Namespaces', 
				'Doodad.Client',
			],
			bootstrap: true,
			
			create: function create(root, /*optional*/_options, _shared) {
				"use strict";

				//===================================
				// Get namespaces
				//===================================

				const doodad = root.Doodad,
					tools = doodad.Tools,
					files = tools.Files,
					config = tools.Config,
					types = doodad.Types,
					namespaces = doodad.Namespaces,
					modules = doodad.Modules;
				


				const __options__ = types.extend({
					modulesUri: './',
				}, _options);

				types.freezeObject(__options__);

				modules.ADD('getOptions', function getOptions() {
					return __options__;
				});
				

				
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
										description: "Module name.",
									},
									path: {
										type: 'string,Path,Url',
										optional: true,
										description: "Module file path.",
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
					, function locate(/*optional*/module, /*optional*/path, /*optional*/options) {
						const Promise = types.getPromise();

						return Promise.try(function() {
							if (path) {
								path = files.parseUrl(path);
							};
							let location;
							if (!path || path.isRelative) {
								location = tools.getCurrentLocation()
									.removeArgs(['redirects', 'crashReport', 'crashRecovery']) // TODO: Put these hard coded names in a common constant
									.set({file: null})
									.combine(types.get(options, 'modulesUri', __options__.modulesUri))
									.combine(files.Path.parse(module))
									.pushFile();
								if (path) {
									location = location
										.combine(path);
								};
							} else {
								location = path;
							};
							if (location.file) {
								if (!root.getOptions().debug) {
									// Force minified files.
									const parts = location.file.split('.');
									if ((parts.slice(-1)[0] === 'js') && (parts.slice(-2, -1)[0] !== 'min')) {
										location = location
											.set({file: parts.slice(0, -1).join('.') + '.min.js'});
									};
								};
							} else {
								location = location
									.set({file: (root.getOptions().debug ? module + '.js' : module + '.min.js')});
							};
							return location;
						});
					}));
				
				modules.ADD('loadFiles', function loadFiles(filesToLoad, /*optional*/options) {
					const Promise = types.getPromise();

					const fromSource = root.getOptions().fromSource;

					return Promise.map(filesToLoad, function(file) {
						types.getDefault(file, 'module', null);
						types.getDefault(file, 'path', null);
						types.getDefault(file, 'optional', false);
						types.getDefault(file, 'isConfig', false);

						file.exports = null;

						return modules.locate(file.module, file.path, options)
							.then(function(location) {
								let promise = null;
								if (file.isConfig) {
									promise = config.load(location, {async: true, encoding: 'utf-8'});

								} else if (root.getOptions().debug) {
									// In debug mode, we want to be able to open a JS file with the debugger.
									promise = Promise.create(function startScriptLoader(resolve, reject) {
											const scriptLoader = tools.getJsScriptFileLoader(/*url*/location, /*async*/true);
											scriptLoader.addEventListener('load', function() {
												//file.exports = ??? // <PRB> unable to get a reference to the loaded script and its exports
												resolve(null);
											});
											scriptLoader.addEventListener('error', function(ev) {
												reject(ev.detail ? ev.detail : new types.Error("Unspecified error (the browser didn't give any error detail)."));
											});
											scriptLoader.start();
										})
								} else {
									promise = files.readFileAsync(location, {encoding: 'utf-8', headers: {Accept: 'application/javascript'}, enableCache: false})
										.then(function(code) {
											const DD_MODULE = {exports: {}};
											const locals = {DD_MODULE: DD_MODULE, DD_MODULES: undefined};
											const evalFn = types.createEval(types.keys(locals), false).apply(null, types.values(locals));
											evalFn(code);
											return DD_MODULE.exports;
										})
								};

								return promise
									.nodeify(function(err, exports) {
										if (err) {
											if (!file.optional) {
												throw err;
											} else {
												return null;
											};
										} else {
											file.exports = exports;
											return file;
										};
									});
							})
							.catch(function(err) {
								if (module) {
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
								revision: 6,
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
						//const Promise = types.getPromise();

						if (types.isArray(options)) {
							options = types.depthExtend.apply(null, types.append([15, {}], options));
						};

						const trapMissingDeps = function _trapMissingDeps(err) {
								const ignoredMissingDeps = types.get(options, 'ignoredMissingDeps', null);
								if (ignoredMissingDeps && ignoredMissingDeps.length && tools.every(ignoredMissingDeps, function(dep1) {
											return (tools.findItem(err.missingDeps, function(dep2) {
												return (dep1.module === dep2.module) && (dep1.path === dep2.path);
											}) !== null);
										})) {
									throw err;
								};
								const newOptions = types.extend({}, options, {ignoredMissingDeps: err.missingDeps});
								return modules.load(err.missingDeps, newOptions)
									.then(function(dummy) {
										return namespaces.load(err.modules, newOptions)
											.catch(types.MissingDependencies, trapMissingDeps);
									});
							};

						if (root.getOptions().debug) {
							global.DD_MODULES = {};
						};

						return modules.loadFiles(files, options)
							.then(function(files) {
								// Load configuration files.
								tools.forEach(files, function(file) {
									if (file && file.isConfig) {
										types.depthExtend(15, options, file.exports, options);
									};
								});

								// Get Doodad modules from JS script files.
								let DD_MODULES = null;

								if (root.getOptions().debug) {
									DD_MODULES = global.DD_MODULES;
									delete global.DD_MODULES;
								} else {
									DD_MODULES = {};
									tools.forEach(files, function(file) {
										if (file && !file.isConfig) {
											if (types.has(file.exports, 'add')) {
												file.exports.add(DD_MODULES);
											};
										};
									});
								};

								// Load modules.
								return namespaces.load(DD_MODULES, options)
									.catch(types.MissingDependencies, trapMissingDeps);
							})
							.then(function(dummy) {
								return root;
							});
					}));
				
				
				
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