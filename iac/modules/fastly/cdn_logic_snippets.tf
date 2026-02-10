resource "fastly_service_dynamic_snippet_content" "recv_logic" {
  for_each = {
    for d in fastly_service_vcl.orion_cache.dynamicsnippet : d.name => d if d.name == "Convert Post to Get"
  }
  service_id = fastly_service_vcl.orion_cache.id
  snippet_id = each.value.snippet_id
  content    = <<-VCL
                if (req.method == "POST" && req.url.path == "/graphql") {
                    if (req.body) {
                      set req.http.X-GraphQL-Query = json.escape(req.body);
                      if (req.body ~ "mutation") {
                        set req.http.X-Mutation = "true";
                        # Keep as POST for mutations, pass through without caching
                        return(pass);
                      } else if (req.body ~ "query") {
                        # Queries: convert to GET for caching
                        set req.method = "GET";
                        return(lookup);
                      }
                    }
                    return(pass);
                }
                if (req.http.X-GraphQL-Query) {
                    return(lookup);
                }
                if (req.method == "GET" && req.url.path == "/health") {
                  set req.http.X-Health-Check = "pass";
                  return(pass);
                }
            VCL

}

resource "fastly_service_dynamic_snippet_content" "hash_logic" {
  for_each = {
    for d in fastly_service_vcl.orion_cache.dynamicsnippet : d.name => d if d.name == "Hash on X-GraphQL-Query"
  }
  service_id = fastly_service_vcl.orion_cache.id
  snippet_id = each.value.snippet_id
  content    = <<-VCL
                if (req.http.X-GraphQL-Query) {
                  set req.hash += digest.hash_md5(req.http.x-graphql-query);
                }
              VCL
}

resource "fastly_service_dynamic_snippet_content" "miss_logic" {
  for_each = {
    for d in fastly_service_vcl.orion_cache.dynamicsnippet : d.name => d if d.name == "Trigger Request to Compute Service"
  }
  service_id = fastly_service_vcl.orion_cache.id
  snippet_id = each.value.snippet_id
  content    = <<-VCL
                set bereq.http.host = "${local.compute_domain}";
               VCL

}

resource "fastly_service_dynamic_snippet_content" "pass_logic" {
  for_each = {
    for d in fastly_service_vcl.orion_cache.dynamicsnippet : d.name => d if d.name == "Route Mutations to Backend"
  }
  service_id = fastly_service_vcl.orion_cache.id
  snippet_id = each.value.snippet_id
  content    = <<-VCL
      set req.backend = F_${local.cdn_backend_name};
      set bereq.http.host = "${local.compute_domain}";
    VCL
}

resource "fastly_service_dynamic_snippet_content" "fetch_logic" {
  for_each = {
    for d in fastly_service_vcl.orion_cache.dynamicsnippet : d.name => d if d.name == "Apply Backend Cache Settings"
  }
  service_id = fastly_service_vcl.orion_cache.id
  snippet_id = each.value.snippet_id
  content    = <<-VCL
      declare local var.ttl INTEGER;
      declare local var.swr INTEGER;
      declare local var.sie INTEGER;

      if (bereq.http.X-Mutation == "true") {
        # Ensure mutations are never cached
        set beresp.cacheable = false;
        set beresp.ttl = 0s;
      } else if (beresp.http.Surrogate-Control) {
        # Handle no-store directive (Stellate-like: don't cache unless rules define caching)
        if (beresp.http.Surrogate-Control ~ "no-store") {
          set beresp.cacheable = false;
          set beresp.ttl = 0s;
        } else if (beresp.http.Surrogate-Control ~ "max-age=([0-9]+)") {
          # Respect Surrogate-Control TTL from Compute service
          set var.ttl = std.atoi(re.group.1);
          set beresp.ttl = var.ttl;

          # Handle stale-while-revalidate
          if (beresp.http.Surrogate-Control ~ "stale-while-revalidate=([0-9]+)") {
            set var.swr = std.atoi(re.group.1);
            set beresp.stale_while_revalidate = var.swr;
          }
          # Handle stale-if-error
          if (beresp.http.Surrogate-Control ~ "stale-if-error=([0-9]+)") {
            set var.sie = std.atoi(re.group.1);
            set beresp.stale_if_error = var.sie;
          }
        }
      }
    VCL
}

resource "fastly_service_dynamic_snippet_content" "deliver_logic" {
  for_each = {
    for d in fastly_service_vcl.orion_cache.dynamicsnippet : d.name => d if d.name == "Pass Debug Headers"
  }
  service_id = fastly_service_vcl.orion_cache.id
  snippet_id = each.value.snippet_id
  content    = <<-VCL
      # Pass through debug headers from Compute backend
      if (resp.http.X-Debug-Entity-Count) {
        set resp.http.X-Debug-Entity-Count = resp.http.X-Debug-Entity-Count;
      }
      if (resp.http.X-Debug-Entities) {
        set resp.http.X-Debug-Entities = resp.http.X-Debug-Entities;
      }
      if (resp.http.X-Purge-Keys) {
        set resp.http.X-Purge-Keys = resp.http.X-Purge-Keys;
      }
    VCL
}
