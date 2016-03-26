//! REPLACE_BY("// Copyright 2016 Claude Petit, licensed under Apache License version 2.0\n")
// dOOdad - Object-oriented programming framework
// File: browserify.js - Browserify
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
		DD_MODULES['Doodad.Client.Browserify'] = {
			type: null,
			//! INSERT("version:'" + VERSION('doodad-js') + "',")
			namespaces: null,
			dependencies: [
				'Doodad.Types', 
				'Doodad.Tools', 
				'Doodad.Client',
			],
			bootstrap: true,
			
			create: function create(root, /*optional*/_options) {
				"use strict";

				//===================================
				// Get namespaces
				//===================================

				var doodad = root.Doodad,
					types = doodad.Types,
					tools = doodad.Tools;


				//===================================
				// Init
				//===================================
				return function init(/*optional*/options) {
					try {
						types.getPromise();
					} catch(ex) {
						var Promise = null;
						try {
							var mod = '' + 'rsvp'; // prevents browserify to automaticaly bundle the module
							Promise = require(mod); // tiny Promise/A+ implementation
						} catch(o) {
						};
						if (!types.isFunction(Promise)) {
							try {
								var mod = '' + 'es6-promise'; // prevents browserify to automaticaly bundle the module
								Promise = require(mod); // subset of RSVP
							} catch(o) {
							};
						};
						if (types.isFunction(Promise)) {
							types.setPromise(Promise);
						};
					};
				};
			},
		};
		
		return DD_MODULES;
	};
	
	if (typeof process !== 'object') {
		// <PRB> export/import are not yet supported in browsers
		global.DD_MODULES = exports.add(global.DD_MODULES);
	};
}).call((typeof global !== 'undefined') ? global : ((typeof window !== 'undefined') ? window : this));