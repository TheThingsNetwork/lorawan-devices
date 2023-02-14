/*===============================================================================================================================
	Fichier				: decodeur.js
	Objectif(s)			: Décoder la trame du client
	Auteur				: Pelcener Thiabaut
	Date de création	: Janvier 2023
	Date de modification: Janvier 2023
===============================================================================================================================*/
        /*
      ___                                   ___     
     /  /\          ___       ___          /__/\    		
    /  /::\        /  /\     /  /\        |  |::\   
   /  /:/\:\      /  /:/    /  /:/        |  |:|:\  
  /  /:/~/::\    /  /:/    /__/::\      __|__|:|\:\ 
 /__/:/ /:/\:\  /  /::\    \__\/\:\__  /__/::::| \:\
 \  \:\/:/__\/ /__/:/\:\      \  \:\/\ \  \:\~~\__\/
  \  \::/      \__\/  \:\      \__\::/  \  \:\      
   \  \:\           \  \:\     /__/:/    \  \:\     
    \  \:\           \__\/     \__\/      \  \:\    
     \__\/                                 \__\/    
  
*/

// ==============================================================================================================================
// Déclaration des constantes relatives aux différents types de trames
// ==============================================================================================================================	

	const TYPE_KEEP_ALIVE   	 = 0x81; //Trame de vie 
	const TYPE_NETWORK_TEST 	 = 0x82; //Trame de test réseau 
	const TYPE_TEST_FRAME   	 = 0x85; //Trame de test 
	const TYPE_THOLD_ALERT  	 = 0x8D; //Trame d'alert 
	const TYPE_ERREUR        	 = 0x8E; //Trame d'erreur 
	const TYPE_SPECIFIC     	 = 0x8F; //Trame specific
	const TYPE_MESURE     	 	 = 0xA0; //Trame de mesure

// ==============================================================================================================================
// Déclaration des constantes relatives aux différentes mesures
// ==============================================================================================================================	
	
	const TYPE_TEMP 		 	 = 0x08; //température -196°C --> 200°C
	const TYPE_TEMP2		 	 = 0x18; //température -196°C --> 200°C voie 1 pour les TMxP et TCR
	const TYPE_RH 				 = 0x09; //Humidité 0 - 100%
	const TYPE_COV 			 	 = 0x0C; //Indice COV 0 - 500
	const TYPE_CO2 			 	 = 0x0D; //Co2 2 bytes 0-65535 ppm
	const TYPE_ENTREE			 = 0X01; //Entrée à l'etat 1
	const TYPE_ENTREE2			 = 0X00; //Entrée à l'etat 0
	
// ==============================================================================================================================
// Déclaration des constantes relatives aux différents messages d'erreurs
// ==============================================================================================================================

	const ERR_SENSOR_NO_DATA  			  = 0x81; //Impossible de lire une température/humidité sur le capteur.
	const ERR_BUF_SMALLER 			 	  = 0x82; //Le tableau de données est plein, impossible d’y écrire des données supplémentaires
	const ERR_DEPTH_HISTORIC_OUT_OF_RANGE = 0x83; //La profondeur d’historique est trop grande ou trop petite pour la trame
	const ERR_NB_SAMPLE_OUT_OF_RANGE 	  = 0x84; //Le nombre d’échantillon est trop grand ou trop petit pour la trame
	const ERR_NWAY_OUT_OF_RANGE 		  = 0x85; //Le nombre de voie dans l’entête de la trame est trop grand ou trop petit
	const ERR_TYPEWAY_OUT_OF_RANGE 		  = 0x86; //Le type de mesure dans l’entête de la trame est trop grand ou trop petit
	const ERR_SAMPLING_PERIOD 			  = 0x87; //Mauvaise structure de période d’échantillonnage
	const ERR_SUBTASK_END 				  = 0x88; //Fin d’une sous tache après être sortie d’une boucle infinie
	const ERR_NULL_POINTER 				  = 0x89; //Pointeur avec valeur “NULL”
	const ERR_BATTERY_LEVEL_DEAD 		  = 0x8A; //Niveau de batterie critique
	const ERR_EEPROM 					  = 0x8B; //EEPROM est corrompue
	const ERR_ROM 						  = 0x8C; //ROM est corrompue
	const ERR_RAM 						  = 0x8D; //RAM est corrompue
	const ERR_ARM_INIT_FAIL 			  = 0x8E; //L’initialisation du module radio a échoué
	const ERR_ARM_BUSY 					  = 0x8F; //Le module est déjà occupé (possiblement non initialisé)
	const ERR_ARM_BRIDGE_ENABLE 		  = 0x90; //Le module est en mode bridge, impossible d’envoyer desdonnées par radio
	const ERR_RADIO_QUEUE_FULL 			  = 0x91; //Le buffer de la radio est plein
	const ERR_CFG_BOX_INIT_FAIL 		  = 0x92; //Erreur lors de l’initialisation de la black box
	const ERR_KEEP_ALIVE_PERIOD 		  = 0x93; //Mauvaise structure de période de trame de vie
	const ERR_ENTER_DEEP_SLEEP 			  = 0x94; //Le produit est passé en mode veille profonde
	const ERR_BATTERY_LEVEL_LOW 		  = 0x95; //Niveau de batterie faible
	const ERR_ARM_TRANSMISSION 			  = 0x96; //Une transmission a été initialisé mais une erreur est survenue
	const ERR_ARM_PAYLOAD_BIGGER 	      = 0x97; //La taille du message est trop grande par rapport à la capacité du réseau
	const ERR_RADIO_PAIRING_TIMEOUT 	  = 0x98; //Impossible de s’appairer à un réseau avant le temps imparti
	const ERR_SENSORS_TIMEOUT 			  = 0x99; //Un timeout a été atteint sur le capteur
	const ERR_SENSOR_STOP 				  = 0x9A; //Le capteur n’a pas retourné de valeur lors d’une lecture	
	const ERR_SENSORS_INIT_FAIL 		  = 0x9B; //Le capteur de température humidité n’est pas détecté au démarrage
	const ERR_BOX_OPENED 				  = 0X9C; //Ouverture du boitier
	const ERR_BOX_CLOSED				  = 0X9D; //Fermeture du boitier
	const ERR_SENSORS_MOVE 				  = 0x9E; //Détection d’un déplacement/vol sur le produit
	const ERR_SENSOR_CRC_KO 			  = 0x9F; //Données du capteur de température humidité corrompues
	

// ==============================================================================================================================
// fonctions de convertion, afin de convertir l'hexadécimal en valeur concrète pour l'utilisateur
// ==============================================================================================================================    

	function bin16dec(bin) {
    	var num = bin & 0xFFFF;
    	if (0x8000 & num)
       		num = -(0x010000 - num);
    	return num;
	}

	function bin8dec(bin) {
   		var num = bin & 0xFF;
    	if (0x80 & num)
        	num = -(0x0100 - num);
    	return num;
	}

	function hexToBytes(hex) {
    	for (var bytes = [], c = 0; c < hex.length; c += 2)
        	bytes.push(parseInt(hex.substr(c, 2), 16));
    	return bytes;
	}


// ==============================================================================================================================
// Algorithme de decodage, afin de déterminer de quel type de trame il s'agit
// ==============================================================================================================================	
	
	function getFrameType(frame) {
    	const frameTypeCode1 = parseInt(frame.substr(0, 2), 16);
    	const frameTypeCode2 = parseInt(frame.substr(10, 2), 16);
    	let frameType;

    	if (frameTypeCode1 === TYPE_KEEP_ALIVE || frameTypeCode2 === TYPE_KEEP_ALIVE) {
        	frameType = "Trame de vie";
    	} else if (frameTypeCode1 === TYPE_NETWORK_TEST || frameTypeCode2 === TYPE_NETWORK_TEST) {
        	frameType = "Trame de test réseau";
    	} else if (frameTypeCode1 === TYPE_TEST_FRAME || frameTypeCode2 === TYPE_TEST_FRAME) {
        	frameType = "Trame de test";
    	} else if (frameTypeCode1 === TYPE_THOLD_ALERT || frameTypeCode2 === TYPE_THOLD_ALERT) {
        	frameType = "Trame d'alert";
    	} else if (frameTypeCode1 === TYPE_ERREUR || frameTypeCode2 === TYPE_ERREUR) {
        	frameType = "Trame d'erreur";
    	} else if (frameTypeCode1 === TYPE_SPECIFIC || frameTypeCode2 === TYPE_SPECIFIC) {
        	frameType = "Trame spécifique";
    	} else if (frameTypeCode1 === TYPE_MESURE || frameTypeCode2 === TYPE_MESURE) {
        	frameType = "Trame de mesure";
    	} else {
        	frameType = "Type de trame inconnu";
    	}
    return frameType;
	}


// ==============================================================================================================================
// Algorithme de decodage, afin de déterminer de quel message d'erreur il s'agit
// ==============================================================================================================================

	function getFrameErreur(frame) {
   		const frameErreurCode =	parseInt(frame.substr(frame.length -2, 2), 16);
 		var frameErreur = {};
 		
 		switch (frameErreurCode) {
			case ERR_SENSOR_NO_DATA:
				frameErreur = "Impossible de lire une température/humidité sur le capteur";
				break;
			case ERR_BUF_SMALLER:
				frameErreur = "Le tableau de données est plein, impossible d’y écrire des données supplémentaires";
				break;
			case ERR_DEPTH_HISTORIC_OUT_OF_RANGE:
				frameErreur = " La profondeur d’historique est trop grande ou trop petite pour la trame";
				break;
			case ERR_NB_SAMPLE_OUT_OF_RANGE:
				frameErreur = "Le nombre d’échantillon est trop grand ou trop petit pour la trame";
				break;
			case ERR_NWAY_OUT_OF_RANGE:
				frameErreur = "Le nombre de voie dans l’entête de la trame est trop grand ou trop petit";
				break;
			case ERR_TYPEWAY_OUT_OF_RANGE:
				frameErreur = "Le type de mesure dans l’entête de la trame est trop grand ou trop petit";
				break;
			case ERR_SAMPLING_PERIOD:
				frameErreur = "Mauvaise structure de période d’échantillonnage";
				break;
			case ERR_SUBTASK_END:
				frameErreur = "Fin d’une sous tache après être sortie d’une boucle infinie";
				break;
			case ERR_NULL_POINTER:
				frameErreur = "Pointeur avec valeur “NULL”";
				break;
			case ERR_BATTERY_LEVEL_DEAD:
				frameErreur = "Niveau de batterie critique";
				break;
			case ERR_EEPROM:
				frameErreur = "EEPROM est corrompue";
				break;
			case ERR_ROM:
				frameErreur = "ROM est corrompue";
				break;
			case ERR_RAM:
				frameErreur = "RAM est corrompue";
				break;
			case ERR_ARM_INIT_FAIL:
				frameErreur = "L'initialisation du module radio a échoué";
				break;
			case ERR_ARM_BUSY:
				frameErreur = "Le module est déjà occupé (possiblement non initialisé)";
				break;
			case ERR_ARM_BRIDGE_ENABLE:
				frameErreur = "Le module est en mode bridge, impossible d'envoyer des données par radio";
				break;
			case ERR_RADIO_QUEUE_FULL:
				frameErreur = "Le buffer de la radio est plein";
				break;
			case ERR_CFG_BOX_INIT_FAIL:
				frameErreur = "Erreur lors de l'initialisation de la black box";
				break;
			case ERR_KEEP_ALIVE_PERIOD:
				frameErreur = "Mauvaise structure de période de trame de vie";
				break;
			case ERR_ENTER_DEEP_SLEEP:
				frameErreur = "Le produit est passé en mode veille profonde";
				break;
			case ERR_BATTERY_LEVEL_LOW:
				frameErreur = "Niveau de batterie faible";
				break;
			case ERR_ARM_TRANSMISSION:
				frameErreur = "Une transmission a été initialisée mais une erreur est survenue";
				break;
			case ERR_ARM_PAYLOAD_BIGGER:
				frameErreur = "La taille du message est trop grande par rapport à la capacité du réseau";
				break;
			case ERR_RADIO_PAIRING_TIMEOUT:
				frameErreur = "Impossible de s'appairer à un réseau avant le temps imparti";
				break;
			case ERR_SENSORS_TIMEOUT:
				frameErreur = "Un timeout a été atteint sur le capteur";
				break;
			case ERR_SENSOR_STOP:
				frameErreur = "Le capteur n'a pas retourné de valeur lors d'une lecture";
				break;
			case ERR_SENSORS_INIT_FAIL:
				frameErreur = "Le capteur de température humidité n’est pas détecté au démarrage";
				break;
			case ERR_BOX_OPENED:
				frameErreur = "Ouverture du boitier";
				break;
			case ERR_BOX_CLOSED:
				frameErreur = "Fermeture du boititer";
				break;
			case ERR_SENSORS_MOVE:
				frameErreur = "Détection d’un déplacement/vol sur le produit";
				break;			
			case ERR_SENSOR_CRC_KO:
				frameErreur = "Données du capteur de température humidité corrompues";
				break;
			default:
				frameErreur = "Erreur inconnue";
		}	
		return frameErreur;	
	}		
			
			
// ==============================================================================================================================
// Algorithme de decodage, afin de convertir la trame en valeur concrète pour l'utilisateur
// ==============================================================================================================================
	    
	function decodeFrame(frame) {
   		var bytes = hexToBytes(frame);
    	var data = {};
    	
    		for (i =0; i < bytes.length; i++) {
        		switch (bytes[i]) {
            		case TYPE_TEMP:
                		data.temp = (bin16dec(bytes[i + 1] << 8 | bytes[i + 2]) / 100);
                		i += 2;
                		break;
                	case TYPE_TEMP2:
                		data.temp2 = (bin16dec(bytes[i + 1] << 8 | bytes[i + 2]) / 100);
                		i += 2;
                		break;
            		case TYPE_RH:
                		data.rh = (bin16dec(bytes[i + 1] << 8 | bytes[i + 2]) / 100);
                		i += 2;
                		break;
           			case TYPE_COV:
                		data.cov = bin16dec(bytes[i + 1] << 8 | bytes[i + 2]);
                		i += 2;
                		break;
            		case TYPE_CO2:
                		data.co2 = bin16dec(bytes[i + 1] << 8 | bytes[i + 2]);
                		i += 2;
                		break;
                	case TYPE_ENTREE:
                		data.entree = "Entrée à l'etat 1";
                		break;
                	case TYPE_ENTREE2:
                		data.entree = "Entrée à l'etat 0";
                		break;
        		}
    		}
    	return data;	
    }
    	

// ==============================================================================================================================
// Algorithme de gestion du time stamp
// ==============================================================================================================================	

	function getTimestamp(frame) {
		var frameTimestamp = parseInt(frame.substr(2, 8), 16);
		return frameTimestamp;
	}

	function convertTimestamp(frameTimestamp) {
	
  		var date 	  = new Date(frameTimestamp * 1000);
  		var year 	  = date.getFullYear();
 		var month   = date.getMonth() + 1;
  		var day 	  = date.getDate();
  		var hours   = date.getHours();
  		var minutes = "0" + date.getMinutes();
  		var seconds = "0" + date.getSeconds();
  
  		return date = year + "/" + month + "/" + day + " " + hours + ":" + minutes.substr(-2) + ":" + seconds.substr(-2);
  
	}
	
		
// ==============================================================================================================================
// Récupération et affichage avec jQuery des données dans le bloc résultat
// ==============================================================================================================================
	
	//Controle de saisie: suppression des éspaces 
	function removeSpaces() {
		
    	var input = document.getElementById("trame");
    	input.value = input.value.replace(/\s/g, "");
  	}
  	
  	//Evenement sur la touche entrer du clavier
	$(document).ready(function() {
  		$("#trame").on("keyup", function(event) {
    		if (event.keyCode === 13) {
      			$("#lien").click();
    		}
  		});
	});
	
	//Fonction de récupération et de traitement des données.
	$(document).ready(function(){
    	$("#lien").click(function(){
        	var frame 	  	= $("#trame").val();
        	var frameType 	= getFrameType(frame);
			var dframe		= frame.charAt(0);
        	
        	if (dframe === "e" || dframe === "E") {
				var frameTimestamp	= getTimestamp(frame);
        		var timestamp		= convertTimestamp(frameTimestamp);
        		var frameType 		= getFrameType(frame);
        		var data 			= decodeFrame(frame);
        		
        		if (frameType === "Trame d'erreur") {
					var frameErreur = getFrameErreur(frame);
					$("#resultat").html("<li>" + "<span class='bold-text'> Timestamp : </span>" + timestamp + "<br><br>" + "<li>" + "<span class='bold-text'> Type de Trame : </span>" + frameType + "<br><br>" + "<li>" + "<span class='bold-text'> Message d'erreur : </span>" + frameErreur);
        	
        		}else{
        			$("#resultat").html("<li>" + "<span class='bold-text'> Timestamp : </span>" + timestamp + "<br><br>" + "<li>" + "<span class='bold-text'> Type de Trame : </span>" + frameType + "<br><br>" + "<li>" + "<span class='bold-text'> Température : </span>" + data.temp + "°C<br><br>" + "<li>" + "<span class='bold-text'> Humidité : </span>" + data.rh + " %<br><br>" + "<li>" + "<span class='bold-text'> Indice COV : </span>" + data.cov + "<br><br>" + "<li>" + "<span class='bold-text'> Co2 : </span>" + data.co2 + " ppm<br><br>" + "<li>" +  "<span class='bold-text'> Etat de l'entrée (uniquement pour les TMxP) : </span>" + data.entree + "<br><br>" + "<li>" + "<span class='bold-text'> Température voie 1 (uniquement pour les TMxP): </span>" + data.temp2 + "°C");
        		} 					
			}else{
        	
        		if (frameType === "Trame d'erreur") {
					var frameErreur = getFrameErreur(frame);
					$("#resultat").html("<li>" + "<span class='bold-text'> Type de Trame : </span>" + frameType + "<br><br>" + "<li>" + "<span class='bold-text'> Message d'erreur : </span>" + frameErreur);
        	
        		}else{
        	
     				if (frameType === "Trame de vie") {
						var octet = {};
						var tensionV = (parseInt(frame.substr(3, 3), 16)) / 1000;
        				var tensionC = (parseInt(frame.substr(7, 3), 16)) / 1000;
        				octet.tensionV = tensionV;
        				octet.tensionC = tensionC;
            			$("#resultat").html("<li>" + "<span class='bold-text'> Type de Trame : </span>" + frameType + "<br><br>" + "<li>" + "<span class='bold-text'>  Niveau de batterie à vide : </span>" + octet.tensionV + " V<br><br>" + "<li>" + "<span class='bold-text'> Niveau de batterie en charge : </span>" + octet.tensionC + " V");
			
					}else{
						var data = decodeFrame(frame);
        				$("#resultat").html("<li>" + "<span class='bold-text'> Type de Trame : </span>" + frameType + "<br><br>" + "<li>" + "<span class='bold-text'> Température : </span>" + data.temp + "°C<br><br>" + "<li>" + "<span class='bold-text'> Humidité : </span>" + data.rh + " %<br><br>" + "<li>" + "<span class='bold-text'> Indice COV : </span>" + data.cov + "<br><br>" + "<li>" + "<span class='bold-text'> Co2 : </span>" + data.co2 + " ppm<br><br>" + "<li>" +  "<span class='bold-text'> Etat de l'entrée (uniquement pour les TMxP) : </span>" + data.entree + "<br><br>" + "<li>" + "<span class='bold-text'> Température voie 1 (uniquement pour les TMxP): </span>" + data.temp2 + "°C");
 					}
 				}
 			}      
        });
    });

