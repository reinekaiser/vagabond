import React from "react";
import { Collapse, Form, Input, Button } from "antd";
import { PiStarFourLight } from "react-icons/pi";
const { Panel } = Collapse;

import {
    QUESTION,
    BANNER_CONTACT,
    CONTACT_INFO,
    GET_IN_TOUCH,
} from "../../constants/index";

export default function Contact() {
    const handleSubmit = (values) => {
        console.log("Form submitted:", values);
    };

    const panelStyle = {
        background: "#fff",
        border: "1px solid #e8e8e8",
    };

    const getItems = (style, fqas) =>
        fqas.map((fqa, index) => {
            const isLast = index === fqas.length - 1;
            const childStyle = !isLast
                ? style
                : {
                    ...style,
                    borderRadius: "0 0 8px 8px",
                };

            return {
                key: index,
                label: (
                    <p className="text-xl -mt-1 pb-1 font-semibold ">
                        {fqa.question}
                    </p>
                ),
                children: (
                    <p className="text-base p-4 bg-gray-100">{fqa.answer}</p>
                ),
                style: childStyle,
            };
        });
    return (
        <div className="font-sans">
            <div className="relative w-full h-[220px]">
                <img
                    src={BANNER_CONTACT.img}
                    alt="Banner"
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-[30px] left-1/2 transform -translate-x-1/2 w-[50%] text-center">
                    <h1 className="text-white text-5xl font-bold py-4">
                        {BANNER_CONTACT.title}
                    </h1>
                    <p className="text-white text-xl">{BANNER_CONTACT.desc}</p>
                </div>
            </div>

            {/* Thông tin liên hệ */}
            <div className="container mx-auto my-10 grid grid-cols-3 gap-6">
                {CONTACT_INFO.map((item, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl p-6 text-center shadow hover:shadow-xl duration-300"
                    >
                        <img
                            src={item.icon}
                            alt="icon"
                            className="mx-auto mb-4 w-[40px]"
                        />
                        <p className="text-2xl font-bold">{item.title}</p>
                        <p className="text-gray-500 my-2">{item.desc}</p>
                        <a
                            href="#"
                            className="text-black hover:text-blue-500 hover:underline"
                        >
                            {item.info}
                        </a>
                    </div>
                ))}
            </div>

            {/* Form liên hệ */}
            <div className="container mx-auto my-10 grid grid-cols-2 gap-10">
                <div className="mt-10">
                    <p className="text-sky-500 text-xl">
                        {GET_IN_TOUCH.sub_title}
                    </p>
                    <p className="text-4xl font-bold py-4">
                        {GET_IN_TOUCH.title}
                    </p>
                    <p className="text-gray-500">{GET_IN_TOUCH.desc}</p>
                </div>

                <div className="shadow p-6 rounded-lg">
                    <Form layout="vertical" onFinish={handleSubmit}>
                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item
                                label="Họ và Tên"
                                name="name"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập họ tên",
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập email",
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </div>
                        <Form.Item
                            label="Để lại lời nhắn"
                            name="message"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập tin nhắn",
                                },
                            ]}
                        >
                            <Input.TextArea rows={4} />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Gửi
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>

            <div className="container mx-auto mb-20">
                <h2 className="text-4xl font-bold text-center mb-6">
                    Các câu hỏi thường gặp
                </h2>
                <div className="">
                    <Collapse
                        accordion
                        expandIcon={({ isActive }) => (
                            <PiStarFourLight
                                className={`w-5 h-5 ${isActive ? "rotate-45" : "rotate-0"
                                    }`}
                            />
                        )}
                        items={getItems(panelStyle, QUESTION)}
                    >
                        {/* {QUESTION.map((item, index) => (
                            <Panel header={item.question} key={index}>
                                <p className="text-gray-600">{item.answer}</p>
                            </Panel>
                        ))} */}
                    </Collapse>
                </div>
            </div>
        </div>
    );
}
