import { useEffect, useState } from "react";
import { Search, Edit, Trash2, Eye, CreditCard, User, Package, Calendar, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";
import Pagination from "../../../components/ui/Pagination";
import ViewSubscriptionDetailsModal from "../../../components/modals/ViewSubscriptionDetailsModal";
import EditSubscriptionModal from "../../../components/modals/EditSubscriptionModal";
import CustomSelect from "../../../components/ui/CustomSelect";
import { TableSkeleton } from "../../../components/ui/CustomSkeleton";
import {
  deleteSubscriptionRequest,
  getSubscriptionRequests,
} from "../services/subscriptionRequestServices";
import { useConfirm } from "../../../hooks/useConfirm";

interface Subscription {
  id: string;
  studentName: string;
  planName: string;
  planPrice: string;
  startDate: string;
  endDate: string;
  status: "active" | "expired" | "cancelled";
  sessionsRemaining: number;
  totalSessions: number;
}

export default function AllSubscriptions() {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "expired" | "cancelled"
  >("all");
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirm();
  const [isLoading, setIsLoading] = useState(false);

  const itemsPerPage = 10;

  const text = {
    title: { ar: "كل الاشتراكات", en: "All Subscriptions" },
    subtitle: { ar: "قائمة شاملة بجميع الاشتراكات الحالية والسابقة في المنصة", en: "A comprehensive list of all current and past subscriptions on the platform" },
    search: {
      ar: "بحث عن اسم الطالب أو الخطة...",
      en: "Search for student name or plan...",
    },
    filter: { ar: "تصفية", en: "Filter" },
    all: { ar: "الكل", en: "All" },
    active: { ar: "نشط", en: "Active" },
    expired: { ar: "منتهي", en: "Expired" },
    cancelled: { ar: "ملغي", en: "Cancelled" },
    studentName: { ar: "اسم الطالب", en: "Student Name" },
    plan: { ar: "الخطة", en: "Plan" },
    price: { ar: "السعر", en: "Price" },
    sessionsCount: { ar: "عدد الحصص", en: "Sessions Count" },
    session: { ar: "حصة", en: "session" },
    startDate: { ar: "تاريخ البدء", en: "Start Date" },
    endDate: { ar: "تاريخ الانتهاء", en: "End Date" },
    status: { ar: "الحالة", en: "Status" },
    progress: { ar: "التقدم", en: "Progress" },
    actions: { ar: "الإجراءات", en: "Actions" },
    edit: { ar: "تعديل", en: "Edit" },
    delete: { ar: "حذف", en: "Delete" },
    view: { ar: "عرض", en: "View" },
    noSubscriptions: { ar: "لا توجد اشتراكات", en: "No subscriptions found" },
    showing: { ar: "عرض", en: "Showing" },
    of: { ar: "من", en: "of" },
    subscriptions: { ar: "اشتراك", en: "subscriptions" },
    sessions: { ar: "حصة", en: "sessions" },
    confirmDelete: {
      ar: "هل أنت متأكد من حذف هذا الاشتراك؟",
      en: "Are you sure you want to delete this subscription?",
    },
  };

  const mapSubscriptionToUI = (item: any): Subscription => {
    return {
      id: item.id,
      studentName: item.user?.name || "—",
      planName: item.plan?.name || item.plan?.name_ar || item.plan?.name_en || "—",
      planPrice: `${item.plan?.price || 0} $`,
      startDate: item.createdAt?.split("T")[0] || "",
      endDate: "",
      status: mapStatus(item.status),
      sessionsRemaining: item.plan?.hours || 0,
      totalSessions: item.plan?.hours || 0,
    };
  };

  const mapStatus = (status: string): "active" | "expired" | "cancelled" => {
    switch (status) {
      case "approved":
        return "active";
      case "pending":
        return "active";
      case "rejected":
        return "cancelled";
      default:
        return "expired";
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await getSubscriptionRequests();
        const formatted = data.map((item: any) => mapSubscriptionToUI(item));
        setSubscriptions(formatted);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredSubscriptions = subscriptions.filter((subscription) => {
    const matchesSearch =
      subscription.studentName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      subscription.planName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || subscription.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSubscriptions = filteredSubscriptions.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle size={12} />
            {text.active[language]}
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-red-50 text-red-600 border border-red-100">
            <Clock size={12} />
            {text.expired[language]}
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-slate-50 text-slate-500 border border-slate-100">
            <Trash2 size={12} />
            {text.cancelled[language]}
          </span>
        );
      default:
        return null;
    }
  };

  const calculateProgress = (remaining: number, total: number) => {
    const used = total - remaining;
    return (used / (total || 1)) * 100;
  };

  const handleView = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setShowViewModal(true);
  };

  const handleEdit = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setShowEditModal(true);
  };

  const handleSave = (updatedSubscription: Subscription) => {
    setSubscriptions((prev) =>
      prev.map((sub) =>
        sub.id === updatedSubscription.id ? updatedSubscription : sub,
      ),
    );
    return true;
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: language === "ar" ? "حذف اشتراك" : "Delete Subscription",
      message: text.confirmDelete[language],
    });
    if (!confirmed) return;

    try {
      setDeletingId(id);
      await deleteSubscriptionRequest(id);
      setSubscriptions((prev) => prev.filter((sub) => sub.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className={`${language === 'ar' ? 'text-right' : 'text-left'} space-y-2`}>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          {text.title[language]}
        </h1>
        <p className="text-slate-500 font-medium">{text.subtitle[language]}</p>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        {/* Filters Header */}
        <div className="p-8 border-b border-slate-50 bg-slate-50/30">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 relative group">
              <Search className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors`} />
              <input
                type="text"
                placeholder={text.search[language]}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full ${language === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-slate-700 font-medium transition-all shadow-sm`}
              />
            </div>
            <div className="w-full lg:w-64">
              <CustomSelect
                value={statusFilter}
                onChange={(value) =>
                  setStatusFilter(
                    value as "all" | "active" | "expired" | "cancelled",
                  )
                }
                options={[
                  { value: "all", label: text.all[language] },
                  { value: "active", label: text.active[language] },
                  { value: "expired", label: text.expired[language] },
                  { value: "cancelled", label: text.cancelled[language] },
                ]}
                placeholder={text.filter[language]}
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto no-scrollbar">
          {isLoading ? (
            <div className="p-8">
              <TableSkeleton rows={8} columns={8} />
            </div>
          ) : paginatedSubscriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50/20">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
                <CreditCard size={40} />
              </div>
              <p className="text-slate-500 text-lg font-bold">{text.noSubscriptions[language]}</p>
            </div>
          ) : (
            <table className="w-full border-collapse" dir={language === "ar" ? "rtl" : "ltr"}>
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  {[
                    { label: text.studentName[language], icon: User },
                    { label: text.plan[language], icon: Package },
                    { label: text.status[language], icon: CheckCircle },
                    { label: text.progress[language], icon: TrendingUp },
                    { label: text.startDate[language], icon: Calendar },
                    { label: text.actions[language], icon: null }
                  ].map((head, i) => (
                    <th key={i} className="px-6 py-5 text-start">
                      <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                        {head.icon && <head.icon size={14} />}
                        {head.label}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedSubscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{subscription.studentName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                          <Package size={16} />
                        </div>
                        <span className="text-sm font-bold text-slate-700">{subscription.planName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {getStatusBadge(subscription.status)}
                    </td>
                    <td className="px-6 py-5">
                      <div className="w-40">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {subscription.sessionsRemaining} / {subscription.totalSessions} {text.sessions[language]}
                          </span>
                          <span className="text-[10px] font-black text-blue-600">
                            {Math.round(calculateProgress(subscription.sessionsRemaining, subscription.totalSessions))}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden p-0.5 border border-slate-200">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${calculateProgress(
                                subscription.sessionsRemaining,
                                subscription.totalSessions
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                        <Calendar size={14} />
                        {subscription.startDate}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(subscription)}
                          className="p-2.5 bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-95"
                          title={text.view[language]}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(subscription)}
                          className="p-2.5 bg-slate-100 text-slate-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-95"
                          title={text.edit[language]}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          disabled={deletingId === subscription.id}
                          onClick={() => handleDelete(subscription.id)}
                          className="p-2.5 bg-slate-100 text-slate-600 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
                          title={text.delete[language]}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer with Pagination */}
        {!isLoading && paginatedSubscriptions.length > 0 && (
          <div className="p-8 border-t border-slate-50 bg-slate-50/10">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredSubscriptions.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {selectedSubscription && (
        <>
          <ViewSubscriptionDetailsModal
            isOpen={showViewModal}
            onClose={() => {
              setShowViewModal(false);
              setSelectedSubscription(null);
            }}
            subscription={selectedSubscription}
          />
          <EditSubscriptionModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedSubscription(null);
            }}
            subscription={selectedSubscription}
            onSave={handleSave}
          />
        </>
      )}
      {ConfirmDialog}
    </div>
  );
}
