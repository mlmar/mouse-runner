export function random(min, max, floor) {
    const num = Math.random() *  (max - min) + min;
    if(floor) {
        return Math.floor(num);
    }
    return num;
}

export const COLORS = [
    'lightcoral', 
    'lightseagreen', 
    'orange',
    'cornflowerblue',
    'ghostwhite'
]

export function getRandomColor() {
    const i = random(0, COLORS.length, true);
    return COLORS[i];
}