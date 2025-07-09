import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { Controller } from "react-hook-form";

const TextEditor = ({
    label,
    name,
    control,
    validationRules = {},
    placeholder,
    errors,
    variants = "",
    isSmall = false,
}) => {
    const modules = {
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ align: [] }],
            ["link", "image"],
            ["blockquote", "code-block"],
            [{ script: "sub" }, { script: "super" }],
            [{ indent: "-1" }, { indent: "+1" }],
            ["clean"],
        ],
    };
    return (
        <div className={variants}>
            <label
                className={`block font-medium mb-2 ${
                    isSmall ? "" : "text-base"
                }`}
            >
                {label}{" "}
                {validationRules.required && (
                    <span className="text-red-500">*</span>
                )}
            </label>
            <Controller
                name={name}
                control={control}
                rules={validationRules}
                render={({ field }) => (
                    <ReactQuill
                        {...field}
                        theme="snow"
                        modules={modules}
                        placeholder={placeholder}
                        className="bg-white"
                    />
                )}
            />
            {errors[name] && (
                <p className="text-red-500 text-sm mt-1">
                    {errors[name]?.message}
                </p>
            )}
        </div>
    );
};

export default TextEditor;
