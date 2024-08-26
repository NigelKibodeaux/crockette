'use strict'

const https = require('https')
const { dialog } = require('electron')
const current_version = require('./package.json').version

async function updateIsAvailable() {
    // Determine version available on github
    const latest_version = await getLatestVersion()

    return latest_version > current_version
}

async function getLatestVersion() {
    const res = await fetch('https://api.github.com/repos/NigelKibodeaux/crockette/releases/latest', {
        headers: { 'User-Agent': 'NigelKibodeaux' },
    })
    if (!res.ok) {
        throw new Error('Request Failed.\n' + `Status Code: ${res.status}`)
    }
    return await res.json().tag_name
}

module.exports = updateIsAvailable
