import { Button, Card, DatePicker, Input, Radio } from "antd";
import { useMemo, useState } from "react";
import { appToast } from "../utils/appToast";

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

const distancePhrases = [
  "Khả năng nhìn xa của bạn hiện khá ổn.",
  "Bạn đã có dấu hiệu nhìn xa kém nhẹ.",
  "Biểu hiện nhìn xa của bạn đang khá rõ rệt và cần được lưu ý.",
];

const strainPhrases = [
  "Mức độ mỏi mắt hiện chưa nhiều.",
  "Mắt của bạn thỉnh thoảng bị quá tải khi nhìn gần lâu.",
  "Mắt của bạn đang có dấu hiệu mỏi khá thường xuyên khi dùng màn hình.",
];

const squintPhrases = [
  "Bạn gần như không phải nheo mắt để nhìn rõ.",
  "Bạn đôi khi phải nheo mắt để hỗ trợ nhìn rõ hơn.",
  "Bạn thường xuyên phải nheo mắt, đây là dấu hiệu khá đáng chú ý.",
];

const closingSuggestions = [
  [
    [
      "Bạn có thể tiếp tục duy trì thói quen nghỉ mắt điều độ và theo dõi thêm trong sinh hoạt hằng ngày.",
      "Bạn nên nghỉ mắt đúng nhịp và để ý thêm khi học tập hoặc làm việc ngoài trời.",
      "Bạn nên chủ động kiểm tra mắt nếu cảm giác phải nheo mắt lặp lại nhiều hơn trong thời gian tới.",
    ],
    [
      "Bạn nên giảm thời gian nhìn màn hình liên tục và cho mắt nghỉ ngắn sau mỗi khoảng làm việc.",
      "Bạn nên cân đối thời gian dùng điện thoại, máy tính và theo dõi thêm cảm giác mờ khi nhìn xa.",
      "Bạn nên sắp xếp đo mắt nếu tình trạng nheo mắt kèm mỏi mắt tiếp tục xuất hiện.",
    ],
    [
      "Bạn nên ưu tiên nghỉ mắt đều đặn hơn và hạn chế làm việc với màn hình trong thời gian quá dài.",
      "Bạn nên cân nhắc kiểm tra mắt sớm vì mỏi mắt nhiều có thể ảnh hưởng dần đến sinh hoạt hằng ngày.",
      "Bạn nên đặt lịch đo mắt trực tiếp để được đánh giá rõ hơn nguyên nhân gây khó chịu.",
    ],
  ],
  [
    [
      "Bạn nên theo dõi thêm thị lực nhìn xa và kiểm tra nếu cảm giác mờ xuất hiện thường xuyên hơn.",
      "Bạn nên chú ý hơn khi lái xe, học tập hoặc nhìn bảng xa để xem mức độ mờ có tăng lên không.",
      "Bạn nên đo mắt sớm nếu việc nheo mắt bắt đầu trở thành thói quen khi nhìn xa.",
    ],
    [
      "Bạn nên cho mắt nghỉ nhiều hơn và kiểm tra thị lực nếu tình trạng mờ nhẹ kéo dài trong vài tuần tới.",
      "Bạn nên hạn chế nhìn màn hình quá lâu liên tục và cân nhắc đo mắt nếu cảm giác khó chịu tăng dần.",
      "Bạn nên sắp xếp kiểm tra mắt trong thời gian gần vì các dấu hiệu đang cho thấy mắt phải điều tiết nhiều.",
    ],
    [
      "Bạn nên chủ động đi kiểm tra mắt vì tình trạng mỏi mắt thường xuyên có thể làm cảm giác nhìn xa khó chịu hơn.",
      "Bạn nên đo mắt trong thời gian sớm để biết chính xác mắt đang bị ảnh hưởng ở mức nào.",
      "Bạn nên đặt lịch tư vấn sớm vì tổ hợp dấu hiệu hiện tại khá phù hợp với tình trạng cần được kiểm tra trực tiếp.",
    ],
  ],
  [
    [
      "Bạn nên kiểm tra thị lực sớm vì dù chưa mỏi mắt nhiều, việc nhìn xa kém đã là dấu hiệu quan trọng.",
      "Bạn nên sắp xếp đo mắt trong thời gian gần để xác định rõ nguyên nhân gây khó nhìn xa.",
      "Bạn nên đi kiểm tra mắt sớm vì việc thường xuyên nheo mắt cho thấy mắt đang phải bù trừ khá nhiều.",
    ],
    [
      "Bạn nên ưu tiên đo mắt trong thời gian gần để tránh việc nhìn xa kém ảnh hưởng đến học tập và di chuyển.",
      "Bạn nên kiểm tra mắt sớm vì cả dấu hiệu mỏi mắt và nhìn xa kém đều đã xuất hiện cùng lúc.",
      "Bạn nên đặt lịch tư vấn trực tiếp để được kiểm tra đầy đủ hơn trước khi tình trạng ảnh hưởng nhiều đến sinh hoạt.",
    ],
    [
      "Bạn nên đi kiểm tra mắt trực tiếp càng sớm càng tốt vì nhiều dấu hiệu đang cùng xuất hiện.",
      "Bạn nên đo mắt sớm để được tư vấn đúng hướng, tránh để tình trạng kéo dài và gây khó chịu hơn.",
      "Bạn nên đặt lịch khám hoặc đo mắt ngay khi thuận tiện vì đây là nhóm biểu hiện cần được ưu tiên kiểm tra.",
    ],
  ],
];

function getSuggestion(distanceIndex, strainIndex, squintIndex) {
  if (
    distanceIndex === undefined ||
    strainIndex === undefined ||
    squintIndex === undefined
  ) {
    return "";
  }

  return [
    distancePhrases[distanceIndex],
    strainPhrases[strainIndex],
    squintPhrases[squintIndex],
    closingSuggestions[distanceIndex][strainIndex][squintIndex],
  ].join(" ");
}

export default function VisionTestPage() {
  const [answers, setAnswers] = useState({});
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingInfo, setBookingInfo] = useState({
    phoneNumber: "",
    appointmentTime: null,
  });

  const isComplete = questions.every(
    (question) => answers[question.id] !== undefined
  );

  const suggestion = useMemo(
    () => getSuggestion(answers[1], answers[2], answers[3]),
    [answers]
  );

  const handleShowSuggestion = () => {
    if (!isComplete) return;
    setShowSuggestion(true);
    setShowBookingForm(false);
  };

  const handleShowBookingForm = () => {
    setShowBookingForm(true);
  };

  const handlePhoneNumberChange = (event) => {
    const digitsOnly = event.target.value.replace(/\D/g, "").slice(0, 10);

    setBookingInfo((prev) => ({
      ...prev,
      phoneNumber: digitsOnly,
    }));
  };

  const handleSubmitBooking = () => {
    const phoneNumber = bookingInfo.phoneNumber.trim();
    const appointmentTime = bookingInfo.appointmentTime;

    if (!/^0\d{9}$/.test(phoneNumber)) {
      appToast.error("Vui lòng nhập số điện thoại hợp lệ gồm 10 chữ số.");
      return;
    }

    if (!appointmentTime) {
      appToast.error("Vui lòng chọn thời gian đặt lịch hẹn.");
      return;
    }

    const appointmentHour = appointmentTime.hour();
    const appointmentMinute = appointmentTime.minute();

    if (
      appointmentHour < 7 ||
      appointmentHour > 19 ||
      (appointmentHour === 19 && appointmentMinute > 0)
    ) {
      appToast.error("Vui lòng đặt lịch trong khung giờ từ 07:00 đến 19:00.");
      return;
    }

    appToast.success("Đặt lịch tư vấn thành công.");
    setBookingInfo({
      phoneNumber: "",
      appointmentTime: null,
    });
    setShowBookingForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-violet-50 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <span className="inline-flex rounded-full bg-sky-100 px-4 py-1 text-sm font-medium text-sky-700">
            Bài kiểm tra sơ bộ
          </span>
          <h1 className="mt-4 text-4xl font-bold text-gray-900">
            Kiểm tra thị lực online
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Đây là bài kiểm tra nhanh để bạn tự đánh giá tình trạng mắt cơ bản.
            Kết quả chỉ mang tính tham khảo và không thay thế chẩn đoán chuyên môn.
          </p>
        </div>

        <div className="space-y-6">
          {questions.map((question) => (
            <Card key={question.id} className="rounded-2xl shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
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
                className="flex flex-wrap gap-4"
              >
                {question.options.map((option, index) => (
                  <Radio key={option} value={index}>
                    {option}
                  </Radio>
                ))}
              </Radio.Group>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            type="primary"
            size="large"
            onClick={handleShowSuggestion}
            disabled={!isComplete}
          >
            Nhận gợi ý về bài kiểm tra
          </Button>
        </div>

        {showSuggestion && (
          <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">
              Gợi ý sau khi kiểm tra
            </h3>
            <p className="mt-2 text-gray-600">{suggestion}</p>
            <Button
              type="primary"
              className="mt-4"
              onClick={handleShowBookingForm}
            >
              Đặt lịch tư vấn
            </Button>

            {showBookingForm && (
              <div className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-lg font-medium text-gray-900">
                    <span className="mr-1 text-red-500">*</span>
                    Số điện thoại
                  </label>
                  <Input
                    size="large"
                    placeholder="Nhập số điện thoại"
                    value={bookingInfo.phoneNumber}
                    onChange={handlePhoneNumberChange}
                    inputMode="numeric"
                    maxLength={10}
                  />
                  <p className="mt-2 text-base text-slate-500">
                    Nhập số điện thoại (Có sử dụng Zalo)
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-lg font-medium text-gray-900">
                    <span className="mr-1 text-red-500">*</span>
                    Thời gian đặt lịch hẹn
                  </label>
                  <DatePicker
                    showTime
                    format="DD/MM/YYYY HH:mm"
                    size="large"
                    className="w-full"
                    placeholder="Chọn ngày và giờ hẹn"
                    value={bookingInfo.appointmentTime}
                    onChange={(value) =>
                      setBookingInfo((prev) => ({
                        ...prev,
                        appointmentTime: value,
                      }))
                    }
                    />
                </div>

                <div className="pt-1">
                  <Button type="primary" onClick={handleSubmitBooking}>
                    Xác nhận đặt lịch
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
