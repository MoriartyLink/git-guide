import app from "../server/app.js";

export default function health(request, response) {
  request.url = "/api/health";
  return app(request, response);
}
