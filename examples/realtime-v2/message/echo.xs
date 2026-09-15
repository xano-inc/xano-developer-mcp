message echo {
  realtime_server = "docs_realtime"
  channel = "rooms/{room_id}"
  deliver_to = "sender"
  input {
    text body
  }
  stack {
    realtime.get_session as $session
  }
  response = {body: $input.body, session: $session}
}
