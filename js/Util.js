export function random(min, max, floor) {
    const num = Math.random() *  (max - min) + min;
    if(floor) {
        return Math.floor(num);
    }
    return num;
}

export const COLORS = [
    'crimson', 
    'lightseagreen', 
    'orange',
    'cornflowerblue',
    'purple',
    'antiquewhite',
    'darkblue'
]

export function getRandomColor() {
    const i = random(0, COLORS.length, true);
    return COLORS[i];
}