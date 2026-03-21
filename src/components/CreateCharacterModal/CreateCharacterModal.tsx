import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { X, Upload, Image as ImageIcon, Check, AlertCircle, FileCheck } from 'lucide-react';
import { createCharacter } from '../../api/characters';
import { useCharacterStore } from '../../store/useCharacterStore';
import { parseCharacterPng } from '../../utils/pngParser';
import styles from './CreateCharacterModal.module.css';

interface Props {
  onClose: () => void;
}

/** Modal form for creating a character, with auto-fill from PNG card data. */
const CreateCharacterModal: React.FC<Props> = ({ onClose }) => {
  const refresh = useCharacterStore((s) => s.refresh);
  const source = useCharacterStore((s) => s.source);

  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [personality, setPersonality] = useState('');
  const [scenario, setScenario] = useState('');
  const [firstMes, setFirstMes] = useState('');
  const [tags, setTags] = useState('');
  const [creator, setCreator] = useState('');
  const [creatorNotes, setCreatorNotes] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [autofilled, setAutofilled] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'image/png') {
      setError('Image must be PNG format.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5 MB.');
      return;
    }

    setImage(file);
    setError(null);

    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    const parsed = await parseCharacterPng(file);
    if (parsed) {
      setName(parsed.name || name);
      setDescription(parsed.description || description);
      setPersonality(parsed.personality || personality);
      setScenario(parsed.scenario || scenario);
      setFirstMes(parsed.first_mes || firstMes);
      setCreator(parsed.creator || creator);
      setCreatorNotes(parsed.creator_notes || creatorNotes);
      if (parsed.tags.length > 0) {
        setTags(parsed.tags.join(', '));
      }
      setAutofilled(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Character name is required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const characterData = {
        name: name.trim(),
        description,
        personality,
        scenario,
        first_mes: firstMes,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        creator,
        creator_notes: creatorNotes,
      };

      await createCharacter(characterData, image ?? undefined);
      setSuccess(true);

      if (source === 'lumihub') {
        await refresh();
      }

      setTimeout(onClose, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to create character.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.modal}
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={20} />
        </button>

        <h2 className={styles.title}>Create Character</h2>
        <p className={styles.subtitle}>
          Upload a character card PNG to auto-fill, or fill in the fields manually. Only the name is required.
        </p>

        {success ? (
          <div className={styles.successState}>
            <Check size={48} />
            <span>Character created!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.imageUpload} onClick={() => fileInputRef.current?.click()}>
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
              ) : (
                <div className={styles.imagePlaceholder}>
                  <ImageIcon size={32} />
                  <span>Drop a character card PNG to auto-fill, or click to browse</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </div>

            {autofilled && (
              <div className={styles.autofillBanner}>
                <FileCheck size={16} />
                Character data detected and auto-filled from PNG. Review and edit as needed.
              </div>
            )}

            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <label>Name *</label>
                <input
                  type="text"
                  placeholder="Character name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className={styles.field}>
                <label>Creator</label>
                <input
                  type="text"
                  placeholder="Your name or handle"
                  value={creator}
                  onChange={(e) => setCreator(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label>Description</label>
              <textarea
                placeholder="Who is this character? Background, appearance, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className={styles.field}>
              <label>Personality</label>
              <textarea
                placeholder="Personality traits, quirks, behavior patterns"
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
                rows={2}
              />
            </div>

            <div className={styles.field}>
              <label>Scenario</label>
              <textarea
                placeholder="The setting or situation for conversations"
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                rows={2}
              />
            </div>

            <div className={styles.field}>
              <label>First Message</label>
              <textarea
                placeholder="The opening message this character sends"
                value={firstMes}
                onChange={(e) => setFirstMes(e.target.value)}
                rows={3}
              />
            </div>

            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <label>Tags</label>
                <input
                  type="text"
                  placeholder="fantasy, romance, adventure"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label>Creator Notes</label>
                <input
                  type="text"
                  placeholder="Notes for users of this character"
                  value={creatorNotes}
                  onChange={(e) => setCreatorNotes(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className={styles.errorBox}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              <Upload size={18} />
              {submitting ? 'Uploading...' : 'Create Character'}
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
};

export default CreateCharacterModal;
