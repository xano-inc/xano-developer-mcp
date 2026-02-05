---
applyTo: "apis/**/*.xs"
---

# Xanoscript API Query Examples

Below are some examples of API queries that can be made using Xanoscript.

## random_text_selector

## blog_posts_list

```xs
query "blog_posts" verb=GET {
  description = "Returns a paginated list of all blog posts with paging and sorting capabilities. Includes author information, comment counts, and like counts for each post."
  input {
    int page?=1 {
      description = "Page number for pagination"
    }

    int per_page?=10 {
      description = "Number of items per page (max 100)"
    }

    json sort? {
      description = "External sorting configuration array with orderBy and sortBy fields"
    }
  }

  stack {
    db.query blog_post {
      join = {
        user: {
          table: "user"
          where: $db.blog_post.author_id == $db.user.id
        }
      }

      sort = {blog_post.publication_date: "desc"}
      override_sort = $input.sort
      eval = {authorName: $db.user.name, status: $db.user.status}
      return = {
        type  : "list"
        paging: {
          page    : $input.page
          per_page: $input.per_page
          totals  : true
        }
      }

      addon = [
        {
          name : "blog_post_likes"
          input: {blog_post_id: $output.id}
          as   : "items.blog_post_likes"
        }
        {
          name : "blog_post_comments"
          input: {blog_post_id: $output.id}
          as   : "items.blog_post_comments"
        }
      ]
    } as $posts
  }

  response = $posts

  history = false
}
```

## review_by_product

```xs
query "reviews/by_product/{product_id}" verb=GET {
  description = "Retrieve all reviews for a given product with optional minimum rating, sorted by review_date descending, and paginated."
  input {
    int product_id {
      description = "ID of the product to filter reviews"
    }

    decimal min_rating? {
      description = "Optional minimum rating to filter reviews"
    }
  }

  stack {
    debug.log {
      value = "Requester IP: " ~ $env.$remote_ip
    }

    conditional {
      if ($input.min_rating != null) {
        db.query "product_reviews" {
          where = $db.product_reviews.product_id == $input.product_id && $db.product_reviews.rating >= $input.min_rating
          sort = {product_reviews.review_date: "desc"}
          return = {type: "list", paging: {page: 1, per_page: 25, totals: true}}
        } as $reviews
      }

      else {
        db.query "product_reviews" {
          where = $db.product_reviews.product_id == $input.product_id
          sort = {product_reviews.review_date: "desc"}
          return = {type: "list", paging: {page: 1, per_page: 25, totals: true}}
        } as $reviews
      }
    }
  }

  response = $reviews

  history = 100
}
```

## last_five_blog_posts

```xs
query "posts/recent" verb=GET {
  description = "Retrieve the 5 most recent published blog posts, sorted by publication_date in descending order."
  input {
  }

  stack {
    db.query "blog_post" {
      where = $db.blog_post.is_draft == false
      sort = {blog_post.publication_date: "desc"}
      return = {
        type  : "list"
        paging: {page: 1, per_page: 5, metadata: false}
      }
    } as $recent_posts
  }

  response = $recent_posts

  history = "inherit"
}
```

## booking_reservation_system

```xs
query "create_booking" verb=POST {
  description = "Create a new booking reservation with availability checking and conflict resolution"
  auth = "user"
  input {
    int resource_id filters=min:1 {
      description = "ID of the resource to book"
    }

    text title filters=trim|min:1 {
      description = "Title or purpose of the booking"
    }

    text description? filters=trim {
      description = "Detailed description of the booking purpose"
    }

    timestamp start_time {
      description = "When the booking should begin (ISO format)"
    }

    timestamp end_time {
      description = "When the booking should end (ISO format)"
    }

    int attendee_count?=1 filters=min:1 {
      description = "Number of people attending (default: 1)"
    }

    email contact_email {
      description = "Contact email for booking notifications"
    }

    text contact_phone? filters=trim {
      description = "Contact phone number"
    }

    text special_requests? filters=trim {
      description = "Any special requirements or requests"
    }

    bool send_confirmation?=1 {
      description = "Whether to send email confirmation (default: true)"
    }
  }

  stack {
    precondition ($input.start_time < $input.end_time) {
      description = "Validate booking time range is logical"
      error_type = "inputerror"
      error = "Start time must be before end time."
    }

    precondition ($input.start_time > now) {
      description = "Validate booking is not in the past"
      error_type = "inputerror"
      error = "Cannot create bookings in the past."
    }

    db.query "resources" {
      description = "Get the resource being booked"
      where = $db.resources.id == $input.resource_id && $db.resources.is_active
      return = {type: "list"}
    } as $resource_data

    precondition (($resource_data|count) > 0) {
      description = "Validate resource exists and is active"
      error_type = "inputerror"
      error = "Resource not found or is not available for booking."
    }

    var $resource {
      description = "Store the resource record"
      value = $resource_data|first
    }

    precondition ($input.attendee_count <= $resource.capacity) {
      description = "Validate attendee count does not exceed resource capacity"
      error_type = "inputerror"
      error = "Attendee count (" ~ $input.attendee_count ~ ") exceeds resource capacity (" ~ $resource.capacity ~ ")."
    }

    db.query "bookings" {
      description = "Get all existing bookings for this resource to check conflicts"
      where = $db.bookings.resource_id == $input.resource_id
      return = {type: "list"}
    } as $all_bookings

    var $existing_bookings {
      description = "Filter bookings to only confirmed or pending ones"
      value = $all_bookings|filter:($this.status == "confirmed" || $this.status == "pending")
    }

    var $conflicts {
      description = "Find conflicting bookings that overlap with requested time"
      value = $existing_bookings|filter:(($this.start_time < $input.end_time) && ($this.end_time > $input.start_time))
    }

    precondition (($conflicts|count) == 0) {
      description = "Validate no time conflicts exist"
      error_type = "inputerror"
      error = "Time slot conflicts with existing booking. Please choose a different time."
    }

    var $booking_duration {
      description = "Calculate booking duration in hours"
      value = ($input.end_time - $input.start_time) / 3600
    }

    var $total_cost {
      description = "Calculate total cost based on hourly rate and duration"
      value = $booking_duration * $resource.hourly_rate
    }

    var $booking_reference {
      description = "Generate unique booking reference code"
      value = "BK-" ~ $input.resource_id ~ "-" ~ (now|to_timestamp) ~ "-" ~ ($auth.id|to_text)
    }

    var $initial_status {
      description = "Set initial status based on whether resource requires approval"
      value = ($resource.requires_approval == true) ? "pending" : "confirmed"
    }

    db.add bookings {
      description = "Create the new booking record"
      data = {
        resource_id      : $input.resource_id
        user_id          : $auth.id
        title            : $input.title
        description      : $input.description
        start_time       : $input.start_time
        end_time         : $input.end_time
        attendee_count   : $input.attendee_count
        contact_email    : $input.contact_email
        contact_phone    : $input.contact_phone
        status           : $initial_status
        total_cost       : $total_cost
        special_requests : $input.special_requests
        booking_reference: $booking_reference
        created_at       : now
        updated_at       : now
      }
    } as $new_booking

    conditional {
      description = "Send confirmation email if requested"
      if ($input.send_confirmation) {
        var $email_subject {
          description = "Create email subject line"
          value = "Booking Confirmation - " ~ $resource.name ~ " (" ~ $booking_reference ~ ")"
        }

        util.template_engine {
          description = "Create email body using template"
          value = """
            Dear Customer,

            Your booking has been {{ initial_status == 'confirmed' ? 'confirmed' : 'submitted for approval' }}.

            Booking Details:
            - Resource: {{ resource.name }}
            - Date/Time: {{ input.start_time }} - {{ input.end_time }}
            - Duration: {{ booking_duration }} hours
            - Attendees: {{ input.attendee_count }}
            - Total Cost: ${{ total_cost }}
            - Reference: {{ booking_reference }}

            Thank you for your booking!
            """
        } as $email_body

        util.send_email {
          description = "Send booking confirmation email to user"
          service_provider = "resend"
          api_key = $env.secret_key
          from = "no-reply@example.com"
          to = $input.contact_email
          subject = $email_subject
          message = $email_body
        } as $confirmation_email
      }
    }

    var $booking_result {
      description = "Prepare booking result summary"
      value = {
        booking_id: $new_booking.id
        booking_reference: $booking_reference
        resource_name: $resource.name
        status: $initial_status
        start_time: $input.start_time
        end_time: $input.end_time
        duration_hours: $booking_duration
        total_cost: $total_cost
        requires_approval: $resource.requires_approval
        confirmation_sent: $input.send_confirmation
      }
    }

    debug.log {
      description = "Log successful booking creation"
      value = {
        action: "booking_created_successfully"
        booking_id: $new_booking.id
        booking_reference: $booking_reference
        status: $initial_status
        total_cost: $total_cost
      }
    }
  }

  response = $booking_result

  history = "all"
}
```

## audio_transcription_endpoint

```xs
query "transcribe/audio" verb=POST {
  auth = "user"
  description = "Upload an audio file to be transcribed using ElevenLabs API, store the file in cloud storage, and save transcription in the database."

  input {
    file audio {
      description = "Audio file to be transcribed"
    }

    text ?language {
      description = "Target language for transcription (optional, auto-detect if not provided)"
    }

    text access_level?=private filters=trim {
      description = "Access level for the audio file (public or private)"
    }
  }

  stack {
    try_catch {
      try {
        conditional {
          if ($input.access_level == "public") {
            storage.create_attachment {
              value = $input.audio
              access = "public"
              filename = $filename
              description = "Store audio in cloud storage as public"
            } as $audio_storage
          }

          else {
            return {
              value = "This function is built for public files. Please set access_level to public"
            }
          }
        }
      }

      catch {
        throw {
          name = "Audio file issue"
          value = ""
        }
      }
    }

    group {
      description = "Handle audio upload and transcription process"
      stack {
        db.get "user" {
          field_name = "id"
          field_value = $auth.id
          description = "Verify user exists"
        } as $user

        conditional {
          if ($user == "") {
            throw {
              name = "inputerror"
              value = "Invalid user ID provided."
            }
          }
        }

        var $allowed_audio_types {
          value = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/m4a", "audio/aac", "audio/ogg", "audio/flac"]
          description = "List of allowed audio MIME types"
        }

        var $file_mime {
          value = $audio_storage.mime
          description = "MIME type of uploaded audio file"
        }

        var $file_size {
          value = $audio_storage.size
          description = "Size of uploaded audio file in bytes"
        }

        var $filename {
          value = $audio_storage.name
          description = "Original filename"
        }

        conditional {
          if ($allowed_audio_types|contains:$file_mime) {
            throw {
              name = "inputerror"
              value = "Invalid file type. Only audio files (MP3, WAV, M4A, AAC, OGG, FLAC) are allowed."
            }
          }
        }

        conditional {
          if ($file_size > 26214400) {
            throw {
              name = "inputerror"
              value = "File size too large. Maximum size is 25MB."
            }
          }
        }

        var $transcription_params {
          value = {}
          description = "Parameters for transcription request"
        }

        conditional {
          if ($input.language != "") {
            var.update $transcription_params {
              value = $transcription_params|set:"language":$input.language
            }
          }
        }

        api.request {
          url = "https://api.elevenlabs.io/v1/speech-to-text"
          method = "POST"
          params = {}|set:"file":$input.audio|set:"model_id":"scribe_v1"
          headers = []|push:"xi-api-key: " ~ $env.elevenlabs_audio_key
          timeout = 120
          verify_host = false
          verify_peer = false
          description = "Send audio to ElevenLabs for transcription"
        } as $transcription_response

        var $transcript_text {
          value = $transcription_response.response.result.text
          description = "Extracted transcript text"
        }

        var $detected_language {
          value = $transcription_response.response.result.language_code
          description = "Language detected by ElevenLabs"
        }

        var $confidence {
          value = $transcription_response.response.result.language_probability
          description = "Transcription language confidence score"
        }

        db.add audio_file {
          data = {
            created_at   : "now"
            user         : $auth.id
            filename     : $filename
            file_type    : $file_mime
            file_size    : $file_size
            transcription: $transcript_text
            status       : "completed"
            metadata     : $audio_storage
            audio_file   : $audio_storage
          }
        } as $audio_file

        var $result {
          value = {
            event: "audio_transcription_success",
            audio_id: $audio_file.id,
            user_id: $auth.id,
            filename: $filename,
            transcript_length: ($transcript_text|strlen)
          }
        }

        debug.log {
          value = {
            event: "audio_transcription_success",
            audio_id: $audio_file.id,
            user_id: $auth.id,
            filename: $filename,
            transcript_length: ($transcript_text|strlen)
          }

          description = "Log successful transcription"
        }
      }
    }
  }

  response = $result

  history = false
}
```

## upload_image_endpoint

```xs
query "upload/image" verb=POST {
  auth = "user"
  input {
    file? image
    text access_level?=public filters=trim {
      description = "Access level for the image (public or private)"
    }
  }

  stack {
    try_catch {
      try {
        conditional {
          if ($input.access_level == "private") {
            storage.create_image {
              description = "Store image in cloud storage as private"
              value = $input.image
              access = "private"
              filename = $filename
            } as $image_storage
          }

          else {
            storage.create_image {
              description = "Store image in cloud storage as public"
              value = $input.image
              access = "public"
              filename = $filename
            } as $image_storage
          }
        }
      }

      catch {
        throw {
          name = "Invalid image"
          value = $error.message
        }
      }
    }

    !debug.stop {
      value = $image_storage
    }

    try_catch {
      try {
        var $allowed_types {
          description = "List of allowed image MIME types"
          value = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
        }

        var $file_mime {
          description = "MIME type of uploaded file"
          value = $image_storage.mime
        }

        var $file_size {
          description = "Size of uploaded file in bytes"
          value = $image_storage.size
        }

        var $filename {
          description = "Original filename"
          value = $image_storage.name
        }

        conditional {
          if ($allowed_types|contains:$file_mime) {
            throw {
              name = "ValidationError"
              value = "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."
            }
          }
        }

        conditional {
          if ($file_size > 10485760) {
            throw {
              name = "ValidationError"
              value = "File size too large. Maximum size is 10MB."
            }
          }
        }

        db.get "user" {
          description = "Verify user exists"
          field_name = "id"
          field_value = $auth.id
        } as $user

        conditional {
          if ($user == "") {
            throw {
              name = "ValidationError"
              value = "Invalid user ID provided."
            }
          }
        }

        db.add images {
          description = "Save image metadata to database"
          data = {
            created_at  : "now"
            user_id     : $auth.id
            filename    : $filename
            file_type   : $file_mime
            file_size   : $file_size
            image_url   : $image_storage.path
            access_level: $input.access_level
            is_active   : true
            image_meta  : $image_storage
          }
        } as $image_record
      }

      catch {
        debug.log {
          description = "Log upload failure"
          value = "Image upload failed:"|concat:$error.message:" "
        }
      }
    }
  }

  response = {
    success  : true
    image_id : $image_record.id
    image_url: $image_storage.path
  }

  history = "inherit"
}
```

## retrieve_active_user_profile

````xs
// API endpoint to retrieve active user profile details based on user_id
query "user_profile/{user_id}" verb=GET {
  api_group = "profiles"

  input {
    // Unique identifier for the user
    int user_id
  }

  stack {
    // Retrieve active user profile details
    db.query user {
      where = $db.user.id == $input.user_id && $db.user.is_active
      return = {type: "single"}
      mock = {
        "should return null for inactive": null
        "should return active profile"   : ```
          {
              "id": 7,
              "user": 42,
              "full_name": "Jane Doe",
              "email": "jane@example.com",
              "is_active": true
          }
          ```
      }
    } as $profile
  }

  response = $profile
  history = 10000

  test "should return null for inactive" {
    input = {user_id: 99}

    expect.to_be_null ($response)
  }

  test "should return active profile" {
    input = {user_id: 42}

    expect.to_equal ($response) {
      value = {
        id       : 7
        user     : 42
        full_name: "Jane Doe"
        email    : "jane@example.com"
        is_active: true
      }
    }
  }
}
````

## blog_posts_by_user

```xs
query "blog_posts_by_user/{user_id}" verb=GET {
  description = "list all post by a given user and the number of comments and likes it received"
  auth = "user"
  input {
    int user_id
  }

  stack {
    db.query blog_post {
      where = $db.blog_post.author_id == $input.user_id
      sort = {blog_post.publication_date: "desc"}
      return = {type: "list", paging: {page: 1, per_page: 25, totals: true}}
      addon = [
        {
          name : "blog_post_likes"
          input: {blog_post_id: $output.id}
          as   : "items.blog_post_likes"
        }
        {
          name : "blog_post_comments"
          input: {blog_post_id: $output.id}
          as   : "items.blog_post_comments"
        }
      ]
    } as $posts
  }

  response = $posts

  history = "inherit"
}
```

## notification_system_endpoint

```xs
query "send_notification" verb=POST {
  description = "Sends notifications to users via multiple channels (push, email, SMS). It validates input, checks user notification preferences, routes to appropriate external services, tracks delivery status, and logs all notification attempts with their outcomes."
  input {
    int user_id
    text notification_type {
      description = "Type of notification: push, email, sms"
    }

    text title filters=trim {
      description = "Notification title"
    }

    text message filters=trim {
      description = "Notification message content"
    }

    json data {
      description = "Additional notification data"
    }

    bool force? {
      description = "Force send even if user has disabled this notification type"
    }
  }

  stack {
    debug.log {
      description = "Log notification attempt start"
      value = "Starting notification send for user " ~ $input.user_id
    }

    precondition ($input.notification_type == "push" || $input.notification_type == "email" || $input.notification_type == "sms") {
      description = "Validate that notification type is one of the three supported types"
      error_type = "inputerror"
      error = "Invalid notification type. Must be: push, email, or sms"
    }

    precondition (($input.title|strlen) > 0) {
      description = "Ensure the notification title is not empty"
      error_type = "inputerror"
      error = "Notification title is required"
    }

    db.query "notification_preference" {
      description = "Check user notification preferences"
      where = $db.notification_preference.user_id == $input.user_id && $db.notification_preference.notification_type == $input.notification_type
      return = {type: "list"}
    } as $user_preferences

    conditional {
      description = "If no preferences exist, create default preferences with notifications enabled. Otherwise, get the user's enabled status from existing preferences"
      if (($user_preferences|count) == 0) {
        db.add notification_preference {
          description = "Create default notification preference"
          data = {
            user_id          : $input.user_id
            notification_type: $input.notification_type
            enabled          : true
            preferences      : "{}"
          }
        } as $new_preference

        var $user_enabled {
          value = true
        }
      }

      elseif ($input.notification_type == "asdfasdf") {
      }

      else {
        var $user_enabled {
          value = ($user_preferences|first).enabled
        }
      }
    }

    conditional {
      description = "Set up different API calls based on notification type"
      if ($input.notification_type == "push") {
        api.request {
          description = "Sample API call"
          url = "https://mandrillapp.com/api/1.0/messages/send"
          method = "POST"
          params = {}|set:"key":$env.your_api_key|set:"message":({}|set:"from_email":"you@yourdomain.com"|set:"from_name":"Your Name"|set:"subject":"Test Transactional Email"|set:"text":"Hello, this is a transactional email!"|set:"to":([]|push:({}|set:"email":"recipient@example.com"|set:"name":"Recipient Name"|set:"type":"to")))
          headers = []|push:"Content-Type: application/json"
        } as $api_endpoint
      }

      elseif ($input.notification_type == "email") {
        api.request {
          description = "Sample API call"
          url = "https://mandrillapp.com/api/1.0/messages/send"
          method = "POST"
          params = {}|set:"key":$env.your_api_key|set:"message":({}|set:"from_email":"you@yourdomain.com"|set:"from_name":"Your Name"|set:"subject":"Test Transactional Email"|set:"text":"Hello, this is a transactional email!"|set:"to":([]|push:({}|set:"email":"recipient@example.com"|set:"name":"Recipient Name"|set:"type":"to")))
          headers = []|push:"Content-Type: application/json"
        } as $api_endpoint
      }

      elseif ($input.notification_type == "sms") {
        api.request {
          description = "Sample API call"
          url = "https://api.twilio.com/2010-04-01/Accounts/ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/Messages"
          method = "POST"
          params = {}|set:"To":" 1234567890"|set:"From":" 1987654321"|set:"Body":"Hello from Twilio!"
          headers = []|push:("Authorization: Basic %s"|sprintf:("ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX:your_auth_token"|base64_encode))
        } as $api_endpoint
      }
    }

    conditional {
      description = "Skip user if not enabled AND force send is false"
      if ($user_enabled == false && $input.force == false) {
        var $status_result {
          value = "skipped"
        }

        var $external_ref {
          value = ""
        }

        debug.log {
          value = "Skipped user"
        }
      }
    }

    conditional {
      description = "Process the API response and set status"
      if ($api_response.status_code >= 200 && $api_response.status_code < 300) {
        var $status_result {
          value = "sent"
        }

        var $external_ref {
          value = $api_response.body.id
        }
      }

      elseif ($status_result == "skipped") {
        debug.log {
          value = "Status already set above, do nothing"
        }
      }

      else {
        var $status_result {
          value = "failed"
        }

        var $external_ref {
          value = ""
        }
      }
    }

    db.add notification_log {
      description = "Log the notification attempt to the database"
      data = {
        created_at       : "now"
        user_id          : $input.user_id
        notification_type: $input.notification_type
        title            : $input.title
        message          : $input.message
        response_data    : $api_endpoint
      }
    } as $notification_log
  }

  response = null

  history = 1000
}
```

## products_search_endpoint

Searches products with optional filters and pagination. Notice how the `category_id` filter is optional and the search term will be ignored if not provided (thanks to the operator `==?`).

```xs
query "products/search" verb=GET {
  input {
    text search_term? filters=trim {
      description = "Search term to match against product name and description"
    }

    int category_id? filters=min:0 {
      description = "Optional category ID to filter products"
    }

    int page?=1 filters=min:1 {
      description = "Page number for pagination (starts at 1)"
    }

    int per_page?=20 filters=min:1|max:100 {
      description = "Number of items per page (max 100)"
    }
  }

  stack {
    db.query "product" {
      description = "Search products with filters and pagination"
      where = $db.product.category_id ==? $input.category_id && ($db.product.name includes? $input.search_term || $db.product.description includes? $input.search_term)
      sort = {product.price: "asc"}
      return = {type: "list"}
    } as $products
  }

  response = $products

  history = "inherit"
}
```

## signup_endpoint

```xs
query "auth/signup" verb=POST {
  description = "Signup and retrieve an authentication token"
  input {
    text name? {
      description = "User's name (optional)"
    }

    email email? {
      description = "User's email address (required for signup)"
      sensitive = true
    }

    text password? {
      description = "User's password (required for signup)"
      sensitive = true
    }
  }

  stack {
    db.get "user" {
      description = "Check if a user with this email already exists"
      field_name = "email"
      field_value = $input.email
    } as $user

    precondition ($user == null) {
      description = "Prevent duplicate signup with the same email"
      error_type = "accessdenied"
      error = "This account is already in use."
    }

    db.add user {
      description = "Create a new user record with provided details"
      data = {
        created_at: "now"
        name      : $input.name
        email     : $input.email
        password  : $input.password
      }
    } as $user

    security.create_auth_token {
      description = "Generate an authentication token for the new user"
      table = "user"
      extras = {}
      expiration = 86400
      id = $user.id
    } as $authToken
  }

  response = {authToken: $authToken}

  history = 1000
}
```

## search_users_endpoint

```xs
query "users" verb=GET {
  auth = "user"
  input {
    text filter
  }

  stack {
    db.query "user" {
      description = "Search users"
      where = $db.user.name includes $input.filter
      sort = {user.name: "asc"}
      return = {type: "list"}
    } as $users
  }

  response = $users

  history = "inherit"
}
```

```xs
query "webhook_receiver" verb=POST {
  input {
    text webhook_id
    text signature?
  }

  stack {
    util.get_input {
      encoding = "json"
    } as $payload_data

    conditional {
      if ($payload_data.body.event_type == "user.created") {
        db.add webhook_logs {
          data = {
            webhook_id  : $input.webhook_id
            event_type  : "user.created"
            status      : "processed"
            payload     : $payload_data
            signature   : $input.signature
            user_id     : $payload_data.body.user.id
            received_at : now
            processed_at: now
            retry_count : 0
            max_retries : 3
          }
        } as $webhook_record
      }

      elseif ($payload_data.body.event_type == "payment.completed") {
        db.add webhook_logs {
          data = {
            webhook_id  : $input.webhook_id
            event_type  : "payment.completed"
            status      : "processed"
            payload     : $payload_data
            signature   : $input.signature
            payment_id  : $payload_data.payment.id
            amount      : $payload_data.payment.amount
            received_at : now
            processed_at: now
            retry_count : 0
            max_retries : 3
          }
        } as $webhook_record
      }

      else {
        db.add webhook_logs {
          data = {
            webhook_id  : $input.webhook_id
            event_type  : $payload_data.event_type
            status      : "processed"
            payload     : $payload_data
            signature   : $input.signature
            received_at : now
            processed_at: now
            retry_count : 0
            max_retries : 3
          }
        } as $webhook_record
      }
    }
  }

  response = {
    webhook_processed: true
    message          : "Webhook processed successfully"
    webhook_id       : $input.webhook_id
    event_type       : $payload_data.body.event_type
  }

  history = 100
}
```

```
query "list_orders" verb=GET {
  description = "Display all the order in a html table view"
  input {
    int year?=2025
  }

  stack {
    var $start_of_year {
      description = "Start of the year for filtering"
      value = $input.year ~ "-01-01T00:00:00.000-08:00"
    }

    var $end_of_year {
      description = "End of the year for filtering (exclusive)"
      value = ($input.year + 1) ~ "-01-01T00:00:00.000-08:00"
    }

    db.query orders {
      where = $db.orders.order_date >= $start_of_year && $db.orders.order_date < $end_of_year
      return = {type: "list"}
      addon = [
        {
          name : "customer"
          input: {customer_id: $output.customer_id}
          as   : "_customer"
        }
      ]
    } as $orders

    util.template_engine {
      description = "Initialize HTML output with table structure"
      value = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order List</title>
            <!-- Bootstrap CSS CDN -->
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
        </head>
        <body>
            <div class="container mt-5">
                <h1 class="mb-4">Customer Orders</h1>

                {% if $var.orders is defined and $var.orders|length > 0 %}
                <table class="table table-striped table-bordered table-hover">
                    <thead class="table-dark">
                        <tr>
                            <th scope="col">Order ID</th>
                            <th scope="col">Customer Address</th>
                            <th scope="col">Product Name</th>
                            <th scope="col">Price</th>
                            <th scope="col">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {% for order in $var.orders %}
                        <tr>
                            <td>{{ order.id }}</td>
                            <td>{{ order._customer.street_address }}{% if order._customer.city %}, {{ order._customer.city }}{% endif %}{% if order._customer.zip_code %}, {{ order._customer.zip_code }}{% endif %}</td>
                            <td>{{ order.product_name }}</td>
                            <td>${{ order.order_total|number_format(2) }}</td>
                            <td><span class="badge bg-{% if order.status == 'completed' %}success{% elseif order.status == 'pending' %}warning{% else %}danger{% endif %}">{{ order.status|capitalize }}</span></td>

                        </tr>
                        {% endfor %}
                    </tbody>
                </table>
                {% else %}
                <div class="alert alert-info" role="alert">
                    No orders found.
                </div>
                {% endif %}

            </div>

            <!-- Bootstrap JS and Popper.js CDN (optional, for interactive components) -->
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL" crossorigin="anonymous"></script>
        </body>
        </html>
        """
    } as $html_output

    util.set_header {
      value = "Content-Type: text/html; charset=utf-8"
      duplicates = "replace"
    }
  }

  response = $html_output

  history = "inherit"
}
```
