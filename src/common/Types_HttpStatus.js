//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
	// doodad-js - Object-oriented programming framework
	// File: Types_HttpStatus.js - HttpStatus type
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
	modules['Doodad.Types/HttpStatus'] = {
		version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,

		dependencies: [
			'Doodad.Tools',
		],

		create: function create(root, /*optional*/_options, _shared) {
			//===================================
			// Get namespaces
			//===================================

			const doodad = root.Doodad,
				tools = doodad.Tools,
				types = doodad.Types;

			//===================================
			// Internal
			//===================================

			//const __Internal__ = {
			//};

			//===================================
			// HTTP Status Codes
			// TODO: Add other non-standard or strange status ?
			//===================================

			types.ADD('HttpStatus', types.freezeObject(tools.nullObject({
				// Information
				Continue: 100,
				SwitchingProtocol: 101,

				// Success
				OK: 200,
				Created: 201,
				Accepted: 202,
				NonAuthoritativeInformation: 203,
				NoContent: 204,
				ResetContent: 205,
				PartialContent: 206,

				// Redirect
				MultipleChoices: 300,
				MovedPermanently: 301,
				Found: 302,
				SeeOther: 303,
				NotModified: 304,
				UseProxy: 305,
				TemporaryRedirect: 307,

				// Client errors
				BadRequest: 400,
				Unauthorized: 401,
				Forbidden: 403,
				NotFound: 404,
				MethodNotAllowed: 405,
				NotAcceptable: 406,
				ProxyAuthenticationRequired: 407,
				RequestTimeout: 408,
				Conflict: 409,
				Gone: 410,
				LengthRequired: 411,
				PreconditionFailed: 412,
				EntityTooLarge: 413,
				UrlTooLong: 414,
				UnsupportedMediaType: 415,
				RangeNotSatisfiable: 416,
				ExpectationFailed: 417,

				// Server errors
				InternalError: 500,
				NotImplemented: 501,
				BadGateway: 502,
				ServiceUnavailable: 503,
				GatewayTimeout: 504,
				VersionNotSupported: 505,

				// Utilities
				isInformative: function isInformative(status) {
					return (status >= 100) && (status < 200);
				},

				isSuccessful: function isSuccessful(status) {
					return (status >= 200) && (status < 300);
				},

				isRedirect: function isRedirect(status) {
					return (status >= 300) && (status < 400);
				},

				isClientError: function isClientError(status) {
					return (status >= 400) && (status < 500);
				},

				isServerError: function isServerError(status) {
					return (status >= 500);
				},

				isError: function isError(status) {
					return (status >= 400);
				},
			})));


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
