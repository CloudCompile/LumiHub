import { Entity, Column } from 'typeorm';
import type { CharacterAsset, Lorebook } from '../types/character.ts';
import { BaseAsset } from './BaseAsset.entity.ts';

/**
 * Persistent character card entity backed by PostgreSQL.
 * Inherits standard fields (id, name, description, owner, downloads, dates) from BaseAsset.
 */
@Entity('characters')
export class Character extends BaseAsset {
  @Column({ type: 'varchar', length: 255, nullable: true })
  nickname: string | null;

  @Column({ type: 'text', default: '' })
  personality: string;

  @Column({ type: 'text', default: '' })
  scenario: string;

  @Column({ type: 'text', default: '' })
  first_mes: string;

  @Column({ type: 'jsonb', default: [] })
  alternate_greetings: string[];

  @Column({ type: 'jsonb', default: [] })
  group_only_greetings: string[];

  @Column({ type: 'text', default: '' })
  mes_example: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  creator: string;

  @Column({ type: 'text', default: '' })
  creator_notes: string;

  @Column({ type: 'jsonb', nullable: true })
  creator_notes_multilingual: Record<string, string> | null;

  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  @Column({ type: 'varchar', length: 64, default: '1.0' })
  character_version: string;

  @Column({ type: 'text', default: '' })
  system_prompt: string;

  @Column({ type: 'text', default: '' })
  post_history_instructions: string;

  @Column({ type: 'jsonb', nullable: true })
  source: string[] | null;

  @Column({ type: 'jsonb', default: [] })
  assets: CharacterAsset[];

  @Column({ type: 'jsonb', nullable: true })
  character_book: Lorebook | null;

  @Column({ type: 'jsonb', default: {} })
  extensions: Record<string, any>;

  @Column({ type: 'bigint', nullable: true })
  creation_date: number | null;

  @Column({ type: 'bigint', nullable: true })
  modification_date: number | null;
}
