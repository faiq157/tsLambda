require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const { handler } = require("./index");

// {
//   payload: 'CgMZsM8SEAgBEgwI+c6mjgYQiJvupwM=',
//   topic: 'cloud-dev/updates',
//   principal: '10fffdec6a868317731d26e4546723a0a0c7d53d462ba7b9cdbef05a7ee9af1d'
// }

/*
  NCTC match condition data:
  payload = CgMOK5MaOAosCgMOK5MSBwgCFYXrJUESAggBEgIIAxICCAUSAggEGgwI37aH7AUQmIKlsgIQExoGCIDEgOwFMiQKAw4rkxILCN+2h+wFENiLqQUYCCABKgwI1LaH7AUQgLLyhgJaGAoDDiuTEgwI37aH7AUQ8Ma1uQI9AAAgwmoWCgMOK5MSCwjftofsBRCQ4PQBGAFAAXIdCgMOK5MSDAjftofsBRDI0aC3Ah0AAKhCJZC7FEmKAR0KAw4rkxIMCN+2h+wFEPCM7LsCHc3MrEElcT2KPg==
  principal = de6029e25ebb31fbb1244fc2d01016040ff35c0c8cf472337d47926350f4c482
*/

/*
  NCTC mismatch condition data:
  payload = CgP///8aRgo6CgMKw7cSBwgCFa5HAUASBwgBFbgehT4SAggDEgcIBRUAAIA+EgIIBBoMCOe5h+wFENDw0sADIAEoARAQGgYIgMSA7AU=
  principal = de6029e25ebb31fbb1244fc2d01016040ff35c0c8cf472337d47926350f4c482
*/

/*
  getTcUpdateList - Network Controller
  payload = CgMOK4EaOAosCgMOK4ESBwgCFQAAJEESAggBEgIIAxICCAUSAggEGgwIwqei7AUQmNeIzgIQFRoGCIDzmuwFMiQKAw4rgRILCMKnouwFEPDRsU0YCCABKgwIwaei7AUQiKG9kwFaGAoDDiuBEgwIwqei7AUQ0In9zgI9AAAgwmoWCgMOK4ESCwjCp6LsBRCYuv1MGAFAAXIdCgMOK4ESDAjCp6LsBRD42dDOAh1mZqhCJcDsnUiKAR0KAw4rgRIMCMKnouwFEIi7ns8CHc3MrEEl4XqUPg==
  principal = f0020c61d36662250bb1cface1b76ad49a6233e1278de4ef5345bfb3ee74f4f6
*/

/*
  getTcUpdateList - Tracker Controller
  payload =
  principal =
*/

handler({
    // payload:
    // "CgMOK/k6kgEKCwi84tT1BRCAhMtGEBQaCEV2ZW50TG9nInVEZWVwIFNub3cgV2VhdGhlciBTdG93IHdhcyB0cmlnZ2VyZWQgYnkgMTNiNTM3IChsb2NhdGlvbiB1bmtub3duKSBkdWUgdG8gNS4wMCBtZXRlciBvZiBzbm93LiBUaHJlc2hvbGQgaXMgMy4wMCBtZXRlci4oAg==",
    // payload: "CgMOK6JaFwoDDiuiEgsInNjQ9QUQuL+jXz0zM7BC",
    payload:
      //"CgMOK6JiLgoDE7U3EgwI8cXY+gUQgOfKyAEdAAAgQSUAACBBLQAAIEE1AAAgQT0AACBBSAE=",
      // "CgMZsM8SEAgBEgwI+c6mjgYQiJvupwM=",
      "CgMZsM+KAkwKAxmwzxIMCKbPyo8GEJiKo5MDGAEqCWRlZXBfc25vdzIUMjAyMi0wMS0yN1QxNDowOTo0Mno6FDIwMjItMDEtMjdUMDk6NTg6MzN6",
    topic: "cloud-dev/updates",
    // principal: "10fffdec6a868317731d26e4546723a0a0c7d53d462ba7b9cdbef05a7ee9af1d",
    principal: "10fffdec6a868317731d26e4546723a0a0c7d53d462ba7b9cdbef05a7ee9af1d",
  }, {
    awsRequestId: uuidv4()
  }).then((resp) => {
    console.log("response:", resp);
    process.exit(0);
  }).catch((err) => {
    console.log("response:", err);
    process.exit(1);
  });

/*
nc_snap_addr: "\377\376\375"
tracking_changes {
  updated_state: TRACKING_WITH_BACKTRACKING
  state_changed_at {
    seconds: 1503511720
    nanos: 158000000
  }
}
tc_hour_updates {
  tc_update {
    tc_snap_addr: "\001\002\003"
    updates {
      type: PANEL
      value: 1.0
    }
    updates {
      type: BATT
      value: 2.0
    }
    updates {
      type: MOTOR
      value: 3.0
    }
    updates {
      type: CHARGER
      value: 4.0
    }
    updates {
      type: ANGULAR_ERROR
      value: 5.0
    }
    when {
      seconds: 1503511722
      nanos: 184000000
    }
  }
  hour: 23
  day {
    seconds: 1503446400
  }
}
tc_day_updates {
  tc_snap_addr: "\001\002\003"
  updates {
    type: PANEL
    value: 6.0
  }
  updates {
    type: BATT
    value: 7.0
  }
  updates {
    type: MOTOR
    value: 8.0
  }
  updates {
    type: CHARGER
    value: 9.0
  }
  updates {
    type: ANGULAR_ERROR
    value: 10.0
  }
  when {
    seconds: 1503511722
    nanos: 184000000
  }
}
rack_angles {
  tc_snap_addr: "\001\002\003"
  angles {
    current_angle: -5.2
    requested_angle: -5.3
    commanded_state: TRACKING_WITH_BACKTRACKING
    when {
      seconds: 1503511722
      nanos: 169000000
    }
  }
}
tc_updates {
  tc_snap_addr: "\001\002\003"
  when {
    seconds: 1503511722
    nanos: 169000000
  }
  status_bits: 2
}
*/
