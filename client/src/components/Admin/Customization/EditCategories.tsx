import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AiOutlineDelete, AiOutlineCheckCircle } from 'react-icons/ai';
import { FiPlusCircle } from 'react-icons/fi';
import { useToast } from '../../ui/use-toast';
import { Button } from '../../ui/button';
import { Input } from '@mui/material';
import { cn } from '@/src/lib/utils';


type Category = {
  _id: string;
  title: string;
};

const EditCategories = () => {
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [hasSaved, setHasSaved] = useState(false);

  // useEffect(() => {
  //   if (data?.layout?.categories) {
  //     setCategories(data.layout.categories);
  //   }
  // }, [data]);

  const handleCategoryChange = (id: string, value: string) => {
    setCategories(prev => 
      prev.map(item => 
        item._id === id ? { ...item, title: value } : item
      )
    );
  };

  const handleAddCategory = () => {
    if (categories.some(cat => !cat.title.trim())) {
      toast({
        title: "Empty Category",
        description: "Please fill current categories before adding new ones",
        variant: "destructive"
      });
      return;
    }
    setCategories(prev => [...prev, { 
      _id: `temp-${Date.now()}`,
      title: "" 
    }]);
  };

  const handleSave = async () => {
    try {
      const validCategories = categories
        .filter(cat => cat.title.trim() !== "")
        .map(({ _id, title }) => ({ 
          ...(_id && !_id.startsWith('temp-') && { _id }), 
          title: title.trim() 
        }));

      if (!validCategories.length) {
        toast({
          title: "No Categories",
          description: "At least one valid category is required",
          variant: "destructive"
        });
        return;
      }

      await editLayout({
        type: "categories",
        categories: validCategories
      }).unwrap();

      setHasSaved(true);
      setTimeout(() => setHasSaved(false), 2000);
      toast({
        title: "Success",
        description: "Categories updated successfully",
        className: "bg-green-500 text-white"
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to save categories",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(prev => prev.filter(cat => cat._id !== id));
  };

  const hasChanges = () => {
    const currentValid = categories
      .filter(cat => cat.title.trim() !== "")
      .map(({ _id, title }) => ({ _id: _id.replace('temp-', ''), title }));
    return JSON.stringify(data?.layout?.categories || []) !== JSON.stringify(currentValid);
  };

  const loadDemoData = () => {
    setCategories([
      { _id: '1', title: 'Web Development' },
      { _id: '2', title: 'Mobile Apps' },
      { _id: '3', title: 'UI/UX Design' },
      { _id: '4', title: 'Data Science' },
    ]);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Manage Categories
          </h1>
          <Button
            variant="outline"
            onClick={loadDemoData}
            className="gap-2"
          >
            <FiPlusCircle className="w-4 h-4" />
            Load Demo Data
          </Button>
        </div>

    
          <div className="space-y-4">
            <AnimatePresence>
              {categories.map((category, index) => (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3 group"
                >
                  <span className="text-gray-500 dark:text-gray-400 w-6">
                    {index + 1}.
                  </span>
                  <Input
                    value={category.title}
                    onChange={(e) => handleCategoryChange(category._id, e.target.value)}
                    placeholder="Category name..."
                    className="text-lg py-6 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteCategory(category._id)}
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <AiOutlineDelete className="w-5 h-5" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>

            <Button
              onClick={handleAddCategory}
              variant="outline"
              className="w-full gap-2 text-lg h-12"
            >
              <FiPlusCircle className="w-5 h-5" />
              Add New Category
            </Button>

            <div className="sticky bottom-6 mt-8 flex justify-end gap-4">
              <Button
                onClick={handleSave}
                disabled={!hasChanges() || isSaving}
                className={cn(
                  "gap-2 px-8 py-6 text-lg transition-all",
                  hasSaved && "bg-green-500 hover:bg-green-600"
                )}
              >
               
                  <AiOutlineCheckCircle className="w-5 h-5" />
              
                  'Save Changes'
           
              </Button>
            </div>
          </div>
        
      </div>
    </div>
  );
};

export default EditCategories;