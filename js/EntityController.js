import Logger from './Logger.js';
import { random } from './Util.js';
import VectorUtil from './VectorUtil.js';

export function createEntityController() {
    let _entities = [];

    function create(props = {}) {
        return {
            id: crypto.randomUUID(),
            color: 'white',
            active: false,
            radius: props.radius,
            mass: 5,
            speed: 1,
            position: VectorUtil.create(),
            velocity: VectorUtil.create(),
            history: [],
            historyLength: 60,
            data: {},
            ...props
        }
    }

    function add(val) {
        if(!val) {
            return Logger.warn('Unable to add null entity');
        }

        if(Array.isArray(val)) {
            const entities = val.map(add);
            return entities;
        } else if(typeof val === 'object') {
            const entity = create(val);
            _entities.push(entity);
            return entity;
        }
    }

    /**
     * Remove item from by referential match or id
     * @param {String | Object} item 
     */
    function remove(val) {
        if(Array.isArray(val)) {
            val.forEach(remove);
        } else if(typeof val === 'object') {
            _entities = _entities.filter(e => e !== val);
        } else {
            _entities = _entities.filter(e => e.id !== e.id);
        }
    }

    function removeAll() {
        _entities.splice(0, _entities.length);
    }

    function updateEntityPosition(entity, tickSpeed) {
        const adjustedVelocity = VectorUtil.scale(entity.velocity, tickSpeed);
        entity.position = VectorUtil.add(entity.position, adjustedVelocity);
        updateEntityHistory(entity);
    }

    function hasCollided(entityA, entityB) {
        const distance = VectorUtil.dist(entityA.position, entityB.position); 
        if(distance >= entityA.radius + entityB.radius) {
            return false;
        }
        return true;
    }

    function updateEntityHistory(entity) {
        entity.history.push(VectorUtil.create(entity.position));
        if(entity.history.length > entity.historyLength) {
            entity.history.splice(0, 1);
        }
    }

    function getAll() {
        return _entities;
    }

    function getActive() {
        return _entities.filter(entity => entity.active);
    }

    function getRandom(includeInactive) {
        const activeEntities = includeInactive ? getAll() : getActive();
        const index = random(0, activeEntities.length, true);
        return activeEntities[index];
    }

    return {
        create,
        add,
        remove,
        removeAll,
        getAll,
        getActive,
        getRandom,
        hasCollided,
        updateEntityPosition
    }
}