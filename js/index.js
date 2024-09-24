import { log } from './Logger.js';
import { createCanvas } from './canvas.js';
import { createEntityController } from './EntityController.js';
import { createLoop } from './Looper.js';

const EVENTS = {
    DOM_CONTENT_LOADED: 'DOMContentLoaded'
}

window.addEventListener(EVENTS.DOM_CONTENT_LOADED, function() {
    log('DOM fully loaded and parsed');
    
    const canvas = createCanvas(document.querySelector('#canvas-main'), {
        scale: 5,
        width: 100,
        height: 100
    });
    
    const entityController = createEntityController();
    entityController.add({
        x: 50, y: 14, radius: 2, fill: 'black'
    });

    entityController.add({
        x: 13, y: 17, radius: 2, fill: 'blue'
    });
    
    const gameLoop = createLoop((state) => {
        const entities = entityController.getAll();
        entities.forEach(canvas.drawCircle);
    });
    gameLoop.start();
});