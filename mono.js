const { execSync } = require('child_process')
let cachedMonoPath = null

function getMonoPath() {
    if (cachedMonoPath) return cachedMonoPath

    const candidates = []
    // Try 'which mono'
    try {
        const whichMono = execSync('which mono').toString().trim()
        if (whichMono) candidates.push(whichMono)
    } catch {}

    // Try Homebrew locations
    candidates.push('/opt/homebrew/bin/mono')
    candidates.push('/usr/local/bin/mono')

    // Try official package installer location
    candidates.push('/Library/Frameworks/Mono.framework/Versions/Current/Commands/mono')

    for (const monoPath of candidates) {
        try {
            execSync(`${monoPath} --version`)
            cachedMonoPath = monoPath
            return cachedMonoPath
        } catch {}
    }

    throw new Error('Mono not found. Please install Mono and ensure it is in your PATH.')
}

module.exports = { getMonoPath }
