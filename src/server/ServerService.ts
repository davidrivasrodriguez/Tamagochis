import { DefaultEventsMap, Server, Socket } from "socket.io";
import http from "http";
import { GameService } from "../game/GameService";
import { Messages } from "../game/entities/Game";
import { RoomService } from "../room/RoomService";

export class ServerService {
  private io: Server<
    DefaultEventsMap,
    DefaultEventsMap,
    DefaultEventsMap,
    any
  > | null;
  private active: boolean;
  static messages = {
    out: {
      new_player: "NEW_PLAYER",
    },
  };

  public inputMessage = [
    {
      type: "HELLO",
      do: this.doHello,
    },
    {
      type: "BYE",
      do: this.doBye,
    },
  ];

  private static instance: ServerService;
  private constructor() {
    this.io = null;
    this.active = false;
  }

  static getInstance(): ServerService {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ServerService();
    return this.instance;
  }

  public init(
    httpServer: http.Server<
      typeof http.IncomingMessage,
      typeof http.ServerResponse
    >
  ) {
    this.io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });
    this.active = true;

    this.io.on("connection", (socket) => {
      socket.emit("connectionStatus", { status: true });
      // const newPlayer = GameService.getInstance().buildPlayer(socket);
      // GameService.getInstance().addPlayer(newPlayer);

      socket.on("register", () => {
        const newPlayer = GameService.getInstance().buildPlayer(socket);
        GameService.getInstance().addPlayer(newPlayer);
      });


      socket.on("message", (data) => {
        if (data.type === Messages.UPDATE_POSITIONS) {
          const player = data.content.players[0];
          const room = RoomService.getInstance().findRoomByPlayerId(player.id);
          if (room) {
            socket.join(room.name.toString());
            GameService.getInstance().updatePlayerPosition(
              socket.id,
              room.name.toString(),
              {
                x: player.x,
                y: player.y,
                direction: player.direction,
              }
            );
          }
        } else if (data.type === "MOVE") {
          const { playerId, action } = data.content;
          console.log("MOVE received for playerId:", playerId, "with action:", action);
          const room = RoomService.getInstance().findRoomByPlayerId(playerId);
          if (room) {
            socket.join(room.name.toString());
            const updated = GameService.getInstance().updatePlayerPosition(
              playerId,
              room.name.toString(),
              { action }
            );
            if (updated) {
              const players = GameService.getInstance()
                .getPlayersForRoom(room.name.toString())
                .map((player) => ({
                  id: player.id,
                  x: player.x,
                  y: player.y,
                  direction: player.direction,
                  visibility: player.visibility,
                }));
              const updatePayload = { players };
              ServerService.getInstance().sendMessage(
                room.name,
                Messages.UPDATE_POSITIONS,
                updatePayload
              );
            }
          }
        } 
        // else if (data.type === "SHOOT") {
        //   console.log("SHOOT received at Server Service");
        // }
      });

      socket.on("disconnect", () => {
        console.log("Un cliente se ha desconectado:", socket.id);
      });
    });
  }

  public addPlayerToRoom(player: Socket, room: String) {
    player.join(room.toString());
  }

  public sendMessage(room: String | null, type: String, content: any) {
    console.log(content);
    if (this.active && this.io != null) {
      // console.log("Enviando mensaje a la sala:", room);
      if (room != null) {
        this.io?.to(room.toString()).emit("message", {
          type,
          content,
        });
      }
    }
  }


  public isActive() {
    return this.active;
  }

  private doHello(data: String) {
    console.log("Hola");
    console.log(data);
  }

  private doBye(data: String) {
    console.log("Adios");
    console.log(data);
  }
}
