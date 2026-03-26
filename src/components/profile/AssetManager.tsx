import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Trash2, Link, Image as ImageIcon, Film } from 'lucide-react';
import { fetchProfileAssets, uploadProfileAsset, deleteProfileAsset } from '../../api/profile-assets';
import { useAuth } from '../../hooks/useAuth';
import styles from './AssetManager.module.css';

interface AssetManagerProps {
  onInsertUrl: (url: string) => void;
}

export default function AssetManager({ onInsertUrl }: AssetManagerProps) {
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['profile-assets', user?.id],
    queryFn: fetchProfileAssets,
    enabled: !!user,
  });

  const uploadMutation = useMutation({
    mutationFn: uploadProfileAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-assets'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProfileAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-assets'] });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const filteredAssets = assets.filter(a => a.type === activeTab);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Asset Manager</h3>
        <div className={styles.tabs}>
          <button 
            className={activeTab === 'image' ? styles.activeTab : ''} 
            onClick={() => setActiveTab('image')}
          >
            <ImageIcon size={14} /> Images
          </button>
          <button 
            className={activeTab === 'video' ? styles.activeTab : ''} 
            onClick={() => setActiveTab('video')}
          >
            <Film size={14} /> Videos
          </button>
        </div>
      </div>

      <div className={styles.uploadZone} onClick={() => fileInputRef.current?.click()}>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept={activeTab === 'image' ? 'image/*,image/webp' : 'video/mp4,video/webm'}
          onChange={handleFileChange}
        />
        <Upload size={24} />
        <p>{uploadMutation.isPending ? 'Uploading...' : `Click to upload ${activeTab}`}</p>
      </div>

      {uploadMutation.isError && (
        <div className={styles.errorText}>
          Upload failed: {uploadMutation.error?.message}
        </div>
      )}

      <div className={styles.assetGrid}>
        {isLoading ? (
          <div className={styles.loading}>Loading assets...</div>
        ) : filteredAssets.length === 0 ? (
          <div className={styles.empty}>No {activeTab}s uploaded yet.</div>
        ) : (
          filteredAssets.map(asset => (
            <div key={asset.id} className={styles.assetCard}>
              <div className={styles.preview}>
                {asset.type === 'image' ? (
                  <img src={`/${asset.file_path}`} alt={asset.original_name} />
                ) : (
                  <video src={`/${asset.file_path}`} muted loop onMouseOver={e => e.currentTarget.play()} onMouseOut={e => e.currentTarget.pause()} />
                )}
              </div>
              <div className={styles.assetInfo}>
                <span className={styles.assetName} title={asset.original_name}>
                  {asset.original_name}
                </span>
                <span className={styles.assetSize}>
                  {(asset.size_bytes / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <div className={styles.actions}>
                <button 
                  onClick={() => onInsertUrl(`/${asset.file_path}`)}
                  title="Insert URL into editor"
                >
                  <Link size={14} />
                </button>
                <button 
                  className={styles.deleteBtn}
                  onClick={() => {
                    if (confirm('Delete this asset?')) {
                      deleteMutation.mutate(asset.id);
                    }
                  }}
                  title="Delete asset"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
