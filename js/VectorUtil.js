function dist(v1, v2) {
    return Math.sqrt(Math.pow((v2.x - v1.x), 2) + Math.pow((v2.y - v1.y), 2));
}

function dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y; 
}


function add(v1, v2) {
    return {
        x: v1.x + v2.x,
        y: v1.y + v2.y
    }
}

function sub(v1, v2) {
    return {
        x: v1.x - v2.x,
        y: v1.y - v2.y
    }
}

function scale(vector, scalar) {
    return {
        x: vector.x * scalar,
        y: vector.y * scalar
    }
}

function mag(vector, magnitude) {
    const distance = dist(vector, { x: 0, y: 0 });
    if(magnitude) {
        return scale(vector, magnitude / distance);
    }
    return distance;
}

export default {
    dist,
    dot,
    add,
    sub,
    scale,
    mag
}