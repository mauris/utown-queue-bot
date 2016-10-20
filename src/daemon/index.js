const child_process = require('child_process');

child_process.fork('src/daemon/waitingTimeUpdater.js');
child_process.fork('src/daemon/groupMatcher.js');
