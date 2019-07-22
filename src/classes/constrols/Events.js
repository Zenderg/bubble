import Resize from './events/Resize';

export default class Events {
  static init(renderer, camera) {
    window.addEventListener('resize', Resize.event(renderer, camera))
  }
}
