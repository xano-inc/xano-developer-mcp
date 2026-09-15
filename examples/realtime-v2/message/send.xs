message send {
  realtime_server = "docs_realtime"
  channel = "rooms/{room_id}"
  deliver_to = "channel"
  input {
    text author
    text body
  }
  stack {
    var $sent_at { value = now }
  }
  response = {author: $input.author, body: $input.body, sent_at: $sent_at}
}
