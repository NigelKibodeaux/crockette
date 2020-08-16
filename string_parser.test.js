const sp = require('./string_parser')
const assert = require('assert')

const x = `
2020-08-02 00:02:35,728 [[TF]-[XXXDAYS]] DEBUG IrcClient - File transfer started: [TF]-[XXXDAYS] - Star.Wars.-.Age.Of.Republic.-.General.Grievous.(2019).(Comic).(Kileko-Empire).rar
2016-12-01 00:19:41,014 [[MG]-TV|US|S|Llet] DEBUG IrcClient - [5%] irc.abjects.net #moviegods [mg]-tv|us|s|llet #181 Westworld.S01E07.HDTV.x264-KILLERS.mkv 290M [xdcc.eu]
2016-12-01 00:19:43,595 [Threadpool worker] DEBUG WebServer - HTTP GET /index.html
2016-12-01 00:19:43,595 [WebServer] DEBUG WebServer - Incoming http request received
2016-12-01 00:19:43,595 [Threadpool worker] DEBUG WebServer - fullFilePath: /Users/nigel/Documents/Crockett/webroot/index.html
2016-12-01 00:19:43,595 [WebServer] DEBUG WebServer - BeginGetContext()
2016-12-01 00:19:43,595 [WebServer] DEBUG WebServer - Waiting on events
2016-12-01 00:19:45,833 [[MG]-TV|US|S|Llet] DEBUG IrcClient - [10%] irc.abjects.net #moviegods [mg]-tv|us|s|llet #181 Westworld.S01E07.HDTV.x264-KILLERS.mkv 290M [xdcc.eu]
2016-12-01 00:19:50,015 [Controller] INFO  PackQueue - Added to queue: irc.scenep2p.net #the.source ts-tv|fr|p|16789 #38 Westworld.S01E07.HDTV.x264-KILLERS.mkv 290 MB [xweasel.org]
2016-12-01 00:19:50,016 [Controller] INFO  PackQueue - Added to queue: irc.iarec.net #ultra-warez ultra-wabbit #466 Westworld.S01E07.HDTV.x264-KILLERS.mkv 290 MB [xweasel.org]
2016-12-01 00:19:50,016 [Controller] INFO  PackQueue - Added to queue: irc.criten.net #elitewarez [ewg]-r0x77 #179 Westworld.S01E07.HDTV.x264-KILLERS.tar 290 MB [xweasel.org]
2016-12-01 00:19:50,016 [Controller] INFO  PackQueue - Added to queue: irc.scenep2p.net #the.source ts-archive|jp|p|24151 #181 Westworld.S01E07.HDTV.x264-KILLERS.mkv 290 MB [xweasel.org]
2016-12-01 00:19:50,017 [Controller] INFO  PackQueue - Added to queue: irc.abjects.net #[rm]rolys-movies [rm]rolys-movies-tv #265 Westworld.S01E07.HDTV.x264-KILLERS.mkv 290 MB [xweasel.org]
2016-12-01 00:19:50,017 [Controller] INFO  PackQueue - Added to queue: irc.abjects.net #[rm]rolys-movies [rm]rolys-movies-gige2 #1420 Westworld.S01E07.HDTV.x264-KILLERS.mkv 290 MB [xweasel.org]
2016-12-01 00:19:50,017 [Controller] INFO  PackQueue - Added to queue: irc.abjects.net #[rm]rolys-movies [rm]rolys-movies-tv20 #272 Westworld.S01E07.HDTV.x264-KILLERS.mkv 290 MB [xweasel.org]
2016-12-01 00:19:50,018 [Controller] INFO  PackQueue - Added to queue: irc.abjects.net #beast-xdcc beast-cj-ovh3 #141 Westworld.S01E07.HDTV.x264-KILLERS.tar 290 MB [xweasel.org]
2016-12-01 00:19:50,216 [[MG]-TV|US|S|Llet] DEBUG IrcClient - [15%] irc.abjects.net #moviegods [mg]-tv|us|s|llet #181 Westworld.S01E07.HDTV.x264-KILLERS.mkv 290M [xdcc.eu]
`

let expected = {
    started: true,
    progress: '15',
    filename: 'Star.Wars.-.Age.Of.Republic.-.General.Grievous.(2019).(Comic).(Kileko-Empire).rar',
}
let downloads = {}
sp.updateDownloadFromInput(downloads, x)
assert.deepEqual(downloads, expected)

// with port
let input = 'irc://irc.abjects.net:6667/moviegods'
expected = {
    network: 'irc.abjects.net',
    channel: '#moviegods',
}
assert.deepEqual(sp.parseLink(input), expected)

// without port
input = 'irc://irc.abjects.net/moviegods'
expected = {
    network: 'irc.abjects.net',
    channel: '#moviegods',
}
assert.deepEqual(sp.parseLink(input), expected)

console.log('........ TESTS PASSED! ........')
