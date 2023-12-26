type User = {
  id: string;
  username: string;
  name?: string;
  verified: boolean;
  avatar?: string;
  webPushSubscription: string | null;
  apiToken: string;
};
