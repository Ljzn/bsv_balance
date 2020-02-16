import React from "react";
import "./styles.css";
import Curved from "./Curved";

const jumpToAddr = () => {
  let addr = document.getElementById("addr").value;
  console.log(addr, "addr");
  let href = window.location.origin + "/" + addr;
  window.location.href = href;
};

export default function App() {
  return (
    <div className="App">
      <h1>BitcoinSV Balance</h1>
      <label>Address:</label>
      <input id="addr" />
      <button onClick={_ => jumpToAddr()}>Go</button>
      <Curved address={window.location.pathname.replace("/", "")} />
      <p>powered by euler.bitdb</p>
    </div>
  );
}
