resource "fastly_service_dynamic_snippet_content" "recv_logs" {
  for_each = {
    for d in fastly_service_vcl.orion_cache.dynamicsnippet : d.name => d if d.name == "Log Events in Recv"
  }
  service_id = fastly_service_vcl.orion_cache.id
  snippet_id = each.value.snippet_id
  content    = <<-VCL
                declare local var.x_graphql_query STRING;
                declare local var.x_request_id STRING;
                declare local var.log_json STRING;
                set var.x_graphql_query = if(req.http.x-graphql-query, req.http.x-graphql-query, "No X-GraphQL-Query Header");
                set var.x_request_id = if(req.http.x-request-id, req.http.x-request-id, "No Request ID Attached");
                set var.log_json = 
                  {"{"} +
                  {""request_id": ""} + json.escape(var.x_request_id) + {"", "} +
                  {""source": "cdn", "} +
                  {""level": "debug", "} +
                  {""event": "recv", "} +
                  {""timestamp": ""} + strftime({"%Y-%m-%dT%H:%M:%SZ"}, now) + {"", "} +
                  {""message": "Incoming request", "} +
                  {""data": {"} +
                    {""cdn_version": ""} + req.vcl.version + {"", "} +
                    {""req_host": ""} + json.escape(req.http.host) + {"", "} +
                    {""req_path": ""} + json.escape(req.url.path) + {"", "} +
                    {""req_method": ""} + req.method + {"", "} +
                    {""req_body": ""} + json.escape(req.body) + {"", "} +
                    {""req_restarts": "} + req.restarts + {", "} +
                    {""req_user_agent": ""} + json.escape(if(req.http.User-Agent, req.http.User-Agent, "")) + {"", "} +
                    {""req_accept": ""} + json.escape(if(req.http.Accept, req.http.Accept, "")) + {"", "} +
                    {""req_content_type": ""} + json.escape(if(req.http.Content-Type, req.http.Content-Type, "")) + {"", "} +
                    {""req_origin": ""} + json.escape(if(req.http.Origin, req.http.Origin, "")) + {"", "} +
                    {""req_referrer": ""} + json.escape(if(req.http.Referer, req.http.Referer, "")) + {"", "} +
                    {""req_x_graphql_query": ""} + json.escape(var.x_graphql_query) + {"", "} +
                    {""req_is_purge": ""} + if(req.is_purge, "true", "false") + {"""} +
                  {"}}"};
                log {"syslog "} req.service_id {" kinesis-stream :: "} var.log_json;
              VCL
}

resource "fastly_service_dynamic_snippet_content" "hash_logs" {
  for_each = {
    for d in fastly_service_vcl.orion_cache.dynamicsnippet : d.name => d if d.name == "Log Events in Hash"
  }
  service_id = fastly_service_vcl.orion_cache.id
  snippet_id = each.value.snippet_id
  content    = <<-VCL
                declare local var.x_request_id STRING;
                declare local var.log_json STRING;
                set var.x_request_id = if(req.http.x-request-id, req.http.x-request-id, "No Request ID Attached");
                set var.log_json = 
                  {"{"} +
                  {""request_id": ""} + json.escape(var.x_request_id) + {"", "} +
                  {""source": "cdn", "} +
                  {""level": "debug", "} +
                  {""event": "hash", "} +
                  {""timestamp": ""} + strftime({"%Y-%m-%dT%H:%M:%SZ"}, now) + {"", "} +
                  {""message": "Generateing cache key", "} +
                  {""data": {"} +
                    {""cdn_version": ""} + req.vcl.version + {"", "} +
                  {"}}"};
                log {"syslog "} req.service_id {" kinesis-stream :: "} var.log_json;
              VCL
}

resource "fastly_service_dynamic_snippet_content" "miss_logs" {
  for_each = {
    for d in fastly_service_vcl.orion_cache.dynamicsnippet : d.name => d if d.name == "Log Events in Miss"
  }
  service_id = fastly_service_vcl.orion_cache.id
  snippet_id = each.value.snippet_id
  content    = <<-VCL
                declare local var.x_request_id STRING;
                declare local var.log_json STRING;
                set var.x_request_id = if(req.http.x-request-id, req.http.x-request-id, "No Request ID Attached");
                set var.log_json = 
                  {"{"} +
                  {""request_id": ""} + json.escape(var.x_request_id) + {"", "} +
                  {""source": "cdn", "} +
                  {""level": "debug", "} +
                  {""event": "miss", "} +
                  {""timestamp": ""} + strftime({"%Y-%m-%dT%H:%M:%SZ"}, now) + {"", "} +
                  {""message": "Cache miss", "} +
                  {""data": {"} +
                    {""cdn_version": ""} + req.vcl.version + {"", "} +
                    {""bereq_method": ""} + bereq.method + {"", "} +
                    {""bereq_proto": ""} + bereq.proto + {"", "} +
                    {""bereq_url_basename": ""} + bereq.url.basename + {"", "} +
                    {""bereq_url_path": ""} + bereq.url.path + {"", "} +
                    {""bereq_url_qs": ""} + bereq.url.qs + {"", "} +
                    {""bereq_url": ""} + bereq.url + {"", "} +
                    {""req_backend_is_origin": ""} + if(req.backend.is_origin, "true", "false") + {"""} +
                  {"}}"};
                log {"syslog "} req.service_id {" kinesis-stream :: "} var.log_json;
               VCL
}

resource "fastly_service_dynamic_snippet_content" "hit_logs" {
  for_each = {
    for d in fastly_service_vcl.orion_cache.dynamicsnippet : d.name => d if d.name == "Log Events in Hit"
  }
  service_id = fastly_service_vcl.orion_cache.id
  snippet_id = each.value.snippet_id
  content    = <<-VCL
                declare local var.x_request_id STRING;
                declare local var.log_json STRING;
                set var.x_request_id = if(req.http.x-request-id, req.http.x-request-id, "No Request ID Attached");
                set var.log_json = 
                  {"{"} +
                  {""request_id": ""} + json.escape(var.x_request_id) + {"", "} +
                  {""source": "cdn", "} +
                  {""level": "debug", "} +
                  {""event": "hit", "} +
                  {""timestamp": ""} + strftime({"%Y-%m-%dT%H:%M:%SZ"}, now) + {"", "} +
                  {""message": "Cache hit", "} +
                  {""data": {"} +
                    {""cdn_version": ""} + req.vcl.version + {"", "} +
                    {""obj_age": ""} + obj.age + {"", "} +
                    {""obj_cacheable": ""} + if(obj.cacheable, "true", "false") + {"", "} +
                    {""obj_hits": ""} + obj.hits + {"", "} +
                    {""obj_lastuse": ""} + obj.lastuse + {"", "} +
                    {""obj_response": ""} + obj.response + {"", "} +
                    {""obj_protocol": ""} + obj.proto + {"", "} +
                    {""obj_sie": ""} + obj.stale_if_error + {"", "} +
                    {""obj_swr": ""} + obj.stale_while_revalidate + {"", "} +
                    {""obj_status": ""} + obj.status + {"", "} +
                    {""obj_ttl": ""} + obj.ttl + {"""} +
                  {"}}"};
                log {"syslog "} req.service_id {" kinesis-stream :: "} var.log_json;
              VCL
}

resource "fastly_service_dynamic_snippet_content" "pass_logs" {
  for_each = {
    for d in fastly_service_vcl.orion_cache.dynamicsnippet : d.name => d if d.name == "Log Events in Pass"
  }
  service_id = fastly_service_vcl.orion_cache.id
  snippet_id = each.value.snippet_id
  content    = <<-VCL
                declare local var.x_request_id STRING;
                declare local var.log_json STRING;
                set var.x_request_id = if(req.http.x-request-id, req.http.x-request-id, "No Request ID Attached");
                set var.log_json = 
                  {"{"} +
                  {""request_id": ""} + json.escape(var.x_request_id) + {"", "} +
                  {""source": "cdn", "} +
                  {""level": "debug", "} +
                  {""event": "pass", "} +
                  {""timestamp": ""} + strftime({"%Y-%m-%dT%H:%M:%SZ"}, now) + {"", "} +
                  {""message": "Cache pass", "} +
                  {""data": {"} +
                    {""cdn_version": ""} + req.vcl.version + {"""} +
                  {"}}"};
                log {"syslog "} req.service_id {" kinesis-stream :: "} var.log_json;
               VCL
}

resource "fastly_service_dynamic_snippet_content" "fetch_logs" {
  for_each = {
    for d in fastly_service_vcl.orion_cache.dynamicsnippet : d.name => d if d.name == "Log Events in Fetch"
  }
  service_id = fastly_service_vcl.orion_cache.id
  snippet_id = each.value.snippet_id
  content    = <<-VCL
                declare local var.x_request_id STRING;
                declare local var.log_json STRING;
                set var.x_request_id = if(req.http.x-request-id, req.http.x-request-id, "No Request ID Attached");
                set var.log_json = 
                  {"{"} +
                  {""request_id": ""} + json.escape(var.x_request_id) + {"", "} +
                  {""source": "cdn", "} +
                  {""level": "debug", "} +
                  {""event": "fetch", "} +
                  {""timestamp": ""} + strftime({"%Y-%m-%dT%H:%M:%SZ"}, now) + {"", "} +
                  {""message": "Backend response received", "} +
                  {""data": {"} +
                    {""cdn_version": ""} + req.vcl.version + {"", "} +
                    {""beresp_response": ""} + beresp.response + {"", "} +
                    {""beresp_protocol": ""} + beresp.proto + {"", "} +
                    {""beresp_backend_host": ""} + beresp.backend.host + {"", "} +
                    {""beresp_backend_name": ""} + beresp.backend.name + {"", "} +
                    {""beresp_cacheable": ""} + if(beresp.cacheable, "true", "false") + {"", "} +
                    {""beresp_sie": ""} + beresp.stale_if_error + {"", "} +
                    {""beresp_swr": ""} + beresp.stale_while_revalidate + {"", "} +
                    {""beresp_status": ""} + beresp.status + {"", "} +
                    {""beresp_ttl": ""} + beresp.ttl + {"""} +
                  {"}}"};
                log {"syslog "} req.service_id {" kinesis-stream :: "} var.log_json;
               VCL
}
