channel "rooms/{room_id}" {
  realtime_server = "docs_realtime"
  access = {anonymous: true, presence: false}
  publish = {who: "anyone", direct: false}
  delivery = {guarantee: "at_most_once", per_recipient: false}
  input {
    int room_id
  }
}
