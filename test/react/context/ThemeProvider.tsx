import React, { createContext, useState } from "react";

export default function ThemeProvider({ children }) {
  const [colors, setColors] = useState({
    primary: "white",
    secondary: "gray"
  });

  const changeTheme = () => {
    setColors({
      primary: "Blue",
      secondary: "Red"
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        colors
      }}
    >
      <button onClick={changeTheme}>change theme</button>
      {children}
    </ThemeContext.Provider>
  );
}

export interface ThemeContextInterface {
  colors: {
    primary: string;
    secondary: string;
  };
}
export const ThemeContext = createContext<ThemeContextInterface | null>(null);
