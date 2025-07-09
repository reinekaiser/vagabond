import { useState, useEffect, useRef } from "react";
import { PiCheckFatFill } from "react-icons/pi";
export default function SelectItem({ selectTitle, optionList, selected, setSelected }) {
    const [open, setOpen] = useState(false);

    const handleSelect = (option) => {
        setSelected(option);
        setOpen(!open);
    };

    const wrapperRef = useRef(null); 
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="flex gap-1 items-baseline">
            <p className="font-semibold">{selectTitle}</p>
            <div className="relative w-[200px] flex-1 cursor-pointer" ref={wrapperRef}>
                <div
                    className="px-2 py-[6px] border border-gray-300 rounded-lg bg-white"
                    onClick={() => setOpen(!open)}
                >
                    {optionList.find(option => option.value === selected).label}
                </div>
                {open && (
                    <ul className="bg-white py-1 shadow-dropdown rounded-lg mt-2 absolute top-9 right-0 z-10 w-full">
                        {optionList.map((option) => (
                            <li
                                key={option.value}
                                className={`py-1 px-4 hover:bg-gray-100 rounded-lg flex items-center justify-between ${
                                    selected == option.value
                                        ? "text-blue-400 font-medium"
                                        : "text-gray-900"
                                }`}
                                onClick={() => handleSelect(option.value)}
                            >
                                <span>{option.label}</span>
                                {selected == option.value && (
                                    <div className="p-1 rounded-full bg-[#e1f6fc]">
                                        <PiCheckFatFill className="text-blue-400 w-2 h-2"></PiCheckFatFill>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
