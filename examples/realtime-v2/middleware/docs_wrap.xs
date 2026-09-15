middleware docs_wrap {
  exception_policy = "rethrow"
  response_strategy = "replace"
  input {
    json vars
    enum type {
      values = ["pre", "post"]
    }
  }
  stack {
    var $payload { value = $input.vars.result }
  }
  response = {success: true, payload: $payload}
}
