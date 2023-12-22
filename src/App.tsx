import { Outlet, useNavigate, useNavigation } from "react-router-dom";
import { pb } from "./Login";
import { useEffect, useState } from "react";
import { Button } from "./controls/button";

const VAPID_PUBLIC_KEY =
  "BAhQEypP3kzKm0J5Rqpb8EgW3UHni-9A-M5IrELV1OjS0QWkNleCv94BvDiCgMk2QZHz3Jt8M5q5s8ErlsZdG8M";

export default function App() {
  const navigation = useNavigation();
  const navigate = useNavigate();

  const [showSubscribe, setShowSubscribe] = useState(false);

  useEffect(() => {
    // if not logged in, redirect to login page
    if (!pb.authStore.isValid) {
      navigate("/login");
    }
  });

  const logout = () => {
    pb.authStore.clear();
    navigate("/login");
  };

  const [showNotifyPrompt, setShowNotifyPrompt] = useState(
    Notification.permission !== "granted"
  );

  useEffect(() => {
    // if we're logged in, then register push
    if (!pb.authStore.isValid) return;

    // register push
    navigator.serviceWorker
      ?.register(
        import.meta.env.MODE === "production" ? "/sw.js" : "/dev-sw.js?dev-sw",
        { type: import.meta.env.MODE === "production" ? "classic" : "module" }
      )
      .then((registration) => {
        return registration.pushManager
          .getSubscription()
          .then((subscription) => {
            if (!subscription) {
              setShowSubscribe(true);
              return;
            }

            // TODO: send info to backend
            pb.collection("users").update(pb.authStore.model!.id, {
              webPushSubscription: subscription.toJSON(),
            });

            setShowSubscribe(false);
          });
      });
  }, []);

  const subscribe = () => {
    if (!pb.authStore.isValid) return;

    navigator.serviceWorker.ready.then((registration) => {
      registration.pushManager
        .subscribe({
          userVisibleOnly: true,
          applicationServerKey: VAPID_PUBLIC_KEY,
        })
        .then((subscription) => {
          pb.collection("users").update(pb.authStore.model!.id, {
            webPushSubscription: subscription.toJSON(),
          });

          setShowSubscribe(false);
        });
    });
  };

  return (
    <div className="my-4 max-w-xl mx-auto px-2">
      <div className="flex flex-row justify-between mb-2">
        <button className="text-2xl" onClick={() => navigate("/")}>
          schd
        </button>
        {/* <Button onClick={logout}>Logout</Button> */}
      </div>
      <hr className="border-gray-500" />
      {showSubscribe && <Button onClick={subscribe}>Subscribe</Button>}
      {showNotifyPrompt && (
        <Button
          className="mt-2 w-full h-10 font-bold text-2xl bg-red-300"
          onClick={() => {
            Notification.requestPermission().then((result) => {
              if (result === "granted") {
                setShowNotifyPrompt(false);
              }
            });
          }}
        >
          Enable Notifications
        </Button>
      )}
      <br className="h-2" />
      <Outlet />
    </div>
  );
}
