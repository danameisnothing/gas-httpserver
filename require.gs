function require(funcName, args) {
  // This is the global require "table" for all of the sub-files.
  var MODULES = {
    "http-server-jsonresponsebuilder": http_server_json_response_builder,
    "http-server": http_server
  };

  if (!MODULES.hasOwnProperty(funcName)) throw new Error("Module isn't registered at the global modules object"); // TODO: throw exception
  
  return MODULES[funcName](args);
}