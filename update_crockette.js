'use strict'

const current_version = require('./package.json').version

async function updateIsAvailable() {
    // Determine version available on github
    const latest_version = await getLatestVersion()

    return compareVersions(latest_version, current_version) > 0
}

// Compares versions like '1.10.0' and '1.9.0' numerically, part by part.
// Returns a positive number if a is newer, negative if b is newer, 0 if equal.
function compareVersions(a, b) {
    const partsA = String(a).replace(/^v/, '').split('.').map(Number)
    const partsB = String(b).replace(/^v/, '').split('.').map(Number)

    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
        const diff = (partsA[i] || 0) - (partsB[i] || 0)
        if (diff !== 0) return diff
    }

    return 0
}

async function getLatestVersion() {
    const res = await fetch('https://api.github.com/repos/NigelKibodeaux/crockette/releases/latest', {
        headers: { 'User-Agent': 'NigelKibodeaux' },
    })
    if (!res.ok) {
        throw new Error('Request Failed.\n' + `Status Code: ${res.status}`)
    }
    return (await res.json()).tag_name
}

module.exports = updateIsAvailable
