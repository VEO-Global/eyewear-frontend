import { Button, Card, Radio } from "antd";
import { useState } from "react";

const questions = [
  {
    id: 1,
    title: "Khi nhìn xa, bạn thường thấy như thế nào?",
    options: [
      "Nhìn rõ bình thường",
      "Hơi mờ khi nhìn biển số hoặc bảng xa",
      "Rất khó nhìn vật ở xa",
    ],
  },
  {
    id: 2,
    title: "Bạn có bị mỏi mắt khi dùng điện thoại hoặc máy tính lâu không?",
    options: ["Hiếm khi", "Thỉnh thoảng", "Thường xuyên"],
  },
  {
    id: 3,
    title: "Bạn có hay nheo mắt để nhìn rõ hơn không?",
    options: ["Không", "Đôi khi", "Có, khá thường xuyên"],
  },
];

export default function VisionTestPage() {
  const [answers, setAnswers] = useState({});

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-violet-50 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-flex px-4 py-1 rounded-full bg-sky-100 text-sky-700 text-sm font-medium">
            Bài kiểm tra sơ bộ
          </span>
          <h1 className="text-4xl font-bold text-gray-900 mt-4">
            Kiểm tra thị lực online
          </h1>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Đây là bài kiểm tra nhanh để bạn tự đánh giá tình trạng mắt cơ bản.
            Kết quả chỉ mang tính tham khảo và không thay thế chẩn đoán chuyên môn.
          </p>
        </div>

        <div className="space-y-6">
          {questions.map((question) => (
            <Card key={question.id} className="rounded-2xl shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {question.title}
              </h2>
              <Radio.Group
                value={answers[question.id]}
                onChange={(event) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [question.id]: event.target.value,
                  }))
                }
                className="flex flex-col gap-3"
              >
                {question.options.map((option) => (
                  <Radio key={option} value={option}>
                    {option}
                  </Radio>
                ))}
              </Radio.Group>
            </Card>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Gợi ý sau khi kiểm tra
          </h3>
          <p className="text-gray-600 mt-2">
            Nếu bạn thường xuyên thấy mờ, mỏi mắt hoặc phải nheo mắt để nhìn rõ,
            bạn nên đặt lịch đo mắt trực tiếp để được tư vấn chính xác hơn.
          </p>
          <Button type="primary" className="mt-4">
            Đặt lịch tư vấn
          </Button>
        </div>
      </div>
    </div>
  );
}
