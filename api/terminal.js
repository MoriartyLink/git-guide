import app from "../server/app.js";

export default function terminal(request, response) {
  request.url = "/api/terminal";
  return app(request, response);
}
