import Logger from './Logger.js';
import VectorUtil from './VectorUtil.js';
import { createCanvasController } from './CanvasController.js';
import { createEntityController } from './EntityController.js';
import { createMouseTracker } from './MouseTracker.js';
import { getRandomColor, random } from './Util.js';

const CANVAS_PROPS = {
    scale: 20,
    absoluteWidth: 800,
    absoluteHeight: 800,
    fitToParent: true
}

const BACKGROUND = {
    x: 0,
    y: 0,
    width: CANVAS_PROPS.absoluteWidth,
    height: CANVAS_PROPS.absoluteHeight,
    fill: 'black',
}

const SPEED_MULTIPLIER = .075;
const RADIUS = 1.4;

const DEFAULT_STATE = {
    inProgress: false,
    targetColor: null,
    score: 0,
}

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
                const hasHistory = _mouseEntity.history.length > _mouseEntity.historyLength / 2;
                if(hasHistory && entityController.hasCollided(_mouseEntity, entity)) { // if mouse entity collides with this entity
                    if(_state.targetColor === entity.color) {
                        entity.active = false;
                        _mouseEntity.history = []; // clear history
                        _entitiesToRemove.push(entity);
                        if(_state.score % 2) {
                            createEntities(1);
                        } else {
                            createEntities(2);
                        }
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
    mouseTracker.start();
    
    let _mouseEntity = entityController.create({ radius: 1.5, speed: .01, color: 'red', active: true });
    let _entitiesToRemove = [];

    let _state = {
        ...DEFAULT_STATE
    }

    function get() {
        return _state;
    }

    function start() {
        _state = {
            ...DEFAULT_STATE,
            inProgress: true
        }
        entityController.removeAll()
        createEntities(1);
        refreshTargetColor();
    }

    function stop() {
        _state.inProgress = false;
        _state.targetColor = 'red';
    }

    function refreshTargetColor() {
        _state.targetColor = entityController.getRandom().color;
    }

    function createEntities(limit) {
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
        const { position } = mouseTracker.get();
        _mouseEntity.position.x = position.x;
        _mouseEntity.position.y = position.y;
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
                    if(_mouseEntity.active) {
                        const hasHistory = _mouseEntity.history.length > _mouseEntity.historyLength / 2;
                        if(hasHistory && entityController.hasCollided(_mouseEntity, entity) && _state.targetColor !== entity.color) { // if mouse entity collides with this entity
                            entity.color = 'red';
                            stop();
                        }
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

            // entityA.speed = Math.max(entityA.speed, entityB.speed); // take max speed on collision
            // entityB.speed = entityA.speed;
            
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
                scale: CANVAS_PROPS.scale,
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
                radius: random(scalar, scalar+2) / frequencyLength * entity.radius,
                alpha: scalar / (frequencyLength * frequency * frequency),
                x: x + random(-entity.speed, entity.speed),
                y: y + random(-entity.speed, entity.speed)
            });
        }
    }

    function renderBackground() {
        canvasController.drawRect(BACKGROUND);
    }

    function update(tickSpeed) {
        renderBackground();
        updateEntities(tickSpeed);
    }

    return {
        start,
        stop,
        update,
        get,
    }
}