import React, { useState, useEffect } from "react";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { uploadMediaFiles } from "../services/api";

const FileProcessor = ({ file }) => {
  const [status, setStatus] = useState("analyzing");
  const [tags, setTags] = useState([]);
  const [storagePath, setStoragePath] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const processFile = async () => {
      try {
        setStatus("analyzing");

        // 1️⃣ Upload file to backend (Cloudinary + Flask AI)
        const response = await uploadMediaFiles([file]);

        /**
         * IMPORTANT:
         * Backend returns an ARRAY (one object per file)
         * So take response[0]
         */
        const result = Array.isArray(response) ? response[0] : response;

        if (!result) {
          throw new Error("Invalid upload response");
        }

        // 2️⃣ Extract AI Tags
        setStatus("tagging");
        setTags(result.tags || []);

        // 3️⃣ Storage folder (AI category)
        setStatus("storing");

        const folderPath = result.category
          ? `Auraverse/${result.category}/`
          : "Auraverse/Unsorted/";

        setStoragePath(folderPath);

        // 4️⃣ All done
        setStatus("completed");
      } catch (error) {
        console.error("Processing failed:", error);
        setErrorMessage(error.message);
        setStatus("error");
      }
    };

    processFile();
  }, [file]);

  const isImage = file.type.startsWith("image/");
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (isImage) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  }, [file, isImage]);

  return (
    <div className="bg-white/10 p-4 rounded-lg flex items-start gap-4">
      {/* Image Preview */}
      {isImage && imagePreview ? (
        <img
          src={imagePreview}
          alt={file.name}
          className="w-16 h-16 rounded-md object-cover"
        />
      ) : (
        <div className="w-16 h-16 rounded-md bg-gray-700 flex items-center justify-center">
          <p className="text-xs text-gray-400">
            .{file.name.split(".").pop()}
          </p>
        </div>
      )}

      {/* Status UI */}
      <div className="flex-1">
        <p className="text-sm font-medium text-white truncate">{file.name}</p>

        <div className="mt-2 text-xs text-gray-400">
          {status === "analyzing" && (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>🤖 Analyzing...</span>
            </div>
          )}

          {status === "tagging" && (
            <p>🏷️ Detected tags: {tags.join(", ")}</p>
          )}

          {status === "storing" && (
            <p>📁 Storing in: {storagePath}</p>
          )}

          {status === "completed" && (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span>Processing Complete</span>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span>Error: {errorMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileProcessor;
