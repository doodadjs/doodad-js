//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Unit_Tools_Misc.js - Unit testing module file
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

exports.add = function add(DD_MODULES) {
	DD_MODULES = (DD_MODULES || {});
	DD_MODULES['Doodad.Test.Tools.Misc'] = {
		type: 'TestModule',
		version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
		dependencies: ['Doodad.Test.Tools'],

		// Unit
		priority: null,

		proto: {
			run: function run(root, /*optional*/options) {
				"use strict";

				const doodad = root.Doodad,
					types = doodad.Types,
					tools = doodad.Tools,
					namespaces = doodad.Namespaces,
					test = doodad.Test,
					unit = test.Types.Is,
					io = doodad.IO;

						
				if (!options) {
					options = {};
				};
					

				let command;

					
				command = test.prepareCommand(tools.escapeHtml, "Doodad.Tools.escapeHtml");
					
				command.run(undefined,                                       {repetitions: 100}  /**/);
				command.run(types.AssertionError,                            {mode: 'isinstance'}, /**/ 1);
				command.run("",                                              {repetitions: 100}, /**/ "");
				command.run("&lt;script onload=&quot;go(&#39;&amp;#20&#39;)&quot;&gt;", {repetitions: 100}, /**/ '<script onload="go(\'&#20\')">');

				command.end();
					
				
				command = test.prepareCommand(tools.escapeRegExp, "Doodad.Tools.escapeRegExp");
					
				command.run(undefined,                                       {repetitions: 100}  /**/);
				command.run(types.AssertionError,                            {mode: 'isinstance'}, /**/ 1);
				command.run("",                                              {repetitions: 100}, /**/ "");
				command.run("\\[\\(\\$1\\+\\$2\\)\\|\\(\\^\\$3\\)\\]",       {repetitions: 100}, /**/ '[($1+$2)|(^$3)]');

				command.end();
					
				
				command = test.prepareCommand(tools.sign, "Doodad.Tools.sign");
					
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

//! END_MODULE()