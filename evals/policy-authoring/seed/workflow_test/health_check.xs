// The health probe answers.
workflow_test health_check {
  stack {
    api.call health verb=GET {
      api_group = "app"
    } as $health
  
    expect.to_be_true ($health.ok)
  }

  tags = ["smoke"]
  guid = "GwucpRqFRnlmnl3FlxX_ZU6nD5k"
}