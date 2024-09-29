import Logger from '../util/Logger.js';
import CommonUtil from '../util/CommonUtil.js';
import VectorUtil from '../util/VectorUtil.js';
import { createCanvasController } from './CanvasController.js';
import { createEntityController } from './EntityController.js';
import { createMouseTracker } from './MouseTracker.js';

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

const ENTITY_TYPES = {
    BONUS: 'BONUS',
    COLOR: 'COLOR'
}

const ENTITY_SPEED_MULTIPLIER = .075;
const ENTITY_RADIUS = 1.4;

const BONUS_ENTITY_RADIUS = .8;
const BONUS_ENTITY_FREQUENCY = 5;
const BONUS_ENTITY_START_SCORE = 5;

const DEFAULT_STATE = {
    inProgress: false,
    targetColor: null,
    borderColor: null,
    score: 0,
    bonus: {
        isSpawned: false,
        isActive: false,
        startTime: 0,
        uses: 0,
        maxUses: 2,
        startTime: 0,
        maxTime: 3000
    },
    tickSpeed: 0,
    time: 0
}

export function createGameController({ canvas }) {
    const colorEntityController = createEntityController();
    const bonusEntityController = createEntityController();
    const canvasController = createCanvasController(canvas, CANVAS_PROPS);
    const mouseTracker = createMouseTracker({ 
        el: canvas, 
        scale: CANVAS_PROPS.scale,
        onClick: handleMouseClick
    });
    mouseTracker.start();
    
    let _mouseEntity = colorEntityController.create({ radius: 1.5, speed: .01, color: 'red', active: true });

    let _state = {
        ...DEFAULT_STATE
    }

    function get() {
        return _state;
    }

    function start() {
        _state = {
            ...DEFAULT_STATE,
            bonus: {
                ...DEFAULT_STATE.bonus
            },
            inProgress: true
        }
        colorEntityController.removeAll()
        bonusEntityController.removeAll();
        createEntities(1);
        refreshTargetColor();
    }

    function stop() {
        _state.inProgress = false;
        _state.targetColor = 'red';
    }

    function refreshTargetColor() {
        _state.targetColor = colorEntityController.getRandom().color;
    }

    function createEntities(limit) {
        Logger.log('Creating', limit, 'random entities');
        const entities = colorEntityController.getActive().slice(0);
        for(let i = 0; i < limit; i++) {
            const randomExistingEntity = entities[CommonUtil.random(0, entities.length, true)];
            const speed = ENTITY_SPEED_MULTIPLIER + ENTITY_SPEED_MULTIPLIER * Math.pow(ENTITY_SPEED_MULTIPLIER * (_state.score + 1), 2);
            const entity = colorEntityController.create({ 
                radius: ENTITY_RADIUS, 
                speed: speed, 
                color: CommonUtil.randomColor(), 
                active: true,
                position: randomExistingEntity ? VectorUtil.create(randomExistingEntity.position) : getRandomPosition(ENTITY_RADIUS),
                velocity: VectorUtil.random(speed),
                data: {
                    type: ENTITY_TYPES.COLOR,
                    spawnTime: _state.time
                }
            });
            colorEntityController.add(entity);
        }
    }

    function createBonusEntities(limit) {
        Logger.log('Creating', limit, 'random bonus entities');
        const entities = colorEntityController.getActive().slice(0);
        for(let i = 0; i < limit; i++) {
            const randomExistingEntity = entities[CommonUtil.random(0, entities.length, true)];
            const speed = 2 * ENTITY_SPEED_MULTIPLIER;
            const entity = colorEntityController.create({ 
                radius: BONUS_ENTITY_RADIUS, 
                speed: speed, 
                color: 'white',
                stroke: 'gold', 
                active: true,
                position: randomExistingEntity ? VectorUtil.create(randomExistingEntity.position) : getRandomPosition(ENTITY_RADIUS),
                velocity: VectorUtil.random(speed),
                data: {
                    type: ENTITY_TYPES.BONUS,
                    spawnTime: _state.time
                }
            });
            bonusEntityController.add(entity);
        }
    }

    function updateEntities() {
        updateMouseEntity();
        updateBonusEntities();
        updateColorEntities();
        renderMouseEntity(_mouseEntity);
        colorEntityController.cleanup();
    }

    function updateMouseEntity() {
        const { position } = mouseTracker.get();
        _mouseEntity.position.x = position.x;
        _mouseEntity.position.y = position.y;
        colorEntityController.updateEntityPosition(_mouseEntity);
        updateColorEntityEdgeCollision(_mouseEntity);
    }

    function handleMouseClick() {
        if(!_state.inProgress) {
            return;
        }
        let isSuccessfulClick = false;
        isSuccessfulClick = handleMouseColorEntityClick();
        isSuccessfulClick = isSuccessfulClick || handleMouseBonusEntityClick();
        if(!isSuccessfulClick) {
            stop();
        }
    }

    function handleMouseColorEntityClick() {
        const entities = colorEntityController.getAll();
        let isSuccessfulClick = false;
        entities.forEach((entity) => {
            const hasHistory = _mouseEntity.history.length > _mouseEntity.historyLength / 2;
            if(hasHistory && colorEntityController.hasCollided(_mouseEntity, entity)) { // if mouse entity collides with this entity
                const isBonusClick = _state.bonus.isActive && getElapsedBonusTime() < _state.bonus.maxTime;
                if(isBonusClick || _state.targetColor === entity.color) {
                    entity.active = false;
                    _mouseEntity.history = []; // clear history
                    colorEntityController.queueRemove(entity);
                    if(_state.score % 2) {
                        createEntities(1);
                    } else {
                        createEntities(2);
                    }
                    refreshTargetColor();
                    _state.score++;

                    if(isBonusClick) {
                        _state.bonus.uses++;
                    }
                } else {
                    entity.color = 'red';
                    stop();
                }
                isSuccessfulClick = true;
            }
        });
        return isSuccessfulClick;
    }

    function handleMouseBonusEntityClick() {
        const entities = bonusEntityController.getAll();
        let isSuccessfulClick = false;
        entities.forEach((entity) => {
            if(bonusEntityController.hasCollided(_mouseEntity, entity)) { // if mouse entity collides with this bonuse entity
                bonusEntityController.remove(entity);
                _state.bonus.isActive = true;
                _state.bonus.startTime = _state.time;
                _state.bonus.uses = 0;
                isSuccessfulClick = true;
            }
        });
        return isSuccessfulClick;
    }

    function updateColorEntities() {
        const entities = colorEntityController.getAll();
        entities.forEach((entity, i) => {
            if(entity.active) {
                if(_state.inProgress) { // detect entity collisions
                    updateColorEntityCollisions(entity, i);
                    colorEntityController.updateEntityPosition(entity, _state.tickSpeed);
                    updateColorEntityEdgeCollision(entity);
                    if(_mouseEntity.active && !_state.bonus.isActive) {
                        const hasHistory = _mouseEntity.history.length > _mouseEntity.historyLength / 2;
                        if(hasHistory && colorEntityController.hasCollided(_mouseEntity, entity) && _state.targetColor !== entity.color) { // if mouse entity collides with this entity
                            entity.color = 'red';
                            stop();
                        }
                    }
                }
                renderColorEntity(entity);
            }
        });
    }

    function updateBonusEntities() {
        if(_state.bonus.isActive && getElapsedBonusTime() > _state.bonus.maxTime) {
            _state.bonus.isActive = false;
        }

        const isSpawnableScore = _state.score % BONUS_ENTITY_FREQUENCY === 0;
        if(!isSpawnableScore && _state.bonus.isSpawned) {
            _state.bonus.isSpawned = false;
        }

        const bonusEnabled = isSpawnableScore && _state.score >= BONUS_ENTITY_START_SCORE && !_state.bonus.isSpawned; // spawn bonuses every 3 scores after 21
        if(bonusEnabled) {
            createBonusEntities(1);
            _state.bonus.isSpawned = true;
        }

        const bonusEntities = bonusEntityController.getActive();
        bonusEntities.forEach((entity, i) => {
            if(_state.inProgress) { // detect entity collisions
                colorEntityController.updateEntityPosition(entity, _state.tickSpeed);
                updateBonusEntityEdgeCollision(entity);
            }
            renderBonusEntity(entity);
        });
    }

    // https://editor.p5js.org/codingtrain/sketches/3DrBb8LCp
    function updateColorEntityCollisions(entityA, startingIndex = 0)  {
        const entities = colorEntityController.getAll();
        for(let i = startingIndex + 1; i < entities.length; i++) {
            const entityB = entities[i];
            if(!entityB.active) { // skip inactive
                continue;
            }
            if(!colorEntityController.hasCollided(entityA, entityB)) { // skip non collisions
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

    function updateColorEntityEdgeCollision(entity) {
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
    
    function updateBonusEntityEdgeCollision(entity) {
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

    function renderMouseEntity(entity) {
        if(entity.active) {
            if(_state.bonus.isActive) {
                renderMouseEntityBonusTrail(entity);
            } else {
                renderColorEntityTrail(entity);
            }
            canvasController.drawCircle({
                scale: CANVAS_PROPS.scale,
                fill: entity.color,
                radius: entity.radius,
                stroke: entity.stroke,
                strokeWidth: 0,
                ...entity.position
            });
        }
    }

    function renderMouseEntityBonusTrail(entity) {
        const frequency = 4;
        const frequencyLength = entity.history.length / frequency;
        for(let i = 0; i < entity.history.length; i += frequency) {
            const { x, y } = entity.history[i];
            const scalar =  i / frequency;
            canvasController.drawCircle({
                fill: CommonUtil.randomColor(),
                radius: scalar / frequencyLength * entity.radius,
                alpha: 1 - getElapsedBonusTime() / _state.bonus.maxTime,
                x: x + CommonUtil.random(-entity.speed, entity.speed),
                y: y + CommonUtil.random(-entity.speed, entity.speed)
            });
        }
    }

    function renderColorEntity(entity) {
        if(entity.active) {
            renderColorEntityTrail(entity);
            canvasController.drawCircle({
                scale: CANVAS_PROPS.scale,
                fill: entity.color,
                radius: entity.radius,
                stroke: entity.stroke,
                strokeWidth: 0,
                ...entity.position
            });
        }
    }

    function renderColorEntityTrail(entity) {
        const frequency = 2;
        const frequencyLength = entity.history.length / frequency;
        for(let i = 0; i < entity.history.length; i += frequency) {
            const { x, y } = entity.history[i];
            const scalar =  i / frequency;
            canvasController.drawCircle({
                fill: entity.color,
                radius: CommonUtil.random(scalar, scalar+2) / frequencyLength * entity.radius,
                alpha: scalar / (frequencyLength * frequency * frequency),
                x: x + CommonUtil.random(-entity.speed, entity.speed),
                y: y + CommonUtil.random(-entity.speed, entity.speed)
            });
        }
    }

    function renderBonusEntity(entity) {
        if(entity.active) {
            renderBonusEntityTrail(entity);
            canvasController.drawCircle({
                scale: CANVAS_PROPS.scale,
                fill: entity.color,
                radius: entity.radius,
                stroke: entity.stroke,
                strokeWidth: 3,
                ...entity.position
            });
        }
    }

    function renderBonusEntityTrail(entity) {
        const startingIndex = entity.historyLength - entity.historyLength / 2;
        const trailLength = entity.history.length - startingIndex;
        for(let i = startingIndex; i < entity.history.length; i += 4) {
            const { x, y } = entity.history[i];
            canvasController.drawCircle({
                fill: CommonUtil.randomColor(),
                radius: (i - startingIndex) / trailLength * entity.radius,
                alpha: .8,
                x: x + CommonUtil.random(-.2, .2),
                y: y + CommonUtil.random(-.2, .2)
            });
        }
    }

    function renderBackground() {
        canvasController.drawRect(BACKGROUND);
    }

    function update({ tickSpeed, time }) {
        _state.tickSpeed = tickSpeed;
        _state.time = time;
        renderBackground();
        updateEntities();
        _state.borderColor = _state.targetColor;
    }

    function getRandomPosition(radius) {
        const { width, height } = canvasController.get();
        return {
            x: CommonUtil.random(radius, width - radius),
            y: CommonUtil.random(radius, height - radius)
        }
    }

    function getElapsedBonusTime() {
        return _state.time - _state.bonus.startTime;
    }

    return {
        start,
        stop,
        update,
        get,
    }
}