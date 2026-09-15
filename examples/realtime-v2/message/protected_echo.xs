message protected_echo {
  realtime_server = "docs_realtime"
  channel = "rooms/{room_id}"
  auth = "user"
  deliver_to = "sender"
  input {
    text body
  }
  stack {
    realtime.get_session as $session
  }
  response = {body: $input.body, authenticated: $session.authenticated}
}
