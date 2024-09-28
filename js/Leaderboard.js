import El from './El.js';
import Events from './Events.js';
import Logger from './Logger.js';
import LocalStorageKeys from './LocalStorageKeys.js';
import { getRandomColor, standardizeColor } from './Util.js';
import { getScores, insertScore } from './service/ScoresService.js';

export function createLeaderboard(el) {

    const scoresElement = El.findChild(el, '#scores');
    const nameElement = El.findChild(el, '#input-name');
    const colorElement = El.findChild(el, '#input-color');
    const submitElement = El.findChild(el, '#button-submit');

    const _state = {
        name: localStorage.getItem(LocalStorageKeys.ORB_NAME_KEY) ?? '',
        color: localStorage.getItem(LocalStorageKeys.ORB_COLOR_KEY) ?? standardizeColor(getRandomColor()),
        submittedScore: localStorage.getItem(LocalStorageKeys.ORB_SUBMITTED_SCORE_KEY) ?? 0
    }

    async function handleSubmit() {
        const score = localStorage.getItem(LocalStorageKeys.ORB_SCORE_KEY);
        const res = await insertScore({
            name: _state.name,
            color: _state.color,
            score
        });
        localStorage.setItem(LocalStorageKeys.ORB_NAME_KEY, _state.name);
        localStorage.setItem(LocalStorageKeys.ORB_COLOR_KEY, _state.color);
        localStorage.setItem(LocalStorageKeys.ORB_SUBMITTED_SCORE_KEY, score);
        _state.submittedScore = score;
        appendScores(res.data.scores);
        refreshSubmitButton();
    }

    function handleNameChange(event) {
        _state.name = stripName(event.target.value);
        nameElement.value = _state.name;
        refreshSubmitButton();
    }

    function stripName(name) {
        return name.trim().toUpperCase().substring(0,2);
    }

    async function refreshScores() {
        const res = await getScores();
        if(res?.data) {
            appendScores(res.data);
        }
    }

    function appendScores(scores) {
        scoresElement.innerHTML = '';
        scores.forEach(appendScoreRow);
    }

    function appendScoreRow({ rank, name, color, score }) {
        scoresElement.innerHTML += (`
            <section class="score-row">
                <label style="color: ${color}"> ${rank} </label>
                <label style="color: ${color}"> ${name} </label>
                <label style="color: ${color}"> ${score} </label>
            </section> 
        `);
    }

    function refreshName() {
        nameElement.value = _state.name;
        El.css(nameElement, { color: _state.color });
    }

    function refreshColor() {
        colorElement.value = _state.color;
        refreshName();
    }

    function refreshSubmitButton() {
        El.disable(submitElement, !_state.name.length);
        El.toggleClass(submitElement, 'floaty', _state.name.length);
        const parent = El.parent(submitElement);

        const currentScore = localStorage.getItem(LocalStorageKeys.ORB_SCORE_KEY) ?? 0;
        // El.visible(parent, currentScore > _state.submittedScore);
    }
    
    function refresh() {
        Logger.log('Refreshing leaderboard');

        El.off(nameElement, Events.INPUT, handleNameChange);
        El.on(nameElement, Events.INPUT, handleNameChange);
        setTimeout(() => nameElement.focus(), 10);

        El.off(submitElement, Events.CLICK, handleSubmit);
        El.on(submitElement, Events.CLICK, handleSubmit);

        refreshName();
        refreshColor();
        refreshSubmitButton();

        if(El.visible(el)) {
            refreshScores();
        }
    }

    refresh();
    return {
        refresh
    }
}