import React, { createContext, useContext, useState, useEffect } from "react";

const CategoryContext = createContext(null);

export function CategoryProvider({ children }) {
  const [activeCategory, setActiveCategory] = useState("english");
  const [initialised, setInitialised] = useState(false);

  useEffect(() => {
    setInitialised(true);
  }, []);

  return (
    <CategoryContext.Provider value={{ activeCategory, setActiveCategory, initialised }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategory() {
  const ctx = useContext(CategoryContext);
  if (!ctx) throw new Error("useCategory must be used within CategoryProvider");
  return ctx;
}