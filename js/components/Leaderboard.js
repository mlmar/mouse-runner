import El from '../util/El.js';
import Events from '../globals/Events.js';
import Logger from '../util/Logger.js';
import LocalStorageKeys from '../util/LocalStorageKeys.js';
import CommonUtil from '../util/CommonUtil.js';
import { getScores, insertScore } from '../service/ScoresService.js';

export function createLeaderboard(el) {

    const scoresElement = El.findChild(el, '#scores');
    const scoresHeaderElement = El.findChild(el, '#scores-header');
    const nameElement = El.findChild(el, '#input-name');
    const colorElement = El.findChild(el, '#input-color');
    const submitElement = El.findChild(el, '#button-submit');
    const closeElement = El.findChild(el, '#button-close')

    const _state = {
        score: 0,
        name: localStorage.getItem(LocalStorageKeys.ORB_NAME_KEY) ?? '',
        color: localStorage.getItem(LocalStorageKeys.ORB_COLOR_KEY) ?? CommonUtil.randomColor(true),
        submittedScore: getLastSubmission(),
        hasSubmitted: false
    }

    function getLastSubmission() {
        const stored = localStorage.getItem(LocalStorageKeys.ORB_SUBMITTED_SCORE_KEY);
        if(stored) {
            return JSON.parse(stored);
        } else {
            return null;
        }
    }

    function setScore(score) {
        _state.score = score;
    }

    async function handleSubmit() {
        const data = {
            name: _state.name,
            color: _state.color,
            score: _state.score
        }
        _state.submittedScore = data;
        localStorage.setItem(LocalStorageKeys.ORB_NAME_KEY, _state.name);
        localStorage.setItem(LocalStorageKeys.ORB_SUBMITTED_SCORE_KEY, JSON.stringify(data));
        refreshSubmitButton();
        const res = await insertScore(data);
        appendScores(res.data.scores);
    }

    function handleNameChange(event) {
        _state.name = stripName(event.target.value);
        nameElement.value = _state.name;
        refreshSubmitButton();
    }

    function handleColorChange(event) {
        _state.color = event.target.value;
        localStorage.setItem(LocalStorageKeys.ORB_COLOR_KEY, _state.color);
        refreshName();
        refreshSubmitButton();
        refreshLeaderboardColor();
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
        El.css(nameElement, { 
            color: _state.color,
            borderColor: _state.color
        });
    }

    function refreshColor() {
        colorElement.value = _state.color;
        refreshName();
    }

    function refreshSubmitButton() {
        El.disable(submitElement, !_state.name.length);
        El.toggleClass(submitElement, 'floaty', _state.name.length);
        El.css(submitElement, { color: _state.color });
        if(_state.submittedScore) {
            toggleSubmit(_state.submittedScore.name !== _state.name || _state.score !== _state.submittedScore.score);
        }
    }

    function toggleSubmit(toggle) {
        const parent = El.parent(submitElement);
        El.visible(parent, toggle);
    }

    function refreshLeaderboardColor() {
        El.css(el, { borderColor: _state.color });
        const labels = El.findChildren(scoresHeaderElement, 'label');
        labels.forEach(label => El.css(label, {
            borderColor: _state.color,
            color: _state.color
        }));

        El.css(closeElement, {
            color: _state.color
        });
    }
    
    function refresh() {
        Logger.log('Refreshing leaderboard');

        El.on(nameElement, Events.INPUT, handleNameChange);
        El.on(colorElement, Events.INPUT, handleColorChange);
        El.on(submitElement, Events.CLICK, handleSubmit);
        setTimeout(() => nameElement.focus(), 10);

        refreshName();
        refreshColor();
        refreshSubmitButton();

        if(El.visible(el)) {
            refreshScores();
            refreshLeaderboardColor();
        }
    }

    refresh();
    return {
        refresh,
        setScore
    }
}