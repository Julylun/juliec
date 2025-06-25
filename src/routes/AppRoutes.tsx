import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Menu from "../components/Menu";
import Learn from "../pages/Learn";
import Library from "../pages/Library";
import Setting from "../pages/Setting";
import Reading from "../pages/Reading";
import ReadingLearn from "../pages/ReadingLearn";
import Writing from "../pages/Writing";
import WritingLearn from "../pages/WritingLearn";
import Listening from "../pages/Listening";
import ListeningLearn from "../pages/ListeningLearn";
import FlashCard from "../pages/FlashCard";
import About from "../pages/About";
import Translate from "../pages/Translate";
import TranslateLearn from "../pages/TranslateLearn";
import Changelog from "../pages/Changelog";
import PageTransition from "../components/PageTransition";
import Anki from '../pages/Anki';
import AnkiWTC from '../pages/AnkiWTC';

const AppRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Menu /></PageTransition>} />
        <Route path="/learn" element={<PageTransition><Learn /></PageTransition>} />
        <Route path="/learn/reading" element={<PageTransition><Reading /></PageTransition>} />
        <Route path="/learn/reading/:topicId" element={<PageTransition><ReadingLearn /></PageTransition>} />
        <Route path="/learn/writing" element={<PageTransition><Writing /></PageTransition>} />
        <Route path="/learn/writing/:topicId" element={<PageTransition><WritingLearn /></PageTransition>} />
        <Route path="/learn/listening" element={<PageTransition><Listening /></PageTransition>} />
        <Route path="/learn/listening/:topicId" element={<PageTransition><ListeningLearn /></PageTransition>} />
        <Route path="/learn/flashcard" element={<PageTransition><FlashCard /></PageTransition>} />
        <Route path="/learn/translate" element={<PageTransition><Translate /></PageTransition>} />
        <Route path="/learn/translate/:topicId" element={<PageTransition><TranslateLearn /></PageTransition>} />
        <Route path="/library" element={<PageTransition><Library /></PageTransition>} />
        <Route path="/setting" element={<PageTransition><Setting /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/changelog" element={<PageTransition><Changelog /></PageTransition>} />
        <Route path="/anki" element={<PageTransition><Anki /></PageTransition>} />
        <Route path="/anki/wtc" element={<PageTransition><AnkiWTC /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

export default AppRoutes;
