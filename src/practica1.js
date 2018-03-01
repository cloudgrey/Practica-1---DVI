/**
 * MemoryGame es la clase que representa nuestro juego. Contiene un array con la cartas del juego,
 * el número de cartas encontradas (para saber cuándo hemos terminado el juego) y un texto con el mensaje
 * que indica en qué estado se encuentra el juego
 */
var MemoryGame = MemoryGame || {};

/**
 * Constructora de MemoryGame
 * @param {CustomGraphicServer} gs el servidor grafico ya cargado y preconfigurado antes de iniciar una partida.
 */
MemoryGame = function(gs) { 

	//El array que contendrá todas las distintas cartas a encontrar presentes en la partida.
	this.arrayCartas = [];

	//Esta variable lleva la cuenta de los pares de cartas que se han ido hallando
	//para saber cuando acaba la partida.
	this.paresEncontrados = 0;

	//Contiene el estado de la partida y se ira modificando a medida que se avance
	//e interaccione con las cartas.
	this.textoEstadoJuego = "Memory Game";

	//Apunta al servidor grafico que se pasa como parametro en la constructora desde el fichero "auxiliar.js".
	this.servgraf = gs;

	//Esta variable lleva la cuenta de las cartas que se encuentran volteadas
	//para saber cuando comprobar si se han hallado dos iguales.
	this.cartasVolteadas = 0;

	//En esta variable se almacenará el valor necesario para parar setInterval
	//de la funcion draw una vez se hayan encontrado todas las parejas de cartas.
	this.intervalId = null;

	//Este booleano se pondra a true para impedir que se volteen (en onClic) 
	//mas cartas de las permitidas mientras se muestra al jugador brevemente que no ha encontrado una pareja.
	this.espera = false;


	/**
	 * Dibuja el juego: escribe el mensaje con el estado actual del juego y
	 * pide a cada una de las cartas del tablero que se dibujen.
	 */
	this.draw = function(){

		if(this.paresEncontrados == 8){
			this.textoEstadoJuego = "You win!!!";
		}
		this.servgraf.drawMessage(this.textoEstadoJuego);

		for(i = 0; i < this.arrayCartas.length; i++){
			if(this.arrayCartas[i].estado == "bocabajo"){
				this.servgraf.draw("back",i);
			}else{
				this.servgraf.draw(this.arrayCartas[i].nombreCarta,i);
			}
			
		}

		if(this.paresEncontrados == 8) clearInterval(this.intervalId);
	}

	/**
	 * Es el bucle del juego. Llama al método draw cada 16mś con la función setInterval de Javascript.
	 */
	this.loop = function(){
		this.intervalId = setInterval(this.draw.bind(this), 16);
	}

	/**
	 * Dado un array, lo modifica reordenando sus elementos de forma aleatoria y lo devuelve.
	 * @param {[MemoryGameCard]} array El array de cartas del juego, ordenado segun se cargaron las cartas
	 * @return {[MemoryGameCard]} El array de cartas del juego ya reordenado de forma aleatoria.
	 */
	this.shuffle = function(array) {

		var indiceActual = array.length, valorAux, indiceRandom;

		//Mientras que queden elementos a desordenar...
		while (indiceActual != 0){

			//Escogemos un elemento sobrante a traves de un indice...
			indiceRandom = Math.floor(Math.random() * indiceActual);
			indiceActual--;

			//Y lo intercambiamos con el elemento del indice actual.
			valorAux = array[indiceActual];
			array[indiceActual] = array[indiceRandom];
			array[indiceRandom] = valorAux;
		}

		return array;
	}

	/**
	 * Inicializa el juego creando las cartas (2 por cada tipo de carta), desordenándolas y comenzando el bucle de juego.
	 */
	this.initGame = function(){ 
		
 	 	var count = 0;
 	 	for(nombre in this.servgraf.maps){
 	 		if(nombre != "back"){
	 	 		carta = new MemoryGameCard(nombre);
	 	 		this.arrayCartas[count] = carta;
	 	 		count++;
 	 			carta = new MemoryGameCard(nombre);
	 	 		this.arrayCartas[count] = carta;
	 	 		count++;
 	 		}	
 	 	}
 	 	this.arrayCartas = this.shuffle(this.arrayCartas);
 	 	this.loop();
	}

	/**
	 * Dadas dos cartas, cada una de ellas llama a su función flip() cambiar su estado y, por tanto, voltearse.
	 * @param {MemoryGameCard} carta1 La primera de las dos cartas que se van a voltear.
	 * @param {MemoryGameCard} carta2 La segunda de las dos cartas que se van a voltear.
	 */
	voltea = function(carta1, carta2){
		carta1.flip();
		carta2.flip();
	}

	/**
	 * Este método se llama cada vez que el jugador pulsa sobre alguna de las cartas. 
	 * Es el responsable de voltear la carta y, si hay dos volteadas,
	 * comprobar si son la misma (en cuyo caso las marcará como encontradas). 
	 * En caso de no ser la misma las volverá a poner boca abajo.
	 * @param {int} cardId El número de la posicion en el array (tablero) de la carta clickada.
	 */
	this.onClick = function(cardId){
		
		if(!this.espera){

			if(cardId && this.arrayCartas[cardId]){ //si ha clicado dentro del tablero y ademas el clic ha sido sobre el sprite de una carta

				if(this.arrayCartas[cardId].estado == "bocabajo"){
					this.arrayCartas[cardId].flip();
					this.cartasVolteadas++;
				}
				
				if(this.cartasVolteadas == 2){

					var iguales = false;
					
					for(i = 0; i < this.arrayCartas.length; i++){
						if(this.arrayCartas[i].estado == "bocarriba" && i != cardId){
							iguales = this.arrayCartas[i].compareTo(this.arrayCartas[cardId].nombreCarta); 
							if(iguales){
								this.arrayCartas[i].found();
								this.arrayCartas[cardId].found();
								this.textoEstadoJuego = "Match found!";
								this.paresEncontrados++;
							}else{
								this.espera=true;
								this.textoEstadoJuego = "Try again :(";
								carta1 = this.arrayCartas[i];
								carta2 = this.arrayCartas[cardId];

								that = this;
								setTimeout(function() {
								    voltea(carta1, carta2);
								    that.espera = false;
								}, 1000);
							}
						}//if se ha hallado la otra carta que ya estaba bocarriba
					}//for
					this.cartasVolteadas = 0;
				}//if this.cartasVolteadas == 2

			}//control de clicar en sitios que no son cartas
			//else console.log("has clicado en algo que no es una carta");

		}//if !this.espera
	}//onClick

};


//---------------------------------------------------------------------------------------------------




/**
 * Constructora de las cartas del juego. Recibe como parámetro el nombre del sprite que representa la carta.
 * Dos cartas serán iguales si tienen el mismo sprite.
 * La carta puede guardar la posición que ocupa dentro del tablero para luego poder dibujarse
 * @param {string} id Nombre del sprite que representa la carta
 */
MemoryGameCard = function(id) {
	
	//El nombre (del sprite) de la carta que se esta tratando.
	this.nombreCarta = id;

	//Estado de la carta, el cual se ira actualizando durante la partida acorde a la interaccion con dicha carta.
	this.estado = "bocabajo";

	/**
	 * Da la vuelta a la carta, cambiando el estado de la misma.
	 */
	this.flip = function(){
		if(this.estado == "bocabajo"){
			this.estado = "bocarriba";
		}else if(this.estado == "bocarriba"){
			this.estado = "bocabajo";
		}
	}

	/**
	 * Marca una carta como encontrada, cambiando el estado de la misma.
	 */
	this.found = function(){
		this.estado = "encontrada";
	}

	/**
	 * Compara dos cartas mediante su nombre, devolviendo true si ambas representan la misma carta.
	 * @param {string} otherCard Nombre (del sprite) de la carta con la que queremos comparar la carta actual.
	 * @return {boolean} true si son la misma carta, false si son distintas.
	 */
	this.compareTo = function(otherCard){
		if(this.nombreCarta == otherCard) return true;
		else return false;
	}

};
