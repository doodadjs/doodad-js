//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
	// doodad-js - Object-oriented programming framework
	// File: Modules.js - Doodad Modules management (client-side)
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
	modules['Doodad.Modules'] = {
		version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
		dependencies: [
			'Doodad.Tools',
			'Doodad.Tools.Config',
			'Doodad.Tools.Files',
			'Doodad.Tools.JSON5',
			'Doodad.Types',
			'Doodad.Namespaces',
			'Doodad.Client',
		],
		bootstrap: true,

		create: function create(root, /*optional*/_options, _shared) {
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


			const __options__ = tools.extend({
				modulesUri: './',
			}, _options);

			types.freezeObject(__options__);

			modules.ADD('getOptions', function getOptions() {
				return __options__;
			});


			const __Internal__ = {
				getPackageName: function getPackageName(name) {
					return ((name[0] === '@') ? name.split('/')[1] : name);
				},
			};

			// TODO: Replace by native ??? when implemented.
			modules.ADD('resolve', function _resolve(location) {
				if (!types._instanceof(location, files.Url)) {
					location = files.Url.parse(location);
				};

				if (location.isRelative) {
					const current = tools.getCurrentLocation();
					location = current
						.removeArgs()
						//.setArgs({sessionId: current.getArg('sessionId', true)}) // TODO: User Sessions
						.set({file: ''})
						.combine(__options__.modulesUri)
						.toFolder()
						.combine(location);
				};

				return location;
			});

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
						const ddOptions = root.getOptions();
						const dontForceMin = types.get(options, 'dontForceMin', false) || ddOptions.debug || ddOptions.fromSource;
						const mjs = types.get(options, 'mjs', false);

						if (path) {
							path = files.parseUrl(path).removeArgs(['redirects', 'crashReport', 'crashRecovery']); // TODO: Put these hard coded names in a common constant
						};

						let location;
						if (module) {
							if (path) {
								if (path.isRelative) {
									location = files.parseUrl(module, {isRelative: true}).toFolder().combine(path);
								} else {
									module = null;
									location = path;
								};
							} else {
								location = files.parseUrl(module, {isRelative: true}).toFolder();
							}
						} else {
							if (path && path.isRelative) {
								location = tools.getCurrentLocation().set({file: '', args: ''}).combine(path);
							} else {
								location = path;
							};
						};

						if (location && location.file) {
							const ext = '.' + location.extension + '.';
							if (ext.endsWith('.js.') || ext.endsWith('.mjs.')) {
								if (!dontForceMin && (ext.indexOf('.min.') < 0)) {
									// Force minified MJS or JS files.
									location = location.set({extension: 'min.' + location.extension});
								};
							};
						} else if (module && !path) {
							location = location.set({file: __Internal__.getPackageName(module) + (dontForceMin ? '' : '.min') + (mjs ? '.mjs' : '.js')});
						};

						const ext2 = '.' + location.extension + '.';
						const integrity = types.get(options, (ext2.endsWith('.mjs.') ? ((ext2.indexOf('.min.') >= 0) ? 'integrityMjsMin' : 'integrityMjs') : ((ext2.indexOf('.min.') >= 0) ? 'integrityMin' : 'integrity')), null);
						if (integrity) {
							location = location.setArgs({integrity});
						};

						return location;
					});
				}));

			modules.ADD('loadFiles', function loadFiles(filesToLoad, /*optional*/options) {
				const Promise = types.getPromise();

				return Promise.map(filesToLoad, function(file) {
					types.getDefault(file, 'module', null);
					types.getDefault(file, 'path', null);
					types.getDefault(file, 'optional', false);
					types.getDefault(file, 'isConfig', false);
					types.getDefault(file, 'mjs', false);
					types.getDefault(file, 'dontForceMin', false);
					types.getDefault(file, 'integrity', null);
					types.getDefault(file, 'integrityMin', null);
					types.getDefault(file, 'integrityMjs', null);
					types.getDefault(file, 'integrityMjsMin', null);

					file.exports = null;

					return modules.locate(file.module, file.path, file)
						.then(function(location) {
							const ext = '.' + location.extension;

							const url = (file.module ? modules.resolve(location) : location);

							if (file.isConfig || ext.endsWith('.json') || ext.endsWith('.json5')) {
								file.isConfig = true;
								return config.load(url)
									.then(function(config) {
										return {
											default: config,
										};
									});
							//! IF_SET("mjs")
								//! INJECT("} else if (file.mjs || ext.endsWith('.mjs')) {")
								//! INJECT("	file.mjs = true;")
								//! INJECT("	return import(url.toApiString());")
							//! END_IF()
							} else if (root.getOptions().debug) {
								// In debug mode, we want to be able to open a JS file with the debugger.
								return Promise.create(function startScriptLoader(resolve, reject) {
									//const DD_EXPORTS = {};
									//global.DD_EXPORTS = DD_EXPORTS;
									////delete global.DD_MODULES;
									//global.DD_MODULES = undefined;
									const scriptLoader = tools.getJsScriptFileLoader(/*url*/url, /*async*/true);
									scriptLoader.addEventListener('load', function() {
										//resolve(DD_EXPORTS);
										////delete global.DD_EXPORTS;
										//global.DD_EXPORTS = undefined;
										resolve(null);
									});
									scriptLoader.addEventListener('error', function(ev) {
										reject(ev.detail ? ev.detail : new types.Error("Unspecified error (the browser didn't give any error detail)."));
									});
									scriptLoader.start();
								});
							} else {
								file.mjs = true; // faked MJS import
								return files.readFileAsync(url, {encoding: 'utf-8', headers: {'Accept': 'application/javascript'}, enableCache: !!url.getArg('integrity', true)})
									.then(function(code) {
										const DD_EXPORTS = {};
										const locals = {DD_EXPORTS, DD_MODULES: undefined};
										const evalFn = tools.createEval(types.keys(locals), false).apply(null, types.values(locals));
										evalFn(code);
										return {default: DD_EXPORTS};
									});
							};
						})
						.catch(function(err) {
							if (file.optional) {
								return null;
							} else {
								throw err;
							}
						})
						.then(function(exports) {
							file.exports = exports;
							return file;
						})
						.catch(function(err) {
							if (file.module) {
								if (file.path) {
									throw new types.Error("Failed to load file '~0~' from module '~1~': ~2~", [file.path, file.module, err]);
								} else {
									throw new types.Error("Failed to load module '~0~': ~1~", [file.module, err]);
								}
							} else {
								throw new types.Error("Failed to load file '~0~': ~1~", [file.path, err]);
							}
						});
				}/*, {concurrency: root.getOptions().debug ? 1 : Infinity}*/);
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
						description: "Loads one or more Doodad module file(s).",
					}
				//! END_REPLACE()
				, function load(files, /*optional*/options) {
					//const Promise = types.getPromise();

					if (types.isArray(options)) {
						options = tools.depthExtend.apply(null, tools.append([15, {}], options));
					};

					const trapMissingDeps = function _trapMissingDeps(err) {
						const ignoredMissingDeps = types.get(options, 'ignoredMissingDeps', null);
						const missingDeps = tools.filter(err.missingDeps, function(dep1) {
							return dep1.autoLoad && (tools.findItem(ignoredMissingDeps, function(dep2) {
								return ((dep1.module || '') === (dep2.module || '')) && ((dep1.path || '') === (dep2.path || ''));
							}) === null);
						});
						if (missingDeps.length) {
							const newOptions = tools.extend({}, options, {ignoredMissingDeps: missingDeps});
							return modules.load(missingDeps, newOptions)
								.then(function(dummy) {
									return namespaces.load(err.modules, newOptions)
										.catch(types.MissingDependencies, trapMissingDeps);
								});
						} else {
							throw err;
						};
					};

					if (root.getOptions().debug) {
						global.DD_MODULES = {};
					};

					return modules.loadFiles(files, options)
						.then(function(files) {
							// Load configuration files.
							tools.forEach(files, function(file) {
								if (file && file.isConfig) {
									tools.depthExtend(15, options, file.exports, options);
								};
							});

							// Get Doodad modules from JS script files.
							const pkgModules = global.DD_MODULES || {};
							//delete global.DD_MODULES;
							global.DD_MODULES = undefined;
							tools.forEach(files, function(file) {
								if (file && file.mjs && !file.isConfig) {
									file.exports.default.add(pkgModules);
								};
							});

							// Load modules.
							return namespaces.load(pkgModules, options)
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
	return modules;
};

//! END_MODULE()
