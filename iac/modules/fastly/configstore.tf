resource "fastly_configstore" "orion" {
  name          = var.configstore_name
  force_destroy = true
}

resource "fastly_configstore_entries" "orion" {
  store_id = fastly_configstore.orion.id
  entries = {
    instance_id : var.instance_id

    cdn_domain : local.cdn_domain
    cdn_backend_domain : local.compute_domain
    cdn_backend_port : 443
    cdn_backend_protocol : "https"

    compute_domain : local.compute_domain
    compute_backend_domain : var.compute_backend_domain
    compute_backend_port : var.compute_backend_port
    compute_backend_protocol : var.compute_backend_protocol
    compute_backend_host_override : var.compute_backend_host_override

    kinesis_name : var.kinesis_stream_name
    kinesis_arn : var.kinesis_arn

    s3_name : var.s3_bucket_name
    s3_arn : var.s3_arn

    iam_role_name : var.iam_role_name
    iam_role_arn : var.iam_role_arn

    CACHE_CONFIG_JSON : var.cache_config_store
  }
}
