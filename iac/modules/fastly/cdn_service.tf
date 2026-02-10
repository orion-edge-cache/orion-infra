resource "fastly_service_vcl" "orion_cache" {
  name = "orion-cache-${var.instance_id}"

  default_ttl   = 60
  force_destroy = true

  domain {
    name = local.cdn_domain
  }

  backend {
    name              = local.cdn_backend_name
    address           = local.compute_domain
    use_ssl           = true
    ssl_sni_hostname  = local.compute_domain
    ssl_cert_hostname = local.compute_domain
    port              = 443
  }


  cache_setting {
    name      = "Cache 30sec"
    stale_ttl = 5
    ttl       = 30
  }

  logging_s3 {
    name        = "s3-logs"
    bucket_name = var.s3_bucket_name
    s3_iam_role = var.iam_role_arn
    period      = 30
    format      = <<-VCL
    {
       "request_id": "%%{if(req.http.x-request-id, req.http.x-request-id, "No Request ID")}V",
       "service": "cdn",
       "level": "info",
       "timestamp": "%%{strftime(\{"%Y-%m-%dT%H:%M:%S%z"\}, time.start)}V",
       "cdn_version": "%%{req.vcl.version}V",
       "client_ip": "%%{req.http.Fastly-Client-IP}V",
       "host": "%%{if(req.http.Fastly-Orig-Host, req.http.Fastly-Orig-Host, req.http.Host)}V",
       "url": "%%{json.escape(req.url)}V",
       "req_method": "%%{json.escape(req.method)}V",
       "req_protocol": "%%{json.escape(req.proto)}V",
       "req_user_agent": "%%{json.escape(req.http.User-Agent)}V",
       "resp_state": "%%{json.escape(fastly_info.state)}V",
       "resp_status": %%{resp.status}V,
       "resp_response": %%{if(resp.response, "%22"+json.escape(resp.response)+"%22", "null")}V,
       "resp_body_size": %%{resp.body_bytes_written}V,
       "fastly_server": "%%{json.escape(server.identity)}V",
       "fastly_is_edge": %%{if(fastly.ff.visits_this_service == 0, "true", "false")}V,
       "fastly_cache_graphql": "%%{req.http.X-Fastly-Cache-GraphQL}V",
       "req_x_debug_cache_reason": "%%{req.http.X-Debug-Cache-Reason}V",
       "req_body": "%%{json.escape(req.body)}V",
       "time_to_first_byte": "%%{time.to_first_byte}V",
       "time_elapsed": "%%{time.elapsed.usec}V"
    }
    VCL
  }


  logging_kinesis {
    name     = "kinesis-stream"
    topic    = var.kinesis_stream_name
    iam_role = var.iam_role_arn
    format   = <<-VCL
     {
       "request_id": "%%{if(req.http.x-request-id, req.http.x-request-id, "No Request ID")}V",
       "service": "cdn",
       "level": "info",
       "timestamp": "%%{strftime(\{"%Y-%m-%dT%H:%M:%S%z"\}, time.start)}V",
       "cdn_version": "%%{req.vcl.version}V",
       "client_ip": "%%{req.http.Fastly-Client-IP}V",
       "host": "%%{if(req.http.Fastly-Orig-Host, req.http.Fastly-Orig-Host, req.http.Host)}V",
       "url": "%%{json.escape(req.url)}V",
       "req_method": "%%{json.escape(req.method)}V",
       "req_protocol": "%%{json.escape(req.proto)}V",
       "req_user_agent": "%%{json.escape(req.http.User-Agent)}V",
       "resp_state": "%%{json.escape(fastly_info.state)}V",
       "resp_status": %%{resp.status}V,
       "resp_response": %%{if(resp.response, "%22"+json.escape(resp.response)+"%22", "null")}V,
       "resp_body_size": %%{resp.body_bytes_written}V,
       "fastly_server": "%%{json.escape(server.identity)}V",
       "fastly_is_edge": %%{if(fastly.ff.visits_this_service == 0, "true", "false")}V,
       "fastly_cache_graphql": "%%{req.http.X-Fastly-Cache-GraphQL}V",
       "req_x_debug_cache_reason": "%%{req.http.X-Debug-Cache-Reason}V",
       "req_body": "%%{json.escape(req.body)}V",
       "time_to_first_byte": "%%{time.to_first_byte}V",
       "time_elapsed": "%%{time.elapsed.usec}V"
     }
     VCL
  }

  # VCL Logic Snippets
  dynamicsnippet {
    name     = "Convert Post to Get"
    type     = "recv"
    priority = 100
  }

  dynamicsnippet {
    name     = "Hash on X-GraphQL-Query"
    type     = "hash"
    priority = 100
  }

  dynamicsnippet {
    name     = "Trigger Request to Compute Service"
    type     = "miss"
    priority = 100
  }

  dynamicsnippet {
    name     = "Route Mutations to Backend"
    type     = "pass"
    priority = 90
  }

  dynamicsnippet {
    name     = "Apply Backend Cache Settings"
    type     = "fetch"
    priority = 90
  }

  dynamicsnippet {
    name     = "Pass Debug Headers"
    type     = "deliver"
    priority = 90
  }

  # VCL Log Snippets
  dynamicsnippet {
    name     = "Log Events in Recv"
    type     = "recv"
    priority = 90
  }

  dynamicsnippet {
    name     = "Log Events in Hash"
    type     = "hash"
    priority = 90
  }

  dynamicsnippet {
    name     = "Log Events in Miss"
    type     = "miss"
    priority = 90
  }

  dynamicsnippet {
    name     = "Log Events in Hit"
    type     = "hit"
    priority = 90
  }

  dynamicsnippet {
    name     = "Log Events in Pass"
    type     = "pass"
    priority = 90
  }

  dynamicsnippet {
    name     = "Log Events in Fetch"
    type     = "fetch"
    priority = 90
  }
}
