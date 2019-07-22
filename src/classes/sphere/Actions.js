export default class Actions {
    bubbleIncreaseNoise = false;
    animControls = {
        speed: {step: 0.2, min: 0.5, max: 1.7, animStep: 0.05},
        noise: {step: 0.07, min: 0.1, max: 0.5, animStep: 0.008},
        intStep: 6,
    };

    decreaseNoise(controls) {
        if (this.bubbleIncreaseNoise) return;

        const step = this.animControls.speed;
        const noise = this.animControls.noise;

        if (controls.speed <= step.min && controls.noiseAmount <=
            noise.min) return;

        const decelerationRate = 10;

        controls.speed = controls.speed > step.min ?
            controls.speed - step.step / decelerationRate :
            controls.speed;
        controls.noiseAmount = controls.noiseAmount > noise.min ?
            controls.noiseAmount - noise.step / (decelerationRate * 3) :
            controls.noiseAmount;
    }
}