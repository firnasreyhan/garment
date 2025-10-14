/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  AccessibilityHelp,
  Alignment,
  Autoformat,
  AutoImage,
  Autosave,
  BalloonToolbar,
  BlockQuote,
  Bold,
  ClassicEditor,
  Editor,
  EditorConfig,
  Essentials,
  FileLoader,
  Heading,
  ImageBlock,
  ImageCaption,
  ImageInline,
  ImageInsert,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageTextAlternative,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  LinkImage,
  List,
  ListProperties,
  MediaEmbed,
  Paragraph,
  PasteFromOffice,
  SelectAll,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TextTransformation,
  TodoList,
  Underline,
  Undo,
} from "ckeditor5";
import { useEffect, useMemo, useState } from "react";

import "ckeditor5/ckeditor5.css";

import React from "react";
import { CustomUploadAdapter } from "../utils/ckeditor-custom-upload-adapter";

interface CKEditorInputProps {
  defaultValue?: string;
  id?: string;
  name: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export default function CKEditorInput({
  defaultValue,
  id,
  name,
  onChange,
  placeholder,
}: CKEditorInputProps) {
  const editorContainerRef = React.useRef(null);
  const editorRef = React.useRef(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  useEffect(() => {
    setIsLayoutReady(true);

    return () => setIsLayoutReady(false);
  }, []);

  const { editorConfig } = useMemo(() => {
    if (!isLayoutReady) {
      return {};
    }

    return {
      editorConfig: {
        toolbar: {
          items: [
            "undo",
            "redo",
            "|",
            "heading",
            "|",
            "bold",
            "italic",
            "underline",
            "|",
            "link",
            "insertImage",
            "mediaEmbed",
            "insertTable",
            "blockQuote",
            "|",
            "alignment",
            "|",
            "bulletedList",
            "numberedList",
            "todoList",
            "outdent",
            "indent",
          ],
          shouldNotGroupWhenFull: true,
        },

        plugins: [
          AccessibilityHelp,
          Alignment,
          Autoformat,
          AutoImage,
          Autosave,
          BalloonToolbar,
          BlockQuote,
          Bold,
          Essentials,
          Heading,
          ImageBlock,
          ImageCaption,
          ImageInline,
          ImageInsert,
          ImageInsertViaUrl,
          ImageResize,
          ImageStyle,
          ImageTextAlternative,
          ImageToolbar,
          ImageUpload,
          Indent,
          IndentBlock,
          Italic,
          Link,
          LinkImage,
          List,
          ListProperties,
          MediaEmbed,
          Paragraph,
          PasteFromOffice,
          SelectAll,
          Table,
          TableCaption,
          TableCellProperties,
          TableColumnResize,
          TableProperties,
          TableToolbar,
          TextTransformation,
          TodoList,
          Underline,
          Undo,
        ],
        extraPlugins: [
          function (editor: Editor) {
            editor.plugins.get("FileRepository").createUploadAdapter = (
              loader: FileLoader,
            ) => {
              return new CustomUploadAdapter(loader);
            };
          },
        ],
        balloonToolbar: [
          "bold",
          "italic",
          "|",
          "link",
          "insertImage",
          "|",
          "bulletedList",
          "numberedList",
        ],
        heading: {
          options: [
            {
              model: "paragraph",
              title: "Paragraph",
              class: "ck-heading_paragraph",
            },
            {
              model: "heading1",
              view: "h1",
              title: "Heading 1",
              class: "ck-heading_heading1",
            },
            {
              model: "heading2",
              view: "h2",
              title: "Heading 2",
              class: "ck-heading_heading2",
            },
            {
              model: "heading3",
              view: "h3",
              title: "Heading 3",
              class: "ck-heading_heading3",
            },
            {
              model: "heading4",
              view: "h4",
              title: "Heading 4",
              class: "ck-heading_heading4",
            },
            {
              model: "heading5",
              view: "h5",
              title: "Heading 5",
              class: "ck-heading_heading5",
            },
            {
              model: "heading6",
              view: "h6",
              title: "Heading 6",
              class: "ck-heading_heading6",
            },
          ],
        },
        image: {
          toolbar: [
            "toggleImageCaption",
            "imageTextAlternative",
            "|",
            "imageStyle:inline",
            "imageStyle:wrapText",
            "imageStyle:breakText",
            "|",
            "resizeImage",
          ],
          upload: {
            types: ["png", "jpg", "jpeg", "gif", "svg"],
          },
        },
        initialData: defaultValue,
        link: {
          addTargetToExternalLinks: true,
          defaultProtocol: "https://",
          decorators: {
            toggleDownloadable: {
              mode: "manual",
              label: "Downloadable",
              attributes: {
                download: "file",
              },
            },
          },
        },
        list: {
          properties: {
            styles: true,
            startIndex: true,
            reversed: true,
          },
        },
        placeholder,

        table: {
          contentToolbar: [
            "tableColumn",
            "tableRow",
            "mergeTableCells",
            "tableProperties",
            "tableCellProperties",
          ],
        },
      } satisfies EditorConfig,
    };
  }, [isLayoutReady, defaultValue]);

  const [editorData, setEditorData] = React.useState(editorConfig?.initialData);

  return (
    <div
      ref={editorContainerRef}
      className="main-container flex w-full"
      style={{
        width: "100%",
        maxWidth: "100%",
      }}
    >
      <div
        ref={editorRef}
        className="editor-container__editor flex-1"
        style={{
          width: "100%",
          maxWidth: "100%",
          overflowWrap: "break-word",
          wordBreak: "break-word",
          whiteSpace: "pre-wrap",
          boxSizing: "border-box",
          minHeight: "200px",
        }}
      >
        {isLayoutReady && (
          <CKEditor
            id={id}
            editor={ClassicEditor}
            config={editorConfig}
            data={editorData}
            onChange={(_, editor) => {
              setEditorData(editor.getData());
              onChange?.(editor.getData());
            }}
          />
        )}
        <input
          id={id}
          type="hidden"
          className="hidden overflow-hidden absolute whitespace-nowrap w-1 h-1 bottom-0 left-0"
          name={name}
          value={editorData ?? defaultValue}
        />
      </div>
    </div>
  );
}
