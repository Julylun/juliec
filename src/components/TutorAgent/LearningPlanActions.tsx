import React from 'react';

interface Props {
  onEdit?: () => void;
  onStart?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  onSendAI?: () => void;
  editMode?: boolean;
  editLoading?: boolean;
  disableSave?: boolean;
  disableSendAI?: boolean;
}

const LearningPlanActions: React.FC<Props> = ({ onEdit, onStart, onSave, onCancel, onSendAI, editMode, editLoading, disableSave, disableSendAI }) => {
  if (editMode) {
    return (
      <div className="flex gap-2 mt-2">
        <button className="px-3 py-1 rounded bg-green-600 text-white font-semibold hover:bg-green-700" onClick={onSave} disabled={disableSave}>Lưu chỉnh sửa</button>
        <button className="px-3 py-1 rounded bg-gray-400 text-white font-semibold hover:bg-gray-500" onClick={onCancel}>Hủy</button>
        <button
          className="px-3 py-1 rounded bg-green-700 text-white font-semibold hover:bg-green-800 disabled:opacity-60"
          onClick={onSendAI}
          disabled={editLoading || disableSendAI}
        >
          {editLoading ? 'Đang gửi lại...' : 'Gửi lại lộ trình đã chỉnh sửa cho AI'}
        </button>
      </div>
    );
  }
  return (
    <div className="flex gap-2 mt-2">
      <button className="px-3 py-1 rounded bg-yellow-500 text-white font-semibold hover:bg-yellow-600" onClick={onEdit}>Chỉnh sửa lộ trình</button>
      <button className="px-3 py-1 rounded bg-green-600 text-white font-semibold hover:bg-green-700" onClick={onStart}>Bắt đầu học</button>
    </div>
  );
};

export default LearningPlanActions; 