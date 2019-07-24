import {isIntersect, mousePos} from '../helpers';

const shake = (controls, actions) => {
    controls.noiseAmount = 0.2;
    controls.speed = 1;
    actions.anims = {speed:{min: 1}, noise: {min:0.2}};
};

const relax = (controls, actions) => {
    actions.anims = {speed:{min: 0.5}, noise: {min: 0.1}};
    actions.state = 'decrease'
};

const event = (scene, camera, sphere, name, actions, controls) => event => {
    const coefEffect = 1;

    const {x, y} = mousePos(event);

    sphere.position.x = -x * coefEffect;
    sphere.position.y = -y * coefEffect;

    if (isIntersect(scene, camera, event, name)) {
        shake(controls, actions);
    } else {
        relax(controls, actions);
    }
};

export default event;
