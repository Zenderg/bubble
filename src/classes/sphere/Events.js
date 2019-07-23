export default class Events {
  static init(renderer, camera) {
    document.addEventListener('click', Click.event())
  }
}
