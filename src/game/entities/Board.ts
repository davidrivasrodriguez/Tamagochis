import { Player } from "../../player/entities/Player";
export interface Element {
    x : number;
    y : number;
    occupied : boolean;
    player : Player | null; // Para que pueda asignarlo en BoardBuilder.ts como null
    bush : boolean;
}

export interface Board {
    size: number;
    elements: Array<Element>;
    maxBushes: number;
}