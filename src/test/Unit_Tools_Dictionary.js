//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Unit_Tools_Dictionary.js - Unit testing module file
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
	mods['Doodad.Test.Tools.Dictionary'] = {
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
					
				
				const __Internal__ = {
					symbol1: types.hasSymbolsEnabled() && types.getSymbol("symbol1") || undefined,
					symbol2: types.hasSymbolsEnabled() && types.getSymbol("symbol2") || undefined,
				};
					
				const createDicts = function _createDicts() {
					const dicts = {};

					dicts.dict1 = {
						a: 1,
						b: 2,
					};
					if (__Internal__.symbol1) {
						dicts.dict1[__Internal__.symbol1] = 10;
					};
					
					/*
					const typeDict2 = function() {
						// Do nothing
					};
					typeDict2.prototype = types.setPrototypeOf(typeDict2.prototype, dicts.dict1);
					typeDict2.prototype.c = 3;
					typeDict2.prototype.d = 4;
					dicts.dict2 = new typeDict2();
						
					const typeDict3 = function() {};
					typeDict3.prototype = types.setPrototypeOf(typeDict3.prototype, dicts.dict2);
					dicts.dict3 = new typeDict3();
					dicts.dict3.e = 5;
					dicts.dict3.f = 6;
					if (__Internal__.symbol2) {
						dicts.dict3[__Internal__.symbol2] = 11;
					};
					*/

					return dicts;
				};
					

				test.runCommand(tools.findItem, "Doodad.Tools.findItem", function(command, options) {
					command.runStep(null,                                             {repetitions: 100}  /**/);
					command.runStep(null,                                             {repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"});
					command.runStep(null,                                             {repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"}, "zzz");
					command.runStep('b',                                              {repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"}, "hi");
					command.runStep('a',                                              {repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"}, "there");
					command.runStep('a',                                              {repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"}, function(val, key, obj) {
						return val === "there";
					});
				});
					
					
				test.runCommand(tools.findLastItem, "Doodad.Tools.findLastItem", function(command, options) {
					command.runStep(null,                                             {repetitions: 100}  /**/);
					command.runStep(null,                                             {repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"});
					command.runStep(null,                                             {repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"}, "zzz");
					command.runStep('b',                                              {repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"}, "hi");
					command.runStep('c',                                              {repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"}, "there");
					command.runStep('c',                                              {repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"}, function(val, key, obj) {
						return val === "there";
					});
				});
					
					
				test.runCommand(tools.findItems, "Doodad.Tools.findItems", function(command, options) {
					command.runStep([],                                               {repetitions: 100}  /**/);
					command.runStep([],                                               {repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"});
					command.runStep([],                                               {repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"}, "zzz");
					command.runStep(['b'],                                            {contains: true, repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"}, "hi");
					command.runStep(['a', 'c'],                                       {contains: true, repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"}, "there");
					command.runStep(['a', 'c'],                                       {contains: true, repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"}, function(val, key, obj) {
						return val === "there";
					});
				});
					
					
				test.runCommand(tools.map, "Doodad.Tools.map", function(command, options) {
					//command.runStep(types.AssertionError,    {mode: 'isinstance', skip: !root.DD_ASSERT}  /**/ );
					//command.runStep(types.AssertionError,    {mode: 'isinstance', skip: !root.DD_ASSERT}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"});
					//command.runStep(types.AssertionError,    {mode: 'isinstance', skip: !root.DD_ASSERT}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, "");
					command.runStep({val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, function(val, key, obj) {
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
					command.runStep(['a', 'b', 'c', 'd', 'e', 'f'],                   {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"});
				});
					
					
				test.runCommand(tools.filter, "Doodad.Tools.filter", function(command, options) {
					command.runStep(undefined,                                        {repetitions: 100}  /**/);
					command.runStep({},                                               {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"});
					command.runStep({val1: 'a'},                                      {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, "a");
					command.runStep({val1: 'a'},                                      {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, ['a']);
					command.runStep({val1: 'a', val2: 'b'},                           {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, ['a', 'b']);
					command.runStep({val1: 'a'},                                      {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, function(val, key, obj) {
						return val === 'a';
					});
					command.runStep({val3: 'c', val4: 'd', val5: 'e', val6: 'f'},     {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, ['a', 'b'], null, true);
					command.runStep({val3: 'c', val4: 'd', val5: 'e', val6: 'f'},     {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, function(val, key, obj) {
						return (val === 'a') || (val === 'b');
					}, null, true);
				});
					
					
				test.runCommand(tools.filterKeys, "Doodad.Tools.filterKeys", function(command, options) {
					command.runStep(undefined,                                        {repetitions: 100}  /**/);
					command.runStep({},                                               {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"});
					command.runStep({val1: 'a'},                                      {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, ['val1']);
					command.runStep({val1: 'a', val2: 'b'},                           {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, ['val1', 'val2']);
					command.runStep({val1: 'a'},                                      {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, function(val, key, obj) {
						return key === 'val1';
					});
					command.runStep({val3: 'c', val4: 'd', val5: 'e', val6: 'f'},     {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, ['val1', 'val2'], null, true);
					command.runStep({val3: 'c', val4: 'd', val5: 'e', val6: 'f'},     {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, function(val, key, obj) {
						return (key === 'val1') || (key === 'val2');
					}, null, true);
				});
					
					
				test.runCommand(tools.every, "Doodad.Tools.every", function(command, options) {
					command.runStep(true,                                             {repetitions: 100}  /**/);
					command.runStep(true,                                             {repetitions: 100}, /**/ {});
					command.runStep(true,                                             {repetitions: 100}, /**/ {}, "a");
					command.runStep(false,                                            {repetitions: 100}, /**/ {val1: "a", val2: "a", val3: "a", val4: "a", val5: "a"});
					command.runStep(true,                                             {repetitions: 100}, /**/ {val1: "a", val2: "a", val3: "a", val4: "a", val5: "a"}, "a");
					command.runStep(true,                                             {repetitions: 100}, /**/ {val1: "a", val2: "a", val3: "a", val4: "a", val5: "a"}, ["a"]);
					command.runStep(false,                                            {repetitions: 100}, /**/ {val1: "a", val2: "a", val3: "a", val4: "a", val5: "a"}, "b");
					command.runStep(true,                                             {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "a", val4: "b", val5: "a"}, "ab");
					command.runStep(false,                                            {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "a", val4: "b", val5: "a"}, ["ab"]);
					command.runStep(true,                                             {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "a", val4: "b", val5: "a"}, ["a", "b"]);
					command.runStep(true,                                             {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "a", val4: "b", val5: "a"}, ["a", "b", "c"]);
					command.runStep(true,                                             {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "a", val4: "b", val5: "a"}, {val1: "a", val2: "b"});
					command.runStep(true,                                             {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "a", val4: "b", val5: "a"}, {val1: "a", val2: "b", val3: "c"});
					command.runStep(false,                                            {repetitions: 100}, /**/ {val1: "a", val2: "a", val3: "a", val4: "a", val5: "a"}, "a", null, true);
					command.runStep(true,                                             {repetitions: 100}, /**/ {val1: "a", val2: "a", val3: "a", val4: "a", val5: "a"}, "b", null, true);
					command.runStep(true,                                             {repetitions: 100}, /**/ {val1: "a", val2: "a", val3: "a", val4: "a", val5: "a"}, function(val, key, obj) {
						return val === "a";
					});
					command.runStep(false,                                            {repetitions: 100}, /**/ {val1: "a", val2: "a", val3: "a", val4: "a", val5: "a"}, function(val, key, obj) {
						return val === "a";
					}, null, true);
				});
					
					
				test.runCommand(tools.some, "Doodad.Tools.some", function(command, options) {
					command.runStep(false,                                            {repetitions: 100}  /**/);
					command.runStep(false,                                            {repetitions: 100}, /**/ {});
					command.runStep(false,                                            {repetitions: 100}, /**/ {}, "b");
					command.runStep(false,                                            {repetitions: 100}, /**/ {val1: "a", val2: "a", val3: "a", val4: "a", val5: "a"});
					command.runStep(true,                                             {repetitions: 100}, /**/ {val1: "a", val2: "a", val3: "a", val4: "b", val5: "a"}, "b");
					command.runStep(true,                                             {repetitions: 100}, /**/ {val1: "a", val2: "a", val3: "a", val4: "b", val5: "a"}, ["b"]);
					command.runStep(false,                                            {repetitions: 100}, /**/ {val1: "a", val2: "a", val3: "a", val4: "a", val5: "a"}, "b");
					command.runStep(true,                                             {repetitions: 100}, /**/ {val1: "a", val2: "a", val3: "a", val4: "b", val5: "a"}, "bc");
					command.runStep(true,                                             {repetitions: 100}, /**/ {val1: "a", val2: "a", val3: "a", val4: "b", val5: "a"}, ["b", "c"]);
					command.runStep(true,                                             {repetitions: 100}, /**/ {val1: "a", val2: "a", val3: "a", val4: "b", val5: "a"}, {val1: "b", val2: "c"});
					command.runStep(true,                                             {repetitions: 100}, /**/ {val1: "a", val2: "a", val3: "a", val4: "b", val5: "a"}, "b", null, true);
					command.runStep(false,                                            {repetitions: 100}, /**/ {val1: "a", val2: "a", val3: "a", val4: "b", val5: "a"}, ["a", "b"], null, true);
					command.runStep(true,                                             {repetitions: 100}, /**/ {val1: "a", val2: "a", val3: "a", val4: "b", val5: "a"}, function(val, key, obj) {
						return val === "b";
					});
					command.runStep(false,                                            {repetitions: 100}, /**/ {val1: "a", val2: "a", val3: "a", val4: "b", val5: "a"}, function(val, key, obj) {
						return (val === "a") || (val === "b");
					}, null, true);
				});
					
					
				test.runCommand(tools.complete, "Doodad.Tools.complete", function(command, options) {
					command.runStep(undefined,                      {}     /**/ );

					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep({a: 1, b: 2, c: 4, d: 5},       {},    /**/ dicts.dict1, {a: 2, b: 3, c: 4, d: 5});
					});
				});
					
					
				test.runCommand(tools.depthComplete, "Doodad.Tools.depthComplete", function(command, options) {
					command.runStep(undefined,                               {}     /**/ );
					command.runStep({a: {aa: 1, bb: 2}, b: {cc: 3, dd: {aaa: 4}}},         {depth: 2},    /**/ 0, {a: {aa: 1, bb: 2}, b: {cc: 3, dd: {aaa: 4}}}, {b: {cc: 4, ee: 5}});
					command.runStep({a: {aa: 1, bb: 2}, b: {cc: 3, dd: {aaa: 4}, ee: 5}},  {depth: 2},    /**/ 1, {a: {aa: 1, bb: 2}, b: {cc: 3, dd: {aaa: 4}}}, {b: {cc: 4, ee: 5}});
				});
					
					
				test.runCommand(tools.extend, "Doodad.Tools.extend", function(command, options) {
					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep({a: 2, b: 3, c: 4, d: 5},       {},    /**/ dicts.dict1, {a: 2, b: 3, c: 4, d: 5});
					});
				});
					
					
				test.runCommand(tools.depthExtend, "Doodad.Tools.depthExtend", function(command, options) {
					command.runStep(undefined,                                              {}            /**/ );
					command.runStep({a: {aa: 1, bb: 2}, b: {cc: 4, dd: {aaa: 5}}},          {depth: 2}, /**/ 0, {a: {aa: 1, bb: 2}, b: {cc: 3, dd: {aaa: 4, bbb: 5}}}, {b: {cc: 4, dd: {aaa: 5}}});
					command.runStep({a: {aa: 1, bb: 2}, b: {cc: 4, dd: {aaa: 5}}},          {depth: 2}, /**/ 1, {a: {aa: 1, bb: 2}, b: {cc: 3, dd: {aaa: 4, bbb: 5}}}, {b: {cc: 4, dd: {aaa: 5}}});
					command.runStep({a: {aa: 1, bb: 2}, b: {cc: 4, dd: {aaa: 5, bbb: 5}}},  {depth: 2}, /**/ 2, {a: {aa: 1, bb: 2}, b: {cc: 3, dd: {aaa: 4, bbb: 5}}}, {b: {cc: 4, dd: {aaa: 5}}});
				});
					
					
				test.runCommand(tools.fill, "Doodad.Tools.fill", function(command, options) {
					command.runStep(undefined,                        {}     /**/ );

					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep({a: 1, b: 2},                     {},    /**/ undefined, dicts.dict1, {a: 2, b: 3, c: 4, d: 5});
					});

					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep({a: 2, b: 2},                     {},    /**/ 'a', dicts.dict1, {a: 2, b: 3, c: 4, d: 5});
					});

					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep({a: 2, b: 2, c: 4},               {},    /**/ ['a', 'c'], dicts.dict1, {a: 2, b: 3, c: 4, d: 5});
					});
				});
					
					
				test.runCommand(tools.popAt, "Doodad.Tools.popAt", function(command, options) {
					command.runStep(undefined,  {}     /**/ );

					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep(undefined,  {},    /**/  dicts.dict1);
					});

					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep(1,          {},    /**/  dicts.dict1, 'a');
					});

					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep(2,          {},    /**/  dicts.dict1, 'b');
					});

					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep(undefined,  {},    /**/  dicts.dict1, 'c');
					});
				});

				test.runCommand(tools.popItem, "Doodad.Tools.popItem", function(command, options) {
					command.runStep(undefined,  {}     /**/ );

					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep(undefined,  {},    /**/  dicts.dict1);
					});

					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep(undefined,  {},    /**/  dicts.dict1, 0);
					});

					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep(1,          {},    /**/  dicts.dict1, 1);
					});

					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep(2,          {},    /**/  dicts.dict1, 2);
					});

					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep(undefined,  {},    /**/  dicts.dict1, 3);
					});

					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep(1,          {contains: true}, /**/  dicts.dict1, function(val, key, obj) {
							return val === 1;
						});
					});
				});

				test.runCommand(tools.popItems, "Doodad.Tools.popItems", function(command, options) {
					command.runStep([],       {contains: true}  /**/ );

					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep([],       {contains: true}, /**/  dicts.dict1);
					});

					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep([],       {contains: true}, /**/  dicts.dict1, [0]);
					});

					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep([1],      {contains: true}, /**/  dicts.dict1, [0, 1]);
					});

					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep([1, 2],   {contains: true}, /**/  dicts.dict1, [0, 1, 2]);
					});

					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep([1],      {contains: true}, /**/  dicts.dict1, function(val, key, obj){
							return val === 1;
						});
					});
				});
					
			},
		},
	};
	return mods;
};

//! END_MODULE()