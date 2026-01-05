terraform {
  backend "local" {
  }
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.23"
    }
    fastly = {
      source  = "fastly/fastly"
      version = "~> 8.5"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.7"
    }
    http = {
      source  = "hashicorp/http"
      version = "~> 3.4"
    }
  }
}

resource "random_id" "instance_id" {
  byte_length = 4
}

# Fetch Fastly customer ID dynamically from API
data "http" "fastly_current_user" {
  url = "https://api.fastly.com/current_user"
  request_headers = {
    Fastly-Key = var.fastly_api_key
  }
}

locals {
  fastly_customer_id = jsondecode(data.http.fastly_current_user.response_body).customer_id
}

module "orion_fastly" {
  source      = "./modules/fastly"
  instance_id = local.instance_id

  cdn_custom_domain             = var.cdn_custom_domain
  compute_custom_domain         = var.compute_custom_domain
  compute_backend_domain        = var.compute_backend_domain
  compute_backend_port          = var.compute_backend_port
  compute_backend_protocol      = var.compute_backend_protocol
  compute_backend_host_override = var.compute_backend_host_override
  configstore_name              = "orion_configstore_${local.instance_id}"
  secretstore_name              = "orion_secretstore_${local.instance_id}"

  kinesis_stream_name = "${var.kinesis_stream_name}-${local.instance_id}"
  kinesis_arn         = module.orion_aws.kinesis_stream_arn
  s3_bucket_name      = "${var.s3_bucket_name}-${local.instance_id}"
  s3_arn              = module.orion_aws.s3_arn
  iam_role_name       = "${var.iam_role_name}-${local.instance_id}"
  iam_role_arn        = module.orion_aws.iam_role_arn
}

module "orion_aws" {
  source = "./modules/aws"

  kinesis_stream_name  = "${var.kinesis_stream_name}-${local.instance_id}"
  s3_bucket_name       = "${var.s3_bucket_name}-${local.instance_id}"
  iam_role_name        = "${var.iam_role_name}-${local.instance_id}"
  fastly_customer_id   = local.fastly_customer_id
}
