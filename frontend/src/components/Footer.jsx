import React from 'react'
import { Link } from 'react-router-dom';
import { FOOTER_SOCIALS, FOOTER_LINKS, FOOTER_PAYMENT } from '../constants/index';

const Footer = () => {
    return (
        <footer className="bg-blue-950 pt-14">
            <div className="container mx-auto grid grid-cols-footer">
                <div className="flex flex-col">
                    <div className="flex items-center">
                        <span className="ml-2 font-bold text-2xl text-white">
                            vagabond
                        </span>
                    </div>

                    <div className="flex gap-6 items-center mt-7 mb-12">
                        <div>
                            <img
                                src="/images/footer/certificate-2.webp"
                                width={73}
                                height={35}
                                alt="certificate 2"
                            />
                        </div>
                        <Link to="/">
                            <img
                                src="/images/footer/certificate-3.webp"
                                width={112}
                                height={38}
                                alt="certificate 3"
                            />
                        </Link>
                    </div>

                    <FooterColumn title={FOOTER_SOCIALS.title} variant="mt-10">
                        <ul className="mt-4 flex flex-col gap-2">
                            {FOOTER_SOCIALS.links.map((link, idx) => (
                                <li key={idx}>
                                    <a
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2"
                                    >
                                        <div
                                            className="w-6 h-6 flex items-center justify-center rounded"
                                            style={{ backgroundColor: link.bg }}
                                        >
                                            <img
                                                src={link.img}
                                                width={20}
                                                height={20}
                                                alt={link.label}
                                            />
                                        </div>
                                        <span className="text-white hover:underline">
                                            {link.label}
                                        </span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </FooterColumn>
                </div>

                {FOOTER_LINKS.map((column, key) => (
                    <FooterColumn title={column.title} key={key}>
                        <ul className="mt-4 flex flex-col gap-2">
                            {column.links.map((link, idx) => (
                                <li key={idx} className="text-white">
                                    <Link to="/" className="hover:underline">
                                        {link}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </FooterColumn>
                ))}

                <FooterColumn title={FOOTER_PAYMENT.title}>
                    <div className="flex flex-wrap gap-2 mt-4">
                        {FOOTER_PAYMENT.payments.map((payment, idx) => (
                            <div
                                key={idx}
                                className="bg-white w-[80px] h-14 flex items-center justify-center rounded-md"
                            >
                                <img
                                    src={payment}
                                    width={59}
                                    height={21}
                                    alt="payment"
                                />
                            </div>
                        ))}
                    </div>
                </FooterColumn>
            </div>

            <div className="w-full h-[1px] mt-7 bg-gray-500"></div>
            <div className="py-4">
                <p className="text-white text-center text-[12px]">
                    Copyright © 2025 VagaBond. All rights reserved
                </p>
            </div>
        </footer>
    )
}

function FooterColumn({ title, children }) {
    return (
        <div>
            <h4 className="font-bold text-white text-base">{title}</h4>
            {children}
        </div>
    );
}

export default Footer;
