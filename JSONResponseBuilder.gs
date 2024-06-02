function http_server_json_response_builder() {
  return class {
    constructor() {
      this.requestData = {};
    }

    setMessage(msg) {
      this.requestData["message"] = msg;
      return this;
    }

    // There is no way of returning a status code other than 200, so this is the best I could manage
    setCustomStatusCode(code) {
      this.requestData["x_status_code"] = code;
      return this;
    }

    setNote(note) {
      this.requestData["note"] = note;
      return this;
    }

    setCustomProp(key, value) {
      this.requestData[key] = value;
      return this;
    }

    build() {
      if (!this.requestData.hasOwnProperty("x_status_code")) {
        throw new Error("Request status code has not been set");
      }
      return JSON.stringify(this.requestData);
    }
  }
}