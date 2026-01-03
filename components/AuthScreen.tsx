
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Zap, LogIn, UserPlus, Download, ShieldCheck, Share, PlusSquare, X } from 'lucide-react';
import { UserLevel, User as UserType } from '../types';
import { auth, db } from '../services/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from 'firebase/firestore';

interface AuthScreenProps {
  onAuth: (user: UserType) => void;
  appLogo?: string;
  authBackground?: string; // خلفية مخصصة
  canInstall?: boolean;
  onInstall?: () => void;
}

const ROOT_ADMIN_EMAIL = 'root-admin@livetalk.com';
const ADMIN_MASTER_PASS = '12345678'; // كلمة سر داخلية يتم تجاوزها تلقائياً

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuth, appLogo, authBackground, canInstall, onInstall }) => {
  const [showSplash, setShowSplash] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const LOGO = appLogo || 'https://storage.googleapis.com/static.aistudio.google.com/stables/2025/03/06/f0e64906-e7e0-4a87-af9b-029e2467d302/f0e64906-e7e0-4a87-af9b-029e2467d302.png';

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || (!isLogin && !name)) {
      setError('الرجاء ملء جميع الحقول');
      return;
    }
    setLoading(true);
    setError('');

    const effectivePassword = email.toLowerCase() === ROOT_ADMIN_EMAIL ? (password || ADMIN_MASTER_PASS) : password;

    try {
      if (isLogin) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, effectivePassword);
          const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
          if (userDoc.exists()) onAuth(userDoc.data() as UserType);
        } catch (err: any) {
          if (email.toLowerCase() === ROOT_ADMIN_EMAIL && err.code === 'auth/user-not-found') {
             const userCredential = await createUserWithEmailAndPassword(auth, email, effectivePassword);
             const userData: UserType = {
               id: userCredential.user.uid, customId: 777777, name: 'Root Admin',
               avatar: LOGO, level: UserLevel.VIP, coins: 999999, diamonds: 0, wealth: 0, 
               charm: 0, isVip: true, vipLevel: 12, isAdmin: true,
               stats: { likes: 0, visitors: 0, following: 0, followers: 0 }, ownedItems: []
             };
             await setDoc(doc(db, 'users', userCredential.user.uid), { ...userData, email: email, createdAt: serverTimestamp() });
             onAuth(userData);
          } else {
             throw err;
          }
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, effectivePassword);
        const userData: UserType = {
          id: userCredential.user.uid,
          customId: Math.floor(100000 + Math.random() * 899999),
          name: name,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userCredential.user.uid}`,
          level: UserLevel.NEW, coins: 5000, diamonds: 0, wealth: 0, charm: 0, isVip: false,
          stats: { likes: 0, visitors: 0, following: 0, followers: 0 }, ownedItems: []
        };
        await setDoc(doc(db, 'users', userCredential.user.uid), { ...userData, email: email, createdAt: serverTimestamp() });
        onAuth(userData);
      }
    } catch (err: any) {
      setError('خطأ في البيانات أو كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="h-[100dvh] w-full bg-[#020617] flex flex-col items-center justify-center overflow-hidden font-cairo px-6 relative"
      style={{ 
        backgroundImage: authBackground ? `url(${authBackground})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* طبقة حماية لضمان وضوح المحتوى فوق الخلفية */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-0"></div>

      <AnimatePresence>
        {showSplash && (
          <motion.div exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-[#020617] flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-600 rounded-[1.8rem] overflow-hidden shadow-2xl p-0.5">
              <img src={LOGO} className="w-full h-full object-cover rounded-[1.6rem]" />
            </div>
            <h1 className="mt-4 text-2xl font-black text-white">لايف تـوك</h1>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-[320px] flex flex-col items-center gap-4 relative z-10">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-600 rounded-[1.4rem] mx-auto mb-2 p-0.5 shadow-xl">
            <img src={LOGO} className="w-full h-full object-cover rounded-[1.2rem]" />
          </div>
          <h1 className="text-lg font-black text-white">لايف تـوك</h1>
        </div>

        <div className="w-full bg-slate-900/70 backdrop-blur-2xl border border-white/5 rounded-[1.8rem] p-5 shadow-2xl">
          <div className="flex bg-black/40 p-1 rounded-xl mb-4">
            <button onClick={() => setIsLogin(true)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all ${isLogin ? 'bg-amber-500 text-black' : 'text-slate-500'}`}>دخول</button>
            <button onClick={() => setIsLogin(false)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all ${!isLogin ? 'bg-amber-500 text-black' : 'text-slate-500'}`}>تسجيل</button>
          </div>

          <form onSubmit={handleAuth} className="space-y-3">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-500 pr-1 uppercase">الاسم المستعار</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl py-2 px-4 text-white text-[11px] outline-none" placeholder="اسمك" />
              </div>
            )}
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-500 pr-1 uppercase">ادخل البريد الالكتروني</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl py-2 px-4 text-white text-[11px] outline-none" placeholder="example@livetalk.com" />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-500 pr-1 uppercase">كلمة السر</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl py-2 px-4 text-white text-[11px] outline-none" placeholder="********" />
            </div>

            {error && <p className="text-red-500 text-[8px] text-center font-bold">{error}</p>}

            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-orange-600 py-3 rounded-xl text-black font-black text-[11px] shadow-lg active:scale-95 transition-all mt-2">
              {loading ? 'جاري الدخول...' : (isLogin ? 'دخول فوراً' : 'بدء الرحلة')}
            </button>
          </form>
          {email.toLowerCase() === ROOT_ADMIN_EMAIL && (
            <p className="mt-3 text-[7px] text-amber-500 text-center font-bold">⚠️ وضع المالك مفعل: سيتم تجاوز كلمة المرور تلقائياً</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
