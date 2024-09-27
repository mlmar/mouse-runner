import Logger from './Logger.js';
import El from './El.js';
import { createGameController } from './GameController.js';
import { createLoopController } from './LoopController.js';
import Events from './Events.js';

window.addEventListener(Events.DOM_CONTENT_LOADED, function() {
    Logger.log('DOM fully loaded and parsed');
    const appElement = El.find('#app');
    const canvasElement = El.find('#canvas-main');
    const scoreElement = El.find('#label-score');
    const menuElement = El.find('#menu');

    const gameController = createGameController({ canvas: canvasElement });
    const gameLoop = createLoopController((state) => {
        gameController.update(state.tickSpeed);

        const { inProgress, score, targetColor } = gameController.get();
        El.css(appElement, { border: `.8em solid ${targetColor}` });
        El.css(scoreElement, { color: targetColor });

        if(!inProgress) {
            El.findChild(scoreElement, 'span').innerText = score;
            El.css(menuElement, { color: targetColor });
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
        toggleVisible(menuElement, show);
        // toggleVisible(scoreElement, show);
        if(show) {
            El.css(canvasElement, { cursor: '' });
            El.on(document, Events.MOUSE_DOWN, startGame);
        } else {
            El.css(canvasElement, { cursor: 'none' });
            El.off(document, Events.MOUSE_DOWN, startGame);
        }
    }
    toggleMenu(true);
});

function toggleVisible(el, show) {
    el.style.display = show ? '' : 'none';
}