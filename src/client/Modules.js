//! REPLACE_BY("// Copyright 2016 Claude Petit, licensed under Apache License version 2.0\n", true)
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
			version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE() */,
			dependencies: [
				'Doodad.Tools', 
				'Doodad.Tools.Config', 
				'Doodad.Tools.Files', 
				'Doodad.Types', 
				'Doodad.Namespaces', 
				'Doodad.Client',
			],
			bootstrap: true,
			
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
				


				modules.setOptions({
					modulesUri: './',
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
							var location = tools.getCurrentLocation().set({file: null}).combine(types.get(options, 'modulesUri', modules.getOptions().modulesUri));
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
				
				modules.loadFiles = function loadFiles(module, files, /*optional*/options) {
					var Promise = types.getPromise();
					if (!types.isArray(files)) {
						files = [files];
					};
					return Promise.all(tools.map(files, function(fname) {
						return modules.locate(module, fname, options)
							.then(function(location) {
								if (/([.]json)$/.test(fname)) {
									return config.loadFile(location, {async: true, encoding: 'utf-8'})
										.then(function(conf) {
											return {
												name: fname,
												content: conf,
											};
										});
								} else {
									return new Promise(function(resolve, reject) {
										var scriptLoader = tools.getJsScriptFileLoader(/*url*/location, /*async*/true);
										scriptLoader.addEventListener('load', function() {
											resolve({
												name: fname,
												content: null, // unable to get reference to the loaded module
											});
										});
										scriptLoader.addEventListener('error', reject);
										scriptLoader.start();
									});
								};
							})
							['catch'](function() {
								throw new types.Error("Failed to load file '~0~' from module '~1~'.", [fname, module]);
							});
					}));
				};
				
				modules.load = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 3,
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
						var opts = {};
						var fromSource = root.getOptions().fromSource;
						global.DD_MODULES = {};
						return modules.loadFiles(module, 'config.json', options)
							.nodeify(function(err, _files) {
								if (!err) {
									types.depthExtend(2, opts, _files[0].content, options);
								};
								return modules.loadFiles(module, files || (fromSource ? 'index.js' : 'bundle.js'), options);
							})
							.then(function(_files) {
								// <FUTURE>
								//var DD_MODULES = {};
								//tools.forEach(_files, function(file) {
								//	var mod = file.exports;
								//	mod.add(DD_MODULES);
								//	return mod;
								//});
								//return namespaces.load(DD_MODULES, null, opts, false);
								// </FUTURE>
								var retval = namespaces.load(global.DD_MODULES, null, opts, false);
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