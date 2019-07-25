export default class Actions {
  state = 'normal';
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
      normalize: this.normalizeNoise
    };
  }

  update() {
    this.actions[this.state].call(this);
  }

  increaseNoise(speedLimit = this.animControls.speed.max, noiseLimit = this.animControls.noise.max) {
    const speed = this.animControls.speed;
    const noise = this.animControls.noise;
    const speedCnl = this.controls.speed;
    const noiseCnl = this.controls.noiseAmount;

    if (speedCnl >= speed.max && noiseCnl >= noise.max) {
      return this.state = 'decrease';
    }

    this.controls.speed = speedCnl < speedLimit
        ? speedCnl + speed.step
        : speedCnl;
    this.controls.noiseAmount = noiseCnl < noiseLimit
        ? noiseCnl + noise.step
        : noiseCnl;
  }

  decreaseNoise() {
    const speed = this.animControls.speed;
    const noise = this.animControls.noise;
    const speedCnl = this.controls.speed;
    const noiseCnl = this.controls.noiseAmount;

    if (speedCnl <= speed.min && noiseCnl <= noise.min) {
      return this.state = 'normal';
    }

    const decelerationRate = 3;

    this.controls.speed = speedCnl > speed.min
        ? speedCnl - speed.step / decelerationRate
        : speedCnl;
    this.controls.noiseAmount = noiseCnl > noise.min
        ? noiseCnl - noise.step / decelerationRate
        : noiseCnl;
  }

  normalizeNoise() {
    const speed = this.animControls.speed;
    const noise = this.animControls.noise;
    const speedCnl = this.controls.speed;
    const noiseCnl = this.controls.noiseAmount;

    if(speedCnl < speed.min || noiseCnl < noise.min ) {
      this.increaseNoise(speed.min, noise.min);
    } else if(speedCnl > speed.min && noiseCnl > noise.min) {
      this.decreaseNoise();
    } else {
      this.state = 'normal';
    }
  }

  set anims(obj){
    this.animControls.speed = {...this.animControls.speed, ...obj.speed};
    this.animControls.noise = {...this.animControls.noise, ...obj.noise};
  }

  get anims(){
    return this.animControls;
  }
}
