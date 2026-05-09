import React from "react";
import { Search, Monitor , MessageSquare } from "lucide-react";
import { Table, Tag, Space, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useUserSessions } from "../../../hooks/useSessions";
import { Schedule, Student, ScheduleSubject } from "../../../types/scheduales";
import AddRequestModal from "../components/AddRequestModal";

const ClassesPage: React.FC = () => {
  const [search, setSearch] = React.useState("");
  const [requestModal, setRequestModal] = React.useState<{ visible: boolean; id: string; title: string }>({
    visible: false,
    id: "",
    title: "",
  });

  const { data: userSessions, isLoading } = useUserSessions(search);
  const sessions = userSessions?.data || [];

  const handleOpenRequest = (record: Schedule) => {
    setRequestModal({
      visible: true,
      id: record.id,
      title: record.title,
    });
  };

  const columns: ColumnsType<Schedule> = [
    // ... existing columns ...
    {
      title: "STUDENT",
      dataIndex: "student",
      key: "student",
      render: (student: Student) => {
        const initials = student.user.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
        return (
          <div className="flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[12px] border-2 border-white shadow-sm bg-blue-50 text-blue-600"
            >
              {initials}
            </div>
            <span className="font-bold text-slate-700">{student.user.name}</span>
          </div>
        );
      },
    },
    {
      title: "LESSON",
      dataIndex: "title",
      key: "lesson",
      render: (text) => (
        <span className="font-semibold text-slate-600">{text}</span>
      ),
    },
    {
      title: "TYPE",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag
          className="rounded-full px-4 py-0.5 border-none font-bold text-[10px] uppercase tracking-wider"
          color={type === "Live" ? "green" : "purple"}
        >
          {type}
        </Tag>
      ),
    },
    {
      title: "SUBJECT",
      dataIndex: "subject",
      key: "subject",
      render: (subject: ScheduleSubject) => (
        <span className="px-3 py-1 bg-slate-50 border border-gray-100 rounded-lg text-[11px] font-bold text-slate-500">
          {subject?.name || "N/A"}
        </span>
      ),
    },
    {
      title: "SCHEDULE",
      dataIndex: "start_time",
      key: "schedule",
      render: (time) => (
        <span className="text-sm font-bold text-slate-600">
          {new Date(time).toLocaleString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span className="text-sm font-semibold text-slate-500 uppercase">{status}</span>
      ),
    },
    {
      title: "MATERIAL",
      key: "material",
      render: (record: Schedule) => (
        <Space size="middle">
          {record.link && (
            <a 
              href={record.link} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 border border-blue-100 bg-blue-50/30 rounded-full text-[10px] font-bold text-blue-700 hover:bg-blue-100 transition-all"
            >
              <Monitor size={12} /> Join Class
            </a>
          )}
         
        </Space>
      ),
    },
    {
       title: "REQUESTS",
      key: "requests",
      render: (record: Schedule) => (
        <Button 
            onClick={() => handleOpenRequest(record)}
            className="flex items-center gap-2 px-3 py-1.5 border border-orange-100 bg-orange-50 rounded-full text-[10px] font-bold text-orange-600 hover:bg-orange-100 transition-all"
          >
            <MessageSquare size={12} /> Add Request
          </Button>
      )
    },
    // {
    //   title: "FEEDBACK",
    //   key: "feedback",
    //   render: () => (
    //     <Button
    //       type="primary"
    //       icon={<Pencil size={14} />}
    //       className="bg-[#2563eb] h-9 w-9 flex items-center justify-center rounded-lg shadow-blue-500/20"
    //     />
    //   ),
    // },
  ];


  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-12 max-w-[1600px] mx-auto animate-fade-in w-full overflow-x-hidden">
      {/* Main Header */}
      <header className="mb-10 pl-1">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2 font-['Outfit']">
          Classes
        </h1>
        <p className="text-sm sm:text-base text-slate-500 font-medium">
          Manage and track all your teaching sessions
        </p>
      </header>

      {/* Filters Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 flex flex-col gap-6 mb-8 shadow-sm">
        <div className="relative w-full">
          <div className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Search size={18} />
          </div>
          <input
            type="text"
            className="w-full pl-12 sm:pl-14 pr-6 py-3.5 sm:py-4 rounded-xl border border-gray-100 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all text-sm sm:text-base placeholder:text-slate-400"
            placeholder="Search by student or lesson..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* <div className="flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
          <div className="flex bg-slate-100/80 p-1.5 rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar">
            {["History", "Today", "Upcoming"].map((tab) => (
              <button
                key={tab}
                className={`flex-1 md:min-w-[120px] px-4 sm:px-8 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all whitespace-nowrap ${tab === "Today" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex gap-3 sm:gap-4 w-full md:w-auto">
            <select className="flex-1 md:flex-none px-4 sm:px-6 py-2.5 border border-gray-100 rounded-xl bg-white text-xs sm:text-sm font-semibold text-slate-500 focus:outline-none shadow-sm cursor-pointer">
              <option>All Types</option>
            </select>
            <select className="flex-1 md:flex-none px-4 sm:px-6 py-2.5 border border-gray-100 rounded-xl bg-white text-xs sm:text-sm font-semibold text-slate-500 focus:outline-none shadow-sm cursor-pointer">
              <option>All Status</option>
            </select>
          </div>
        </div> */}
      </div>

      {/* Classes Table using Ant Design */}
      <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden bg-white dashboard-table">
        <Table
          columns={columns}
          dataSource={sessions}
          loading={isLoading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            className: "px-6 py-4",
          }}
          className="custom-antd-table"
          scroll={{ x: 1000 }}
        />
      </div>

      <AddRequestModal 
        visible={requestModal.visible}
        onClose={() => setRequestModal({ ...requestModal, visible: false })}
        sessionId={requestModal.id}
        sessionTitle={requestModal.title}
      />

      <style>{`
        .dashboard-table .ant-table-thead > tr > th {
          background: #f8fafc;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.15em;
          padding: 20px 32px;
          border-bottom: 1px solid #f1f5f9;
        }
        .dashboard-table .ant-table-tbody > tr > td {
          padding: 24px 32px;
          border-bottom: 1px solid #f8fafc;
        }
        .dashboard-table .ant-table-tbody > tr:hover > td {
          background: #f8fafc !important;
        }
        
        /* Hide scrollbar for Chrome, Safari and Opera */
        .dashboard-table .ant-table-container::-webkit-scrollbar,
        .dashboard-table .ant-table-content::-webkit-scrollbar,
        .dashboard-table .ant-table-body::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        .dashboard-table .ant-table-container,
        .dashboard-table .ant-table-content,
        .dashboard-table .ant-table-body {
          -ms-overflow-style: none !important;  /* IE and Edge */
          scrollbar-width: none !important;  /* Firefox */
        }
      `}</style>
    </div>
  );
};

export default ClassesPage;
