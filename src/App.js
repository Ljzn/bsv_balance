import React from "react";
import "./styles.css";
import Curved from "./Curved";
import MoneyButton from "@moneybutton/react-money-button";

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
      <p>powered by planaria.network & bitsocket</p>
      <div>
        <label>I Like It: </label>
        <MoneyButton
          to="1344kyFGPUWYJokpoSsH7geWHDAjt2xQUu"
          amount="0.1"
          currency="USD"
          onPayment={() =>
            (document.getElementById("greet").innerText = "Thank U!❤")
          }
        />
        <label id="greet" />
      </div>
    </div>
  );
}
