middleware docs_post {
  exception_policy = "rethrow"
  response_strategy = "merge"
  input {
    json vars
    enum type {
      values = ["pre", "post"]
    }
  }
  stack {
    var $observed { value = $input.vars }
  }
  response = {middleware_phase: $input.type, observed: $observed}
}
