import React from "react";
import "./styles.css";
import Curved from "./Curved";
import MoneyButton from "@moneybutton/react-money-button";
import { ToastProvider, useToasts } from "react-toast-notifications";

const WithToasts = () => {
  const { addToast } = useToasts();

  const show = type => {
    addToast(`Got new transaction!`, { appearance: "success" });
  };
  setInterval(() => {
    let toast = localStorage.getItem("toast");
    if (toast !== null) {
      show();
      localStorage.removeItem("toast");
      console.log(toast);
    }
  }, 500);
  return <div />;
};

const jumpToAddr = () => {
  let addr = document.getElementById("addr").value;
  console.log(addr, "addr");
  let href = window.location.origin + "/" + addr;
  window.location.href = href;
};

export default function App() {
  return (
    <div className="App">
      <ToastProvider>
        <h1>BitcoinSV Balance</h1>
        <label>Address:</label>
        <input id="addr" />
        <button onClick={_ => jumpToAddr()}>Go</button>
        <Curved address={window.location.pathname.replace("/", "")} />
        <p>powered by planaria.network & bitsocket</p>
        <div>
          <label>I Like It: </label>
          <MoneyButton
            to="1KtVZnseDk5Lj8LoBqDPqHWLrjLie4qB5H"
            amount="0.1"
            currency="USD"
            onPayment={() =>
              (document.getElementById("greet").innerText = "Thank U!❤")
            }
          />
          <label id="greet" />
        </div>
        <WithToasts />
      </ToastProvider>
    </div>
  );
}
