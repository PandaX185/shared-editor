"use client";

import { useState, useEffect } from "react";
import { gql, useSubscription, useMutation } from "@apollo/client";
import Editor from "@monaco-editor/react";

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

  return (
    <div className="editor-page">
      <h1>Collaborative Editor</h1>
      <div>
        <label htmlFor="language-select">Language:</label>
        <select
          id="language-select"
          value={language}
          onChange={handleLanguageChange}
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="csharp">C#</option>
          <option value="ruby">Ruby</option>
          <option value="go">Go</option>
          <option value="rust">Rust</option>
          <option value="php">PHP</option>
        </select>
      </div>
      {!loading && (
        <Editor
          height="90vh"
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
      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default EditorPage;
