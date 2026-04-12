import React, { useState, useEffect, useRef } from "react";
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  setDoc, 
  query, 
  orderBy, 
  getDoc,
  getDocs
} from "firebase/firestore";
import { db, auth, ensureAuth, handleFirestoreError, OperationType } from "../firebase";
import { Question, mathQuestions, scienceQuestions } from "../data/questions";
import { User as FirebaseUser } from "firebase/auth";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  Plus, 
  Play, 
  LogOut, 
  Send, 
  MessageSquare, 
  Crown, 
  X,
  CheckCircle2,
  XCircle,
  Timer,
  Trophy
} from "lucide-react";
import confetti from "canvas-confetti";

interface Participant {
  id: string;
  name: string;
  score: number;
  incorrect: number;
  isFinished: boolean;
  lastAnswerResult: "correct" | "incorrect" | null;
}

interface Room {
  id: string;
  title: string;
  hostId: string;
  subject: "math" | "science";
  questionCount: number;
  status: "waiting" | "playing" | "finished";
  currentQuestionIndex: number;
  startTime: number;
  lastActive: number;
  createdAt: number;
  questionIds: number[];
  theme?: "garden" | "animals" | "space";
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: any;
}

interface ThemeStyles {
  bg: string;
  bgImage: string;
  card: string;
  accent: string;
  button: string;
  icon: string;
  decor: string[];
  text: string;
  subtext: string;
  progress: string;
}

interface RoomWrapperProps {
  children: React.ReactNode;
  themeStyles: ThemeStyles;
  className?: string;
}

const RoomWrapper = ({ children, themeStyles, className = "" }: RoomWrapperProps) => (
  <div className={`min-h-screen ${themeStyles.bg} p-4 md:p-6 font-sans flex flex-col lg:flex-row gap-6 transition-colors duration-500 relative overflow-hidden ${className}`}>
    {/* Background Decoration */}
    {themeStyles.bgImage && (
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none bg-cover bg-center"
        style={{ backgroundImage: `url(${themeStyles.bgImage})` }}
      />
    )}
    
    {/* Floating Decor Elements */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {themeStyles.decor.map((emoji, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: Math.random() * 100 + "%",
            opacity: 0.1,
            scale: 0.5 + Math.random()
          }}
          animate={{ 
            y: ["-10%", "110%"],
            rotate: [0, 360]
          }}
          transition={{ 
            duration: 20 + Math.random() * 20, 
            repeat: Infinity, 
            ease: "linear",
            delay: -Math.random() * 20
          }}
          className="absolute text-4xl"
        >
          {emoji}
        </motion.div>
      ))}
    </div>
    <div className="relative z-10 flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto">
      {children}
    </div>
  </div>
);

interface MultiplayerRoomProps {
  userName: string;
  onExit: () => void;
}

export default function MultiplayerRoom({ userName: initialUserName, onExit }: MultiplayerRoomProps) {
  const [userName, setUserName] = useState(initialUserName);
  const [showNamePrompt, setShowNamePrompt] = useState(!initialUserName.trim());
  const [tempName, setTempName] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<"garden" | "animals" | "space">("garden");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [localQuestionIndex, setLocalQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<"correct" | "incorrect" | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [authError, setAuthError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const messageAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    messageAudio.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3");
  }, []);

  useEffect(() => {
    ensureAuth().then(user => {
      setCurrentUser(user);
    }).catch(err => {
      if (err.code === 'auth/admin-restricted-operation') {
        setAuthError("Đăng nhập ẩn danh chưa được bật. Vui lòng liên hệ quản trị viên hoặc bật 'Anonymous' trong Firebase Console.");
      } else {
        setAuthError(err.message);
      }
    });
  }, []);

  // Listen for rooms
  useEffect(() => {
    let unsubscribe: () => void;
    
    const startListening = async () => {
      try {
        await ensureAuth();
      } catch (e) {
        console.warn("Auth failed, but continuing to listen for rooms as guest.");
      }
      const q = query(collection(db, "rooms"));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const now = Date.now();
        const roomsData = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Room))
          .filter(room => {
            // Filter out rooms that haven't been active for more than 2 minutes
            // If lastActive is missing (old rooms), we use createdAt as fallback
            const lastActive = room.lastActive || room.createdAt;
            return (now - lastActive) < 120000; // 2 minutes
          });
        
        setRooms(roomsData);
        
        if (currentRoom) {
          const updated = roomsData.find(r => r.id === currentRoom.id);
          if (updated) setCurrentRoom(updated);
          else setCurrentRoom(null);
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, "rooms");
      });
    };

    startListening();
    return () => unsubscribe?.();
  }, [currentRoom?.id]);

  // Listen for participants and messages when in a room
  useEffect(() => {
    if (!currentRoom) return;

    const participantsUnsubscribe = onSnapshot(
      collection(db, `rooms/${currentRoom.id}/participants`),
      (snapshot) => {
        const pData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Participant));
        setParticipants(pData);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `rooms/${currentRoom.id}/participants`);
      }
    );

    const messagesQuery = query(
      collection(db, `rooms/${currentRoom.id}/messages`),
      orderBy("timestamp", "asc")
    );
    const messagesUnsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const mData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      
      // Play sound for new messages if not from self
      if (mData.length > messages.length && messages.length > 0) {
        const lastMsg = mData[mData.length - 1];
        if (currentUser && lastMsg.senderId !== currentUser.uid) {
          messageAudio.current?.play().catch(() => {});
          setHasUnreadMessages(true);
        }
      }
      
      setMessages(mData);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `rooms/${currentRoom.id}/messages`);
    });

    return () => {
      participantsUnsubscribe();
      messagesUnsubscribe();
    };
  }, [currentRoom?.id]);

  // Timer for playing state
  useEffect(() => {
    let interval: number;
    if (currentRoom?.status === "playing" && currentRoom.startTime) {
      interval = window.setInterval(() => {
        setElapsed(Math.floor((Date.now() - currentRoom.startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentRoom?.status, currentRoom?.startTime]);

  // Auto-delete room after 15 mins if not started
  useEffect(() => {
    if (!currentRoom || currentRoom.status !== "waiting" || !currentUser) return;
    if (currentRoom.hostId !== currentUser.uid) return;

    const checkInterval = setInterval(async () => {
      const now = Date.now();
      const fifteenMins = 15 * 60 * 1000;
      if (now - currentRoom.createdAt > fifteenMins) {
        await deleteDoc(doc(db, "rooms", currentRoom.id));
        setCurrentRoom(null);
        alert("Phòng thi đã bị tự động xóa do quá 15 phút không bắt đầu.");
      }
    }, 30000); // Check every 30s

    return () => clearInterval(checkInterval);
  }, [currentRoom?.id, currentRoom?.status, currentRoom?.createdAt, currentUser?.uid]);

  // Heartbeat: Host updates lastActive every 30s
  useEffect(() => {
    if (!currentRoom || !currentUser || currentRoom.hostId !== currentUser.uid) return;

    const heartbeatInterval = setInterval(async () => {
      try {
        await updateDoc(doc(db, "rooms", currentRoom.id), {
          lastActive: Date.now()
        });
      } catch (error) {
        console.error("Heartbeat failed:", error);
      }
    }, 30000);

    return () => clearInterval(heartbeatInterval);
  }, [currentRoom?.id, currentRoom?.hostId, currentUser?.uid]);

  // Load questions when game starts
  useEffect(() => {
    if (currentRoom?.status === "playing" && currentRoom.questionIds) {
      const allQuestions = currentRoom.subject === "math" ? mathQuestions : scienceQuestions;
      const roomQuestions = currentRoom.questionIds.map(id => 
        allQuestions.find(q => q.id === id)
      ).filter(Boolean) as Question[];
      setQuestions(roomQuestions);
      setLocalQuestionIndex(0);
    }
  }, [currentRoom?.status, currentRoom?.questionIds, currentRoom?.subject]);

  const createRoom = async () => {
    if (!newRoomName.trim()) return;
    
    try {
      const user = await ensureAuth() as FirebaseUser;
      if (!user) {
        alert("Lỗi xác thực. Vui lòng thử lại.");
        return;
      }

      const roomData = {
        title: newRoomName.trim(),
        hostId: user.uid,
        subject: "math" as const,
        questionCount: 30,
        status: "waiting" as const,
        currentQuestionIndex: 0,
        startTime: 0,
        lastActive: Date.now(),
        createdAt: Date.now(),
        questionIds: [],
        theme: selectedTheme
      };

      console.log("Attempting to create room with data:", roomData);
      const docRef = await addDoc(collection(db, "rooms"), roomData);
      console.log("Room created with ID:", docRef.id);
      
      // Join as participant
      const participantData = {
        name: userName,
        score: 0,
        incorrect: 0,
        isFinished: false,
        lastAnswerResult: null
      };
      
      await setDoc(doc(db, `rooms/${docRef.id}/participants`, user.uid), participantData);
      console.log("Host joined as participant");

      setCurrentRoom({ id: docRef.id, ...roomData });
      setIsCreating(false);
      setNewRoomName("");
    } catch (error) {
      const errInfo = handleFirestoreError(error, OperationType.CREATE, "rooms");
      alert(`Không thể tạo phòng: ${errInfo.error}`);
    }
  };

  const joinRoom = async (room: Room) => {
    try {
      const user = await ensureAuth() as FirebaseUser;
      if (!user) return;

      // Check if room is stale (no activity for > 2 mins)
      const now = Date.now();
      const lastActive = room.lastActive || room.createdAt;
      if (now - lastActive > 120000) {
        alert("Phòng thi này đã không còn hoạt động.");
        return;
      }

      if (participants.length >= 4 && !participants.find(p => p.id === user.uid)) {
        alert("Phòng đã đầy!");
        return;
      }

      await setDoc(doc(db, `rooms/${room.id}/participants`, user.uid), {
        name: userName,
        score: 0,
        incorrect: 0,
        isFinished: false,
        lastAnswerResult: null
      });

      setCurrentRoom(room);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `rooms/${room.id}/participants`);
      alert("Không thể tham gia phòng.");
    }
  };

  const leaveRoom = async () => {
    if (!currentRoom) return;
    const user = currentUser;
    if (!user) return;

    // If host leaves, delete room
    if (currentRoom.hostId === user.uid) {
      await deleteDoc(doc(db, "rooms", currentRoom.id));
    } else {
      await deleteDoc(doc(db, `rooms/${currentRoom.id}/participants`, user.uid));
    }

    setCurrentRoom(null);
    setQuestions([]);
  };

  const startExam = async () => {
    if (!currentRoom || !currentUser || currentRoom.hostId !== currentUser.uid) return;

    const allQuestions = currentRoom.subject === "math" ? mathQuestions : scienceQuestions;
    const shuffledIds = [...allQuestions]
      .sort(() => Math.random() - 0.5)
      .slice(0, currentRoom.questionCount)
      .map(q => q.id);

    await updateDoc(doc(db, "rooms", currentRoom.id), {
      status: "playing",
      startTime: Date.now(),
      questionIds: shuffledIds,
      currentQuestionIndex: 0
    });

    // Reset participants
    const batchPromises = participants.map(p => 
      updateDoc(doc(db, `rooms/${currentRoom.id}/participants`, p.id), {
        score: 0,
        incorrect: 0,
        isFinished: false,
        lastAnswerResult: null
      })
    );
    await Promise.all(batchPromises);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentRoom) return;
    const user = currentUser;
    if (!user) return;

    await addDoc(collection(db, `rooms/${currentRoom.id}/messages`), {
      senderId: user.uid,
      senderName: userName,
      text: newMessage,
      timestamp: Date.now()
    });
    setNewMessage("");
  };

  const handleAnswer = async (idx: number) => {
    if (!currentRoom || selectedAnswer !== null) return;
    const user = currentUser;
    if (!user) return;

    const currentQuestion = questions[localQuestionIndex];
    if (!currentQuestion) return;
    const isCorrect = idx === currentQuestion.answerIndex;
    
    setSelectedAnswer(idx);
    setLastResult(isCorrect ? "correct" : "incorrect");

    const participantRef = doc(db, `rooms/${currentRoom.id}/participants`, user.uid);
    const p = participants.find(p => p.id === user.uid);
    if (!p) return;

    await updateDoc(participantRef, {
      score: isCorrect ? p.score + 1 : p.score,
      incorrect: isCorrect ? p.incorrect : p.incorrect + 1,
      lastAnswerResult: isCorrect ? "correct" : "incorrect"
    });

    setTimeout(async () => {
      setSelectedAnswer(null);
      setLastResult(null);

      if (localQuestionIndex < questions.length - 1) {
        setLocalQuestionIndex(prev => prev + 1);
      } else {
        // Participant finished
        await updateDoc(participantRef, {
          isFinished: true
        });

        // If everyone is finished, host can set room to finished
        // Or we just let individuals see their results
        const updatedParticipants = [...participants];
        const me = updatedParticipants.find(p => p.id === user.uid);
        if (me) me.isFinished = true;

        const allFinished = updatedParticipants.every(p => p.isFinished);
        if (allFinished) {
          await updateDoc(doc(db, "rooms", currentRoom.id), {
            status: "finished"
          });
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      }
    }, 2000);
  };

  // Render Name Prompt
  if (showNamePrompt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full border-b-8 border-orange-400"
        >
          <h2 className="text-2xl font-black text-gray-800 mb-6 uppercase text-center">Tên của bạn là gì?</h2>
          
          {authError && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-100 rounded-2xl text-red-600 text-xs font-bold leading-relaxed">
              ⚠️ {authError}
            </div>
          )}

          <div className="space-y-4">
            <input 
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="Nhập tên của bé..."
              className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-orange-400 focus:ring-0 transition-all outline-none font-bold"
            />
            <div className="flex gap-3">
              <button 
                onClick={onExit}
                className="flex-1 py-4 bg-gray-100 text-gray-500 font-black rounded-2xl hover:bg-gray-200 transition-all uppercase"
              >
                Hủy
              </button>
              <button 
                onClick={() => {
                  if (tempName.trim()) {
                    setUserName(tempName);
                    setShowNamePrompt(false);
                  }
                }}
                disabled={!tempName.trim()}
                className="flex-1 py-4 bg-orange-400 text-white font-black rounded-2xl hover:bg-orange-500 shadow-lg transition-all uppercase"
              >
                Tiếp tục
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Render Room List
  if (!currentRoom) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Phòng thi trực tuyến</h1>
              <p className="text-gray-500 font-medium text-sm">Tham gia thi cùng bạn bè ngay!</p>
            </div>
            <button 
              onClick={onExit}
              className="p-2 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Create Room Card */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white p-4 rounded-3xl shadow-xl border-b-8 border-orange-400 flex flex-col items-center justify-center text-center gap-3 cursor-pointer"
              onClick={() => setIsCreating(true)}
            >
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-800 uppercase">Tạo phòng mới</h3>
                <p className="text-gray-500 text-xs">Trở thành chủ phòng và mời bạn bè</p>
              </div>
            </motion.div>

            {/* Room List */}
            {rooms.map(room => (
              <motion.div 
                key={room.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white p-4 rounded-3xl shadow-lg border-b-8 border-blue-400 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-800 uppercase truncate max-w-[120px] text-sm">{room.title}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">
                      {room.status === "waiting" ? "Đang chờ..." : "Đang thi"}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => joinRoom(room)}
                  disabled={room.status !== "waiting"}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-black rounded-xl shadow-md transition-all uppercase text-xs"
                >
                  Tham gia
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Create Room Modal */}
        <AnimatePresence>
          {isCreating && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full"
              >
                <h2 className="text-2xl font-black text-gray-800 mb-6 uppercase text-center">Tạo phòng thi</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Tên phòng thi</label>
                    <input 
                      type="text"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      placeholder="Ví dụ: Thử thách Toán học..."
                      className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-orange-400 focus:ring-0 transition-all outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Giao diện</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "garden", label: "Vườn hoa", icon: "🌸" },
                        { id: "animals", label: "Muôn thú", icon: "🦁" },
                        { id: "space", label: "Vũ trụ", icon: "🚀" }
                      ].map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setSelectedTheme(t.id as any)}
                          className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${selectedTheme === t.id ? "bg-orange-50 border-orange-400" : "bg-white border-gray-100"}`}
                        >
                          <span className="text-xl">{t.icon}</span>
                          <span className="text-[10px] font-bold uppercase">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => setIsCreating(false)}
                      className="flex-1 py-4 bg-gray-100 text-gray-500 font-black rounded-2xl hover:bg-gray-200 transition-all uppercase"
                    >
                      Hủy
                    </button>
                    <button 
                      onClick={createRoom}
                      disabled={!newRoomName.trim()}
                      className="flex-1 py-4 bg-orange-400 text-white font-black rounded-2xl hover:bg-orange-500 shadow-lg transition-all uppercase"
                    >
                      Tạo ngay
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Waiting Room / Lobby
  if (currentRoom) {
    const isHost = currentUser && currentRoom.hostId === currentUser.uid;
    const myParticipant = participants.find(p => p.id === currentUser?.uid);
    const maxScore = Math.max(...participants.map(p => p.score), 0);

    const themeStyles = (() => {
      switch (currentRoom.theme) {
        case "garden":
          return {
            bg: "bg-green-50",
            bgImage: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=1920&auto=format&fit=crop",
            card: "bg-white/90 backdrop-blur-sm border-green-400",
            accent: "bg-green-100 text-green-700",
            button: "bg-green-500 hover:bg-green-600",
            icon: "🌸",
            decor: ["🌸", "🍀", "🌿", "🦋", "🌼"],
            text: "text-gray-800",
            subtext: "text-gray-500",
            progress: "bg-green-500"
          };
        case "animals":
          return {
            bg: "bg-orange-50",
            bgImage: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=1920&auto=format&fit=crop",
            card: "bg-white/90 backdrop-blur-sm border-orange-400",
            accent: "bg-orange-100 text-orange-700",
            button: "bg-orange-500 hover:bg-orange-600",
            icon: "🦁",
            decor: ["🦁", "🐯", "🐘", "🦒", "🦓"],
            text: "text-gray-800",
            subtext: "text-gray-500",
            progress: "bg-orange-400"
          };
        case "space":
          return {
            bg: "bg-slate-950",
            bgImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920&auto=format&fit=crop",
            card: "bg-slate-900/90 backdrop-blur-sm border-purple-500 text-white",
            accent: "bg-purple-900/50 text-purple-200",
            button: "bg-purple-600 hover:bg-purple-700",
            icon: "🚀",
            decor: ["🚀", "⭐", "🪐", "☄️", "🛸"],
            text: "text-slate-100",
            subtext: "text-slate-400",
            progress: "bg-purple-500"
          };
        default:
          return {
            bg: "bg-gray-50",
            bgImage: "",
            card: "bg-white border-orange-400",
            accent: "bg-orange-100 text-orange-700",
            button: "bg-orange-500 hover:bg-orange-600",
            icon: "📝",
            decor: [],
            text: "text-gray-800",
            subtext: "text-gray-500",
            progress: "bg-blue-500"
          };
      }
    })();

    if (currentRoom.status === "waiting") {
      return (
        <RoomWrapper themeStyles={themeStyles}>
          <div className="flex-1 max-w-4xl mx-auto w-full">
            <div className={`${themeStyles.card} p-6 rounded-3xl shadow-xl border-b-8 mb-6`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className={`text-2xl font-black ${themeStyles.text} uppercase flex items-center gap-2`}>
                  <span>{themeStyles.icon}</span>
                  {currentRoom.title}
                </h2>
                <p className={`${themeStyles.subtext} font-bold text-sm`}>Phòng chờ thi • {participants.length}/4 người</p>
              </div>
              <button 
                onClick={leaveRoom}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-500 font-black rounded-xl hover:bg-red-100 transition-all uppercase text-[10px]"
              >
                <LogOut className="w-3 h-3" />
                Thoát
              </button>
            </div>

            {/* Participants List */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {participants.map(p => (
                <div key={p.id} className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-2xl border-2 border-gray-100 relative">
                  {p.id === currentRoom.hostId && (
                    <div className="absolute -top-1.5 -right-1.5 bg-yellow-400 p-1 rounded-full shadow-md text-white">
                      <Crown className="w-3 h-3" />
                    </div>
                  )}
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl shadow-sm">
                    👤
                  </div>
                  <p className="font-black text-gray-800 truncate w-full text-center text-xs">{p.name}</p>
                </div>
              ))}
              {Array.from({ length: 4 - participants.length }).map((_, i) => (
                <div key={i} className="flex flex-col items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-300">
                  <Plus className="w-6 h-6" />
                  <p className="text-[10px] font-bold uppercase">Đang chờ...</p>
                </div>
              ))}
            </div>

            {/* Settings (Host only) */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Môn thi</label>
                  <div className="flex gap-2">
                    {["math", "science"].map(s => (
                      <button 
                        key={s}
                        disabled={!isHost}
                        onClick={() => updateDoc(doc(db, "rooms", currentRoom.id), { subject: s })}
                        className={`flex-1 py-3 rounded-xl font-black transition-all border-2 uppercase text-sm ${currentRoom.subject === s ? "bg-blue-500 text-white border-blue-600 shadow-md" : "bg-white text-gray-400 border-gray-100"}`}
                      >
                        {s === "math" ? "Toán" : "Khoa học"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Số câu hỏi</label>
                  <div className="flex gap-2">
                    {[30, 60, 100].map(c => (
                      <button 
                        key={c}
                        disabled={!isHost}
                        onClick={() => updateDoc(doc(db, "rooms", currentRoom.id), { questionCount: c })}
                        className={`flex-1 py-3 rounded-xl font-black transition-all border-2 text-sm ${currentRoom.questionCount === c ? "bg-purple-500 text-white border-purple-600 shadow-md" : "bg-white text-gray-400 border-gray-100"}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {isHost && (
                <button 
                  onClick={startExam}
                  className={`w-full ${themeStyles.button} text-white font-black py-5 rounded-2xl shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-3 text-xl uppercase mt-8`}
                >
                  <Play className="w-8 h-8 fill-current" />
                  Bắt đầu thi
                </button>
              )}
              {!isHost && (
                <div className={`text-center p-4 ${themeStyles.accent} rounded-2xl font-bold`}>
                  Đang chờ chủ phòng bắt đầu...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Window */}
        <div className={`w-full lg:w-80 ${themeStyles.card} rounded-3xl shadow-xl border-b-8 flex flex-col h-[500px] lg:h-auto overflow-hidden relative`}>
          {/* Chat Background Decoration */}
          <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center text-9xl">
            {themeStyles.icon}
          </div>
          
          <div className={`p-4 ${themeStyles.accent} font-bold flex items-center gap-2 border-b ${currentRoom.theme === 'space' ? 'border-purple-800' : 'border-gray-100'}`}>
            <MessageSquare className="w-5 h-5" />
            <h3 className="font-black uppercase text-sm">Trò chuyện</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar relative z-10">
            {messages.map(m => (
              <div key={m.id} className={`flex flex-col ${currentUser && m.senderId === currentUser.uid ? "items-end" : "items-start"}`}>
                <p className={`text-[10px] font-bold ${themeStyles.subtext} uppercase mb-1`}>{m.senderName}</p>
                <div className={`px-4 py-2 rounded-2xl text-sm font-medium max-w-[90%] ${currentUser && m.senderId === currentUser.uid ? (currentRoom.theme === 'space' ? "bg-purple-600 text-white rounded-tr-none" : "bg-blue-500 text-white rounded-tr-none") : (currentRoom.theme === 'space' ? "bg-slate-800 text-slate-200 rounded-tl-none" : "bg-gray-100 text-gray-700 rounded-tl-none")}`}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className={`p-4 border-t ${currentRoom.theme === 'space' ? 'border-slate-800' : 'border-gray-100'} flex gap-2 relative z-10`}>
            <input 
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Nhập tin nhắn..."
              className={`flex-1 px-4 py-2 ${currentRoom.theme === 'space' ? 'bg-slate-800 border-slate-700 text-white focus:border-purple-400' : 'bg-gray-50 border-gray-100 focus:border-blue-400'} border-2 rounded-xl outline-none text-sm font-bold`}
            />
            <button 
              onClick={sendMessage}
              className={`p-2 ${themeStyles.button} text-white rounded-xl transition-all`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </RoomWrapper>
    );
  }

    // Playing / Finished State
    const currentQuestion = questions[localQuestionIndex];
    const isFinished = currentRoom.status === "finished" || myParticipant?.isFinished;

    if (isFinished) {
      return (
        <RoomWrapper themeStyles={themeStyles} className="items-center">
          <div className={`${themeStyles.card} p-8 rounded-3xl shadow-2xl max-w-2xl w-full border-b-8 mb-6`}>
            <div className="text-center mb-8">
              <div className={`inline-block ${themeStyles.accent} p-4 rounded-full mb-4`}>
                <Trophy className="w-12 h-12" />
              </div>
              <h2 className={`text-3xl font-black ${themeStyles.text} uppercase`}>Kết quả thi đấu</h2>
              <p className={`${themeStyles.subtext} font-bold`}>{currentRoom.title}</p>
            </div>

            <div className="space-y-4 mb-8">
              {participants.sort((a, b) => b.score - a.score).map((p, i) => (
                <div key={p.id} className={`flex items-center justify-between p-4 ${currentRoom.theme === 'space' ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'} rounded-2xl border-2`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 ${i === 0 ? "bg-yellow-400" : i === 1 ? "bg-gray-300" : i === 2 ? "bg-orange-300" : "bg-gray-100"} rounded-full flex items-center justify-center font-black text-white`}>
                      {i + 1}
                    </div>
                    <div>
                      <p className={`font-black ${themeStyles.text}`}>{p.name}</p>
                      <p className={`text-xs font-bold ${themeStyles.subtext} uppercase`}>{p.isFinished ? "Đã hoàn thành" : "Đang thi..."}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-black ${themeStyles.text}`}>{p.score}</p>
                    <p className={`text-[10px] font-bold ${themeStyles.subtext} uppercase`}>Câu đúng</p>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={leaveRoom}
              className={`w-full ${themeStyles.button} text-white font-black py-4 rounded-2xl shadow-lg transform active:scale-95 transition-all uppercase text-lg`}
            >
              Rời phòng
            </button>
          </div>
        </RoomWrapper>
      );
    }

  return (
    <RoomWrapper themeStyles={themeStyles}>
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Participants Progress Bar */}
        <div className={`${themeStyles.card} p-4 rounded-3xl shadow-lg border-b-4 relative overflow-hidden`}>
          {/* Progress Background Icon Decoration */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10 text-6xl pointer-events-none">
            {themeStyles.icon}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
            {participants.map(p => (
              <div key={p.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 min-w-0">
                    {p.score === maxScore && maxScore > 0 && (
                      <Trophy className="w-3 h-3 text-yellow-500 shrink-0" />
                    )}
                    <span className={`text-[10px] font-black ${themeStyles.text} uppercase truncate`}>{p.name}</span>
                  </div>
                  <span className={`text-[10px] font-black ${themeStyles.progress.replace('bg-', 'text-')} shrink-0`}>
                    {p.score}/{p.score + p.incorrect}
                  </span>
                </div>
                <div className={`h-1.5 ${currentRoom.theme === 'space' ? 'bg-slate-800' : 'bg-gray-100'} rounded-full overflow-hidden`}>
                  <motion.div 
                    className={`h-full ${themeStyles.progress}`}
                    animate={{ width: `${(p.score / currentRoom.questionCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
          {/* Question Area */}
          <div className="flex-1 flex flex-col mb-4">
            <div className={`${themeStyles.card} p-6 md:p-8 rounded-3xl shadow-xl border-b-8 flex-1 flex flex-col overflow-hidden relative`}>
              {/* Question Background Decoration */}
              <div className="absolute -right-10 -bottom-10 opacity-5 text-[200px] pointer-events-none rotate-12">
                {themeStyles.icon}
              </div>
              
              <div className="flex justify-between items-center mb-6 relative z-10">
                <div className="flex items-center gap-2">
                  <span className={`${themeStyles.accent} px-4 py-1 rounded-full font-black text-sm uppercase`}>
                    Câu {localQuestionIndex + 1} / {currentRoom.questionCount}
                  </span>
                  <button 
                    onClick={leaveRoom}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full font-black text-[10px] uppercase shadow-sm transition-all"
                  >
                    {isHost ? "Dừng thi" : "Thoát"}
                  </button>
                </div>
                <div className={`flex items-center gap-2 ${themeStyles.accent} px-4 py-1 rounded-full`}>
                  <Timer className="w-4 h-4" />
                  <span className="font-black text-sm tabular-nums">
                    {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, "0")}
                  </span>
                </div>
              </div>

              {currentQuestion && (
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <h3 className={`text-xl md:text-2xl font-black ${themeStyles.text} mb-8 leading-tight`}>
                    {currentQuestion.question}
                  </h3>

                  <div className="grid grid-cols-1 gap-3">
                    {currentQuestion.options.map((option, idx) => {
                      const isSelected = selectedAnswer === idx;
                      const isCorrectOption = idx === currentQuestion.answerIndex;
                      
                      let bgColor = currentRoom.theme === 'space' ? "bg-slate-800 hover:bg-slate-700 border-slate-700" : "bg-gray-50 hover:bg-gray-100 border-gray-200";
                      let textColor = themeStyles.text;
                      
                      if (selectedAnswer !== null) {
                        if (isCorrectOption) {
                          bgColor = "bg-green-100 border-green-500 ring-2 ring-green-500";
                          textColor = "text-green-700";
                        } else if (isSelected) {
                          bgColor = "bg-red-100 border-red-500 ring-2 ring-red-500";
                          textColor = "text-red-700";
                        } else {
                          bgColor = currentRoom.theme === 'space' ? "bg-slate-800/50 opacity-50 border-slate-800" : "bg-gray-50 opacity-50 border-gray-100";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleAnswer(idx)}
                          disabled={selectedAnswer !== null}
                          className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center gap-4 group ${bgColor} ${textColor}`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black shrink-0 text-lg ${
                            selectedAnswer !== null && isCorrectOption 
                              ? "bg-green-500 text-white" 
                              : selectedAnswer !== null && isSelected && !isCorrectOption
                              ? "bg-red-500 text-white"
                              : currentRoom.theme === 'space' ? "bg-slate-700 border-2 border-slate-600 group-hover:border-purple-400" : "bg-white border-2 border-gray-200 group-hover:border-orange-400"
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <span className="font-bold text-lg leading-tight">{option}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chat Window (Side) */}
          <div className={`w-full lg:w-80 ${themeStyles.card} rounded-3xl shadow-xl border-b-8 flex flex-col h-[400px] lg:h-auto overflow-hidden relative`} onMouseEnter={() => setHasUnreadMessages(false)}>
            {/* Chat Background Decoration */}
            <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center text-9xl">
              {themeStyles.icon}
            </div>
            
            <div className={`p-4 border-b ${currentRoom.theme === 'space' ? 'border-slate-800' : 'border-gray-100'} flex items-center justify-between relative z-10`}>
              <div className="flex items-center gap-2">
                <MessageSquare className={`w-5 h-5 ${currentRoom.theme === 'space' ? 'text-purple-400' : 'text-blue-500'}`} />
                <h3 className={`font-black ${themeStyles.text} uppercase text-sm`}>Trò chuyện</h3>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar relative z-10">
              {messages.map(m => (
                <div key={m.id} className={`flex flex-col ${currentUser && m.senderId === currentUser.uid ? "items-end" : "items-start"}`}>
                  <p className={`text-[10px] font-bold ${themeStyles.subtext} uppercase mb-1`}>{m.senderName}</p>
                  <div className={`px-4 py-2 rounded-2xl text-sm font-medium max-w-[90%] ${currentUser && m.senderId === currentUser.uid ? (currentRoom.theme === 'space' ? "bg-purple-600 text-white rounded-tr-none" : "bg-blue-500 text-white rounded-tr-none") : (currentRoom.theme === 'space' ? "bg-slate-800 text-slate-200 rounded-tl-none" : "bg-gray-100 text-gray-700 rounded-tl-none")}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className={`p-4 border-t ${currentRoom.theme === 'space' ? 'border-slate-800' : 'border-gray-100'} flex gap-2 relative z-10`}>
              <input 
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Chat..."
                className={`flex-1 px-3 py-2 ${currentRoom.theme === 'space' ? 'bg-slate-800 border-slate-700 text-white focus:border-purple-400' : 'bg-gray-50 border-gray-100 focus:border-blue-400'} border-2 rounded-xl outline-none text-xs font-bold`}
              />
              <button 
                onClick={sendMessage}
                className={`p-2 ${themeStyles.button} text-white rounded-xl transition-all`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Chat Notification Icon */}
      <AnimatePresence>
        {hasUnreadMessages && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 lg:hidden z-50"
          >
            <div className="bg-blue-500 text-white p-4 rounded-full shadow-2xl animate-bounce relative">
              <MessageSquare className="w-6 h-6" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </RoomWrapper>
    );
  }
}
