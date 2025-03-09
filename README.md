# Proyecto final - Tamagochis

#### David Rivas Rodriguez
#### Desarrollo de Aplicaciones Web
##

## Finalidad
Un juego de matar al resto de jugadores donde podrás moverte por las casillas de un tablero definido y disparar a los enemigos, solo se puede avanzar hacia delante, rotar en sentido horario y disparar hacia donde estes mirando a la casilla siguiente, ademas se podra esconder en los diferentes arbustos que hay por el tablero.

## Descripcion del Codigo
###### Doy por hecho que la descripción de codigo debe ser algo como lo que se preguntó en clase como fué el flujo de la aplicación desde que se une un jugador, ya que esto engloba paracticamente la aplicacion en su totalidad.

Primero cuando un jugador se conecta se emite un mensaje "register", con este el servidor crea un jugador, para ello lo crea mediante la informacion del socket para posteriormente poder diferenciarlo entre los demas jugadores y gestionarlo de forma individual y valores de posicion por defecto que luego serán modificados.

Al crearse se agrega en una sala que sera creada en caso de que no haya ninguna disponible ya sea porque no haya aun ninguna creada o la que haya esté completa. En este paso es donde se le asigna la esquina en la que aparecerá el jugador al iniciar la partida ya que hasta que la sala no esté completa no se mostrará el tablero ni los jugadores. A la hora de asignar una esquina a un jugador usamos los metodos .filter sobre el array de jugadores de la sala para ver el resto de jugadores excepto este que estamos agregando y creando un array simplemente de posiciones x e y, luego usamos de nuevo .filter sobre nuestro array de esquinas que definimos arriba junto a un .some sobre el array de posiciones creado anteriormente para comprobar cuales son las esquinas que no estan ocupadas para asignarlas al jugador de forma aleatoria y se emite la informacion del jugador al cliente.

Siempre que se agrega un jugador a una sala se comprueba si esta llena, si lo esta se pone en estado PLAYING la sala, y se emite un mensaje al cliente con la room, el mensaje y su contenido.

En el momento de crear el juego en caso de que la sala tenga 1 jugador se genera el tablero mediante el BoardBuilder.ts en el que se gestiona el tamaño NxN del tablero y la aleatoria de los arbustos tambien definidos como N en su constructor.

El cliente recibe este mensaje y dependiendo del tipo (en este caso BOARD, en el caso del jugador NEW_PLAYER, pero la funcionalidad es la misma) lo agrega al scheduler para que lo gestione y en cuanto le "toque el turno" se ejecute para que asi no haya procesos pendientes antes de ejecutar otros y no llegue la informacion necesaria.

A la hora de dibujar el tablero en el cliente, se llama a la funcion drawBoard de UIv1 ya que la aplicacion esta diseñada para ser modular, es decir, podrían haber varios UIvX y pasarlos como parametro en el index.js dependiendo de la funcionalidad que podriamos agregar a estos posibles UIvX.
La función drawBoard genera el tablero de forma que depende del tamaño que se ha asignado en el Servidor y simplemente recorre todas las coordenadas siendo cada una de ellas las losas y comprueba si en el Array de Elements del tablero esas coordenadas pertenecen a un arbusto y lo posiciona ahí.

Cuando se dibujan los jugadores con la funcion drawPlayer, se encuentra donde esta posicionado cada jugador actualizando asi su posicion y rotacion que llegan desde el servidor que es el encargado de su gestionamiento, ademas tambien comprueba si el usario esta en un arbusto y en ese caso lo esconde para todos los jugadores.

### Funcionalidad botones
Los botones unicamente se encargan de emitir el id del jugador y el mensaje al servidor mediante el scheduler y que este lo procese, dependiendo de la acción, ya sea FORWARD para avanzar, ROTATE para rotar o SHOOT para disparar (no implementado aún).

Cuando llega uno de estos mensajes al servidor, este lo procesa como se debe, ya sea actualizando la posicion del jugador que le ha llegado o la rotacion de este y vuelve a emitir un mensaje al cliente con la informacion ya procesada para que este simplemente lo refleje en el juego. Asi logramos que se separe la logica del Servidor y del Cliente.

Usamos la funcion asincrona do_move para enviar al servidor mediante un emit un mensaje de tipo "MOVE" que es el que engloba el avanzar (FORWARD) o el rotar (ROTATE) ademas del contenido que es el jugador y la accion a ejecutar.
Cuando llega al servidor se busca la sala de la que proviene ese jugador mediante su id y la funcion updatePlayerPosition es la que se encarga de generar la informacion debida, es decir, se le proporciona por parametro el jugador, la sala y la accion, si la accion es avanzar, primero se guardan cuales son los bordes del tablero (para que no haya posibilidad de que el jugador se salga del espacio de juego), y en caso dependiendo de cual es la direccion a la que mira el jugador se le suma o resta en su X o Y, y antes de asignarlo se comprueba que las coordenadas nuevas estén dentro del tablero de juego.

Antes de ser enviado al cliente la informacion se comprueba si en la nueva posicion en la que se encuentra el jugador es un arbusto, en caso de que si, se modifica su visibilidad para que cuando el cliente lo procese lo esconda. Cuando un jugador sale de un arbusto, hace este mismo recorrido y como el condicional de que es un arbusto es falso, vuelve a asignarse en true la visibilidad para que ya aparezca en el cliente.


Todos los mensajes que se envian desde el servidor al cliente usan la funcion sendMessage, que es una funcion generica que se ha creado expresamente para enviar todo tipo de mensajes ya que se encarga de enviar por el .emit("message") al cliente cualquier mensaje, ya que la estructura en todos ellos es la misma, un tipo y un contenido para que el cliente reciba la informacion correctamente y pueda interpretarlo.




## Rúbrica

1. **Diseño del Tablero y Mecánicas de Juego (20 puntos)**
   - ✅ Implementación de un tablero de tamaño NxN correctamente generado.
   - ✅ Configuración inicial de los jugadores en las esquinas del tablero.
   - ❌ Implementación de ataques entre jugadores con reglas de distancia.
   - ✅ Implementación de casillas de escondite con normas de posicionamiento adecuadas.

2. **Comunicación Cliente-Servidor con WebSockets (20 puntos)**
   - ✅ Configuración del servidor para manejar conexiones de clientes vía WebSockets.
   - ✅ Envío y recepción de mensajes de manera eficiente entre cliente y servidor.
   - ✅ Sincronización en tiempo real del estado del juego en todos los clientes conectados.
   - ❌ Manejo de desconexiones y reconexiones de jugadores sin afectar la partida.

3. **Implementación del Cliente y Eventos del Juego (20 puntos)**
   - ✅ Representación visual dinámica del tablero y los jugadores según datos del servidor.
   - ✅ (A excepcion del disparo) Implementación de eventos de juego: desplazamiento, rotación y disparo.
   - ✅ Diseño de una interfaz intuitiva para la interacción del jugador.
   - ✅ Adaptabilidad del cliente a posibles rediseños o mejoras futuras.

4. **Gestión de Salas y Control de Juego (20 puntos)**
   - ✅ Implementación de salas para gestionar partidas independientes.
   - ✅ Control centralizado del estado del juego en el servidor.
   - ✅ Compartición eficiente de datos del mapa entre todos los clientes.
   - ❌ Manejo de finalización de partidas y asignación de ganadores.

5. **Uso de Buenas Prácticas de Programación y Patrones de Diseño (10 puntos)**
   - ✅ Uso adecuado de clases, objetos JSON y patrones de diseño.
   - ❌ (Mejorable) Código modular y bien estructurado que facilite la escalabilidad.

6. **Nivel Avanzado: Adaptación a Angular (10 puntos)**
   - ❌ Refactorización del cliente para adaptarlo a Angular.
   - ❌ Implementación de servicios y componentes en Angular para la gestión del juego.

## Resumen Objetivos
En general creo que los objetivos han sido logrados aunque con algunos defectos, el codigo obviamente es mejorable aunque es funcional y separa la logica del Servidor y del Cliente. Por otra parte ha quedado pendiente la parte de disparar/matar, la desconexion/reconexion de jugadores o la finalizacion de partidas con ganadores, además de la parte de adaptación a Angular.

Otra cosa que no se si realmente mejoraria la aplicacion o no, sería el separar por capas el tablero/arbustos/jugadores ya que actualmente estan los arbustos como background de las losas del tablero y los jugadores como un background del before de las losas y pienso que a lo mejor esto podria influir en un futuro en caso de querer agregar mas elementos y funcionalidades al juego.