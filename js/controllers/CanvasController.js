import El from '../util/El.js';
import Logger from '../util/Logger.js';
import Events from '../globals/Events.js';

const DEFAULT_STATE = {
    scale: 1,
    absoluteWidth: 500,
    absoluteHeight: 500,
    width: 0,
    height: 0,
    backgroundColor: 'black',
}

export function createCanvasController(canvas, props) {
    const _ctx = canvas.getContext('2d');
    
    let _state = {
        ...DEFAULT_STATE,
        ...props
    }

    function get() {
        return _state;
    }

    function getCanvas() {
        return canvas;
    }

    function drawCircle(props) {
        if(!props) {
            return Logger.warn('Unable to draw null item');
        }
        let { x, y, radius, fill = 'black', stroke, strokeWidth, marker = false, alpha = 1 } = props;
        x *= _state.scale;
        y *= _state.scale;
        radius *= _state.scale;
        
        _ctx.globalAlpha = alpha;
        _ctx.beginPath();
        _ctx.arc(x, y, radius, 0, 2 * Math.PI, false);

        if(fill) {
            _ctx.fillStyle = fill;
            _ctx.fill();
        }

        if(stroke) {
            _ctx.lineWidth = strokeWidth;
            _ctx.strokeStyle = stroke;
            _ctx.stroke()
        }

        _ctx.globalAlpha = 1;
        if(marker) {
            drawCircle({ x, y, radius: 1, fill: 'red' });
        }
    }

    function drawRect(props) {
        if(!props) {
            return warn('Unable to draw null item');
        }
        let { x, y, width, height, fill = 'black', alpha = 1 } = props;
        x *= _state.scale;
        y *= _state.scale;
        width *= _state.scale;
        height *= _state.scale;
        _ctx.globalAlpha = alpha;

        _ctx.fillStyle = fill;
        _ctx.fillRect(x, y, width, height);
        _ctx.globalAlpha = 1;
    }

    function clear() {
        drawRect({
            x: 0,
            y: 0,
            width: _state.width,
            height: _state.height,
            fill: _state.backgroundColor
        });
    }

    function refresh() {
        if(props.fitToParent) {
            const parent = El.parent(canvas);
            let { width, height } = El.bounds(parent);
            width -= parent.clientLeft * 2;
            height -= parent.clientTop * 2;
            _state.width = width / _state.scale;
            _state.height = height / _state.scale;
            canvas.width = _state.absoluteWidth = width;
            canvas.height = _state.absoluteHeight = height;
        } else {
            _state.width = _state.absoluteWidth / _state.scale;
            _state.height = _state.absoluteHeight / _state.scale;
            canvas.width = _state.absoluteWidth;
            canvas.height = _state.absoluteHeight;
        }

        El.css(canvas, {
            width: _state.absoluteWidth + 'px',
            height: _state.absoluteHeight + 'px',
        });
    }

    function setSize({ width, height }) {
        _state.width = width;
        _state.height = height;
        refresh();
    }

    if(props.fitToParent) {
        El.on(window, Events.RESIZE, () => {
            refresh();
        });
    }

    refresh();
    return {
        get,
        getCanvas,
        drawCircle,
        drawRect,
        refresh,
        setSize,
        clear
    }
}