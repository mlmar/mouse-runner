import { warn } from './Logger.js';

const DEFAULT_STATE = {
    scale: 15,
    width: 500,
    height: 500,
    backgroundColor: 'black',
}

export function createCanvas(canvas, props) {
    const _ctx = canvas.getContext('2d');
    
    let _state = {
        ...DEFAULT_STATE,
        ...props
    }

    function drawCircle(props) {
        if(!props) {
            return warn('Unable to draw null item');
        }
        let { x, y, radius, fill = 'black', stroke, strokeWidth, marker = true } = props;
        const origX = x;
        const origY = y;
        
        scale();
        _ctx.beginPath()
        _ctx.arc(x, y, radius, 0, 2 * Math.PI, false);

        if(fill) {
            _ctx.fillStyle = fill
            _ctx.fill()
        }

        if(stroke) {
            _ctx.lineWidth = strokeWidth
            _ctx.strokeStyle = stroke
            _ctx.stroke()
        }

        resetScale();

        if(marker) {
            _ctx.fillStyle = 'red';
            _ctx.fillRect(origX * _state.scale - 1, origY * _state.scale - 1, 3, 3);
        }
    }

    function scale() {
        _ctx.setTransform(_state.scale, 0, 0, _state.scale, 0, 0);
    }

    function resetScale() {
        _ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    function refresh() {
        canvas.width = _state.width * _state.scale;
        canvas.height = _state.height * _state.scale;
    }
    refresh();

    return {
        drawCircle,
        scale
    }
}