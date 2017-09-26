//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2017 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Unit_Types_Array.js - Unit testing module file
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
	DD_MODULES['Doodad.Test.Types.Array'] = {
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

					
				command = test.prepareCommand(types.has, "Doodad.Types.hasKey");
					
				command.run(false,       {eval: true}     /**/ );
				command.run(false,       {eval: true},    /**/ "ar1");
				command.run(true,        {eval: true},    /**/ "ar1", "0");
				command.run(true,        {eval: true},    /**/ "ar1", "1");
				command.run(false,       {eval: true},    /**/ "ar1", "2");
				command.run(true,        {eval: true},    /**/ "ar1", "'a'");
				command.run(false,       {eval: true},    /**/ "ar1", "'b'");
				command.run(false,       {eval: true},    /**/ "ar1", "'toString'");

				command.end();

					
				command = test.prepareCommand(types.hasInherited, "Doodad.Types.hasKeyInherited");
					
				command.run(false,       {eval: true}     /**/ );
				command.run(false,       {eval: true},    /**/ "ar1");
				command.run(true,        {eval: true},    /**/ "ar1", "0");
				command.run(true,        {eval: true},    /**/ "ar1", "1");
				command.run(false,       {eval: true},    /**/ "ar1", "2");
				command.run(true,        {eval: true},    /**/ "ar1", "'a'");
				command.run(false,       {eval: true},    /**/ "ar1", "'b'");
				command.run(true,       {eval: true},    /**/ "ar1", "'toString'");  // "Array" has its own "toString"
					
				command.end();

					
				command = test.prepareCommand(types.get, "Doodad.Types.get");
					
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

					
				command = test.prepareCommand(types.gets, "Doodad.Types.gets");
					
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

					
				command = test.prepareCommand(types.set, "Doodad.Types.set");
					
				command.run(4,           {eval: true},    /**/ "ar1", "0", "4");
				command.run(5,           {eval: true},    /**/ "ar1", "1", "5");
				command.run(undefined,   {eval: true},    /**/ "ar1", "2", "6");
				command.run(7,           {eval: true},    /**/ "ar1", "'a'", "7");
				command.run(undefined,   {eval: true},    /**/ "ar1", "'b'", "8");

				command.end();
				command.chain(function(dummy) {
					createArrays();
				});
					
					
				command = test.prepareCommand(types.sets, "Doodad.Types.sets");
					
				command.run("{'0': 4}",  {eval: true},    /**/ "ar1", "{'0': 4}");
				command.run("{'1': 5}",  {eval: true},    /**/ "ar1", "{'1': 5}");
				command.run("{}",        {eval: true},    /**/ "ar1", "{'2': 6}");
				command.run("{'a': 7}",  {eval: true},    /**/ "ar1", "{'a': 7}");
				command.run("{}",        {eval: true},    /**/ "ar1", "{'b': 8}");
				command.chain(function(dummy) {
					createArrays();
				});

				command.run("{'0': 4, 'a': 7}",  {eval: true},    /**/ "ar1", "{'0': 4, 'a': 7}");
				command.chain(function(dummy) {
					createArrays();
				});

				command.run("{'0': 4, 'a': 7}",  {eval: true},    /**/ "ar1", "{'0': 4, 'a': 7, 'b': 8}");

				command.end();
				command.chain(function(dummy) {
					createArrays();
				});


				command = test.prepareCommand(types.getDefault, "Doodad.Types.getDefault");
					
				command.run("undefined", {eval: true}     /**/ );
				command.run("undefined", {eval: true},    /**/ "ar1");

				command.run(1,           {eval: true},    /**/ "ar1", "0");
				command.run(2,           {eval: true},    /**/ "ar1", "1");
				command.run("undefined", {eval: true},    /**/ "ar1", "2");
				command.run(3,           {eval: true},    /**/ "ar1", "'a'");
				command.run("undefined", {eval: true},    /**/ "ar1", "'b'");
				command.chain(function(dummy) {
					createArrays();
				});

				command.run(1,           {eval: true},    /**/ "ar1", "0", "4");
				command.run(2,           {eval: true},    /**/ "ar1", "1", "4");
				command.run(4,           {eval: true},    /**/ "ar1", "2", "4");
				command.run(3,           {eval: true},    /**/ "ar1", "'a'", "4");
				command.run(4,           {eval: true},    /**/ "ar1", "'b'", "4");

				command.end();
				command.chain(function(dummy) {
					createArrays();
				});

					
				command = test.prepareCommand(types.getsDefault, "Doodad.Types.getsDefault");
					
				command.run("{}",        {eval: true}     /**/ );
				command.run("{}",        {eval: true},    /**/ "ar1");
				command.run("{}",        {eval: true},    /**/ "ar1");

				command.run("{'0': 1}",  {eval: true},    /**/ "ar1", "0");
				command.run("{'1': 2}",  {eval: true},    /**/ "ar1", "1");
				command.run("{}",        {eval: true},    /**/ "ar1", "2");
				command.run("{'a': 3}",  {eval: true},    /**/ "ar1", "'a'");
				command.run("{}",        {eval: true},    /**/ "ar1", "'b'");
				command.chain(function(dummy) {
					createArrays();
				});

				command.run("{'0': 1}",  {eval: true},    /**/ "ar1", "0", "{'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9}");
				command.run("{'1': 2}",  {eval: true},    /**/ "ar1", "1", "{'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9}");
				command.run("{'2': 6}",  {eval: true},    /**/ "ar1", "2", "{'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9}");
				command.run("{'a': 3}",  {eval: true},    /**/ "ar1", "'a'", "{'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9}");
				command.run("{'b': 8}",  {eval: true},    /**/ "ar1", "'b'", "{'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9}");
				command.chain(function(dummy) {
					createArrays();
				});

				command.run("{'0': 1}",          {eval: true},    /**/ "ar1", "[0]");
				command.run("{'0': 1, 'a': 3}",  {eval: true},    /**/ "ar1", "[0, 'a']");
				command.run("{'0': 1}",          {eval: true},    /**/ "ar1", "[0, 'b']");
				command.chain(function(dummy) {
					createArrays();
				});

				command.run("{'0': 1}",          {eval: true},    /**/ "ar1", "[0]", "{'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9}");
				command.run("{'0': 1, 'a': 3}",  {eval: true},    /**/ "ar1", "[0, 'a']", "{'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9}");
				command.run("{'0': 1, 'b': 8}",  {eval: true},    /**/ "ar1", "[0, 'b']", "{'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9}");
				command.chain(function(dummy) {
					createArrays();
				});

				command.end();
					
					
				command = test.prepareCommand(types.keys, "Doodad.Types.keys");
				command.run("[]",                    {eval: true}     /**/ );
				command.run("['a']",                 {eval: true},    /**/ "ar1");
				command.end();
					
					
				command = test.prepareCommand(types.keysInherited, "Doodad.Types.keysInherited");
				command.run("[]",                    {eval: true}     /**/ );
				command.run("['a']",                 {eval: true},    /**/ "ar1");
				command.end();
					
					
				command = test.prepareCommand(types.values, "Doodad.Types.values");
				command.run("[]",                    {eval: true}     /**/ );
				command.run("[3]",                   {eval: true},    /**/ "ar1");
				command.end();
					
					
				command = test.prepareCommand(types.items, "Doodad.Types.items");
				command.run("[]",                    {eval: true, depth: 1}     /**/ );
				command.run("[[0, 1], [1, 2]]",      {eval: true, depth: 1},    /**/ "ar1");
				command.end();
					
					
				command = test.prepareCommand(types.hasIndex, "Doodad.Types.hasIndex");
				command.run(false, {eval: true}     /**/ );
				command.run(false, {eval: true},    /**/ "ar1");
				command.run(true,  {eval: true},    /**/ "ar1", "0");
				command.run(true,  {eval: true},    /**/ "ar1", "1");
				command.run(false, {eval: true},    /**/ "ar1", "2");
				command.run(false, {eval: true},    /**/ "ar1", "'a'");
				command.run(false, {eval: true},    /**/ "ar1", "'b'");
				command.run(false, {eval: true},    /**/ "ar1", "'toString'");
				command.end();
					
					
				command = test.prepareCommand(types.indexes, "Doodad.Types.indexes");
				command.run("[]",                    {eval: true}     /**/ );
				command.run("[0, 1]",                {eval: true},    /**/ "ar1");
				command.end();
					
					
				command = test.prepareCommand(types.available, "Doodad.Types.available");
				command.run(-1,    {eval: true}     /**/ );
				command.run(-1,     {eval: true},   /**/ "[]");
				command.run(-1,     {eval: true},   /**/ "[0, 1]");
				command.run(2,     {eval: true},    /**/ "ar1");
				command.end();
					
					
				command = test.prepareCommand(types.availables, "Doodad.Types.availables");
				command.run("[]",                    {eval: true}     /**/ );
				command.run("[2, 3]",                {eval: true},    /**/ "ar1");
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

				command = test.prepareCommand(types.isClonable, "Doodad.Types.isClonable");
				command.run(false,      {eval: true}     /**/ );
				command.run(true,       {eval: true},    /**/  "ar1");
				command.end();

				command = test.prepareCommand(types.clone, "Doodad.Types.clone");
				command.run("undefined",  {eval: true}                               /**/ );
				command.run("ar1", {eval: true, not: true, mode: 'compare'},    /**/  "ar1");
				command.run("[1, 2, ctx.EmptySlot, ctx.EmptySlot]", {eval: true},  /**/  "ar1");
				command.end();
				
			},
		},
	};
	return DD_MODULES;
};

//! END_MODULE()