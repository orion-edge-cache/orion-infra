/**
 * Types for @orion/infra
 * Consolidated from CLI and server deployment code
 */

export interface DeployConfig {
  aws: {
    accessKeyId?: string;
    secretAccessKey?: string;
    region: string;
    useEnv?: boolean;
  };
  fastly: {
    apiToken?: string;
    useEnv?: boolean;
  };
  backend: {
    graphqlUrl: string;
    hostOverride?: string;
  };
  saveCredentials?: boolean;
  copyFromEnv?: {
    aws?: boolean;
    fastly?: boolean;
  };
}

export interface DestroyConfig {
  fastlyApiToken: string;
  awsAccessKeyId: string;
  awsSecretAccessKey: string;
  awsRegion: string;
}

export interface TerraformOutput {
  instance_id: { value: string };
  compute_service: {
    value: {
      domain_name: string;
      id: string;
      name: string;
      backend_domain: string;
      backend_port: number;
      backend_protocol: string;
      backend_host_override: string;
    };
  };
  cdn_service: {
    value: {
      domain_name: string;
      id: string;
      name: string;
    };
  };
  configstore: {
    value: {
      name: string;
      id: string;
    };
  };
  secretstore: {
    value: {
      name: string;
      id: string;
    };
  };
  kinesis_stream: {
    value: {
      name: string;
      arn: string;
    };
  };
  s3_bucket: {
    value: {
      arn: string;
      name: string;
      bucket_domain_name: string;
    };
  };
  iam_role: {
    value: {
      arn: string;
      name: string;
    };
  };
  // Optional fields used by compute templates
  logging_endpoint?: { value: string };
  aws_region?: { value: string };
}

export interface ProgressEvent {
  step: string;
  message: string;
  progress: number;
  error?: string;
}

export type ProgressCallback = (event: ProgressEvent) => void;
