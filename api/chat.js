import app from "../server/app.js";

export default function chat(request, response) {
  request.url = "/api/chat";
  return app(request, response);
}
