import App from "./App";
import { AutoEffectTest } from "./autoEffect/AutoEffect";
import { HooksAreaTest } from "./hooksArea/HooksArea";
import { PropsTest } from "./props/Props";
import { StorePartTest } from "./storePart/StorePart";
import React, { useState } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Routes } from "react-router-dom";

function AppWrapper() {
  const [mount, setMount] = useState(true);
  return (
    <div>
      <button onClick={() => setMount((v) => !v)}>Toggle Mount</button>
      {mount ? <App /> : "unmounted"}
    </div>
  );
}

// ReactDOM.render(<AppWrapper />, document.querySelector("#root"));
// ReactDOM.render(<AutoEffectTest />, document.querySelector("#root"));
// ReactDOM.render(
//   <PropsTest obj={{ a: 3 }} a={<p>Amir</p>} />,
//   document.querySelector("#root")
// );

// ReactDOM.render(<StorePartTest />, document.querySelector("#root"));
ReactDOM.render(
  <BrowserRouter>
    <Routes>
      <Route path="/user/:id" element={<HooksAreaTest />} />
    </Routes>
  </BrowserRouter>,
  document.querySelector("#root")
);
