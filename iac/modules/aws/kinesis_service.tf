resource "aws_kinesis_stream" "orion_logs_stream" {
  name = var.kinesis_stream_name

  shard_count      = 1
  retention_period = 24

  stream_mode_details {
    stream_mode = "PROVISIONED"
  }
}
