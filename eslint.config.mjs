import js from '@eslint/js'
import globals from 'globals'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
    globalIgnores(['out/', 'crockett/', 'unzipper/']),

    // Everything is a CommonJS script running in Node (Electron main process) by default
    {
        files: ['**/*.js'],
        plugins: { js },
        extends: ['js/recommended'],
        languageOptions: {
            sourceType: 'commonjs',
            globals: globals.node,
        },
        rules: {
            'no-unused-vars': 'warn',
            'no-empty': 'warn',
        },
    },

    // Files loaded by the HTML pages (renderer process)
    {
        files: ['renderer.js'],
        languageOptions: {
            sourceType: 'script',
            globals: globals.browser,
        },
    },

    // Loaded both by index.html (script tag) and by Node (require)
    {
        files: ['string_parser.js'],
        languageOptions: {
            globals: { ...globals.browser, ...globals.node },
        },
    },
])
