resource "aws_iam_role" "orion_logging" {
  name = var.iam_role_name
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::717331877981:root"
        }
        Action = "sts:AssumeRole"
        Condition = {
          StringEquals = {
            "sts:ExternalId" = var.fastly_customer_id
          }
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "kinesis" {
  role       = aws_iam_role.orion_logging.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonKinesisFullAccess"
}

resource "aws_iam_role_policy_attachment" "s3" {
  role       = aws_iam_role.orion_logging.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
}
