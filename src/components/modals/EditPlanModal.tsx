import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import CustomSelect from "../ui/CustomSelect";
interface EditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    id: string;
    name: string;
    nameEn: string;
    description: string;
    price: string;
    currency: string;
    duration: string;
    sessionsCount: number;
    features: string[];
    isPopular: boolean;
    status: "active" | "inactive";
  };
  onSave: (plan: any) => void;
}

export default function EditPlanModal({
  isOpen,
  onClose,
  plan,
  onSave,
}: EditPlanModalProps) {
  const { language, t } = useLanguage();
  const [formData, setFormData] = useState({
    name: plan.name,
    nameEn: plan.nameEn,
    description: plan.description,
    price: plan.price,
    currency: plan.currency,
    duration: plan.duration,
    sessionsCount: plan.sessionsCount,
    features: [...plan.features],
    isPopular: plan.isPopular,
    status: plan.status,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredFeatures = formData.features.filter((f) => f.trim() !== "");
    if (filteredFeatures.length === 0) {
      alert(
        language === "ar"
          ? "يجب إضافة ميزة واحدة على الأقل"
          : "Please add at least one feature",
      );
      return;
    }
    onSave({
      ...plan,
      ...formData,
      features: filteredFeatures,
    });

    onClose();
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ""] });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      features: newFeatures.length > 0 ? newFeatures : [""],
    });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const currencies = [
    { code: "EGP", nameAr: "جنيه مصري", nameEn: "Egyptian Pound" },
    { code: "USD", nameAr: "دولار أمريكي", nameEn: "US Dollar" },
    { code: "EUR", nameAr: "يورو", nameEn: "Euro" },
    { code: "GBP", nameAr: "جنيه إسترليني", nameEn: "British Pound" },
    { code: "SAR", nameAr: "ريال سعودي", nameEn: "Saudi Riyal" },
    { code: "AED", nameAr: "درهم إماراتي", nameEn: "UAE Dirham" },
    { code: "KWD", nameAr: "دينار كويتي", nameEn: "Kuwaiti Dinar" },
    { code: "QAR", nameAr: "ريال قطري", nameEn: "Qatari Riyal" },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-100 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Plus className="w-6 h-6 text-indigo-600" />
              <span>{t('editPlan')}</span>
            </h2>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Update Package Details</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <form id="edit-plan-form" onSubmit={handleSubmit} className="p-8">
            <div className="space-y-8 text-start" dir={language === "ar" ? "rtl" : "ltr"}>
              
              {/* Identity Section */}
              <div className="space-y-5">
                <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4">Plan Identity</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">
                      Name (Arabic)
                    </label>
                    <input 
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" 
                      placeholder="اسم الخطة بالعربي"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">
                      Name (English)
                    </label>
                    <input 
                      type="text"
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" 
                      placeholder="Plan Name in English"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3} 
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none" 
                    placeholder="Short description of this plan..."
                    required
                  />
                </div>
              </div>

              {/* Pricing & Structure */}
              <div className="space-y-5">
                <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4">Pricing & Structure</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">
                      Price
                    </label>
                    <input 
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" 
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">
                      Currency
                    </label>
                    <CustomSelect
                      value={formData.currency}
                      onChange={(value) => setFormData({ ...formData, currency: value as string })}
                      options={currencies.map((curr) => ({
                        value: curr.code,
                        label: `${curr.code} - ${language === "ar" ? curr.nameAr : curr.nameEn}`,
                      }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">
                      Duration (Months)
                    </label>
                    <input 
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" 
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">
                      Sessions Count
                    </label>
                    <input 
                      type="number"
                      value={formData.sessionsCount}
                      onChange={(e) => setFormData({ ...formData, sessionsCount: parseInt(e.target.value) || 0 })}
                      className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" 
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Features Section */}
              <div className="space-y-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Features & Benefits</h3>
                  <button 
                    type="button" 
                    onClick={addFeature}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {t('addFeature')}
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="group flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-transparent focus-within:border-indigo-100 focus-within:bg-white transition-all">
                      <div className="flex-1">
                        <input
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          placeholder="Ex: 24/7 Support"
                          className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 px-3 py-1.5"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        disabled={formData.features.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Configuration Section */}
              <div className="space-y-5">
                <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4">Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-slate-50 rounded-2xl px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visibility</p>
                      <p className="text-xs font-bold text-slate-400 mt-0.5">Show "Popular" badge</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={formData.isPopular}
                      onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                      className="w-6 h-6 text-indigo-600 border-slate-200 rounded-lg focus:ring-indigo-500 transition-all cursor-pointer"
                    />
                  </div>

                  <div>
                    <CustomSelect
                      value={formData.status}
                      onChange={(value) => setFormData({ ...formData, status: value as any })}
                      options={[
                        { value: "active", label: t('active') },
                        { value: "inactive", label: t('inactive') },
                      ]}
                    />
                  </div>
                </div>
              </div>

            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-white border-t border-slate-50 flex items-center gap-4 sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-8 py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl transition-all font-black text-xs uppercase tracking-widest"
          >
            {t('cancel')}
          </button>
          <button
            form="edit-plan-form"
            type="submit"
            className="flex-[2] px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100"
          >
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
}

