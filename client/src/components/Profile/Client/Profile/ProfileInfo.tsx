import Image from "next/image";
import React, { FC, useEffect, useState } from "react";
import avatarIcon from "../../../../../public/assets/avatar.jpg";
import { AiOutlineCamera } from "react-icons/ai";

import toast from "react-hot-toast";
import { style } from "@/src/styles/style";
type Props = {
  avatar: string | null;
  user: any;
};

const ProfileInfo: FC<Props> = ({ avatar, user }) => {
  const [name, seName] = useState(user && user.name);

  const [loadUser, setLoadUser] = useState(false);


  const imageHandler = async (e: any) => {
    const fileReader = new FileReader();

    fileReader.onload = () => {
      if (fileReader.readyState === 2) {
        const avatar = fileReader.result;
        updateAvatar({
          avatar,
        });
      }
    };
    fileReader.readAsDataURL(e.target.files[0]);
  };
  

  // const handleSubmit = async (e: any) => {
  //   e.preventDefault();
  //   if (name !== "") {
  //     await editProfile({
  //       name: name,
        
  //     });
  //   }
  // };

  return (
    <>
      <div className="w-full flex justify-center">
        <div className="relative">
          <Image
            src={ avatarIcon}
            width={120}
            height={120}
            alt="avatar"
            className="w-[120px] h-[120px] cursor-pointer border-[3px] border-[#37a39a] rounded-full "
          />
          <input
            type="file"
            name=""
            id="avatar"
            className="hidden"
            onChange={imageHandler}
            accept="image/png, image/jpeg, image/jpg, image/webp"
          />
          <label htmlFor="avatar">
            <div className="w-[30px] h-[30px] bg-slate-100 rounded-full absolute bottom-2 right-2 flex items-center justify-center cursor-pointer">
              <AiOutlineCamera size={20} className="z-1" />
            </div>
          </label>
        </div>
      </div>
      <br />
      <br />
      <div className="w-full pl-6 lg:pl-10">
        <form >
          <div className="lg:w-[50%] m-auto block pb-4 ">
            <div className="w-[100%] ">
              <label className="block pb-2">Full Name</label>
              <input
                type="text"
                className={`${style.input} !w-[95%] mb-4 lg:mb-0 `}
                required
                value={name}
                onChange={(e) => seName(e.target.value)}
              />
            </div>

            <div className="w-[100%] ">
              <label className="block pt-2 pb-1">Email Address</label>
              <input
                type="text"
                readOnly
                className={`${style.input} !w-[95%] mb-1 lg:mb-0 `}
                required
                value={user?.email}
              />
            </div>
            <input
              className={`w-full lg:w-[250px] h-[40px] border border-[#37a39a] text-center dark:text-center dark:text-[#fff] text-black rounded-[3px] mt-8 cursor-pointer `}
              type="submit"
              value="update"
              required
            />
          </div>
        </form>
        <br />
      </div>
    </>
  );
};

export default ProfileInfo;
