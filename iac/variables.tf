variable "iam_role_name" {
  description = "Name of the IAM role for Fastly logging"
  type        = string
  default     = "orion-logs-role"
}

variable "s3_bucket_name" {
  description = "Name of the S3 bucket for storing logs"
  type        = string
  default     = "orion-logs-s3"
}

variable "kinesis_stream_name" {
  description = "Name of the Kinesis stream for real-time log streaming"
  type        = string
  default     = "orion-logs-stream"
}

variable "cdn_custom_domain" {
  description = "Custom domain for the CDN service (optional)"
  type        = string
  default     = ""
}

variable "compute_custom_domain" {
  description = "Custom domain for the Compute service (optional)"
  type        = string
  default     = ""
}

variable "compute_backend_domain" {
  description = "Domain of the GraphQL backend server"
  type        = string
}

variable "compute_backend_protocol" {
  description = "Protocol used to connect to the backend server"
  type        = string

  validation {
    condition     = contains(["http", "https"], var.compute_backend_protocol)
    error_message = "Protocol must be either 'http' or 'https'."
  }
}

variable "compute_backend_port" {
  description = "Port number of the backend server"
  type        = number

  validation {
    condition     = var.compute_backend_port > 0 && var.compute_backend_port <= 65535
    error_message = "Port must be between 1 and 65535."
  }
}

variable "compute_backend_host_override" {
  description = "Host header override for backend requests (optional)"
  type        = string
}

variable "cache_config_store" {
  description = "Cache configuration stored as JSON"
  type        = string
  default     = "{}"
}

variable "fastly_api_key" {
  description = "Fastly API key (set via TF_VAR_fastly_api_key or FASTLY_API_KEY env var)"
  type        = string
  sensitive   = true
}
