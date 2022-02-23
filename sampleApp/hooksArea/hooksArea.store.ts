import { AutoEffect, Effect, Hook, Store } from "@react-store/core";
import { property } from "lodash";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

@Store()
export class HooksAreaStore {
  // @Hook(() => useParams().id)
  userId: string = "amir";

  // @Param("id")
  xId: string;

  @Hook((st: HooksAreaStore) => useUsername(st.userId))
  username: string;

  @Effect("username")
  onMount() {
    this.xId = this.username;
  }
}

function Param(param: string): PropertyDecorator {
  return function (target, propertyKey) {
    Hook(() => useParams()[param])(target, propertyKey);
  };
}

function useUsername(userId: string) {
  const [username, setUsername] = useState("");

  useEffect(() => {
    setUsername(userId);
  }, [userId]);

  return username;
}
