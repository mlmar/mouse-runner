import Logger from './Logger.js';
import { createCanvasController } from './CanvasController.js';
import { createEntityController } from './EntityController.js';
import { createMouseTracker } from './MouseTracker.js';
import { getRandomColor, random } from './Util.js';
import VectorUtil from './VectorUtil.js';

const CANVAS_PROPS = {
    scale: 10,
    width: 80,
    height: 80
}

const BACKGROUND = {
    x: 0,
    y: 0,
    width: CANVAS_PROPS.width,
    height: CANVAS_PROPS.height,
    fill: 'black',
}

const SPEED_MULTIPLIER = .08;
const RADIUS = 1.4;

export function createGameController({ canvas }) {
    const entityController = createEntityController();
    const canvasController = createCanvasController(canvas, CANVAS_PROPS);
    const mouseTracker = createMouseTracker({ 
        el: canvas, 
        scale: CANVAS_PROPS.scale,
        onClick: () => {
            if(!_state.inProgress) {
                return;
            }
            const entities = entityController.getAll();
            let isCollided = false;
            entities.forEach((entity) => {
                if(entityController.hasCollided(_mouseEntity, entity)) { // if mouse entity collides with this entity
                    if(_state.targetColor === entity.color) {
                        entity.active = false;
                        _entitiesToRemove.push(entity);
                        createEntites(2);
                        refreshTargetColor();
                        _state.score++;
                    } else {
                        entity.color = 'red';
                        stop();
                    }
                    isCollided = true;
                }
            });
            if(!isCollided) {
                stop();
            }
        }
    });
    
    let _mouseEntity = null;
    let _entitiesToRemove = [];

    const _state = {
        inProgress: false,
        targetColor: null,
        score: 0,
    }

    function get() {
        return _state;
    }

    function start() {
        _state.inProgress = true;
        _mouseEntity = entityController.create({ radius: 1, color: 'red' });
        createEntites(1);
        refreshTargetColor();
    }

    function stop() {
        _state.inProgress = false;
        _state.targetColor = 'red';
    }

    function refreshTargetColor() {
        _state.targetColor = entityController.getRandom().color;
        _mouseEntity.stroke
    }

    function createEntites(limit) {
        Logger.log('Creating', limit, 'random entities');
        const entities = entityController.getActive().slice(0);
        for(let i = 0; i < limit; i++) {
            const randomExistingEntity = entities[random(0, entities.length, true)];
            const radius = RADIUS;
            const speed = SPEED_MULTIPLIER + SPEED_MULTIPLIER * Math.pow(SPEED_MULTIPLIER * (_state.score + 1), 2);
            const entity = entityController.create({ 
                radius, 
                speed, 
                color: getRandomColor(), 
                active: true,
                position: randomExistingEntity ? VectorUtil.create(randomExistingEntity.position) : getRandomPosition(radius),
                velocity: VectorUtil.random(speed)
            });
            entityController.add(entity);
        }
    }

    function updateMouseEntity() {
        const { position, isOver } = mouseTracker.get();
        _mouseEntity.position.x = position.x;
        _mouseEntity.position.y = position.y;
        _mouseEntity.active = isOver;
        entityController.updateEntityPosition(_mouseEntity);
        updateEntityEdgeCollision(_mouseEntity);
    }

    function updateEntities(tickSpeed) {
        updateMouseEntity();
        const entities = entityController.getAll();
        entities.forEach((entity, i) => {
            if(entity.active) {
                if(_state.inProgress) { // detect entity collisions
                    updateEntityCollisions(entity, i);
                    entityController.updateEntityPosition(entity, tickSpeed);
                    updateEntityEdgeCollision(entity);
                    if(entityController.hasCollided(_mouseEntity, entity) && _state.targetColor !== entity.color) { // if mouse entity collides with this entity
                        entity.color = 'red';
                        stop();
                    }
                }
                renderEntity(entity);
            }
        });
        renderEntity(_mouseEntity);
        cleanupEntities();
    }

    // https://editor.p5js.org/codingtrain/sketches/3DrBb8LCp
    function updateEntityCollisions(entityA, startingIndex = 0)  {
        const entities = entityController.getAll();
        for(let i = startingIndex + 1; i < entities.length; i++) {
            const entityB = entities[i];
            if(!entityB.active) { // skip inactive
                continue;
            }
            if(!entityController.hasCollided(entityA, entityB)) { // skip non collisions
                continue;
            }
            if(entityB.history.length < entityB.historyLength) { // skip new entities
                continue;
            }

            entityA.speed = Math.max(entityA.speed, entityB.speed); // take max speed on collision
            entityB.speed = entityA.speed;
            
            let vImpact = VectorUtil.sub(entityB.position, entityA.position); // velocity at impact
            let distance = VectorUtil.mag(vImpact);

            // adjust entities position when overlapping
            const overlap = distance - (entityA.radius + entityB.radius);
            const vOverlap = VectorUtil.mag(vImpact, overlap / 2);
            entityA.position = VectorUtil.add(entityA.position, vOverlap);
            entityB.position = VectorUtil.sub(entityB.position, vOverlap);
            
            // adjust distance and impact vector to match adjusted postion
            distance = entityA.radius + entityB.radius;
            vImpact = VectorUtil.mag(vImpact, distance);

            // calculate new velocities for each entity at collision (elastic)
            const massSum = entityA.mass + entityB.mass;
            const vDiff = VectorUtil.sub(entityB.velocity, entityA.velocity);
            const numerator = VectorUtil.dot(vDiff, vImpact);
            const denominator = massSum * Math.pow(distance, 2);

            const vDeltaA = VectorUtil.scale(vImpact, 2 * entityB.mass *  numerator / denominator);
            entityA.velocity = VectorUtil.add(entityA.velocity, vDeltaA);
            
            const vDeltaB = VectorUtil.scale(vImpact, -2 * entityA.mass * numerator / denominator);
            entityB.velocity = VectorUtil.add(entityB.velocity, vDeltaB);

            // set magnitude of velocity to match speed
            entityA.velocity = VectorUtil.mag(entityA.velocity, entityA.speed);
            entityB.velocity = VectorUtil.mag(entityB.velocity, entityB.speed);

            const tempColor = entityA.color; // switch colors on collision
            entityA.color = entityB.color;
            entityB.color = tempColor;
        }
    }

    function cleanupEntities() {
        if(_entitiesToRemove.length) {
            entityController.remove(_entitiesToRemove);
            _entitiesToRemove.splice(0, _entitiesToRemove.length);
        }
    }
    
    function updateEntityEdgeCollision(entity) {
        const { width, height } = canvasController.get();
        if(entity.position.x > width - entity.radius) {
            entity.position.x = width - entity.radius; 
            entity.velocity.x *= -1;
        } else if(entity.position.x < entity.radius) {
            entity.position.x = entity.radius; 
            entity.velocity.x *= -1;
        }
        if(entity.position.y > height - entity.radius) {
            entity.position.y = height - entity.radius; 
            entity.velocity.y *= -1;
        } else if(entity.position.y < entity.radius) {
            entity.position.y = entity.radius; 
            entity.velocity.y *= -1;
        }
    }

    function getRandomPosition(radius) {
        const { width, height } = canvasController.get();
        return {
            x: random(radius, width - radius),
            y: random(radius, height - radius)
        }
    }

    function renderEntity(entity) {
        if(entity.active) {
            canvasController.drawCircle({
                fill: entity.color,
                radius: entity.radius,
                stroke: entity.stroke,
                strokeWidth: 0,
                ...entity.position
            });
            renderEntityHistory(entity);
        }
    }

    function renderEntityHistory(entity) {
        const frequency = 2;
        const frequencyLength = entity.history.length / frequency;
        for(let i = 0; i < entity.history.length; i += frequency) {
            const { x, y } = entity.history[i];
            const scalar =  i / frequency;
            canvasController.drawCircle({
                fill: entity.color,
                radius: scalar / frequencyLength * entity.radius,
                alpha: scalar / (frequencyLength * frequency * frequency),
                x,
                y
            });
        }
    }

    function renderBackground() {
        canvasController.drawRect(BACKGROUND);
    }

    return {
        start,
        stop,
        createEntites,
        updateEntities,
        get,
        renderBackground
    }
}