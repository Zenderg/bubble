import {isIntersect} from '../helpers';
import {increaseNoise, setFlag, getAnimControls} from '../Actions';

const event = (scene, camera, name, controls) => event => {
    if (!isIntersect(scene, camera, event, name)) return false;

    const animControls = getAnimControls();
    const limitSpeed = controls.speed + animControls.speed.step;
    const limitNoise = controls.noiseAmount + animControls.noise.step;

    setFlag(true);

    const timer = setInterval(() => {
        const flag = increaseNoise(controls, {speed: limitSpeed, noise: limitNoise});

        if (!flag) {
            setFlag('decrease');
            clearInterval(timer);
        }
    }, animControls.intStep);
};

export default event;
