const globals = require('globals');
const configBase = require('@doodad-js/eslint-config-base');
const { defineConfig } = require("eslint/config");

module.exports = defineConfig([
	{
		ignores: [
			"**/*.mjs",
			'**/*.inc.js',
			'**/*.templ.js',
			'**/*.config.js',
		],
	},

	{
		files: ["src/**/*.js"],

		rules: {
			...configBase.configs.recommended.rules,
		},

		languageOptions: {
            ecmaVersion: 2021,
			globals: {...globals.browser, ...globals.node, DD_BOOTSTRAP: false, DD_ROOT: false},
            sourceType: "commonjs",
        },
	},
]);