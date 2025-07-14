import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { GeminiService } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import LearningPlanTable from '../components/TutorAgent/LearningPlanTable';
import LearningPlanActions from '../components/TutorAgent/LearningPlanActions';
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

const TutorAgent: React.FC = () => {
  const { settings } = useSettings();
  const [goal, setGoal] = useState('');
  const [level, setLevel] = useState('');
  const [subject, setSubject] = useState('');
  const [timePerWeek, setTimePerWeek] = useState(5);
  const [weeks, setWeeks] = useState(12);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedPlan, setParsedPlan] = useState<any[] | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedJson, setEditedJson] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editRows, setEditRows] = useState<any[] | null>(null);
  const [plans, setPlans] = useState<any[]>([]); // Danh sách lộ trình
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [planName, setPlanName] = useState('');

  const navigate = useNavigate();

  // Load plans từ localStorage khi vào trang
  useEffect(() => {
    const saved = localStorage.getItem('tutor_agent_plans');
    if (saved) {
      try {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr)) setPlans(arr);
      } catch {}
    }
  }, []);

  // Khi chọn lộ trình, set parsedPlan
  useEffect(() => {
    if (selectedPlanId) {
      const planObj = plans.find(p => p.id === selectedPlanId);
      if (planObj) {
        setParsedPlan(planObj.plan);
        setResult(JSON.stringify(planObj.plan, null, 2)); // Luôn đồng bộ result với parsedPlan khi chọn lộ trình
      }
    } else {
      setParsedPlan(null);
      setResult(null); // Ẩn content lộ trình học khi bỏ chọn
    }
  }, [selectedPlanId, plans]);

  // Khi tạo mới lộ trình thành công, lưu vào danh sách
  const handleCreatePlan = async () => {
    if (!planName.trim()) {
      toast.error('Vui lòng nhập tên lộ trình!');
      return;
    }
    setLoading(true);
    setResult(null);
    setParsedPlan(null);
    setError(null);
    try {
      const gemini = new GeminiService(settings.geminiKey, settings.geminiModel);
      const prompt = `Bạn là một AI tutor chuyên nghiệp. Hãy giúp tôi lên một lộ trình học chi tiết cho môn học sau:\n\n- Môn học/ngôn ngữ: ${subject}\n- Trình độ hiện tại: ${level}\n- Mục tiêu: ${goal}\n- Thời gian học mỗi tuần: ${timePerWeek} giờ\n- Tổng số tuần dự kiến: ${weeks}\n\nYêu cầu:\n1. Chia lộ trình thành các chương (chapter) hoặc ngày (day), mỗi chương/ngày có tiêu đề, mục tiêu, nội dung chính, bài tập hoặc hoạt động cụ thể.\n2. Nếu chia theo chương, mỗi chương nên có số buổi/ngày học gợi ý.\n3. Nếu chia theo ngày, mỗi ngày nên có tiêu đề, nội dung, bài tập rõ ràng.\n4. Mỗi chương/ngày nên có trường (field) rõ ràng: id, title, goal, content, exercise, resources (nếu có).\n5. Trình bày lộ trình dưới dạng mảng JSON hoặc bảng markdown với các trường trên, để các agent khác có thể dễ dàng truy xuất từng chương/ngày để giảng dạy, tạo quiz, flashcard...\n6. Nếu có thể, hãy gợi ý tài nguyên miễn phí, mẹo học hiệu quả cho từng chương/ngày.\n7. Trả lời bằng tiếng Việt, định dạng markdown, ưu tiên mảng JSON nếu có thể.\n\nVí dụ (một phần):\n\n\`\`\`json\n[\n  {\n    "id": 1,\n    "title": "Giới thiệu bảng chữ cái",\n    "goal": "Nắm vững bảng chữ cái cơ bản",\n    "content": "Học thuộc 46 ký tự Hiragana, luyện viết và phát âm.",\n    "exercise": "Viết mỗi ký tự 5 lần, đọc to từng ký tự.",\n    "resources": "https://www.tofugu.com/japanese/learn-hiragana/"\n  },\n  {\n    "id": 2,\n    "title": "Chào hỏi cơ bản",\n    "goal": "Biết cách chào hỏi, giới thiệu bản thân",\n    "content": "Học các mẫu câu chào hỏi, tự giới thiệu, hỏi thăm sức khỏe.",\n    "exercise": "Luyện nói các mẫu câu với bạn bè.",\n    "resources": "https://www.japanesepod101.com/"\n  }\n]\`\`\`\n\nHoặc bảng markdown với các cột: id, title, goal, content, exercise, resources.\n\nLưu ý: Nếu môn học có giáo trình/chương trình chuẩn, hãy chia theo chương. Nếu không, chia theo ngày học hợp lý.`;
      const res = await gemini.generateContent(prompt);
      setResult(res);
      // Tìm và parse JSON nếu có
      const jsonMatch = res.match(/```json([\s\S]*?)```/i) || res.match(/\[\s*{[\s\S]*?}\s*\]/);
      let planArr = null;
      if (jsonMatch) {
        let jsonStr = jsonMatch[1] || jsonMatch[0];
        // Loại bỏ ```json và ``` nếu có
        jsonStr = jsonStr.replace(/```json|```/gi, '').trim();
        try {
          planArr = JSON.parse(jsonStr);
          if (Array.isArray(planArr)) {
            const newPlan = { id: uuidv4(), name: planName, createdAt: new Date().toISOString(), plan: planArr };
            const newPlans = [...plans, newPlan];
            setPlans(newPlans);
            localStorage.setItem('tutor_agent_plans', JSON.stringify(newPlans));
            setSelectedPlanId(newPlan.id);
            setParsedPlan(planArr);
            toast.success('Tạo lộ trình học thành công!');
          }
        } catch (e: any) {
          setParsedPlan(null);
          toast.error('Lỗi khi phân tích lộ trình: ' + (e?.message || 'Không xác định. Có thể Gemini trả về JSON không hợp lệ.'));
        }
      } else {
        toast.success('Tạo lộ trình học thành công!');
      }
    } catch (e: any) {
      const errMsg = e?.message || 'Lỗi không xác định';
      setError(errMsg);
      if (errMsg.toLowerCase().includes('quota')) {
        toast.error('API key của bạn đã hết quota hoặc bị giới hạn!');
      } else if (errMsg.toLowerCase().includes('api key')) {
        toast.error('API key không hợp lệ hoặc đã hết hạn!');
      } else if (errMsg.toLowerCase().includes('network')) {
        toast.error('Lỗi mạng, vui lòng kiểm tra kết nối Internet!');
      } else {
        toast.error('Tạo lộ trình học thất bại: ' + errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Khi có parsedPlan, cho phép chỉnh sửa
  const handleEditPlan = () => {
    if (parsedPlan) {
      setEditRows(parsedPlan.map(row => ({ ...row })));
      setEditMode(true);
    }
  };

  const handleRowChange = (idx: number, field: string, value: string) => {
    setEditRows(rows => rows && rows.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };

  const handleAddRow = () => {
    setEditRows(rows => rows ? [...rows, { id: rows.length + 1, title: '', goal: '', content: '', exercise: '', resources: '' }] : null);
  };

  const handleDeleteRow = (idx: number) => {
    setEditRows(rows => rows && rows.filter((_, i) => i !== idx).map((row, i) => ({ ...row, id: i + 1 })));
  };

  const handleSaveEdit = () => {
    if (!editRows) return;
    // Validate: title, goal, content không được để trống
    for (const [i, row] of editRows.entries()) {
      if (!row.title.trim()) {
        setError(`Chưa nhập tiêu đề cho chương/ngày số ${i + 1}!`);
        toast.error(`Chưa nhập tiêu đề cho chương/ngày số ${i + 1}!`);
        return;
      }
      if (!row.goal.trim()) {
        setError(`Chưa nhập mục tiêu cho chương/ngày số ${i + 1}!`);
        toast.error(`Chưa nhập mục tiêu cho chương/ngày số ${i + 1}!`);
        return;
      }
      if (!row.content.trim()) {
        setError(`Chưa nhập nội dung cho chương/ngày số ${i + 1}!`);
        toast.error(`Chưa nhập nội dung cho chương/ngày số ${i + 1}!`);
        return;
      }
    }
    setParsedPlan(editRows);
    localStorage.setItem('tutor_agent_plan', JSON.stringify(editRows));
    setEditMode(false);
    toast.success('Lưu chỉnh sửa lộ trình thành công!');
  };

  const handleSubmitEditedPlan = async () => {
    setEditLoading(true);
    setError(null);
    try {
      let userPlan = null;
      try {
        userPlan = JSON.parse(editedJson);
      } catch (e: any) {
        setError('JSON không hợp lệ: ' + (e?.message || 'Không xác định.'));
        setEditLoading(false);
        toast.error('JSON không hợp lệ: ' + (e?.message || 'Không xác định.'));
        return;
      }
      // Gửi lại prompt cho Gemini để chỉnh sửa lộ trình dựa trên JSON mới
      const gemini = new GeminiService(settings.geminiKey, settings.geminiModel);
      const prompt = `Đây là lộ trình học do người dùng đã chỉnh sửa theo ý muốn. Hãy giúp tôi chỉnh sửa lại lộ trình này cho phù hợp hơn với mục tiêu, trình độ, thời gian học, và đưa ra các gợi ý cải thiện nếu cần. Trả về kết quả dưới dạng mảng JSON với các trường như cũ.\n\nLộ trình đã chỉnh sửa:\n\n\`\`\`json\n${editedJson}\`\`\`\n\nLưu ý: Nếu môn học có giáo trình/chương trình chuẩn, hãy chia theo chương. Nếu không, chia theo ngày học hợp lý.`;
      const res = await gemini.generateContent(prompt);
      setResult(res);
      // Tìm và parse lại JSON nếu có
      const jsonMatch = res.match(/```json([\s\S]*?)```/i) || res.match(/\[\s*{[\s\S]*?}\s*\]/);
      let planArr = null;
      if (jsonMatch) {
        let jsonStr = jsonMatch[1] || jsonMatch[0];
        jsonStr = jsonStr.replace(/```json|```/gi, '').trim();
        try {
          planArr = JSON.parse(jsonStr);
          if (Array.isArray(planArr)) {
            setParsedPlan(planArr);
            toast.success('AI đã tối ưu lại lộ trình!');
          }
        } catch (e: any) {
          setParsedPlan(null);
          toast.error('Lỗi khi phân tích lộ trình AI trả về: ' + (e?.message || 'Không xác định. Có thể Gemini trả về JSON không hợp lệ.'));
        }
      } else {
        toast.success('AI đã tối ưu lại lộ trình!');
      }
      setEditMode(false);
    } catch (e: any) {
      setError(e.message || 'Lỗi không xác định');
      toast.error('Gửi lại lộ trình cho AI thất bại: ' + (e?.message || 'Không xác định.'));
    } finally {
      setEditLoading(false);
    }
  };

  // Sau khi parse xong lộ trình, lưu vào localStorage
  useEffect(() => {
    if (parsedPlan) {
      localStorage.setItem('tutor_agent_plan', JSON.stringify(parsedPlan));
    }
  }, [parsedPlan]);

  // Khi bắt đầu học, lưu id lộ trình đang học
  const handleStartLearning = () => {
    if (!selectedPlanId) {
      toast.error('Bạn cần chọn lộ trình để bắt đầu học!');
      return;
    }
    localStorage.setItem('tutor_agent_current_plan', selectedPlanId);
    toast.success('Bắt đầu học lộ trình!');
    navigate('/learn/tutor-agent/teach');
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-[var(--bg-primary)] p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 text-[var(--text-primary)]">Tutor Agent 🤖</h1>
        <p className="text-[var(--text-secondary)]">Tạo agent lên lịch trình học tập cá nhân hóa cho bạn</p>
      </div>
      <div className="w-full max-w-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-6 shadow">
        <p className="text-[var(--text-primary)] mb-4">
          Tính năng này sẽ giúp bạn tạo một agent AI để lên kế hoạch học tập TOEIC cá nhân hóa dựa trên mục tiêu, thời gian và trình độ của bạn.
        </p>
        <div className="mb-6">
          <label className="block mb-2 text-[var(--text-primary)] font-semibold">Tên lộ trình:</label>
          <input
            className="w-full p-2 border border-[var(--border-color)] rounded bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
            value={planName}
            onChange={e => setPlanName(e.target.value)}
            placeholder="Ví dụ: Lộ trình N5 cấp tốc, Python cơ bản 12 tuần..."
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2 text-[var(--text-primary)] font-semibold">Môn học/ngôn ngữ:</label>
          <input
            className="w-full p-2 border border-[var(--border-color)] rounded bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Ví dụ: Tiếng Nhật, Lập trình Python, Toán cao cấp..."
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2 text-[var(--text-primary)] font-semibold">Mục tiêu học:</label>
          <input
            className="w-full p-2 border border-[var(--border-color)] rounded bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
            value={goal}
            onChange={e => setGoal(e.target.value)}
            placeholder="Ví dụ: Đạt N5, giao tiếp cơ bản, lập trình ứng dụng..."
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2 text-[var(--text-primary)] font-semibold">Trình độ hiện tại:</label>
          <input
            className="w-full p-2 border border-[var(--border-color)] rounded bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
            value={level}
            onChange={e => setLevel(e.target.value)}
            placeholder="Ví dụ: Mới bắt đầu, Đã học cơ bản..."
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2 text-[var(--text-primary)] font-semibold">Thời gian học mỗi tuần (giờ):</label>
          <input
            type="number"
            min={1}
            className="w-full p-2 border border-[var(--border-color)] rounded bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
            value={timePerWeek}
            onChange={e => setTimePerWeek(Number(e.target.value))}
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2 text-[var(--text-primary)] font-semibold">Tổng số tuần:</label>
          <input
            type="number"
            min={1}
            className="w-full p-2 border border-[var(--border-color)] rounded bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
            value={weeks}
            onChange={e => setWeeks(Number(e.target.value))}
          />
        </div>
        <button
          className="mt-2 px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-60"
          onClick={handleCreatePlan}
          disabled={loading || !subject.trim() || !goal.trim() || !level.trim() || !timePerWeek || !weeks}
        >
          {loading ? 'Đang tạo lộ trình...' : 'Tạo lộ trình học'}
        </button>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {result && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-[var(--text-primary)] whitespace-pre-wrap">
            <strong>Lộ trình học:</strong>
            {parsedPlan && !editMode && (
              <LearningPlanTable plan={parsedPlan} />
            )}
            {editMode && editRows && (
              <LearningPlanTable
                plan={editRows}
                editable
                onChange={rows => setEditRows(rows)}
                onDelete={idx => setEditRows(rows => rows && rows.filter((_, i) => i !== idx).map((row, i) => ({ ...row, id: i + 1 })))}
              />
            )}
            {/* Actions */}
            <LearningPlanActions
              onEdit={handleEditPlan}
              onStart={handleStartLearning}
              onSave={handleSaveEdit}
              onCancel={() => setEditMode(false)}
              onSendAI={handleSubmitEditedPlan}
              editMode={editMode}
              editLoading={editLoading}
              disableSave={false}
              disableSendAI={false}
            />
            {/* Nếu không có JSON, fallback markdown */}
            {!parsedPlan && <ReactMarkdown>{result}</ReactMarkdown>}
          </div>
        )}
        {parsedPlan && !editMode && (
          <>
            <button
              className="mt-2 mb-2 px-4 py-2 rounded bg-yellow-500 text-white font-semibold hover:bg-yellow-600"
              onClick={handleEditPlan}
            >
              Chỉnh sửa lộ trình
            </button>
            <button
              className="mt-2 mb-2 ml-2 px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700"
              onClick={() => navigate('/learn/tutor-agent/teach')}
            >
              Bắt đầu học
            </button>
          </>
        )}
        {editMode && editRows && (
          <div className="my-4">
            <label className="block mb-2 text-[var(--text-primary)] font-semibold">Chỉnh sửa lộ trình học:</label>
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
                    <th className="border px-2 py-1">Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {editRows.map((row, idx) => (
                    <tr key={row.id}>
                      <td className="border px-2 py-1 text-center">{row.id}</td>
                      <td className="border px-2 py-1">
                        <input className="w-full p-1 border rounded" value={row.title} onChange={e => handleRowChange(idx, 'title', e.target.value)} />
                      </td>
                      <td className="border px-2 py-1">
                        <input className="w-full p-1 border rounded" value={row.goal} onChange={e => handleRowChange(idx, 'goal', e.target.value)} />
                      </td>
                      <td className="border px-2 py-1">
                        <textarea className="w-full p-1 border rounded" rows={2} value={row.content} onChange={e => handleRowChange(idx, 'content', e.target.value)} />
                      </td>
                      <td className="border px-2 py-1">
                        <textarea className="w-full p-1 border rounded" rows={2} value={row.exercise} onChange={e => handleRowChange(idx, 'exercise', e.target.value)} />
                      </td>
                      <td className="border px-2 py-1">
                        <input className="w-full p-1 border rounded" value={row.resources} onChange={e => handleRowChange(idx, 'resources', e.target.value)} />
                      </td>
                      <td className="border px-2 py-1 text-center">
                        <button className="text-red-500 font-bold" onClick={() => handleDeleteRow(idx)} title="Xóa chương/ngày">✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-2 mt-2">
              <button className="px-3 py-1 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600" onClick={handleAddRow}>+ Thêm chương/ngày</button>
              <button className="px-3 py-1 rounded bg-green-600 text-white font-semibold hover:bg-green-700" onClick={handleSaveEdit}>Lưu chỉnh sửa</button>
              <button className="px-3 py-1 rounded bg-gray-400 text-white font-semibold hover:bg-gray-500" onClick={() => setEditMode(false)}>Hủy</button>
              <button
                className="px-3 py-1 rounded bg-green-700 text-white font-semibold hover:bg-green-800 disabled:opacity-60"
                onClick={handleSubmitEditedPlan}
                disabled={editLoading}
              >
                {editLoading ? 'Đang gửi lại...' : 'Gửi lại lộ trình đã chỉnh sửa cho AI'}
              </button>
            </div>
          </div>
        )}
        {/* UI chọn lộ trình */}
        <div className="mb-4">
          <label className="block mb-2 text-[var(--text-primary)] font-semibold">Chọn lộ trình đã lưu:</label>
          <select
            className="w-full p-2 border border-[var(--border-color)] rounded bg-[var(--bg-primary)] text-[var(--text-primary)]"
            value={selectedPlanId || ''}
            onChange={e => setSelectedPlanId(e.target.value)}
          >
            <option value="">-- Chọn lộ trình --</option>
            {plans.map(plan => (
              <option key={plan.id} value={plan.id}>{plan.name}</option>
            ))}
          </select>
          <div className="flex gap-2 mt-2">
            <button
              className="px-3 py-1 rounded bg-red-500 text-white font-semibold hover:bg-red-600"
              onClick={() => {
                if (!selectedPlanId) return;
                const newPlans = plans.filter(p => p.id !== selectedPlanId);
                setPlans(newPlans);
                localStorage.setItem('tutor_agent_plans', JSON.stringify(newPlans));
                setSelectedPlanId(null);
                setParsedPlan(null);
                toast.success('Đã xóa lộ trình!');
              }}
              disabled={!selectedPlanId}
            >
              Xóa lộ trình
            </button>
            <button
              className="px-3 py-1 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600"
              onClick={() => {
                if (!selectedPlanId) return;
                const newName = prompt('Nhập tên mới cho lộ trình:');
                if (!newName) return;
                const newPlans = plans.map(p => p.id === selectedPlanId ? { ...p, name: newName } : p);
                setPlans(newPlans);
                localStorage.setItem('tutor_agent_plans', JSON.stringify(newPlans));
                toast.success('Đã đổi tên lộ trình!');
              }}
              disabled={!selectedPlanId}
            >
              Đổi tên lộ trình
            </button>
          </div>
        </div>
        <div className="text-center text-[var(--text-secondary)] italic mt-6">
          (Tính năng đang phát triển...)
        </div>
      </div>
    </div>
  );
};

export default TutorAgent; 