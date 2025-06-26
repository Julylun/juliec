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
    placeholder="Mong muốn chi tiết (điều mà bạn muốn AI sẽ làm với từ vựng của bạn. Ví dụ: Cột Word ở ouput phải là chữ thường (lowercase)"
    value={note}
    onChange={e => setNote(e.target.value)}
    disabled={loading}
  />
);

export default NoteArea; 