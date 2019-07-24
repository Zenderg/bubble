export default class Actions {
  bubbleState = 'normal';
  animControls = {
    speed: {min: 0.5, max: 1.7, step: 0.05},
    noise: {min: 0.1, max: 0.5, step: 0.005},
  };

  constructor(controls) {
    this.controls = controls;
    this.actions = {
      normal: () => {
      },
      increase: this.increaseNoise,
      decrease: this.decreaseNoise,
    };
  }

  update() {
    this.actions[this.bubbleState].call(this);
  }

  increaseNoise() {
    const speed = this.animControls.speed;
    const noise = this.animControls.noise;

    if (this.controls.speed >= speed.max &&
        this.controls.noiseAmount >= noise.max)
      return this.state = 'decrease';

    this.controls.speed = this.controls.speed < speed.max ?
        this.controls.speed + speed.step :
        this.controls.speed;
    this.controls.noiseAmount = this.controls.noiseAmount < noise.max ?
        this.controls.noiseAmount + noise.step :
        this.controls.noiseAmount;
  }

  decreaseNoise() {
    const speed = this.animControls.speed;
    const noise = this.animControls.noise;

    if (this.controls.speed <= speed.min && this.controls.noiseAmount <=
        noise.min) return this.state = 'normal';

    const decelerationRate = 3;

    this.controls.speed = this.controls.speed > speed.min ?
        this.controls.speed - speed.step / decelerationRate :
        this.controls.speed;
    this.controls.noiseAmount = this.controls.noiseAmount > noise.min ?
        this.controls.noiseAmount - noise.step / decelerationRate :
        this.controls.noiseAmount;
  }

  set state(val) {
    this.bubbleState = val;
  }

  get state() {
    return this.bubbleState;
  }
}
