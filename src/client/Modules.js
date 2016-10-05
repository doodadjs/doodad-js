//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2016 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Modules.js - Doodad Modules management (client-side)
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

				var doodad = root.Doodad,
					tools = doodad.Tools,
					files = tools.Files,
					config = tools.Config,
					types = doodad.Types,
					namespaces = doodad.Namespaces,
					modules = doodad.Modules;
				


				var __options__ = types.extend({
					modulesUri: './',
				}, _options);

				types.freezeObject(__options__);

				modules.getOptions = function() {
					return __options__;
				};
				

				
				//var __Internal__ = {
				//};
			
				
					
				modules.locate = root.DD_DOC(
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
					, function locate(module, /*optional*/path, /*optional*/options) {
						var Promise = types.getPromise();
						return Promise['try'](function() {
							var location = tools.getCurrentLocation()
								.removeArgs(['redirects', 'crashReport', 'crashRecovery']) // TODO: Put these hard coded names in a common constant
								.set({file: null})
								.combine(types.get(options, 'modulesUri', __options__.modulesUri))
								.combine(files.Path.parse(module, {os: 'linux'}))
								.pushFile();
							if (path) {
								location = location
									.combine(files.Path.parse(path, {os: 'linux', isRelative: true}));
							};
							if (!location.file) {
								location = location
									.set({file: 'index.js'});
							};
							return location;
						});
					});
				
				modules.loadFiles = function loadFiles(module, files, /*optional*/options) {
					var Promise = types.getPromise();

					// Convert to array of objects for Promise.map
					files = tools.reduce(files, function(files, fileOptions, name) {
						files.push({
							module: module,
							name: name,
							options: types.complete(fileOptions, {optional: false, isConfig: false, configOptions: null}),
						});
						return files;
					}, []);

					return Promise.map(files, function(file) {
						return modules.locate(file.module, file.name, options)
							.then(function(location) {
								if (file.options.isConfig) {
									return config.load(location, {async: true, encoding: 'utf-8'})
										.nodeify(function(err, conf) {
											if (err) {
												if (!file.options.optional) {
													throw err;
												};
											} else {
												types.depthExtend(2, file.configOptions, conf, file.configOptions);
											};
											return file;
										});
								} else {
									return Promise.create(function startScriptLoader(resolve, reject) {
										var scriptLoader = tools.getJsScriptFileLoader(/*url*/location, /*async*/true);
										scriptLoader.addEventListener('load', function() {
											file.exports = null; // <PRB> unable to get a reference to the loaded script and its exports
											resolve(file);
										});
										scriptLoader.addEventListener('error', function(ev) {
											reject(ev.detail ? ev.detail : new types.Error("Unspecified error."));
										});
										scriptLoader.start();
									})
										.nodeify(function(err, result) {
											if (err) {
												if (!file.options.optional) {
													throw err;
												} else {
													return null;
												};
											} else {
												return result;
											};
										});
								};
							})
							['catch'](function(err) {
								throw new types.Error("Failed to load file '~0~' from module '~1~': ~2~", [file.name, file.module, err]);
							});
					}, options);
				};
				
				modules.load = root.DD_DOC(
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
										type: 'object',
										optional: true,
										description: "Options",
									},
								},
								returns: 'Promise(bool)',
								description: "Loads a module.",
					}
					//! END_REPLACE()
					, function load(_modules, /*optional*/options) {
						var Promise = types.getPromise();
						var fromSource = root.getOptions().fromSource;
						global.DD_MODULES = {};

						options = types.depthExtend(2, {}, options);

						// Convert to array of objects for Promise.map
						_modules = tools.reduce(_modules, function(_modules, files, name) {
							if (!files || types.isEmpty(files)) {
								files = {
									'config.json': {optional: true, isConfig: true, configOptions: options},
								};
								if (fromSource) {
									files[name + '_debug.js'] = {optional: false};
								} else {
									files[name + '.js'] = {optional: false};
								};
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
								var retval = namespaces.load(global.DD_MODULES, null, options);
								delete global.DD_MODULES;
								return retval;
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