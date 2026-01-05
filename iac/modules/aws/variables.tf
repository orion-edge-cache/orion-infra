variable "iam_role_name" {
  description = "Name of the IAM role for Fastly logging"
  type        = string
}

variable "s3_bucket_name" {
  description = "Name of the S3 bucket for storing logs"
  type        = string
}

variable "kinesis_stream_name" {
  description = "Name of the Kinesis stream for real-time log streaming"
  type        = string
}

variable "fastly_customer_id" {
  description = "Fastly customer ID for IAM ExternalId condition (fetched from Fastly API)"
  type        = string
}
