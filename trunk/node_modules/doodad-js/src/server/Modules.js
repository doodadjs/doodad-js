//! REPLACE_BY("// Copyright 2016 Claude Petit, licensed under Apache License version 2.0\n")
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
	if (typeof process === 'object') {
		module.exports = exports;
	};
	
	exports.add = function add(DD_MODULES) {
		DD_MODULES = (DD_MODULES || {});
		DD_MODULES['Doodad.Modules'] = {
			type: null,
			version: '1.1r',
			namespaces: null,
			dependencies: ['Doodad.Tools', 'Doodad.Types', 'Doodad.Namespaces'],
			bootstrap: true,
			exports: exports,
			
			create: function create(root, /*optional*/_options) {
				"use strict";

				//===================================
				// Get namespaces
				//===================================

				const doodad = root.Doodad,
					types = doodad.Types,
					tools = doodad.Tools,
					config = tools.Config,
					namespaces = doodad.Namespaces,
					modules = doodad.Modules;
				
				let npmConfig = null;
				try {
					npmConfig = require('npm-package-config');
				} catch(ex) {
				};
				

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
						const Promise = tools.getPromise();
						return new Promise(function(resolve, reject) {
							let location = tools.Path.parse(module, {file: 'package.json'})
								.toString({isRelative: true});
							location = Module._resolveFilename(location, __Internal__.getRootModule());
							location = tools.Path.parse(location)
								.set({file: ''})
								.combine(file, {dirChar: ['/', '\\'], isRelative: true});
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
						const Promise = tools.getPromise();
						return modules.locate(module, './config.json', options)
							.nodeify(function(err, location) {
								return (err
											? (npmConfig
													? npmConfig.list(module, {beautify: true, async: true})
													: Promise.resolve({}
											))
											: config.loadFile(location, {parseOptions: {}, async: true, encoding: 'utf8'})
									)
									.nodeify(function(err, conf) {
										if (err) {
											conf = options;
										} else {
											types.depthExtend(2, conf, options);
										};
										if (!types.isArray(file)) {
											file = [file];
										};
										const DD_MODULES = {};
										return Promise.all(file.map(function(fname) {
												return modules.locate(module, fname, options).then(function(location) {
													return new Promise(function(resolve, reject) {
														const mod = Module._load(location.toString(), __Internal__.getRootModule());
														mod.add(DD_MODULES);
														resolve(mod);
													});
												});
											}))
											.then(function(mods) {
												return namespaces.loadNamespaces(null, false, conf, DD_MODULES);
											});
									});
							})
							['catch'](function(err) {
								tools.log(tools.LogLevels.Error, err.stack);
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