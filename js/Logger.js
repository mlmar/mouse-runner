const LOGGING_LEVEL = 3;

export function log() {
    if(LOGGING_LEVEL >= 1 ) {
        console.log(...arguments);
    }
    return arguments;
}

export function warn() {
    if(LOGGING_LEVEL >= 2 ) {
        console.warn(...arguments);
    }
    return arguments;
}

export function error() {
    if(LOGGING_LEVEL >= 3 ) {
        console.error(...arguments);
    }
    return arguments;
}