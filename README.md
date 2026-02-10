# @orion/infra

Infrastructure provisioning package for Orion GraphQL Edge Cache.

## Overview

This package automates the deployment and destruction of edge caching infrastructure combining AWS and Fastly services. It provides both high-level and low-level APIs for infrastructure management, abstracting away the complexity of multi-cloud orchestration.

## Architecture

The infrastructure consists of three layers:

```
Client Request
      ↓
Fastly CDN (VCL) ← HTTP caching layer
      ↓
Fastly Compute@Edge ← Application logic layer
      ↓
Backend GraphQL API
```

Plus a logging pipeline: Fastly → AWS Kinesis → S3

## What's Inside

- **iac/** - Terraform modules for AWS and Fastly infrastructure
  - AWS: Kinesis streams, S3 buckets, IAM roles for logging
  - Fastly: CDN service, Compute@Edge service, Config/Secret stores
- **edge/** - Fastly Compute@Edge application (GraphQL caching engine)
- **src/** - TypeScript orchestration code for deployment/destruction

## Installation

```bash
npm install @orion/infra
```

## Usage

### High-level API

```typescript
import { deployInfrastructure, destroyInfrastructure } from '@orion/infra';

// Deploy all infrastructure
await deployInfrastructure({
  aws: { accessKeyId, secretAccessKey, region },
  fastly: { apiToken },
  backend: { graphqlUrl },
  onProgress: (event) => console.log(event.message),
});

// Destroy all infrastructure
await destroyInfrastructure({
  awsAccessKeyId,
  awsSecretAccessKey,
  awsRegion,
  fastlyApiToken,
});
```

### Low-level API

For granular control over deployment steps:

```typescript
import {
  initTerraform,
  applyTerraform,
  getTerraformOutputs,
  processComputeTemplates,
  buildCompute,
  deployCompute,
} from '@orion/infra';

// Step-by-step deployment
await initTerraform();
await applyTerraform(config);
const outputs = getTerraformOutputs();
await processComputeTemplates(outputs);
await buildCompute();
await deployCompute(fastlyToken);
```

## Infrastructure Components

### AWS Resources
| Resource | Purpose |
|----------|---------|
| Kinesis Stream | Real-time log streaming from Fastly |
| S3 Bucket | Log storage and archival |
| IAM Roles | Access control for Fastly → AWS integration |

### Fastly Resources
| Resource | Purpose |
|----------|---------|
| VCL Service | HTTP caching layer with cache key construction |
| Compute@Edge | Request processing and response analysis |
| Config Store | Dynamic cache configuration storage |
| Secret Store | Secure credential storage |

## Requirements

- Node.js 18+
- Terraform CLI (>= 1.0)
- AWS credentials with permissions for Kinesis, S3, IAM
- Fastly API token with full access

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Build Compute@Edge application
cd edge && npm run build
```

## License

MIT
