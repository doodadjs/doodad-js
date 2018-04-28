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

//! IF_SET("mjs")
//! ELSE()
"use strict";
//! END_IF()

exports.add = function add(mods) {
	mods = (mods || {});
	mods['Doodad.Test.Tools.Misc'] = {
		type: 'TestModule',
		version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
		dependencies: ['Doodad.Test.Tools'],

		// Unit
		priority: null,

		proto: {
			run: function run(root, /*optional*/options) {
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


				test.runCommand(function(text) {return tools.escapeHtml(text, false)}, "Doodad.Tools.escapeHtml (standard)", function(command, options) {
					command.runStep(undefined,                                       {repetitions: 100}  /**/);
					command.runStep(types.AssertionError,                            {mode: 'isinstance', skip: !root.getOptions().enableAsserts}, /**/ 1);
					command.runStep("",                                              {repetitions: 100}, /**/ "");
					command.runStep("&lt;script onload=&quot;go(&#39;&amp;#20&#39;)&quot;&gt;", {repetitions: 100}, /**/ '<script onload="go(\'&#20\')">');
				});


				test.runCommand(function(text) {return tools.escapeHtml(text, true)}, "Doodad.Tools.escapeHtml (full)", function(command, options) {
					command.runStep(undefined,                                       {repetitions: 100}  /**/);
					command.runStep(types.AssertionError,                            {mode: 'isinstance', skip: !root.getOptions().enableAsserts}, /**/ 1);
					command.runStep("",                                              {repetitions: 100}, /**/ "");
					command.runStep("&lt;script onload&equals;&quot;go&lpar;&apos;&amp;&num;20&apos;&rpar;&quot;&gt;", {repetitions: 100}, /**/ '<script onload="go(\'&#20\')">');
				});


				test.runCommand(tools.escapeRegExp, "Doodad.Tools.escapeRegExp", function(command, options) {
					command.runStep(undefined,                                       {repetitions: 100}  /**/);
					command.runStep(types.AssertionError,                            {mode: 'isinstance', skip: !root.getOptions().enableAsserts}, /**/ 1);
					command.runStep("",                                              {repetitions: 100}, /**/ "");
					command.runStep("\\[\\(\\$1\\+\\$2\\)\\|\\(\\^\\$3\\)\\]",       {repetitions: 100}, /**/ '[($1+$2)|(^$3)]');
				});


				test.runCommand(tools.sign, "Doodad.Tools.sign", function(command, options) {
					command.runStep(NaN,                                             {repetitions: 100}  /**/);
					command.runStep(0,                                               {repetitions: 100}, /**/ null);
					command.runStep(NaN,                                             {repetitions: 100}, /**/ NaN);
					command.runStep(1,                                               {repetitions: 100}, /**/ Infinity);
					command.runStep(-1,                                              {repetitions: 100}, /**/ -Infinity);
					command.runStep(0,                                               {repetitions: 100}, /**/ 0);
					command.runStep(-0,                                              {repetitions: 100}, /**/ -0);
					command.runStep(1,                                               {repetitions: 100}, /**/ 2);
					command.runStep(-1,                                              {repetitions: 100}, /**/ -2);
				});

			},
		},
	};
	return mods;
};

//! END_MODULE()
