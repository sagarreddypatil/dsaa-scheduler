import PocketBase from "pocketbase";

export const pb = new PocketBase("http://localhost:8093");
pb.autoCancellation(false);

import Button from "./controls/button";
import Textbox from "./controls/textbox";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (pb.authStore.isValid) {
      navigate("/");
    }
  });

  const login = () => {
    const username = usernameRef.current!.value;
    const password = passwordRef.current!.value;

    pb.collection("users")
      .authWithPassword(username, password)
      .then(() => {
        if (pb.authStore.isValid) {
          navigate("/");
        }
      });
  };

  return (
    <div className="my-4 max-w-xl mx-auto flex flex-col gap-2">
      <span className="text-2xl">Login</span>
      <Textbox placeholder="Username/Email" ref={usernameRef} />
      <Textbox placeholder="Password" type="password" ref={passwordRef} />
      <Button onClick={login}>Login</Button>
    </div>
  );
}
