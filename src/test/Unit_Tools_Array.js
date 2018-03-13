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
					

				const createArrays = function createArrays() {
					global.ar1 = [1, 2, 9, 10];
					global.ar1.a = 3;
					delete global.ar1[2];
					delete global.ar1[3];
						
					global.ar2 = [1, 2, 3];
					delete global.ar2[0];
				};
					
				createArrays();
					

				let command;
					
				command = test.prepareCommand(tools.findItem, "Doodad.Tools.findItem");
				command.run(null,                                             {repetitions: 100}  /**/);
				command.run(null,                                             {repetitions: 100}, /**/ ["there", "hi", "there"]);
				command.run(null,                                             {repetitions: 100}, /**/ ["there", "hi", "there"], "zzz");
				command.run(1,                                                {repetitions: 100}, /**/ ["there", "hi", "there"], "hi");
				command.run(0,                                                {repetitions: 100}, /**/ ["there", "hi", "there"], "there");
				command.run(0,                                                {repetitions: 100}, /**/ ["there", "hi", "there"], function(val, key, obj) {return val === "there"});
				command.end();
					
					
				command = test.prepareCommand(tools.findLastItem, "Doodad.Tools.findLastItem");
				command.run(null,                                             {repetitions: 100}  /**/);
				command.run(null,                                             {repetitions: 100}, /**/ ["there", "hi", "there"]);
				command.run(null,                                             {repetitions: 100}, /**/ ["there", "hi", "there"], "zzz");
				command.run(1,                                                {repetitions: 100}, /**/ ["there", "hi", "there"], "hi");
				command.run(2,                                                {repetitions: 100}, /**/ ["there", "hi", "there"], "there");
				command.run(2,                                                {repetitions: 100}, /**/ ["there", "hi", "there"], function(val, key, obj) {return val === "there"});
				command.end();
					
					
				command = test.prepareCommand(tools.findItems, "Doodad.Tools.findItems");
				command.run([],                                               {repetitions: 100}  /**/);
				command.run([],                                               {repetitions: 100}, /**/ ["there", "hi", "there"]);
				command.run([],                                               {repetitions: 100}, /**/ ["there", "hi", "there"], "zzz");
				command.run([1],                                              {contains: true, repetitions: 100}, /**/ ["there", "hi", "there"], "hi");
				command.run([0, 2],                                           {contains: true, repetitions: 100}, /**/ ["there", "hi", "there"], "there");
				command.run([0, 2],                                           {contains: true, repetitions: 100}, /**/ ["there", "hi", "there"], function(val, key, obj) {return val === "there"});
				command.run([0, 1, 2],                                        {contains: true, repetitions: 100}, /**/ ["there", "hi", "there"], ["hi", "there"]);
				command.end();
					
					
				command = test.prepareCommand(tools.trim, "Doodad.Tools.trim");
				command.run([" ", " ", "a", " ", " "],                        {repetitions: 100}, /**/ [" ", " ", "a", " ", " "], 0);
				command.run(["a"],                                            {repetitions: 100}, /**/ [" ", " ", "a", " ", " "]);
				command.run(["a"],                                            {repetitions: 100}, /**/ [" ", " ", "a", " ", " "], " ");
				command.run(["a"],                                            {repetitions: 100}, /**/ [" ", " ", "a", " ", " "], " ", 0);
				command.run(["a", " ", " "],                                  {repetitions: 100}, /**/ [" ", " ", "a", " ", " "], " ", 1);
				command.run([" ", " ", "a"],                                  {repetitions: 100}, /**/ [" ", " ", "a", " ", " "], " ", -1);
				command.run([" ", "a", " "],                                  {repetitions: 100}, /**/ [" ", " ", "a", " ", " "], " ", 0, 1);
				command.run([" ", " ", "a", " ", " "],                        {repetitions: 100}, /**/ [" ", " ", "a", " ", " "], "_");
				command.run([" ", "a", " "],                                  {repetitions: 100}, /**/ ["_", " ", "a", " ", "_"], "_");
				command.end();
					
					
				command = test.prepareCommand(tools.join, "Doodad.Tools.join");
				//root.DD_ASSERT && command.run(types.AssertionError,    {mode: 'isinstance'}  /**/ );
				//root.DD_ASSERT && command.run(types.AssertionError,    {mode: 'isinstance'}, /**/ "");
				//root.DD_ASSERT && command.run(types.AssertionError,    {mode: 'isinstance'}, /**/ ['a', 'b', 'c'], 0);
				command.run("abc",                                            {repetitions: 100}, /**/ ['a', 'b', 'c']);
				command.run("a,b,c",                                          {repetitions: 100}, /**/ ['a', 'b', 'c'], ",");
				command.run("1,2,3",                                          {repetitions: 100}, /**/ [1, 2, 3], ",");
				command.end();
					
					
				command = test.prepareCommand(tools.indexOf, "Doodad.Tools.indexOf");
				command.run(-1,                                               {repetitions: 100}  /**/);
				command.run(-1,                                               {repetitions: 100}, /**/ ["hi", "there", "hi"]);
				command.run(-1,                                               {repetitions: 100}, /**/ ["hi", "there", "hi"], "zzz");
				command.run(1,                                                {repetitions: 100}, /**/ ["hi", "there", "hi"], "there");
				command.end();
					
					
				command = test.prepareCommand(tools.lastIndexOf, "Doodad.Tools.lastIndexOf");
				command.run(-1,                                               {repetitions: 100}  /**/);
				command.run(-1,                                               {repetitions: 100}, /**/ ["hi", "there", "hi"]);
				command.run(-1,                                               {repetitions: 100}, /**/ ["hi", "there", "hi"], "zzz");
				command.run(2,                                                {repetitions: 100}, /**/ ["hi", "there", "hi"], "hi");
				command.end();
					
					
				command = test.prepareCommand(tools.map, "Doodad.Tools.map");
				//root.DD_ASSERT && command.run(types.AssertionError,    {mode: 'isinstance'}  /**/ );
				//root.DD_ASSERT && command.run(types.AssertionError,    {mode: 'isinstance'}, /**/ ["a", "b", "c", "d", "e", "f"]);
				//root.DD_ASSERT && command.run(types.AssertionError,    {mode: 'isinstance'}, /**/ ["a", "b", "c", "d", "e", "f"], "");
				command.run(['a', 'b', 'c', 'd', 'e', 'f'],             {repetitions: 100},   /**/ ["a", "b", "c", "d", "e", "f"], function(val, key, obj) {return val});
				command.end();
					
					
				command = test.prepareCommand(function(obj) {
					const result = [];
					tools.forEach(obj, function(val, key, obj) {
						result.push(val);
					});
					return result;
				}, "Doodad.Tools.forEach");
				command.run([],                                               {repetitions: 100}  /**/ );
				command.run(['a', 'b', 'c', 'd', 'e', 'f'],                   {repetitions: 100}, /**/ ["a", "b", "c", "d", "e", "f"]);
				command.end();
					
					
				command = test.prepareCommand(tools.filter, "Doodad.Tools.filter");
				command.run(undefined,                                        {repetitions: 100}  /**/);
				command.run([],                                               {repetitions: 100}, /**/ ["a", "b", "c", "d", "e", "f"]);
				command.run(['a'],                                            {repetitions: 100}, /**/ ["a", "b", "c", "d", "e", "f"], "a");
				command.run(['a'],                                            {repetitions: 100}, /**/ ["a", "b", "c", "d", "e", "f"], ['a']);
				command.run(['a', 'b'],                                       {repetitions: 100}, /**/ ["a", "b", "c", "d", "e", "f"], ['a', 'b']);
				command.run(['a'],                                            {repetitions: 100}, /**/ ["a", "b", "c", "d", "e", "f"], function(val, key, obj) {return val === 'a'});
				command.run(['c', 'd', 'e', 'f'],                             {repetitions: 100}, /**/ ["a", "b", "c", "d", "e", "f"], ['a', 'b'], null, true);
				command.run(['c', 'd', 'e', 'f'],                             {repetitions: 100}, /**/ ["a", "b", "c", "d", "e", "f"], function(val, key, obj) {return val === 'a' || val === 'b'}, null, true);
				command.end();
					
					
				command = test.prepareCommand(tools.filterKeys, "Doodad.Tools.filterKeys");
				command.run(undefined,                                        {repetitions: 100}  /**/);
				command.run([],                                               {repetitions: 100}, /**/ ["a", "b", "c", "d", "e", "f"]);
				command.run(['a'],                                            {repetitions: 100}, /**/ ["a", "b", "c", "d", "e", "f"], [0]);
				command.run(['a', 'b']          ,                             {repetitions: 100}, /**/ ["a", "b", "c", "d", "e", "f"], [0, 1]);
				command.run(['a'],                                            {repetitions: 100}, /**/ ["a", "b", "c", "d", "e", "f"], function(val, key, obj) {return key === 0});
				command.run(['c', 'd', 'e', 'f'],                             {repetitions: 100}, /**/ ["a", "b", "c", "d", "e", "f"], [0, 1], null, true);
				command.run(['c', 'd', 'e', 'f'],                             {repetitions: 100}, /**/ ["a", "b", "c", "d", "e", "f"], function(val, key, obj) {return key === 0 || key === 1}, null, true);
				command.end();
					
					
				command = test.prepareCommand(tools.every, "Doodad.Tools.every");
				command.run(true,                                             {repetitions: 100}  /**/);
				command.run(true,                                             {repetitions: 100}, /**/ []);
				command.run(true,                                             {repetitions: 100}, /**/ [], "a");
				command.run(false,                                            {repetitions: 100}, /**/ ["a", "a", "a", "a", "a"]);
				command.run(true,                                             {repetitions: 100}, /**/ ["a", "a", "a", "a", "a"], "a");
				command.run(true,                                             {repetitions: 100}, /**/ ["a", "a", "a", "a", "a"], ["a"]);
				command.run(false,                                            {repetitions: 100}, /**/ ["a", "a", "a", "a", "a"], "b");
				command.run(true,                                             {repetitions: 100}, /**/ ["a", "b", "a", "b", "a"], "ab");
				command.run(false,                                            {repetitions: 100}, /**/ ["a", "b", "a", "b", "a"], ["ab"]);
				command.run(true,                                             {repetitions: 100}, /**/ ["a", "b", "a", "b", "a"], ["a", "b"]);
				command.run(true,                                             {repetitions: 100}, /**/ ["a", "b", "a", "b", "a"], ["a", "b", "c"]);
				command.run(true,                                             {repetitions: 100}, /**/ ["a", "b", "a", "b", "a"], {val1: "a", val2: "b"});
				command.run(true,                                             {repetitions: 100}, /**/ ["a", "b", "a", "b", "a"], {val1: "a", val2: "b", val3: "c"});
				command.run(false,                                            {repetitions: 100}, /**/ ["a", "a", "a", "a", "a"], "a", null, true);
				command.run(true,                                             {repetitions: 100}, /**/ ["a", "a", "a", "a", "a"], "b", null, true);
				command.run(true,                                             {repetitions: 100}, /**/ ["a", "a", "a", "a", "a"], function(val, key, obj) {return val === "a"});
				command.run(false,                                            {repetitions: 100}, /**/ ["a", "a", "a", "a", "a"], function(val, key, obj) {return val === "a"}, null, true);
				command.end();
					
					
				command = test.prepareCommand(tools.some, "Doodad.Tools.some");
				command.run(false,                                            {repetitions: 100}  /**/);
				command.run(false,                                            {repetitions: 100}, /**/ []);
				command.run(false,                                            {repetitions: 100}, /**/ [], "b");
				command.run(false,                                            {repetitions: 100}, /**/ ["a", "a", "a", "a", "a"]);
				command.run(true,                                             {repetitions: 100}, /**/ ["a", "a", "a", "b", "a"], "b");
				command.run(true,                                             {repetitions: 100}, /**/ ["a", "a", "a", "b", "a"], ["b"]);
				command.run(false,                                            {repetitions: 100}, /**/ ["a", "a", "a", "a", "a"], "b");
				command.run(true,                                             {repetitions: 100}, /**/ ["a", "a", "a", "b", "a"], "bc");
				command.run(true,                                             {repetitions: 100}, /**/ ["a", "a", "a", "b", "a"], ["b", "c"]);
				command.run(true,                                             {repetitions: 100}, /**/ ["a", "a", "a", "b", "a"], {val1: "b", val2: "c"});
				command.run(true,                                             {repetitions: 100}, /**/ ["a", "a", "a", "b", "a"], "b", null, true);
				command.run(false,                                            {repetitions: 100}, /**/ ["a", "a", "a", "b", "a"], ["a", "b"], null, true);
				command.run(true,                                             {repetitions: 100}, /**/ ["a", "a", "a", "b", "a"], function(val, key, obj) {return val === "b"});
				command.run(false,                                            {repetitions: 100}, /**/ ["a", "a", "a", "b", "a"], function(val, key, obj) {return val === "a" || val === "b"}, null, true);
				command.end();
					
					
				command = test.prepareCommand(tools.reduce, "Doodad.Tools.reduce");
				//command.run(types.AssertionError,                         {mode: 'isinstance'}   /**/);
				//command.run(types.AssertionError,                         {mode: 'isinstance'},  /**/ []);
				//command.run(types.AssertionError,                         {mode: 'isinstance'},  /**/ [], 1);
				command.run(types.ValueError,                                {mode: 'isinstance'}, /**/ [], function(result, val, key, obj) {return result + val.charCodeAt(0) - 48});
				command.run(0,                                                {repetitions: 100}, /**/ [], function(result, val, key, obj) {return result + val.charCodeAt(0) - 48}, 0);
				command.run(6,                                                {repetitions: 100}, /**/ ["1", "2", "3"], function(result, val, key, obj) {return result + val.charCodeAt(0) - 48}, 0);
				command.run("123",                                            {repetitions: 100}, /**/ ["1", "2", "3"], function(result, val, key, obj) {return result + val}, "");
				command.end();
					
					
				command = test.prepareCommand(tools.reduceRight, "Doodad.Tools.reduceRight");
				//command.run(types.AssertionError,                         {mode: 'isinstance'}   /**/);
				//command.run(types.AssertionError,                         {mode: 'isinstance'},  /**/ []);
				//command.run(types.AssertionError,                         {mode: 'isinstance'},  /**/ [], 1);
				command.run(types.ValueError,                                {mode: 'isinstance'}, /**/ [], function(result, val, key, obj) {return result + val.charCodeAt(0) - 48});
				command.run(0,                                                {repetitions: 100}, /**/ [], function(result, val, key, obj) {return result + val.charCodeAt(0) - 48}, 0);
				command.run(6,                                                {repetitions: 100}, /**/ ["1", "2", "3"], function(result, val, key, obj) {return result + val.charCodeAt(0) - 48}, 0);
				command.run("321",                                            {repetitions: 100}, /**/ ["1", "2", "3"], function(result, val, key, obj) {return result + val}, "");
				command.end();

				
				command = test.prepareCommand(tools.getFirstIndex, "Doodad.Tools.getFirstIndex");
				command.run(undefined,  {eval: true}     /**/ );
				command.run(0,          {eval: true},    /**/ "ar1");
				command.run(1,          {eval: true},    /**/ "ar2");
				command.end();
					
					
				command = test.prepareCommand(tools.getFirstValue, "Doodad.Tools.getFirstValue");
				command.run(undefined,  {eval: true}     /**/ );
				command.run(1,          {eval: true},    /**/ "ar1");
				command.run(2,          {eval: true},    /**/ "ar2");
				command.end();
					
				command = test.prepareCommand(tools.popAt, "Doodad.Tools.popAt");
				command.run(undefined,  {eval: true}     /**/ );
				command.run(undefined,  {eval: true},    /**/  "ar1");
				command.chain(function(dummy) {
					createArrays();
				});
				command.run(1,          {eval: true},    /**/  "ar1", 0);
				command.chain(function(dummy) {
					createArrays();
				});
				command.run(2,          {eval: true},    /**/  "ar1", 1);
				command.chain(function(dummy) {
					createArrays();
				});
				command.run(undefined,  {eval: true},    /**/  "ar1", 2);
				command.chain(function(dummy) {
					createArrays();
				});
				command.run(undefined,  {eval: true},    /**/  "ar1", 3);
				command.chain(function(dummy) {
					createArrays();
				});
				command.run(undefined,  {eval: true},    /**/  "ar1", 4);
				command.chain(function(dummy) {
					createArrays();
				});
				command.run(3,          {eval: true},    /**/  "ar1", "'a'");
				command.chain(function(dummy) {
					createArrays();
				});
				command.run(undefined,  {eval: true},    /**/  "ar1", "'b'");
				command.end();
				command.chain(function(dummy) {
					createArrays();
				});

				command = test.prepareCommand(tools.popItem, "Doodad.Tools.popItem");
				command.run(undefined,  {eval: true}     /**/ );
				command.run(undefined,  {eval: true},    /**/  "ar1");
				command.run(undefined,  {eval: true},    /**/  "ar1", 0);
				command.chain(function(dummy) {
					createArrays();
				});
				command.run(1,          {eval: true},    /**/  "ar1", 1);
				command.chain(function(dummy) {
					createArrays();
				});
				command.run(2,          {eval: true},    /**/  "ar1", 2);
				command.chain(function(dummy) {
					createArrays();
				});
				command.run(1,          {eval: true, contains: true}, /**/  "ar1", "function(val, key, obj){return val === 1}");
				command.end();
				command.chain(function(dummy) {
					createArrays();
				});

				command = test.prepareCommand(tools.popItems, "Doodad.Tools.popItems");
				command.run("[]",       {eval: true, contains: true}  /**/ );
				command.run("[]",       {eval: true, contains: true}, /**/  "ar1");
				command.run("[]",       {eval: true, contains: true}, /**/  "ar1", "[0]");
				command.chain(function(dummy) {
					createArrays();
				});
				command.run("[1]",      {eval: true, contains: true}, /**/  "ar1", "[0, 1]");
				command.chain(function(dummy) {
					createArrays();
				});
				command.run("[1, 2]",   {eval: true, contains: true}, /**/  "ar1", "[0, 1, 2]");
				command.chain(function(dummy) {
					createArrays();
				});
				command.run("[1]",      {eval: true, contains: true}, /**/  "ar1", "function(val, key, obj){return val === 1}");
				command.end();
				command.chain(function(dummy) {
					createArrays();
				});
					
				command = test.prepareCommand(tools.append, "Doodad.Tools.append");
				command.run(null,                                           {eval: true}     /**/ );
				command.run("[1, 2, ctx.EmptySlot, ctx.EmptySlot]",       {eval: true},    /**/ "ar1");
				command.run("[1, 2, ctx.EmptySlot, ctx.EmptySlot, 3, 4]", {eval: true},    /**/ "ar1", "[3, 4]");
				command.chain(function(dummy) {
					createArrays();
				});
				command.run("[ctx.EmptySlot, 2, 3, 4, 5]",                 {eval: true},    /**/ "ar2", "[4, 5]");
				command.chain(function(dummy) {
					createArrays();
				});
				command.run("[ctx.EmptySlot, 2, 3, 4, 5, 6, 7]",           {eval: true},    /**/ "ar2", "[4, 5]", "[6, 7]");
				command.end();
				command.chain(function(dummy) {
					createArrays();
				});
					
				command = test.prepareCommand(tools.prepend, "Doodad.Tools.prepend");
				command.run(null,                                           {eval: true}     /**/ );
				command.run("[1, 2, ctx.EmptySlot, ctx.EmptySlot]",       {eval: true},    /**/ "ar1");
				command.run("[3, 4, 1, 2, ctx.EmptySlot, ctx.EmptySlot]", {eval: true},    /**/ "ar1", "[3, 4]");
				command.chain(function(dummy) {
					createArrays();
				});
				command.run("[4, 5, ctx.EmptySlot, 2, 3]",                 {eval: true},    /**/ "ar2", "[4, 5]");
				command.chain(function(dummy) {
					createArrays();
				});
				command.run("[6, 7, 4, 5, ctx.EmptySlot, 2, 3]",           {eval: true},    /**/ "ar2", "[4, 5]", "[6, 7]");
				command.end();
				command.chain(function(dummy) {
					createArrays();
				});
					
				command = test.prepareCommand(tools.unique, "Doodad.Tools.unique");
				command.run([],                                               {repetitions: 100}     /**/);
				command.run(['a', 'b', 'c'],                                  {repetitions: 100},    /**/ ["a", "b", "c", "a", "b", "c"]);
				command.run(['a', 'b', 'c', 'd', 'e', 'f'],                   {repetitions: 100},    /**/ ["a", "b", "c", "a", "b", "c"], ["d", "e", "f", "d", "e", "f"]);
				command.run(['a', 'b', 'c'],                                  {repetitions: 100},    /**/ "abcabc");
				command.run(['a', 'b', 'c', 'd', 'e', 'f'],                   {repetitions: 100},    /**/ "abcabc", "defdef");
				command.end();

			},
		},
	};
	return mods;
};

//! END_MODULE()
