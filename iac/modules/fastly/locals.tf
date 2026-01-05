locals {
  cdn_domain = (
    var.cdn_custom_domain != ""
    ? var.cdn_custom_domain
    : "${var.instance_id}.${var.cdn_default_domain}"
  )

  compute_domain = (
    var.compute_custom_domain != ""
    ? var.compute_custom_domain
    : "${var.instance_id}.${var.compute_default_domain}"
  )

  compute_backend_host_override = (
    var.compute_backend_host_override != ""
    ? var.compute_backend_host_override
    : "${var.compute_backend_domain}"
  )

  cdn_backend_name = "orion_compute"
}
