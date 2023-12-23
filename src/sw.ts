/// <reference lib="WebWorker" />
import { skipWaiting, clientsClaim } from "workbox-core";
import { precacheAndRoute } from "workbox-precaching";
import { StateChange, Task } from "./types/task";

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);
skipWaiting();
clientsClaim();

self.addEventListener("install", function (event) {
  console.log("service started");
});

self.addEventListener("push", (event) => {
  console.log("push recieved");
  const payload = event.data ? event.data.json() : "no payload";

  // if there's content it's a state change
  const content = payload as {
    stateChange: StateChange;
    task: Task;
  };

  const message = `Changed to ${content.stateChange.status}`;

  event.waitUntil(
    self.registration.showNotification(content.task.title, {
      body: message,
    })
  );
});
