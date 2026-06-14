import React from "react";
import { EditorContent, useEditor } from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import { ImageIcon } from "lucide-react";

import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code2,
  Heading1,
  Heading2,
  Undo2,
  Redo2,
  Link2,
} from "lucide-react";

const ToolbarButton = ({ onClick, active, children }) => {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-150
      ${
        active
          ? "bg-purple-600 text-white shadow-sm"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
};
const Divider = () => {
  return <div className="mx-1 h-8 w-px bg-gray-300" />;
};

const RichTextEditor = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure(
        {
          heading: {
            levels: [1, 2],
            HTMLAttributes: {
              class: "font-bold",
            },
          },

          bulletList: {
            HTMLAttributes: {
              class: "list-disc ml-6",
            },
          },

          orderedList: {
            HTMLAttributes: {
              class: "list-decimal ml-6",
            },
          },

          blockquote: {
            HTMLAttributes: {
              class:
                "border-l-4 border-purple-500 pl-4 italic text-gray-700 my-4",
            },
          },

          codeBlock: {
            HTMLAttributes: {
              class:
                "bg-gray-900 text-white rounded-xl p-4 font-mono text-sm overflow-x-auto my-4",
            },
          },
        },
        Image.configure({
          inline: false,

          HTMLAttributes: {
            class: "rounded-2xl my-4 w-full object-cover",
          },
        }),
      ),

      Link.configure({
        openOnClick: false,
        autolink: true,

        HTMLAttributes: {
          class: "text-purple-600 underline break-all",
        },
      }),

      Placeholder.configure({
        placeholder: "Start writing your amazing blog...",
      }),
    ],

    content: content || "",

    editorProps: {
      attributes: {
        class:
          "prose max-w-none min-h-[400px] p-6 focus:outline-none " +
          "prose-h1:text-4xl prose-h1:font-bold prose-h1:mb-4 " +
          "prose-h2:text-3xl prose-h2:font-semibold prose-h2:mb-3",
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  if (!editor) return null;

  // =========================
  // MARK FORMATTING (MS WORD STYLE)
  // =========================
  const applyMark = (type) => {
    const { empty, to } = editor.state.selection;

    // MS WORD typing mode
    if (empty) {
      editor.chain().focus()[type]().run();
      return;
    }

    // format selected text
    editor.chain().focus()[type]().run();

    // collapse cursor at end
    editor.commands.setTextSelection(to);

    // force focus refresh
    requestAnimationFrame(() => {
      editor.commands.focus();
    });
  };
  // =========================
  // HEADINGS
  // =========================

  const applyHeading = (level) => {
    editor.chain().focus().toggleNode("heading", "paragraph", { level }).run();
  };

  // =========================
  // LISTS
  // =========================

  const applyList = (type) => {
    if (type === "bullet") {
      editor.chain().focus().toggleBulletList().run();
    } else {
      editor.chain().focus().toggleOrderedList().run();
    }
  };

  // =========================
  // BLOCKQUOTE
  // =========================

  const applyBlockquote = () => {
    editor.chain().focus().toggleBlockquote().run();
  };

  // =========================
  // CODE BLOCK
  // =========================

  const applyCodeBlock = () => {
    editor.chain().focus().toggleCodeBlock().run();
  };

  // =========================
  // LINK
  // =========================

  const addLink = () => {
    const previousUrl = editor.getAttributes("link").href;

    const url = window.prompt("Enter URL", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().setLink({ href: url }).run();
  };

  const addImage = () => {
    const input = document.createElement("input");

    input.type = "file";
    input.accept = "image/*";

    input.onchange = async () => {
      const file = input.files?.[0];

      if (!file) return;

      // LOCAL PREVIEW
      const imageUrl = URL.createObjectURL(file);

      editor.chain().focus().setImage({ src: imageUrl }).run();

      // LATER:
      // upload to cloudinary/s3
      // then replace local url with cloud url
    };

    input.click();
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      {/* TOOLBAR */}

      <div className="sticky top-0 z-10 flex flex-wrap gap-2 border-b border-gray-200 bg-gray-50 p-3">
        {/* BOLD */}

        <ToolbarButton
          onClick={() => applyMark("toggleBold")}
          active={editor.isActive("bold")}
        >
          <Bold size={18} />
        </ToolbarButton>

        {/* ITALIC */}

        <ToolbarButton
          onClick={() => applyMark("toggleItalic")}
          active={editor.isActive("italic")}
        >
          <Italic size={18} />
        </ToolbarButton>

        {/* STRIKE */}

        <ToolbarButton
          onClick={() => applyMark("toggleStrike")}
          active={editor.isActive("strike")}
        >
          <Strikethrough size={18} />
        </ToolbarButton>

        <Divider />

        {/* H1 */}

        <ToolbarButton
          onClick={() => applyHeading(1)}
          active={editor.isActive("heading", { level: 1 })}
        >
          <Heading1 size={18} />
        </ToolbarButton>

        {/* H2 */}

        <ToolbarButton
          onClick={() => applyHeading(2)}
          active={editor.isActive("heading", { level: 2 })}
        >
          <Heading2 size={18} />
        </ToolbarButton>

        <Divider />

        {/* BULLET LIST */}

        <ToolbarButton
          onClick={() => applyList("bullet")}
          active={editor.isActive("bulletList")}
        >
          <List size={18} />
        </ToolbarButton>

        {/* ORDERED LIST */}

        <ToolbarButton
          onClick={() => applyList("ordered")}
          active={editor.isActive("orderedList")}
        >
          <ListOrdered size={18} />
        </ToolbarButton>

        <Divider />

        {/* BLOCKQUOTE */}

        <ToolbarButton
          onClick={applyBlockquote}
          active={editor.isActive("blockquote")}
        >
          <Quote size={18} />
        </ToolbarButton>

        {/* CODE BLOCK */}

        <ToolbarButton
          onClick={applyCodeBlock}
          active={editor.isActive("codeBlock")}
        >
          <Code2 size={18} />
        </ToolbarButton>

        <Divider />
        {/*image*/}
        <ToolbarButton onClick={addImage}>
          <ImageIcon size={18} />
        </ToolbarButton>
        <Divider />

        {/* LINK */}

        <ToolbarButton onClick={addLink} active={editor.isActive("link")}>
          <Link2 size={18} />
        </ToolbarButton>

        <Divider />

        {/* UNDO */}

        <ToolbarButton onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 size={18} />
        </ToolbarButton>

        {/* REDO */}

        <ToolbarButton onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 size={18} />
        </ToolbarButton>
      </div>

      {/* EDITOR */}

      <EditorContent editor={editor} />

      {/* FOOTER */}

      <div className="border-t border-gray-100 bg-gray-50 px-5 py-3 text-xs text-gray-500">
        Write naturally like Microsoft Word — select text to format or enable
        formatting before typing.
      </div>
    </div>
  );
};

export default RichTextEditor;
