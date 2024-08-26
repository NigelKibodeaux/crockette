// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const $ = document.getElementById.bind(document)

// Send a message to get the stored download directory
window.electronAPI.send('get-download-directory')

// Handle download directory set event (also used to set the initial value)
window.electronAPI.on('download-directory-set', (event, directory) => {
    $('downloadDirectory').innerText = directory
})

// Handle state update event
window.electronAPI.on('state-update', (_event, downloads) => {
    let output = ''
    for (const [id, download] of downloads) {
        let network = id.split(' ')[0]
        let status = ''
        if (download.started) status = 'started'
        if (download.complete) status = 'complete'
        if (download.stopped) status = 'stopped'

        output +=
            `<div class="filename">🖥  &nbsp; ${network} &nbsp; &nbsp; 🎥  &nbsp; ${
                download.filename || 'awaiting filename...'
            } ` +
            `<span onclick="stopDownload('${id}')" style="cursor: pointer"> &nbsp; &nbsp; 🚫</span>` +
            `</div>` +
            `<div>${download.progress || 0}% - ${status} - ${download.speed || '?'}kB/s</div>` +
            `<div class="progress-container">` +
            `<div class="progress-bar" style="width:${download.progress || 0}%"></div>` +
            `</div>`
    }
    $('charts').innerHTML = output
})

// Handle a browser link click event from the main process
window.electronAPI.on('link-clicked', (_event, { url, trigger }) => {
    $('linkElement').value = url
    $('messageElement').value = trigger
})

// Handle clicks of the download button
$('form').onsubmit = function () {
    let linkObj
    let messageObj
    try {
        linkObj = window.parseLink($('linkElement').value)
    } catch (e) {
        alert('could not parse link')
    }
    try {
        messageObj = window.parseMessage($('messageElement').value)
    } catch (e) {
        alert('could not parse message')
    }

    let fileDownload = {
        network: linkObj.network,
        channel: linkObj.channel,
        user: messageObj.user,
        pack: messageObj.pack,
    }
    window.electronAPI.send('start-download', fileDownload)

    // Clear the inputs
    $('linkElement').value = ''
    $('messageElement').value = ''

    return false
}

// Handle logs button click
$('showLogs').onclick = () => window.electronAPI.send('show-logs')

// Handle clicking download directory button
$('selectDownloadDirectory').onclick = () => window.electronAPI.send('select-download-directory')

// Handle log events from the main process
window.electronAPI.on('log', (_event, { message, color }) => {
    console.log(`%c${message}`, `color:${color}`)
})

// Call this function to stop a download
// eslint-disable-next-line no-unused-vars
function stopDownload(id) {
    console.log('attempting to stop download:', id)
    window.electronAPI.send('kill-download', id)
    return false
}
