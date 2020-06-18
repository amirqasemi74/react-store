import React, { createContext, useState } from "react";

export default function ThemeProvider({ children }) {
  const [colors, setColors] = useState({
    primary: "white",
    secondary: "gray",
  });

  const changeTheme = () => {
    setColors({
      primary: "Blue",
      secondary: "Red",
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        colors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export interface ThemeContext {
  colors: {
    primary: string;
    secondary: string;
  };
}
export const ThemeContext = createContext<ThemeContext | null>(null);
