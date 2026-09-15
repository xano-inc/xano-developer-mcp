query publish verb=POST {
  api_group = "docs_audit"
  input {
    int room_id
    text body
  }
  stack {
    realtime.publish {
      realtime_server = "docs_realtime"
      channel = "rooms/" ~ $input.room_id
      message = "announcement"
      data = {body: $input.body}
    }
  }
  response = {ok: true}
}
