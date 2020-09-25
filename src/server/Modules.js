//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
	// doodad-js - Object-oriented programming framework
	// File: Modules.js - Doodad Modules management (server-side)
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
	//! INJECT("import {createRequire as nodeModuleCreateRequire} from 'module';");
	//! INJECT("import {default as amp} from 'app-module-path';")

//! ELSE()

	"use strict";

	const amp = require('app-module-path');

//! END_IF()


const ampAddPath = amp.addPath;

exports.add = function add(mods) {
	mods = (mods || {});
	mods['Doodad.Modules'] = {
		version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
		dependencies: [
			'Doodad.Tools',
			'Doodad.Tools.Config',
			'Doodad.Tools.Files',
			'Doodad.Tools.JSON5',
			'Doodad.Types',
			'Doodad.Namespaces',
			'Doodad.NodeJs/root',
		],
		bootstrap: true,

		create: function create(root, /*optional*/_options, _shared) {
			//===================================
			// Get namespaces
			//===================================

			const doodad = root.Doodad,
				types = doodad.Types,
				tools = doodad.Tools,
				config = tools.Config,
				files = tools.Files,
				namespaces = doodad.Namespaces,
				modules = doodad.Modules;


			const __Internal__ = {
			};


			__Internal__.throwFileError = function throwFileError(file, err) {
				if (file.module) {
					if (file.path) {
						throw new types.Error("Failed to load file '~0~' from module '~1~': ~2~", [file.path, file.module, err]);
					} else {
						throw new types.Error("Failed to load module '~0~': ~1~", [file.module, err]);
					}
				} else {
					throw new types.Error("Failed to load file '~0~': ~1~", [file.path, err]);
				}
			};


			//modules.ADD('getLocator', function getLocator() {
			//	return __Internal__.locatorModule;
			//});

			// TODO: Replace by native ??? when implemented.
			modules.ADD('addSearchPath', function addSearchPath(path) {
				path = types.toString(path);

				ampAddPath(path);
				//ampAddPath(path, __Internal__.locatorModule);
			});

			// TODO: Replace by native ??? when implemented for MJS.
			modules.ADD('resolve', function _resolve(location) {
				if (!types._instanceof(location, files.Path)) {
					location = files.parsePath(location);
				};
				if (location.isRelative) {
					const newLocation = location.toArray();
					if (newLocation.length > 0) {
						const pkg = [newLocation.shift()];
						if (pkg[0] && pkg[0][0] === '@') {
							pkg.push(newLocation.shift());
						};
						const pkgPath =  __Internal__.require.resolve(pkg.join('/') + '/package.json');
						if (newLocation.length > 0) {
							const path = files.Path.parse(pkgPath).set({file: ''}).combine(newLocation.join('/'));
							return path;
						};
						return files.Path.parse(pkgPath).set({file: ''});
					};
				};
				return  files.Path.parse(__Internal__.require.resolve(location.toApiString()));
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
				, function locate(/*optional*/_module, /*optional*/path, /*optional*/options) {
					const ddOptions = root.getOptions();
					const dontForceMin = types.get(options, 'dontForceMin', false) || ddOptions.debug || ddOptions.fromSource;

					const Promise = types.getPromise();
					return Promise.try(function() {
						let location;

						if (path) {
							path = files.parsePath(path);
						};

						if (_module && (!path || path.isRelative)) {
							location = files.parsePath(_module, {isRelative: true, isFolder: false});
							if (path) {
								location = location.toFolder().combine(path);
							};
						} else {
							location = path;
						};

						if (location && location.file) {
							const ext = '.' + location.extension + '.';
							if (!dontForceMin && (ext.endsWith('.js.') || ext.endsWith('.mjs.'))) {
								// Force minified files.
								if (ext.indexOf('.min.') < 0) {
									location = location.set({extension: 'min.' + location.extension});
								};
							};
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

					file.exports = null;

					return modules.locate(file.module, file.path, file)
						.then(function(location) {
							const ext = '.' + location.extension;

							const path = (file.module && file.path ? modules.resolve(location) : location);

							if (file.isConfig || ext.endsWith('.json') || ext.endsWith('.json5')) {
								file.isConfig = true;
								return config.load(path)
									.then(function(config) {
										return {
											default: config,
										};
									});

								//! IF_SET("mjs")
									//! INJECT("} else {")
									//! INJECT("	return import(path.toApiString());")
									//! INJECT("};")
								//! END_IF()

								//! IF_UNSET("mjs")
								} else {
									return Promise.try(function tryImport() {
										return {
											default: __Internal__.require(path.toApiString())
										};
									});
								};
							//! END_IF()
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
							__Internal__.throwFileError(file, err);
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
					/* eslint consistent-return: "off" */

					const Promise = types.getPromise();

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
						}
					};

					const pkgModules = {};

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
													mod.add(pkgModules);
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
									if (file && file.isConfig && file.exports) {
										tools.depthExtend(15, options, file.exports.default, options);
									};
								});
								tools.forEach(files, function(file) {
									const ext = '.' + file.extension;
									if (file && !file.isConfig && !ext.endsWith('.json') && !ext.endsWith('.json5') && file.exports) {
										const def = types.get(file.exports, 'default', null);
										const add = types.get(file.exports, 'add', types.get(def, 'add', null));
										if (!types.isFunction(add)) {
											__Internal__.throwFileError(file, new types.Error("Missing the 'add' function in the exported values of the module."));
										};
										add(pkgModules);
									};
								});
							};
						})
						.then(function(dummy) {
							return namespaces.load(pkgModules, options)
								.catch(types.MissingDependencies, trapMissingDeps);
						})
						.then(function(dummy) {
							return root;
						});
				}));


			modules.ADD('loadManifest', function loadManifest(pkg, /*optional*/options) {
				//const Promise = types.getPromise();
				return modules.loadFiles([
					{module: pkg, path: 'package.json'},
					{module: pkg, path: 'make.json'},
				], options)
					.then(function(files) {
						const manifest = files[0].exports.default,
							makeManifest = files[1].exports.default;

						return {
							add: function(mods) {
								mods = mods || {};
								mods[manifest.name] = {
									type: makeManifest.type || 'Package',
									version: makeManifest.version + (makeManifest.stage || 'd'),
									dependencies: tools.filter(makeManifest.dependencies || [], function(dep) {
										return dep.server && !dep.test;
									}).map(function(dep) {
										return tools.extend({type: 'Package'}, dep);
									}),

									create: function create(root, /*optional*/_options, _shared) {
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
													(makeManifest.sourceDir || './src') + '/' + file.src :
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

										return modules.load(files, tools.depthExtend(15, {}, _options, {startup: {secret: _shared.SECRET}}))
											.then(function() {
												// Returns nothing.
											});
									},
								};
								return mods;
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
			return function init(/*optional*/options) {
				//! IF_SET("mjs")
					//! INJECT("__Internal__.require = nodeModuleCreateRequire(import.meta.url);")
				//! ELSE()
					__Internal__.require = require;
				//! END_IF();
			};
		},
	};
	return mods;
};

//! END_MODULE()
