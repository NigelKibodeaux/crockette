/* eslint-env node */
'use strict'

const { app } = require('electron')
const fs = require('fs')
const https = require('https')
const path = require('path')
const log = require('electron-log')
const { spawnSync } = require('child_process')
const settings = require('./settings')

const bytes_to_read = 2048
const crockett_dir = path.join(app.getPath('appData'), 'Crockette', 'crockett')
log.info('crockett_dir', crockett_dir)
if (!fs.existsSync(crockett_dir)) fs.mkdirSync(crockett_dir)
const dir_contents = fs.readdirSync(crockett_dir).filter((i) => !i.startsWith('.'))
const crockett_installed = dir_contents.includes('Crockett.exe')
log.info('crockett_installed', crockett_installed)

const unzipper_dir = app.isPackaged ? process.resourcesPath : path.join(app.getAppPath(), 'unzipper')
const path_to_unzipper = path.join(unzipper_dir, 'unzipper.exe')

async function installOrUpdate() {
    // No Crockett. Get it.
    if (!crockett_installed) {
        return await replaceCrockett()
    }
    // Existing crockett. Update it?
    else {
        const exeDate = await getDateFromExe()
        const manifestDate = await getDateFromManifest()

        const threeHours = 180000
        const timeDiff = Math.abs(exeDate - manifestDate)

        log.info({ exeDate, manifestDate })

        if (timeDiff > threeHours) await replaceCrockett()
        else log.info('manifest and exe dates are close enough')
    }
}

// Unzips a file
function unzip(source, destination, password) {
    log.info('unzipping crockett')
    let result

    if (process.platform === 'darwin') {
        const monoPath = '/Library/Frameworks/Mono.framework/Versions/Current/Commands/mono'
        result = spawnSync(monoPath, [path_to_unzipper, source, destination, password])
    } else {
        result = spawnSync(path_to_unzipper, [source, destination, password])
    }

    if (result.status > 0) {
        log.error('Unzipper exit code ' + result.status)
        log.error(result.stderr.toString())
        throw new Error('Unzipper exit code ' + result.status)
    }

    log.info('crockett successfully installed')
}

// Reads date from the .exe
async function getDateFromExe() {
    return new Promise((resolve, reject) => {
        fs.open(path.join(crockett_dir, 'Crockett.exe'), 'r', function (status, fd) {
            if (status) {
                log.info(status.message)
                return
            }

            var buffer = Buffer.alloc(bytes_to_read)
            fs.read(fd, buffer, 0, bytes_to_read, 0, (err) => {
                if (err) return reject(err)

                var imageFileHeaderOffset = buffer.readInt32LE(60)

                var imageFileHeaderTimeDateStampOffset = 8
                var secondsSince1970 = buffer.readInt32LE(imageFileHeaderOffset + imageFileHeaderTimeDateStampOffset)

                resolve(new Date(secondsSince1970 * 1000))
            })
        })
    })
}

// Reads date from the manifest
async function getDateFromManifest() {
    return new Promise((resolve, reject) => {
        const url = `https://www.${settings.get('crockettDomain')}/crockett.zip.manifest`
        https
            .get(url, (res) => {
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
                res.on('data', (chunk) => {
                    rawData += chunk
                })
                res.on('end', () => {
                    const firstLine = rawData.split('\n')[0]
                    const numberString = firstLine.replace('BuildDate: ', '')
                    const hundredNanosecondsSinceZero = parseInt(numberString)
                    const hundredNanosecondsSince1970 = 621355968480000000
                    const timestamp = (hundredNanosecondsSinceZero - hundredNanosecondsSince1970) / 10000
                    resolve(new Date(timestamp))
                })
            })
            .on('error', reject)
    })
}

async function replaceCrockett() {
    // process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

    // TODO: handle errors
    return new Promise((resolve, reject) => {
        log.info('replacing crockett')
        const zip_path = path.join(crockett_dir, 'crockett.zip')

        // Download Crockett
        const url = `https://www.${settings.get('crockettDomain')}/crockett.zip`
        https
            .get(url, (response) => {
                const { statusCode } = response

                let error
                if (statusCode !== 200) {
                    error = new Error('Request Failed.\n' + `Status Code: ${statusCode}`)
                }
                if (error) {
                    reject(error)
                    // Consume response data to free up memory
                    response.resume()
                    return
                }
                const file = fs.createWriteStream(zip_path)
                response.pipe(file)

                response.on('end', () => {
                    file.end()

                    // Unzip Crockett to the crockett dir
                    try {
                        unzip(zip_path, crockett_dir, settings.get('crockettPassword'))
                        resolve()
                    } catch (err) {
                        reject(err)
                    }
                })
            })
            .on('error', reject)
    })
}

module.exports = installOrUpdate

/*
crockette auto-update
	if no crockett
		download and unzip
	else
		parse build date from exe
		download manifest
		if manfiest > build date
			download zip to file (temp directory, etc)
			download manifest to file (temp directory, etc)
			run existing crockett.exe VerifyUpdate manifest-file zip-file
			if crockett.exe exit code == 0 (success)
				unzip
			else
                ignore update, use what you got
*/
