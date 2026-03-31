import { Alert, Button, Input, Spin, Tag } from "antd";
import { Edit3, RefreshCcw, Save, X } from "lucide-react";
import SimpleRichTextEditor from "../manager/SimpleRichTextEditor";

function getPlainText(html) {
  if (!html) {
    return "";
  }

  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function PolicyItem({
  policy,
  canEdit,
  onEdit,
  onCancel,
  onSave,
  onDraftTitleChange,
  onDraftContentChange,
  onRetry,
}) {
  const hasContent = Boolean(getPlainText(policy.content));
  const contentPreview = hasContent ? policy.content : "<p>Chính sách này chưa có nội dung để hiển thị.</p>";

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="flex flex-wrap gap-2">
          {policy.isEditing ? (
            <>
              <Button onClick={onCancel} icon={<X size={16} />} disabled={policy.isSaving}>
                Hủy
              </Button>
              <Button type="primary" onClick={onSave} icon={<Save size={16} />} loading={policy.isSaving}>
                Lưu
              </Button>
            </>
          ) : null}

          {!policy.isEditing && canEdit ? (
            <Button onClick={onEdit} icon={<Edit3 size={16} />} disabled={policy.isLoading}>
              Chỉnh sửa
            </Button>
          ) : null}

          {!policy.isEditing && policy.isLoading ? <Tag color="processing">Đang tải</Tag> : null}
        </div>
      </div>

      {policy.error ? (
        <Alert
          type="error"
          showIcon
          message={policy.error}
          action={
            <Button type="text" onClick={onRetry} icon={<RefreshCcw size={15} />}>
              Thử lại
            </Button>
          }
        />
      ) : null}

      {policy.isLoading && !policy.isEditing && !policy.isLoaded ? (
        <div className="flex min-h-40 items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Spin size="small" />
            Đang tải nội dung chính sách...
          </div>
        </div>
      ) : null}

      {policy.isEditing ? (
        <div className="space-y-4 rounded-[28px] border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor={`policy-title-${policy.type}`}>
              Tiêu đề
            </label>
            <Input
              id={`policy-title-${policy.type}`}
              value={policy.draftTitle}
              onChange={(event) => onDraftTitleChange(event.target.value)}
              placeholder="Nhập tiêu đề chính sách"
              maxLength={120}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">Nội dung</p>
            <SimpleRichTextEditor
              value={policy.draftContent}
              onChange={onDraftContentChange}
              placeholder="Nhập nội dung chính sách tại đây..."
            />
          </div>
        </div>
      ) : null}

      {!policy.isEditing && (policy.isLoaded || !policy.isLoading) ? (
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div
            className="prose prose-slate max-w-none text-sm leading-7 text-slate-700 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6"
            dangerouslySetInnerHTML={{ __html: contentPreview }}
          />
        </div>
      ) : null}
    </div>
  );
}
