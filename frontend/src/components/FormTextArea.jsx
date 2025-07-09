const FormTextArea = ({
    label,
    name,
    register,
    errors,
    placeholder,
    validationRules = {},
    className = "",
    row = 3,
    isSmall = false,
}) => {
    return (
        <div className={className}>
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
            <textarea
                rows={row}
                placeholder={placeholder}
                {...register(name, validationRules)}
                className={`w-full border p-2 rounded resize-none ${
                    errors[name] ? "border-red-500" : "border-gray-300"
                }`}
            ></textarea>
            {errors[name] && (
                <p className="text-red-500 text-sm mt-1">
                    {errors[name]?.message}
                </p>
            )}
        </div>
    );
};

export default FormTextArea;
