module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true
    },
	"extends": "airbnb-base",
	"plugins": [
		"import"
	],
    "rules": {
		"comma-dangle": 'off', // We don't mind
		"dot-notation": 'off', // We don't mind
		"eol-last": 'off', // Temporary
		"func-names": 'warn', // Temporary
		"function-paren-newline": 'off', // Temporary: Maybe change to "never" later...
		"indent": 'off', // Temporary. Problem with Visual Studio for the moment.
		"keyword-spacing": 'off', // We prefer no spaciing.
		'max-len': 'off', // Grab a modern and graphical editor, VI/VIM are for servers.
		"new-cap": 'off', // Some variables are assigned a constructor.
		"no-bitwise": 'off', // What ?
		"no-continue": 'off', // What ?
		"no-else-return": 'off', // What ?
		"no-extra-label": 'off', // What ?
		"no-extra-semi": 'off', // ASI ?
		"no-labels": 'off', // What ?
		"no-lonely-if": 'off', // What ?
		"no-mixed-operators": 'off', // a && b || c
		"no-multi-assign": 'off', // Temporary
		"no-multi-spaces": 'off', // What ???
		"no-multiple-empty-lines": 'warn', // Temporary
		"no-nested-ternary": 'off', // Temporary
		"no-param-reassign": 'off', // We mostly does parameter validation and conversion (cast).
		"no-plusplus": 'off', // What ?
		"no-restricted-syntax": 'off', // for...of
		"no-shadow": 'warn', // Temporary
		"no-tabs": 'off', // We prefer tabs over spaces
		"no-trailing-spaces": 'off', // Temporary. Problem with Visual Studio for the moment.
		"no-undef-init": 'off', // Like to be explicit.
		"no-underscore-dangle": 'off', // What ?
		"no-unneeded-ternary": 'off', // Temporary
		"no-unreachable": 'warn', // <FUTURE> See if fixed : function myfunc(foo) { if (foo === 1) { return 'value1' } else if (foo === 2) { return 'value2' } else { return 'value3' } /* WE GET no-unreachable ERROR THERE BECAUSE OF COMMA !!! */ }
		"no-unused-expressions": 'off', // DD_ASSERT && DD_ASSERT(...)
		"no-unused-vars": ['error', {args: 'none'}], // Function signature
		"object-curly-newline": 'off', // No
		"object-curly-spacing": 'off', // What ?
		"object-shorthand": 'off', // Temporary
		"one-var": 'off', // No, "const/let/var" can declare more than one variables at once.
		"padded-blocks": 'off', // That makes code more readable for me.
		"prefer-arrow-callback": 'off', // Nope, a function is fine too.
		"prefer-const": 'warn', // Temporary
		"prefer-destructuring": 'off', // Temporary
		"prefer-spread": 'off', // Temporary
		"prefer-template": 'off', // Not sure
		"quote-props": 'off', // We don't care
		"quotes": "off", // Strings are either single or double quotes, ok ?
		"semi": ['warn', 'always'], // Temporary
		"semi-spacing": 'warn', // Temporary
		"space-before-function-paren": 'off', // What ?
		"space-in-parens": 'off', // Readability
		"spaced-comment": 'off', // Some comments are just argument names
		"strict": 'off', // Get "use strict uncessary inside modules ?", but I'm still CommonJS !
		"wrap-iife": ['error', 'inside'], // Yes, but "inside" instead of "outside".
	},
};