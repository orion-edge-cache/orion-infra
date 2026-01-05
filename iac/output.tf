output "compute_service" {
  description = "Fastly Compute service details"
  value = {
    domain_name           = module.orion_fastly.compute_domain
    id                    = module.orion_fastly.compute_id
    name                  = module.orion_fastly.compute_name
    backend_domain        = var.compute_backend_domain
    backend_port          = var.compute_backend_port
    backend_protocol      = var.compute_backend_protocol
    backend_host_override = var.compute_backend_host_override
  }
}

output "cdn_service" {
  description = "Fastly CDN service details"
  value = {
    domain_name = module.orion_fastly.cdn_domain
    id          = module.orion_fastly.cdn_id
    name        = module.orion_fastly.cdn_name
  }
}

output "configstore" {
  description = "Fastly Config Store details"
  value = {
    name = module.orion_fastly.configstore_name
    id   = module.orion_fastly.configstore_id
  }
}

output "secretstore" {
  description = "Fastly Secret Store details"
  value = {
    name = module.orion_fastly.secretstore_name
    id   = module.orion_fastly.secretstore_id
  }
}

output "kinesis_stream" {
  description = "AWS Kinesis stream details"
  sensitive   = true
  value = {
    name = module.orion_aws.kinesis_stream_name
    arn  = module.orion_aws.kinesis_stream_arn
  }
}

output "s3_bucket" {
  description = "AWS S3 bucket details"
  sensitive   = true
  value = {
    arn                = module.orion_aws.s3_arn
    name               = module.orion_aws.s3_name
    bucket_domain_name = module.orion_aws.s3_bucket_domain_name
  }
}

output "iam_role" {
  description = "AWS IAM role details"
  sensitive   = true
  value = {
    arn  = module.orion_aws.iam_role_arn
    name = module.orion_aws.iam_role_name
  }
}

output "instance_id" {
  description = "Unique identifier for this Orion deployment"
  value       = local.instance_id
}
