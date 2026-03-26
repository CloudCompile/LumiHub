import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User.entity.ts';

export type ProfileAssetType = 'image' | 'video';

@Entity('profile_assets')
export class ProfileAsset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ type: 'uuid' })
  owner_id: string;

  @Column({ type: 'varchar', length: 512 })
  file_path: string;

  @Column({ type: 'varchar', length: 50 })
  type: ProfileAssetType;

  @Column({ type: 'varchar', length: 255 })
  original_name: string;

  @Column({ type: 'int' })
  size_bytes: number;

  @CreateDateColumn()
  created_at: Date;
}
