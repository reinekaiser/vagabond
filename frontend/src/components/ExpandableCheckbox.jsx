import React, { useState } from 'react'
import { Checkbox, Modal } from "antd";

const ExpandableCheckbox = ({ options = [], selected = [], onChange }) => {
    const [showAll, setShowAll] = React.useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const visibleOptions = showAll ? options : options.slice(0, 5);

    const handleCheckboxChange = (checkedValue, item) => {
        const updated = checkedValue ? [...selected, item] : selected.filter(f => f !== item);
        onChange?.(updated);
    };

    const handleModalCheckboxChange = (checkedValues) => {
        onChange?.(checkedValues);
    };

    return (
        <div>
            <div className='space-y-2'>
                {visibleOptions.map((option, index) => (
                    <div key={index} className=''>
                        <Checkbox
                            checked={selected.includes(option.value)}
                            onChange={e => handleCheckboxChange(e.target.checked, option.value)}
                        >
                            <span className='text-[15px]'>{option.label}</span>
                        </Checkbox>
                    </div>
                ))}
            </div>

            {(options.length > 5 && options.length <= 15) && (
                <div className='flex justify-center mt-2'>
                    <button
                        className='text-blue-500 hover:underline duration-300'
                        onClick={() => setShowAll(!showAll)}
                    >
                        {showAll ? 'Thu gọn' : 'Xem tất cả' }
                    </button>
                </div>
            )}

            {(options.length > 15) && (
                <div className='flex justify-center mt-2'>
                    <button
                        className='text-blue-500 hover:underline duration-300'
                        onClick={() => setIsModalOpen(true)}
                    >
                        {showAll ? 'Thu gọn' : 'Xem tất cả'}
                    </button>
                </div>
            )}

            <Modal
                title="Chọn tiện nghi"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={950}
                centered
            >
                <div className="flex justify-end mb-2">
                    <button
                        className="text-red-500 underline"
                        onClick={() => onChange?.([])}
                    >
                        Bỏ chọn tất cả
                    </button>
                </div>
                <Checkbox.Group
                    value={selected}
                    onChange={handleModalCheckboxChange}
                >
                    <div
                        className='grid grid-cols-3 gap-2 '
                        style={{
                            maxHeight: '400px',
                            overflowY: 'auto',
                            paddingRight: '8px',
                            paddingTop: '8px',
                        }}
                    >
                        {options.map((option, index) => (
                            <Checkbox key={index} value={option.value}>
                                <span className='text-[14px]'>{option.label}</span>
                            </Checkbox>
                        ))}
                    </div>
                </Checkbox.Group>
            </Modal>
        </div>
    )
}

export default ExpandableCheckbox;