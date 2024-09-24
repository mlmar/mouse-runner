import { warn } from './Logger.js';

export function createEntityController() {
    let _entities = [];

    function add(props) {
        if(!props) {
            return warn('Unable to add null entity');
        }

        const { 
            id = crypto.randomUUID(),
            x,
            y,
            radius,
            fill,
            active = true
        } = props;
        _entities.push({ id, x, y, radius, fill, active });
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