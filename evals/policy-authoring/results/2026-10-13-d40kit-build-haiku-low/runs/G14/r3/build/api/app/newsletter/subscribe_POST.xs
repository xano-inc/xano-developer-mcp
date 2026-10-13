// Newsletter sign-up form on the marketing site. Public by design.
query "newsletter/subscribe" verb=POST {
  api_group = "app"

  input {
    email email filters=trim|lower
    text source?
  }

  stack {
    db.add newsletter_subscribers {
      data = {
        email    : $input.email
        source   : $input.source
        confirmed: false
      }
    } as $subscriber

    function.run record_audit_event {
      input = {
        table_name: "newsletter_subscribers"
        record_id : $subscriber.id
        action    : "create"
        actor_id  : null
      }
    } as $audit
  }

  response = {ok: true}
  tags = ["public"]
  guid = "6Ojxa281C1iVv3G0P4gYJqaanNQ"
}