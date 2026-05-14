import { X, User } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UpdateProfile } from '../../types/profile';

const UpdateProfileSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").optional().or(z.literal('')),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  age: z.string().optional().or(z.literal('')),
});

type UpdateProfileFormData = z.infer<typeof UpdateProfileSchema>;

interface UpdateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateProfile) => void;
  initialData: UpdateProfile | null;
  isLoading?: boolean;
}

export default function UpdateProfileModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading
}: UpdateProfileModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: initialData || { name: '', email: '', age: '' },
  });

  useEffect(() => {
    if (isOpen) {
      reset(initialData || { name: '', email: '', age: '' });
    }
  }, [isOpen, reset]); // Only reset when isOpen changes

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 !mt-0  bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans transition-all">
      <div className="bg-white rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex items-start justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] bg-blue-50 flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">Edit Profile</h2>
              <p className="text-[13px] font-semibold text-gray-400 mt-0.5">Update your personal information</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="text-start">
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  {...register('name')}
                  placeholder="Your Name"
                  className={`w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-100 rounded-2xl text-sm font-bold text-gray-700 outline-none ring-2 ${errors.name ? 'ring-red-500/20' : 'ring-transparent'} focus:ring-blue-500/10 transition-all placeholder:text-gray-300`}
                />
                {errors.name && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.name.message}</p>}
              </div>

              <div className="text-start">
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="email@example.com"
                  className={`w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-100 rounded-2xl text-sm font-bold text-gray-700 outline-none ring-2 ${errors.email ? 'ring-red-500/20' : 'ring-transparent'} focus:ring-blue-500/10 transition-all placeholder:text-gray-300`}
                />
                {errors.email && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.email.message}</p>}
              </div>

              <div className="text-start">
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  Age
                </label>
                <input
                  type="text"
                  {...register('age')}
                  placeholder="e.g. 25"
                  className={`w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-100 rounded-2xl text-sm font-bold text-gray-700 outline-none ring-2 ${errors.age ? 'ring-red-500/20' : 'ring-transparent'} focus:ring-blue-500/10 transition-all placeholder:text-gray-300`}
                />
                {errors.age && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.age.message}</p>}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center gap-4 mt-8 pt-4 border-t border-gray-100 bg-white/80 backdrop-blur-md">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-7 py-3 text-xs font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-2xl transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isLoading}
                className="flex-1 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold rounded-2xl transition-all shadow-[0_10px_20px_-5px_rgba(37,99,235,0.3)] active:scale-95 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : null}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
