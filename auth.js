const ipc = window.ipcRenderer
const $ = document.getElementById.bind(document)


$('form').onsubmit = () => {
    const domain = $('domainInput').value
    const password = $('passwordInput').value

    window.electronAPI.authUpdated({domain, password})
        .catch(alert)

    return false
}
