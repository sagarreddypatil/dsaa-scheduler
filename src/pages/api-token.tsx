import { createRef, useState } from "react";
import { Button } from "../controls/button";
import { pb } from "../Login";
import Textbox from "../controls/textbox";

export default function ApiToken() {
  const [token, setToken] = useState<string | null>();
  const tokenCopyRef = createRef<HTMLInputElement>();

  const regenerateClick = () => {
    // are you sure?
    if (
      !confirm(
        "Are you sure you want to regenerate your API token? This will invalidate your current token"
      )
    )
      return;

    pb.send("/api/v1/token", {}).then((res) => {
      setToken(res.token);
    });
  };

  const copyToken = () => {
    if (!tokenCopyRef.current) return;

    tokenCopyRef.current.select();
    tokenCopyRef.current.setSelectionRange(0, 99999);

    navigator.clipboard.writeText(tokenCopyRef.current.value);
  };

  return (
    <div>
      <h1 className="text-xl mb-4">API Token</h1>
      <Button className="mb-4" onClick={regenerateClick}>
        Regenerate
      </Button>
      {token && (
        <div className="flex flex-row gap-2">
          <Textbox className="text-sm w-56" value={token} ref={tokenCopyRef} />
          <Button onClick={copyToken}>Copy</Button>
        </div>
      )}
    </div>
  );
}
