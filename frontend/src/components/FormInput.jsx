const FormInput = ({
    label,
    type = "text",
    name,
    register,
    errors,
    placeholder,
    validationRules = {},
    className = "",
    isSmall = false,
    defaulValue = undefined,
}) => {
    return (
        <div className={className}>
            <label
                className={`block ${
                    isSmall ? "mb-1 text-sm" : "mb-2 "
                } font-medium`}
            >
                {label}{" "}
                {validationRules.required && (
                    <span className="text-red-500">*</span>
                )}
            </label>
            <input
                type={type}
                placeholder={placeholder}
                {...register(name, validationRules)}
                className={`w-full border ${isSmall ? "p-1" : "p-2"} rounded ${
                    errors[name] ? "border-red-500" : "border-gray-300"
                }`}
                value={defaulValue}
            ></input>
            {errors[name] && (
                <p className="text-red-500 text-sm mt-1">
                    {errors[name]?.message}
                </p>
            )}
        </div>
    );
};

export default FormInput;
