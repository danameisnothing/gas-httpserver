class AbstractBaseRequestObject {
  constructor() {
    if (this.constructor === AbstractBaseRequestObject) {
      throw new Error("Illegal Instruction : Cannot instantiate an abstract class");
    }
  }

  static onRequest(method, pararameter) {
    throw new Error("Illegal Instruction : Method has not been implemented");
  }
}

class JSONResponseBuilder {
  constructor() {
    this.requestData = {};
  }

  setMessage(msg) {
    this.requestData["message"] = msg;
    return this;
  }

  // There is no way of returning a status code other than 200, so this is the best I could manage
  setCustomStatusCode(code) {
    this.requestData["status_code"] = code;
    return this;
  }

  setNote(note) {
    this.requestData["note"] = note;
    return this;
  }

  build() {
    if (!this.requestData.hasOwnProperty("status_code")) {
      // FIXME: This could be considered a temporary fix, since there's no logging
      this.requestData = {
        "status_code": 500,
        "message": "Request status code has not been set"
      };
      // TODO: possibly introduce logging this?
    }

    return JSON.stringify(this.requestData);
  }
}

function normalizePath(path) {
  return path.split("/").filter(function(e) {
    return e != "";
  });
}

function isPathSame(path1, path2) {
  return path1.every(function(e, i) {
    return e == path2[i];
  });
}

class RequestManager {
  static route(method, pathInfo, param) {
    if (!pathInfo) {
      // Set into an empty string, because otherwise it will break the paths that run in the root, like ({SCRIPT_ID}/exec). {SCRIPT_ID}/exec/ (with the trailing slash) still doesn't work because of some weird limitations with this platform?
      pathInfo = "";
    }

    var normReqPath = normalizePath(pathInfo);
    // Not the best, but it works. Ah well
    for (var k in REQUEST_PATHS) {
      if (!isPathSame(normReqPath, normalizePath(k))) {
        continue;
      }

      return REQUEST_PATHS[k].onRequest(method, param);
    }
    
    return ContentService.createTextOutput(new JSONResponseBuilder()
      .setCustomStatusCode(404)
      .setMessage("Endpoint invalid")
      .build()
    ).setMimeType(ContentService.MimeType.JSON);
  }
}



// Request target classes
class Root extends AbstractBaseRequestObject {
  static onRequest(method, pararameter) {
    return ContentService.createTextOutput(new JSONResponseBuilder()
      .setCustomStatusCode(200)
      .setMessage("Hello. This is the default message of the PathRouterFramework. You could navigate to /nostatuscode, /nomessage, /nonote to test out this system.")
      .build()
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

class NoStatusCode extends AbstractBaseRequestObject {
  static onRequest(method, pararameter) {
    return ContentService.createTextOutput(new JSONResponseBuilder()
      .setMessage("TestMessage")
      .setNote("TestNote")
      .build()
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

class NoMessage extends AbstractBaseRequestObject {
  static onRequest(method, pararameter) {
    return ContentService.createTextOutput(new JSONResponseBuilder()
      .setCustomStatusCode(200)
      .setNote("TestNote")
      .build()
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

class NoNote extends AbstractBaseRequestObject {
  static onRequest(method, pararameter) {
    return ContentService.createTextOutput(new JSONResponseBuilder()
      .setCustomStatusCode(200)
      .setMessage("TestMessage")
      .build()
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

var REQUEST_PATHS = {
  "/": Root,
  "/nostatuscode": NoStatusCode,
  "/nomessage": NoMessage,
  "/nonote": NoNote
}



function doGet(req) {
  return RequestManager.route("GET", req.pathInfo, req.parameter);
}