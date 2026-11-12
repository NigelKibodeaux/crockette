const { FusesPlugin } = require('@electron-forge/plugin-fuses')
const { FuseV1Options, FuseVersion } = require('@electron/fuses')
const { execFileSync } = require('child_process')
const path = require('path')

module.exports = {
    packagerConfig: {
        asar: true,
        extraResource: ['unzipper/SharpCompress.dll', 'unzipper/Unzipper.cs', 'unzipper/unzipper.exe'],
    },
    rebuildConfig: {},
    hooks: {
        // Packaging edits Info.plist and flips fuses, which invalidates Electron's
        // ad-hoc signature. Re-sign the whole bundle (ad-hoc) so macOS accepts it.
        postPackage: async (_forgeConfig, { platform, outputPaths }) => {
            if (platform !== 'darwin') return
            for (const outputPath of outputPaths) {
                const appPath = path.join(outputPath, 'Crockette.app')
                execFileSync('codesign', ['--force', '--deep', '--sign', '-', appPath], { stdio: 'inherit' })
            }
        },
    },
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            config: {
                name: 'crockette',
                authors: 'Nigel Kibodeaux',
                exe: 'crockette.exe',
                setupExe: 'CrocketteInstaller.exe',
            },
        },
        {
            name: '@electron-forge/maker-zip',
            platforms: ['darwin'],
        },
        {
            name: '@electron-forge/maker-deb',
            config: {},
        },
        {
            name: '@electron-forge/maker-rpm',
            config: {},
        },
    ],
    plugins: [
        {
            name: '@electron-forge/plugin-auto-unpack-natives',
            config: {},
        },
        // Fuses are used to enable/disable various Electron functionality
        // at package time, before code signing the application
        new FusesPlugin({
            version: FuseVersion.V1,
            [FuseV1Options.RunAsNode]: false,
            [FuseV1Options.EnableCookieEncryption]: true,
            [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
            [FuseV1Options.EnableNodeCliInspectArguments]: false,
            [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
            [FuseV1Options.OnlyLoadAppFromAsar]: true,
        }),
    ],
}
