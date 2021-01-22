import _ from "underscore";

async function getTransactions(addr, type) {
  let query;
  let handler;
  if (type === "unspend") {
    query = queryUnspends(addr);
    handler = handleUnspend;
  } else if (type === "spent") {
    query = querySpents(addr);
    handler = handleSpent;
  } else {
    alert("wrong type: " + type);
  }
  let data = await runQuery(query, handler, addr);
  // console.log(data, 'data');
  return data;
}

let print = (x) => {
  console.log(x)
  return x;
}

const TOKEN = 'eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJzdWIiOiIxOTczM1hjNlpYM3lhY1doTGlIc1ZTOFJKMjZ3MzV2YWptIiwiaXNzdWVyIjoiZ2VuZXJpYy1iaXRhdXRoIn0.SUJBQW1uLytJc0thMEdFb0Q3ellvcUJSZHhKbU1HN1JZOVFFVUcrU2hWNG1mcmxueVR0YXBRMm1KdjNIcHRvOUVnaDV6cVBjS3hYWUQzTXp3b3ZuNjdvPQ'

let runQuery = async (query, handler, addr) => {

  let data =
    fetch("https://txo.bitbus.network/block", {
      method: "post",
      headers: {
        'Content-type': 'application/json; charset=utf-8',
        'token': TOKEN
      },
      body: JSON.stringify(query)
    })
      .then(function (r) {
        return r.text();
      })
      .then(function (r) {
        let result = print(r.split('\n')).slice(0, -2).map(x => JSON.parse(x));
        console.log(result, 'result1');
        result = _.flatten(
          _.map(result, e => {
            return handler(e, addr, true);
          })
        );
        console.log(result, 'result2');
        return result;
      });


  return data;
};

let queryUnspends = addr => {
  return {
    v: 3,
    q: {
      find: {
        "out.e.a": addr
      },
      project: {
        "blk.t": 1,
        "tx.h": 1,
        "out.e": 1
      }
    }
    // // r is not supported by bitbus
    // r: {
    //   f: `[.[] | [ {tx: .tx.h, t: .blk.t, out: .out | map(select(.e.a == "${addr}"))} ] | .[] ]`
    // }
  };
};

let r_u = (e, addr) => {
  return {
    tx: e.tx.h,
    t: e.blk.t,
    out: _.filter(e.out, (o) => o.e.a === addr)
  }
}

let querySpents = addr => {
  return {
    v: 3,
    q: {
      find: {
        "in.e.a": addr
      },
      project: {
        "blk.t": 1,
        "tx.h": 1,
        "in.e": 1
      }
    }
    // r: {
    //   f: `[.[] | [ {t: .blk.t, in: .in | map(select(.e.a == "${addr}"))} ] | .[] ]`
    // }
  };
};

let r_s = (e, addr) => {
  return {
    t: e.blk.t,
    in: _.filter(e.in, (o) => o.e.a === addr)
  }
}


let handleUnspend = (elem, addr, r) => {
  if (r) {
    elem = r_u(elem, addr);
  }
  let outs = elem.out;
  return _.map(outs, o => {
    return {
      txid: elem.tx,
      index: o.e.i,
      v: o.e.v,
      t: elem.t || Date.now() / 1000
    };
  });
};

let handleSpent = (elem, addr, r) => {
  if (r) {
    elem = r_s(elem, addr);
  }
  let ins = elem.in;
  return _.map(ins, i => {
    return {
      txid: i.e.h,
      index: i.e.i,
      v: 0,
      t: elem.t
    };
  });
};

function bitsocket(addr, type, callback) {
  let query;
  let handler;
  if (type === "unspend") {
    query = queryUnspends(addr);
    handler = handleUnspend;
  } else if (type === "spent") {
    query = querySpents(addr);
    handler = handleSpent;
  } else {
    alert("wrong type: " + type);
  }
  // Base64 encode your bitquery
  const b64 = btoa(JSON.stringify(query));
  // Subscribe
  const sock = new EventSource("https://txo.bitsocket.network/s/" + b64);
  sock.onmessage = function (e) {
    const raw = e.data;
    console.log(raw, "raw");
    const json = JSON.parse(raw);
    if (json.type === "push") {
      // console.log(json.data);
      const actions = _.flatten(_.map(json.data, (e) => handler(e)));
      console.log(actions, "actions");
      callback(actions);
    }
  };
}

export { getTransactions, bitsocket };
