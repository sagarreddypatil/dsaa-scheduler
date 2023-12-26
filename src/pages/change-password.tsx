import { useRef, useState } from "react";
import { Submit } from "../controls/button";
import Textbox from "../controls/textbox";
import { pb } from "../Login";

export default function ChangePassword() {
  const oldPwdRef = useRef<HTMLInputElement>(null);
  const newPwdRef = useRef<HTMLInputElement>(null);
  const newPwdConfirmRef = useRef<HTMLInputElement>(null);

  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");

  const change = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrorText("");
    setSuccessText("");

    if (!pb.authStore.isValid) {
      setErrorText("You must be logged in to change your password.");
      return;
    }

    const oldPwd = oldPwdRef.current!.value;
    const newPwd = newPwdRef.current!.value;
    const newPwdConfirm = newPwdConfirmRef.current!.value;

    pb.collection("users")
      .update(pb.authStore.model!.id, {
        oldPassword: oldPwd,
        password: newPwd,
        passwordConfirm: newPwdConfirm,
      })
      .then(() => {
        setSuccessText("Password changed successfully.");
        pb.authStore.clear();
      })
      .catch((err) => {
        setErrorText(err.message);
      });
  };

  return (
    <form className="flex flex-col gap-2" onSubmit={change}>
      <label className="text-red-500">{errorText}</label>
      <label className="text-green-500">{successText}</label>
      <Textbox placeholder="Old Password" type="password" ref={oldPwdRef} />
      <Textbox placeholder="New Password" type="password" ref={newPwdRef} />
      <Textbox
        placeholder="Confirm New Password"
        type="password"
        ref={newPwdConfirmRef}
      />
      <Submit>Change Password</Submit>
    </form>
  );
}
