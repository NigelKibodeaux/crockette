/* eslint-env node */
'use strict'

const {app} = require('electron')
const Store = require('electron-store')


const settings = new Store({
    defaults: {
        downloadDirectory: app.getPath('downloads'),
        crockettDomain: null,
        crockettPassword: null,
    }
})


module.exports = settings
