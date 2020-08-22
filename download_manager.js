/* eslint-env node */
'use strict'


const path = require('path')
const {spawn} = require('child_process')
const {EventEmitter} = require('events')
const string_parser = require('./string_parser')
const settings = require('./settings')
const fs = require('fs')


const eventEmitter = new EventEmitter();
const downloads = new Map()
const colors = [
    'royalblue',
    'orangered',
    'green',
    'pink',
    'chocolate',
    'orange',
    'purple',
    'magenta',
    'red',
    'blue',
    'gold',
]

let colorIndex = 0
function getNextColor() {
    if (colorIndex === colors.length) colorIndex = 0

    return colors[colorIndex++]
}



// Function to start a download
function startDownload(params) {
    const id = [params.network, params.channel, params.user, params.pack].join(' ')
    downloads.set(id, {
        progress: 0,
        complete: false,
        started: false,
        stopped: false,
        childProcess: null,
        color: getNextColor(),
    })

    if (process.platform === 'darwin') {
        downloads.get(id).childProcess = spawn(
            '/Library/Frameworks/Mono.framework/Versions/Current/Commands/mono',
            [
                path.join(__dirname, 'crockett', 'Crockett.exe'),
                'download',
                params.network,
                params.channel,
                params.user,
                params.pack,
                "", // expected file name
                settings.get('downloadDirectory'),
            ]
        )
    }
    else {
        downloads.get(id).childProcess = spawn(
            path.join(__dirname, 'crockett', 'Crockett.exe'),
            [
                'download',
                params.network,
                params.channel,
                params.user,
                params.pack,
                "", // expected file name
                getDownloadDirectory(),
            ]
        )
        downloads.get(id).childProcess.unref()
    }

    // Update the ui with this download
    eventEmitter.emit('state-update')

    // Handle output from stdout
    downloads.get(id).childProcess.stdout.on('data', (data) => {
        const color = downloads.get(id).color
        eventEmitter.emit('stdout', data.toString().trim(), color)

        let updated = string_parser.updateDownloadFromInput(downloads.get(id), data.toString())
        if (updated) {
            eventEmitter.emit('state-update')
        }
    })

    // Handle output from stderr
    downloads.get(id).childProcess.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`.trim())
        const color = downloads.get(id).color
        console.log(`%cstderr: ${data.toString()}`.trim(), `color:${color}`)
    })

    // Handle process close
    downloads.get(id).childProcess.on('close', (code) => {
        console.log(`child process exited with code ${code}`)
        downloads.get(id).stopped = true
        eventEmitter.emit('state-update')
    })

    // Handle process error
    downloads.get(id).childProcess.on('error', (err) => {
        let message = `ERROR FROM "${id}":`
        console.log(message)
        console.log(err)
    })
}


// Stop a download. Remove it from the list if it's already stopped.
function stopDownload(id) {
    console.log('stopping:', id)
    const download = downloads.get(id)

    if (!download.stopped) {
        download.childProcess.kill()
    }
    else {
        downloads.delete(id)
        eventEmitter.emit('state-update')
    }
}


// Stop all downloads
function stopAllDownloads() {
    for (const [id] of downloads) {
        stopDownload(id)
    }
}


module.exports = {
    startDownload,
    stopDownload,
    eventEmitter,
    downloads,
    stopAllDownloads,
}
