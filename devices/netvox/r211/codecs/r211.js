function getCmd(inputcmd){
  var cmdIDs = {
    0x07: "AirIRApplyReq",
    0x08: "AirIRApplyRsp",
    0x32: "AirIRApplyWithIdxReq",
    0x33: "AirIRApplyWithIdxRsp",
    0x49: "NewIRLearnReq",
    0x4A: "NewIRLearnRsp",
    0x0D: "EraseIRReq",
    0x0E: "EraseIRRsp"
  };
  return cmdIDs[inputcmd];
}

function getDeviceName(dev){
  var deviceName = {
    0x0F: "R211"
  };
  return deviceName[dev];
}

function getDeviceType(devName){
  if (devName == "R211")
	  return 0x0F;
}

function StrToHex(str, len) {
	
	var ch;
	var ret = [];
	var dec = 0, cnt = 0, h = 0;
	
	for (var i = 0; i < len; i++)
	{
		ch = str.substr(i, 1);
		if (cnt == 0)
			h = 16;
		else
			h = 1;

		switch(ch)
		{
			case '0':
				dec = h * 0 + dec;
			break;
			case '1':
				dec = h * 1 + dec;
			break;
			case '2':
				dec = h * 2 + dec;
			break;
			case '3':
				dec = h * 3 + dec;
			break;
			case '4':
				dec = h * 4 + dec;
			break;
			case '5':
				dec = h * 5 + dec;
			break;
			case '6':
				dec = h * 6 + dec;
			break;
			case '7':
				dec = h * 7 + dec;
			break;
			case '8':
				dec = h * 8 + dec;
			break;
			case '9':
				dec = h * 9 + dec;
			break;
			case 'A':
			case 'a':
				dec = h * 10 + dec;
			break;
			case 'B':
			case 'b':
				dec = h * 11 + dec;
			break;
			case 'C':
			case 'c':
				dec = h * 12 + dec;
			break;
			case 'D':
			case 'd':
				dec = h * 13 + dec;
			break;
			case 'E':
			case 'e':
				dec = h * 14 + dec;
			break;
			case 'F':
			case 'f':
				dec = h * 15 + dec;
			break;	
		}
		if (cnt == 1)
		{
			ret = ret.concat(dec);
			dec = 0;
			cnt = 0;
		}
		else
			cnt++;
	}
	return ret;
}

function padLeft(str, len) {
    str = '' + str;
    if (str.length >= len) {
        return str;
    } else {
        return padLeft("0" + str, len);
    }
}

function decodeUplink(input) {
  var data = {};
  switch (input.fPort) {
    case 6:
		if (input.bytes[2] === 0x00)
		{
			data.Device = getDeviceName(input.bytes[1]);
			data.SWver =  input.bytes[3]/10;
			data.HWver =  input.bytes[4];
			data.Datecode = padLeft(input.bytes[5].toString(16), 2) + padLeft(input.bytes[6].toString(16), 2) + padLeft(input.bytes[7].toString(16), 2) + padLeft(input.bytes[8].toString(16), 2);
			
			return {
				data: data,
			};
		}
		if (input.bytes[2] === 0x80)
		{
			data.Device = getDeviceName(input.bytes[1]);
			data.SWver =  input.bytes[3]/10;
			data.HWver =  input.bytes[4];
			data.Datecode = padLeft(input.bytes[5].toString(16), 2) + padLeft(input.bytes[6].toString(16), 2) + padLeft(input.bytes[7].toString(16), 2) + padLeft(input.bytes[8].toString(16), 2);
			
			return {
				data: data,
			};
		}
		
	case 0x21:
		data.Cmd = getCmd(input.bytes[0]);
		if (input.bytes[0] === 0x08)
		{
			data.Status = input.bytes[1] ? 'Failure' : 'Success';
			data.DataIndex = input.bytes[2];
		}
		else if (input.bytes[0] === 0x33)
		{
			data.Status = input.bytes[1] ? 'Failure' : 'Success';
		}
		else if (input.bytes[0] === 0x4A)
		{
			data.ActualIRIndex = (input.bytes[1]<<8 | input.bytes[2]);
			data.DataIndexNum = input.bytes[3];
			data.DataIndex = input.bytes[4];
			data.DataLen = input.bytes[5];
			var str = '';
			for (var i = 0; i < input.bytes[5]; i++)
			{
				str = str + padLeft(input.bytes[6+i].toString(16).toUpperCase(), 2);
			}
			data.Data = str;
		}
		else if (input.bytes[0] === 0x0E)
		{
			data.Status = input.bytes[1] ? 'Failure' : 'Success';
		}

		break;

	default:
      return {
        errors: ['unknown FPort'],
      };
	  
    }

	 return {
		data: data,
	};
 }
  
function encodeDownlink(input) {
  var ret = [];

  if (input.data.Cmd === getCmd(0x07))
  {
	  var idxNum = input.data.DataIndexNum;
	  var idx = input.data.DataIndex;
	  var len = input.data.DataLen;
	  var hexStr = input.data.Data;
	  
	  var hex = [];
	  hex = StrToHex(hexStr, len * 2);
	  ret = ret.concat(0x07, idxNum, idx, len, hex);
  }
  else if (input.data.Cmd === getCmd(0x32))
  {
  	  var idx = input.data.ActualIRIndex;
	  ret = ret.concat(0x32, (idx >> 8), (idx & 0xFF));
  }  
  else if (input.data.Cmd === getCmd(0x49))
  {
  	  var idx = input.data.IRIndex;
  	  
	  ret = ret.concat(0x49, (idx >> 8), (idx & 0xFF));
  }
  else if (input.data.Cmd === getCmd(0x0D))
  {
  	  var magic = input.data.MagicNum;
	  ret = ret.concat(0x0D, (magic >> 24), ((magic >> 16) & 0xFF), ((magic >> 8) & 0xFF), (magic & 0xFF));
  } 
  return {
    fPort: 0x21,
    bytes: ret
  };
}  
  
function decodeDownlink(input) {
  var data = {};
  switch (input.fPort) {
    case 0x21:
		if (input.bytes[0] === 0x07)
		{
			data.Cmd = getCmd(input.bytes[0]);
			data.DataIndexNum = input.bytes[1];
			data.DataIndex = input.bytes[2];
			data.DataLen = input.bytes[3];
			
			var str = '';
			for (var i = 0; i < input.bytes[3]; i++)
			{
				str = str + padLeft(input.bytes[4+i].toString(16).toUpperCase(), 2);
			}
			data.Data = str;
		}
		else if (input.bytes[0] === 0x32)
		{
			data.Cmd = getCmd(input.bytes[0]);
			data.ActualIRIndex = (input.bytes[1]<<8 | input.bytes[2]);
		}
		else if (input.bytes[0] === 0x49)
		{
			data.Cmd = getCmd(input.bytes[0]);
			data.IRIndex = (input.bytes[1]<<8 | input.bytes[2]);
		}
		else if (input.bytes[0] === 0x0D)
		{
			data.Cmd = getCmd(input.bytes[0]);
			data.MagicNum = (input.bytes[1]<<24 | input.bytes[2]<<16 | input.bytes[3]<<8 | input.bytes[4]);
		}
		break;
		
    default:
      return {
        errors: ['invalid FPort'],
      };
  }
  
  return {
		data: data,
	};
}
