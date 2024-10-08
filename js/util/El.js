function find(query) {
    return document.querySelector(query);
}

function findAll(query) {
    return document.querySelectorAll(query);
}

function findChild(el, query) {
    return el.querySelector(query);
}

function findChildren(el, query) {
    return el.querySelectorAll(query);
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
    off(el, event, func);
    el.addEventListener(event, func);
}

function off(el, event, func) {
    el.removeEventListener(event, func);
}

function disable(el, disabled = true) {
    el.disabled = disabled;
    toggleClass(el, 'disabled', disabled);
}

function toggleClass(el, className, isToggled) {
    el.classList.toggle(className, isToggled)
}

export default {
    find,
    findAll,
    findChild,
    findChildren,
    parent,
    bounds,
    text,
    css,
    visible,
    on,
    off,
    disable,
    toggleClass,
}