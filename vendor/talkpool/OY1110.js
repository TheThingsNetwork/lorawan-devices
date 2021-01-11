
function decodeUplink(input) {

    //Get DataByte Hex from Base64
    let dataBytes = Buffer.from(dataEncodedString,'base64');
    console.log(dataBytes)


    let parsedValues = []
//Initialization port variable to 3
    let port=3
    if(port===1){
        //status
    }
// For Periodic single measurement report
    else if (port===2){
        if(dataBytes.length % 3 !==0){
            return null;
        }
        capacity = dataBytes.length/3;

        for (index=0;index < capacity;index++){
            let OY1110Data = {};
            d = new Date();
            d.setMinutes(d.getMinutes()-(15*index))

            OY1110Data.Temperature =  ( ( ( ((dataBytes[index*3])<<4) | ((dataBytes[(index*3)+2]&0xF0)>>4) )- 800) / 10.0)
            OY1110Data.RelativeHumidity = ( ( ( ((dataBytes[(index*3)+1])<<4) | (dataBytes[(index*3)+2]&0x0F) )- 250) / 10.0)

            if(OY1110Data.Temperature >= - 50 && OY1110Data.Temperature <= -0.1){
                denominator=2* Math.pow(37.230718,2)
                numerator= Math.pow((108.19749 - OY1110Data.Temperature),2) * -1
                let expval= numerator/denominator
                let VS=330.67796* Math.exp(expval)
                OY1110Data.Humidity  = parseFloat( VS.toFixed(2) );
            }

     
            OY1110Data.Time = d.toISOString();
            parsedValues.push(OY1110Data)

        }
    }

//For Periodic grouped measurement report
    else if (port===3){

        if (dataBytes.length%3 != 1) {
            return null;
            }
      
        dataBytes = dataBytes.slice(1,dataBytes.length)
        capacity =  dataBytes.length / 3
        
        for (index = 0; index < capacity; index++) {
            let OY1110Data = {};
            d = new Date();
            d.setMinutes(d.getMinutes()-(15*index))

            OY1110Data.Temperature =  ( ( ( ((dataBytes[index*3])<<4) | ((dataBytes[(index*3)+2]&0xF0)>>4) )- 800) / 10.0)
            OY1110Data.RelativeHumidity = ( ( ( ((dataBytes[(index*3)+1])<<4) | (dataBytes[(index*3)+2]&0x0F) )- 250) / 10.0)
             // Check negative temperature value 
            if(OY1110Data.Temperature >= - 50 && OY1110Data.Temperature <= -0.1){
                denominator=2* Math.pow(37.230718,2)
                numerator= Math.pow((108.19749 - OY1110Data.Temperature),2) * -1
                let expval= numerator/denominator
                let VS=330.67796* Math.exp(expval)
                OY1110Data.Humidity  = parseFloat( VS.toFixed(2) );
            }

     

            OY1110Data.Time = d.toISOString();
            parsedValues.push(OY1110Data)

        }
   
    }
    else{
        return null;
    }
    return parsedValues;

}
