/**
 * RDR Payload Decoders
 *
 * THIS SOFTWARE IS PROVIDED BY PARAMETRIC GMBH AND ITS CONTRIBUTORS “AS IS” AND ANY EXPRESS OR IMPLIED WARRANTIES, 
 * INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
 * IN NO EVENT SHALL APPLE INC. OR ITS CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, 
 * OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; 
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, 
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, 
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. 
 *   
*/

function app_payload_r0_decoder(bytes) {
    var obj = {};

    // check for Parametric RDR R0 Payload
    if (bytes[0] == 0xbe && bytes[1] == 0x05 && bytes[2] === 0x00) {

        // Uplink Timestamp (Linux Epoche)        
        var timestampUL = bytes[3] << 24;
        timestampUL += bytes[4] << 16;
        timestampUL += bytes[5] << 8;
        timestampUL += bytes[6]; 
        var ULInMs = new Date(timestampUL * 1000).getTime() 
        var nowInMs = new Date().getTime()
        var diffUL = nowInMs - ULInMs 
        var actualULTIME = new Date(ULInMs + diffUL)
        obj.ULTIME = actualULTIME.toISOString();


        // Number of scan records
        obj.RECCNT = bytes[7]; 

        // Number of records still in device buffer
        obj.BUFF = bytes[8]; 

        obj.Records = [];

        // scan records
        var nextRecPos = 9;    // scan position        
        for(var i = 0; i < obj.RECCNT; i++)
        {
            var rec = {};

            // scan timestamp
            var timestampSCAN = bytes[nextRecPos] << 24;
            timestampSCAN += bytes[nextRecPos+1] << 16;
            timestampSCAN += bytes[nextRecPos+2] << 8;
            timestampSCAN += bytes[nextRecPos+3];
            var diff = ULInMs - new Date(timestampSCAN * 1000).getTime();
            var actualSCANTIME = new Date(nowInMs - diff);
            rec.SCANTIME = actualSCANTIME.toISOString();

            // nfc serial            
            rec.SERIAL = bytes.slice(nextRecPos+4, nextRecPos+12);
            rec.LEN = bytes[nextRecPos+12];
            rec.DATA = bytes.slice(nextRecPos+12, nextRecPos+12+rec.LEN);
            obj.Records.push(rec);             

            nextRecPos = nextRecPos + 12 + rec.LEN + 2;
        }

    }
    return obj;
}

 


function bin16dec(bin) {
    var num = bin & 0xFFFF;
    if (0x8000 & num) num = -(0x010000 - num);
    return num;
}

function hexToBytes(hex) {
    hex = hex.replace(/\s+/g, '');
    hex = hex.toLowerCase();
    for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}



function decodeUplink(input) {
    var bytes = input.bytes;
    var port = input.fPort;
    var obj = {};

    if (bytes[0] == 0xbe && bytes[1] == 0x05 && port == 5) {
        if (bytes[2] === 0x00)           
        {
            // it's the application payload v0
            obj = app_payload_r0_decoder(bytes, port);
        }
    }
    else if  (port != 5){
        obj.error = "ERROR: Wrong port! RDR devices are using port 5 for application payloads.";
      }
    else {
        obj.error = "ERROR: RDR application payload R0 should start with be0500..  ";
      }

    return {
        data: obj
  }
}

//Example Payload: BE05005F9BEB2C01005F9BAB2C9EAF5126002302E0010C