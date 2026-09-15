channel members {
  realtime_server = "docs_realtime"
  access = {anonymous: true, presence: false}
  publish = {who: "authenticated", direct: false}
  input {
  }
}
