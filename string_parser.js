'use strict'

const progress_regex = /DEBUG IrcClient - \[(.+)%\] (\S+) (\S+) (\S+) (\S+)/
const speed_regex = /DEBUG IrcClient - \[(.+) kB\/s\] (\S+) (\S+) (\S+) (\S+)/
const filename_regex = /DEBUG IrcClient - File transfer started: (\S+) - (\S+)/


// Make this run in the browser or in node
const outside_world = typeof(window) !== 'undefined' ? window : exports

/**
 * Updates the individual download object with the input.
 * Returns true if anything changed
 */
outside_world.updateDownloadFromInput = function(download, input) {
    let changed = false

    input.split('\n').forEach(line => {
        // Look for the filename
        let match = line.match(filename_regex)
        if (match) {
            download.filename = match[2]
            download.started = true
            changed = true
        }

        // Look for progress
        match = line.match(progress_regex)
        if (match) {
            download.progress = match[1]
            changed = true
        }

        // Look for speed
        match = line.match(speed_regex)
        if (match) {
            download.speed = match[1]
            changed = true
        }
    })

    return changed
}

outside_world.parseLink = function parseLink(input) {
    const link_regex = /irc:\/\/([^/]+)\/([^/]+)/
    let matches = input.match(link_regex)
    let network = matches[1]

    return {
        network: network.split(':')[0],
        channel: '#' + matches[2]
    }
}

outside_world.parseMessage = function parseMessage(input) {
    const message_regex = /\/msg (\S+) xdcc send #(\S+)/
    let matches = input.match(message_regex)

    return {
        user: matches[1],
        pack: matches[2],
    }
}
