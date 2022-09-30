const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    showLogs: () => ipcRenderer.send('show-logs'),

    authUpdated: ({ domain, password }) => ipcRenderer.send('authUpdated', { domain, password }),

    startDownload: ({ network, channel, user, pack }) => ipcRenderer.send('start-download', { network, channel, user, pack }),

    selectDownloadDirectory: () => ipcRenderer.send('select-download-directory'),

    getDownloadDirectory: () => ipcRenderer.send('getSetting', 'downloadDirectory'),

    killDownload: (id) => ipcRenderer.send('kill-download', id),

    onStateUpdate: (callback) => ipcRenderer.on('state-update', callback),

    onLinkClicked: (callback) => ipcRenderer.on('link-clicked', callback),

    onLog: (callback) => ipcRenderer.on('log', callback),

    onDownloadDirectorySet: (callback) => ipcRenderer.on('download-directory-set', callback),
})
