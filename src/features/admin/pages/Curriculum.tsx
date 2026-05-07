import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Plus,
  FileText,
  Video,
  ArrowRight,
  Edit,
  Trash2,
  MoreVertical,
  ArrowLeft,
  BookOpen,
  Earth,
  Search,
  LayoutGrid,
  List as ListIcon,
} from 'lucide-react';
import { Button, Input, Tag, Card, Empty, Dropdown, Modal, Switch } from 'antd';
import { useCourseById, useCourses, useDeleteCourse } from '../../../hooks/useCourses';
import { useDeleteLecture } from '../../../hooks/useLectures';
import { useQueryClient } from '@tanstack/react-query';
import AddCourseModal from './AddCourseModal';
import AddLectureModal from './AddLectureModal';
import { Lecture } from '../../../types/lectures';

// const DOT = () => (
//   <div className='flex flex-col items-center justify-center'>
//     <div className='w-1 h-1 rounded-full bg-gray-400'></div>
//   </div>
// );


export default function Curriculum() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [isAddLectureModalVisible, setIsAddLectureModalVisible] = useState(false);
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);

  const queryClient = useQueryClient();
  const { data: coursesData } = useCourses();
  const { data: fullCourseData } = useCourseById(courseId || '');
  const { mutate: deleteCourse } = useDeleteCourse();
  const { mutate: deleteLecture } = useDeleteLecture();

  const courses = coursesData?.items;
  const selectedCourse = fullCourseData || courses?.find(c => c.id === courseId);

  // Auto-select first lecture if none selected
  useEffect(() => {
    if (selectedCourse?.lectures && selectedCourse.lectures.length > 0 && !selectedLessonId) {
      setSelectedLessonId(selectedCourse.lectures[0].id);
    }
  }, [selectedCourse, selectedLessonId]);

  const filteredCourses = courses?.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCourseClick = (id: string) => {
    navigate(`/dashboard/curriculum/${id}`);
    setSelectedLessonId('');
  };

  const handleBack = () => {
    navigate('/dashboard/curriculum');
  };

  const handleEdit = (course: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCourse(course);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    Modal.confirm({
      title: 'Are you sure you want to delete this course?',
      content: 'This action cannot be undone and will remove all curriculum modules.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        deleteCourse(id, {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
          }
        });
      }
    });
  };

  const handleEditLecture = (lecture: Lecture, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingLecture(lecture);
    setIsAddLectureModalVisible(true);
  };

  const handleDeleteLecture = (lectureId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    Modal.confirm({
      title: 'Delete Lecture?',
      content: 'Are you sure you want to remove this lecture from the course?',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => {
        deleteLecture(lectureId, {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses', courseId] });
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            if (selectedLessonId === lectureId) setSelectedLessonId('');
          }
        });
      }
    });
  };

  // --- Curriculum Detail View ---
  if (selectedCourse && courseId) {
    const lectures = selectedCourse.lectures || [];
    const activeLecture = lectures.find((l: Lecture) => l.id === selectedLessonId) || lectures[0];

    return (
      <div className="flex flex-col h-[calc(100vh-90px)] bg-[#f8fafc] overflow-hidden p-8" dir="ltr">
        {/* Detail Header */}
        <div className="mb-8 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeft size={18} />}
              onClick={handleBack}
              className="rounded-xl h-10 w-10 flex items-center justify-center border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-100"
            />
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Curriculum <ChevronRight size={10} /> <span className="text-indigo-600">{selectedCourse.title}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedCourse.title}</h1>
            </div>
          </div>
          <Button 
            icon={<Plus size={16} />} 
            onClick={() => setIsAddLectureModalVisible(true)}
            className="rounded-xl font-bold text-gray-600 border-gray-200"
          >
            Add Lecture
          </Button>
        </div>

        <div className="flex-1 flex overflow-hidden gap-6">
          {/* Left Sidebar */}
          <div className="w-[350px] flex flex-col gap-4 overflow-y-auto no-scrollbar">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Course Content</span>
              </div>
              <div className="max-h-[60vh] overflow-y-auto no-scrollbar">
                {lectures.length > 0 ? (
                  lectures.map((lecture: Lecture, index: number) => (
                    <div
                      key={lecture.id}
                      className={`flex items-center justify-between p-4 cursor-pointer transition-all border-b border-gray-50 last:border-0 ${selectedLessonId === lecture.id ? 'bg-indigo-50/50' : 'hover:bg-gray-50'}`}
                      onClick={() => setSelectedLessonId(lecture.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${selectedLessonId === lecture.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                          {lecture.order}
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-sm font-bold ${selectedLessonId === lecture.id ? 'text-indigo-600' : 'text-gray-700'}`}>
                            {lecture.title}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <Video size={10} className={selectedLessonId === lecture.id ? 'text-indigo-400' : 'text-gray-300'} />
                            <span className="text-[10px] text-gray-400 font-medium">Lecture</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-black">
                        <Dropdown
                          menu={{
                            items: [
                              { key: 'edit', label: 'Edit', icon: <Edit size={14} />, onClick: (info) => handleEditLecture(lecture, info.domEvent as any) },
                              { key: 'delete', label: 'Delete', icon: <Trash2 size={14} />, danger: true, onClick: (info) => handleDeleteLecture(lecture.id, info.domEvent as any) },
                            ]
                          }}
                          trigger={['click']}
                        >
                          <Button
                            type="text"
                            size="small"
                            icon={<MoreVertical size={14} />}
                            className="text-gray-300 hover:text-gray-600"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Dropdown>
                        <ChevronRight size={14} className={selectedLessonId === lecture.id ? 'text-indigo-400' : 'text-gray-300'} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <Empty description="No lectures yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    <Button
                      type="primary"
                      ghost
                      size="small"
                      className="mt-2 rounded-lg text-[10px] h-8"
                      onClick={() => setIsAddLectureModalVisible(true)}
                    >
                      + Add First Lecture
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest mb-2">Current Lecture</span>
                  <h2 className="text-xl font-bold text-gray-900">
                    {activeLecture?.title || 'No Lecture Selected'}
                  </h2>
                  <p className="text-[11px] font-bold text-gray-400">Last Update: {activeLecture ? new Date(activeLecture.updatedAt).toLocaleDateString() : '-'}</p>
                </div>
                {/* <div className="flex items-center gap-3">
                  <Button icon={<Edit size={16} />} className="rounded-xl font-bold text-gray-600">Edit Content</Button>
                  <Button type="primary" className="rounded-xl font-bold bg-indigo-600">Save Changes</Button>
                </div> */}
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
                {activeLecture ? (
                  <>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Video size={16} className="text-red-600" />
                          <span className="text-sm font-bold">Video Content</span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          MP4 - {activeLecture.videoUrl ? 'Ready' : 'Not Set'}
                        </span>
                      </div>
                      {activeLecture.videoUrl ? (
                        <div className="relative aspect-video rounded-2xl bg-gray-900 overflow-hidden shadow-lg group">
                          {activeLecture.videoUrl.includes('youtube') || activeLecture.videoUrl.includes('vimeo') ? (
                            <iframe
                              src={activeLecture.videoUrl}
                              className="w-full h-full border-0"
                              allowFullScreen
                              title="Video player"
                            />
                          ) : (
                            <video
                              src={activeLecture.videoUrl}
                              controls
                              className="w-full h-full object-contain"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="aspect-video rounded-2xl bg-gray-100 flex flex-col items-center justify-center border-2 border-dashed border-gray-200">
                          <Video size={48} className="text-gray-300 mb-4" />
                          <p className="text-gray-400 font-medium">No video uploaded for this lecture</p>
                          <Button className="mt-4 rounded-xl font-bold text-indigo-600">Upload Video</Button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FileText size={16} className="text-indigo-600" />
                        <span className="text-sm font-bold">Lecture Description</span>
                      </div>
                      <div className="p-6 rounded-2xl bg-white border border-gray-100 text-gray-600 leading-relaxed">
                        {activeLecture.content || 'No content provided for this lecture.'}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <BookOpen size={64} className="text-gray-200 mb-4" />
                    <h3 className="text-lg font-bold text-gray-400">Select a lecture to view details</h3>
                  </div>
                )}
              </div>

              <div className="p-6 rounded-2xl bg-[#F4F7FF] border border-gray-100 flex items-center justify-between mt-auto mx-8 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#4648D4] border border-gray-100">
                    <Earth size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#555498]">Visibility & Status</h4>
                    <p className="text-[10px] font-bold text-[#7C76DB] mt-1">Control which tiers of students can see this lesson on their dashboard.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-[#4648D4] uppercase tracking-widest">Published</span>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
          .no-scrollbar::-webkit-scrollbar { display: none;}
          .ant-switch-checked { background-color: #6B38D4 !important; }
        `}} />
        <AddLectureModal
          visible={isAddLectureModalVisible}
          onClose={() => {
            setIsAddLectureModalVisible(false);
            setEditingLecture(null);
          }}
          courseId={courseId || ''}
          lecture={editingLecture || undefined}
        />
      </div>
    );
  }

  // --- Courses List View ---
  return (
    <div className="p-8 bg-[#f8fafc] min-h-[calc(100vh-90px)]" dir="ltr">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Curriculum Shelf</h1>
          <p className="text-gray-500 mt-1 font-medium">Select a course to manage its curriculum modules and lessons</p>
        </div>
        <Button
          icon={<Plus size={18} />}
          type="primary"
          onClick={() => setIsAddModalVisible(true)}
          className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 border-none font-bold shadow-lg shadow-indigo-100 flex items-center"
        >
          New Course
        </Button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Input
            prefix={<Search size={18} className="text-gray-400 mr-2" />}
            placeholder="Search courses..."
            className="h-11 rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <LayoutGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <ListIcon size={20} />
            </button>
          </div>
        </div>
      </div>

      {(filteredCourses?.length ?? 0) > 0 ? (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {filteredCourses?.map((course) => (
            <Card
              key={course.id}
              className={`group overflow-hidden rounded-3xl border border-gray-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300 cursor-pointer ${viewMode === 'list' ? 'p-2' : ''}`}
              bodyStyle={{ padding: 0 }}
              onClick={() => handleCourseClick(course.id)}
            >
              {viewMode === 'grid' ? (
                <div className="flex flex-col h-full">
                  <div className={`h-40 bg-gradient-to-br from-indigo-500 to-purple-600 p-6 flex flex-col justify-between relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <BookOpen size={100} className="text-white" />
                    </div>
                    <div className="flex justify-between items-start relative z-10">
                      <Tag color={course.rank.color} className="w-fit rounded-lg px-3 py-1 font-bold border-none text-[10px] uppercase tracking-wider">
                        {course.rank.name}
                      </Tag>
                      <Dropdown
                        menu={{
                          items: [
                            { key: 'edit', label: 'Edit Course', icon: <Edit size={14} />, onClick: (info) => handleEdit(course, info.domEvent as any) },
                            { key: 'delete', label: 'Delete', icon: <Trash2 size={14} />, danger: true, onClick: (info) => handleDelete(course.id, info.domEvent as any) },
                          ]
                        }}
                        trigger={['click']}
                      >
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-all"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </Dropdown>
                    </div>
                    <h3 className="text-xl font-bold text-white relative z-10">{course.title}</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-500 text-sm line-clamp-2 mb-6">{course.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-indigo-600" />
                        <span className="text-xs font-bold text-gray-600">{course.lectures?.length || 0} Lectures</span>
                      </div>
                      <ArrowRight size={18} className="text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{course.title}</h3>
                      <p className="text-xs text-gray-500">{course.lectures?.length || 0} Lectures</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Tag color={course.rank.color} className="rounded-lg font-bold border-none text-[9px] uppercase tracking-wider">{course.rank.name}</Tag>
                    <Dropdown
                      menu={{
                        items: [
                          { key: 'edit', label: 'Edit', icon: <Edit size={14} />, onClick: (info) => handleEdit(course, info.domEvent as any) },
                          { key: 'delete', label: 'Delete', icon: <Trash2 size={14} />, danger: true, onClick: (info) => handleDelete(course.id, info.domEvent as any) },
                        ]
                      }}
                      trigger={['click']}
                    >
                      <Button
                        shape="circle"
                        icon={<MoreVertical size={16} />}
                        className="border-none bg-gray-50 hover:bg-gray-100 text-gray-400"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Dropdown>
                    <ArrowRight size={18} className="text-gray-300" />
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Empty description="No courses found" className="mt-20" />
      )}
      <AddCourseModal
        visible={isAddModalVisible || !!editingCourse}
        onClose={() => {
          setIsAddModalVisible(false);
          setEditingCourse(null);
        }}
        course={editingCourse}
      />
    </div>
  );
}
