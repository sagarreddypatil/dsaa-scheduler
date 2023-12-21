import PocketBase from "pocketbase";

export const pb = new PocketBase("http://photon:8093");
pb.autoCancellation(false);

import { Submit } from "./controls/button";
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

  const login = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const username = usernameRef.current!.value;
    const password = passwordRef.current!.value;

    pb.collection("users")
      .authWithPassword(username, password)
      .then(() => {
        if (pb.authStore.isValid) {
          console.log("login success");
          navigate("/");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <form
      className="my-4 max-w-xl mx-auto flex flex-col gap-2 p-2"
      onSubmit={login}
    >
      <span className="text-2xl">Login</span>
      <Textbox placeholder="Username/Email" ref={usernameRef} />
      <Textbox placeholder="Password" type="password" ref={passwordRef} />
      <Submit>Login</Submit>
    </form>
  );
}
