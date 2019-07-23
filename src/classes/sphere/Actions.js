let bubbleIncreaseNoise = false;
const animControls = {
  speed: {step: 0.2, min: 0.5, max: 1.7, animStep: 0.05},
  noise: {step: 0.07, min: 0.1, max: 0.5, animStep: 0.008},
  intStep: 6,
};

const increaseNoise = (controls, limit) => {
  if ((controls.speed >= limit.speed || controls.speed >
      animControls.step.max) &&
      (noiseAmount >= limit.noise || controls.noiseAmount >
          animControls.noise.max)) {
    return false;
  }

  controls.speed = controls.speed + animControls.step.animStep;
  controls.noiseAmount = controls.noiseAmount +
      animControls.noise.animStep;

  return true;
};

const decreaseNoise = controls => {
  if (bubbleIncreaseNoise) return;

  const step = animControls.speed;
  const noise = animControls.noise;

  if (controls.speed <= step.min && controls.noiseAmount <=
      noise.min) return;

  const decelerationRate = 10;

  controls.speed = controls.speed > step.min ?
      controls.speed - step.step / decelerationRate :
      controls.speed;
  controls.noiseAmount = controls.noiseAmount > noise.min ?
      controls.noiseAmount - noise.step / (decelerationRate * 3) :
      controls.noiseAmount;
};

export default {increaseNoise, decreaseNoise};
