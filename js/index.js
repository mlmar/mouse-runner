import Logger from './Logger.js';
import { createGameController } from './GameController.js';
import { createLoopController } from './LoopController.js';
import Events from './Events.js';

window.addEventListener(Events.DOM_CONTENT_LOADED, function() {
    Logger.log('DOM fully loaded and parsed');

    const canvas = document.querySelector('#canvas-main');
    const gameController = createGameController({ canvas });
    gameController.start();
    
    const labelElement = document.querySelector('#label-score');
    const gameLoop = createLoopController((state) => {
        gameController.renderBackground();
        gameController.updateEntities(state.tickSpeed);

        const { inProgress, score, targetColor } = gameController.get();
        canvas.style.outline = `.1em solid ${targetColor}`;

        labelElement.style.color = targetColor;
        labelElement.querySelector('span').innerText = score;

        if(!inProgress) {
            gameLoop.stop();
        }
    });
    gameLoop.start();
});