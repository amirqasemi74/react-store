import { useEffect, useState } from "react";

export function useUsername(userId: string) {
  const [username, setUsername] = useState("");

  useEffect(() => {
    setUsername(userId);
  }, [userId]);

  return username;
}
