//! REPLACE_BY("// Copyright 2016 Claude Petit, licensed under Apache License version 2.0\n", true)
// dOOdad - Object-oriented programming framework
// File: Unit_Types_Array.js - Unit testing module file
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
		DD_MODULES['Doodad.Test.Types.Array'] = {
			type: 'TestModule',
			version: '0d',
			dependencies: ['Doodad.Test.Types'],

			// Unit
			priority: null,
			proto: {
				run: null,
			},

			proto: {
				run: function run(entry, /*optional*/options) {
					"use strict";

					var root = entry.root,
						doodad = root.Doodad,
						types = doodad.Types,
						tools = doodad.Tools,
						namespaces = doodad.Namespaces,
						test = doodad.Test,
						unit = test.Types.Is,
						io = doodad.IO;

						
					if (!options) {
						options = {};
					};

					
					var createArrays = function createArrays() {
						global.ar1 = [1, 2, 9, 10];
						global.ar1.a = 3;
						delete global.ar1[2];
						delete global.ar1[3];
						
						global.ar2 = [1, 2, 3];
						delete global.ar2[0];
					};
					
					createArrays();
					
					
					var command = test.prepareCommand(types.has, "Doodad.Types.hasKey");
					
					command.run(false,       {eval: true}     /**/ );
					command.run(false,       {eval: true},    /**/ "ar1");
					command.run(true,        {eval: true},    /**/ "ar1", "0");
					command.run(true,        {eval: true},    /**/ "ar1", "1");
					command.run(false,       {eval: true},    /**/ "ar1", "2");
					command.run(true,        {eval: true},    /**/ "ar1", "'a'");
					command.run(false,       {eval: true},    /**/ "ar1", "'b'");
					command.run(false,       {eval: true},    /**/ "ar1", "'toString'");

					command.end();

					
					var command = test.prepareCommand(types.hasInherited, "Doodad.Types.hasKeyInherited");
					
					command.run(false,       {eval: true}     /**/ );
					command.run(false,       {eval: true},    /**/ "ar1");
					command.run(true,        {eval: true},    /**/ "ar1", "0");
					command.run(true,        {eval: true},    /**/ "ar1", "1");
					command.run(false,       {eval: true},    /**/ "ar1", "2");
					command.run(true,        {eval: true},    /**/ "ar1", "'a'");
					command.run(false,       {eval: true},    /**/ "ar1", "'b'");
					command.run(false,       {eval: true},    /**/ "ar1", "'toString'");
					
					command.end();

					
					var command = test.prepareCommand(types.get, "Doodad.Types.get");
					
					command.run("undefined", {eval: true}     /**/ );
					command.run("undefined", {eval: true},    /**/ "ar1");

					command.run(1,           {eval: true},    /**/ "ar1", "0");
					command.run(2,           {eval: true},    /**/ "ar1", "1");
					command.run("undefined", {eval: true},    /**/ "ar1", "2");
					command.run(3,           {eval: true},    /**/ "ar1", "'a'");
					command.run("undefined", {eval: true},    /**/ "ar1", "'b'");
					command.run("undefined", {eval: true},    /**/ "ar1", "'toString'");

					command.run(1,           {eval: true},    /**/ "ar1", "0", "4");
					command.run(2,           {eval: true},    /**/ "ar1", "1", "4");
					command.run(4,           {eval: true},    /**/ "ar1", "2", "4");
					command.run(3,           {eval: true},    /**/ "ar1", "'a'", "4");
					command.run(4,           {eval: true},    /**/ "ar1", "'b'", "4");
					command.run("undefined", {eval: true},    /**/ "ar1", "'toString'");

					command.end();

					
					var command = test.prepareCommand(types.gets, "Doodad.Types.gets");
					
					command.run("{}",        {eval: true}     /**/ );
					command.run("{}",        {eval: true},    /**/ "ar1");
					command.run("{}",        {eval: true},    /**/ "ar1");

					command.run("{'0': 1}",  {eval: true},    /**/ "ar1", "0");
					command.run("{'1': 2}",  {eval: true},    /**/ "ar1", "1");
					command.run("{}",        {eval: true},    /**/ "ar1", "2");
					command.run("{'a': 3}",  {eval: true},    /**/ "ar1", "'a'");
					command.run("{}",        {eval: true},    /**/ "ar1", "'b'");
					command.run("{}",        {eval: true},    /**/ "ar1", "'toString'");

					command.run("{'0': 1}",  {eval: true},    /**/ "ar1", "0", "{'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9}");
					command.run("{'1': 2}",  {eval: true},    /**/ "ar1", "1", "{'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9}");
					command.run("{'2': 6}",  {eval: true},    /**/ "ar1", "2", "{'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9}");
					command.run("{'a': 3}",  {eval: true},    /**/ "ar1", "'a'", "{'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9}");
					command.run("{'b': 8}",  {eval: true},    /**/ "ar1", "'b'", "{'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9}");
					command.run("{'toString': 9}", {eval: true},  /**/ "ar1", "'toString'", "{'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9}");

					command.run("{'0': 1}",          {eval: true},    /**/ "ar1", "[0]");
					command.run("{'0': 1, 'a': 3}",  {eval: true},    /**/ "ar1", "[0, 'a']");
					command.run("{'0': 1}",          {eval: true},    /**/ "ar1", "[0, 'b']");

					command.run("{'0': 1}",          {eval: true},    /**/ "ar1", "[0]", "{'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9}");
					command.run("{'0': 1, 'a': 3}",  {eval: true},    /**/ "ar1", "[0, 'a']", "{'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9}");
					command.run("{'0': 1, 'b': 8}",  {eval: true},    /**/ "ar1", "[0, 'b']", "{'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9}");

					command.end();

					
					var command = test.prepareCommand(types.set, "Doodad.Types.set");
					
					command.run(4,           {eval: true},    /**/ "ar1", "0", "4");
					command.run(5,           {eval: true},    /**/ "ar1", "1", "5");
					command.run(undefined,   {eval: true},    /**/ "ar1", "2", "6");
					command.run(7,           {eval: true},    /**/ "ar1", "'a'", "7");
					command.run(undefined,   {eval: true},    /**/ "ar1", "'b'", "8");

					command.end();
					createArrays();
					
					
					var command = test.prepareCommand(types.sets, "Doodad.Types.sets");
					
					command.run("{'0': 4}",  {eval: true},    /**/ "ar1", "{'0': 4}");
					command.run("{'1': 5}",  {eval: true},    /**/ "ar1", "{'1': 5}");
					command.run("{}",        {eval: true},    /**/ "ar1", "{'2': 6}");
					command.run("{'a': 7}",  {eval: true},    /**/ "ar1", "{'a': 7}");
					command.run("{}",        {eval: true},    /**/ "ar1", "{'b': 8}");
					createArrays();

					command.run("{'0': 4, 'a': 7}",  {eval: true},    /**/ "ar1", "{'0': 4, 'a': 7}");
					createArrays();

					command.run("{'0': 4, 'a': 7}",  {eval: true},    /**/ "ar1", "{'0': 4, 'a': 7, 'b': 8}");

					command.end();
					createArrays();


					var command = test.prepareCommand(types.getDefault, "Doodad.Types.getDefault");
					
					command.run("undefined", {eval: true}     /**/ );
					command.run("undefined", {eval: true},    /**/ "ar1");

					command.run(1,           {eval: true},    /**/ "ar1", "0");
					command.run(2,           {eval: true},    /**/ "ar1", "1");
					command.run("undefined", {eval: true},    /**/ "ar1", "2");
					command.run(3,           {eval: true},    /**/ "ar1", "'a'");
					command.run("undefined", {eval: true},    /**/ "ar1", "'b'");
					createArrays();

					command.run(1,           {eval: true},    /**/ "ar1", "0", "4");
					command.run(2,           {eval: true},    /**/ "ar1", "1", "4");
					command.run(4,           {eval: true},    /**/ "ar1", "2", "4");
					command.run(3,           {eval: true},    /**/ "ar1", "'a'", "4");
					command.run(4,           {eval: true},    /**/ "ar1", "'b'", "4");

					command.end();
					createArrays();

					
					var command = test.prepareCommand(types.getsDefault, "Doodad.Types.getsDefault");
					
					command.run("{}",        {eval: true}     /**/ );
					command.run("{}",        {eval: true},    /**/ "ar1");
					command.run("{}",        {eval: true},    /**/ "ar1");

					command.run("{'0': 1}",  {eval: true},    /**/ "ar1", "0");
					command.run("{'1': 2}",  {eval: true},    /**/ "ar1", "1");
					command.run("{}",        {eval: true},    /**/ "ar1", "2");
					command.run("{'a': 3}",  {eval: true},    /**/ "ar1", "'a'");
					command.run("{}",        {eval: true},    /**/ "ar1", "'b'");
					createArrays();

					command.run("{'0': 1}",  {eval: true},    /**/ "ar1", "0", "{'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9}");
					command.run("{'1': 2}",  {eval: true},    /**/ "ar1", "1", "{'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9}");
					command.run("{'2': 6}",  {eval: true},    /**/ "ar1", "2", "{'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9}");
					command.run("{'a': 3}",  {eval: true},    /**/ "ar1", "'a'", "{'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9}");
					command.run("{'b': 8}",  {eval: true},    /**/ "ar1", "'b'", "{'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9}");
					createArrays();

					command.run("{'0': 1}",          {eval: true},    /**/ "ar1", "[0]");
					command.run("{'0': 1, 'a': 3}",  {eval: true},    /**/ "ar1", "[0, 'a']");
					command.run("{'0': 1}",          {eval: true},    /**/ "ar1", "[0, 'b']");
					createArrays();

					command.run("{'0': 1}",          {eval: true},    /**/ "ar1", "[0]", "{'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9}");
					command.run("{'0': 1, 'a': 3}",  {eval: true},    /**/ "ar1", "[0, 'a']", "{'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9}");
					command.run("{'0': 1, 'b': 8}",  {eval: true},    /**/ "ar1", "[0, 'b']", "{'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9}");
					createArrays();

					command.end();
					
					
					var command = test.prepareCommand(types.keys, "Doodad.Types.keys");
					command.run("[]",                    {eval: true}     /**/ );
					command.run("['a']",                 {eval: true},    /**/ "ar1");
					command.end();
					
					
					var command = test.prepareCommand(types.keysInherited, "Doodad.Types.keysInherited");
					command.run("[]",                    {eval: true}     /**/ );
					command.run("['a']",                 {eval: true},    /**/ "ar1");
					command.end();
					
					
					var command = test.prepareCommand(types.values, "Doodad.Types.values");
					command.run("[]",                    {eval: true}     /**/ );
					command.run("[1, 2]",                {eval: true},    /**/ "ar1");
					command.end();
					
					
					var command = test.prepareCommand(types.items, "Doodad.Types.items");
					command.run("[]",                    {eval: true, depth: 1}     /**/ );
					command.run("[[0, 1], [1, 2]]",      {eval: true, depth: 1},    /**/ "ar1");
					command.end();
					
					
					var command = test.prepareCommand(types.hasIndex, "Doodad.Types.hasIndex");
					command.run(false, {eval: true}     /**/ );
					command.run(false, {eval: true},    /**/ "ar1");
					command.run(true,  {eval: true},    /**/ "ar1", "0");
					command.run(true,  {eval: true},    /**/ "ar1", "1");
					command.run(false, {eval: true},    /**/ "ar1", "2");
					command.run(false, {eval: true},    /**/ "ar1", "'a'");
					command.run(false, {eval: true},    /**/ "ar1", "'b'");
					command.run(false, {eval: true},    /**/ "ar1", "'toString'");
					command.end();
					
					
					var command = test.prepareCommand(types.indexes, "Doodad.Types.indexes");
					command.run("[]",                    {eval: true}     /**/ );
					command.run("[0, 1]",                {eval: true},    /**/ "ar1");
					command.end();
					
					
					var command = test.prepareCommand(types.available, "Doodad.Types.available");
					command.run(-1,    {eval: true}     /**/ );
					command.run(-1,     {eval: true},   /**/ "[]");
					command.run(-1,     {eval: true},   /**/ "[0, 1]");
					command.run(2,     {eval: true},    /**/ "ar1");
					command.end();
					
					
					var command = test.prepareCommand(types.availables, "Doodad.Types.availables");
					command.run("[]",                    {eval: true}     /**/ );
					command.run("[2, 3]",                {eval: true},    /**/ "ar1");
					command.end();
					
					
					var command = test.prepareCommand(types.getFirstIndex, "Doodad.Types.getFirstIndex");
					command.run(undefined,  {eval: true}     /**/ );
					command.run(0,          {eval: true},    /**/ "ar1");
					command.run(1,          {eval: true},    /**/ "ar2");
					command.end();
					
					
					var command = test.prepareCommand(types.getFirstValue, "Doodad.Types.getFirstValue");
					command.run(undefined,  {eval: true}     /**/ );
					command.run(1,          {eval: true},    /**/ "ar1");
					command.run(2,          {eval: true},    /**/ "ar2");
					command.end();
					
					var command = test.prepareCommand(types.popAt, "Doodad.Types.popAt");
					command.run(undefined,  {eval: true}     /**/ );
					command.run(undefined,  {eval: true},    /**/  "ar1");
					createArrays();
					command.run(1,          {eval: true},    /**/  "ar1", 0);
					createArrays();
					command.run(2,          {eval: true},    /**/  "ar1", 1);
					createArrays();
					command.run(undefined,  {eval: true},    /**/  "ar1", 2);
					createArrays();
					command.run(undefined,  {eval: true},    /**/  "ar1", 3);
					createArrays();
					command.run(undefined,  {eval: true},    /**/  "ar1", 4);
					createArrays();
					command.run(3,          {eval: true},    /**/  "ar1", "'a'");
					createArrays();
					command.run(undefined,  {eval: true},    /**/  "ar1", "'b'");
					command.end();
					createArrays();

					var command = test.prepareCommand(types.popItem, "Doodad.Types.popItem");
					command.run(undefined,  {eval: true}     /**/ );
					command.run(undefined,  {eval: true},    /**/  "ar1");
					command.run(undefined,  {eval: true},    /**/  "ar1", 0);
					createArrays();
					command.run(1,          {eval: true},    /**/  "ar1", 1);
					createArrays();
					command.run(2,          {eval: true},    /**/  "ar1", 2);
					createArrays();
					command.run(3,          {eval: true},    /**/  "ar1", 3);
					createArrays();
					command.run(1,          {eval: true, contains: true}, /**/  "ar1", "function(val, key, obj){return val === 1}");
					command.end();
					createArrays();

					var command = test.prepareCommand(types.popItems, "Doodad.Types.popItems");
					command.run("[]",       {eval: true, contains: true}  /**/ );
					command.run("[]",       {eval: true, contains: true}, /**/  "ar1");
					command.run("[]",       {eval: true, contains: true}, /**/  "ar1", "[0]");
					createArrays();
					command.run("[1]",      {eval: true, contains: true}, /**/  "ar1", "[0, 1]");
					createArrays();
					command.run("[1, 2]",   {eval: true, contains: true}, /**/  "ar1", "[0, 1, 2]");
					createArrays();
					command.run("[1, 2]",   {eval: true, contains: true}, /**/  "ar1", "{a: 0, b: 1, c: 2}");
					createArrays();
					command.run("[1]",      {eval: true, contains: true}, /**/  "ar1", "function(val, key, obj){return val === 1}");
					command.end();
					createArrays();
					
					var command = test.prepareCommand(types.append, "Doodad.Types.append");
					command.run(null,                                           {eval: true}     /**/ );
					command.run("[1, 2, ctx.EmptySlot, ctx.EmptySlot]",       {eval: true},    /**/ "ar1");
					command.run("[1, 2, ctx.EmptySlot, ctx.EmptySlot, 3, 4]", {eval: true},    /**/ "ar1", "[3, 4]");
					createArrays();
					command.run("[ctx.EmptySlot, 2, 3, 4, 5]",                 {eval: true},    /**/ "ar2", "[4, 5]");
					createArrays();
					command.run("[ctx.EmptySlot, 2, 3, 4, 5, 6, 7]",           {eval: true},    /**/ "ar2", "[4, 5]", "[6, 7]");
					command.end();
					createArrays();
					
					var command = test.prepareCommand(types.prepend, "Doodad.Types.prepend");
					command.run(null,                                           {eval: true}     /**/ );
					command.run("[1, 2, ctx.EmptySlot, ctx.EmptySlot]",       {eval: true},    /**/ "ar1");
					command.run("[3, 4, 1, 2, ctx.EmptySlot, ctx.EmptySlot]", {eval: true},    /**/ "ar1", "[3, 4]");
					createArrays();
					command.run("[4, 5, ctx.EmptySlot, 2, 3]",                 {eval: true},    /**/ "ar2", "[4, 5]");
					createArrays();
					command.run("[6, 7, 4, 5, ctx.EmptySlot, 2, 3]",           {eval: true},    /**/ "ar2", "[4, 5]", "[6, 7]");
					command.end();
					createArrays();
					
					var command = test.prepareCommand(types.unique, "Doodad.Types.unique");
					command.run([],                                               {repetitions: 100}     /**/);
					command.run(types.AssertionFailed,                         {mode: 'isinstance'},  /**/ 1);
					command.run(['a', 'b', 'c'],                                  {repetitions: 100},    /**/ ["a", "b", "c", "a", "b", "c"]);
					command.run(['a', 'b', 'c', 'd', 'e', 'f'],                   {repetitions: 100},    /**/ ["a", "b", "c", "a", "b", "c"], ["d", "e", "f", "d", "e", "f"]);
					command.run(['a', 'b', 'c'],                                  {repetitions: 100},    /**/ "abcabc");
					command.run(['a', 'b', 'c', 'd', 'e', 'f'],                   {repetitions: 100},    /**/ "abcabc", "defdef");
					command.end();

					var command = test.prepareCommand(types.isClonable, "Doodad.Types.isClonable");
					command.run(false,      {eval: true}     /**/ );
					command.run(true,       {eval: true},    /**/  "ar1");
					command.end();

					var command = test.prepareCommand(types.clone, "Doodad.Types.clone");
					command.run("undefined",  {eval: true}                               /**/ );
					command.run("ar1", {eval: true, not: true, mode: 'compare'},    /**/  "ar1");
					command.run("[1, 2, ctx.EmptySlot, ctx.EmptySlot]", {eval: true},  /**/  "ar1");
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