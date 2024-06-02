function http_server(args) {
  var JSONResponseBuilder = require("http-server-jsonresponsebuilder");

  var HTTPSERVER_HAS_BEEN_INITIALIZED = false;
  var HTTPSERVER_OPTIONS = {};
  var HTTPSERVER_INSTANCE = null;

  HTTPSERVER_OPTIONS["logger_prefix"] = "[HTTP] ";
  if (typeof args === "object" && args.hasOwnProperty("indev")) HTTPSERVER_OPTIONS["indev"] = true;

  var _tokenizePath = function(path) {
    return path.split("/").filter(function(e) {
      return e != "";
    });
  }
  var _isPathSame = function(path1, path2) {
    return path1.every(function(e, i) {
      return e == path2[i];
    });
  }

  class _HTTPServer {
    constructor() {
      if (HTTPSERVER_HAS_BEEN_INITIALIZED === true) throw new Error("Tried to initialize HTTP Server that has been initialized");

      this.paths = {};
      this.paths["GET"] = {};
      this.paths["POST"] = {};
      this.paths["Override"] = {};
    }

    lGet(path, targetCallable) {
      // Intentionally has no checks for the same routes for overriding function paths
      this.paths["GET"][path] = targetCallable;
    }
    lPost(path, targetCallable) {
      // Intentionally has no checks for the same routes for overriding function paths
      this.paths["POST"][path] = targetCallable;
    }
    lOverride(statusCode, targetCallable) {
      // Intentionally has no checks for the same routes for overriding function paths
      this.paths["Override"][statusCode] = targetCallable;
    }

    listen(method, usrPath, param) {
      try {
        return this._listen(method, usrPath, param);
      } catch (e) {
        Logger.log(HTTPSERVER_OPTIONS["logger_prefix"] + "Returning status code 500 (" + e.message + "). Dumping stack trace...\n\n" + e.stack);
        return HTTPSERVER_INSTANCE._returnStatusCode(500, (HTTPSERVER_OPTIONS["indev"] === true) ? "ERROR: " + e.message + ". See server logs for more detail" : "Internal server error");
      }
    }

    _listen(method, usrPath, param) {
      if (HTTPSERVER_OPTIONS["indev"] === true) var startReqTime = Date.now();

      // Set into an empty string, because otherwise it will break the paths that run in the root, like ({SCRIPT_ID}/exec). {SCRIPT_ID}/exec/ (with the trailing slash) still doesn't work because of some weird limitations with this platform?
      if (!usrPath) usrPath = "";

      if (method !== "GET" && method !== "POST") throw new Error("Invalid method passed");

      // preferred names
      var _req = {};
      if (method === "GET") {
        _req.queryParam = param;
      } else {
        if (param === undefined) {
          _req.body = null;
        }
        
        // For now we only supported the JSON format, ah well
        try {
          _req.body = JSON.parse(param.contents)
        } catch (e) {
          _req.body = null; // Fake it not being there
        };
      }
      _req.path = "/" + usrPath; // because if the URL is /exec/hello, it will only be "hello". This appends the "/" back so it looks nicer

      // Normalize the paths into our workable format
      var _normReqPath = _tokenizePath(usrPath);
      for (var path in this.paths[method]) {
        if (!_isPathSame(_normReqPath, _tokenizePath(path))) continue;
        
        // Call the function for the path, and method
        return this.paths[method][path](_req);
      }
      
      if (this.paths["Override"].hasOwnProperty(404)) {
        return this.paths["Override"][404](_req);
      }
      return this._returnStatusCode(404, "Endpoint invalid");
    }

    _returnStatusCode(statusCode, msg) {
      var _temp = new JSONResponseBuilder().setCustomStatusCode(statusCode);
      if (msg !== undefined) _temp.setMessage(msg);

      return ContentService.createTextOutput(_temp.build()).setMimeType(ContentService.MimeType.JSON);
    }
  }

  return function() {
    var _e = new _HTTPServer();
    HTTPSERVER_HAS_BEEN_INITIALIZED = true;
    HTTPSERVER_INSTANCE = _e;
    return _e;
  }
}