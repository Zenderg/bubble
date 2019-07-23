import {mousePos} from "../helpers";

const event = sphere => event => {
    const coefEffect = 1;

    const {x, y} = mousePos(event);

    sphere.position.x = -x * coefEffect;
    sphere.position.y = -y * coefEffect;
};

export default event;