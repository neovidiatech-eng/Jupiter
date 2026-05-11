import { motion } from "framer-motion";
import { Star, Trophy, Sparkles } from "lucide-react";

type FeedbackCardProps = {
  studentName: string;
  teacherName: string;
  rating: number;
  feedback: string;
  badge?: string;
};

export default function FeedbackCard({
  studentName,
  teacherName,
  rating,
  feedback,
  badge,
}: FeedbackCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-[32px] p-6 shadow-xl
      bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100"
    >
      {/* Background Decoration */}
      <motion.div
        animate={{
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 6,
        }}
        className="absolute top-0 right-0 opacity-10"
      >
        <Sparkles size={120} />
      </motion.div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6 relative z-10">
        {/* <motion.img
          whileHover={{ rotate: 8, scale: 1.08 }}
          src={avatar || "https://i.pravatar.cc/100"}
          alt=""
          className="w-16 h-16 rounded-full border-4 border-white shadow-md object-cover"
        /> */}

        <div>
          <h2 className="text-2xl font-black text-slate-800">
            Great Job {studentName}! 🎉
          </h2>

          <p className="text-slate-600">
            Feedback from {teacherName}
          </p>
        </div>
      </div>

      {/* Rating */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-white/70 backdrop-blur rounded-3xl p-5 mb-5 relative z-10"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-lg">
              Teacher Rating
            </p>

            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((item) => (
                <motion.div
                  key={item}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: item * 0.1,
                  }}
                >
                  <Star
                    size={24}
                    className={`${
                      item <= Math.round(rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-slate-300"
                    }`}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* <motion.div
            animate={{
              scale: [1, 1.08, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
            }}
            className="text-5xl font-black text-yellow-500"
          >
            {rating}
          </motion.div> */}
        </div>
      </motion.div>

      {/* Feedback */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="bg-white rounded-3xl p-5 shadow-sm mb-5 relative z-10"
      >
        <p className="text-slate-700 leading-relaxed text-lg">
          "{feedback}"
        </p>
      </motion.div>

      {/* Achievement */}
      {badge && (
        <motion.div
          animate={{
            y: [0, -4, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
          }}
          className="flex items-center gap-4 bg-gradient-to-r
          from-primary to-primary-dark text-white p-4 rounded-3xl relative z-10"
        >
          <div className="bg-white/20 p-3 rounded-2xl">
            <Trophy size={28} />
          </div>

          <div>
            <h3 className="font-bold text-lg">
              Achievement Unlocked
            </h3>

            <p className="text-sm opacity-90">
              {badge}
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}