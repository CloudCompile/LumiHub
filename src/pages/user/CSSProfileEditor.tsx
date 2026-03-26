import { useState, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { css } from '@codemirror/lang-css';
import { EditorView } from '@codemirror/view';
import AssetManager from '../../components/profile/AssetManager';
import styles from './CSSProfileEditor.module.css';
import { Save, X, Code, Image as ImageIcon, BookOpen } from 'lucide-react';

//todo const CSS_GUIDE = [];

interface CSSProfileEditorProps {
    currentCss: string;
    onChange: (val: string) => void;
    onClose: (saved: boolean) => void;
}

export default function CSSProfileEditor({ currentCss, onChange, onClose }: CSSProfileEditorProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'editor' | 'assets' | 'guide'>('editor');

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/v1/user/@me/profile-css', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ css: currentCss })
            });
            if (res.ok) {
                onClose(true);
            } else {
                const data = await res.json().catch(() => null);
                alert(`Failed to save CSS: ${data?.error || 'Unknown error'}`);
            }
        } catch (e) {
            console.error(e);
            alert('Failed to save CSS. Please check your connection.');
        }
        setIsSaving(false);
    };

    const handleInsertUrl = useCallback((url: string) => {
        onChange(currentCss + `\n/* Inserted Asset */\nurl('${url}')`);
        setActiveTab('editor');
    }, [currentCss, onChange]);

    const insertSnippet = (code: string) => {
        onChange(currentCss + (currentCss.endsWith('\n') ? '' : '\n') + code + '\n');
        setActiveTab('editor');
    };

    return (
        <div className={styles.drawer}>
            <div className={styles.header}>
                <h2>Profile Theme Editor</h2>
                <div className={styles.actions}>
                    <button className={styles.saveBtn} onClick={handleSave} disabled={isSaving}>
                        <Save size={16} /> {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button className={styles.closeBtn} onClick={() => onClose(false)} title="Close Editor">
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div className={styles.tabs}>
                <button className={activeTab === 'editor' ? styles.activeTab : ''} onClick={() => setActiveTab('editor')}>
                    <Code size={16} /> Editor
                </button>
                <button className={activeTab === 'assets' ? styles.activeTab : ''} onClick={() => setActiveTab('assets')}>
                    <ImageIcon size={16} /> Assets
                </button>
                <button className={activeTab === 'guide' ? styles.activeTab : ''} onClick={() => setActiveTab('guide')}>
                    <BookOpen size={16} /> Guide
                </button>
            </div>

            <div className={styles.tabContent}>
                {activeTab === 'editor' && (
                    <div className={styles.editorWrapper}>
                        <CodeMirror
                            value={currentCss}
                            height="100%"
                            theme="dark"
                            extensions={[css(), EditorView.lineWrapping]}
                            onChange={onChange}
                            className={styles.codeMirror}
                        />
                    </div>
                )}
                {activeTab === 'assets' && (
                    <div className={styles.assetsWrapper}>
                        <AssetManager onInsertUrl={handleInsertUrl} />
                    </div>
                )}
                {activeTab === 'guide' && (
                    <div className={styles.guideWrapper}>
                        <div className={styles.guideIntro}>
                            Customize your profile using CSS. Selectors are scoped to <code>#lumihub-user-profile</code>.
                            <br /><br />
                            <strong>Available Components:</strong><br/>
                            <code>.profile-banner</code>, <code>.profile-header</code>, <code>.profile-avatar</code>, <code>.profile-name</code>, <code>.profile-handle</code>, <code>.profile-stats</code>, <code>.profile-tabs</code>, <code>.profile-content</code>.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
