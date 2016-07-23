//! REPLACE_BY("// Copyright 2016 Claude Petit, licensed under Apache License version 2.0\n", true)
// dOOdad - Object-oriented programming framework
// File: Unit_Tools_Dictionary.js - Unit testing module file
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
		DD_MODULES['Doodad.Test.Tools.Dictionary'] = {
			type: 'TestModule',
			version: '0d',
			dependencies: ['Doodad.Test.Tools'],

			// Unit
			priority: null,

			proto: {
				run: function run(root, /*optional*/options) {
					"use strict";

					var doodad = root.Doodad,
						types = doodad.Types,
						tools = doodad.Tools,
						namespaces = doodad.Namespaces,
						test = doodad.Test,
						unit = test.Types.Is,
						io = doodad.IO;

						
					if (!options) {
						options = {};
					};
					
					
					var command = test.prepareCommand(tools.findItem, "Doodad.Tools.findItem");
					
					command.run(null,                                             {repetitions: 100}  /**/);
					command.run(null,                                             {repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"});
					command.run(null,                                             {repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"}, "zzz");
					command.run('b',                                              {repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"}, "hi");
					command.run('a',                                              {repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"}, "there");
					command.run('a',                                              {repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"}, function(val, key, obj) {return val === "there"});
					
					command.end();
					
					
					var command = test.prepareCommand(tools.findLastItem, "Doodad.Tools.findLastItem");
					
					command.run(null,                                             {repetitions: 100}  /**/);
					command.run(null,                                             {repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"});
					command.run(null,                                             {repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"}, "zzz");
					command.run('b',                                              {repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"}, "hi");
					command.run('c',                                              {repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"}, "there");
					command.run('c',                                              {repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"}, function(val, key, obj) {return val === "there"});
					
					command.end();
					
					
					var command = test.prepareCommand(tools.findItems, "Doodad.Tools.findItems");
					
					command.run([],                                               {repetitions: 100}  /**/);
					command.run([],                                               {repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"});
					command.run([],                                               {repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"}, "zzz");
					command.run(['b'],                                            {contains: true, repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"}, "hi");
					command.run(['a', 'c'],                                       {contains: true, repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"}, "there");
					command.run(['a', 'c'],                                       {contains: true, repetitions: 100}, /**/ {a: "there", b: "hi", c: "there"}, function(val, key, obj) {return val === "there"});
					
					command.end();
					
					
					var command = test.prepareCommand(tools.map, "Doodad.Tools.map");
					
					root.DD_ASSERT && command.run(types.AssertionFailed,    {mode: 'isinstance'}  /**/ );
					root.DD_ASSERT && command.run(types.AssertionFailed,    {mode: 'isinstance'}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"});
					root.DD_ASSERT && command.run(types.AssertionFailed,    {mode: 'isinstance'}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, "");
					command.run({val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, function(val, key, obj) {return val});

					command.end();
					
					
					var command = test.prepareCommand(function(obj) {
						var result = [];
						tools.forEach(obj, function(val, key, obj) {
							result.push(val);
						});
						return result;
					}, "Doodad.Tools.forEach");
					
					command.run([],                                               {repetitions: 100}  /**/ );
					command.run(['a', 'b', 'c', 'd', 'e', 'f'],                   {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"});

					command.end();
					
					
					var command = test.prepareCommand(tools.filter, "Doodad.Tools.filter");
					
					command.run(undefined,                                        {repetitions: 100}  /**/);
					command.run({},                                               {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"});
					command.run({val1: 'a'},                                      {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, "a");
					command.run({val1: 'a'},                                      {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, ['a']);
					command.run({val1: 'a', val2: 'b'},                           {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, ['a', 'b']);
					command.run({val1: 'a'},                                      {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, function(val, key, obj) {return val === 'a'});
					command.run({val3: 'c', val4: 'd', val5: 'e', val6: 'f'},     {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, ['a', 'b'], null, true);
					command.run({val3: 'c', val4: 'd', val5: 'e', val6: 'f'},     {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, function(val, key, obj) {return val === 'a' || val === 'b'}, null, true);

					command.end();
					
					
					var command = test.prepareCommand(tools.filterKeys, "Doodad.Tools.filterKeys");
					
					command.run(undefined,                                        {repetitions: 100}  /**/);
					command.run({},                                               {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"});
					command.run({val1: 'a'},                                      {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, ['val1']);
					command.run({val1: 'a', val2: 'b'},                           {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, ['val1', 'val2']);
					command.run({val1: 'a'},                                      {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, function(val, key, obj) {return key === 'val1'});
					command.run({val3: 'c', val4: 'd', val5: 'e', val6: 'f'},     {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, ['val1', 'val2'], null, true);
					command.run({val3: 'c', val4: 'd', val5: 'e', val6: 'f'},     {repetitions: 100}, /**/ {val1: "a", val2: "b", val3: "c", val4: "d", val5: "e", val6: "f"}, function(val, key, obj) {return key === 'val1' || key === 'val2'}, null, true);

					command.end();
					
					
					var command = test.prepareCommand(tools.every, "Doodad.Tools.every");
					
					command.run(false,                                            {repetitions: 100}  /**/);
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
					
					
					var command = test.prepareCommand(tools.some, "Doodad.Tools.some");
					
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