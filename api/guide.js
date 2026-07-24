import app from "../server/app.js";

export default function guide(request, response) {
  request.url = "/api/guide";
  return app(request, response);
}
