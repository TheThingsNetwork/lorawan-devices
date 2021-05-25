var sensor =
{
  "10": {
    "0x00 0xBA": [
      {
        "data_size": "1",
        "bit_start": "6",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "level",
        "group_name": "battery",
        "category_name": "",
        "round": "2",
        "coefficient": "0.01",
        "multiple": "0",
        "addition": "2.5"
      },
      {
        "data_size": "1",
        "bit_start": "7",
        "bit_end": "7",
        "type": "unsigned",
        "parameter_name": "eos_alert",
        "group_name": "battery",
        "category_name": "",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x01 0x04": [
      {
        "data_size": "2",
        "bit_start": "15",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "input1_frequency",
        "group_name": "",
        "category_name": "",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x02 0x02": [
      {
        "data_size": "2",
        "bit_start": "15",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "input2_voltage",
        "group_name": "",
        "category_name": "",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x03 0x02": [
      {
        "data_size": "2",
        "bit_start": "15",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "input3_voltage",
        "group_name": "",
        "category_name": "",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x04 0x02": [
      {
        "data_size": "2",
        "bit_start": "15",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "input4_voltage",
        "group_name": "",
        "category_name": "",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x05 0x04": [
      {
        "data_size": "2",
        "bit_start": "15",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "input5_frequency",
        "group_name": "",
        "category_name": "",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x06 0x04": [
      {
        "data_size": "2",
        "bit_start": "15",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "input6_frequency",
        "group_name": "",
        "category_name": "",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x09 0x65": [
      {
        "data_size": "2",
        "bit_start": "15",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "light_intensity",
        "group_name": "",
        "category_name": "",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x09 0x00": [
      {
        "data_size": "1",
        "bit_start": "7",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "light_detected",
        "group_name": "",
        "category_name": "",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x0A 0x71": [
      {
        "data_size": "6",
        "bit_start": "47",
        "bit_end": "32",
        "type": "signed",
        "parameter_name": "x",
        "group_name": "acceleration",
        "category_name": "",
        "round": "2",
        "coefficient": "0.01",
        "multiple": "0",
        "addition": ""
      },
      {
        "data_size": "6",
        "bit_start": "31",
        "bit_end": "16",
        "type": "signed",
        "parameter_name": "y",
        "group_name": "acceleration",
        "category_name": "",
        "round": "2",
        "coefficient": "0.01",
        "multiple": "0",
        "addition": ""
      },
      {
        "data_size": "6",
        "bit_start": "15",
        "bit_end": "0",
        "type": "signed",
        "parameter_name": "z",
        "group_name": "acceleration",
        "category_name": "",
        "round": "2",
        "coefficient": "0.01",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x0A 0x00": [
      {
        "data_size": "1",
        "bit_start": "7",
        "bit_end": "0",
        "type": "signed",
        "parameter_name": "orientation_alarm",
        "group_name": "",
        "category_name": "",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x0B 0x67": [
      {
        "data_size": "2",
        "bit_start": "15",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "ambient_temperature",
        "group_name": "",
        "category_name": "",
        "round": "1",
        "coefficient": "0.1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x0B 0x68": [
      {
        "data_size": "1",
        "bit_start": "7",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "relative_humidity",
        "group_name": "",
        "category_name": "",
        "round": "1",
        "coefficient": "0.5",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x0C 0x67": [
      {
        "data_size": "1",
        "bit_start": "7",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "mcu_temperature",
        "group_name": "",
        "category_name": "",
        "round": "1",
        "coefficient": "0.1",
        "multiple": "0",
        "addition": ""
      }
    ]
  },
  "100": {
    "0x10": [
      {
        "data_size": "2",
        "bit_start": "15",
        "bit_end": "15",
        "type": "unsigned",
        "parameter_name": "otaa",
        "group_name": "join_mode",
        "category_name": "loramac",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x11": [
      {
        "data_size": "2",
        "bit_start": "15",
        "bit_end": "12",
        "type": "unsigned",
        "parameter_name": "class",
        "group_name": "opts",
        "category_name": "loramac",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      },
      {
        "data_size": "2",
        "bit_start": "3",
        "bit_end": "3",
        "type": "unsigned",
        "parameter_name": "adr",
        "group_name": "opts",
        "category_name": "loramac",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      },
      {
        "data_size": "2",
        "bit_start": "2",
        "bit_end": "2",
        "type": "unsigned",
        "parameter_name": "duty_cycle",
        "group_name": "opts",
        "category_name": "loramac",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      },
      {
        "data_size": "2",
        "bit_start": "1",
        "bit_end": "1",
        "type": "unsigned",
        "parameter_name": "sync_word",
        "group_name": "opts",
        "category_name": "loramac",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      },
      {
        "data_size": "2",
        "bit_start": "0",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "confirm_mode",
        "group_name": "opts",
        "category_name": "loramac",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x12": [
      {
        "data_size": "2",
        "bit_start": "11",
        "bit_end": "8",
        "type": "unsigned",
        "parameter_name": "dr_number",
        "group_name": "dr_tx",
        "category_name": "loramac",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      },
      {
        "data_size": "2",
        "bit_start": "3",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "tx_power",
        "group_name": "dr_tx",
        "category_name": "loramac",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x13": [
      {
        "data_size": "5",
        "bit_start": "39",
        "bit_end": "8",
        "type": "unsigned",
        "parameter_name": "frequency",
        "group_name": "rx2",
        "category_name": "loramac",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      },
      {
        "data_size": "5",
        "bit_start": "7",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "dr_number",
        "group_name": "rx2",
        "category_name": "loramac",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x19": [
      {
        "data_size": "2",
        "bit_start": "15",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "net_id_msb",
        "group_name": "",
        "category_name": "loramac",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x1A": [
      {
        "data_size": "2",
        "bit_start": "15",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "net_id_lsb",
        "group_name": "",
        "category_name": "loramac",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x20": [
      {
        "data_size": "4",
        "bit_start": "31",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "core",
        "group_name": "",
        "category_name": "ticks",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x21": [
      {
        "data_size": "2",
        "bit_start": "15",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "per_battery",
        "group_name": "",
        "category_name": "ticks",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x22": [
      {
        "data_size": "2",
        "bit_start": "15",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "per_temperature",
        "group_name": "",
        "category_name": "ticks",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x23": [
      {
        "data_size": "2",
        "bit_start": "15",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "per_relative_humidity",
        "group_name": "",
        "category_name": "ticks",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x24": [
      {
        "data_size": "2",
        "bit_start": "15",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "per_light",
        "group_name": "",
        "category_name": "ticks",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x25": [
      {
        "data_size": "2",
        "bit_start": "15",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "per_input1",
        "group_name": "",
        "category_name": "ticks",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x26": [
      {
        "data_size": "2",
        "bit_start": "15",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "per_input2",
        "group_name": "",
        "category_name": "ticks",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x27": [
      {
        "data_size": "2",
        "bit_start": "15",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "per_input3",
        "group_name": "",
        "category_name": "ticks",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x28": [
      {
        "data_size": "2",
        "bit_start": "15",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "per_input4",
        "group_name": "",
        "category_name": "ticks",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x29": [
      {
        "data_size": "2",
        "bit_start": "15",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "per_input5",
        "group_name": "",
        "category_name": "ticks",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x2A": [
      {
        "data_size": "2",
        "bit_start": "15",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "per_input6",
        "group_name": "",
        "category_name": "ticks",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x2C": [
      {
        "data_size": "2",
        "bit_start": "15",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "per_accelerometer",
        "group_name": "",
        "category_name": "ticks",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x2D": [
      {
        "data_size": "2",
        "bit_start": "15",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "per_orientation_alarm",
        "group_name": "",
        "category_name": "ticks",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x2E": [
      {
        "data_size": "2",
        "bit_start": "15",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "per_mcu_temperature",
        "group_name": "",
        "category_name": "ticks",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x30": [
      {
        "data_size": "4",
        "bit_start": "31",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "temperature_humidity_sample_period_idle",
        "group_name": "",
        "category_name": "threshold",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x31": [
      {
        "data_size": "4",
        "bit_start": "31",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "temperature_humidity_sample_period_active",
        "group_name": "",
        "category_name": "threshold",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x32": [
      {
        "data_size": "2",
        "bit_start": "7",
        "bit_end": "0",
        "type": "signed",
        "parameter_name": "high",
        "group_name": "temperature",
        "category_name": "threshold",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      },
      {
        "data_size": "2",
        "bit_start": "15",
        "bit_end": "8",
        "type": "signed",
        "parameter_name": "low",
        "group_name": "temperature",
        "category_name": "threshold",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x33": [
      {
        "data_size": "1",
        "bit_start": "0",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "temperature_enable",
        "group_name": "",
        "category_name": "threshold",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x34": [
      {
        "data_size": "2",
        "bit_start": "7",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "high",
        "group_name": "humidity",
        "category_name": "threshold",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      },
      {
        "data_size": "2",
        "bit_start": "15",
        "bit_end": "8",
        "type": "unsigned",
        "parameter_name": "low",
        "group_name": "humidity",
        "category_name": "threshold",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x35": [
      {
        "data_size": "1",
        "bit_start": "0",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "humidity_enable",
        "group_name": "",
        "category_name": "threshold",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x36": [
      {
        "data_size": "4",
        "bit_start": "31",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "input_sample_period_idle",
        "group_name": "",
        "category_name": "threshold",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x37": [
      {
        "data_size": "4",
        "bit_start": "31",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "input_sample_period_active",
        "group_name": "",
        "category_name": "threshold",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x38": [
      {
        "data_size": "4",
        "bit_start": "15",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "high",
        "group_name": "input1",
        "category_name": "threshold",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      },
      {
        "data_size": "4",
        "bit_start": "31",
        "bit_end": "16",
        "type": "unsigned",
        "parameter_name": "low",
        "group_name": "input1",
        "category_name": "threshold",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x39": [
      {
        "data_size": "4",
        "bit_start": "15",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "high",
        "group_name": "input2",
        "category_name": "threshold",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      },
      {
        "data_size": "4",
        "bit_start": "31",
        "bit_end": "16",
        "type": "unsigned",
        "parameter_name": "low",
        "group_name": "input2",
        "category_name": "threshold",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x3A": [
      {
        "data_size": "1",
        "bit_start": "0",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "input2_enable",
        "group_name": "",
        "category_name": "threshold",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      },
      {
        "data_size": "4",
        "bit_start": "31",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "input5_sample_period_idle",
        "group_name": "",
        "category_name": "threshold",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x3B": [
      {
        "data_size": "4",
        "bit_start": "31",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "input5_sample_period_active",
        "group_name": "",
        "category_name": "threshold",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      },
      {
        "data_size": "4",
        "bit_start": "15",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "high",
        "group_name": "input5",
        "category_name": "threshold",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x3C": [
      {
        "data_size": "4",
        "bit_start": "31",
        "bit_end": "16",
        "type": "unsigned",
        "parameter_name": "low",
        "group_name": "input5",
        "category_name": "threshold",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      },
      {
        "data_size": "1",
        "bit_start": "0",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "input5_enable",
        "group_name": "",
        "category_name": "threshold",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x3D": [
      {
        "data_size": "1",
        "bit_start": "0",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "input5_enable",
        "group_name": "",
        "category_name": "threshold",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      },
      {
        "data_size": "1",
        "bit_start": "0",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "input5_enable",
        "group_name": "",
        "category_name": "threshold",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x3F": [
      {
        "data_size": "1",
        "bit_start": "0",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "input1",
        "group_name": "input_enable",
        "category_name": "threshold",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      },
      {
        "data_size": "1",
        "bit_start": "1",
        "bit_end": "1",
        "type": "unsigned",
        "parameter_name": "input2",
        "group_name": "input_enable",
        "category_name": "threshold",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      },
      {
        "data_size": "1",
        "bit_start": "2",
        "bit_end": "2",
        "type": "unsigned",
        "parameter_name": "input3",
        "group_name": "input_enable",
        "category_name": "threshold",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      },
      {
        "data_size": "1",
        "bit_start": "3",
        "bit_end": "3",
        "type": "unsigned",
        "parameter_name": "input4",
        "group_name": "input_enable",
        "category_name": "threshold",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      },
      {
        "data_size": "1",
        "bit_start": "4",
        "bit_end": "4",
        "type": "unsigned",
        "parameter_name": "input5",
        "group_name": "input_enable",
        "category_name": "threshold",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      },
      {
        "data_size": "1",
        "bit_start": "5",
        "bit_end": "5",
        "type": "unsigned",
        "parameter_name": "input6",
        "group_name": "input_enable",
        "category_name": "threshold",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x40": [
      {
        "data_size": "4",
        "bit_start": "31",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "mcu_temperature_sample_period_idle",
        "group_name": "",
        "category_name": "threshold",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x41": [
      {
        "data_size": "4",
        "bit_start": "31",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "mcu_temperature_sample_period_active",
        "group_name": "",
        "category_name": "threshold",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x42": [
      {
        "data_size": "2",
        "bit_start": "7",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "high",
        "group_name": "mcu_temperature",
        "category_name": "threshold",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      },
      {
        "data_size": "2",
        "bit_start": "15",
        "bit_end": "8",
        "type": "unsigned",
        "parameter_name": "low",
        "group_name": "mcu_temperature",
        "category_name": "threshold",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x43": [
      {
        "data_size": "1",
        "bit_start": "0",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "mcu_temperature_enable",
        "group_name": "",
        "category_name": "threshold",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x48": [
      {
        "data_size": "1",
        "bit_start": "0",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "interrupt_enabled",
        "group_name": "",
        "category_name": "light_sensor",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x49": [
      {
        "data_size": "4",
        "bit_start": "31",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "intencity_high_threshold",
        "group_name": "",
        "category_name": "light_sensor",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x4A": [
      {
        "data_size": "4",
        "bit_start": "31",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "intencity_low_threshold",
        "group_name": "",
        "category_name": "light_sensor",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x4B": [
      {
        "data_size": "4",
        "bit_start": "31",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "sample_period_idle",
        "group_name": "",
        "category_name": "light_sensor",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x4C": [
      {
        "data_size": "4",
        "bit_start": "31",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "sample_period_active",
        "group_name": "",
        "category_name": "light_sensor",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x4D": [
      {
        "data_size": "1",
        "bit_start": "0",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "alarm",
        "group_name": "values_to_report",
        "category_name": "light_sensor",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      },
      {
        "data_size": "1",
        "bit_start": "0",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "intensity",
        "group_name": "values_to_report",
        "category_name": "light_sensor",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x50": [
      {
        "data_size": "1",
        "bit_start": "0",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "impact_threshold_enable",
        "group_name": "mode",
        "category_name": "accelerometer",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      },
      {
        "data_size": "1",
        "bit_start": "7",
        "bit_end": "7",
        "type": "unsigned",
        "parameter_name": "sensor_enable",
        "group_name": "mode",
        "category_name": "accelerometer",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x51": [
      {
        "data_size": "1",
        "bit_start": "1",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "measurement_range",
        "group_name": "",
        "category_name": "accelerometer",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x52": [
      {
        "data_size": "1",
        "bit_start": "2",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "sample_rate",
        "group_name": "",
        "category_name": "accelerometer",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x53": [
      {
        "data_size": "2",
        "bit_start": "15",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "impact_threshold",
        "group_name": "",
        "category_name": "accelerometer",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x54": [
      {
        "data_size": "2",
        "bit_start": "15",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "impact_grace_period",
        "group_name": "",
        "category_name": "accelerometer",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x55": [
      {
        "data_size": "1",
        "bit_start": "0",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "alarm",
        "group_name": "values_to_transmit",
        "category_name": "accelerometer",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      },
      {
        "data_size": "1",
        "bit_start": "1",
        "bit_end": "1",
        "type": "unsigned",
        "parameter_name": "magnitude",
        "group_name": "values_to_transmit",
        "category_name": "accelerometer",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      },
      {
        "data_size": "1",
        "bit_start": "2",
        "bit_end": "2",
        "type": "unsigned",
        "parameter_name": "full_precision",
        "group_name": "values_to_transmit",
        "category_name": "accelerometer",
        "round": "",
        "coefficient": "1",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x70": [
      {
        "data_size": "2",
        "bit_start": "14",
        "bit_end": "14",
        "type": "unsigned",
        "parameter_name": "app_configuration",
        "group_name": "write_to_flash",
        "category_name": "command_control_register",
        "round": "1",
        "coefficient": "",
        "multiple": "0",
        "addition": ""
      },
      {
        "data_size": "2",
        "bit_start": "13",
        "bit_end": "13",
        "type": "unsigned",
        "parameter_name": "lora_configuration",
        "group_name": "write_to_flash",
        "category_name": "command_control_register",
        "round": "1",
        "coefficient": "",
        "multiple": "0",
        "addition": ""
      },
      {
        "data_size": "2",
        "bit_start": "0",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "restart_sensor",
        "group_name": "write_to_flash",
        "category_name": "command_control_register",
        "round": "1",
        "coefficient": "",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x71": [
      {
        "data_size": "7",
        "bit_start": "55",
        "bit_end": "48",
        "type": "unsigned",
        "parameter_name": "app_major_version",
        "group_name": "firmware_version",
        "category_name": "command_control_register",
        "round": "1",
        "coefficient": "",
        "multiple": "0",
        "addition": ""
      },
      {
        "data_size": "7",
        "bit_start": "47",
        "bit_end": "40",
        "type": "unsigned",
        "parameter_name": "app_minor_version",
        "group_name": "firmware_version",
        "category_name": "command_control_register",
        "round": "1",
        "coefficient": "",
        "multiple": "0",
        "addition": ""
      },
      {
        "data_size": "7",
        "bit_start": "39",
        "bit_end": "32",
        "type": "unsigned",
        "parameter_name": "app_revision",
        "group_name": "firmware_version",
        "category_name": "command_control_register",
        "round": "1",
        "coefficient": "",
        "multiple": "0",
        "addition": ""
      },
      {
        "data_size": "7",
        "bit_start": "31",
        "bit_end": "24",
        "type": "unsigned",
        "parameter_name": "loramac_major_version",
        "group_name": "firmware_version",
        "category_name": "command_control_register",
        "round": "1",
        "coefficient": "",
        "multiple": "0",
        "addition": ""
      },
      {
        "data_size": "7",
        "bit_start": "23",
        "bit_end": "16",
        "type": "unsigned",
        "parameter_name": "loramac_minor_version",
        "group_name": "firmware_version",
        "category_name": "command_control_register",
        "round": "1",
        "coefficient": "",
        "multiple": "0",
        "addition": ""
      },
      {
        "data_size": "7",
        "bit_start": "15",
        "bit_end": "8",
        "type": "unsigned",
        "parameter_name": "loramac_revision",
        "group_name": "firmware_version",
        "category_name": "command_control_register",
        "round": "1",
        "coefficient": "",
        "multiple": "0",
        "addition": ""
      },
      {
        "data_size": "7",
        "bit_start": "7",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "region",
        "group_name": "firmware_version",
        "category_name": "command_control_register",
        "round": "1",
        "coefficient": "",
        "multiple": "0",
        "addition": ""
      }
    ],
    "0x72": [
      {
        "data_size": "1",
        "bit_start": "7",
        "bit_end": "0",
        "type": "unsigned",
        "parameter_name": "configuration_factory_reset",
        "group_name": "",
        "category_name": "command_control_register",
        "round": "1",
        "coefficient": "",
        "multiple": "0",
        "addition": ""
      }
    ]
  }
};
// polyfill for backward compatibility with ES 5 and Nashorn
if (typeof Object.assign !== 'function') {
    // Must be writable: true, enumerable: false, configurable: true
    Object.defineProperty(Object, "assign", {
        value: function assign(target, varArgs) { // .length of function is 2
            'use strict';
            if (target === null || target === undefined) {
                throw new TypeError('Cannot convert undefined or null to object');
            }

            var to = Object.create(target);

            for (index = 1; index < arguments.length; index++) {
                nextSource = arguments[index];

                if (nextSource !== null && nextSource !== undefined) {
                    for (var nvxtKey in nextSource) {
                        // Avoid bugs when hasOwnProperty is shadowed
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        },
        writable: true,
        configurable: true
    });
}

function trunc(v){
    v = +v;
    if (!isFinite(v)) return v;
    return (v - v % 1)   ||   (v < 0 ? -0 : v === 0 ? v : 0);
}

function stringifyHex(header) {
    // expects Number, returns stringified hex number in format (FF -> 0xFF) || (A -> 0x0A)
    var ret = header.toString(16).toUpperCase();
    if (ret.length === 1) {
        return "0x0" + ret;
    }
    return "0x" + ret;
}

function toUint(x) {
    return x >>> 0;
}

function byteArrayToArray(byteArray) {
    var array = [];
    for (i = 0; i < byteArray.length; i++){
        array.push(byteArray[i] < 0 ? byteArray[i]+256 : byteArray[i]);
        // adding 256 turns this into an unsigned byte array, which is what we want.
    }
    return array;
}

function byteArrayToHexString(byteArray) {
    var arr = [];
    for (var i = 0; i < byteArray.length; ++i) {
        arr.push(('0' + (byteArray[i] & 0xFF).toString(16).toUpperCase()).slice(-2));
    }
    return arr.join('');
}

function extractBytes(chunk, startBit, endBit) {
    var totalBits = startBit - endBit + 1;
    var totalBytes = totalBits % 8 === 0 ? toUint(totalBits / 8) : toUint(totalBits / 8) + 1;
    var bitOffset = endBit % 8;
    var arr = new Array(totalBytes);

    for (var byte = totalBytes-1; byte >= 0; byte--) {
        var chunkIndex = byte + (chunk.length - 1 - trunc(startBit / 8));
        var lo = chunk[chunkIndex] >> bitOffset; // from the example: 0b11111000 >> 4 = 0b1111 (0b1000 was trunc'ed)
        var hi = 0;
        if (byte !== 0) {
            var hi_bitmask = (1 << bitOffset) - 1 ;// same as 2^bitOffset - 1
            var bits_to_take_from_hi = 8 - bitOffset ;// in the example above this var is 4, because we take 4 bits from hi
            hi = (chunk[chunkIndex - 1] & (hi_bitmask << bits_to_take_from_hi));
        } else {
            // Truncate last bits
            lo = lo & ((1 << (totalBits % 8 ? totalBits % 8 : 8)) - 1);
        }
        arr[byte] = hi | lo;
    }
    return arr;
}

function byteTo8Bits(byte){
    var bits = byte.toString(2).split('');
    for (var i = 0; i < bits.length; i++) {
        bits[i] = bits[i] === '1';
    }
    while (bits.length % 8 !== 0) { //turns 1111 into 00001111
        bits.unshift(false);
    }
    return bits;
}

function bytesToValue(bytes, dataType, coefficient, round, addition) {
    var output = 0;
    if (dataType === "unsigned") {
        for (var i = 0; i < bytes.length; ++i) {
            output = (toUint(output << 8)) | bytes[i];
        }
        return round ? Number( (output*coefficient + addition).toFixed(round) ) : Number(output*coefficient + addition);
    }

    if (dataType === "signed") {
        for(var byte in bytes){
        //for (var i = 0; i < bytes.length; ++i) {
            output = (output << 8) | byte;
        }
        // Convert to signed, based on value size
        if (output > Math.pow(2, 8*bytes.length-1)) {
            output -= Math.pow(2, 8*bytes.length);
        }

        return Number( (output*coefficient + addition).toFixed(round) );
    }

    if (dataType === "hexstring") {
        return byteArrayToHexString(bytes);
    }

    if (dataType === "double") {
        if (bytes.length !== 8)
            return 0;
        //as per IEEE 754 implementation
        var bit_arr = [];
        for (var i = 0; i < bytes.length; i++) {
            bit_arr = bit_arr.concat(byteTo8Bits(bytes[i]))
        }
        var sign = bit_arr[0] ? -1 : 1;
        var exp = 0;
        for (var i_here = 11; i_here >= 1; i_here--) {
            exp += Math.pow(2, 11-i_here) * (bit_arr[i_here] ? 1 : 0)
        }
        var fraction = 1;
        for (var i = 12; i < bit_arr.length; i++) {
            fraction += Math.pow(2, -(i-11)) * (bit_arr[i] ? 1 : 0)
        }
        return sign*fraction*Math.pow(2, exp-1023)
    }

    // Incorrect data type
    return null;
}

function decodeField(chunk, p) {
    //decodeField(valueArray, p["bit_start"], p["bit_end"], p["type"], p["coefficient"], p["round"], p["addition"])
    var startBit = p["bit_start"]
    var endBit = p["bit_end"]
    var dataType = p["type"]
    var addition = (typeof p["addition"] !== 'undefined') ?  Number(p["addition"]) : 0;
    var coefficient = (typeof p["coefficient"] !== 'undefined') ? Number(p["coefficient"]) : 1;
    var round = (typeof p["round"] !== 'undefined') ? Number(p["round"]) : 0;

    var bytes = extractBytes(chunk, startBit, endBit);
    return bytesToValue(bytes, dataType, coefficient, round, addition);
}

function flattenObject(ob) {
    var toReturn = {};

    for (var i in ob) {
        if (!ob.hasOwnProperty(i)) continue;

        if ((typeof ob[i]) == 'object') {
            var flatObject = flattenObject(ob[i]);
            for (var x in flatObject) {
                if (!flatObject.hasOwnProperty(x)) continue;

                toReturn[i + '.' + x] = flatObject[x];
            }
        } else {
            toReturn[i] = ob[i];
        }
    }
    return toReturn;
}

function decode(parameters, bytes, port, flat){
    if (typeof(port)==="number")
        port = port.toString();
    //below is performed in case the NS the decoder is used on supplies a byteArray that isn't an array
    bytes = byteArrayToArray(bytes)

    var decodedData = {};
    decodedData.raw = stringifyBytes(bytes);
    decodedData.port = port;

    if (!parameters.hasOwnProperty(port)) {
        decodedData.error = "Wrong port: " + port;
        return decodedData
    }

    while (bytes.length > 0) {
        var firstByte = stringifyHex(bytes[0])
        var headers = Object.keys(parameters[port])
        var headerLength = null
        for (var i = 0; i < headers.length; i++){
            if ( firstByte === (headers[i].split(' '))[0] ) {
                headerLength = (headers[i].split(' ')).length;
            }
        }

        var header
        if (parameters[port].hasOwnProperty("none")){
            header = "none"
        } else {
            header = bytes.slice(0, headerLength);
            bytes = bytes.slice(headerLength)
            if (headerLength === 1) {
                header = stringifyHex(header[0]);
            } else if (headerLength === 2) {
                header = stringifyHex(header[0]) + " " + stringifyHex(header[1])
            }
        }

        if (!parameters[port].hasOwnProperty(header)) {
            decodedData.error = "Couldn't find header " + header + " in decoder object." +
                " Are you decoding the correct sensor?";
            return decodedData;
        }

        var properties = parameters[port][header];

        if (properties.length === 0) {
            decodedData.error = "Something is wrong with the decoder object. Check " +
                "port "+ port + ", header " + header + ""
            return decodedData;
        }

        var i, j, p, bytesToConsume, valueArray
        // WARNING: arrays can only ever be in the end of the properties for a given port / header
        if (properties.length === 1) {
            p = properties[0];
            if (!decodedData.hasOwnProperty(p["category_name"]))
                decodedData[p["category_name"]] = {}

            if (p["multiple"] == 0) {

                // CASE 1:
                // value
                bytesToConsume = parseInt( p["data_size"] )
                valueArray = []
                for (i = 0; i < bytesToConsume; i++) {
                    valueArray.push(bytes[0])
                    bytes = bytes.slice(1)
                }

                decodedData[p["category_name"]][p["parameter_name"]] =
                    decodeField(valueArray, p)

            } else {
                // CASE 2:
                // array of values (without anything in front)
                decodedData[ p["category_name"] ][ p["parameter_name"] ] = []
                while (bytes.length > 0) {
                    bytesToConsume = parseInt(p["data_size"])
                    valueArray = []
                    for (i = 0; i < bytesToConsume; i++) {
                        valueArray.push(bytes[0])
                        bytes = bytes.slice(1)
                    }
                    decodedData[ p["category_name"] ][ p["parameter_name"] ].push(
                        decodeField(valueArray, p)
                    )
                }
            }
        } else {
            for (i = 0; i < properties.length && bytes.length > 0; i++) {
                p = properties[i];

                if (!decodedData.hasOwnProperty(p["category_name"]))
                    decodedData[p["category_name"]] = {}

                if (p["multiple"] == 0){
                    if (p["group_name"] == "") {
                        // CASE 3:
                        // a stand-alone value that comes right before a group, like in port 15 of Industrial Tracker
                        // and port 20 of Industrial Transceiver
                        bytesToConsume = parseInt(p["data_size"])
                        valueArray = []
                        for (j = 0; j < bytesToConsume; j++) {
                            if (parseInt(p["bit_start"]) < 0){
                                valueArray.push(bytes.pop())
                            } else {
                                valueArray.push(bytes[0])
                                bytes = bytes.slice(1)
                            }
                        }
                        decodedData[p["category_name"]][ p["parameter_name"] ] =
                            decodeField(valueArray, p)
                    } else {
                        // CASE 4:
                        // a group of values
                        if (!decodedData[p["category_name"]].hasOwnProperty(p["group_name"]))
                            decodedData[p["category_name"]][ p["group_name"] ] = {}
                        bytesToConsume = parseInt(p["data_size"])
                        valueArray = []
                        for (j = 0; j < bytesToConsume; j++) {
                            valueArray.push(bytes[0])
                            bytes = bytes.slice(1)
                        }
                        for (j = i; j < properties.length; j++) {
                            p = properties[j]
                            if (p["multiple"] == 0) // there could be an array following a group/value and we don't want to eat that up
                                decodedData[p["category_name"]][ p["group_name"] ][ p["parameter_name"] ] =
                                    decodeField(valueArray, p)
                        }
                    }
                }

                if (p["multiple"] == 0){
                    if (properties[i+1] && properties[i+1]["multiple"] == "1")
                        continue
                    else
                        break;
                }

                if (p["group_name"] === "") {
                    // CASE 5:
                    // array of values (after a group or a value)
                    // e.g. for Industrial Sensor serial port communication
                    decodedData[p["category_name"]][ p["parameter_name"] ] = []
                    while (bytes.length > 0) {
                        bytesToConsume = parseInt(p["data_size"])
                        valueArray = []

                        for (j = 0; j < bytesToConsume; j++) {
                            valueArray.push(bytes[0])
                            bytes = bytes.slice(1)
                        }
                        decodedData[p["category_name"]][ p["parameter_name"] ].push(
                            decodeField(valueArray, p)
                        )
                    }
                } else {
                    // CASE 6:
                    // array of groups (stand-alone OR after a value/group)
                    var isInsideGroup = false;
                    if (typeof decodedData[ p["category_name"] ][ p["group_name"] ] === "object") {
                        decodedData[ p["category_name"] ][ p["group_name"] ][ p["parameter_name"] ] = []
                        isInsideGroup = true;
                    }
                    else
                        decodedData[ p["category_name"] ][ p["group_name"] ] = []
                    // else throw new Error("Fail in CASE 6. If multiple == 1, the parameter must be a part of an existing group or a stand alone array of groups/values.")
                    while (bytes.length > 0) {
                        bytesToConsume = parseInt(p["data_size"])
                        valueArray = []
                        for (j = 0; j < bytesToConsume; j++) {
                            valueArray.push(bytes[0])
                            bytes = bytes.slice(1)
                        }
                        var obj = {}
                        for (j = i; j < properties.length; j++) {
                            p = properties[j]
                            obj[ p["parameter_name"] ] =
                                decodeField(valueArray, p)
                        }
                        if (isInsideGroup)
                            decodedData[ p["category_name"] ][ p["group_name"] ][ p["parameter_name"] ].push(obj)
                        else
                            decodedData[ p["category_name"] ][ p["group_name"] ].push(obj)
                    }
                }
            }
        }
    }
    if (decodedData.hasOwnProperty("")) {                     // Uplink-only fields have an empty string category,
        decodedData = Object.assign(decodedData, decodedData[""])  // this will take care of it
        delete decodedData[""]
    }

  if (decodedData["input3_voltage"] && decodedData["input5_frequency"]){
    var temperature = voltageToTemp(decodedData.input3_voltage)
    var watermark = freqToWatermark(decodedData.input5_frequency)
    decodedData["adj_watermark1"] = watermark*(1-0.019*(temperature-24))
    decodedData["temperature1"] = temperature;
  }
  if (decodedData["input4_voltage"] && decodedData["input6_frequency"]){
    var temperature = voltageToTemp(decodedData.input4_voltage)
    var watermark = freqToWatermark(decodedData.input6_frequency)
    decodedData["adj_watermark2"] = watermark*(1-0.019*(temperature-24))
    decodedData["temperature2"] = temperature;
  }

    return flat ? flattenObject(decodedData) : decodedData;
}

function freqToWatermark(value){
  if (value > 6430) {return 0;}
  else if (4330 <= value && value <= 6430) {return 9-(value-4330)*0.004286;}
  else if (2820 <= value && value <= 4330) {return 15-(value-2820)*0.003974;}
  else if (1110 <= value && value <= 2820) {return 35-(value-1110)*0.001170;}
  else if (770 <= value && value <= 1110) {return 55-(value-770)*0.05884;}
  else if (600 <= value && value <= 770) {return 75-(value-600)*0.1176;}
  else if (485 <= value && value <= 600) {return 100-(value-485)*0.2174;}
  else if (293 <= value && value <= 485) {return 200-(value-293)*0.5208;}
  else if (value < 293) {return 200;}
}

function voltageToTemp(value){
  return -31.96 * Math.log(value) + 213.25
}

function stringifyBytes(bytes){
    var stringBytes = "["
    for (var i = 0; i < bytes.length; i++){
        if (i !== 0)
            stringBytes+=", "
        var byte = bytes[i].toString(16).toUpperCase()
        if (byte.split("").length === 1)
            byte = "0" + byte
        stringBytes+= byte
    }
    stringBytes+="]"

    return stringBytes
}

function decodeUplink(input){
    return decode(sensor, input.bytes, input.fport, false);
}