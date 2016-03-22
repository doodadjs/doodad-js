//! REPLACE_BY("// Copyright 2016 Claude Petit, licensed under Apache License version 2.0\n")
// dOOdad - Object-oriented programming framework
// File: Modules.js - Doodad Modules management (client-side)
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
		DD_MODULES['Doodad.Modules'] = {
			type: null,
			version: '2.2.0r',
			namespaces: null,
			dependencies: ['Doodad.Tools', 'Doodad.Tools.Config', 'Doodad.Tools.Files', 'Doodad.Types', 'Doodad.Namespaces', 'Doodad.Client'],
			bootstrap: true,
			exports: exports,
			
			create: function create(root, /*optional*/_options) {
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
				


				//__Internal__.oldSetOptions = modules.setOptions;
				//modules.setOptions = function setOptions(/*paramarray*/) {
				//	var options = __Internal__.oldSetOptions.apply(this, arguments),
				//		settings = types.get(options, 'settings', {});
				//};
				
				modules.setOptions({
					settings: {
						modulesUri: '/modules',
					},
				}, _options);
				

				
				//var __Internal__ = {
				//};
			
				
					
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
					, function locate(module, /*optional*/path, /*optional*/options) {
						var Promise = types.getPromise();
						return new Promise(function(resolve, reject) {
							var location = tools.getCurrentLocation().set({file: null}).combine(types.get(options, 'modulesUri', modules.getOptions().settings.modulesUri));
							location = location.combine(files.Path.parse(module, {os: 'linux'})).pushFile();
							if (path) {
								location = location.combine(files.Path.parse(path, {os: 'linux', isRelative: true}));
							};
							if (!location.file) {
								location = location.set({file: 'index.js'});
							};
							resolve(location);
						});
					});
				
				modules.load = root.DD_DOC(
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
					, function load(module, /*optional*/file, /*optional*/options) {
						var Promise = types.getPromise();
						return modules.locate(module, './config.json', options)
							.then(function(location) {
								return config.loadFile(location, {async: true, encoding: 'utf-8'})
									.nodeify(function(err, conf) {
										if (err) {
											conf = options;
										} else {
											types.depthExtend(2, conf, options);
										};
										if (!types.isArray(file)) {
											file = [file || null];
										};
										return Promise.all(tools.map(file, function(fname) {
												return modules.locate(module, fname, options)
													.then(function(location) {
														return new Promise(function(resolve, reject) {
															var scriptLoader = tools.getJsScriptFileLoader(/*url*/location, /*async*/true);
															scriptLoader.addEventListener('load', resolve);
															scriptLoader.addEventListener('error', reject);
															scriptLoader.start();
														});
													})
													['catch'](function(ev) {
														throw new types.Error("Failed to load file '~0~' from module '~1~'.", [file, module]);
													});
											}))
											.then(function(ev) {
												return namespaces.loadNamespaces(global.DD_MODULES, null, conf, true);
											});
									});
							})
							['catch'](function(err) {
								tools.log(tools.LogLevels.Error, err);
								throw err;
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
	};
	
	if (typeof process !== 'object') {
		// <PRB> export/import are not yet supported in browsers
		global.DD_MODULES = exports.add(global.DD_MODULES);
	};
}).call((typeof global !== 'undefined') ? global : ((typeof window !== 'undefined') ? window : this));