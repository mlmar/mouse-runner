import Logger from './util/Logger.js';
import El from './util/El.js';
import { createGameController } from './controllers/GameController.js';
import { createLoopController } from './controllers/LoopController.js';
import { createScoreTracker } from './controllers/ScoreTracker.js';
import { createLeaderboard } from './components/Leaderboard.js';
import Events from './globals/Events.js';

window.addEventListener(Events.DOM_CONTENT_LOADED, function() {
    Logger.log('DOM fully loaded and parsed');
    const canvasElement = El.find('#canvas-main');
    const scoreElement = El.find('#label-score');
    const livesElement = El.find('#label-lives');
    const highScoreElement = El.find('#label-high-score');
    const shareElement = El.find("#button-share");
    const startElement = El.find('#label-start');
    const creditsElement = El.find('#credits');
    El.on(creditsElement, Events.MOUSE_DOWN, event => event.stopPropagation())

    const leaderboardElement = El.find('#leaderboard');
    const leaderboard = createLeaderboard(leaderboardElement);

    const leaderboardCloseElement = El.find('#leaderboard #button-close');
    El.on(leaderboardCloseElement, Events.CLICK, closeLeaderboard);

    const elementsToColor = El.findAll('.color');
    const bordersToColor = El.findAll('.border-color');
    const backgroundsToColor = El.findAll('.background-color');
    function colorElements(color) {
        elementsToColor.forEach(el => El.css(el, { color }))
        bordersToColor.forEach(el => El.css(el, { borderColor: color }));
        backgroundsToColor.forEach(el => El.css(el, { backgroundColor: color }));
    }
    colorElements('white');
    
    const scoreTracker = createScoreTracker();
    El.text(El.findChild(highScoreElement, 'span'), scoreTracker.get().highScore);
    El.on(shareElement, Events.MOUSE_DOWN, openLeaderboard);

    const gameController = createGameController({ canvas: canvasElement });
    const gameLoop = createLoopController((state) => {
        gameController.update(state);

        const { inProgress, score, lives, borderColor } = gameController.get();
        scoreTracker.set(score);
        colorElements(borderColor);
        El.css(scoreElement, { color: borderColor });
        El.text(El.findChild(scoreElement, 'span'), score);
        El.text(El.findChild(livesElement, 'span'), lives);
        
        if(!inProgress) {
            El.text(El.findChild(highScoreElement, 'span'), scoreTracker.get().highScore);
            El.css(startElement, { color: borderColor });
            stopGame();
        }
    });

    // Start game on mouse down at main menu
    El.on(document, Events.MOUSE_DOWN, startGame);
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
        openLeaderboard();
    }

    toggleOverlay(true);
    function toggleOverlay(show) {
        El.visible(startElement, show);
        El.visible(livesElement, !show);
        El.visible(highScoreElement, show);
        El.visible(shareElement, show);
        El.visible(creditsElement, show);
        if(show) {
            El.css(canvasElement, { cursor: '' });
        } else {
            El.css(canvasElement, { cursor: 'none' });
            El.off(document, Events.MOUSE_DOWN, startGame);
        }
    }

    // Opens leaderboard, disable game start on mousedown
    function openLeaderboard(event) {
        event && event.stopPropagation();
        El.visible(leaderboardElement, true);
        El.on(leaderboardElement, Events.MOUSE_DOWN, event => event.stopPropagation());
        El.on(document, Events.MOUSE_DOWN, closeLeaderboard);
        El.on(document)
        leaderboard.refresh();
    }

    function closeLeaderboard() {
        El.visible(leaderboardElement, false);
        El.off(document, Events.MOUSE_DOWN, closeLeaderboard);
        El.on(document, Events.MOUSE_DOWN, startGame);
    }
});