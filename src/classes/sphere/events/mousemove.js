import {isIntersect, mousePos} from '../helpers';

const checkMins = (actions, speed, noise) => actions.anims.speed.min === speed && actions.anims.noise.min === noise;

const shake = (actions) => {
    if (checkMins(actions, 1, 0.2)) return;

    actions.anims = {speed:{min: 1}, noise: {min:0.2}};
    actions.state = 'normalize'
};

const relax = (actions) => {
    if (checkMins(actions, 0.5, 0.1)) return;

    actions.anims = {speed:{min: 0.5}, noise: {min: 0.1}};
    actions.state = 'normalize'
};

const event = (scene, camera, sphere, name, actions) => event => {
    const coefEffect = 1;

    const {x, y} = mousePos(event);

    sphere.position.x = -x * coefEffect;
    sphere.position.y = -y * coefEffect;

    if (isIntersect(scene, camera, event, name)) {
        shake(actions);
    } else {
        relax(actions);
    }
};

export default event;
