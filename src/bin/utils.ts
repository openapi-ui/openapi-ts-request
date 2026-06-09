import type { GenerateServiceProps } from '../index';

/**
 * Helper function to create multiselect options with proper typing
 */
export function createMultiselectOptions(
  configs: GenerateServiceProps[]
): Array<{ value: GenerateServiceProps; label: string }> {
  return configs.map((config) => ({
    value: config,
    label:
      config.describe ||
      ('schemaPath' in config ? config.schemaPath : 'Apifox Config'),
  }));
}

export function parseInteractiveMode(value: unknown): boolean {
  if (value === undefined) {
    return true;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  return JSON.parse(value as string) === true;
}
