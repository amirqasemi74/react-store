import App from "./App";
import React, { useState } from "react";
import ReactDOM from "react-dom";

function AppWrapper() {
  const [mount, setMount] = useState(true);
  return (
    <div>
      <button onClick={() => setMount((v) => !v)}>Toggle Mount</button>
      {mount ? <App /> : "unmounted"}
    </div>
  );
}

ReactDOM.render(<AppWrapper />, document.querySelector("#root"));
