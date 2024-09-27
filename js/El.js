function find(query) {
    return document.querySelector(query);
}

function findAll(query) {
    return document.querySelector(query);
}

function findChild(el, query) {
    return el.querySelector(query);
}

function parent(el) {
    return el.parentNode;
}

function bounds(el) {
    return el.getBoundingClientRect();
}

function text(el, val) {
    el.innerText = val;
}

function css(el, props) {
    for(let prop in props) {
        el.style[prop] = props[prop];
    }
}

function visible(el, show = null){
    if(show !== null) {
        css(el, {
            display: show ? '' : 'none'
        });
        return show;
    } else {
        return el.style.display !== 'none';
    }
}

function on(el, event, func) {
    el.addEventListener(event, func);
}

function off(el, event, func) {
    el.removeEventListener(event, func);
}

export default {
    find,
    findAll,
    findChild,
    parent,
    bounds,
    text,
    css,
    visible,
    on,
    off
}