resource "fastly_service_dynamic_snippet_content" "recv_logs" {
  for_each = {
    for d in fastly_service_vcl.orion_cache.dynamicsnippet : d.name => d if d.name == "Log Events in Recv"
  }
  service_id = fastly_service_vcl.orion_cache.id
  snippet_id = each.value.snippet_id
  content    = <<-VCL
                log {"syslog "} req.service_id {" kinesis-stream :: "} {"{ "Subroutine": "== vcl_recv ==", "Title": "VCL RECV","CDN Version": ""} req.vcl.version {"", "Step": "1","Timestamp": ""} now {"", "Host": ""} req.http.host {"", "Path": ""} req.url.path {"", "Method": ""} req.method {"", "Body": ""} json.escape(req.body) {"" , "Restarts": ""} req.restarts {""   }"};
                log {"syslog "} req.service_id {" s3-logs :: "} {"{ "Subroutine": "== vcl_recv ==", "Title": "VCL RECV", "Step": "1", "CDN Version": ""} req.vcl.version {"","Timestamp": ""} now {"", "Host": ""} req.http.host {"", "Path": ""} req.url.path {"", "Method": ""} req.method {"", "Body": ""} json.escape(req.body) {"" , "Restarts": ""} req.restarts {""   }"};

                if (req.method == "POST" && req.url.path == "/graphql") {
                    log {"syslog "} req.service_id {" s3-logs :: "} {"{ "Subroutine": "== vcl_recv ==", "Title": "Request is POST and path is /graphql", "CDN Version": ""} req.vcl.version {"","Step": "2", "Timestamp": ""} now {"", "Restarts": ""} req.restarts {""  }"};
                    log {"syslog "} req.service_id {" kinesis-stream :: "} {"{ "Subroutine": "== vcl_recv ==", "Title": "Request is POST and path is /graphql", "CDN Version": ""} req.vcl.version {"","Step": "2", "Timestamp": ""} now {"", "Restarts": ""} req.restarts {""  }"};

                    // Read the request body
                    if (req.body) {
                        # Check if the body contains "query".
                        if (req.body ~ "query") {
                            log {"syslog "} req.service_id {" s3-logs :: "} {"{ "Subroutine": "== vcl_recv ==", "Title": "req.body ~ query is TRUE", "CDN Version": ""} req.vcl.version {"","Step": "3", "Timestamp": ""} now {"", "X-GraphQL-Query": ""} req.http.x-graphql-query {"", "Method": ""} req.method {"", "Body": ""} json.escape(req.body) {"" , "Restarts": ""} req.restarts {""   }"};
                            log {"syslog "} req.service_id {" kinesis-stream :: "} {"{ "Subroutine": "== vcl_recv ==", "Title": "req.body ~ query is TRUE", "CDN Version": ""} req.vcl.version {"","Step": "3", "Timestamp": ""} now {"", "X-GraphQL-Query": ""} req.http.x-graphql-query {"", "Method": ""} req.method {"", "Body": ""} json.escape(req.body) {"" , "Restarts": ""} req.restarts {""   }"};
                            log {"syslog "} req.service_id {" s3-logs :: "} {"{ "Subroutine": "== vcl_recv ==", "Title": "Method has been set to GET", "CDN Version": ""} req.vcl.version {"","Step": "4", "Timestamp": ""} now {"","X-GraphQL-Query": ""} req.http.x-graphql-query {"", "Method": ""} req.method {"", "Body": ""} json.escape(req.body) {"" , "Restarts": ""} req.restarts {""   }"};
                            log {"syslog "} req.service_id {" kinesis-stream :: "} {"{ "Subroutine": "== vcl_recv ==", "Title": "Method has been set to GET", "CDN Version": ""} req.vcl.version {"","Step": "4", "Timestamp": ""} now {"","X-GraphQL-Query": ""} req.http.x-graphql-query {"", "Method": ""} req.method {"", "Body": ""} json.escape(req.body) {"" , "Restarts": ""} req.restarts {""   }"};
                        } else {
                            log {"syslog "} req.service_id {" s3-logs :: "} {"{ "Subroutine": "== vcl_recv ==", "Title": "req.body ~ query is FALSE", "CDN Version": ""} req.vcl.version {"","Step": "5", "Timestamp": ""} now {"","Method": ""} req.method {"", "Body": ""} json.escape(req.body) {"" , "Restarts": ""} req.restarts {""   }"};
                            log {"syslog "} req.service_id {" kinesis-stream :: "} {"{ "Subroutine": "== vcl_recv ==", "Title": "req.body ~ query is FALSE", "CDN Version": ""} req.vcl.version {"","Step": "5", "Timestamp": ""} now {"","Method": ""} req.method {"", "Body": ""} json.escape(req.body) {"" , "Restarts": ""} req.restarts {""   }"};
                        }
                    } else {
                        log {"syslog "} req.service_id {" s3-logs :: "} {"{ "Subroutine": "== vcl_recv ==", "Title": "No Body attached to request", "CDN Version": ""} req.vcl.version {"","Method": ""} req.method {"", "Body": ""} json.escape(req.body) {"" , "Restarts": ""} req.restarts {""   }"};
                        log {"syslog "} req.service_id {" kinesis-stream :: "} {"{ "Subroutine": "== vcl_recv ==", "Title": "No Body attached to request", "CDN Version": ""} req.vcl.version {"","Method": ""} req.method {"", "Body": ""} json.escape(req.body) {"" , "Restarts": ""} req.restarts {""   }"};
                    }
                  } else if (req.http.x-graphql-query) {
                        log {"syslog "} req.service_id {" s3-logs :: "} {"{ "Subroutine": "== vcl_recv ==", "Title": "GET with X-GraphQL-Query", "CDN Version": ""} req.vcl.version {"","Step": "4", "Timestamp": ""} now {"","X-GraphQL-Query": ""} req.http.x-graphql-query {"", "Method": ""} req.method {"", "Body": ""} json.escape(req.body) {"" , "Restarts": ""} req.restarts {""   }"};
                        log {"syslog "} req.service_id {" kinesis-stream :: "} {"{ "Subroutine": "== vcl_recv ==", "Title": "GET with X-GraphQL-Query", "CDN Version": ""} req.vcl.version {"","Step": "4", "Timestamp": ""} now {"","X-GraphQL-Query": ""} req.http.x-graphql-query {"", "Method": ""} req.method {"", "Body": ""} json.escape(req.body) {"" , "Restarts": ""} req.restarts {""   }"};
                  } else {
                    log {"syslog "} req.service_id {" s3-logs :: "} {"{ "Title": "Not a POST with /graphql", "CDN Version": ""} req.vcl.version {"","PATH": ""} req.url.path {"", "Method": ""} req.method {"", "Body": ""} json.escape(req.body) {"" , "Restarts": ""} req.restarts {""   }"};
                    log {"syslog "} req.service_id {" kinesis-stream :: "} {"{ "Title": "Not a POST with /graphql", "CDN Version": ""} req.vcl.version {"","PATH": ""} req.url.path {"", "Method": ""} req.method {"", "Body": ""} json.escape(req.body) {"" , "Restarts": ""} req.restarts {""   }"};
                  }

              VCL
}

resource "fastly_service_dynamic_snippet_content" "hash_logs" {
  for_each = {
    for d in fastly_service_vcl.orion_cache.dynamicsnippet : d.name => d if d.name == "Log Events in Hash"
  }
  service_id = fastly_service_vcl.orion_cache.id
  snippet_id = each.value.snippet_id
  content    = <<-VCL
                log {"syslog "} req.service_id {" kinesis-stream :: "} {"{ "Subroutine": "== vcl_hash ==", "Title": "VCL HASH STATS", "CDN Version": ""} req.vcl.version {"","Step": "5", "Timestamp": ""} now {"","Timestamp": ""} now {"", "Host": ""} req.http.host {"", "Path": ""} req.url.path {"", "Method": ""} req.method {"", "X-GraphQL-Query": ""} req.http.x-graphql-query {"", "Body": ""} json.escape(req.body) {"", "Restarts": ""} req.restarts {""   }"};

                log {"syslog "} req.service_id {" s3-logs :: "} {"{ "Subroutine": "== vcl_hash ==", "Title": "VCL HASH STATS", "CDN Version": ""} req.vcl.version {"","Step": "5", "Timestamp": ""} now {"","Timestamp": ""} now {"", "Host": ""} req.http.host {"", "Path": ""} req.url.path {"", "Method": ""} req.method {"", "X-GraphQL-Query": ""} req.http.x-graphql-query {"", "Body": ""} json.escape(req.body) {"", "Restarts": ""} req.restarts {""   }"};
              VCL
}

resource "fastly_service_dynamic_snippet_content" "miss_logs" {
  for_each = {
    for d in fastly_service_vcl.orion_cache.dynamicsnippet : d.name => d if d.name == "Log Events in Miss"
  }
  service_id = fastly_service_vcl.orion_cache.id
  snippet_id = each.value.snippet_id
  content    = <<-VCL
                log {"syslog "} req.service_id {" kinesis-stream :: "} {"{ "Subroutine": "== vcl_miss ==", "Title": "VCL MISS STATS", "CDN Version": ""} req.vcl.version {"","Step": "6", "Timestamp": ""} now {"", "Host": ""} req.http.host {"", "Path": ""} req.url.path {"", "Method": ""} req.method {"", "X-GraphQL-Query": ""} req.http.x-graphql-query {"", "Backend": ""} req.backend {"", "Body": ""} json.escape(req.body) {"" , "Restarts": ""} req.restarts {""   }"};

                log {"syslog "} req.service_id {" s3-logs :: "} {"{ "Subroutine": "== vcl_miss ==", "Title": "VCL MISS STATS", "CDN Version": ""} req.vcl.version {"","Step": "6", "Timestamp": ""} now {"", "Host": ""} req.http.host {"", "Path": ""} req.url.path {"", "Method": ""} req.method {"", "X-GraphQL-Query": ""} req.http.x-graphql-query {"", "Backend": ""} req.backend {"", "Body": ""} json.escape(req.body) {"" , "Restarts": ""} req.restarts {""   }"};

                log {"syslog "} req.service_id {" kinesis-stream :: "} {"{ "Subroutine": "== vcl_miss ==", "Title": "Backend Request Object Stats", "CDN Version": ""} req.vcl.version {"","Step": "7", "Timestamp": ""} now {"", "Host": ""} bereq.http.host {"", "X-GraphQL-Query": ""} bereq.http.x-graphql-query {"", "Path": ""} bereq.url.path {"", "Method": ""} bereq.method {"" , "Restarts": ""} req.restarts {""   }"};

                log {"syslog "} req.service_id {" s3-logs :: "} {"{ "Subroutine": "== vcl_miss ==", "Title": "Backend Request Object Stats", "CDN Version": ""} req.vcl.version {"","Step": "7",  "Timestamp": ""} now {"", "Host": ""} bereq.http.host {"", "X-GraphQL-Query": ""} bereq.http.x-graphql-query {"", "Path": ""} bereq.url.path {"", "Method": ""} bereq.method {"" , "Restarts": ""} req.restarts {""   }"};
               VCL
}

resource "fastly_service_dynamic_snippet_content" "hit_logs" {
  for_each = {
    for d in fastly_service_vcl.orion_cache.dynamicsnippet : d.name => d if d.name == "Log Events in Hit"
  }
  service_id = fastly_service_vcl.orion_cache.id
  snippet_id = each.value.snippet_id
  content    = <<-VCL
                log {"syslog "} req.service_id {" kinesis-stream :: "} {"{ "Subroutine": "== vcl_hit ==", "Title": "VCL HIT STATS", "CDN Version": ""} req.vcl.version {"","Step": "hit", "Timestamp": ""} now {"","Timestamp": ""} now {"", "Host": ""} req.http.host {"", "Path": ""} req.url.path {"", "Method": ""} req.method {"", "X-GraphQL-Query": ""} req.http.x-graphql-query {"", "Body": ""} json.escape(req.body) {"", "Restarts": ""} req.restarts {""   }"};

                log {"syslog "} req.service_id {" s3-logs :: "} {"{ "Subroutine": "== vcl_hit ==", "Title": "VCL HIT STATS", "CDN Version": ""} req.vcl.version {"","Step": "hit", "Timestamp": ""} now {"","Timestamp": ""} now {"", "Host": ""} req.http.host {"", "Path": ""} req.url.path {"", "Method": ""} req.method {"", "X-GraphQL-Query": ""} req.http.x-graphql-query {"", "Body": ""} json.escape(req.body) {"", "Restarts": ""} req.restarts {""   }"};
              VCL
}

resource "fastly_service_dynamic_snippet_content" "pass_logs" {
  for_each = {
    for d in fastly_service_vcl.orion_cache.dynamicsnippet : d.name => d if d.name == "Log Events in Pass"
  }
  service_id = fastly_service_vcl.orion_cache.id
  snippet_id = each.value.snippet_id
  content    = <<-VCL
                  log {"syslog "} req.service_id {" kinesis-stream :: "} {"{ "Subroutine": "== vcl_pass ==", "Title": "VCL PASS", "CDN Version": ""} req.vcl.version {"","Timestamp": ""} now {"", "Host": ""} req.http.host {"", "Path": ""} req.url.path {"", "Method": ""} req.method {"","X-GraphQL-Query": ""} req.http.x-graphql-query {"", "Body": ""} json.escape(req.body) {"" , "Restarts": ""} req.restarts {""   }"};

                  log {"syslog "} req.service_id {" s3-logs :: "} {"{ "Subroutine": "== vcl_pass ==", "Title": "VCL PASS", "CDN Version": ""} req.vcl.version {"","Timestamp": ""} now {"", "Host": ""} req.http.host {"", "Path": ""} req.url.path {"", "Method": ""} req.method {"","X-GraphQL-Query": ""} req.http.x-graphql-query {"", "Body": ""} json.escape(req.body) {"" , "Restarts": ""} req.restarts {""   }"};

               VCL
}

resource "fastly_service_dynamic_snippet_content" "fetch_logs" {
  for_each = {
    for d in fastly_service_vcl.orion_cache.dynamicsnippet : d.name => d if d.name == "Log Events in Fetch"
  }
  service_id = fastly_service_vcl.orion_cache.id
  snippet_id = each.value.snippet_id
  content    = <<-VCL
                log {"syslog "} req.service_id {" kinesis-stream :: "} {"{ "Subroutine": "== vcl_fetch ==", "Title": "Request Object Stats","CDN Version": ""} req.vcl.version {"", "Step": "8","Timestamp": ""} now {"", "Host": ""} req.http.host {"", "Path": ""} req.url.path {"", "Method": ""} req.method {"", "Backend": ""} req.backend {"", "Body": ""} json.escape(req.body) {"" , "Restarts": ""} req.restarts {""   }"};

                log {"syslog "} req.service_id {" s3-logs :: "} {"{ "Subroutine": "== vcl_fetch ==", "Title": "Request Object Stats","CDN Version": ""} req.vcl.version {"", "Step": "8","Timestamp": ""} now {"", "Host": ""} req.http.host {"", "Path": ""} req.url.path {"", "Method": ""} req.method {"", "Backend": ""} req.backend {"", "Body": ""} json.escape(req.body) {"" , "Restarts": ""} req.restarts {""   }"};

                log {"syslog "} req.service_id {" kinesis-stream :: "} {"{ "Subroutine": "== vcl_fetch ==", "Title": "Backend Request Object Stats", "CDN Version": ""} req.vcl.version {"","Step": "9","Timestamp": ""} now {"", "Host": ""} bereq.http.host {"", "X-GraphQL-Query": ""} bereq.http.x-graphql-query {"", "Path": ""} bereq.url.path {"", "Method": ""} bereq.method {"" , "Restarts": ""} req.restarts {""   }"};

                log {"syslog "} req.service_id {" s3-logs :: "} {"{ "Subroutine": "== vcl_fetch ==", "Title": "Backend Request Object Stats", "CDN Version": ""} req.vcl.version {"","Step": "9","Timestamp": ""} now {"", "Host": ""} bereq.http.host {"", "X-GraphQL-Query": ""} bereq.http.x-graphql-query {"", "Path": ""} bereq.url.path {"", "Method": ""} bereq.method {"" , "Restarts": ""} req.restarts {""   }"};

                log {"syslog "} req.service_id {" kinesis-stream :: "} {"{ "Subroutine": "== vcl_fetch ==", "Title": "Backend Response Object Stats", "CDN Version": ""} req.vcl.version {"","Step": "10","Timestamp": ""} now {"", "Cacheable": ""} beresp.cacheable {"", "Status": ""} beresp.status {"" , "Restarts": ""} req.restarts {""   }"};

                log {"syslog "} req.service_id {" s3-logs :: "} {"{ "Subroutine": "== vcl_fetch ==", "Title": "Backend Response Object Stats", "CDN Version": ""} req.vcl.version {"","Step": "10","Timestamp": ""} now {"", "Cacheable": ""} beresp.cacheable {"", "Status": ""} beresp.status {"" , "Restarts": ""} req.restarts {""   }"};

                log {"syslog "} req.service_id {" kinesis-stream :: "} {"{ "Subroutine": "== vcl_fetch ==", "Title": "After setting Cachable", "CDN Version": ""} req.vcl.version {"","Step": "10","Timestamp": ""} now {"", "Cacheable": ""} beresp.cacheable {"", "Status": ""} beresp.status {"" , "Restarts": ""} req.restarts {""   }"};

                log {"syslog "} req.service_id {" s3-logs :: "} {"{ "Subroutine": "== vcl_fetch ==", "Title": "After setting Cachable", "CDN Version": ""} req.vcl.version {"","Step": "10","Timestamp": ""} now {"", "Cacheable": ""} beresp.cacheable {"", "Status": ""} beresp.status {"" , "Restarts": ""} req.restarts {""   }"};

               VCL
}
