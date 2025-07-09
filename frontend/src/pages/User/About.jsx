import React, { useEffect } from 'react';
import ScrollReveal from 'scrollreveal';
import { WHY_CHOOSE, ABOUT, TEAM, ICON_SOCIALS } from '../../constants/index';
import { Link } from 'react-router-dom';

function ScrollRevealEffect() {
    useEffect(() => {
        ScrollReveal().reveal('.left-element', {
            origin: 'left',
            distance: '40px',
            duration: 1000,
            delay: 50,
            reset: true,
        });

        ScrollReveal().reveal('.right-element', {
            origin: 'right',
            distance: '40px',
            duration: 1000,
            delay: 50,
            reset: true,
        });
    }, []);
    return null;
}

function Line() {
    return (
        <div className="h-[850px] w-[10px]">
            <div className="absolute left-1/2">
                <div className="h-[800px] w-[10px] absolute bg-gradient-to-b from-white via-[#afe4ff] to-[#83bbff] left-[9px]" />
                <div className="absolute bg-white border-8 border-[#7ad0ffba] rounded-full shadow-lg h-[28px] w-[28px] top-[80px]" />
                <div className="absolute bg-white border-8 border-[#7ad0ffba] rounded-full shadow-lg h-[28px] w-[28px] top-[370px]" />
                <div className="absolute bg-white border-8 border-[#7ad0ffba] rounded-full shadow-lg h-[28px] w-[28px] top-[670px]" />
            </div>
        </div>
    );
}

function ProfileCard({ img, name, role }) {
    return (
        <div className="relative w-[300px] h-[130px] bg-white rounded-2xl shadow-custom duration-300 hover:h-[230px] group">
            <div className="absolute left-1/2 -top-[50px] -translate-x-1/2 shadow-custom rounded-2xl">
                <img
                    className="rounded-2xl group-hover:w-[150px] transition-all duration-300"
                    src={img}
                    width={110}
                    height={110}
                    alt=""
                />
            </div>

            <div className="text-center flex justify-center items-center">
                <div className="translate-y-[70px] group-hover:translate-y-[100px] transition-all duration-300">
                    <p className="text-xl p-2 font-semibold">{name}</p>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-base text-gray-400 pb-2">{role}</p>
                        <div className="flex items-center justify-center space-x-3">
                            {ICON_SOCIALS.map((icon, key) => (
                                <Link key={key} to="/">
                                    <img src={icon} width={24} height={24} alt="Social icon" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Heading({ title }) {
    return (
        <h2 className="text-4xl font-bold text-center my-6">{title}</h2>
    );
}

export default function About() {
    return (
        <div>
            <ScrollRevealEffect />

            <div className="my-10">
                <Heading title="Về chúng tôi" />
            </div>

            <div className="flex items-center justify-between mb-10">
                <div className="w-1/2 pr-10 flex items-center justify-end">
                    <img
                        src={WHY_CHOOSE.picture}
                        width={550}
                        height={400}
                        className="filter contrast-125 saturate-150 brightness-75"
                        alt=""
                    />
                </div>

                <div className="w-1/2 pr-28 pl-10">
                    <p className="text-2xl font-bold my-3">{WHY_CHOOSE.title}</p>
                    <p className="text-base text-gray-400">{WHY_CHOOSE.desc}</p>
                    <ul>
                        {WHY_CHOOSE.reason.map((row, key) => (
                            <li
                                key={key}
                                className="my-4 transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg rounded-lg p-4 overflow-hidden"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="pl-5">
                                        <img src={row.img} height={30} width={30} alt="" />
                                    </div>
                                    <span className="text-xl font-medium">{row.label}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="container mx-auto grid grid-cols-three_col_custom">
                <div className="mx-auto flex flex-col w-96">
                    <div className="px-5 mb-16 left-element">
                        <p className="text-2xl font-bold py-5">{ABOUT.text[0].title}</p>
                        <p className="pl-3 leading-6 text-base">{ABOUT.text[0].desc}</p>
                    </div>

                    <div className="px-5 my-16 left-element">
                        <img src={ABOUT.img[1]} width={400} height={200} className="rounded-xl" alt="" />
                    </div>

                    <div className="px-5 left-element">
                        <p className="text-2xl font-bold py-5">{ABOUT.text[2].title}</p>
                        <p className="pl-3 leading-6 text-base">{ABOUT.text[2].desc}</p>
                    </div>
                </div>

                <Line />

                <div className="mx-auto flex flex-col w-96">
                    <div className="px-5 mb-8 right-element">
                        <img src={ABOUT.img[0]} height={200} width={400} className="rounded-xl" alt="" />
                    </div>

                    <div className="px-5 my-16 right-element text-right">
                        <p className="text-2xl font-bold py-5">{ABOUT.text[1].title}</p>
                        <p className="pr-3 text-base">{ABOUT.text[1].desc}</p>
                    </div>

                    <div className="px-5 mt-16 right-element">
                        <img src={ABOUT.img[2]} height={200} width={400} className="rounded-xl" alt="" />
                    </div>
                </div>
            </div>

            {/* Team Section */}
            <div className="my-10">
                <Heading title="Team & Founder" />
            </div>

            <div className="container mx-auto mt-24">
                <div className="grid grid-cols-3">
                    {TEAM.map((row, key) => (
                        <div key={key} className="flex items-center justify-center mb-16">
                            <ProfileCard img={row.img} name={row.name} role={row.role} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}