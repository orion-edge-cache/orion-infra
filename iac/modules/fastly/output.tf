output "compute_domain" {
  description = "Domain name of the Compute service"
  value       = one(fastly_service_compute.orion_compute.domain).name
}

output "compute_id" {
  description = "ID of the Compute service"
  value       = fastly_service_compute.orion_compute.id
}

output "compute_name" {
  description = "Name of the Compute service"
  value       = fastly_service_compute.orion_compute.name
}

output "cdn_domain" {
  description = "Domain name of the CDN service"
  value       = one(fastly_service_vcl.orion_cache.domain).name
}

output "cdn_id" {
  description = "ID of the CDN service"
  value       = fastly_service_vcl.orion_cache.id
}

output "cdn_name" {
  description = "Name of the CDN service"
  value       = fastly_service_vcl.orion_cache.name
}

output "configstore_name" {
  description = "Name of the Config Store"
  value       = fastly_configstore.orion.name
}

output "configstore_id" {
  description = "ID of the Config Store"
  value       = fastly_configstore.orion.id
}

output "secretstore_name" {
  description = "Name of the Secret Store"
  value       = fastly_secretstore.orion.name
}

output "secretstore_id" {
  description = "ID of the Secret Store"
  value       = fastly_secretstore.orion.id
}
