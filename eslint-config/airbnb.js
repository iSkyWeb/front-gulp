// Doc: https://eslint.org/docs/rules/
module.exports = {
  "extends": "airbnb-base",
  "rules": {
    'max-len': [1, 100, 2, {
      ignoreUrls: true,
      ignoreComments: true,
      ignoreRegExpLiterals: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true
    }],
    "comma-dangle": ["error", "never"],
    "func-names": 0, // Ignore anonymous function
    "no-plusplus": 0,
    "no-loop-func": 1,
    "one-var": 0,
    "prefer-const": 1,
    "prefer-rest-params": 1, // Can argue with this rule. Feel free to disable it
    "no-use-before-define": [1, {
      "functions": false,
      "classes": true
    }],
    "radix": 1,
    "no-multi-assign": 1,
    "no-console": 0
  },
  "env": {
    "browser": true,
    "es6": true
    /*"jquery": true*/ // Uncomment for jquery variables
  }
};