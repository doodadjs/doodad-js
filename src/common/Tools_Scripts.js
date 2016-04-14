//! REPLACE_BY("// Copyright 2016 Claude Petit, licensed under Apache License version 2.0\n", true)
// dOOdad - Object-oriented programming framework
// File: Tools_Scripts.js - Scripts tools
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
		DD_MODULES['Doodad.Tools.Scripts'] = {
			version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE() */,
			dependencies: [
				'Doodad.Tools',
				'Doodad.Types',
				'Doodad.Tools.Files',
			],
			bootstrap: true,
			
			create: function create(root, /*optional*/_options) {
				"use strict";

				//===================================
				// Get namespaces
				//===================================
					
				var doodad = root.Doodad,
					types = doodad.Types,
					tools = doodad.Tools,
					files = tools.Files;
					
				//===================================
				// Internal
				//===================================
					
				// <FUTURE> Thread context
				//var __Internal__ = {
				//};
				
				
				//===================================
				// Options
				//===================================
					
				//tools.setOptions({
				//}, _options);
				

				//===================================
				// Native functions
				//===================================
					
				// NOTE: Makes use of "isNativeFunction" to get rid of third-parties injections as possible.

				//var __Natives__ = {
				//};
				

				//===================================
				// Script functions
				//===================================
				
				tools.getCurrentScript = root.DD_DOC(
						//! REPLACE_BY("null")
						{
								author: "Claude Petit",
								revision: 1,
								params: {
									currentScript: {
										type: 'string,object,error',
										optional: true,
										description: "Some Javascript engines provide a way to get the information. You should give it here.",
									},
								},
								returns: 'Url,Path',
								description:
									"Returns location of the current running script. Multiple usages :\n" + 
									'- Client-side only: Doodad.Tools.getCurrentScript(document.currentScript||(function(){try{throw new Error("");}catch(ex){return ex;}})())\n' +
									'- Client-side and server-side: Doodad.Tools.getCurrentScript((global.document?document.currentScript:module.filename)||(function(){try{throw new Error("");}catch(ex){return ex;}})())\n' +
									'- Server-side only: Don\'t use this function. Instead, do : Doodad.Tools.Files.Path.parse(module.filename)\n',
						}
						//! END_REPLACE()
					, function getCurrentScript(/*optional*/currentScript) {
						var url,
							ex,
							exLevel = 0;
					
						if (types.isError(currentScript)) {
							ex = currentScript;
						} else if (types.isString(currentScript)) {
							// NodeJs
							url = files.Path.parse(currentScript);
						} else if (types.isObject(currentScript) && types.isString(currentScript.src)) {
							// NOTE: currentScript is 'document.currentScript'
							// Google Chrome 39 Windows: OK
							// Firefox 34: undefined
							// IE 11: undefined
							// Opera 26 Windows: OK
							// Safari 5: undefined
							url = files.Url.parse(currentScript.src);
						};
						
						if (!url) {
							if (ex && types.isString(ex.sourceURL)) {
								// Safari
								url = files.Url.parse(ex.sourceURL);
							} else {
								// Other browsers
								if (!ex) {
									exLevel = 1;
									try {
										throw new __Natives__.windowError("");
									} catch(o) {
										ex = o;
									};
								};
								var stack = tools.parseStack(ex);
								if (stack && (stack.length > exLevel)) {
									var trace = stack[exLevel];
									if (trace.isSystemPath) {
										url = files.Path.parse(trace.path);
									} else {
										url = files.Url.parse(trace.path);
									};
								};
							};
						};
						
						return url;
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