//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2017 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Unit_Tools_Path.js - Unit testing module file
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

module.exports = {
	add: function add(DD_MODULES) {
		DD_MODULES = (DD_MODULES || {});
		DD_MODULES['Doodad.Test.Tools.Files.Path'] = {
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
						unit = test.Types.Is,
						io = doodad.IO,
						files = tools.Files;

						
					if (!options) {
						options = {};
					};


					let command;


					command = test.prepareCommand(function(/*paramarray*/) {
						return files.Path.parse.apply(files.Path, arguments);
					}, "Doodad.Tools.Files.Path.parse.test1");
						
					function test1(osType, /*optional*/options) {
						if (osType === 'windows') {
							command.run({
								os: osType,
								dirChar: '\\',
								root: null,
								drive: null,
								path: [],
								file: null,
								extension: null,
								quote: null,
								isRelative: true,
								noEscapes: false,
								shell: 'api',
							}, {depth: 1}, /**/ "", options);

							command.run({
								os: osType,
								dirChar: '\\',
								root: null,
								drive: 'C',
								path: [],
								file: '',
								extension: '',
								quote: null,
								isRelative: false,
								noEscapes: false,
								shell: 'api',
							}, {depth: 1}, /**/ "C:\\", options);

							command.run({
								os: osType,
								dirChar: '\\',
								root: null,
								drive: 'C',
								path: ['Temp'],
								file: '',
								extension: '',
								quote: null,
								isRelative: false,
								noEscapes: false,
								shell: 'api',
							}, {depth: 1}, /**/ "C:\\Temp\\", options);
							
							command.run({
								os: osType,
								dirChar: '\\',
								root: null,
								drive: 'C',
								path: ['Temp', 'SubFolder'],
								file: '',
								extension: '',
								quote: null,
								isRelative: false,
								noEscapes: false,
								shell: 'api',
							}, {depth: 1}, /**/ "C:\\Temp\\SubFolder\\", options);
							
							command.run({
								os: osType,
								dirChar: '\\',
								root: null,
								drive: 'C',
								path: ['Temp', 'SubFolder'],
								file: 'File.txt',
								extension: 'txt',
								quote: null,
								isRelative: false,
								noEscapes: false,
								shell: 'api',
							}, {depth: 1}, /**/ "C:\\Temp\\SubFolder\\File.txt", options);
							
							command.run({
								os: osType,
								dirChar: '\\',
								root: null,
								drive: 'C',
								path: ['Temp', 'SubFolder'],
								file: 'File.txt',
								extension: 'txt',
								quote: '"',
								isRelative: false,
								noEscapes: false,
								shell: 'dos',
							}, {depth: 1}, /**/ '"C:\\Temp\\SubFolder\\File.txt"', options);
							
						} else {
							command.run({
								os: osType,
								dirChar: '/',
								root: null,
								drive: null,
								path: [],
								file: '',
								extension: '',
								quote: null,
								isRelative: false,
								noEscapes: false,
								shell: 'api',
							}, {depth: 1}, /**/ "/", options);

							command.run({
								os: osType,
								dirChar: '/',
								root: null,
								drive: null,
								path: ['tmp'],
								file: '',
								extension: '',
								quote: null,
								isRelative: false,
								noEscapes: false,
								shell: 'api',
							}, {depth: 1}, /**/ "/tmp/", options);
							
							command.run({
								os: osType,
								dirChar: '/',
								root: null,
								drive: null,
								path: ['tmp', 'subfolder'],
								file: '',
								extension: '',
								quote: null,
								isRelative: false,
								noEscapes: false,
								shell: 'api',
							}, {depth: 1}, /**/ "/tmp/subfolder/", options);
							
							command.run({
								os: osType,
								dirChar: '/',
								root: null,
								drive: null,
								path: ['tmp', 'subfolder'],
								file: 'file.txt',
								extension: 'txt',
								quote: null,
								isRelative: false,
								noEscapes: false,
								shell: 'api',
							}, {depth: 1}, /**/ "/tmp/subfolder/file.txt", options);
							
							command.run({
								os: osType,
								dirChar: '/',
								root: null,
								drive: null,
								path: ['tmp', 'subfolder'],
								file: 'file.txt',
								extension: 'txt',
								quote: '"',
								isRelative: false,
								noEscapes: false,
								shell: 'bash',
							}, {depth: 1}, /**/ '"/tmp/subfolder/file.txt"', options);
							
							command.run({
								os: osType,
								dirChar: '/',
								root: null,
								drive: null,
								path: ['C:', 'SubFolder'],
								file: "File.txt",
								extension: 'txt',
								quote: null,
								isRelative: true,
								noEscapes: false,
								shell: 'api',
							}, {depth: 1}, /**/ "C:\\SubFolder\\File.txt", options);
							
						};
					};

					test1('windows', {os: 'windows'});
					test1('linux', {os: 'linux'});
					
					command.end();
					
			
					command = test.prepareCommand(function(path, /*optional*/options) {
						let res = files.Path.parse(path, options);
						if (res) {
							res = res.toString();
						};
						return res;
					}, "Doodad.Tools.Files.Path.parse.test2");
					
					function test2(osType, /*optional*/forceOs) {
						let options = null;
						if (forceOs) {
							options = {os: osType};
						};
						if (osType === 'windows') {
							command.run("",                                              {repetitions: 100}, /**/ null, options);
							command.run("C:\\",                                          {repetitions: 100}, /**/ "C:", options);
							command.run("",                                              {repetitions: 100}, /**/ "", options);
							command.run("C:\\",                                          {repetitions: 100}, /**/ "C:\\", options);
							command.run("C:\\",                                          {repetitions: 100}, /**/ "c:\\", options);
							command.run("C:\\Temp\\",                                    {repetitions: 100}, /**/ "C:\\Temp\\", options);
							command.run("C:\\Temp\\File.txt",                            {repetitions: 100}, /**/ "C:\\Temp\\File.txt", options);
							command.run("C:\\Temp\\SubFolder\\File.txt",                 {repetitions: 100}, /**/ "C:\\Temp\\SubFolder\\File.txt", options);
							command.run("\\",                                            {repetitions: 100}, /**/ "\\", options);
							command.run("\\Temp\\",                                      {repetitions: 100}, /**/ "\\Temp\\", options);
							command.run("\\Temp\\SubFolder\\",                           {repetitions: 100}, /**/ "\\Temp\\SubFolder\\", options);
							command.run("\\Temp\\SubFolder\\File.txt",                   {repetitions: 100}, /**/ "\\Temp\\SubFolder\\File.txt", options);
							command.run("Temp\\",                                        {repetitions: 100}, /**/ "Temp\\", options);
							command.run("Temp\\SubFolder\\",                             {repetitions: 100}, /**/ "Temp\\SubFolder\\", options);
							command.run("Temp\\SubFolder\\File.txt",                     {repetitions: 100}, /**/ "Temp\\SubFolder\\File.txt", options);
							command.run("File.txt",                                      {repetitions: 100}, /**/ "File.txt", options);
							command.run(files.PathError,                              {mode: 'isinstance'}, /**/ "..\\", types.extend({}, options, {isRelative: false}));
							command.run("..\\",                                          {repetitions: 100}, /**/ "..\\", types.extend({}, options, {isRelative: true}));
							command.run(files.PathError,                              {mode: 'isinstance'}, /**/ "..\\File.txt", types.extend({}, options, {isRelative: false}));
							command.run("..\\File.txt",                                  {repetitions: 100}, /**/ "..\\File.txt", types.extend({}, options, {isRelative: true}));
							command.run(files.PathError,                              {mode: 'isinstance'}, /**/ "\\..\\File.txt", types.extend({}, options, {isRelative: false}));
							command.run("C:..\\File.txt",                                {repetitions: 100}, /**/ "C:..\\File.txt", types.extend({}, options, {isRelative: true}));
							command.run("C:\\..\\File.txt",                              {repetitions: 100}, /**/ "C:\\..\\File.txt", types.extend({}, options, {isRelative: true}));
							command.run("\\File.txt",                                    {repetitions: 100}, /**/ "\\SubFolder\\..\\File.txt", types.extend({}, options, {isRelative: false}));
							command.run("\\SubFolder\\File.txt",                         {repetitions: 100}, /**/ "\\SubFolder\\.\\File.txt", types.extend({}, options, {isRelative: false}));
							command.run("\\Sub Folder\\My File.txt",                     {repetitions: 100}, /**/ "\\Sub Folder\\My File.txt", options);
							command.run("\\Sub Folder\\My File.txt",                     {repetitions: 100}, /**/ "\\Sub Folder\\My File.txt", options);
							command.run("C:\\Users\\Claude\\SubFolder\\File.txt",        {repetitions: 100}, /**/ "\\SubFolder\\File.txt", types.extend({}, options, {root: "C:\\Users\\Claude"}));
							command.run("C:\\Users\\Claude\\File.txt",                   {repetitions: 100}, /**/ "\\SubFolder\\..\\File.txt", types.extend({}, options, {root: "C:\\Users\\Claude", isRelative: false}));
							command.run(files.PathError,		                      {mode: 'isinstance'}, /**/ "\\SubFolder\\..\\..\\File.txt", types.extend({}, options, {root: "C:\\Users\\Claude", isRelative: false}));
							command.run('"C:\\Temp\\SubFolder\\File.txt"',               {repetitions: 100}, /**/ '"C:\\Temp\\SubFolder\\File.txt"', options);
							command.run('"\\Temp\\SubFolder\\File.txt"',                 {repetitions: 100}, /**/ '"\\Temp\\SubFolder\\File.txt"', options);
							command.run('"Temp\\SubFolder\\File.txt"',                   {repetitions: 100}, /**/ '"Temp\\SubFolder\\File.txt"', options);
							command.run('"File.txt"',                                    {repetitions: 100}, /**/ '"File.txt"', options);
							command.run('"\\Sub Folder\\My File.txt"',                   {repetitions: 100}, /**/ '"\\Sub Folder\\My File.txt"', options);
							command.run('\\"Sub Folder"\\"My File.txt"',                 {repetitions: 100}, /**/ '\\"Sub Folder"\\"My File.txt"', options);
							command.run("\\tmp\\subfolder\\file.txt",                    {repetitions: 100}, /**/ "/tmp/subfolder/file.txt", options);
							
							command.run(types.ParseError,                             {mode: 'isinstance'}, /**/ "\\My Folder\\My File.txt", types.extend({}, options, {shell: 'dos'}));
							command.run(types.ParseError,                             {mode: 'isinstance'}, /**/ "\\My^ Folder\\My^ File.txt", types.extend({}, options, {shell: 'dos'}));
							command.run(types.ParseError,                             {mode: 'isinstance'}, /**/ "\\MyFolder\\MyFile&HerFile.txt", types.extend({}, options, {shell: 'dos'}));
							command.run("\\MyFolder\\MyFile^&HerFile.txt",               {repetitions: 100}, /**/ "\\MyFolder\\MyFile^&HerFile.txt", types.extend({}, options, {shell: 'dos'}));
							command.run('"\\My Folder\\My File.txt"',                    {repetitions: 100}, /**/ '"\\My Folder\\My File.txt"', types.extend({}, options, {shell: 'dos'}));
						} else {
							command.run("",                                              {repetitions: 100}, /**/ null, options);
							command.run("",                                              {repetitions: 100}, /**/ "", options);
							command.run("/",                                             {repetitions: 100}, /**/ "/", options);
							command.run("/tmp/",                                         {repetitions: 100}, /**/ "/tmp/", options);
							command.run("/tmp/file.txt",                                 {repetitions: 100}, /**/ "/tmp/file.txt", options);
							command.run("/tmp/subfolder/file.txt",                       {repetitions: 100}, /**/ "/tmp/subfolder/file.txt", options);
							command.run("tmp/",                                          {repetitions: 100}, /**/ "tmp/", options);
							command.run("tmp/file.txt",                                  {repetitions: 100}, /**/ "tmp/file.txt", options);
							command.run("tmp/subfolder/file.txt",                        {repetitions: 100}, /**/ "tmp/subfolder/file.txt", options);
							command.run("file.txt",                                      {repetitions: 100}, /**/ "file.txt", options);
							command.run(files.PathError,                              {mode: 'isinstance'}, /**/ "../", types.extend({}, options, {isRelative: false}));
							command.run("../",                                           {repetitions: 100}, /**/ "../", types.extend({}, options, {isRelative: true}));
							command.run(files.PathError,                              {mode: 'isinstance'}, /**/ "../file.txt", types.extend({}, options, {isRelative: false}));
							command.run("../file.txt",                                   {repetitions: 100}, /**/ "../file.txt", types.extend({}, options, {isRelative: true}));
							command.run("/file.txt",                                     {repetitions: 100}, /**/ "/subfolder/../file.txt", types.extend({}, options, {isRelative: false}));
							command.run("/subfolder/file.txt",                           {repetitions: 100}, /**/ "/subfolder/./file.txt", types.extend({}, options, {isRelative: false}));
							command.run("/Sub Folder/My File.txt",                       {repetitions: 100}, /**/ "/Sub Folder/My File.txt", options);
							command.run("/Sub Folder/My File.txt",                       {repetitions: 100}, /**/ "/Sub Folder/My File.txt", options);
							command.run("/home/claude/subfolder/file.txt",               {repetitions: 100}, /**/ "/subfolder/file.txt", types.extend({}, options, {root: "/home/claude"}));
							command.run("/home/claude/file.txt",                         {repetitions: 100}, /**/ "/subfolder/../file.txt", types.extend({}, options, {root: "/home/claude", isRelative: false}));
							command.run(files.PathError,                              {mode: 'isinstance'}, /**/ "/subfolder/../../file.txt", types.extend({}, options, {root: "/home/claude", isRelative: false}));
							command.run('"/tmp/subfolder/file.txt"',                     {repetitions: 100}, /**/ '"/tmp/subfolder/file.txt"', options);
							command.run('"tmp/subfolder/file.txt"',                      {repetitions: 100}, /**/ '"tmp/subfolder/file.txt"', options);
							command.run('"file.txt"',                                    {repetitions: 100}, /**/ '"file.txt"', options);
							command.run('"/subfolder/My File.txt"',                      {repetitions: 100}, /**/ '"/subfolder/My File.txt"', options);
							command.run('/"subfolder"/"My File.txt"',                    {repetitions: 100}, /**/ '/"subfolder"/"My File.txt"', options);
							command.run("/tmp/subfolder/file.txt",                       {repetitions: 100}, /**/ "\\tmp\\subfolder\\file.txt", options);

							command.run(types.ParseError,                             {mode: 'isinstance'}, /**/ "/My Folder/My File.txt", types.extend({}, options, {shell: 'bash'}));
							command.run("/My\\ Folder/My\\ File.txt",                    {repetitions: 100}, /**/ "/My\\ Folder/My\\ File.txt", types.extend({}, options, {shell: 'bash'}));
							command.run(types.ParseError,                             {mode: 'isinstance'}, /**/ "/MyFolder/MyFile&HerFile.txt", types.extend({}, options, {shell: 'bash'}));
							command.run("/MyFolder/MyFile\\&HerFile.txt",                {repetitions: 100}, /**/ "/MyFolder/MyFile\\&HerFile.txt", types.extend({}, options, {shell: 'bash'}));
							command.run('"/My Folder/My File.txt"',                      {repetitions: 100}, /**/ '"/My Folder/My File.txt"', types.extend({}, options, {shell: 'bash'}));
						};
					};

					test2(tools.getOS().type);
					test2('windows', true);
					test2('linux', true);
					
					command.end();
					

					command = test.prepareCommand(function(path1, path2, /*optional*/optionsPath1, /*optional*/optionsPath2, /*optional*/setPath2, /*optional*/combineOptions, /*optional*/toStringOptions) {
						path1 = files.Path.parse(path1, optionsPath1);
						if (!path1) {
							return undefined;
						};
						path2 = files.Path.parse(path2, optionsPath2);
						if (path2) {
							if (setPath2) {
								path2 = path2.set(setPath2);
							};
							path2 = path1.combine(path2, combineOptions);
						};
						if (path2) {
							path2 = path2.toString(toStringOptions);
						};
						return path2;
					}, "Doodad.Tools.Files.Path.combine.Path");
					
					command.run("C:\\",                                                  {repetitions: 100}, /**/ "C:\\", "C:\\", {os: 'windows'}, {os: 'windows'});
					command.run("C:\\SubFolder\\",                                       {repetitions: 100}, /**/ "C:\\", "C:\\SubFolder\\", {os: 'windows'}, {os: 'windows'});
					command.run(types.ParseError,                                        {mode: 'isinstance'}, /**/ "C:\\", "D:\\SubFolder\\", {os: 'windows'}, {os: 'windows'});
					command.run("C:\\File.txt",                                          {repetitions: 100}, /**/ "C:\\", "File.txt", {os: 'windows'}, {os: 'windows'});
					command.run("C:\\SubFolder\\File.txt",                               {repetitions: 100}, /**/ "C:\\", "SubFolder\\File.txt", {os: 'windows'}, {os: 'windows'});
					command.run("C:\\SubFolder\\File.txt",                               {repetitions: 100}, /**/ "C:\\", "\\SubFolder\\File.txt", {os: 'windows'}, {os: 'windows'});
					command.run("C:\\SubFolder\\File.txt",                               {repetitions: 100}, /**/ "C:\\SubFolder\\", "File.txt", {os: 'windows'}, {os: 'windows'});
					command.run("C:\\SubFolder\\File.txt",                               {repetitions: 100}, /**/ "C:\\SubFolder\\", "\\File.txt", {os: 'windows'}, {os: 'windows'});
					command.run(files.PathError,                                         {mode: 'isinstance'}, /**/ "C:\\", "..\\File.txt", {os: 'windows'}, {os: 'windows'});
					command.run("C:\\File.txt",                                          {repetitions: 100}, /**/ "C:\\SubFolder\\", "..\\File.txt", {os: 'windows'}, {os: 'windows'});
					command.run(files.PathError,                                         {mode: 'isinstance'}, /**/ "C:\\SubFolder\\", "\\..\\File.txt", {os: 'windows'}, {os: 'windows'});
					command.run("C:\\File.txt",                                          {repetitions: 100}, /**/ "C:\\", "SubFolder\\..\\File.txt", {os: 'windows'}, {os: 'windows'});
					command.run("C:\\File1.txt\\File2.txt",                              {repetitions: 100}, /**/ "C:\\File1.txt", "File2.txt", {os: 'windows'}, {os: 'windows'});
					command.run("C:\\SubFolder\\File1.txt\\File2.txt",                   {repetitions: 100}, /**/ "C:\\SubFolder\\File1.txt", "File2.txt", {os: 'windows'}, {os: 'windows'});
					command.run("C:\\File1.txt\\SubFolder\\File2.txt",                   {repetitions: 100}, /**/ "C:\\File1.txt", "SubFolder\\File2.txt", {os: 'windows'}, {os: 'windows'});
					command.run("C:\\SubFolder1\\File1.txt\\SubFolder2\\File2.txt",      {repetitions: 100}, /**/ "C:\\SubFolder1\\File1.txt", "SubFolder2\\File2.txt", {os: 'windows'}, {os: 'windows'});
					
					command.run("/",                                                     {repetitions: 100}, /**/ "/", "/", {os: 'linux'}, {os: 'linux'});
					command.run("/SubFolder/",                                           {repetitions: 100}, /**/ "/", "/SubFolder/", {os: 'linux'}, {os: 'linux'});
					command.run("/File.txt",                                             {repetitions: 100}, /**/ "/", "File.txt", {os: 'linux'}, {os: 'linux'});
					command.run("/SubFolder/File.txt",                                   {repetitions: 100}, /**/ "/", "SubFolder/File.txt", {os: 'linux'}, {os: 'linux'});
					command.run("/SubFolder/File.txt",                                   {repetitions: 100}, /**/ "/", "/SubFolder/File.txt", {os: 'linux'}, {os: 'linux'});
					command.run("/SubFolder/File.txt",                                   {repetitions: 100}, /**/ "/SubFolder/", "File.txt", {os: 'linux'}, {os: 'linux'});
					command.run("/SubFolder/File.txt",                                   {repetitions: 100}, /**/ "/SubFolder/", "/File.txt", {os: 'linux'}, {os: 'linux'});
					command.run(files.PathError,                                         {mode: 'isinstance'}, /**/ "/", "../File.txt", {os: 'linux'}, {os: 'linux'});
					command.run("/File.txt",                                             {repetitions: 100}, /**/ "/SubFolder/", "../File.txt", {os: 'linux'}, {os: 'linux'});
					command.run(files.PathError,                                         {mode: 'isinstance'}, /**/ "/SubFolder/", "/../File.txt", {os: 'linux'}, {os: 'linux'});
					command.run("/File.txt",                                             {repetitions: 100}, /**/ "/", "SubFolder/../File.txt", {os: 'linux'}, {os: 'linux'});
					command.run("/File1.txt/File2.txt",                                  {repetitions: 100}, /**/ "/File1.txt", "File2.txt", {os: 'linux'}, {os: 'linux'});
					command.run("/SubFolder/File1.txt/File2.txt",                        {repetitions: 100}, /**/ "/SubFolder/File1.txt", "File2.txt", {os: 'linux'}, {os: 'linux'});
					command.run("/File1.txt/SubFolder/File2.txt",                        {repetitions: 100}, /**/ "/File1.txt", "SubFolder/File2.txt", {os: 'linux'}, {os: 'linux'});
					command.run("/SubFolder1/File1.txt/SubFolder2/File2.txt",            {repetitions: 100}, /**/ "/SubFolder1/File1.txt", "SubFolder2/File2.txt", {os: 'linux'}, {os: 'linux'});
					
					command.run("C:\\SubFolder1\\File1.txt\\SubFolder2\\File2.txt",      {repetitions: 100}, /**/ "C:\\SubFolder1\\File1.txt", "SubFolder2/File2.txt", {os: 'windows'}, {os: 'linux'});
					command.run("/SubFolder1/File1.txt/SubFolder2/File2.txt",            {repetitions: 100}, /**/ "/SubFolder1/File1.txt", "SubFolder2\\File2.txt", {os: 'linux'}, {os: 'windows'});

					command.run(types.ParseError,                                      {mode: 'isinstance'}, /**/ "/SubFolder1/File1.txt", "C:\\SubFolder2\\File2.txt", {os: 'linux'}, {os: 'windows'});
					command.run("/SubFolder1/File1.txt/C:/SubFolder2/File2.txt",         {repetitions: 100}, /**/ "/SubFolder1/File1.txt", "C:\\SubFolder2\\File2.txt", {os: 'linux'}, {os: 'windows', drive: ''});
					command.run("/SubFolder1/File1.txt/SubFolder2/File2.txt",            {repetitions: 100}, /**/ "/SubFolder1/File1.txt", "C:\\SubFolder2\\File2.txt", {os: 'linux'}, {os: 'windows'}, {drive: null});
					
					command.end();
					
					
					
					command = test.prepareCommand(function(path, url, /*optional*/optionsPath, /*optional*/optionsUrl, /*optional*/setUrl, /*optional*/combineOptions, /*optional*/toStringOptions) {
						path = files.Path.parse(path, optionsPath);
						if (!path) {
							return undefined;
						};
						url = files.Url.parse(url, optionsUrl);
						if (!url) {
							return undefined;
						};
						if (setUrl) {
							url = url.set(setUrl);
						};
						path = path.combine(url, combineOptions);
						if (path) {
							path = path.toString(toStringOptions);
						};
						return path;
					}, "Doodad.Tools.Files.Path.combine.Url");
					
					command.run("C:\\",                                                  {repetitions: 100}, /**/ "C:\\", "file:///C:/", {os: 'windows'});
					command.run("C:\\SubFolder\\",                                       {repetitions: 100}, /**/ "C:\\", "file:///C:/SubFolder/", {os: 'windows'});
					command.run(types.ParseError,                                        {mode: 'isinstance'}, /**/ "C:\\", "file:///D:/SubFolder/", {os: 'windows'});
					command.run("C:\\File.txt",                                          {repetitions: 100}, /**/ "C:\\", "file:///File.txt", {os: 'windows'});
					command.run("C:\\SubFolder\\File.txt",                               {repetitions: 100}, /**/ "C:\\", "file://SubFolder/File.txt", {os: 'windows'});
					command.run("C:\\SubFolder\\File.txt",                               {repetitions: 100}, /**/ "C:\\", "file:///SubFolder/File.txt", {os: 'windows'});
					command.run("C:\\SubFolder\\File.txt",                               {repetitions: 100}, /**/ "C:\\SubFolder\\", "file:///File.txt", {os: 'windows'});
					command.run(files.PathError,                                         {mode: 'isinstance'}, /**/ "C:\\", "file://../File.txt", {os: 'windows'});
					command.run("C:\\File.txt",                                          {repetitions: 100},  /**/ "C:\\SubFolder\\", "file://../File.txt", {os: 'windows'});
					command.run(files.PathError,                                         {mode: 'isinstance'},  /**/ "C:\\SubFolder\\", "file:///../File.txt", {os: 'windows'});
					command.run("C:\\File.txt",                                          {repetitions: 100}, /**/ "C:\\", "file://SubFolder/../File.txt", {os: 'windows'});
					command.run("C:\\File1.txt\\File2.txt",                              {repetitions: 100}, /**/ "C:\\File1.txt", "file:///File2.txt", {os: 'windows'});
					command.run("C:\\SubFolder\\File1.txt\\File2.txt",                   {repetitions: 100}, /**/ "C:\\SubFolder\\File1.txt", "file:///File2.txt", {os: 'windows'});
					command.run("C:\\File1.txt\\SubFolder\\File2.txt",                   {repetitions: 100}, /**/ "C:\\File1.txt", "file://SubFolder/File2.txt", {os: 'windows'});
					command.run("C:\\SubFolder1\\File1.txt\\SubFolder2\\File2.txt",      {repetitions: 100}, /**/ "C:\\SubFolder1\\File1.txt", "file://SubFolder2/File2.txt", {os: 'windows'});
					
					command.run("/",                                                     {repetitions: 100}, /**/ "/", "file:///", {os: 'linux'});
					command.run("/SubFolder/",                                           {repetitions: 100}, /**/ "/", "file:///SubFolder/", {os: 'linux'});
					command.run("/File.txt",                                             {repetitions: 100}, /**/ "/", "file:///File.txt", {os: 'linux'});
					command.run("/SubFolder/File.txt",                                   {repetitions: 100}, /**/ "/", "file://SubFolder/File.txt", {os: 'linux'});
					command.run("/SubFolder/File.txt",                                   {repetitions: 100}, /**/ "/", "file:///SubFolder/File.txt", {os: 'linux'});
					command.run("/SubFolder/File.txt",                                   {repetitions: 100}, /**/ "/SubFolder/", "file:///File.txt", {os: 'linux'});
					command.run(files.PathError,                                         {mode: 'isinstance'}, /**/ "/", "file://../File.txt", {os: 'linux'});
					command.run("/File.txt",                                             {repetitions: 100}, /**/ "/SubFolder/", "file://../File.txt", {os: 'linux'});
					command.run(files.PathError,                                         {mode: 'isinstance'}, /**/ "/SubFolder/", "file:///../File.txt", {os: 'linux'});
					command.run("/File.txt",                                             {repetitions: 100}, /**/ "/", "file://SubFolder/../File.txt", {os: 'linux'});
					command.run("/File1.txt/File2.txt",                                  {repetitions: 100}, /**/ "/File1.txt", "file:///File2.txt", {os: 'linux'});
					command.run("/SubFolder/File1.txt/File2.txt",                        {repetitions: 100}, /**/ "/SubFolder/File1.txt", "file:///File2.txt", {os: 'linux'});
					command.run("/File1.txt/SubFolder/File2.txt",                        {repetitions: 100}, /**/ "/File1.txt", "file://SubFolder/File2.txt", {os: 'linux'});
					command.run("/SubFolder1/File1.txt/SubFolder2/File2.txt",            {repetitions: 100}, /**/ "/SubFolder1/File1.txt", "file://SubFolder2/File2.txt", {os: 'linux'});
					
					command.run(types.ParseError,                                       {mode: 'isinstance'}, /**/ "/SubFolder/", "http://www.doodad-js.local/File.txt", {os: 'linux'});

					command.end();
					
					
				},
			},
		};
		return DD_MODULES;
	},
};
//! END_MODULE()