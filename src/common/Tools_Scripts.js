//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
	// doodad-js - Object-oriented programming framework
	// File: Tools_Scripts.js - Scripts tools
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

exports.add = function add(modules) {
	modules = (modules || {});
	modules['Doodad.Tools/Scripts'] = {
		version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
		dependencies: [
			'Doodad.Tools',
			'Doodad.Types',
			'Doodad.Tools.Files',
		],
		bootstrap: true,

		create: function create(root, /*optional*/_options, _shared) {
			//===================================
			// Get namespaces
			//===================================

			const doodad = root.Doodad,
				types = doodad.Types,
				tools = doodad.Tools,
				files = tools.Files;

			//===================================
			// Internal
			//===================================

			// <FUTURE> Thread context
			const __Internal__ = {
			};


			//===================================
			// Native functions
			//===================================

			// NOTE: Makes use of "isNativeFunction" to get rid of third-parties injections as possible.

			tools.complete(_shared.Natives, {
				// "trapUnhandledErrors"
				mathAbs: global.Math.abs,
				windowSetTimeout: global.setTimeout.bind(global),

				// "getCurrentScript"
				windoError: global.Error,
			});


			//===================================
			// Script functions
			//===================================

			tools.ADD('getCurrentScript', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 1,
						params: {
							currentScript: {
								type: 'string,object,error',
								optional: true,
								description: "Some Javascript engines provide a way to get the information. You should give it here.",
							},
						},
						returns: 'Url,Path',
						description:
								"Returns location of the current running script. Multiple usages :\n" +
								'- Client-side only: root.Doodad.Tools.getCurrentScript(document.currentScript||(function(){try{throw new Error("");}catch(ex){return ex;}})())\n' +
								'- Client-side and server-side: root.Doodad.Tools.getCurrentScript((root.serverSide?module.filename:document.currentScript)||(function(){try{throw new Error("");}catch(ex){return ex;}})())\n' +
								'- Server-side only: Don\'t use this function. Instead, do : root.Doodad.Tools.Files.Path.parse(module.filename)\n',
					}
				//! END_REPLACE()
				, function getCurrentScript(/*optional*/currentScript) {
					let url,
						ex,
						exLevel = 0;

					if (types.isError(currentScript)) {
						ex = currentScript;
					} else if (types.isString(currentScript)) {
						// NodeJs
						url = files.Path.parse(currentScript);
					} else if (types.isObject(currentScript) && types.isString(currentScript.src)) {
						// NOTE: currentScript is 'document.currentScript'
						// Google Chrome 39 Windows: OK
						// Firefox 34: undefined
						// IE 11: undefined
						// Opera 26 Windows: OK
						// Safari 5: undefined
						url = files.Url.parse(currentScript.src);
					};

					if (!url) {
						if (ex && types.isString(ex.sourceURL)) {
							// Safari
							url = files.Url.parse(ex.sourceURL);
						} else {
							// Other browsers
							if (!ex) {
								exLevel = 1;
								try {
									throw new _shared.Natives.windowError("");
								} catch(o) {
									ex = o;
								};
							};
							const stack = tools.parseStack(ex);
							if (stack && (stack.length > exLevel)) {
								const trace = stack[exLevel];
								if (trace.isSystemPath) {
									url = files.Path.parse(trace.path);
								} else {
									url = files.Url.parse(trace.path);
								};
							};
						};
					};

					return url;
				}));


			//===================================
			// Abort functions
			//===================================

			tools.ADD('abortScript', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 1,
						params: {
							exitCode: {
								type: 'integer',
								optional: true,
								description: "Exit code",
							},
						},
						returns: 'error',
						description: "Emits \"script aborted\" signal.",
					}
				//! END_REPLACE()
				, function abortScript(/*optional*/exitCode) {
					throw new types.ScriptAbortedError(exitCode);
				}));

			//====================================
			// Unhandled errors
			//====================================

			tools.ADD('trapUnhandledErrors', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 1,
						params: null,
						returns: 'undefined',
						description: "Trap unhandled errors and unhandled Promise rejections.",
					}
				//! END_REPLACE()
				, function trapUnhandledErrors() {
					if (!__Internal__.unhandledRejections) {
						__Internal__.unhandledRejections = new types.Map();

						const options = tools.getOptions();

						types.addAppEventListener('unhandlederror', function(ev) {
							try {
								tools.catchAndExit(ev.detail.error);
							} catch(o) {
								// Do nothing
							};
						});

						types.addAppEventListener('unhandledrejection', function(ev) {
							if (!types._instanceof(ev.detail.reason, types.ScriptInterruptedError)) {
								if (__Internal__.unhandledRejections.size < options.unhandledRejectionsMaxSize) {
									__Internal__.unhandledRejections.set(ev.detail.promise, {
										reason: ev.detail.reason,
										time: (new Date()).valueOf(),
									});
								};
							};
						});

						types.addAppEventListener('rejectionhandled', function(ev) {
							if (__Internal__.unhandledRejections.has(ev.detail.promise)) {
								__Internal__.unhandledRejections.delete(ev.detail.promise);
							};
						});

						const dumpRejections = function dumpRejections() {
							try {
								const curTime = (new Date()).valueOf();

								for (const item of __Internal__.unhandledRejections.entries()) {
									const promise = item[0],
										val = item[1];
									if (_shared.Natives.mathAbs(curTime - val.time) >= options.unhandledRejectionsTimeout) {
										tools.log(tools.LogLevels.Error, "Unhandled rejected promise : " + (types.get(promise, _shared.NameSymbol) || "<anonymous>") + ". You can enable Node.js's '--trace-warnings' flag to get more details.");
										if (val.reason) {
											tools.log(tools.LogLevels.Error, val.reason.stack || val.reason.message || val.reason.description);
										};
										__Internal__.unhandledRejections.delete(promise);
									};
								};
							} catch(o) {
								__Internal__.unhandledRejections.clear();
							};

							const timer = _shared.Natives.windowSetTimeout(dumpRejections, options.unhandledRejectionsTimeout);
							//! IF_SET("serverSide")
								if (types.isObject(timer) && types.isFunction(timer.unref)) {
									// Node.Js: Allows the process to exit
									timer.unref();
								};
							//! END_IF()
						};

						const timer = _shared.Natives.windowSetTimeout(dumpRejections, options.unhandledRejectionsTimeout);
						//! IF_SET("serverSide")
							if (types.isObject(timer) && types.isFunction(timer.unref)) {
								// Node.Js: Allows the process to exit
								timer.unref();
							};
						//! END_IF()
					};
				}));


			//===================================
			// Init
			//===================================
			//return function init(/*optional*/options) {
			//};
		},
	};
	return modules;
};

//! END_MODULE()
