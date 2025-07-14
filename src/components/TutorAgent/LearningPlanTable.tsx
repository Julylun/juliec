import React from 'react';

interface PlanItem {
  id: number;
  title: string;
  goal: string;
  content: string;
  exercise?: string;
  resources?: string;
}

interface Props {
  plan: PlanItem[];
  editable?: boolean;
  onChange?: (plan: PlanItem[]) => void;
  onDelete?: (idx: number) => void;
}

const LearningPlanTable: React.FC<Props> = ({ plan, editable, onChange, onDelete }) => {
  const handleFieldChange = (idx: number, field: keyof PlanItem, value: string) => {
    if (!onChange) return;
    const newPlan = plan.map((item, i) => i === idx ? { ...item, [field]: value } : item);
    onChange(newPlan);
  };
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300 bg-white text-sm">
        <thead>
          <tr>
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Chương/Ngày</th>
            <th className="border px-2 py-1">Mục tiêu</th>
            <th className="border px-2 py-1">Nội dung</th>
            <th className="border px-2 py-1">Bài tập</th>
            <th className="border px-2 py-1">Tài nguyên</th>
            {editable && <th className="border px-2 py-1">Xóa</th>}
          </tr>
        </thead>
        <tbody>
          {plan.map((row, idx) => (
            <tr key={row.id}>
              <td className="border px-2 py-1 text-center">{row.id}</td>
              <td className="border px-2 py-1">
                {editable ? (
                  <input className="w-full p-1 border rounded" value={row.title} onChange={e => handleFieldChange(idx, 'title', e.target.value)} />
                ) : row.title}
              </td>
              <td className="border px-2 py-1">
                {editable ? (
                  <input className="w-full p-1 border rounded" value={row.goal} onChange={e => handleFieldChange(idx, 'goal', e.target.value)} />
                ) : row.goal}
              </td>
              <td className="border px-2 py-1">
                {editable ? (
                  <textarea className="w-full p-1 border rounded" rows={2} value={row.content} onChange={e => handleFieldChange(idx, 'content', e.target.value)} />
                ) : row.content}
              </td>
              <td className="border px-2 py-1">
                {editable ? (
                  <textarea className="w-full p-1 border rounded" rows={2} value={row.exercise} onChange={e => handleFieldChange(idx, 'exercise', e.target.value)} />
                ) : row.exercise}
              </td>
              <td className="border px-2 py-1">
                {editable ? (
                  <input className="w-full p-1 border rounded" value={row.resources} onChange={e => handleFieldChange(idx, 'resources', e.target.value)} />
                ) : row.resources ? <a href={row.resources} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">{row.resources}</a> : ''}
              </td>
              {editable && (
                <td className="border px-2 py-1 text-center">
                  <button className="text-red-500 font-bold" onClick={() => onDelete && onDelete(idx)} title="Xóa chương/ngày">✕</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LearningPlanTable; 