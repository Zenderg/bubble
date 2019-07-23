import {isIntersect} from '../helpers';
import {increaseNoise} from '../Actions';

export default class Click {
  mouse = {x: 0, y: 0};

  event = event => {
    const mouse = Click.setMousePos(event);

    if (!isIntersect(scene, camera, this.mouse, 'bubble')) return false;

    const limitStep = this.controls.speed + this.animControls.step.step;
    const limitNoise = this.controls.noiseAmount + this.animControls.noise.step;

    this.bubbleIncreaseNoise = true;

    const timer = setInterval(() => {
      const flag = increaseNoise({speed: limitStep, noise: limitNoise});

      if (!flag) {
        this.bubbleIncreaseNoise = false;
        clearInterval(timer);
      }
    }, this.animControls.intStep);
  };

  static setMousePos() {
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -(event.clientY / window.innerHeight) * 2 + 1;

    return {x, y};
  }
}
