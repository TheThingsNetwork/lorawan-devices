function decodeUplink(input) {
    var hexStringInput = "";
    for (var i = 0; i < input.bytes.length; i++) {
      var hex = input.bytes[i].toString(16); // Convertir le nombre en base 16
      
      // Ajouter un zéro devant si le nombre hexadécimal est constitué d'un seul chiffre
      if (hex.length === 1) {
        hex = "0" + hex;
      }
      
      hexStringInput += hex; // Ajouter le nombre hexadécimal à la chaîne de caractères
    }
  
    var data = decode_pay(hexStringInput);
    var decoded = decode_json(data.data,hexStringInput);
    var res =  postProcess(data, JSON.parse(decoded));

    var errors;
    var warnings;
    return {
      data: res,
      errors: errors,
      warnings: warnings
    };
}


function postProcess(data, decoded) {
    /*gamme acw*/
	postProcessFrameType(decoded,data);
    postProcessTypeAlerte(decoded,data);
    postProcessTypeErreur(decoded,data);
	postProcessTemp(decoded,data);
    postProcessHum(decoded,data);
    postProcessDp(decoded,data);
    postProcessCov(decoded,data);
    postProcessCo2(decoded,data);
    postProcessDist(decoded,data);
    postProcessEntree(decoded,data);
    postProcessCompteur(decoded,data);
    postProcessHorodatage(decoded,data);
    postProcessPeriode(decoded,data);
    postProcessTension(decoded,data);
    postProcessSpecifique(decoded,data);
    postProcessHistoEchan(decoded,data);

    /*ancien produit */
    postProcessAncienCompteur(decoded,data);
    postProcessEntrerAncien(decoded,data);
    postProcessAncienTemperature(decoded,data);
    postProcessAncienSortieEntree(decoded,data);
    postProcessAncienCompteur0_15(decoded,data);
    postProcessAncienPir(decoded,data);
    postProcessAncienMR2(decoded,data);
    postProcessAncienDINDA(decoded,data);

	return decoded;
}
/*******************************************************************************************************************************/
/*******************************************************************************************************************************/
/*PARTIE AFFICHAGE*/
/*******************************************************************************************************************************/
/*******************************************************************************************************************************/

/***********/
/*ACW*/
/***********/
function postProcessSpecifique(decoded,data){
    if(decoded.wr != undefined){
        if(decoded.wr[1]===0x01){
            var wr = "cable Wirecut non coupé";
        }else if(decoded.wr[1]===0x20){
            var wr = "cable Wirecut coupé";
        }
        decoded.wr = {
                value : wr
        };
    }
}

function  postProcessTension(decoded,data){
    if(decoded.tensionc != undefined){
        decoded.tensionc = {
                value : (decoded.tensionc[0]<<8 | decoded.tensionc[1]) /1000,
                unit : "V"
        };
    }
    if(decoded.tensionv != undefined){
        decoded.tensionv = {
                value : (decoded.tensionv[0]<<8 | decoded.tensionv[1]) /1000,
                unit : "V"
        };
    }
    if(decoded.tension != undefined){
        var valeur_echan_hist = (data.echan * data.historique);
        var valeur_tension = [];
        for(var i=0;i<valeur_echan_hist;i++){
            valeur_tension.push(decoded.tension[1+i*2]<<8 | decoded.tension[2+i*2]);
        }
        decoded.tension = {
                value : valeur_tension,
                unit : "mV"
        };
    }
    if(decoded.courant != undefined){
        var valeur_echan_hist = (data.echan * data.historique);
        var valeur_courant = [];
        for(var i=0;i<valeur_echan_hist;i++){
            valeur_courant.push( (decoded.courant[1+i*2]<<8 | decoded.courant[2+i*2])/100);
        }
        decoded.courant = {
            value : valeur_courant,
            unit : "A"
        };
    }
}
function postProcessTypeAlerte(decoded,data){
    if(data.typeAlerte != undefined){
        var res = "";
        for(var i=0;i<data.nbrData;i++){
            res += data.typeAlerte[i];
            if((data.nbrData>1) && (i<data.nbrData-1)){
                 res += " | ";
            }
        }
        decoded.alerte = {
                value : res
        };
    }
}
function postProcessTypeErreur(decoded,data){
    if(data.typeErreur != undefined){
        if(data.battery != undefined){
            decoded.Erreur = {
                    value : data.typeErreur,
                    battery_level : data.battery
            };
        }else{
            decoded.Erreur = {
                    value : data.typeErreur,
            };
        }
    }
}

function postProcessFrameType(decoded,data){
    if(decoded.frame_type != undefined){
        decoded.frame_type = {
                type : data.frame_type
        };
    }
}

function postProcessTemp(decoded,data){
    var j = 0;
    var valeur_temp0 = [];
    var valeur_temp1 = [];
    var valeur_echan_hist = (data.echan * data.historique);

    if(decoded.temp0 != undefined){
        for(var i=0;i<valeur_echan_hist;i++){
            if(((decoded.temp0[1+i*2]<<8 | decoded.temp0[2+i*2])<<16>>16 )/100 === -327.68){
                valeur_temp0.push("erreur");
            }else{
                valeur_temp0.push(((decoded.temp0[1+i*2]<<8 | decoded.temp0[2+i*2])<<16>>16 )/100) ;
            }

        }
        decoded.temperature0 = {
                value : valeur_temp0,
                voie : data.voieTemp[j],
                unit : '°C'
        };
        j++;
        delete decoded.temp0;
    }
    if(decoded.temp1 != undefined){
        for(var i=0;i<valeur_echan_hist;i++){
            if(((decoded.temp1[1+i*2]<<8 | decoded.temp1[2+i*2])<<16>>16)/100 === -327.68){
                valeur_temp1.push("erreur");
            }else{
                valeur_temp1.push(((decoded.temp1[1+i*2]<<8 | decoded.temp1[2+i*2])<<16>>16)/100) ;
            }
        }
        decoded.temperature1 = {
                value : valeur_temp1,
                voie : data.voieTemp[j],
                unit : '°C'
        };
        delete decoded.temp1;
    }
}
function postProcessHum(decoded,data){
    var j = 0;
    var valeur_hum0 = [];
    var valeur_hum1 = [];
    var valeur_echan_hist = (data.echan * data.historique);

    if(decoded.hum0 != undefined){
        for(var i=0;i<valeur_echan_hist;i++){
            if(((decoded.hum0[1+i*2]<<8 | decoded.hum0[2+i*2])/100) === 327.68){
                valeur_hum0.push("erreur");
            }else{
                valeur_hum0.push((decoded.hum0[1+i*2]<<8 | decoded.hum0[2+i*2])/100);
            }
        }
        decoded.humidity0 = {
                value : valeur_hum0,
                voie : data.voieRh[j],
                unit :  '%'
        };
        j++;
        delete decoded.hum0;
    }
    if(decoded.hum1 != undefined){
        for(var i=0;i<valeur_echan_hist;i++){
            if(((decoded.hum1[1+i*2]<<8 | decoded.hum1[2+i*2])/100) === 327.68){
                valeur_hum1.push("erreur");
            }else{
                valeur_hum1.push((decoded.hum1[1+i*2]<<8 | decoded.hum1[2+i*2])/100);
            }
        }
        decoded.humidity1 = {
                value : valeur_hum1,
                voie : data.voieRh[j],
                unit : '%'
        };
        j++;
        delete decoded.hum1;
    }
}

function  postProcessDp(decoded,data){
    var valeur_dp = [];
    var valeur_echan_hist = (data.echan * data.historique);

    if(decoded.dp != undefined){
        for(var i=0;i<valeur_echan_hist;i++){
            valeur_dp.push((decoded.dp[1+i*2]<<8 | decoded.dp[2+i*2])<<16>>16);
        }
        decoded.pression_differentielle = {
                value : valeur_dp,
                unit :  'Pa'
        };
        delete decoded.dp;
    }
}
function  postProcessCov(decoded,data){
    var valeur_cov = [];
    var valeur_echan_hist = (data.echan * data.historique);

    if(decoded.cov != undefined){
        for(var i=0;i<valeur_echan_hist;i++){
            if((decoded.cov[1+i*2]<<8 | decoded.cov[2+i*2]) === 512){
                valeur_cov.push("erreur");
            }else{
                valeur_cov.push(decoded.cov[1+i*2]<<8 | decoded.cov[2+i*2]);
            }
        }
        decoded.COV = {
                value : valeur_cov
        };

        delete decoded.cov;
    }
}
function  postProcessCo2(decoded,data){
    var valeur_co2 = [];
    var valeur_echan_hist = (data.echan * data.historique);

    if(decoded.co2 != undefined){
        for(var i=0;i<valeur_echan_hist;i++){
            if((decoded.co2[1+i*2]<<8 | decoded.co2[2+i*2]) === 256){
                valeur_co2.push("erreur");
            }else{
                valeur_co2.push(decoded.co2[1+i*2]<<8 | decoded.co2[2+i*2]);
            }
        }
        decoded.CO2 = {
                value : valeur_co2,
                unit :  'ppm'
        };
        delete decoded.co2
    }
}
function postProcessDist(decoded,data){
    var valeur_dist = [];
    var valeur_echan_hist = (data.echan * data.historique);

   if(decoded.dist != undefined){
       for(var i=0;i<valeur_echan_hist;i++){
           valeur_dist.push(decoded.dist[1+i*2]<<8 | decoded.dist[2+i*2]);
       }
       decoded.distance = {
               value : valeur_dist,
               unit :  'mm'
       };
       delete decoded.dist;

   }
}
function postProcessEntree(decoded,data){
    var valeur_entree = [];
    valeur_entree[0] = [];
    valeur_entree[1] = [];
    valeur_entree[2] = [];
    valeur_entree[3] = [];

    var valeur_echan_hist = (data.echan * data.historique);

    if(decoded.entree != undefined){
       for(var i=0;i<valeur_echan_hist;i++){
            var bin1 = (parseInt((decoded.entree[i+1]-0).toString(16),16)).toString(2);
            if(decoded.entree[i+1]<=15){
                var taille_bin = bin1.length+1;
                if(taille_bin<5){
                   if(bin1.length!=4){
                      bin1 = bin1.split('').reverse().join('');
                      for(var j=0;j<(5-(taille_bin));j++){
                           bin1 =  bin1 + '0' ;
                      }
                   }
                }else{
                  bin1 = bin1.split('').reverse().join('');
                }

               for(var j=0;j<4;j++){
                   if(bin1[j] === '1'){
                        valeur_entree[j].push(1);
                   }else{
                        valeur_entree[j].push(0);
                   }
               }

            }else{
                var taille_bin = bin1.length;
                if(taille_bin<=8){
                    for(var j=0;j<(8-(taille_bin));j++){
                        bin1 = '0'+bin1 ;
                    }
                }
                if(bin1[3] === "1" ){
                    if(bin1[7] === "1"){
                        valeur_entree[0].push("mise à l'état haut");
                    }
                    else{
                        valeur_entree[0].push("mise à l'état bas");
                    }
                }else{
                    valeur_entree[0].push("pas de mouvement");
                }
                if(bin1[2] === "1"){
                    if(bin1[6] === "1"){
                        valeur_entree[1].push("mise à l'état haut");
                    }
                    else{
                        valeur_entree[1].push("mise à l'état bas");
                    }
                }else{
                    valeur_entree[1].push("pas de mouvement");
                }
                if(bin1[1] === "1"){
                    if(bin1[5] === "1"){
                        valeur_entree[2].push("mise à l'état haut");
                    }
                    else{
                        valeur_entree[2].push("mise à l'état bas");
                    }
                }else{
                    valeur_entree[2].push("pas de mouvement");
                }
                if(bin1[0] === "1"){
                    if(bin1[4] === "1"){
                        valeur_entree[3].push("mise à l'état haut");
                    }
                    else{
                        valeur_entree[3].push("mise à l'état bas");
                    }
                }else{
                    valeur_entree[3].push("pas de mouvement");
                }
                selec = 2;
            }

       }
       delete decoded.entree;
       decoded.entree = {
               value : valeur_entree
       };
    }
}

function postProcessCompteur(decoded,data){
       var valeur_echan_hist = (data.echan * data.historique);
       var valeur_compte0 = [];
       var valeur_compte1 = [];
       var valeur_compte2 = [];
       var valeur_compte3 = [];

       if(decoded.compte0 != undefined){
            for(var i=0;i<valeur_echan_hist;i++){
                valeur_compte0.push(decoded.compte0[1+i*4]<<24 | decoded.compte0[2+i*4]<<16 | decoded.compte0[3+i*4]<<8 | decoded.compte0[4+i*4]);
            }
            delete decoded.compte0;
               decoded.compte0 = {
                       value : valeur_compte0,
                       voie : 0
               };
       }
      if(decoded.compte1 != undefined){
           for(var i=0;i<valeur_echan_hist;i++){
               valeur_compte1.push(decoded.compte1[1+i*4]<<24 | decoded.compte1[2+i*4]<<16 | decoded.compte1[3+i*4]<<8 | decoded.compte1[4+i*4]);
           }
          delete decoded.compte1;
          decoded.compte1 = {
                  value : valeur_compte1,
                  voie : 1
          };
      }
     if(decoded.compte2 != undefined){
          for(var i=0;i<valeur_echan_hist;i++){
              valeur_compte2.push(decoded.compte2[1+i*4]<<24 | decoded.compte2[2+i*4]<<16 | decoded.compte2[3+i*4]<<8 | decoded.compte2[4+i*4]);
          }
          delete decoded.compte2;
             decoded.compte2 = {
                     value : valeur_compte2,
                     voie : 2
             };
     }
    if(decoded.compte3 != undefined){
         for(var i=0;i<valeur_echan_hist;i++){
             valeur_compte3.push(decoded.compte3[1+i*4]<<24 | decoded.compte3[2+i*4]<<16 | decoded.compte3[3+i*4]<<8 | decoded.compte3[4+i*4]);
         }
         delete decoded.compte3;
            decoded.compte3 = {
                    value : valeur_compte3,
                    voie : 3
            };
    }
}

function postProcessHorodatage(decoded,data){
     if(decoded.horo !== undefined){
        var frameTimestamp = (decoded.horo[0] <<24 | decoded.horo[1] <<16 | decoded.horo[2] <<8 | decoded.horo[3]);
        var date 	  = new Date(frameTimestamp * 1000);

  		var year 	  = date.getUTCFullYear();
 		var month   = date.getUTCMonth() + 1;
		if(month<10){
			var month = "0" + month;
		}
  		var day 	  = date.getUTCDate();
		if(day<10){
			var day = "0" + day;
		}
		var offset = 7200;
		if(month===12){
		    if(day>=22){
		        offset = 3600;
		    }
		}if(month <=3){
		    if(day<=20){
		        offset = 3600;
		    }
		}
		var frameTimestamp = (decoded.horo[0] <<24 | decoded.horo[1] <<16 | decoded.horo[2] <<8 | decoded.horo[3])+offset;
        var date 	  = new Date(frameTimestamp * 1000);

        var year 	  = date.getUTCFullYear();
        var month   = date.getUTCMonth() + 1;
        if(month<10){
            var month = "0" + month;
        }
        var day 	  = date.getUTCDate();
        if(day<10){
            var day = "0" + day;
        }

  		var hours   = date.getUTCHours();
  		var minutes = "0" + date.getUTCMinutes();
  		var seconds = "0" + date.getUTCSeconds();

  		date = day + "/" + month + "/" + year + " " + hours + ":" + minutes.substr(-2) + ":" + seconds.substr(-2);

       decoded.Horodatage = {
               value : date
       };

       delete decoded.horo;
     }
}
function  postProcessPeriode(decoded,data){
    if(decoded.periode != undefined){
        decoded.periode = {
                value :  decoded.periode[1]
        };
   }
}

function  postProcessHistoEchan(decoded,data){
    delete decoded.histo_echan;

}

/***********/
/*Ancien produit*/
/***********/
function postProcessAncienCompteur0_15(decoded,data){
    if(decoded.ancien_compteur0 !== undefined){
        decoded.compteur0 = {
                value : (decoded.ancien_compteur0[0]<<24 | decoded.ancien_compteur0[1]<<16 | decoded.ancien_compteur0[2]<<8 | decoded.ancien_compteur0[3])
        };
        delete  decoded.ancien_compteur0;
    }
    if(decoded.ancien_compteur1 !== undefined){
        decoded.compteur1 = {
                value : (decoded.ancien_compteur1[0]<<24 | decoded.ancien_compteur1[1]<<16 | decoded.ancien_compteur1[2]<<8 | decoded.ancien_compteur1[3])
        };
        delete  decoded.ancien_compteur1;

    }
    if(decoded.ancien_compteur2 !== undefined){
        decoded.compteur2 = {
                value : (decoded.ancien_compteur2[0]<<24 | decoded.ancien_compteur2[1]<<16 | decoded.ancien_compteur2[2]<<8 | decoded.ancien_compteur2[3])
        };
        delete  decoded.ancien_compteur2;
    }
    if(decoded.ancien_compteur3 !== undefined){
        decoded.compteur3 = {
                value : (decoded.ancien_compteur3[0]<<24 | decoded.ancien_compteur3[1]<<16 | decoded.ancien_compteur3[2]<<8 | decoded.ancien_compteur3[3])
        };
        delete  decoded.ancien_compteur3;
    }
    if(decoded.ancien_compteur4 !== undefined){
        decoded.compteur4 = {
                value : (decoded.ancien_compteur4[0]<<24 | decoded.ancien_compteur4[1]<<16 | decoded.ancien_compteur4[2]<<8 | decoded.ancien_compteur4[3])
        };
        delete  decoded.ancien_compteur4;
    }
    if(decoded.ancien_compteur5 !== undefined){
        decoded.compteur5 = {
                value : (decoded.ancien_compteur5[0]<<24 | decoded.ancien_compteur5[1]<<16 | decoded.ancien_compteur5[2]<<8 | decoded.ancien_compteur5[3])
        };
        delete  decoded.ancien_compteur5;
    }
    if(decoded.ancien_compteur6 !== undefined){
        decoded.compteur6 = {
                value : (decoded.ancien_compteur6[0]<<24 | decoded.ancien_compteur6[1]<<16 | decoded.ancien_compteur6[2]<<8 | decoded.ancien_compteur6[3])
        };
        delete  decoded.ancien_compteur6;
    }
    if(decoded.ancien_compteur7 !== undefined){
        decoded.compteur7 = {
                value : (decoded.ancien_compteur7[0]<<24 | decoded.ancien_compteur7[1]<<16 | decoded.ancien_compteur7[2]<<8 | decoded.ancien_compteur7[3])
        };
        delete  decoded.ancien_compteur7;
    }
    if(decoded.ancien_compteur8 !== undefined){
        decoded.compteur8 = {
                value : (decoded.ancien_compteur8[0]<<24 | decoded.ancien_compteur8[1]<<16 | decoded.ancien_compteur8[2]<<8 | decoded.ancien_compteur8[3])
        };
        delete  decoded.ancien_compteur8;
    }
    if(decoded.ancien_compteur9 !== undefined){
        decoded.compteur9 = {
                value : (decoded.ancien_compteur9[0]<<24 | decoded.ancien_compteur9[1]<<16 | decoded.ancien_compteur9[2]<<8 | decoded.ancien_compteur9[3])
        };
        delete  decoded.ancien_compteur9;
    }
    if(decoded.ancien_compteur10 !== undefined){
        decoded.compteur10 = {
                value : (decoded.ancien_compteur10[0]<<24 | decoded.ancien_compteur10[1]<<16 | decoded.ancien_compteur10[2]<<8 | decoded.ancien_compteur10[3])
        };
        delete  decoded.ancien_compteur10;
    }
    if(decoded.ancien_compteur11 !== undefined){
        decoded.compteur11 = {
                value : (decoded.ancien_compteur11[0]<<24 | decoded.ancien_compteur11[1]<<16 | decoded.ancien_compteur11[2]<<8 | decoded.ancien_compteur11[3])
        };
        delete  decoded.ancien_compteur11;
    }
    if(decoded.ancien_compteur12 !== undefined){
        decoded.compteur12 = {
                value : (decoded.ancien_compteur12[0]<<24 | decoded.ancien_compteur12[1]<<16 | decoded.ancien_compteur12[2]<<8 | decoded.ancien_compteur12[3])
        };
        delete  decoded.ancien_compteur12;
    }
    if(decoded.ancien_compteur13 !== undefined){
        decoded.compteur13 = {
                value : (decoded.ancien_compteur13[0]<<24 | decoded.ancien_compteur13[1]<<16 | decoded.ancien_compteur13[2]<<8 | decoded.ancien_compteur13[3])
        };
        delete  decoded.ancien_compteur13;
    }
    if(decoded.ancien_compteur14 !== undefined){
        decoded.compteur14 = {
                value : (decoded.ancien_compteur14[0]<<24 | decoded.ancien_compteur14[1]<<16 | decoded.ancien_compteur14[2]<<8 | decoded.ancien_compteur14[3])
        };
        delete  decoded.ancien_compteur14;
    }
    if(decoded.ancien_compteur15 !== undefined){
        decoded.compteur15 = {
                value : (decoded.ancien_compteur15[0]<<24 | decoded.ancien_compteur15[1]<<16 | decoded.ancien_compteur15[2]<<8 | decoded.ancien_compteur15[3])
        };
        delete  decoded.ancien_compteur15;
    }
    if( data.frame_type === "Trame Compteur mode ECO (Compteur 1 22 bits et 5 deltas 32 bits LoraWan )"){
        decoded.compteur0.temps = "Tref";
        decoded.compteur1.temps = "Tref-10";
        decoded.compteur2.temps = "Tref-20";
        decoded.compteur3.temps = "Tref-30";
        decoded.compteur4.temps = "Tref-40";
        decoded.compteur5.temps = "Tref-50";
    }
}

function postProcessAncienSortieEntree(decoded,data){
    var res_bin = [];
    if(decoded.sortie_digital != undefined){
        var bin2 = (parseInt(((decoded.sortie_digital)-0).toString(16),16)).toString(2);
        var taille_bin2 = bin2.length+1;
        if(taille_bin2<=9){
           if(bin2.length !== 8){
              for(var j=0;j<(9-(taille_bin2));j++){
                   bin2 = '0' + bin2 ;
              }
           }
       }
        bin2 =  bin2.split('').reverse().join('');
        for(var i =0;i<8;i++){
            res_bin.push(parseInt(bin2[i]));
        }
        decoded.sortie_digital = {
                value :  res_bin
        };
    }
    res_bin = [];
    if(decoded.entree_digital != undefined){
        var bin1 = (parseInt(((decoded.entree_digital)-0).toString(16),16)).toString(2);
        var taille_bin1 = bin1.length+1;

        if(taille_bin1<=9){
           if(bin1.length !== 8){
              for(var j=0;j<(9-(taille_bin1));j++){
                   bin1 = '0' + bin1 ;
              }
           }
        }
        bin1 =  bin1.split('').reverse().join('');
        for(var i =0;i<8;i++){
            res_bin.push(parseInt(bin1[i]));
        }
        decoded.entree_digital = {
                value :  res_bin
        };
    }
}
function postProcessAncienTemperature(decoded,data){
    if(decoded.temperature != undefined){
        decoded.temperature = {
                value :  (decoded.temperature[0]<<8 |decoded.temperature[1])/10,
                unit : "°C"
        };
    }
}
function postProcessAncienCompteur(decoded,data){
    if(decoded.ancien_compteur != undefined){
        decoded.compteur = {
                value :  decoded.ancien_compteur
        };
        delete decoded.ancien_compteur;
    }
}


function postProcessEntrerAncien(decoded,data){
    var res_bin = [];
    if(decoded.entree_ancien != undefined){
        var bin1 = (parseInt(((decoded.entree_ancien[0])-0).toString(16),16)).toString(2);
        var bin2 = (parseInt(((decoded.entree_ancien[1])-0).toString(16),16)).toString(2);
        var taille_bin1 = bin1.length+1;
        var taille_bin2 = bin2.length+1;

        if(taille_bin1<=9){
           if(bin1.length !== 8){
              for(var j=0;j<(9-(taille_bin1));j++){
                   bin1 = '0' + bin1 ;
              }
           }
        }
        if(taille_bin2<=9){
           if(bin2.length !== 8){
              for(var j=0;j<(9-(taille_bin2));j++){
                   bin2 = '0' + bin2 ;
              }
           }
        }
        bin1 =  bin1.split('').reverse().join('');
        bin2 =  bin2.split('').reverse().join('');
        var binaire = bin1 + bin2;
        for(var i=0;i<16;i++){
            res_bin.push(parseInt(binaire[i]));
        }
        decoded.entree = {
                value :  res_bin
        };
        delete decoded.entree_ancien;
    }
}

function postProcessAncienPir(decoded,data){
    var trame="";
    if(decoded.type_trame != undefined){
        if(decoded.type_trame === 0x01){
            trame = "Trame d'ourture boitier";
        }
        if(decoded.type_trame === 0x08){
             trame = "Trame alarme";
         }
         if(decoded.type_trame === 0x10){
             trame = "Trame de comptage";
         }
        delete decoded.type_trame;
        decoded.type_trame = {
                value :  trame
        };
    }
    var boitier;
    if(decoded.ouverture_boitier != undefined){
        if(decoded.ouverture_boitier === 0x00){
            boitier = "boitier ouvert";
        }else{
            boitier = "boitier fermée";
        }
        delete decoded.ouverture_boitier;
        decoded.ouverture_boitier = {
                value :  boitier
        };
    }
    var dq;
    if(decoded.capteur_dq != undefined){
        if(decoded.capteur_dq[1] === 0x00){
            dq = "Active";
        }else if(decoded.capteur_dq[1] === 0x01){
            dq = "Désactivé";
        }else{
            dq = "Non utilisé";
        }
        delete decoded.capteur_dq;
        decoded.capteur_dq = {
                value :  dq
        };
    }
    if(decoded.compteur_pir != undefined){
        var compteur = (decoded.compteur_pir[0]<<8 |decoded.compteur_pir[1]);
        delete decoded.compteur_pir;
        decoded.compteur_pir = {
                value :  compteur
        };
    }
    if(decoded.temperature_pir != undefined){
        var temperature = (decoded.temperature_pir[0]<<8 |decoded.temperature_pir[1]);
        delete decoded.temperature_pir;
        decoded.temperature_pir = {
                value :  temperature,
                unit : "mV"
        };
    }
}

function postProcessAncienMR2(decoded,data){
    if(decoded.wirecut != undefined){
        var wirecut = decoded.wirecut;
        delete decoded.wirecut;
        decoded.wirecut = {
                value :  wirecut,
        };
    }
    if(decoded.logic_level != undefined){
        var bin1 = (parseInt(((decoded.logic_level[1])-0).toString(16),16)).toString(2);
        var taille_bin1 = bin1.length+1;

        if(taille_bin1<=9){
           if(bin1.length !== 8){
              for(var j=0;j<(9-(taille_bin1));j++){
                   bin1 = '0' + bin1 ;
              }
           }
        }

        delete decoded.wirecut;
        decoded.wirecut = {
                value : bin1[5]
        };
        delete decoded.logic_level;
        decoded.logic_level2 = {
                value :  bin1[6],
        };
        decoded.logic_level1 = {
                value :  bin1[7],
        };
    }
    if(decoded.sigfox != undefined){
        var binaire = "";
        for(var i=0;i<10;i++){
            var bin1 = (parseInt(((decoded.sigfox[i])-0).toString(16),16)).toString(2);
            var taille_bin1 = bin1.length+1;

            if(taille_bin1<=9){
               if(bin1.length !== 8){
                  for(var j=0;j<(9-(taille_bin1));j++){
                       bin1 = '0' + bin1 ;
                  }
               }
            }
            binaire = binaire + bin1;
        }
        Tref = binaire.slice(0,20);
        Delta1 =  binaire.slice(20,32);
        Delta2 =  binaire.slice(32,44);
        Delta3 =  binaire.slice(44,56);
        Delta4 =  binaire.slice(56,68);
        Delta5 =  binaire.slice(68,80);

        if(data.frame_type === "Trame 39 Compteur mode ECO (Compteur 1 20 bits et 5 deltas 12 bits concaténés SIGFOX)"){
            var temps1 = "Tref-10min";
            var temps2 = "Tref-20min";
            var temps3 = "Tref-30min";
            var temps4 = "Tref-40min";
            var temps5 = "Tref-50min";

        }else if(data.frame_type === "Trame 3A Compteur mode ECO (Compteur 1 20 bits et 5 deltas 12 bits concaténés SIGFOX)"){
            var temps1 = "Tref-30min";
            var temps2 = "Tref-60min";
            var temps3 = "Tref-90min";
            var temps4 = "Tref-120min";
            var temps5 = "Tref-150min";
        }else if(data.frame_type === "Trame 3B Compteur mode ECO (Compteur 1 20 bits et 5 deltas 12 bits concaténés SIGFOX)"){
             var temps1 = "Tref-60min";
             var temps2 = "Tref-120min";
             var temps3 = "Tref-180min";
             var temps4 = "Tref-240min";
             var temps5 = "Tref-300min";
        }
        decoded.counter_init = {
                value : parseInt(Tref,2),
        };
        decoded.Delta1 = {
                value :   parseInt(Delta1,2),
                temps : temps1
        };
        decoded.Delta2 = {
                value :  parseInt(Delta2,2),
                temps : temps2
        };
        decoded.Delta3 = {
                value :  parseInt(Delta3,2),
                temps : temps3
        };
        decoded.Delta4 = {
                value :   parseInt(Delta4,2),
                temps : temps4
        };
        decoded.Delta5 = {
                value :  parseInt(Delta5,2),
                temps : temps5
        };
        delete decoded.sigfox;
    }
}

function postProcessAncienDINDA(decoded,data){
     if(decoded.logic_level_dinda != undefined){
        var bin1 = (parseInt(((decoded.logic_level_dinda)-0).toString(16),16)).toString(2);
        var taille_bin1 = bin1.length+1;
        if(taille_bin1<=9){
           if(bin1.length !== 8){
              for(var j=0;j<(9-(taille_bin1));j++){
                   bin1 = '0' + bin1 ;
              }
           }
        }
        var logic_level_dinda = [];
        if(bin1[2]=== '1'){
            logic_level_dinda.push(1);
        }else{
            logic_level_dinda.push(0);
        }
        if(bin1[3]=== '1'){
            logic_level_dinda.push(1);
        }else{
            logic_level_dinda.push(0);
        }
        delete decoded.logic_level_dinda;
        decoded.logic_level = {
                value :  logic_level_dinda,
        };
    }

     if(decoded.voltage != undefined){
        if(decoded.voltage != undefined){
            var voltage = parseFloat(((decoded.voltage[0]<<8 |decoded.voltage[1]) * 10 / 64240).toFixed(2));
            delete decoded.voltage;
            decoded.voltage = {
                    value :  voltage,
                    unit : "V"
            };
        }
     }

     if(decoded.current != undefined){
        if(decoded.current != undefined){
            if(decoded.offset != undefined){
                 delete decoded.offset;
                 var current = parseFloat(((decoded.current[0]<<8 |decoded.current[1]) * 16 / 47584).toFixed(2));
            }else{
                 delete decoded.offset;
                 var current = parseFloat(((decoded.current[0]<<8 |decoded.current[1]) * 20 / 47584).toFixed(2));
            }
            delete decoded.current;
            decoded.current = {
                    value :  current,
                    unit : "mA"
            };
        }
     }
}

/*******************************************************************************************************************************/
/*******************************************************************************************************************************/
/*PARTIE DECODEUR*/
/*******************************************************************************************************************************/
/*******************************************************************************************************************************/
function decode_pay(encoded){
    var frame_type = getFrameType(encoded);
    var data = {};
    /*Décode pour savoir si il a de l'horodatage*/
    var Horodatage = 0;
    var fram_0	= parseInt(encoded[0], 16);
    var bin_frame_0 = (parseInt((fram_0-0).toString(16),16)).toString(2);
    if (bin_frame_0[1] === "1") {
        Horodatage = 1;
    }
    var alerte = 0;
    if(frame_type === "Trame de mesure" || frame_type === "Trame de test" || frame_type === "Trame de mesure étendu"){
        data = decode_trame_test_mesure(encoded,frame_type,Horodatage,alerte);
    }else if(frame_type === "Trame de vie"){
        data = decode_trame_vie(encoded,Horodatage);
    }else if(frame_type === "Trame d'alerte"){
        alerte = 1;
        data = decode_trame_test_mesure(encoded,frame_type,Horodatage,alerte);
        decode_alerte(encoded,Horodatage,data);
    }else if(frame_type === "Trame d'erreur"){
        data = decode_trame_erreur(encoded,Horodatage);
    }else if(frame_type === "Ancien produit"){
        frame_type  = frame_type_ancien(encoded);
        data = decode_trame_ancien(encoded,frame_type);
    }else if(frame_type === "Trame spécifique"){
        var WR1	= parseInt(encoded[4], 16);
        if(WR1 === 0){
            data.data = 'byte frame_type;' + 'byte[2] wr;';
        }else if(WR1 === 2){
            data.data = 'byte frame_type;' + 'byte[2] wrs;';
        }else{
        }
    }
    else{
        data.data = 'byte frame_type;';
    }
    data.frame_type  = frame_type;
    return data;
}

function getFrameType(encoded) {

    /*Recuperation des 2 premier octet de la trame*/
    var oct1 = parseInt(encoded[0], 16);
    var oct2 = parseInt(encoded[1], 16);

    /*decomposition en binaire pour avoir 4 bits sinon js enléve les 0 de droite inutile*/
    var bin1 = (parseInt((oct1-0).toString(16),16)).toString(2);
    var taille = bin1.length+1;
    if(taille<=5){
        if(bin1.length!=4){
            for(var i=0;i<(5-(taille));i++){
                bin1 = "0"+bin1;
            }
        }
    }
    /*suivent oct ça renvoie le type de trame associer*/
    var frameType = bin1;
    if(bin1[0] === "0"){
        frameType = "Ancien produit";
    }
    else if(bin1[2] === "1"){
        frameType = "Trame de mesure";
    }
    else if (oct2 === 0x1){
        frameType = "Trame de vie";
    } else if (oct2 === 0x2) {
        frameType = "Trame de test reseau";
    } else if (oct2 === 0x5) {
        frameType = "Trame de test";
    } else if (oct2 === 0xD) {
        frameType = "Trame d'alerte";
    } else if (oct2 === 0xE) {
        frameType = "Trame d'erreur";
    } else if (oct2 === 0xF) {
        frameType = "Trame spécifique";
    }else if(oct2 === 0x6){
        frameType = "Réponse à une trame de configuration";
    }else if(oct2 === 0x7){
        frameType = "Réponse à une trame de commande";
    }else if(oct2 === 0x8){
        frameType = "Réponse à une trame erronee";
    }else if(oct2 === 0x9){
        frameType = "Trame de mesure étendu";
    }else {
        frameType = "Type de trame inconnu";
    }
    if(encoded === ""){
        frameType = "Trame vide";
    }
return frameType;
}

function decode_alerte(encoded,Horodatage,data){
	var k=0;
	data.typeAlerte = [];
    for(var i=0;i<data.nbrData;i++){
        if(Horodatage){
            var dframe1		= parseInt(encoded.substr(i+10+k, 2), 16);
            var bin1_dframe = (parseInt((dframe1-0).toString(16),16)).toString(2);
        }else{
            var dframe1		= parseInt(encoded.substr(i+2+k, 2), 16);
            var bin1_dframe = (parseInt((dframe1-0).toString(16),16)).toString(2);
        }
        var taille_bin = bin1_dframe.length;
        if(taille_bin<=8){
            for(var j=0;j<(8-(taille_bin));j++){
                bin1_dframe = "0"+bin1_dframe;
            }
        }
        var nbr = bin1_dframe[0]<<1 | bin1_dframe[1];
        if(nbr === 0){
            data.typeAlerte[i] = "Retour entre les seuils";
        }
        else if(nbr === 1){
            data.typeAlerte[i] = "Dépassement du seuil haut";
        }
        else if(nbr === 2){
            data.typeAlerte[i] = "Dépassement du seuil bas";
        }
		var type_data = dframe1 & 0x0F;
        if(data.typeAlerte != undefined){
            if(type_data === 0x08){
                 k = k+5;
                 data.typeAlerte[i] += " sur la température";
                 data.typeAlerte[i] += " voie " + data.voieTemp[i];
            }
            else if(type_data === 0x06){
                data.typeAlerte[i] += " sur la pression différentiel";
                k = k+5;
            }
            else if(type_data === 0x09){
                k = k+5;
                data.typeAlerte[i] += " sur l'humidité";
                data.typeAlerte[i] += " voie " + data.voieRh[i];
            }
            else if(type_data === 0x0c){
                data.typeAlerte[i] += " sur le COV";
                k = k+5;
            }
            else if(type_data === 0x0d){
                data.typeAlerte[i] += " sur le CO2";
                k = k+5;
            }
            else if(type_data === 0x04){
                k=k+11;
                data.typeAlerte[i] += " sur le CO2";
                data.typeAlerte[i] += " voie " + data.voieComptage[i];
            }
            else if(type_data === 0x07){
                data.typeAlerte[i] += " sur la distance";
                k = k+5;
            }
            else if(type_data === 0x0a){
                data.typeAlerte[i] += " sur la tension";
                 k = k+5;
            }
            else if(type_data === 0x0b){
                data.typeAlerte[i] += " sur la courant";
                 k = k+5;
            }
        }
    }

}

function decode_trame_vie(encoded,Horodatage){
    var data = {};
    var res_str = 'byte frame_type;';
    if(Horodatage){
        res_str = res_str + 'ubyte[4] horo;' + 'ubyte[2] tensionv;' + 'ubyte[2] tensionc;';
    }else{
        res_str = res_str + 'ubyte[2] tensionv;' + 'ubyte[2] tensionc;';
    }
    data.data = res_str;
    return data;

}

function decode_trame_test_mesure(encoded,frame_type,Horodatage,alerte){
    var fram_0	= parseInt(encoded[0], 16);
    var fram_1	= parseInt(encoded[1], 16);
    var bin_frame_0 = (parseInt((fram_0-0).toString(16),16)).toString(2);
    var bin_frame_1 = (parseInt((fram_1-0).toString(16),16)).toString(2);

    var taille_0 = bin_frame_0.length+1;
    if(taille_0 <=5){
        if(bin_frame_0.length!=4){
            for(var i=0;i<(5-(taille_0));i++){
                bin_frame_0 = "0"+bin_frame_0;
            }
        }
    }

    var taille_1 = bin_frame_1.length+1;
    if(taille_1<=5){
        if(bin_frame_1.length!=4){
            for(var i=0;i<(5-(taille_1));i++){
                bin_frame_1 = "0"+bin_frame_1;
            }
        }
    }

    var historique=0;
    var echan=0;
    if(frame_type === "Trame de mesure"){
        if(bin_frame_0[3] === "1" || bin_frame_1[0] === "1" ){
            var bin_hist = bin_frame_0[3] + bin_frame_1[0];
            historique = parseInt(bin_hist, 2) + 1;
        }
        if(bin_frame_1[1] === "1" || bin_frame_1[2] === "1" || bin_frame_1[3] === "1"){
		    var bin_ech = bin_frame_1[1] + bin_frame_1[2] + bin_frame_1[3];
            echan = parseInt(bin_ech, 2) + 1;
        }
       var data = decodeFrame(encoded,historique,echan,Horodatage,alerte,0);
    }
    if(frame_type === "Trame de mesure étendu"){
        if(Horodatage){
            historique = parseInt(encoded[14]+encoded[15], 16);
            var echan1 = parseInt(encoded[16]+encoded[17], 16);
            var echan2 = parseInt(encoded[18]+encoded[19], 16);
            echan1 = echan1<<8;
            echan = echan1 + echan2;
        }else{
            historique = parseInt(encoded[6]+encoded[7], 16);
            var echan1 = parseInt(encoded[8]+encoded[9], 16);
            var echan2 = parseInt(encoded[10]+encoded[11], 16);
            echan1 = echan1<<8;
            echan = echan1 + echan2;
        }
       var data = decodeFrame(encoded,historique,echan,Horodatage,alerte,1);
    }
    if(frame_type === "Trame de test") {
        var data = decodeFrame(encoded,0,0,Horodatage,alerte,0);
    }
    if(alerte === 1){
        var data = decodeFrame(encoded,0,0,Horodatage,alerte,0);
    }

    return data;
}

function hexToBytes(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

function decodeFrame(frame,historique,echan,Horodatage,alerte,etendu){
   	var bytes = hexToBytes(frame);
    var res_str = 'byte frame_type;';
    var start_bcl = 1;
    var data = {};
    var k=0;
    data.nbrData = 0;
    data.voieTemp = [];	data.voieRh = []; data.voieEntree = []; data.voieComptage = [];
	var ctn_voie_temp = 0;var ctn_voie_rh = 0;var ctn_voie_comptage = 0;
    var taille_comptage = 0;

    if(Horodatage === 1){
        res_str = res_str + 'ubyte[4] horo;';
        start_bcl += 4;
    }
    if(historique >= 1 | echan >= 1){
        res_str = res_str + 'ubyte[2] periode;';
        start_bcl += 2;
    }
    if(etendu){
        res_str = res_str + 'ubyte[3] histo_echan;';
        start_bcl += 3;
    }
    if(historique<1){
        historique = 1;
    }
    if(echan<1){
        echan = 1;
    }

    data.echan = echan;
    data.historique = historique;
    /*var alerte = 0;*/

    var i = start_bcl;
    while(i<bytes.length){
            var voie =0;
			var var_inter =  bytes[i] & 0x0F;
   			if(var_inter != bytes[i]){
				if(alerte){
                    voie = bytes[i] & 0x30;
                    if(voie === 16){
                        voie = 1;
                    }else if(voie === 32){
                        voie = 2;
                    }else if(voie === 48){
                        voie = 3;
                    }
				}else{
					voie = (bytes[i] & 0xF0);
					if(voie === 16){
						voie = 1;
					}else if(voie === 32){
						voie = 2;
					}else if(voie === 48){
						voie = 3;
					}
				}
				bytes[i] = var_inter;
			}
			switch (bytes[i]) {
				case 0x08:
		            k=1;
					for(var j=0;j<(historique*echan);j++){
					    k+=2;
						i += 2;
					}
				    res_str = res_str + 'ubyte[' + k + '] temp' + voie.toString() + ';';
					i++;
					data.voieTemp[ctn_voie_temp] = voie.toString();
					ctn_voie_temp++;
					break;

				case 0x09:
				    k=1;
					for(var j=0;j<(historique*echan);j++){
					    k += 2;
						i += 2;
					}
					res_str = res_str + 'ubyte['+ k +'] hum' + voie.toString() + ';';
					i++;
					data.voieRh[ctn_voie_rh] = voie.toString();
					ctn_voie_rh++;
					break;
				case 0x0c:
				    k=1;
					for(var j=0;j<(historique*echan);j++){
						k += 2;
						i += 2;
					}
					res_str = res_str + 'ubyte['+ k +'] cov;';
					i++;
					break;
				case 0x0d:
				    k=1;
					for(var j=0;j<(historique*echan);j++){
					    k += 2;
						i += 2;
					}
					res_str = res_str + 'ubyte['+ k +'] co2;';
					i++;
					break;
				case 0x01:
				    k=1;
					for(var j=0;j<(historique*echan);j++){
					    k += 1;
						i += 1;
					}
					res_str = res_str + 'ubyte['+ k +'] entree;';
					i++;
					break;
				case 0x07:
				    k=1;
					for(var j=0;j<(historique*echan);j++){
					    k += 2;
						i += 2;
					}
					res_str = res_str + 'ubyte['+ k +'] dist;';
					i++;
					break;

				case 0x06:
				    k=1;
					for(var j=0;j<(historique*echan);j++){
						i += 2;
						k += 2;
					}
					res_str = res_str + 'ubyte['+ k +'] dp;';
					i++;
					break;
				case 0x04:
				    k=1;
					for(var j=0;j<(historique*echan);j++){
						i += 4;
						k += 4;
					}
					res_str = res_str + 'ubyte['+ k +'] compte' + voie.toString() + ';';
					i++;
					data.voieComptage[ctn_voie_comptage] = voie;
					ctn_voie_comptage++;
					break;

                case 0x0a:
                    k=1;
                    for(var j=0;j<(historique*echan);j++){
                        i += 2;
                        k += 2;
                    }
                    res_str = res_str + 'ubyte['+ k +'] tension;';
                    i++;
                    break;
                case 0x0b:
                    k=1;
                    for(var j=0;j<(historique*echan);j++){
                        i += 2;
                        k += 2;
                    }
                    res_str = res_str + 'ubyte['+ k +'] courant;';
                    i++;
                    break;
				default:
					i++;
			}
			data.nbrData++;
    }
    data.data = res_str;
    return  data;
}

function decode_trame_erreur(encoded,Horodatage){
    var res_str = 'byte frame_type;';
    var data = {};
    data.typeErreur = [];

	var ERR_SENSOR_NO_DATA  			  = 0x81; /*Impossible de lire une température/humidité sur le capteur.*/
	var ERR_BUF_SMALLER 			 	  = 0x82; /*Le tableau de données est plein, impossible d’y écrire des données supplémentaires*/
	var ERR_DEPTH_HISTORIC_OUT_OF_RANGE   = 0x83; /*La profondeur d’historique est trop grande ou trop petite pour la trame*/
	var ERR_NB_SAMPLE_OUT_OF_RANGE 	      = 0x84; /*Le nombre d’échantillon est trop grand ou trop petit pour la trame*/
	var ERR_NWAY_OUT_OF_RANGE 		      = 0x85; /*Le nombre de voie dans l’entête de la trame est trop grand ou trop petit*/
	var ERR_TYPEWAY_OUT_OF_RANGE 		  = 0x86; /*Le type de mesure dans l’entête de la trame est trop grand ou trop petit*/
	var ERR_SAMPLING_PERIOD 			  = 0x87; /*Mauvaise structure de période d’échantillonnage*/
	var ERR_SUBTASK_END 				  = 0x88; /*Fin d’une sous tache après être sortie d’une boucle infinie*/
	var ERR_NULL_POINTER 				  = 0x89; /*Pointeur avec valeur “NULL”*/
	var ERR_BATTERY_LEVEL_DEAD 		      = 0x8A; /*Niveau de batterie critique*/
	var ERR_EEPROM 					      = 0x8B; /*EEPROM est corrompue*/
	var ERR_ROM 						  = 0x8C; /*ROM est corrompue*/
	var ERR_RAM 						  = 0x8D; /*RAM est corrompue*/
	var ERR_ARM_INIT_FAIL 			      = 0x8E; /*L’initialisation du module radio a échoué*/
	var ERR_ARM_BUSY 					  = 0x8F; /*Le module est déjà occupé (possiblement non initialisé)*/
	var ERR_ARM_BRIDGE_ENABLE 		      = 0x90; /*Le module est en mode bridge, impossible d’envoyer desdonnées par radio*/
	var ERR_RADIO_QUEUE_FULL 			  = 0x91; /*Le buffer de la radio est plein*/
	var ERR_CFG_BOX_INIT_FAIL 		      = 0x92; /*Erreur lors de l’initialisation de la black box*/
	var ERR_KEEP_ALIVE_PERIOD 		      = 0x93; /*Mauvaise structure de période de trame de vie*/
	var ERR_ENTER_DEEP_SLEEP 			  = 0x94; /*Le produit est passé en mode veille profonde*/
	var ERR_BATTERY_LEVEL_LOW 		      = 0x95; /*Niveau de batterie faible*/
	var ERR_ARM_TRANSMISSION 			  = 0x96; /*Une transmission a été initialisé mais une erreur est survenue*/
	var ERR_ARM_PAYLOAD_BIGGER 	          = 0x97; /*La taille du message est trop grande par rapport à la capacité du réseau*/
	var ERR_RADIO_PAIRING_TIMEOUT 	      = 0x98; /*Impossible de s’appairer à un réseau avant le temps imparti*/
	var ERR_SENSORS_TIMEOUT 			  = 0x99; /*Un timeout a été atteint sur le capteur*/
	var ERR_SENSOR_STOP 				  = 0x9A; /*Le capteur n’a pas retourné de valeur lors d’une lecture*/
	var ERR_SENSORS_INIT_FAIL 		      = 0x9B; /*Le capteur de température humidité n’est pas détecté au démarrage*/
	var ERR_BOX_OPENED 				      = 0X9C; /*Ouverture du boitier*/
	var ERR_BOX_CLOSED				      = 0X9D; /*Fermeture du boitier*/
	var ERR_SENSORS_MOVE 				  = 0x9E; /*Détection d’un déplacement/vol sur le produit*/
	var ERR_SENSOR_CRC_KO 			      = 0x9F; /*Données du capteur de température humidité corrompues*/

    var cpt =0;
    var taille_trame = encoded.length;
    var start_boucle = 2;
    if(Horodatage){
        res_str += 'ubyte[4] horo;';
        start_boucle+=8;
    }
    for(var i=start_boucle;i<taille_trame;i+=2){

        var taille_erreur = parseInt(encoded.substr(i, 2), 16) & 0x0F;
        i+=2;
        var frameErreurCode = (parseInt(encoded.substr(i, 2), 16));
        switch (frameErreurCode) {
            case ERR_SENSOR_NO_DATA:
                data.typeErreur[cpt] = "Erreur inconnue";
                break;
            case ERR_BUF_SMALLER:
                data.typeErreur[cpt]  = "Le tableau de données est plein, impossible d’y écrire des données supplémentaires";
                break;
            case ERR_DEPTH_HISTORIC_OUT_OF_RANGE:
                data.typeErreur[cpt]  = " La profondeur d’historique est trop grande ou trop petite pour la trame";
                break;
            case ERR_NB_SAMPLE_OUT_OF_RANGE:
                data.typeErreur[cpt]  = "Le nombre d’échantillon est trop grand ou trop petit pour la trame";
                break;
            case ERR_NWAY_OUT_OF_RANGE:
                data.typeErreur[cpt]  = "Le nombre de voie dans l’entête de la trame est trop grand ou trop petit";
                break;
            case ERR_TYPEWAY_OUT_OF_RANGE:
                data.typeErreur[cpt]  = "Le type de mesure dans l’entête de la trame est trop grand ou trop petit";
                break;
            case ERR_SAMPLING_PERIOD:
                data.typeErreur[cpt]  = "Mauvaise structure de période d’échantillonnage";
                break;
            case ERR_SUBTASK_END:
                data.typeErreur[cpt]  = "Fin d’une sous tache après être sortie d’une boucle infinie";
                break;
            case ERR_NULL_POINTER:
                data.typeErreur[cpt]  = "Pointeur avec valeur “NULL”";
                break;
            case ERR_BATTERY_LEVEL_DEAD:
                data.typeErreur[cpt]  = "Niveau de batterie critique";
                data.battery = parseInt(encoded.substr(i+2, 4),16)/1000;
                break;
            case ERR_EEPROM:
                data.typeErreur[cpt]  = "EEPROM est corrompue";
                break;
            case ERR_ROM:
                data.typeErreur[cpt]  = "ROM est corrompue";
                break;
            case ERR_RAM:
                data.typeErreur[cpt]  = "RAM est corrompue";
                break;
            case ERR_ARM_INIT_FAIL:
                data.typeErreur[cpt]  = "L'initialisation du module radio a échoué";
                break;
            case ERR_ARM_BUSY:
                data.typeErreur[cpt]  = "Le module est déjà occupé (possiblement non initialisé)";
                break;
            case ERR_ARM_BRIDGE_ENABLE:
                data.typeErreur[cpt]  = "Le module est en mode bridge, impossible d'envoyer des données par radio";
                break;
            case ERR_RADIO_QUEUE_FULL:
                data.typeErreur[cpt]  = "Le buffer de la radio est plein";
                break;
            case ERR_CFG_BOX_INIT_FAIL:
                data.typeErreur[cpt]  = "Erreur lors de l'initialisation de la black box";
                break;
            case ERR_KEEP_ALIVE_PERIOD:
                data.typeErreur[cpt]  = "Mauvaise structure de période de trame de vie";
                break;
            case ERR_ENTER_DEEP_SLEEP:
                data.typeErreur[cpt]  = "Le produit est passé en mode veille profonde";
                break;
            case ERR_BATTERY_LEVEL_LOW:
                data.typeErreur[cpt]  = "Niveau de batterie faible";
                data.battery = parseInt(encoded.substr(i+2, 4),16)/1000;
                break;
            case ERR_ARM_TRANSMISSION:
                data.typeErreur[cpt]  = "Une transmission a été initialisée mais une erreur est survenue";
                break;
            case ERR_ARM_PAYLOAD_BIGGER:
                data.typeErreur[cpt]  = "La taille du message est trop grande par rapport à la capacité du réseau";
                break;
            case ERR_RADIO_PAIRING_TIMEOUT:
                data.typeErreur[cpt]  = "Impossible de s'appairer à un réseau avant le temps imparti";
                break;
            case ERR_SENSORS_TIMEOUT:
                data.typeErreur[cpt]  = "Un timeout a été atteint sur le capteur";
                break;
            case ERR_SENSOR_STOP:
                data.typeErreur[cpt]  = "Le capteur n'a pas retourné de valeur lors d'une lecture";
                break;
            case ERR_SENSORS_INIT_FAIL:
                data.typeErreur[cpt]  = "Le capteur a cessé de fonctionner";
                break;
            case ERR_BOX_OPENED:
                data.typeErreur[cpt]  = "Ouverture du boitier";
                break;
            case ERR_BOX_CLOSED:
                data.typeErreur[cpt]  = "Fermeture du boititer";
                break;
            case ERR_SENSORS_MOVE:
                data.typeErreur[cpt]  = "Détection d’un déplacement/vol sur le produit";
                break;
            case ERR_SENSOR_CRC_KO:
                data.typeErreur[cpt]  = "Données du capteur de température humidité corrompues";
                break;
            default:
                data.typeErreur[cpt]  = "Erreur inconnue";
        }
        cpt++;
        if(taille_erreur>1){
            i+=2*taille_erreur-1;
        }
    }
    data.data = res_str;
    return  data;
}

/***********/
/*Ancien produit*/
/***********/

function frame_type_ancien(encoded){
    var oct1 = parseInt(encoded.substr(0, 2), 16);
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
        frameType = "Trame d’entrées/sorties digitales et compteurs";
    }else if(oct1 === 0x32){
            frameType = "Produit PIR";
    }else if(oct1 === 0x14){
            frameType = "Trame de compteur standard";
    }else if(oct1 === 0x37){
            frameType = "Trame alerte état câble coupé";
    }else if(oct1 === 0x09){
             frameType = "Trame de détection de changement d'état (TOR)";
    }else if(oct1 === 0x30){
            frameType = "Trame Compteur mode ECO (Compteur 1 22 bits et 5 deltas 32 bits LoraWan )";
    }else if(oct1 === 0x31){
             frameType = "Trame Test LoraWan";
    }else if(oct1 === 0x39){
            frameType = "Trame 39 Compteur mode ECO (Compteur 1 20 bits et 5 deltas 12 bits concaténés SIGFOX)";
    }else if(oct1 === 0x3a){
            frameType = "Trame 3A Compteur mode ECO (Compteur 1 20 bits et 5 deltas 12 bits concaténés SIGFOX)";
    }else if(oct1 === 0x3b){
            frameType = "Trame 3B Compteur mode ECO (Compteur 1 20 bits et 5 deltas 12 bits concaténés SIGFOX)";
    }else if(oct1 === 0x18){
            frameType = "Trame de relevé périodique d'une valeur 0-10V";
     }else if(oct1 === 0x19){
             frameType = "Trame de relevé périodique d'une valeur 0- 20mA";
     }else if(oct1 === 0x1e){
             frameType = "Trame d'alerte BAS d'une valeur 0-10V";
     }else if(oct1 === 0x22){
             frameType = "Trame d'alerte BAS d'une valeur 4-20mA";
     }else if(oct1 === 0x1f){
              frameType = "Trame defin d'alerte BAS d'une valeur 0-10V";
     }else if(oct1 === 0x23){
             frameType = "Trame de fin d'alerte BAS d'une valeur 4-20mA";
     }else if(oct1 === 0x20){
              frameType = "Trame d'alerte HAUT d'une valeur 0-10V";
     }else if(oct1 === 0x24){
             frameType = "Trame d'alerte HAUT d'une valeur 4-20mA";
     }else if(oct1 === 0x21){
             frameType = "Trame de fin d’alerte HAUT d’une valeur 0-10V";
     }else if(oct1 === 0x25){
             frameType = "Trame de fin d'alerte HAUT d'une valeur 4-20mA";
     }else{
             frameType = "Type de trame inconnu";
     }
    return frameType;
}
function decode_trame_ancien(encoded,frame_type){
    var bytes = hexToBytes(encoded);
    var res_str = 'byte frame_type;';
    var data = {};
    switch (frame_type) {
        case "Trame de vie":
            res_str = res_str + 'ubyte[2] tensionc;';
            break;
        case "Trame de test":
            res_str = res_str + 'ubyte ancien_compteur;';
            break;

        case "Trame d’entrées digitales":
            res_str = res_str + 'ubyte[2] entree_ancien;';
            break;

        case "Trame d’entrées digitales et température":
            res_str = res_str + 'ubyte[2] entree_ancien;' + 'ubyte[2] temperature;';
            break;

        case "Trame d’entrées digitales,température et compteur 1":
            res_str = res_str + 'ubyte[2] entree_ancien;' + 'ubyte[2] temperature;' + 'ubyte[4] ancien_compteur1;';
            break;

        case "Trame d’entrées digitales, compteur 1 et compteur 2 ":
            res_str = res_str + 'ubyte[2] entree_ancien;' + 'ubyte[4] ancien_compteur1;' + 'ubyte[4] ancien_compteur2;';
            break;

        case "Trame d’entrées digitales et compteur 1 ":
            res_str = res_str + 'ubyte[2] entree_ancien;' + 'ubyte[4] ancien_compteur1;';
            break;

        case "Trame du compteur 1 et 2":
            res_str = res_str  + 'ubyte[4] ancien_compteur1;' + 'ubyte[4] ancien_compteur2;';
            break;

        case "Trame du compteur 3 et 4":
            res_str = res_str  + 'ubyte[4] ancien_compteur3;' + 'ubyte[4] ancien_compteur4;';

            break;

        case "Trame du compteur 5 et 6":
            res_str = res_str  + 'ubyte[4] ancien_compteur5;' + 'ubyte[4] ancien_compteur6;';
            break;

        case "Trame du compteur 7 et 8":
            res_str = res_str  + 'ubyte[4] ancien_compteur7;' + 'ubyte[4] ancien_compteur8;';
            break;

        case "Trame d’entrées digitales,température et compteurs":
            res_str = res_str + 'ubyte[2] entree_ancien;' + 'ubyte[2] temperature;';
            var taille_bytes = (bytes.length-5)/4;
            for(var j=0;j<taille_bytes;j++){
                res_str = res_str + 'ubyte[4] ancien_compteur' + j + ';';
            }
            break;
        case "Trame d’entrées digitales et compteurs":
            res_str = res_str + 'ubyte[2] entree_ancien;';
            var taille_bytes = (bytes.length-3)/4;
            for(var j=0;j<taille_bytes;j++){
                res_str = res_str + 'ubyte[4] ancien_compteur' + j + ';';
            }
            break;

        case "Trame alarme ou chocs":
            res_str = res_str + 'ubyte ancien_compteur;';
            break;

        case "Trame d’entrées/sorties digitales":
            res_str = res_str + 'ubyte entree_digital;' + 'ubyte sortie_digital;';
            break;

        case "Trame d’entrées/sorties digitales et température":
             res_str = res_str + 'ubyte entree_digital;' + 'ubyte sortie_digital;' + 'ubyte[2] temperature;';
            break;

        case "Trame d’entrées/sorties digitales, température et compteur 1":
             res_str = res_str + 'ubyte entree_digital;' + 'ubyte sortie_digital;' + 'ubyte[2] temperature;' + 'ubyte[4] ancien_compteur1;';
            break;

        case "Trame d’entrées/sorties digitales, compteur 1 et compteur 2":
             res_str = res_str + 'ubyte entree_digital;' + 'ubyte sortie_digital;' + 'ubyte[4] ancien_compteur1;' + 'ubyte[4] ancien_compteur2;';
            break;

        case "Trame d’entrées/sorties digitales et compteur 1":
            res_str = res_str + 'ubyte entree_digital;' + 'ubyte sortie_digital;'  + 'ubyte[4] ancien_compteur1;';
            break;

        case "Trame d’entrées/sorties digitales, température et compteurs":
             res_str = res_str + 'ubyte entree_digital;' + 'ubyte sortie_digital;' + 'ubyte[2] temperature;';
             var taille_bytes = (bytes.length-5)/4;
            for(var j=0;j<taille_bytes;j++){
                res_str = res_str + 'ubyte[4] ancien_compteur' + j + ';';
            }
            break;

        case "Trame d’entrées/sorties digitales et compteurs":
            res_str = res_str + 'ubyte entree_digital;' + 'ubyte sortie_digital;';
            var taille_bytes = (bytes.length-3)/4;
            for(var j=0;j<taille_bytes;j++){
                res_str = res_str + 'ubyte[4] ancien_compteur' + j + ';';
            }
            break;

        case "Produit PIR":
            res_str = res_str + 'ubyte type_trame;' + 'ubyte ouverture_boitier;' + 'ubyte[2] capteur_dq;' + 'ubyte[2] compteur_pir;' + 'ubyte[2] temperature_pir;';
            break;
        case "Trame de compteur standard":
            res_str = res_str + 'ubyte wirecut;' + 'ubyte[4] ancien_compteur1;' + 'ubyte[4] ancien_compteur2;';
        break;
        case "Trame alerte état câble coupé":
            res_str = res_str + 'ubyte wirecut;';
        break;
        case "Trame de détection de changement d'état (TOR)":
            res_str = res_str + 'ubyte[2] logic_level;';
        break;
        case "Trame Compteur mode ECO (Compteur 1 22 bits et 5 deltas 32 bits LoraWan )":
            res_str = res_str  + 'ubyte[4] ancien_compteur5;' + 'ubyte[4] ancien_compteur4;' + 'ubyte[4] ancien_compteur3;' + 'ubyte[4] ancien_compteur2;' + 'ubyte[4] ancien_compteur1;' + 'ubyte[4] ancien_compteur0;';
        break;
        case "Trame Test LoraWan":
            res_str = res_str + 'ubyte[4] ancien_compteur1;';
        break;
        case "Trame 39 Compteur mode ECO (Compteur 1 20 bits et 5 deltas 12 bits concaténés SIGFOX)":
            res_str = res_str + 'ubyte[10] sigfox;';
        break;
        case "Trame 3A Compteur mode ECO (Compteur 1 20 bits et 5 deltas 12 bits concaténés SIGFOX)":
            res_str = res_str + 'ubyte[10] sigfox;';
        break;
        case "Trame 3B Compteur mode ECO (Compteur 1 20 bits et 5 deltas 12 bits concaténés SIGFOX)":
            res_str = res_str + 'ubyte[10] sigfox;';
        break;
         case "Trame de relevé périodique d'une valeur 0-10V":
            res_str = res_str + 'ubyte logic_level_dinda;' + 'ubyte[2] voltage;';
         break;
         case "Trame de relevé périodique d'une valeur 0- 20mA":
            res_str = res_str + 'ubyte logic_level_dinda;' + 'ubyte[2] current;';
         break;
         case "Trame d'alerte BAS d'une valeur 0-10V":
            res_str = res_str + 'ubyte logic_level_dinda;' + 'ubyte[2] voltage;';
         break;
         case "Trame d'alerte BAS d'une valeur 4-20mA":
            res_str = res_str + 'ubyte logic_level_dinda;' + 'ubyte[2] current;' + 'ubyte offset;';
         break;
         case "Trame defin d'alerte BAS d'une valeur 0-10V":
            res_str = res_str + 'ubyte logic_level_dinda;' + 'ubyte[2] voltage;';
         break;
         case "Trame de fin d'alerte BAS d'une valeur 4-20mA":
            res_str = res_str + 'ubyte logic_level_dinda;' + 'ubyte[2] current;' + 'ubyte offset;';
         break;
         case "Trame d'alerte HAUT d'une valeur 0-10V":
            res_str = res_str + 'ubyte logic_level_dinda;' + 'ubyte[2] voltage;';
         break;
         case "Trame d'alerte HAUT d'une valeur 4-20mA":
            res_str = res_str + 'ubyte logic_level_dinda;' + 'ubyte[2] current;' + 'ubyte offset;';
         break;
         case "Trame de fin d’alerte HAUT d’une valeur 0-10V":
            res_str = res_str + 'ubyte logic_level_dinda;' + 'ubyte[2] voltage;';
         break;
         case "Trame de fin d'alerte HAUT d'une valeur 4-20mA":
            res_str = res_str + 'ubyte logic_level_dinda;' + 'ubyte[2] current;' + 'ubyte offset;';
         break;
        }
    data.data = res_str;
    return data;
}

function decode_json(data_json,frame){

var declarationString = data_json;
var str = declarationString.split(';');
var inputString = frame;

//console.log(str);
var length_pred = 0;
    var data = {};

for(var w=0;w<str.length;w++){
    declarationString = str[w];
    declarationString = declarationString.split(' ');

    // Extraire les types et les noms des variables de la déclaration
    var variables = [];
    if(isNaN(parseInt(declarationString[0][6]))){
        var length = 1;
    }else if(isNaN(parseInt(declarationString[0][7]))){
        var length = parseInt(declarationString[0][6]);
    }else{
        var length = parseInt(parseInt(declarationString[0][6]) * 10 + parseInt(declarationString[0][7]));        
    }
    var variable = {
      type: declarationString[0],
      name: declarationString[1],
      length: length 
    };
    variables.push(variable);

    // Décomposer la chaîne de caractères en utilisant les informations sur les variables
    var currentIndex = length_pred;
    for (var i = 0; i < variables.length; i++) {
      var variable = variables[i];
      var bytesHex = inputString.substr(currentIndex, variable.length * 2);
      currentIndex += variable.length * 2;

      var bytesDecimal = [];
      for (var j = 0; j < bytesHex.length; j += 2) {
        bytesDecimal.push(parseInt(bytesHex.substr(j, 2), 16));
      }
      
      if (variable.length === 1) {
        data[variable.name] = bytesDecimal[0];
      } else {
        data[variable.name] = bytesDecimal;
      }
      
    }
    length_pred+=variable.length*2;
}

var output = {};
for (var key in data) {
  if (data.hasOwnProperty(key) && key !== "undefined") {
    output[key] = data[key];
  }
}
return JSON.stringify(output);
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


