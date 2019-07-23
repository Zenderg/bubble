import resize from './events/resize';

export default class Events {
  static init(renderer, camera) {
    window.addEventListener('resize', resize(renderer, camera))
  }
}
