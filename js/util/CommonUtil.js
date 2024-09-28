import Colors from '../globals/Colors.js';

function random(min, max, floor) {
    const num = Math.random() *  (max - min) + min;
    if(floor) {
        return Math.floor(num);
    }
    return num;
}

function randomBoolean() {
    return Boolean(random(0, 2, true));
}

const COLORS = Object.values(Colors);
function randomColor(hex = false) {
    const i = random(0, COLORS.length, true);
    if(hex) {
        return standardizeColor(COLORS[i]);
    }
    return COLORS[i];
}

function getColorList() {
    return COLORS;
}

const ctx = document.createElement('canvas').getContext('2d');
function standardizeColor(color){
    ctx.fillStyle = color;
    return ctx.fillStyle;
}

export default {
    random,
    randomBoolean,
    randomColor,
    getColorList,
    standardizeColor
}