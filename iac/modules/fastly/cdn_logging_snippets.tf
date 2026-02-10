resource "fastly_service_dynamic_snippet_content" "recv_logs" {
  for_each = {
    for d in fastly_service_vcl.orion_cache.dynamicsnippet : d.name => d if d.name == "Log Events in Recv"
  }
  service_id = fastly_service_vcl.orion_cache.id
  snippet_id = each.value.snippet_id
  content    = <<-VCL
                declare local var.x_graphql_query STRING;

                if (req.http.x-graphql-query) {
                  set var.x_graphql_query = req.http.x-graphql-query;
                } else {
                  set var.x_graphql_query = "No X-GraphQL-Query Header";
                }

                log {"syslog "} req.service_id {" kinesis-stream :: "} {"{ "service": "CDN", "Subroutine": "== vcl_recv ==", "Title": "VCL RECV","CDN Version": ""} req.vcl.version {"", "Timestamp": ""} now {"", "Host": ""} req.http.host {"", "Path": ""} req.url.path {"", "Method": ""} req.method {"", "Body": ""} json.escape(req.body) {"" , "Restarts": ""} req.restarts {"", "X-GraphQL-Query": ""} var.x_graphql_query {""   }"};
              VCL
}

resource "fastly_service_dynamic_snippet_content" "hash_logs" {
  for_each = {
    for d in fastly_service_vcl.orion_cache.dynamicsnippet : d.name => d if d.name == "Log Events in Hash"
  }
  service_id = fastly_service_vcl.orion_cache.id
  snippet_id = each.value.snippet_id
  content    = <<-VCL
                declare local var.x_graphql_query STRING;

                if (req.http.x-graphql-query) {
                  set var.x_graphql_query = req.http.x-graphql-query;
                } else {
                  set var.x_graphql_query = "No X-GraphQL-Query Header";
                }

                log {"syslog "} req.service_id {" kinesis-stream :: "} {"{ "service": "CDN", "Subroutine": "== vcl_hash ==", "Title": "VCL HASH STATS", "CDN Version": ""} req.vcl.version {"","Timestamp": ""} now {"","Timestamp": ""} now {"", "Host": ""} req.http.host {"", "Path": ""} req.url.path {"", "Method": ""} req.method {"", "X-GraphQL-Query": ""} var.x_graphql_query {"", "Body": ""} json.escape(req.body) {"", "Restarts": ""} req.restarts {""   }"};

              VCL
}

resource "fastly_service_dynamic_snippet_content" "miss_logs" {
  for_each = {
    for d in fastly_service_vcl.orion_cache.dynamicsnippet : d.name => d if d.name == "Log Events in Miss"
  }
  service_id = fastly_service_vcl.orion_cache.id
  snippet_id = each.value.snippet_id
  content    = <<-VCL
                declare local var.x_graphql_query STRING;

                if (req.http.x-graphql-query) {
                  set var.x_graphql_query = req.http.x-graphql-query;
                } else {
                  set var.x_graphql_query = "No X-GraphQL-Query Header";
                }

                log {"syslog "} req.service_id {" kinesis-stream :: "} {"{ "service": "CDN", "Subroutine": "== vcl_miss ==", "Title": "VCL MISS STATS", "CDN Version": ""} req.vcl.version {"","Timestamp": ""} now {"", "Host": ""} req.http.host {"", "Path": ""} req.url.path {"", "Method": ""} req.method {"", "X-GraphQL-Query": ""} var.x_graphql_query {"", "Backend": ""} req.backend {"", "Body": ""} json.escape(req.body) {"" , "Restarts": ""} req.restarts {""   }"};
               VCL
}

resource "fastly_service_dynamic_snippet_content" "hit_logs" {
  for_each = {
    for d in fastly_service_vcl.orion_cache.dynamicsnippet : d.name => d if d.name == "Log Events in Hit"
  }
  service_id = fastly_service_vcl.orion_cache.id
  snippet_id = each.value.snippet_id
  content    = <<-VCL
                declare local var.x_graphql_query STRING;

                if (req.http.x-graphql-query) {
                  set var.x_graphql_query = req.http.x-graphql-query;
                } else {
                  set var.x_graphql_query = "No X-GraphQL-Query Header";
                }

                log {"syslog "} req.service_id {" kinesis-stream :: "} {"{ "service": "CDN", "Subroutine": "== vcl_hit ==", "Title": "VCL HIT STATS", "CDN Version": ""} req.vcl.version {"", "Timestamp": ""} now {"","Timestamp": ""} now {"", "Host": ""} req.http.host {"", "Path": ""} req.url.path {"", "Method": ""} req.method {"", "X-GraphQL-Query": ""} var.x_graphql_query {"", "Body": ""} json.escape(req.body) {"", "Restarts": ""} req.restarts {""   }"};

              VCL
}

resource "fastly_service_dynamic_snippet_content" "pass_logs" {
  for_each = {
    for d in fastly_service_vcl.orion_cache.dynamicsnippet : d.name => d if d.name == "Log Events in Pass"
  }
  service_id = fastly_service_vcl.orion_cache.id
  snippet_id = each.value.snippet_id
  content    = <<-VCL
                declare local var.x_graphql_query STRING;
                declare local var.x_health_check_req STRING;
                declare local var.x_health_check_bereq STRING;

                if (req.http.x-health-check) {
                  set var.x_health_check_req = req.http.x-health-check;
                } else {
                  set var.x_health_check_req = "req: No X-Health-Check Header";
                }

                if (bereq.http.x-health-check) {
                  set var.x_health_check_bereq = bereq.http.x-health-check;
                } else {
                  set var.x_health_check_bereq = "bereq: No X-Health-Check Header";
                }

                if (req.http.x-graphql-query) {
                  set var.x_graphql_query = req.http.x-graphql-query;
                } else {
                  set var.x_graphql_query = "No X-GraphQL-Query Header";
                }

                log {"syslog "} req.service_id {" kinesis-stream :: "} {"{ "service": "CDN", "Subroutine": "== vcl_pass ==", "Title": "VCL PASS", "CDN Version": ""} req.vcl.version {"","Timestamp": ""} now {"", "Host": ""} req.http.host {"", "Path": ""} req.url.path {"", "Method": ""} req.method {"","X-GraphQL-Query": ""} var.x_graphql_query {"", "Body": ""} json.escape(req.body) {"" , "Restarts": ""} req.restarts {""   }"};
                log {"syslog "} req.service_id {" kinesis-stream :: "} {"{ "service": "CDN", "Subroutine": "== vcl_pass ==", "X_HEALTH_CHECK_BEREQ": ""} var.x_health_check_bereq {"", "X_HEALTH_CHECK_REQ": ""} var.x_health_check_req {""   }"};

               VCL
}

resource "fastly_service_dynamic_snippet_content" "fetch_logs" {
  for_each = {
    for d in fastly_service_vcl.orion_cache.dynamicsnippet : d.name => d if d.name == "Log Events in Fetch"
  }
  service_id = fastly_service_vcl.orion_cache.id
  snippet_id = each.value.snippet_id
  content    = <<-VCL
                declare local var.x_graphql_query STRING;
                declare local var.x_health_check_bereq STRING;

                if (bereq.http.x-health-check) {
                  set var.x_health_check_bereq = bereq.http.x-health-check;
                } else {
                  set var.x_health_check_bereq = "No X-GraphQL-Query Header";
                }

                if (req.http.x-graphql-query) {
                  set var.x_graphql_query = req.http.x-graphql-query;
                } else {
                  set var.x_graphql_query = "No X-GraphQL-Query Header";
                }

                log {"syslog "} req.service_id {" kinesis-stream :: "} {"{ "service": "CDN", "Subroutine": "== vcl_fetch ==", "Title": "Request Object Stats","CDN Version": ""} req.vcl.version {"", "Timestamp": ""} now {"", "Host": ""} req.http.host {"", "Path": ""} req.url.path {"", "Method": ""} req.method {"", "Backend": ""} req.backend {"", "Body": ""} json.escape(req.body) {"" , "Restarts": ""} req.restarts {"", "X-GraphQL-Query": ""} var.x_graphql_query {"", "X-Health-Check": ""} var.x_health_check_bereq {"", "Cacheable": ""} beresp.cacheable {"", "Status": ""} beresp.status {""   }"};

               VCL
}
