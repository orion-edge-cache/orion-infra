variable "instance_id" {
  description = "Unique identifier for this Orion deployment"
  type        = string
}

variable "cdn_custom_domain" {
  description = "Custom domain for the CDN service (optional)"
  type        = string
  default     = ""
}

variable "cdn_default_domain" {
  description = "Default domain suffix for CDN service"
  type        = string
  default     = "global.ssl.fastly.net"
}

variable "compute_custom_domain" {
  description = "Custom domain for the Compute service (optional)"
  type        = string
  default     = ""
}

variable "compute_default_domain" {
  description = "Default domain suffix for Compute service"
  type        = string
  default     = "edgecompute.app"
}

variable "compute_backend_domain" {
  description = "Domain of the GraphQL backend server"
  type        = string
}

variable "compute_backend_port" {
  description = "Port number of the backend server"
  type        = number
  default     = 443

  validation {
    condition     = var.compute_backend_port > 0 && var.compute_backend_port <= 65535
    error_message = "Port must be between 1 and 65535."
  }
}

variable "compute_backend_protocol" {
  description = "Protocol used to connect to the backend server"
  type        = string
  default     = "https"

  validation {
    condition     = contains(["http", "https"], var.compute_backend_protocol)
    error_message = "Protocol must be either 'http' or 'https'."
  }
}

variable "compute_backend_host_override" {
  description = "Host header override for backend requests (optional)"
  type        = string
  default     = ""
}

variable "kinesis_stream_name" {
  description = "Name of the Kinesis stream for logging"
  type        = string
}

variable "s3_bucket_name" {
  description = "Name of the S3 bucket for logging"
  type        = string
}

variable "s3_arn" {
  description = "ARN of the S3 bucket"
  type        = string
  sensitive   = true
}

variable "kinesis_arn" {
  description = "ARN of the Kinesis stream"
  type        = string
  sensitive   = true
}

variable "iam_role_arn" {
  description = "ARN of the IAM role for Fastly logging"
  type        = string
  sensitive   = true
}

variable "iam_role_name" {
  description = "Name of the IAM role for Fastly logging"
  type        = string
}

variable "configstore_name" {
  description = "Name of the Fastly Config Store"
  type        = string
  default     = "orion"
}

variable "secretstore_name" {
  description = "Name of the Fastly Secret Store"
  type        = string
  default     = "orion"
}

variable "enable_logic_snippets" {
  description = "Enable VCL logic snippets (Convert POST to GET, Hash on GraphQL Query, Trigger Compute Service)"
  type        = bool
  default     = false
}

variable "enable_logging_snippets" {
  description = "Enable VCL logging snippets (Log Events in Recv, Hash, Miss, Hit, Pass, Fetch)"
  type        = bool
  default     = false
}

variable "cache_config_store" {
  description = "Cache configuration stored as JSON"
  type        = string
  default     = "{}"
}
