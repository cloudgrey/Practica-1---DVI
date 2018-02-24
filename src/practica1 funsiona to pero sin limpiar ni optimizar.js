/*
En este archivo crearemos las dos clases necesarias
para nuestra práctica y que deberemos implementar: MemoryGame y MemoryGameCard
*/



/*

 MemoryGame es la clase que representa nuestro juego.
 Esta clase es la responsable de decidir cuándo ha terminado el juego.

 Contiene estos ATRIBUTOS:
 - un array con la cartas del juego,
 - el número de cartas encontradas en cada momento(para saber cuándo hemos terminado el juego)
 - y un texto con el mensaje que indica en qué estado se encuentra el juego en cada momento
   (irá cambiando a medida que interactuamos con el juego).
 - ha de tener una referencia al servidor gráfico para poder dibujar el estado del juego. 

  Esta clase ha de implementar al menos los siguientes MÉTODOS:
 - MemoryGame(gs): La constructora.
 - initGame()
 - draw()
 - loop()
 - onClick(cardId)

*/

var MemoryGame = MemoryGame || {};
MemoryGame = function(gs) { //Constructora de MemoryGame
	//recibe como parámetro el servidor gráfico, usado posteriormente para dibujar

	this.arrayCartas = [];
	this.numCartasEncontradas = 0;
	this.textoEstadoJuego = "Memory Game";
	this.servgraf = gs;
	this.cartasVolteadas = 0;
	this.intervalId = null;
	this.espera = false;

	this.draw = function(){
		/*
		Dibuja el juego siguiendo estos pasos: 
	 	(1) escribe el mensaje con el estado actual del juego y 
	 	(2) pide a cada una de las cartas del tablero que se dibujen.
		*/

		//tiene que comprobar si esta bocabajo o bocarriba


		if(this.numCartasEncontradas == 16){
			this.textoEstadoJuego = "You win!!!";
		}
		gs.drawMessage(this.textoEstadoJuego);

		//console.log("Entra a draw");
		//console.log(this.arrayCartas);
		for(i = 0; i < this.arrayCartas.length; i++){
			if(this.arrayCartas[i].estado == "bocabajo"){
				this.servgraf.draw("back",i);
			}else{
				this.servgraf.draw(this.arrayCartas[i].nombreSprite,i);
			}
			
		}

		if(this.numCartasEncontradas == 16)	clearInterval(this.intervalId);


	}

	this.loop = function(){
		/*
		Es el bucle del juego. En este caso es muy sencillo: 
	 	llamamos al método draw cada 16ms (equivalente a unos 60fps) y  
	 	esto se realizará con la función setInterval de Javascript.
		*/

		//console.log("Entra a loop");
		//console.log(this.arrayCartas);
		//var intervalId = setInterval(draw, 16);

		//llamando a this.draw() esperamos que devuelva algo, pero draw no devuelve nada
		//entonces da undefined
		this.intervalId = setInterval(this.draw.bind(this), 16); //cuidado con el bind, investigar
	}

	this.initGame = function(){ 
		/*
		Inicializa el juego creando las cartas (recuerda que son 2 de cada tipo de carta),
 	 	desordenándolas y comenzando el bucle de juego.
 	 	*/

 	 	//console.log("Entra a initGame");
 	 	//console.log(gs.maps[2]);
 	 	var count = 0;
 	 	for(elemento in gs.maps){
 	 		//console.log(elemento);
 	 		if(elemento != "back"){
 	 			carta = new MemoryGameCard(elemento);
 	 			cartaIgual = new MemoryGameCard(elemento);
	 	 		this.arrayCartas[count] = carta;
	 	 		count++;
	 	 		this.arrayCartas[count] = cartaIgual;
	 	 		//console.log(this.arrayCartas[count]);
	 	 		//console.log(this.arrayCartas.length);
	 	 		count++;
 	 		}
 	 		
 	 		
 	 	}

 	 	//console.log(this.arrayCartas);

 	 	this.loop();
 	 	
	}

	voltea = function(carta1, carta2){
		carta1.flip();
		carta2.flip();
	}

	this.onClick = function(cardId){

		/*
		 Este método se llama cada vez que el jugador pulsa 
		 sobre alguna de las cartas (identificada por el número que ocupan en el array de cartas del juego).
	     Es el responsable de:
	      - voltear la carta
	      - si hay dos volteadas:
	        - comprueba si son la misma (en cuyo caso las marcará como encontradas).
	   		- en caso de no ser la misma las volverá a poner boca abajo (OJO)

			(OJO): Para realizar la animación que aparece en el vídeo se puede utilizar la función setTimeout,
	 		haciendo que pasados unos cuantos milisegundos las cartas se pongan boca abajo.
	  		¡Cuidado!: para evitar comportamientos extraños tendrás que ignorar los eventos de ratón
	   		mientras que la carta está siendo volteada.
		*/

		
		if(!this.espera){

			this.arrayCartas[cardId].flip();
			this.cartasVolteadas++;

			var iguales = false;

			if(this.cartasVolteadas == 2){
				for(i = 0; i < this.arrayCartas.length; i++){
					if(this.arrayCartas[i].estado == "bocarriba" && i != cardId){
						iguales = this.arrayCartas[i].compareTo(this.arrayCartas[cardId].nombreSprite); 
						if(iguales){
							this.arrayCartas[i].found();
							this.arrayCartas[cardId].found();
							this.textoEstadoJuego = "Match Found";
							this.numCartasEncontradas += 2;
						}else{
							//console.log("HUH?");
							this.espera=true;
							//setTimeout(this.arrayCartas[i].flip(), 2000);
							//setTimeout(this.arrayCartas[cardId].flip(), 2000);
							this.textoEstadoJuego = "Try Again";
							carta1 = this.arrayCartas[i];
							carta2 = this.arrayCartas[cardId];

							that = this;
							setTimeout(function() {
							    voltea(carta1, carta2);
							    that.espera = false;
							}, 1000);
							
							
						}
					}
				}

				this.cartasVolteadas = 0;
			}

		}//espera
		

		
		//console.log("Entra a onClick: " + cardId);
		//console.log("HAS CLICKADO");
	}

};


//---------------------------------------------------------------------------------------------------

/*

Esta clase representa la cartas del juego.
  Una carta puede estar en tres posibles estados:
  boca abajo, boca arriba o encontrada.
  Una carta se identifica por el nombre del sprite que la dibuja,
  los nombres de los sprites que se proporcionan con el juego son:
   - 8-ball, potato, dinosaur, kronos, rocket, unicorn, guy, zeppelin. 
   - Hay un sprite adicional llamado back que se utiliza para mostrar las cartas que están boca abajo.

  Esta clase ha de implementar al menos los siguientes MÉTODOS:
• MemoryGameCard(sprite): Constructora.
• flip()
• found()
• compareTo(otherCard)
• draw(gs, pos)

*/


/**
 * Constructora de las cartas del juego. Recibe como parámetro el nombre del sprite que representa la carta.
 * Dos cartas serán iguales si tienen el mismo sprite.
 * La carta puede guardar la posición que ocupa dentro del tablero para luego poder dibujarse
 * @param {string} id Nombre del sprite que representa la carta
 */
MemoryGameCard = function(id) { //Constructora
	//recibe el nombre del sprite que representa la carta. Las cartas han de crearse boca abajo.

	this.nombreSprite = id;
	this.estado = "bocabajo";
	//console.log("HOLI");
	//console.log(gs);

	this.flip = function(){
		//Da la vuelta a la carta, cambiando el estado de la misma
		if(this.estado == "bocabajo"){
			this.estado = "bocarriba";
		}else{
			
			this.estado = "bocabajo";
		}
		
	}

	this.found = function(){
		//Marca una carta como encontrada, cambiando el estado de la misma.
		this.estado = "encontrada";
	}

	this.compareTo = function(otherCard){
		//Compara dos cartas, devolviendo true si ambas representan la misma carta.
		//console.log("COMPARE TO");
		//console.log("otherCard = " + otherCard);
		//console.log("nombreSprite = " + this.nombreSprite);
		if(this.nombreSprite == otherCard) return true;//console.log("IGUALES");
		else return false;//console.log("DESIGUALES");
	}

};
