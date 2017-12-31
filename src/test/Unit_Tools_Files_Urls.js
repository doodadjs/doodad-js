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

exports.add = function add(DD_MODULES) {
	DD_MODULES = (DD_MODULES || {});
	DD_MODULES['Doodad.Test.Tools.Files.Urls'] = {
		type: 'TestModule',
		version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
		dependencies: ['Doodad.Test.Tools.Files'],

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
					unit = test.Tools.Files.Urls,
					io = doodad.IO,
					files = tools.Files;


				if (!options) {
					options = {};
				};
					

				let command;

					
				command = test.prepareCommand(function(/*paramarray*/) {
					return files.Url.parse.apply(files.Url, arguments);
				}, "Doodad.Tools.Files.Url.parse.test1");
						
				command.run({
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

				command.run({
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

				command.run({
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

				command.run({
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

				command.run({
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

				command.run({
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

				command.run({
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

				command.run({
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

				command.run({
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

				command.run({
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

				command.run({
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

				command.run({
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

				command.run({
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

				command.run({
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

				command.run({
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

				command.run({
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

				command.run({
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

				command.run({
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

				command.run({
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

				command.run({
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

				command.run({
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

				command.end();
					
			
				command = (function() {
						const command = test.prepareCommand.call(this, function(url) {
								return files.Url.parse(url).toString();
							}, "Doodad.Test.Tools.Files.Url.parse.test2");
						return tools.extend({}, command, {
							run: function(url, /*optional*/expected /*paramarray*/) {
								const params =  Array.prototype.slice.call(arguments, 0, arguments.length - 2);
								params.unshift(((expected === undefined) ? url : expected), {}, url);
								command.run.apply(this, params);
							},
						});
					}).apply(this);
					
				// Normal
				command.run("http://user:password@www.mydomain.com:8080/Doodad/v1/doodad.js?v=1&a=&b&#anchor");
				command.run("http://user:password@www.mydomain.com:8080/Doodad/v1/doodad.js?v=1&a=&b&");
				command.run("http://user:password@www.mydomain.com:8080/Doodad/v1/doodad.js?v=1&a=&b");
				command.run("http://user:password@www.mydomain.com:8080/Doodad/v1/doodad.js?v=1&a=");
				command.run("http://user:password@www.mydomain.com:8080/Doodad/v1/doodad.js?v=1");
				command.run("http://user:password@www.mydomain.com:8080/Doodad/v1/doodad.js?");
				command.run("http://user:password@www.mydomain.com:8080/Doodad/v1/doodad.js");
				command.run("http://user:password@www.mydomain.com:8080/Doodad/v1/");
				command.run("http://user:password@www.mydomain.com:8080/Doodad/v1");
				command.run("http://user:password@www.mydomain.com:8080/Doodad/");
				command.run("http://user:password@www.mydomain.com:8080/Doodad");
				command.run("http://user:password@www.mydomain.com:8080/");
				command.run("http://user:password@www.mydomain.com:8080");
				command.run("http://user:password@www.mydomain.com");
				command.run("http://user:password@www.mydomain.com/Doodad/v1/doodad.js?v=1&a=&b&#anchor");
				command.run("http://user:password@www.mydomain.com/Doodad/v1/doodad.js?v=1&a=&b&");
				command.run("http://user:password@www.mydomain.com/Doodad/v1/doodad.js?v=1&a=&b");
				command.run("http://user:password@www.mydomain.com/Doodad/v1/doodad.js?v=1&a=");
				command.run("http://user:password@www.mydomain.com/Doodad/v1/doodad.js?v=1");
				command.run("http://user:password@www.mydomain.com/Doodad/v1/doodad.js?");
				command.run("http://user:password@www.mydomain.com/Doodad/v1/doodad.js");
				command.run("http://user:password@www.mydomain.com/Doodad/v1/");
				command.run("http://user:password@www.mydomain.com/Doodad/v1");
				command.run("http://user:password@www.mydomain.com/Doodad/");
				command.run("http://user:password@www.mydomain.com/Doodad");
				command.run("http://user:password@www.mydomain.com/");
				command.run("http://user:password@www.mydomain.com");
				command.run("http://www.mydomain.com:8080/Doodad/v1/doodad.js?v=1&a=&b&#anchor");
				command.run("http://www.mydomain.com:8080/Doodad/v1/doodad.js?v=1&a=&b&");
				command.run("http://www.mydomain.com:8080/Doodad/v1/doodad.js?v=1&a=&b");
				command.run("http://www.mydomain.com:8080/Doodad/v1/doodad.js?v=1&a=");
				command.run("http://www.mydomain.com:8080/Doodad/v1/doodad.js?v=1");
				command.run("http://www.mydomain.com:8080/Doodad/v1/doodad.js?");
				command.run("http://www.mydomain.com:8080/Doodad/v1/doodad.js");
				command.run("http://www.mydomain.com:8080/Doodad/v1/");
				command.run("http://www.mydomain.com:8080/Doodad/v1");
				command.run("http://www.mydomain.com:8080/Doodad/");
				command.run("http://www.mydomain.com:8080/Doodad");
				command.run("http://www.mydomain.com:8080/");
				command.run("http://www.mydomain.com:8080");
				command.run("http://www.mydomain.com/Doodad/v1/doodad.js?v=1&a=&b&#anchor");
				command.run("http://www.mydomain.com/Doodad/v1/doodad.js?v=1&a=&b&");
				command.run("http://www.mydomain.com/Doodad/v1/doodad.js?v=1&a=&b");
				command.run("http://www.mydomain.com/Doodad/v1/doodad.js?v=1&a=");
				command.run("http://www.mydomain.com/Doodad/v1/doodad.js?v=1");
				command.run("http://www.mydomain.com/Doodad/v1/doodad.js?");
				command.run("http://www.mydomain.com/Doodad/v1/doodad.js");
				command.run("http://www.mydomain.com/Doodad/v1/");
				command.run("http://www.mydomain.com/Doodad/v1");
				command.run("http://www.mydomain.com/Doodad/");
				command.run("http://www.mydomain.com/Doodad");
				command.run("http://www.mydomain.com/");
				command.run("http://www.mydomain.com");
				command.run("http://user:password@www.mydomain.com:8080/Doodad/doodad.js?v=1&a=&b&#anchor");
				command.run("http://user:password@www.mydomain.com:8080/Doodad/doodad.js?v=1&a=&b&");
				command.run("http://user:password@www.mydomain.com:8080/Doodad/doodad.js?v=1&a=&b");
				command.run("http://user:password@www.mydomain.com:8080/Doodad/doodad.js?v=1&a=");
				command.run("http://user:password@www.mydomain.com:8080/Doodad/doodad.js?v=1");
				command.run("http://user:password@www.mydomain.com:8080/Doodad/doodad.js?");
				command.run("http://user:password@www.mydomain.com:8080/Doodad/doodad.js");
				command.run("http://user:password@www.mydomain.com:8080/doodad.js?v=1&a=&b&#anchor");
				command.run("http://user:password@www.mydomain.com:8080/doodad.js?v=1&a=&b&");
				command.run("http://user:password@www.mydomain.com:8080/doodad.js?v=1&a=&b");
				command.run("http://user:password@www.mydomain.com:8080/doodad.js?v=1&a=");
				command.run("http://user:password@www.mydomain.com:8080/doodad.js?v=1");
				command.run("http://user:password@www.mydomain.com:8080/doodad.js?");
				command.run("http://user:password@www.mydomain.com:8080/doodad.js");
				command.run("http://user@www.mydomain.com:8080/Doodad/doodad.js?v=1&a=&b&#anchor");
				command.run("http://user@www.mydomain.com:8080/Doodad/doodad.js?v=1&a=&b&");
				command.run("http://user@www.mydomain.com:8080/Doodad/doodad.js?v=1&a=&b");
				command.run("http://user@www.mydomain.com:8080/Doodad/doodad.js?v=1&a=");
				command.run("http://user@www.mydomain.com:8080/Doodad/doodad.js?v=1");
				command.run("http://user@www.mydomain.com:8080/Doodad/doodad.js?");
				command.run("http://user@www.mydomain.com:8080/doodad.js?v=1&a=&b&#anchor");
				command.run("http://user@www.mydomain.com:8080/doodad.js?v=1&a=&b&");
				command.run("http://user@www.mydomain.com:8080/doodad.js?v=1&a=&b");
				command.run("http://user@www.mydomain.com:8080/doodad.js?v=1&a=");
				command.run("http://user@www.mydomain.com:8080/doodad.js?v=1");
				command.run("http://user@www.mydomain.com:8080/doodad.js?");
				command.run("http://user@www.mydomain.com:8080/doodad.js");
				command.run("http://www.mydomain.com:8080/Doodad/doodad.js?v=1&a=&b&#anchor");
				command.run("http://www.mydomain.com:8080/Doodad/doodad.js?v=1&a=&b&");
				command.run("http://www.mydomain.com:8080/Doodad/doodad.js?v=1&a=&b");
				command.run("http://www.mydomain.com:8080/Doodad/doodad.js?v=1&a=");
				command.run("http://www.mydomain.com:8080/Doodad/doodad.js?v=1");
				command.run("http://www.mydomain.com:8080/Doodad/doodad.js?");
				command.run("http://www.mydomain.com:8080/Doodad/doodad.js");
				command.run("http://www.mydomain.com:8080/doodad.js?v=1&a=&b&#anchor");
				command.run("http://www.mydomain.com:8080/doodad.js?v=1&a=&b&");
				command.run("http://www.mydomain.com:8080/doodad.js?v=1&a=&b");
				command.run("http://www.mydomain.com:8080/doodad.js?v=1&a=");
				command.run("http://www.mydomain.com:8080/doodad.js?v=1");
				command.run("http://www.mydomain.com:8080/doodad.js?");
				command.run("http://www.mydomain.com:8080/doodad.js");
				command.run("http://www.mydomain.com/Doodad/doodad.js?v=1&a=&b&#anchor");
				command.run("http://www.mydomain.com/Doodad/doodad.js?v=1&a=&b&");
				command.run("http://www.mydomain.com/Doodad/doodad.js?v=1&a=&b");
				command.run("http://www.mydomain.com/Doodad/doodad.js?v=1&a=");
				command.run("http://www.mydomain.com/Doodad/doodad.js?v=1");
				command.run("http://www.mydomain.com/Doodad/doodad.js?");
				command.run("http://www.mydomain.com/Doodad/doodad.js");
				command.run("http://www.mydomain.com/doodad.js?v=1&a=&b&#anchor");
				command.run("http://www.mydomain.com/doodad.js?v=1&a=&b&");
				command.run("http://www.mydomain.com/doodad.js?v=1&a=&b");
				command.run("http://www.mydomain.com/doodad.js?v=1&a=");
				command.run("http://www.mydomain.com/doodad.js?v=1");
				command.run("http://www.mydomain.com/doodad.js?");
				command.run("http://www.mydomain.com/doodad.js");
				command.run("http://user:password@www.mydomain.com/Doodad/doodad.js?v=1&a=&b&#anchor");
				command.run("http://user:password@www.mydomain.com/doodad.js?v=1&a=&b&#anchor");
				command.run("http://user:password@www.mydomain.com/doodad.js?v=1&a=&b&");
				command.run("http://user:password@www.mydomain.com/doodad.js?v=1&a=&b");
				command.run("http://user:password@www.mydomain.com/doodad.js?v=1&a=");
				command.run("http://user:password@www.mydomain.com/doodad.js?v=1");
				command.run("http://user:password@www.mydomain.com/doodad.js?");
				command.run("http://user:password@www.mydomain.com/doodad.js");
				command.run("http://user:password@www.mydomain.com:8080/Doodad/v1/?v=1&a=&b&#anchor");
				command.run("http://user:password@www.mydomain.com:8080/Doodad/v1/?v=1&a=&b&");
				command.run("http://user:password@www.mydomain.com:8080/Doodad/v1/?v=1&a=&b");
				command.run("http://user:password@www.mydomain.com:8080/Doodad/v1/?v=1&a=");
				command.run("http://user:password@www.mydomain.com:8080/Doodad/v1/?v=1");
				command.run("http://user:password@www.mydomain.com:8080/Doodad/v1/?");
				command.run("http://user:password@www.mydomain.com:8080/Doodad/?v=1&a=&b&#anchor");
				command.run("http://user:password@www.mydomain.com:8080/Doodad/?v=1&a=&b&");
				command.run("http://user:password@www.mydomain.com:8080/Doodad/?v=1&a=&b");
				command.run("http://user:password@www.mydomain.com:8080/Doodad/?v=1&a=");
				command.run("http://user:password@www.mydomain.com:8080/Doodad/?v=1");
				command.run("http://user:password@www.mydomain.com:8080/Doodad/?");
				command.run("http://user:password@www.mydomain.com:8080/?v=1&a=&b&#anchor");
				command.run("http://user:password@www.mydomain.com:8080/?v=1&a=&b&");
				command.run("http://user:password@www.mydomain.com:8080/?v=1&a=&b");
				command.run("http://user:password@www.mydomain.com:8080/?v=1&a=");
				command.run("http://user:password@www.mydomain.com:8080/?v=1");
				command.run("http://user:password@www.mydomain.com:8080/?");
				command.run("http://user:password@www.mydomain.com:8080?v=1&a=&b&#anchor");
				command.run("http://user:password@www.mydomain.com:8080?v=1&a=&b&");
				command.run("http://user:password@www.mydomain.com:8080?v=1&a=&b");
				command.run("http://user:password@www.mydomain.com:8080?v=1&a=");
				command.run("http://user:password@www.mydomain.com:8080?v=1");
				command.run("http://user:password@www.mydomain.com:8080?");
				command.run("http://user@www.mydomain.com:8080/Doodad/v1/?v=1&a=&b&#anchor");
				command.run("http://www.mydomain.com:8080/Doodad/v1/?v=1&a=&b&#anchor");
				command.run("http://www.mydomain.com:8080/Doodad/v1/?v=1&a=&b&");
				command.run("http://www.mydomain.com:8080/Doodad/v1/?v=1&a=&b");
				command.run("http://www.mydomain.com:8080/Doodad/v1/?v=1&a=");
				command.run("http://www.mydomain.com:8080/Doodad/v1/?v=1");
				command.run("http://www.mydomain.com:8080/Doodad/v1/?");
				command.run("http://www.mydomain.com:8080/Doodad/v1/");
				command.run("http://www.mydomain.com/Doodad/v1/?v=1&a=&b&#anchor");
				command.run("http://www.mydomain.com/Doodad/v1/?v=1&a=&b&");
				command.run("http://www.mydomain.com/Doodad/v1/?v=1&a=&b");
				command.run("http://www.mydomain.com/Doodad/v1/?v=1&a=");
				command.run("http://www.mydomain.com/Doodad/v1/?v=1");
				command.run("http://www.mydomain.com/Doodad/v1/?");
				command.run("http://www.mydomain.com/Doodad/?v=1&a=&b&#anchor");
				command.run("http://www.mydomain.com/Doodad/?v=1&a=&b&");
				command.run("http://www.mydomain.com/Doodad/?v=1&a=&b");
				command.run("http://www.mydomain.com/Doodad/?v=1&a=");
				command.run("http://www.mydomain.com/Doodad/?v=1");
				command.run("http://www.mydomain.com/Doodad/?");
				command.run("http://www.mydomain.com/?v=1&a=&b&#anchor");
				command.run("http://www.mydomain.com/?v=1&a=&b&");
				command.run("http://www.mydomain.com/?v=1&a=&b");
				command.run("http://www.mydomain.com/?v=1&a=");
				command.run("http://www.mydomain.com/?v=1");
				command.run("http://www.mydomain.com/?");
				command.run("http://www.mydomain.com?v=1&a=&b&#anchor");
				command.run("http://www.mydomain.com?v=1&a=&b&");
				command.run("http://www.mydomain.com?v=1&a=&b");
				command.run("http://www.mydomain.com?v=1&a=");
				command.run("http://www.mydomain.com?v=1");
				command.run("http://www.mydomain.com?");
				command.run("/Doodad/v1/doodad.js?v=1&a=&b&#anchor");
				command.run("/Doodad/v1/doodad.js?v=1&a=&b&");
				command.run("/Doodad/v1/doodad.js?v=1&a=&b");
				command.run("/Doodad/v1/doodad.js?v=1&a=");
				command.run("/Doodad/v1/doodad.js?v=1");
				command.run("/Doodad/v1/doodad.js?");
				command.run("/Doodad/v1/doodad.js");
				command.run("/Doodad/v1/");
				command.run("/Doodad/v1");
				command.run("/Doodad/");
				command.run("/Doodad");
				command.run("/");
				command.run("");

				command.run("file:///C:/Doodad/v1/doodad.js?v=1&a=&b&#anchor");
				command.run("file:///C:/Doodad/v1/doodad.js?v=1&a=&b&#");
				command.run("file:///C:/Doodad/v1/doodad.js?v=1&a=&b&");
				command.run("file:///C:/Doodad/v1/doodad.js?v=1&a=&b");
				command.run("file:///C:/Doodad/v1/doodad.js?v=1&a=&");
				command.run("file:///C:/Doodad/v1/doodad.js?v=1&a=");
				command.run("file:///C:/Doodad/v1/doodad.js?v=1&a");
				command.run("file:///C:/Doodad/v1/doodad.js?v=1&");
				command.run("file:///C:/Doodad/v1/doodad.js?v=1");
				command.run("file:///C:/Doodad/v1/doodad.js?v=");
				command.run("file:///C:/Doodad/v1/doodad.js?v");
				command.run("file:///C:/Doodad/v1/doodad.js?");
				command.run("file:///C:/Doodad/v1/doodad.js");
				command.run("file:///C:/Doodad/v1/");
				command.run("file:///C:/Doodad/");
				command.run("file:///C:/");
				command.run("file:///c:/", "file:///C:/");
				command.run("file://C:/", "file:///C:/");

				command.run("file:///Doodad/v1/doodad.js?v=1&a=&b&#anchor");
				command.run("file:///Doodad/v1/doodad.js?v=1&a=&b&#");
				command.run("file:///Doodad/v1/doodad.js?v=1&a=&b&");
				command.run("file:///Doodad/v1/doodad.js?v=1&a=&b");
				command.run("file:///Doodad/v1/doodad.js?v=1&a=&");
				command.run("file:///Doodad/v1/doodad.js?v=1&a=");
				command.run("file:///Doodad/v1/doodad.js?v=1&a");
				command.run("file:///Doodad/v1/doodad.js?v=1&");
				command.run("file:///Doodad/v1/doodad.js?v=1");
				command.run("file:///Doodad/v1/doodad.js?v=");
				command.run("file:///Doodad/v1/doodad.js?v");
				command.run("file:///Doodad/v1/doodad.js?");
				command.run("file:///Doodad/v1/doodad.js");
				command.run("file:///Doodad/v1/");
				command.run("file:///Doodad/");
				command.run("file:///");
					
				command.end();
					
					
				command = test.prepareCommand(function(url1, url2, /*optional*/optionsUrl1, /*optional*/optionsUrl2, /*optional*/setUrl2, /*optional*/combineOptions, /*optional*/toStringOptions) {
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
				}, "Doodad.Tools.Files.Url.combine.Url");
					
				command.run("http://www.doodad-js.local/Doodad.js?v=1&a=&b&#anchor",                                  {repetitions: 100}, /**/ "http://user:password@www.mydomain.com:8080/Doodad/v1/", "http://www.doodad-js.local/Doodad.js?v=1&a=&b&#anchor"); // absolute
				command.run("http://www.doodad-js.local/?v=1&a=&b&#anchor",                                            {repetitions: 100}, /**/ "http://user:password@www.mydomain.com:8080/Doodad/v1/", "http://www.doodad-js.local?v=1&a=&b&#anchor");  // absolute
				command.run("http://user:password@www.mydomain.com:8080/Doodad.js?v=1&a=&b&#anchor",                  {repetitions: 100}, /**/ "http://user:password@www.mydomain.com:8080/Doodad/v1/", "/Doodad.js?v=1&a=&b&#anchor");
				command.run("http://user:password@www.mydomain.com:8080/Doodad/v1/Doodad.js?v=1&a=&b&#anchor",        {repetitions: 100}, /**/ "http://user:password@www.mydomain.com:8080/Doodad/v1/", "Doodad.js?v=1&a=&b&#anchor");
				command.run("http://user:password@www.mydomain.com:8080/Doodad.js?v=1&a=&b&#anchor",                  {repetitions: 100}, /**/ "http://user:password@www.mydomain.com:8080/Doodad/v1/?v=1#anchor", "/Doodad.js?a=&b&");
				command.run("http://user:password@www.mydomain.com:8080/Doodad/v1/Doodad.js?v=1&a=&b&#anchor",        {repetitions: 100}, /**/ "http://user:password@www.mydomain.com:8080/Doodad/v1/?v=1#anchor", "Doodad.js?a=&b&");
					
				command.end();
					
					
					
				command = test.prepareCommand(function(url, path, /*optional*/optionsUrl, /*optional*/optionsPath, /*optional*/setPath, /*optional*/combineOptions, /*optional*/toStringOptions) {
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
				}, "Doodad.Tools.Files.Url.combine.Path");
					
				command.run("http://user:password@www.mydomain.com:8080/Doodad.js",                                  {repetitions: 100}, /**/ "http://user:password@www.mydomain.com:8080/Doodad/v1/", "/Doodad.js", null, {os: 'linux'});
				command.run("http://user:password@www.mydomain.com:8080/Doodad/v1/Doodad.js",                        {repetitions: 100}, /**/ "http://user:password@www.mydomain.com:8080/Doodad/v1/", "Doodad.js", null, {os: 'linux'});
					
				command.end();
						
			},
		},
	};
	return DD_MODULES;
};

//! END_MODULE()