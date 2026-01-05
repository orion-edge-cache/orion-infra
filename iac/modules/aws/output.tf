output "s3_arn" {
  description = "ARN of the S3 bucket"
  sensitive   = true
  value       = aws_s3_bucket.orion_logs_s3.arn
}

output "s3_name" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.orion_logs_s3.id
}

output "s3_bucket_domain_name" {
  description = "Domain name of the S3 bucket"
  value       = aws_s3_bucket.orion_logs_s3.bucket_domain_name
}

output "iam_role_arn" {
  description = "ARN of the IAM role"
  sensitive   = true
  value       = aws_iam_role.orion_logging.arn
}

output "iam_role_name" {
  description = "Name of the IAM role"
  value       = aws_iam_role.orion_logging.name
}

output "kinesis_stream_name" {
  description = "Name of the Kinesis stream"
  value       = aws_kinesis_stream.orion_logs_stream.name
}

output "kinesis_stream_arn" {
  description = "ARN of the Kinesis stream"
  sensitive   = true
  value       = aws_kinesis_stream.orion_logs_stream.arn
}
