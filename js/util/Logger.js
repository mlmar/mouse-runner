const LOGGING_LEVEL = 3;

function log() {
    if(LOGGING_LEVEL >= 1 ) {
        console.log(...arguments);
    }
    return arguments;
}

function warn() {
    if(LOGGING_LEVEL >= 2 ) {
        console.warn(...arguments);
    }
    return arguments;
}

function error() {
    if(LOGGING_LEVEL >= 3 ) {
        console.error(...arguments);
    }
    return arguments;
}

export default {
    log,
    warn,
    error
}