import { warn } from './Logger.js';

export function createEntityController() {
    let _entities = [];

    function add(props) {
        if(!props) {
            return warn('Unable to add null entity');
        }

        const entity = {
            id: crypto.randomUUID(),
            color: 'black',
            active: false,
            radius: props.radius,
            mass: 5,
            speed: 1,
            position: {
                x: 0,
                y: 0,
            },
            velocity: {
                x: 0,
                y: 0
            },
            ...props
        }

        _entities.push(entity);
        return entity;
    }

    /**
     * Remove item from by referential match or id
     * @param {String | Object} item 
     */
    function remove(item) {
        if(typeof item === 'object') {
            _entities = _entities.filter(node => node !== item);
        } else {
            _entities = _entities.filter(node => node.id !== item.id);
        }
    }

    function getAll() {
        return _entities;
    }

    return {
        add,
        remove,
        getAll
    }
}