export function createScoreTracker(key) {
    if(!key) {
        throw new Error('Local storage key required for score tracker');
    }

    const _state = {
        score: 0,
        highScore: 0
    }

    function get() {
        return _state;
    }

    function set(num) {
        _state.score = num;
        refreshHighScore();
    }

    function add(num) {
        _state.score += num;
        refreshHighScore();
    }

    function sub(num) {
        _state.score -= num;
    }

    function reset() {
        _state.score = 0;
    }

    function refreshHighScore() {
        const score = localStorage.getItem(key);
        if(score !== null) {
            _state.highScore = score;
        }
        localStorage.setItem(key, Math.max(_state.score, _state.highScore));
    }

    refreshHighScore();
    return {
        get,
        set,
        sub,
        add,
        reset
    }
}