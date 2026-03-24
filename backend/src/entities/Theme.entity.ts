import { Entity, Column } from 'typeorm';
import { BaseAsset } from './BaseAsset.entity.ts';

/** Custom UI themes and color palettes */
@Entity('themes')
export class Theme extends BaseAsset {
  @Column({ type: 'jsonb', default: {} })
  colors: Record<string, string>;
}
