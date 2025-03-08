export class Player {
    #x = null;
    #y = null;
    #status = null;
    #direction = null;
    #visibility = true;

    #statuses = {
        ALIVE: 0,
        DEATH: 1,
        HIDDEN: 2,
    };

    constructor() {
        this.#x = 0;
        this.#y = 0;
        this.#status = this.#statuses.ALIVE;
        this.#direction = Directions.UP;
    }
};

export const Directions = {
        UP: 270,
        RIGHT: 0,
        DOWN: 90,
        LEFT: 180,
};