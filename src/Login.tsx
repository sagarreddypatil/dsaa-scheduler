import PocketBase from "pocketbase";

// const pbLocation = import.meta.env.PROD
//   ? window.location.origin
//   : "http://photon:8093";

const pbLocation = "https://dsaa-schd.fly.dev";

export const pb = new PocketBase(pbLocation);

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
          navigate("/");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="max-w-xl mx-auto px-2 flex flex-col justify-center min-h-full mt-32">
      <div className="flex flex-row justify-between mb-2">
        <button
          className="text-2xl flex flex-col justify-center"
          onClick={() => navigate("/")}
        >
          schd login
        </button>
      </div>
      <hr className="border-gray-500 mb-4" />
      <form className="flex flex-col gap-2" onSubmit={login}>
        <Textbox placeholder="Username/Email" ref={usernameRef} />
        <Textbox placeholder="Password" type="password" ref={passwordRef} />
        <Submit>Login</Submit>
      </form>
    </div>
  );
}
