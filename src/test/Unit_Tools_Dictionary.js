//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2017 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Unit_Tools_Dictionary.js - Unit testing module file
// Project home: https://github.com/doodadjs/
// Author: Claude Petit, Quebec city
// Contact: doodadjs [at] gmail.com
// Note: I'm still in alpha-beta stage, so expect to find some bugs or incomplete parts !
// License: Apache V2
//
//	Copyright 2015-2017 Claude Petit
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
	DD_MODULES['Doodad.Test.Tools.Dictionary'] = {
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


				command = test.prepareCommand(tools.findItem, "Doodad.Tools.findItem");
				command.run(null,                                             {repetitions: 100}  /**/);
				command.run(null,                                             {repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"});
				command.run(null,                                             {repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"}, "zzz");
				command.run('b',                                              {repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"}, "hi");
				command.run('a',                                              {repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"}, "there");
				command.run('a',                                              {repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"}, function(val, key, obj) {return val === "there"});
				command.end();
					
					
				command = test.prepareCommand(tools.findLastItem, "Doodad.Tools.findLastItem");
				command.run(null,                                             {repetitions: 100}  /**/);
				command.run(null,                                             {repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"});
				command.run(null,                                             {repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"}, "zzz");
				command.run('b',                                              {repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"}, "hi");
				command.run('c',                                              {repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"}, "there");
				command.run('c',                                              {repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"}, function(val, key, obj) {return val === "there"});
				command.end();
					
					
				command = test.prepareCommand(tools.findItems, "Doodad.Tools.findItems");
				command.run([],                                               {repetitions: 100}  /**/);
				command.run([],                                               {repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"});
				command.run([],                                               {repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"}, "zzz");
				command.run(['b'],                                            {contains: true, repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"}, "hi");
				command.run(['a', 'c'],                                       {contains: true, repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"}, "there");
				command.run(['a', 'c'],                                       {contains: true, repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"}, function(val, key, obj) {return val === "there"});
				command.end();
					
					
				command = test.prepareCommand(tools.map, "Doodad.Tools.map");
				//root.DD_ASSERT && command.run(types.AssertionError,    {mode: 'isinstance'}  /**/ );
				//root.DD_ASSERT && command.run(types.AssertionError,    {mode: 'isinstance'}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"});
				//root.DD_ASSERT && command.run(types.AssertionError,    {mode: 'isinstance'}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, "");
				command.run({val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, function(val, key, obj) {return val});
				command.end();
					
					
				command = test.prepareCommand(function(obj) {
					const result = [];
					tools.forEach(obj, function(val, key, obj) {
						result.push(val);
					});
					return result;
				}, "Doodad.Tools.forEach");
				command.run([],                                               {repetitions: 100}  /**/ );
				command.run(['a', 'b', 'c', 'd', 'e', 'f'],                   {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"});
				command.end();
					
					
				command = test.prepareCommand(tools.filter, "Doodad.Tools.filter");
				command.run(undefined,                                        {repetitions: 100}  /**/);
				command.run({},                                               {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"});
				command.run({val1: 'a'},                                      {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, "a");
				command.run({val1: 'a'},                                      {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, ['a']);
				command.run({val1: 'a', val2: 'b'},                           {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, ['a', 'b']);
				command.run({val1: 'a'},                                      {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, function(val, key, obj) {return val === 'a'});
				command.run({val3: 'c', val4: 'd', val5: 'e', val6: 'f'},     {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, ['a', 'b'], null, true);
				command.run({val3: 'c', val4: 'd', val5: 'e', val6: 'f'},     {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, function(val, key, obj) {return val === 'a' || val === 'b'}, null, true);
				command.end();
					
					
				command = test.prepareCommand(tools.filterKeys, "Doodad.Tools.filterKeys");
				command.run(undefined,                                        {repetitions: 100}  /**/);
				command.run({},                                               {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"});
				command.run({val1: 'a'},                                      {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, ['val1']);
				command.run({val1: 'a', val2: 'b'},                           {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, ['val1', 'val2']);
				command.run({val1: 'a'},                                      {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, function(val, key, obj) {return key === 'val1'});
				command.run({val3: 'c', val4: 'd', val5: 'e', val6: 'f'},     {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, ['val1', 'val2'], null, true);
				command.run({val3: 'c', val4: 'd', val5: 'e', val6: 'f'},     {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, function(val, key, obj) {return key === 'val1' || key === 'val2'}, null, true);
				command.end();
					
					
				command = test.prepareCommand(tools.every, "Doodad.Tools.every");
				command.run(true,                                             {repetitions: 100}  /**/);
				command.run(true,                                             {repetitions: 100}, /**/ {});
				command.run(true,                                             {repetitions: 100}, /**/ {}, "a");
				command.run(false,                                            {repetitions: 100}, /**/ {val1: "a", val2: "a", val3: "a", val4: "a", val5: "a"});
				command.run(true,                                             {repetitions: 100}, /**/ {val1: "a", val2: "a", val3: "a", val4: "a", val5: "a"}, "a");
				command.run(true,                                             {repetitions: 100}, /**/ {val1: "a", val2: "a", val3: "a", val4: "a", val5: "a"}, ["a"]);
				command.run(false,                                            {repetitions: 100}, /**/ {val1: "a", val2: "a", val3: "a", val4: "a", val5: "a"}, "b");
				command.run(true,                                             {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "a", val4: "b", val5: "a"}, "ab");
				command.run(false,                                            {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "a", val4: "b", val5: "a"}, ["ab"]);
				command.run(true,                                             {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "a", val4: "b", val5: "a"}, ["a", "b"]);
				command.run(true,                                             {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "a", val4: "b", val5: "a"}, ["a", "b", "c"]);
				command.run(true,                                             {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "a", val4: "b", val5: "a"}, {val1: "a", val2: "b"});
				command.run(true,                                             {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "a", val4: "b", val5: "a"}, {val1: "a", val2: "b", val3: "c"});
				command.run(false,                                            {repetitions: 100}, /**/ {val1: "a", val2: "a", val3: "a", val4: "a", val5: "a"}, "a", null, true);
				command.run(true,                                             {repetitions: 100}, /**/ {val1: "a", val2: "a", val3: "a", val4: "a", val5: "a"}, "b", null, true);
				command.run(true,                                             {repetitions: 100}, /**/ {val1: "a", val2: "a", val3: "a", val4: "a", val5: "a"}, function(val, key, obj) {return val === "a"});
				command.run(false,                                            {repetitions: 100}, /**/ {val1: "a", val2: "a", val3: "a", val4: "a", val5: "a"}, function(val, key, obj) {return val === "a"}, null, true);
				command.end();
					
					
				command = test.prepareCommand(tools.some, "Doodad.Tools.some");
				command.run(false,                                            {repetitions: 100}  /**/);
				command.run(false,                                            {repetitions: 100}, /**/ {});
				command.run(false,                                            {repetitions: 100}, /**/ {}, "b");
				command.run(false,                                            {repetitions: 100}, /**/ {val1: "a", val2: "a", val3: "a", val4: "a", val5: "a"});
				command.run(true,                                             {repetitions: 100}, /**/ {val1: "a", val2: "a", val3: "a", val4: "b", val5: "a"}, "b");
				command.run(true,                                             {repetitions: 100}, /**/ {val1: "a", val2: "a", val3: "a", val4: "b", val5: "a"}, ["b"]);
				command.run(false,                                            {repetitions: 100}, /**/ {val1: "a", val2: "a", val3: "a", val4: "a", val5: "a"}, "b");
				command.run(true,                                             {repetitions: 100}, /**/ {val1: "a", val2: "a", val3: "a", val4: "b", val5: "a"}, "bc");
				command.run(true,                                             {repetitions: 100}, /**/ {val1: "a", val2: "a", val3: "a", val4: "b", val5: "a"}, ["b", "c"]);
				command.run(true,                                             {repetitions: 100}, /**/ {val1: "a", val2: "a", val3: "a", val4: "b", val5: "a"}, {val1: "b", val2: "c"});
				command.run(true,                                             {repetitions: 100}, /**/ {val1: "a", val2: "a", val3: "a", val4: "b", val5: "a"}, "b", null, true);
				command.run(false,                                            {repetitions: 100}, /**/ {val1: "a", val2: "a", val3: "a", val4: "b", val5: "a"}, ["a", "b"], null, true);
				command.run(true,                                             {repetitions: 100}, /**/ {val1: "a", val2: "a", val3: "a", val4: "b", val5: "a"}, function(val, key, obj) {return val === "b"});
				command.run(false,                                            {repetitions: 100}, /**/ {val1: "a", val2: "a", val3: "a", val4: "b", val5: "a"}, function(val, key, obj) {return val === "a" || val === "b"}, null, true);
				command.end();
					
					
			},
		},
	};
	return DD_MODULES;
};

//! END_MODULE()