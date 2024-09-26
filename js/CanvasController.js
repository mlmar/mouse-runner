import Logger from './Logger.js';

const DEFAULT_STATE = {
    scale: 1,
    width: 500,
    height: 500,
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
        let { x, y, radius, fill = 'black', stroke, strokeWidth, marker = false, alpha = 1} = props;
        const origX = x;
        const origY = y;
        
        scale();
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
        resetScale();

        if(marker) {
            _ctx.fillStyle = 'red';
            _ctx.fillRect(origX * _state.scale - 1, origY * _state.scale - 1, 3, 3);
        }
    }

    function drawRect(props) {
        if(!props) {
            return warn('Unable to draw null item');
        }
        let { x, y, width, height, fill = 'black', alpha = 1 } = props;
        scale();
        _ctx.globalAlpha = alpha;

        _ctx.fillStyle = fill;
        _ctx.fillRect(x, y, width, height);

        _ctx.globalAlpha = 1;
        resetScale();
    }

    function scale() {
        _ctx.setTransform(_state.scale, 0, 0, _state.scale, 0, 0);
    }

    function resetScale() {
        _ctx.setTransform(1, 0, 0, 1, 0, 0);
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
        canvas.width = _state.width * _state.scale;
        canvas.height = _state.height * _state.scale;
        clear();
    }

    refresh();
    return {
        get,
        getCanvas,
        drawCircle,
        drawRect,
        refresh,
        clear
    }
}