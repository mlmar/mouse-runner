import Logger from './Logger.js';
import El from './El.js';
import { createGameController } from './GameController.js';
import { createLoopController } from './LoopController.js';
import { createScoreTracker } from './ScoreTracker.js';
import { createLeaderboard } from './Leaderboard.js';
import Events from './Events.js';

window.addEventListener(Events.DOM_CONTENT_LOADED, function() {
    Logger.log('DOM fully loaded and parsed');
    const canvasElement = El.find('#canvas-main');
    const scoreElement = El.find('#label-score');
    const highScoreElement = El.find('#label-high-score');
    const shareElement = El.find("#button-share");
    const startElement = El.find('#label-start');

    const leaderboardElement = El.find('#leaderboard');
    const leaderboard = createLeaderboard(leaderboardElement);
    El.on(leaderboardElement, Events.MOUSE_DOWN, event => event.stopPropagation());

    const elementsToColor = El.findAll('.color');
    const bordersToColor = El.findAll('.border-color');
    function colorElements(color) {
        elementsToColor.forEach(el => El.css(el, { color }))
        bordersToColor.forEach(el => El.css(el, { borderColor: color }));
    }
    colorElements('white');
    
    const scoreTracker = createScoreTracker();
    El.text(El.findChild(highScoreElement, 'span'), scoreTracker.get().highScore);
    El.on(shareElement, Events.MOUSE_DOWN, handleOpenLeaderboard);

    const gameController = createGameController({ canvas: canvasElement });
    const gameLoop = createLoopController((state) => {
        gameController.update(state.tickSpeed);

        const { inProgress, score, targetColor } = gameController.get();
        scoreTracker.set(score);
        colorElements(targetColor);
        El.css(scoreElement, { color: targetColor });
        El.text(El.findChild(scoreElement, 'span'), score);
        
        if(!inProgress) {
            El.text(El.findChild(highScoreElement, 'span'), scoreTracker.get().highScore);
            El.css(startElement, { color: targetColor });
            stopGame();
        }
    });

    function startGame() {
        setTimeout(() => toggleOverlay(false), 10);
        El.visible(leaderboardElement, false)
        gameController.start();
        gameLoop.start();
    }

    function stopGame() {
        gameController.stop();
        gameLoop.stop();
        setTimeout(() => toggleOverlay(true), 10);
    }

    toggleOverlay(true);
    function toggleOverlay(show) {
        El.visible(startElement, show);
        El.visible(highScoreElement, show);
        El.visible(shareElement, scoreTracker.get().highScore > 0);
        if(show) {
            El.css(canvasElement, { cursor: '' });
            El.on(document, Events.MOUSE_DOWN, startGame);
        } else {
            El.css(canvasElement, { cursor: 'none' });
            El.off(document, Events.MOUSE_DOWN, startGame);
        }
    }

    function handleOpenLeaderboard(event) {
        event.stopPropagation();
        El.visible(leaderboardElement, true);
        leaderboard.refresh();
    }
});