/// <reference lib="WebWorker" />
import { skipWaiting, clientsClaim } from "workbox-core";
import { precacheAndRoute } from "workbox-precaching";

declare const self: ServiceWorkerGlobalScope;
const LOOP_INTERVAL = 1 * 60 * 1000; // 1 minute

precacheAndRoute(self.__WB_MANIFEST);
skipWaiting();
clientsClaim();

self.addEventListener("install", function (event) {
  console.log("service started");
});

let notifyInterval = 15;

// recieve setNotifyInterval message from client
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "setNotifyInterval") {
    notifyInterval = event.data.interval;
    console.log("notifyInterval set to", notifyInterval);
  }
});
