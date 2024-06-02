var jsonresponsebuilder = require("http-server-jsonresponsebuilder");
var server = require("http-server", {indev: true});
var app = server();

app.lPost("/echo", function(req) {
  if (!req.body || !req.body.echo) {
    return ContentService.createTextOutput(new jsonresponsebuilder()
      .setCustomStatusCode(400)
      .setMessage("Missing required parameter 'msg'")
      .build()
    ).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(new jsonresponsebuilder()
    .setCustomStatusCode(200)
    .setMessage(req.body.echo)
    .build()
  ).setMimeType(ContentService.MimeType.JSON);
});

function doGet(req) {
  return app.listen("GET", req.pathInfo, req.parameter);
}

function doPost(req) {
  Logger.log(req);
  return app.listen("POST", req.pathInfo, req.postData);
}