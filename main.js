/* eslint-env node */
'use strict'


// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, clipboard, dialog, shell} = require('electron')
const path = require('path')
const {execSync} = require('child_process')
const downloadManager = require('./download_manager')
const settings = require('./settings')
const updateCrockett = require('./update_crockett')
const crocketteUpdateIsAvailable = require('./update_crockette')


let mainWindow
let hasDomainAndPass = settings.get('crockettDomain') && settings.get('crockettPassword')


//#region Initialize

    // Make this app handle irc://... links
    let is_default_irc_app = app.setAsDefaultProtocolClient('irc')
    if (!is_default_irc_app) console.log('was not able to become the default IRC app')
    app.on("open-url", function(event, url) {
        console.log('this link was clicked:', url)

        if (mainWindow) {
            console.log('sending the clicked link to mainWindow.webContents')
            const trigger = clipboard.readText()
            mainWindow.webContents.send('link-clicked', {url, trigger})
        }
    });

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.whenReady().then(() => {
        // Create the browser window
        mainWindow = new BrowserWindow({
            width: 1200,
            height: 800,
            webPreferences: {
            preload: path.join(__dirname, 'preload.js')
            }
        })

        // and load the appropriate page
        if (hasDomainAndPass)
            mainWindow.loadFile('index.html')
        else
            mainWindow.loadFile('auth.html')

        // Open the DevTools.
        // mainWindow.webContents.openDevTools()
    })
    .then(() => {
        // Check that mono is installed on a mac.
        // This will throw an error if mono is not found.
        if (process.platform === 'darwin') {
            try {
                console.log(execSync('/Library/Frameworks/Mono.framework/Versions/Current/Commands/mono --version').toString())
            }
            catch (err) {
                dialog.showMessageBoxSync({
                    type: 'warning',
                    message: 'Downloads will not work. Install the latest version of mono and restart.',
                })
            }
        }
    })
    .then(async () => {
        // Update or install Crockett if need be
        if (hasDomainAndPass) await updateCrockett()
    })
    .then(async () => {
        const updateIsAvailable = await crocketteUpdateIsAvailable()

        if (updateIsAvailable) {
            const clicked_button_index = dialog.showMessageBoxSync({
                type: 'warning',
                message: 'Download the latest version of Crockette',
                buttons: ['Remind me next time', 'Now'], // these show up reversed
            })

            if (clicked_button_index === 1)
                shell.openExternal('https://github.com/NigelKibodeaux/crockette/releases')
        }
        else {
            console.log('You have the latest version of Crockette')
        }
    })
    // .catch(console.log) // TODO: handle errors somehow?

    // Quit when all windows are closed.
    app.on('window-all-closed', () => app.quit())

    // Stop all downloads before the app quits
    app.on('before-quit', () => downloadManager.stopAllDownloads())

//#endregion



//#region Handle events from the render process

    ipcMain.handle('authUpdated', (event, {domain, password}) => {
        settings.set('crockettDomain', domain)
        settings.set('crockettPassword', password)

        updateCrockett()
            .then(() => mainWindow.loadFile('index.html'))
            .catch(err => {
                console.log(err)

                // Must not have been right. Clear it.
                settings.set('crockettDomain', null)
                settings.set('crockettPassword', null)

                // Let the user know
                dialog.showMessageBoxSync({
                    type: 'warning',
                    message: 'The domain and/or password was wrong.',
                })
            })
    })

    ipcMain.handle('getSetting', (event, key) => {
        return settings.get(key)
    })

    ipcMain.handle('setSetting', (event, key, value) => {
        return settings.set(key, value)
    })

    ipcMain.on('start-download', (event, arg) => {
        downloadManager.startDownload(arg)
    })

    ipcMain.on('kill-download', (event, id) => {
        console.log('received kill-download event')
        downloadManager.stopDownload(id)
    })

    ipcMain.on('show-logs', () => {
        mainWindow.webContents.toggleDevTools()
    })

    ipcMain.on('select-download-directory', () => {
        const options = {
            properties: ['openDirectory', 'createDirectory'],
            buttonLabel: 'Select',
        }
        const selection = dialog.showOpenDialogSync(mainWindow, options)

        if (selection) {
            const directory = selection[0]

            // save it to settings.json
            settings.set('downloadDirectory', directory)

            // alert the render process
            mainWindow.webContents.send('download-directory-set', directory)
        }
    })

//#endregion



//#region Handle events from the download manager

    downloadManager.eventEmitter.on('state-update', () => {
        if (mainWindow.isDestroyed()) return
        mainWindow.webContents.send('state-update', sanitizeDownloads(downloadManager.downloads))
    })

    downloadManager.eventEmitter.on('stdout', (message, color) => {
        if (mainWindow.isDestroyed()) return
        mainWindow.webContents.send('log', ({message, color}))
    })

//#endregion




//#region Helpers

    // Convert downloads map to an object the frontend can use to update the display
    function sanitizeDownloads(downloads) {
        const sanitizedMap = new Map()

        for (const [key, value] of downloads.entries()) {
            sanitizedMap.set(key, { ...value, childProcess: null })
        }

        return sanitizedMap
    }

//#endregion
