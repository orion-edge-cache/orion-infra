resource "aws_s3_bucket" "orion_logs_s3" {
  bucket        = var.s3_bucket_name
  force_destroy = true
}
