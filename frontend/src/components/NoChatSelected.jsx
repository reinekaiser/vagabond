import React, { useState, useRef, useEffect } from 'react';
import { IoMdChatboxes } from "react-icons/io";
import { useGetUsersQuery } from '../redux/api/messageApiSlice';
import { useDispatch, useSelector } from "react-redux";
import { setSelectedUser } from '../redux/features/chatSlice';

const NoChatSelected = () => {
    const dispatch = useDispatch();
    const { data: users = [], isLoading: isLoadingUsers } = useGetUsersQuery();
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
        setShowDropdown(true);
    };

    const handleSelectUser = (user) => {
        setSearchTerm(`${user.firstName} ${user.lastName}`);
        setShowDropdown(false);
        dispatch(setSelectedUser(user));
    };

    const filteredUsers = users.filter(user => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
    });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div>
            <div className='w-full relative flex items-center gap-4 px-4 py-5 border-b'>
                <span className='font-semibold text-[16px]'>To: </span>
                <div className='relative w-full' ref={dropdownRef}>
                    <input
                        value={searchTerm}
                        onChange={handleInputChange}
                        onFocus={() => setShowDropdown(true)}
                        placeholder='+ Chọn người liên lạc'
                        className='w-full text-[14px] px-4 py-2 rounded-md border border-gray-300 focus:outline-none'
                    />
                    {showDropdown && (
                        <ul className='absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-md max-h-60 overflow-y-auto'>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map(user => (
                                    <li
                                        key={user._id}
                                        onClick={() => handleSelectUser(user)}
                                        className='px-4 py-2 hover:bg-gray-100 cursor-pointer'
                                    >
                                        <div className="w-full flex items-center gap-3 ">
                                            <img
                                                src={user.profilePicture || "/ava.jpg"}
                                                alt={user.firstName}
                                                className="w-8 h-8 object-cover rounded-full"
                                            />
                                            <p>{user.firstName} {user.lastName}</p>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <li className='px-4 py-2 text-gray-500'>Không tìm thấy người dùng</li>
                            )}
                        </ul>
                    )}
                </div>
            </div>

            <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100/50">
                <div className="max-w-md text-center space-y-6">
                    <div className="flex justify-center gap-4 mb-4">
                        <div className="relative">
                            <div className="w-16 h-8 rounded-2xl bg-primary/10 flex items-center justify-center animate-bounce">
                                <IoMdChatboxes className='size-12' />
                            </div>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold">Welcome to Chatty!</h2>
                    <p className="text-base-content/60">
                        Select a conversation from the sidebar to start chatting
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NoChatSelected;