//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Unit_Tools_String.js - Unit testing module file
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
	mods['Doodad.Test.Tools.String'] = {
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


				test.runCommand(tools.findItem, "Doodad.Tools.findItem", function(command, options) {
					command.runStep(null,                                             {repetitions: 100}  /**/);
					command.runStep(null,                                             {repetitions: 100}, /**/ "hi there !");
					command.runStep(null,                                             {repetitions: 100}, /**/ "hi there !", "z");
					command.runStep(5,                                                {repetitions: 100}, /**/ "hi there !", "e");
					command.runStep(5,                                                {repetitions: 100}, /**/ "hi there !", function(val, key, obj) {
						return val === "e";
					});
				});


				test.runCommand(tools.findLastItem, "Doodad.Tools.findLastItem", function(command, options) {
					command.runStep(null,                                             {repetitions: 100}  /**/);
					command.runStep(null,                                             {repetitions: 100}, /**/ "hi there !");
					command.runStep(null,                                             {repetitions: 100}, /**/ "hi there !", "z");
					command.runStep(7,                                                {repetitions: 100}, /**/ "hi there !", "e");
					command.runStep(7,                                                {repetitions: 100}, /**/ "hi there !", function(val, key, obj) {
						return val === "e";
					});
				});


				test.runCommand(tools.findItems, "Doodad.Tools.findItems", function(command, options) {
					command.runStep([],                                               {repetitions: 100}  /**/);
					command.runStep([],                                               {repetitions: 100}, /**/ "hi there !");
					command.runStep([],                                               {repetitions: 100}, /**/ "hi there !", "z");
					command.runStep([5, 7],                                           {contains: true, repetitions: 100}, /**/ "hi there !", "e");
					command.runStep([5, 7],                                           {contains: true, repetitions: 100}, /**/ "hi there !", function(val, key, obj) {
						return val === "e";
					});
				});


				test.runCommand(tools.repeat, "Doodad.Tools.repeat", function(command, options) {

					command.runStep(types.AssertionError,    {mode: 'isinstance', skip: !root.getOptions().enableAsserts}  /**/ );
					command.runStep(types.AssertionError,    {mode: 'isinstance', skip: !root.getOptions().enableAsserts}, /**/ "a");
					command.runStep("",                                               {repetitions: 100}, /**/ "a", 0);
					command.runStep("a",                                              {repetitions: 100}, /**/ "a", 1);
					command.runStep("aa",                                             {repetitions: 100}, /**/ "a", 2);
					command.runStep("aaaaa",                                          {repetitions: 100}, /**/ "a", 5);

				});


				test.runCommand(tools.trim, "Doodad.Tools.trim", function(command, options) {

					//command.runStep(types.AssertionError,    {mode: 'isinstance', skip: !root.getOptions().enableAsserts}  /**/ );
					//command.runStep(types.AssertionError,    {mode: 'isinstance', skip: !root.getOptions().enableAsserts}, /**/ "a", 0);
					//command.runStep(types.AssertionError,    {mode: 'isinstance', skip: !root.getOptions().enableAsserts}, /**/ "  a  ", " ", "");
					//command.runStep(types.AssertionError,    {mode: 'isinstance', skip: !root.getOptions().enableAsserts}, /**/ "  a  ", " ", 0, "");
					command.runStep("a",                                              {repetitions: 100}, /**/ "  a  ");
					command.runStep("a",                                              {repetitions: 100}, /**/ "  a  ", " ");
					command.runStep("a",                                              {repetitions: 100}, /**/ "  a  ", " ", 0);
					command.runStep("a  ",                                            {repetitions: 100}, /**/ "  a  ", " ", 1);
					command.runStep("  a",                                            {repetitions: 100}, /**/ "  a  ", " ", -1);
					command.runStep(" a ",                                            {repetitions: 100}, /**/ "  a  ", " ", 0, 1);
					command.runStep("  a  ",                                          {repetitions: 100}, /**/ "  a  ", "_");
					command.runStep(" a ",                                            {repetitions: 100}, /**/ "_ a _", "_");

				});


				test.runCommand(tools.replace, "Doodad.Tools.replace", function(command, options) {

					command.runStep(types.AssertionError,    {mode: 'isinstance', skip: !root.getOptions().enableAsserts}  /**/ );
					command.runStep(types.AssertionError,    {mode: 'isinstance', skip: !root.getOptions().enableAsserts}, /**/ "abcabcabc", 0);
					command.runStep(types.AssertionError,    {mode: 'isinstance', skip: !root.getOptions().enableAsserts}, /**/ "abcabcabc", "a");
					command.runStep(types.AssertionError,    {mode: 'isinstance', skip: !root.getOptions().enableAsserts}, /**/ "abcabcabc", "a", 0);
					command.runStep(types.AssertionError,    {mode: 'isinstance', skip: !root.getOptions().enableAsserts}, /**/ "abcabcabc", "a", " ", 0);
					command.runStep(" bcabcabc",                                      {repetitions: 100}, /**/ "abcabcabc", "a", " ");
					command.runStep(" bc bc bc",                                      {repetitions: 100}, /**/ "abcabcabc", "a", " ", "g");
					command.runStep(" bc bc bc",                                      {repetitions: 100}, /**/ "abcabcabc", new RegExp("a", "g"), " ");

				});


				test.runCommand(tools.search, "Doodad.Tools.search", function(command, options) {

					command.runStep(types.AssertionError,    {mode: 'isinstance', skip: !root.getOptions().enableAsserts}  /**/ );
					command.runStep(types.AssertionError,    {mode: 'isinstance', skip: !root.getOptions().enableAsserts}, /**/ "abcabcabc");
					command.runStep(types.AssertionError,    {mode: 'isinstance', skip: !root.getOptions().enableAsserts}, /**/ "abcabcabc", 1);
					command.runStep(types.AssertionError,    {mode: 'isinstance', skip: !root.getOptions().enableAsserts}, /**/ "abcabcabc", "b", "");
					command.runStep(types.AssertionError,    {mode: 'isinstance', skip: !root.getOptions().enableAsserts}, /**/ "abcabcabc", "b", 0, "");
					command.runStep(types.AssertionError,    {mode: 'isinstance', skip: !root.getOptions().enableAsserts}, /**/ "abcabcabc", "b", 0, 1, 0);
					command.runStep(1,                                                {repetitions: 100}, /**/ "abcabcabc", "b");
					command.runStep(1,                                                {repetitions: 100}, /**/ "abcabcabc", "b", 0);
					command.runStep(4,                                                {repetitions: 100}, /**/ "abcabcabc", "b", 2);
					command.runStep(-1,                                               {repetitions: 100}, /**/ "abcabcabc", "b", 0, 0);
					command.runStep(1,                                                {repetitions: 100}, /**/ "abcabcabc", "b", 0, 1);
					command.runStep(4,                                                {repetitions: 100}, /**/ "abcabcabc", "b", 2, 4);
					command.runStep(NaN,                                              {repetitions: 100}, /**/ "abcabcabc", "b", undefined, undefined, "a");
					command.runStep(1,                                                {repetitions: 100}, /**/ "abcabcabc", new RegExp("b"));
					command.runStep(1,                                                {repetitions: 100}, /**/ "abcabcabc", new RegExp("b"), 0);
					command.runStep(types.ValueError,                              {mode: 'isinstance', repetitions: 100}, /**/ "abcabcabc", new RegExp("b"), 2);
					command.runStep(4,                                                {repetitions: 100}, /**/ "abcabcabc", new RegExp("b", "g"), 2);
					command.runStep(-1,                                               {repetitions: 100}, /**/ "abcabcabc", new RegExp("b"), 0, 0);
					command.runStep(1,                                                {repetitions: 100}, /**/ "abcabcabc", new RegExp("b"), 0, 1);
					command.runStep(types.ValueError,                              {mode: 'isinstance', repetitions: 100}, /**/ "abcabcabc", new RegExp("b"), 2, 4);
					command.runStep(4,                                                {repetitions: 100}, /**/ "abcabcabc", new RegExp("b", "g"), 2, 4);
					command.runStep(NaN,                                              {repetitions: 100}, /**/ "abcabcabc", new RegExp("b"), undefined, undefined, "a");
					command.runStep(types.ValueError,                              {mode: 'isinstance', repetitions: 100}, /**/ "abcabcabc", new RegExp("b", "g"), 1, undefined, new RegExp("a"));
					command.runStep(1,                                                {repetitions: 100}, /**/ "abcabcabc", new RegExp("b", "g"), 1, undefined, new RegExp("a", "g"));

				});


				test.runCommand(tools.join, "Doodad.Tools.join", function(command, options) {

					command.runStep(types.AssertionError,    {mode: 'isinstance', skip: !root.getOptions().enableAsserts}  /**/ );
					command.runStep(types.AssertionError,    {mode: 'isinstance', skip: !root.getOptions().enableAsserts}, /**/ "");
					command.runStep(types.AssertionError,    {mode: 'isinstance', skip: !root.getOptions().enableAsserts}, /**/ ['a', 'b', 'c'], 0);
					command.runStep("abc",                                            {repetitions: 100}, /**/ ['a', 'b', 'c']);
					command.runStep("a,b,c",                                          {repetitions: 100}, /**/ ['a', 'b', 'c'], ",");
					command.runStep("1,2,3",                                          {repetitions: 100}, /**/ [1, 2, 3], ",");

				});


				test.runCommand(tools.title, "Doodad.Tools.title", function(command, options) {

					command.runStep(types.AssertionError,    {mode: 'isinstance', skip: !root.getOptions().enableAsserts}  /**/ );
					command.runStep(types.AssertionError,    {mode: 'isinstance', skip: !root.getOptions().enableAsserts}, /**/ 0);
					command.runStep(types.AssertionError,    {mode: 'isinstance', skip: !root.getOptions().enableAsserts}, /**/ "cHarLie bRaVO", 0);
					command.runStep("",                                               {repetitions: 100}, /**/ "");
					command.runStep(" ",                                              {repetitions: 100}, /**/ " ");
					command.runStep("Charlie Bravo",                                  {repetitions: 100}, /**/ "cHarLie bRaVO");
					command.runStep("Charlie Bravo",                                  {repetitions: 100}, /**/ "cHarLie bRaVO", "");
					command.runStep("Charlie Bravo",                                  {repetitions: 100}, /**/ "cHarLie bRaVO", " ");
					command.runStep("Charlie-bravo",                                  {repetitions: 100}, /**/ "cHarLie-bRaVO");
					command.runStep("Charlie-Bravo",                                  {repetitions: 100}, /**/ "cHarLie-bRaVO", "-");

				});


				test.runCommand(tools.format, "Doodad.Tools.format", function(command, options) {

					command.runStep("hi",                                             {repetitions: 100}, /**/ "~0~", ["hi", "there"]);
					command.runStep("there",                                          {repetitions: 100}, /**/ "~1~", ["hi", "there"]);
					command.runStep("hi hi",                                          {repetitions: 100}, /**/ "~0~ ~0~", ["hi", "there"]);
					command.runStep("hi there",                                       {repetitions: 100}, /**/ "~0~ ~1~", ["hi", "there"]);
					command.runStep(" hi there !",                                    {repetitions: 100}, /**/ " ~0~ ~1~ !", ["hi", "there"]);
					command.runStep(" hi there !",                                    {repetitions: 100}, /**/ " ~a~ ~b~ !", {a: "hi", b: "there"});

				});


				test.runCommand(tools.indexOf, "Doodad.Tools.indexOf", function(command, options) {

					command.runStep(-1,                                               {repetitions: 100}  /**/);
					command.runStep(-1,                                               {repetitions: 100}, /**/ "hi there !");
					command.runStep(-1,                                               {repetitions: 100}, /**/ "hi there !", "z");
					command.runStep(5,                                                {repetitions: 100}, /**/ "hi there !", "e");

				});


				test.runCommand(tools.lastIndexOf, "Doodad.Tools.lastIndexOf", function(command, options) {

					command.runStep(-1,                                               {repetitions: 100}  /**/);
					command.runStep(-1,                                               {repetitions: 100}, /**/ "hi there !");
					command.runStep(-1,                                               {repetitions: 100}, /**/ "hi there !", "z");
					command.runStep(7,                                                {repetitions: 100}, /**/ "hi there !", "e");

				});


				test.runCommand(tools.map, "Doodad.Tools.map", function(command, options) {

					//command.runStep(types.AssertionError,    {mode: 'isinstance', skip: !root.getOptions().enableAsserts}  /**/ );
					//command.runStep(types.AssertionError,    {mode: 'isinstance', skip: !root.getOptions().enableAsserts}, /**/ "abcdef");
					//command.runStep(types.AssertionError,    {mode: 'isinstance', skip: !root.getOptions().enableAsserts}, /**/ "abcdef", "");
					command.runStep(['a', 'b', 'c', 'd', 'e', 'f'],                   {repetitions: 100}, /**/ "abcdef", function(val, key, obj) {return val});

				});


				test.runCommand(function(obj) {
					const result = [];
					tools.forEach(obj, function(val, key, obj) {
						result.push(val);
					});
					return result;
				}, "Doodad.Tools.forEach", function(command, options) {

					command.runStep([],                                               {repetitions: 100}  /**/ );
					command.runStep(['a', 'b', 'c', 'd', 'e', 'f'],                   {repetitions: 100}, /**/ "abcdef");

				});


				test.runCommand(tools.filter, "Doodad.Tools.filter", function(command, options) {

					command.runStep(undefined,                                        {repetitions: 100}  /**/);
					command.runStep([],                                               {repetitions: 100}, /**/ "abcdefabcdef");
					command.runStep(['a', 'a'],                                       {repetitions: 100}, /**/ "abcdefabcdef", "a");
					command.runStep(['a', 'a'],                                       {repetitions: 100}, /**/ "abcdefabcdef", ['a']);
					command.runStep(['a', 'b', 'a', 'b'],                             {repetitions: 100}, /**/ "abcdefabcdef", ['a', 'b']);
					command.runStep(['a', 'a'],                                       {repetitions: 100}, /**/ "abcdefabcdef", function(val, key, obj) {
						return val === 'a';
					});
					command.runStep(['c', 'd', 'e', 'f', 'c', 'd', 'e', 'f'],         {repetitions: 100}, /**/ "abcdefabcdef", ['a', 'b'], null, true);
					command.runStep(['c', 'd', 'e', 'f', 'c', 'd', 'e', 'f'],         {repetitions: 100}, /**/ "abcdefabcdef", function(val, key, obj) {
						return (val === 'a') || (val === 'b');
					}, null, true);

				});


				test.runCommand(tools.filterKeys, "Doodad.Tools.filterKeys", function(command, options) {

					command.runStep(undefined,                                        {repetitions: 100}  /**/);
					command.runStep([],                                               {repetitions: 100}, /**/ "abcdefabcdef");
					command.runStep(['a'],                                            {repetitions: 100}, /**/ "abcdefabcdef", [0]);
					command.runStep(['a', 'b']          ,                             {repetitions: 100}, /**/ "abcdefabcdef", [0, 1]);
					command.runStep(['a'],                                            {repetitions: 100}, /**/ "abcdefabcdef", function(val, key, obj) {
						return key === 0;
					});
					command.runStep(['c', 'd', 'e', 'f', 'a', 'b', 'c', 'd', 'e', 'f'], {repetitions: 100}, /**/ "abcdefabcdef", [0, 1], null, true);
					command.runStep(['c', 'd', 'e', 'f', 'a', 'b', 'c', 'd', 'e', 'f'], {repetitions: 100}, /**/ "abcdefabcdef", function(val, key, obj) {
						return (key === 0) || (key === 1);
					}, null, true);

				});


				test.runCommand(tools.every, "Doodad.Tools.every", function(command, options) {

					command.runStep(true,                                             {repetitions: 100}  /**/);
					command.runStep(true,                                             {repetitions: 100}, /**/ "");
					command.runStep(true,                                             {repetitions: 100}, /**/ "", "a");
					command.runStep(false,                                            {repetitions: 100}, /**/ "aaaaa");
					command.runStep(true,                                             {repetitions: 100}, /**/ "aaaaa", "a");
					command.runStep(true,                                             {repetitions: 100}, /**/ "aaaaa", ["a"]);
					command.runStep(false,                                            {repetitions: 100}, /**/ "aaaaa", "b");
					command.runStep(true,                                             {repetitions: 100}, /**/ "ababa", "ab");
					command.runStep(false,                                            {repetitions: 100}, /**/ "ababa", ["ab"]);
					command.runStep(true,                                             {repetitions: 100}, /**/ "ababa", ["a", "b"]);
					command.runStep(true,                                             {repetitions: 100}, /**/ "ababa", ["a", "b", "c"]);
					command.runStep(true,                                             {repetitions: 100}, /**/ "ababa", {val1: "a", val2: "b"});
					command.runStep(true,                                             {repetitions: 100}, /**/ "ababa", {val1: "a", val2: "b", val3: "c"});
					command.runStep(false,                                            {repetitions: 100}, /**/ "aaaaa", "a", null, true);
					command.runStep(true,                                             {repetitions: 100}, /**/ "aaaaa", "b", null, true);
					command.runStep(true,                                             {repetitions: 100}, /**/ "aaaaa", function(val, key, obj) {
						return val === "a";
					});
					command.runStep(false,                                            {repetitions: 100}, /**/ "aaaaa", function(val, key, obj) {
						return val === "a";
					}, null, true);

				});


				test.runCommand(tools.some, "Doodad.Tools.some", function(command, options) {

					command.runStep(false,                                            {repetitions: 100}  /**/);
					command.runStep(false,                                            {repetitions: 100}, /**/ "");
					command.runStep(false,                                            {repetitions: 100}, /**/ "", "b");
					command.runStep(false,                                            {repetitions: 100}, /**/ "aaaaa");
					command.runStep(true,                                             {repetitions: 100}, /**/ "aaaba", "b");
					command.runStep(true,                                             {repetitions: 100}, /**/ "aaaba", ["b"]);
					command.runStep(false,                                            {repetitions: 100}, /**/ "aaaaa", "b");
					command.runStep(true,                                             {repetitions: 100}, /**/ "aaaba", "bc");
					command.runStep(true,                                             {repetitions: 100}, /**/ "aaaba", ["b", "c"]);
					command.runStep(true,                                             {repetitions: 100}, /**/ "aaaba", {val1: "b", val2: "c"});
					command.runStep(true,                                             {repetitions: 100}, /**/ "aaaba", "b", null, true);
					command.runStep(false,                                            {repetitions: 100}, /**/ "aaaba", ["a", "b"], null, true);
					command.runStep(true,                                             {repetitions: 100}, /**/ "aaaba", function(val, key, obj) {
						return val === "b";
					});
					command.runStep(false,                                            {repetitions: 100}, /**/ "aaaba", function(val, key, obj) {
						return (val === "a") || (val === "b");
					}, null, true);

				});


				test.runCommand(tools.reduce, "Doodad.Tools.reduce", function(command, options) {

					command.runStep(types.AssertionError,                         {mode: 'isinstance', skip: !root.getOptions().enableAsserts}   /**/);
					command.runStep(types.AssertionError,                         {mode: 'isinstance', skip: !root.getOptions().enableAsserts},  /**/ "");
					command.runStep(types.AssertionError,                         {mode: 'isinstance', skip: !root.getOptions().enableAsserts},  /**/ "", 1);
					command.runStep(types.ValueError,                              {mode: 'isinstance'},  /**/ "", function(result, val, key, obj) {
						return result + val.charCodeAt(0) - 48;
					});
					command.runStep(0,                                                {repetitions: 100}, /**/ "", function(result, val, key, obj) {
						return result + val.charCodeAt(0) - 48;
					}, 0);
					command.runStep(6,                                                {repetitions: 100}, /**/ "123", function(result, val, key, obj) {
						return result + val.charCodeAt(0) - 48;
					}, 0);
					command.runStep("123",                                            {repetitions: 100}, /**/ "123", function(result, val, key, obj) {
						return result + val;
					}, "");

				});


				test.runCommand(tools.reduceRight, "Doodad.Tools.reduceRight", function(command, options) {

					command.runStep(types.AssertionError,                         {mode: 'isinstance', skip: !root.getOptions().enableAsserts}   /**/);
					command.runStep(types.AssertionError,                         {mode: 'isinstance', skip: !root.getOptions().enableAsserts},  /**/ "");
					command.runStep(types.AssertionError,                         {mode: 'isinstance', skip: !root.getOptions().enableAsserts},  /**/ "", 1);
					command.runStep(types.ValueError,                             {mode: 'isinstance'},  /**/ "", function(result, val, key, obj) {
						return result + val.charCodeAt(0) - 48;
					});
					command.runStep(0,                                                {repetitions: 100}, /**/ "", function(result, val, key, obj) {
						return result + val.charCodeAt(0) - 48;
					}, 0);
					command.runStep(6,                                                {repetitions: 100}, /**/ "123", function(result, val, key, obj) {
						return result + val.charCodeAt(0) - 48;
					}, 0);
					command.runStep("321",                                            {repetitions: 100}, /**/ "123", function(result, val, key, obj) {
						return result + val;
					}, "");

				});


			},
		},
	};
	return mods;
};

//! END_MODULE()
