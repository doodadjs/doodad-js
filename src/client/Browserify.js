//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
	// doodad-js - Object-oriented programming framework
	// File: Browserify.js - Browserify
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
	modules['Doodad.NodeJs'] = {
		version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
		dependencies: [
			'Doodad.Types',
			'Doodad.Tools',
		],
		bootstrap: true,

		create: function create(root, /*optional*/_options) {
			//===================================
			// Get namespaces
			//===================================

			const doodad = root.Doodad,
				types = doodad.Types,
				//tools = doodad.Tools,
				nodejs = doodad.NodeJs;

			//		tools.complete(_shared.Natives, {
			//		});

			//===================================
			// Util Extension
			//===================================

			nodejs.ADD('getCustomInspectSymbol', function getCustomInspectSymbol() {
				// Not supported
				return null;
			});

			//===================================
			// Init
			//===================================
			return function init(/*optional*/options) {
				/* eslint no-useless-concat: "off" */
				/* eslint global-require: "off" */
				/* eslint import/no-dynamic-require: "off" */

				try {
					types.getPromise();
				} catch(ex) {
					let Promise = null;
					try {
						const mod = '' + 'rsvp'; // prevents browserify to automaticaly bundle the module
						Promise = require(mod); // tiny Promise/A+ implementation
					} catch(o) {
						// Do nothing
					};
					if (!types.isFunction(Promise)) {
						try {
							const mod = '' + 'es6-promise'; // prevents browserify to automaticaly bundle the module
							Promise = require(mod); // subset of RSVP
						} catch(o) {
							// Do nothing
						};
					};
					if (types.isFunction(Promise)) {
						types.setPromise(Promise);
					};
				};
			};
		},
	};
	return modules;
};

//! END_MODULE()
