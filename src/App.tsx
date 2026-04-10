import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { questions as originalQuestions, Question } from "./data/questions";
import CatGame from "./components/CatGame";
import { 
  Trophy, 
  Timer, 
  CheckCircle2, 
  XCircle, 
  Download, 
  RefreshCcw, 
  User, 
  Play,
  AlertTriangle
} from "lucide-react";
import { toPng } from "html-to-image";
import confetti from "canvas-confetti";

// Sound URLs
const SOUNDS = {
  CORRECT: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
  HIT: "https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3" // Wrong answer buzzer
};

export default function App() {
  const [name, setName] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<"correct" | "incorrect" | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);
  const correctAudio = useRef<HTMLAudioElement | null>(null);
  const hitAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    correctAudio.current = new Audio(SOUNDS.CORRECT);
    hitAudio.current = new Audio(SOUNDS.HIT);
  }, []);

  const playSound = (type: "correct" | "hit") => {
    const audio = type === "correct" ? correctAudio.current : hitAudio.current;
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(e => console.log("Audio play blocked", e));
    }
  };

  useEffect(() => {
    let interval: number;
    if (isStarted && !isFinished && !isLost) {
      interval = window.setInterval(() => {
        if (startTime) {
          setElapsed(Math.floor((Date.now() - startTime) / 1000));
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStarted, isFinished, isLost, startTime]);

  const handleStart = () => {
    if (name.trim()) {
      // Shuffle questions
      const shuffled = [...originalQuestions].sort(() => Math.random() - 0.5);
      setQuestions(shuffled);
      setIsStarted(true);
      setStartTime(Date.now());
    }
  };

  const handleAnswer = (idx: number) => {
    if (selectedAnswer !== null || isLost) return;

    setSelectedAnswer(idx);
    const correct = idx === questions[currentIdx].answerIndex;
    
    if (correct) {
      setLastResult("correct");
      setScore(s => s + 1);
      playSound("correct");
    } else {
      setLastResult("incorrect");
      playSound("hit");
      const newIncorrect = incorrect + 1;
      setIncorrect(newIncorrect);
      if (newIncorrect >= 5) {
        setTimeout(() => setIsLost(true), 1000);
      }
    }

    // Move to next question after a delay
    setTimeout(() => {
      if (isLost || (incorrect + (correct ? 0 : 1) >= 5)) return;
      
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(c => c + 1);
        setSelectedAnswer(null);
        setLastResult(null);
      } else {
        setIsFinished(true);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }, 1500);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const downloadResult = async () => {
    if (resultRef.current) {
      try {
        const dataUrl = await toPng(resultRef.current, { cacheBust: true });
        const link = document.createElement("a");
        link.download = `ket-qua-trac-nghiem-${name}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error("Error downloading image:", err);
      }
    }
  };

  const resetQuiz = () => {
    setIsStarted(false);
    setCurrentIdx(0);
    setScore(0);
    setIncorrect(0);
    setStartTime(null);
    setElapsed(0);
    setIsFinished(false);
    setIsLost(false);
    setSelectedAnswer(null);
    setLastResult(null);
  };

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full border-b-8 border-orange-400"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-orange-400 p-4 rounded-full">
              <Trophy className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-center text-gray-800 mb-2 uppercase tracking-tight">
            Thử thách 49 câu hỏi
          </h1>
          <p className="text-center text-gray-600 mb-8 font-medium">
            Đừng để táo rơi vào đầu chú mèo nhé! 🍎🐱
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Họ và tên của bạn</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập tên để bắt đầu..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:ring-0 transition-all outline-none font-medium"
                />
              </div>
            </div>
            
            <button 
              onClick={handleStart}
              disabled={!name.trim()}
              className="w-full bg-orange-400 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2 text-lg uppercase"
            >
              <Play className="w-6 h-6 fill-current" />
              Bắt đầu thi ngay
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isLost) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-100 to-orange-100 flex flex-col items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full border-b-8 border-red-500 text-center"
        >
          <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-3xl font-black text-gray-800 uppercase mb-2">Bạn đã thua!</h2>
          <p className="text-gray-600 font-bold mb-8">
            Chú mèo đã bị táo rơi trúng đầu quá nhiều lần và ngất xỉu rồi... 😵🍎
          </p>
          <button 
            onClick={resetQuiz}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-2xl shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2 uppercase"
          >
            <RefreshCcw className="w-5 h-5" />
            Thử lại từ đầu
          </button>
        </motion.div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 to-pink-100 flex flex-col items-center justify-center p-4 font-sans">
        <div ref={resultRef} className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full border-b-8 border-green-500 mb-6">
          <div className="text-center mb-6">
            <div className="inline-block bg-green-100 p-3 rounded-full mb-4">
              <Trophy className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-800 uppercase">Kết quả bài thi</h2>
            <p className="text-gray-500 font-bold">{name}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-green-50 p-4 rounded-2xl text-center">
              <p className="text-sm font-bold text-green-600 uppercase mb-1">Đúng</p>
              <p className="text-3xl font-black text-green-700">{score}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-2xl text-center">
              <p className="text-sm font-bold text-red-600 uppercase mb-1">Sai</p>
              <p className="text-3xl font-black text-red-700">{incorrect}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-2xl text-center col-span-2">
              <p className="text-sm font-bold text-blue-600 uppercase mb-1">Thời gian hoàn thành</p>
              <p className="text-3xl font-black text-blue-700">{formatTime(elapsed)}</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl border-2 border-dashed border-gray-200 text-center">
            <p className="text-gray-600 font-medium italic">
              Chúc mừng bạn đã hoàn thành bài thi và bảo vệ được chú mèo! 🐱✨
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <button 
            onClick={downloadResult}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-2xl shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2 uppercase"
          >
            <Download className="w-5 h-5" />
            Tải ảnh kết quả
          </button>
          <button 
            onClick={resetQuiz}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-black py-4 rounded-2xl shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2 uppercase"
          >
            <RefreshCcw className="w-5 h-5" />
            Làm lại
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 p-4 md:p-6 font-sans flex flex-col">
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col gap-4">
        
        {/* Top Section: Stats (Compact - ~20% height on mobile) */}
        <div className="bg-white p-4 rounded-3xl shadow-lg border-b-4 border-gray-100 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] font-bold text-gray-400 uppercase leading-none">Thí sinh</p>
                <p className="font-black text-gray-800 truncate text-xs">{name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-xl">
                <Timer className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-black text-blue-700 text-sm tabular-nums">{formatTime(elapsed)}</span>
              </div>
              
              <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-xl">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                <span className="font-black text-green-700 text-sm">{score}</span>
              </div>

              <div className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-xl">
                <XCircle className="w-3.5 h-3.5 text-red-600" />
                <span className="font-black text-red-700 text-sm">{incorrect}/5</span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section: Question Area (Takes most space) */}
        <div className="flex-1 min-h-0 flex flex-col mb-24">
          <div className="bg-white p-5 md:p-8 rounded-3xl shadow-xl border-b-8 border-orange-400 flex-1 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-black text-[10px] uppercase">
                Câu {currentIdx + 1} / {questions.length}
              </span>
              <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-orange-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIdx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col"
                >
                  <h3 className="text-base md:text-lg font-black text-gray-800 mb-4 leading-tight">
                    {currentQuestion.question}
                  </h3>

                  <div className="grid grid-cols-1 gap-2.5">
                    {currentQuestion.options.map((option, idx) => {
                      const isSelected = selectedAnswer === idx;
                      const isCorrectOption = idx === currentQuestion.answerIndex;
                      
                      let bgColor = "bg-gray-50 hover:bg-gray-100 border-gray-200";
                      let textColor = "text-gray-700";
                      
                      if (selectedAnswer !== null) {
                        if (isCorrectOption) {
                          bgColor = "bg-green-100 border-green-500 ring-2 ring-green-500";
                          textColor = "text-green-700";
                        } else if (isSelected) {
                          bgColor = "bg-red-100 border-red-500 ring-2 ring-red-500";
                          textColor = "text-red-700";
                        } else {
                          bgColor = "bg-gray-50 opacity-50 border-gray-100";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleAnswer(idx)}
                          disabled={selectedAnswer !== null || isLost}
                          className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-center gap-3 group ${bgColor} ${textColor}`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black shrink-0 text-xs ${
                            selectedAnswer !== null && isCorrectOption 
                              ? "bg-green-500 text-white" 
                              : selectedAnswer !== null && isSelected && !isCorrectOption
                              ? "bg-red-500 text-white"
                              : "bg-white border-2 border-gray-200 group-hover:border-orange-400"
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <span className="font-bold text-xs leading-tight">{option}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Bottom Section: Cat Game (Fixed at bottom) */}
        <CatGame 
          incorrectCount={incorrect} 
          lastResult={lastResult} 
          isFainted={isLost} 
        />
      </div>
    </div>
  );
}
