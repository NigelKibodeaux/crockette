'use strict'

const https = require('https')
const {dialog} = require('electron')
const current_version = require('./package.json').version


async function updateIsAvailable() {
    // Determine version available on github
    const latest_version = await getLatestVersion()

    return latest_version > current_version

    // Download the new version

    // Unzip it

    // Replace files
}


async function getLatestVersion() {
    return new Promise((resolve, reject) => {
        const url = 'https://api.github.com/repos/NigelKibodeaux/crockette/releases/latest'
        const options = { headers: { 'User-Agent': 'NigelKibodeaux' } }
        https.get(url, options, res => {
            const { statusCode } = res

            let error
            if (statusCode !== 200) {
                error = new Error('Request Failed.\n' + `Status Code: ${statusCode}`)
            }
            if (error) {
                reject(error)
                // Consume response data to free up memory
                res.resume()
                return
            }

            res.setEncoding('utf8')
            let rawData = ''
            res.on('data', (chunk) => { rawData += chunk })
            res.on('end', () => {
                const json = JSON.parse(rawData)
                resolve(json.tag_name)
            })
        })
        .on('error', reject)
    })
}



module.exports = updateIsAvailable
