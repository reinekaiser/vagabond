import React from "react";
import { Select } from "antd";
import { Controller } from "react-hook-form";

const { Option } = Select;
const FormSelect = ({
    label,
    name,
    control,
    options,
    placeholder,
    validationRules = {},
    className = "",
    isMultiple = false,
    valueField = "_id",
    labelField = "name",
    errors,
}) => {
    return (
        <div className={className}>
            <label className="block font-medium mb-2">
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
                    <Select
                        {...field}
                        mode={isMultiple ? "multiple" : undefined}
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.children
                                .toLowerCase()
                                .includes(input.toLowerCase())
                        }
                        placeholder={placeholder}
                        allowClear
                        className={`w-full ${
                            errors[name] ? "border-red-500" : ""
                        } border rounded border-gray-300`}
                        size="large"
                    >
                        {options.map((option) => (
                            <Option
                                key={option[valueField]}
                                value={option[valueField]}
                            >
                                {option[labelField]}
                            </Option>
                        ))}
                    </Select>
                )}
            ></Controller>
            {errors[name] && (
                <p className="text-red-500 text-sm">{errors[name]?.message}</p>
            )}
        </div>
    );
};

export default FormSelect;
