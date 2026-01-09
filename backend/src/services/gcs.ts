import { Storage } from '@google-cloud/storage';
import { ProjectConfig, ProjectConfigSchema } from '../domain/types.js';

const storage = new Storage();

export class GcsConfigStore {
  constructor(private bucketName: string) {}

  private filePath(projectId: string) {
    return `configs/${projectId}.json`;
  }

  async getConfig(projectId: string): Promise<{ config: ProjectConfig; generation: string }> {
    const bucket = storage.bucket(this.bucketName);
    const file = bucket.file(this.filePath(projectId));

    const [exists] = await file.exists();
    if (!exists) {
      throw new Error('config_not_found');
    }

    const [contents] = await file.download();
    const [metadata] = await file.getMetadata();
    const parsed = ProjectConfigSchema.parse(JSON.parse(contents.toString('utf8')));
    return { config: parsed, generation: String(metadata.generation ?? '') };
  }

  async saveConfig(
    projectId: string,
    config: ProjectConfig,
    expectedGeneration?: string,
  ): Promise<{ generation: string }> {
    const bucket = storage.bucket(this.bucketName);
    const file = bucket.file(this.filePath(projectId));

    const data = JSON.stringify(config, null, 2);

    const saveOptions =
      expectedGeneration !== undefined
        ? ({ ifGenerationMatch: Number(expectedGeneration) } as any)
        : undefined;

    try {
      await file.save(data, saveOptions);
      const [metadata] = await file.getMetadata();
      return { generation: String(metadata.generation ?? '') };
    } catch (err: any) {
      if (err?.code === 412) {
        // Precondition failed
        throw new Error('generation_mismatch');
      }
      throw err;
    }
  }
}

