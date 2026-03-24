import { Entity, Column } from 'typeorm';
import { BaseAsset } from './BaseAsset.entity.ts';

/** Lorebooks and world dictionaries */
@Entity('worldbooks')
export class Worldbook extends BaseAsset {
  @Column({ type: 'jsonb', default: {} })
  entries: Record<string, any>;
}
