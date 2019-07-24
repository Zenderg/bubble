import {isIntersect, mousePos} from '../helpers';

const event = (scene, camera, sphere, name, controls) => event => {
    const coefEffect = 1;

    const {x, y} = mousePos(event);

    sphere.position.x = -x * coefEffect;
    sphere.position.y = -y * coefEffect;

    // controls.noiseAmount = isIntersect(scene, camera, event, name) ? 0.3 : 0.1;
};

export default event;
