interface UserInfo{
  id: string;
  name: string;
  image: string;
}

interface UserMessage{
  content: string;
}

interface SocketClientEventType{
  "user-connect": function(UserInfo): void;
  "user-disconnect": function(UserInfo): void;
  "user-message": function(UserMessage): void;
}