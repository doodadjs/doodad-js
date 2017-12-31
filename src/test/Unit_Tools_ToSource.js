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

exports.add = function add(DD_MODULES) {
	DD_MODULES = (DD_MODULES || {});
	DD_MODULES['Doodad.Test.Tools.ToSource'] = {
		type: 'TestModule',
		version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
		dependencies: ['Doodad.Test.Types'],

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


				let command;

						
				command = test.prepareCommand(tools.toSource, "Doodad.Tools.toSource");
				command.run("undefined",                                       {}, /**/  undefined);
				command.run("null",                                            {}, /**/  null);
				command.run("NaN",                                             {}, /**/  NaN);
				command.run("Infinity",                                        {}, /**/  Infinity);
				command.run("-Infinity",                                       {}, /**/  -Infinity);
				command.run("0",                                               {}, /**/  0);
				command.run("1",                                               {}, /**/  1);
				command.run("0.1",                                             {}, /**/  0.1);
				command.run("-0.1",                                            {}, /**/  -0.1);
				command.run("1.1415",                                          {}, /**/  1.1415);
				command.run("true",                                            {}, /**/  true);
				command.run("false",                                           {}, /**/  false);
				command.run("''",                                              {}, /**/  "");
				command.run("'hello'",                                         {}, /**/  "hello");
				command.run("'hello\\n'",                                      {}, /**/  "hello\n");
				command.run("'\\'hello\\''",                                   {}, /**/  "'hello'");
				command.run("(new Number(0))",                                 {}, /**/  Object(0));
				command.run("(new Number(1))",                                 {}, /**/  Object(1));
				command.run("(new Number(0.1))",                               {}, /**/  Object(0.1));
				command.run("(new Number(-0.1))",                              {}, /**/  Object(-0.1));
				command.run("(new Number(1.1415))",                            {}, /**/  Object(1.1415));
				command.run("(new Boolean(true))",                             {}, /**/  Object(true));
				command.run("(new Boolean(false))",                            {}, /**/  Object(false));
				command.run("(new String(''))",                                {}, /**/  Object(""));
				command.run("(new String('hello'))",                           {}, /**/  Object("hello"));
				command.run("(new String('hello\\n'))",                        {}, /**/  Object("hello\n"));
				command.run("(new String('\\'hello\\''))",                     {}, /**/  Object("'hello'"));
				command.run("{}",                                              {}, /**/  {});
				command.run("{'a': 1}",                                        {}, /**/  {a: 1});
				command.run("{'a': 1, 'b': 2}",                                {}, /**/  {a: 1, b: 2});
				command.run("[]",                                              {}, /**/  []);
				command.run("[1]",                                             {}, /**/  [1]);
				command.run("[1, 2]",                                          {}, /**/  [1, 2]);
				command.run("[, 2]",                                           {}, /**/  [, 2]); // empty slot
				command.run("{'a': 1, 'b': {}}",                               {depth: 2}, /**/  {a: 1, b: {c: {d: 4}}});
				command.run("{'a': 1, 'b': {}}",                               {depth: 2}, /**/  {a: 1, b: {c: {d: 4}}}, 0);
				command.run("{'a': 1, 'b': {'c': {}}}",                        {depth: 2}, /**/  {a: 1, b: {c: {d: 4}}}, 1);
				command.run("{'a': 1, 'b': {'c': {'d': 4}}}",                  {depth: 2}, /**/  {a: 1, b: {c: {d: 4}}}, 2);
				command.run("[1, (new Array(2))]",                             {depth: 2}, /**/  [1, [2, [3]]]);
				command.run("[1, (new Array(2))]",                             {depth: 2}, /**/  [1, [2, [3]]], 0);
				command.run("[1, [2, (new Array(1))]]",                        {depth: 2}, /**/  [1, [2, [3]]], 1);
				command.run("[1, [2, [3]]]",                                   {depth: 2}, /**/  [1, [2, [3]]], 2);
				command.run("(new Date(2015, 8, 15, 9, 32, 52, 140))",         {}, /**/  new Date(2015, 8, 15, 9, 32, 52, 140));
				command.run("(new Error('error'))",                            {}, /**/  (new Error("error")));
				command.run("(new Function())",                                {}, /**/  Object.prototype.toString);
				// NOTE: Disabled because I get different results
				//command.run("function () {return \"hello\";}",                    {note: "May fail under Firefox because it injects the \"use strict\" sentence and it does make sense."},      /**/  (function() {return "hello";}));
				//command.run("function () {\n\"use strict\";\nreturn \"hello\";}", {note: "May fail under browsers other than Firefox because the \"use strict\" sentence is not injected."},    /**/  (function() {return "hello";}));
				command.end();
					
			},
		},
	};
	return DD_MODULES;
};

//! END_MODULE()