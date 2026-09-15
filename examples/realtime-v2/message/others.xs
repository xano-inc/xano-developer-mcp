message others {
  realtime_server = "docs_realtime"
  channel = "rooms/{room_id}"
  deliver_to = "others"
  input {
    text body
  }
  stack {
  }
  response = {body: $input.body}
}
