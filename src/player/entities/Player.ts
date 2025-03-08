import { Socket } from "socket.io";

export enum Directions {
  Up = "UP",
  Right = "RIGHT",
  Down = "DOWN",
  Left = "LEFT",
  Idle = "IDLE",
}

export enum PlayerStates {
  No_Connected,
  Idle,
  Moving,
  Hidden,
  Dead,
}

export interface Player {
  id: string;
  socket: Socket;
  name: string;
  x: number;
  y: number;
  direction: string;
  state: PlayerStates;
  visibility: boolean;
}
