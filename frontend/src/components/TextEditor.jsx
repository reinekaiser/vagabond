import React from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const TextEditor = ({ label, name, value, onChange, error }) => {
    const handleEditorChange = (content) => {
        onChange(name, content);
    };

    return (
        <div className="mb-3">
            <label className="block font-medium mb-2">{label}</label>
            <ReactQuill
                theme="snow"
                value={value || ""}
                onChange={handleEditorChange}
                className={`border rounded ${error ? "border-red-500" : "border-gray-100"}`}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
};

export default TextEditor;