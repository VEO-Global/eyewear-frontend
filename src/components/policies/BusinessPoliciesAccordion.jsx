import { Alert, Collapse } from "antd";
import { FileText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { POLICY_DEFINITIONS, getPolicyDefinition, getPolicyDefinitionByKey } from "../../constants/policies";
import { extractErrorMessage, managerApi } from "../../services/managerApi";
import { appToast } from "../../utils/appToast";
import { isManagerRole } from "../../utils/authRole";
import PolicyItem from "./PolicyItem";

function stripHtml(html) {
  if (!html) {
    return "";
  }

  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function createInitialState() {
  return POLICY_DEFINITIONS.reduce((accumulator, item) => {
    accumulator[item.type] = {
      type: item.type,
      key: item.key,
      summary: item.summary,
      title: item.title,
      content: "",
      raw: null,
      isEditing: false,
      isLoading: false,
      isSaving: false,
      isLoaded: false,
      error: "",
      draftTitle: item.title,
      draftContent: "",
    };

    return accumulator;
  }, {});
}

export default function BusinessPoliciesAccordion({
  className = "",
  defaultExpandedType,
  forceCanEdit,
  onExpandedChange,
}) {
  const userRole = useSelector((state) => state.auth.user?.role);
  const canEdit = forceCanEdit ?? isManagerRole(userRole);
  const [policyState, setPolicyState] = useState(() => createInitialState());
  const [activeKeys, setActiveKeys] = useState(() => (defaultExpandedType ? [defaultExpandedType] : []));
  const [globalError, setGlobalError] = useState("");

  function updatePolicyState(type, partialState) {
    setPolicyState((current) => ({
      ...current,
      [type]: {
        ...current[type],
        ...partialState,
      },
    }));
  }

  async function ensurePolicyLoaded(type, options = {}) {
    const currentPolicy = policyState[type];

    if (!currentPolicy || currentPolicy.isLoading) {
      return;
    }

    if (currentPolicy.isLoaded && !options.force) {
      return;
    }

    updatePolicyState(type, { isLoading: true, error: "" });
    setGlobalError("");

    try {
      const response = await managerApi.fetchPublicPolicy(type);
      const definition = getPolicyDefinition(type);

      updatePolicyState(type, {
        title: response.title || definition?.title || type,
        content: response.content || "",
        raw: response.raw,
        isLoaded: true,
        isLoading: false,
        error: "",
        draftTitle: response.title || definition?.title || type,
        draftContent: response.content || "",
      });
    } catch (error) {
      updatePolicyState(type, {
        isLoading: false,
        error: extractErrorMessage(error, "Không thể tải nội dung chính sách."),
      });
    }
  }

  async function handleStartEdit(type) {
    const currentPolicy = policyState[type];

    if (!canEdit || !currentPolicy || currentPolicy.isLoading) {
      return;
    }

    updatePolicyState(type, { isLoading: true, error: "" });
    setGlobalError("");

    try {
      const response = await managerApi.fetchManagerPolicy(type);

      updatePolicyState(type, {
        title: response.title || currentPolicy.title,
        content: response.content || "",
        raw: response.raw,
        isLoaded: true,
        isLoading: false,
        isEditing: true,
        draftTitle: response.title || currentPolicy.title,
        draftContent: response.content || "",
        error: "",
      });
    } catch (error) {
      updatePolicyState(type, {
        isLoading: false,
        error: extractErrorMessage(error, "Không thể tải nội dung chỉnh sửa."),
      });
    }
  }

  function handleCancelEdit(type) {
    const currentPolicy = policyState[type];

    if (!currentPolicy) {
      return;
    }

    updatePolicyState(type, {
      isEditing: false,
      error: "",
      draftTitle: currentPolicy.title,
      draftContent: currentPolicy.content,
    });
  }

  async function handleSave(type) {
    const currentPolicy = policyState[type];

    if (!currentPolicy) {
      return;
    }

    const nextTitle = currentPolicy.draftTitle.trim();
    const nextContent = currentPolicy.draftContent;

    if (!stripHtml(nextContent)) {
      updatePolicyState(type, { error: "Nội dung chính sách không được để trống." });
      return;
    }

    if (!nextTitle) {
      updatePolicyState(type, { error: "Tiêu đề chính sách không được để trống." });
      return;
    }

    updatePolicyState(type, { isSaving: true, error: "" });
    setGlobalError("");

    try {
      const updatedPolicy = await managerApi.updatePolicy(type, {
        title: nextTitle,
        content: nextContent,
        currentRecord: currentPolicy,
      });

      updatePolicyState(type, {
        title: updatedPolicy.title || nextTitle,
        content: updatedPolicy.content || nextContent,
        raw: updatedPolicy.raw,
        isLoaded: true,
        isSaving: false,
        isEditing: false,
        draftTitle: updatedPolicy.title || nextTitle,
        draftContent: updatedPolicy.content || nextContent,
        error: "",
      });

      appToast.success(`Đã cập nhật ${updatedPolicy.title || nextTitle} thành công.`);
    } catch (error) {
      const message = extractErrorMessage(error, "Không thể lưu chính sách.");
      updatePolicyState(type, { isSaving: false, error: message });
      setGlobalError(message);
    }
  }

  const items = useMemo(
    () =>
      POLICY_DEFINITIONS.map((definition) => ({
        key: definition.type,
        label: (
          <div className="flex items-start gap-4">
            <div className="mt-1 rounded-2xl bg-teal-50 p-3 text-teal-700">
              <FileText size={18} />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">{definition.title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">{definition.summary}</p>
            </div>
          </div>
        ),
        styles: {
          header: {
            padding: "20px 24px",
            background: "rgba(255,255,255,0.96)",
            borderRadius: "24px",
            border: "1px solid #e2e8f0",
          },
          body: {
            padding: "16px 8px 8px",
          },
        },
        children: (
          <PolicyItem
            policy={policyState[definition.type]}
            canEdit={canEdit}
            onEdit={() => handleStartEdit(definition.type)}
            onCancel={() => handleCancelEdit(definition.type)}
            onSave={() => handleSave(definition.type)}
            onRetry={() => ensurePolicyLoaded(definition.type, { force: true })}
            onDraftTitleChange={(value) => updatePolicyState(definition.type, { draftTitle: value })}
            onDraftContentChange={(value) => updatePolicyState(definition.type, { draftContent: value })}
          />
        ),
      })),
    [canEdit, policyState]
  );

  useEffect(() => {
    if (!defaultExpandedType) {
      return;
    }

    setActiveKeys([defaultExpandedType]);
  }, [defaultExpandedType]);

  useEffect(() => {
    if (!activeKeys.length) {
      return;
    }

    activeKeys.forEach((type) => {
      ensurePolicyLoaded(type);
    });
  }, [activeKeys]);

  function handleCollapseChange(nextKeys) {
    const normalizedKeys = Array.isArray(nextKeys) ? nextKeys : nextKeys ? [nextKeys] : [];
    setActiveKeys(normalizedKeys);
    onExpandedChange?.(normalizedKeys);
  }

  return (
    <div className={className}>
      {globalError ? (
        <Alert
          type="error"
          showIcon
          message="Có lỗi xảy ra khi cập nhật chính sách"
          description={globalError}
          className="mb-4"
        />
      ) : null}

      <Collapse
        ghost
        activeKey={activeKeys}
        onChange={handleCollapseChange}
        items={items}
        className="[&_.ant-collapse-item]:mb-4 [&_.ant-collapse-item]:overflow-hidden [&_.ant-collapse-item]:rounded-[28px]"
      />
    </div>
  );
}

export function resolveDefaultPolicyTypeFromHash(hash) {
  if (!hash) {
    return undefined;
  }

  const normalizedHash = hash.replace(/^#/, "").toLowerCase();
  return getPolicyDefinitionByKey(normalizedHash)?.type;
}
