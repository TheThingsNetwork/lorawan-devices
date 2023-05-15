function decodeUplink(input) {
    
	// Init result
  var data;
    // Parse stream
    /*let jsonStream = JSON.parse(stream);
	
	// Get time and payload
	let time = new Date((jsonStream.data.timestamp) * 1000)/1000;
	let payload = jsonStream.data.payload;*/
	
	var date = Date.now();
	date = new Date(date);
	var time = convertTimestamp(date);
	
	var payload_tab = input.bytes;
	var payload = "";
	for (let i = 0; i < payload_tab.length; i++) {
		if(payload_tab[i] > 15){
			payload = payload + payload_tab[i].toString(16);
		}else{
			payload = payload + '0' + payload_tab[i].toString(16);
		}
	}
  frameType = getFrameType_ancien(payload);
  if(frameType !== "Nan"){
  	data = decodeFrame_ancien(payload,frameType);
  	
  	if(data.entree !== ""){
  	  var varByte =  ((parseInt((data.entree-0).toString(16),16)).toString(2)).split('').reverse().join('');
  		var taille = varByte.length;
  		if(varByte.length<=16){
  			for(let j=0;j<(16-(taille));j++){
  				varByte = varByte+"0";
  			}
  		}
  		data.entree = varByte;
  	}
  	
  	if(data.sortie !== ""){
    var varByte_sortie =  ((parseInt((data.sortie-0).toString(16),16)).toString(2)).split('').reverse().join('');
  	var taille_sortie = varByte_sortie.length;
  	if(varByte_sortie.length<=16){
  		for(let j=0;j<(16-(taille_sortie));j++){
  			varByte_sortie = varByte_sortie+"0";
  		}
  	}
  	data.sortie = varByte_sortie;
  	}
  }
  var warnings = [];
  if(frameType === "Nan"){
    warnings = ["La trame n'est pas décoder"];
  }	// Return result
  return {
    data: data,
    warnings: warnings,
    errors: []
  };
}

function getFrameType_ancien(frame){
		const oct1 = parseInt(frame.substr(0, 2), 16);
		if(oct1 === 0x01){
			frameType = "Trame de vie";
		}else if(oct1 === 0x05){
			frameType = "Trame de test";
		}else if(oct1 === 0x42){
			frameType = "Trame d’entrées digitales";
		}else if(oct1 === 0x41){
			frameType = "Trame d’entrées digitales et température";
		}else if(oct1 === 0x4E){
			frameType = "Trame d’entrées digitales,température et compteur 1";
		}else if(oct1 === 0x4F){
			frameType = "Trame d’entrées digitales, compteur 1 et compteur 2 ";
		}else if(oct1 === 0x52){
			frameType = "Trame d’entrées digitales et compteur 1 ";
		}else if(oct1 === 0x50){
			frameType = "Trame du compteur 1 et 2";
		}else if(oct1 === 0x51){
			frameType = "Trame du compteur 3 et 4";
		}else if(oct1 === 0x5F){
			frameType = "Trame du compteur 5 et 6";
		}else if(oct1 === 0x60){
			frameType = "Trame du compteur 7 et 8";
		}else if(oct1 === 0x5D){
			frameType = "Trame d’entrées digitales,température et compteurs";
		}else if(oct1 === 0x5E){
			frameType = "Trame d’entrées digitales et compteurs";
		}else if(oct1 === 0x43){
			frameType = "Trame alarme ou chocs";
		}else if(oct1 === 0x62){
			frameType = "Trame d’entrées/sorties digitales";
		}else if(oct1 === 0x61){
			frameType = "Trame d’entrées/sorties digitales et température";
		}else if(oct1 === 0x6E){
			frameType = "Trame d’entrées/sorties digitales, température et compteur 1";
		}else if(oct1 === 0x6F){
			frameType = "Trame d’entrées/sorties digitales, compteur 1 et compteur 2";
		}else if(oct1 === 0x72){
			frameType = "Trame d’entrées/sorties digitales et compteur 1";
		}else if(oct1 === 0x7D){
			frameType = "Trame d’entrées/sorties digitales, température et compteurs";
		}else if(oct1 === 0x7E){
			frameType = "Trame d’entrées digitales et compteurs";
		}else{
		  frameType = "Nan";
		}
		return frameType;

	}
	
	function decodeFrame_ancien(frame,frameType) {
		var bytes = hexToBytes(frame);
    var data = {};
		var i = 1,cpt = 0;
		switch (frameType) {
			case "Trame de vie":
				data.tension = (bin16dec(bytes[i] << 8 | bytes[i + 1]));
				break;

			case "Trame de test":
				data.compteur = (bin16dec(bytes[i]));
				break;

			case "Trame d’entrées digitales":
				data.entree = (bin16dec(bytes[i] << 8 | bytes[i + 1]));
				break;

			case "Trame d’entrées digitales et température":
				data.entree = (bin16dec(bytes[i] << 8 | bytes[i + 1]));
				i+=2;
				data.temp = (bin16dec(bytes[i] << 8 | bytes[i + 1]));
				break;

			case "Trame d’entrées digitales,température et compteur 1":
			  data.comptage = [];
				data.entree = (bin16dec(bytes[i] << 8 | bytes[i + 1]));
				i+=2;
				data.temp = (bin16dec(bytes[i] << 8 | bytes[i + 1]));
				i+=2;
				data.comptage[cpt] = bytes[i] << 24 | bytes[i + 1] <<16| bytes[i + 2] <<8 | bytes[i + 3];

				break;

			case "Trame d’entrées digitales, compteur 1 et compteur 2 ":
			  data.comptage = [];
				data.entree = (bin16dec(bytes[i ] << 8 | bytes[i + 1]));
				i+=2;
				data.comptage[cpt] = bytes[i ] << 24 | bytes[i + 1] <<16| bytes[i + 2] <<8 | bytes[i + 3];
				i+=4;
				cpt++;
				data.comptage[cpt] = bytes[i] << 24 | bytes[i + 1] <<16| bytes[i + 2] <<8 | bytes[i + 3];
				break;

			case "Trame d’entrées digitales et compteur 1 ":
				data.entree = (bin16dec(bytes[i] << 8 | bytes[i + 1]));
				i+=2;
				data.comptage[cpt] = bytes[i] << 24 | bytes[i + 1] <<16| bytes[i + 2] <<8 | bytes[i + 3];
				break;

			case "Trame du compteur 1 et 2":
			  data.comptage = [];
				data.comptage[cpt] = bytes[i] << 24 | bytes[i + 1] <<16| bytes[i + 2] <<8 | bytes[i + 3];
				i+=4;
				cpt++;
				data.comptage[cpt] = bytes[i] << 24 | bytes[i + 1] <<16| bytes[i + 2] <<8 | bytes[i + 3];
				break;

			case "Trame du compteur 3 et 4":
			  data.comptage = [];

				data.comptage[cpt] = bytes[i] << 24 | bytes[i + 1] <<16| bytes[i + 2] <<8 | bytes[i + 3];
				i+=4;
				cpt++;
				data.comptage[cpt] = bytes[i] << 24 | bytes[i + 1] <<16| bytes[i + 2] <<8 | bytes[i + 3];
				break;

			case "Trame du compteur 5 et 6":
			  data.comptage = [];

				data.comptage[cpt] = bytes[i] << 24 | bytes[i + 1] <<16| bytes[i + 2] <<8 | bytes[i + 3];
				i+=4;
				cpt++;
				data.comptage[cpt] = bytes[i] << 24 | bytes[i + 1] <<16| bytes[i + 2] <<8 | bytes[i + 3];
				break;

			case "Trame du compteur 7 et 8":
			  data.comptage = [];

				data.comptage[cpt] = bytes[i ] << 24 | bytes[i + 1] <<16| bytes[i + 2] <<8 | bytes[i + 3];
				i+=4;
				cpt++;
				data.comptage[cpt] = bytes[i] << 24 | bytes[i + 1] <<16| bytes[i + 2] <<8 | bytes[i + 3];
				break;

			case "Trame d’entrées digitales,température et compteurs":
				data.comptage = [];
				data.entree = (bin16dec(bytes[i] << 8 | bytes[i + 1]));
				i+=2;
				data.temp = (bin16dec(bytes[i] << 8 | bytes[i + 1]));
				i+=2;
				for(j=i;j<(bytes.length-i);j+=4){
					data.comptage[cpt] = bytes[j] << 24 | bytes[j + 1] <<16| bytes[j + 2] <<8 | bytes[j + 3];
					cpt++;
				}
				break;

			case "Trame d’entrées digitales et compteurs":
			  data.comptage = [];

				data.entree = (bin16dec(bytes[i] << 8 | bytes[i + 1]));
				i+=2;
				for(j=i;j<(bytes.length-i);j+=4){
					data.comptage[cpt] = bytes[j] << 24 | bytes[j + 1] <<16| bytes[j + 2] <<8 | bytes[j + 3];
					cpt++;
				}
				break;

			case "Trame alarme ou chocs":
				data.compteur = (bin16dec(bytes[i]));
				break;

			case "Trame d’entrées/sorties digitales":
				data.entree = (bin16dec(bytes[i]));
				i++;
				data.sortie = (bin16dec(bytes[i]));
				break;

			case "Trame d’entrées/sorties digitales et température":
				data.entree = (bin16dec(bytes[i]));
				i++;
				data.sortie = (bin16dec(bytes[i]));
				i+=2;
				data.temp = (bin16dec(bytes[i] << 8 | bytes[i + 1]));
				break;

			case "Trame d’entrées/sorties digitales, température et compteur 1":
			  data.comptage = [];

				data.entree = (bin16dec(bytes[i]));
				i++;
				data.sortie = (bin16dec(bytes[i]));
				i++;
				data.temp = (bin16dec(bytes[i] << 8 | bytes[i + 1]));
				i+=2;
				data.comptage[cpt] = bytes[i] << 24 | bytes[i + 1] <<16| bytes[i + 2] <<8 | bytes[i + 3];
				break;

			case "Trame d’entrées/sorties digitales, compteur 1 et compteur 2":
			  data.comptage = [];

				data.entree = (bin16dec(bytes[i]));
				i++;
				data.sortie = (bin16dec(bytes[i]));
				i++;
				data.comptage[cpt] = bytes[i] << 24 | bytes[i + 1] <<16| bytes[i + 2] <<8 | bytes[i + 3];
				i+=4;
				cpt++;
				data.comptage[cpt] = bytes[i] << 24 | bytes[i + 1] <<16| bytes[i + 2] <<8 | bytes[i + 3];

				break;

			case "Trame d’entrées/sorties digitales et compteur 1":
			  data.comptage = [];

				data.entree = (bin16dec(bytes[i]));
				i++;
				data.sortie = (bin16dec(bytes[i]));
				i++;
				data.comptage[cpt] = bytes[i] << 24 | bytes[i + 1] <<16| bytes[i + 2] <<8 | bytes[i + 3];
				break;

			case "Trame d’entrées/sorties digitales, température et compteurs":
			  data.comptage = [];

				data.entree = (bin16dec(bytes[i]));
				i++;
				data.sortie = (bin16dec(bytes[i]));
				i++;
				data.temp = (bin16dec(bytes[i] << 8 | bytes[i + 1]));
				i+=2;
				for(j=i;j<(bytes.length-i);j+=4){
					data.comptage[cpt] = bytes[j] << 24 | bytes[j + 1] <<16| bytes[j + 2] <<8 | bytes[j + 3];
					cpt++;
				}
				break;

			case "Trame d’entrées digitales et compteurs":
			  data.comptage = [];

				data.entree = (bin16dec(bytes[i]));
				i++;
				data.sortie = (bin16dec(bytes[i]));
				i++;
				for(j=i;j<(bytes.length-i);j+=4){
					data.comptage[cpt] = bytes[j] << 24 | bytes[j + 1] <<16| bytes[j + 2] <<8 | bytes[j + 3];
				}
				break;
			default:
			  data.error = "error";
			  break;

		}
		return data;
	}
	
	function convertTimestamp(frameTimestamp) {

	var date 	  = new Date(frameTimestamp);
	var year 	  = date.getFullYear();
 	var month   = date.getMonth() + 1;
	if(month<10){
		month = "0" + month;
	}
	var day 	  = date.getDate();
	if(day<10){
		day = "0" + day;
	}
	var hours   = date.getHours()+2;
	var minutes = "0" + date.getMinutes();
	var seconds = "0" + date.getSeconds();

	date = day + "/" + month + "/" + year + " " + hours + ":" + minutes.substr(-2) + ":" + seconds.substr(-2);
  return date;
}

	function hexToBytes(hex) {
    	for (var bytes = [], c = 0; c < hex.length; c += 2)
        	bytes.push(parseInt(hex.substr(c, 2), 16));
    	return bytes;
	}
	function bin16dec(bin) {
    	var num = bin & 0xFFFF;
    	if (0x8000 & num)
       		num = -(0x010000 - num);
    	return num;
	}


	function encodeDownlink(input) {
		const payloadHex = input.data.payload;
		const payloadBytes = payloadHex.match(/.{1,2}/g).map(byteHex => parseInt(byteHex, 16));  
		var errors = [];  
		
		if(input.data === 'Null'){
		  errors = ["error data"]
		}
		return {
		  bytes: payloadBytes,
		  fPort: 2,
		  warnings: [],
		  errors: errors
		};
	  }