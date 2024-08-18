"use client";

import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import { ReactTyped } from "react-typed";

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
    <div className="home-page h-screen w-full flex space-x-2 items-center justify-center bg-gray-100">
      <div className="w-1/2 flex flex-col">
        <ReactTyped
          className="py-5 font-bold text-6xl bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 text-transparent bg-clip-text"
          strings={[
            "Code Editor",
            "Code Together",
            "Code Interviews",
            "Pair Programming",
          ]}
          typeSpeed={80}
          backSpeed={60}
          loop
        />
        <h1 className="text-xl mt-4">
          A collaborative code editor built with Next.js, Apollo Client and
          Hasura
        </h1>
      </div>
      <div className="flex flex-col space-y-3">
        <button
          className="w-full mb-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleCreateFile}
        >
          Create a new file
        </button>
        <input
          className="w-full border border-gray-400 rounded py-2 px-4 mr-2 focus:outline-none focus:border-blue-500 duration-200 ease-in-out"
          type="text"
          placeholder="Enter code to join"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button
          className="w-full bg-transparent hover:bg-blue-500 text-blue-500 hover:text-white font-bold py-2 px-4 rounded duration-200 ease-in-out"
          onClick={handleJoinFile}
        >
          Join by code
        </button>
      </div>
    </div>
  );
};

export default HomePage;
