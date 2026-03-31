import { Bold, Italic, List, ListOrdered, Redo2, Undo2 } from "lucide-react";
import { useEffect, useRef } from "react";

const actions = [
  { key: "bold", icon: Bold, command: "bold" },
  { key: "italic", icon: Italic, command: "italic" },
  { key: "unordered", icon: List, command: "insertUnorderedList" },
  { key: "ordered", icon: ListOrdered, command: "insertOrderedList" },
  { key: "undo", icon: Undo2, command: "undo" },
  { key: "redo", icon: Redo2, command: "redo" },
];

export default function SimpleRichTextEditor({ value, onChange, placeholder }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  function runCommand(command) {
    document.execCommand(command, false);
    editorRef.current?.focus();
    onChange?.(editorRef.current?.innerHTML || "");
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
      <div className="flex flex-wrap gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
        {actions.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => runCommand(item.command)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-teal-300 hover:text-teal-700"
            >
              <Icon size={16} />
            </button>
          );
        })}
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(event) => onChange?.(event.currentTarget.innerHTML)}
        className="min-h-[320px] px-4 py-4 text-sm leading-7 text-slate-700 outline-none [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6"
        data-placeholder={placeholder}
      />
    </div>
  );
}
