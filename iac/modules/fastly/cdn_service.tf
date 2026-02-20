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

  logging_kinesis {
    name     = "kinesis-stream"
    topic    = var.kinesis_stream_name
    iam_role = var.iam_role_arn
    format   = <<-VCL
     {
       "request_id": "%%{if(req.http.x-request-id, req.http.x-request-id, "No Request ID")}V",
       "source": "cdn",
       "level": "info",
       "event": "deliver",
       "timestamp": "%%{strftime(\{"%Y-%m-%dT%H:%M:%S%z"\}, time.start)}V",
       "message": "",
       "data": {
         "cdn_version": "%%{req.vcl.version}V",
         "client_ip": "%%{req.http.Fastly-Client-IP}V",
         "req_host": "%%{if(req.http.Fastly-Orig-Host, req.http.Fastly-Orig-Host, req.http.Host)}V",
         "req_url": "%%{json.escape(req.url)}V",
         "req_method": "%%{json.escape(req.method)}V",
         "req_protocol": "%%{json.escape(req.proto)}V",
         "req_user_agent": "%%{json.escape(req.http.User-Agent)}V",
         "fastly_cache_state": "%%{json.escape(fastly_info.state)}V",
         "resp_status": %%{resp.status}V,
         "resp_response": %%{if(resp.response, "%22"+json.escape(resp.response)+"%22", "null")}V,
         "resp_body_size": %%{resp.body_bytes_written}V,
         "fastly_server": "%%{json.escape(server.identity)}V",
         "fastly_is_edge": %%{if(fastly.ff.visits_this_service == 0, "true", "false")}V,
         "req_x_operation_type": "%%{if(req.http.X-Operation-Type, req.http.X-Operation-Type, "null")}V",
         "req_x_health_check": "%%{if(req.http.X-Health-Check, req.http.X-Health-Check, "null")}V",
         "req_x_graphql_query": "%%{if(req.http.X-GraphQL-Query, req.http.X-GraphQL-Query, "null")}V",
         "req_x_debug_cache_reason": "%%{req.http.X-Debug-Cache-Reason}V",
         "req_body": "%%{json.escape(req.body)}V",
         "time_to_first_byte_seconds": "%%{time.to_first_byte}V",
         "time_elapsed_microseconds": "%%{time.elapsed.usec}V"
        } 
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
