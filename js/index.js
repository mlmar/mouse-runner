import Logger from './Logger.js';
import { createGameController } from './GameController.js';
import { createLoopController } from './LoopController.js';
import Events from './Events.js';

window.addEventListener(Events.DOM_CONTENT_LOADED, function() {
    Logger.log('DOM fully loaded and parsed');

    const canvas = document.querySelector('#canvas-main');
    const gameController = createGameController({ canvas });
    
    const labelElement = document.querySelector('#label-score');
    const gameLoop = createLoopController((state) => {
        gameController.update(state.tickSpeed);

        const { inProgress, score, targetColor } = gameController.get();
        canvas.style.outline = `.3em solid ${targetColor}`;

        labelElement.style.color = targetColor;
        labelElement.querySelector('span').innerText = score;

        if(!inProgress) {
            stopGame();
        }
    });

    function startGame() {
        setTimeout(() => toggleMenu(false), 10);
        gameController.start();
        gameLoop.start();
    }

    function stopGame() {
        gameController.stop();
        gameLoop.stop();
        setTimeout(() => toggleMenu(true), 10);
    }

    function toggleMenu(show) {
        const menu = document.querySelector('.menu');
        if(show) {
            menu.style.display = '';
            canvas.style.cursor = '';
            document.addEventListener(Events.MOUSE_DOWN, startGame)
        } else {
            menu.style.display = 'none';
            canvas.style.cursor = 'none';
            document.removeEventListener(Events.MOUSE_DOWN, startGame)
        }
    }
    toggleMenu(true);
});

