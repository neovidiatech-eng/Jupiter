import { useState, useEffect } from 'react';
import {
  Share2, Phone, MessageCircle,
  Facebook, Instagram, Twitter,
  ChevronRight,
  Save,
  Settings,
  Mail,
  Loader2
} from 'lucide-react';
import { useSettings as useThemeSettings } from '../../../contexts/SettingsContext';
import { useSettings } from '../hooks/useSettings';
import { message } from 'antd';
import { UpdateSettingsRequest } from '../../../types/settings';

const socialPlatforms = [
  { platform: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/...', icon: Facebook, color: '#1877f2' },
  { platform: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...', icon: Instagram, color: '#e1306c' },
  { platform: 'twitter', label: 'X (Twitter)', placeholder: 'https://x.com/...', icon: Twitter, color: '#000000' },
];

type Tab = 'general' | 'social' | 'contact';

const tabs: { id: Tab; label: string; icon: any }[] = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'social', label: 'Social Media', icon: Share2 },
  { id: 'contact', label: 'Contact', icon: Phone },
];

export default function SettingsPage() {
  const { settings: themeSettings } = useThemeSettings();
  const { settings: apiSettings, isLoading, updateSettings: apiUpdateSettings } = useSettings();
  
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [formData, setFormData] = useState<UpdateSettingsRequest>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (apiSettings) {
      setFormData({
        userPrefix: apiSettings.userPrefix,
        socialLinks: apiSettings.socialLinks,
        contactInfo: apiSettings.contactInfo
      });
    }
  }, [apiSettings]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiUpdateSettings(formData);
      message.success('Settings updated successfully');
    } catch (error) {
      message.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="ltr">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Customize your platform and configure settings</p>
        </div>
        <div className="flex gap-2">
          {/* <button
            onClick={handleReset}
            className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button> */}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm text-white`}
            style={{ backgroundColor: themeSettings.primaryColor }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-52 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 space-y-1 sticky top-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id ? '' : 'text-gray-600 hover:bg-gray-50'
                }`}
                style={activeTab === tab.id ? { backgroundColor: themeSettings.primaryColor + '15', color: themeSettings.primaryColor } : {}}
              >
                <tab.icon className="w-4 h-4" />
                <span className="flex-1 text-left">{tab.label}</span>
                {activeTab === tab.id && <ChevronRight className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* General */}
          {activeTab === 'general' && (
            <SectionCard title="General Settings" icon={Settings} primaryColor={themeSettings.primaryColor}>
              <div className="max-w-md">
                <FieldGroup label="User Prefix">
                  <input
                    type="text"
                    value={formData.userPrefix || ''}
                    onChange={e => setFormData({ ...formData, userPrefix: e.target.value })}
                    className={inputCls}
                    placeholder="jupiter"
                  />
                </FieldGroup>
              </div>
            </SectionCard>
          )}

          {/* Social */}
          {activeTab === 'social' && (
            <SectionCard title="Social Media Links" icon={Share2} primaryColor={themeSettings.primaryColor}>
              <div className="space-y-4">
                {socialPlatforms.map(({ platform, label, placeholder, icon: Icon, color }) => (
                  <div key={platform} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
                      <input
                        type="text"
                        value={(formData.socialLinks as any)?.[platform] || ''}
                        onChange={e => setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, [platform]: e.target.value } as any
                        })}
                        className="w-full text-sm border-none p-0 focus:ring-0"
                        placeholder={placeholder}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Contact */}
          {activeTab === 'contact' && (
            <SectionCard title="Contact Information" icon={Phone} primaryColor={themeSettings.primaryColor}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-green-500" />
                    WhatsApp
                  </h3>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={formData.contactInfo?.whatsapp?.phone || ''}
                      onChange={e => setFormData({
                        ...formData,
                        contactInfo: {
                          ...formData.contactInfo,
                          whatsapp: { ...formData.contactInfo?.whatsapp, phone: e.target.value, active: true }
                        } as any
                      })}
                      className={inputCls}
                      placeholder="01069441989"
                    />
                    <div
                      onClick={() => setFormData({
                        ...formData,
                        contactInfo: {
                          ...formData.contactInfo,
                          whatsapp: { ...formData.contactInfo?.whatsapp, active: !formData.contactInfo?.whatsapp?.active }
                        } as any
                      })}
                      className={`w-12 h-6 rounded-full cursor-pointer relative transition-colors ${formData.contactInfo?.whatsapp?.active ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.contactInfo?.whatsapp?.active ? 'left-7' : 'left-1'}`} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-500" />
                    Email Address
                  </h3>
                  <div className="flex items-center gap-3">
                    <input
                      type="email"
                      value={formData.contactInfo?.mail?.email || ''}
                      onChange={e => setFormData({
                        ...formData,
                        contactInfo: {
                          ...formData.contactInfo,
                          mail: { ...formData.contactInfo?.mail, email: e.target.value, active: true }
                        } as any
                      })}
                      className={inputCls}
                      placeholder="mneseym@gmail.com"
                    />
                    <div
                      onClick={() => setFormData({
                        ...formData,
                        contactInfo: {
                          ...formData.contactInfo,
                          mail: { ...formData.contactInfo?.mail, active: !formData.contactInfo?.mail?.active }
                        } as any
                      })}
                      className={`w-12 h-6 rounded-full cursor-pointer relative transition-colors ${formData.contactInfo?.mail?.active ? 'bg-blue-500' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.contactInfo?.mail?.active ? 'left-7' : 'left-1'}`} />
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}

const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm';

function SectionCard({ title, icon: Icon, children, primaryColor }: any) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 px-6 py-4 border-b">
        <Icon className="w-4 h-4" style={{ color: primaryColor }} />
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function FieldGroup({ label, children }: any) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      {children}
    </div>
  );
}


// const fontOptions = [
//   { value: 'Almarai', label: 'Almarai', preview: 'Default Font' },
//   { value: 'Cairo', label: 'Cairo', preview: 'Cairo Font' },
//   { value: 'Tajawal', label: 'Tajawal', preview: 'Tajawal Font' },
//   { value: 'Noto Kufi Arabic', label: 'Noto Kufi Arabic', preview: 'Kufi Font' },
//   { value: 'IBM Plex Sans Arabic', label: 'IBM Plex', preview: 'IBM Font' },
// ];

// const colorPresets = [
//   { name: 'Blue', primary: '#2563eb', accent: '#06b6d4' },
//   { name: 'Green', primary: '#16a34a', accent: '#0d9488' },
//   { name: 'Red', primary: '#dc2626', accent: '#ea580c' },
//   { name: 'Gray', primary: '#374151', accent: '#6b7280' },
//   { name: 'Brown', primary: '#92400e', accent: '#b45309' },
//   { name: 'Pink', primary: '#db2777', accent: '#e11d48' },
// ];
{/* Appearance Tab */ }
{/* {activeTab === 'appearance' && (
            <div className="space-y-5">
              <SectionCard title="الألوان" icon={Palette} primaryColor={settings.primaryColor}>
                <div className="space-y-5">
                  <div>
                    <p className="text-sm text-gray-500 text-right mb-3">قوالب جاهزة</p>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {colorPresets.map(preset => (
                        <button
                          key={preset.name}
                          onClick={() => updateSettings({ primaryColor: preset.primary, accentColor: preset.accent })}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all hover:scale-105 ${
                            settings.primaryColor === preset.primary ? 'border-gray-400 shadow-md' : 'border-transparent hover:border-gray-200'
                          }`}
                        >
                          <div className="flex gap-1">
                            <div className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: preset.primary }} />
                            <div className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: preset.accent }} />
                          </div>
                          <span className="text-xs text-gray-600 font-medium">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-sm text-gray-500 text-right mb-3">تخصيص يدوي</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <ColorPickerField
                        label="اللون الرئيسي"
                        value={settings.primaryColor}
                        onChange={v => updateSettings({ primaryColor: v })}
                      />
                      <ColorPickerField
                        label="اللون الثانوي"
                        value={settings.secondaryColor}
                        onChange={v => updateSettings({ secondaryColor: v })}
                      />
                      <ColorPickerField
                        label="لون التمييز"
                        value={settings.accentColor}
                        onChange={v => updateSettings({ accentColor: v })}
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-sm text-gray-500 text-right mb-3">معاينة مباشرة</p>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <div className="flex gap-2 flex-wrap">
                        <button className="px-4 py-2 rounded-lg text-white text-sm font-medium shadow-sm" style={{ backgroundColor: settings.primaryColor }}>
                          زرار رئيسي
                        </button>
                        <button className="px-4 py-2 rounded-lg text-sm font-medium border-2" style={{ borderColor: settings.primaryColor, color: settings.primaryColor }}>
                          زرار ثانوي
                        </button>
                        <span className="px-3 py-1.5 rounded-full text-white text-xs font-medium" style={{ backgroundColor: settings.accentColor }}>
                          بادج
                        </span>
                      </div>
                      <div className="h-2 rounded-full" style={{ backgroundColor: settings.primaryColor + '30' }}>
                        <div className="h-2 rounded-full w-2/3 transition-all" style={{ backgroundColor: settings.primaryColor }} />
                      </div>
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="الخط" icon={Type} primaryColor={settings.primaryColor}>
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 text-right">اختر الخط المناسب للمنصة</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {fontOptions.map(font => (
                      <button
                        key={font.value}
                        onClick={() => updateSettings({ fontFamily: font.value })}
                        className={`flex items-center justify-between px-4 py-3.5 rounded-xl border-2 transition-all text-right ${
                          settings.fontFamily === font.value
                            ? ''
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                        style={settings.fontFamily === font.value ? { borderColor: settings.primaryColor, backgroundColor: settings.primaryColor + '10' } : {}}
                      >
                        <div className="flex items-center gap-2">
                          {settings.fontFamily === font.value && (
                            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: settings.primaryColor }}>
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-800">{font.label}</p>
                          <p className="text-xs text-gray-500">{font.preview}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </SectionCard>
            </div>
          )} */}

{/* SEO Tab */ }
{/* {activeTab === 'seo' && (
            <div className="space-y-5">
              <SectionCard title="إعدادات SEO" icon={Search} primaryColor={settings.primaryColor}>
                <div className="space-y-4">
                  <FieldGroup label="عنوان الصفحة (Meta Title)" hint="يُعرض في نتائج البحث وتبويبات المتصفح">
                    <input
                      type="text"
                      value={settings.seo.metaTitle}
                      onChange={e => updateSeo({ metaTitle: e.target.value })}
                      className={inputCls}
                      placeholder="اسم منصتك - وصف مختصر"
                      maxLength={70}
                    />
                    <CharCounter current={settings.seo.metaTitle.length} max={70} />
                  </FieldGroup>

                  <FieldGroup label="وصف الصفحة (Meta Description)" hint="يُعرض تحت العنوان في نتائج البحث">
                    <textarea
                      rows={3}
                      value={settings.seo.metaDescription}
                      onChange={e => updateSeo({ metaDescription: e.target.value })}
                      className={inputCls + ' resize-none'}
                      placeholder="وصف مختصر وجذاب للمنصة..."
                      maxLength={160}
                    />
                    <CharCounter current={settings.seo.metaDescription.length} max={160} />
                  </FieldGroup>

                  <FieldGroup label="الكلمات المفتاحية (Keywords)" hint="افصل بين الكلمات بفاصلة">
                    <input
                      type="text"
                      value={settings.seo.keywords}
                      onChange={e => updateSeo({ keywords: e.target.value })}
                      className={inputCls}
                      placeholder="تعليم, كورسات, طلاب, ..."
                    />
                  </FieldGroup>

                  <FieldGroup label="صورة المشاركة (OG Image)" hint="تُعرض عند مشاركة الرابط على السوشيال ميديا - الحجم المثالي 1200×630px">
                    <div
                      onClick={() => ogImageInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-xl overflow-hidden cursor-pointer transition-colors"
                    >
                      {settings.seo.ogImage ? (
                        <div className="relative h-40">
                          <img src={settings.seo.ogImage} alt="OG" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <p className="text-white text-sm font-medium">تغيير الصورة</p>
                          </div>
                        </div>
                      ) : (
                        <div className="h-32 flex flex-col items-center justify-center gap-2 text-gray-400">
                          <Upload className="w-6 h-6" />
                          <p className="text-sm">رفع صورة المشاركة</p>
                          <p className="text-xs text-gray-300">1200×630px مقترح</p>
                        </div>
                      )}
                    </div>
                    <input ref={ogImageInputRef} type="file" accept="image/*" className="hidden" onChange={handleOgImageUpload} />
                    {settings.seo.ogImage && (
                      <button onClick={() => updateSeo({ ogImage: '' })} className="text-xs text-red-500 hover:text-red-700 mt-1 transition-colors">حذف الصورة</button>
                    )}
                  </FieldGroup>

                  <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        onClick={() => updateSeo({ robotsIndex: !settings.seo.robotsIndex })}
                        className={`w-12 h-6 rounded-full cursor-pointer transition-colors relative ${settings.seo.robotsIndex ? '' : 'bg-gray-300'}`}
                        style={settings.seo.robotsIndex ? { backgroundColor: settings.primaryColor } : {}}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${settings.seo.robotsIndex ? 'left-7' : 'left-1'}`} />
                      </div>
                      <span className="text-sm text-gray-500">{settings.seo.robotsIndex ? 'مفعّل' : 'معطّل'}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-800">السماح لمحركات البحث بالفهرسة</p>
                      <p className="text-xs text-gray-500">robots: index, follow</p>
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="معاينة نتيجة البحث" icon={Globe} primaryColor={settings.primaryColor}>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 max-w-lg">
                    <p className="text-xs text-gray-400 mb-1">example.com</p>
                    <p className="text-base font-medium line-clamp-1" style={{ color: settings.primaryColor }}>
                      {settings.seo.metaTitle || settings.name}
                    </p>
                    <p className="text-gray-600 text-sm line-clamp-2 mt-1">
                      {settings.seo.metaDescription || settings.description || 'وصف الصفحة سيظهر هنا...'}
                    </p>
                  </div>
                </div>
              </SectionCard>
            </div>
          )}
          */}
