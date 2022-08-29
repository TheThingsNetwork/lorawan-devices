var sensor = 
{
  "lorawan": {
    "device_eui": {
      "header": "0x00",
      "data_size": "8",
      "bit_start": "63",
      "bit_end": "0",
      "type": "hexstring",
      "round": "",
      "coefficient": "1",
      "access": "R",
      "multiple": "0",
      "port": "100",
      "or_80_to_write": "1"
    },
    "app_eui": {
      "header": "0x01",
      "data_size": "8",
      "bit_start": "63",
      "bit_end": "0",
      "type": "hexstring",
      "round": "",
      "coefficient": "1",
      "access": "R",
      "multiple": "0",
      "port": "100",
      "or_80_to_write": "1"
    },
    "app_key": {
      "header": "0x02",
      "data_size": "16",
      "bit_start": "127",
      "bit_end": "0",
      "type": "hexstring",
      "round": "",
      "coefficient": "1",
      "access": "R",
      "multiple": "0",
      "port": "100",
      "or_80_to_write": "1"
    },
    "device_address": {
      "header": "0x03",
      "data_size": "4",
      "bit_start": "31",
      "bit_end": "0",
      "type": "hexstring",
      "round": "",
      "coefficient": "1",
      "access": "R",
      "multiple": "0",
      "port": "100",
      "or_80_to_write": "1"
    },
    "network_session_key": {
      "header": "0x04",
      "data_size": "16",
      "bit_start": "127",
      "bit_end": "0",
      "type": "hexstring",
      "round": "",
      "coefficient": "1",
      "access": "R",
      "multiple": "0",
      "port": "100",
      "or_80_to_write": "1"
    },
    "app_session_key": {
      "header": "0x05",
      "data_size": "16",
      "bit_start": "127",
      "bit_end": "0",
      "type": "hexstring",
      "round": "",
      "coefficient": "1",
      "access": "R",
      "multiple": "0",
      "port": "100",
      "or_80_to_write": "1"
    }
  },
  "loramac": {
    "join_mode": {
      "header": "0x10",
      "data_size": "2",
      "bit_start": "15",
      "bit_end": "15",
      "type": "unsigned",
      "round": "",
      "coefficient": "1",
      "access": "RW",
      "multiple": "0",
      "port": "100",
      "or_80_to_write": "1"
    },
    "loramac_opts": {
      "header": "0x11",
      "or_80_to_write": "1",
      "port": "100",
      "adr": {
        "data_size": "2",
        "bit_start": "3",
        "bit_end": "3",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "duty_cycle": {
        "data_size": "2",
        "bit_start": "2",
        "bit_end": "2",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "sync_word": {
        "data_size": "2",
        "bit_start": "1",
        "bit_end": "1",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "confirm_mode": {
        "data_size": "2",
        "bit_start": "0",
        "bit_end": "0",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      }
    },
    "loramac_dr_tx": {
      "header": "0x12",
      "or_80_to_write": "1",
      "port": "100",
      "dr_number": {
        "data_size": "2",
        "bit_start": "11",
        "bit_end": "8",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "tx_power": {
        "data_size": "2",
        "bit_start": "3",
        "bit_end": "0",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      }
    },
    "loramac_rx2": {
      "header": "0x13",
      "or_80_to_write": "1",
      "port": "100",
      "frequency": {
        "data_size": "5",
        "bit_start": "39",
        "bit_end": "8",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "dr_number": {
        "data_size": "5",
        "bit_start": "7",
        "bit_end": "0",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      }
    }
  },
  "ticks": {
    "core": {
      "header": "0x20",
      "data_size": "4",
      "bit_start": "31",
      "bit_end": "0",
      "type": "unsigned",
      "round": "",
      "coefficient": "1",
      "access": "RW",
      "multiple": "0",
      "port": "100",
      "or_80_to_write": "1"
    },
    "per_battery": {
      "header": "0x21",
      "data_size": "2",
      "bit_start": "15",
      "bit_end": "0",
      "type": "unsigned",
      "round": "",
      "coefficient": "1",
      "access": "RW",
      "multiple": "0",
      "port": "100",
      "or_80_to_write": "1"
    },
    "per_temperature": {
      "header": "0x22",
      "data_size": "2",
      "bit_start": "15",
      "bit_end": "0",
      "type": "unsigned",
      "round": "",
      "coefficient": "1",
      "access": "RW",
      "multiple": "0",
      "port": "100",
      "or_80_to_write": "1"
    },
    "per_relative_humidity": {
      "header": "0x23",
      "data_size": "2",
      "bit_start": "15",
      "bit_end": "0",
      "type": "unsigned",
      "round": "",
      "coefficient": "1",
      "access": "RW",
      "multiple": "0",
      "port": "100",
      "or_80_to_write": "1"
    },
    "per_digital_input": {
      "header": "0x24",
      "data_size": "2",
      "bit_start": "15",
      "bit_end": "0",
      "type": "unsigned",
      "round": "",
      "coefficient": "1",
      "access": "RW",
      "multiple": "0",
      "port": "100",
      "or_80_to_write": "1"
    },
    "per_light": {
      "header": "0x25",
      "data_size": "2",
      "bit_start": "15",
      "bit_end": "0",
      "type": "unsigned",
      "round": "",
      "coefficient": "1",
      "access": "RW",
      "multiple": "0",
      "port": "100",
      "or_80_to_write": "1"
    },
    "per_acceleration": {
      "header": "0x26",
      "data_size": "2",
      "bit_start": "15",
      "bit_end": "0",
      "type": "unsigned",
      "round": "",
      "coefficient": "1",
      "access": "RW",
      "multiple": "0",
      "port": "100",
      "or_80_to_write": "1"
    },
    "per_mcu_temperature": {
      "header": "0x27",
      "data_size": "2",
      "bit_start": "15",
      "bit_end": "0",
      "type": "unsigned",
      "round": "",
      "coefficient": "1",
      "access": "RW",
      "multiple": "0",
      "port": "100",
      "or_80_to_write": "1"
    },
    "per_pir": {
      "header": "0x28",
      "data_size": "2",
      "bit_start": "15",
      "bit_end": "0",
      "type": "unsigned",
      "round": "",
      "coefficient": "1",
      "access": "RW",
      "multiple": "0",
      "port": "100",
      "or_80_to_write": "1"
    },
    "per_external_connector": {
      "header": "0x29",
      "data_size": "2",
      "bit_start": "15",
      "bit_end": "0",
      "type": "unsigned",
      "round": "",
      "coefficient": "1",
      "access": "RW",
      "multiple": "1",
      "port": "100",
      "or_80_to_write": "1"
    }
  },
  "reed_switch": {
    "mode": {
      "header": "0x2A",
      "or_80_to_write": "1",
      "port": "100",
      "rising_edge": {
        "data_size": "1",
        "bit_start": "0",
        "bit_end": "0",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "falling_edge": {
        "data_size": "1",
        "bit_start": "1",
        "bit_end": "1",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      }
    },
    "count_threshold": {
      "header": "0x2B",
      "data_size": "2",
      "bit_start": "15",
      "bit_end": "0",
      "type": "unsigned",
      "round": "",
      "coefficient": "1",
      "access": "RW",
      "multiple": "0",
      "port": "100",
      "or_80_to_write": "1"
    },
    "values_to_transmit": {
      "header": "0x2C",
      "or_80_to_write": "1",
      "port": "100",
      "report_state": {
        "data_size": "1",
        "bit_start": "0",
        "bit_end": "0",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "report_count": {
        "data_size": "1",
        "bit_start": "1",
        "bit_end": "1",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      }
    }
  },
  "external_connector": {
    "mode": {
      "header": "0x2D",
      "or_80_to_write": "1",
      "port": "100",
      "rising_edge": {
        "data_size": "1",
        "bit_start": "0",
        "bit_end": "0",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "falling_edge": {
        "data_size": "1",
        "bit_start": "1",
        "bit_end": "1",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "analog": {
        "data_size": "1",
        "bit_start": "7",
        "bit_end": "7",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      }
    },
    "count_threshold": {
      "header": "0x2E",
      "data_size": "2",
      "bit_start": "15",
      "bit_end": "0",
      "type": "unsigned",
      "round": "",
      "coefficient": "1",
      "access": "RW",
      "multiple": "0",
      "port": "100",
      "or_80_to_write": "1"
    },
    "values_to_transmit": {
      "header": "0x2F",
      "or_80_to_write": "1",
      "port": "100",
      "state": {
        "data_size": "1",
        "bit_start": "0",
        "bit_end": "0",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "count": {
        "data_size": "1",
        "bit_start": "1",
        "bit_end": "1",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      }
    }
  },
  "accelerometer": {
    "impact_alarm_threshold": {
      "header": "0x30",
      "data_size": "2",
      "bit_start": "15",
      "bit_end": "0",
      "type": "unsigned",
      "round": "3",
      "coefficient": "1",
      "access": "RW",
      "multiple": "0",
      "port": "100",
      "or_80_to_write": "1"
    },
    "acceleration_event_threshold": {
      "header": "0x31",
      "data_size": "2",
      "bit_start": "15",
      "bit_end": "0",
      "type": "unsigned",
      "round": "3",
      "coefficient": "1",
      "access": "RW",
      "multiple": "0",
      "port": "100",
      "or_80_to_write": "1"
    },
    "values_to_transmit": {
      "header": "0x32",
      "or_80_to_write": "1",
      "port": "100",
      "impact_alarm": {
        "data_size": "1",
        "bit_start": "0",
        "bit_end": "0",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "magnitude": {
        "data_size": "1",
        "bit_start": "4",
        "bit_end": "4",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "vector": {
        "data_size": "1",
        "bit_start": "5",
        "bit_end": "5",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      }
    },
    "debounce_time": {
      "header": "0x33",
      "or_80_to_write": "1",
      "port": "100",
      "impact_grace_period": {
        "data_size": "2",
        "bit_start": "15",
        "bit_end": "0",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      }
    },
    "mode": {
      "header": "0x34",
      "or_80_to_write": "1",
      "port": "100",
      "impact_alarm_threshold_enable": {
        "data_size": "1",
        "bit_start": "0",
        "bit_end": "0",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "event_threshold_enable": {
        "data_size": "1",
        "bit_start": "1",
        "bit_end": "1",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "x_axis": {
        "data_size": "1",
        "bit_start": "4",
        "bit_end": "4",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "y_axis": {
        "data_size": "1",
        "bit_start": "5",
        "bit_end": "5",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "z_axis": {
        "data_size": "1",
        "bit_start": "6",
        "bit_end": "6",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "power": {
        "data_size": "1",
        "bit_start": "7",
        "bit_end": "7",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      }
    },
    "sensitivity": {
      "header": "0x35",
      "or_80_to_write": "1",
      "port": "100",
      "sample_rate": {
        "data_size": "1",
        "bit_start": "2",
        "bit_end": "1",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "measurement_range": {
        "data_size": "1",
        "bit_start": "5",
        "bit_end": "4",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      }
    },
    "alarm_grace_period": {
      "header": "0x36",
      "data_size": "2",
      "bit_start": "15",
      "bit_end": "0",
      "type": "unsigned",
      "round": "",
      "coefficient": "1",
      "access": "RW",
      "multiple": "0",
      "port": "100",
      "or_80_to_write": "1"
    },
    "alarm_event_count": {
      "header": "0x37",
      "data_size": "2",
      "bit_start": "15",
      "bit_end": "0",
      "type": "unsigned",
      "round": "",
      "coefficient": "1",
      "access": "RW",
      "multiple": "0",
      "port": "100",
      "or_80_to_write": "1"
    },
    "alarm_threshold_period": {
      "header": "0x38",
      "data_size": "2",
      "bit_start": "15",
      "bit_end": "0",
      "type": "unsigned",
      "round": "",
      "coefficient": "1",
      "access": "RW",
      "multiple": "0",
      "port": "100",
      "or_80_to_write": "1"
    }
  },
  "temperature_humidity_analogIn": {
    "ambient_temp_rh_sample": {
      "header": "0x39",
      "or_80_to_write": "1",
      "port": "100",
      "temp/rh_sample_period_idle": {
        "data_size": "4",
        "bit_start": "31",
        "bit_end": "0",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "temp/rh_sample_period_active": {
        "data_size": "4",
        "bit_start": "31",
        "bit_end": "0",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      }
    },
    "temperature_threshold": {
      "header": "0x3B",
      "or_80_to_write": "1",
      "port": "100",
      "temp_high_threshold": {
        "data_size": "2",
        "bit_start": "15",
        "bit_end": "8",
        "type": "signed",
        "round": "1",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "temp_low_threshold": {
        "data_size": "2",
        "bit_start": "7",
        "bit_end": "0",
        "type": "signed",
        "round": "1",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "temp_threshold_enable": {
        "data_size": "1",
        "bit_start": "0",
        "bit_end": "0",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      }
    },
    "rh_threshold": {
      "header": "0x3D",
      "or_80_to_write": "1",
      "port": "100",
      "rh_high": {
        "data_size": "2",
        "bit_start": "15",
        "bit_end": "8",
        "type": "unsigned",
        "round": "1",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "rh_low": {
        "data_size": "2",
        "bit_start": "7",
        "bit_end": "0",
        "type": "unsigned",
        "round": "1",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "rh_threshold_enable": {
        "data_size": "1",
        "bit_start": "0",
        "bit_end": "0",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      }
    },
    "mcu_temp_sample": {
      "header": "0x40",
      "or_80_to_write": "1",
      "port": "100",
      "mcu_temp_sample_period_idle": {
        "data_size": "4",
        "bit_start": "31",
        "bit_end": "0",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "mcu_temp_sample_period_active": {
        "data_size": "4",
        "bit_start": "31",
        "bit_end": "0",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      }
    },
    "mcu_temp_threshold": {
      "header": "0x42",
      "or_80_to_write": "1",
      "port": "100",
      "mcu_temp_high": {
        "data_size": "2",
        "bit_start": "15",
        "bit_end": "8",
        "type": "signed",
        "round": "1",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "mcu_temp_low": {
        "data_size": "2",
        "bit_start": "7",
        "bit_end": "0",
        "type": "signed",
        "round": "1",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "mcu_temp_threshold_enable": {
        "data_size": "1",
        "bit_start": "0",
        "bit_end": "0",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      }
    },
    "analog_in_sample_period": {
      "header": "0x44",
      "or_80_to_write": "1",
      "port": "100",
      "analog_sample_period_idle": {
        "data_size": "4",
        "bit_start": "31",
        "bit_end": "0",
        "type": "unsigned",
        "round": "",
        "coefficient": "",
        "access": "RW",
        "multiple": "0"
      },
      "analog_sample_period_active": {
        "data_size": "4",
        "bit_start": "31",
        "bit_end": "0",
        "type": "unsigned",
        "round": "",
        "coefficient": "",
        "access": "RW",
        "multiple": "0"
      }
    },
    "analog_threshold": {
      "header": "0x46",
      "or_80_to_write": "1",
      "port": "100",
      "analog_high": {
        "data_size": "4",
        "bit_start": "31",
        "bit_end": "16",
        "type": "unsigned",
        "round": "",
        "coefficient": "",
        "access": "RW",
        "multiple": "0"
      },
      "analog_low": {
        "data_size": "4",
        "bit_start": "15",
        "bit_end": "0",
        "type": "unsigned",
        "round": "",
        "coefficient": "",
        "access": "RW",
        "multiple": "0"
      },
      "analog_threshold_enable": {
        "data_size": "1",
        "bit_start": "0",
        "bit_end": "0",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      }
    }
  },
  "light": {
    "light_sample_period": {
      "header": "0x47",
      "data_size": "4",
      "bit_start": "31",
      "bit_end": "0",
      "type": "unsigned",
      "round": "",
      "coefficient": "1",
      "access": "RW",
      "multiple": "0",
      "port": "100",
      "or_80_to_write": "1"
    },
    "light_thresholds": {
      "header": "0x48",
      "or_80_to_write": "1",
      "port": "100",
      "light_threshold_enable": {
        "data_size": "1",
        "bit_start": "7",
        "bit_end": "7",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "light_threshold_control": {
        "data_size": "1",
        "bit_start": "5",
        "bit_end": "0",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      }
    },
    "values_to_transmit": {
      "header": "0x49",
      "or_80_to_write": "1",
      "port": "100",
      "light_intensity": {
        "data_size": "1",
        "bit_start": "1",
        "bit_end": "1",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "light_state": {
        "data_size": "1",
        "bit_start": "0",
        "bit_end": "0",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      }
    }
  },
  "pir": {
    "grace_period": {
      "header": "0x50",
      "data_size": "2",
      "bit_start": "15",
      "bit_end": "0",
      "type": "unsigned",
      "round": "",
      "coefficient": "1",
      "access": "RW",
      "multiple": "0",
      "port": "100",
      "or_80_to_write": "1"
    },
    "count_threshold": {
      "header": "0x51",
      "data_size": "2",
      "bit_start": "15",
      "bit_end": "0",
      "type": "unsigned",
      "round": "",
      "coefficient": "1",
      "access": "RW",
      "multiple": "0",
      "port": "100",
      "or_80_to_write": "1"
    },
    "period_threshold": {
      "header": "0x52",
      "data_size": "2",
      "bit_start": "15",
      "bit_end": "0",
      "type": "unsigned",
      "round": "",
      "coefficient": "1",
      "access": "RW",
      "multiple": "0",
      "port": "100",
      "or_80_to_write": "1"
    },
    "mode": {
      "header": "0x53",
      "or_80_to_write": "1",
      "port": "100",
      "pir_enable": {
        "data_size": "1",
        "bit_start": "7",
        "bit_end": "7",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "pir_event_tx": {
        "data_size": "1",
        "bit_start": "6",
        "bit_end": "6",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "pir_motion_state": {
        "data_size": "1",
        "bit_start": "1",
        "bit_end": "1",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "pir_motion_count": {
        "data_size": "1",
        "bit_start": "0",
        "bit_end": "0",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      }
    },
    "hold_off_int": {
      "header": "0x54",
      "or_80_to_write": "1",
      "port": "100",
      "post_turnon_hold_off": {
        "data_size": "2",
        "bit_start": "15",
        "bit_end": "8",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "post_disturbance_hold_off": {
        "data_size": "2",
        "bit_start": "7",
        "bit_end": "0",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      }
    }
  },
  "moisture": {
    "moisture_configure": {
      "header": "0x5A",
      "or_80_to_write": "1",
      "port": "100",
      "sample_period": {
        "data_size": "1",
        "bit_start": "2",
        "bit_end": "0",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "threshold": {
        "data_size": "1",
        "bit_start": "7",
        "bit_end": "0",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "sensor_enable": {
        "data_size": "1",
        "bit_start": "0",
        "bit_end": "0",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "dry_calibration": {
        "data_size": "1",
        "bit_start": "7",
        "bit_end": "0",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      }
    }
  },
  "enhanced_accelerometer": {
    "sample_analysis_mode": {
      "header": "0x60",
      "or_80_to_write": "1",
      "port": "100",
      "sample_analysis_enabled": {
        "data_size": "1",
        "bit_start": "1",
        "bit_end": "1",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "R",
        "multiple": "0"
      },
      "iir_filter_recall_factor": {
        "data_size": "1",
        "bit_start": "0",
        "bit_end": "0",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "R",
        "multiple": "0"
      }
    },
    "hpf_config": {
      "header": "0x61",
      "or_80_to_write": "1",
      "port": "100",
      "cutoff_freq": {
        "data_size": "1",
        "bit_start": "5",
        "bit_end": "4",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "hpf_on_sample": {
        "data_size": "1",
        "bit_start": "2",
        "bit_end": "2",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "hpf_on_accel_interrupts": {
        "data_size": "1",
        "bit_start": "1",
        "bit_end": "1",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "hpf_on_accel_output": {
        "data_size": "1",
        "bit_start": "0",
        "bit_end": "0",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      }
    },
    "cic_filter_config": {
      "header": "0x62",
      "or_80_to_write": "1",
      "port": "100",
      "paramter_d": {
        "data_size": "3",
        "bit_start": "23",
        "bit_end": "16",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "paramter_r": {
        "data_size": "3",
        "bit_start": "15",
        "bit_end": "8",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "paramter_m": {
        "data_size": "3",
        "bit_start": "7",
        "bit_end": "0",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      }
    },
    "ml_config": {
      "header": "0x63",
      "or_80_to_write": "1",
      "port": "100",
      "nonzero_MLs": {
        "data_size": "7",
        "bit_start": "55",
        "bit_end": "48",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "ml_upper_limit": {
        "data_size": "7",
        "bit_start": "47",
        "bit_end": "32",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "ml_lower_limit": {
        "data_size": "7",
        "bit_start": "31",
        "bit_end": "16",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "ml_step": {
        "data_size": "7",
        "bit_start": "15",
        "bit_end": "0",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      }
    },
    "ml1_dlim_config": {
      "header": "0x64",
      "or_80_to_write": "1",
      "port": "100",
      "num_of_dlims": {
        "data_size": "14",
        "bit_start": "111",
        "bit_end": "104",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "dlim0_0": {
        "data_size": "14",
        "bit_start": "103",
        "bit_end": "88",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "dlim_step_0": {
        "data_size": "14",
        "bit_start": "87",
        "bit_end": "72",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "threshold_enable_0": {
        "data_size": "14",
        "bit_start": "71",
        "bit_end": "64",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "AE10_threshold": {
        "data_size": "14",
        "bit_start": "63",
        "bit_end": "48",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "AE11_threshold": {
        "data_size": "14",
        "bit_start": "47",
        "bit_end": "32",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "AE12_threshold": {
        "data_size": "14",
        "bit_start": "31",
        "bit_end": "16",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "AE13_threshold": {
        "data_size": "14",
        "bit_start": "15",
        "bit_end": "0",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      }
    },
    "ml2_dlim_config": {
      "header": "0x65",
      "or_80_to_write": "1",
      "port": "100",
      "num_of_dlims": {
        "data_size": "14",
        "bit_start": "111",
        "bit_end": "104",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "dlim0_1": {
        "data_size": "14",
        "bit_start": "103",
        "bit_end": "88",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "dlim_step_1": {
        "data_size": "14",
        "bit_start": "87",
        "bit_end": "72",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "threshold_enabled_1": {
        "data_size": "14",
        "bit_start": "71",
        "bit_end": "64",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "AE20_threshold": {
        "data_size": "14",
        "bit_start": "63",
        "bit_end": "48",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "AE21_threshold": {
        "data_size": "14",
        "bit_start": "47",
        "bit_end": "32",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "AE22_threshold": {
        "data_size": "14",
        "bit_start": "31",
        "bit_end": "16",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "AE23_threshold": {
        "data_size": "14",
        "bit_start": "15",
        "bit_end": "0",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      }
    },
    "sample_analysis": {
      "header": "0x68",
      "or_80_to_write": "1",
      "port": "100",
      "AE_count_enabled": {
        "data_size": "1",
        "bit_start": "7",
        "bit_end": "7",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "AE_duration_SD_Enabled": {
        "data_size": "1",
        "bit_start": "6",
        "bit_end": "6",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "AE_duration_median_enabled": {
        "data_size": "1",
        "bit_start": "5",
        "bit_end": "5",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "AE_duration_mean_enabled": {
        "data_size": "1",
        "bit_start": "4",
        "bit_end": "4",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "AE_duration_range_Enabled": {
        "data_size": "1",
        "bit_start": "3",
        "bit_end": "3",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "AE_duration_max_enabled": {
        "data_size": "1",
        "bit_start": "2",
        "bit_end": "2",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "AE_duration_min_enabled": {
        "data_size": "1",
        "bit_start": "1",
        "bit_end": "1",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      },
      "AE_duration_total_enabled": {
        "data_size": "1",
        "bit_start": "0",
        "bit_end": "0",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "RW",
        "multiple": "0"
      }
    }
  },
  "command_control_register": {
    "write_to_flash": {
      "header": "0x70",
      "or_80_to_write": "1",
      "port": "100",
      "lora_configuration": {
        "data_size": "2",
        "bit_start": "14",
        "bit_end": "14",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "W",
        "multiple": "0"
      },
      "app_configuration": {
        "data_size": "2",
        "bit_start": "13",
        "bit_end": "13",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "W",
        "multiple": "0"
      },
      "restart_sensor": {
        "data_size": "2",
        "bit_start": "0",
        "bit_end": "0",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "W",
        "multiple": "0"
      }
    },
    "firmware_version": {
      "header": "0x71",
      "or_80_to_write": "1",
      "port": "100",
      "app_major_version": {
        "data_size": "7",
        "bit_start": "55",
        "bit_end": "48",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "R",
        "multiple": "0"
      },
      "app_minor_version": {
        "data_size": "7",
        "bit_start": "47",
        "bit_end": "40",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "R",
        "multiple": "0"
      },
      "app_revision": {
        "data_size": "7",
        "bit_start": "39",
        "bit_end": "32",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "R",
        "multiple": "0"
      },
      "loramac_major_version": {
        "data_size": "7",
        "bit_start": "31",
        "bit_end": "24",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "R",
        "multiple": "0"
      },
      "loramac_minor_version": {
        "data_size": "7",
        "bit_start": "23",
        "bit_end": "16",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "R",
        "multiple": "0"
      },
      "loramac_revision": {
        "data_size": "7",
        "bit_start": "15",
        "bit_end": "8",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "R",
        "multiple": "0"
      },
      "region": {
        "data_size": "7",
        "bit_start": "7",
        "bit_end": "0",
        "type": "unsigned",
        "round": "",
        "coefficient": "1",
        "access": "R",
        "multiple": "0"
      }
    },
    "configuration_factory_reset": {
      "header": "0x72",
      "data_size": "1",
      "bit_start": "7",
      "bit_end": "0",
      "type": "unsigned",
      "round": "",
      "coefficient": "1",
      "access": "W",
      "multiple": "0",
      "port": "100",
      "or_80_to_write": "1"
    }
  }
}
var BitManipulation = {
    // a "class" that can perform bitwise operations on an unlimited amount of bits
    // a replacement for "BigInt" since "BigInt" is not backwards compatible

    // represents bits as an array of booleans

    // you have to make sure everything is always a multiple of 8 otherwise ascii
    // encoding is screwed up :(

    __make_multiple_of_8: function (bits) {
        // appends 0s to the bits until it's a multiple of 8
        while (bits.length % 8 != 0) {
            bits.unshift(false);
        }
    },

    __make_equal_number_of_bits: function (bits1, bits2) {
        if (bits1.length == bits2.length) {
            return
        }
        while (bits1.length > bits2.length) {
            bits2.unshift(false);
        }
        while (bits2.length > bits1.length) {
            bits1.unshift(false);
        }
    },

    __remove_leading_zeros: function (bits) {
        while ((bits[0] != true) && (bits.length > 1)) {
            bits.shift()
        }
    },

    __make_copy: function (bits) {
        // this function is needed since assignment in js doesn't actually make copies,
        // and I don't want any of the below functions to change the value of their arguments
        var new_bits = new Array(bits.length);
        for (var i = 0; i < bits.length; i++) {
            new_bits[i] = Boolean(bits[i]);
        }
        return new_bits;
    },

    get_bits: function (literal, type) {
        // literal is any datatype that is currently supported by this function:
        // SUPPORTS: unsigned, signed, string, hexstring, double
        var bit_arr = [];
        if (typeof (literal) == "number" && type === "unsigned") {
            if (literal == 0) {
                return [0];
            }
            while (literal > 0) {
                bit_arr.unshift(Boolean(literal % 2));
                literal = Math.floor(literal / 2);
            }

        } else if (typeof (literal) == "number" && type === "signed") {
            if (literal === 0) {
                return [0];
            }
            var negative = false;
            if (literal < 0) {
                literal = -literal
                negative = true;
            }

            while (literal > 0) {
                bit_arr.unshift(Boolean(literal % 2));
                literal = Math.floor(literal / 2);
            }

            this.__make_multiple_of_8(bit_arr)

            if (negative) {
                // turning into two's complement
                bit_arr = this.NOT(bit_arr) // bitwise not all bits
                // adding one to the negated array
                var carry = 1;
                var index = bit_arr.length - 1 // we'll be iterating backwards until index = 0 or carry = 0
                while (carry) {
                    if (bit_arr[index]) {
                        bit_arr[index] = false
                    } else {
                        bit_arr[index] = true
                        carry = 0
                    }
                    if (!index)
                        break;
                    index--
                }
            }
        } else if (typeof (literal) == "number" && type === "double") {
            var i, result = "";
            var dv = new DataView(new ArrayBuffer(8));

            dv.setFloat64(0, literal, false);

            for (i = 0; i < 8; i++) {
                var bits = dv.getUint8(i).toString(2);
                while (bits.length !== 8) {
                    bits = "0"+bits
                }
                result += bits;
            }
            bit_arr = result.split("").map(function (val){
                return val == '1';
            });
        } else if (typeof (literal) == "string" && type === "string") {
            for (var i = 0; i < literal.length; i++) {
                var char_val = literal[i].charCodeAt(0);
                var char_bits = this.get_bits(char_val, "unsigned")
                this.__make_multiple_of_8(char_bits)
                bit_arr = bit_arr.concat(char_bits);
            }
        } else if (typeof (literal) == "string" && type === "hexstring") {
            var string;
            if (literal.length % 2 === 0) {
                string = literal.split("")
            } else {
                string = ("0"+literal).split("")
            }
            var byte_array = []
            while (string.length > 0) {
                byte_array = byte_array.concat( parseInt("0x"+(string.splice(0, 2)).join("")) )
            }

            for (var i = 0; i < byte_array.length; i++){
                var byte = byte_array[i];
                var byte_bits = byte.toString(2)
                    .split("")
                    .map(function(el) { return el !== "0"; })
                this.__make_multiple_of_8(byte_bits)
                bit_arr = bit_arr.concat(byte_bits);
            }

        }

        this.__remove_leading_zeros(bit_arr);
        this.__make_multiple_of_8(bit_arr);
        return bit_arr;
    },

    init_mask: function (length, val) {
        // returns a mask of 1s or 0s, as given by the "val" argument
        if (val === undefined) {
            val = true;
        }

        var mask = new Array(length);
        for (var i = 0; i < length; i++) {
            mask[i] = val;
        }
        return mask;
    },

    to_byte_arr: function (bits, size) {
        this.__remove_leading_zeros(bits);
        this.__make_multiple_of_8(bits);

        var bytes_arr = new Array(bits.length / 8);
        for (var i = 0; i < bits.length; i += 8) {
            var byte_val = 0;

            var k = 0
            for (var j = 7; j >= 0; j--) {
                byte_val += (bits[i + j] << k);
                k += 1
            }
            bytes_arr[i / 8] = byte_val;
        }

        if (size === undefined) {
            return bytes_arr;
        }

        while (bytes_arr.length < Number(size)) {
            bytes_arr.unshift(0);
        }
        return bytes_arr;
    },

    shift_left: function (bits, shift_val) {
        var new_bits = new Array(bits.length + shift_val);
        for (var i = 0; i < bits.length; i++) {
            new_bits[i] = Boolean(bits[i]);
        }
        for (var i = bits.length; i < new_bits.length; i++) {
            new_bits[i] = false;
        }

        this.__remove_leading_zeros(new_bits);
        this.__make_multiple_of_8(new_bits);
        return new_bits;
    },

    shift_right: function (bits, shift_val) {
        var new_bits = new Array(bits.length);

        for (var j = 0; j < shift_val; j++) {
            new_bits[j] = false;
        }
        for (var i = 0; i < bits.length - shift_val; i++) {
            new_bits[i + shift_val] = Boolean(bits[i]);
        }

        this.__remove_leading_zeros(new_bits);
        this.__make_multiple_of_8(new_bits);
        return new_bits;
    },

    AND: function (bits1, bits2) {
        // returns bits1 & bits2
        var bits1_copy = this.__make_copy(bits1);
        var bits2_copy = this.__make_copy(bits2);

        this.__make_equal_number_of_bits(bits1_copy, bits2_copy);
        var new_bits = new Array(bits1_copy.length);
        for (var i = 0; i < bits1_copy.length; i++) {
            new_bits[i] = Boolean(bits1_copy[i] & bits2_copy[i]);
        }

        this.__remove_leading_zeros(new_bits);
        this.__make_multiple_of_8(new_bits);
        return new_bits;
    },

    OR: function (bits1, bits2) {
        // returns bits1 | bits2
        var bits1_copy = this.__make_copy(bits1);
        var bits2_copy = this.__make_copy(bits2);
        this.__make_equal_number_of_bits(bits1_copy, bits2_copy);
        var new_bits = new Array(bits1_copy.length);

        for (var i = 0; i < bits1_copy.length; i++) {
            new_bits[i] = Boolean(bits1_copy[i] | bits2_copy[i]);
        }

        this.__remove_leading_zeros(new_bits);
        this.__make_multiple_of_8(new_bits);

        return new_bits;
    },

    XOR: function (bits1, bits2) {
        // returns bits1 ^ bits2
        var bits1_copy = this.__make_copy(bits1);
        var bits2_copy = this.__make_copy(bits2);
        this.__make_equal_number_of_bits(bits1_copy, bits2_copy);
        var new_bits = new Array(bits1.length);

        for (var i = 0; i < bits1_copy.length; i++) {
            new_bits[i] = Boolean(bits1_copy[i] ^ bits2_copy[i]);
        }

        this.__remove_leading_zeros(new_bits);
        this.__make_multiple_of_8(new_bits);

        return new_bits;
    },

    NOT: function (bits) {
        // return !bits
        var bits_copy = this.__make_copy(bits);
        var new_bits = new Array(bits.length);
        for (var i = 0; i < bits_copy.length; i++) {
            new_bits[i] = !bits_copy[i];
        }
        return new_bits
    },
}

// polyfill for backward compatibility with ES 5 and Nashorn
if (!Object.values) {
    Object.values = function (obj) {
        return Object.keys(obj).map(function(e) {
            return obj[e]
        })
    };
}

function check_command(group_or_field, lookup) {
    // returns true if an individual command is valid, and false otherwise

    // There are 2 things we need to check:
    //    1. Access - read-only? write-only?
    //    2. Number of fields

    if (group_or_field.hasOwnProperty("read")) {
        if (lookup["access"] == "W") {
            return {status: false, error_code: 'Tried reading from write-only field'};
        }
        else if ( typeof(group_or_field["read"]) == "object" ) {
            return {status: false, error_code: 'Syntax error, read commands cannot be of type "object"'};
        }
    }
    else if (group_or_field.hasOwnProperty("write")) {
        if (lookup["access"] == "R") {
            return {status: false, error_code: 'Tried writing to read-only field'};
        }
        if (typeof(group_or_field["write"]) === "object") {
            var fields = Object.keys(group_or_field["write"]);
            if (fields.length != Object.keys(lookup).length - 3) {
                return {status: false, error_code: 'Invalid number of fields in group'};
            }
            for (var i = 0; i < fields.length; i++) {
                if (lookup[fields[i]] === undefined) {
                    return {status: false, error_code: 'Field "' + fields[i] + '" does not exist'}
                }
            }
        }

    }
    return {status: true, error_code: "No error"};
}

function is_valid(commands, sensor) {
    // returns true if commands are valid, returns false otherwise
    var valid = true;
    var categories = Object.keys(commands);
    for (var i = 0; i < categories.length; i++) {
        var category_str = categories[i];
        var category = commands[category_str];

        var groups_and_fields = Object.keys(commands[category_str]);
        for (var j = 0; j < groups_and_fields.length; j++) {
            var group_or_field_str = groups_and_fields[j];
            var group_or_field = category[group_or_field_str];

            var lookup = sensor[category_str][group_or_field_str];
            if (lookup === undefined) {
                var msg = (category_str + " -> " + group_or_field_str);
                return {valid: false, message: msg, error_code: 'Field/group "' + group_or_field_str + '" does not exist'};
            }

            valid = check_command(group_or_field, lookup);
            if (!valid["status"]) {
                var msg = (category_str + " -> " + group_or_field_str);
                return {valid: false, message: msg, error_code: valid["error_code"]};
            }
        }
    }
    return {valid: true, message: "no message", error_code: "no error code"};
}

function write_bits(write_value, start_bit, end_bit, type, current_bits) {
    // write the bits in write_value to the specified location in current_bits and returns the result as a bit array
    // Arguments:
    //      write_value [Number or String] - value to write to "current_bits"
    //      start_bit [Number] - start bit to write to
    //      end_bit [Number] - end bit to write to
    //      type [String] - apply type to the value
    //      current_bits [Bit Array] - bits to write "write_value" to
    if (current_bits === undefined) {
        current_bits = BitManipulation.get_bits(0);
    }

    var bits_to_write = BitManipulation.get_bits(write_value, type);

    var length = Number(start_bit) - Number(end_bit) + 1;
    var mask = BitManipulation.init_mask(length);

    bits_to_write = BitManipulation.AND(bits_to_write, mask);                   // AND bits_to_write with a mask of 1s
    bits_to_write = BitManipulation.shift_left(bits_to_write, end_bit);       // Shift the bits_to_write to start_bit

    current_bits = BitManipulation.OR(current_bits, bits_to_write);              // OR the bits_to_write with the current_bits

    return current_bits;
}

function format_header(header, read, or_80_to_write) {
    // takes in the header as a string, and handles the case of where the header is 2 bytes long
    var headersStr = header.split(" ")
    var headersInt = [];
    for (var i = 0; i < headersStr.length; i++) {
        var int = parseInt(headersStr[i]);
        if (!read && or_80_to_write == "1") {
            int = int | 0x80
        }
        headersInt.push(int)
    }
    return headersInt

}

function write_to_port(bytes, port, encoded_data) {
    // write "bytes" to the appropriate "port" in "encoded_data"
    if (encoded_data.hasOwnProperty(port)) {
        // try pushing "bytes" onto the appropriate port in "encoded_data"
        encoded_data[port] = encoded_data[port].concat(bytes);
    }
    else {
        // if the port doesn't exist as a key yet, create the key and push "bytes" onto it
        encoded_data[port] = bytes;
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
function encode_read(lookup, encoded_data) {
    var bytes = format_header(lookup["header"], true, lookup["or_80_to_write"]);
    write_to_port(bytes, lookup["port"], encoded_data);
}

function encode_write_field(command, lookup, encoded_data) {
    var bytes = format_header(lookup["header"], false, lookup["or_80_to_write"]);

    var value = command["write"];
    if ( (lookup["type"] !== "string") && (lookup["type"] !== "hexstring") ) {
        value = Number(value) - Number(lookup["addition"] ? lookup["addition"] : 0)
        value = Number(value)/Number(lookup["coefficient"]);
        // TODO: ideally this should be done inside of write_bits, not before it
    }

    var written_bits = write_bits(
        value,
        parseInt(lookup["bit_start"]),
        parseInt(lookup["bit_end"]),
        lookup["type"],
        0
    );

    if ( (lookup["multiple"] == 0) || (lookup["multiple"] === undefined) ) {
        var size = lookup["data_size"];
    }
    else {
        var size = written_bits.length/8;
    }

    var written_bytes = BitManipulation.to_byte_arr(written_bits, size);
    bytes = bytes.concat(written_bytes);

    write_to_port(bytes, lookup["port"], encoded_data);     // Add the bytes to the appropriate port in "encoded data"
}

function encode_write_group(commands, group_lookup, encoded_data) {
    var header = group_lookup["header"];
    var bytes = format_header(header, false, group_lookup["or_80_to_write"]);

    var written_bits = BitManipulation.get_bits(0);
    var field_names = Object.keys(commands["write"])
    var values = Object.values(commands["write"]);

    var bytes_num = parseInt(group_lookup[field_names[0]]["data_size"]);
    var multiple_field_bits = [];    // A variable to contain the bits of the "multiple" field if it exists

    for (var i = 0; i < field_names.length; i++) {
        var field_name = field_names[i];
        var lookup = group_lookup[field_name];

        var value = values[i];

        if ( (lookup["type"] !== "string") && (lookup["type"] !== "hexstring") ) {
            value = Number(value) - Number(lookup["addition"] ? lookup["addition"] : 0)
            value = Number(value)/Number(lookup["coefficient"]);
            // TODO: ideally this should be done inside of write_bits, not before it
        }

        if( (lookup["multiple"] == 0) || (lookup["multiple"] === undefined) ) {
            written_bits = write_bits(
                value,
                parseInt(lookup["bit_start"]),
                parseInt(lookup["bit_end"]),
                lookup["type"],
                written_bits
            );
        }
        else {
            multiple_field_bits = BitManipulation.get_bits(value, lookup["type"]);
            bytes_num += multiple_field_bits.length/8;
        }
    }

    written_bits = written_bits.concat(multiple_field_bits);  // must add multiple_field_bits at the end

    var written_bytes = BitManipulation.to_byte_arr(written_bits, bytes_num);
    bytes = bytes.concat(written_bytes)

    write_to_port(bytes, group_lookup["port"], encoded_data);
}

function encode(commands, sensor) {
    // encodes the commands object into a nested array of bytes

    var valid = is_valid(commands, sensor);
    if (!valid["valid"]) {
        // check if commands is valid. If not, raise an error
        var message = "Commands are invalid, failed at: " + valid["message"];
        var error_code = valid["error_code"];

        return {error : message, error_code: error_code};
    }

    var lookup_all = JSON.parse(JSON.stringify(sensor));   // clones the sensor json
    var encoded_data = {};
    var categories = Object.keys(commands);
    for (var i = 0; i < categories.length; i++) {   // iterates over the categories of commands
        var command_categories = commands[categories[i]];
        var lookup_categories = lookup_all[categories[i]];

        var groups_and_fields = Object.keys(command_categories);
        for (var j = 0; j < groups_and_fields.length; j++) {    // iterates over the groups of commands
            var command = command_categories[groups_and_fields[j]];
            var lookup = lookup_categories[groups_and_fields[j]];

            // Now that we are iterating over all of the commands, the cases that we have to handle are as such:
            //  1. The read case -> handled by encode_read(...)
            //  2. The write case where the current key is a field -> handled by encode_write_field(...)
            //  3. The write case where the current key is a group -> handled by encode_write_group(...)

            // Within cases 2 and 3, there is the case of "multiple" or not "multiple". These cases are handled
            // inside of their corresponding functions

            var case_1 = command.hasOwnProperty("read");
            var case_2 = command.hasOwnProperty("write") && (typeof(command["write"]) != "object");
            var case_3 = !(case_1 || case_2);

            if (case_1) {
                encode_read(lookup, encoded_data);
            } else if (case_2) {
                encode_write_field(command, lookup, encoded_data);
            } else if (case_3) {
                encode_write_group(command, lookup, encoded_data); }


        }
    }
    return encoded_data;
}

function encodeDownlink(input) {
    var result = encode(input.data, sensor);
    var portNumber = Object.keys(result)[0];
    var bytes = result[portNumber];

    return {
        'bytes': bytes,
        'port': portNumber
    };
}