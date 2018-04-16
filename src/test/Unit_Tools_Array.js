//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Unit_Tools_Array.js - Unit testing module file
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
	mods['Doodad.Test.Tools.Array'] = {
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
					

				const createArray1 = function _createArray1() {
					const ar1 = [1, 2, 9, 10];
					ar1.a = 3;
					delete ar1[2];
					delete ar1[3];
					return ar1;
				};
					
				const createArray2 = function _createArray2() {
					const ar2 = [1, 2, 3];
					delete ar2[0];
					return ar2;
				};
					
				test.runCommand(tools.findItem, "Doodad.Tools.findItem", function(command, options) {
					command.runStep(null,                                             {repetitions: 100}  /**/);
					command.runStep(null,                                             {repetitions: 100}, /**/ ["there", "hi", "there"]);
					command.runStep(null,                                             {repetitions: 100}, /**/ ["there", "hi", "there"], "zzz");
					command.runStep(1,                                                {repetitions: 100}, /**/ ["there", "hi", "there"], "hi");
					command.runStep(0,                                                {repetitions: 100}, /**/ ["there", "hi", "there"], "there");
					command.runStep(0,                                                {repetitions: 100}, /**/ ["there", "hi", "there"], function(val, key, obj) {
						return val === "there";
					});
				});
					
					
				test.runCommand(tools.findLastItem, "Doodad.Tools.findLastItem", function(command, options) {
					command.runStep(null,                                             {repetitions: 100}  /**/);
					command.runStep(null,                                             {repetitions: 100}, /**/ ["there", "hi", "there"]);
					command.runStep(null,                                             {repetitions: 100}, /**/ ["there", "hi", "there"], "zzz");
					command.runStep(1,                                                {repetitions: 100}, /**/ ["there", "hi", "there"], "hi");
					command.runStep(2,                                                {repetitions: 100}, /**/ ["there", "hi", "there"], "there");
					command.runStep(2,                                                {repetitions: 100}, /**/ ["there", "hi", "there"], function(val, key, obj) {
						return val === "there";
					});
				});
					
					
				test.runCommand(tools.findItems, "Doodad.Tools.findItems", function(command, options) {
					command.runStep([],                                               {repetitions: 100}  /**/);
					command.runStep([],                                               {repetitions: 100}, /**/ ["there", "hi", "there"]);
					command.runStep([],                                               {repetitions: 100}, /**/ ["there", "hi", "there"], "zzz");
					command.runStep([1],                                              {contains: true, repetitions: 100}, /**/ ["there", "hi", "there"], "hi");
					command.runStep([0, 2],                                           {contains: true, repetitions: 100}, /**/ ["there", "hi", "there"], "there");
					command.runStep([0, 2],                                           {contains: true, repetitions: 100}, /**/ ["there", "hi", "there"], function(val, key, obj) {
						return val === "there";
					});
					command.runStep([0, 1, 2],                                        {contains: true, repetitions: 100}, /**/ ["there", "hi", "there"], ["hi", "there"]);
				});
					
					
				test.runCommand(tools.trim, "Doodad.Tools.trim", function(command, options) {
					command.runStep([" ", " ", "a", " ", " "],                        {repetitions: 100}, /**/ [" ", " ", "a", " ", " "], 0);
					command.runStep(["a"],                                            {repetitions: 100}, /**/ [" ", " ", "a", " ", " "]);
					command.runStep(["a"],                                            {repetitions: 100}, /**/ [" ", " ", "a", " ", " "], " ");
					command.runStep(["a"],                                            {repetitions: 100}, /**/ [" ", " ", "a", " ", " "], " ", 0);
					command.runStep(["a", " ", " "],                                  {repetitions: 100}, /**/ [" ", " ", "a", " ", " "], " ", 1);
					command.runStep([" ", " ", "a"],                                  {repetitions: 100}, /**/ [" ", " ", "a", " ", " "], " ", -1);
					command.runStep([" ", "a", " "],                                  {repetitions: 100}, /**/ [" ", " ", "a", " ", " "], " ", 0, 1);
					command.runStep([" ", " ", "a", " ", " "],                        {repetitions: 100}, /**/ [" ", " ", "a", " ", " "], "_");
					command.runStep([" ", "a", " "],                                  {repetitions: 100}, /**/ ["_", " ", "a", " ", "_"], "_");
				});
					
					
				test.runCommand(tools.join, "Doodad.Tools.join", function(command, options) {
					//command.runStep(types.AssertionError,    {mode: 'isinstance', skip: !root.DD_ASSERT}  /**/ );
					//command.runStep(types.AssertionError,    {mode: 'isinstance', skip: !root.DD_ASSERT}, /**/ "");
					//command.runStep(types.AssertionError,    {mode: 'isinstance', skip: !root.DD_ASSERT}, /**/ ['a', 'b', 'c'], 0);
					command.runStep("abc",                                            {repetitions: 100}, /**/ ['a', 'b', 'c']);
					command.runStep("a,b,c",                                          {repetitions: 100}, /**/ ['a', 'b', 'c'], ",");
					command.runStep("1,2,3",                                          {repetitions: 100}, /**/ [1, 2, 3], ",");
				});
					
					
				test.runCommand(tools.indexOf, "Doodad.Tools.indexOf", function(command, options) {
					command.runStep(-1,                                               {repetitions: 100}  /**/);
					command.runStep(-1,                                               {repetitions: 100}, /**/ ["hi", "there", "hi"]);
					command.runStep(-1,                                               {repetitions: 100}, /**/ ["hi", "there", "hi"], "zzz");
					command.runStep(1,                                                {repetitions: 100}, /**/ ["hi", "there", "hi"], "there");
				});
					
					
				test.runCommand(tools.lastIndexOf, "Doodad.Tools.lastIndexOf", function(command, options) {
					command.runStep(-1,                                               {repetitions: 100}  /**/);
					command.runStep(-1,                                               {repetitions: 100}, /**/ ["hi", "there", "hi"]);
					command.runStep(-1,                                               {repetitions: 100}, /**/ ["hi", "there", "hi"], "zzz");
					command.runStep(2,                                                {repetitions: 100}, /**/ ["hi", "there", "hi"], "hi");
				});
					
					
				test.runCommand(tools.map, "Doodad.Tools.map", function(command, options) {
					//command.runStep(types.AssertionError,    {mode: 'isinstance', skip: !root.DD_ASSERT}  /**/ );
					//command.runStep(types.AssertionError,    {mode: 'isinstance', skip: !root.DD_ASSERT}, /**/ ["a", "b", "c", "d", "e", "f"]);
					//command.runStep(types.AssertionError,    {mode: 'isinstance', skip: !root.DD_ASSERT}, /**/ ["a", "b", "c", "d", "e", "f"], "");
					command.runStep(['a', 'b', 'c', 'd', 'e', 'f'],                  {repetitions: 100},   /**/ ["a", "b", "c", "d", "e", "f"], function(val, key, obj) {
						return val;
					});
				});
					
					
				test.runCommand(function(obj) {
					const result = [];
					tools.forEach(obj, function(val, key, obj) {
						result.push(val);
					});
					return result;
				}, "Doodad.Tools.forEach", function(command, options) {
					command.runStep([],                                               {repetitions: 100}  /**/ );
					command.runStep(['a', 'b', 'c', 'd', 'e', 'f'],                   {repetitions: 100}, /**/ ["a", "b", "c", "d", "e", "f"]);
				});
					
					
				test.runCommand(tools.filter, "Doodad.Tools.filter", function(command, options) {
					command.runStep(undefined,                                        {repetitions: 100}  /**/);
					command.runStep([],                                               {repetitions: 100}, /**/ ["a", "b", "c", "d", "e", "f"]);
					command.runStep(['a'],                                            {repetitions: 100}, /**/ ["a", "b", "c", "d", "e", "f"], "a");
					command.runStep(['a'],                                            {repetitions: 100}, /**/ ["a", "b", "c", "d", "e", "f"], ['a']);
					command.runStep(['a', 'b'],                                       {repetitions: 100}, /**/ ["a", "b", "c", "d", "e", "f"], ['a', 'b']);
					command.runStep(['a'],                                            {repetitions: 100}, /**/ ["a", "b", "c", "d", "e", "f"], function(val, key, obj) {
						return val === 'a';
					});
					command.runStep(['c', 'd', 'e', 'f'],                             {repetitions: 100}, /**/ ["a", "b", "c", "d", "e", "f"], ['a', 'b'], null, true);
					command.runStep(['c', 'd', 'e', 'f'],                             {repetitions: 100}, /**/ ["a", "b", "c", "d", "e", "f"], function(val, key, obj) {
						return (val === 'a') || (val === 'b');
					}, null, true);
				});
					
					
				test.runCommand(tools.filterKeys, "Doodad.Tools.filterKeys", function(command, options) {
					command.runStep(undefined,                                        {repetitions: 100}  /**/);
					command.runStep([],                                               {repetitions: 100}, /**/ ["a", "b", "c", "d", "e", "f"]);
					command.runStep(['a'],                                            {repetitions: 100}, /**/ ["a", "b", "c", "d", "e", "f"], [0]);
					command.runStep(['a', 'b'],                                       {repetitions: 100}, /**/ ["a", "b", "c", "d", "e", "f"], [0, 1]);
					command.runStep(['a'],                                            {repetitions: 100}, /**/ ["a", "b", "c", "d", "e", "f"], function(val, key, obj) {
						return key === 0;
					});
					command.runStep(['c', 'd', 'e', 'f'],                             {repetitions: 100}, /**/ ["a", "b", "c", "d", "e", "f"], [0, 1], null, true);
					command.runStep(['c', 'd', 'e', 'f'],                             {repetitions: 100}, /**/ ["a", "b", "c", "d", "e", "f"], function(val, key, obj) {
						return (key === 0) || (key === 1);
					}, null, true);
				});
					
					
				test.runCommand(tools.every, "Doodad.Tools.every", function(command, options) {
					command.runStep(true,                                             {repetitions: 100}  /**/);
					command.runStep(true,                                             {repetitions: 100}, /**/ []);
					command.runStep(true,                                             {repetitions: 100}, /**/ [], "a");
					command.runStep(false,                                            {repetitions: 100}, /**/ ["a", "a", "a", "a", "a"]);
					command.runStep(true,                                             {repetitions: 100}, /**/ ["a", "a", "a", "a", "a"], "a");
					command.runStep(true,                                             {repetitions: 100}, /**/ ["a", "a", "a", "a", "a"], ["a"]);
					command.runStep(false,                                            {repetitions: 100}, /**/ ["a", "a", "a", "a", "a"], "b");
					command.runStep(true,                                             {repetitions: 100}, /**/ ["a", "b", "a", "b", "a"], "ab");
					command.runStep(false,                                            {repetitions: 100}, /**/ ["a", "b", "a", "b", "a"], ["ab"]);
					command.runStep(true,                                             {repetitions: 100}, /**/ ["a", "b", "a", "b", "a"], ["a", "b"]);
					command.runStep(true,                                             {repetitions: 100}, /**/ ["a", "b", "a", "b", "a"], ["a", "b", "c"]);
					command.runStep(true,                                             {repetitions: 100}, /**/ ["a", "b", "a", "b", "a"], {val1: "a", val2: "b"});
					command.runStep(true,                                             {repetitions: 100}, /**/ ["a", "b", "a", "b", "a"], {val1: "a", val2: "b", val3: "c"});
					command.runStep(false,                                            {repetitions: 100}, /**/ ["a", "a", "a", "a", "a"], "a", null, true);
					command.runStep(true,                                             {repetitions: 100}, /**/ ["a", "a", "a", "a", "a"], "b", null, true);
					command.runStep(true,                                             {repetitions: 100}, /**/ ["a", "a", "a", "a", "a"], function(val, key, obj) {
						return val === "a";
					});
					command.runStep(false,                                            {repetitions: 100}, /**/ ["a", "a", "a", "a", "a"], function(val, key, obj) {
						return val === "a";
					}, null, true);
				});
					
					
				test.runCommand(tools.some, "Doodad.Tools.some", function(command, options) {
					command.runStep(false,                                            {repetitions: 100}  /**/);
					command.runStep(false,                                            {repetitions: 100}, /**/ []);
					command.runStep(false,                                            {repetitions: 100}, /**/ [], "b");
					command.runStep(false,                                            {repetitions: 100}, /**/ ["a", "a", "a", "a", "a"]);
					command.runStep(true,                                             {repetitions: 100}, /**/ ["a", "a", "a", "b", "a"], "b");
					command.runStep(true,                                             {repetitions: 100}, /**/ ["a", "a", "a", "b", "a"], ["b"]);
					command.runStep(false,                                            {repetitions: 100}, /**/ ["a", "a", "a", "a", "a"], "b");
					command.runStep(true,                                             {repetitions: 100}, /**/ ["a", "a", "a", "b", "a"], "bc");
					command.runStep(true,                                             {repetitions: 100}, /**/ ["a", "a", "a", "b", "a"], ["b", "c"]);
					command.runStep(true,                                             {repetitions: 100}, /**/ ["a", "a", "a", "b", "a"], {val1: "b", val2: "c"});
					command.runStep(true,                                             {repetitions: 100}, /**/ ["a", "a", "a", "b", "a"], "b", null, true);
					command.runStep(false,                                            {repetitions: 100}, /**/ ["a", "a", "a", "b", "a"], ["a", "b"], null, true);
					command.runStep(true,                                             {repetitions: 100}, /**/ ["a", "a", "a", "b", "a"], function(val, key, obj) {
						return val === "b";
					});
					command.runStep(false,                                            {repetitions: 100}, /**/ ["a", "a", "a", "b", "a"], function(val, key, obj) {
						return (val === "a") || (val === "b");
					}, null, true);
				});
					
					
				test.runCommand(tools.reduce, "Doodad.Tools.reduce", function(command, options) {
					//command.runStep(types.AssertionError,                             {mode: 'isinstance', skip: !root.DD_ASSERT}   /**/);
					//command.runStep(types.AssertionError,                             {mode: 'isinstance', skip: !root.DD_ASSERT},  /**/ []);
					//command.runStep(types.AssertionError,                             {mode: 'isinstance', skip: !root.DD_ASSERT},  /**/ [], 1);
					command.runStep(types.ValueError,                                 {mode: 'isinstance'}, /**/ [], function(result, val, key, obj) {
						return result + val.charCodeAt(0) - 48;
					});
					command.runStep(0,                                                {repetitions: 100}, /**/ [], function(result, val, key, obj) {
						return result + val.charCodeAt(0) - 48;
					}, 0);
					command.runStep(6,                                                {repetitions: 100}, /**/ ["1", "2", "3"], function(result, val, key, obj) {
						return result + val.charCodeAt(0) - 48;
					}, 0);
					command.runStep("123",                                            {repetitions: 100}, /**/ ["1", "2", "3"], function(result, val, key, obj) {
						return result + val;
					}, "");
				});
					
					
				test.runCommand(tools.reduceRight, "Doodad.Tools.reduceRight", function(command, options) {
					//command.runStep(types.AssertionError,                             {mode: 'isinstance', skip: !root.DD_ASSERT}   /**/);
					//command.runStep(types.AssertionError,                             {mode: 'isinstance', skip: !root.DD_ASSERT},  /**/ []);
					//command.runStep(types.AssertionError,                             {mode: 'isinstance', skip: !root.DD_ASSERT},  /**/ [], 1);
					command.runStep(types.ValueError,                                 {mode: 'isinstance'}, /**/ [], function(result, val, key, obj) {
						return result + val.charCodeAt(0) - 48;
					});
					command.runStep(0,                                                {repetitions: 100}, /**/ [], function(result, val, key, obj) {
						return result + val.charCodeAt(0) - 48;
					}, 0);
					command.runStep(6,                                                {repetitions: 100}, /**/ ["1", "2", "3"], function(result, val, key, obj) {
						return result + val.charCodeAt(0) - 48;
					}, 0);
					command.runStep("321",                                            {repetitions: 100}, /**/ ["1", "2", "3"], function(result, val, key, obj) {
						return result + val;
					}, "");
				});

				
				test.runCommand(tools.getFirstIndex, "Doodad.Tools.getFirstIndex", function(command, options) {
					const ar1 = createArray1();
					const ar2 = createArray2();

					command.runStep(undefined,                                        {}  /**/ );
					command.runStep(0,                                                {}, /**/ ar1);
					command.runStep(1,                                                {}, /**/ ar2);
				});
					
					
				test.runCommand(tools.getFirstValue, "Doodad.Tools.getFirstValue", function(command, options) {
					const ar1 = createArray1();
					const ar2 = createArray2();

					command.runStep(undefined,                                        {}  /**/ );
					command.runStep(1,                                                {}, /**/ ar1);
					command.runStep(2,                                                {}, /**/ ar2);
				});
					
				test.runCommand(tools.popAt, "Doodad.Tools.popAt", function(command, options) {
					command.runStep(undefined,                                        {}  /**/ );
					command.chain(function(dummy) {
						const ar1 = createArray1();
						command.runStep(undefined,                                        {}, /**/  ar1);
					});
					command.chain(function(dummy) {
						const ar1 = createArray1();
						command.runStep(1,                                                {}, /**/  ar1, 0);
					});
					command.chain(function(dummy) {
						const ar1 = createArray1();
						command.runStep(2,                                                {}, /**/  ar1, 1);
					});
					command.chain(function(dummy) {
						const ar1 = createArray1();
						command.runStep(undefined,                                        {}, /**/  ar1, 2);
					});
					command.chain(function(dummy) {
						const ar1 = createArray1();
						command.runStep(undefined,                                        {}, /**/  ar1, 3);
					});
					command.chain(function(dummy) {
						const ar1 = createArray1();
						command.runStep(undefined,                                        {}, /**/  ar1, 4);
					});
					command.chain(function(dummy) {
						const ar1 = createArray1();
						command.runStep(3,                                                {}, /**/  ar1, 'a');
					});
					command.chain(function(dummy) {
						const ar1 = createArray1();
						command.runStep(undefined,                                        {}, /**/  ar1, 'b');
					});
				});

				test.runCommand(tools.popItem, "Doodad.Tools.popItem", function(command, options) {
					command.runStep(undefined,                                        {}  /**/ );
					command.chain(function(dummy) {
						const ar1 = createArray1();
						command.runStep(undefined,                                        {}, /**/  ar1);
					});
					command.chain(function(dummy) {
						const ar1 = createArray1();
						command.runStep(undefined,                                        {}, /**/  ar1, 0);
					});
					command.chain(function(dummy) {
						const ar1 = createArray1();
						command.runStep(1,                                                {}, /**/  ar1, 1);
					});
					command.chain(function(dummy) {
						const ar1 = createArray1();
						command.runStep(2,                                                {}, /**/  ar1, 2);
					});
					command.chain(function(dummy) {
						const ar1 = createArray1();
						command.runStep(1,                                                {contains: true}, /**/  ar1, function(val, key, obj) {
							return val === 1;
						});
					});
				});

				test.runCommand(tools.popItems, "Doodad.Tools.popItems", function(command, options) {
					command.runStep([],                                               {contains: true}  /**/ );
					command.chain(function(dummy) {
						const ar1 = createArray1();
						command.runStep([],                                               {contains: true}, /**/  ar1);
					});
					command.chain(function(dummy) {
						const ar1 = createArray1();
						command.runStep([],                                               {contains: true}, /**/  ar1, [0]);
					});
					command.chain(function(dummy) {
						const ar1 = createArray1();
						command.runStep([1],                                              {contains: true}, /**/  ar1, [0, 1]);
					});
					command.chain(function(dummy) {
						const ar1 = createArray1();
						command.runStep([1, 2],                                           {contains: true}, /**/  ar1, [0, 1, 2]);
					});
					command.chain(function(dummy) {
						const ar1 = createArray1();
						command.runStep([1],                                              {contains: true}, /**/  ar1, function(val, key, obj) {
							return val === 1;
						});
					});
				});
					
				test.runCommand(tools.append, "Doodad.Tools.append", function(command, options) {
					command.runStep(null,                                             {}  /**/ );
					command.chain(function(dummy) {
						const ar1 = createArray1();
						command.runStep([1, 2, test.EmptySlot, test.EmptySlot],           {}, /**/ ar1);
					});
					command.chain(function(dummy) {
						const ar1 = createArray1();
						command.runStep([1, 2, test.EmptySlot, test.EmptySlot, 3, 4],     {}, /**/ ar1, [3, 4]);
					});
					command.chain(function(dummy) {
						const ar2 = createArray2();
						command.runStep([test.EmptySlot, 2, 3, 4, 5],                     {}, /**/ ar2, [4, 5]);
					});
					command.chain(function(dummy) {
						const ar2 = createArray2();
						command.runStep([test.EmptySlot, 2, 3, 4, 5, 6, 7],               {}, /**/ ar2, [4, 5], [6, 7]);
					});
				});
					
				test.runCommand(tools.prepend, "Doodad.Tools.prepend", function(command, options) {
					command.runStep(null,                                             {}  /**/ );
					command.chain(function(dummy) {
						const ar1 = createArray1();
						command.runStep([1, 2, test.EmptySlot, test.EmptySlot],           {}, /**/ ar1);
					});
					command.chain(function(dummy) {
						const ar1 = createArray1();
						command.runStep([3, 4, 1, 2, test.EmptySlot, test.EmptySlot],     {}, /**/ ar1, [3, 4]);
					});
					command.chain(function(dummy) {
						const ar2 = createArray2();
						command.runStep([4, 5, test.EmptySlot, 2, 3],                     {}, /**/ ar2, [4, 5]);
					});
					command.chain(function(dummy) {
						const ar2 = createArray2();
						command.runStep([6, 7, 4, 5, test.EmptySlot, 2, 3],               {}, /**/ ar2, [4, 5], [6, 7]);
					});
				});

				test.runCommand(tools.unique, "Doodad.Tools.unique", function(command, options) {
					command.runStep([],                                               {repetitions: 100}   /**/);
					command.runStep(['a', 'b', 'c'],                                  {repetitions: 100},  /**/ ["a", "b", "c", "a", "b", "c"]);
					command.runStep(['a', 'b', 'c', 'd', 'e', 'f'],                   {repetitions: 100},  /**/ ["a", "b", "c", "a", "b", "c"], ["d", "e", "f", "d", "e", "f"]);
					command.runStep(['a', 'b', 'c'],                                  {repetitions: 100},  /**/ "abcabc");
					command.runStep(['a', 'b', 'c', 'd', 'e', 'f'],                   {repetitions: 100},  /**/ "abcabc", "defdef");
				});

			},
		},
	};
	return mods;
};

//! END_MODULE()
