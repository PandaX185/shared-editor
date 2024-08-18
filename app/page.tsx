"use client";

import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";

const CREATE_FILE = gql`
  mutation CreateFile($content: String!) {
    insert_files(objects: { content: $content, language: "javascript" }) {
      returning {
        code
      }
    }
  }
`;

const HomePage = () => {
  const [code, setCode] = useState<string>("");
  const [createFile] = useMutation(CREATE_FILE);
  const router = useRouter();

  const handleCreateFile = async () => {
    const { data } = await createFile({ variables: { content: "" } });
    if (data) {
      router.push(`/editor/${data.insert_files.returning[0].code}`);
    } else {
      console.log("Failed to create file");

      alert("Failed to create file");
    }
  };

  const handleJoinFile = () => {
    if (code) router.push(`/editor/${code}`);
    else alert("Please enter a code to join");
  };

  return (
    <div className="home-page">
      <h1>Shared Editor</h1>
      <button onClick={handleCreateFile}>Create New File</button>
      <div>
        <input
          type="text"
          placeholder="Enter code to join"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button onClick={handleJoinFile}>Join by Code</button>
      </div>
    </div>
  );
};

export default HomePage;
