//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Unit_Tools_ToSource.js - Unit testing module file
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
	mods['Doodad.Test.Tools.ToSource'] = {
		type: 'TestModule',
		version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
		dependencies: ['Doodad.Test.Types'],

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


				test.runCommand(tools.toSource, "Doodad.Tools.toSource", function(command, options) {
					command.runStep("undefined",                                       {}, /**/  undefined);
					command.runStep("null",                                            {}, /**/  null);
					command.runStep("NaN",                                             {}, /**/  NaN);
					command.runStep("Infinity",                                        {}, /**/  Infinity);
					command.runStep("-Infinity",                                       {}, /**/  -Infinity);
					command.runStep("0",                                               {}, /**/  0);
					command.runStep("1",                                               {}, /**/  1);
					command.runStep("0.1",                                             {}, /**/  0.1);
					command.runStep("-0.1",                                            {}, /**/  -0.1);
					command.runStep("1.1415",                                          {}, /**/  1.1415);
					command.runStep("true",                                            {}, /**/  true);
					command.runStep("false",                                           {}, /**/  false);
					command.runStep("''",                                              {}, /**/  "");
					command.runStep("'hello'",                                         {}, /**/  "hello");
					command.runStep("'hello\\n'",                                      {}, /**/  "hello\n");
					command.runStep("'\\'hello\\''",                                   {}, /**/  "'hello'");
					command.runStep("(new Number(0))",                                 {}, /**/  Object(0));
					command.runStep("(new Number(1))",                                 {}, /**/  Object(1));
					command.runStep("(new Number(0.1))",                               {}, /**/  Object(0.1));
					command.runStep("(new Number(-0.1))",                              {}, /**/  Object(-0.1));
					command.runStep("(new Number(1.1415))",                            {}, /**/  Object(1.1415));
					command.runStep("(new Boolean(true))",                             {}, /**/  Object(true));
					command.runStep("(new Boolean(false))",                            {}, /**/  Object(false));
					command.runStep("(new String(''))",                                {}, /**/  Object(""));
					command.runStep("(new String('hello'))",                           {}, /**/  Object("hello"));
					command.runStep("(new String('hello\\n'))",                        {}, /**/  Object("hello\n"));
					command.runStep("(new String('\\'hello\\''))",                     {}, /**/  Object("'hello'"));
					command.runStep("{}",                                              {}, /**/  {});
					command.runStep("{'a': 1}",                                        {}, /**/  {a: 1});
					command.runStep("{'a': 1, 'b': 2}",                                {}, /**/  {a: 1, b: 2});
					command.runStep("[]",                                              {}, /**/  []);
					command.runStep("[1]",                                             {}, /**/  [1]);
					command.runStep("[1, 2]",                                          {}, /**/  [1, 2]);
					command.runStep("[, 2]",                                           {}, /**/  [, 2]); // empty slot
					command.runStep("{'a': 1, 'b': {}}",                               {depth: 2}, /**/  {a: 1, b: {c: {d: 4}}});
					command.runStep("{'a': 1, 'b': {}}",                               {depth: 2}, /**/  {a: 1, b: {c: {d: 4}}}, 0);
					command.runStep("{'a': 1, 'b': {'c': {}}}",                        {depth: 2}, /**/  {a: 1, b: {c: {d: 4}}}, 1);
					command.runStep("{'a': 1, 'b': {'c': {'d': 4}}}",                  {depth: 2}, /**/  {a: 1, b: {c: {d: 4}}}, 2);
					command.runStep("[1, (new Array(2))]",                             {depth: 2}, /**/  [1, [2, [3]]]);
					command.runStep("[1, (new Array(2))]",                             {depth: 2}, /**/  [1, [2, [3]]], 0);
					command.runStep("[1, [2, (new Array(1))]]",                        {depth: 2}, /**/  [1, [2, [3]]], 1);
					command.runStep("[1, [2, [3]]]",                                   {depth: 2}, /**/  [1, [2, [3]]], 2);
					command.runStep("(new Date(2015, 8, 15, 9, 32, 52, 140))",         {}, /**/  new Date(2015, 8, 15, 9, 32, 52, 140));
					command.runStep("(new Error('error'))",                            {}, /**/  (new Error("error")));
					command.runStep("(new Function())",                                {}, /**/  Object.prototype.toString);
					// NOTE: Disabled because I get different results
					//command.runStep("function () {return \"hello\";}",                    {note: "May fail under Firefox because it injects the \"use strict\" sentence and it does make sense."},      /**/  (function() {return "hello";}));
					//command.runStep("function () {\n\"use strict\";\nreturn \"hello\";}", {note: "May fail under browsers other than Firefox because the \"use strict\" sentence is not injected."},    /**/  (function() {return "hello";}));
				});
					
			},
		},
	};
	return mods;
};

//! END_MODULE()
