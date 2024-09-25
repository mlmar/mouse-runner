import { log } from './Logger.js';
import { createGameController } from './GameController.js';
import { createCanvas } from './canvas.js';
import { createEntityController } from './EntityController.js';
import { createLoop } from './Looper.js';
import { random } from './Util.js';

const EVENTS = {
    DOM_CONTENT_LOADED: 'DOMContentLoaded'
}

const CANVAS_PROPS = {
    scale: 10,
    width: 60,
    height: 60
}

const BACKGROUND = {
    x: 0,
    y: 0,
    width: CANVAS_PROPS.width,
    height: CANVAS_PROPS.height,
    fill: 'black',
    alpha: .05
}

const colors = ['red', 'green', 'blue', 'yellow'];

window.addEventListener(EVENTS.DOM_CONTENT_LOADED, function() {
    log('DOM fully loaded and parsed');

    const canvas = createCanvas(document.querySelector('#canvas-main'), CANVAS_PROPS);
    
    const entityController = createEntityController();
    for(let i = 0; i < 4; i++) {
        const color = colors[i];
        entityController.add({ radius: 2, color, speed: .7 });
    }

    const gameController = createGameController({ canvas, entityController });

    const gameLoop = createLoop((state) => {
        canvas.drawRect(BACKGROUND);
        gameController.updateEntities(state.tickSpeed);
    });
    gameLoop.start();
});


