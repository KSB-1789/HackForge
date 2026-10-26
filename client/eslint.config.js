import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),

  // D-024: ESLint covers the React app and nothing else.
  //
  // PR #26 linted '**\/*.{js,jsx}' across all of client/, which pulled in the
  // Evaluation I prototype under js/ and pages/. That code is not written to be
  // linted: its scripts depend on load-order globals defined in other files, so it
  // legitimately produces no-undef and no-unused-vars. The result was 53 errors
  // that had nothing to do with the app, which is how a real error gets missed.
  //
  // Scoping by 'files' rather than excluding by ignore-glob is deliberate. Both js/
  // and pages/ exist twice over - js/ vs src/js does not, but pages/ and
  // src/pages/ do - so any glob meant to catch client/pages/ risks also swallowing
  // src/pages/, which is ours and must stay linted. Naming what we lint instead of
  // what we skip cannot make that mistake.
  {
    files: ['src/**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },

  // Build tooling runs in Node rather than the browser, so it gets the Node globals
  // instead of the browser set applied above.
  {
    files: ['*.config.js'],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
  },
])
