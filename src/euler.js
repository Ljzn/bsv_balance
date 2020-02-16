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
      result = _.map(result, e => {
        return handler(e, addr);
      });
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
    }
  };
};

let handleUnspend = (elem, addr) => {
  let out = elem.out.filter(o => o.e.a === addr)[0];
  return {
    txid: elem.tx.h,
    index: out.e.i,
    v: out.e.v,
    t: elem.blk.t
  };
};

let handleSpent = (elem, addr) => {
  let myin = elem.in.filter(o => o.e.a === addr)[0];
  return {
    txid: elem.tx.h,
    index: myin.e.i,
    v: 0,
    t: elem.blk.t
  };
};

export { getTransactions };
