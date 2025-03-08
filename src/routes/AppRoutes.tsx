import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Menu from "../components/Menu";
import Learn from "../pages/Learn";
import Library from "../pages/Library";
import Setting from "../pages/Setting";
import Reading from "../pages/Reading";
import ReadingLearn from "../pages/ReadingLearn";
import FlashCard from "../pages/FlashCard";
import About from "../pages/About";
import PageTransition from "../components/PageTransition";

const AppRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Menu /></PageTransition>} />
        <Route path="/learn" element={<PageTransition><Learn /></PageTransition>} />
        <Route path="/learn/reading" element={<PageTransition><Reading /></PageTransition>} />
        <Route path="/learn/reading/:topicId" element={<PageTransition><ReadingLearn /></PageTransition>} />
        <Route path="/learn/flashcard" element={<PageTransition><FlashCard /></PageTransition>} />
        <Route path="/library" element={<PageTransition><Library /></PageTransition>} />
        <Route path="/setting" element={<PageTransition><Setting /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

export default AppRoutes;
