import React, { useState } from "react";
import ReactDOM from "react-dom";
import App from "./App";

function AppWrapper() {
  const [mount, setMount] = useState(true);
  return (
    <div>
      <button onClick={() => setMount((v) => !v)}>Toggle Mount</button>
      {mount ? <App /> : "unmouted"}
    </div>
  );
}
ReactDOM.render(<AppWrapper />, document.querySelector("#root"));
