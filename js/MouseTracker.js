import El from './El.js';
import Events from './Events.js'
import Logger from './Logger.js';
import VectorUtil from './VectorUtil.js';

export function createMouseTracker({ el, scale = 1, onClick, parent = document }) {
    const _state = {
        absolutePosition: VectorUtil.create(),
        position: VectorUtil.create(), // relative position
        isDown: false,
        isOver: false,
        lastClick: null
    }
    
    // event listeners
    const listeners = {
        [Events.MOUSE_MOVE]: (event) => {
            _state.absolutePosition.x = event.pageX;
            _state.absolutePosition.y = event.pageY;
            refreshIsOver();
            updateRelativePosition();
        },
        [Events.MOUSE_DOWN]: (event) => {
            if(event.button === 0) {
                _state.isDown = true;
                if(!_state.lastClick) {
                    _state.lastClick = performance.now();
                    onClick && onClick(_state)
                }
            }
        },
        [Events.MOUSE_UP]: () => {
            _state.isDown = false;
            _state.lastClick = null;
        },
        [Events.CONTEXT_MENU]: (event) => {
            event.preventDefault();
        },
    }
    const events = [Events.MOUSE_MOVE, Events.MOUSE_DOWN, Events.MOUSE_UP, Events.CONTEXT_MENU];
    
    function addEventListeners() {
        Logger.log('Adding listeners to parent', parent);
        events.forEach((event) => El.on(parent, event, listeners[event]));
    }

    function removeEventListeners() {
        Logger.log('Removing listeners listeners from parent', parent);
        events.forEach((event) => El.off(parent, event, listeners[event]));
    }

    function updateRelativePosition() {
        const { top, left } = el.getBoundingClientRect();
        const translatedPostion = VectorUtil.sub(_state.absolutePosition, { x: left, y: top });
        _state.position.x = translatedPostion.x / scale;
        _state.position.y = translatedPostion.y / scale;
    }

    function refreshIsOver() {
        _state.isOver = el.matches(':hover');
    }

    function start() {
        refreshIsOver();
        removeEventListeners();
        addEventListeners();
    }

    function stop() {
        removeEventListeners();
    }

    function get() {
        return _state;
    }
    
    return {
        get,
        start,
        stop
    }
}