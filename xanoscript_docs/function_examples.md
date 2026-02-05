---
applyTo: "functions/**/*.xs"
---

# Xanoscript Function Examples

Below are some examples of custom functions defined in Xanoscript.

Function can be called using

```xs
function.run "add_numbers" {
  input = { a: 5, b: $input.b }
} as $return_value
```

## youtube_url_analyzer_utility

```xs
function "utilities/youtube_url_parser" {
  description = "This utility function parses various YouTube URL formats (including short, mobile, and embed links) to extract the video ID. It then uses the ID to generate a list of corresponding thumbnail URLs in multiple quality options, all while providing robust input validation."
  input {
    text youtube_url? filters=trim
  }

  stack {
    var $youtube_id {
      value = ("/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/"|regex_get_all_matches:$input.youtube_url)[5]|first
    }

    precondition (($youtube_id|strlen) > 5) {
      error = "No valid ID found"
    }

    var $default_thumbnail {
      description = "Default quality thumbnail URL"
      value = "https://img.youtube.com/vi/" ~ $youtube_id ~ "/default.jpg"
    }

    var $medium_thumbnail {
      description = "Medium quality thumbnail URL"
      value = "https://img.youtube.com/vi/" ~ $youtube_id ~ "/mqdefault.jpg"
    }

    var $high_thumbnail {
      description = "High quality thumbnail URL"
      value = "https://img.youtube.com/vi/" ~ $youtube_id ~ "/hqdefault.jpg"
    }

    var $standard_thumbnail {
      description = "Standard quality thumbnail URL"
      value = "https://img.youtube.com/vi/" ~ $youtube_id ~ "/sddefault.jpg"
    }

    var $maxres_thumbnail {
      description = "Maximum resolution thumbnail URL"
      value = "https://img.youtube.com/vi/" ~ $youtube_id ~ "/maxresdefault.jpg"
    }

    var $thumbnail_urls {
      description = "Object containing different quality thumbnail URLs"
      value = {
        default: $default_thumbnail
        medium: $medium_thumbnail
        high: $high_thumbnail
        standard: $standard_thumbnail
        maxres: $maxres_thumbnail
      }
    }
  }

  response = {
    youtube_id: $youtube_id,
    thumbnail_urls: $thumbnail_urls
  }
}
```

## get_linear_labels_paginated

```xs
function "Linear/GetLabelsPaginated" {
  input {
  }

  stack {
    group {
      description = "Declare Initial Variables"
      stack {
        var $labels {
          description = "Empty array to collect the labels with each loop"
          value = []
        }

        var $has_next_page {
          description = "Start with a true value for the initial loop"
          value = true
        }

        var $cursor {
          description = "The cursor will be provided by the first API call"
          value = null
        }
      }
    }

    while ($has_next_page) {
      each {
        api.request {
          description = "Get Labels from Linear"
          url = "https://api.linear.app/graphql"
          method = "POST"
          params = {}|set:"query":"""
            query ($per_page: Int, $after: String) {
              issueLabels(first:$per_page, after:$after) {
                pageInfo {
                    hasNextPage
                    endCursor
                }
                nodes {
                  id
                  name
                  parent {
                    id
                    name
                  }
                  team {
                    name
                    id
                  }
                }
              }
            }
            """|set:"variables":({}|set:"per_page":50|set:"after":$cursor)

          headers = []|push:"Content-Type: application/json"|push:"Authorization: " ~ $env.linear_key
        } as $api_labels

        var $has_next_page {
          description = "Check the pagination to see if there's another page"
          value = $api_labels|get:"data.issueLabels.pageInfo.hasNextPage":null
        }

        var $cursor {
          description = "Get the current page cursor and store it for the next loop"
          value = $api_labels|get:"data.issueLabels.pageInfo.endCursor":null
        }

        array.merge $labels {
          description = "Merge the labels from this loop into the main Labels array"
          value = $api_labels|get:"data.issueLabels.nodes":null
        }
      }
    }
  }

  response = $labels
}
```

## phone_number_formatter

```xs
function "utilities/phone_number_formatter" {
  description = "Format phone numbers into standardized US format with basic validation"
  input {
    text phone_number filters=min:10|max:10|digitOk {
      description = "Raw phone number string (10 digits only for this version)"
    }

    enum? format_type?=standard {
      values = ["standard", "dotted", "spaced"]
      description = "Format type: 'standard', 'dotted', 'spaced'. Defaults to 'standard'"
    }
  }

  stack {
    var $area_code {
      description = "Extract area code (first 3 digits)"
      value = $input.phone_number|substr:0:3
    }

    var $exchange {
      description = "Extract exchange code (next 3 digits)"
      value = $input.phone_number|substr:3:3
    }

    var $number {
      description = "Extract last 4 digits"
      value = $input.phone_number|substr:6:4
    }

    var $formatted_phone {
      description = "Initialize formatted phone variable"
      value = ""
    }

    switch ($input.format_type) {
      case ("dotted") {
        var.update $formatted_phone {
          description = "Format as 123.456.7890"
          value = $area_code ~ "." ~ $exchange ~ "." ~ $number
        }
      } break

      case ("spaced") {
        var.update $formatted_phone {
          description = "Format as 123 456 7890"
          value = $area_code ~ " " ~ $exchange ~ " " ~ $number
        }
      } break

      default {
        var.update $formatted_phone {
          description = "Format as (123) 456-7890"
          value = "(" ~ $area_code ~ ") " ~ $exchange ~ "-" ~ $number
        }
      }
    }
  }

  response = {
    formatted_phone: $formatted_phone
    original_input : $input.phone_number
    format_type    : $input.format_type
    area_code      : $area_code
    exchange       : $exchange
    number         : $number
  }
}
```

## weighted_average_function

```xs
function "maths/weighted_average" {
  description = "Calculates the weighted average of values in an array"
  input {
    decimal[] values {
      description = "Array of numbers representing the values to be averaged"
    }

    decimal[] weights {
      description = "Array of numbers representing the weights for each value"
    }
  }

  stack {
    var $values_length {
      description = "Get the length of the values array"
      value = $input.values|count
    }

    var $weights_length {
      description = "Get the length of the weights array"
      value = $input.weights|count
    }

    precondition ($values_length == $weights_length) {
      error_type = "inputerror"
      payload = "Values and weights arrays must have the same length"
    }

    var $has_negative_weights {
      description = "Check if any weights are negative"
      value = $input.weights|some:$$ < 0
    }

    precondition ($has_negative_weights == false) {
      error_type = "inputerror"
      payload = "All weights must be non-negative"
    }

    var $weighted_sum {
      description = "Initialize the weighted sum"
      value = 0
    }

    var $total_weight {
      description = "Initialize the total weight"
      value = 0
    }

    var $size {
      description = "Size of the arrays for iteration"
      value = $values_length
    }

    for ($size) {
      each as $index {
        var $current_value {
          description = "Get the value at the current index"
          value = $input.values[$index]
        }

        var $current_weight {
          description = "Get the weight at the current index"
          value = $input.weights[$index]
        }

        math.add $weighted_sum {
          description = "Add the weighted value to the sum"
          value = $current_value * $current_weight
        }

        math.add $total_weight {
          description = "Add the current weight to the total"
          value = $current_weight
        }
      }
    }

    precondition ($total_weight > 0) {
      error_type = "inputerror"
      payload = "Total weight cannot be zero"
    }

    var $weighted_average {
      description = "Calculate the weighted average"
      value = $weighted_sum / $total_weight
    }
  }

  response = $weighted_average
}
```

## url_parser_utility

```xs
function "utilities/url_parser_utility" {
  description = "Parse and validate URLs, extracting protocol, domain, path, and basic components"
  input {
    text url filters=trim|min:1 {
      description = "The URL to parse and validate"
    }
  }

  stack {
    var $url_lower {
      description = "Convert to lowercase for consistent processing"
      value = $input.url|to_lower
    }

    var $protocol {
      description = "Default protocol"
      value = "http"
    }

    var $domain {
      description = "Extract domain from URL"
      value = ""
    }

    var $path {
      description = "Extract path from URL"
      value = ""
    }

    var $is_valid {
      description = "URL validation result"
      value = false
    }

    var $validation_errors {
      description = "List of validation errors"
      value = []
    }

    conditional {
      description = "Check if URL contains protocol"
      if ($url_lower|contains:"://") {
        var $url_parts {
          description = "Split URL by protocol separator"
          value = $url_lower|split:"://"
        }

        var.update $protocol {
          description = "Extract protocol"
          value = $url_parts[0]
        }

        var $remaining_url {
          description = "Get URL without protocol"
          value = $url_parts[1]
        }

        conditional {
          description = "Check if URL contains path"
          if ($remaining_url|contains:"/") {
            var $path_parts {
              description = "Split by first slash"
              value = $remaining_url|split:"/"
            }

            var.update $domain {
              description = "Extract domain"
              value = $path_parts[0]
            }

            var.update $path {
              description = "Extract path"
              value = "/" ~ ($path_parts|slice:1:($path_parts|count)|join:"/")
            }
          }

          else {
            var.update $domain {
              description = "No path, entire remaining is domain"
              value = $remaining_url
            }
          }
        }
      }

      else {
        var.update $domain {
          description = "Use entire URL as domain"
          value = $url_lower
        }
      }
    }

    conditional {
      description = "Validate protocol"
      if ($protocol != "") {
        var $valid_protocols {
          description = "List of valid protocols"
          value = ["http", "https", "ftp", "sftp", "ws", "wss"]
        }

        conditional {
          description = "Check if protocol is valid"
          if ($valid_protocols|in:$protocol) {
            var $protocol_valid {
              description = "Protocol is valid"
              value = true
            }
          }

          else {
            var $protocol_valid {
              description = "Protocol is not valid"
              value = false
            }
          }
        }

        conditional {
          description = "Add protocol error if invalid"
          if ($protocol_valid == false) {
            var.update $validation_errors {
              description = "Add protocol error to validation errors"
              value = $validation_errors|append:"Invalid protocol: " ~ $protocol
            }
          }
        }
      }
    }

    conditional {
      description = "Validate domain"
      if ($domain != "") {
        var $domain_pattern {
          description = "Domain validation pattern"
          value = "/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/"
        }

        conditional {
          description = "Check if domain matches pattern"
          if (($domain_pattern|regex_matches:$domain) == false) {
            var.update $validation_errors {
              description = "Add domain error to validation errors"
              value = $validation_errors|append:"Invalid domain format: " ~ $domain
            }
          }
        }
      }
    }

    var.update $is_valid {
      description = "Set validation result based on error count"
      value = ($validation_errors|count) == 0
    }
  }

  response = {
    url              : $input.url
    is_valid         : $is_valid
    protocol         : $protocol
    domain           : $domain
    path             : $path
    validation_errors: $validation_errors
    base_url         : $protocol ~ "://" ~ $domain
    full_url         : $protocol ~ "://" ~ $domain ~ $path
  }
}
```

## random_text_selector

```xs
function "utilities/random_text_selector" {
  description = "Select a random text value from an array with optional exclusion of previously used index"
  input {
    json text_array {
      description = "Array of text values to choose from"
    }

    int? last_used_index? {
      description = "Optional index of previously used value to exclude from selection"
    }
  }

  stack {
    var $text_array {
      description = "Convert input to safe array"
      value = $input.text_array|safe_array
    }

    precondition (($text_array|count) > 0) {
      error_type = "inputerror"
      error = "Text array cannot be empty"
    }

    var $available_options {
      description = "Start with full array"
      value = $text_array
    }

    conditional {
      description = "Filter out last used index if provided"
      if ($input.last_used_index !== null) {
        var.update $available_options {
          description = "Remove last used index from options"
          value = $text_array|filter:"return $index != " ~ $input.last_used_index ~ ";"
        }
      }
    }

    var $selected_text {
      description = "Get random text from available options"
      value = $available_options|shuffle|first
    }
  }

  response = {
    selected_text    : $selected_text
    total_options    : $available_options|count
    available_options: $available_options
  }
}
```

## process_csv_import

```xs
function "csv_import/process_customers" {
  description = "Processes a CSV file to import customer data. Creates user records for email/name data and customer records with address information. Handles duplicate detection and provides import statistics."
  input {
    file csv_file {
      description = "The CSV file containing customer data."
    }
  }

  stack {
    var $successful_imports {
      value = 0
      description = "Counter for successfully imported records."
    }

    var $failed_imports {
      value = 0
      description = "Counter for failed imports."
    }

    var $total_processed {
      value = 0
      description = "Total number of records processed."
    }

    debug.log {
      value = "CSV import process started."
      description = "Log the start of the import process."
    }

    stream.from_csv {
      value = $input.csv_file
      separator = ","
      enclosure = '"'
      escape_char = '"'
      description = "CSV File Data"
    } as $csv_data

    foreach ($csv_data) {
      each as $row {
        var.update $total_processed {
          value = $total_processed + 1
          description = "Increment total processed records."
        }

        var $email {
          value = ($row|get:"email":null)|trim|lower
          description = "Extract and normalize email from the current row."
        }

        try_catch {
          description = "Process customer record with error handling."
          try {
            var $full_name {
              value = (($row|get:"first_name":null)|trim) ~ " " ~ (($row|get:"last_name":null)|trim)
              description = "Combine first and last name for user record."
            }

            group {
              description = "Check for existing user and customer records. Add new record if they do not exist."
              stack {
                db.get "user" {
                  field_name = "email"
                  field_value = $email
                  description = "Check if user already exists by email."
                } as $user

                conditional {
                  description = "Create user if they don't already exist."
                  if ($user == null) {
                    db.add user {
                      data = {
                        created_at: "now"
                        name      : $full_name
                        email     : $email
                        is_active : true
                      }

                      description = "Create new user record with name and email."
                    } as $new_user

                    var.update $user {
                      value = $new_user
                      description = "Update user variable with newly created user record."
                    }
                  }
                }

                db.get "customer" {
                  field_name = "user_id"
                  field_value = $user.id
                  description = "Check if user is already a customer"
                } as $customer

                conditional {
                  description = "Create customer record if user is not already a customer"
                  if ($customer == null) {
                    db.add customer {
                      data = {
                        created_at    : "now"
                        user_id       : $user.id
                        customer_type : "individual"
                        street_address: ($row|get:"street_address":null)|trim
                        zip_code      : ($row|get:"zip_code":null)|trim
                        city          : ($row|get:"city":null)|trim
                      }

                      description = "Create new customer record linked to user."
                    } as $customer
                  }
                }
              }
            }

            var.update $successful_imports {
              value = $successful_imports + 1
              description = "Increment successful imports counter."
            }

            debug.log {
              value = "Successfully imported customer: " ~ $email ~ " (User ID: " ~ $user_record.id ~ ")"
              description = "Log successful customer import."
            }
          }

          catch {
            var.update $failed_imports {
              value = $failed_imports + 1
              description = "Increment failed imports on error."
            }

            debug.log {
              value = "Failed to process row: " ~ ($row|json_encode) ~ ", Error: " ~ $error
              description = "Log row processing failure."
            }
          }
        }
      }
    }

    var $result {
      value = {
        total_processed   : $total_processed
        successful_imports: $successful_imports
        failed_imports    : $failed_imports
        message          : "CSV import completed successfully."
      }
    }
  }

  response = $result
}
```

## survey_analytics_system

```xs
function "analytics/survey_analytics" {
  description = "Calculate survey completion rates, response statistics, and question-level analytics for survey system analysis"
  input {
    int survey_id {
      description = "The ID of the survey to analyze"
    }
  }

  stack {
    precondition ($input.survey_id > 0) {
      error_type = "inputerror"
      error = "Survey ID must be positive"
      description = "Validate survey_id is valid"
    }

    db.get "surveys" {
      field_name = "id"
      field_value = $input.survey_id
      description = "Get survey information and verify it exists"
    } as $survey_info

    precondition ($survey_info != null) {
      error_type = "notfound"
      error = "Survey not found"
      description = "Ensure survey exists"
    }

    db.query "survey_questions" {
      description = "Get all questions for this survey ordered by display order"
      where = $db.survey_questions.survey_id == $input.survey_id
    } as $questions

    db.query "survey_responses" {
      description = "Get all responses for this survey"
      where = $db.survey_responses.survey_id == $input.survey_id
    } as $all_responses

    var $total_questions {
      value = $questions|count
      description = "Total number of questions in survey"
    }

    db.query "survey_responses" {
      description = "Get all responses for this survey"
      where = $db.survey_responses.survey_id == $input.survey_id
    } as $responses

    var $unique_respondents {
      value = $all_responses.respondent_id|unique
      description = "Get unique respondent IDs"
    }

    var $total_respondents {
      value = $unique_respondents|count
      description = "Total number of unique respondents"
    }

    var $completion_analysis {
      value = []
      description = "Array to store completion analysis for each respondent"
    }

    foreach ($unique_respondents) {
      each as $respondent_id {
        var $respondent_responses {
          value = $all_responses|filter:"return $this.respondent_id == '" ~ $respondent_id ~ "';"
          description = "Get responses for current respondent"
        }

        var $response_count {
          value = $respondent_responses|count
          description = "Count responses for this respondent"
        }

        var $completion_percentage {
          value = 0
          description = "Initialize completion percentage"
        }

        conditional {
          if ($total_questions > 0) {
            var.update $completion_percentage {
              value = (($response_count / $total_questions) * 100)|number_format:2:".":","
              description = "Calculate completion percentage"
            }
          }
        }

        var $is_complete {
          value = ($response_count == $total_questions)
          description = "Check if survey is complete"
        }

        var $respondent_analysis {
          value = {
            respondent_id: $respondent_id
            responses_given: $response_count
            completion_percentage: $completion_percentage
            is_complete: $is_complete
          }

          description = "Analysis for current respondent"
        }

        array.push $completion_analysis {
          value = $respondent_analysis
          description = "Add respondent analysis to results"
        }
      }
    }

    var $completed_surveys {
      value = $completion_analysis|filter:"return $this.is_complete == true;"
      description = "Filter to only completed surveys"
    }

    var $completion_rate {
      value = 0
      description = "Overall completion rate percentage"
    }

    conditional {
      if ($total_respondents > 0) {
        var $completed_count {
          value = $completed_surveys|count
          description = "Number of completed surveys"
        }

        var.update $completion_rate {
          value = (($completed_count / $total_respondents) * 100)|number_format:2:".":","
          description = "Calculate completion rate"
        }
      }
    }

    var $question_stats {
      value = []
      description = "Array to store response statistics for each question"
    }

    foreach ($questions) {
      each as $question {
        var $question_responses {
          value = $all_responses|filter:"return $this.question_id == " ~ $question.id ~ ";"
          description = "Get responses for current question"
        }

        var $response_count {
          value = $question_responses|count
          description = "Count responses for this question"
        }

        var $response_rate {
          value = 0
          description = "Initialize response rate"
        }

        conditional {
          if ($total_respondents > 0) {
            var.update $response_rate {
              value = (($response_count / $total_respondents) * 100)|number_format:2:".":","
              description = "Calculate response rate percentage"
            }
          }
        }

        var $question_analysis {
          value = {
            question_id: $question.id
            question_text: $question.question_text
            question_type: $question.question_type
            is_required: $question.is_required
            total_responses: $response_count
            response_rate: $response_rate
          }

          description = "Analysis for current question"
        }

        array.push $question_stats {
          value = $question_analysis
          description = "Add question analysis to results"
        }
      }
    }

    var $average_answered {
      value = 0
      description = "Average questions answered per respondent"
    }

    conditional {
      if ($total_respondents > 0) {
        var $total_responses_given {
          value = $completion_analysis.responses_given|sum
          description = "Sum of all responses given"
        }

        var.update $average_answered {
          value = ($total_responses_given / $total_respondents)|number_format:2:".":","
          description = "Calculate average questions answered"
        }
      }
    }

    var $analytics_summary {
      value = {
        survey_id: $input.survey_id
        survey_title: $survey_info.title
        survey_status: $survey_info.status
        total_questions: $total_questions
        total_respondents: $total_respondents
        completed_responses: ($completed_surveys|count)
        completion_rate_percent: $completion_rate
        partial_responses: ($total_respondents - ($completed_surveys|count))
        average_questions_answered: $average_answered
      }

      description = "Summary analytics for the survey"
    }

    debug.log {
      value = "Survey analytics calculated for survey " ~ $input.survey_id ~ " - " ~ $total_respondents ~ " respondents, " ~ $completion_rate ~ "% completion rate"
      description = "Log analytics completion"
    }
  }

  response = {
    summary           : $analytics_summary
    question_breakdown: $question_stats
    completion_details: $completion_analysis
    generated_at      : "now"
  }
}
```

## calculate_customer_lifetime_value

```xs
function "analytics/calculate_customer_lifetime_value" {
  description = "Calculates the total monetary value of all orders made by a specific customer, providing a measure of their lifetime value to the business. This function queries the customer's order history and sums up all order totals to determine their overall spending."
  input {
    int customer_id {
      description = "The ID of the customer to calculate lifetime value for"
    }
  }

  stack {
    db.query "customer" {
      description = "Query the customer table to get customer information"
      where = $db.customer.id == $input.customer_id
      mock = {
       "should return customer": [{id: 5, name: "John"}]
      }
    } as $customer

    db.query "orders" {
      description = "Query the orders table to get all orders for this customer"
      where = $db.orders.customer_id == $input.customer_id
      mock = {
        "should return customer": [
          {id: 1, customer_id: 5, order_total: 100},
          {id: 2, customer_id: 5, order_total: 50}
        ],
        "should return zero for no orders": []
      }
    } as $orders

    var $total {
      value = $orders[$$].order_total|sum
      description = "Calculate the total value by summing all order totals"
    }
  }

  response = $total

  test "should return customer" {
    input = {customer_id: 5}
    expect.to_equal ($response) {
      value = 150
    }
  }

  test "should return zero for no orders" {
    input = {customer_id: 99}
    expect.to_equal ($response) {
      value = 0
    }
  }
}
```

## employee_performance_bonus_calculator

```xs
function "hr/employee_performance_bonus_calculator" {
  description = "Calculates employee performance bonuses based on performance score, years of service, department, and additional factors"
  input {
    decimal performance_score filters=min:0|max:100 {
      description = "Employee's performance score (0-100)"
    }

    int years_of_service filters=min:0|max:50 {
      description = "Number of years the employee has worked"
    }

    text department {
      description = "Employee's department (engineering, sales, management, marketing, hr, finance)"
    }

    decimal base_salary filters=min:0 {
      description = "Employee's annual base salary"
    }

    bool exceeded_targets? {
      description = "Whether employee exceeded their annual targets"
    }

    text performance_tier? {
      description = "Performance tier: exceptional, high, satisfactory, needs_improvement"
    }

    decimal bonus_cap_percentage?=25 filters=min:0|max:50 {
      description = "Maximum bonus as percentage of base salary (default 25%)"
    }
  }

  stack {
    var $department_multiplier {
      value = 1
      description = "Initialize department multiplier"
    }

    switch ($input.department|to_lower) {
      case ("engineering") {
        var.update $department_multiplier {
          value = 1.2
          description = "Engineering department gets 20% multiplier"
        }
      } break

      case ("sales") {
        var.update $department_multiplier {
          value = 1.3
          description = "Sales department gets 30% multiplier"
        }
      } break

      case ("management") {
        var.update $department_multiplier {
          value = 1.4
          description = "Management gets 40% multiplier"
        }
      } break

      case ("marketing") {
        var.update $department_multiplier {
          value = 1.15
          description = "Marketing gets 15% multiplier"
        }
      } break

      case ("hr") {
        var.update $department_multiplier {
          value = 1.1
          description = "HR gets 10% multiplier"
        }
      } break

      case ("finance") {
        var.update $department_multiplier {
          value = 1.25
          description = "Finance gets 25% multiplier"
        }
      } break

      default {
        var.update $department_multiplier {
          value = 1
          description = "Default multiplier for other departments"
        }
      }
    }

    var $years_multiplier {
      value = 1
      description = "Initialize years of service multiplier"
    }

    conditional {
      if ($input.years_of_service >= 20) {
        var.update $years_multiplier {
          value = 1.5
          description = "20+ years gets 50% multiplier"
        }
      }

      elseif ($input.years_of_service >= 15) {
        var.update $years_multiplier {
          value = 1.4
          description = "15+ years gets 40% multiplier"
        }
      }

      elseif ($input.years_of_service >= 10) {
        var.update $years_multiplier {
          value = 1.3
          description = "10+ years gets 30% multiplier"
        }
      }

      elseif ($input.years_of_service >= 5) {
        var.update $years_multiplier {
          value = 1.2
          description = "5+ years gets 20% multiplier"
        }
      }

      elseif ($input.years_of_service >= 2) {
        var.update $years_multiplier {
          value = 1.1
          description = "2+ years gets 10% multiplier"
        }
      }
    }

    var $performance_multiplier {
      value = $input.performance_score / 100
      description = "Convert performance score to decimal multiplier"
    }

    var $target_bonus {
      value = 0
      description = "Initialize target achievement bonus"
    }

    conditional {
      if ($input.exceeded_targets) {
        var.update $target_bonus {
          value = $input.base_salary * 0.05
          description = "5% bonus for exceeding targets"
        }
      }
    }

    var $tier_multiplier {
      value = 1
      description = "Initialize performance tier multiplier"
    }

    conditional {
      if ($input.performance_tier != "") {
        switch ($input.performance_tier|to_lower) {
          case ("exceptional") {
            var.update $tier_multiplier {
              value = 1.25
              description = "Exceptional performance gets 25% multiplier"
            }
          } break

          case ("high") {
            var.update $tier_multiplier {
              value = 1.15
              description = "High performance gets 15% multiplier"
            }
          } break

          case ("satisfactory") {
            var.update $tier_multiplier {
              value = 1
              description = "Satisfactory performance gets standard multiplier"
            }
          } break

          case ("needs_improvement") {
            var.update $tier_multiplier {
              value = 0.5
              description = "Needs improvement gets reduced multiplier"
            }
          } break
        }
      }
    }

    var $calculated_bonus {
      value = $input.base_salary * $performance_multiplier * $department_multiplier * $years_multiplier * $tier_multiplier
      description = "Calculate base bonus before caps and additions"
    }

    var $total_bonus_before_cap {
      value = $calculated_bonus + $target_bonus
      description = "Add target achievement bonus"
    }

    var $bonus_cap {
      value = $input.base_salary * ($input.bonus_cap_percentage / 100)
      description = "Calculate maximum allowed bonus"
    }

    var $final_bonus {
      value = ($total_bonus_before_cap > $bonus_cap) ? $bonus_cap : $total_bonus_before_cap
      description = "Apply bonus cap if necessary"
    }

    var $was_capped {
      value = $total_bonus_before_cap > $bonus_cap
      description = "Track if bonus was capped"
    }

    var $bonus_as_percentage {
      value = ($final_bonus / $input.base_salary) * 100
      description = "Calculate bonus as percentage of base salary"
    }

    var $result {
      value = {
        final_bonus_amount: $final_bonus
        bonus_percentage: $bonus_as_percentage
        was_capped: $was_capped
        calculation_details: {
          base_salary: $input.base_salary
          performance_score: $input.performance_score
          years_of_service: $input.years_of_service
          department: $input.department
          performance_tier: $input.performance_tier
          exceeded_targets: $input.exceeded_targets
        }
        multipliers_applied: {
          department_multiplier: $department_multiplier
          years_multiplier: $years_multiplier
          performance_multiplier: $performance_multiplier
          tier_multiplier: $tier_multiplier
        }
        bonus_breakdown: {
          calculated_base_bonus: $calculated_bonus
          target_achievement_bonus: $target_bonus
          total_before_cap: $total_bonus_before_cap
          bonus_cap: $bonus_cap
          final_bonus: $final_bonus
        }
      }

      description = "Comprehensive bonus calculation result with detailed breakdown"
    }
  }

  response = $result
}
```

## compute_user_engagement_score

```xs
function "analytics/compute_user_engagement_score" {
  description = "Computes a user engagement score based on their activity data. Accepts a user ID and activity array, validates inputs, calculates weighted engagement score (posts * 10 + comments * 5 + likes * 2), and ensures all values are non-negative using array validation."
  input {
    int user_id {
      description = "Unique identifier for the user"
    }
    decimal[] posts {
      description = "Array of post counts for each period"
    }
    decimal[] comments {
      description = "Array of comment counts for each period"
    }
    decimal[] likes {
      description = "Array of like counts for each period"
    }
    decimal post_weight?=10 {
      description = "Weight multiplier for posts (default: 10)"
    }
    decimal comment_weight?=5 {
      description = "Weight multiplier for comments (default: 5)"
    }
    decimal like_weight?=2 {
      description = "Weight multiplier for likes (default: 2)"
    }
  }
  stack {
    precondition ($input.user_id > 0) {
      error_type = "inputerror"
      error = "User ID must be positive"
      description = "Validate user_id is positive"
    }
    var $posts_length {
      value = $input.posts|count
      description = "Length of posts array"
    }
    var $comments_length {
      value = $input.comments|count
      description = "Length of comments array"
    }
    var $likes_length {
      value = $input.likes|count
      description = "Length of likes array"
    }
    precondition ($posts_length > 0) {
      error_type = "inputerror"
      error = "Posts array cannot be empty"
      description = "Validate arrays are not empty"
    }
    precondition ($posts_length == $comments_length && $posts_length == $likes_length) {
      error_type = "inputerror"
      error = "All activity arrays must have the same length"
      description = "Validate all arrays have the same length"
    }
    precondition ($input.post_weight >= 0) {
      error_type = "inputerror"
      error = "Post weight must be non-negative"
      description = "Validate post weight is non-negative"
    }
    precondition ($input.comment_weight >= 0) {
      error_type = "inputerror"
      error = "Comment weight must be non-negative"
      description = "Validate comment weight is non-negative"
    }
    precondition ($input.like_weight >= 0) {
      error_type = "inputerror"
      error = "Like weight must be non-negative"
      description = "Validate like weight is non-negative"
    }
    var $min_post_value {
      value = $input.posts|min
      description = "Minimum value in posts array"
    }
    var $min_comment_value {
      value = $input.comments|min
      description = "Minimum value in comments array"
    }
    var $min_like_value {
      value = $input.likes|min
      description = "Minimum value in likes array"
    }
    precondition ($min_post_value >= 0) {
      error_type = "inputerror"
      error = "All post counts must be non-negative"
      description = "Check if all post counts are valid"
    }
    precondition ($min_comment_value >= 0) {
      error_type = "inputerror"
      error = "All comment counts must be non-negative"
      description = "Check if all comment counts are valid"
    }
    precondition ($min_like_value >= 0) {
      error_type = "inputerror"
      error = "All like counts must be non-negative"
      description = "Check if all like counts are valid"
    }
    var $total_score {
      value = 0
      description = "Total engagement score"
    }
    for ($posts_length) {
      each as $index {
        var $period_score {
          value = ($input.posts[$index] * $input.post_weight) + ($input.comments[$index] * $input.comment_weight) + ($input.likes[$index] * $input.like_weight)
          description = "Weighted score for period $index"
        }
        math.add $total_score {
          value = $period_score
          description = "Add period score to total"
        }
      }
    }
  }

  response = $total_score

  test "should calculate correct engagement score" {
    input = {
      user_id: 1,
      posts: [2, 1],
      comments: [5, 3],
      likes: [10, 4]
    }
    expect.to_equal ($response) {
      value = 2*10+5*5+10*2 + 1*10+3*5+4*2
    }
  }

  test "should throw error for negative post count" {
    input = {
      user_id: 1,
      posts: [-1, 2],
      comments: [1, 2],
      likes: [1, 2]
    }
    expect.to_throw {
      value = "All post counts must be non-negative"
    }
  }
}
```
