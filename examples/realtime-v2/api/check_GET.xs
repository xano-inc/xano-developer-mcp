query check verb=GET {
  api_group = "docs_audit"
  input {
  }
  stack {
    var $result { value = {ok: true} }
  }
  response = $result
  middleware = {post: [{name: "docs_post"}]}
}
