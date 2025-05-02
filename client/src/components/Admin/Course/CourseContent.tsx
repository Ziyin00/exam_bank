import React, { FC, useState, useEffect, useCallback } from "react";
import { AiOutlineDelete, AiOutlineCloudUpload } from "react-icons/ai";
import { MdOutlineKeyboardArrowDown, MdOutlineTitle } from "react-icons/md";
import { BiSolidPencil, BiLinkExternal } from "react-icons/bi";
import { BsLink45Deg, BsImage } from "react-icons/bs";
import { RiDragDropLine, RiAddCircleLine } from "react-icons/ri";
import { TbSection } from "react-icons/tb";
import toast from "react-hot-toast";
import { style } from "@/src/styles/style";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  active: number;
  setActive: (active: number) => void;
  courseContentData: any;
  setCourseContentData: (courseContentData: any) => void;
  handleSubmit: any;
};

const CourseContent: FC<Props> = ({
  courseContentData,
  setCourseContentData,
  active,
  setActive,
  handleSubmit: handleCourseSubmit,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean[]>(
    Array(courseContentData.length).fill(false)
  );
  const [activeSection, setActiveSection] = useState(1);
  const [imageInputModes, setImageInputModes] = useState<string[]>([]);

  useEffect(() => {
    setImageInputModes(
      courseContentData.map((item: any) =>
        item.imageUrl?.startsWith("data:") ? "upload" : "url"
      )
    );
  }, [courseContentData]);

  const handleImageModeChange = (index: number, mode: string) => {
    const newModes = [...imageInputModes];
    newModes[index] = mode;
    setImageInputModes(newModes);

    if (mode === "url" && courseContentData[index].imageUrl?.startsWith("data:")) {
      const updateData = [...courseContentData];
      updateData[index].imageUrl = "";
      setCourseContentData(updateData);
    }
  };

  const handleImageUpload = useCallback((index: number, file: File) => {
    if (!file.type.startsWith("image/")) {
      return toast.error("Only image files are allowed (PNG, JPG, JPEG)");
    }
    if (file.size > 5 * 1024 * 1024) {
      return toast.error("Image size must be less than 5MB");
    }

    const reader = new FileReader();
    reader.onload = () => {
      const updateData = [...courseContentData];
      updateData[index].imageUrl = reader.result as string;
      setCourseContentData(updateData);
    };
    reader.readAsDataURL(file);
  }, [courseContentData, setCourseContentData]);

  const handleCollapseToggle = (index: number) => {
    const updatedCollapsed = [...isCollapsed];
    updatedCollapsed[index] = !updatedCollapsed[index];
    setIsCollapsed(updatedCollapsed);
  };

  const handleRemoveLink = (index: number, linkIndex: number) => {
    const updatedData = [...courseContentData];
    updatedData[index].links.splice(linkIndex, 1);
    setCourseContentData(updatedData);
  };

  const handleAddLink = (index: number) => {
    const updatedData = [...courseContentData];
    updatedData[index].links.push({ title: "", url: "" });
    setCourseContentData(updatedData);
  };

  const validateSection = (item: any) => {
    return (
      item.title?.trim() &&
      item.description?.trim() &&
      item.imageUrl?.trim() &&
      item.links[0]?.title?.trim() &&
      item.links[0]?.url?.trim()
    );
  };

  const newContentHandler = (item: any) => {
    if (!validateSection(item)) {
      return toast.error("Please fill all required fields in current section");
    }
    const newContent = {
      imageUrl: "",
      title: "",
      description: "",
      imageSection: courseContentData[courseContentData.length - 1].imageSection,
      links: [{ title: "", url: "" }],
    };
    setCourseContentData([...courseContentData, newContent]);
  };

  const addNewSection = () => {
    if (!validateSection(courseContentData[courseContentData.length - 1])) {
      return toast.error("Please complete current section before adding new");
    }
    setActiveSection(activeSection + 1);
    const newContent = {
      imageUrl: "",
      title: "",
      description: "",
      imageSection: `Section ${activeSection + 1}`,
      links: [{ title: "", url: "" }],
    };
    setCourseContentData([...courseContentData, newContent]);
  };

  const prevButton = () => setActive(active - 1);

  const handleOptions = () => {
    if (!validateSection(courseContentData[courseContentData.length - 1])) {
      return toast.error("Please complete all sections before proceeding");
    }
    setActive(active + 1);
    handleCourseSubmit();
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="w-[90%] max-w-4xl m-auto mt-12 p-4">
      <form onSubmit={(e) => e.preventDefault()}>
        <AnimatePresence mode="popLayout">
          {courseContentData?.map((item: any, index: number) => {
            const showSectionInput = index === 0 || 
              item.imageSection !== courseContentData[index - 1].imageSection;

            return (
              <motion.div
                key={index}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={sectionVariants}
                className={`w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${
                  showSectionInput ? "mt-8" : "mt-4"
                }`}
              >
                {showSectionInput && (
                  <div className="flex items-center gap-3 mb-6">
                    <TbSection className="text-xl text-blue-500" />
                    <input
                      type="text"
                      className={`text-xl font-semibold flex-1 ${
                        item.imageSection.includes("Section") 
                          ? "text-gray-400" 
                          : "text-gray-800 dark:text-white"
                      } bg-transparent outline-none border-b-2 border-transparent focus:border-blue-500`}
                      value={item.imageSection}
                      onChange={(e) => {
                        const updateData = [...courseContentData];
                        updateData[index].imageSection = e.target.value;
                        setCourseContentData(updateData);
                      }}
                      placeholder="Section Title"
                    />
                    <BiSolidPencil className="text-gray-500 cursor-pointer hover:text-blue-500" />
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">
                      {index + 1}.
                    </span>
                    {isCollapsed[index] && item.title && (
                      <p className="font-medium text-gray-700 dark:text-gray-200">
                        {item.title}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {index > 0 && (
                      <button
                        onClick={() => {
                          const updateData = [...courseContentData];
                          updateData.splice(index, 1);
                          setCourseContentData(updateData);
                          setIsCollapsed(isCollapsed.filter((_, i) => i !== index));
                        }}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg text-red-500 hover:text-red-700"
                      >
                        <AiOutlineDelete className="text-xl" />
                      </button>
                    )}
                    <button
                      onClick={() => handleCollapseToggle(index)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <MdOutlineKeyboardArrowDown
                        className={`text-xl transition-transform ${
                          isCollapsed[index] ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {!isCollapsed[index] && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <MdOutlineTitle />
                        Content Title
                      </label>
                      <input
                        type="text"
                        placeholder="Enter content title..."
                        className={`${style.input} !pl-10`}
                        value={item.title}
                        onChange={(e) => {
                          const updateData = [...courseContentData];
                          updateData[index].title = e.target.value;
                          setCourseContentData(updateData);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <BsImage />
                        Media Source
                      </label>
                      <div className="flex gap-3 mb-3">
                        <button
                          type="button"
                          onClick={() => handleImageModeChange(index, "url")}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                            imageInputModes[index] === "url"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                          }`}
                        >
                          <BiLinkExternal />
                          URL
                        </button>
                        <button
                          type="button"
                          onClick={() => handleImageModeChange(index, "upload")}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                            imageInputModes[index] === "upload"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                          }`}
                        >
                          <AiOutlineCloudUpload />
                          Upload
                        </button>
                      </div>

                      {imageInputModes[index] === "url" ? (
                        <input
                          type="url"
                          placeholder="Paste image URL here..."
                          className={`${style.input} !pl-10`}
                          value={item.imageUrl}
                          onChange={(e) => {
                            const updateData = [...courseContentData];
                            updateData[index].imageUrl = e.target.value;
                            setCourseContentData(updateData);
                          }}
                        />
                      ) : (
                        <div className="relative group">
                          <input
                            type="file"
                            accept="image/*"
                            id={`file-upload-${index}`}
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(index, file);
                            }}
                          />
                          <label
                            htmlFor={`file-upload-${index}`}
                            className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-blue-500 transition-colors group-hover:bg-gray-50 dark:group-hover:bg-gray-900"
                          >
                            {item.imageUrl ? (
                              <div className="relative w-full h-full">
                                <img
                                  src={item.imageUrl}
                                  alt="Preview"
                                  className="w-full h-full object-cover rounded-lg"
                                />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <RiDragDropLine className="text-4xl text-white" />
                                </div>
                              </div>
                            ) : (
                              <>
                                <RiDragDropLine className="text-4xl text-gray-400 mb-3" />
                                <p className="text-gray-500 dark:text-gray-400 text-center">
                                  Drag & drop image or click to upload
                                  <br />
                                  <span className="text-sm">
                                    (Max 5MB, 16:9 aspect ratio recommended)
                                  </span>
                                </p>
                              </>
                            )}
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <BiSolidPencil />
                        Content Description
                      </label>
                      <textarea
                        rows={5}
                        placeholder="Describe your content in detail..."
                        className={`${style.input} !h-auto !min-h-[120px]`}
                        value={item.description}
                        onChange={(e) => {
                          const updateData = [...courseContentData];
                          updateData[index].description = e.target.value;
                          setCourseContentData(updateData);
                        }}
                      />
                    </div>

                    <div className="space-y-4">
                      {item.links.map((link: any, linkIndex: number) => (
                        <div key={linkIndex} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                              <BsLink45Deg />
                              Link {linkIndex + 1}
                            </label>
                            {linkIndex > 0 && (
                              <button
                                onClick={() => handleRemoveLink(index, linkIndex)}
                                className="p-1 hover:bg-red-50 dark:hover:bg-red-900 rounded-md text-red-500 hover:text-red-700"
                              >
                                <AiOutlineDelete className="text-lg" />
                              </button>
                            )}
                          </div>
                          <input
                            type="text"
                            placeholder="Link title (e.g., Source Code)"
                            className={`${style.input} !pl-10`}
                            value={link.title}
                            onChange={(e) => {
                              const updatedData = [...courseContentData];
                              updatedData[index].links[linkIndex].title = e.target.value;
                              setCourseContentData(updatedData);
                            }}
                          />
                          <input
                            type="url"
                            placeholder="https://example.com"
                            className={`${style.input} !pl-10`}
                            value={link.url}
                            onChange={(e) => {
                              const updatedData = [...courseContentData];
                              updatedData[index].links[linkIndex].url = e.target.value;
                              setCourseContentData(updatedData);
                            }}
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleAddLink(index)}
                        className="flex items-center gap-2 text-blue-500 hover:text-blue-700 text-sm font-medium"
                      >
                        <RiAddCircleLine className="text-lg" />
                        Add Additional Link
                      </button>
                    </div>

                    {index === courseContentData.length - 1 && (
                      <button
                        type="button"
                        onClick={() => newContentHandler(item)}
                        className="w-full py-3 flex items-center justify-center gap-2 bg-blue-50 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-gray-600 text-blue-500 rounded-lg transition-colors"
                      >
                        <RiAddCircleLine className="text-xl" />
                        Add New Content Block
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        <button
          type="button"
          onClick={addNewSection}
          className="w-full mt-6 py-3 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
        >
          <TbSection className="text-xl" />
          Add New Section
        </button>
      </form>

      <div className="w-full flex items-center justify-between gap-4 mt-8">
        <button
          onClick={prevButton}
          className="flex-1 py-3 px-6 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
        >
          Previous
        </button>
        <button
          onClick={handleOptions}
          className="flex-1 py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-lg hover:shadow-blue-500/30"
        >
          Continue to Next Step
        </button>
      </div>
    </div>
  );
};

export default CourseContent;