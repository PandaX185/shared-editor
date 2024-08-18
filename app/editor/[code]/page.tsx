"use client";

import { useState, useEffect } from "react";
import { gql, useSubscription, useMutation } from "@apollo/client";
import Editor, { useMonaco } from "@monaco-editor/react";

const GET_FILE_CONTENT = gql`
  subscription GetFileContent($code: uuid!) {
    files(where: { code: { _eq: $code } }) {
      content
      language
    }
  }
`;

const UPDATE_FILE_CONTENT = gql`
  mutation UpdateFileContent(
    $code: uuid!
    $content: String!
    $language: String!
  ) {
    update_files(
      where: { code: { _eq: $code } }
      _set: { content: $content, language: $language }
    ) {
      returning {
        content
        language
      }
    }
  }
`;

interface EditorPageProps {
  params: {
    code: string;
  };
}

const EditorPage = ({ params }: EditorPageProps) => {
  const { code } = params;
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const monaco = useMonaco();
  const { data, loading } = useSubscription(GET_FILE_CONTENT, {
    variables: { code },
  });

  const [updateFileContent] = useMutation(UPDATE_FILE_CONTENT);

  const [content, setContent] = useState<string>("");
  const [language, setLanguage] = useState<string>("javascript");

  useEffect(() => {
    if (data && data.files && data.files.length > 0) {
      setContent(data.files[0].content || "");
      setLanguage(data.files[0].language || "javascript");
    }
  }, [data]);

  useEffect(() => {
    if (monaco) {
      monaco.editor.setTheme(theme === "light" ? "vs" : "vs-dark");
    }
  }, [theme, monaco]);

  const handleEditorChange = (newValue: string | undefined) => {
    if (newValue !== undefined) {
      setContent(newValue);
    }
  };

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setLanguage(event.target.value);
  };

  const handleSave = () => {
    updateFileContent({
      variables: { code, content, language },
    });
  };

  const handleChangeTheme = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  return (
    <div className="w-full h-screen flex flex-col justify-center">
      <h1 className="text-2xl font-semibold my-4 mx-4">Collaborative Editor</h1>
      <div className="mb-4 ml-4 flex space-x-4 items-center">
        <label htmlFor="language-select">Language:</label>
        <select
          id="language-select"
          value={language}
          onChange={handleLanguageChange}
          className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-500 duration-200 ease-in-out"
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
        </select>
        <div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-12 rounded"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
        <div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-12 rounded"
            onClick={handleChangeTheme}
          >
            Change Theme
          </button>
        </div>
      </div>
      {!loading && (
        <Editor
          height="70vh"
          defaultLanguage={language}
          value={content}
          onChange={handleEditorChange}
          options={{
            fontSize: 14,
            minimap: { enabled: true },
            wordWrap: "on",
          }}
        />
      )}
    </div>
  );
};

export default EditorPage;
