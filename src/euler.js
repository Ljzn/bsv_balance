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

let runQuery = async (query, handler, addr) => {
  var b64 = btoa(JSON.stringify(query));
  var url =
    "https://euler.bitdb.network/q/13Q2RdxNQRYaPotZxJ64yZbWuHrpVwut1Z/" + b64;
  var header = { headers: { key: "1344kyFGPUWYJokpoSsH7geWHDAjt2xQUu" } };
  let data = await fetch(url, header)
    .then(function(r) {
      return r.json();
    })
    .then(function(r) {
      let result = r.c.concat(r.u);
      result = _.flatten(
        _.map(result, e => {
          return handler(e, addr);
        })
      );
      // console.log(result, 'result');
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
    },
    r: {
      f: `[.[] | [ {tx: .tx.h, t: .blk.t, out: .out | map(select(.e.a == "${addr}"))} ] | .[] ]`
    }
  };
};

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
    },
    r: {
      f: `[.[] | [ {t: .blk.t, in: .in | map(select(.e.a == "${addr}"))} ] | .[] ]`
    }
  };
};

let handleUnspend = (elem, addr) => {
  let outs = elem.out;
  return _.map(outs, o => {
    return {
      txid: elem.tx,
      index: o.e.i,
      v: o.e.v,
      t: elem.t
    };
  });
};

let handleSpent = (elem, _addr) => {
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
  sock.onmessage = function(e) {
    const raw = e.data;
    console.log(raw, "raw");
    const json = JSON.parse(raw);
    if (json.type === "push") {
      // console.log(json.data);
      const actions = _.flatten(_.map(json.data, handler));
      // console.log(actions, "actions");
      callback(actions);
    }
  };
}

export { getTransactions, bitsocket };
