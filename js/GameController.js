import { random } from './Util.js';
import VectorUtil from './VectorUtil.js';

export function createGameController({ canvas, entityController }) {
    function updateEntities(tickSpeed) {
        const entities = entityController.getAll();
        entities.forEach((entity, i) => {
            if(!entity.active) {
                randomizeEntityVelocity(entity);
                randomizeEntityPosition(entity);
                entity.active = true;
            } else {
                updateEntityCollisions(entity, i);
                updateEntityPosition(entity, tickSpeed);
                updateEntityEdgeCollision(entity);
                renderEntity(entity);
            }
        });
    }

    function updateEntityPosition(entity, tickSpeed) {
        const adjustedVelocity = VectorUtil.scale(entity.velocity, tickSpeed);
        entity.position = VectorUtil.add(entity.position, adjustedVelocity);
    }
    
    // https://editor.p5js.org/codingtrain/sketches/3DrBb8LCp
    function updateEntityCollisions(entityA, currentIndex)  {
        const entities = entityController.getAll();
        for(let i = currentIndex + 1; i < entities.length; i++) {
            const entityB = entities[i];
            
            let vImpact = VectorUtil.sub(entityB.position, entityA.position); // velocity at impact
            let distance = VectorUtil.mag(vImpact); 
            if(distance >= entityA.radius + entityB.radius) {
                continue;
            }

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

        }
    }

    function updateEntityEdgeCollision(entity) {
        const { width, height } = canvas.get();
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

    function randomizeEntityPosition(entity) {
        const { width, height } = canvas.get();
        const radius = entity.radius;
        entity.position.x = random(radius, width - radius);
        entity.position.y = random(radius, height - radius);
    }

    function randomizeEntityVelocity(entity) {
        const phi = 2 * Math.PI * Math.random();
        entity.velocity.x = entity.speed * Math.cos(phi);
        entity.velocity.y = entity.speed * Math.sin(phi);
    }

    function renderEntity(entity) {
        canvas.drawCircle({
            fill: entity.color,
            radius: entity.radius,
            ...entity.position
        });
    }
    
    return {
        updateEntities
    }
}