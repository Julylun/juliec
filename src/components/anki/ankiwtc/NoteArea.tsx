import React from 'react';

interface NoteAreaProps {
  note: string;
  setNote: (v: string) => void;
  loading: boolean;
}

const NoteArea: React.FC<NoteAreaProps> = ({ note, setNote, loading }) => (
  <textarea
    className="w-full max-w-3xl mb-6 p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)]"
    rows={3}
    placeholder="Ghi chú cho LLM (nếu có)..."
    value={note}
    onChange={e => setNote(e.target.value)}
    disabled={loading}
  />
);

export default NoteArea; 