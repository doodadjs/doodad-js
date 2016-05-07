//! REPLACE_BY("// Copyright 2016 Claude Petit, licensed under Apache License version 2.0\n", true)
// dOOdad - Object-oriented programming framework
// File: Unit_Tools_Misc.js - Unit testing module file
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
		DD_MODULES['Doodad.Test.Tools.Misc'] = {
			type: 'TestModule',
			version: '0d',
			dependencies: ['Doodad.Test.Tools'],

			// Unit
			priority: null,
				proto: {
				run: null,
			},

			proto: {
				run: function run(entry, /*optional*/options) {
					"use strict";

					var root = entry.root,
						doodad = root.Doodad,
						types = doodad.Types,
						tools = doodad.Tools,
						namespaces = doodad.Namespaces,
						test = doodad.Test,
						unit = test.Types.Is,
						io = doodad.IO;

						
					if (!options) {
						options = {};
					};
					
					
					var command = test.prepareCommand(tools.escapeHtml, "Doodad.Tools.escapeHtml");
					
					command.run(undefined,                                       {repetitions: 100}  /**/);
					command.run(types.AssertionFailed,                        {mode: 'isinstance'}, /**/ 1);
					command.run("",                                              {repetitions: 100}, /**/ "");
					command.run("&lt;script onload=&quot;go(&#39;&amp;#20&#39;)&quot;&gt;", {repetitions: 100}, /**/ '<script onload="go(\'&#20\')">');

					command.end();
					
				
					var command = test.prepareCommand(tools.escapeRegExp, "Doodad.Tools.escapeRegExp");
					
					command.run(undefined,                                       {repetitions: 100}  /**/);
					command.run(types.AssertionFailed,                        {mode: 'isinstance'}, /**/ 1);
					command.run("",                                              {repetitions: 100}, /**/ "");
					command.run("\\[\\(\\$1\\+\\$2\\)\\|\\(\\^\\$3\\)\\]",       {repetitions: 100}, /**/ '[($1+$2)|(^$3)]');

					command.end();
					
				
					var command = test.prepareCommand(tools.sign, "Doodad.Tools.sign");
					
					command.run(NaN,                                             {repetitions: 100}  /**/);
					command.run(0,                                               {repetitions: 100}, /**/ null);
					command.run(NaN,                                             {repetitions: 100}, /**/ NaN);
					command.run(1,                                               {repetitions: 100}, /**/ Infinity);
					command.run(-1,                                              {repetitions: 100}, /**/ -Infinity);
					command.run(0,                                               {repetitions: 100}, /**/ 0);
					command.run(-0,                                              {repetitions: 100}, /**/ -0);
					command.run(1,                                               {repetitions: 100}, /**/ 2);
					command.run(-1,                                              {repetitions: 100}, /**/ -2);

					command.end();
					
				
				},
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