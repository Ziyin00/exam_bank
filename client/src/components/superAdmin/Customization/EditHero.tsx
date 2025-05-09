import { style } from '@/src/styles/style';
import React, { FC, useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { AiOutlineCamera } from 'react-icons/ai';

type Props = {}

// Demo data structure
interface LayoutData {
  banner: {
    image: {
      url: string;
    };
    title: string;
    subTitle: string;
  };
}

const EditHero: FC<Props> = () => {
  const [image, setImage] = useState("");
  const [title, setTitle] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [demoData, setDemoData] = useState<LayoutData>({
    banner: {
      image: { url: "https://via.placeholder.com/800x600" },
      title: "Improve Your Online Learning Experience Better Instantly",
      subTitle: "We have 40k+ Online courses & 500K+ Online registered students. Find your desired Courses from them."
    }
  });

  useEffect(() => {
    // Initialize with demo data
    setImage(demoData.banner.image.url);
    setTitle(demoData.banner.title);
    setSubTitle(demoData.banner.subTitle);
  }, []);

  const handleUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('image')) {
      return toast.error("Please select an image file");
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (reader.readyState === 2 && typeof e.target?.result === 'string') {
        setImage(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEdit = async () => {
    if (!title.trim() || !subTitle.trim() || !image) {
      return toast.error("Please fill all fields");
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setDemoData({
        banner: {
          image: { url: image },
          title,
          subTitle
        }
      });
      toast.success("Banner updated successfully!");
    } catch (error) {
      toast.error("Failed to update banner");
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges =
    title !== demoData.banner.title ||
    subTitle !== demoData.banner.subTitle ||
    image !== demoData.banner.image.url;

  return (
    <div className="w-full min-h-screen flex flex-col 1000px:flex-row items-center justify-center p-4">
      <div className="relative w-full max-w-[800px] flex flex-col 1000px:flex-row items-center gap-8">
        {/* Image Upload Section */}
        <div className="w-full 1000px:w-[40%] flex items-center justify-center">
          <div className="relative w-[300px] h-[300px] 1100px:w-[400px] 1100px:h-[400px] rounded-full overflow-hidden border-4 border-[#37a39a] shadow-lg">
            <img
              src={image}
              alt="Banner"
              className="w-full h-full object-cover"
            />
            <input
              type="file"
              id="banner"
              accept="image/*"
              onChange={handleUpdate}
              className="hidden"
            />
            <label
              htmlFor="banner"
              className="absolute bottom-4 right-4 w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center cursor-pointer hover:bg-[#37a39a] transition-colors shadow-md"
            >
              <AiOutlineCamera className="text-xl text-gray-700 dark:text-white" />
            </label>
          </div>
        </div>

        {/* Content Section */}
        <div className="w-full 1000px:w-[60%] flex flex-col gap-6">
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter banner title"
            className={`${style.input} !text-3xl 1000px:!text-4xl font-bold resize-none h-auto py-2 text-center 1000px:text-left`}
            rows={2}
          />

          <textarea
            value={subTitle}
            onChange={(e) => setSubTitle(e.target.value)}
            placeholder="Enter banner subtitle"
            className={`${style.input} !text-lg resize-none h-auto py-2 text-center 1000px:text-left`}
            rows={3}
          />

          <button
            onClick={handleEdit}
            disabled={!hasChanges || isLoading}
            className={`${style.button} !w-[200px] self-center 1000px:self-start ${
              (!hasChanges || isLoading) ? "!bg-gray-400 !cursor-not-allowed" : "hover:scale-105"
            } transition-transform`}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditHero;