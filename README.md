# @orion/infra

Infrastructure provisioning package for Orion GraphQL Edge Cache.

## What's Inside

- **iac/** - Terraform modules for AWS and Fastly infrastructure
- **edge/** - Fastly Compute@Edge application
- **src/** - TypeScript orchestration code for deployment/destruction

## Installation

```bash
npm install github:orion-edge-cache/orion-infra
```

## Usage

### High-level API

```typescript
import { deployInfrastructure, destroyInfrastructure } from '@orion/infra';

// Deploy
await deployInfrastructure({
  aws: { accessKeyId, secretAccessKey, region },
  fastly: { apiToken },
  backend: { graphqlUrl },
  onProgress: (event) => console.log(event.message),
});

// Destroy
await destroyInfrastructure({
  awsAccessKeyId,
  awsSecretAccessKey,
  awsRegion,
  fastlyApiToken,
});
```

### Low-level API

```typescript
import {
  initTerraform,
  applyTerraform,
  getTerraformOutputs,
  processComputeTemplates,
  buildCompute,
  deployCompute,
} from '@orion/infra';

// Granular control over deployment steps
await initTerraform();
await applyTerraform(config);
const outputs = getTerraformOutputs();
await processComputeTemplates(outputs);
await buildCompute();
await deployCompute(fastlyToken);
```

## License

MIT
