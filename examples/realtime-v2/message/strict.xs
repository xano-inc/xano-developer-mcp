message strict {
  realtime_server = "docs_realtime"
  channel = "rooms/{room_id}"
  deliver_to = "sender"
  input {
    int count
  }
  stack {
  }
  response = {count: $input.count}
}
