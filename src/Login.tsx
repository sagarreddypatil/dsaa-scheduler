import PocketBase from "pocketbase";

export const pb = new PocketBase("http://localhost:8093");
pb.autoCancellation(false);

import Button from "./controls/button";
import Textbox from "./controls/textbox";
import { useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Login() {
  const [searchParams] = useSearchParams();
  const admin = searchParams.get("admin") != undefined;

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  const login = () => {
    const username = usernameRef.current!.value;
    const password = passwordRef.current!.value;

    if (admin) {
      pb.admins.authWithPassword(username, password);
      if (pb.authStore.isValid) {
        navigate("/");
      }
    }
  };

  return (
    <div className="my-4 max-w-xl mx-auto flex flex-col gap-2">
      <span className="text-2xl">Login</span>
      <Textbox
        placeholder={admin ? "Admin Email" : "Username/Email"}
        ref={usernameRef}
      />
      <Textbox placeholder="Password" type="password" ref={passwordRef} />
      <div className="">
        {admin ? (
          <a
            className="text-sm text-rush underline"
            href="#"
            onClick={() => {
              navigate("/login");
            }}
          >
            Normal Login
          </a>
        ) : (
          <a
            className="text-sm text-rush underline"
            href="#"
            onClick={() => {
              navigate("/login?admin");
            }}
          >
            Admin Login
          </a>
        )}
      </div>
      <Button onClick={login}>Login</Button>
    </div>
  );
}
