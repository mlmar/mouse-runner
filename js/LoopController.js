import  Logger from './Logger.js';

const DEFAULT_STATE = {
    id: null,
    inProgress: false,
    tickSpeedMultiplier: 5,
    tickSpeed: 0,
    lastRender: 0,
    elapsed: 0,
}

/**
 * @returns Default loop object
 */
export function createLoopController(callback) {
    let _currentLoop = null;

    let _state = {
        ...DEFAULT_STATE
    }

    function start() {
        if(_state.inProgress) {
            return error('loop already in progress');
        }
        
        if(!(callback instanceof Function)) {
            return error('Provided callback is not a function');
        }
        
        Logger.log('Starting loop', _state.id)
        _state.id = crypto.randomUUID();
        _state.inProgress = true;
        _state.lastRender = 0;
        _currentLoop = window.requestAnimationFrame(handleLoop)
    }

    function stop() {
        Logger.log('Ending loop', _state.id)
        window.cancelAnimationFrame(_currentLoop);
        _state.inProgress = false;
        _state = {
            ...DEFAULT_STATE
        }
    }

    function handleLoop(time) {
        if(_state.lastRender === 0) {
            _state.lastRender = time;
        }
      
        _state.time = time;
        _state.elapsed = _state.time - _state.lastRender;
        _state.tickSpeed = _state.elapsed / _state.tickSpeedMultiplier;
        callback(_state);
        _state.lastRender = _state.time;
      
        if(_state.inProgress) {
            _currentLoop = window.requestAnimationFrame(handleLoop)
        }
    }

    return {
        inProgress: false,
        elapsed: 0,
        lastRender: 0,
        start,
        stop
    }
}