//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Unit_Tools_Files_Url.js - Unit testing module file
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
	mods['Doodad.Test.Tools.Files.Urls'] = {
		type: 'TestModule',
		version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
		dependencies: ['Doodad.Test.Tools.Files'],

		// Unit
		priority: null,
			
		proto: {
			run: function run(root, /*optional*/options) {
				const doodad = root.Doodad,
					types = doodad.Types,
					tools = doodad.Tools,
					namespaces = doodad.Namespaces,
					test = doodad.Test,
					unit = test.Tools.Files.Urls,
					io = doodad.IO,
					files = tools.Files;


				if (!options) {
					options = {};
				};
					

				test.runCommand(function(/*paramarray*/) {
					return files.Url.parse.apply(files.Url, arguments);
				}, "Doodad.Tools.Files.Url.parse.test1", function(command, options) {
					command.runStep({
						protocol: 'http',
						user: 'user',
						password: 'password',
						domain: 'www.doodad-js.local',
						port: 8080,
						path: ['v0', 'tests', 'units'],
						file: 'test.html',
						extension: 'html',
						args: {__args: [{name: 'unit', value: 'Doodad.Test.Tools.Files.Url'}]},
						anchor: 'failedBookmark',
						isRelative: false,
						noEscapes: false,
						isWindows: false,
					}, {depth: 3}, /**/ "http://user:password@www.doodad-js.local:8080/v0/tests/units/test.html?unit=Doodad.Test.Tools.Files.Url#failedBookmark", options);

					command.runStep({
						protocol: 'http',
						user: 'user',
						password: 'password',
						domain: 'www.doodad-js.local',
						port: 8080,
						path: ['v0', 'tests', 'units'],
						file: 'test.html',
						extension: 'html',
						args: {__args: [{name: 'unit', value: 'Doodad.Test.Tools.Files.Url'}]},
						anchor: '',
						isRelative: false,
						noEscapes: false,
						isWindows: false,
					}, {depth: 3}, /**/ "http://user:password@www.doodad-js.local:8080/v0/tests/units/test.html?unit=Doodad.Test.Tools.Files.Url#", options);

					command.runStep({
						protocol: 'http',
						user: 'user',
						password: 'password',
						domain: 'www.doodad-js.local',
						port: 8080,
						path: ['v0', 'tests', 'units'],
						file: 'test.html',
						extension: 'html',
						args: {__args: [{name: 'unit', value: 'Doodad.Test.Tools.Files.Url'}]},
						anchor: null,
						isRelative: false,
						noEscapes: false,
						isWindows: false,
					}, {depth: 3}, /**/ "http://user:password@www.doodad-js.local:8080/v0/tests/units/test.html?unit=Doodad.Test.Tools.Files.Url", options);

					command.runStep({
						protocol: 'http',
						user: 'user',
						password: 'password',
						domain: 'www.doodad-js.local',
						port: 8080,
						path: ['v0', 'tests', 'units'],
						file: 'test.html',
						extension: 'html',
						args: {__args: [{name: 'unit', value: ''}]},
						anchor: null,
						isRelative: false,
						noEscapes: false,
						isWindows: false,
					}, {depth: 3}, /**/ "http://user:password@www.doodad-js.local:8080/v0/tests/units/test.html?unit=", options);

					command.runStep({
						protocol: 'http',
						user: 'user',
						password: 'password',
						domain: 'www.doodad-js.local',
						port: 8080,
						path: ['v0', 'tests', 'units'],
						file: 'test.html',
						extension: 'html',
						args: {__args: [{name: 'unit', value: null}]},
						anchor: null,
						isRelative: false,
						noEscapes: false,
						isWindows: false,
					}, {depth: 3}, /**/ "http://user:password@www.doodad-js.local:8080/v0/tests/units/test.html?unit", options);

					command.runStep({
						protocol: 'http',
						user: 'user',
						password: 'password',
						domain: 'www.doodad-js.local',
						port: 8080,
						path: ['v0', 'tests', 'units'],
						file: 'test.html',
						extension: 'html',
						args: {__args: [{name: '', value: null}]},
						anchor: null,
						isRelative: false,
						noEscapes: false,
						isWindows: false,
					}, {depth: 3}, /**/ "http://user:password@www.doodad-js.local:8080/v0/tests/units/test.html?", options);

					command.runStep({
						protocol: 'http',
						user: 'user',
						password: 'password',
						domain: 'www.doodad-js.local',
						port: 8080,
						path: ['v0', 'tests', 'units'],
						file: 'test.html',
						extension: 'html',
						args: {__args: null},
						anchor: null,
						isRelative: false,
						noEscapes: false,
						isWindows: false,
					}, {depth: 3}, /**/ "http://user:password@www.doodad-js.local:8080/v0/tests/units/test.html", options);

					command.runStep({
						protocol: 'http',
						user: 'user',
						password: 'password',
						domain: 'www.doodad-js.local',
						port: 8080,
						path: ['v0', 'tests', 'units'],
						file: '',
						extension: '',
						args: {__args: null},
						anchor: null,
						isRelative: false,
						noEscapes: false,
						isWindows: false,
					}, {depth: 3}, /**/ "http://user:password@www.doodad-js.local:8080/v0/tests/units/", options);

					command.runStep({
						protocol: 'http',
						user: 'user',
						password: 'password',
						domain: 'www.doodad-js.local',
						port: 8080,
						path: ['v0', 'tests'],
						file: '',
						extension: '',
						args: {__args: null},
						anchor: null,
						isRelative: false,
						noEscapes: false,
						isWindows: false,
					}, {depth: 3}, /**/ "http://user:password@www.doodad-js.local:8080/v0/tests/", options);

					command.runStep({
						protocol: 'http',
						user: 'user',
						password: 'password',
						domain: 'www.doodad-js.local',
						port: 8080,
						path: [],
						file: '',
						extension: '',
						args: {__args: null},
						anchor: null,
						isRelative: false,
						noEscapes: false,
						isWindows: false,
					}, {depth: 3}, /**/ "http://user:password@www.doodad-js.local:8080/", options);

					command.runStep({
						protocol: 'http',
						user: 'user',
						password: 'password',
						domain: 'www.doodad-js.local',
						port: 8080,
						path: [],
						file: null,
						extension: null,
						args: {__args: null},
						anchor: null,
						isRelative: false,
						noEscapes: false,
						isWindows: false,
					}, {depth: 3}, /**/ "http://user:password@www.doodad-js.local:8080", options);

					command.runStep({
						protocol: 'http',
						user: 'user',
						password: 'password',
						domain: 'www.doodad-js.local',
						port: null,
						path: [],
						file: null,
						extension: null,
						args: {__args: null},
						anchor: null,
						isRelative: false,
						noEscapes: false,
						isWindows: false,
					}, {depth: 3}, /**/ "http://user:password@www.doodad-js.local", options);

					command.runStep({
						protocol: 'http',
						user: null,
						password: 'password',
						domain: 'www.doodad-js.local',
						port: null,
						path: [],
						file: null,
						extension: null,
						args: {__args: null},
						anchor: null,
						isRelative: false,
						noEscapes: false,
						isWindows: false,
					}, {depth: 3}, /**/ "http://:password@www.doodad-js.local", options);

					command.runStep({
						protocol: 'http',
						user: 'user',
						password: '',
						domain: 'www.doodad-js.local',
						port: null,
						path: [],
						file: null,
						extension: null,
						args: {__args: null},
						anchor: null,
						isRelative: false,
						noEscapes: false,
						isWindows: false,
					}, {depth: 3}, /**/ "http://user:@www.doodad-js.local", options);

					command.runStep({
						protocol: 'http',
						user: 'user',
						password: null,
						domain: 'www.doodad-js.local',
						port: null,
						path: [],
						file: null,
						extension: null,
						args: {__args: null},
						anchor: null,
						isRelative: false,
						noEscapes: false,
						isWindows: false,
					}, {depth: 3}, /**/ "http://user@www.doodad-js.local", options);

					command.runStep({
						protocol: 'http',
						user: null,
						password: null,
						domain: 'www.doodad-js.local',
						port: null,
						path: [],
						file: null,
						extension: null,
						args: {__args: null},
						anchor: null,
						isRelative: false,
						noEscapes: false,
						isWindows: false,
					}, {depth: 3}, /**/ "http://www.doodad-js.local", options);

					command.runStep({
						protocol: null,
						user: null,
						password: null,
						domain: null,
						port: null,
						path: [],
						file: null,
						extension: null,
						args: {__args: null},
						anchor: null,
						isRelative: true,
						noEscapes: false,
						isWindows: false,
					}, {depth: 3}, /**/ "", options);

					command.runStep({
						protocol: 'http',
						user: null,
						password: null,
						domain: 'www.doodad-js.local',
						port: 8080,
						path: [],
						file: null,
						extension: null,
						args: {__args: null},
						anchor: null,
						isRelative: false,
						noEscapes: false,
						isWindows: false,
					}, {depth: 3}, /**/ "http://www.doodad-js.local:8080", options);

					command.runStep({
						protocol: 'file',
						user: null,
						password: null,
						domain: null,
						port: null,
						path: ['C:', 'Doodad', 'v0', 'tests', 'units'],
						file: 'test.html',
						extension: 'html',
						args: {__args: null},
						anchor: null,
						isRelative: false,
						noEscapes: false,
						isWindows: true,
					}, {depth: 3}, /**/ "file:///C:/Doodad/v0/tests/units/test.html", options);

					command.runStep({
						protocol: 'file',
						user: null,
						password: null,
						domain: null,
						port: null,
						path: ['Doodad', 'v0', 'tests', 'units'],
						file: 'test.html',
						extension: 'html',
						args: {__args: null},
						anchor: null,
						isRelative: false,
						noEscapes: false,
						isWindows: false,
					}, {depth: 3}, /**/ "file:///Doodad/v0/tests/units/test.html", options);

					command.runStep({
						protocol: 'file',
						user: null,
						password: null,
						domain: null,
						port: null,
						path: ['Doodad', 'v0', 'tests', 'units'],
						file: 'test.html',
						extension: 'html',
						args: {__args: null},
						anchor: null,
						isRelative: true,
						noEscapes: false,
						isWindows: false,
					}, {depth: 3}, /**/ "file://Doodad/v0/tests/units/test.html", options);
				});
					
			
				test.runCommand(function(url) {
					return files.Url.parse(url).toString();
				}, "Doodad.Test.Tools.Files.Url.parse.test2", function(command, options) {
					const runStep = function(url, /*optional*/expected /*paramarray*/) {
						const params =  Array.prototype.slice.call(arguments, 0, arguments.length - 2);
						params.unshift(((expected === undefined) ? url : expected), {}, url);
						command.runStep(...params);
					};
						
					// Normal
					runStep("http://user:password@www.mydomain.com:8080/Doodad/v1/doodad.js?v=1&a=&b&#anchor");
					runStep("http://user:password@www.mydomain.com:8080/Doodad/v1/doodad.js?v=1&a=&b&");
					runStep("http://user:password@www.mydomain.com:8080/Doodad/v1/doodad.js?v=1&a=&b");
					runStep("http://user:password@www.mydomain.com:8080/Doodad/v1/doodad.js?v=1&a=");
					runStep("http://user:password@www.mydomain.com:8080/Doodad/v1/doodad.js?v=1");
					runStep("http://user:password@www.mydomain.com:8080/Doodad/v1/doodad.js?");
					runStep("http://user:password@www.mydomain.com:8080/Doodad/v1/doodad.js");
					runStep("http://user:password@www.mydomain.com:8080/Doodad/v1/");
					runStep("http://user:password@www.mydomain.com:8080/Doodad/v1");
					runStep("http://user:password@www.mydomain.com:8080/Doodad/");
					runStep("http://user:password@www.mydomain.com:8080/Doodad");
					runStep("http://user:password@www.mydomain.com:8080/");
					runStep("http://user:password@www.mydomain.com:8080");
					runStep("http://user:password@www.mydomain.com");
					runStep("http://user:password@www.mydomain.com/Doodad/v1/doodad.js?v=1&a=&b&#anchor");
					runStep("http://user:password@www.mydomain.com/Doodad/v1/doodad.js?v=1&a=&b&");
					runStep("http://user:password@www.mydomain.com/Doodad/v1/doodad.js?v=1&a=&b");
					runStep("http://user:password@www.mydomain.com/Doodad/v1/doodad.js?v=1&a=");
					runStep("http://user:password@www.mydomain.com/Doodad/v1/doodad.js?v=1");
					runStep("http://user:password@www.mydomain.com/Doodad/v1/doodad.js?");
					runStep("http://user:password@www.mydomain.com/Doodad/v1/doodad.js");
					runStep("http://user:password@www.mydomain.com/Doodad/v1/");
					runStep("http://user:password@www.mydomain.com/Doodad/v1");
					runStep("http://user:password@www.mydomain.com/Doodad/");
					runStep("http://user:password@www.mydomain.com/Doodad");
					runStep("http://user:password@www.mydomain.com/");
					runStep("http://user:password@www.mydomain.com");
					runStep("http://www.mydomain.com:8080/Doodad/v1/doodad.js?v=1&a=&b&#anchor");
					runStep("http://www.mydomain.com:8080/Doodad/v1/doodad.js?v=1&a=&b&");
					runStep("http://www.mydomain.com:8080/Doodad/v1/doodad.js?v=1&a=&b");
					runStep("http://www.mydomain.com:8080/Doodad/v1/doodad.js?v=1&a=");
					runStep("http://www.mydomain.com:8080/Doodad/v1/doodad.js?v=1");
					runStep("http://www.mydomain.com:8080/Doodad/v1/doodad.js?");
					runStep("http://www.mydomain.com:8080/Doodad/v1/doodad.js");
					runStep("http://www.mydomain.com:8080/Doodad/v1/");
					runStep("http://www.mydomain.com:8080/Doodad/v1");
					runStep("http://www.mydomain.com:8080/Doodad/");
					runStep("http://www.mydomain.com:8080/Doodad");
					runStep("http://www.mydomain.com:8080/");
					runStep("http://www.mydomain.com:8080");
					runStep("http://www.mydomain.com/Doodad/v1/doodad.js?v=1&a=&b&#anchor");
					runStep("http://www.mydomain.com/Doodad/v1/doodad.js?v=1&a=&b&");
					runStep("http://www.mydomain.com/Doodad/v1/doodad.js?v=1&a=&b");
					runStep("http://www.mydomain.com/Doodad/v1/doodad.js?v=1&a=");
					runStep("http://www.mydomain.com/Doodad/v1/doodad.js?v=1");
					runStep("http://www.mydomain.com/Doodad/v1/doodad.js?");
					runStep("http://www.mydomain.com/Doodad/v1/doodad.js");
					runStep("http://www.mydomain.com/Doodad/v1/");
					runStep("http://www.mydomain.com/Doodad/v1");
					runStep("http://www.mydomain.com/Doodad/");
					runStep("http://www.mydomain.com/Doodad");
					runStep("http://www.mydomain.com/");
					runStep("http://www.mydomain.com");
					runStep("http://user:password@www.mydomain.com:8080/Doodad/doodad.js?v=1&a=&b&#anchor");
					runStep("http://user:password@www.mydomain.com:8080/Doodad/doodad.js?v=1&a=&b&");
					runStep("http://user:password@www.mydomain.com:8080/Doodad/doodad.js?v=1&a=&b");
					runStep("http://user:password@www.mydomain.com:8080/Doodad/doodad.js?v=1&a=");
					runStep("http://user:password@www.mydomain.com:8080/Doodad/doodad.js?v=1");
					runStep("http://user:password@www.mydomain.com:8080/Doodad/doodad.js?");
					runStep("http://user:password@www.mydomain.com:8080/Doodad/doodad.js");
					runStep("http://user:password@www.mydomain.com:8080/doodad.js?v=1&a=&b&#anchor");
					runStep("http://user:password@www.mydomain.com:8080/doodad.js?v=1&a=&b&");
					runStep("http://user:password@www.mydomain.com:8080/doodad.js?v=1&a=&b");
					runStep("http://user:password@www.mydomain.com:8080/doodad.js?v=1&a=");
					runStep("http://user:password@www.mydomain.com:8080/doodad.js?v=1");
					runStep("http://user:password@www.mydomain.com:8080/doodad.js?");
					runStep("http://user:password@www.mydomain.com:8080/doodad.js");
					runStep("http://user@www.mydomain.com:8080/Doodad/doodad.js?v=1&a=&b&#anchor");
					runStep("http://user@www.mydomain.com:8080/Doodad/doodad.js?v=1&a=&b&");
					runStep("http://user@www.mydomain.com:8080/Doodad/doodad.js?v=1&a=&b");
					runStep("http://user@www.mydomain.com:8080/Doodad/doodad.js?v=1&a=");
					runStep("http://user@www.mydomain.com:8080/Doodad/doodad.js?v=1");
					runStep("http://user@www.mydomain.com:8080/Doodad/doodad.js?");
					runStep("http://user@www.mydomain.com:8080/doodad.js?v=1&a=&b&#anchor");
					runStep("http://user@www.mydomain.com:8080/doodad.js?v=1&a=&b&");
					runStep("http://user@www.mydomain.com:8080/doodad.js?v=1&a=&b");
					runStep("http://user@www.mydomain.com:8080/doodad.js?v=1&a=");
					runStep("http://user@www.mydomain.com:8080/doodad.js?v=1");
					runStep("http://user@www.mydomain.com:8080/doodad.js?");
					runStep("http://user@www.mydomain.com:8080/doodad.js");
					runStep("http://www.mydomain.com:8080/Doodad/doodad.js?v=1&a=&b&#anchor");
					runStep("http://www.mydomain.com:8080/Doodad/doodad.js?v=1&a=&b&");
					runStep("http://www.mydomain.com:8080/Doodad/doodad.js?v=1&a=&b");
					runStep("http://www.mydomain.com:8080/Doodad/doodad.js?v=1&a=");
					runStep("http://www.mydomain.com:8080/Doodad/doodad.js?v=1");
					runStep("http://www.mydomain.com:8080/Doodad/doodad.js?");
					runStep("http://www.mydomain.com:8080/Doodad/doodad.js");
					runStep("http://www.mydomain.com:8080/doodad.js?v=1&a=&b&#anchor");
					runStep("http://www.mydomain.com:8080/doodad.js?v=1&a=&b&");
					runStep("http://www.mydomain.com:8080/doodad.js?v=1&a=&b");
					runStep("http://www.mydomain.com:8080/doodad.js?v=1&a=");
					runStep("http://www.mydomain.com:8080/doodad.js?v=1");
					runStep("http://www.mydomain.com:8080/doodad.js?");
					runStep("http://www.mydomain.com:8080/doodad.js");
					runStep("http://www.mydomain.com/Doodad/doodad.js?v=1&a=&b&#anchor");
					runStep("http://www.mydomain.com/Doodad/doodad.js?v=1&a=&b&");
					runStep("http://www.mydomain.com/Doodad/doodad.js?v=1&a=&b");
					runStep("http://www.mydomain.com/Doodad/doodad.js?v=1&a=");
					runStep("http://www.mydomain.com/Doodad/doodad.js?v=1");
					runStep("http://www.mydomain.com/Doodad/doodad.js?");
					runStep("http://www.mydomain.com/Doodad/doodad.js");
					runStep("http://www.mydomain.com/doodad.js?v=1&a=&b&#anchor");
					runStep("http://www.mydomain.com/doodad.js?v=1&a=&b&");
					runStep("http://www.mydomain.com/doodad.js?v=1&a=&b");
					runStep("http://www.mydomain.com/doodad.js?v=1&a=");
					runStep("http://www.mydomain.com/doodad.js?v=1");
					runStep("http://www.mydomain.com/doodad.js?");
					runStep("http://www.mydomain.com/doodad.js");
					runStep("http://user:password@www.mydomain.com/Doodad/doodad.js?v=1&a=&b&#anchor");
					runStep("http://user:password@www.mydomain.com/doodad.js?v=1&a=&b&#anchor");
					runStep("http://user:password@www.mydomain.com/doodad.js?v=1&a=&b&");
					runStep("http://user:password@www.mydomain.com/doodad.js?v=1&a=&b");
					runStep("http://user:password@www.mydomain.com/doodad.js?v=1&a=");
					runStep("http://user:password@www.mydomain.com/doodad.js?v=1");
					runStep("http://user:password@www.mydomain.com/doodad.js?");
					runStep("http://user:password@www.mydomain.com/doodad.js");
					runStep("http://user:password@www.mydomain.com:8080/Doodad/v1/?v=1&a=&b&#anchor");
					runStep("http://user:password@www.mydomain.com:8080/Doodad/v1/?v=1&a=&b&");
					runStep("http://user:password@www.mydomain.com:8080/Doodad/v1/?v=1&a=&b");
					runStep("http://user:password@www.mydomain.com:8080/Doodad/v1/?v=1&a=");
					runStep("http://user:password@www.mydomain.com:8080/Doodad/v1/?v=1");
					runStep("http://user:password@www.mydomain.com:8080/Doodad/v1/?");
					runStep("http://user:password@www.mydomain.com:8080/Doodad/?v=1&a=&b&#anchor");
					runStep("http://user:password@www.mydomain.com:8080/Doodad/?v=1&a=&b&");
					runStep("http://user:password@www.mydomain.com:8080/Doodad/?v=1&a=&b");
					runStep("http://user:password@www.mydomain.com:8080/Doodad/?v=1&a=");
					runStep("http://user:password@www.mydomain.com:8080/Doodad/?v=1");
					runStep("http://user:password@www.mydomain.com:8080/Doodad/?");
					runStep("http://user:password@www.mydomain.com:8080/?v=1&a=&b&#anchor");
					runStep("http://user:password@www.mydomain.com:8080/?v=1&a=&b&");
					runStep("http://user:password@www.mydomain.com:8080/?v=1&a=&b");
					runStep("http://user:password@www.mydomain.com:8080/?v=1&a=");
					runStep("http://user:password@www.mydomain.com:8080/?v=1");
					runStep("http://user:password@www.mydomain.com:8080/?");
					runStep("http://user:password@www.mydomain.com:8080?v=1&a=&b&#anchor");
					runStep("http://user:password@www.mydomain.com:8080?v=1&a=&b&");
					runStep("http://user:password@www.mydomain.com:8080?v=1&a=&b");
					runStep("http://user:password@www.mydomain.com:8080?v=1&a=");
					runStep("http://user:password@www.mydomain.com:8080?v=1");
					runStep("http://user:password@www.mydomain.com:8080?");
					runStep("http://user@www.mydomain.com:8080/Doodad/v1/?v=1&a=&b&#anchor");
					runStep("http://www.mydomain.com:8080/Doodad/v1/?v=1&a=&b&#anchor");
					runStep("http://www.mydomain.com:8080/Doodad/v1/?v=1&a=&b&");
					runStep("http://www.mydomain.com:8080/Doodad/v1/?v=1&a=&b");
					runStep("http://www.mydomain.com:8080/Doodad/v1/?v=1&a=");
					runStep("http://www.mydomain.com:8080/Doodad/v1/?v=1");
					runStep("http://www.mydomain.com:8080/Doodad/v1/?");
					runStep("http://www.mydomain.com:8080/Doodad/v1/");
					runStep("http://www.mydomain.com/Doodad/v1/?v=1&a=&b&#anchor");
					runStep("http://www.mydomain.com/Doodad/v1/?v=1&a=&b&");
					runStep("http://www.mydomain.com/Doodad/v1/?v=1&a=&b");
					runStep("http://www.mydomain.com/Doodad/v1/?v=1&a=");
					runStep("http://www.mydomain.com/Doodad/v1/?v=1");
					runStep("http://www.mydomain.com/Doodad/v1/?");
					runStep("http://www.mydomain.com/Doodad/?v=1&a=&b&#anchor");
					runStep("http://www.mydomain.com/Doodad/?v=1&a=&b&");
					runStep("http://www.mydomain.com/Doodad/?v=1&a=&b");
					runStep("http://www.mydomain.com/Doodad/?v=1&a=");
					runStep("http://www.mydomain.com/Doodad/?v=1");
					runStep("http://www.mydomain.com/Doodad/?");
					runStep("http://www.mydomain.com/?v=1&a=&b&#anchor");
					runStep("http://www.mydomain.com/?v=1&a=&b&");
					runStep("http://www.mydomain.com/?v=1&a=&b");
					runStep("http://www.mydomain.com/?v=1&a=");
					runStep("http://www.mydomain.com/?v=1");
					runStep("http://www.mydomain.com/?");
					runStep("http://www.mydomain.com?v=1&a=&b&#anchor");
					runStep("http://www.mydomain.com?v=1&a=&b&");
					runStep("http://www.mydomain.com?v=1&a=&b");
					runStep("http://www.mydomain.com?v=1&a=");
					runStep("http://www.mydomain.com?v=1");
					runStep("http://www.mydomain.com?");
					runStep("/Doodad/v1/doodad.js?v=1&a=&b&#anchor");
					runStep("/Doodad/v1/doodad.js?v=1&a=&b&");
					runStep("/Doodad/v1/doodad.js?v=1&a=&b");
					runStep("/Doodad/v1/doodad.js?v=1&a=");
					runStep("/Doodad/v1/doodad.js?v=1");
					runStep("/Doodad/v1/doodad.js?");
					runStep("/Doodad/v1/doodad.js");
					runStep("/Doodad/v1/");
					runStep("/Doodad/v1");
					runStep("/Doodad/");
					runStep("/Doodad");
					runStep("/");
					runStep("");

					runStep("file:///C:/Doodad/v1/doodad.js?v=1&a=&b&#anchor");
					runStep("file:///C:/Doodad/v1/doodad.js?v=1&a=&b&#");
					runStep("file:///C:/Doodad/v1/doodad.js?v=1&a=&b&");
					runStep("file:///C:/Doodad/v1/doodad.js?v=1&a=&b");
					runStep("file:///C:/Doodad/v1/doodad.js?v=1&a=&");
					runStep("file:///C:/Doodad/v1/doodad.js?v=1&a=");
					runStep("file:///C:/Doodad/v1/doodad.js?v=1&a");
					runStep("file:///C:/Doodad/v1/doodad.js?v=1&");
					runStep("file:///C:/Doodad/v1/doodad.js?v=1");
					runStep("file:///C:/Doodad/v1/doodad.js?v=");
					runStep("file:///C:/Doodad/v1/doodad.js?v");
					runStep("file:///C:/Doodad/v1/doodad.js?");
					runStep("file:///C:/Doodad/v1/doodad.js");
					runStep("file:///C:/Doodad/v1/");
					runStep("file:///C:/Doodad/");
					runStep("file:///C:/");
					runStep("file:///c:/", "file:///C:/");
					runStep("file://C:/", "file:///C:/");

					runStep("file:///Doodad/v1/doodad.js?v=1&a=&b&#anchor");
					runStep("file:///Doodad/v1/doodad.js?v=1&a=&b&#");
					runStep("file:///Doodad/v1/doodad.js?v=1&a=&b&");
					runStep("file:///Doodad/v1/doodad.js?v=1&a=&b");
					runStep("file:///Doodad/v1/doodad.js?v=1&a=&");
					runStep("file:///Doodad/v1/doodad.js?v=1&a=");
					runStep("file:///Doodad/v1/doodad.js?v=1&a");
					runStep("file:///Doodad/v1/doodad.js?v=1&");
					runStep("file:///Doodad/v1/doodad.js?v=1");
					runStep("file:///Doodad/v1/doodad.js?v=");
					runStep("file:///Doodad/v1/doodad.js?v");
					runStep("file:///Doodad/v1/doodad.js?");
					runStep("file:///Doodad/v1/doodad.js");
					runStep("file:///Doodad/v1/");
					runStep("file:///Doodad/");
					runStep("file:///");
				});
					
					
				test.runCommand(function(url1, url2, /*optional*/optionsUrl1, /*optional*/optionsUrl2, /*optional*/setUrl2, /*optional*/combineOptions, /*optional*/toStringOptions) {
					url1 = files.Url.parse(url1, optionsUrl1);
					if (!url1) {
						return undefined;
					};
					url2 = files.Url.parse(url2, optionsUrl2);
					if (url2) {
						if (setUrl2) {
							url2 = url2.set(setUrl2);
						};
						url2 = url1.combine(url2, combineOptions);
					};
					if (url2) {
						url2 = url2.toString(toStringOptions);
					};
					return url2;
				}, "Doodad.Tools.Files.Url.combine.Url", function(command, options) {
					command.runStep("http://www.doodad-js.local/Doodad.js?v=1&a=&b&#anchor",                                  {repetitions: 100}, /**/ "http://user:password@www.mydomain.com:8080/Doodad/v1/", "http://www.doodad-js.local/Doodad.js?v=1&a=&b&#anchor"); // absolute
					command.runStep("http://www.doodad-js.local/?v=1&a=&b&#anchor",                                            {repetitions: 100}, /**/ "http://user:password@www.mydomain.com:8080/Doodad/v1/", "http://www.doodad-js.local?v=1&a=&b&#anchor");  // absolute
					command.runStep("http://user:password@www.mydomain.com:8080/Doodad.js?v=1&a=&b&#anchor",                  {repetitions: 100}, /**/ "http://user:password@www.mydomain.com:8080/Doodad/v1/", "/Doodad.js?v=1&a=&b&#anchor");
					command.runStep("http://user:password@www.mydomain.com:8080/Doodad/v1/Doodad.js?v=1&a=&b&#anchor",        {repetitions: 100}, /**/ "http://user:password@www.mydomain.com:8080/Doodad/v1/", "Doodad.js?v=1&a=&b&#anchor");
					command.runStep("http://user:password@www.mydomain.com:8080/Doodad.js?v=1&a=&b&#anchor",                  {repetitions: 100}, /**/ "http://user:password@www.mydomain.com:8080/Doodad/v1/?v=1#anchor", "/Doodad.js?a=&b&");
					command.runStep("http://user:password@www.mydomain.com:8080/Doodad/v1/Doodad.js?v=1&a=&b&#anchor",        {repetitions: 100}, /**/ "http://user:password@www.mydomain.com:8080/Doodad/v1/?v=1#anchor", "Doodad.js?a=&b&");
				});
					
					
					
				test.runCommand(function(url, path, /*optional*/optionsUrl, /*optional*/optionsPath, /*optional*/setPath, /*optional*/combineOptions, /*optional*/toStringOptions) {
					url = files.Url.parse(url, optionsUrl);
					if (!url) {
						return undefined;
					};
					path = files.Path.parse(path, optionsPath);
					if (!path) {
						return undefined;
					};
					if (setPath) {
						path = path.set(setPath);
					};
					url = url.combine(path, combineOptions);
					if (url) {
						url = url.toString(toStringOptions);
					};
					return url;
				}, "Doodad.Tools.Files.Url.combine.Path", function(command, options) {
					command.runStep("http://user:password@www.mydomain.com:8080/Doodad.js",                                  {repetitions: 100}, /**/ "http://user:password@www.mydomain.com:8080/Doodad/v1/", "/Doodad.js", null, {os: 'linux'});
					command.runStep("http://user:password@www.mydomain.com:8080/Doodad/v1/Doodad.js",                        {repetitions: 100}, /**/ "http://user:password@www.mydomain.com:8080/Doodad/v1/", "Doodad.js", null, {os: 'linux'});
				});
						
			},
		},
	};
	return mods;
};

//! END_MODULE()
