resource "fastly_service_compute" "orion_compute" {
  name = "orion-compute-${var.instance_id}"

  force_destroy = true
  activate      = false
  domain {
    name = local.compute_domain
  }

  logging_kinesis {
    name     = "kinesis-stream"
    topic    = var.kinesis_stream_name
    iam_role = var.iam_role_arn
    region   = "us-east-1"
  }

  logging_s3 {
    name        = "s3-logs"
    bucket_name = var.s3_bucket_name
    s3_iam_role = var.iam_role_arn
    period      = 30
  }

  backend {
    address       = var.compute_backend_domain
    name          = "graphql-server"
    port          = var.compute_backend_port
    override_host = var.compute_backend_host_override
  }

  backend {
    name              = "fastly-api"
    address           = "api.fastly.com"
    port              = 443
    use_ssl           = true
    ssl_cert_hostname = "api.fastly.com"
    ssl_sni_hostname  = "api.fastly.com"
  }

  resource_link {
    name        = var.configstore_name
    resource_id = fastly_configstore.orion.id
  }

  resource_link {
    name        = var.secretstore_name
    resource_id = fastly_secretstore.orion.id
  }
}
