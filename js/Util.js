export function random(min, max, floor) {
    const num = Math.random() *  (max - min) + min;
    if(floor) {
        return Math.floor(num);
    }
    return num;
}