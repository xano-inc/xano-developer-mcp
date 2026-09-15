channel_trigger member_gate {
  realtime_server = "docs_realtime"
  channel = "members"

  input {
    enum action {
      values = ["join", "leave", "deliver"]
    }
  
    text channel
    json payload
    object client {
      schema {
        json extras
        object permissions {
          schema {
            int dbo_id
            text row_id
          }
        }
      }
    }
  }

  stack {
    realtime.get_session as $session
  }

  response = {
    allowed: $session.authenticated
    reason : "Sign in to join members"
  }

  actions = {join: true}
}
