var MemoryGame = MemoryGame || {};
MemoryGame = function(gs) { 

	this.arrayCartas = [];
	this.numCartasEncontradas = 0;
	this.textoEstadoJuego = "Memory Game";
	this.servgraf = gs;
	this.cartasVolteadas = 0;
	this.intervalId = null;
	this.espera = false;

	this.draw = function(){

		if(this.numCartasEncontradas == 16){
			this.textoEstadoJuego = "You win!!!";
		}
		gs.drawMessage(this.textoEstadoJuego);

		for(i = 0; i < this.arrayCartas.length; i++){
			if(this.arrayCartas[i].estado == "bocabajo"){
				this.servgraf.draw("back",i);
			}else{
				this.servgraf.draw(this.arrayCartas[i].nombreCarta,i);
			}
			
		}

		if(this.numCartasEncontradas == 16)	clearInterval(this.intervalId);


	}

	this.loop = function(){
		this.intervalId = setInterval(this.draw.bind(this), 16);
	}


	this.shuffle = function(array) {

		var currentIndex = array.length, temporaryValue, randomIndex;

		// While there remain elements to shuffle...
		while (0 !== currentIndex) {

			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}

		return array;
	}

	this.initGame = function(){ 
		
 	 	var count = 0;
 	 	for(elemento in gs.maps){
 	 		if(elemento != "back"){
	 	 		carta = new MemoryGameCard(elemento);
	 	 		this.arrayCartas[count] = carta;
	 	 		count++;
 	 			carta = new MemoryGameCard(elemento);
	 	 		this.arrayCartas[count] = carta;
	 	 		count++;
 	 		}	
 	 	}
 	 	this.arrayCartas = this.shuffle(this.arrayCartas);
 	 	this.loop();
	}

	voltea = function(carta1, carta2){
		carta1.flip();
		carta2.flip();
	}

	this.onClick = function(cardId){
		
		if(!this.espera){

			this.arrayCartas[cardId].flip();
			this.cartasVolteadas++;

			var iguales = false;

			if(this.cartasVolteadas == 2){
				for(i = 0; i < this.arrayCartas.length; i++){
					if(this.arrayCartas[i].estado == "bocarriba" && i != cardId){
						iguales = this.arrayCartas[i].compareTo(this.arrayCartas[cardId].nombreCarta); 
						if(iguales){
							this.arrayCartas[i].found();
							this.arrayCartas[cardId].found();
							this.textoEstadoJuego = "Match Found";
							this.numCartasEncontradas += 2;
						}else{
							this.espera=true;
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
				}//for
				this.cartasVolteadas = 0;
			}//if this.cartasVolteadas == 2
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
	
	this.nombreCarta = id;
	this.estado = "bocabajo";

	this.flip = function(){
		if(this.estado == "bocabajo"){
			this.estado = "bocarriba";
		}else{
			this.estado = "bocabajo";
		}
	}

	this.found = function(){
		this.estado = "encontrada";
	}

	this.compareTo = function(otherCard){
		if(this.nombreCarta == otherCard) return true;
		else return false;
	}

};
