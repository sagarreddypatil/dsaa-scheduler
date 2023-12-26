import { Outlet, useNavigate, useNavigation } from "react-router-dom";
import { pb } from "./Login";
import { useEffect, useMemo, useState } from "react";
import { Button } from "./controls/button";
import { Dropdown, DropdownItem } from "./controls/dropdown";
import { usePbRecord } from "./hooks/pocketbase";

const VAPID_PUBLIC_KEY =
  "BAhQEypP3kzKm0J5Rqpb8EgW3UHni-9A-M5IrELV1OjS0QWkNleCv94BvDiCgMk2QZHz3Jt8M5q5s8ErlsZdG8M";

export default function App() {
  const pwaSupported = () =>
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window;

  const navigation = useNavigation();
  const navigate = useNavigate();

  const [loggedIn, setLoggedIn] = useState(false);
  const [userRecord] = usePbRecord<User>(
    "users",
    loggedIn && pb.authStore.model ? pb.authStore.model!.id : null
  );

  const alreadySubscribed = useMemo(() => {
    if (!userRecord) return false;
    return userRecord.webPushSubscription !== null;
  }, [userRecord]);

  const [subscribed, setSubscribed] = useState(pwaSupported());

  const [notifyStatus, setNotifyStatus] = useState<NotificationPermission>(
    pwaSupported() ? Notification.permission : "denied"
  );

  useEffect(() => {
    // if not logged in, redirect to login page
    if (!pb.authStore.isValid) {
      navigate("/login");
      return;
    }

    setLoggedIn(true);
  }, [pb.authStore.isValid]);

  const logout = () => {
    pb.authStore.clear();
    navigate("/login");
  };

  const profilePicUrl = useMemo(() => {
    if (!userRecord) return null;
    if (!userRecord.avatar) return null;
    return pb.files.getUrl(userRecord, userRecord.avatar, {
      thumb: "32x32",
    });
  }, [userRecord]);

  useEffect(() => {
    // if we're logged in, then register push
    if (!pb.authStore.isValid) return;
    if (!pwaSupported()) return;

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
              setSubscribed(false);
              return;
            }

            return pb.collection("users").update(pb.authStore.model!.id, {
              webPushSubscription: subscription.toJSON(),
            });
          });
      })
      .catch((err) => {
        console.error(err);
        setSubscribed(false);
      });
  }, []);

  const subscribe = () => {
    if (!pb.authStore.isValid) return;
    if (!pwaSupported()) return;

    navigator.serviceWorker.ready.then((registration) => {
      return registration.pushManager
        .subscribe({
          userVisibleOnly: true,
          applicationServerKey: VAPID_PUBLIC_KEY,
        })
        .then((subscription) => {
          return pb.collection("users").update(pb.authStore.model!.id, {
            webPushSubscription: subscription.toJSON(),
          });
        })
        .then(() => {
          setSubscribed(true);
        });
    });
  };

  const unsubscribe = () => {
    if (!pb.authStore.isValid) return;
    if (!pwaSupported()) return;
    navigator.serviceWorker.ready.then((registration) => {
      registration.pushManager.getSubscription().then((subscription) => {
        if (!subscription) {
          return;
        }

        subscription
          .unsubscribe()
          .then(() => {
            return pb.collection("users").update(pb.authStore.model!.id, {
              webPushSubscription: null,
            });
          })
          .then(() => {
            setSubscribed(false);
          });
      });
    });
  };

  const enableNotifications = () => {
    if (!pwaSupported()) return;

    Notification.requestPermission().then((permission) => {
      setNotifyStatus(permission);
    });
  };

  const renderNotifyButton = () => {
    switch (notifyStatus) {
      case "granted":
        return <DropdownItem>Notifications Enabled</DropdownItem>;
      case "denied":
        return (
          <DropdownItem className="text-red-500 hover:bg-red-500">
            Notifications Denied
          </DropdownItem>
        );
      default:
        return (
          <DropdownItem onClick={enableNotifications}>
            Allow Notifications
          </DropdownItem>
        );
    }
  };

  const renderSubscribeButton = () => {
    if (subscribed) {
      return <DropdownItem onClick={unsubscribe}>Unsubscribe</DropdownItem>;
    } else {
      if (alreadySubscribed) {
        return (
          <DropdownItem className="text-red-500 hover:bg-red-500">
            Subscribed Elsewhere
          </DropdownItem>
        );
      } else {
        return <DropdownItem onClick={subscribe}>Subscribe</DropdownItem>;
      }
    }
  };

  if (!loggedIn) return <></>;

  return (
    <div className="my-4 max-w-xl mx-auto px-2">
      <div className="flex flex-row justify-between mb-2">
        <button
          className="text-2xl flex flex-col justify-center"
          onClick={() => navigate("/")}
        >
          schd
        </button>
        <Dropdown
          name={
            profilePicUrl ? (
              <img
                alt="profile pic"
                src={profilePicUrl}
                className="p-0.5 border border-black hover:bg-black"
                height={48}
                width={48}
              />
            ) : (
              <div className="aspect-square w-[48px] h-[48px] flex flex-col justify-center text-3xl border border-black hover:bg-black hover:text-white p-0.5">
                {userRecord?.name?.substring(0, 1)}
              </div>
            )
          }
          right={true}
        >
          {renderNotifyButton()}
          {renderSubscribeButton()}
          <DropdownItem onClick={() => navigate("/token")}>
            API Token
          </DropdownItem>
          <DropdownItem onClick={() => navigate("/change-password")}>
            Change Password
          </DropdownItem>
          <DropdownItem onClick={logout}>Logout</DropdownItem>
        </Dropdown>
      </div>
      <hr className="border-gray-500" />
      <br className="h-2" />
      <Outlet />
    </div>
  );
}
