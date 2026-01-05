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
      id: string;
      backend_domain: string;
      backend_port: number;
      backend_protocol: string;
    };
  };
  kinesis_stream?: { value: { name: string } };
  aws_region?: { value: string };
  logging_endpoint?: { value: string };
}

export interface ProgressEvent {
  step: string;
  message: string;
  progress: number;
  error?: string;
}

export type ProgressCallback = (event: ProgressEvent) => void;
